// Админ-API портала для edge (/api/admin/*). Работает поверх Supabase REST (все клиенты).
// requireAdmin выполняется вызывающей стороной (worker-main проверяет me.role==='admin').
import { wrapEmailEdge } from './notify-edge.js';
const dayKey = iso => String(iso || '').slice(0, 10);
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const within = (iso, days) => iso && new Date(iso) >= daysAgo(days);
const mask = v => (v ? '••••' + String(v).slice(-4) : '');
const intOr = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const pageOf = (list, page, perPage) => {
  const total = list.length;
  const p = Math.max(1, intOr(page, 1)), pp = Math.min(100, Math.max(5, intOr(perPage, 25)));
  return { items: list.slice((p - 1) * pp, p * pp), total, page: p, perPage: pp };
};

const PROVIDERS = {
  resend: { title: 'Resend', purpose: 'Email кандидатам', fields: [{ key: 'apiKey', label: 'API Key', secret: true }, { key: 'from', label: 'From', secret: false }] },
  smsapi: { title: 'SMSAPI', purpose: 'SMS кандидатам', fields: [{ key: 'token', label: 'OAuth Token', secret: true }, { key: 'from', label: 'Имя отправителя', secret: false }] },
  vapi: { title: 'Vapi.ai', purpose: 'ИИ-звонки кандидатам', fields: [{ key: 'apiKey', label: 'Private API Key', secret: true }, { key: 'phoneNumberId', label: 'Phone Number ID', secret: false }] },
  elevenlabs: { title: 'ElevenLabs', purpose: 'Голос для ИИ-звонков', fields: [{ key: 'apiKey', label: 'API Key', secret: true }, { key: 'voiceId', label: 'Voice ID', secret: false }] },
  zadarma: { title: 'Zadarma', purpose: 'Виртуальный номер / SIP', fields: [{ key: 'apiKey', label: 'API Key', secret: true }, { key: 'apiSecret', label: 'API Secret', secret: true }, { key: 'number', label: 'Номер', secret: false }] },
};
const ACTION_LABELS = {
  user_update: 'Изменил профиль клиента', user_block: 'Заблокировал клиента', user_unblock: 'Разблокировал клиента',
  balance_add: 'Начислил баланс', balance_sub: 'Списал баланс', password_reset: 'Сбросил пароль',
  impersonate_start: 'Вход как клиент', user_delete: 'Удалил клиента', purchase_refund: 'Возврат покупки', plans_update: 'Изменил тарифы',
  integration_update: 'Обновил ключи интеграции', settings_update: 'Изменил настройки портала',
  templates_update: 'Изменил шаблоны', templates_reset: 'Вернул заводские шаблоны',
};

