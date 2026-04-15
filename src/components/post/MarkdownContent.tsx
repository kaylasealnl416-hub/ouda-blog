// Markdown 渲染 — 服务端 unified 管道，直接输出 HTML 字符串
// 无需客户端 JS，内容随 SSR HTML 一起下发

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

// 白名单 schema：在默认安全规则基础上，额外放行 iframe（用于嵌入 YouTube/B站视频）
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
  },
};

interface MarkdownContentProps {
  content: string;
}

export default async function MarkdownContent({ content }: MarkdownContentProps) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)  // 清洗 HTML，只保留白名单标签与属性
    .use(rehypeStringify)
    .process(content);

  return (
    <div
      className="prose prose-lg max-w-none font-serif leading-relaxed"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
