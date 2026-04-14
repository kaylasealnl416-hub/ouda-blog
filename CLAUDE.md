@AGENTS.md

# ouda-blog — 殴达的博客

## 项目概述

个人博客，四大主题：📈 股票 · 🤖 AI · 💼 销售 · ☕ 杂谈
品牌名：殴达的博客 | Slogan：老登新生，从零开始，保持好奇，持续学习

## 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS 4 + @tailwindcss/typography |
| 字体 | 霞鹜文楷（中文）+ Playfair Display + Source Serif 4 + Inter |
| 动画 | Motion (framer-motion) |
| ORM | Prisma 7 + SQLite |
| 数据库 | SQLite（本地 prisma/dev.db） |

## 文章管理（Claude Code 专用）

### CLI 管理脚本

前提：开发服务器需运行中（`npm run dev`）

```bash
# 列出所有文章
node scripts/post.mjs list

# 创建文章（草稿）
node scripts/post.mjs create --title "标题" --slug "url-slug" --category ai --content "Markdown 正文" --tags "标签1,标签2" --excerpt "摘要"

# 创建并直接发布
node scripts/post.mjs create --title "标题" --slug "url-slug" --category stock --content "..." --publish

# 发布/取消发布
node scripts/post.mjs publish <id>
node scripts/post.mjs unpublish <id>

# 更新文章
node scripts/post.mjs update <id> --title "新标题" --content "新内容"

# 删除文章
node scripts/post.mjs delete <id>

# 上传图片（返回 Vercel Blob URL，可直接用于 Markdown）
node scripts/post.mjs upload <文件路径>
```

### 鉴权
写操作（创建/更新/删除/上传）需要 `API_SECRET` 环境变量。
本地 `.env` 已配置，CLI 脚本会自动读取。线上通过 Vercel 环境变量注入。

### 分类代码
- `stock` — 股票
- `ai` — AI
- `sales` — 销售
- `misc` — 杂谈

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 文章列表 |
| POST | /api/posts | 创建文章 |
| GET | /api/posts/:id | 单篇文章 |
| PUT | /api/posts/:id | 更新文章 |
| DELETE | /api/posts/:id | 删除文章 |

### CMS 后台

浏览器访问 http://localhost:3000/admin 可视化管理文章。

## 典型工作流

1. 用户说"写一篇关于 XX 的文章"
2. Claude Code 用 CLI 创建草稿：`node scripts/post.mjs create ...`
3. 用户审核内容
4. Claude Code 发布：`node scripts/post.mjs publish <id>`

## 开发命令

```bash
npm run dev          # 启动开发服务器
npx prisma studio    # 数据库可视化
npx prisma migrate dev --name xxx  # 数据库迁移
node prisma/seed.mjs # 重新灌入种子数据
```
