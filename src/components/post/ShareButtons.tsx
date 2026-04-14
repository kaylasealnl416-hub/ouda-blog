"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [tip, setTip] = useState("");

  const url = `https://ouda-blog.vercel.app/posts/${slug}`;

  const showTip = (msg: string) => {
    setTip(msg);
    setTimeout(() => setTip(""), 3000);
  };

  const handleShareFriend = async () => {
    await navigator.clipboard.writeText(`${title}\n${url}`);
    showTip("链接已复制，去微信发给朋友吧");
  };

  const handleShareMoments = async () => {
    await navigator.clipboard.writeText(url);
    showTip("链接已复制，去微信朋友圈粘贴分享吧");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    showTip("已复制");
  };

  return (
    <div className="pt-8 mt-8 border-t border-border">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-muted">分享到：</span>

        {/* 发微信给朋友 */}
        <button
          onClick={handleShareFriend}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.203 4.29c-4.413 0-7.99 2.985-7.99 6.668 0 3.683 3.577 6.669 7.99 6.669a9.23 9.23 0 002.218-.272.725.725 0 01.59.083l1.563.916a.277.277 0 00.137.044c.132 0 .24-.108.24-.243 0-.06-.023-.118-.038-.177l-.327-1.233a.485.485 0 01.174-.546C21.879 17.633 22.8 15.927 22.8 14.05c0-3.683-3.578-6.669-7.999-6.669h-.01zm-2.612 3.147c.527 0 .955.434.955.97a.963.963 0 01-.955.97.963.963 0 01-.955-.97c0-.536.428-.97.955-.97zm5.224 0c.527 0 .955.434.955.97a.963.963 0 01-.955.97.963.963 0 01-.955-.97c0-.536.428-.97.955-.97z"/>
          </svg>
          发给朋友
        </button>

        {/* 发朋友圈 */}
        <button
          onClick={handleShareMoments}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 110 16 8 8 0 010-16zm-1.5 3.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm5 2a1 1 0 100 2 1 1 0 000-2zM8.5 12a1 1 0 100 2 1 1 0 000-2zm4.5 1.5c-1.61 0-3.09.59-4.23 1.57a.5.5 0 00.66.75A5.48 5.48 0 0113 14.5c1.33 0 2.55.47 3.5 1.25a.5.5 0 10.63-.78A6.47 6.47 0 0013 13.5z"/>
          </svg>
          发朋友圈
        </button>

        {/* 复制链接 */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border text-muted hover:text-accent hover:border-accent transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          复制链接
        </button>
      </div>

      {/* 提示 */}
      {tip && (
        <p className="text-sm text-green-600 mt-3 animate-pulse">{tip}</p>
      )}
    </div>
  );
}
