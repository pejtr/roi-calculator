import type { Express, Request, Response } from "express";

export interface ValidLead {
  name: string;
  email: string;
  biggestChallenge: string;
  offer: "consultation" | "mini-audit" | "revenue-sprint";
  creatorType: "influencer" | "realtor" | "educator" | "youtuber";
  website: string;
  pageUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  scenario: { followers: number; engagementRate: number; currentMonthlyRevenue: number };
}

const creatorTypes = ["influencer", "realtor", "educator", "youtuber"] as const;
const offers = ["consultation", "mini-audit", "revenue-sprint"] as const;
const clean = (value: unknown, length: number) => typeof value === "string" ? value.trim().slice(0, length) : "";
const bounded = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;

/** Validation is independent of the network and suitable for offline tests. */
export function parseLead(body: unknown): ValidLead | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const data = body as Record<string, unknown>;
  if (data.consent !== true || clean(data.website, 100)) return null; // consent + honeypot
  const name = clean(data.name, 120);
  const email = clean(data.email, 254).toLowerCase();
  const biggestChallenge = clean(data.biggestChallenge, 500);
  const offer = data.offer;
  const creatorType = data.creatorType;
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !biggestChallenge) return null;
  if (!offers.includes(offer as typeof offers[number]) || !creatorTypes.includes(creatorType as typeof creatorTypes[number])) return null;
  const raw = data.scenario && typeof data.scenario === "object" ? data.scenario as Record<string, unknown> : {};
  const followers = bounded(raw.followers, 0, 2_000_000);
  const engagementRate = bounded(raw.engagementRate, 0, 100);
  const currentMonthlyRevenue = bounded(raw.currentMonthlyRevenue, 0, 100_000_000);
  if (followers === null || engagementRate === null || currentMonthlyRevenue === null) return null;
  return {
    name, email, biggestChallenge,
    offer: offer as ValidLead["offer"], creatorType: creatorType as ValidLead["creatorType"],
    website: "", pageUrl: clean(data.pageUrl, 512),
    utmSource: clean(data.utmSource, 128), utmMedium: clean(data.utmMedium, 128),
    utmCampaign: clean(data.utmCampaign, 128),
    scenario: { followers, engagementRate, currentMonthlyRevenue },
  };
}

export function trustedOrigin(origin: string | undefined, host: string | undefined, allowed: string): boolean {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const extra = allowed.split(",").map(v => v.trim()).filter(Boolean);
    return parsed.host === host || extra.some(v => {
      try { return new URL(v).origin === parsed.origin; } catch { return false; }
    });
  } catch { return false; }
}

export function ingestEndpoint(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const local = ["localhost", "127.0.0.1"].includes(url.hostname);
    if (url.protocol !== "https:" && !(local && url.protocol === "http:")) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    url.pathname = "/api/leads/ingest";
    return url.toString();
  } catch { return null; }
}

/** Never log names, email, lead payloads or project keys. */
export function toIngestPayload(lead: ValidLead) {
  return {
          source: "creator-roi-calculator",
          name: lead.name,
          email: lead.email,
          interest: lead.offer === "mini-audit" ? "Creator monetization mini audit — 1290 CZK (inquiry)" :
                    lead.offer === "revenue-sprint" ? "Revenue Audit Sprint — 9900 CZK (inquiry)" :
                    "Creator monetization consultation (inquiry)",
          url: lead.pageUrl,
          utm_source: lead.utmSource,
          utm_medium: lead.utmMedium,
          utm_campaign: lead.utmCampaign,
          challenge: lead.biggestChallenge,
          creatorType: lead.creatorType,
          scenario: lead.scenario,
          scenarioModel: "creator-roi-heuristic-v1",
          consentAt: new Date().toISOString(),
        };
}

export function registerLeadApi(app: Express) {
  app.post("/api/leads", async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store");
    if (!trustedOrigin(req.get("origin"), req.get("host"), process.env.ROI_ALLOWED_ORIGINS ?? "")) {
      return res.status(403).json({ ok: false, error: "Požadavek nebyl povolen." });
    }
    const lead = parseLead(req.body);
    if (!lead) return res.status(400).json({ ok: false, error: "Zkontrolujte povinné údaje a souhlas." });

    const endpoint = ingestEndpoint(process.env.LEADOS_BASE_URL);
    const key = process.env.LEADOS_PROJECT_API_KEY;
    if (!endpoint || !key || key.length < 8) {
      return res.status(503).json({ ok: false, error: "Příjem poptávek je dočasně nedostupný." });
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-LEADOS-Key": key },
        body: JSON.stringify(toIngestPayload(lead)),
        signal: AbortSignal.timeout(8000),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok || !result || typeof result !== "object" || (result as { ok?: boolean }).ok !== true) {
        return res.status(502).json({ ok: false, error: "Poptávku se nepodařilo uložit. Zkuste to prosím znovu." });
      }
      return res.status(201).json({ ok: true });
    } catch {
      return res.status(502).json({ ok: false, error: "Příjem poptávek nyní neodpovídá. Zkuste to prosím znovu." });
    }
  });
}
