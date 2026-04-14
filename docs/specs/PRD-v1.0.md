# PRD: 殴达的博客 v1.0 — 上线版

> 状态：待批准  
> 作者：Claude (CTO)  
> 日期：2026-04-14  
> 目标上线：2026-04-底

---

## 1. 产品定位

**一句话描述**：个人知识分享博客，四大主题（股票 / AI / 销售 / 杂谈），为日后商业化留扩展空间。

**品牌**：殴达的博客  
**Slogan**：老登新生，从零开始，保持好奇，持续学习  
**受众**：对投资、AI、销售感兴趣的中文读者

---

## 2. v1.0 范围（MVP）

### 包含
| 功能 | 说明 |
|------|------|
| 文章展示 | 首页列表 + 分类筛选 + 文章详情页 |
| 图文支持 | Markdown 内容支持图片（Vercel Blob）和外链视频 |
| 关于页面 | 作者介绍 |
| CMS 后台 | /admin 路径，文章增删改查 |
| CLI 管理 | scripts/post.mjs，AI agent专用 |
| 线上部署 | Vercel + 自定义域名 |

### 不包含（v2.0+）
- 评论系统
- 全文搜索
- RSS 订阅
- 访问统计 / Analytics
- 用户登录 / 注册
- 商业化功能（付费内容、广告等）

---

## 3. 技术架构

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   浏览器     │────▶│  Vercel Edge  │────▶│ Vercel Postgres   │
│  (Next.js)  │     │  (Serverless) │     │  (数据库)          │
└─────────────┘     └──────┬───────┘     └──────────────────┘
                           │
                    ┌──────▼───────┐
                    │ Vercel Blob   │
                    │ (图片存储)     │
                    └──────────────┘
```

| 层 | 线上 | 本地开发 |
|----|------|----------|
| 框架 | Next.js 16 + React 19 | 同左 |
| 数据库 | Vercel Postgres (Prisma 7) | SQLite |
| 图片存储 | Vercel Blob | Vercel Blob（或本地文件） |
| 部署 | Vercel | localhost:3000 |
| 代码托管 | GitHub: ouda-blog | 本地 |

---

## 4. 数据库迁移计划

### 当前（SQLite）
```prisma
model Post {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  title       String
  excerpt     String
  content     String
  category    String
  tags        String        // JSON 数组字符串
  coverImage  String?
  readingTime Int      @default(5)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 迁移到 Postgres
- Schema 结构不变，仅切换 provider 和 adapter
- `prisma.config.ts` 通过环境变量区分本地（SQLite）和线上（Postgres）
- 种子数据通过 `prisma/seed.mjs` 灌入线上数据库

---

## 5. 图片方案

### 上传流程
1. Claude Code 或 CMS 后台上传图片到 Vercel Blob
2. 返回公开 URL
3. 在 Markdown 中引用：`![描述](blob-url)`

### 需要新增
- `POST /api/upload` — 接收图片，存入 Vercel Blob，返回 URL
- CMS 后台 PostForm 增加图片上传按钮
- CLI 脚本增加 `upload` 命令

### 视频
- 不自托管，嵌入外部平台（YouTube / B站）
- Markdown 中用 HTML iframe 嵌入

---

## 6. 部署流程

### 一次性配置
1. **GitHub**：创建 `ouda-blog` 仓库，推送代码
2. **Vercel**：通过 GitHub 集成连接仓库
3. **Vercel Postgres**：在 Vercel Dashboard 创建数据库，环境变量自动注入
4. **Vercel Blob**：启用 Blob 存储
5. **域名**：用户购买域名后，在 Vercel 配置 DNS 解析

### 持续部署
- `main` 分支 push → 自动部署
- PR → 预览部署

---

## 7. Markdown 渲染升级

### 当前问题
现有 `MarkdownContent.tsx` 使用简单的正则替换，不支持：
- 代码块语法高亮
- 图片自适应
- 嵌入视频 iframe
- 脚注、任务列表等 GFM 扩展

### 升级方案
- 替换为 `react-markdown` + `remark-gfm` + `rehype-highlight`
- 支持完整 GFM（GitHub Flavored Markdown）
- 代码块语法高亮
- 图片自动响应式（max-width: 100%）
- 允许 HTML（iframe 嵌入视频）

---

## 8. 安全考虑

| 风险 | 措施 |
|------|------|
| /admin 无认证 | v1.0 暂不对外暴露 admin 路由（Vercel middleware 限制），v2.0 加登录 |
| API 无鉴权 | 写操作（POST/PUT/DELETE）加简单 token 校验 |
| 图片上传滥用 | Vercel Blob 有大小限制，加 MIME 类型校验 |
| XSS（Markdown HTML） | react-markdown 默认安全，仅允许白名单标签（iframe 等） |

---

## 9. 实施计划

| 阶段 | 任务 | 优先级 |
|------|------|--------|
| **P0** | 数据库迁移：SQLite → Postgres 双模式 | CRITICAL |
| **P0** | Markdown 渲染升级（react-markdown） | HIGH |
| **P0** | GitHub 仓库创建 + 推送代码 | HIGH |
| **P0** | Vercel 项目创建 + 部署 | HIGH |
| **P1** | 图片上传 API + Vercel Blob 集成 | HIGH |
| **P1** | API 写操作 token 校验 | HIGH |
| **P1** | Admin 路由访问限制 | MEDIUM |
| **P2** | CMS 后台图片上传 UI | MEDIUM |
| **P2** | CLI upload 命令 | MEDIUM |
| **P3** | 域名配置（用户购买后） | LOW |

---

## 10. 成功标准

- [ ] 首页能正常展示所有已发布文章
- [ ] 文章详情页正确渲染 Markdown（含图片、代码块）
- [ ] 通过自定义域名或 Vercel 域名可公开访问
- [ ] CMS 后台能增删改查文章
- [ ] CLI 脚本全部命令可用
- [ ] 图片能上传并在文章中展示
