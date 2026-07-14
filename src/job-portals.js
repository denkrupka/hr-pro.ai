'use strict';
// Интеграции порталов трудоустройства. Реальные механизмы (по итогам ресёрча):
//  • method 'api'   — у портала есть рабочий REST API: подключение по ключу, работает сразу (Jooble).
//  • method 'feed'  — портал/агрегатор забирает вакансии из нашего публичного JobPosting-фида
//                     (Indeed XML / Schema.org JSON-LD): даём URL фида — портал индексирует автоматически
//                     (Indeed, Google for Jobs, Adzuna, Trovit, Jooble-feed).
//  • method 'login' — партнёрский/ручной доступ (нет открытого API): вход по логину кабинета
//                     работодателя или согласование через аккаунт-менеджера (pracuj.pl, OLX, LinkedIn и др.).
// Публикация «одним фидом» — основной рабочий путь: см. buildJobsFeedXml/JsonLd в server.js.

const crypto = require('crypto');

const PORTALS = [
  { id: 'feed', name: 'Универсальный фид (Indeed / Google for Jobs / Adzuna / Trovit)', url: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
    method: 'feed', auth: [],
    desc: 'Публичный фид ваших вакансий в стандарте JobPosting (XML + JSON-LD). Отдайте ссылку любому агрегатору — он проиндексирует вакансии автоматически. Google for Jobs подхватывает вакансии сам с публичных страниц анкет.',
    note: 'Ничего вводить не нужно — просто скопируйте ссылку на фид и добавьте её в кабинете портала-агрегатора.' },
  { id: 'jooble', name: 'Jooble', url: 'https://jooble.org/api/about',
    method: 'api', auth: ['api'],
    desc: 'Международный агрегатор вакансий. Есть публичный REST API — работает сразу после ввода ключа: поиск кандидатов/вакансий и приём вашего фида.',
    note: 'Получите ключ на jooble.org/api/about и вставьте его. Проверка ниже сразу делает реальный запрос к API.' },
  { id: 'pracuj', name: 'Pracuj.pl', url: 'https://www.pracuj.pl',
    method: 'login', auth: ['login'],
    desc: 'Крупнейший портал вакансий Польши. Открытого self-serve API нет: публикация согласуется через вашего аккаунт-менеджера (как у ATS-партнёров).',
    note: 'Укажите e-mail вашего аккаунт-менеджера в Pracuj.pl и логин кабинета pracodawca.pracuj.pl — по ним отправляем объявления на согласование.' },
  { id: 'olx', name: 'OLX Praca', url: 'https://biznes.olx.pl/integracja-api/',
    method: 'login', auth: ['api', 'login'],
    desc: 'Доска объявлений №1 в Польше, раздел «Praca». Есть партнёрский API (biznes.olx.pl/integracja-api) — по ключу; иначе логин кабинета.',
    note: 'Партнёрский API OLX выдаётся по договору — вставьте client_id/secret как API-ключ, либо подключите логин кабинета.' },
  { id: 'indeed', name: 'Indeed', url: 'https://docs.indeed.com/indeed-apply/xml-feed',
    method: 'feed', auth: [],
    desc: 'Глобальный агрегатор с большим трафиком в Польше. Забирает вакансии из XML-фида (Job Sync).',
    note: 'Добавьте ссылку на фид в Indeed (Job Sync) — вакансии появятся в течение нескольких часов.' },
  { id: 'linkedin', name: 'LinkedIn', url: 'https://learn.microsoft.com/linkedin/talent/job-postings/xml-feeds-development-guide',
    method: 'feed', auth: ['login'],
    desc: 'Профсеть: вакансии для специалистов и руководителей. Публикация через XML-фид Talent Solutions (партнёрская программа).',
    note: 'Подключение фида LinkedIn — по партнёрскому доступу; ссылку на фид добавляет менеджер LinkedIn.' },
  { id: 'adzuna', name: 'Adzuna', url: 'https://developer.adzuna.com',
    method: 'feed', auth: ['api'],
    desc: 'Агрегатор вакансий с открытым API поиска; вакансии принимает фидом.',
    note: 'Отдайте ссылку на фид; для поиска можно указать app_id/app_key Adzuna.' },
  { id: 'jooblefeed', name: 'Trovit / Jobrapido / прочие агрегаторы', url: 'https://www.trovit.com',
    method: 'feed', auth: [],
    desc: 'Прочие агрегаторы, принимающие стандартный JobPosting-фид.',
    note: 'Добавьте ссылку на фид в кабинете агрегатора.' },
  { id: 'flagma', name: 'Flagma.pl', url: 'https://flagma.pl',
    method: 'login', auth: ['login'],
    desc: 'B2B-площадка с разделом вакансий; актуальна для рабочих специальностей.',
    note: 'Открытого API нет — вход по логину/паролю кабинета.' },
  { id: 'aplikuj', name: 'Aplikuj.pl', url: 'https://www.aplikuj.pl',
    method: 'login', auth: ['login'],
    desc: 'Польский портал вакансий с бесплатными и платными публикациями.',
    note: 'Открытого API нет — логин/пароль кабинета работодателя.' },
  { id: 'pracapl', name: 'Praca.pl', url: 'https://www.praca.pl',
    method: 'login', auth: ['login'],
    desc: 'Один из старейших польских порталов вакансий.',
    note: 'Открытого API нет — логин/пароль кабинета.' },
  { id: 'infopraca', name: 'infoPraca.pl', url: 'https://www.infopraca.pl',
    method: 'login', auth: ['login'],
    desc: 'Портал вакансий среднего сегмента.',
    note: 'Открытого API нет — логин/пароль кабинета.' },
  { id: 'gowork', name: 'GoWork.pl', url: 'https://www.gowork.pl',
    method: 'login', auth: ['login'],
    desc: 'Вакансии и отзывы о работодателях; важен для бренда работодателя.',
    note: 'Открытого API нет — логин/пароль кабинета.' },
];

