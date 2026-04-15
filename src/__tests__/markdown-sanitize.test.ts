// Markdown 安全渲染测试 — 验证 XSS 载荷被 rehype-sanitize 清洗

import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// 与 MarkdownContent.tsx 保持相同的 schema
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
  },
};

async function renderMarkdown(content: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}

describe("Markdown 安全渲染 — XSS 防护", () => {
  it("正常 Markdown 正确渲染", async () => {
    const html = await renderMarkdown("## 标题\n\n正文段落");
    expect(html).toContain("<h2>标题</h2>");
    expect(html).toContain("<p>正文段落</p>");
  });

  it("script 标签被移除", async () => {
    const html = await renderMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert");
  });

  it("内联事件属性被移除", async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("javascript: 协议链接被移除", async () => {
    const html = await renderMarkdown('[点击](javascript:alert(1))');
    expect(html).not.toContain("javascript:");
  });

  it("iframe 嵌入视频正常保留", async () => {
    const html = await renderMarkdown(
      '<iframe src="https://www.youtube.com/embed/xxx" width="560" height="315" title="视频"></iframe>'
    );
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.youtube.com/embed/xxx"');
  });

  it("iframe 上的危险属性被清洗", async () => {
    const html = await renderMarkdown(
      '<iframe src="https://www.youtube.com/embed/xxx" onload="alert(1)"></iframe>'
    );
    expect(html).toContain("<iframe");
    expect(html).not.toContain("onload");
  });

  it("普通图片链接正常渲染", async () => {
    const html = await renderMarkdown("![alt text](https://example.com/image.png)");
    expect(html).toContain("<img");
    expect(html).toContain('src="https://example.com/image.png"');
  });

  it("代码块正常渲染", async () => {
    const html = await renderMarkdown("```js\nconsole.log('hello')\n```");
    expect(html).toContain("<code");
    expect(html).toContain("console.log");
  });
});
