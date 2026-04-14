// 文章 API — 列表 & 创建

import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/posts — 获取文章列表（支持 ?published=true/false）
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const published = searchParams.get("published");

  const where = published !== null ? { published: published === "true" } : {};

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // 解析 tags JSON
  const result = posts.map((p) => ({
    ...p,
    tags: JSON.parse(p.tags) as string[],
  }));

  return Response.json(result);
}

// POST /api/posts — 创建文章
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug, title, excerpt, content, category, tags, readingTime, published } = body;

  if (!slug || !title || !content || !category) {
    return Response.json(
      { error: "缺少必填字段：slug, title, content, category" },
      { status: 400 }
    );
  }

  // 检查 slug 是否已存在
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return Response.json({ error: `slug "${slug}" 已存在` }, { status: 409 });
  }

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      excerpt: excerpt || "",
      content,
      category,
      tags: JSON.stringify(tags || []),
      readingTime: readingTime || 5,
      published: published ?? false,
    },
  });

  return Response.json({ ...post, tags: JSON.parse(post.tags) }, { status: 201 });
}
