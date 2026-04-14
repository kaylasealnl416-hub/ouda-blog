import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllSlugs } from "@/lib/posts";
import { CATEGORY_META, type Category } from "@/data/posts";
import { formatDate } from "@/lib/utils";
import MarkdownContent from "@/components/post/MarkdownContent";
import ShareButtons from "@/components/post/ShareButtons";
import Tag from "@/components/ui/Tag";
import PageTransition from "@/components/ui/PageTransition";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const cat = CATEGORY_META[post.category as Category];

  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto px-6 py-10">
        {/* 返回链接 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回文章列表
        </Link>

        {/* 文章头 */}
        <header className="mb-10">
          {/* 元信息 */}
          <div className="flex items-center gap-3 text-sm text-muted mb-4">
            <span>
              {cat.emoji} {cat.label}
            </span>
            <span>·</span>
            <span>{formatDate(post.createdAt.toISOString())}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>

          {/* 标题 */}
          <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight mb-4">
            {post.title}
          </h1>

          {/* 摘要 */}
          <p className="text-muted font-serif text-lg leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        </header>

        {/* 正文 */}
        <MarkdownContent content={post.content} />

        {/* 分享按钮 */}
        <ShareButtons title={post.title} slug={post.slug} />

        {/* 返回首页 */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <Link
            href="/"
            className="text-sm text-muted hover:text-accent"
          >
            ← 返回文章列表
          </Link>
        </div>
      </article>
    </PageTransition>
  );
}
