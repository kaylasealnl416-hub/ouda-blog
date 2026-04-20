import { Suspense } from "react";
import Link from "next/link";
import { getAllPostSummaries, getPostSummariesByCategory } from "@/lib/posts";
import { isValidCategory } from "@/lib/post-contract";
import CategoryTabs from "@/components/home/CategoryTabs";
import PostList from "@/components/home/PostList";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const catParam = typeof category === "string" ? category : undefined;
  const cat = isValidCategory(catParam) ? catParam : undefined;
  const posts = cat
    ? await getPostSummariesByCategory(cat)
    : await getAllPostSummaries();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* 品牌区 */}
      <section className="mb-12">
        <div className="flex items-baseline gap-4 mb-3">
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            殴达的博客
          </h1>
          <Link
            href="/about"
            className="relative text-sm font-medium text-red-500 hover:text-white px-3 py-1 rounded-full border border-red-500 hover:bg-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
          >
            关于我
          </Link>
        </div>
        <p className="text-muted text-sm sm:text-lg font-serif">
          老登新生，从零开始，保持好奇，持续学习
        </p>
      </section>

      {/* 分类 tab */}
      <section className="border-b border-border mb-6">
        <Suspense fallback={null}>
          <CategoryTabs />
        </Suspense>
      </section>

      {/* 文章列表 */}
      <PostList posts={posts} />
    </div>
  );
}
