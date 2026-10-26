import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日见识 · 每天多懂一点",
  description: "从生活常识到专业通识，把世界看明白一点。每日见识 Jianshi Daily，收藏值得留下的知识。",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
