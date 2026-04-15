// 草稿可见性测试 — 公开接口只能读到已发布文章

import { describe, it, expect, vi, beforeEach } from "vitest";

// mock prisma，不实际连接数据库
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { getPostBySlug } from "@/lib/posts";

const publishedPost = {
  id: 1,
  slug: "published-post",
  title: "已发布文章",
  excerpt: "摘要",
  content: "正文",
  category: "ai",
  tags: '["tag1"]',
  readingTime: 5,
  published: true,
  coverImage: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("getPostBySlug — 公开读取只返回已发布文章", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("slug 存在且已发布时返回文章", async () => {
    vi.mocked(prisma.post.findFirst).mockResolvedValue(publishedPost);

    const result = await getPostBySlug("published-post");

    // 验证查询条件包含 published: true
    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: { slug: "published-post", published: true },
    });
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("published-post");
  });

  it("slug 存在但是草稿时返回 null（不泄露草稿）", async () => {
    // 数据库按 published: true 过滤后找不到草稿，返回 null
    vi.mocked(prisma.post.findFirst).mockResolvedValue(null);

    const result = await getPostBySlug("draft-post");

    expect(prisma.post.findFirst).toHaveBeenCalledWith({
      where: { slug: "draft-post", published: true },
    });
    expect(result).toBeNull();
  });

  it("slug 不存在时返回 null", async () => {
    vi.mocked(prisma.post.findFirst).mockResolvedValue(null);

    const result = await getPostBySlug("nonexistent");
    expect(result).toBeNull();
  });
});
