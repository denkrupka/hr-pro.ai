# ТЗ: Админ-панель портала HR AI Pro

> Этот документ — полное техническое задание для реализации админ-панели.
> Его можно целиком скопировать в задачу для кодогенерации. Все имена файлов,
> маршрутов, полей и CSS-классов соответствуют текущему коду репозитория.

---

## 0. Контекст проекта (обязательно к соблюдению)

- Стек: Node.js + Express 4, БД — один JSON-файл `data/db.json` (модуль `src/db.js`,
  коллекции: `users, sections, vacancies, participants, tests, purchases, anketas, requisitions`).
- Аутентификация: подписанная httpOnly-cookie `uid` (`cookie-parser`, секрет `process.env.SECRET`),
  middleware `requireAuth` в `server.js`. Пароли — scrypt (`src/auth.js`, формат `salt:hash`).
- Фронтенд: SPA без сборки — `public/index.html` + `public/js/app.js` (ванильный JS,
  render-функции с шаблонными строками, `$('#main').innerHTML = ...`), стили — `public/css/styles.css`
  (дизайн-токены в `:root`, тёмная тема через `[data-theme="dark"]`).
- Платежи: Stripe Checkout (redirect), ключ `process.env.STRIPE_SECRET_KEY`; без ключа —
  демо-режим с мгновенным зачислением. Пакеты — константа `PLANS` в `server.js` (~строка 943).
- Интеграции: `src/integrations.js` — 5 провайдеров (resend, smsapi, vapi, elevenlabs, zadarma);
  приоритет конфигурации: файл `integrations.config.json` → env → `user.settings.integrations[provider]`.
- Джоб-порталы: `src/job-portals.js` — 14 порталов, настройки в `user.settings.jobPortals`.
- В коде СЕЙЧАС НЕТ: ролей, поля `isAdmin`, маршрутов `/admin`, блокировки пользователей,
  глобальных настроек в db.json, Stripe-webhook. Всё это добавляется этим ТЗ.

**Правила совместимости (не нарушать):**
1. Не менять существующие публичные и пользовательские API-маршруты, кроме мест, явно
   перечисленных в разделе 8 «Изменения существующего кода».
2. Переиспользовать `public/css/styles.css` целиком: классы `.btn .btn.ghost .btn.danger .btn.sm`,
   `.card`, `.field`, `.lbl`, `.switch`, `.seg-tab`, `.chip`, `.stat`, `.kpi`, `.table-wrap`,
   `.overlay > .modal`, `.toast`, `.stage-pill`, `.plan`, дизайн-токены `--brand --surface --line --muted`.
   Допустим отдельный небольшой файл `public/css/admin.css` только для специфичных элементов.
3. Повторить фронтенд-паттерны `app.js`: хелперы `$ / $$ / api() / esc() / toast()`,
   `openModal(html, wide)` / `closeModal()`, состояние в одном объекте, render-функции.
4. Все новые серверные маршруты — в `server.js` (или новый `src/admin.js`, подключаемый из `server.js`).
5. i18n админки: минимум русский (как основной), по возможности тот же словарный паттерн
   `I18N = { ru: {...}, pl: {...}, en: {...} }` + `t(k)`, язык из `localStorage['hp_lang']`.

---

## 1. Фундамент: роли, доступ, новые коллекции

### 1.1 Роль администратора
- В модель `users` добавить поля:
  - `role: 'admin' | 'user'` — по умолчанию `'user'`; отсутствие поля трактовать как `'user'`.
  - `blocked: boolean` — по умолчанию `false`.
  - `adminNote: string` — внутренняя заметка администратора о клиенте (клиенту не видна).
- `publicUser()` НЕ должен отдавать `adminNote`; поле `role` — отдавать (фронту нужно, чтобы
  показать/скрыть ссылку на админку).
- Первый администратор: при старте сервера, если задан `process.env.ADMIN_EMAIL` и такой
  пользователь существует — проставить ему `role:'admin'`. Дополнительно сделать скрипт
  `scripts/make-admin.js <email>` (по аналогии с `scripts/seed.js`).

### 1.2 Middleware
```js
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
    next();
  });
}
```
- Все маршруты `/api/admin/*` — только через `requireAdmin`.
- В `requireAuth` и в `POST /api/login` добавить проверку: если `user.blocked === true` →
  `403 { error: 'Аккаунт заблокирован. Свяжитесь с поддержкой.' }` (при логине) и `401` (в requireAuth,
  с очисткой cookie) — заблокированный клиент мгновенно теряет доступ, но его данные сохраняются.
  Публичные кандидатские ссылки (`/t/:code`, `/a/:slug`, `/r/:id`) владельца-блокированного тоже
  возвращают страницу «Ссылка недоступна».

### 1.3 Новые коллекции в `data/db.json` (добавить в DEFAULT в `src/db.js`)
- `settings` — **объект** (не массив) глобальных настроек портала (см. раздел 5).
- `balanceLog` — журнал всех операций с балансами:
  `{ id, userId, delta, kind: 'purchase'|'admin_add'|'admin_sub'|'test_spend'|'refund'|'signup_bonus',
     comment, adminId|null, purchaseId|null, testId|null, balanceAfter, createdAt }`.
