import { Suspense } from "react";
import { getAllPosts, getPostsByCategory } from "@/lib/posts";
import { type Category } from "@/data/posts";
import CategoryTabs from "@/components/home/CategoryTabs";
import PostList from "@/components/home/PostList";
import PageTransition from "@/components/ui/PageTransition";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await searchParams;
  const cat = category as Category | undefined;
  const posts = cat ? await getPostsByCategory(cat) : await getAllPosts();

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* 品牌区 */}
        <section className="mb-12">
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
            殴达的博客
          </h1>
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
    </PageTransition>
  );
}
