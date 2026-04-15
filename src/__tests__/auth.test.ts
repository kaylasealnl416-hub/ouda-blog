// 鉴权测试 — checkAuth & isAuthenticated

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { checkAuth, isAuthenticated } from "@/lib/auth";

const SECRET = "test-secret-123";

function makeRequest(options: {
  bearer?: string;
  cookie?: string;
} = {}): NextRequest {
  const headers = new Headers();
  if (options.bearer) headers.set("authorization", `Bearer ${options.bearer}`);
  if (options.cookie) headers.set("cookie", `admin_token=${options.cookie}`);
  return new NextRequest("http://localhost/api/test", { headers });
}

describe("checkAuth — fail-closed 模式", () => {
  beforeEach(() => {
    process.env.API_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.API_SECRET;
  });

  it("Bearer token 正确时放行", () => {
    const result = checkAuth(makeRequest({ bearer: SECRET }));
    expect(result).toBeNull();
  });

  it("Cookie 正确时放行", () => {
    const result = checkAuth(makeRequest({ cookie: SECRET }));
    expect(result).toBeNull();
  });

  it("Bearer token 错误时返回 401", async () => {
    const result = checkAuth(makeRequest({ bearer: "wrong-token" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("无任何凭据时返回 401", async () => {
    const result = checkAuth(makeRequest());
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });

  it("API_SECRET 未配置时返回 401（fail-closed）", () => {
    delete process.env.API_SECRET;
    // 即使传了 token，未配置 secret 也应拒绝
    const result = checkAuth(makeRequest({ bearer: "any-token" }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});

describe("isAuthenticated — 布尔判断", () => {
  beforeEach(() => {
    process.env.API_SECRET = SECRET;
  });

  afterEach(() => {
    delete process.env.API_SECRET;
  });

  it("Bearer token 正确时返回 true", () => {
    expect(isAuthenticated(makeRequest({ bearer: SECRET }))).toBe(true);
  });

  it("Cookie 正确时返回 true", () => {
    expect(isAuthenticated(makeRequest({ cookie: SECRET }))).toBe(true);
  });

  it("无凭据时返回 false", () => {
    expect(isAuthenticated(makeRequest())).toBe(false);
  });

  it("API_SECRET 未配置时返回 false", () => {
    delete process.env.API_SECRET;
    expect(isAuthenticated(makeRequest({ bearer: "any" }))).toBe(false);
  });
});
