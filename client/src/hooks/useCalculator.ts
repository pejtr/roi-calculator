// War Room Calculator Logic — Hormozi Value Equation
// Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort)

export type CreatorType = "influencer" | "realtor" | "educator" | "youtuber";

export interface CalculatorInputs {
  creatorType: CreatorType;
  followers: number;
  engagementRate: number; // %
  currentMonthlyRevenue: number; // CZK
  contentFrequency: number; // posts/week
  hasEmailList: boolean;
  emailListSize: number;
}

export interface CalculatorResults {
  monthlyPotential: number;
  yearlyPotential: number;
  revenueGap: number; // how much left on table
  conversionScore: number; // 0-100
  topOpportunity: string;
  breakdown: {
    label: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  benchmarks: {
    label: string;
    yours: number;
    average: number;
    unit: string;
  }[];
  hormozi: {
    dreamOutcome: number;
    likelihood: number;
    timeDelay: number;
    effort: number;
    valueScore: number;
  };
}

const CREATOR_MULTIPLIERS: Record<CreatorType, {
  revenuePerFollower: number;
  conversionBase: number;
  label: string;
  opportunities: string[];
}> = {
  influencer: {
    revenuePerFollower: 0.08,
    conversionBase: 2.5,
    label: "Influencer",
    opportunities: [
      "Affiliate marketing s provizí 20–40 %",
      "Sponzorované posty (CPM model)",
      "Vlastní digitální produkty",
      "Membership komunita",
    ],
  },
  realtor: {
    revenuePerFollower: 0.25,
    conversionBase: 1.8,
    label: "Realitní makléř",
    opportunities: [
      "Lead generation funnel z obsahu",
      "Online kurz o investicích do nemovitostí",
      "Affiliate provize za hypoteční produkty",
      "Premium konzultace (1:1)",
    ],
  },
  educator: {
    revenuePerFollower: 0.15,
    conversionBase: 3.2,
    label: "Eduktor / Kouč",
    opportunities: [
      "Online kurzy a workshopy",
      "Membership s pravidelným obsahem",
      "1:1 koučink (high-ticket)",
      "Affiliate doporučení nástrojů",
    ],
  },
  youtuber: {
    revenuePerFollower: 0.12,
    conversionBase: 2.0,
    label: "YouTuber",
    opportunities: [
      "YouTube AdSense optimalizace",
      "Affiliate linky v popisku",
      "Sponzorované integrace",
      "Vlastní merch nebo kurzy",
    ],
  },
};

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const m = CREATOR_MULTIPLIERS[inputs.creatorType];
  const engMult = Math.min(inputs.engagementRate / 3, 2.5); // 3% = baseline
  const freqMult = Math.min(inputs.contentFrequency / 3, 1.8);
  const emailMult = inputs.hasEmailList ? 1 + (inputs.emailListSize / inputs.followers) * 0.5 : 1;

  const monthlyPotential = Math.round(
    inputs.followers * m.revenuePerFollower * engMult * freqMult * emailMult
  );

  const yearlyPotential = monthlyPotential * 12;
  const revenueGap = Math.max(0, monthlyPotential - inputs.currentMonthlyRevenue);

  const conversionScore = Math.min(
    100,
    Math.round(
      (inputs.engagementRate / 5) * 30 +
      (inputs.contentFrequency / 7) * 20 +
      (inputs.hasEmailList ? 25 : 0) +
      (inputs.currentMonthlyRevenue > 0 ? 15 : 0) +
      10
    )
  );

  // Revenue breakdown
  const adRevenue = Math.round(monthlyPotential * 0.25);
  const affiliateRevenue = Math.round(monthlyPotential * 0.30);
  const productRevenue = Math.round(monthlyPotential * 0.30);
  const servicesRevenue = Math.round(monthlyPotential * 0.15);

  const breakdown = [
    { label: "Affiliate & Partnerství", value: affiliateRevenue, percentage: 30, color: "#D4AF37" },
    { label: "Vlastní produkty", value: productRevenue, percentage: 30, color: "#B8960C" },
    { label: "Reklama & Sponzoring", value: adRevenue, percentage: 25, color: "#8B6914" },
    { label: "Služby & Konzultace", value: servicesRevenue, percentage: 15, color: "#5C4409" },
  ];

  const benchmarks = [
    {
      label: "Engagement Rate",
      yours: inputs.engagementRate,
      average: 3.0,
      unit: "%",
    },
    {
      label: "Příjem / 1000 followerů",
      yours: Math.round((inputs.currentMonthlyRevenue / inputs.followers) * 1000),
      average: Math.round(m.revenuePerFollower * 1000),
      unit: " Kč",
    },
    {
      label: "Obsah / týden",
      yours: inputs.contentFrequency,
      average: 3,
      unit: "x",
    },
  ];

  // Hormozi Value Equation
  const dreamOutcome = yearlyPotential;
  const likelihood = Math.round(m.conversionBase * engMult * 20);
  const timeDelay = Math.max(1, 6 - inputs.contentFrequency * 0.5);
  const effort = Math.max(1, 5 - (inputs.hasEmailList ? 1 : 0) - (inputs.engagementRate > 3 ? 1 : 0));
  const valueScore = Math.round((dreamOutcome / 10000 * likelihood) / (timeDelay * effort));

  const topOpportunity = m.opportunities[
    revenueGap > monthlyPotential * 0.5 ? 0 : 1
  ];

  return {
    monthlyPotential,
    yearlyPotential,
    revenueGap,
    conversionScore,
    topOpportunity,
    breakdown,
    benchmarks,
    hormozi: { dreamOutcome, likelihood, timeDelay, effort, valueScore },
  };
}

export function formatCZK(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M Kč`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K Kč`;
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return value.toLocaleString("cs-CZ");
}
