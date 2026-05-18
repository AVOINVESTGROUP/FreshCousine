# FreshCousine — Project Rules & Conventions

> **Версия:** 1.1  
> **Статус:** MVP  
> **Стек:** Next.js 15 + TypeScript | Express + TypeScript | Firebase/Firestore | Stripe | Vertex AI

---

## 0. Source of truth hierarchy

Этот документ регулирует кодстайл, архитектуру и конвенции репозитория. Он не заменяет бизнес-требования и контракты:

1. **TZ_v2.md** — бизнес-требования, модель, scope, acceptance criteria.
2. **STATE_MACHINE.md** — переходы состояний order / payment / procurement / delivery.
3. **FIRESTORE_SCHEMA.md** — контракт базы данных.
4. **API_CONTRACTS.md** — контракт API (request / response / errors / idempotency).
5. **Project Rules & Conventions** (этот документ) — кодстайл, архитектура, i18n, security, CI/CD.

При конфликте: бизнес-флоу по TZ и STATE_MACHINE, код — по этому документу. Если правило не описано ни в одном документе — реализация запрещена до согласования.

---

## 1. Структура репозитория (Monorepo)

```
freshcousine/
├── apps/
│   ├── api/                    # Express API → Cloud Run
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers (thin controllers)
│   │   │   ├── services/       # Business logic (thick services)
│   │   │   ├── middleware/      # Auth, rate-limit, idempotency, error-handler
│   │   │   ├── webhooks/       # Stripe, Pub/Sub, Cloud Tasks handlers
│   │   │   ├── jobs/           # Background job processors
│   │   │   ├── lib/            # Firestore client, Stripe client, Vertex AI client, Maps client
│   │   │   ├── validators/     # Zod schemas for request validation
│   │   │   ├── prompts/        # AI prompt templates (versioned)
│   │   │   └── index.ts        # Express app entry point
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                    # Next.js 15 Customer PWA → Firebase Hosting
│   │   ├── app/
│   │   │   ├── [locale]/       # i18n: /en, /ar, /ru
│   │   │   │   ├── (shop)/     # Route group: catalog, product, cart
│   │   │   │   ├── (checkout)/ # Route group: quote, payment, confirmation
│   │   │   │   ├── (account)/  # Route group: profile, orders, addresses
│   │   │   │   ├── (ai)/      # Route group: text-to-basket, recipes
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx      # Root layout (locale detection + redirect)
│   │   │   └── not-found.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Reusable primitives (Button, Input, Modal, Toast)
│   │   │   ├── layout/         # Header, Footer, Navigation, CartDrawer
│   │   │   ├── product/        # ProductCard, ProductGrid, CategoryFilter
│   │   │   ├── cart/           # CartItem, CartSummary, QuoteBreakdown
│   │   │   ├── checkout/       # PaymentForm, SubstitutionApproval
│   │   │   ├── order/          # OrderStatus, OrderTimeline, TrackingMap
│   │   │   └── ai/            # TextToBasket, RecipeCard, RecipeSuggestions
│   │   ├── messages/           # Translation dictionaries
│   │   │   ├── en.json
│   │   │   ├── ar.json
│   │   │   └── ru.json
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API client, auth helpers, utils
│   │   ├── styles/             # Global CSS, design tokens
│   │   ├── public/             # Static assets, icons, manifest.json
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shopper/                # Shopper/Courier PWA (Next.js light) → Firebase Hosting
│   │   ├── app/
│   │   │   ├── tasks/          # Task list, task detail
│   │   │   ├── procurement/    # At-market flow, item checklist, receipt upload
│   │   │   ├── delivery/       # Navigation, status updates
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── admin/                  # Admin Panel → Firebase Hosting (protected)
│       ├── app/
│       │   ├── products/       # CRUD products + localized content
│       │   ├── markets/        # Markets + vendors
│       │   ├── orders/         # Order management + refunds
│       │   ├── procurement/    # Procurement tasks monitoring
│       │   ├── users/          # Customer / shopper management
│       │   ├── audit-logs/     # Audit trail viewer
│       │   └── layout.tsx
│       ├── components/
│       ├── lib/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # Shared types, constants, validation schemas
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces and types
│   │   │   │   ├── order.ts
│   │   │   │   ├── product.ts
│   │   │   │   ├── payment.ts
│   │   │   │   ├── procurement.ts
│   │   │   │   ├── delivery.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── api.ts      # API response envelope, error shape
│   │   │   │   └── index.ts
│   │   │   ├── constants/      # Status enums, config values, error codes
│   │   │   │   ├── order-status.ts
│   │   │   │   ├── payment-status.ts
│   │   │   │   ├── procurement-status.ts
│   │   │   │   ├── locales.ts  # SUPPORTED_LOCALES, DEFAULT_LOCALE
│   │   │   │   ├── error-codes.ts
│   │   │   │   └── index.ts
│   │   │   ├── validators/     # Zod schemas shared between api and web
│   │   │   └── utils/          # Pure functions (money, dates, ETA, weight)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── i18n/                   # Internationalization utilities
│       ├── src/
│       │   ├── locales.ts      # Locale type, RTL map, fallback chain
│       │   ├── dictionary.ts   # Dictionary loader + cache
│       │   ├── formatters.ts   # formatMoney, formatDateTime, formatWeight, formatEta
│       │   ├── message-keys.ts # Typed message key registry (error keys, UI keys)
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── firebase/
│   ├── firestore.rules         # Security rules (deny all client reads/writes)
│   ├── firestore.indexes.json  # Composite indexes
│   └── firebase.json           # Firebase project config
│
├── docs/                       # Project documentation
│   ├── TZ_v2.md               # Техническое задание
│   ├── API_CONTRACTS.md        # Full API specs
│   ├── STATE_MACHINE.md        # Order lifecycle
│   └── FIRESTORE_SCHEMA.md     # Database schema reference
│
├── .github/                    # CI/CD (GitHub Actions)
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # pnpm workspaces
├── tsconfig.base.json          # Shared TypeScript config
├── .env.example                # Environment variables template
├── .gitignore
└── README.md
```

