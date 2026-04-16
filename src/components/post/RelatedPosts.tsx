// 相关文章推荐 — 同分类最多 3 篇，展示在文章底部

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { PostData } from "@/lib/posts";

interface RelatedPostsProps {
  posts: PostData[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
        相关文章
      </h2>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group flex flex-col gap-0.5 hover:text-accent transition-colors"
            >
              <span className="font-medium text-ink group-hover:text-accent transition-colors leading-snug">
                {post.title}
              </span>
              <span className="text-xs text-muted">
                {formatDate(post.createdAt.toISOString())} · {post.readingTime} min read
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
