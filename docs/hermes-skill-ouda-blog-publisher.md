# Skill: 殴达博客发文助手

## 触发场景

当用户说以下任意形式时激活此 skill：
- "帮我写一篇文章"
- "根据这些素材写一篇博文"
- "发布第X篇"
- "把草稿X发布"

---

## 环境变量

运行前确认以下变量已配置（来自 Hermes secrets）：

```
OUDA_BLOG_API_URL=https://ouda-blog.vercel.app
OUDA_BLOG_API_SECRET=<与 Vercel 上 API_SECRET 相同的值>
```

---

## API 说明

**Base URL:** `https://ouda-blog.vercel.app`

**鉴权方式:** 所有写操作必须携带 Header：
```
Authorization: Bearer <OUDA_BLOG_API_SECRET>
Content-Type: application/json
```

---

## 文章字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `slug` | string | 是 | URL 路径，只含小写字母、数字、连字符，如 `ai-agent-intro-2026` |
| `title` | string | 是 | 文章标题（中文） |
| `excerpt` | string | 否 | 摘要，100-150字，吸引读者点击 |
| `content` | string | 是 | Markdown 正文，支持标题/列表/引用/代码块 |
| `category` | string | 是 | 只能是以下四个之一：`stock` / `ai` / `sales` / `misc` |
| `tags` | string[] | 否 | 标签数组，建议 2-4 个，如 `["AI Agent","产品设计"]` |
| `readingTime` | number | 否 | 预计阅读时间（分钟），默认 5 |
| `published` | boolean | 否 | 创建时默认 `false`（草稿），用户审核后再发布 |

### 分类选择参考
- `stock` — 股票、交易、量化、市场分析
- `ai` — AI、LLM、Agent、产品思维
- `sales` — 销售技巧、B2B、谈判、客户关系
- `misc` — 读书、成长、生活、跨界思考

---

## 标准工作流

### 阶段一：收到素材，生成文章

用户会发来素材 + 观点，Hermes 负责：

1. **阅读素材**，提炼核心观点
2. **结合用户观点**，生成完整 Markdown 文章
3. **生成元数据**：slug、分类、摘要、标签、预估阅读时间

文章结构建议：
```markdown
## 引言（1-2段，设置问题/场景）

## 核心章节一

## 核心章节二

## 总结（1-2句金句收尾）
```

### 阶段二：创建草稿

> ⚠️ 沙盒环境终端无外网权限，**必须通过浏览器 fetch 发请求**，不要用 curl/Python。

在浏览器控制台（打开任意页面 → F12 → Console）执行以下代码。
**关键：用 `JSON.stringify()` 序列化，避免手动拼 JSON 字符串导致换行符报错。**

```javascript
// 直接粘贴到浏览器控制台执行
fetch("https://ouda-blog.vercel.app/api/posts", {
  method: "POST",
  headers: {
    "Authorization": "Bearer 填入OUDA_BLOG_API_SECRET的值",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    slug: "ai-agent-intro-2026",
    title: "AI Agent 入门：从工具到助手",
    excerpt: "Agent 不只是能调用工具的 LLM...",
    content: `## 引言\n\n正文内容写在这里，支持多行，反引号模板字符串自动处理换行。`,
    category: "ai",
    tags: ["AI Agent", "LLM", "产品思维"],
    readingTime: 12,
    published: false
  })
})
.then(r => r.json())
.then(data => console.log("✓ 创建成功", data))
.catch(err => console.error("✗ 失败", err));
```

成功响应示例（HTTP 201）：
```json
{
  "id": 15,
  "slug": "ai-agent-intro-2026",
  "title": "AI Agent 入门：从工具到助手",
  "published": false,
  "adminUrl": "https://ouda-blog.vercel.app/admin/15/edit"
}
```

### 阶段三：通知用户审核

在飞书回复用户：

```
草稿已创建 ✓

文章：《AI Agent 入门：从工具到助手》
ID：15
后台审核：https://ouda-blog.vercel.app/admin/15/edit

满意后请告诉我"发布第15篇"，或直接在后台点击发布。
```

### 阶段四：发布文章（按需）

当用户说"发布第15篇"或"发布这篇"时，同样通过浏览器控制台执行：

```javascript
// 将 15 替换为实际文章 ID
fetch("https://ouda-blog.vercel.app/api/posts/15", {
  method: "PUT",
  headers: {
    "Authorization": "Bearer 填入OUDA_BLOG_API_SECRET的值",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ published: true })
})
.then(r => r.json())
.then(data => console.log("✓ 已发布", data))
.catch(err => console.error("✗ 失败", err));
```

成功后回复用户：
```
已发布 ✓

文章《AI Agent 入门：从工具到助手》现已公开。
查看：https://ouda-blog.vercel.app/posts/ai-agent-intro-2026
```

---

## 错误处理

| HTTP 状态码 | 含义 | 处理方式 |
|------------|------|---------|
| 401 | 鉴权失败 | 检查 OUDA_BLOG_API_SECRET 是否正确 |
| 409 | slug 已存在 | 修改 slug，在末尾加 `-2` 或年份 |
| 400 | 缺少必填字段 | 检查 slug/title/content/category 是否都有 |
| 500 | 服务器错误 | 等待 1 分钟后重试，或告知用户 |

---

## 快速参考

```
创建草稿：POST /api/posts        → 返回 id + adminUrl
发布文章：PUT  /api/posts/:id    → body: {"published": true}
查看列表：GET  /api/posts        → 需鉴权可看草稿
```
