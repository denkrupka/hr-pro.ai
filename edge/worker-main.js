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
  };
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
