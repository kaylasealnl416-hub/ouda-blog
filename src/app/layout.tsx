import type { Metadata } from "next";
import { Inter, Playfair_Display, Source_Serif_4 } from "next/font/google";
import Footer from "@/components/layout/Footer";
import GrainOverlay from "@/components/layout/GrainOverlay";
import "highlight.js/styles/github.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "殴达的博客",
  description: "老登新生，从零开始，保持好奇，持续学习",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${playfair.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink">
        <GrainOverlay />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
