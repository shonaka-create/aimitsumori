import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "無料AI見積もり｜困りごとから業務ツールをご提案",
  description: "何を作るか決まっていなくても大丈夫。地域企業の困りごとを伺い、必要な仕組み・概算費用・画面イメージまで無料で整理します。",
  keywords: ["AI見積もり", "業務改善", "システム開発", "DX", "地方企業"],
  openGraph: { title: "会話型AI見積もりツール", description: "その困りごと、ツールにできるか無料で見積もります。", type: "website", locale: "ja_JP" },
  twitter: { card: "summary", title: "会話型AI見積もりツール", description: "地域企業のための、伴走型AI業務改善" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
