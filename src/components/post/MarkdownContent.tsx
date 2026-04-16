// Markdown 渲染 — 服务端 unified 管道，直接输出 HTML 字符串
// 无需客户端 JS，内容随 SSR HTML 一起下发

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

// 白名单 schema：在默认安全规则基础上，额外放行：
// - iframe（嵌入 YouTube/B站视频）
// - 代码高亮所需的 data-* 属性
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "iframe"],
  attributes: {
    ...defaultSchema.attributes,
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "title"],
    // rehype-slug：放行标题的 id 属性（TOC 锚点跳转必需）
    h2: [...(defaultSchema.attributes?.h2 ?? []), "id"],
    h3: [...(defaultSchema.attributes?.h3 ?? []), "id"],
    h4: [...(defaultSchema.attributes?.h4 ?? []), "id"],
    // 放行 rehype-pretty-code 生成的 data 属性（代码高亮必需）
    code: [...(defaultSchema.attributes?.code ?? []), "data-language", "data-theme"],
    span: [...(defaultSchema.attributes?.span ?? []), "data-line", "style"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "data-language", "data-theme", "style"],
    div: [...(defaultSchema.attributes?.div ?? []), "data-rehype-pretty-code-fragment", "data-language", "style"],
    figure: [...(defaultSchema.attributes?.figure ?? []), "data-rehype-pretty-code-figure", "data-language"],
    figcaption: [...(defaultSchema.attributes?.figcaption ?? []), "data-language", "data-theme"],
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
    // 为标题自动生成锚点 ID（与 TOC 联动）
    .use(rehypeSlug)
    // 代码高亮：在 sanitize 之前运行，使用 github-dark 主题
    .use(rehypePrettyCode, {
      theme: {
        dark: "github-dark",
        light: "github-light",
      },
      keepBackground: true,
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(content);

  return (
    <div
      className="prose prose-lg max-w-none font-serif leading-relaxed"
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