function connectionsOf(settings) { settings.jobPortals = settings.jobPortals || {}; return settings.jobPortals; }
function isConnected(settings, id) {
  const p = PORTALS.find(x => x.id === id);
  if (p && p.method === 'feed' && (!p.auth || !p.auth.length)) return true; // чисто фидовые всегда «готовы»
  const c = connectionsOf(settings)[id] || {};
  return !!(c.login || c.apiKey);
}

async function http(url, opts) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch (_) {}
  if (!r.ok) { const e = new Error((json && (json.message || json.error)) || text.slice(0, 300) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
  return json != null ? json : text;
}

// ---------- Jooble: реальный REST API (ключ в URL, JSON-тело) ----------
async function joobleSearch(settings, { keywords, location } = {}) {
  const c = connectionsOf(settings).jooble || {};
  if (!c.apiKey) return { skipped: true, reason: 'Jooble не подключён' };
  const d = await http('https://jooble.org/api/' + encodeURIComponent(c.apiKey), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keywords: keywords || '', location: location || '' }),
  });
  return { ok: true, totalCount: d && d.totalCount, jobs: (d && d.jobs || []).slice(0, 5).map(j => ({ title: j.title, company: j.company, location: j.location })) };
}

// Проверка подключения портала (для кнопки «Проверить»)
async function testConnection(settings, id) {
  if (id === 'jooble') return joobleSearch(settings, { keywords: 'sprzedawca', location: 'Warszawa' });
  const p = PORTALS.find(x => x.id === id);
  if (p && p.method === 'feed') return { ok: true, feed: true };
  if (isConnected(settings, id)) return { ok: true, connected: true };
  return { skipped: true, reason: 'Портал не подключён' };
}

module.exports = { PORTALS, connectionsOf, isConnected, testConnection, joobleSearch };
