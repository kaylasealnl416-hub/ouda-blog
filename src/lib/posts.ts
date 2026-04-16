// 文章数据读取层 — 从数据库查询

import { prisma } from "./prisma";
import type { Category } from "@/data/posts";

export interface PostData {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readingTime: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
    tags: JSON.parse(row.tags) as string[],
  };
}

/** 获取所有已发布文章，按日期倒序 */
export async function getAllPosts(): Promise<PostData[]> {
  const rows = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPostData);
}

/** 按分类筛选文章 */
export async function getPostsByCategory(category: Category): Promise<PostData[]> {
  const rows = await prisma.post.findMany({
    where: { published: true, category },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPostData);
}

/** 根据 slug 获取单篇已发布文章（公开读取，草稿返回 null） */
export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const row = await prisma.post.findFirst({ where: { slug, published: true } });
  return row ? toPostData(row) : null;
}

/** 获取所有 slug（用于静态生成） */
export async function getAllSlugs(): Promise<string[]> {
  const rows = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
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
  category: string,
  excludeSlug: string
): Promise<PostData[]> {
  const rows = await prisma.post.findMany({
    where: {
      published: true,
      category,
      NOT: { slug: excludeSlug },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return rows.map(toPostData);
}
