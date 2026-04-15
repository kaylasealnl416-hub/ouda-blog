// API 写操作鉴权 — 支持 Bearer token（CLI 脚本）和 admin_token cookie（Admin UI）

import { NextRequest } from "next/server";

/** 判断请求是否已通过鉴权（仅布尔值，用于 GET 路由按权限区分数据） */
export function isAuthenticated(request: NextRequest): boolean {
  const expected = process.env.API_SECRET;
  if (!expected) return false;

  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer === expected) return true;

  const cookie = request.cookies.get("admin_token")?.value;
  if (cookie === expected) return true;

  return false;
}

/** 写操作鉴权守卫 — 未授权时返回 401 Response，通过时返回 null */
export function checkAuth(request: NextRequest): Response | null {
  const expected = process.env.API_SECRET;

  // API_SECRET 未配置时一律拒绝（fail-closed，防止漏配导致裸奔）
  if (!expected) {
    return Response.json({ error: "服务端未配置 API_SECRET" }, { status: 401 });
  }

  // 方式1：Bearer token — 给 CLI 脚本使用
  const bearer = request.headers.get("authorization")?.replace("Bearer ", "");
  if (bearer === expected) return null;

  // 方式2：Cookie — 给 Admin UI 使用（同源 fetch 自动携带）
  const cookie = request.cookies.get("admin_token")?.value;
  if (cookie === expected) return null;

  return Response.json({ error: "未授权" }, { status: 401 });
}
