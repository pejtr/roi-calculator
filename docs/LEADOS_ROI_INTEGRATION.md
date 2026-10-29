# Creator ROI → LEAD OS · revenue acquisition handoff

Status: **source implementation only, not verified on production**. No checkout, guaranteed revenue or automatic email delivery is implied.

## Existing LEAD OS contract
LEAD OS already implements `POST /api/leads/ingest` with the project key in the `X-LEADOS-Key` header, storing an external lead in `ingestedLeads`. This project relays `POST /api/leads` **server-side only**. The browser never sees the project key.

Configure server-side `LEADOS_BASE_URL` (HTTPS origin) and `LEADOS_PROJECT_API_KEY` (active connected-project key). Use `ROI_ALLOWED_ORIGINS` only for exact trusted preview origins. Do not place secrets in client code, public tracker scripts or documentation. No additional DB migration is required in ROI.

Data submitted after explicit consent: name, email, selected service/inquiry, creator category, reported audience size, engagement and monthly revenue, user's challenge, attribution values and page URL. Do not send full chat transcripts. Privacy/retention rules and lawful contact practices apply.

## Revenue flow
1. Free scenario calculation (not a forecast).
2. Transparent paid inquiry: Creator Mini Audit — 1 290 Kč; Revenue Audit Sprint — 9 900 Kč.
3. LEAD OS receives and persists the inquiry, then returns `ok: true`; only then does UI show success.
4. Qualify and contact the lead manually until a verified automated fulfillment flow exists.
5. Checkout and payment remain **not integrated**; do not count inquiries as sales.

## Local / preview test
Run the Vite frontend with `pnpm dev` and Node API separately with `pnpm dev:server`. Vite proxies `/api` to localhost:3001. With unset LEAD OS credentials, valid submissions must show an honest 503 error. With configured credentials and a non-production test project, verify one consented submission end-to-end in LEAD OS inbox, including source and interest; verify invalid payload → 400 and mismatched Origin → 403. Run `pnpm check`, `pnpm test`, `pnpm build`. Test mobile layout, retries and anti-bot rate limits at the edge before production.

## Release gates
- [ ] LEAD OS connection configured via private deployment secrets and active project
- [ ] Local validation and build passing
- [ ] Production POST → LEAD OS inbox verified without real customer PII
- [ ] Real support/contact workflow, privacy policy and processing notice reviewed
- [ ] Edge rate limiting / bot protection configured
- [ ] A working approved payment checkout, if taking money (otherwise only inquiry CTA)
- [ ] Public site hostname and deployment independently verified

No GitHub Actions dependence is needed to run commands locally. Do not merge/deploy without these checks.
