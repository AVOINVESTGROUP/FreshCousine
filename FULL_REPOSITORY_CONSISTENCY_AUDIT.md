# Full Repository Consistency Audit - Integra Motors V4

**Дата**: 2026-05-12  
**Статус**: COMPLETE (Revision 1)  
**Область**: Backend, Frontend, Documentation, Contracts

---

## 0. Working Tree Caveat

> [!WARNING]
> Данный аудит проведен на **грязной (dirty)** рабочей директории. Наличие незафиксированных изменений может влиять на стабильность и точность выводов.

**Обнаруженные локальные изменения / некоммиченные файлы:**
*   `docs/implementation_plan_vehicle_access_management.md`: План внедрения (создан/изменен).
*   `docs/BACKEND_AUDIT_PRIORITIZATION.md`: Дорожная карта стабилизации (изменена).
*   `docs/FULL_REPOSITORY_CONSISTENCY_AUDIT.md`: Текущий отчет об аудите.
*   `apps/api/src/modules/public-intake/public-intake.service.ts`: Содержит логику обработки `convertedWorkOrderId`, которая может являться неутвержденной локальной модификацией.

Выводы, затрагивающие эти файлы или связанную с ними логику, следует считать **потенциально нестабильными** до сверки с чистым baseline репозитория.

---

## 1. Executive Summary

### Overall Consistency Status: **ARCHITECTURAL DRIFT (Execution vs Baseline)**
Репозиторий демонстрирует разрыв между каноническим проектом и артефактами исполнения. Документы статуса (`STEPS.md`) часто содержат утверждения о готовности функций, которые в коде представлены лишь в виде заглушек или имитаций.

### Top 5 Critical Mismatches
1.  **Auth Implementation**: `STEPS.md` заявляет о завершении, но `AuthService` — полная заглушка (принимает любые данные).
2.  **Attachment Constraints**: Prisma-модель `Attachment` жестко привязана к `WorkOrder`, что ограничивает ее использование для других сущностей (например, Vehicle Sessions).
3.  **Intake Schema Conflict**: Несовместимость JSON-схем в `AiDraft.rawPayload` между AI-приемкой и лендингом.
4.  **Storage Layer**: Использование локальных путей в коде при декларативном требовании Cloud Storage.
5.  **Tracking Continuity**: Риск потери истории обслуживания для клиента при переходе от заявки к заказу (частично нивелируется локальными правками в `PublicIntakeService`).

---

## 2. Source-of-Truth Map

### Каноническая документация (Source of Truth)
*   `docs/PROJECT_SPEC_V3.md`: Определяет архитектурный базис, роли и границы модулей.
*   `docs/openapi.yaml`: Единственный верный контракт API.

### Артефакты исполнения и статуса (Delivery/Status Docs)
*   `docs/STEPS.md`: План и статус выполнения. **Подвержен дрейфу**, не является источником истины для архитектуры.
*   `docs/walkthrough_*.md`: Отчеты о проделанной работе, фиксируют состояние на момент создания.

---

## 3. Backend Audit

### Prisma Schema vs PROJECT_SPEC_V3
*   **Attachment Logic**: В `STEPS.md` упоминается `SmartAttachments`, однако в Prisma реализована модель `Attachment`. Ожидание полиморфных/универсальных вложений (shared ownership) в канонической спецификации **NOT CONFIRMED**.
*   **Model Dependencies**: Обязательная связь `Attachment -> WorkOrder` подтверждена кодом, что делает модель узкоспециализированной.

### API Modules vs OpenAPI
*   **Auth Stubs**: Реализация контроллеров авторизации не соответствует требованиям безопасности (отсутствует проверка HMAC/Firebase).
*   **Public Intake Tracking**: Эндпоинт `/public/intake/{id}` в текущей рабочей директории возвращает `workOrderId`. **ВНИМАНИЕ**: Этот факт может быть следствием неутвержденных локальных изменений и требует проверки на чистом baseline.

### Tenant Isolation & Audit
*   **Isolation**: Внутренние модули соблюдают `tenantId` фильтрацию.
*   **Audit**: `AuditLog` модель существует, вызовы в сервисах присутствуют.

---

## 4. Frontend Audit

### apps/telegram-mini-app (Advisor TMA)
*   **Status**: Имитация функционала (Simulated AI Intake).
*   **Evidence**: Использование `mockPhotoUrl` в `page.tsx`.

### apps/customer-tma (Customer Tracking)
*   **Status**: Полагается на публичный эндпоинт интейка.
*   **Drift**: UI рассчитан на работу с черновиками, поддержка отображения данных полноценного заказа зависит от нестабильных правок в бэкенде.

---

## 5. Severity Matrix

*   **Critical**: Auth Stubs (Security), Tenant Hardcode (Scalability).
*   **High**: Cloud Storage (Persistence), Attachment Design (Extensibility).
*   **Medium**: Intake Normalization, Tracking Continuity.
*   **Deferred**: Vehicle Access Management (requires infrastructure baseline).

---

## 6. Recommended Next Planning Tasks

1.  Подготовка плана реализации **Production Auth** (Firebase/Telegram).
2.  Аудит использования `Attachment` перед любыми изменениями схемы (например, nullable `workOrderId`).
3.  Нормализация схемы `AiDraft` для унификации источников (AI vs Landing).
4.  Формализация контракта трекинга в `openapi.yaml`.

> [!IMPORTANT]
> Данный документ является только отчетом об аудите. Никакие действия по реализации или изменению кода не авторизованы.