- `adminLog` — журнал действий администраторов:
  `{ id, adminId, action, targetType: 'user'|'settings'|'plan'|'integration'|'purchase',
     targetId, details (объект diff/параметров), createdAt }`.
  Писать запись при КАЖДОЙ мутации из админки. Хелпер `logAdmin(req, action, targetType, targetId, details)`.

### 1.4 Точки входа
- Страница: `GET /admin` → отдать `public/admin.html` **только** если текущий пользователь — админ;
  иначе redirect на `/login?next=/admin`. Внутри `admin.html` — свой SPA-скрипт `public/js/admin.js`,
  подключающий тот же `styles.css` (+ `admin.css`).
- В пользовательском SPA (`app.js`, функция `fillSideUser`): если `state.user.role === 'admin'`,
  показать в сайдбаре дополнительный пункт-иконку «Админка» (ссылка `/admin`, открывается как обычный переход).
- Разделение визуально: в админке верхняя полоса-бейдж «ADMIN» коралловым цветом (`--coral`),
  чтобы админ всегда видел, в каком контуре находится.

---

## 2. Каркас админ-панели (admin.html + admin.js)

Layout идентичен пользовательскому: левый сайдбар `.sidebar` (92px, иконки), контент `#main`
шириной до `--maxw`. Пункты меню (`data-view`):

| data-view | Название | Render-функция |
|---|---|---|
| `dashboard` | Дашборд | `renderAdmDashboard` |
| `clients` | Клиенты | `renderAdmClients` |
| `payments` | Платежи | `renderAdmPayments` |
| `plans` | Тарифы | `renderAdmPlans` |
| `integrations` | Интеграции | `renderAdmIntegrations` |
| `portal` | Настройки портала | `renderAdmPortal` |
| `content` | Контент и шаблоны | `renderAdmContent` |
| `log` | Журнал действий | `renderAdmLog` |

Внизу сайдбара: кнопка «← В кабинет» (переход на `/app`), переключатель темы (тот же
`localStorage['theme']`), кнопка «Выход» (`POST /api/logout` → `/login`).

Инициализация `admin.js`: `GET /api/me` → если `role !== 'admin'` → `location.href='/app'`;
иначе `setView('dashboard')`. Все запросы через тот же хелпер `api()` (401 → `/login`).

---

## 3. Экран «Дашборд» (`renderAdmDashboard`)

**API:** `GET /api/admin/stats` (requireAdmin) → агрегаты по ВСЕМ пользователям:
```json
{
  "users":   { "total": 0, "new7d": 0, "new30d": 0, "blocked": 0, "activeWeek": 0 },
  "tests":   { "sentTotal": 0, "doneTotal": 0, "done7d": 0, "byType": {"tools":0,"result":0,"logic":0,"sales":0,"knowledge":0} },
  "revenue": { "total": 0, "m30": 0, "byMethod": {"stripe":0,"demo":0}, "currency": "…из настроек…" },
  "balance": { "soldTotal": 0, "pendingTotal": 0 },
  "days":    [ { "date": "2026-07-01", "regs": 0, "testsDone": 0, "revenue": 0 } ]  // последние 30 дней
}
```
`activeWeek` — пользователи, у которых за 7 дней есть хоть один отправленный тест или логин
(достаточно поля `lastLoginAt` — добавить его: проставлять в `POST /api/login` и `POST /api/register`).

**UI:**
- KPI-грид (компонент `.kpi`, как `kpiCard` в app.js): «Клиентов всего», «Новых за 30 дней»,
  «Активных за неделю», «Выручка за 30 дней», «Тестов пройдено (всего)», «Тестов в ожидании».
- Два графика (переиспользовать `sparkArea`/`typeBars`-подход из app.js — инлайновый SVG):
  «Регистрации, 30 дней» и «Выручка, 30 дней».
- Donut «Тесты по типам» (как `stageDonut`).
- Карточка «Последние регистрации» (5 строк: аватар `avColor/initials`, email, дата;
  клик → карточка клиента, см. 4.3).
- Карточка «Последние платежи» (5 строк: сумма, пакет, клиент, метод `stripe|demo`, дата;
  клик → экран «Платежи» с фильтром по клиенту).
- Предупреждающие баннеры `.ai-note` вверху, если:
  - `STRIPE_SECRET_KEY` не задан и в глобальных настройках нет ключа → «Stripe не настроен — все покупки зачисляются бесплатно (демо-режим)»;
  - Resend не настроен глобально → «Email-рассылка не настроена — письма кандидатам не отправляются»;
  - `SECRET` равен дефолтному `hraipro-dev-secret-change-me` → «Смените SECRET в продакшене».

---

## 4. Экран «Клиенты» (`renderAdmClients`) — главный экран истории о клиентах

