// 数据库种子：将假数据灌入 SQLite

import { posts } from "../src/data/posts";

// 动态导入 Prisma Client（ESM 兼容）
const { PrismaClient } = await import("../src/generated/prisma/client.js");
const prisma = new PrismaClient();

async function main() {
  console.log("开始灌入种子数据...");

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: JSON.stringify(post.tags),
        readingTime: post.readingTime,
        published: true,
        createdAt: new Date(post.date),
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: JSON.stringify(post.tags),
        readingTime: post.readingTime,
        published: true,
        createdAt: new Date(post.date),
      },
    });
    console.log(`  ✓ ${post.title}`);
  }

  console.log(`\n种子数据灌入完成，共 ${posts.length} 篇文章。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
