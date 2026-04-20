// 文章 API — 单篇查询、更新、删除

import { prisma } from "@/lib/prisma";
import { checkAuth, isAuthenticated } from "@/lib/auth";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { normalizeCategory, parseStoredTags, validatePostWriteInput } from "@/lib/post-contract";

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

  return Response.json({
    ...post,
    category: normalizeCategory(post.category),
    tags: parseStoredTags(post.tags),
  });
}

// PUT /api/posts/:id — 更新文章（需鉴权）
export async function PUT(request: NextRequest, context: Context) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json();
  const validation = validatePostWriteInput(body, "update");
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (validation.data.title !== undefined) data.title = validation.data.title;
  if (validation.data.slug !== undefined) data.slug = validation.data.slug;
  if (validation.data.excerpt !== undefined) data.excerpt = validation.data.excerpt;
  if (validation.data.content !== undefined) data.content = validation.data.content;
  if (validation.data.category !== undefined) data.category = validation.data.category;
  if (validation.data.tags !== undefined) data.tags = JSON.stringify(validation.data.tags);
  if (validation.data.readingTime !== undefined) data.readingTime = validation.data.readingTime;
  if (validation.data.published !== undefined) data.published = validation.data.published;
  if (validation.data.createdAt !== undefined) data.createdAt = validation.data.createdAt;

  const post = await prisma.post.update({
    where: { id: Number(id) },
    data,
  });

  // 刷新首页 + 该文章页缓存
  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);

  return Response.json({
    ...post,
    category: normalizeCategory(post.category),
    tags: parseStoredTags(post.tags),
  });
}

// DELETE /api/posts/:id — 删除文章（需鉴权）
export async function DELETE(_request: NextRequest, context: Context) {
  const authError = checkAuth(_request);
  if (authError) return authError;
  const { id } = await context.params;

  // 先查 slug，用于刷新缓存
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });

  await prisma.post.delete({ where: { id: Number(id) } });

  // 刷新首页缓存
  revalidatePath("/");
  if (post) revalidatePath(`/posts/${post.slug}`);

  return Response.json({ success: true });
}
