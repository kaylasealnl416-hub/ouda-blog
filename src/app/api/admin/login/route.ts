// Admin 登录接口 — 验证密码并写入 HttpOnly cookie

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const expected = process.env.API_SECRET;

  // 未配置或密码不匹配时返回 401
  if (!expected || password !== expected) {
    return Response.json({ error: "密码错误" }, { status: 401 });
  }

  // 验证通过，写入 HttpOnly cookie，有效期 7 天
  // 生产环境加 Secure 属性，确保 cookie 只通过 HTTPS 传输
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `admin_token=${expected}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 3600}${secure}`
  );
  return response;
}
