// API 写操作鉴权 — 支持 Bearer token（CLI 脚本）和 admin_token cookie（Admin UI）

import { NextRequest } from "next/server";

export function checkAuth(request: NextRequest): Response | null {
  const expected = process.env.API_SECRET;

  if (!expected) {
    // 未配置 API_SECRET 时跳过校验（本地开发）
    return null;
  }

  // 方式1：Bearer token — 给 CLI 脚本使用
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer === expected) return null;

  // 方式2：Cookie — 给 Admin UI 使用（同源 fetch 自动携带）
  const cookie = request.cookies.get("admin_token")?.value;
  if (cookie === expected) return null;

  return Response.json({ error: "未授权" }, { status: 401 });
}
