import type { NextConfig } from "next";

// 最小生产安全头 — 抵御常见 Web 攻击
const securityHeaders = [
  // 禁止 iframe 嵌入（防点击劫持 clickjacking）
  { key: "X-Frame-Options", value: "DENY" },
  // 禁止浏览器嗅探 MIME 类型
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 控制 Referer 泄露
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 强制 HTTPS（HSTS），含子域名，1 年
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // 内容安全策略 CSP：仅允许必要来源，防 XSS 和第三方脚本注入
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 脚本：仅自身 + Next.js 热重载 nonce（inline 脚本由 Next.js 管理）
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // 样式：自身 + inline（Tailwind）+ Google Fonts + 霞鹜文楷（jsDelivr）
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      // 字体：Google Fonts + 霞鹜文楷 CDN
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      // 图片：自身 + Vercel Blob + data URI + 任意 https（Markdown 正文外链图片）
      "img-src 'self' blob: data: https://*.vercel-storage.com https:",
      // iframe 嵌入视频：YouTube + B站
      "frame-src https://www.youtube.com https://player.bilibili.com",
      // 连接：仅自身（API 请求）
      "connect-src 'self'",
    ].join("; "),
  },
  // 禁用浏览器的跨域隔离推断（避免 SharedArrayBuffer 攻击面）
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 对所有路由生效
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
