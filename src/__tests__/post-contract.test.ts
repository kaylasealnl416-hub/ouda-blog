import { describe, expect, it } from "vitest";
import {
  getCategoryMeta,
  normalizeCategory,
  parseStoredTags,
  validatePostWriteInput,
} from "@/lib/post-contract";

describe("post-contract — 分类与标签容错", () => {
  it("异常分类回退到 misc，避免公开页崩溃", () => {
    expect(normalizeCategory("unknown-category")).toBe("misc");
    expect(getCategoryMeta("unknown-category").label).toBe("杂谈");
  });

  it("非法 tags JSON 回退为空数组", () => {
    expect(parseStoredTags("not-json")).toEqual([]);
  });

  it("tags 会过滤空白并保留有效值", () => {
    expect(parseStoredTags('[" AI ","","Agent"]')).toEqual(["AI", "Agent"]);
  });
});

describe("post-contract — 写接口入参校验", () => {
  it("创建文章时允许合法 payload", () => {
    const result = validatePostWriteInput(
      {
        slug: "hello-world",
        title: "Hello World",
        excerpt: "摘要",
        content: "正文",
        category: "ai",
        tags: ["AI", "Agent"],
        readingTime: 6,
        published: true,
        createdAt: "2026-04-20T10:00:00.000Z",
      },
      "create"
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.category).toBe("ai");
      expect(result.data.tags).toEqual(["AI", "Agent"]);
    }
  });

  it("创建文章时拒绝非法分类", () => {
    const result = validatePostWriteInput(
      {
        slug: "hello-world",
        title: "Hello World",
        content: "正文",
        category: "finance",
      },
      "create"
    );

    expect(result).toEqual({
      ok: false,
      error: "category 只能是 stock / ai / sales / misc",
    });
  });

  it("创建文章时拒绝非数组 tags", () => {
    const result = validatePostWriteInput(
      {
        slug: "hello-world",
        title: "Hello World",
        content: "正文",
        category: "ai",
        tags: "AI,Agent",
      } as unknown as Record<string, unknown>,
      "create"
    );

    expect(result).toEqual({
      ok: false,
      error: "tags 必须是字符串数组",
    });
  });

  it("更新文章时拒绝空标签", () => {
    const result = validatePostWriteInput(
      {
        tags: ["AI", "  "],
      },
      "update"
    );

    expect(result).toEqual({
      ok: false,
      error: "tags 中不能包含空标签或非字符串值",
    });
  });

  it("更新文章时拒绝非法日期", () => {
    const result = validatePostWriteInput(
      {
        createdAt: "not-a-date",
      },
      "update"
    );

    expect(result).toEqual({
      ok: false,
      error: "createdAt 必须是合法日期字符串",
    });
  });

  it("拒绝非对象请求体", () => {
    const result = validatePostWriteInput("oops", "create");

    expect(result).toEqual({
      ok: false,
      error: "请求体必须是 JSON 对象",
    });
  });
});