**Package manager:** pnpm (workspaces).  
**Workspace references:** `@freshcousine/shared`, `@freshcousine/i18n`, `@freshcousine/api`, `@freshcousine/web`, `@freshcousine/shopper`, `@freshcousine/admin`.

---

## 2. Multilingual / i18n

### Scope

| Язык    | Код | Направление | Статус в MVP |
|---------|-----|-------------|-------------|
| English | en  | LTR         | Default, обязателен |
| Arabic  | ar  | RTL         | Обязателен |
| Russian | ru  | LTR         | Обязателен |

- Shopper/Courier PWA: English only в MVP. Архитектура поддерживает расширение.
- Admin Panel: English only. Admin редактирует локализованный контент для customer-facing приложений.

### Locale routing (Customer PWA)

Все customer-facing маршруты содержат locale prefix:

```
/en
/ar
/ru
/en/products/{slug}
/ar/products/{slug}
/ru/products/{slug}
/en/categories/{slug}
/ar/categories/{slug}
```

### Locale resolution

1. Explicit URL locale (`/ar/products/...`).
2. `user.preferredLanguage` (для залогиненных).
3. `Accept-Language` header.
4. Fallback: `en`.

### RTL

- `ar` renders with `dir="rtl"` on `<html>`.
- `en` and `ru` render with `dir="ltr"`.
- Shared UI components используют logical CSS properties:

```css
/* ✅ Правильно — работает и для LTR и для RTL */
margin-inline-start: 1rem;
padding-inline-end: 0.5rem;
text-align: start;

/* ❌ Неправильно — ломает RTL */
margin-left: 1rem;
padding-right: 0.5rem;
text-align: left;
```

- В Tailwind: предпочитать `ms-*`, `me-*`, `ps-*`, `pe-*` вместо `ml-*`, `mr-*`, `pl-*`, `pr-*` в переиспользуемых компонентах `ui/`.
- Icons indicating direction (arrows, chevrons) must be mirrored in RTL.
- Props компонентов: `iconStart` / `iconEnd`, `align="start" | "center" | "end"` — не `left` / `right`.

### Translation files

```
apps/web/messages/en.json
apps/web/messages/ar.json
apps/web/messages/ru.json
```

