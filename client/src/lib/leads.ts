export type CreatorLead = {
  name: string;
  email: string;
  biggestChallenge: string;
  consent: boolean;
  offer: "consultation" | "mini-audit" | "revenue-sprint";
  creatorType: "influencer" | "realtor" | "educator" | "youtuber";
  scenario: { followers: number; engagementRate: number; currentMonthlyRevenue: number };
};

export async function submitCreatorLead(lead: CreatorLead): Promise<void> {
  const tracking = new URLSearchParams(window.location.search);
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...lead, website: "",
      pageUrl: window.location.href,
      utmSource: tracking.get("utm_source") || "",
      utmMedium: tracking.get("utm_medium") || "",
      utmCampaign: tracking.get("utm_campaign") || "",
    }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "Odeslání se nezdařilo. Zkuste to prosím znovu.");
  }
}
