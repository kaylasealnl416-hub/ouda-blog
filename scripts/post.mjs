#!/usr/bin/env node

/**
 * 文章管理 CLI — 供 Claude Code 直接调用
 *
 * 用法：
 *   node scripts/post.mjs list                    # 列出所有文章
 *   node scripts/post.mjs create --title "..." --slug "..." --category ai --content "..." [--tags "a,b"] [--excerpt "..."] [--publish]
 *   node scripts/post.mjs publish <id>            # 发布文章
 *   node scripts/post.mjs unpublish <id>          # 取消发布
 *   node scripts/post.mjs delete <id>             # 删除文章
 *   node scripts/post.mjs update <id> --title "..." --content "..."  # 更新字段
 */

const BASE = process.env.BLOG_API_URL || "http://localhost:3000";
const API_SECRET = process.env.API_SECRET || "";

function authHeaders() {
  return API_SECRET ? { Authorization: `Bearer ${API_SECRET}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ API 错误 (${res.status}):`, data.error || data);
    process.exit(1);
  }
  return data;
}

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        result[key] = true; // 布尔 flag
      } else {
        result[key] = next;
        i++;
      }
    }
  }
  return result;
}

const [command, ...rest] = process.argv.slice(2);

switch (command) {
  case "list": {
    const posts = await apiFetch("/api/posts");
    console.log(`\n共 ${posts.length} 篇文章:\n`);
    for (const p of posts) {
      const status = p.published ? "✅" : "📝";
      console.log(
        `  ${status} [${p.id}] ${p.title} (${p.category}) — ${p.slug}`
      );
    }
    console.log();
    break;
  }

  case "create": {
    const opts = parseArgs(rest);
    if (!opts.title || !opts.slug || !opts.category) {
      console.error("❌ 必填：--title, --slug, --category");
      process.exit(1);
    }
    const payload = {
      title: opts.title,
      slug: opts.slug,
      category: opts.category,
      content: opts.content || "",
      excerpt: opts.excerpt || "",
      tags: opts.tags ? opts.tags.split(",").map((t) => t.trim()) : [],
      readingTime: opts.readingTime ? Number(opts.readingTime) : 5,
      published: !!opts.publish,
    };
    const post = await apiFetch("/api/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`\n✅ 文章创建成功！ID: ${post.id}, slug: ${post.slug}`);
    console.log(`   状态: ${post.published ? "已发布" : "草稿"}`);
    console.log(`   地址: ${BASE}/posts/${post.slug}\n`);
    break;
  }

  case "publish": {
    const id = rest[0];
    if (!id) {
      console.error("❌ 用法: post.mjs publish <id>");
      process.exit(1);
    }
    await apiFetch(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ published: true }),
    });
    console.log(`\n✅ 文章 ${id} 已发布\n`);
    break;
  }

  case "unpublish": {
    const id = rest[0];
    if (!id) {
      console.error("❌ 用法: post.mjs unpublish <id>");
      process.exit(1);
    }
    await apiFetch(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ published: false }),
    });
    console.log(`\n✅ 文章 ${id} 已转为草稿\n`);
    break;
  }

  case "delete": {
    const id = rest[0];
    if (!id) {
      console.error("❌ 用法: post.mjs delete <id>");
      process.exit(1);
    }
    await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
    console.log(`\n✅ 文章 ${id} 已删除\n`);
    break;
  }

  case "update": {
    const id = rest[0];
    const opts = parseArgs(rest.slice(1));
    if (!id) {
      console.error("❌ 用法: post.mjs update <id> --title '...' --content '...'");
      process.exit(1);
    }
    const payload = {};
    if (opts.title) payload.title = opts.title;
    if (opts.slug) payload.slug = opts.slug;
    if (opts.excerpt) payload.excerpt = opts.excerpt;
    if (opts.content) payload.content = opts.content;
    if (opts.category) payload.category = opts.category;
    if (opts.tags) payload.tags = opts.tags.split(",").map((t) => t.trim());
    if (opts.readingTime) payload.readingTime = Number(opts.readingTime);

    await apiFetch(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    console.log(`\n✅ 文章 ${id} 已更新\n`);
    break;
  }

  case "upload": {
    const filePath = rest[0];
    if (!filePath) {
      console.error("❌ 用法: post.mjs upload <文件路径>");
      process.exit(1);
    }
    const { readFile } = await import("node:fs/promises");
    const { basename } = await import("node:path");
    const buffer = await readFile(filePath);
    const fileName = basename(filePath);
    const ext = fileName.split(".").pop().toLowerCase();
    const mimeMap = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml" };
    const mime = mimeMap[ext] || "application/octet-stream";

    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: mime }), fileName);

    const res = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`❌ 上传失败 (${res.status}):`, data.error || data);
      process.exit(1);
    }
    console.log(`\n✅ 上传成功！`);
    console.log(`   URL: ${data.url}`);
    console.log(`   Markdown: ![${fileName}](${data.url})\n`);
    break;
  }

  default:
    console.log(`
文章管理 CLI

用法：
  node scripts/post.mjs list                        列出所有文章
  node scripts/post.mjs create --title "..." ...     创建文章
  node scripts/post.mjs publish <id>                 发布
  node scripts/post.mjs unpublish <id>               转为草稿
  node scripts/post.mjs update <id> --title "..."    更新
  node scripts/post.mjs delete <id>                  删除
  node scripts/post.mjs upload <文件路径>            上传图片
`);
}