- User-facing строки не хардкодятся в компонентах.
- Missing translation → fallback to `en`.
- Admin UI показывает предупреждения о пропущенных переводах.

### Localized content (Firestore)

Customer-facing контент хранится в структуре `localized`:

```typescript
// products/{productId}
interface ProductDoc {
  localized: {
    en: { name: string; description: string; slug: string };
    ar: { name: string; description: string; slug: string };
    ru: { name: string; description: string; slug: string };
  };
  defaultUnit: string;
  baseUnit: string;
  handlingType: HandlingType;
  allergens: string[];
  isOrganic: boolean;
  isActive: boolean;
  images: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// categories/{categoryId}
interface CategoryDoc {
  localized: {
    en: { name: string; slug: string };
    ar: { name: string; slug: string };
    ru: { name: string; slug: string };
  };
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}
```

Fallback: если `localized[currentLocale]` отсутствует → использовать `localized.en`.

### SEO (трёхъязычный)

- Каждая публичная product/category страница имеет locale-prefixed URL.
- Каждая локализованная страница включает:
  - `<link rel="canonical">` для текущего locale
  - `<link rel="alternate" hreflang="en">`
  - `<link rel="alternate" hreflang="ar">`
  - `<link rel="alternate" hreflang="ru">`
  - `<link rel="alternate" hreflang="x-default">` → `/en/...`
- `sitemap.xml` содержит все локализованные alternate URLs.
- OpenGraph `title` / `description` используют текущий locale.
- JSON-LD Product fields используют текущий locale.

### Formatting (locale-aware)

Все форматирование — через утилиты в `@freshcousine/i18n`. Никакой ручной конкатенации строк для денег, дат, веса, ETA.

```typescript
// @freshcousine/i18n/src/formatters.ts
formatMoney(amountMinor: number, locale: Locale, currency?: string): string
formatDateTime(date: Date | string, locale: Locale, timeZone?: string): string
formatWeight(value: number, unit: string, locale: Locale): string
formatEta(minMinutes: number, maxMinutes: number, locale: Locale): string
```

---

## 3. Язык и TypeScript

- **Strict mode** обязателен: `"strict": true` в tsconfig.
- **Никаких `any`** — использовать `unknown` + type guards, либо конкретный тип.
- **Type assertions:**
  - `as const` — разрешён для literal const objects.
  - Любые другие `as` assertions — требуют комментарий, почему это безопасно.
  - Предпочитать Zod parsing, type guards и inferred types.
- **Все Firestore-документы типизированы** через интерфейсы в `@freshcousine/shared`.
- **Zod** для runtime-валидации входных данных (API requests, webhook payloads, form inputs).
- **Enums** — только строковые `const` объекты или union types, не TypeScript `enum`:

```typescript
// ✅ Правильно
export const PAYMENT_STATUS = {
  AUTHORIZATION_PENDING: 'AUTHORIZATION_PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
} as const;
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// ❌ Неправильно
enum PaymentStatus { ... }
```

---

## 4. Именование

### Файлы и директории

| Что | Формат | Пример |
|-----|--------|--------|
| React-компоненты | PascalCase.tsx | `ProductCard.tsx` |
| Хуки | camelCase.ts с префиксом use | `useCart.ts` |
| Route handlers (API) | kebab-case.ts | `cart-quote.ts` |
| Services, lib | kebab-case.ts | `stripe-client.ts` |
| Types | kebab-case.ts | `order.ts` |
| Constants | kebab-case.ts | `error-codes.ts` |
| Next.js pages | стандарт App Router | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` |
| Translation files | locale code | `en.json`, `ar.json`, `ru.json` |

### Код

| Что | Формат | Пример |
|-----|--------|--------|
| Переменные, функции | camelCase | `estimatedTotal`, `calculateQuote()` |
| Типы, интерфейсы | PascalCase | `OrderItem`, `PaymentStatus` |
| Константы | UPPER_SNAKE_CASE | `MAX_CART_ITEMS`, `AUTHORIZATION_BUFFER_MULTIPLIER` |
| Firestore collections | snake_case | `market_products`, `procurement_tasks` |
| Firestore fields | camelCase | `estimatedTotalMinor`, `createdAt` |
| API endpoints | kebab-case, versioned | `/v1/cart/quote`, `/v1/checkout/authorize` |
| Environment variables | UPPER_SNAKE_CASE с префиксом | `STRIPE_SECRET_KEY`, `FIREBASE_PROJECT_ID` |
| CSS variables | kebab-case с префиксом `--fc-` | `--fc-color-primary`, `--fc-spacing-md` |
| Message keys (i18n) | dot-separated, camelCase segments | `errors.quoteExpired`, `cart.emptyState` |

---

## 5. API (Express на Cloud Run)

### Структура route handler

```typescript
// routes/cart-quote.ts — THIN controller
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rate-limit';
import { quoteService } from '../services/quote-service';

