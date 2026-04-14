// 文章 API — 单篇查询、更新、删除

import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

type Context = { params: Promise<{ id: string }> };

// GET /api/posts/:id
export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });

  if (!post) {
    return Response.json({ error: "文章不存在" }, { status: 404 });
  }

  return Response.json({ ...post, tags: JSON.parse(post.tags) });
}

// PUT /api/posts/:id — 更新文章
export async function PUT(request: NextRequest, context: Context) {
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

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data,
  });

  return Response.json({ ...post, tags: JSON.parse(post.tags) });
}

// DELETE /api/posts/:id — 删除文章
export async function DELETE(_request: NextRequest, context: Context) {
  const { id } = await context.params;

  await prisma.post.delete({ where: { id: Number(id) } });

  return Response.json({ success: true });
}
