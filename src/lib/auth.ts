// API 写操作鉴权 — Bearer token 校验

import { NextRequest } from "next/server";

export function checkAuth(request: NextRequest): Response | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.API_SECRET;

  if (!expected) {
    // 未配置 API_SECRET 时跳过校验（本地开发）
    return null;
  }

  if (token !== expected) {
    return Response.json({ error: "未授权" }, { status: 401 });
  }

  return null;
}
