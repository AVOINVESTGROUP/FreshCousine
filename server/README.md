# FreshAI Backend

Этот каталог содержит backend для FreshAI Direct Market Fulfillment.

## Запуск

```bash
npm run dev:backend
```

## Демо-данные

Чтобы автоматически загрузить стартовые документы в Firestore, установите:

```bash
SEED_DATA=true npm run dev:backend
```

## Переменные окружения

- `STRIPE_SECRET_KEY` — секретный ключ Stripe для создания PaymentIntent.
- `GOOGLE_APPLICATION_CREDENTIALS` — путь к JSON-сервисному аккаунту Firebase, если не используется эмулятор.
- `FIRESTORE_EMULATOR_HOST` — адрес эмулятора Firestore для локальной разработки.

## API

- `POST /v1/cart/quote`
- `POST /v1/checkout/authorize`
- `POST /v1/ai/text-to-basket`

Для аутентификации пока используется HTTP-заголовок `x-user-id`.
