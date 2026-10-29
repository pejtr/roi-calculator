import { describe, it, expect } from "vitest";
import { parseLead, trustedOrigin, ingestEndpoint } from "./leadApi";

const valid = {
  name: "Jan Novak", email: "JAN@example.cz", biggestChallenge: "Chci zvýšit prodej",
  consent: true, offer: "mini-audit", creatorType: "educator", website: "",
  scenario: { followers: 4000, engagementRate: 3.5, currentMonthlyRevenue: 15000 },
};

describe("ROI lead ingestion safety", () => {
  it("accepts valid consented inquiry and normalizes email", () => {
    expect(parseLead(valid)?.email).toBe("jan@example.cz");
    expect(parseLead(valid)?.scenario.followers).toBe(4000);
  });
  it("rejects missing consent, honeypot, invalid email and forged model inputs", () => {
    expect(parseLead({ ...valid, consent: false })).toBeNull();
    expect(parseLead({ ...valid, website: "https://spam.invalid" })).toBeNull();
    expect(parseLead({ ...valid, email: "not-an-email" })).toBeNull();
    expect(parseLead({ ...valid, scenario: { ...valid.scenario, engagementRate: Infinity } })).toBeNull();
    expect(parseLead({ ...valid, offer: "free-money" })).toBeNull();
    expect(parseLead({ ...valid, pageUrl: "javascript:alert(1)" })).toBeNull();
  });
  it("removes URL query parameters and fragments before CRM ingestion", () => {
    expect(parseLead({ ...valid, pageUrl: "https://example.com/creator?token=private#hello" })?.pageUrl).toBe("https://example.com/creator");
  });
  it("requires a browser origin and accepts only same-host or exact allowlisted origins", () => {
    expect(trustedOrigin(undefined, "example.com", "")).toBe(false);
    expect(trustedOrigin("https://example.com", "example.com", "")).toBe(true);
    expect(trustedOrigin("https://bad.example", "example.com", "")).toBe(false);
    expect(trustedOrigin("https://preview.example", "example.com", "https://preview.example")).toBe(true);
    expect(trustedOrigin("https://preview.example.attacker", "example.com", "https://preview.example")).toBe(false);
  });
  it("does not allow an untrusted protocol in the server-side destination", () => {
    expect(ingestEndpoint("https://example.com")).toBe("https://example.com/api/leads/ingest");
    expect(ingestEndpoint("http://example.com")).toBeNull();
    expect(ingestEndpoint("http://localhost:3002")).toBe("http://localhost:3002/api/leads/ingest");
  });
});
