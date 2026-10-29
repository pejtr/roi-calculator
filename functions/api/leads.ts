/**
 * Cloudflare Pages Function for static frontend hosting.
 * Same-origin lead receipt → authenticated LEAD OS ingest.
 * Bind LEADOS_BASE_URL and LEADOS_PROJECT_API_KEY as server-side secrets.
 */
import { ingestEndpoint, parseLead, toIngestPayload, trustedOrigin } from "../../server/leadApi";

interface Env {
  LEADOS_BASE_URL?: string;
  LEADOS_PROJECT_API_KEY?: string;
  ROI_ALLOWED_ORIGINS?: string;
}

type Context = { request: Request; env: Env };
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  const url = new URL(request.url);
  if (!trustedOrigin(request.headers.get("Origin") ?? undefined, url.host, env.ROI_ALLOWED_ORIGINS ?? "")) {
    return json(403, { ok: false, error: "Požadavek nebyl povolen." });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 16384) {
    return json(413, { ok: false, error: "Příliš velký požadavek." });
  }
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return json(400, { ok: false, error: "Neplatný formát." }); }
  const lead = parseLead(data);
  if (!lead) return json(400, { ok: false, error: "Zkontrolujte povinné údaje a souhlas." });
  const endpoint = ingestEndpoint(env.LEADOS_BASE_URL);
  const key = env.LEADOS_PROJECT_API_KEY;
  if (!endpoint || !key || key.length < 8) {
    return json(503, { ok: false, error: "Příjem poptávek je dočasně nedostupný." });
  }
  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-LEADOS-Key": key },
      body: JSON.stringify(toIngestPayload(lead)),
      signal: AbortSignal.timeout(8000),
    });
    const result: unknown = await upstream.json().catch(() => null);
    if (!upstream.ok || !result || typeof result !== "object" || (result as { ok?: boolean }).ok !== true) {
      return json(502, { ok: false, error: "Poptávku se nepodařilo uložit. Zkuste to prosím znovu." });
    }
    return json(201, { ok: true });
  } catch {
    return json(502, { ok: false, error: "Příjem poptávek nyní neodpovídá. Zkuste to prosím znovu." });
  }
}

export function onRequestGet(): Response {
  return json(405, { ok: false, error: "POST required" });
}
