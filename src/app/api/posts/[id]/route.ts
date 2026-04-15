// 文章 API — 单篇查询、更新、删除

import { prisma } from "@/lib/prisma";
import { checkAuth, isAuthenticated } from "@/lib/auth";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ id: string }> };

// GET /api/posts/:id
// 已鉴权：返回任意文章（含草稿）
// 未鉴权：草稿返回 404，不暴露其存在
export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });

  if (!post) {
    return Response.json({ error: "文章不存在" }, { status: 404 });
  }

  if (!post.published && !isAuthenticated(request)) {
    return Response.json({ error: "文章不存在" }, { status: 404 });
  }

  return Response.json({ ...post, tags: JSON.parse(post.tags) });
}

// PUT /api/posts/:id — 更新文章（需鉴权）
export async function PUT(request: NextRequest, context: Context) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.content !== undefined) data.content = body.content;
  if (body.category !== undefined) data.category = body.category;
  if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
  if (body.readingTime !== undefined) data.readingTime = body.readingTime;
  if (body.published !== undefined) data.published = body.published;
  if (body.createdAt !== undefined) data.createdAt = new Date(body.createdAt);

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data,
  });

  return Response.json({ ...post, tags: JSON.parse(post.tags) });
}

// DELETE /api/posts/:id — 删除文章（需鉴权）
export async function DELETE(_request: NextRequest, context: Context) {
  const authError = checkAuth(_request);
  if (authError) return authError;
  const { id } = await context.params;

  await prisma.post.delete({ where: { id: Number(id) } });

  return Response.json({ success: true });
}
