"use client";

// 文章目录 TOC — 客户端组件，滚动时高亮当前章节
// 仅在 lg 及以上屏幕显示（sticky 侧边栏）

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 找到第一个进入视口的标题
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      }
    );

    // 监听所有标题元素
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null; // 不足 2 个标题不展示

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
          目录
        </p>
        <ul className="space-y-1 text-sm border-l border-border">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                className={item.level === 3 ? "pl-4" : "pl-2"}
              >
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className={`block py-0.5 pr-2 border-l-2 -ml-px transition-colors leading-snug ${
                    isActive
                      ? "border-accent text-accent font-medium"
                      : "border-transparent text-muted hover:text-ink hover:border-muted"
                  }`}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