### 4.1 API
- `GET /api/admin/users?q=&status=&sort=&page=&perPage=` →
  `{ items: [...], total, page, perPage }`.
  - `q` — поиск по email/имени/компании (подстрока, регистронезависимо).
  - `status` — `all | active | blocked | paying` (paying = есть хоть одна покупка `method:'stripe'`).
  - `sort` — `created_desc (default) | created_asc | balance_desc | activity_desc | revenue_desc`.
  - Каждый item: `{ id, email, name, surname, company, role, blocked, createdAt, lastLoginAt,
    balanceTotal, balancePending, balanceAvailable, counters: { vacancies, participants,
    testsSent, testsDone, purchases, revenue } }` — counters агрегируются по коллекциям.
- `GET /api/admin/users/:id` → полная карточка (см. 4.3).
- `PUT /api/admin/users/:id` — правка `{ name, surname, company, email, adminNote, role }`
  (email — с проверкой уникальности; смену `role` на `admin` подтверждать на фронте).
- `POST /api/admin/users/:id/block` `{ blocked: true|false, reason? }` — блокировка/разблокировка.
- `POST /api/admin/users/:id/balance` `{ delta: number, comment: string }` — начисление
  (delta>0) или списание (delta<0). Правила: `comment` обязателен; итоговый
  `balanceTotal` не может стать меньше `balancePending`; операция пишется в `balanceLog`
  (`kind:'admin_add'|'admin_sub'`, `adminId`) и в `adminLog`.
- `POST /api/admin/users/:id/reset-password` → генерирует временный пароль (10 симв.),
  сохраняет его хеш, возвращает `{ password: '...' }` ОДИН раз (админ передаёт клиенту вручную).
- `POST /api/admin/users/:id/impersonate` → ставит админу вторую cookie `impersonate_uid`
  (подписанную) и возвращает `{ ok:true }`; фронт делает `location.href='/app'`.
  В `requireAuth`: если у пользователя-владельца cookie `uid` роль admin и есть
  `impersonate_uid` — подставлять в `req.user` клиента, а в `req.adminUser` — админа.
  В пользовательском SPA при активной имперсонации показать фиксированную плашку сверху:
  «Вы просматриваете кабинет {email} · [Вернуться в админку]» (кнопка → `POST /api/admin/impersonate/stop`,
  который чистит cookie и редиректит на `/admin`). Мутации в режиме имперсонации разрешены,
  но каждая пишется в `adminLog` с `action:'impersonated_change'`.
- `DELETE /api/admin/users/:id` — полное удаление клиента со всеми данными (sections, vacancies,
  participants, tests, anketas, requisitions, purchases остаются в `purchases` для бухгалтерии,
  но помечаются `userDeleted:true`). Нельзя удалить самого себя и другого админа.

### 4.2 UI списка
- Топбар: заголовок «Клиенты», справа счётчик «Всего: N».
- Фильтр-бар (как `#f-*` в renderHome): поиск `.field` c иконкой `ICON_SEARCH`,
  select статуса (Все / Активные / Заблокированные / Платящие), select сортировки,
  кнопка «Экспорт CSV» (клиентская генерация из текущей выборки, как `exportCsv` в app.js).
- Таблица `.table-wrap`: колонки — Клиент (аватар + имя + email), Компания, Регистрация,
  Последний вход, Баланс (`available / total`, моноширинный `.mono`), Тестов пройдено,
  Покупок / Выручка, Статус (бейдж: зелёный «Активен» / красный «Заблокирован» — стиль `.cand-stage cs-hired/cs-rej`).
- Клик по строке → карточка клиента (4.3). Пагинация: кнопки «‹ 1 2 3 ›» (perPage 25).

### 4.3 Карточка клиента (экран, заменяет `#main`, как `renderCandidatePage`)
- Шапка: аватар, имя/email/компания, бейдж статуса, дата регистрации, последний вход.
- Кнопки шапки:
  - **«Изменить»** → модалка «Редактирование клиента» (4.4.1);
  - **«± Баланс»** → модалка «Изменение баланса» (4.4.2);
  - **«Войти как клиент»** → confirm-модалка (4.4.3) → impersonate;
  - **«Сбросить пароль»** → модалка (4.4.4);
  - **«Заблокировать» / «Разблокировать»** (`.btn.danger` / `.btn.ghost`) → модалка (4.4.5);
  - **«Удалить»** (`.btn.danger`, иконка `ICON_TRASH`) → модалка (4.4.6).
- Стат-грид `.stat-grid`: Доступный баланс, Всего куплено, В брони, Вакансий, Кандидатов,
  Тестов отправлено / пройдено, Покупок на сумму.
- Вкладки `.seg-tab`:
  1. **Обзор** — мини-график активности клиента за 30 дней (отправленные/пройденные тесты),
     блок «Заметка администратора» (`textarea` + кнопка «Сохранить» → `PUT ... {adminNote}`).
  2. **Платежи и баланс** — таблица `balanceLog` этого клиента + его `purchases`
     (`GET /api/admin/users/:id/balance-log`): дата, операция (бейдж по `kind`), Δ, баланс после,
     комментарий, кто (админ/система/Stripe).
  3. **Тесты** — таблица всех тестов клиента (`GET /api/admin/users/:id/tests`):
     кандидат, тип (иконки `TEST_ICON`), статус (sent/in_progress/done), отправлен, пройден.
     Только просмотр, без доступа к содержимому отчётов (приватность кандидатов).
  4. **Настройки клиента** — read-only дамп ключевых `user.settings`: uiLang, timezone, linkDays,
     какие интеграции настроены (только флаги configured, БЕЗ значений ключей), какие джоб-порталы
     подключены. Кнопка «Сбросить интеграции клиента» (с confirm) — очищает `settings.integrations`.

