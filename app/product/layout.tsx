import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "業務を整理する｜ととのえAI",
  description: "困っている業務を対話で整理し、次に仕組み化すべき仕事を見つける、ととのえAIのプロダクト画面です。",
};

export default function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
