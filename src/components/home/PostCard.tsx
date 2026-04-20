import Link from "next/link";
import Tag from "@/components/ui/Tag";
import { formatDate, formatId } from "@/lib/utils";
import { getCategoryMeta } from "@/lib/post-contract";
import type { PostData } from "@/lib/posts";

interface PostCardProps {
  post: PostData;
  displayIndex?: number;
}

export default function PostCard({ post, displayIndex }: PostCardProps) {
  const cat = getCategoryMeta(post.category);

  return (
    <Link href={`/posts/${post.slug}`} className="block">
      <article className="post-card py-6 px-4 -mx-4 rounded-lg border-b border-border-light">
        <div className="flex items-start gap-4">
          {/* 编号 */}
          <span className="post-number font-display text-2xl text-light leading-none pt-1 hidden sm:block">
            {formatId(displayIndex ?? post.id)}
          </span>

          <div className="flex-1 min-w-0">
            {/* 元信息行 */}
            <div className="flex items-center gap-3 text-xs text-muted mb-2">
              <span>
                {cat.emoji} {cat.label}
              </span>
              <span>·</span>
              <span>{formatDate(post.createdAt.toISOString())}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
            </div>

            {/* 标题 */}
            <h2 className="post-title font-serif text-lg font-medium text-ink leading-snug mb-2">
              {post.title}
            </h2>

            {/* 摘要 */}
            <p className="text-sm text-muted leading-relaxed mb-3 line-clamp-2">
              {post.excerpt}
            </p>

            {/* 标签 */}
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
}
