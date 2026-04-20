// 文章数据读取层 — 从数据库查询

import { prisma } from "./prisma";
import { posts as fallbackSeedPosts, type Category } from "@/data/posts";
import { normalizeCategory, parseStoredTags } from "@/lib/post-contract";

export interface PostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  tags: string[];
  readingTime: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PUBLIC_QUERY_TIMEOUT_MS = 5000;

/** 数据库记录 → 前端 PostData（解析 tags JSON） */
function toPostData(row: {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  readingTime: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PostData {
  return {
    ...row,
    category: normalizeCategory(row.category),
    tags: parseStoredTags(row.tags),
  };
}

function fromFallbackSeedPost(post: (typeof fallbackSeedPosts)[number]): PostData {
  const createdAt = new Date(post.date);
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    readingTime: post.readingTime,
    published: true,
    createdAt,
    updatedAt: createdAt,
  };
}

function getFallbackPosts(): PostData[] {
  return fallbackSeedPosts
    .map(fromFallbackSeedPost)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = PUBLIC_QUERY_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Database query timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

/** 获取所有已发布文章，按日期倒序 */
export async function getAllPosts(): Promise<PostData[]> {
  try {
    const rows = await withTimeout(
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
      })
    );
    return rows.map(toPostData);
  } catch {
    return getFallbackPosts();
  }
}

/** 按分类筛选文章 */
export async function getPostsByCategory(category: Category): Promise<PostData[]> {
  try {
    const rows = await withTimeout(
      prisma.post.findMany({
        where: { published: true, category },
        orderBy: { createdAt: "desc" },
      })
    );
    return rows.map(toPostData);
  } catch {
    return getFallbackPosts().filter((post) => post.category === category);
  }
}

/** 根据 slug 获取单篇已发布文章（公开读取，草稿返回 null） */
export async function getPostBySlug(slug: string): Promise<PostData | null> {
  try {
    const row = await withTimeout(prisma.post.findFirst({ where: { slug, published: true } }));
    return row ? toPostData(row) : null;
  } catch {
    return getFallbackPosts().find((post) => post.slug === slug) ?? null;
  }
}

/** 获取所有 slug（用于静态生成） */
export async function getAllSlugs(): Promise<string[]> {
  try {
    const rows = await withTimeout(
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true },
      })
    );
    return rows.map((r) => r.slug);
  } catch {
    return getFallbackPosts().map((post) => post.slug);
  }
}

/** 获取所有文章（包括草稿，CMS 用） */
export async function getAllPostsAdmin(): Promise<PostData[]> {
  const rows = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPostData);
}

/** 获取相关文章：同分类、排除当前文章、最多 3 篇 */
export async function getRelatedPosts(
  category: Category,
  excludeSlug: string
): Promise<PostData[]> {
  try {
    const rows = await withTimeout(
      prisma.post.findMany({
        where: {
          published: true,
          category,
          NOT: { slug: excludeSlug },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      })
    );
    return rows.map(toPostData);
  } catch {
    return getFallbackPosts()
      .filter((post) => post.category === category && post.slug !== excludeSlug)
      .slice(0, 3);
  }
}
