import Link from "next/link";
import { posts } from "@/data/posts";
import { formatDate, formatId } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/post-contract";
import Tag from "@/components/ui/Tag";

const homepagePosts = [...posts].sort((a, b) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
});

export default function HomePage() {

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

      <section className="border-b border-border mb-6 pb-4 text-sm text-muted">
        首页先切到静态模式，后台写作与公开文章 API 保持可用。
      </section>

      <div className="divide-y-0">
        {homepagePosts.map((post, index) => {
          const cat = getCategoryMeta(post.category);

          return (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block">
              <article className="post-card py-6 px-4 -mx-4 rounded-lg border-b border-border-light">
                <div className="flex items-start gap-4">
                  <span className="post-number font-display text-2xl text-light leading-none pt-1 hidden sm:block">
                    {formatId(homepagePosts.length - index)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs text-muted mb-2">
                      <span>
                        {cat.emoji} {cat.label}
                      </span>
                      <span>·</span>
                      <span>{formatDate(post.date)}</span>
                      <span>·</span>
                      <span>{post.readingTime} min read</span>
                    </div>

                    <h2 className="post-title font-serif text-lg font-medium text-ink leading-snug mb-2">
                      {post.title}
                    </h2>

                    <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Tag key={tag} label={tag} />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
