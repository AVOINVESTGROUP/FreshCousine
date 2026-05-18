# ТЗ: FreshCousine v2 — Direct Market Fulfillment (Дубай)

**Версия:** 2.4 (final implementation patch)  
**Дата:** 13 мая 2026  
**Стек:** Google экосистема (Firebase + Cloud Run + Gemini + Routes API + Stripe)  
**Статус:** Готово к передаче команде как рабочее MVP-ТЗ

---

## 1. Прямое указание по модели

Проект **не имеет склада**, **не хранит товарные остатки**, **не резервирует stock** и **не выполняет складскую сборку**.  
Доставка осуществляется напрямую с рынка (Direct Market Fulfillment).

**Модель:**
1. Пользователь формирует корзину.
2. Система рассчитывает предварительную (estimated) стоимость.
3. Stripe авторизует максимальную сумму (estimatedTotal * 1.15).
4. Shopper/courier закупает товары на рынке.
5. Фактический вес/количество/цена фиксируются после закупки.
6. Система рассчитывает финальную сумму.
7. Если finalTotal ≤ maxAuthorized — выполняется capture.
8. Если finalTotal > maxAuthorized — требуется approval клиента или замена/удаление товаров.
9. Запуск доставки клиенту.

---

## 2. MVP Scope (Direct Market Fulfillment)

**Включено:**
- B2C, 1–2 зоны (Marina/JLT + Downtown)
- 100–200 SKU с estimated availability, handlingType, estimated price range
- Каталог, поиск, фильтры, market availability warnings
- Корзина + Quote Calculation (estimated total + maxAuthorizedAmount)
- Payment authorization (Stripe manual capture)
- Market procurement: shopper/courier flow, receipt upload, actual qty/weight/price input
- Substitution policy (ASK_EVERY_TIME default)
- Delivery: market-to-customer ETA + tracking
- AI: Text-to-Basket + Recipe Engine (с marketWarnings)
- Admin: products, markets, vendors, availability, procurement tasks, orders, refunds
- Shopper/Courier PWA

**Критерий успеха MVP:**
- 80% заказов доставлено в promised ETA **включая время закупки на рынке**

**Out of Scope:**
- Рестораны, офисы, bulk
- Полноценный fleet optimization
- Нутриенты
- Полная offline checkout
- 99.9% availability как обязательство
- RU/AR в MVP

---

## 3. Архитектура

```
Customer PWA (Next.js + TypeScript)
  ↓
Firebase Hosting + CDN
  ↓
Cloud Run API (Node.js/TypeScript)
  - Auth + App Check + Rate limits + Idempotency
  ↓
Firestore (quotes, products, categories, markets, vendors, market_products, price_snapshots, availability_observations, procurement_tasks, orders, payments, purchase_receipts, stripe_events, users, addresses, carts, service_zones, couriers, delivery_assignments, procurement_capacity_reservations, audit_logs)
  ↓
Vertex AI (Gemini 2.5 Flash) — structured output + function calling
  ↓
Google Maps Routes API — market → customer ETA
  ↓
Stripe — manual authorization → final capture
  ↓
Cloud Tasks / Pub/Sub — payment authorization timeout, procurement timeout, customer approval timeout, notifications
  ↓
Cloud Logging + Error Reporting + BigQuery
```

**Регион:** me-central1 (Doha)

**Frontend choice:** Next.js + TypeScript (лучше SEO, SSR, routing, auth session handling и деплоя на Firebase Hosting / Cloud Run).

---

## 4. Firestore схема (полная, финальная)

