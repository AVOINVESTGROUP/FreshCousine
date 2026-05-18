# FreshCuisine — Cross-Tool Agent Rules

## Language
- Code, comments, documentation, commit messages: English.
- Communication with user: Russian.

## Workflow
1. Read the relevant documentation section BEFORE any implementation.
2. Create an implementation plan and show it BEFORE writing code.
3. Implement one unit at a time (one endpoint, one component, one service).
4. After each unit — verify against documentation.
5. Do not proceed to the next unit until the current one is reviewed.
6. If documentation is incomplete or contradictory — STOP and report.

## Forbidden
- Do NOT implement features, fields, or endpoints not described in project docs.
- Do NOT use `any` in TypeScript.
- Do NOT use TypeScript `enum` — use `as const` objects + union types.
- Do NOT write business logic in route handlers or React components.
- Do NOT read/write Firestore from client apps (except Firebase Auth).
- Do NOT hardcode strings, URLs, monetary values, or API keys.
- Do NOT use `console.log` — use structured logger.
- Do NOT use `moment.js` — use `date-fns` or native `Intl`.
- Do NOT use `var` — only `const` or `let`.
- Do NOT use in-memory rate limiting (Cloud Run is stateless).
- Do NOT use `ml-*`, `mr-*`, `pl-*`, `pr-*` in shared UI components — use logical `ms-*`, `me-*`, `ps-*`, `pe-*`.
- Do NOT send PII (address, phone, payment data) to Vertex AI.
- Do NOT commit `.env`, `node_modules`, or build artifacts.

## Error pattern
- All errors extend `AppError(code, statusCode, messageKey, fallbackMessage, details?)`.
- Frontend renders errors by `messageKey`, not by `message`.

## Naming
- Files: React components PascalCase.tsx, services/lib kebab-case.ts, types kebab-case.ts.
- Code: variables camelCase, types PascalCase, constants UPPER_SNAKE_CASE.
- Firestore: collections snake_case, fields camelCase.
- API: `/v1/kebab-case`.
- i18n keys: `dot.separated.camelCase` (e.g. `errors.quoteExpired`).
