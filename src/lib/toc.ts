// 从 Markdown 原文提取标题结构，用于生成目录 TOC
// 生成的 ID 与 rehype-slug 保持一致（GitHub-style slugify）

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3; // 只取 h2 / h3，h1 是文章标题本身
}

/** 将标题文本转换为锚点 ID（与 rehype-slug / github-slugger 一致） */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // 移除标点（保留中文、字母、数字、空格、连字符）
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** 从 Markdown 字符串提取 h2/h3 标题列表 */
export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const text = match[2].trim();
    const id = slugify(text);

    items.push({ id, text, level });
  }

  return items;
}