### 4.4 Модальные окна экрана «Клиенты»
1. **«Редактирование клиента»** — поля: Имя, Фамилия, Компания, Email, селект Роль
   (Пользователь/Администратор). Кнопки: «Сохранить» (`PUT /api/admin/users/:id`, тост
   «Сохранено ✓»), «Отмена». При смене роли на admin — красный текст-предупреждение
   «Пользователь получит полный доступ к админ-панели».
2. **«Изменение баланса»** — переключатель `.seg-btn` «Начислить / Списать», поле «Количество
   тестов» (number, min 1), поле «Комментарий (обязательно)», подсказка серым: «Текущий баланс:
   X доступно / Y в брони». Кнопка «Применить» активна только при заполненном комментарии.
   → `POST /api/admin/users/:id/balance`. После успеха — тост и обновление карточки.
3. **«Войти как клиент»** — текст: «Вы увидите кабинет глазами клиента {email}. Все изменения
   будут записаны в журнал». Кнопки «Войти» / «Отмена».
4. **«Сброс пароля»** — текст-предупреждение, кнопка «Сгенерировать новый пароль»; после ответа
   показать пароль крупно в `.mono` c кнопкой-копированием (`ICON_COPY`, `navigator.clipboard`)
   и подписью «Пароль показан один раз. Передайте его клиенту».
5. **«Блокировка»** — поле «Причина» (сохраняется в adminLog.details), текст «Клиент не сможет
   войти; ссылки его кандидатов перестанут открываться. Данные сохраняются». Кнопки
   «Заблокировать» (`.btn.danger`) / «Отмена». Для разблокировки — упрощённый confirm.
6. **«Удаление клиента»** — требование ввести email клиента в поле для подтверждения; кнопка
   «Удалить навсегда» (`.btn.danger`) активируется только при совпадении. Список того, что будет
   удалено (счётчики: N вакансий, M кандидатов, K тестов).

---

## 5. Экран «Платежи» (`renderAdmPayments`)

### 5.1 API
- `GET /api/admin/purchases?q=&method=&from=&to=&page=` → все записи `purchases` по всем
  пользователям, обогащённые `{ userEmail, userName, planName }` + итоги
  `{ totalAmount, count, byMethod }` по текущему фильтру.
- `GET /api/admin/balance-log?userId=&kind=&page=` — глобальный журнал операций с балансами.
- `POST /api/admin/purchases/:id/refund` `{ comment }` — пометить покупку `status:'refunded'`,
  списать `qty` с `balanceTotal` клиента (но не ниже `balancePending`), записать `balanceLog`
  (`kind:'refund'`) и `adminLog`. ВАЖНО: реальный возврат денег в Stripe выполняется вручную
  в Stripe Dashboard — модалка должна прямо предупреждать об этом.
- `GET /api/admin/stripe/status` → `{ configured: bool, keySource: 'env'|'db'|null, webhook: bool }`.

### 5.2 UI
- Три статы `.stat-grid`: «Выручка всего», «Выручка за 30 дней», «Покупок всего».
- Фильтр-бар: поиск по email клиента, select метода (Все / Stripe / Демо), два date-поля
  «с … по …», кнопка «Экспорт CSV».
- Вкладки `.seg-tab`: **«Покупки»** и **«Журнал баланса»**.
  - Покупки: таблица — Дата, Клиент (клик → карточка клиента), Пакет (`planId` + qty),
    Сумма, Метод (бейдж: фиолетовый «Stripe» / серый «Демо»), Статус (paid/refunded),
    Session ID (обрезанный, `.mono`, title с полным), кнопка-иконка «Возврат» (только для paid).
  - Журнал баланса: Дата, Клиент, Операция (бейдж по `kind`: purchase — зелёный,
    admin_add — синий, admin_sub — оранжевый, test_spend — серый, refund — красный,
    signup_bonus — голубой), Δ (`+N`/`−N`, `.mono`), Баланс после, Комментарий, Инициатор.
- Баннер вверху, если Stripe не настроен (демо-режим) — с кнопкой «Настроить» → экран «Интеграции».

### 5.3 Модальное окно «Возврат покупки»
Текст: «С баланса клиента будет списано {qty} тестов. Возврат денег ({amount}) выполните
вручную в Stripe Dashboard — эта операция только корректирует баланс на портале».
Поле «Комментарий (обязательно)». Кнопки «Выполнить возврат» (`.btn.danger`) / «Отмена».

---

## 6. Экран «Тарифы» (`renderAdmPlans`)

Сейчас пакеты захардкожены в `server.js` (`PLANS`: starter 50/4900, standard 200/14900,
pro 500/29900, business 1000/49900). Нужно перенести их в глобальные настройки.

### 6.1 Изменения сервера
- В `db.settings` завести `plans: [...]` (см. раздел 9) и `currency: 'eur'` .
  При первом старте мигрировать текущий массив `PLANS` в базу как есть.
