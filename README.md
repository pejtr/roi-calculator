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

## Contributing

Useful contributions include:

- better documented benchmark sources
- alternative scenario models
- country/niche-specific assumptions
- accessibility and UX improvements
- privacy-preserving analytics
- export/share functionality

Do not commit credentials, customer data or private commercial terms.
