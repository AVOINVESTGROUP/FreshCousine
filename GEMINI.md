# FreshCuisine — Antigravity Project Rules

## Project
- **Brand:** FreshCuisine — AI-powered fresh market delivery, Dubai.
- **Model:** Direct Market Fulfillment. No warehouse. Shopper buys at market, delivers to customer.
- **Stack:** Next.js 15 (App Router) + Express + TypeScript + Firestore + Stripe + Vertex AI (Gemini 2.5 Flash) + Google Maps Routes API.
- **GCP Project:** `freshcuisine`, region `me-central1`.
- **Monorepo:** pnpm workspaces. `apps/api`, `apps/web`, `apps/shopper`, `apps/admin`, `packages/shared`, `packages/i18n`.

## Critical Rules
- **Documentation-first.** Do NOT implement anything not described in `docs/`. If a feature, field, endpoint, or behavior is missing from documentation — STOP and report the gap. Do not infer or fill by analogy.
- **One unit at a time.** Implement one endpoint, one component, or one service per task. Show implementation plan before writing code. Wait for review before proceeding.
- **No assumptions.** If requirements are ambiguous — ask, do not guess. Propose 2-3 options with tradeoffs.

## Code Style (summary — details in .agents/rules/)
- TypeScript strict mode. No `any`. No TS `enum` (use const objects).
- Thin controllers in routes, thick logic in services.
- Zod for all input validation. AppError for all error handling.
- All monetary values in minor units (AED fils). Suffix: `Minor`.
- i18n: EN/AR/RU. Locale-prefixed routes. Logical CSS (no hardcoded left/right).
- Firestore via Admin SDK only. No client reads/writes.

## Documentation hierarchy
1. `docs/TZ_v2.md` — business requirements
2. `docs/STATE_MACHINE.md` — state transitions
3. `docs/FIRESTORE_SCHEMA.md` — database contract
4. `docs/API_CONTRACTS.md` — API contract
5. `docs/RULES.md` — full code conventions

## Terminal limitation
This environment cannot execute terminal commands. When a task requires shell commands (install, deploy, migrate), output the exact commands for the user to run manually.