- `GET /api/plans` теперь читает из `db.settings.plans` (только `active:true`) и отдаёт
  дополнительно `currency`. `POST /api/checkout` берёт план из настроек и передаёт в Stripe
  `currency: settings.currency`.
- **ВАЖНО (существующий баг):** фронт (`renderBalance`, app.js ~2691) показывает цены со знаком
  `€`, а бэкенд отправляет в Stripe `currency:'rub'`. После переноса в настройки фронт должен
  рендерить символ валюты из `/api/plans` (`currency`), а дефолт в настройках выбрать осознанно.
- Новое поле плана: `active: bool` (выключенные не видны клиентам), `order: number`.
- Стартовый бонус при регистрации (сейчас захардкожено `balanceTotal: 200` в `/api/register`)
  перенести в `db.settings.signupBonus` (default 200). Начисление бонуса писать в `balanceLog`
  (`kind:'signup_bonus'`).

### 6.2 API
- `GET /api/admin/plans` → `{ plans, currency, signupBonus, stripeConfigured }`.
- `PUT /api/admin/plans` `{ plans: [...], currency, signupBonus }` — полная перезапись
  (валидация: id уникальны, qty>0, price>=0; у активных планов заполнены все поля). adminLog.

### 6.3 UI
- Стат-панель: «Активных пакетов», «Валюта», «Бонус при регистрации: N тестов».
- Кнопка «Параметры» → модалка «Общие параметры продаж»: select валюты (EUR / USD / PLN / RUB),
  поле «Тестов при регистрации» (number, 0 = без бонуса). Кнопки «Сохранить»/«Отмена».
- Грид карточек пакетов — использовать тот же компонент `.plan-grid > .plan` (как на экране
  «Баланс» клиента), чтобы админ видел пакеты глазами клиента: qty, цена, скидка `.save`,
  лента `.ribbon` «Хит» у `popular`. Поверх каждой карточки — кнопки «Изменить» и тумблер
  `.switch` Вкл/Выкл (`active`). Неактивные карточки — приглушённые (`opacity:.5`).
- Кнопка «+ Добавить пакет».
- Модалка «Пакет» (создание/правка): поля — ID (латиницей, при правке read-only),
  «Количество тестов» (number), «Цена» (number, в целых единицах валюты), «Скидка, %» (number,
  0–99, отображается лентой), чекбокс «Хит (выделить)» — допустим только у одного пакета
  (при включении снимать у остальных), «Порядок» (number). Кнопки: «Сохранить», «Отмена»,
  при правке — «Удалить пакет» (`.btn.danger`, confirm; удалять можно, история покупок
  хранит planId и qty независимо).
- Внизу — превью «Так видит клиент»: рендер активных пакетов в точности как в `renderBalance`.

---

## 7. Экран «Интеграции» (`renderAdmIntegrations`) — глобальные ключи портала

Это раздел ГЛОБАЛЬНЫХ (портальных) настроек интеграций. Клиентские настройки
(`user.settings.integrations`) остаются как есть и имеют приоритет над глобальными —
это уже реализовано в `src/integrations.js` (`cfgOf`: файл/env → user). Требуемое изменение
приоритета: `db.settings.integrations` (новое) → env → user (user по-прежнему сверху).

### 7.1 Изменения сервера
- В `src/integrations.js` функцию `cfgOf` расширить: глобальный слой читать не только из
  `integrations.config.json` и env, но и из `db.settings.integrations[provider]`
  (приоритет: файл < env < db.settings < user.settings).
- Stripe-ключ: добавить возможность хранить в `db.settings.stripe = { secretKey, webhookSecret }`;
  при старте и при сохранении ключа переинициализировать клиент Stripe
  (`stripe = key ? require('stripe')(key) : null`). env `STRIPE_SECRET_KEY` имеет приоритет ниже db.
- Добавить **Stripe webhook** `POST /api/stripe/webhook` (raw body, проверка подписи
  `webhookSecret`): на `checkout.session.completed` вызывать существующий `creditPurchase`
  (он идемпотентен по sessionId — двойного зачисления с `/api/checkout/confirm` не будет).

### 7.2 API
- `GET /api/admin/integrations` → массив провайдеров:
  `{ id, name, purpose, fields: [{key,label,secret,placeholder}], values: {…секреты маскированы '••••'+4 симв.},
     source: 'db'|'env'|'file'|null, configured: bool, usersConfigured: N (скольким клиентам настроено своё) }`.
  Провайдеры: `stripe` (плюс webhookSecret), `resend`, `smsapi`, `vapi`, `elevenlabs`, `zadarma`.
- `PUT /api/admin/integrations/:provider` `{ values }` — сохранить в `db.settings.integrations`
  (для stripe — в `db.settings.stripe`). Пустое значение секретного поля = «не менять»;
  спец-значение `null` = удалить. adminLog (в details секреты не писать, только имена полей!).
- `POST /api/admin/integrations/:provider/test` `{ to? }` — прокси к существующей логике
  `/api/integrations/test/:provider`, но с глобальной конфигурацией: resend/smsapi — отправка
  тестового письма/SMS на `to`, vapi — тестовый звонок на `to`, elevenlabs — список голосов,
  zadarma — баланс, stripe — `stripe.balance.retrieve()`.

