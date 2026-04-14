"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostFormData {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readingTime: number;
  published: boolean;
}

interface PostFormProps {
  initialData?: PostFormData;
  mode: "create" | "edit";
}

export default function PostForm({ initialData, mode }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<PostFormData>(
    initialData || {
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      category: "misc",
      tags: [],
      readingTime: 5,
      published: false,
    }
  );

  const [tagsInput, setTagsInput] = useState(
    initialData?.tags.join(", ") || ""
  );

  const handleSubmit = async (publish?: boolean) => {
    setSaving(true);
    setError("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      tags,
      published: publish !== undefined ? publish : form.published,
    };

    try {
      const url =
        mode === "create" ? "/api/posts" : `/api/posts/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        setSaving(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("网络错误");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    const res = await fetch(`/api/posts/${initialData?.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 标题 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          标题 *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
          placeholder="文章标题"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          Slug *（URL 路径，如 my-first-post）
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
          placeholder="my-first-post"
        />
      </div>

      {/* 分类 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          分类 *
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
        >
          <option value="stock">📈 股票</option>
          <option value="ai">🤖 AI</option>
          <option value="sales">💼 销售</option>
          <option value="misc">☕ 杂谈</option>
        </select>
      </div>

      {/* 摘要 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          摘要
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
          rows={2}
          placeholder="文章摘要（1-2 句话）"
        />
      </div>

      {/* 正文 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          正文（Markdown）*
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink font-mono text-sm focus:outline-none focus:border-accent"
          rows={16}
          placeholder="用 Markdown 格式写文章..."
        />
      </div>

      {/* 标签 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          标签（逗号分隔）
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
          placeholder="AI, Agent, LLM"
        />
      </div>

      {/* 阅读时长 */}
      <div>
        <label className="block text-sm font-medium text-muted mb-1">
          预估阅读时长（分钟）
        </label>
        <input
          type="number"
          value={form.readingTime}
          onChange={(e) =>
            setForm({ ...form, readingTime: Number(e.target.value) })
          }
          className="w-32 px-3 py-2 border border-border rounded bg-paper text-ink focus:outline-none focus:border-accent"
          min={1}
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="px-4 py-2 border border-border text-ink text-sm rounded hover:bg-border-light transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存草稿"}
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="px-4 py-2 bg-accent text-white text-sm rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {saving ? "发布中..." : "发布"}
        </button>

        {mode === "edit" && (
          <button
            onClick={handleDelete}
            className="ml-auto px-4 py-2 text-red-500 text-sm hover:text-red-700 transition-colors"
          >
            删除文章
          </button>
        )}
      </div>
    </div>
  );
}
