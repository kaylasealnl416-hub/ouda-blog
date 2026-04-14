import Link from "next/link";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* 品牌 */}
        <Link href="/" className="group">
          <span className="font-display text-xl text-ink group-hover:text-accent transition-colors">
            殴达的博客
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/" className="text-muted hover:text-accent">
            文章
          </Link>
          <Link href="/about" className="text-muted hover:text-accent">
            关于
          </Link>
          <Link
            href="/rss.xml"
            className="text-muted hover:text-accent"
            target="_blank"
          >
            RSS
          </Link>
        </nav>

        {/* 手机端菜单 */}
        <MobileDrawer />
      </div>
    </header>
  );
}