```text
quotes/{quoteId}
  userId
  marketId
  zoneId
  addressId

  items[] {
    marketProductId
    productId
    requestedQty
    requestedUnit
    estimatedUnitPriceMinor
    estimatedLineTotalMinor
    substitutionAllowed
    availabilityStatus
    warnings[]
  }

  estimatedSubtotalMinor
  estimatedDeliveryFeeMinor
  estimatedServiceFeeMinor
  estimatedTotalMinor
  maxAuthorizedAmountMinor

  warnings[]
  substitutionPolicy

  status                  // ACTIVE | USED | EXPIRED | CANCELLED
  expiresAt
  usedAt
  createdAt
  updatedAt

products/{productId}
  name, slug, categoryId, description, images[], defaultUnit, baseUnit, handlingType, allergens[], isOrganic, isActive, createdAt, updatedAt

categories/{categoryId}
  name, parentId, sortOrder, isActive

markets/{marketId}
  name, location, lat, lng, operatingHours, isActive

vendors/{vendorId}
  name, marketId, tradeLicenseDoc, contactPhone, isActive

market_products/{marketProductId}
  productId
  marketId
  vendorId

  estimatedMinPriceMinor
  estimatedMaxPriceMinor
  estimatedUnit

  priceMode               // FIXED | VARIABLE_WEIGHT
  estimatedWeightMin
  estimatedWeightMax

  availabilityStatus      // LIKELY_AVAILABLE | CONFIRM_REQUIRED | UNAVAILABLE_TODAY | SEASONAL
  lastObservedAt
  isActive

price_snapshots/{snapshotId}
  marketProductId
  observedPriceMinor
  observedUnit
  observedAt
  validFrom
  validTo
  source                  // admin | shopper | receipt | vendor_message

availability_observations/{observationId}
  marketProductId, availabilityStatus, observedBy, observedAt, note

procurement_tasks/{taskId}
  orderId, shopperCourierId, status (NOT_STARTED | ASSIGNED | AT_MARKET | BUYING | NEEDS_APPROVAL | PURCHASED | FAILED | CANCELLED), marketId, assignedAt, completedAt

procurement_tasks/{taskId}/items/{itemId}
  orderItemId
  requestedQty
  requestedUnit
  estimatedUnitPriceMinor

  purchasedQty
  purchasedUnit
  purchasedWeight

  finalUnitPriceMinor
  finalLineTotalMinor

  vendorId
  receiptPhotoUrl
  shopperNote
  substitutionStatus

purchase_receipts/{receiptId}
  procurementTaskId, orderId, photoUrl, ocrText, uploadedBy, uploadedAt, receiptTotalMinor, currency, marketId, vendorId,
  reconciliationStatus (MATCHED | MISMATCHED | NEEDS_REVIEW), reviewedBy, reviewedAt

orders/{orderId}
  userId, marketId, sourceType: "MARKET_DIRECT",
  status,                          // derived aggregate view from paymentStatus + procurementStatus + deliveryStatus
  paymentStatus (AUTHORIZATION_PENDING | AUTHORIZED | CAPTURED | AUTHORIZATION_FAILED | AUTHORIZATION_EXPIRED | CAPTURE_FAILED | CANCELLED | PARTIALLY_REFUNDED | REFUNDED),
  procurementStatus (NOT_STARTED | ASSIGNED | AT_MARKET | BUYING | NEEDS_APPROVAL | PURCHASED | FAILED | CANCELLED),
  deliveryStatus (NOT_STARTED | READY_FOR_DELIVERY | PICKED_UP_FROM_MARKET | OUT_FOR_DELIVERY | DELIVERED | FAILED | CANCELLED),

  items[] {
    orderItemId
    marketProductId
    productId
    nameSnapshot

    priceMode               // FIXED | VARIABLE_WEIGHT

    requestedQty
    requestedUnit

    estimatedWeightMin
    estimatedWeightMax

    purchasedQty
    purchasedUnit
    purchasedWeight

    estimatedUnitPriceMinor
    estimatedLineTotalMinor

    finalUnitPriceMinor
    finalLineTotalMinor

    substitutionStatus      // NONE | REQUIRED | APPROVED | REJECTED | AUTO_ALLOWED | REMOVED
    vendorId
    shopperNote
  },

  estimatedSubtotalMinor, estimatedDeliveryFeeMinor, estimatedServiceFeeMinor, estimatedTotalMinor, maxAuthorizedAmountMinor,
  finalSubtotalMinor, finalDeliveryFeeMinor, finalServiceFeeMinor, finalTotalMinor,
  taxMinor, taxInvoiceId,
  substitutionPolicy, addressSnapshot, etaMin, etaMax, idempotencyKey, createdAt, updatedAt

orders/{orderId}/events/{eventId}
  type, actorType, actorId, payload, createdAt

payments/{paymentId}
  orderId, provider: "stripe", providerPaymentIntentId, providerCheckoutSessionId,
  status (AUTHORIZATION_PENDING | AUTHORIZED | CAPTURED | AUTHORIZATION_FAILED | AUTHORIZATION_EXPIRED | CAPTURE_FAILED | CANCELLED | PARTIALLY_REFUNDED | REFUNDED),
  authorizedAmountMinor,           // equals maxAuthorizedAmountMinor from quote at authorization time
  capturedAmountMinor,
  refundedAmountMinor,
  currency: "AED", createdAt, updatedAt

stripe_events/{eventId}
  type, paymentIntentId, checkoutSessionId, orderId, processingStatus (PROCESSED | IGNORED | FAILED), rawPayloadHash, processedAt, errorMessage, createdAt

users/{uid}
  name, email, phone, preferredLanguage, dietPreferences[], allergies[], createdAt, updatedAt

users/{uid}/addresses/{addressId}
  label, building, apartment, street, area, city, lat, lng, deliveryInstructions, isDefault

carts/{uid}
  items[] {marketProductId, productId, requestedQty, requestedUnit, substitutionAllowed}, deliveryAddressId, substitutionPolicy, updatedAt

service_zones/{zoneId}
  name, marketId, polygon, minOrderMinor, deliveryFeeMinor, serviceFeeMinor, promisedEtaMin, promisedEtaMax, isActive

couriers/{courierId}
  name, phone, role: "shopper_courier", status, currentLat, currentLng, updatedAt

delivery_assignments/{assignmentId}
  orderId
  courierId
  marketId
  status                  // ASSIGNED | READY_FOR_PICKUP | PICKED_UP_FROM_MARKET | OUT_FOR_DELIVERY | DELIVERED | FAILED | CANCELLED
  pickupEta
  dropoffEta
  lastKnownLat
  lastKnownLng
  lastLocationAt

procurement_capacity_reservations/{reservationId}
  orderId, marketId, zoneId, status (ACTIVE | COMMITTED | RELEASED | EXPIRED), expiresAt, createdAt, committedAt, releasedAt

audit_logs/{logId}
  actorType, actorId, action, targetCollection, targetId, payload, createdAt

ai_requests/{requestId}
  userId, type, promptVersion, model, inputHash, outputJson, latencyMs, tokenUsage, success, createdAt
```

