import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "無料業務改善・概算相談｜会話型AI見積もり",
  description: "見積もり・受発注・現場連絡など、担当者に頼りがちな業務を整理します。地域企業向けの初回相談と概算費用のご案内は無料です。",
  keywords: ["業務改善", "AI活用", "概算見積もり", "システム開発", "DX", "地方企業"],
  openGraph: { title: "無料業務改善・概算相談｜会話型AI見積もり", description: "人が辞めても、仕事が止まらない会社へ。地域企業の業務改善を無料で整理します。", type: "website", locale: "ja_JP" },
  twitter: { card: "summary", title: "無料業務改善・概算相談｜会話型AI見積もり", description: "地域企業のための、伴走型AI業務改善" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
