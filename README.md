# HR PRO AI — hr-pro.ai

Портал оценки кандидатов по методике Performia/HR-Scanner: тесты продуктивности (Резалт),
личности (Тулс, OCA), логики (Логис), продаж (Сэйлс), проверка знаний, воронка найма,
ИИ-звонки кандидатам, референсы, оценка мотивации и админ-панель владельца портала.

## Архитектура

| Слой | Локальная версия | Облачная версия (hr-pro.ai) |
|------|------------------|------------------------------|
| Фронтенд | `public/` — SPA на ванильном JS | тот же `public/`, отдаётся Cloudflare Pages |
| Бэкенд | `server.js` — Node.js + Express | Cloudflare Pages Functions (edge, Hono) — `functions/` |
| БД | `data/db.json` (файл) | Supabase Postgres |
| Файлы (CV/медиа) | `public/uploads/` | Supabase Storage |
| Платежи | Stripe Checkout | Stripe (fetch-клиент на edge) |

## Запуск локально

```bash
npm install
node scripts/seed.js   # демо-данные
npm start              # http://localhost:3000  (demo@hraipro.io / demo1234)
```

## Тесты методики

| Тест | Что оценивает |
|------|---------------|
| **Тулс** | Личность по 10 точкам A–J (Оксфордский анализ, 200 утверждений) |
| **Резалт** | Продуктивность: Виннер / Дуэр / Вейтер (интервью-опросник) |
| **Логис** | Логика/IQ (75 вопросов с автоподсчётом) |
| **Сэйлс** | Способности в продажах (120 утверждений, 12 показателей) |
| **Знания** | Проверка профессиональных знаний по вакансии |

## Интеграции

Настраиваются в админ-панели `/admin` на уровне портала: Stripe (оплата), Resend (email),
SMSAPI (SMS), Vapi + ElevenLabs (ИИ-звонки), Zadarma. В проде — через переменные окружения
Cloudflare Pages; в репозиторий секреты не коммитятся (см. `.gitignore`).

## Структура

- `server.js` — монолитный Express-сервер (локально)
- `src/` — `db.js`, `auth.js`, `admin.js`, `integrations.js`, `recruitment.js`,
  `ai.js`, `ai-recruit.js`, `scoring/` (oca, sales)
- `public/` — статика SPA (index, admin, login, landing, take, req, anketa)
- `data/` — банки тестов (result/logic/sales/oca) и статьи обучения
- `functions/` — Cloudflare Pages Functions (edge-бэкенд, Hono)
- `supabase/` — SQL-миграции схемы БД
