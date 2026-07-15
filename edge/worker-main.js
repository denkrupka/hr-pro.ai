// Cloudflare Pages advanced-mode worker: статика через ASSETS + edge-API на Supabase.
// Первый рабочий срез (auth + конфиг); маршруты наращиваются итеративно, переиспользуя
// чистые модули портала (scoring/ai/recruitment) по мере портирования.
import { hashPassword, verifyPassword } from './auth-edge.js';
import { computeResult, testQuestionsFor, resultHintFor, localizeResult } from './tests-edge.js';
import { notifyCandidate, wrapEmailEdge, unsubToken, resetToken, verifyResetToken } from './notify-edge.js';
import { buildWorkflow, buildBoard, vacFull, processOf, knowledgeTestsOf, kanbanColTitle, KANBAN_COLS, recruit, ai, air } from './workflow-edge.js';
import makeStripe from './stripe-edge.js';
import { handleAdmin } from './admin-edge.js';
import { guideCheck } from './guide-check.js';
import { parseCV, cvSummary } from './cv-parse.js';
import { enrichWorkflowAI, aiHintForTest } from './ai-analysis.js';
import * as goog from './google-oauth.js';
import { EDU_TOPICS, EDU_CONTENT } from './education-data.js';
import { PORTALS as JOB_PORTALS, connectionsOf as jpConns, isConnected as jpIsConnected } from './job-portals-data.js';

const JSON_H = { 'content-type': 'application/json; charset=utf-8' };
const j = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...JSON_H, ...extra } });

// ── Supabase REST helper (service key, обходит RLS) ─────────────────────────────
function supa(env) {
  const base = env.SUPABASE_URL.replace(/\/$/, '');
  const key = env.SUPABASE_SECRET_KEY;
  const h = { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' };
  return {
    async select(table, query = '') {
      const r = await fetch(`${base}/rest/v1/${table}?${query}`, { headers: h });
      if (!r.ok) throw new Error(`${table}: ${r.status}`);
      return r.json();
    },
    async upsert(table, rows) {
      const r = await fetch(`${base}/rest/v1/${table}`, {
        method: 'POST', headers: { ...h, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(Array.isArray(rows) ? rows : [rows]),
      });
      if (!r.ok) throw new Error(`${table} upsert: ${r.status} ${(await r.text()).slice(0, 200)}`);
    },
    async del(table, query) {
      const r = await fetch(`${base}/rest/v1/${table}?${query}`, { method: 'DELETE', headers: { ...h, Prefer: 'return=minimal' } });
      if (!r.ok) throw new Error(`${table} del: ${r.status}`);
    },
    async one(table, id) { const r = await this.select(table, `id=eq.${id}&select=data`); return r[0] ? r[0].data : null; },
  };
}
const LANGS = [{ code: 'ru' }, { code: 'uk' }, { code: 'pl' }, { code: 'en' }];
const TEST_TYPES = { tools: 'Тулс', result: 'Резалт', logic: 'Логис', sales: 'Сэйлс' };
const testTitleOf = t => TEST_TYPES[t] || (t === 'knowledge' ? 'Проверка знаний' : t);
function defaultSettings() {
  return { surname: '', employees: '', phone: '', timezone: 'GMT+1 Europe/Warsaw', linkDays: 3, uiLang: 'ru', logo: '',
    notifySms: false, notifyComment: true, searchAllAccounts: true, askPersonalData: true,
    emailTemplates: {}, smsTemplates: {}, anketaFields: [], testOrder: ['result', 'tools', 'logic', 'sales'] };
}

// ── подписанные cookie (HMAC-SHA256, замена cookie-parser signed) ───────────────
async function signCookie(env, val) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(val));
  const sig = btoa(String.fromCharCode(...new Uint8Array(mac))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `s:${val}.${sig}`;
}
async function readSigned(env, raw) {
  if (!raw || !raw.startsWith('s:')) return null;
  const body = raw.slice(2);
  const dot = body.lastIndexOf('.');
  if (dot < 0) return null;
  const val = body.slice(0, dot), sig = body.slice(dot + 1);
  const expect = (await signCookie(env, val)).split('.').pop();
  return sig === expect ? val : null;
}
function parseCookies(header) {
  const out = {};
  (header || '').split(/;\s*/).forEach(p => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1)); });
  return out;
}
async function currentUser(env, req) {
  const c = parseCookies(req.headers.get('cookie'));
  const uid = await readSigned(env, c.uid);
  if (!uid) return null;
  const rows = await supa(env).select('users', `id=eq.${uid}&select=data`);
  return rows[0] ? rows[0].data : null;
}
function publicUser(u) {
  const s = u.settings || {};
  return { id: u.id, email: u.email, name: u.name, surname: s.surname || '', company: u.company,
    role: u.role === 'admin' ? 'admin' : 'user',
    balanceTotal: u.balanceTotal, balancePending: u.balancePending,
    balanceAvailable: (u.balanceTotal || 0) - (u.balancePending || 0), balanceExpiresAt: balanceExpiresAt(u), settings: s };
}
const uid = (n = 12) => { const b = new Uint8Array(16); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/[+/=]/g, '').slice(0, n); };
// Срок действия тестов — ровно 1 год с момента пополнения (лоты + FIFO-списание).
const BALANCE_TTL_DAYS = 365;
function _ensureLots(u) { if (Array.isArray(u.balanceLots)) return; u.balanceLots = [];
  if ((u.balanceTotal || 0) > 0) u.balanceLots.push({ id: uid(10), qty: u.balanceTotal, remaining: u.balanceTotal, source: 'legacy', createdAt: u.createdAt || new Date().toISOString(), expiresAt: new Date(Date.now() + BALANCE_TTL_DAYS * 864e5).toISOString() }); }
