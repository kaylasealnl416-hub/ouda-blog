import { CATEGORY_META, type Category } from "@/data/posts";

type ValidatedPostInput = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: Category;
  tags?: string[];
  readingTime?: number;
  published?: boolean;
  createdAt?: Date;
};

type ValidationResult =
  | { ok: true; data: ValidatedPostInput }
  | { ok: false; error: string };

const FALLBACK_CATEGORY: Category = "misc";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && value in CATEGORY_META;
}

export function normalizeCategory(value: unknown): Category {
  return isValidCategory(value) ? value : FALLBACK_CATEGORY;
}

export function getCategoryMeta(value: unknown) {
  return CATEGORY_META[normalizeCategory(value)];
}

export function parseStoredTags(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateTags(value: unknown): ValidationResult {
  if (!Array.isArray(value)) {
    return { ok: false, error: "tags 必须是字符串数组" };
  }

  const tags: string[] = [];
  for (const tag of value) {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      return { ok: false, error: "tags 中不能包含空标签或非字符串值" };
    }
    tags.push(tag.trim());
  }

  return { ok: true, data: { tags } };
}

export function validatePostWriteInput(
  input: unknown,
  mode: "create" | "update"
): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: "请求体必须是 JSON 对象" };
  }

  const data: ValidatedPostInput = {};

  if (mode === "create" || "slug" in input) {
    if (!isNonEmptyString(input.slug)) {
      return { ok: false, error: "slug 必须是非空字符串" };
    }
    data.slug = input.slug.trim();
  }

  if (mode === "create" || "title" in input) {
    if (!isNonEmptyString(input.title)) {
      return { ok: false, error: "title 必须是非空字符串" };
    }
    data.title = input.title.trim();
  }

  if ("excerpt" in input) {
    if (input.excerpt !== undefined && typeof input.excerpt !== "string") {
      return { ok: false, error: "excerpt 必须是字符串" };
    }
    data.excerpt = typeof input.excerpt === "string" ? input.excerpt.trim() : "";
  }

  if (mode === "create" || "content" in input) {
    if (!isNonEmptyString(input.content)) {
      return { ok: false, error: "content 必须是非空字符串" };
    }
    data.content = input.content.trim();
  }

  if (mode === "create" || "category" in input) {
    if (!isValidCategory(input.category)) {
      return { ok: false, error: "category 只能是 stock / ai / sales / misc" };
    }
    data.category = input.category;
  }

  if ("tags" in input) {
    const tagValidation = validateTags(input.tags);
    if (!tagValidation.ok) {
      return tagValidation;
    }
    data.tags = tagValidation.data.tags;
  }

  if ("readingTime" in input) {
    if (
      typeof input.readingTime !== "number" ||
      !Number.isInteger(input.readingTime) ||
      input.readingTime < 1
    ) {
      return { ok: false, error: "readingTime 必须是大于等于 1 的整数" };
    }
    data.readingTime = input.readingTime;
  }

  if ("published" in input) {
    if (typeof input.published !== "boolean") {
      return { ok: false, error: "published 必须是布尔值" };
    }
    data.published = input.published;
  }

  if ("createdAt" in input) {
    if (!isNonEmptyString(input.createdAt)) {
      return { ok: false, error: "createdAt 必须是合法日期字符串" };
    }
    const createdAt = new Date(input.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return { ok: false, error: "createdAt 必须是合法日期字符串" };
    }
    data.createdAt = createdAt;
  }

  return { ok: true, data };
}
