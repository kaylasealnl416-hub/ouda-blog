"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_META, type Category } from "@/data/posts";

const navLinks = [
  { href: "/", label: "全部文章" },
  ...Object.entries(CATEGORY_META).map(([key, val]) => ({
    href: `/?category=${key}`,
    label: `${val.emoji} ${val.label}`,
  })),
  { href: "/about", label: "关于" },
];

export default function MobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 汉堡按钮 */}
      <button
        className="md:hidden p-2 text-ink"
        onClick={() => setOpen(true)}
        aria-label="打开菜单"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* 遮罩层 */}
      {open && (
        <div
          className="drawer-backdrop fixed inset-0 bg-black/20 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* 抽屉面板 */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-paper z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6">
          {/* 关闭按钮 */}
          <button
            className="mb-8 p-2 text-muted hover:text-ink"
            onClick={() => setOpen(false)}
            aria-label="关闭菜单"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* 导航链接 */}
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg text-ink hover:text-accent py-2 border-b border-border-light"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
