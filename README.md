# 殴达的博客

> 老登新生，从零开始，保持好奇，持续学习

个人博客，四大主题：📈 股票 · 🤖 AI · 💼 销售 · ☕ 杂谈

**线上地址：** https://ouda-blog.vercel.app

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + @tailwindcss/typography |
| 字体 | 霞鹜文楷（中文）+ Playfair Display + Source Serif 4 |
| 动画 | Motion (framer-motion) |
| 数据库 | Neon PostgreSQL + Prisma 7 |
| 图片存储 | Vercel Blob |
| 部署 | Vercel（main 分支自动部署） |

---

## 本地开发

### 前置要求

- Node.js 20+
- Neon PostgreSQL 数据库（或任意 Postgres）

### 环境变量

复制 `.env.example` 为 `.env`，填入以下变量：

```
POSTGRES_URL=          # Neon / Postgres 连接字符串
API_SECRET=            # 后台管理密钥（自定义强密码）
BLOB_READ_WRITE_TOKEN= # Vercel Blob 令牌
```

### 启动

```bash
npm install
npm run dev            # http://localhost:3000
```

### 数据库初始化

```bash
npx prisma migrate dev --name init   # 创建表结构
npm run dev &                        # 启动开发服务器（seed 需要）
node prisma/seed.mjs                 # 灌入示例文章（可选，upsert 语义）
```

---

## 文章管理

### 方式一：浏览器后台

访问 http://localhost:3000/admin，用 `API_SECRET` 登录后可视化管理文章。

### 方式二：CLI 脚本（Claude Code 专用）

> 前提：开发服务器需运行中（`npm run dev`）

```bash
# 列出所有文章
node scripts/post.mjs list

# 创建草稿
node scripts/post.mjs create \
  --title "标题" \
  --slug "url-slug" \
  --category ai \
  --content "Markdown 正文" \
  --tags "标签1,标签2" \
  --excerpt "摘要"

# 创建并直接发布
node scripts/post.mjs create --title "..." --slug "..." --category stock --content "..." --publish

# 发布 / 取消发布
node scripts/post.mjs publish <id>
node scripts/post.mjs unpublish <id>

# 更新文章
node scripts/post.mjs update <id> --title "新标题" --content "新内容"

# 删除文章
node scripts/post.mjs delete <id>

# 上传图片（返回 Vercel Blob URL，可直接用于 Markdown）
node scripts/post.mjs upload <文件路径>
```

### 分类代码

| 代码 | 含义 |
|------|------|
| `stock` | 📈 股票 |
| `ai` | 🤖 AI |
| `sales` | 💼 销售 |
| `misc` | ☕ 杂谈 |

---

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # ESLint 检查
npm test             # 运行测试
npm run test:coverage # 测试覆盖率
npx prisma studio    # 数据库可视化
```

---

## 部署

项目通过 GitHub + Vercel 集成自动部署：

1. 推送到 `main` 分支 → 自动触发生产部署
2. 提 PR → 自动生成预览 URL

**Vercel 必需的环境变量：**
- `POSTGRES_URL` — Neon 数据库连接字符串
- `API_SECRET` — 后台管理密钥
- `BLOB_READ_WRITE_TOKEN` — 图片上传令牌
