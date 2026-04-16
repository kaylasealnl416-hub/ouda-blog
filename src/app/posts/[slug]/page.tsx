import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/posts";
import { CATEGORY_META, type Category } from "@/data/posts";
import { formatDate } from "@/lib/utils";
import { extractToc } from "@/lib/toc";
import MarkdownContent from "@/components/post/MarkdownContent";
import TableOfContents from "@/components/post/TableOfContents";
import RelatedPosts from "@/components/post/RelatedPosts";
import ReadingProgress from "@/components/post/ReadingProgress";
import ShareButtons from "@/components/post/ShareButtons";
import Tag from "@/components/ui/Tag";
import PageTransition from "@/components/ui/PageTransition";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — 殴达的博客`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://ouda-blog.vercel.app/posts/${slug}`,
    },
  };
}

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
  const tocItems = extractToc(post.content);
  const relatedPosts = await getRelatedPosts(post.category, post.slug);

  return (
    <PageTransition>
      <ReadingProgress />
      {/* 最外层容器：文章区 + TOC 侧边栏（xl 屏才出现） */}
      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-12 items-start">

        {/* 主内容区 */}
        <article className="min-w-0 flex-1 max-w-3xl">
          {/* 返回链接 */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-8 group"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">&larr;</span>
            <span className="text-sm">返回文章</span>
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

          {/* 相关文章 */}
          <RelatedPosts posts={relatedPosts} />

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

        {/* TOC 侧边栏（仅 xl 屏显示，由组件内部控制） */}
        <TableOfContents items={tocItems} />
      </div>
    </PageTransition>
  );
}
