// Cloudflare Pages advanced-mode worker: статика через ASSETS + edge-API на Supabase.
// Первый рабочий срез (auth + конфиг); маршруты наращиваются итеративно, переиспользуя
// чистые модули портала (scoring/ai/recruitment) по мере портирования.
import { hashPassword, verifyPassword } from './auth-edge.js';

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
    emailTemplates: {}, smsTemplates: {}, anketaFields: [], testOrder: ['tools', 'result', 'logic', 'sales'] };
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
    balanceAvailable: (u.balanceTotal || 0) - (u.balancePending || 0), settings: s };
}
const uid = (n = 12) => { const b = new Uint8Array(16); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/[+/=]/g, '').slice(0, n); };

// ── API-роутер ──────────────────────────────────────────────────────────────────
async function api(req, env, url) {
  const p = url.pathname, m = req.method;
  const body = (m === 'POST' || m === 'PUT') ? await req.json().catch(() => ({})) : {};
  const S = supa(env);

  async function settings() { const r = await S.select('settings', 'id=eq.portal&select=data'); return (r[0] && r[0].data) || {}; }

  if (p === '/api/health') return j({ ok: true, edge: true, ts: Date.now() });

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
      company: body.company || '', balanceTotal: bonus, balancePending: 0,
      settings: { uiLang: 'ru' }, role: 'user', blocked: false, adminNote: '', createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
    await S.upsert('users', { id: u.id, data: u });
    const cookie = `uid=${encodeURIComponent(await signCookie(env, u.id))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
    return j({ user: publicUser(u) }, 200, { 'set-cookie': cookie });
  }

  // ── дальше — только для авторизованных ──
  const me = await currentUser(env, req);
  const needAuth = () => j({ error: 'Не авторизован' }, 401);

  if (p === '/api/settings' && m === 'GET') {
    if (!me) return needAuth();
    return j({ user: publicUser(me), langs: [{ code: 'ru', name: 'Русский' }, { code: 'uk', name: 'Украи́нский' }, { code: 'pl', name: 'Польский' }, { code: 'en', name: 'Английский' }] });
  }

  if (p === '/api/balance' && m === 'GET') {
    if (!me) return needAuth();
    return j({ balance: publicUser(me) });
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
    return j({ vacancy: { ...v, knowledge: v.knowledge || { questions: [], passScore: 60 },
      knowledgeTests: v.knowledgeTests || [], process: v.process || {}, motivationQuestions: v.motivationQuestions || [] } });
  }

  // ── PARTICIPANTS ──
  if (p === '/api/participants' && m === 'POST') {
    if (!me) return needAuth();
    const x = { id: uid(12), userId: me.id, vacancyId: body.vacancyId || null,
      name: String(body.name || ''), surname: String(body.surname || ''), email: String(body.email || ''),
      sex: '', age: null, tel: String(body.tel || ''), city: String(body.city || ''), stage: 'Без этапа',
      comment: String(body.comment || ''), color: '#FFFFFF', starred: false, createdAt: new Date().toISOString() };
    await S.upsert('participants', { id: x.id, data: x });
    return j({ participant: await participantView(x) });
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

  // маршрут ещё не портирован на edge
  return j({ error: 'edge: маршрут в разработке', path: p }, 501);
}

// ── HTML-роуты SPA → clean-путь статического файла (Pages сам маппит на *.html
// без лишнего редиректа; index.html отдаётся по '/') ────────────────────────────
const HTML_MAP = [
  [/^\/$/, '/landing'],
  [/^\/login$/, '/login'],
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
      if (url.pathname.startsWith('/api/')) return await api(req, env, url);
    } catch (e) {
      return j({ error: 'edge error: ' + (e.message || e) }, 500);
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
