// Markdown 渲染 — 服务端 unified 管道，直接输出 HTML 字符串
// 无需客户端 JS，内容随 SSR HTML 一起下发

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

interface MarkdownContentProps {
  content: string;
}

export default async function MarkdownContent({ content }: MarkdownContentProps) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

  return (
    <div
      className="prose prose-lg max-w-none font-serif leading-relaxed"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
