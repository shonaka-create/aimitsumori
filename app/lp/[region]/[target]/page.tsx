import LandingPage from "../../../page";
import type { Metadata } from "next";

type Props = { params: Promise<{ region: string; target: string }> };

const regionNames: Record<string, string> = { hiroshima: "広島", kyoto: "京都" };
const industryNames: Record<string, string> = { manufacturing: "製造業", construction: "建設・設備工事", wholesale: "卸売業", logistics: "物流・運送業", care: "介護・福祉", travel: "旅行業" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, target } = await params;
  const area = regionNames[region] ?? "地域";
  const industry = industryNames[target] ?? "事業会社";
  const title = `${area}の${industry}向け業務改善・AI活用相談｜ととのえAI`;
  const description = `${area}の${industry}の方向けに、見積もり・受発注・現場連絡などの属人化した業務を整理します。初回相談と概算費用のご案内は無料です。`;
  return { title, description, openGraph: { title, description, type: "website", locale: "ja_JP" } };
}

export function generateStaticParams() {
  return [
    { region: "hiroshima", target: "manufacturing" },
    { region: "hiroshima", target: "construction" },
    { region: "hiroshima", target: "wholesale" },
    { region: "hiroshima", target: "logistics" },
    { region: "hiroshima", target: "care" },
    { region: "hiroshima", target: "travel" },
    { region: "kyoto", target: "manufacturing" },
    { region: "kyoto", target: "construction" },
    { region: "kyoto", target: "wholesale" },
    { region: "kyoto", target: "logistics" },
    { region: "kyoto", target: "care" },
    { region: "kyoto", target: "travel" },
  ];
}

export default async function RegionalLandingPage({ params }: Props) {
  const { region, target } = await params;
  return <LandingPage initialTarget={`${region}-${target}`} />;
}
