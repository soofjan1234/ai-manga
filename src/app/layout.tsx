import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "AI 漫剧 - 交互式剧情分支漫画生成器",
  description: "用 AI 创作属于你的交互式漫画故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#0f0f1a] bg-mesh">
        <Providers>
          <Navigation />
          <main className="pt-28 pb-12 px-4">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
