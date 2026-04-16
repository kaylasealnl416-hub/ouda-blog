// Admin 路由保护 — 未登录时跳转到登录页
// Next.js 16 使用 proxy.ts 约定（middleware.ts 已废弃）

import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只拦截 /admin 路由（放行 /admin/login 本身，避免无限重定向）
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;
    const expected = process.env.API_SECRET;

    // API_SECRET 未配置或 token 不匹配时，跳转登录页（fail-closed）
    if (!expected || token !== expected) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

// 只对 /admin 路径下的所有子路由生效
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