// ctx: { S, j, req, url, body, me, uid, publicUser, hashPassword, gs, saveSettings, testTitleOf, env, makeStripe, signCookie }
export async function handleAdmin(p, m, ctx) {
  const { S, j, url, body, me, uid, publicUser, hashPassword, gs, saveSettings, testTitleOf, env } = ctx;
  const q = url.searchParams;
  const allUsers = async () => (await S.select('users', 'select=data')).map(r => r.data);
  const findUser = (users, id) => users.find(u => u.id === id);
  const logAdmin = async (action, targetType, targetId, details) => S.upsert('admin_log', { id: uid(12),
    data: { id: uid(12), adminId: me.id, action, targetType, targetId: targetId || null, details: details || {}, createdAt: new Date().toISOString() } });
  const logBalance = async (userId, delta, kind, extra, balanceAfter) => S.upsert('balance_log', { id: uid(12),
    data: { id: uid(12), userId, delta, kind, comment: '', adminId: null, purchaseId: null, testId: null, balanceAfter, createdAt: new Date().toISOString(), ...(extra || {}) } });

  const counters = (uId, tests, vacs, parts, purchases) => ({
    vacancies: vacs.filter(v => v.userId === uId).length,
    participants: parts.filter(x => x.userId === uId).length,
    testsSent: tests.filter(t => t.userId === uId).length,
    testsDone: tests.filter(t => t.userId === uId && t.status === 'done').length,
    purchases: purchases.filter(x => x.userId === uId && x.userDeleted !== true).length,
    revenue: purchases.filter(x => x.userId === uId && x.status !== 'refunded').reduce((s, x) => s + (x.amount || 0), 0),
  });
  const userItem = (u, ctr) => ({ id: u.id, email: u.email, name: u.name || '', surname: (u.settings && u.settings.surname) || '',
    company: u.company || '', role: u.role === 'admin' ? 'admin' : 'user', blocked: !!u.blocked,
    createdAt: u.createdAt || null, lastLoginAt: u.lastLoginAt || null,
    balanceTotal: u.balanceTotal || 0, balancePending: u.balancePending || 0,
    balanceAvailable: (u.balanceTotal || 0) - (u.balancePending || 0), counters: ctr });

  // ── Дашборд ──
  if (p === '/api/admin/stats' && m === 'GET') {
    const [users, tests, purchases] = await Promise.all([allUsers(),
      S.select('tests', 'select=data').then(r => r.map(x => x.data)),
      S.select('purchases', 'select=data').then(r => r.map(x => x.data))]);
    const done = tests.filter(t => t.status === 'done');
    const paid = purchases.filter(x => x.status !== 'refunded');
    const byType = { tools: 0, result: 0, logic: 0, sales: 0, knowledge: 0 };
    done.forEach(t => { if (byType[t.type] != null) byType[t.type]++; });
    const byMethod = { stripe: 0, demo: 0 };
    paid.forEach(x => { if (byMethod[x.method] != null) byMethod[x.method] += x.amount || 0; });
    const days = []; for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().slice(0, 10), regs: 0, testsDone: 0, revenue: 0 }); }
    const dmap = {}; days.forEach(d => { dmap[d.date] = d; });
    users.forEach(u => { const d = dmap[dayKey(u.createdAt)]; if (d) d.regs++; });
    done.forEach(t => { const d = dmap[dayKey(t.finishedAt)]; if (d) d.testsDone++; });
    paid.forEach(x => { const d = dmap[dayKey(x.createdAt)]; if (d) d.revenue += x.amount || 0; });
    const activeWeek = users.filter(u => within(u.lastLoginAt, 7) || tests.some(t => t.userId === u.id && within(t.sentAt, 7))).length;
    return j({
      users: { total: users.length, new7d: users.filter(u => within(u.createdAt, 7)).length, new30d: users.filter(u => within(u.createdAt, 30)).length, blocked: users.filter(u => u.blocked === true).length, activeWeek },
      tests: { sentTotal: tests.length, doneTotal: done.length, done7d: done.filter(t => within(t.finishedAt, 7)).length, byType },
      revenue: { total: paid.reduce((s, x) => s + (x.amount || 0), 0), m30: paid.filter(x => within(x.createdAt, 30)).reduce((s, x) => s + (x.amount || 0), 0), byMethod, currency: gs.currency || 'eur' },
      balance: { soldTotal: users.reduce((s, u) => s + (u.balanceTotal || 0), 0), pendingTotal: users.reduce((s, u) => s + (u.balancePending || 0), 0) },
      days,
      recentUsers: users.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5).map(u => ({ id: u.id, email: u.email, name: u.name || '', createdAt: u.createdAt })),
      recentPurchases: purchases.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5).map(x => { const u = findUser(users, x.userId); return { id: x.id, amount: x.amount, planId: x.planId, qty: x.qty, method: x.method, status: x.status, userId: x.userId, userEmail: u ? u.email : '(удалён)', createdAt: x.createdAt }; }),
      warnings: { stripe: !(env.STRIPE_SECRET_KEY || (gs.stripe && gs.stripe.secretKey)), resend: !env.RESEND_API_KEY, secretDefault: false, maintenance: !!gs.maintenanceMode },
    });
  }

  // ── Клиенты ──
  if (p === '/api/admin/users' && m === 'GET') {
    const [users, tests, vacs, parts, purchases] = await Promise.all([allUsers(),
      S.select('tests', 'select=data').then(r => r.map(x => x.data)),
      S.select('vacancies', 'select=data').then(r => r.map(x => x.data)),
      S.select('participants', 'select=data').then(r => r.map(x => x.data)),
      S.select('purchases', 'select=data').then(r => r.map(x => x.data))]);
    const query = String(q.get('q') || '').toLowerCase().trim();
    const status = String(q.get('status') || 'all');
    const sort = String(q.get('sort') || 'created_desc');
    let list = users.slice();
    if (query) list = list.filter(u => (u.email + ' ' + (u.name || '') + ' ' + (u.company || '')).toLowerCase().includes(query));
    if (status === 'active') list = list.filter(u => u.blocked !== true);
    else if (status === 'blocked') list = list.filter(u => u.blocked === true);
    else if (status === 'paying') list = list.filter(u => purchases.some(x => x.userId === u.id && x.method === 'stripe'));
    let items = list.map(u => userItem(u, counters(u.id, tests, vacs, parts, purchases)));
    const cmp = { created_desc: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''), created_asc: (a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''),
      balance_desc: (a, b) => b.balanceAvailable - a.balanceAvailable, activity_desc: (a, b) => (b.lastLoginAt || '').localeCompare(a.lastLoginAt || ''), revenue_desc: (a, b) => b.counters.revenue - a.counters.revenue }[sort];
    if (cmp) items.sort(cmp);
    return j(pageOf(items, q.get('page'), q.get('perPage')));
  }

  let mUser = p.match(/^\/api\/admin\/users\/([\w-]+)$/);
  if (mUser) {
    const u = await S.one('users', mUser[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    if (m === 'GET') {
      const [tests, vacs, parts, purchases] = await Promise.all([
        S.select('tests', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('vacancies', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('participants', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('purchases', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data))]);
      if (!u.settings) u.settings = {};
      const days = []; for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().slice(0, 10), sent: 0, done: 0 }); }
      const dmap = {}; days.forEach(d => { dmap[d.date] = d; });
      tests.forEach(t => { const s = dmap[dayKey(t.sentAt)]; if (s) s.sent++; const f = dmap[dayKey(t.finishedAt)]; if (t.status === 'done' && f) f.done++; });
      const integFlags = {}; Object.keys(PROVIDERS).forEach(k => { integFlags[k] = !!((u.settings.integrations || {})[k] && Object.keys(u.settings.integrations[k]).length); });
      return j({ user: Object.assign(userItem(u, counters(u.id, tests, vacs, parts, purchases)), { adminNote: u.adminNote || '' }), days,
        settings: { uiLang: u.settings.uiLang, timezone: u.settings.timezone, linkDays: u.settings.linkDays, integrations: integFlags,
          jobPortals: Object.keys(u.settings.jobPortals || {}).filter(k => u.settings.jobPortals[k] && Object.keys(u.settings.jobPortals[k]).length) } });
    }
    if (m === 'PUT') {
      const users = await allUsers();
      const diff = {};
      if (body.email !== undefined) {
        const email = String(body.email).trim();
        if (!/.+@.+\..+/.test(email)) return j({ error: 'Некорректный email' }, 400);
        if (users.some(x => x.id !== u.id && x.email.toLowerCase() === email.toLowerCase())) return j({ error: 'Email уже занят другим клиентом' }, 409);
        if (email !== u.email) { diff.email = [u.email, email]; u.email = email; }
      }
      if (body.name !== undefined) { u.name = String(body.name).slice(0, 120); }
      if (body.surname !== undefined) { u.settings = u.settings || {}; u.settings.surname = String(body.surname).slice(0, 120); }
      if (body.company !== undefined) { u.company = String(body.company).slice(0, 160); }
      if (body.adminNote !== undefined) u.adminNote = String(body.adminNote).slice(0, 4000);
      if (body.role !== undefined && ['admin', 'user'].includes(body.role) && body.role !== (u.role || 'user')) {
        if (body.role === 'user' && u.role === 'admin' && users.filter(x => x.role === 'admin').length <= 1) return j({ error: 'Нельзя понизить последнего администратора' }, 400);
        diff.role = [u.role || 'user', body.role]; u.role = body.role;
      }
      await S.upsert('users', { id: u.id, data: u });
      await logAdmin('user_update', 'user', u.id, diff);
      const [tests, vacs, parts, purchases] = await Promise.all([
        S.select('tests', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('vacancies', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('participants', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
        S.select('purchases', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data))]);
      return j({ user: Object.assign(userItem(u, counters(u.id, tests, vacs, parts, purchases)), { adminNote: u.adminNote || '' }) });
    }
    if (m === 'DELETE') {
      if (u.id === me.id) return j({ error: 'Нельзя удалить самого себя' }, 400);
      if (u.role === 'admin') return j({ error: 'Нельзя удалить администратора' }, 400);
      for (const coll of ['sections', 'vacancies', 'participants', 'tests', 'anketas', 'requisitions']) await S.del(coll, `user_id=eq.${u.id}`);
      const purchases = (await S.select('purchases', `user_id=eq.${u.id}&select=data`)).map(r => r.data);
      for (const x of purchases) { x.userDeleted = true; await S.upsert('purchases', { id: x.id, data: x }); }
      await S.del('users', `id=eq.${u.id}`);
      await logAdmin('user_delete', 'user', u.id, { email: u.email });
      return j({ ok: true });
    }
  }

  let mBlock = p.match(/^\/api\/admin\/users\/([\w-]+)\/block$/);
  if (mBlock && m === 'POST') {
    const u = await S.one('users', mBlock[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    const blocked = !!body.blocked;
    if (u.id === me.id) return j({ error: 'Нельзя заблокировать самого себя' }, 400);
    if (blocked && u.role === 'admin') return j({ error: 'Нельзя заблокировать администратора' }, 400);
    u.blocked = blocked; await S.upsert('users', { id: u.id, data: u });
    await logAdmin(blocked ? 'user_block' : 'user_unblock', 'user', u.id, { reason: String(body.reason || '').slice(0, 500) });
    return j({ ok: true, blocked: u.blocked });
  }
  let mBal = p.match(/^\/api\/admin\/users\/([\w-]+)\/balance$/);
  if (mBal && m === 'POST') {
    const u = await S.one('users', mBal[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    const delta = intOr(body.delta, 0);
    const comment = String(body.comment || '').trim();
    if (!delta || Math.abs(delta) > 100000) return j({ error: 'Δ — целое число, не более 100000 по модулю' }, 400);
    if (comment.length < 3 || comment.length > 500) return j({ error: 'Комментарий обязателен (3–500 символов)' }, 400);
    const next = (u.balanceTotal || 0) + delta;
    if (next < (u.balancePending || 0)) return j({ error: `Баланс не может стать меньше брони (${u.balancePending})` }, 400);
    // срок действия тестов — 1 год: миграцию старого баланса лотом делаем ДО изменения
    if (!Array.isArray(u.balanceLots)) { u.balanceLots = []; if ((u.balanceTotal || 0) > 0) u.balanceLots.push({ id: uid(10), qty: u.balanceTotal, remaining: u.balanceTotal, source: 'legacy', createdAt: u.createdAt || new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 864e5).toISOString() }); }
    u.balanceTotal = next;
    if (delta > 0) {
      u.balanceLots.push({ id: uid(10), qty: delta, remaining: delta, source: 'admin_add', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 365 * 864e5).toISOString() });
    } else {
      let need = -delta; const now = Date.now();
      u.balanceLots.slice().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || '')).forEach(l => { if (need <= 0) return; if (new Date(l.expiresAt).getTime() < now) return; const take = Math.min(l.remaining || 0, need); l.remaining = (l.remaining || 0) - take; need -= take; });
    }
    await S.upsert('users', { id: u.id, data: u });
    await logBalance(u.id, delta, delta > 0 ? 'admin_add' : 'admin_sub', { comment, adminId: me.id }, u.balanceTotal);
    await logAdmin(delta > 0 ? 'balance_add' : 'balance_sub', 'user', u.id, { delta, comment });
    return j({ ok: true, balanceTotal: u.balanceTotal, balancePending: u.balancePending });
  }
  let mBLog = p.match(/^\/api\/admin\/users\/([\w-]+)\/balance-log$/);
  if (mBLog && m === 'GET') {
    const u = await S.one('users', mBLog[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    const users = await allUsers();
    const log = (await S.select('balance_log', `user_id=eq.${u.id}&select=data`)).map(r => r.data)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .map(l => ({ ...l, adminEmail: l.adminId ? (findUser(users, l.adminId) || {}).email || null : null }));
    const purchases = (await S.select('purchases', `user_id=eq.${u.id}&select=data`)).map(r => r.data).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return j({ log, purchases });
  }
  let mUTests = p.match(/^\/api\/admin\/users\/([\w-]+)\/tests$/);
  if (mUTests && m === 'GET') {
    const u = await S.one('users', mUTests[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    const [tests, parts] = await Promise.all([
      S.select('tests', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data)),
      S.select('participants', `user_id=eq.${u.id}&select=data`).then(r => r.map(x => x.data))]);
    return j({ tests: tests.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || '')).map(t => {
      const part = parts.find(x => x.id === t.participantId);
      return { id: t.id, type: t.type, title: testTitleOf(t.type), status: t.status, sentAt: t.sentAt, finishedAt: t.finishedAt,
        candidate: part ? (((part.name || '') + ' ' + (part.surname || '')).trim() || part.email || part.tel || '—') : '(удалён)' }; }) });
  }
  let mResetInt = p.match(/^\/api\/admin\/users\/([\w-]+)\/reset-integrations$/);
  if (mResetInt && m === 'POST') {
    const u = await S.one('users', mResetInt[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    u.settings = u.settings || {}; u.settings.integrations = {};
    await S.upsert('users', { id: u.id, data: u });
    await logAdmin('user_update', 'user', u.id, { integrationsReset: true });
    return j({ ok: true });
  }
  let mResetPwd = p.match(/^\/api\/admin\/users\/([\w-]+)\/reset-password$/);
  if (mResetPwd && m === 'POST') {
    const u = await S.one('users', mResetPwd[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const rnd = new Uint8Array(10); crypto.getRandomValues(rnd);
    let pwd = ''; for (let i = 0; i < 10; i++) pwd += chars[rnd[i] % chars.length];
    u.password = await hashPassword(pwd);
    await S.upsert('users', { id: u.id, data: u });
    await logAdmin('password_reset', 'user', u.id, {});
    return j({ password: pwd });
  }
  let mImp = p.match(/^\/api\/admin\/users\/([\w-]+)\/impersonate$/);
  if (mImp && m === 'POST') {
    const u = await S.one('users', mImp[1]);
    if (!u) return j({ error: 'Клиент не найден' }, 404);
    if (u.role === 'admin') return j({ error: 'Нельзя войти как другой администратор' }, 400);
    if (u.blocked === true) return j({ error: 'Клиент заблокирован' }, 400);
    await logAdmin('impersonate_start', 'user', u.id, {});
    const cookie = `impersonate_uid=${encodeURIComponent(await ctx.signCookie(u.id))}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=7200`;
    return j({ ok: true }, 200, { 'set-cookie': cookie });
  }
  if (p === '/api/admin/impersonate/stop' && m === 'POST') {
    return j({ ok: true }, 200, { 'set-cookie': 'impersonate_uid=; Path=/; Max-Age=0' });
  }

  // ── Платежи ──
  if (p === '/api/admin/purchases' && m === 'GET') {
    const [users, purchases] = await Promise.all([allUsers(), S.select('purchases', 'select=data').then(r => r.map(x => x.data))]);
    const query = String(q.get('q') || '').toLowerCase().trim();
    const method = String(q.get('method') || 'all');
    const from = String(q.get('from') || ''), to = String(q.get('to') || '');
    let items = purchases.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map(x => {
      const u = findUser(users, x.userId); return { ...x, userEmail: u ? u.email : '(удалён)', userName: u ? (u.name || '') : '', planName: x.planId }; });
    if (query) items = items.filter(x => (x.userEmail + ' ' + x.userName).toLowerCase().includes(query));
    if (method !== 'all') items = items.filter(x => x.method === method);
    if (from) items = items.filter(x => dayKey(x.createdAt) >= from);
    if (to) items = items.filter(x => dayKey(x.createdAt) <= to);
    const paidItems = items.filter(x => x.status !== 'refunded');
    const byMethod = { stripe: 0, demo: 0 }; paidItems.forEach(x => { if (byMethod[x.method] != null) byMethod[x.method] += x.amount || 0; });
    const totals = { totalAmount: paidItems.reduce((s, x) => s + (x.amount || 0), 0), count: items.length, byMethod,
      m30: paidItems.filter(x => within(x.createdAt, 30)).reduce((s, x) => s + (x.amount || 0), 0), currency: gs.currency || 'eur' };
    return j(Object.assign(pageOf(items, q.get('page'), q.get('perPage')), { totals }));
  }
  let mRefund = p.match(/^\/api\/admin\/purchases\/([\w-]+)\/refund$/);
  if (mRefund && m === 'POST') {
    const x = await S.one('purchases', mRefund[1]);
    if (!x) return j({ error: 'Покупка не найдена' }, 404);
    if (x.status === 'refunded') return j({ error: 'Покупка уже возвращена' }, 400);
    const comment = String(body.comment || '').trim();
    if (comment.length < 3 || comment.length > 500) return j({ error: 'Комментарий обязателен (3–500 символов)' }, 400);
    const u = await S.one('users', x.userId);
    if (u) { const before = u.balanceTotal || 0; u.balanceTotal = Math.max(u.balancePending || 0, before - (x.qty || 0));
      await S.upsert('users', { id: u.id, data: u });
      await logBalance(u.id, u.balanceTotal - before, 'refund', { purchaseId: x.id, comment, adminId: me.id }, u.balanceTotal); }
    x.status = 'refunded'; x.refundedAt = new Date().toISOString();
    await S.upsert('purchases', { id: x.id, data: x });
    await logAdmin('purchase_refund', 'purchase', x.id, { qty: x.qty, amount: x.amount, comment });
    return j({ ok: true });
  }
  if (p === '/api/admin/balance-log' && m === 'GET') {
    const [users, log] = await Promise.all([allUsers(), S.select('balance_log', 'select=data').then(r => r.map(x => x.data))]);
    const userId = String(q.get('userId') || ''), kind = String(q.get('kind') || '');
    let list = log.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (userId) list = list.filter(l => l.userId === userId);
    if (kind) list = list.filter(l => l.kind === kind);
    const items = list.map(l => { const u = findUser(users, l.userId); const a = l.adminId ? findUser(users, l.adminId) : null;
      return { ...l, userEmail: u ? u.email : '(удалён)', adminEmail: a ? a.email : null }; });
    return j(pageOf(items, q.get('page'), q.get('perPage')));
  }
  if (p === '/api/admin/stripe/status' && m === 'GET') {
    const keySource = (gs.stripe && (gs.stripe.secretKey || '').trim()) ? 'db' : (env.STRIPE_SECRET_KEY ? 'env' : null);
    return j({ configured: !!(env.STRIPE_SECRET_KEY || (gs.stripe && gs.stripe.secretKey)), keySource,
      webhook: !!((gs.stripe && (gs.stripe.webhookSecret || '').trim()) || env.STRIPE_WEBHOOK_SECRET) });
  }

  // ── Тарифы ──
  if (p === '/api/admin/plans' && m === 'GET') {
    return j({ plans: gs.plans || [], currency: gs.currency || 'eur', signupBonus: gs.signupBonus, stripeConfigured: !!(env.STRIPE_SECRET_KEY || (gs.stripe && gs.stripe.secretKey)) });
  }
  if (p === '/api/admin/plans' && m === 'PUT') {
    if (Array.isArray(body.plans)) {
      const ids = new Set(); const clean = [];
      for (const pl of body.plans.slice(0, 20)) {
        const id = String((pl && pl.id) || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
        const qty = intOr(pl && pl.qty, 0), price = intOr(pl && pl.price, -1);
        if (!id || ids.has(id)) return j({ error: 'ID пакетов должны быть уникальны (латиница)' }, 400);
        if (qty <= 0) return j({ error: `Пакет «${id}»: количество тестов должно быть больше 0` }, 400);
        if (price < 0) return j({ error: `Пакет «${id}»: цена не может быть отрицательной` }, 400);
        ids.add(id); clean.push({ id, qty, price, save: Math.max(0, Math.min(99, intOr(pl.save, 0))), popular: !!pl.popular, active: pl.active !== false, order: intOr(pl.order, clean.length + 1) });
      }
      let hit = false; clean.forEach(pl => { if (pl.popular) { if (hit) pl.popular = false; hit = true; } });
      gs.plans = clean;
    }
    if (body.currency && ['eur', 'usd', 'pln', 'rub'].includes(String(body.currency).toLowerCase())) gs.currency = String(body.currency).toLowerCase();
    if (body.signupBonus !== undefined) gs.signupBonus = Math.max(0, intOr(body.signupBonus, 200));
    await saveSettings(gs);
    await logAdmin('plans_update', 'plan', null, { plans: gs.plans.map(pl => pl.id), currency: gs.currency, signupBonus: gs.signupBonus });
    return j({ plans: gs.plans, currency: gs.currency, signupBonus: gs.signupBonus });
  }

  // ── Интеграции (глобальные ключи портала) ──
  const admProviders = () => {
    const list = [];
    const stripeCfg = gs.stripe || {};
    list.push({ id: 'stripe', name: 'Stripe', purpose: 'Приём платежей',
      fields: [{ key: 'secretKey', label: 'Secret Key', secret: true, placeholder: 'sk_live_… / sk_test_…' }, { key: 'webhookSecret', label: 'Webhook Secret', secret: true, placeholder: 'whsec_…' }],
      values: { secretKey: mask(stripeCfg.secretKey || (env.STRIPE_SECRET_KEY ? 'env_key' : '')), webhookSecret: mask(stripeCfg.webhookSecret || (env.STRIPE_WEBHOOK_SECRET ? 'env_key' : '')) },
      source: (stripeCfg.secretKey || '').trim() ? 'db' : (env.STRIPE_SECRET_KEY ? 'env' : null),
      configured: !!(env.STRIPE_SECRET_KEY || stripeCfg.secretKey), usersConfigured: 0, webhookUrl: (env.PORTAL_BASE_URL || url.origin) + '/api/stripe/webhook' });
    const ENV_KEY = { resend: 'RESEND_API_KEY', smsapi: 'SMSAPI_TOKEN', vapi: 'VAPI_API_KEY', elevenlabs: 'ELEVENLABS_API_KEY', zadarma: 'ZADARMA_API_KEY' };
    Object.keys(PROVIDERS).forEach(pKey => {
      const meta = PROVIDERS[pKey];
      const dbCfg = (gs.integrations || {})[pKey] || {};
      const dbHas = Object.values(dbCfg).some(v => v);
      const envHas = !!env[ENV_KEY[pKey]];
      list.push({ id: pKey, name: meta.title, purpose: meta.purpose,
        fields: meta.fields.map(f => ({ key: f.key, label: f.label, secret: !!f.secret, placeholder: '' })),
        values: Object.fromEntries(meta.fields.map(f => [f.key, f.secret ? mask(dbCfg[f.key] || (envHas ? 'env_key' : '')) : (dbCfg[f.key] || '')])),
        source: dbHas ? 'db' : (envHas ? 'env' : null), configured: dbHas || envHas, usersConfigured: 0 });
    });
    return list;
  };
  if (p === '/api/admin/integrations' && m === 'GET') return j({ providers: admProviders() });
  let mIntPut = p.match(/^\/api\/admin\/integrations\/([\w-]+)$/);
  if (mIntPut && m === 'PUT') {
    const pKey = mIntPut[1];
    const values = body.values || {};
    const changed = [];
    if (pKey === 'stripe') {
      gs.stripe = gs.stripe || {};
      ['secretKey', 'webhookSecret'].forEach(k => { if (values[k] === undefined) return; const v = values[k] === null ? '' : String(values[k]).trim(); if (v.startsWith('••••')) return; gs.stripe[k] = v; changed.push(k); });
    } else if (PROVIDERS[pKey]) {
      gs.integrations = gs.integrations || {}; gs.integrations[pKey] = gs.integrations[pKey] || {};
      PROVIDERS[pKey].fields.forEach(f => { if (values[f.key] === undefined) return; const v = values[f.key] === null ? '' : String(values[f.key]).trim(); if (v.startsWith('••••')) return; if (v === '') delete gs.integrations[pKey][f.key]; else gs.integrations[pKey][f.key] = v; changed.push(f.key); });
    } else return j({ error: 'Неизвестный сервис' }, 400);
    await saveSettings(gs);
    await logAdmin('integration_update', 'integration', pKey, { fields: changed });
    return j({ ok: true });
  }
  let mIntTest = p.match(/^\/api\/admin\/integrations\/([\w-]+)\/test$/);
  if (mIntTest && m === 'POST') {
    const pKey = mIntTest[1];
    const to = String(body.to || '').trim();
    try {
      if (pKey === 'stripe') {
        const key = env.STRIPE_SECRET_KEY || (gs.stripe && gs.stripe.secretKey);
        if (!key) return j({ error: 'Stripe не настроен' }, 400);
        const bal = await ctx.makeStripe(key).balance.retrieve();
        return j({ ok: true, result: { available: (bal.available || []).map(b => b.amount + ' ' + b.currency).join(', ') || '0' } });
      }
      if (pKey === 'resend') {
        const key = env.RESEND_API_KEY || (gs.integrations && gs.integrations.resend && gs.integrations.resend.apiKey);
        if (!key) return j({ error: 'Resend не настроен' }, 400);
        const subject = (gs.portalName || 'HR PRO AI') + ' — тест Resend';
        const html = wrapEmailEdge({ lang: 'ru', baseUrl: (env.PORTAL_BASE_URL || url.origin), subject,
          eyebrow: 'Проверка интеграции', headline: 'Resend подключён',
          bodyHtml: 'Интеграция Resend работает корректно. Это тестовое письмо от портала HR PRO AI.' });
        const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [to || me.email], subject, html }) });
        if (!r.ok) return j({ error: 'Resend: ' + r.status }, 502);
        return j({ ok: true, result: await r.json() });
      }
      if (pKey === 'smsapi') {
        if (!to) return j({ error: 'Укажите номер телефона' }, 400);
        const key = env.SMSAPI_TOKEN || (gs.integrations && gs.integrations.smsapi && gs.integrations.smsapi.token);
        if (!key) return j({ error: 'SMSAPI не настроен' }, 400);
        const params = new URLSearchParams({ to: to.replace(/[^\d+]/g, ''), message: (gs.portalName || 'HR PRO AI') + ': интеграция SMSAPI работает.', format: 'json', encoding: 'utf-8' });
        const r = await fetch((env.SMSAPI_ENDPOINT || 'https://api.smsapi.pl') + '/sms.do', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
        const d = await r.json(); if (d && d.error) return j({ error: 'SMSAPI: ' + (d.message || d.error) }, 502);
        return j({ ok: true, result: d });
      }
      return j({ error: 'Тест для этого сервиса недоступен на edge' }, 400);
    } catch (e) { return j({ error: String(e.message || e).slice(0, 400) }, 502); }
  }

  // ── Настройки портала ──
  if (p === '/api/admin/settings' && m === 'GET') {
    const out = JSON.parse(JSON.stringify(gs));
    delete out.stripe; delete out.integrations; delete out.defaultEmailTemplates; delete out.defaultSmsTemplates; delete out.defaultMailTemplates;
    return j({ settings: out, env: { baseUrl: env.PORTAL_BASE_URL || url.origin, secretIsDefault: false } });
  }
  if (p === '/api/admin/settings' && m === 'PUT') {
    const patch = body.patch || body || {};
    const applyStr = (k, max) => { if (patch[k] !== undefined) gs[k] = String(patch[k]).slice(0, max); };
    const applyBool = k => { if (typeof patch[k] === 'boolean') gs[k] = patch[k]; };
    const applyInt = (k, min, max, d) => { if (patch[k] !== undefined) gs[k] = Math.max(min, Math.min(max, intOr(patch[k], d))); };
    applyStr('portalName', 80); applyStr('baseUrl', 300); applyStr('supportEmail', 160);
    applyBool('registrationOpen'); applyInt('signupBonus', 0, 100000, 200); applyInt('defaultLinkDays', 1, 365, 3);
    if (patch.defaultUiLang !== undefined && ['ru', 'pl', 'en'].includes(patch.defaultUiLang)) gs.defaultUiLang = patch.defaultUiLang;
    applyStr('defaultTimezone', 80); applyInt('passwordMinLength', 4, 64, 6);
    applyBool('maintenanceMode'); applyStr('maintenanceMessage', 500);
    await saveSettings(gs);
    await logAdmin('settings_update', 'settings', null, {});
    return j({ ok: true });
  }

  // ── Шаблоны ──
  if (p === '/api/admin/templates' && m === 'GET') {
    return j({ emailTemplates: gs.defaultEmailTemplates || {}, smsTemplates: gs.defaultSmsTemplates || {},
      mailTemplates: gs.defaultMailTemplates || {}, overridden: { email: !!gs.defaultEmailTemplates, sms: !!gs.defaultSmsTemplates, mail: !!gs.defaultMailTemplates },
      langs: [{ code: 'ru' }, { code: 'pl' }, { code: 'en' }], placeholders: ['{candidate}', '{company}', '{vacancy}', '{test}', '{link}'] });
  }
  if (p === '/api/admin/templates' && m === 'PUT') {
    if (body.emailTemplates && typeof body.emailTemplates === 'object') {
      const cur = gs.defaultEmailTemplates || {};
      ['ru', 'pl', 'en'].forEach(c => { const t = body.emailTemplates[c]; if (t && typeof t === 'object') cur[c] = { subject: String(t.subject || '').slice(0, 300), body: String(t.body || '').slice(0, 8000) }; });
      gs.defaultEmailTemplates = cur;
    }
    if (body.smsTemplates && typeof body.smsTemplates === 'object') {
      const cur = gs.defaultSmsTemplates || {};
      ['ru', 'pl', 'en'].forEach(c => { if (body.smsTemplates[c] != null) cur[c] = String(body.smsTemplates[c]).slice(0, 360); });
      gs.defaultSmsTemplates = cur;
    }
    if (body.mailTemplates && typeof body.mailTemplates === 'object') gs.defaultMailTemplates = body.mailTemplates;
    await saveSettings(gs);
    await logAdmin('templates_update', 'settings', null, {});
    return j({ ok: true });
  }
  if (p === '/api/admin/templates/preview' && m === 'POST') {
    const base = (env.PORTAL_BASE_URL || url.origin) + '/t/DEMO123456';
    const demo = { '{candidate}': 'Иван Иванов', '{company}': gs.portalName || 'HR PRO AI', '{vacancy}': 'Менеджер по продажам', '{test}': 'Резалт', '{link}': base,
      '$vac$': 'Менеджер по продажам', '$name$': 'Иван Иванов', '$company$': gs.portalName || 'HR PRO AI', '$client$': 'Иван Иванов', '$link$': base, '$button_link$': base, '$phone$': '+48 500 600 700', '$date_interview$': '15.07.2026 14:00' };
    const fill = s => Object.entries(demo).reduce((acc, [k, v]) => acc.split(k).join(v), String(s || ''));
    return j({ subject: fill(body.subject), body: fill(body.body).replace(/\n/g, '<br>') });
  }
  if (p === '/api/admin/templates/reset' && m === 'POST') {
    const scope = body.scope || 'all';
    if (scope === 'email' || scope === 'all') gs.defaultEmailTemplates = null;
    if (scope === 'sms' || scope === 'all') gs.defaultSmsTemplates = null;
    if (scope === 'mail' || scope === 'all') gs.defaultMailTemplates = null;
    await saveSettings(gs);
    await logAdmin('templates_reset', 'settings', null, { scope });
    return j({ ok: true });
  }

  // ── Обучение (md-файлы в edge недоступны) ──
  if (p === '/api/admin/education' && m === 'GET') return j({ files: [] });

  // ── Журнал действий ──
  if (p === '/api/admin/log' && m === 'GET') {
    const [users, log] = await Promise.all([allUsers(), S.select('admin_log', 'select=data').then(r => r.map(x => x.data))]);
    let list = log.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (q.get('adminId')) list = list.filter(l => l.adminId === q.get('adminId'));
    if (q.get('action')) list = list.filter(l => l.action === q.get('action'));
    if (q.get('targetType')) list = list.filter(l => l.targetType === q.get('targetType'));
    if (q.get('from')) list = list.filter(l => dayKey(l.createdAt) >= q.get('from'));
    if (q.get('to')) list = list.filter(l => dayKey(l.createdAt) <= q.get('to'));
    const items = list.map(l => { const a = findUser(users, l.adminId); let targetLabel = l.targetId || '';
      if (l.targetType === 'user') { const u = findUser(users, l.targetId); targetLabel = u ? u.email : ((l.details && l.details.email) || l.targetId); }
      return { ...l, adminEmail: a ? a.email : '(удалён)', actionLabel: ACTION_LABELS[l.action] || l.action, targetLabel }; });
    const admins = users.filter(u => u.role === 'admin').map(u => ({ id: u.id, email: u.email, name: u.name || '', company: u.company || '' }));
    return j(Object.assign(pageOf(items, q.get('page'), q.get('perPage')), { admins, actions: ACTION_LABELS }));
  }

  return null; // не админ-маршрут
}
