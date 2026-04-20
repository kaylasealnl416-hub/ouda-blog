// 文章 API — 列表 & 创建

import { prisma } from "@/lib/prisma";
import { checkAuth, isAuthenticated } from "@/lib/auth";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { normalizeCategory, parseStoredTags, validatePostWriteInput } from "@/lib/post-contract";
import { getAllPosts } from "@/lib/posts";

// GET /api/posts — 获取文章列表
// 已鉴权：支持 ?published=true/false 过滤（Admin 用，默认返回全部）
// 未鉴权：强制只返回已发布文章
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const publishedParam = searchParams.get("published");

  let where: { published?: boolean } = {};
  if (isAuthenticated(request)) {
    // Admin 可按参数过滤
    if (publishedParam !== null) {
      where = { published: publishedParam === "true" };
    }
    // 不传参时不加 where，返回全部（含草稿）
  } else {
    const posts = await getAllPosts();
    return Response.json(posts);
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // 解析 tags JSON
  const result = posts.map((p) => ({
    ...p,
    category: normalizeCategory(p.category),
    tags: parseStoredTags(p.tags),
  }));

  return Response.json(result);
}

// POST /api/posts — 创建文章（需鉴权）
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const body = await request.json();
  const validation = validatePostWriteInput(body, "create");
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  const slug = validation.data.slug!;
  const title = validation.data.title!;
  const excerpt = validation.data.excerpt;
  const content = validation.data.content!;
  const category = validation.data.category!;
  const tags = validation.data.tags;
  const readingTime = validation.data.readingTime;
  const published = validation.data.published;
  const createdAt = validation.data.createdAt;

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
      ...(createdAt ? { createdAt } : {}),
    },
  });

  // 刷新首页 + 新文章页缓存
  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);

  return Response.json(
    {
      ...post,
      category: normalizeCategory(post.category),
      tags: parseStoredTags(post.tags),
      adminUrl: `https://ouda-blog.vercel.app/admin/${post.id}/edit`,
    },
    { status: 201 }
  );
}
