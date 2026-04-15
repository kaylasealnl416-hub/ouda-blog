# 殴达博客全局可行性审查报告

> 日期：2026-04-15
> 审查范围：产品范围、架构实现、鉴权安全、安全基线、构建交付、工程可维护性
> 审查方式：静态代码审查 static code review + 构建验证 build verification
> 结论：技术路线可行，但当前状态不建议直接公网正式上线

---

## 1. 执行摘要

项目当前已经具备一个可工作的单体应用 monolith 形态：

- 前端：Next.js 16 + React 19
- 数据层：Prisma 7 + Postgres
- 媒体存储：Vercel Blob
- 管理端：`/admin` 后台 + `/api/posts` 写接口 + CLI 脚本

从“能否做成”角度看，这个项目整体是可行的，且没有明显的架构性死路：

- 技术选型与 MVP 范围匹配，没有过度设计
- 生产构建可以完成，说明主链路没有编译级阻塞
- 内容博客 + 简单 CMS 的单体架构适合当前阶段

但从“能否安全上线”角度看，当前仍有若干阻塞项 blocker，主要集中在：

- 草稿内容泄露 draft exposure
- 鉴权默认放行 fail-open
- Markdown 存储型 XSS stored cross-site scripting
- 本地/线上环境策略不一致，影响可维护性 maintainability

因此本次审查结论为：

**项目方向正确，整体可行；但在修复 P0/P1 安全与发布阻塞项之前，不建议作为正式公网版本发布。**

---

## 2. 审查结论

### 可行性判断

- 产品可行性：可行
- 技术可行性：可行
- 架构可行性：可行
- 生产可上线性 production readiness：暂不通过

### 审查建议

- 可继续迭代，不建议推翻重做
- 优先修复安全与内容可见性问题，再进入 UAT 用户体验测试 user acceptance testing
- 修复完成后，再补自动化测试 automated tests 与安全基线 security baseline

---

## 3. 关键证据

### 构建与静态检查

- `npm run lint`：通过，仅有 2 个未使用类型 warning
- `npm run build`：通过

说明：

- 沙箱内首次构建出现 `spawn EPERM`，复跑后确认属于执行环境限制，不是项目源码导致的构建失败
- 正常环境下 production build 可完成，说明主干交付链路成立

### 关键实现入口

- 路由保护：`src/middleware.ts`
- 接口鉴权：`src/lib/auth.ts`
- 文章数据读取：`src/lib/posts.ts`
- Markdown 渲染：`src/components/post/MarkdownContent.tsx`
- 数据连接：`src/lib/prisma.ts`
- Prisma 配置：`prisma.config.ts`
- 生产配置：`next.config.ts`

---

## 4. 审查发现

## TODO(0) CRITICAL

### 1. 草稿与未发布内容存在公开读取风险

**判断**

当前“未发布文章”并未被完整隔离，存在通过页面或 API 被读取的可能。

**证据**

- `src/lib/posts.ts:58-61`
  `getPostBySlug(slug)` 直接按 `slug` 取文，没有 `published: true` 限制
- `src/app/posts/[slug]/page.tsx:17`
  `generateMetadata()` 直接调用 `getPostBySlug`
- `src/app/posts/[slug]/page.tsx:42`
  正文页面直接调用 `getPostBySlug`
- `src/app/api/posts/route.ts:12-17`
  当未传 `published` 参数时，列表接口返回全部文章
- `src/app/api/posts/[id]/route.ts:10-18`
  单篇读取接口未鉴权，知道 `id` 即可获取全文

**风险**

- 草稿内容 draft content 被搜索引擎、外部调用者或未授权访客读取
- 未发布文章的标题、摘要、正文可能提前泄露
- 后台草稿和公开内容边界不清，容易导致运营事故

**建议**

- 公开页面与公开 API 默认只允许读取 `published = true`
- 管理后台读取草稿时必须走显式鉴权分支
- 明确区分公开读取接口 public read API 与后台读取接口 admin read API

---

## TODO(1) HIGH

### 2. 写接口与后台鉴权是默认放行 fail-open

**判断**

当前鉴权逻辑把“未配置密钥”视为“本地开发可跳过”，这会让环境配置错误直接退化为无保护状态。

**证据**

- `src/lib/auth.ts:8-10`
  `API_SECRET` 缺失时直接返回 `null`，即写接口跳过鉴权
- `src/middleware.ts:13-15`
  只有 `API_SECRET` 存在时才拦截 `/admin`

**风险**

- 预览环境 preview、临时环境或新部署环境一旦漏配 `API_SECRET`，后台与写接口可能直接暴露
- 这是典型的配置失误导致授权失效 authorization bypass

**建议**

- 改为默认拒绝 fail-closed
- 本地开发通过显式 `NODE_ENV=development` 或单独 `ALLOW_INSECURE_LOCAL_DEV=true` 控制
- 对关键环境变量在启动期做硬失败 hard fail 校验

---

### 3. Markdown 渲染链路存在存储型 XSS stored XSS 风险

**判断**

当前 Markdown 渲染允许原始 HTML raw HTML 进入最终页面，且未做白名单清洗 sanitize。

**证据**

- `src/components/post/MarkdownContent.tsx:19`
  `allowDangerousHtml: true`
- `src/components/post/MarkdownContent.tsx:20`
  使用 `rehypeRaw`
- `src/components/post/MarkdownContent.tsx:27`
  使用 `dangerouslySetInnerHTML`

**风险**

- 一旦正文中写入恶意脚本、事件属性或危险标签，可能形成存储型 XSS
- 管理员或内容生产环节一旦被诱导粘贴恶意 HTML，访问者就会受影响