function addBalanceLot(u, qty, source) { if (!(qty > 0)) return; _ensureLots(u); u.balanceLots.push({ id: uid(10), qty, remaining: qty, source: source || 'credit', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + BALANCE_TTL_DAYS * 864e5).toISOString() }); }
function spendLots(u, n) { _ensureLots(u); let need = n; const now = Date.now(); u.balanceLots.slice().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')).forEach(l => { if (need <= 0) return; if (new Date(l.expiresAt).getTime() < now) return; const take = Math.min(l.remaining || 0, need); l.remaining = (l.remaining || 0) - take; need -= take; }); }
function expireBalance(u) { _ensureLots(u); const now = Date.now(); let expired = 0; u.balanceLots.forEach(l => { if ((l.remaining || 0) > 0 && new Date(l.expiresAt).getTime() < now) { expired += l.remaining; l.remaining = 0; } }); if (expired > 0) { u.balanceTotal = Math.max(0, (u.balanceTotal || 0) - expired); if ((u.balancePending || 0) > u.balanceTotal) u.balancePending = u.balanceTotal; } return expired; }
function balanceExpiresAt(u) { if (!Array.isArray(u.balanceLots)) return null; const act = u.balanceLots.filter(l => (l.remaining || 0) > 0).map(l => l.expiresAt).filter(Boolean).sort(); return act[0] || null; }

// ── API-роутер ──────────────────────────────────────────────────────────────────
async function api(req, env, url) {
  const p = url.pathname, m = req.method;
  const isWebhook = p === '/api/stripe/webhook';
  const rawBody = (isWebhook && m === 'POST') ? await req.text() : null;
  const body = (!isWebhook && (m === 'POST' || m === 'PUT')) ? await req.json().catch(() => ({})) : {};
  const S = supa(env);

  async function settings() { const r = await S.select('settings', 'id=eq.portal&select=data'); return (r[0] && r[0].data) || {}; }

  if (p === '/api/health') return j({ ok: true, edge: true, ts: Date.now() });

  // Публичная ИИ-проверка чек-листа гайда (без авторизации)
  if (p === '/api/guide-check' && m === 'POST') {
    try { return j(await guideCheck(env, body)); }
    catch (e) { return j({ error: 'server' }, 500); }
  }

  // Лид-магнит с лендинга: письмо со ссылкой на гайд (без авторизации)
  if (p === '/api/lead' && m === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const lang = ['ru', 'pl', 'en'].includes(body.lang) ? body.lang : 'ru';
    if (!/.+@.+\..+/.test(email)) return j({ error: 'bad_email' }, 400);
    const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
    const guideUrl = base + '/storage/guide/hiring-by-data';
    try { await S.upsert('leads', { id: uid(12), data: { email, lang, source: 'landing_popup', createdAt: new Date().toISOString() } }); } catch (e) {}
    const LEAD = {
      ru: { subj: 'Ваш гайд по найму — HR PRO AI', eyebrow: 'Бесплатный гайд', head: 'Как нанимать по данным, а не по интуиции',
        body: 'Спасибо за интерес! Ваш практический гайд готов: 4 теста, чтение спектр-профиля и 12 ошибок найма, которые стоят компаниям зарплат. Откройте по кнопке ниже.', cta: 'Открыть гайд' },
      pl: { subj: 'Twój przewodnik rekrutacyjny — HR PRO AI', eyebrow: 'Bezpłatny przewodnik', head: 'Jak zatrudniać na danych, a nie na przeczuciu',
        body: 'Dziękujemy za zainteresowanie! Twój praktyczny przewodnik jest gotowy: 4 testy, czytanie profilu-spektrum i 12 błędów rekrutacji. Otwórz go poniżej.', cta: 'Otwórz przewodnik' },
      en: { subj: 'Your hiring guide — HR PRO AI', eyebrow: 'Free guide', head: 'How to hire on data, not gut feeling',
        body: 'Thanks for your interest! Your practical guide is ready: the 4 tests, reading a spectrum profile, and 12 hiring mistakes that cost companies salaries. Open it below.', cta: 'Open the guide' },
    }[lang];
    // демо-режим: welcome-письмо со «шагами» (как онбординг-макет) — для проверки дизайна
    const WELCOME = {
      ru: { subj: 'Ваш кабинет HR PRO AI готов', eyebrow: 'Добро пожаловать', head: 'Ваш кабинет HR PRO AI готов',
        body: 'Здравствуйте, Денис!<br><br>Аккаунт создан — теперь вы можете отправлять кандидатам оценки и получать спектр-профили с рекомендацией ИИ. Вот три шага, чтобы начать за пару минут.',
        cta: 'Открыть кабинет', note: 'На балансе уже 5 бесплатных тестов',
        steps: [{ title: 'Пополните баланс', sub: '5 тестов уже начислены — этого хватит на первых кандидатов.' },
          { title: 'Отправьте первую оценку', sub: 'Введите email кандидата, выберите тесты и нажмите «Отправить».' },
          { title: 'Читайте спектр-профиль', sub: 'Как только кандидат пройдёт, ИИ соберёт отчёт с рекомендацией.' }] },
    }[lang] || null;
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const tok = await unsubToken(env.SECRET, email);
        const unsubUrl = `${base}/unsubscribe?e=${btoa(email)}&t=${tok}&lang=${lang}`;
        const W = body.demo === 'welcome' && WELCOME ? WELCOME : null;
        const html = W
          ? wrapEmailEdge({ lang, baseUrl: base, unsubUrl, subject: W.subj, eyebrow: W.eyebrow, headline: W.head,
              bodyHtml: W.body, steps: W.steps, ctaUrl: base + '/app', ctaLabel: W.cta, ctaNote: W.note })
          : wrapEmailEdge({ lang, baseUrl: base, unsubUrl, subject: LEAD.subj, eyebrow: LEAD.eyebrow,
              headline: LEAD.head, bodyHtml: LEAD.body, ctaUrl: guideUrl, ctaLabel: LEAD.cta });
        await fetch('https://api.resend.com/emails', { method: 'POST',
          headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [email], subject: (W ? W.subj : LEAD.subj), html }) });
      } catch (e) {}
    }
    return j({ ok: true });
  }

  // ── Google OAuth (Authorization Code, server-side) ──
  const redir = (to) => new Response(null, { status: 302, headers: { Location: url.origin + to } });
  if (p === '/api/auth/google' && m === 'GET') {
    const clientId = env.GOOGLE_CLIENT_ID;
    if (!clientId) return redir('/login?err=google_off');
    const next = url.searchParams.get('next') || '/app';
    const state = await goog.makeState(env.SECRET, next);
    const cUrl = goog.consentUrl({ clientId, redirectUri: url.origin + '/api/auth/google/callback', state });
    return new Response(null, { status: 302, headers: { Location: cUrl,
      'set-cookie': `goauth=${encodeURIComponent(state)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600` } });
  }
  if (p === '/api/auth/google/callback' && m === 'GET') {
    if (url.searchParams.get('error')) return redir('/login?err=google_cancel');
    const code = url.searchParams.get('code'), state = url.searchParams.get('state');
    const st = await goog.readState(env.SECRET, state);
    const cookies = parseCookies(req.headers.get('cookie'));
    if (!code || !st || cookies.goauth !== state) return redir('/login?err=google_state');
    const ex = await goog.exchangeCode({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET,
      code, redirectUri: url.origin + '/api/auth/google/callback' });
    if (ex.error || !ex.token || !ex.token.access_token) return redir('/login?err=google_token');
    const pr = await goog.fetchProfile(ex.token.access_token);
    if (pr.error || !pr.profile || !pr.profile.email) return redir('/login?err=google_profile');
    const prof = pr.profile;
    if (prof.email_verified === false) return redir('/login?err=google_unverified');
    const email = String(prof.email).trim();
    const rows = await S.select('users', `email=eq.${encodeURIComponent(email.toLowerCase())}&select=data`);
    let u = rows[0] && rows[0].data;
    if (u) {
      if (u.blocked === true) return redir('/login?err=blocked');
      u.googleId = prof.sub; if (!u.avatar && prof.picture) u.avatar = prof.picture;
      u.lastLoginAt = new Date().toISOString();
      await S.upsert('users', { id: u.id, data: u });
    } else {
      const gs = await settings();
      if (gs.registrationOpen === false) return redir('/login?err=reg_closed');
      const bonus = Math.max(0, parseInt(gs.signupBonus, 10) || 0);
      const parts = String(prof.name || '').trim().split(/\s+/);
      const gname = prof.given_name || parts[0] || email.split('@')[0];
      const gsurname = prof.family_name || parts.slice(1).join(' ') || '';
      u = { id: uid(12), email, password: '', googleId: prof.sub, avatar: prof.picture || '',
        name: gname, company: '', balanceTotal: bonus, balancePending: 0, balanceLots: [],
        settings: { uiLang: 'ru', surname: gsurname }, role: 'user', blocked: false, adminNote: '', provider: 'google',
        createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
      if (bonus > 0) addBalanceLot(u, bonus, 'signup_bonus');
      await S.upsert('users', { id: u.id, data: u });
    }
    const dest = st.next && st.next.startsWith('/') ? st.next : '/app';
    const headers = new Headers({ Location: url.origin + dest });
    headers.append('set-cookie', `uid=${encodeURIComponent(await signCookie(env, u.id))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`);
    headers.append('set-cookie', 'goauth=; Path=/; Max-Age=0');
    return new Response(null, { status: 302, headers });
  }

  if (p === '/sitemap.xml') { // авто-sitemap: статические страницы + опубликованные посты блога
    const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
    const gs = await settings();
    const staticU = ['/', '/blog', '/login', '/privacy', '/terms'];
    const posts = (gs.blogPosts || []).filter(x => x && x.published && x.slug);
    const rows = [
      ...staticU.map(u => `  <url><loc>${base}${u}</loc></url>`),
      ...posts.map(pp => `  <url><loc>${base}/blog/${pp.slug}</loc>${pp.date ? `<lastmod>${String(pp.date).slice(0, 10)}</lastmod>` : ''}</url>`),
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>`;
    return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
  }

  if (p === '/api/meta') {
    const gs = await settings();
    return j({ langs: [{ code: 'ru', name: 'Русский' }, { code: 'uk', name: 'Украи́нский' }, { code: 'pl', name: 'Польский' }, { code: 'en', name: 'Английский' }],
      registrationOpen: gs.registrationOpen !== false, portalName: gs.portalName || 'HR PRO AI' });
  }

  if (p === '/api/plans') {
    const gs = await settings();
    const plans = (gs.plans || []).filter(x => x.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    return j({ plans, currency: gs.currency || 'eur', stripe: !!(gs.stripe && gs.stripe.secretKey) });
  }

  // ── Публичный блог (SEO): опубликованные посты из gs.blogPosts ──
  if (p === '/api/blog' && m === 'GET') {
    const gs = await settings();
    const langQ = url.searchParams.get('lang');
    let posts = (gs.blogPosts || []).filter(x => x && x.published);
    if (langQ && ['ru', 'pl', 'en'].includes(langQ)) posts = posts.filter(x => (x.lang || 'ru') === langQ);
    posts = posts.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .map(x => ({ slug: x.slug, title: x.title, excerpt: x.excerpt || '', cover: x.cover || '', lang: x.lang || 'ru', tags: x.tags || [], date: x.date }));
    return j({ posts });
  }
  let mBlogPost = p.match(/^\/api\/blog\/([\w-]+)$/);
  if (mBlogPost && m === 'GET') {
    const gs = await settings();
    const post = (gs.blogPosts || []).find(x => x && x.published && x.slug === mBlogPost[1]);
    if (!post) return j({ error: 'not_found' }, 404);
    return j({ post: { slug: post.slug, title: post.title, excerpt: post.excerpt || '', contentHtml: post.contentHtml || '',
      cover: post.cover || '', lang: post.lang || 'ru', tags: post.tags || [], date: post.date } });
  }

  if (p === '/api/login' && m === 'POST') {
    const rows = await S.select('users', `email=eq.${encodeURIComponent(String(body.email || '').toLowerCase())}&select=data`);
    const u = rows[0] && rows[0].data;
    if (!u || !(await verifyPassword(body.password || '', u.password))) return j({ error: 'Неверный email или пароль' }, 401);
    if (u.blocked === true) return j({ error: 'Аккаунт заблокирован. Свяжитесь с поддержкой.' }, 403);
    u.lastLoginAt = new Date().toISOString();
    await S.upsert('users', { id: u.id, data: u });
    const cookie = `uid=${encodeURIComponent(await signCookie(env, u.id))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
    return j({ user: publicUser(u) }, 200, { 'set-cookie': cookie });
  }

  if (p === '/api/logout' && m === 'POST')
    return j({ ok: true }, 200, { 'set-cookie': 'uid=; Path=/; Max-Age=0' });

  if (p === '/api/me') {
    const u = await currentUser(env, req);
    if (!u) return j({ error: 'Не авторизован' }, 401);
    if (expireBalance(u) > 0) await S.upsert('users', { id: u.id, data: u });
    return j({ user: publicUser(u) });
  }

  if (p === '/api/register' && m === 'POST') {
    const gs = await settings();
    if (gs.registrationOpen === false) return j({ error: 'Регистрация временно закрыта' }, 403);
    const email = String(body.email || '').trim();
    if (!email || !body.password) return j({ error: 'Укажите email и пароль' }, 400);
    const exists = await S.select('users', `email=eq.${encodeURIComponent(email.toLowerCase())}&select=id`);
    if (exists.length) return j({ error: 'Пользователь с таким email уже существует' }, 409);
    const bonus = Math.max(0, parseInt(gs.signupBonus, 10) || 0);
    const u = { id: uid(12), email, password: await hashPassword(body.password), name: body.name || email.split('@')[0],
      company: body.company || '', balanceTotal: bonus, balancePending: 0, balanceLots: [],
      settings: { uiLang: 'ru' }, role: 'user', blocked: false, adminNote: '', createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
    if (bonus > 0) addBalanceLot(u, bonus, 'signup_bonus');
    await S.upsert('users', { id: u.id, data: u });
    const cookie = `uid=${encodeURIComponent(await signCookie(env, u.id))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
    return j({ user: publicUser(u) }, 200, { 'set-cookie': cookie });
  }

  // ── Восстановление пароля: запрос ссылки ──
  // Всегда отвечаем {ok:true} — не раскрываем, существует ли email. Токен живёт 1 час.
  if (p === '/api/forgot' && m === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const lang = ['ru', 'pl', 'en', 'uk'].includes(body.lang) ? body.lang : 'ru';
    if (!/.+@.+\..+/.test(email)) return j({ ok: true });
    try {
      const rows = await S.select('users', `email=eq.${encodeURIComponent(email)}&select=data`);
      const u = rows[0] && rows[0].data;
      const resendKey = env.RESEND_API_KEY;
      if (u && !u.blocked && resendKey) {
        const base = (env.BASE_URL || url.origin).replace(/\/+$/, '');
        const exp = Math.floor(Date.now() / 1000) + 3600; // +1 час
        const sig = await resetToken(env.SECRET, email, exp);
        const resetUrl = `${base}/reset?e=${btoa(email)}&t=${sig}&exp=${exp}&lang=${lang}`;
        const FORGOT = {
          ru: { subj: 'Сброс пароля — HR PRO AI', eyebrow: 'Безопасность', head: 'Сброс пароля',
            body: 'Мы получили запрос на сброс пароля для вашего аккаунта HR PRO AI. Нажмите кнопку ниже, чтобы задать новый пароль. Ссылка действует 1 час.', cta: 'Сбросить пароль',
            note: 'Если вы не запрашивали сброс — просто проигнорируйте это письмо, ваш пароль останется прежним.' },
          pl: { subj: 'Reset hasła — HR PRO AI', eyebrow: 'Bezpieczeństwo', head: 'Reset hasła',
            body: 'Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta HR PRO AI. Kliknij przycisk poniżej, aby ustawić nowe hasło. Link jest ważny 1 godzinę.', cta: 'Zresetuj hasło',
            note: 'Jeśli nie prosiłeś o reset — zignoruj tę wiadomość, Twoje hasło pozostanie bez zmian.' },
          en: { subj: 'Password reset — HR PRO AI', eyebrow: 'Security', head: 'Password reset',
            body: 'We received a request to reset the password for your HR PRO AI account. Click the button below to set a new password. This link is valid for 1 hour.', cta: 'Reset password',
            note: 'If you did not request this — just ignore this email, your password will stay the same.' },
          uk: { subj: 'Скидання пароля — HR PRO AI', eyebrow: 'Безпека', head: 'Скидання пароля',
            body: 'Ми отримали запит на скидання пароля для вашого акаунта HR PRO AI. Натисніть кнопку нижче, щоб задати новий пароль. Посилання дійсне 1 годину.', cta: 'Скинути пароль',
            note: 'Якщо ви не запитували скидання — просто проігноруйте цей лист, ваш пароль залишиться незмінним.' },
        }[lang] || {};
        const tok = await unsubToken(env.SECRET, email);
        const unsubUrl = `${base}/unsubscribe?e=${btoa(email)}&t=${tok}&lang=${lang}`;
        const html = wrapEmailEdge({ lang, baseUrl: base, unsubUrl, subject: FORGOT.subj, eyebrow: FORGOT.eyebrow,
          headline: FORGOT.head, bodyHtml: FORGOT.body, ctaUrl: resetUrl, ctaLabel: FORGOT.cta, ctaNote: FORGOT.note });
        await fetch('https://api.resend.com/emails', { method: 'POST',
          headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [email], subject: FORGOT.subj, html }) });
      }
    } catch (e) {}
    return j({ ok: true });
  }

  // ── Восстановление пароля: установка нового ──
  if (p === '/api/reset' && m === 'POST') {
    let email = '';
    try { email = atob(String(body.e || '')).trim().toLowerCase(); } catch (_) { return j({ error: 'invalid_token' }, 400); }
    const password = String(body.password || '');
    const ok = await verifyResetToken(env.SECRET, email, body.exp, String(body.t || ''));
    if (!ok) return j({ error: 'invalid_token' }, 400);
    if (password.length < 6) return j({ error: 'weak_password' }, 400);
    const rows = await S.select('users', `email=eq.${encodeURIComponent(email)}&select=data`);
    const u = rows[0] && rows[0].data;
    if (!u) return j({ error: 'invalid_token' }, 400);
    u.password = await hashPassword(password);
    u.passwordResetAt = new Date().toISOString();
    await S.upsert('users', { id: u.id, data: u });
    return j({ ok: true });
  }

  // ── дальше — только для авторизованных ──
  const me = await currentUser(env, req);
  const needAuth = () => j({ error: 'Не авторизован' }, 401);

  // ── АДМИН-API ──
  if (p.startsWith('/api/admin/')) {
    if (!me) return needAuth();
    if (me.role !== 'admin') return j({ error: 'Доступ запрещён' }, 403);
    const gsAdmin = await settings();
    const res = await handleAdmin(p, m, { S, j, url, body, me, uid, publicUser, hashPassword,
      gs: gsAdmin, saveSettings: (s) => S.upsert('settings', { id: 'portal', data: s }),
      testTitleOf, env, makeStripe, signCookie: (v) => signCookie(env, v) });
    if (res) return res;
    return j({ error: 'edge: admin маршрут в разработке', path: p }, 501);
  }

  if (p === '/api/settings' && m === 'GET') {
    if (!me) return needAuth();
    return j({ user: publicUser(me), langs: [{ code: 'ru', name: 'Русский' }, { code: 'uk', name: 'Украи́нский' }, { code: 'pl', name: 'Польский' }, { code: 'en', name: 'Английский' }] });
  }

  if (p === '/api/balance' && m === 'GET') {
    if (!me) return needAuth();
    if (expireBalance(me) > 0) await S.upsert('users', { id: me.id, data: me });
    return j({ balance: publicUser(me), ttlDays: BALANCE_TTL_DAYS });
  }

  if (p === '/api/sections' && m === 'GET') {
    if (!me) return needAuth();
    const rows = await S.select('sections', `user_id=eq.${me.id}&select=data`);
    return j({ sections: rows.map(r => r.data).sort((a, b) => (a.order || 0) - (b.order || 0)) });
  }

  if (p === '/api/vacancies' && m === 'GET') {
    if (!me) return needAuth();
    const rows = await S.select('vacancies', `user_id=eq.${me.id}&select=data`);
    let list = rows.map(r => r.data);
    const sec = url.searchParams.get('sectionId');
    if (sec && sec !== 'all') list = list.filter(v => (v.sectionId || '') === sec);
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return j({ vacancies: list });
  }

  if (p === '/api/purchases' && m === 'GET') {
    if (!me) return needAuth();
    const rows = await S.select('purchases', `user_id=eq.${me.id}&select=data`);
    return j({ purchases: rows.map(r => r.data).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')) });
  }

  if (p === '/api/dashboard' && m === 'GET') {
    if (!me) return needAuth();
    if (expireBalance(me) > 0) await S.upsert('users', { id: me.id, data: me });
    const [pr, tr, vr, ar] = await Promise.all([
      S.select('participants', `user_id=eq.${me.id}&select=data`),
      S.select('tests', `user_id=eq.${me.id}&select=data`),
      S.select('vacancies', `user_id=eq.${me.id}&select=data`),
      S.select('anketas', `user_id=eq.${me.id}&select=data`),
    ]);
    const parts = pr.map(r => r.data), tests = tr.map(r => r.data), vacs = vr.map(r => r.data), anketas = ar.map(r => r.data);
    const done = tests.filter(t => t.status === 'done');
    const byStage = {}; parts.forEach(x => { const s = x.stage || 'Без этапа'; byStage[s] = (byStage[s] || 0) + 1; });
    const byType = { tools: 0, result: 0, logic: 0, sales: 0 }; tests.forEach(t => { if (byType[t.type] != null) byType[t.type]++; });
    const doneByType = { tools: 0, result: 0, logic: 0, sales: 0 }; done.forEach(t => { if (doneByType[t.type] != null) doneByType[t.type]++; });
    const applied = parts.length, tested = new Set(done.map(t => t.participantId)).size;
    const funnel = [
      { key: 'applied', label: 'Кандидаты', value: applied },
      { key: 'tested', label: 'Прошли тест', value: tested },
      { key: 'interview', label: 'Собеседование', value: byStage['Собеседование'] || 0 },
      { key: 'reserve', label: 'Резерв', value: byStage['Резерв'] || 0 },
      { key: 'hired', label: 'Приняты', value: byStage['Принят'] || 0 },
    ];
    const days = []; const now = new Date();
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().slice(0, 10), count: 0 }); }
    parts.forEach(x => { const day = days.find(d => d.date === (x.createdAt || '').slice(0, 10)); if (day) day.count++; });
    const vacCounts = vacs.map(v => ({ name: v.name, count: parts.filter(x => x.vacancyId === v.id).length })).sort((a, b) => b.count - a.count).slice(0, 5);
    const recent = parts.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6).map(x => {
      const vac = vacs.find(v => v.id === x.vacancyId);
      return { id: x.id, name: ((x.name || '') + ' ' + (x.surname || '')).trim() || x.email, email: x.email, stage: x.stage || 'Без этапа', createdAt: x.createdAt, vacancyName: vac ? vac.name : '' };
    });
    return j({
      totals: { candidates: parts.length, testsSent: tests.length, testsDone: done.length, testsPending: tests.length - done.length,
        balance: (me.balanceTotal || 0) - (me.balancePending || 0), vacancies: vacs.length, anketas: anketas.length,
        applications: parts.filter(x => x.anketaId).length,
        conversion: applied ? Math.round(100 * (byStage['Принят'] || 0) / applied) : 0 },
      byStage, byType, doneByType, funnel, days, vacCounts, recent,
    });
  }

  const saveUser = async (u) => S.upsert('users', { id: u.id, data: u });
  const BASE = env.PORTAL_BASE_URL || url.origin;
  const lang = ['ru', 'pl', 'en'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'ru';
  const shortCode = (n = 10) => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; const b = new Uint8Array(n); crypto.getRandomValues(b);
    return Array.from(b, x => a[x % a.length]).join(''); };
  const findByCode = async (code) => { const r = await S.select('tests', `code=eq.${encodeURIComponent(code)}&select=data`); return r[0] ? r[0].data : null; };
  const logBalance = async (u, delta, kind, extra) => S.upsert('balance_log', { id: uid(12),
    data: { id: uid(12), userId: u.id, delta, kind, comment: '', adminId: null, purchaseId: null, testId: null,
      balanceAfter: u.balanceTotal, createdAt: new Date().toISOString(), ...(extra || {}) } });
  const orderTypes = (types, u, vac) => {
    const ord = vac ? (processOf(vac).order || ['result', 'tools', 'logic', 'sales'])
      : ((u.settings && Array.isArray(u.settings.testOrder)) ? u.settings.testOrder : ['result', 'tools', 'logic', 'sales']);
    return types.slice().sort((a, b) => { const ia = ord.indexOf(a), ib = ord.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
  };
  // Загрузка файла (base64 dataUrl) в Supabase Storage (bucket media, публичный)
  const storeMedia = async (dataUrl, name, maxMb = 40) => {
    const mm = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ''));
    if (!mm) return null;
    const bin = atob(mm[2]);
    if (bin.length > maxMb * 1024 * 1024) return null;
    const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm',
      'application/pdf': 'pdf', 'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx' };
    const ext = extMap[mm[1]] || (String(name || '').split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
    const path2 = 'uploads/' + uid(16) + '.' + ext;
    const base = env.SUPABASE_URL.replace(/\/$/, ''); const key = env.SUPABASE_SECRET_KEY;
    const r = await fetch(`${base}/storage/v1/object/media/${path2}`, { method: 'POST',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': mm[1], 'x-upsert': 'true' }, body: bytes });
    if (!r.ok) return null;
    return `${base}/storage/v1/object/public/media/${path2}`;
  };
  async function participantView(x) {
    const tr = await S.select('tests', `participant_id=eq.${x.id}&select=data`);
    const tests = tr.map(r => r.data).map(t => ({ id: t.id, type: t.type, title: testTitleOf(t.type), status: t.status,
      code: t.code, sentAt: t.sentAt, startedAt: t.startedAt, finishedAt: t.finishedAt, durationSec: t.durationSec,
      link: `${BASE}/t/${t.code}`, rate: t.overallRate || null }));
    const vac = x.vacancyId ? await S.one('vacancies', x.vacancyId) : null;
    return { ...x, vacancyName: vac ? vac.name : '', tests };
  }

  // ── SECTIONS CRUD ──
  if (p === '/api/sections' && m === 'POST') {
    if (!me) return needAuth();
    if (!body.name) return j({ error: 'Укажите название раздела' }, 400);
    const cnt = (await S.select('sections', `user_id=eq.${me.id}&select=id`)).length;
    const s = { id: uid(10), userId: me.id, name: body.name, order: cnt, createdAt: new Date().toISOString() };
    await S.upsert('sections', { id: s.id, data: s });
    return j({ section: s });
  }
  let mS = p.match(/^\/api\/sections\/([\w-]+)$/);
  if (mS && me) {
    const cur = await S.one('sections', mS[1]);
    if (!cur || cur.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'PUT') { if (body.name != null) cur.name = String(body.name); if (body.order != null) cur.order = body.order;
      await S.upsert('sections', { id: cur.id, data: cur }); return j({ section: cur }); }
    if (m === 'DELETE') { await S.del('sections', `id=eq.${cur.id}`); return j({ ok: true }); }
  }

  // ── VACANCIES CRUD ──
  if (p === '/api/vacancies' && m === 'POST') {
    if (!me) return needAuth();
    if (!body.name) return j({ error: 'Укажите название вакансии' }, 400);
    const cnt = (await S.select('vacancies', `user_id=eq.${me.id}&select=id`)).length;
    const v = { id: uid(10), userId: me.id, sectionId: body.sectionId || null, name: body.name,
      lang: LANGS.some(l => l.code === body.lang) ? body.lang : 'ru', order: cnt, createdAt: new Date().toISOString() };
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ vacancy: v });
  }
  let mV = p.match(/^\/api\/vacancies\/([\w-]+)$/);
  if (mV && me) {
    const cur = await S.one('vacancies', mV[1]);
    if (!cur || cur.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'PUT') { ['name', 'sectionId', 'lang', 'order', 'adText', 'adMode', 'published'].forEach(f => { if (body[f] !== undefined) cur[f] = body[f]; });
      await S.upsert('vacancies', { id: cur.id, data: cur }); return j({ vacancy: cur }); }
    if (m === 'DELETE') { await S.del('vacancies', `id=eq.${cur.id}`); return j({ ok: true }); }
  }
  let mVF = p.match(/^\/api\/vacancies\/([\w-]+)\/full$/);
  if (mVF && m === 'GET') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVF[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    return j({ vacancy: vacFull(v) });
  }
  let mVProc = p.match(/^\/api\/vacancies\/([\w-]+)\/process$/);
  if (mVProc && m === 'PUT') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVProc[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const proc = processOf(v);
    if (typeof body.auto === 'boolean') proc.auto = body.auto;
    if (body.target === 'performer' || body.target === 'executor') proc.target = body.target;
    if (body.linkDays !== undefined) proc.linkDays = Math.max(1, Math.min(365, parseInt(body.linkDays, 10) || 3));
    if (Array.isArray(body.order)) {
      const def = ['result', 'tools', 'logic', 'sales', 'knowledge'];
      const clean = body.order.filter(k => def.includes(k));
      if (clean.length === def.length && new Set(clean).size === def.length) proc.order = clean;
    }
    ['stages', 'optional', 'aiCalls', 'critical'].forEach(g => {
      if (body[g] && typeof body[g] === 'object') Object.keys(proc[g]).forEach(k => { if (typeof body[g][k] === 'boolean') proc[g][k] = body[g][k]; });
    });
    if (proc.stages.result === false) proc.aiCalls.afterResult = false;
    if (proc.stages.tools === false) proc.aiCalls.afterTools = false;
    if (proc.stages.motivation === false) proc.aiCalls.motivation = false;
    v.process = proc;
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ process: proc });
  }
  let mVBoard = p.match(/^\/api\/vacancies\/([\w-]+)\/board$/);
  if (mVBoard && m === 'GET') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVBoard[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const [pr, tr] = await Promise.all([
      S.select('participants', `user_id=eq.${me.id}&select=data`),
      S.select('tests', `user_id=eq.${me.id}&select=data`),
    ]);
    const parts = pr.map(r => r.data).filter(x => x.vacancyId === v.id);
    const tests = tr.map(r => r.data);
    return j(buildBoard(v, parts, tests, lang));
  }
  let mVConf = p.match(/^\/api\/vacancies\/([\w-]+)\/config$/);
  if (mVConf && m === 'PUT') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVConf[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (body.adText != null) v.adText = String(body.adText).slice(0, 40000);
    if (body.adMode && ['ai', 'manual'].includes(body.adMode)) v.adMode = body.adMode;
    if (typeof body.published === 'boolean') v.published = body.published;
    if (Array.isArray(body.workflow)) v.workflow = body.workflow.filter(k => recruit.STAGE_KEYS.includes(k));
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ vacancy: vacFull(v) });
  }
  const cleanKnowledge = (input) => {
    const passScore = Math.max(0, Math.min(100, parseInt(input && input.passScore, 10) || 60));
    const questions = (Array.isArray(input && input.questions) ? input.questions : []).slice(0, 100).map(q => {
      const type = q && q.type === 'multi' ? 'multi' : 'single';
      const options = (Array.isArray(q && q.options) ? q.options : []).slice(0, 12).map(o => ({ text: String((o && o.text) || '').slice(0, 500), correct: !!(o && o.correct) }));
      return { id: String((q && q.id) || uid(6)).slice(0, 24), text: String((q && q.text) || '').slice(0, 2000),
        image: String((q && q.image) || '').slice(0, 100000), video: String((q && q.video) || '').slice(0, 2000), type, options };
    }).filter(q => q.text && q.options.length);
    return { questions, passScore };
  };
  let mVKn = p.match(/^\/api\/vacancies\/([\w-]+)\/knowledge$/);
  if (mVKn && m === 'PUT') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVKn[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const kts = knowledgeTestsOf(v);
    const clean = cleanKnowledge(body);
    const name = String(body.name || '').slice(0, 120);
    let kt = body.ktId ? kts.find(k => k.id === body.ktId) : null;
    if (!kt) { kt = { id: uid(8), name: name || ('Тест ' + (kts.length + 1)), questions: [], passScore: 60 }; kts.push(kt); }
    if (name) kt.name = name;
    kt.questions = clean.questions; kt.passScore = clean.passScore;
    v.knowledge = kts[0] ? { questions: kts[0].questions, passScore: kts[0].passScore } : { questions: [], passScore: 60 };
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ knowledgeTests: kts, ktId: kt.id });
  }
  let mVKnAi = p.match(/^\/api\/vacancies\/([\w-]+)\/knowledge-ai$/);
  if (mVKnAi && m === 'POST') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVKnAi[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const r = v.requisitionId ? await S.one('requisitions', v.requisitionId) : null;
    const questions = air.generateKnowledgeTest((r && r.form) || { position: v.name }, v.adText || '', v.lang || 'ru');
    if (!questions.length) return j({ error: 'Недостаточно данных в заявке — заполните продукт, обязанности и компетенции' }, 400);
    const kts = knowledgeTestsOf(v);
    let kt = body.ktId ? kts.find(k => k.id === body.ktId) : null;
    if (!kt) { kt = { id: uid(8), name: 'Тест по вакансии (ИИ)', questions: [], passScore: 60 }; kts.push(kt); }
    kt.questions = questions;
    v.knowledge = kts[0] ? { questions: kts[0].questions, passScore: kts[0].passScore } : v.knowledge;
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ knowledgeTests: kts, ktId: kt.id });
  }
  let mVKnDel = p.match(/^\/api\/vacancies\/([\w-]+)\/knowledge\/([\w-]+)$/);
  if (mVKnDel && m === 'DELETE') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVKnDel[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    v.knowledgeTests = knowledgeTestsOf(v).filter(k => k.id !== mVKnDel[2]);
    v.knowledge = v.knowledgeTests[0] ? { questions: v.knowledgeTests[0].questions, passScore: v.knowledgeTests[0].passScore } : { questions: [], passScore: 60 };
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ knowledgeTests: v.knowledgeTests });
  }
  let mVMot = p.match(/^\/api\/vacancies\/([\w-]+)\/motivation$/);
  if (mVMot && m === 'PUT') {
    if (!me) return needAuth();
    const v = await S.one('vacancies', mVMot[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    v.motivationQuestions = (Array.isArray(body.questions) ? body.questions : []).slice(0, 20)
      .map(q => ({ id: String((q && q.id) || uid(6)).slice(0, 24), text: String((q && q.text) || '').slice(0, 1000) })).filter(q => q.text);
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ motivationQuestions: v.motivationQuestions });
  }

  // ── PARTICIPANTS ──
  if (p === '/api/participants' && m === 'GET') {
    if (!me) return needAuth();
    const vId = url.searchParams.get('vacancyId');
    let filter = `data->>userId=eq.${me.id}`;
    if (vId && vId !== 'all') filter += `&data->>vacancyId=eq.${encodeURIComponent(vId)}`;
    const rows = await S.select('participants', `${filter}&select=data`);
    const list = rows.map(r => r.data).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const parts = [];
    for (const x of list) parts.push(await participantView(x));
    return j({ participants: parts });
  }
  if (p === '/api/participants' && m === 'POST') {
    if (!me) return needAuth();
    const x = { id: uid(12), userId: me.id, vacancyId: body.vacancyId || null,
      name: String(body.name || ''), surname: String(body.surname || ''), email: String(body.email || ''),
      sex: '', age: null, tel: String(body.tel || ''), city: String(body.city || ''), stage: 'Без этапа',
      comment: String(body.comment || ''), color: '#FFFFFF', starred: false, createdAt: new Date().toISOString() };
    await S.upsert('participants', { id: x.id, data: x });
    return j({ participant: await participantView(x) });
  }
  // Импорт CV: файлы (PDF/фото, base64 dataUrl) → Claude vision → карточки кандидатов
  if (p === '/api/candidates/import-cv' && m === 'POST') {
    if (!me) return needAuth();
    const files = Array.isArray(body.files) ? body.files.slice(0, 20) : [];
    if (!files.length) return j({ error: 'no_files' }, 400);
    if (!env.ANTHROPIC_API_KEY) return j({ error: 'no_ai' }, 400);
    const created = [], failed = [];
    for (const f of files) {
      const mm = /^data:([^;]+);base64,(.+)$/.exec(String(f.dataUrl || ''));
      if (!mm) { failed.push({ name: f.name, error: 'bad_file' }); continue; }
      const mime = mm[1].toLowerCase(), b64 = mm[2];
      if (b64.length > 16 * 1024 * 1024) { failed.push({ name: f.name, error: 'too_big' }); continue; }
      let block;
      if (mime === 'application/pdf') block = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } };
      else if (/^image\/(png|jpe?g|webp|gif)$/.test(mime)) block = { type: 'image', source: { type: 'base64', media_type: mime === 'image/jpg' ? 'image/jpeg' : mime, data: b64 } };
      else { failed.push({ name: f.name, error: 'unsupported' }); continue; }
      const res = await parseCV(env, block);
      if (res.error) { failed.push({ name: f.name, error: res.error }); continue; }
      const d = res.data || {};
      let cvUrl = null; try { cvUrl = await storeMedia(f.dataUrl, f.name, 15); } catch (e) {}
      const x = { id: uid(12), userId: me.id, vacancyId: body.vacancyId || null,
        name: String(d.name || '').slice(0, 60), surname: String(d.surname || '').slice(0, 60),
        email: String(d.email || '').slice(0, 120), sex: '', age: d.age ? (Number(d.age) || null) : null,
        tel: String(d.phone || '').slice(0, 40), city: String(d.city || '').slice(0, 60), stage: 'Без этапа',
        comment: cvSummary(d, lang), color: '#FFFFFF', starred: false, cv: cvUrl, cvData: d, source: 'cv_import',
        createdAt: new Date().toISOString() };
      await S.upsert('participants', { id: x.id, data: x });
      created.push(await participantView(x));
    }
    return j({ created, failed });
  }
  let mP = p.match(/^\/api\/participants\/([\w-]+)$/);
  if (mP && me) {
    const cur = await S.one('participants', mP[1]);
    if (!cur || cur.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'GET') return j({ participant: await participantView(cur) });
    if (m === 'PUT') { ['name', 'surname', 'email', 'sex', 'age', 'tel', 'city', 'stage', 'comment', 'color', 'vacancyId', 'starred'].forEach(f => { if (body[f] !== undefined) cur[f] = body[f]; });
      await S.upsert('participants', { id: cur.id, data: cur }); return j({ participant: await participantView(cur) }); }
    if (m === 'DELETE') { await S.del('tests', `participant_id=eq.${cur.id}`); await S.del('participants', `id=eq.${cur.id}`); return j({ ok: true }); }
  }

  // ── АНКЕТЫ (мини-сайт отклика) ──
  const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', ё: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'i', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'iu', я: 'ia' };
  const slugify = s => String(s || '').toLowerCase().trim().replace(/[а-яёіїєґ]/g, ch => TRANSLIT[ch] != null ? TRANSLIT[ch] : ch).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  const companyPrefix = u => slugify(String((u && u.company) || '').trim().split(/\s+/)[0] || '').slice(0, 20);
  const anketaView = async (a, vacs, parts) => {
    const vac = (vacs || []).find(v => v.id === a.vacancyId) || (a.vacancyId ? await S.one('vacancies', a.vacancyId) : null);
    const applied = parts ? parts.filter(x => x.anketaId === a.id).length : (await S.select('participants', `data->>anketaId=eq.${a.id}&select=id`)).length;
    return { ...a, vacancyName: vac ? vac.name : '', url: `${BASE}/a/${a.slug}`, applied };
  };
  const applyAnketaFields = (a, b) => {
    if (b.title != null) a.title = String(b.title);
    if (b.vacancyId !== undefined) a.vacancyId = b.vacancyId || null;
    if (Array.isArray(b.tests)) a.tests = b.tests.filter(t => ['result', 'tools', 'logic', 'sales'].includes(t));
    ['btnText', 'pageTitle', 'msgApply', 'msgDone', 'description'].forEach(f => { if (b[f] != null) a[f] = String(b[f]); });
    ['noCaptcha', 'sendEmail'].forEach(f => { if (b[f] != null) a[f] = !!b[f]; });
  };
  const uniqueSlug = async (base, exceptId) => {
    const existing = (await S.select('anketas', `select=data`)).map(r => r.data);
    let slug = slugify(base) || ('anketa-' + shortCode(5).toLowerCase()); let s = slug, i = 1;
    while (existing.find(a => a.slug === s && a.id !== exceptId)) s = slug + '-' + (++i);
    return s;
  };
  const prefixedSlug = async (u, base, exceptId) => {
    const pfx = companyPrefix(u); let raw = slugify(base) || 'anketa';
    if (pfx && raw !== pfx && !raw.startsWith(pfx + '-')) raw = pfx + '-' + raw;
    return uniqueSlug(raw, exceptId);
  };
  if (p === '/api/anketas' && m === 'GET') {
    if (!me) return needAuth();
    const [ar, vr, pr] = await Promise.all([
      S.select('anketas', `user_id=eq.${me.id}&select=data`),
      S.select('vacancies', `user_id=eq.${me.id}&select=data`),
      S.select('participants', `user_id=eq.${me.id}&select=data`),
    ]);
    const vacs = vr.map(r => r.data), parts = pr.map(r => r.data);
    const list = ar.map(r => r.data).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return j({ anketas: await Promise.all(list.map(a => anketaView(a, vacs, parts))), prefix: companyPrefix(me) });
  }
  if (p === '/api/anketas' && m === 'POST') {
    if (!me) return needAuth();
    if (body.vacancyId) {
      const ex = (await S.select('anketas', `user_id=eq.${me.id}&data->>vacancyId=eq.${body.vacancyId}&select=data`)).map(r => r.data)[0];
      if (ex) { applyAnketaFields(ex, body); await S.upsert('anketas', { id: ex.id, data: ex }); return j({ anketa: await anketaView(ex) }); }
    }
    const slug = await prefixedSlug(me, body.slug || body.title || 'anketa');
    const a = { id: uid(12), userId: me.id, slug, title: body.title || 'Новая анкета', vacancyId: null, tests: [],
      btnText: 'Откликнуться', pageTitle: '', msgApply: 'Спасибо! Ваш отклик получен.',
      msgDone: 'Отлично! Вы ответили на все вопросы. HR-менеджер свяжется с вами после рассмотрения результатов.',
      noCaptcha: false, sendEmail: true, description: '', createdAt: new Date().toISOString() };
    applyAnketaFields(a, body);
    await S.upsert('anketas', { id: a.id, data: a });
    return j({ anketa: await anketaView(a) });
  }
  let mAnk = p.match(/^\/api\/anketas\/([\w-]+)$/);
  if (mAnk && me) {
    const a = await S.one('anketas', mAnk[1]);
    if (!a || a.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'GET') return j({ anketa: await anketaView(a) });
    if (m === 'PUT') {
      if (body.slug != null && slugify(body.slug) && (await prefixedSlug(me, body.slug, a.id)) !== a.slug) a.slug = await prefixedSlug(me, body.slug, a.id);
      applyAnketaFields(a, body); await S.upsert('anketas', { id: a.id, data: a });
      return j({ anketa: await anketaView(a) });
    }
    if (m === 'DELETE') { await S.del('anketas', `id=eq.${a.id}`); return j({ ok: true }); }
  }
  // Публичная анкета + отклик
  let mAPub = p.match(/^\/api\/a\/([\w-]+)$/);
  if (mAPub && m === 'GET') {
    const a = (await S.select('anketas', `data->>slug=eq.${encodeURIComponent(mAPub[1])}&select=data`)).map(r => r.data)[0];
    if (!a) return j({ error: 'Анкета не найдена' }, 404);
    const owner = await S.one('users', a.userId);
    if (owner && owner.blocked === true) return j({ error: 'Ссылка недоступна' }, 404);
    const avac = a.vacancyId ? await S.one('vacancies', a.vacancyId) : null;
    const alang = avac && ['ru', 'pl', 'en'].includes(avac.lang) ? avac.lang : 'ru';
    return j({ anketa: { slug: a.slug, title: a.title, pageTitle: a.pageTitle || a.title, btnText: a.btnText || 'Откликнуться',
      description: a.description || '', noCaptcha: a.noCaptcha, hasTests: (a.tests || []).length > 0, lang: alang,
      company: owner ? owner.company : '', logo: owner && owner.settings ? owner.settings.logo : '' } });
  }
  let mApply = p.match(/^\/api\/a\/([\w-]+)\/apply$/);
  if (mApply && m === 'POST') {
    const a = (await S.select('anketas', `data->>slug=eq.${encodeURIComponent(mApply[1])}&select=data`)).map(r => r.data)[0];
    if (!a) return j({ error: 'Анкета не найдена' }, 404);
    const owner = await S.one('users', a.userId);
    if (owner && owner.blocked === true) return j({ error: 'Ссылка недоступна' }, 404);
    const email = String(body.email || '').trim();
    if (!email || !/.+@.+\..+/.test(email)) return j({ error: 'Укажите корректный email' }, 400);
    const avac = a.vacancyId ? await S.one('vacancies', a.vacancyId) : null;
    let cv = null;
    if (body.cvData) { const cvUrl = await storeMedia(body.cvData, body.cvName, 12); if (cvUrl) cv = { name: String(body.cvName || 'resume').slice(0, 120), url: cvUrl }; }
    const part = { id: uid(12), userId: a.userId, vacancyId: a.vacancyId || null, anketaId: a.id, src: String(body.src || '').slice(0, 60),
      name: String(body.name || '').trim(), surname: String(body.surname || '').trim(), email,
      sex: body.sex || '', age: body.age ? parseInt(body.age, 10) : null, tel: String(body.tel || '').trim(), city: String(body.city || '').trim(),
      stage: 'Новый', comment: 'Отклик через анкету «' + a.title + '»', color: '#FFFFFF', starred: false, cv, createdAt: new Date().toISOString() };
    await S.upsert('participants', { id: part.id, data: part });
    const links = [];
    const alang = avac ? (avac.lang || 'ru') : 'ru';
    const wantTypes = orderTypes((a.tests || []).filter(t => ['result', 'tools', 'logic', 'sales'].includes(t)), owner || me, avac);
    for (const type of wantTypes) {
      const available = owner ? (owner.balanceTotal || 0) - (owner.balancePending || 0) : 0;
      if (owner && available < 1) continue;
      const code = shortCode(10);
      const test = { id: uid(12), participantId: part.id, userId: a.userId, type, status: 'sent', code, lang: alang,
        sentAt: new Date().toISOString(), startedAt: null, finishedAt: null, durationSec: null, answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
      await S.upsert('tests', { id: test.id, data: test });
      if (owner) owner.balancePending = (owner.balancePending || 0) + 1;
      links.push({ type, title: testTitleOf(type), link: `${BASE}/t/${code}` });
    }
    if (owner) await S.upsert('users', { id: owner.id, data: owner });
    return j({ ok: true, links, msgApply: a.msgApply, msgDone: a.msgDone });
  }

  // ── УПРАВЛЕНИЕ ТЕСТАМИ (по кандидату / по тесту) ──
  let mSendT = p.match(/^\/api\/participants\/([\w-]+)\/send-test$/);
  if (mSendT && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mSendT[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Кандидат не найден' }, 404);
    const type = body.type;
    if (!type || !['result', 'tools', 'logic', 'sales'].includes(type)) return j({ error: 'Неверный тип теста' }, 400);
    if (((me.balanceTotal || 0) - (me.balancePending || 0)) < 1) return j({ error: 'Недостаточно тестов на балансе' }, 400);
    const code = shortCode(10);
    const pvac = part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
    const test = { id: uid(12), participantId: part.id, userId: me.id, type, status: 'sent', code,
      lang: pvac ? (pvac.lang || 'ru') : 'ru', sentAt: new Date().toISOString(), startedAt: null, finishedAt: null, durationSec: null,
      answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
    await S.upsert('tests', { id: test.id, data: test });
    me.balancePending = (me.balancePending || 0) + 1;
    await saveUser(me);
    const link = `${BASE}/t/${code}`;
    const delivery = await notifyCandidate(env, me, part, test, pvac, link, testTitleOf(type));
    return j({ test: { id: test.id, type, title: testTitleOf(type), status: 'sent', code }, link, delivery, balance: publicUser(me) });
  }
  let mResend = p.match(/^\/api\/tests\/([\w-]+)\/resend$/);
  if (mResend && m === 'POST') {
    if (!me) return needAuth();
    const test = await S.one('tests', mResend[1]);
    if (!test || test.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (test.startedAt || test.status === 'done') return j({ error: 'Тест уже начат — повторная отправка не нужна' }, 400);
    test.sentAt = new Date().toISOString();
    await S.upsert('tests', { id: test.id, data: test });
    const rp = await S.one('participants', test.participantId);
    const rvac = rp && rp.vacancyId ? await S.one('vacancies', rp.vacancyId) : null;
    let delivery = null;
    if (rp) delivery = await notifyCandidate(env, me, rp, test, rvac, `${BASE}/t/${test.code}`, testTitleOf(test.type));
    return j({ ok: true, link: `${BASE}/t/${test.code}`, delivery });
  }
  let mDelT = p.match(/^\/api\/tests\/([\w-]+)$/);
  if (mDelT && m === 'DELETE') {
    if (!me) return needAuth();
    const test = await S.one('tests', mDelT[1]);
    if (!test || test.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (test.status !== 'done' && test.balancePending !== true) { me.balancePending = Math.max(0, (me.balancePending || 0) - 1); await saveUser(me); }
    await S.del('tests', `id=eq.${test.id}`);
    return j({ ok: true, balance: publicUser(me) });
  }

  // ── ЗАЯВКИ НА ВАКАНСИЮ (requisitions) ──
  const reqView = async (r) => { const vac = r.vacancyId ? await S.one('vacancies', r.vacancyId) : null;
    return { id: r.id, code: r.code, status: r.status, lang: r.lang, form: r.form || {}, createdBy: r.createdBy,
      vacancyId: r.vacancyId || null, vacancyName: vac ? vac.name : null, position: (r.form && r.form.position) || '',
      createdAt: r.createdAt, submittedAt: r.submittedAt, approvedAt: r.approvedAt }; };
  if (p === '/api/requisitions' && m === 'GET') {
    if (!me) return needAuth();
    const rows = (await S.select('requisitions', `user_id=eq.${me.id}&select=data`)).map(r => r.data)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return j({ requisitions: await Promise.all(rows.map(reqView)) });
  }
  if (p === '/api/requisitions' && m === 'POST') {
    if (!me) return needAuth();
    const rlang = ['ru', 'pl', 'en'].includes(body.lang) ? body.lang : 'ru';
    const r = { id: uid(10), userId: me.id, code: shortCode(10), status: 'draft', lang: rlang,
      form: (typeof body.form === 'object' && body.form) ? body.form : {}, vacancyId: null,
      createdBy: 'hr', createdAt: new Date().toISOString(), submittedAt: null, approvedAt: null };
    await S.upsert('requisitions', { id: r.id, data: r });
    return j({ requisition: await reqView(r), link: `${BASE}/req/${r.code}` });
  }
  let mReq = p.match(/^\/api\/requisitions\/([\w-]+)$/);
  if (mReq && me) {
    const r = await S.one('requisitions', mReq[1]);
    if (!r || r.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'GET') {
      let analysis = null; try { analysis = air.requisitionAnalysis(r.form, lang); } catch (e) {}
      return j({ requisition: await reqView(r), link: `${BASE}/req/${r.code}`, analysis });
    }
    if (m === 'PUT') {
      if (body.form && typeof body.form === 'object') r.form = body.form;
      if (body.lang && ['ru', 'pl', 'en'].includes(body.lang)) r.lang = body.lang;
      if (body.status && ['draft', 'submitted', 'approved', 'rejected'].includes(body.status)) { r.status = body.status; if (r.status === 'approved') r.approvedAt = new Date().toISOString(); }
      await S.upsert('requisitions', { id: r.id, data: r });
      return j({ requisition: await reqView(r) });
    }
    if (m === 'DELETE') { await S.del('requisitions', `id=eq.${r.id}`); return j({ ok: true }); }
  }
  let mReqAppr = p.match(/^\/api\/requisitions\/([\w-]+)\/approve$/);
  if (mReqAppr && m === 'POST') {
    if (!me) return needAuth();
    const r = await S.one('requisitions', mReqAppr[1]);
    if (!r || r.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    r.status = 'approved'; r.approvedAt = new Date().toISOString();
    let sectionId = null;
    const secName = String((r.form && r.form.section) || '').trim();
    if (secName) {
      const secs = (await S.select('sections', `user_id=eq.${me.id}&select=data`)).map(x => x.data);
      let sec = secs.find(s => s.name.toLowerCase() === secName.toLowerCase());
      if (!sec) { sec = { id: uid(10), userId: me.id, name: secName, order: secs.length, createdAt: new Date().toISOString() }; await S.upsert('sections', { id: sec.id, data: sec }); }
      sectionId = sec.id;
    }
    let vac = r.vacancyId ? await S.one('vacancies', r.vacancyId) : null;
    if (!vac) {
      const cnt = (await S.select('vacancies', `user_id=eq.${me.id}&select=id`)).length;
      vac = { id: uid(10), userId: me.id, sectionId, name: (r.form && r.form.position) || 'Вакансия', lang: r.lang, order: cnt,
        createdAt: new Date().toISOString(), requisitionId: r.id, adText: '', adMode: 'manual', published: false,
        workflow: recruit.STAGE_KEYS.slice(), knowledge: { questions: [], passScore: 60 }, motivationQuestions: [] };
      await S.upsert('vacancies', { id: vac.id, data: vac }); r.vacancyId = vac.id;
    } else if (sectionId) { vac.sectionId = sectionId; await S.upsert('vacancies', { id: vac.id, data: vac }); }
    await S.upsert('requisitions', { id: r.id, data: r });
    return j({ requisition: await reqView(r), vacancyId: vac.id });
  }
  let mReqAd = p.match(/^\/api\/requisitions\/([\w-]+)\/generate-ad$/);
  if (mReqAd && m === 'POST') {
    if (!me) return needAuth();
    const r = await S.one('requisitions', mReqAd[1]);
    if (!r || r.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const adLang = ['ru', 'pl', 'en'].includes(body.lang) ? body.lang : r.lang;
    return j({ ad: air.generateAd(r.form, adLang, { company: me.company, target: body.target }) });
  }
  // Публичная заявка (руководитель по ссылке)
  let mReqPub = p.match(/^\/api\/req\/([\w-]+)$/);
  if (mReqPub) {
    const rows = await S.select('requisitions', `code=eq.${encodeURIComponent(mReqPub[1])}&select=data`);
    const r = rows[0] && rows[0].data;
    if (!r) return j({ error: 'Заявка не найдена' }, 404);
    if (m === 'GET') {
      const owner = await S.one('users', r.userId);
      return j({ requisition: { code: r.code, status: r.status, lang: r.lang, form: r.form || {},
        company: owner ? owner.company : '', logo: owner && owner.settings ? owner.settings.logo : '' } });
    }
    if (m === 'POST') {
      if (r.status === 'approved') return j({ error: 'Заявка утверждена — изменения вносит HR' }, 403);
      if (body && typeof body.form === 'object') r.form = body.form;
      r.status = 'submitted'; r.submittedAt = new Date().toISOString(); r.createdBy = 'manager';
      await S.upsert('requisitions', { id: r.id, data: r });
      return j({ ok: true });
    }
  }

  // ── РАЗМЕЩЕНИЯ ОБЪЯВЛЕНИЯ (placements) ──
  let mPlac = p.match(/^\/api\/vacancies\/([\w-]+)\/placements$/);
  if (mPlac && me) {
    const v = await S.one('vacancies', mPlac[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (m === 'GET') {
      const [pr, ar, tr] = await Promise.all([
        S.select('participants', `data->>vacancyId=eq.${v.id}&select=data`),
        S.select('anketas', `data->>vacancyId=eq.${v.id}&select=data`),
        S.select('tests', `user_id=eq.${me.id}&select=data`),
      ]);
      const parts = pr.map(r => r.data).filter(x => x.userId === me.id);
      const ank = ar.map(r => r.data).find(a => a.userId === me.id);
      const testsByPart = {};
      tr.map(r => r.data).forEach(tt => { (testsByPart[tt.participantId] = testsByPart[tt.participantId] || []).push(tt); });
      const statsFor = src => {
        const list = parts.filter(x => (x.src || '') === src);
        const st = { responses: list.length, result: 0, tools: 0, motivation: 0, knowledge: 0, hired: 0 };
        for (const x of list) {
          const wf = buildWorkflow(x, lang, v, testsByPart[x.id] || []);
          const done = k => { const s = wf.stages.find(y => y.key === k); return !!(s && (s.status === 'done' || s.done)); };
          if (done('result')) st.result++; if (done('tools')) st.tools++;
          if (done('motivation')) st.motivation++; if (done('knowledge')) st.knowledge++;
          if (wf.decision === 'hired' || wf.column === 'hired') st.hired++;
        }
        st.conversion = st.responses ? Math.round(100 * st.hired / st.responses) : 0;
        return st;
      };
      const placements = Array.isArray(v.placements) ? v.placements : [];
      return j({ placements: placements.map(pl => ({ ...pl,
        link: ank ? `${BASE}/a/${ank.slug}?src=${encodeURIComponent(pl.src)}` : (pl.url || ''),
        stats: statsFor(pl.src) })) });
    }
    if (m === 'POST') {
      const portal = String(body.portal || '').slice(0, 120).trim();
      if (!portal) return j({ error: 'Укажите портал (где размещено)' }, 400);
      const pl = { id: uid(8), portal, title: String(body.title || '').slice(0, 200), url: String(body.url || '').slice(0, 1000),
        src: (slugify(portal) || 'src') + '-' + shortCode(4).toLowerCase(), createdAt: new Date().toISOString() };
      if (!Array.isArray(v.placements)) v.placements = [];
      v.placements.push(pl);
      await S.upsert('vacancies', { id: v.id, data: v });
      return j({ placement: pl });
    }
  }
  let mPlacDel = p.match(/^\/api\/vacancies\/([\w-]+)\/placements\/([\w-]+)$/);
  if (mPlacDel && me && m === 'DELETE') {
    const v = await S.one('vacancies', mPlacDel[1]);
    if (!v || v.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    v.placements = (Array.isArray(v.placements) ? v.placements : []).filter(x => x.id !== mPlacDel[2]);
    await S.upsert('vacancies', { id: v.id, data: v });
    return j({ ok: true });
  }

  // ── WORKFLOW кандидата ──
  let mWf = p.match(/^\/api\/participants\/([\w-]+)\/workflow$/);
  if (mWf && m === 'GET') {
    if (!me) return needAuth();
    const part = await S.one('participants', mWf[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const vac = part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
    const tests = (await S.select('tests', `participant_id=eq.${part.id}&select=data`)).map(r => r.data);
    const wf = buildWorkflow(part, lang, vac, tests);
    // Реальный ИИ-анализ результатов (Claude), кэш на записи теста; клиент рендерит как обычный analysis.
    try {
      const tgt = vac && (vac.target || (processOf(vac) || {}).target);
      const targetLabel = tgt === 'executor' ? 'Дуер (стабильность, исполнитель)' : (tgt ? 'Виннер (нацелен на результат)' : null);
      const allStages = [...(wf.stages || []), ...(wf.optional || [])];
      const dirty = await enrichWorkflowAI(env, { stages: allStages, tests, lang, target: targetLabel, vacName: vac ? vac.name : '' });
      for (const id of dirty) { const t = tests.find(x => x.id === id); if (t) await S.upsert('tests', { id: t.id, data: t }); }
    } catch (e) { /* ИИ не критичен — остаётся эвристика */ }
    return j({ participant: await participantView(part), stages: wf.stages, decision: wf.decision,
      autoDecision: wf.autoDecision, column: wf.column, columnTitle: kanbanColTitle(wf.column, lang), optional: wf.optional,
      interviews: (part.workflow && part.workflow.interviews) || [] });
  }
  let mCol = p.match(/^\/api\/participants\/([\w-]+)\/column$/);
  if (mCol && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mCol[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {};
    const col = body.column;
    const validCol = c => KANBAN_COLS.includes(c) || /^opt:(logic|sales)$/.test(c) || /^knowledge:[\w-]+$/.test(c);
    if (col === null || col === 'auto') { delete part.workflow.column; }
    else if (typeof col === 'string' && validCol(col)) {
      part.workflow.column = col;
      if (col === 'hired') part.workflow.decision = 'hired';
      else if (col === 'rejected') part.workflow.decision = 'rejected';
      else if (part.workflow.decision) part.workflow.decision = null;
    } else return j({ error: 'Неверная колонка' }, 400);
    await S.upsert('participants', { id: part.id, data: part });
    // Письмо кандидату при смене статуса (не критично — не ломаем ответ при ошибке).
    // Шаблоны статусов: rejected/interview/reserve/accepted. Из kanban-колонки мапим только те,
    // что имеют явный смысл уведомления: rejected→rejected, hired→accepted.
    try {
      const STATUS_MAIL = { rejected: 'rejected', hired: 'accepted' };
      const statusKey = STATUS_MAIL[col];
      const resendKey = env.RESEND_API_KEY;
      const unsubbed = Array.isArray(env.__unsub) && env.__unsub.includes(String(part.email || '').toLowerCase());
      if (statusKey && part.email && resendKey && !unsubbed) {
        const vac = part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
        const mailLang = (vac && vac.lang) || 'ru';
        const gsCol = await settings();
        const pick = (mt) => mt && mt.status && mt.status[statusKey] && (mt.status[statusKey][mailLang] || mt.status[statusKey].ru);
        const tpl = pick(me.settings && me.settings.mailTemplates) || pick(gsCol.defaultMailTemplates);
        if (tpl && (tpl.subject || tpl.body)) {
          const name = ((part.name || '') + ' ' + (part.surname || '')).trim() || part.email;
          const iv = (part.workflow.interviews || [])[0];
          const vars = { name, candidate: name, client: me.name || '', company: me.company || '',
            vac: vac ? vac.name : '', vacancy: vac ? vac.name : '', phone: part.tel || '',
            date_interview: (iv && (iv.at || iv.date)) || '', id_part: part.id, link: '', button_link: '' };
          const fill = str => String(str || '')
            .replace(/\$(\w+)\$/g, (m2, k) => (vars[k] != null ? vars[k] : m2))
            .replace(/\{(\w+)\}/g, (m2, k) => (vars[k] != null ? vars[k] : m2));
          const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
          const tok = await unsubToken(env.SECRET, part.email);
          const unsubUrl = `${base}/unsubscribe?e=${btoa(String(part.email).toLowerCase())}&t=${tok}&lang=${mailLang}`;
          const subject = fill(tpl.subject) || (me.company || 'HR PRO AI');
          const html = wrapEmailEdge({ lang: mailLang, baseUrl: base, unsubUrl, subject,
            bodyHtml: fill(tpl.body).replace(/\n/g, '<br>') });
          await fetch('https://api.resend.com/emails', {
            method: 'POST', headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [part.email], subject, html }),
          });
        }
      }
    } catch (e) { /* письмо о статусе не критично */ }
    return j({ ok: true });
  }
  let mGate = p.match(/^\/api\/participants\/([\w-]+)\/gate$/);
  if (mGate && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mGate[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {}; part.workflow.gates = part.workflow.gates || {}; part.workflow.skipped = part.workflow.skipped || {};
    const { stage, passed, skip, decision } = body;
    if (stage && (recruit.STAGE_KEYS.includes(stage) || /^opt:(logic|sales)$/.test(stage))) {
      if (skip === true) { part.workflow.skipped[stage] = true; delete part.workflow.gates[stage]; }
      else if (skip === false) delete part.workflow.skipped[stage];
      else if (recruit.STAGE_KEYS.includes(stage)) {
        if (passed === null) { delete part.workflow.gates[stage]; delete part.workflow.skipped[stage]; }
        else part.workflow.gates[stage] = !!passed;
      }
    }
    if (decision !== undefined) part.workflow.decision = ['hired', 'rejected'].includes(decision) ? decision : null;
    await S.upsert('participants', { id: part.id, data: part });
    return j({ ok: true, workflow: part.workflow });
  }
  let mMot = p.match(/^\/api\/participants\/([\w-]+)\/motivation$/);
  if (mMot && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mMot[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {};
    const level = body.level;
    part.workflow.motivation = { level: recruit.MOTIVATION_LEVELS.some(x => x.key === level) ? level : null,
      answers: body.answers || {}, notes: String(body.notes || '').slice(0, 4000), at: new Date().toISOString() };
    await S.upsert('participants', { id: part.id, data: part });
    return j({ ok: true, motivation: part.workflow.motivation });
  }
  let mRef = p.match(/^\/api\/participants\/([\w-]+)\/references$/);
  if (mRef && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mRef[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {}; part.workflow.references = part.workflow.references || {};
    const idx = body.refIndex;
    if (idx != null && idx !== '') {
      part.workflow.references.multi = part.workflow.references.multi || {};
      part.workflow.references.multi[idx] = { answers: body.answers || {}, at: new Date().toISOString() };
    } else {
      part.workflow.references.answers = body.answers || {};
      part.workflow.references.at = new Date().toISOString();
    }
    await S.upsert('participants', { id: part.id, data: part });
    return j({ ok: true, references: part.workflow.references });
  }
  let mInt = p.match(/^\/api\/participants\/([\w-]+)\/interviews$/);
  if (mInt && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mInt[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {}; part.workflow.interviews = part.workflow.interviews || [];
    const iv = { id: uid(8), createdAt: new Date().toISOString(), date: '', participants: '', impressions: '', scores: '', questions: '', notes: '' };
    part.workflow.interviews.push(iv);
    part.stage = 'Собеседование';
    await S.upsert('participants', { id: part.id, data: part });
    return j({ interview: iv });
  }
  let mIntE = p.match(/^\/api\/participants\/([\w-]+)\/interviews\/([\w-]+)$/);
  if (mIntE && m === 'PUT') {
    if (!me) return needAuth();
    const part = await S.one('participants', mIntE[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const iv = ((part.workflow && part.workflow.interviews) || []).find(i => i.id === mIntE[2]);
    if (!iv) return j({ error: 'Собеседование не найдено' }, 404);
    ['date', 'participants', 'impressions', 'scores', 'questions', 'notes'].forEach(f => { if (body[f] != null) iv[f] = String(body[f]).slice(0, 4000); });
    await S.upsert('participants', { id: part.id, data: part });
    return j({ interview: iv });
  }
  let mSendKn = p.match(/^\/api\/participants\/([\w-]+)\/send-knowledge$/);
  if (mSendKn && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mSendKn[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Кандидат не найден' }, 404);
    const vac = part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
    const kts = vac ? knowledgeTestsOf(vac).filter(k => k.questions.length) : [];
    if (!kts.length) return j({ error: 'Для вакансии не настроена проверка знаний' }, 400);
    const kt = kts.find(k => k.id === body.ktId) || kts[0];
    const code = shortCode(10);
    const test = { id: uid(12), participantId: part.id, userId: me.id, type: 'knowledge', status: 'sent', code,
      lang: vac ? (vac.lang || 'ru') : 'ru', sentAt: new Date().toISOString(), startedAt: null, finishedAt: null, durationSec: null,
      answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false,
      knowledge: { ktId: kt.id, name: kt.name, questions: kt.questions, passScore: kt.passScore }, balancePending: true };
    await S.upsert('tests', { id: test.id, data: test });
    const link = `${BASE}/t/${code}`;
    const delivery = await notifyCandidate(env, me, part, test, vac, link, 'Проверка знаний');
    return j({ test: { id: test.id, type: 'knowledge', status: 'sent', code }, link, delivery });
  }

  // ── CANDIDATES (глобальный список) ──
  if (p === '/api/candidates' && m === 'GET') {
    if (!me) return needAuth();
    const [pr, vr, tr] = await Promise.all([
      S.select('participants', `user_id=eq.${me.id}&select=data`),
      S.select('vacancies', `user_id=eq.${me.id}&select=data`),
      S.select('tests', `user_id=eq.${me.id}&select=data`),
    ]);
    const vacs = vr.map(r => r.data);
    const list = pr.map(r => r.data).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map(x => {
      const vac = vacs.find(v => v.id === x.vacancyId);
      const nm = ((x.name || '') + ' ' + (x.surname || '')).trim() || x.email;
      return { id: x.id, name: nm, email: x.email, tel: x.tel || '', city: x.city || '',
        vacancyId: x.vacancyId || null, vacancyName: vac ? vac.name : '', column: x.stage === 'Принят' ? 'hired' : x.stage === 'Отказ' ? 'rejected' : 'stage',
        columnTitle: x.stage || 'Без этапа', createdAt: x.createdAt,
        testsDone: tr.map(r => r.data).filter(t => t.participantId === x.id && t.status === 'done').length, cv: x.cv || null };
    });
    return j({ candidates: list });
  }

  // ── SETTINGS PUT / password ──
  if (p === '/api/settings' && m === 'PUT') {
    if (!me) return needAuth();
    if (!me.settings) me.settings = defaultSettings();
    const s = me.settings;
    if (body.name != null) me.name = String(body.name);
    if (body.company != null) me.company = String(body.company);
    ['surname', 'employees', 'phone', 'timezone', 'uiLang', 'logo'].forEach(f => { if (body[f] != null) s[f] = body[f]; });
    if (body.linkDays != null) s.linkDays = Math.max(1, parseInt(body.linkDays, 10) || 3);
    ['notifySms', 'notifyComment', 'searchAllAccounts', 'askPersonalData'].forEach(f => { if (body[f] != null) s[f] = !!body[f]; });
    if (Array.isArray(body.testOrder)) s.testOrder = body.testOrder;
    if (body.emailTemplates) { s.emailTemplates = s.emailTemplates || {}; LANGS.forEach(l => { const t = body.emailTemplates[l.code]; if (t) s.emailTemplates[l.code] = { subject: String(t.subject || ''), body: String(t.body || '') }; }); }
    if (body.smsTemplates) { s.smsTemplates = s.smsTemplates || {}; LANGS.forEach(l => { if (body.smsTemplates[l.code] != null) s.smsTemplates[l.code] = String(body.smsTemplates[l.code]); }); }
    if (body.mailTemplates) s.mailTemplates = body.mailTemplates;
    await saveUser(me);
    return j({ user: publicUser(me) });
  }
  if (p === '/api/settings/password' && m === 'POST') {
    if (!me) return needAuth();
    if (!(await verifyPassword(body.current || '', me.password))) return j({ error: 'Текущий пароль неверный' }, 400);
    if (!body.next || String(body.next).length < 6) return j({ error: 'Новый пароль — минимум 6 символов' }, 400);
    me.password = await hashPassword(body.next);
    await saveUser(me);
    return j({ ok: true });
  }

  // ── ОТПРАВКА ТЕСТОВ ──
  if (p === '/api/tests/send' && m === 'POST') {
    if (!me) return needAuth();
    const reqLang = ['ru', 'pl', 'en'].includes(body.lang) ? body.lang : null;
    let types = Array.isArray(body.types) ? body.types : (body.type ? [body.type] : []);
    types = types.filter(t => ['result', 'tools', 'logic', 'sales'].includes(t));
    if (!types.length) return j({ error: 'Выберите хотя бы один тип теста' }, 400);
    const list = String(body.emails || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (!list.length) return j({ error: 'Укажите email или телефон кандидата' }, 400);
    const isPhone = s => !/@/.test(s) && /^[+]?[\d][\d\s()\-]{5,}$/.test(s);
    const available = (me.balanceTotal || 0) - (me.balancePending || 0);
    const needed = list.length * types.length;
    if (needed > available) return j({ error: `Недостаточно тестов на балансе (нужно ${needed}, доступно ${available})` }, 400);
    const vac = body.vacancyId ? await S.one('vacancies', body.vacancyId) : null;
    if (vac && vac.userId !== me.id) return j({ error: 'Вакансия не найдена' }, 404);
    types = orderTypes(types, me, vac);
    const normMail = s => String(s || '').toLowerCase().trim();
    const normTel = s => String(s || '').replace(/\D/g, '');
    const existing = (await S.select('participants', `user_id=eq.${me.id}&select=data`)).map(r => r.data);
    const created = [];
    for (const rcpt of list) {
      const phone = isPhone(rcpt);
      let part = existing.find(x => phone ? (x.tel && normTel(x.tel) === normTel(rcpt)) : (x.email && normMail(x.email) === normMail(rcpt)));
      if (!part) {
        part = { id: uid(12), userId: me.id, vacancyId: vac ? vac.id : (body.vacancyId || null),
          name: '', surname: '', email: phone ? '' : rcpt, sex: '', age: null, tel: phone ? rcpt : '', city: '', stage: 'Без этапа',
          comment: '', color: '#FFFFFF', starred: false, createdAt: new Date().toISOString() };
        existing.push(part);
      } else if (vac && !part.vacancyId) part.vacancyId = vac.id;
      await S.upsert('participants', { id: part.id, data: part });
      // Последовательная отправка: летит только первый тест, остальные — в очередь
      // (следующий уходит автоматически после прохождения предыдущего — см. /submit).
      let seq = 0;
      for (const type of types) {
        const code = shortCode(10);
        const isFirst = seq === 0;
        const test = { id: uid(12), participantId: part.id, userId: me.id, type, status: isFirst ? 'sent' : 'queued', queueOrder: seq,
          code, lang: reqLang || (vac ? (vac.lang || 'ru') : 'ru'), sentAt: isFirst ? new Date().toISOString() : null,
          startedAt: null, finishedAt: null, durationSec: null, answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
        await S.upsert('tests', { id: test.id, data: test });
        me.balancePending = (me.balancePending || 0) + 1;
        const link = `${BASE}/t/${code}`;
        const delivery = isFirst ? await notifyCandidate(env, me, part, test, vac, link, testTitleOf(type)) : null;
        created.push({ email: rcpt, channel: phone ? 'sms' : 'email', type, title: testTitleOf(type), testId: test.id, participantId: part.id, link, delivery, queued: !isFirst });
        seq++;
      }
    }
    await saveUser(me);
    return j({ created, balance: publicUser(me) });
  }

  // ── ПРОХОЖДЕНИЕ ТЕСТА (публичное, по коду) ──
  const testLinkExpired = (t, vac) => {
    if (t.startedAt || t.status === 'done') return false;
    const days = (vac && processOf(vac).linkDays) || (me && me.settings && me.settings.linkDays) || 3;
    if (!t.sentAt) return false;
    return (Date.now() - new Date(t.sentAt).getTime()) > days * 864e5;
  };
  let mTake = p.match(/^\/api\/take\/([\w-]+)$/);
  if (mTake && m === 'GET') {
    const test = await findByCode(mTake[1]);
    if (!test) return j({ error: 'Тест не найден' }, 404);
    const owner = await S.one('users', test.userId);
    if (owner && owner.blocked === true) return j({ error: 'Ссылка недоступна' }, 404);
    if (testLinkExpired(test, null)) return j({ error: 'Срок действия ссылки истёк. Попросите рекрутёра отправить тест повторно.' }, 410);
    const part = await S.one('participants', test.participantId);
    const tlang = ['ru', 'pl', 'en'].includes(test.lang) ? test.lang : 'ru';
    const extra = { brand: { company: (owner && owner.company) || '', logo: (owner && owner.settings && owner.settings.logo) || '' },
      lockEmail: !!(part && part.email), lockTel: !!(part && part.tel) };
    const partView = part ? { name: part.name, surname: part.surname, email: part.email, sex: part.sex, age: part.age, tel: part.tel, city: part.city } : null;
    if (test.type === 'knowledge') {
      const kq = ((test.knowledge && test.knowledge.questions) || []).map(q => ({ id: q.id, text: q.text, image: q.image || null, video: q.video || null, type: q.type, options: q.options.map(o => o.text) }));
      return j({ type: 'knowledge', lang: tlang, title: (test.knowledge && test.knowledge.name) || testTitleOf('knowledge'), intro: '',
        status: test.status, timeLimitSec: null, scaleOptions: null, needProfile: !(part && part.name), questions: kq, ...extra, participant: partView });
    }
    const content = testQuestionsFor(test.type, tlang);
    let questions = content.questions;
    if (test.type === 'logic') questions = questions.map(q => ({ id: q.id, text: q.text, options: q.options, image: q.image || null, optionImages: q.optionImages || null }));
    return j({ type: test.type, lang: tlang, title: content.title || testTitleOf(test.type), intro: content.intro || '',
      status: test.status, timeLimitSec: content.timeLimitSec || null, scaleOptions: content.options || null,
      needProfile: !(part && part.name), questions, ...extra, participant: partView });
  }
  let mStart = p.match(/^\/api\/take\/([\w-]+)\/start$/);
  if (mStart && m === 'POST') {
    const test = await findByCode(mStart[1]);
    if (!test) return j({ error: 'Тест не найден' }, 404);
    const part = await S.one('participants', test.participantId);
    if (part) {
      ['name', 'surname', 'sex', 'age', 'city'].forEach(f => { if (body[f] != null && body[f] !== '') part[f] = body[f]; });
      if (body.tel && !part.tel) part.tel = String(body.tel).trim();
      if (body.email && !part.email && /.+@.+\..+/.test(String(body.email))) part.email = String(body.email).trim();
      if (body.cvData) { const cvUrl = await storeMedia(body.cvData, body.cvName, 12); if (cvUrl) part.cv = { name: String(body.cvName || 'resume').slice(0, 120), url: cvUrl }; }
      await S.upsert('participants', { id: part.id, data: part });
    }
    if (!test.startedAt) { test.startedAt = new Date().toISOString(); test.status = 'in_progress'; await S.upsert('tests', { id: test.id, data: test }); }
    return j({ ok: true });
  }
  let mSub = p.match(/^\/api\/take\/([\w-]+)\/submit$/);
  if (mSub && m === 'POST') {
    const test = await findByCode(mSub[1]);
    if (!test) return j({ error: 'Тест не найден' }, 404);
    if (test.status === 'done') return j({ ok: true, already: true });
    test.answers = body.answers || {};
    test.times = body.times || {};
    test.finishedAt = new Date().toISOString();
    if (test.startedAt) test.durationSec = Math.round((new Date(test.finishedAt) - new Date(test.startedAt)) / 1000);
    test.status = 'done';
    const owner = await S.one('users', test.userId);
    if (owner && test.balancePending !== true) {
      _ensureLots(owner);
      owner.balancePending = Math.max(0, (owner.balancePending || 0) - 1);
      owner.balanceTotal = Math.max(0, (owner.balanceTotal || 0) - 1);
      spendLots(owner, 1);
      test.balancePending = true;
      await S.upsert('users', { id: owner.id, data: owner });
      await logBalance(owner, -1, 'test_spend', { testId: test.id, comment: `Пройден тест «${testTitleOf(test.type)}»` });
    }
    await S.upsert('tests', { id: test.id, data: test });
    // Последовательная отправка: запустить следующий тест из очереди этого кандидата
    try {
      const rows = await S.select('tests', `participant_id=eq.${test.participantId}&select=data`);
      const queued = rows.map(r => r.data).filter(t => t.status === 'queued').sort((a, b) => (a.queueOrder || 0) - (b.queueOrder || 0));
      const next = queued[0];
      if (next && owner && owner.blocked !== true) {
        const part = await S.one('participants', next.participantId);
        const vac = part && part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
        next.status = 'sent'; next.sentAt = new Date().toISOString();
        await S.upsert('tests', { id: next.id, data: next });
        const link = `${BASE}/t/${next.code}`;
        await notifyCandidate(env, owner, part, next, vac, link, testTitleOf(next.type));
      }
    } catch (e) {}
    return j({ ok: true });
  }

  // ── ОТЧЁТ / СКОРИНГ ──
  let mRes = p.match(/^\/api\/tests\/([\w-]+)\/result$/);
  if (mRes && m === 'GET') {
    if (!me) return needAuth();
    const test = await S.one('tests', mRes[1]);
    if (!test || test.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const part = await S.one('participants', test.participantId);
    const result = localizeResult(computeResult(test, part), test.type, lang);
    let hint = null;
    try { hint = resultHintFor(test, result, lang); } catch (e) { hint = null; }
    try {
      const vac = part && part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
      const tgt = vac && (vac.target || (processOf(vac) || {}).target);
      const tl = tgt === 'executor' ? 'Дуер (стабильность, исполнитель)' : (tgt ? 'Виннер (нацелен на результат)' : null);
      const ai = await aiHintForTest(env, { test, type: test.type, heuristic: hint, lang, target: tl, vacName: vac ? vac.name : '' });
      hint = ai.hint; if (ai.dirty) await S.upsert('tests', { id: test.id, data: test });
    } catch (e) {}
    return j({ test: { id: test.id, type: test.type, title: testTitleOf(test.type), status: test.status,
        knName: (test.knowledge && test.knowledge.name) || null, passScore: (test.knowledge && test.knowledge.passScore) || null,
        startedAt: test.startedAt, finishedAt: test.finishedAt, durationSec: test.durationSec, publicShare: test.publicShare, code: test.code },
      participant: part ? await participantView(part) : null, result, hint });
  }
  let mRate = p.match(/^\/api\/tests\/([\w-]+)\/rate$/);
  if (mRate && m === 'POST') {
    if (!me) return needAuth();
    const test = await S.one('tests', mRate[1]);
    if (!test || test.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    if (body.overall != null) test.overallRate = body.overall;
    if (body.questionId != null) { test.ratings = test.ratings || {}; test.ratings[body.questionId] = body.stars; }
    await S.upsert('tests', { id: test.id, data: test });
    return j({ ok: true, ratings: test.ratings, overallRate: test.overallRate });
  }
  let mShare = p.match(/^\/api\/tests\/([\w-]+)\/share$/);
  if (mShare && m === 'POST') {
    if (!me) return needAuth();
    const test = await S.one('tests', mShare[1]);
    if (!test || test.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    test.publicShare = !!body.enabled;
    await S.upsert('tests', { id: test.id, data: test });
    return j({ publicShare: test.publicShare, url: `${BASE}/r/${test.id}` });
  }

  if (p === '/api/upload' && m === 'POST') {
    if (!me) return needAuth();
    const u = await storeMedia(body.dataUrl, body.name);
    if (!u) return j({ error: 'Не удалось сохранить файл (проверьте формат/размер ≤ 40 МБ)' }, 400);
    return j({ url: u });
  }

  // ── ПУБЛИЧНАЯ ссылка на заявку компании (руководитель создаёт заявку) ──
  if (p === '/api/company/req-link' && m === 'GET') {
    if (!me) return needAuth();
    me.settings = me.settings || {};
    if (!me.settings.reqShareCode) { me.settings.reqShareCode = shortCode(10); await saveUser(me); }
    return j({ code: me.settings.reqShareCode, link: `${BASE}/new-req/${me.settings.reqShareCode}` });
  }
  let mCoMeta = p.match(/^\/api\/company\/([\w-]+)\/meta$/);
  if (mCoMeta && m === 'GET') {
    const owner = (await S.select('users', `data->settings->>reqShareCode=eq.${encodeURIComponent(mCoMeta[1])}&select=data`)).map(r => r.data)[0];
    if (!owner) return j({ error: 'Ссылка недействительна' }, 404);
    return j({ company: owner.company || '', logo: (owner.settings && owner.settings.logo) || '' });
  }
  let mCoReq = p.match(/^\/api\/company\/([\w-]+)\/requisition$/);
  if (mCoReq && m === 'POST') {
    const owner = (await S.select('users', `data->settings->>reqShareCode=eq.${encodeURIComponent(mCoReq[1])}&select=data`)).map(r => r.data)[0];
    if (!owner) return j({ error: 'Ссылка недействительна' }, 404);
    const rlang = ['ru', 'pl', 'en'].includes(body.lang) ? body.lang : 'ru';
    const r = { id: uid(10), userId: owner.id, code: shortCode(10), status: 'submitted', lang: rlang,
      form: (typeof body.form === 'object' && body.form) ? body.form : {}, vacancyId: null,
      createdBy: 'manager', createdAt: new Date().toISOString(), submittedAt: new Date().toISOString(), approvedAt: null };
    await S.upsert('requisitions', { id: r.id, data: r });
    return j({ ok: true });
  }

  // ── ОБУЧЕНИЕ (контент встроен из markdown, education-data.js) ──
  {
    const eduTitle = t => (lang === 'pl' && t.title_pl) || (lang === 'en' && t.title_en) || t.title;
    if (p === '/api/education' && m === 'GET') {
      const topics = EDU_TOPICS.filter(t => EDU_CONTENT[t.slug]).map(t => ({ slug: t.slug, title: eduTitle(t) }));
      return j({ topics });
    }
    let mEdu = p.match(/^\/api\/education\/([\w-]+)$/);
    if (mEdu && m === 'GET') {
      const topic = EDU_TOPICS.find(x => x.slug === mEdu[1]);
      const c = topic && EDU_CONTENT[topic.slug];
      if (!topic || !c) return j({ error: 'Материал не найден' }, 404);
      const markdown = c[lang] || c.ru || '';
      return j({ topic: { slug: topic.slug, title: eduTitle(topic) }, markdown });
    }
  }

  // ── ИНТЕГРАЦИИ: порталы трудоустройства + фид вакансий ──
  if (p.startsWith('/api/job-portals')) {
    if (!me) return needAuth();
    if (!me.settings) me.settings = defaultSettings();
    if (!me.settings.feedToken) { me.settings.feedToken = shortCode(16).toLowerCase(); await saveUser(me); }
    const feedUrl = `${BASE}/feed/${me.settings.feedToken}/jobs.xml`;
    if (p === '/api/job-portals' && m === 'GET') {
      const conns = jpConns(me.settings);
      return j({ feedUrl, portals: JOB_PORTALS.map(pt => { const c = conns[pt.id] || {};
        return { ...pt, connected: jpIsConnected(me.settings, pt.id), login: c.login || '', hasPassword: !!c.password,
          apiKey: c.apiKey ? '••••' + String(c.apiKey).slice(-4) : '', feedUrl: pt.method === 'feed' ? feedUrl : '' }; }) });
    }
    let mJpConn = p.match(/^\/api\/job-portals\/([\w-]+)\/connect$/);
    if (mJpConn && m === 'POST') {
      const portal = JOB_PORTALS.find(x => x.id === mJpConn[1]);
      if (!portal) return j({ error: 'Портал не найден' }, 404);
      const conns = jpConns(me.settings); const c = conns[portal.id] = conns[portal.id] || {};
      if (body.login != null) c.login = String(body.login).trim().slice(0, 200);
      if (body.password) c.password = String(body.password).slice(0, 200);
      if (body.apiKey != null && !String(body.apiKey).startsWith('••••')) c.apiKey = String(body.apiKey).trim().slice(0, 400);
      if (!c.login && !c.apiKey) return j({ error: 'Укажите логин/пароль или API-ключ' }, 400);
      c.connectedAt = new Date().toISOString(); await saveUser(me); return j({ ok: true });
    }
    let mJpTest = p.match(/^\/api\/job-portals\/([\w-]+)\/test$/);
    if (mJpTest && m === 'POST') return j({ error: 'Проверка подключения доступна в десктоп-версии.' }, 400);
    let mJpDel = p.match(/^\/api\/job-portals\/([\w-]+)$/);
    if (mJpDel && m === 'DELETE') { const conns = jpConns(me.settings); delete conns[mJpDel[1]]; await saveUser(me); return j({ ok: true }); }
  }

  // ── Заглушки удалённых/отложенных экранов (чтобы фронт не падал) ──

  // ── СПРАВОЧНИК методики (для конструктора процесса) ──
  if (p === '/api/recruit/meta' && m === 'GET') {
    return j({ stages: recruit.WORKFLOW_STAGES.map(s => ({ key: s.key, kind: s.kind, title: recruit.stageTitle(s.key, lang) })),
      traits: recruit.traitsFor(lang), motivationLevels: recruit.motivationLevelsFor(lang),
      motivationQuestions: recruit.motivationQuestionsFor(lang), referenceQuestions: recruit.referenceQuestionsFor(lang),
      fields: recruit.REQUISITION_FIELDS });
  }
  // ── СТАТИСТИКА по вакансиям ──
  if (p === '/api/stats/vacancies' && m === 'GET') {
    if (!me) return needAuth();
    const [vr, pr, tr] = await Promise.all([
      S.select('vacancies', `user_id=eq.${me.id}&select=data`),
      S.select('participants', `user_id=eq.${me.id}&select=data`),
      S.select('tests', `user_id=eq.${me.id}&select=data`),
    ]);
    const vacs = vr.map(r => r.data), parts = pr.map(r => r.data), tests = tr.map(r => r.data);
    const rowFor = (vId) => {
      const ps = parts.filter(x => (vId === null ? !x.vacancyId : x.vacancyId === vId));
      const pids = new Set(ps.map(x => x.id));
      const ts = tests.filter(t => pids.has(t.participantId));
      const byStage = {}; ps.forEach(x => { const st = x.stage || 'Без этапа'; byStage[st] = (byStage[st] || 0) + 1; });
      return { candidates: ps.length, testsSent: ts.length, testsDone: ts.filter(t => t.status === 'done').length,
        testsPending: ts.filter(t => t.status !== 'done').length, byStage };
    };
    return j({ vacancies: vacs.map(v => ({ id: v.id, name: v.name, lang: v.lang || 'ru', ...rowFor(v.id) })), noVacancy: rowFor(null) });
  }
  // ── ПУБЛИЧНЫЙ отчёт по share-ссылке ──
  let mRPub = p.match(/^\/api\/r\/([\w-]+)$/);
  if (mRPub && m === 'GET') {
    const test = await S.one('tests', mRPub[1]);
    if (!test || !test.publicShare) return j({ error: 'Недоступно' }, 404);
    const owner = await S.one('users', test.userId);
    if (owner && owner.blocked === true) return j({ error: 'Ссылка недоступна' }, 404);
    const part = await S.one('participants', test.participantId);
    const result = localizeResult(computeResult(test, part), test.type, lang);
    let hint = null; try { hint = resultHintFor(test, result, lang); } catch (e) {}
    try {
      const vac = part && part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
      const tgt = vac && (vac.target || (processOf(vac) || {}).target);
      const tl = tgt === 'executor' ? 'Дуер (стабильность, исполнитель)' : (tgt ? 'Виннер (нацелен на результат)' : null);
      const ai = await aiHintForTest(env, { test, type: test.type, heuristic: hint, lang, target: tl, vacName: vac ? vac.name : '' });
      hint = ai.hint; if (ai.dirty) await S.upsert('tests', { id: test.id, data: test });
    } catch (e) {}
    return j({ test: { type: test.type, title: testTitleOf(test.type), durationSec: test.durationSec },
      participant: part ? { name: part.name, surname: part.surname, age: part.age } : null, result, hint });
  }

  // ── STRIPE: оплата пакетов тестов ──
  const gsAll = await settings();
  const activePlans = () => (gsAll.plans || []).filter(x => x.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const stripeKey = env.STRIPE_SECRET_KEY || (gsAll.stripe && gsAll.stripe.secretKey) || '';
  const stripe = stripeKey ? makeStripe(stripeKey) : null;
  const creditPurchase = async (user, plan, method, sessionId) => {
    if (sessionId) { const dup = await S.select('purchases', `data->>sessionId=eq.${encodeURIComponent(sessionId)}&select=id`); if (dup.length) return null; }
    _ensureLots(user); // зафиксировать прежний баланс лотом (старые аккаунты) до пополнения
    user.balanceTotal = (user.balanceTotal || 0) + plan.qty;
    addBalanceLot(user, plan.qty, 'purchase');
    const purchase = { id: uid(12), userId: user.id, planId: plan.id, qty: plan.qty, amount: plan.price,
      method, status: 'paid', sessionId: sessionId || null, createdAt: new Date().toISOString() };
    await S.upsert('purchases', { id: purchase.id, data: purchase });
    await S.upsert('users', { id: user.id, data: user });
    await logBalance(user, plan.qty, 'purchase', { purchaseId: purchase.id, comment: `Покупка пакета «${plan.id}» (${method})` });
    return purchase;
  };

  if (p === '/api/checkout' && m === 'POST') {
    if (!me) return needAuth();
    const plan = activePlans().find(x => x.id === body.planId);
    if (!plan) return j({ error: 'Неизвестный пакет' }, 400);
    if (!stripe) { const purchase = await creditPurchase(me, plan, 'demo'); return j({ simulated: true, balance: publicUser(me), purchase }); }
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price_data: { currency: gsAll.currency || 'eur',
          product_data: { name: `${gsAll.portalName || 'HR PRO AI'} — ${plan.qty} тестов` }, unit_amount: plan.price * 100 }, quantity: 1 }],
        customer_email: me.email, client_reference_id: me.id,
        success_url: `${BASE}/app?checkout={CHECKOUT_SESSION_ID}`, cancel_url: `${BASE}/app?checkout=cancel`,
        metadata: { userId: me.id, planId: plan.id, qty: String(plan.qty) },
        payment_intent_data: { description: `${plan.qty} тестов · пакет «${plan.id}»`, metadata: { userId: me.id, planId: plan.id } },
      }, { idempotencyKey: `co_${me.id}_${plan.id}_${Math.floor(Date.now() / 60000)}` });
      return j({ url: session.url });
    } catch (e) { return j({ error: 'Stripe: ' + e.message }, 500); }
  }
  if (p === '/api/checkout/confirm' && m === 'POST') {
    if (!me) return needAuth();
    if (!stripe || !body.sessionId) return j({ error: 'Нет сессии' }, 400);
    try {
      const s = await stripe.checkout.sessions.retrieve(body.sessionId);
      if (s.payment_status !== 'paid') return j({ error: 'Оплата не завершена' }, 400);
      const plan = activePlans().find(x => x.id === s.metadata.planId);
      if (plan) await creditPurchase(me, plan, 'stripe', body.sessionId);
      const fresh = await S.one('users', me.id);
      return j({ balance: publicUser(fresh || me) });
    } catch (e) { return j({ error: e.message }, 500); }
  }
  if (isWebhook && m === 'POST') {
    if (!stripe) return j({ error: 'Stripe не настроен' }, 400);
    const whSecret = ((gsAll.stripe && gsAll.stripe.webhookSecret) || env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!whSecret) return j({ error: 'Webhook secret не настроен' }, 400);
    let event;
    try { event = await stripe.webhooks.constructEventAsync(rawBody, req.headers.get('stripe-signature'), whSecret); }
    catch (e) { return j({ error: 'Подпись не прошла проверку' }, 400); }
    const s = event.data && event.data.object;
    const creditFromSession = async (sess) => {
      if (!sess || !sess.metadata || !sess.metadata.userId) return;
      const user = await S.one('users', sess.metadata.userId);
      const plan = activePlans().find(x => x.id === sess.metadata.planId);
      if (user && plan) await creditPurchase(user, plan, 'stripe', sess.id);
    };
    if (event.type === 'checkout.session.completed' && s && s.payment_status === 'paid') await creditFromSession(s);
    else if (event.type === 'checkout.session.async_payment_succeeded') await creditFromSession(s);
    return j({ received: true });
  }

  // маршрут ещё не портирован на edge
  return j({ error: 'edge: маршрут в разработке', path: p }, 501);
}

// ── HTML-роуты SPA → clean-путь статического файла (Pages сам маппит на *.html
// без лишнего редиректа; index.html отдаётся по '/') ────────────────────────────
const HTML_MAP = [
  [/^\/$/, '/landing'],
  [/^\/login$/, '/login'],
  [/^\/reset$/, '/reset'],
  [/^\/guide(\/|$)/, '/guide'],
  [/^\/storage\/guide(\/|$)/, '/guide'],
  [/^\/privacy$/, '/privacy'],
  [/^\/terms$/, '/terms'],
  [/^\/blog$/, '/blog'],
  [/^\/blog\/[\w-]+$/, '/blog-post'],
  [/^\/admin$/, '/admin'],
  [/^\/(app|dashboard|home|vacancies|balance|search|education|anketas|settings|faq|instruct)(\/|$)/, '/'],
  [/^\/result\//, '/'],
  [/^\/t\//, '/take'],
  [/^\/a\//, '/anketa'],
  [/^\/(req|new-req)\//, '/req'],
  [/^\/r\//, '/report-public'],
];

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith('/api/') || url.pathname === '/sitemap.xml') return await api(req, env, url);
    } catch (e) {
      return j({ error: 'edge error: ' + (e.message || e) }, 500);
    }
    // Отписка от писем: проверяем токен, показываем подтверждение
    if (url.pathname === '/unsubscribe') {
      const lang = ['ru', 'pl', 'en'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'ru';
      let email = '', valid = false;
      try { email = atob(url.searchParams.get('e') || ''); const { unsubToken } = await import('./notify-edge.js'); valid = !!email && url.searchParams.get('t') === await unsubToken(env.SECRET, email); } catch (_) {}
      const T = { ru: { ok: 'Вы отписаны', okSub: 'Вы больше не будете получать письма о подборе на этот адрес.', bad: 'Ссылка недействительна', badSub: 'Не удалось подтвердить отписку.', home: 'На главную' }, pl: { ok: 'Wypisano', okSub: 'Nie będziesz już otrzymywać wiadomości rekrutacyjnych.', bad: 'Nieprawidłowy link', badSub: 'Nie udało się potwierdzić wypisania.', home: 'Strona główna' }, en: { ok: 'You are unsubscribed', okSub: 'You will no longer receive hiring emails at this address.', bad: 'Invalid link', badSub: 'We could not confirm the unsubscribe.', home: 'Home' } }[lang];
      const title = valid ? T.ok : T.bad, sub = valid ? T.okSub : T.badSub, icon = valid ? '#43e0a0' : '#e0555b';
      const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
      return new Response(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — HR PRO AI</title><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(ellipse 90% 60% at 50% -10%,#12132b,#070813 60%);font-family:Inter,system-ui,sans-serif;color:#9aa3bf"><div style="max-width:440px;text-align:center;padding:40px 28px"><div style="width:60px;height:60px;margin:0 auto 22px;border-radius:16px;display:grid;place-items:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${valid ? '<path d="M5 12l4 4 10-11"/>' : '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'}</svg></div><h1 style="font-family:Manrope,sans-serif;font-weight:800;font-size:24px;color:#fff;margin:0 0 10px">${title}</h1><p style="font-size:14.5px;line-height:1.6;margin:0 0 26px">${sub}</p><a href="${base}/" style="display:inline-block;font-family:Manrope,sans-serif;font-weight:700;font-size:14px;color:#fff;padding:12px 26px;border-radius:12px;background:linear-gradient(135deg,#8b6cff,#6f97ff);text-decoration:none">${T.home}</a></div></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    // Публичный JobPosting-фид вакансий для агрегаторов
    const mFeed = url.pathname.match(/^\/feed\/([\w-]+)\/jobs\.xml$/);
    if (mFeed) {
      const S2 = supa(env);
      const rows = await S2.select('users', `data->settings->>feedToken=eq.${mFeed[1]}&select=data`).catch(() => []);
      const user = rows[0] && rows[0].data;
      if (!user) return new Response('Not found', { status: 404 });
      const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
      const [vr, ar] = await Promise.all([
        S2.select('vacancies', `data->>userId=eq.${user.id}&select=data`).catch(() => []),
        S2.select('anketas', `data->>userId=eq.${user.id}&select=data`).catch(() => []),
      ]);
      const anks = ar.map(r => r.data);
      const jobs = vr.map(r => r.data).filter(v => v.published).map(v => { const a = anks.find(x => x.vacancyId === v.id); return { v, url: a ? `${base}/a/${a.slug}` : '', desc: v.adText || v.name }; }).filter(x => x.url);
      const items = jobs.map(x => `  <job>\n    <title><![CDATA[${x.v.name}]]></title>\n    <date><![CDATA[${x.v.createdAt || new Date().toISOString()}]]></date>\n    <referencenumber><![CDATA[${x.v.id}]]></referencenumber>\n    <url><![CDATA[${x.url}]]></url>\n    <company><![CDATA[${user.company || ''}]]></company>\n    <city><![CDATA[]]></city>\n    <country><![CDATA[PL]]></country>\n    <description><![CDATA[${x.desc}]]></description>\n  </job>`).join('\n');
      const xml = `<?xml version="1.0" encoding="utf-8"?>\n<source>\n  <publisher><![CDATA[${user.company || 'HR PRO AI'}]]></publisher>\n  <publisherurl><![CDATA[${base}]]></publisherurl>\n  <lastBuildDate><![CDATA[${new Date().toISOString()}]]></lastBuildDate>\n${items}\n</source>`;
      return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
    }

    // Прокси видео-уроков из Supabase Storage (bucket media/edu) — same-origin + корректные Range/кэш.
    // Supabase на bytes=0- отдаёт 206 без валидного Content-Range → нативный <video> в Chrome виснет на 0:00.
    // Здесь форвардим Range и переписываем заголовки так, чтобы media-pipeline корректно стримил.
    const mMedia = url.pathname.match(/^\/media\/([\w.\-]+\.mp4)$/);
    if (mMedia) {
      const supaBase = (env.SUPABASE_URL || '').replace(/\/+$/, '');
      const src = `${supaBase}/storage/v1/object/public/media/edu/${mMedia[1]}`;
      const range = req.headers.get('Range');
      const upstream = await fetch(src, { headers: range ? { Range: range } : {} });
      if (!upstream.ok && upstream.status !== 206) return new Response('Not found', { status: 404 });
      const h = new Headers();
      h.set('Content-Type', 'video/mp4');
      h.set('Accept-Ranges', 'bytes');
      // Частичные (206) ответы НЕ кэшируем публично — иначе Cloudflare может отдать байты одного
      // диапазона на запрос другого (Range не входит в ключ кэша) и поток бьётся. Кэшируем только полный 200.
      h.set('Cache-Control', upstream.status === 206 ? 'no-store' : 'public, max-age=86400');
      const cl = upstream.headers.get('Content-Length'); if (cl) h.set('Content-Length', cl);
      const cr = upstream.headers.get('Content-Range'); if (cr) h.set('Content-Range', cr);
      return new Response(upstream.body, { status: upstream.status, headers: h });
    }
    // HTML SPA-роуты — отдать содержимое нужного файла по clean-пути (без редиректа)
    for (const [re, clean] of HTML_MAP) {
      if (re.test(url.pathname)) {
        const assetUrl = new URL(url); assetUrl.pathname = clean;
        return env.ASSETS.fetch(new Request(assetUrl.toString(), { headers: req.headers }));
      }
    }
    // остальное — статика как есть (css/js/img)
    return env.ASSETS.fetch(req);
  },
};
