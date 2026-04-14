"use client";

// Admin 登录页面 — 输入密码后写入 cookie，跳转到 /admin

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // 登录成功，跳转到后台首页
        router.push("/admin");
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        {/* 标题区域 */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl text-ink mb-1">殴达的博客</h1>
          <p className="text-sm text-muted">管理员登录</p>
        </div>

        {/* 登录表单 */}
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-lg p-6 space-y-4 bg-paper"
        >
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              管理员密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              required
              autoFocus
              className="w-full px-3 py-2 border border-border rounded text-ink bg-paper text-sm
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                         placeholder:text-muted/50"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-2 bg-accent text-white text-sm rounded
                       hover:bg-accent-hover transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
