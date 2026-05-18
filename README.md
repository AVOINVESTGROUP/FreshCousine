# FreshAI Dubai

Минимальный фронтенд-прототип по дизайну `index (13).html`.

## Запуск

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Запустите разработку:
   ```bash
   npm run dev
   ```
3. Откройте сайт по адресу, указанному в терминале.

## Сборка

```bash
npm run build
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

- `index.html` — шаблон приложения
- `src/App.tsx` — основной UI и логика
- `src/index.css` — Tailwind + стили
- `server/src` — backend Express / Firestore / Stripe
