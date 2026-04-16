// robots.txt — 告诉爬虫哪些页面可以抓取
// 访问路径：/robots.txt

import type { MetadataRoute } from "next";

const BASE_URL = "https://ouda-blog.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 后台和 API 不对爬虫开放
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
