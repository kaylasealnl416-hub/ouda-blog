import PostCard from "./PostCard";
import type { PostSummary } from "@/lib/posts";

interface PostListProps {
  posts: PostSummary[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">暂无文章</p>
        <p className="text-sm mt-2">敬请期待</p>
      </div>
    );
  }

  return (
    <div className="divide-y-0">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} displayIndex={posts.length - index} />
      ))}
    </div>
  );
}