### 7.3 UI
Сетка карточек `.intg-card` (как в `renderJobPortals`). Каждая карточка:
- Название + назначение: **Stripe** — «Приём платежей», **Resend** — «Email кандидатам»,
  **SMSAPI** — «SMS кандидатам», **Vapi** — «ИИ-звонки кандидатам (телефония)»,
  **ElevenLabs** — «Голос для ИИ-звонков», **Zadarma** — «Виртуальный номер / SIP».
- Статус-бейдж: «Работает (портал)» зелёный / «Через env» серый с подписью источника /
  «Не настроено» красный. Подпись «Свои ключи у N клиентов».
- Кнопки: «Настроить» (модалка), «Проверить» (для resend/smsapi/vapi — сначала мини-модалка
  с полем «Кому» email/телефон), для настроенных — «Отключить» (confirm, удаляет значения из db).

Модалка «Настройка {провайдер}»: поля из `fields` (secret-поля — `type=password` с кнопкой-глазом,
placeholder показывает маску текущего значения), краткая помощь серым текстом, где взять ключ.
Для Vapi дополнительно пояснение: «Звонки ИИ включаются клиентами в настройках процесса вакансии;
без этого ключа шаг звонка тихо пропускается». Для Stripe — поля Secret Key и Webhook Secret +
readonly-поле URL вебхука `{BASE_URL}/api/stripe/webhook` с кнопкой копирования.
Кнопки: «Сохранить» → PUT, «Проверить» → test, «Отмена».

---

## 8. Экран «Настройки портала» (`renderAdmPortal`)

### 8.1 API
- `GET /api/admin/settings` → `{ settings, env: { baseUrl, port, secretIsDefault: bool } }`.
- `PUT /api/admin/settings` `{ patch }` — частичное обновление `db.settings`. adminLog c diff.

### 8.2 UI — карточки-секции на одном экране
1. **Основное**: «Название портала» (`portalName`, default 'HR AI Pro' — использовать в письмах
   и заголовках вместо хардкода, где он есть), «Базовый URL» (`baseUrl` — если задан, использовать
   вместо env `BASE_URL` при генерации ссылок на тесты/анкеты/фиды), «Email поддержки»
   (`supportEmail` — показывать клиентам в сообщении о блокировке и в FAQ).
2. **Регистрация**: тумблер «Регистрация новых клиентов открыта» (`registrationOpen`, default true;
   при false `POST /api/register` → 403 «Регистрация временно закрыта», на login.html скрыть таб
   регистрации по флагу из `GET /api/meta` — добавить туда `registrationOpen`);
   поле «Тестов при регистрации» (дублирует настройку с экрана Тарифы — одно и то же поле
   `signupBonus`).
3. **Значения по умолчанию для новых клиентов**: «Срок жизни ссылки на тест, дней»
   (`defaultLinkDays`, default 3 — использовать в `defaultSettings()`), «Язык интерфейса по
   умолчанию» (`defaultUiLang`: ru/pl/en), «Часовой пояс по умолчанию» (`defaultTimezone`).
4. **Безопасность**: индикатор «SECRET задан из env: да/нет (дефолтный — небезопасно)»,
   read-only; «Мин. длина пароля» (`passwordMinLength`, default 6 — применить в
   `/api/register`, `/api/settings/password`, admin reset).
5. **Режим обслуживания**: тумблер `maintenanceMode` + текст `maintenanceMessage`.
   При включении все не-админские страницы и API (кроме /login и /api/login) возвращают
   страницу/ответ «Портал на обслуживании: {message}». Кандидатские ссылки `/t/:code` тоже.
   В админке при включённом режиме — постоянный красный баннер.

Каждая карточка — своя кнопка «Сохранить» с тостом.

---

## 9. Экран «Контент и шаблоны» (`renderAdmContent`)

Дефолтные шаблоны писем/SMS сейчас захардкожены в `server.js`
(`DEFAULT_TEMPLATES`, `DEFAULT_SMS`, `DEFAULT_MAIL()`); клиент может переопределить свои
в настройках кабинета. Админ должен управлять именно ДЕФОЛТАМИ (для всех новых/не
переопределивших клиентов).

### 9.1 Изменения сервера
- `db.settings.defaultEmailTemplates`, `defaultSmsTemplates`, `defaultMailTemplates` —
  при отсутствии использовать текущие константы. `defaultSettings()` и `notifyCandidate`
  читают дефолты из db.settings (fallback на константы).

### 9.2 API
- `GET /api/admin/templates` → текущие дефолты + список переменных-плейсхолдеров.
- `PUT /api/admin/templates` `{ emailTemplates?, smsTemplates?, mailTemplates? }`.
- `POST /api/admin/templates/preview` `{ kind, lang, subject, body }` → HTML-превью с
  подставленными демо-значениями (`{candidate}='Иван Иванов'` и т.д.).
- `POST /api/admin/templates/reset` `{ scope }` — вернуть заводские (константы).

