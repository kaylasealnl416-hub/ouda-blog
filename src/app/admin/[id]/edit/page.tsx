// CMS 后台 — 编辑文章

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeCategory, parseStoredTags } from "@/lib/post-contract";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });

  if (!post) {
    notFound();
  }

  const initialData = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: normalizeCategory(post.category),
    tags: parseStoredTags(post.tags),
    readingTime: post.readingTime,
    published: post.published,
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-accent mb-6 inline-block">
        ← 返回文章列表
      </Link>
      <h1 className="font-display text-2xl text-ink mb-8">编辑文章</h1>
      <PostForm mode="edit" initialData={initialData} />
    </div>
  );
}