const router = Router();

const createQuoteSchema = z.object({
  items: z.array(z.object({
    marketProductId: z.string(),
    requestedQty: z.number().positive(),
    requestedUnit: z.string(),
  })).min(1).max(50),
  addressId: z.string(),
  marketId: z.string(),
  substitutionPolicy: z.enum(['ASK_EVERY_TIME', 'ALLOW_SIMILAR', 'REMOVE_UNAVAILABLE'])
    .default('ASK_EVERY_TIME'),
});

router.post(
  '/v1/cart/quote',
  authenticate('customer'),
  rateLimit({ windowMs: 60_000, max: 10 }),
  validate(createQuoteSchema),
  async (req, res, next) => {
    try {
      const quote = await quoteService.createQuote(req.userId, req.validated);
      res.status(201).json({ ok: true, data: quote });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
```

### Правила API

- **Thin controllers, thick services.** Route handler: validate → call service → return. Вся бизнес-логика в `services/`.
- **Все ответы** в формате:

```typescript
// Success
{ ok: true, data: { ... } }

// Error
{
  ok: false,
  error: {
    code: 'QUOTE_EXPIRED',              // Machine-readable, UPPER_SNAKE_CASE
    messageKey: 'errors.quoteExpired',   // i18n key for frontend
    message: 'This quote has expired',   // English fallback only
    details?: { quoteId, expiresAt }     // Optional context
  }
}
```

- **HTTP-коды:** 200 (OK), 201 (Created), 400 (Validation), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict / Idempotency), 429 (Rate Limit), 500 (Internal).
- **Error codes** — строковые, UPPER_SNAKE_CASE: `QUOTE_EXPIRED`, `OUTSIDE_SERVICE_ZONE`, `AUTHORIZATION_FAILED`.
- **Frontend рендерит ошибки по `messageKey`**, не по `message`. `message` — English fallback для debugging/logging.
- **Idempotency:** мутирующие эндпоинты принимают `idempotencyKey` в body (см. раздел Idempotency).
- **Audit logging:** каждое значимое действие пишет в `audit_logs` через `auditService.log(...)`.
- **Нет бизнес-логики в middleware** — middleware только для cross-cutting concerns (auth, validation, rate-limit, error-handling).

### Idempotency storage

```typescript
// Firestore: idempotency_keys/{key}
interface IdempotencyKeyDoc {
  userId: string;
  endpoint: string;
  requestHash: string;       // SHA-256 of normalized request body
  responseBody: unknown;     // Cached response
  statusCode: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;      // TTL: 24h for checkout, 1h for other mutations
}
```

Правила:
- Same key + same user + same endpoint + same requestHash → return cached response.
- Same key + different requestHash → return `409 IDEMPOTENCY_CONFLICT`.
- Expired keys игнорируются (treat as new request).

### Rate limiting

- **Не использовать in-memory rate limiter** в production (Cloud Run = stateless, multiple instances).
- Rate limit state хранится в Firestore-backed counters или Cloud Armor.
- AI и checkout endpoints имеют более строгие лимиты.

---

## 6. Firestore

### Доступ

- **Customer, admin, shopper apps НЕ читают и НЕ пишут в Firestore напрямую.**
- **Все данные проходят через Cloud Run API.**
- **Firebase client SDK** используется ТОЛЬКО для Firebase Auth (получение JWT).
- **Firestore Security Rules** по умолчанию запрещают все client reads и writes:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Любое исключение должно быть задокументировано явно.

### Timestamps

- **Firestore documents** используют `Firestore.Timestamp`.
- **API responses** сериализуют timestamps как `ISO 8601 string`.
- **Shared API DTO types** не должны экспортировать `Firestore.Timestamp` на frontend:

```typescript
// ✅ Shared type for API response (frontend-safe)
interface OrderApiDto {
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

// ✅ Firestore document type (backend only)
interface OrderDoc {
  createdAt: Timestamp;  // firebase-admin/firestore
  updatedAt: Timestamp;
}
```

### Прочие правила

- **Все monetary values в minor units** (1 AED = 100 fils → 15.50 AED = 1550). Тип: `number`. Суффикс: `Minor`.
- **Никаких nested writes глубже 2 уровней.** Subcollections допустимы: `orders/{orderId}/events/{eventId}`.
- **Транзакции** для атомарных обновлений (quote → order, procurement → capture).
- **Optimistic concurrency** через `updatedAt` check где критично.

---

## 7. Платежи (Stripe)

- **Manual capture** — единственный режим. `capture_method: 'manual'`.
- **Webhook — source of truth** для статусов платежа. Никогда не полагаться на client-side return.
- **Webhook idempotency:** проверять `stripe_events/{eventId}` перед обработкой. Дубликаты → `processingStatus: 'IGNORED'`.
- **Сумма авторизации** = `maxAuthorizedAmountMinor` из quote. Не больше, не меньше.
- **Capture** = `finalTotalMinor`. Capture blocked если `finalTotalMinor > authorizedAmountMinor`.
- **Currency:** `'aed'` (Stripe lowercase). Все суммы в minor units (fils).
- **Никаких Stripe-ключей в клиентском коде.** Только `publishableKey` для Stripe Elements.
- **PaymentIntent metadata:** `{ orderId, quoteId, userId }` — для reconciliation.

### Stripe webhook route (Express)

```typescript
// КРИТИЧНО: raw body ПЕРЕД json parser для signature verification
app.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),  // Raw body first
  stripeWebhookHandler
);

// Все остальные routes используют стандартный json parser
app.use(express.json());
```

Порядок обработки webhook:
1. Verify Stripe signature с raw body.
2. Parse event.
3. Check `stripe_events/{eventId}` — если уже processed, return `200 OK`.
4. Store event в `stripe_events` с `processingStatus: 'PROCESSING'`.
5. Apply state transition.
6. Update `processingStatus: 'PROCESSED'`.
7. Return `200 OK`.

---

## 8. Frontend (Next.js 15 — App Router)

### Архитектура

- **Server Components по умолчанию.** `'use client'` только когда нужен state, effects, или browser APIs.
- **Locale-based routing:** `app/[locale]/(shop)/...` — все customer-facing pages под `[locale]`.
- **Route groups** `(shop)`, `(checkout)`, `(account)`, `(ai)` для логической организации без влияния на URL.
- **`loading.tsx`** для каждого route group — skeleton screens.
- **`error.tsx`** для каждого route group — graceful error boundaries.
- **API calls** только через централизованный клиент в `lib/api-client.ts`. Никаких `fetch()` напрямую в компонентах.
- **Нет прямого импорта Firebase SDK на клиенте** (кроме Firebase Auth для session). Все данные через API.

### State management

- **Server state:** API calls через React Query (TanStack Query) с кешированием и invalidation.
- **Client state:** React Context для cart, user preferences, current locale. Zustand если Context недостаточно.
- **Никаких Redux, MobX** — overkill для MVP.
- **Cart** хранится в localStorage + синхронизируется с Firestore для залогиненных.

### Стилизация

- **Tailwind CSS** — primary styling.
- **CSS variables** для design tokens: `--fc-color-primary: #059669`, `--fc-color-surface: #18181b`, и т.д.
- **Тема:** dark by default (как в концепте), light theme — post-MVP.
- **Никаких inline styles** кроме динамических значений.
- **Компоненты `ui/`** — переиспользуемые, бесстилевые по бизнес-логике, стилизованные через variants (cva/class-variance-authority).
- **RTL-safe**: все `ui/` компоненты используют logical CSS properties (см. раздел i18n / RTL).

### Компоненты

```typescript
// ✅ Правильно — типизированные props, i18n-ready
interface ProductCardProps {
  product: ProductSummary;
  locale: Locale;
  onAddToCart: (productId: string) => void;
  className?: string;
}

export function ProductCard({ product, locale, onAddToCart, className }: ProductCardProps) {
  const name = product.localized[locale]?.name ?? product.localized.en.name;
  // ...
}

// ❌ Неправильно — any, хардкод языка
export function ProductCard({ product, onAdd }: any) {
  return <h2>{product.name}</h2>; // no locale fallback
}
```

---

## 9. AI-модули (Vertex AI / Gemini)

- **Все AI-запросы через API** — клиент никогда не вызывает Vertex AI напрямую.
- **Structured output** (JSON mode) — обязателен. Zod-схема для валидации ответа.
- **Prompt versioning** — каждый промпт хранится как template с версией в `api/src/prompts/`.
- **AI никогда не возвращает:** finalPrice, paymentUrl, guaranteed availability, personal data.
- **Fallback:** если AI-ответ невалидный (не проходит Zod), возвращаем ошибку, не пытаемся "починить" ответ.
- **Logging:** каждый AI-запрос → `ai_requests` с `promptVersion`, `model`, `latencyMs`, `tokenUsage`, `success`.
- **Rate limit:** per user, отдельный от основного API. Stricter limits.

### AI locale handling

- AI-запрос включает `locale: 'en' | 'ar' | 'ru'`.
- Structured keys (dish names, ingredient IDs) остаются на English.
- User-facing text (dish descriptions, warnings, suggestions) генерируется на запрошенном locale.
- AI не должен определять locale из свободного текста, если `user.preferredLanguage` задан.
- Unsupported locale → fallback to `en`.

```typescript
// Пример AI response с locale: 'ru'
{
  locale: 'ru',
  dishes: [
    { name: 'Греческий салат', confidence: 0.94 }
  ],
  marketWarnings: [
    {
      type: 'availability_not_guaranteed',
      message: 'Наличие, точный вес и финальная цена будут подтверждены на рынке.'
    }
  ]
}
```

### AI PII policy

- **Не отправлять** в Vertex AI: полный адрес, номер квартиры, телефон, платёжные данные, raw receipt text, точную геолокацию курьера.
- **Допустимо отправлять:** diet preferences, allergens, locale, anonymous product selection.
- `ai_requests.inputHash` хранится по умолчанию (не raw input).
- Raw AI input retention: max 30 дней (если не требуется для debugging).
- AI logs не содержат payment data или full address.

---

## 10. Безопасность

- **Firebase Auth** — единственный провайдер аутентификации. JWT в `Authorization: Bearer <token>`.
- **App Check** — обязателен для всех API-вызовов с клиента. Реализация: reCAPTCHA Enterprise (web).
- **RBAC:** 4 роли — `customer`, `admin`, `support`, `shopper_courier`. Проверка в middleware.
- **Никаких секретов в коде.** Все через environment variables / Secret Manager.
- **CORS:** whitelist конкретных доменов (Firebase Hosting URLs).
- **Helmet.js** для HTTP security headers.
- **Input validation** на каждом эндпоинте (Zod). Reject first, process later.
- **Sanitized projections** — клиент получает только то, что ему положено видеть. Серверные поля не утекают.

### Cloud Tasks / Pub/Sub handlers

- **Обязательна service-to-service authentication** (OIDC token verification).
- Public unauthenticated access запрещён.
- Handlers идемпотентны.
- Task payload валидируется через Zod.
- Изменения бизнес-состояния пишут audit/event logs.

### PII в логах

- Logs не содержат: полные адреса, телефоны, платёжные данные, raw receipt text.
- Допустимо логировать: userId, orderId, quoteId, status transitions, amounts.
- Log retention policy: 30 дней в Cloud Logging, export в BigQuery для аналитики.

---

## 11. Error handling

```typescript
export class AppError extends Error {
  constructor(
    public code: string,           // QUOTE_EXPIRED, OUTSIDE_SERVICE_ZONE
    public statusCode: number,     // HTTP status
    public messageKey: string,     // i18n key: 'errors.quoteExpired'
    public fallbackMessage: string,// English fallback for logs/debugging
    public details?: unknown,      // Optional context
  ) {
    super(fallbackMessage);
    this.name = 'AppError';
  }
}

// Использование в сервисах
throw new AppError(
  'QUOTE_EXPIRED',
  400,
  'errors.quoteExpired',
  'This quote has expired',
  { quoteId, expiresAt }
);

// Глобальный error handler в Express
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: {
        code: err.code,
        messageKey: err.messageKey,
        message: err.fallbackMessage,
        details: err.details,
      },
    });
  } else {
    logger.error('Unhandled error', { err, requestId: req.id });
    res.status(500).json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        messageKey: 'errors.internalError',
        message: 'Something went wrong',
      },
    });
  }
});
```

---

## 12. Тестирование (MVP-уровень)

- **Unit tests** для сервисов (quote calculation, payment logic, substitution rules) — Vitest.
- **Integration tests** для API endpoints — Supertest + Vitest.
- **Stripe mock** через `stripe-mock` или manual mocks для webhook handlers.
- **Firestore emulator** для integration tests.
- **Минимальный порог:** все payment flows + substitution flows + procurement state transitions.
- **MVP smoke E2E** (Playwright) — обязательный минимум:
  - quote → checkout authorization → procurement complete → capture → delivered (happy path).
  - quote → authorization → procurement failure → cancellation → refund.
  - substitution flow: item unavailable → customer notified → approved/rejected.
- **Full E2E suite** — post-MVP.

---

## 13. Git & CI/CD

- **Branch model:** `main` (production), `develop` (integration), `feature/*`, `fix/*`.
- **Commits:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- **PR обязательны** для merge в `develop` и `main`.
- **CI pipeline:** lint → typecheck → test → build. Fail = no merge.
- **Deploy:**
  - `api` → Cloud Run (via Cloud Build or GitHub Actions + `gcloud run deploy`)
  - `web` → Firebase Hosting (via `firebase deploy --only hosting:web`)
  - `shopper` → Firebase Hosting (via `firebase deploy --only hosting:shopper`)
  - `admin` → Firebase Hosting (via `firebase deploy --only hosting:admin`)

---

## 14. Environment variables

```bash
# .env.example — НИКОГДА не коммитить .env с реальными значениями

# Firebase
FIREBASE_PROJECT_ID=freshcousine-mvp
FIREBASE_REGION=me-central1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vertex AI
VERTEX_AI_PROJECT=freshcousine-mvp
VERTEX_AI_LOCATION=me-central1
VERTEX_AI_MODEL=gemini-2.5-flash

# Google Maps
GOOGLE_MAPS_API_KEY=...

# App
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
NODE_ENV=development

# i18n
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,ar,ru
```

---

## 15. Запреты (что Antigravity НЕ должен делать)

- ❌ Не использовать `any` в TypeScript
- ❌ Не использовать TypeScript `enum` (только const objects + union types)
- ❌ Не писать бизнес-логику в route handlers или React components
- ❌ Не делать прямые Firestore reads/writes с клиента
- ❌ Не хардкодить monetary values, URLs, ключи, строки UI
- ❌ Не использовать `console.log` — только structured logger
- ❌ Не создавать файлы без типизации props/params
- ❌ Не игнорировать error handling (каждый async — в try/catch или .catch)
- ❌ Не хранить state в глобальных переменных на сервере (Cloud Run = stateless)
- ❌ Не использовать `moment.js` — только `date-fns` или native `Intl`
- ❌ Не использовать `var` — только `const` (предпочтительно) или `let`
- ❌ Не коммитить `.env`, node_modules, build artifacts
- ❌ Не использовать `ml-*`, `mr-*`, `pl-*`, `pr-*` в переиспользуемых UI компонентах (только logical `ms-*`, `me-*`, `ps-*`, `pe-*`)
- ❌ Не хардкодить user-facing strings в компонентах (всё через i18n message keys)
- ❌ Не отправлять PII (адрес, телефон, платёжные данные) в Vertex AI
- ❌ Не использовать in-memory rate limiter в production
- ❌ Не экспортировать `Firestore.Timestamp` в frontend-facing types
