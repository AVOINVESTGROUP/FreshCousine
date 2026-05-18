# FreshAI Dubai

Customer PWA реализован на Next.js + TypeScript в соответствии с архитектурой ТЗ.

## Запуск

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите frontend:
   ```bash
   npm run dev
   ```
3. Откройте сайт по адресу, указанному в терминале.

## Сборка

```bash
npm run build:web
```

## Backend

Сервер находится в `server/` и реализует MVP-эндпоинты из ТЗ:
- `POST /v1/cart/quote`
- `POST /v1/checkout/authorize`
- `POST /v1/ai/text-to-basket`

Запуск backend:

```bash
npm run dev:backend
```

Для заполнения демо-данными Firestore:

```bash
SEED_DATA=true npm run dev:backend
```

## Структура

- `app/` — Next.js Customer PWA
- `app/globals.css` — глобальные стили
- `src/App.tsx` — основной UI и логика компонента
- `server/src` — backend Express / Firestore / Stripe