**建议**

- 引入 `rehype-sanitize` 做白名单标签与属性控制
- 仅放行必要嵌入元素，如 `iframe` 的受控属性
- 不要让原始 HTML 在无清洗状态下进入 SSR 输出

---

### 4. 本地开发与文档承诺不一致，环境可移植性较弱

**判断**

文档描述“本地 SQLite、线上 Postgres”，但实际实现已经统一依赖 `POSTGRES_URL`，本地若没有现成 Neon/Postgres 凭据就无法稳定运行。

**证据**

- `src/lib/prisma.ts:12-14`
  Prisma 客户端强依赖 `POSTGRES_URL`
- `prisma.config.ts:11-13`
  Prisma 配置强依赖 `POSTGRES_URL`
- `package.json:36`
  仍保留 `better-sqlite3`，但运行链路未实际使用

**风险**

- 新机器、CI、协作者接手时难以一键启动
- 文档与实现分叉，排障成本上升

**建议**

- 二选一并固化：
  1. 真正实现“双模式 dual-mode”：本地 SQLite，线上 Postgres
  2. 完全切到 Postgres-only，并更新 PRD/README/初始化说明

---

## TODO(2) MEDIUM

### 5. 缺少基础安全响应头 security headers

**判断**

生产配置几乎为空，未设置基础 Web 安全头。

**证据**

- `next.config.ts:3-5`
  当前没有配置 CSP、HSTS、`X-Frame-Options`、`X-Content-Type-Options` 等

**风险**

- 抵御点击劫持 clickjacking、资源嗅探 sniffing、第三方脚本注入等的能力不足

**建议**

- 增加一组最小生产安全头 minimum security headers
- 结合 Markdown 与外链策略定制 CSP

---

### 6. 后台登录 Cookie 未显式设置 `Secure`

**判断**

后台登录接口使用了 `HttpOnly` 与 `SameSite=Strict`，但未显式设置 `Secure`。

**证据**

- `src/app/api/admin/login/route.ts:16-19`

**风险**

- 在非 HTTPS 场景或错误代理配置下，Cookie 保护不完整

**建议**

- 生产环境下强制 `Secure`
- 优先使用 Next.js `cookies().set()` 统一设置属性

---

### 7. 缺少自动化测试 automated tests

**判断**

当前项目没有测试脚本与测试文件，无法对关键回归做自动校验。

**证据**

- `package.json:5-10`
  仅存在 `dev/build/start/lint`
- 本次检索未发现测试文件

**风险**

- 鉴权、草稿可见性、上传限制、渲染安全等高风险行为缺少回归保护

**建议**

- 至少补 3 类测试：
  1. API 鉴权测试 authentication tests
  2. 草稿可见性测试 visibility tests
  3. Markdown 安全渲染测试 sanitization tests

---

## TODO(3) LOW

### 8. Next.js 16 已提示 `middleware` 约定废弃

**判断**

当前仍使用 `middleware.ts`，构建时已经出现官方弃用提示。

**证据**

- `src/middleware.ts`
- 构建输出中出现 “The "middleware" file convention is deprecated. Please use "proxy" instead.”

**风险**

- 短期不阻塞上线，长期会提高框架升级成本

**建议**

- 按 Next.js 16 当前规范评估迁移到 `proxy` 的时机
- 迁移前先验证 Vercel 平台行为，避免重复出现“本地可用、线上失效”

---

### 9. README 已明显过时

**判断**

README 仍是 Create Next App 默认模板，无法支撑部署、接手与运维。

**证据**

- `README.md:1-36`

**风险**

- 新成员接手困难
- 生产环境变量、数据库、Blob、后台入口没有正式文档

**建议**

- 更新 README，至少包含：
  - 项目简介
  - 环境变量说明
  - 本地启动方式
  - 构建/部署方式
  - 管理后台与 CLI 使用方式

---

## 5. 优点与保留项

以下部分应保留并继续沿用：

- 技术栈与业务体量匹配，没有明显的过度工程化
- `Prisma + Postgres + Vercel Blob` 适合内容型站点 MVP
- 管理后台、API、CLI 三条内容管理通道已经形成闭环
- 生产构建可通过，说明基本代码健康度尚可

---

## 6. 是否建议继续在当前代码基上迭代

建议继续。

理由：

- 当前问题主要是“安全边界与工程化不足”，不是“架构路线错误”
- 不需要推翻重写 rewrite
- 以当前代码基为基础修复 blocker，成本明显低于重做

---

## 7. 建议整改顺序

### 第一阶段：上线阻塞项 P0 / P1

1. 收紧公开文章读取边界，只允许公开读取已发布内容
2. 将鉴权从默认放行改为默认拒绝
3. 为 Markdown 渲染加入白名单清洗 sanitization
4. 明确并统一本地/线上数据库策略

### 第二阶段：安全与稳定性补强

1. 增加安全响应头 security headers
2. 修正后台 Cookie 属性
3. 补关键自动化测试

### 第三阶段：可维护性整理

1. 更新 README
2. 处理 Next.js `middleware` 弃用路径
3. 清理未使用依赖和 lint warning

---

## 8. 最终结论

**整体全局结论：项目可行，但当前版本不应直接作为正式公网版本上线。**

更准确地说：

- 它已经不是 demo 级“不能用”的状态
- 它是一个“主功能可工作、但安全与发布边界未收紧”的版本
- 修复本报告列出的 P0/P1 项后，可进入 UAT 与正式上线准备阶段

