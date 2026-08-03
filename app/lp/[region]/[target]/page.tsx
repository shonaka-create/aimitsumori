import LandingPage from "../../../page";

type Props = { params: Promise<{ region: string; target: string }> };

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
