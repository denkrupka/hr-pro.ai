'use strict';
// ================= АДМИН-API портала (все маршруты /api/admin/*) =================
// Подключается из server.js: require('./src/admin')(app, ctx).
// Каждая мутация пишется в adminLog; операции с балансом — дополнительно в balanceLog.
const fs = require('fs');
const path = require('path');

const EDU_DIR = path.join(__dirname, '..', 'data', 'education');

module.exports = function adminApi(app, ctx) {
  const { db, save, uid, nowISO, requireAuth, requireAdmin, publicUser, ensureSettings,
    portalSettings, applyPortalEnv, portalPlans, activePlans, initStripe, getStripe, stripeKey,
    logAdmin, logBalance, _ensureLots, addBalanceLot, spendLots, expireBalance, hashPassword, integ,
    DEFAULT_TEMPLATES, DEFAULT_SMS, DEFAULT_MAIL, cleanMailTemplates,
    MAIL_SEND_ITEMS, MAIL_STATUS_ITEMS, MAIL_LANGS, TEST_NAMES, LANGS, testTitleOf, getBaseUrl, SECRET } = ctx;

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
  const userBrief = u => ({ id: u.id, email: u.email, name: u.name || '', company: u.company || '' });
  const findUser = id => db().users.find(u => u.id === id);
  const adminsCount = () => db().users.filter(u => u.role === 'admin').length;

  // Счётчики клиента по коллекциям
  function userCounters(uId) {
    const data = db();
    const tests = data.tests.filter(t => t.userId === uId);
    const purchases = data.purchases.filter(p => p.userId === uId && p.userDeleted !== true);
    return {
      vacancies: data.vacancies.filter(v => v.userId === uId).length,
      participants: data.participants.filter(p => p.userId === uId).length,
      testsSent: tests.length,
      testsDone: tests.filter(t => t.status === 'done').length,
      purchases: purchases.length,
      revenue: purchases.filter(p => p.status !== 'refunded').reduce((s, p) => s + (p.amount || 0), 0),
    };
  }
  function userItem(u) {
    return { id: u.id, email: u.email, name: u.name || '', surname: (u.settings && u.settings.surname) || '',
      company: u.company || '', role: u.role === 'admin' ? 'admin' : 'user', blocked: !!u.blocked,
      createdAt: u.createdAt || null, lastLoginAt: u.lastLoginAt || null,
      balanceTotal: u.balanceTotal || 0, balancePending: u.balancePending || 0,
      balanceAvailable: (u.balanceTotal || 0) - (u.balancePending || 0),
      counters: userCounters(u.id) };
  }

  // ---------- Дашборд ----------
  app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const data = db();
    const gs = portalSettings();
    const users = data.users;
    const tests = data.tests;
    const done = tests.filter(t => t.status === 'done');
    const paid = data.purchases.filter(p => p.status !== 'refunded');
    const byType = { tools: 0, result: 0, logic: 0, sales: 0, knowledge: 0 };
    done.forEach(t => { if (byType[t.type] != null) byType[t.type]++; });
    const byMethod = { stripe: 0, demo: 0 };
    paid.forEach(p => { if (byMethod[p.method] != null) byMethod[p.method] += p.amount || 0; });
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), regs: 0, testsDone: 0, revenue: 0 });
    }
    const dmap = {}; days.forEach(d => { dmap[d.date] = d; });
    users.forEach(u => { const d = dmap[dayKey(u.createdAt)]; if (d) d.regs++; });
    done.forEach(t => { const d = dmap[dayKey(t.finishedAt)]; if (d) d.testsDone++; });
    paid.forEach(p => { const d = dmap[dayKey(p.createdAt)]; if (d) d.revenue += p.amount || 0; });
    const activeWeek = users.filter(u => within(u.lastLoginAt, 7)
      || tests.some(t => t.userId === u.id && within(t.sentAt, 7))).length;
    res.json({
      users: { total: users.length, new7d: users.filter(u => within(u.createdAt, 7)).length,
        new30d: users.filter(u => within(u.createdAt, 30)).length,
        blocked: users.filter(u => u.blocked === true).length, activeWeek },
      tests: { sentTotal: tests.length, doneTotal: done.length,
        done7d: done.filter(t => within(t.finishedAt, 7)).length, byType },
      revenue: { total: paid.reduce((s, p) => s + (p.amount || 0), 0),
        m30: paid.filter(p => within(p.createdAt, 30)).reduce((s, p) => s + (p.amount || 0), 0),
        byMethod, currency: gs.currency || 'eur' },
      balance: { soldTotal: users.reduce((s, u) => s + (u.balanceTotal || 0), 0),
        pendingTotal: users.reduce((s, u) => s + (u.balancePending || 0), 0) },
      days,
      recentUsers: users.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
        .map(u => ({ id: u.id, email: u.email, name: u.name || '', createdAt: u.createdAt })),
      recentPurchases: data.purchases.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
        .map(p => { const u = findUser(p.userId); return { id: p.id, amount: p.amount, planId: p.planId, qty: p.qty,
          method: p.method, status: p.status, userId: p.userId, userEmail: u ? u.email : '(удалён)', createdAt: p.createdAt }; }),
      warnings: {
        stripe: !stripeKey(),
        resend: !integ.isConfigured({}, 'resend'),
        secretDefault: SECRET === 'hraipro-dev-secret-change-me',
        maintenance: !!gs.maintenanceMode,
      },
    });
  });

  // ---------- Клиенты ----------
  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const data = db();
    const q = String(req.query.q || '').toLowerCase().trim();
    const status = String(req.query.status || 'all');
    const sort = String(req.query.sort || 'created_desc');
    let list = data.users.slice();
    if (q) list = list.filter(u => (u.email + ' ' + (u.name || '') + ' ' + (u.company || '')).toLowerCase().includes(q));
    if (status === 'active') list = list.filter(u => u.blocked !== true);
    else if (status === 'blocked') list = list.filter(u => u.blocked === true);
    else if (status === 'paying') list = list.filter(u => data.purchases.some(p => p.userId === u.id && p.method === 'stripe'));
    let items = list.map(userItem);
    const cmp = {
      created_desc: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      created_asc: (a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''),
      balance_desc: (a, b) => b.balanceAvailable - a.balanceAvailable,
      activity_desc: (a, b) => (b.lastLoginAt || '').localeCompare(a.lastLoginAt || ''),
      revenue_desc: (a, b) => b.counters.revenue - a.counters.revenue,
    }[sort] || null;
    if (cmp) items.sort(cmp);
    res.json(pageOf(items, req.query.page, req.query.perPage));
  });

  app.get('/api/admin/users/:id', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    ensureSettings(u);
    const data = db();
    // активность за 30 дней (отправленные/пройденные тесты)
    const days = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(0, 10), sent: 0, done: 0 }); }
    const dmap = {}; days.forEach(d => { dmap[d.date] = d; });
    data.tests.filter(t => t.userId === u.id).forEach(t => {
      const s = dmap[dayKey(t.sentAt)]; if (s) s.sent++;
      const f = dmap[dayKey(t.finishedAt)]; if (t.status === 'done' && f) f.done++;
    });
    const integFlags = {};
    Object.keys(integ.PROVIDERS).forEach(k => { integFlags[k] = !!((u.settings.integrations || {})[k] && Object.keys(u.settings.integrations[k]).length); });
    res.json({ user: Object.assign(userItem(u), { adminNote: u.adminNote || '' }), days,
      settings: { uiLang: u.settings.uiLang, timezone: u.settings.timezone, linkDays: u.settings.linkDays,
        integrations: integFlags,
        jobPortals: Object.keys((u.settings.jobPortals || {})).filter(k => u.settings.jobPortals[k] && Object.keys(u.settings.jobPortals[k]).length) } });
  });

  app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const b = req.body || {};
    const diff = {};
    if (b.email !== undefined) {
      const email = String(b.email).trim();
      if (!/.+@.+\..+/.test(email)) return res.status(400).json({ error: 'Некорректный email' });
      if (db().users.some(x => x.id !== u.id && x.email.toLowerCase() === email.toLowerCase()))
        return res.status(409).json({ error: 'Email уже занят другим клиентом' });
      if (email !== u.email) { diff.email = [u.email, email]; u.email = email; }
    }
    if (b.name !== undefined) { diff.name = [u.name, String(b.name).slice(0, 120)]; u.name = String(b.name).slice(0, 120); }
    if (b.surname !== undefined) { ensureSettings(u); u.settings.surname = String(b.surname).slice(0, 120); }
    if (b.company !== undefined) { diff.company = [u.company, String(b.company).slice(0, 160)]; u.company = String(b.company).slice(0, 160); }
    if (b.adminNote !== undefined) u.adminNote = String(b.adminNote).slice(0, 4000);
    if (b.role !== undefined && ['admin', 'user'].includes(b.role) && b.role !== (u.role || 'user')) {
      if (b.role === 'user' && u.role === 'admin' && adminsCount() <= 1)
        return res.status(400).json({ error: 'Нельзя понизить последнего администратора' });
      diff.role = [u.role || 'user', b.role]; u.role = b.role;
    }
    logAdmin(req, 'user_update', 'user', u.id, diff);
    save(); res.json({ user: Object.assign(userItem(u), { adminNote: u.adminNote || '' }) });
  });

  app.post('/api/admin/users/:id/block', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const blocked = !!(req.body && req.body.blocked);
    if (u.id === req.adminUser.id) return res.status(400).json({ error: 'Нельзя заблокировать самого себя' });
    if (blocked && u.role === 'admin') return res.status(400).json({ error: 'Нельзя заблокировать администратора' });
    u.blocked = blocked;
    logAdmin(req, blocked ? 'user_block' : 'user_unblock', 'user', u.id, { reason: String((req.body && req.body.reason) || '').slice(0, 500) });
    save(); res.json({ ok: true, blocked: u.blocked });
  });

  app.post('/api/admin/users/:id/balance', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const delta = intOr(req.body && req.body.delta, 0);
    const comment = String((req.body && req.body.comment) || '').trim();
    if (!delta || Math.abs(delta) > 100000) return res.status(400).json({ error: 'Δ — целое число, не более 100000 по модулю' });
    if (comment.length < 3 || comment.length > 500) return res.status(400).json({ error: 'Комментарий обязателен (3–500 символов)' });
    const next = (u.balanceTotal || 0) + delta;
    if (next < (u.balancePending || 0)) return res.status(400).json({ error: `Баланс не может стать меньше брони (${u.balancePending})` });
    _ensureLots(u); // зафиксировать прежний баланс лотом до изменения (срок 1 год)
    u.balanceTotal = next;
    if (delta > 0) addBalanceLot(u, delta, 'admin_add'); else spendLots(u, -delta);
    logBalance(u.id, delta, delta > 0 ? 'admin_add' : 'admin_sub', { comment, adminId: req.adminUser.id });
    logAdmin(req, delta > 0 ? 'balance_add' : 'balance_sub', 'user', u.id, { delta, comment });
    save(); res.json({ ok: true, balanceTotal: u.balanceTotal, balancePending: u.balancePending });
  });

  app.get('/api/admin/users/:id/balance-log', requireAdmin, (req, res) => {
    const data = db();
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const log = data.balanceLog.filter(l => l.userId === u.id)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .map(l => ({ ...l, adminEmail: l.adminId ? (findUser(l.adminId) || {}).email || null : null }));
    const purchases = data.purchases.filter(p => p.userId === u.id)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    res.json({ log, purchases });
  });

  app.get('/api/admin/users/:id/tests', requireAdmin, (req, res) => {
    const data = db();
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const tests = data.tests.filter(t => t.userId === u.id)
      .sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))
      .map(t => {
        const p = data.participants.find(x => x.id === t.participantId);
        return { id: t.id, type: t.type, title: testTitleOf(t.type), status: t.status,
          sentAt: t.sentAt, finishedAt: t.finishedAt,
          candidate: p ? (((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || p.tel || '—') : '(удалён)' };
      });
    res.json({ tests });
  });

  app.post('/api/admin/users/:id/reset-integrations', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    ensureSettings(u);
    u.settings.integrations = {};
    logAdmin(req, 'user_update', 'user', u.id, { integrationsReset: true });
    save(); res.json({ ok: true });
  });

  app.post('/api/admin/users/:id/reset-password', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    u.password = hashPassword(pwd);
    logAdmin(req, 'password_reset', 'user', u.id, {});
    save(); res.json({ password: pwd });
  });

  app.post('/api/admin/users/:id/impersonate', requireAdmin, (req, res) => {
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    if (u.role === 'admin') return res.status(400).json({ error: 'Нельзя войти как другой администратор' });
    if (u.blocked === true) return res.status(400).json({ error: 'Клиент заблокирован' });
    res.cookie('impersonate_uid', u.id, { signed: true, httpOnly: true, sameSite: 'lax', maxAge: 2 * 3600e3 });
    logAdmin(req, 'impersonate_start', 'user', u.id, {});
    save(); res.json({ ok: true });
  });
  app.post('/api/admin/impersonate/stop', requireAuth, (req, res) => {
    // доступно и в режиме имперсонации: requireAuth ставит adminUser
    const admin = req.adminUser || req.user;
    if (admin.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
    res.clearCookie('impersonate_uid');
    res.json({ ok: true });
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const data = db();
    const u = findUser(req.params.id);
    if (!u) return res.status(404).json({ error: 'Клиент не найден' });
    if (u.id === req.adminUser.id) return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    if (u.role === 'admin') return res.status(400).json({ error: 'Нельзя удалить администратора' });
    const counters = userCounters(u.id);
    ['sections', 'vacancies', 'participants', 'tests', 'anketas', 'requisitions'].forEach(coll => {
      data[coll] = data[coll].filter(x => x.userId !== u.id);
    });
    // покупки остаются для бухгалтерии, помечаются
    data.purchases.forEach(p => { if (p.userId === u.id) p.userDeleted = true; });
    data.users = data.users.filter(x => x.id !== u.id);
    logAdmin(req, 'user_delete', 'user', u.id, { email: u.email, counters });
    save(); res.json({ ok: true });
  });

  // ---------- Платежи ----------
  app.get('/api/admin/purchases', requireAdmin, (req, res) => {
    const data = db();
    const q = String(req.query.q || '').toLowerCase().trim();
    const method = String(req.query.method || 'all');
    const from = String(req.query.from || ''), to = String(req.query.to || '');
    let list = data.purchases.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    let items = list.map(p => {
      const u = findUser(p.userId);
      return { ...p, userEmail: u ? u.email : '(удалён)', userName: u ? (u.name || '') : '', planName: p.planId };
    });
    if (q) items = items.filter(p => (p.userEmail + ' ' + p.userName).toLowerCase().includes(q));
    if (method !== 'all') items = items.filter(p => p.method === method);
    if (from) items = items.filter(p => dayKey(p.createdAt) >= from);
    if (to) items = items.filter(p => dayKey(p.createdAt) <= to);
    const paidItems = items.filter(p => p.status !== 'refunded');
    const byMethod = { stripe: 0, demo: 0 };
    paidItems.forEach(p => { if (byMethod[p.method] != null) byMethod[p.method] += p.amount || 0; });
    const totals = { totalAmount: paidItems.reduce((s, p) => s + (p.amount || 0), 0), count: items.length, byMethod,
      m30: paidItems.filter(p => within(p.createdAt, 30)).reduce((s, p) => s + (p.amount || 0), 0),
      currency: portalSettings().currency || 'eur' };
    res.json(Object.assign(pageOf(items, req.query.page, req.query.perPage), { totals }));
  });

  app.post('/api/admin/purchases/:id/refund', requireAdmin, (req, res) => {
    const data = db();
    const p = data.purchases.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Покупка не найдена' });
    if (p.status === 'refunded') return res.status(400).json({ error: 'Покупка уже возвращена' });
    const comment = String((req.body && req.body.comment) || '').trim();
    if (comment.length < 3 || comment.length > 500) return res.status(400).json({ error: 'Комментарий обязателен (3–500 символов)' });
    const u = findUser(p.userId);
    if (u) {
      _ensureLots(u); // зафиксировать прежний баланс лотом до возврата
      const before = u.balanceTotal || 0;
      u.balanceTotal = Math.max(u.balancePending || 0, before - (p.qty || 0)); // не ниже брони
      spendLots(u, before - u.balanceTotal);
      logBalance(u.id, u.balanceTotal - before, 'refund', { purchaseId: p.id, comment, adminId: req.adminUser.id });
    }
    p.status = 'refunded'; p.refundedAt = nowISO();
    logAdmin(req, 'purchase_refund', 'purchase', p.id, { qty: p.qty, amount: p.amount, comment });
    save(); res.json({ ok: true });
  });

  app.get('/api/admin/balance-log', requireAdmin, (req, res) => {
    const data = db();
    const userId = String(req.query.userId || '');
    const kind = String(req.query.kind || '');
    let list = data.balanceLog.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (userId) list = list.filter(l => l.userId === userId);
    if (kind) list = list.filter(l => l.kind === kind);
    const items = list.map(l => { const u = findUser(l.userId); const a = l.adminId ? findUser(l.adminId) : null;
      return { ...l, userEmail: u ? u.email : '(удалён)', adminEmail: a ? a.email : null }; });
    res.json(pageOf(items, req.query.page, req.query.perPage));
  });

  app.get('/api/admin/stripe/status', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const keySource = (gs.stripe.secretKey || '').trim() ? 'db' : (process.env.STRIPE_SECRET_KEY ? 'env' : null);
    res.json({ configured: !!getStripe(), keySource, webhook: !!((gs.stripe.webhookSecret || '').trim() || process.env.STRIPE_WEBHOOK_SECRET) });
  });

  // ---------- Тарифы ----------
  app.get('/api/admin/plans', requireAdmin, (req, res) => {
    const gs = portalSettings();
    res.json({ plans: portalPlans(), currency: gs.currency || 'eur',
      signupBonus: gs.signupBonus, stripeConfigured: !!getStripe() });
  });
  app.put('/api/admin/plans', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const b = req.body || {};
    if (Array.isArray(b.plans)) {
      const ids = new Set();
      const clean = [];
      for (const p of b.plans.slice(0, 20)) {
        const id = String((p && p.id) || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
        const qty = intOr(p && p.qty, 0), price = intOr(p && p.price, -1);
        if (!id || ids.has(id)) return res.status(400).json({ error: 'ID пакетов должны быть уникальны (латиница)' });
        if (qty <= 0) return res.status(400).json({ error: `Пакет «${id}»: количество тестов должно быть больше 0` });
        if (price < 0) return res.status(400).json({ error: `Пакет «${id}»: цена не может быть отрицательной` });
        ids.add(id);
        clean.push({ id, qty, price, save: Math.max(0, Math.min(99, intOr(p.save, 0))),
          popular: !!p.popular, active: p.active !== false, order: intOr(p.order, clean.length + 1) });
      }
      // «Хит» — не больше одного
      let hit = false;
      clean.forEach(p => { if (p.popular) { if (hit) p.popular = false; hit = true; } });
      gs.plans = clean;
    }
    if (b.currency && ['eur', 'usd', 'pln', 'rub'].includes(String(b.currency).toLowerCase())) gs.currency = String(b.currency).toLowerCase();
    if (b.signupBonus !== undefined) gs.signupBonus = Math.max(0, intOr(b.signupBonus, 200));
    logAdmin(req, 'plans_update', 'plan', null, { plans: gs.plans.map(p => p.id), currency: gs.currency, signupBonus: gs.signupBonus });
    save(); res.json({ plans: gs.plans, currency: gs.currency, signupBonus: gs.signupBonus });
  });

  // ---------- Интеграции (глобальные ключи портала) ----------
  const ADM_PROVIDERS = () => {
    const gs = portalSettings();
    const list = [];
    // Stripe — отдельный «провайдер» админки
    const stripeCfg = gs.stripe || {};
    list.push({ id: 'stripe', name: 'Stripe', purpose: 'Приём платежей',
      fields: [
        { key: 'secretKey', label: 'Secret Key', secret: true, placeholder: 'sk_live_… / sk_test_…' },
        { key: 'webhookSecret', label: 'Webhook Secret', secret: true, placeholder: 'whsec_…' },
      ],
      values: { secretKey: mask(stripeCfg.secretKey), webhookSecret: mask(stripeCfg.webhookSecret) },
      source: (stripeCfg.secretKey || '').trim() ? 'db' : (process.env.STRIPE_SECRET_KEY ? 'env' : null),
      configured: !!stripeKey(), usersConfigured: 0,
      webhookUrl: getBaseUrl() + '/api/stripe/webhook' });
    const PURPOSE = { resend: 'Email кандидатам', smsapi: 'SMS кандидатам', vapi: 'ИИ-звонки кандидатам (телефония)',
      elevenlabs: 'Голос для ИИ-звонков', zadarma: 'Виртуальный номер / SIP' };
    Object.keys(integ.PROVIDERS).forEach(pKey => {
      const meta = integ.PROVIDERS[pKey];
      const dbCfg = (gs.integrations || {})[pKey] || {};
      const dbHas = Object.values(dbCfg).some(v => v);
      const envHas = integ.isConfigured({}, pKey) && !dbHas; // настроено без db-слоя → env/файл
      const usersConfigured = db().users.filter(u => u.settings && u.settings.integrations
        && u.settings.integrations[pKey] && Object.values(u.settings.integrations[pKey]).some(v => v)).length;
      list.push({ id: pKey, name: meta.title, purpose: PURPOSE[pKey] || meta.purpose_ru,
        fields: meta.fields.map(f => ({ key: f.key, label: f.label, secret: !!f.secret, placeholder: f.hint || '' })),
        values: Object.fromEntries(meta.fields.map(f => [f.key, f.secret ? mask(dbCfg[f.key]) : (dbCfg[f.key] || '')])),
        source: dbHas ? 'db' : (envHas ? 'env' : null),
        configured: integ.isConfigured({}, pKey), usersConfigured });
    });
    return list;
  };
  app.get('/api/admin/integrations', requireAdmin, (req, res) => res.json({ providers: ADM_PROVIDERS() }));

  app.put('/api/admin/integrations/:provider', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const pKey = req.params.provider;
    const values = (req.body && req.body.values) || {};
    const changed = [];
    if (pKey === 'stripe') {
      ['secretKey', 'webhookSecret'].forEach(k => {
        if (values[k] === undefined) return;
        const v = values[k] === null ? '' : String(values[k]).trim();
        if (v.startsWith('••••')) return; // маска = не менять
        gs.stripe[k] = v; changed.push(k);
      });
      initStripe();
    } else if (integ.PROVIDERS[pKey]) {
      gs.integrations[pKey] = gs.integrations[pKey] || {};
      integ.PROVIDERS[pKey].fields.forEach(f => {
        if (values[f.key] === undefined) return;
        const v = values[f.key] === null ? '' : String(values[f.key]).trim();
        if (v.startsWith('••••')) return;
        if (v === '') delete gs.integrations[pKey][f.key]; else gs.integrations[pKey][f.key] = v;
        changed.push(f.key);
      });
    } else return res.status(400).json({ error: 'Неизвестный сервис' });
    logAdmin(req, 'integration_update', 'integration', pKey, { fields: changed }); // без значений секретов
    save(); res.json({ ok: true });
  });

  app.post('/api/admin/integrations/:provider/test', requireAdmin, async (req, res) => {
    const pKey = req.params.provider;
    const to = String((req.body && req.body.to) || '').trim();
    try {
      let r;
      const glob = {}; // пустые user-settings → работает глобальная конфигурация
      if (pKey === 'stripe') {
        const s = getStripe();
        if (!s) return res.status(400).json({ error: 'Stripe не настроен' });
        const bal = await s.balance.retrieve();
        r = { available: (bal.available || []).map(b => b.amount + ' ' + b.currency).join(', ') || '0' };
      }
      else if (pKey === 'resend') r = await integ.sendEmail(glob, { to: to || req.adminUser.email, subject: (portalSettings().portalName || 'HR AI Pro') + ' — тест интеграции Resend', text: 'Интеграция Resend работает. Это тестовое письмо из админ-панели.' });
      else if (pKey === 'smsapi') { if (!to) return res.status(400).json({ error: 'Укажите номер телефона' }); r = await integ.sendSms(glob, { to, message: (portalSettings().portalName || 'HR AI Pro') + ': интеграция SMSAPI работает.' }); }
      else if (pKey === 'vapi') r = to ? await integ.startCall(glob, { to, task: 'Тестовый звонок из админ-панели: поздоровайся, скажи, что интеграция ИИ-звонков работает, и попрощайся.' }) : await integ.vapiPing(glob);
      else if (pKey === 'elevenlabs') r = await integ.listVoices(glob);
      else if (pKey === 'zadarma') r = await integ.zadarmaBalance(glob);
      else return res.status(400).json({ error: 'Неизвестный сервис' });
      if (r && r.skipped) return res.status(400).json({ error: r.reason });
      res.json({ ok: true, result: r });
    } catch (e) { res.status(502).json({ error: String(e.message || e).slice(0, 400) }); }
  });

  // ---------- Настройки портала ----------
  app.get('/api/admin/settings', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const out = JSON.parse(JSON.stringify(gs));
    delete out.stripe; delete out.integrations; // секреты — только через экран интеграций
    delete out.defaultEmailTemplates; delete out.defaultSmsTemplates; delete out.defaultMailTemplates;
    res.json({ settings: out, env: { baseUrl: ctx.ENV_BASE_URL, port: ctx.PORT,
      secretIsDefault: SECRET === 'hraipro-dev-secret-change-me' } });
  });
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const patch = (req.body && req.body.patch) || req.body || {};
    const diff = {};
    const applyStr = (k, max) => { if (patch[k] !== undefined) { diff[k] = [gs[k], String(patch[k]).slice(0, max)]; gs[k] = String(patch[k]).slice(0, max); } };
    const applyBool = k => { if (typeof patch[k] === 'boolean') { diff[k] = [gs[k], patch[k]]; gs[k] = patch[k]; } };
    const applyInt = (k, min, max, d) => { if (patch[k] !== undefined) { const v = Math.max(min, Math.min(max, intOr(patch[k], d))); diff[k] = [gs[k], v]; gs[k] = v; } };
    applyStr('portalName', 80); applyStr('baseUrl', 300); applyStr('supportEmail', 160);
    applyBool('registrationOpen'); applyInt('signupBonus', 0, 100000, 200);
    applyInt('defaultLinkDays', 1, 365, 3);
    if (patch.defaultUiLang !== undefined && ['ru', 'pl', 'en'].includes(patch.defaultUiLang)) { diff.defaultUiLang = [gs.defaultUiLang, patch.defaultUiLang]; gs.defaultUiLang = patch.defaultUiLang; }
    applyStr('defaultTimezone', 80);
    applyInt('passwordMinLength', 4, 64, 6);
    applyBool('maintenanceMode'); applyStr('maintenanceMessage', 500);
    applyPortalEnv();
    logAdmin(req, 'settings_update', 'settings', null, diff);
    save(); res.json({ ok: true });
  });

  // ---------- Контент и шаблоны ----------
  app.get('/api/admin/templates', requireAdmin, (req, res) => {
    const gs = portalSettings();
    res.json({
      emailTemplates: gs.defaultEmailTemplates || DEFAULT_TEMPLATES,
      smsTemplates: gs.defaultSmsTemplates || DEFAULT_SMS,
      mailTemplates: gs.defaultMailTemplates && gs.defaultMailTemplates.send ? gs.defaultMailTemplates : DEFAULT_MAIL(),
      overridden: { email: !!gs.defaultEmailTemplates, sms: !!gs.defaultSmsTemplates, mail: !!gs.defaultMailTemplates },
      langs: LANGS, mailLangs: MAIL_LANGS,
      mailSendItems: MAIL_SEND_ITEMS, mailStatusItems: MAIL_STATUS_ITEMS, testNames: TEST_NAMES,
      placeholders: ['{candidate}', '{company}', '{vacancy}', '{test}', '{link}'],
      mailPlaceholders: ['$vac$', '$name$', '$company$', '$client$', '$link$', '$button_link$', '$phone$', '$date_interview$'],
    });
  });
  app.put('/api/admin/templates', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const b = req.body || {};
    if (b.emailTemplates && typeof b.emailTemplates === 'object') {
      const cur = gs.defaultEmailTemplates || JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
      LANGS.forEach(l => { const t = b.emailTemplates[l.code];
        if (t && typeof t === 'object') cur[l.code] = { subject: String(t.subject || '').slice(0, 300), body: String(t.body || '').slice(0, 8000) }; });
      gs.defaultEmailTemplates = cur;
    }
    if (b.smsTemplates && typeof b.smsTemplates === 'object') {
      const cur = gs.defaultSmsTemplates || JSON.parse(JSON.stringify(DEFAULT_SMS));
      LANGS.forEach(l => { if (b.smsTemplates[l.code] != null) cur[l.code] = String(b.smsTemplates[l.code]).slice(0, 360); });
      gs.defaultSmsTemplates = cur;
    }
    if (b.mailTemplates && typeof b.mailTemplates === 'object') {
      const base = gs.defaultMailTemplates && gs.defaultMailTemplates.send ? gs.defaultMailTemplates : DEFAULT_MAIL();
      gs.defaultMailTemplates = cleanMailTemplates(b.mailTemplates, base);
    }
    logAdmin(req, 'templates_update', 'settings', null, { email: !!b.emailTemplates, sms: !!b.smsTemplates, mail: !!b.mailTemplates });
    save(); res.json({ ok: true });
  });
  app.post('/api/admin/templates/preview', requireAdmin, (req, res) => {
    const b = req.body || {};
    const base = getBaseUrl() + '/t/DEMO123456';
    const demo = { '{candidate}': 'Иван Иванов', '{company}': portalSettings().portalName || 'HR AI Pro',
      '{vacancy}': 'Менеджер по продажам', '{test}': 'Резалт', '{link}': base,
      '$vac$': 'Менеджер по продажам', '$name$': 'Иван Иванов', '$company$': portalSettings().portalName || 'HR AI Pro',
      '$client$': 'Иван Иванов', '$link$': base, '$button_link$': base, '$phone$': '+48 500 600 700', '$date_interview$': '15.07.2026 14:00' };
    const fill = s => Object.entries(demo).reduce((acc, [k, v]) => acc.split(k).join(v), String(s || ''));
    res.json({ subject: fill(b.subject), body: fill(b.body).replace(/\n/g, '<br>') });
  });
  app.post('/api/admin/templates/reset', requireAdmin, (req, res) => {
    const gs = portalSettings();
    const scope = (req.body && req.body.scope) || 'all';
    if (scope === 'email' || scope === 'all') gs.defaultEmailTemplates = null;
    if (scope === 'sms' || scope === 'all') gs.defaultSmsTemplates = null;
    if (scope === 'mail' || scope === 'all') gs.defaultMailTemplates = null;
    logAdmin(req, 'templates_reset', 'settings', null, { scope });
    save(); res.json({ ok: true });
  });

  // ---------- Обучение (markdown-статьи) ----------
  const eduSafe = slug => /^[\w.-]+$/.test(slug) && !slug.includes('..');
  app.get('/api/admin/education', requireAdmin, (req, res) => {
    let files = [];
    try {
      files = fs.readdirSync(EDU_DIR).filter(f => f.endsWith('.md')).map(f => {
        const st = fs.statSync(path.join(EDU_DIR, f));
        return { slug: f.replace(/\.md$/, ''), file: f, size: st.size, mtime: st.mtime.toISOString() };
      });
    } catch (_) {}
    res.json({ files });
  });
  app.get('/api/admin/education/:slug', requireAdmin, (req, res) => {
    const slug = req.params.slug;
    if (!eduSafe(slug)) return res.status(400).json({ error: 'Некорректное имя' });
    const f = path.join(EDU_DIR, slug + '.md');
    if (!fs.existsSync(f)) return res.status(404).json({ error: 'Статья не найдена' });
    res.json({ slug, text: fs.readFileSync(f, 'utf8') });
  });
  app.put('/api/admin/education/:slug', requireAdmin, (req, res) => {
    const slug = req.params.slug;
    if (!eduSafe(slug)) return res.status(400).json({ error: 'Некорректное имя' });
    const f = path.join(EDU_DIR, slug + '.md');
    if (!fs.existsSync(f)) return res.status(404).json({ error: 'Статья не найдена' });
    fs.writeFileSync(f, String((req.body && req.body.text) || ''), 'utf8');
    logAdmin(req, 'education_update', 'settings', slug, {});
    res.json({ ok: true });
  });

  // ---------- Журнал действий ----------
  const ACTION_LABELS = {
    user_update: 'Изменил профиль клиента', user_block: 'Заблокировал клиента', user_unblock: 'Разблокировал клиента',
    balance_add: 'Начислил баланс', balance_sub: 'Списал баланс', password_reset: 'Сбросил пароль',
    impersonate_start: 'Вход как клиент', impersonated_change: 'Изменение в режиме имперсонации',
    user_delete: 'Удалил клиента', purchase_refund: 'Возврат покупки', plans_update: 'Изменил тарифы',
    integration_update: 'Обновил ключи интеграции', settings_update: 'Изменил настройки портала',
    templates_update: 'Изменил шаблоны', templates_reset: 'Вернул заводские шаблоны', education_update: 'Изменил статью обучения',
  };
  app.get('/api/admin/log', requireAdmin, (req, res) => {
    const data = db();
    let list = data.adminLog.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (req.query.adminId) list = list.filter(l => l.adminId === req.query.adminId);
    if (req.query.action) list = list.filter(l => l.action === req.query.action);
    if (req.query.targetType) list = list.filter(l => l.targetType === req.query.targetType);
    if (req.query.from) list = list.filter(l => dayKey(l.createdAt) >= req.query.from);
    if (req.query.to) list = list.filter(l => dayKey(l.createdAt) <= req.query.to);
    const items = list.map(l => {
      const a = findUser(l.adminId);
      let targetLabel = l.targetId || '';
      if (l.targetType === 'user') { const u = findUser(l.targetId); targetLabel = u ? u.email : ((l.details && l.details.email) || l.targetId); }
      return { ...l, adminEmail: a ? a.email : '(удалён)', actionLabel: ACTION_LABELS[l.action] || l.action, targetLabel };
    });
    const admins = data.users.filter(u => u.role === 'admin').map(userBrief);
    res.json(Object.assign(pageOf(items, req.query.page, req.query.perPage), { admins, actions: ACTION_LABELS }));
  });
};