---

## 5. Правила (Direct Market Fulfillment)

- Клиент не пишет напрямую в orders, payments, procurement_tasks, purchase_receipts.
- Backend рассчитывает только estimated quote.
- Точное наличие и финальная цена не гарантируются до закупки на рынке.
- Payment authorization создаётся до закупки. authorizedAmountMinor в payments всегда равен maxAuthorizedAmountMinor из quotes на момент авторизации.
- Final capture выполняется только после ввода фактически купленных товаров.
- Если finalTotalMinor ≤ maxAuthorizedAmountMinor — backend выполняет capture.
- Если finalTotalMinor > maxAuthorizedAmountMinor — требуется customer approval или замена/удаление.
- Каждое изменение статуса пишет событие в orders/{orderId}/events.
- Stripe webhooks обрабатываются идемпотентно через stripe_events/{eventId}.
- orders.status является derived aggregate view. Source of truth: paymentStatus, procurementStatus, deliveryStatus. Backend обновляет orders.status только как projection для UI/admin filtering.
- POST /v1/checkout/authorize принимает только ACTIVE quote, принадлежащий текущему пользователю и не просроченный.
- После успешного создания заказа quote.status становится USED.
- Expired quotes не могут быть использованы для авторизации платежа.
- procurement_tasks/{taskId}/items/{itemId}.orderItemId должен ссылаться на существующий orders/{orderId}.items[].orderItemId.

---

## 6. AI-модули (с marketWarnings)

**Text-to-Basket pipeline:**
intent extraction → dish decomposition → ingredient normalization → SKU matching against catalog → quantity estimation → allergy/diet validation → market availability estimation → estimated price range calculation → substitution policy selection → structured output with warnings → user confirmation screen → payment authorization → market procurement.

