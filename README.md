# Creator ROI Calculator

A public React + TypeScript calculator for exploring creator monetization scenarios across influencer, realtor, educator/coach and YouTube use cases.

## What it calculates

The current implementation uses a transparent heuristic model based on:

- audience size
- engagement rate
- current monthly revenue
- publishing frequency
- email-list presence and size
- creator category

It estimates a monthly/yearly monetization scenario, a revenue gap, a conversion score and a breakdown across affiliate/partnerships, products, sponsorships and services.

## Important limitation

This is a **scenario calculator, not a financial forecast**. The current multipliers and benchmarks are product heuristics in `client/src/hooks/useCalculator.ts`; they are not presented as independently validated market averages. Real results vary by niche, geography, audience quality, offer, pricing and execution.

That transparency is intentional: public contributors can inspect and improve the assumptions instead of treating a black-box number as fact.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS / shadcn UI

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

## Partnership angle

This utility is also a public acquisition surface for future creator-economy and affiliate partnerships in the ONYX / OPTIMATEO ecosystem.

For network-level partnerships and integration contracts, see **ONYX Partner Network**:
https://github.com/pejtr/onyx-partner-network


## Monetization and LEAD OS integration

The free calculator now offers **inquiry-only** paid services: Creator Mini Audit (1 290 Kč) and Revenue Audit Sprint (9 900 Kč). **No checkout is wired and no payment is taken by the calculator.** These are proposed service offers, not verified sales.

The browser posts consented inquiries to same-origin `POST /api/leads`. The Node or Cloudflare Pages server validates fields and relays to the existing LEAD OS `POST /api/leads/ingest` with `X-LEADOS-Key` using a **server-side secret**. The client reports success only when LEAD OS confirms persistence; missing configuration returns an honest error. See [integration and release gates](docs/LEADOS_ROI_INTEGRATION.md).

Start locally with `pnpm dev:server` and `pnpm dev` in two shells; set server-only variables from `.env.example` in the runtime environment (not in client code). Run `pnpm check`, `pnpm test`, and `pnpm build`. The source changes **have not been production-verified**.

## Contributing

Useful contributions include:

- better documented benchmark sources
- alternative scenario models
- country/niche-specific assumptions
- accessibility and UX improvements
- privacy-preserving analytics
- export/share functionality

Do not commit credentials, customer data or private commercial terms.


## Agent handoff

This repository is public. Read `AGENTS.md` and `docs/PUBLIC_REPO_NO_TRUST.md` before non-trivial changes. Public documentation must contain only public-safe information and must not imply production state without verification.
