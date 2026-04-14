// 图片上传 API — 存入 Vercel Blob，返回公开 URL

import { put } from "@vercel/blob";
import { checkAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

// POST /api/upload — 上传图片（需鉴权）
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "缺少 file 字段" }, { status: 400 });
  }

  // 校验文件类型
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: `不支持的文件类型：${file.type}，仅支持 JPEG/PNG/GIF/WebP/SVG` },
      { status: 400 }
    );
  }

  // 限制 5MB
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "文件大小不能超过 5MB" }, { status: 400 });
  }

  const blob = await put(`blog/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return Response.json({ url: blob.url }, { status: 201 });
}
