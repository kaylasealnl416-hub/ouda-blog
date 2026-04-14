// CMS 后台 — 新建文章

import Link from "next/link";
import PostForm from "@/components/admin/PostForm";

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/admin" className="text-sm text-muted hover:text-accent mb-6 inline-block">
        ← 返回文章列表
      </Link>
      <h1 className="font-display text-2xl text-ink mb-8">新建文章</h1>
      <PostForm mode="create" />
    </div>
  );
}