### 9.3 UI
Повторить UI клиентского редактора шаблонов (`renderSettings` вкладка templates + `openTestsConfig`):
переключатель E-mail/SMS, категории send/status, выбор теста/статуса, язык (ru/uk/pl/en),
RTE-редактор (`wireRte`) для email, textarea (maxlength 360) для SMS, панель переменных-чипов
(`$vac$ $name$ $company$ $client$ $link$ $button_link$ $phone$ $date_interview$` — клик
вставляет в редактор). Кнопки: «Сохранить», «Превью» (модалка с рендером письма),
«Вернуть заводские» (confirm). Плашка вверху: «Это шаблоны по умолчанию. Клиенты, изменившие
шаблоны у себя, продолжат использовать свои».

Вторая вкладка экрана — **«Обучение»**: список markdown-статей из `data/education/`
(`GET /api/admin/education` — файлы; `PUT /api/admin/education/:slug` — сохранить текст;
редактор — простая textarea с моноширинным шрифтом + кнопка «Превью» с `mdToHtml`).

---

## 10. Экран «Журнал действий» (`renderAdmLog`)

- `GET /api/admin/log?adminId=&action=&targetType=&from=&to=&page=` → записи `adminLog`,
  обогащённые email админа и подписью цели.
- UI: фильтр-бар (select админа, select типа действия, даты), таблица: Дата-время (`.mono`),
  Админ, Действие (человекочитаемо: «Начислил баланс», «Заблокировал клиента», «Изменил тариф»,
  «Обновил ключ Vapi», «Вход как клиент»…), Цель (ссылка на карточку клиента, если targetType=user),
  Детали (кнопка-иконка → модалка с pretty-printed JSON diff, секреты замаскированы).
- Журнал только для чтения, записи не удаляются.

---

