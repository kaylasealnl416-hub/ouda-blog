import path from "node:path";
import { defineConfig } from "prisma/config";

// 线上用 Vercel Postgres，本地用 SQLite
const isPostgres = !!process.env.POSTGRES_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: isPostgres
      ? process.env.POSTGRES_URL!
      : `file:${path.join(__dirname, "prisma", "dev.db")}`,
  },
});
