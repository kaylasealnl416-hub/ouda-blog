// CMS 后台 — 文章管理列表

import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/posts";
import { CATEGORY_META, type Category } from "@/data/posts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">文章管理</h1>
        <Link
          href="/admin/new"
          className="px-4 py-2 bg-accent text-white text-sm rounded hover:bg-accent-hover transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-border-light/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted">标题</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden sm:table-cell">分类</th>
              <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">日期</th>
              <th className="text-left px-4 py-3 font-medium text-muted">状态</th>
              <th className="text-left px-4 py-3 font-medium text-muted">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const cat = CATEGORY_META[post.category as Category];
              return (
                <tr key={post.id} className="border-t border-border-light hover:bg-border-light/30">
                  <td className="px-4 py-3">
                    <span className="text-ink font-medium">{post.title}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-muted">{cat?.emoji} {cat?.label}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-muted">{formatDate(post.createdAt.toISOString())}</span>
                  </td>
                  <td className="px-4 py-3">
                    {post.published ? (
                      <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        已发布
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/${post.id}/edit`}
                      className="text-accent hover:text-accent-hover text-sm"
                    >
                      编辑
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-muted">
        共 {posts.length} 篇文章
      </div>
    </div>
  );
}