**Structured output добавляет:**
- substitutionAllowed
- marketWarnings (включая «Final availability, exact weight, and final price will be confirmed at the market»)

**Acceptance criteria:**
- JSON validity ≥99%
- servings detection ≥90%
- ingredient extraction F1 ≥85%
- SKU match top-3 ≥95%
- allergy warning recall ≥95%
- AI никогда не возвращает final price / paymentUrl / finalOrder / guaranteed availability
- items с UNAVAILABLE_TODAY блокируются или помечаются unavailable
- items с CONFIRM_REQUIRED показывают market confirmation warning

---

## 7. Платежи (manual authorization → final capture)

**Flow:**
User confirms estimated basket → Backend validates zone + market estimate → Calculates estimated total + maxAuthorizedAmountMinor (estimatedTotal * 1.15) → Creates order (PAYMENT_AUTHORIZATION_PENDING) → Creates Stripe Checkout/PaymentIntent with manual capture → User authorizes → Webhook confirms authorization → Order → PAYMENT_AUTHORIZED → Procurement task assigned → Shopper buys at market → Backend calculates finalTotal → Capture (if within max) or customer approval → Delivery starts.

**Customer copy:**
«Estimated total: AED X. Authorized maximum: AED Y. Final amount will be confirmed after market purchase. You will not be charged above the authorized maximum without approval.»

**Правило:**
Stripe authorization amount must equal maxAuthorizedAmountMinor from the quote.  
payments.authorizedAmountMinor must equal orders.maxAuthorizedAmountMinor.  
Final capture amount must equal orders.finalTotalMinor.  
Final capture amount must be ≤ payments.authorizedAmountMinor.  
If finalTotalMinor > authorizedAmountMinor, backend must not capture automatically.

---

## 8. Доставка (новый lifecycle)

**Lifecycle:**
CART_ACTIVE → QUOTE_ESTIMATED → PAYMENT_AUTHORIZATION_PENDING → PAYMENT_AUTHORIZED → MARKET_PROCUREMENT_ASSIGNED → SHOPPER_AT_MARKET → PROCUREMENT_IN_PROGRESS → MARKET_PURCHASED → FINAL_AMOUNT_CALCULATED → PAYMENT_CAPTURED → READY_FOR_DELIVERY → PICKED_UP_FROM_MARKET → OUT_FOR_DELIVERY → DELIVERED → COMPLETED

**Failure states:** PAYMENT_AUTHORIZATION_FAILED, PAYMENT_AUTHORIZATION_EXPIRED, PROCUREMENT_FAILED, CUSTOMER_REJECTED_SUBSTITUTION, CUSTOMER_APPROVAL_TIMEOUT, PAYMENT_CAPTURE_FAILED, DELIVERY_FAILED, CANCELLED, PARTIALLY_REFUNDED, REFUNDED

**ETA:** shopper assignment + travel to market (if needed) + procurement time + queue/packing + market-to-customer delivery.

**Shopper/Courier PWA:** assigned tasks, navigate to market, mark arrival, update item status, enter actual qty/weight/price, upload receipt/photo, request substitution approval, mark purchase completed, start delivery, update status, share sanitized location.

---

## 9. Security & Compliance (Direct Market)

**Access matrix (расширенная):**
- products: public read / admin write
- market_products: public limited read / admin-procurement write
- price_snapshots: admin-procurement write / public aggregated latest
- availability_observations: admin-procurement write / public sanitized
- orders: customer read own sanitized projection / server write
- procurement_tasks: shopper_courier read/update assigned only
- purchase_receipts: server/admin/procurement read-write
- payments: server write / admin limited / customer only status via order
- stripe_events: server write
- users: owner read/write limited fields
- addresses: owner read/write
- carts: owner read/write
- couriers: courier read own profile / admin-server write
- delivery_assignments: shopper_courier read/update assigned / sanitized public tracking projection
- ai_requests: server write / user read own sanitized output only

**Sanitized projections:**

**customer_order_projection:**
  orderId, status, paymentStatus, procurementStatus, deliveryStatus,
  items[] {nameSnapshot, requestedQty, requestedUnit, substitutionStatus, estimatedLineTotalMinor, finalLineTotalMinor},
  estimatedTotalMinor, maxAuthorizedAmountMinor, finalTotalMinor,
  etaMin, etaMax, trackingStatusMessage