## 11. Полный реестр новых API-маршрутов (сводно)

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/admin/stats` | агрегаты дашборда |
| GET | `/api/admin/users` | список клиентов (поиск/фильтр/сортировка/пагинация) |
| GET | `/api/admin/users/:id` | карточка клиента |
| PUT | `/api/admin/users/:id` | правка профиля/роли/заметки |
| POST | `/api/admin/users/:id/block` | блокировка/разблокировка |
| POST | `/api/admin/users/:id/balance` | ручное начисление/списание с комментарием |
| GET | `/api/admin/users/:id/balance-log` | журнал баланса клиента |
| GET | `/api/admin/users/:id/tests` | тесты клиента |
| POST | `/api/admin/users/:id/reset-password` | временный пароль |
| POST | `/api/admin/users/:id/impersonate` | вход как клиент |
| POST | `/api/admin/impersonate/stop` | выход из имперсонации |
| DELETE | `/api/admin/users/:id` | удаление клиента |
| GET | `/api/admin/purchases` | все покупки |
| POST | `/api/admin/purchases/:id/refund` | возврат (коррекция баланса) |
| GET | `/api/admin/balance-log` | глобальный журнал баланса |
| GET | `/api/admin/stripe/status` | статус Stripe |
| GET/PUT | `/api/admin/plans` | тарифные пакеты, валюта, бонус |
| GET | `/api/admin/integrations` | глобальные интеграции |
| PUT | `/api/admin/integrations/:provider` | сохранить ключи |
| POST | `/api/admin/integrations/:provider/test` | проверка интеграции |
| GET/PUT | `/api/admin/settings` | глобальные настройки портала |
| GET/PUT | `/api/admin/templates` (+ `/preview`, `/reset`) | дефолтные шаблоны |
| GET/PUT | `/api/admin/education(/:slug)` | статьи обучения |
| GET | `/api/admin/log` | журнал действий админов |
| POST | `/api/stripe/webhook` | Stripe webhook (публичный, подпись) |
| GET | `/admin` | страница админки (admin.html, только для role=admin) |

---

## 12. Схема `db.settings` (глобальные настройки, объект)

```json
{
  "portalName": "HR AI Pro",
  "baseUrl": "",
  "supportEmail": "",
  "registrationOpen": true,
  "signupBonus": 200,
  "defaultLinkDays": 3,
  "defaultUiLang": "ru",
  "defaultTimezone": "GMT+3 Europe/Moscow",
  "passwordMinLength": 6,
  "maintenanceMode": false,
  "maintenanceMessage": "",
  "currency": "eur",
  "plans": [
    { "id": "starter",  "qty": 50,   "price": 4900,  "save": 0,  "popular": false, "active": true, "order": 1 },
    { "id": "standard", "qty": 200,  "price": 14900, "save": 24, "popular": true,  "active": true, "order": 2 },
    { "id": "pro",      "qty": 500,  "price": 29900, "save": 39, "popular": false, "active": true, "order": 3 },
    { "id": "business", "qty": 1000, "price": 49900, "save": 49, "popular": false, "active": true, "order": 4 }
  ],
  "stripe": { "secretKey": "", "webhookSecret": "" },
  "integrations": {
    "resend":     { "apiKey": "", "from": "" },
    "smsapi":     { "token": "", "from": "", "endpoint": "" },
    "vapi":       { "apiKey": "", "phoneNumberId": "", "assistantId": "" },
    "elevenlabs": { "apiKey": "", "voiceId": "" },
    "zadarma":    { "apiKey": "", "apiSecret": "", "number": "" }
  },
  "defaultEmailTemplates": null,
  "defaultSmsTemplates": null,
  "defaultMailTemplates": null
}
```

---

## 13. Изменения существующего кода (точечно)

1. `src/db.js` — в `DEFAULT` добавить `settings:{}`, `balanceLog:[]`, `adminLog:[]`;
   мягкая миграция при загрузке (отсутствующие коллекции создаются).
2. `server.js /api/register` — стартовый баланс из `settings.signupBonus`; запись в `balanceLog`;
   проверка `registrationOpen`; `lastLoginAt`.
3. `server.js /api/login` — проверка `blocked`; проставлять `lastLoginAt`.
4. `requireAuth` — блокированный → 401 + clearCookie; поддержка имперсонации.
5. **`POST /api/balance/add` — УДАЛИТЬ** (клиент больше не может начислять себе баланс;
   замена — `POST /api/admin/users/:id/balance`). Во фронте `app.js` вызовов этого маршрута нет
   (кнопка «+» ведёт на экран «Баланс») — удаление безопасно.
6. `POST /api/take/:code/submit` — списание теста дополнительно писать в `balanceLog`
   (`kind:'test_spend'`, testId).
7. `creditPurchase` — дополнительно писать `balanceLog` (`kind:'purchase'`, purchaseId).
8. `GET /api/plans`, `POST /api/checkout` — планы/валюта из `db.settings` (см. раздел 6).
9. `src/integrations.js cfgOf` — слой `db.settings.integrations` (см. раздел 7).
10. `renderBalance` в `app.js` — символ валюты из ответа `/api/plans` вместо жёсткого `€`.
11. `fillSideUser` в `app.js` — пункт «Админка» для role=admin.
12. `publicUser` — добавить `role`; не отдавать `adminNote`.
13. Раздача `admin.html` по `/admin` с проверкой роли.
14. Stripe webhook: `express.raw({type:'application/json'})` ТОЛЬКО для `/api/stripe/webhook`
    (подключить ДО `express.json()`), иначе проверка подписи не сработает.

---

## 14. Безопасность (обязательные требования)

- Каждый `/api/admin/*` — через `requireAdmin`; ни один не должен быть доступен обычному
  пользователю (проверить тестом: логин demo-пользователем → все admin-маршруты дают 403).
- Секреты интеграций никогда не возвращаются в открытом виде (маска `'••••' + last4`),
  не пишутся в adminLog, не попадают в CSV-экспорты.
- `POST /api/admin/users/:id/balance` — `delta` целое, `|delta| <= 100000`, comment 3–500 симв.
- Нельзя: заблокировать/удалить самого себя; удалить/понизить последнего администратора.
- Имперсонация: cookie `impersonate_uid` подписанная, httpOnly, живёт 2 часа; действует
  только пока основная cookie принадлежит админу.
- Webhook Stripe: проверка подписи `stripe.webhooks.constructEvent`; без валидной подписи — 400.
- Все входные данные админ-маршрутов валидировать (типы, длины), ошибки — `{ error: '...' }`
  в стиле остальных маршрутов.

---

## 15. Критерии приёмки (Definition of Done)

1. `node scripts/make-admin.js demo@hraipro.io` делает demo-пользователя админом; после логина
   в сайдбаре кабинета появляется пункт «Админка», `/admin` открывается.
2. Обычный пользователь при заходе на `/admin` и любые `/api/admin/*` получает redirect/403.
3. Дашборд показывает реальные агрегаты по данным `data/db.json` (сходятся с ручным подсчётом).
4. Поиск клиента по email, открытие карточки, начисление 10 тестов с комментарием:
   баланс клиента вырос, запись видна в журнале баланса клиента и в глобальном журнале,
   действие видно в «Журнале действий».
5. Блокировка клиента: его логин отклоняется, активная сессия слетает при следующем запросе,
   ссылка `/t/:code` его кандидата показывает «Ссылка недоступна»; разблокировка всё возвращает.
6. Смена пакета (цена/qty) в «Тарифах» немедленно отражается на клиентском экране «Баланс»
   и на лендинге; выключенный пакет исчезает у клиентов; символ валюты соответствует настройке.
7. Ввод ключа Resend в «Интеграциях» + «Проверить» отправляет тестовое письмо; после этого
   отправка теста кандидату (у клиента без своих ключей) реально шлёт письмо.
8. Ввод ключа Vapi глобально включает ИИ-звонки для клиентов, не настроивших свой ключ
   (шаг воронки перестаёт «тихо пропускаться» при наличии телефона кандидата).
9. Покупка в демо-режиме и покупка через Stripe (тестовый ключ) создают `purchases` +
   `balanceLog`; webhook на `checkout.session.completed` зачисляет баланс даже если клиент
   закрыл вкладку до redirect; повторное подтверждение не удваивает зачисление.
10. `POST /api/balance/add` больше не существует (404).
11. Режим обслуживания скрывает портал для всех, кроме админов.
12. Тёмная/светлая тема, тосты, модалки и таблицы админки визуально неотличимы от
    пользовательского кабинета (те же классы `styles.css`).
