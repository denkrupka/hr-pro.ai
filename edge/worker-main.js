// Cloudflare Pages advanced-mode worker: статика через ASSETS + edge-API на Supabase.
// Первый рабочий срез (auth + конфиг); маршруты наращиваются итеративно, переиспользуя
// чистые модули портала (scoring/ai/recruitment) по мере портирования.
import { hashPassword, verifyPassword } from './auth-edge.js';
import { computeResult, testQuestionsFor, resultHintFor, localizeResult } from './tests-edge.js';
import { notifyCandidate } from './notify-edge.js';
import { buildWorkflow, buildBoard, vacFull, processOf, knowledgeTestsOf, kanbanColTitle, KANBAN_COLS, recruit, ai, air } from './workflow-edge.js';
import makeStripe from './stripe-edge.js';

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
  const isWebhook = p === '/api/stripe/webhook';
  const rawBody = (isWebhook && m === 'POST') ? await req.text() : null;
  const body = (!isWebhook && (m === 'POST' || m === 'PUT')) ? await req.json().catch(() => ({})) : {};
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
  const lang = ['ru', 'pl', 'en'].includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'ru';
  const shortCode = (n = 10) => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; const b = new Uint8Array(n); crypto.getRandomValues(b);
    return Array.from(b, x => a[x % a.length]).join(''); };
  const findByCode = async (code) => { const r = await S.select('tests', `code=eq.${encodeURIComponent(code)}&select=data`); return r[0] ? r[0].data : null; };
  const logBalance = async (u, delta, kind, extra) => S.upsert('balance_log', { id: uid(12),
    data: { id: uid(12), userId: u.id, delta, kind, comment: '', adminId: null, purchaseId: null, testId: null,
      balanceAfter: u.balanceTotal, createdAt: new Date().toISOString(), ...(extra || {}) } });
  const orderTypes = (types, u, vac) => {
    const ord = vac ? (processOf(vac).order || ['tools', 'result', 'logic', 'sales'])
      : ((u.settings && Array.isArray(u.settings.testOrder)) ? u.settings.testOrder : ['tools', 'result', 'logic', 'sales']);
    return types.slice().sort((a, b) => { const ia = ord.indexOf(a), ib = ord.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
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
    if (Array.isArray(b.tests)) a.tests = b.tests.filter(t => ['tools', 'result', 'logic', 'sales'].includes(t));
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
    const part = { id: uid(12), userId: a.userId, vacancyId: a.vacancyId || null, anketaId: a.id, src: String(body.src || '').slice(0, 60),
      name: String(body.name || '').trim(), surname: String(body.surname || '').trim(), email,
      sex: body.sex || '', age: body.age ? parseInt(body.age, 10) : null, tel: String(body.tel || '').trim(), city: String(body.city || '').trim(),
      stage: 'Новый', comment: 'Отклик через анкету «' + a.title + '»', color: '#FFFFFF', starred: false, cv: null, createdAt: new Date().toISOString() };
    await S.upsert('participants', { id: part.id, data: part });
    const links = [];
    const alang = avac ? (avac.lang || 'ru') : 'ru';
    const wantTypes = orderTypes((a.tests || []).filter(t => ['tools', 'result', 'logic', 'sales'].includes(t)), owner || me, avac);
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
    if (!type || !['tools', 'result', 'logic', 'sales'].includes(type)) return j({ error: 'Неверный тип теста' }, 400);
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

  // ── WORKFLOW кандидата ──
  let mWf = p.match(/^\/api\/participants\/([\w-]+)\/workflow$/);
  if (mWf && m === 'GET') {
    if (!me) return needAuth();
    const part = await S.one('participants', mWf[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    const vac = part.vacancyId ? await S.one('vacancies', part.vacancyId) : null;
    const tests = (await S.select('tests', `participant_id=eq.${part.id}&select=data`)).map(r => r.data);
    const wf = buildWorkflow(part, lang, vac, tests);
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
    if (recruit.MOTIVATION_LEVELS.some(x => x.key === level)) {
      part.workflow.motivation = { level, at: new Date().toISOString() };
      await S.upsert('participants', { id: part.id, data: part });
      return j({ ok: true, analysis: recruit.MOTIVATION_LEVELS.find(x => x.key === level) });
    }
    return j({ error: 'Неверный уровень мотивации' }, 400);
  }
  let mRef = p.match(/^\/api\/participants\/([\w-]+)\/references$/);
  if (mRef && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mRef[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {}; part.workflow.references = part.workflow.references || {};
    if (body.index != null && body.answers) {
      part.workflow.references.multi = part.workflow.references.multi || {};
      part.workflow.references.multi[body.index] = { answers: body.answers, at: new Date().toISOString() };
    } else if (body.answers) {
      part.workflow.references.answers = body.answers;
    }
    await S.upsert('participants', { id: part.id, data: part });
    return j({ ok: true });
  }
  let mInt = p.match(/^\/api\/participants\/([\w-]+)\/interviews$/);
  if (mInt && m === 'POST') {
    if (!me) return needAuth();
    const part = await S.one('participants', mInt[1]);
    if (!part || part.userId !== me.id) return j({ error: 'Не найдено' }, 404);
    part.workflow = part.workflow || {}; part.workflow.interviews = part.workflow.interviews || [];
    const iv = { id: uid(8), at: body.at || '', note: String(body.note || ''), createdAt: new Date().toISOString() };
    part.workflow.interviews.push(iv);
    await S.upsert('participants', { id: part.id, data: part });
    return j({ ok: true, interview: iv, interviews: part.workflow.interviews });
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
    types = types.filter(t => ['tools', 'result', 'logic', 'sales'].includes(t));
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
      for (const type of types) {
        const code = shortCode(10);
        const test = { id: uid(12), participantId: part.id, userId: me.id, type, status: 'sent',
          code, lang: reqLang || (vac ? (vac.lang || 'ru') : 'ru'), sentAt: new Date().toISOString(),
          startedAt: null, finishedAt: null, durationSec: null, answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
        await S.upsert('tests', { id: test.id, data: test });
        me.balancePending = (me.balancePending || 0) + 1;
        const link = `${BASE}/t/${code}`;
        const delivery = await notifyCandidate(env, me, part, test, vac, link, testTitleOf(type));
        created.push({ email: rcpt, channel: phone ? 'sms' : 'email', type, title: testTitleOf(type), testId: test.id, participantId: part.id, link, delivery });
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
      owner.balancePending = Math.max(0, (owner.balancePending || 0) - 1);
      owner.balanceTotal = Math.max(0, (owner.balanceTotal || 0) - 1);
      test.balancePending = true;
      await S.upsert('users', { id: owner.id, data: owner });
      await logBalance(owner, -1, 'test_spend', { testId: test.id, comment: `Пройден тест «${testTitleOf(test.type)}»` });
    }
    await S.upsert('tests', { id: test.id, data: test });
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

  // ── STRIPE: оплата пакетов тестов ──
  const gsAll = await settings();
  const activePlans = () => (gsAll.plans || []).filter(x => x.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
  const stripeKey = env.STRIPE_SECRET_KEY || (gsAll.stripe && gsAll.stripe.secretKey) || '';
  const stripe = stripeKey ? makeStripe(stripeKey) : null;
  const creditPurchase = async (user, plan, method, sessionId) => {
    if (sessionId) { const dup = await S.select('purchases', `data->>sessionId=eq.${encodeURIComponent(sessionId)}&select=id`); if (dup.length) return null; }
    user.balanceTotal = (user.balanceTotal || 0) + plan.qty;
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