**customer_tracking_projection:**
  orderId, deliveryStatus, etaMin, etaMax, approximateCourierLocation, lastLocationAt, statusMessage

Customer must not see:
- raw Stripe events
- PaymentIntent raw payload
- internal support notes
- shopper/courier phone
- vendor contactPhone
- receipt OCR raw text
- procurement margin fields
- full courier location history after delivery

**RBAC roles:** customer, admin, support, shopper_courier

**Compliance (Dubai Market Procurement):**
- Vendor/market onboarding + trade license docs where applicable
- Receipt/photo proof per purchase
- Product origin capture where available
- Transport handling category per SKU (ambient/chilled/fragile/immediate_delivery)
- Packaging standards for direct-to-customer
- Damaged/spoiled refund process
- Recall process based on vendor/date/product/receipt
- Shopper hygiene and handling rules
- No long-term storage by FreshCousine
- UAE PDPL for address, allergy, diet, AI input, courier location, receipt photos

---

## 10. Quote Calculation (обязательный раздел)

**Inputs:** cart items, marketId, customer address, service zone, substitution policy, latest price snapshots, market product availability status

**Outputs:** estimatedSubtotalMinor, estimatedDeliveryFeeMinor, estimatedServiceFeeMinor, estimatedTotalMinor, maxAuthorizedAmountMinor, item-level estimated price range, item-level availability warning, ETA range

**Правила:**
- Если availabilityStatus = UNAVAILABLE_TODAY — item нельзя добавить без явного acceptance
- Если CONFIRM_REQUIRED — allowed but marked not guaranteed
- Variable-weight products: estimated weight + price range
- Final price рассчитывается только после market purchase

---

## 11. Substitution Policy (обязательный раздел)

**Режимы:** ASK_EVERY_TIME (default MVP), ALLOW_SIMILAR, REMOVE_UNAVAILABLE

**Правила similar substitution:**
- Та же категория
- final line total ≤ estimated line total * 1.10
- Если выше tolerance — customer approval required

**Flow:** SUBSTITUTION_REQUIRED → notify customer → approve/reject/timeout → if approved continue, if rejected remove item, if timeout apply default policy

---

## 12. MVP API contracts — core endpoints + template

**POST /v1/cart/quote**  
Auth: customer  
Request: {items[], addressId, marketId, substitutionPolicy}  
Response: {
  quoteId,
  expiresAt,
  estimatedSubtotalMinor,
  estimatedDeliveryFeeMinor,
  estimatedServiceFeeMinor,
  estimatedTotalMinor,
  maxAuthorizedAmountMinor,
  items[] {
    marketProductId,
    productId,
    requestedQty,
    requestedUnit,
    estimatedLineTotalMinor,
    availabilityStatus,
    warnings[]
  },
  warnings[]
}  
Errors: OUTSIDE_SERVICE_ZONE, MARKET_CLOSED, ITEM_UNAVAILABLE_TODAY, INVALID_QUANTITY  
Idempotency: optional  
Audit: quote_created  
Rate limit: per user / per IP

**POST /v1/checkout/authorize**  
Auth: customer  
Request: {quoteId, paymentMethod, idempotencyKey}  
Response: {orderId, clientSecret, paymentIntentId, authorizedAmountMinor}  
Errors: QUOTE_EXPIRED, QUOTE_ALREADY_USED, QUOTE_NOT_OWNED, AUTHORIZATION_FAILED, IDEMPOTENCY_CONFLICT  
Idempotency: required (idempotencyKey)  
Audit: payment_authorization_created  
Rate limit: per user

**POST /v1/ai/text-to-basket**  
Auth: customer  
Request: {text, marketId, servings}  
Response: {dishes[], ingredients[], warnings[], substitutionAllowed}  
Errors: INVALID_TEXT, MARKET_UNAVAILABLE  
Idempotency: optional  
Audit: ai_text_to_basket  
Rate limit: per user / 5 per minute

(Полные request/response schemas, error codes, idempotency behavior, audit events и rate limits для всех endpoints — в implementation docs.)

