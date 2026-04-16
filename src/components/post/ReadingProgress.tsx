"use client";

// 阅读进度条 — 页面顶部细线，随滚动推进
// 颜色跟随主题 accent 色

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(pct, 100));
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress(); // 初始化
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5 bg-accent transition-all duration-100 ease-out"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}