---

## 13. Бюджет (Direct Market)

**Stripe UAE:** domestic 2.9% + AED 1.00 per successful transaction; international +1%; currency conversion +1%

**Дополнительно:** shopper/courier cost per order, failed procurement rate, substitution support, refund rate, receipt/photo storage

**Alerts:** 100/300/500/1000 USD

---

## Tax/VAT (placeholder)

- Final tax treatment must be confirmed before production launch.
- All monetary values are stored in minor units.
- If VAT applies, order must store taxMinor and taxInvoiceId.
- Service fee and delivery fee taxability must be confirmed by tax advisor.

tax_invoices/{invoiceId}
  orderId
  invoiceNumber
  subtotalMinor
  taxMinor
  totalMinor
  currency
  issuedAt
  pdfUrl

---

## 14. Roadmap (8 недель — Direct Market)

**Неделя 1:** Direct Market Fulfillment spec, market/vendor model, procurement flow, payment authorization/capture, state machine  
**Неделя 2:** catalog, categories, images, markets, vendors, market_products, estimated price fields  
**Неделя 3:** auth, profile, addresses, cart, quote calculation, substitution policy  
**Неделя 4:** Stripe manual authorization, webhooks, payment states, final capture/cancel/refund  
**Неделя 5:** procurement tasks, shopper/courier PWA, receipt upload, actual price/weight input  
**Неделя 6:** Text-to-Basket, SKU matching, market availability warnings, confirmation UI  
**Неделя 7:** delivery assignment, market-to-customer ETA, tracking, customer substitution approval  
**Неделя 8:** QA, payment edge cases, substitution tests, procurement failure tests, load/security tests, beta launch в одной зоне

---

## 15. Acceptance Criteria (Direct Market)

- Каталог содержит 100–200 active SKU с handlingType, unit, estimated price, availabilityStatus
- Quote возвращает estimated total + max authorized amount + item-level warnings
- Quote блокируется вне active zones
- Stripe authorization succeeds
- Webhook — единственный источник истины по оплате
- Authorization может быть cancelled при procurement failure
- Final capture ≤ max authorized без customer approval
- Shopper/courier может принять задачу, отметить at market, purchased, ввести actual qty/weight/price, загрузить receipt
- Unavailable item запускает substitution flow или removal
- AI никогда не возвращает final price/paymentUrl/guaranteed availability
- ETA включает procurement time + market-to-customer route
- Customer видит только sanitized tracking
- Shopper/courier обновляет только assigned tasks
- Admin действия создают audit events
- Quote has status ACTIVE after creation and becomes USED after successful checkout authorization.
- Expired or USED quote cannot be authorized.
- checkout/authorize requires idempotencyKey.
- Duplicate checkout/authorize request with the same idempotencyKey returns the same orderId.
- Stripe authorized amount equals maxAuthorizedAmountMinor.
- Captured amount equals finalTotalMinor.
- Capture is blocked if finalTotalMinor > authorizedAmountMinor.

---

## 16. Test Plan (Direct Market)

Обязательные сценарии:
- authorization success/failure, duplicate webhook, out-of-order webhook
- final capture lower than authorized, final total above authorized maximum
- capture failure, refund, partial refund
- all items found, item unavailable, substitution approved/rejected/timeout
- receipt upload, actual price/weight differs from estimate
- procurement cancelled
- address inside/outside zone
- shopper already at market / travels to market
- delivery failed
- used quote cannot be reused
- expired quote cannot be authorized
- duplicate checkout/authorize with same idempotencyKey returns same order
- same idempotencyKey with different quoteId returns IDEMPOTENCY_CONFLICT
- payment authorization amount equals maxAuthorizedAmountMinor
- final capture equals finalTotalMinor
- capture blocked when finalTotalMinor > authorizedAmountMinor
- customer projection does not expose raw Stripe/procurement/internal fields

---

**Финальная формулировка:**  
Документ соответствует модели Direct Market Fulfillment: estimated quote → payment authorization → market procurement → final amount calculation → capture → delivery. В проекте отсутствуют собственные товарные остатки, складское хранение и складская сборка заказа.