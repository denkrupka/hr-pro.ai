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
      phone: (u.settings && u.settings.phone) || '',
      company: u.company || '', role: u.role === 'admin' ? 'admin' : 'user', blocked: !!u.blocked,
      createdAt: u.createdAt || null, lastLoginAt: u.lastLoginAt || null,
      balanceTotal: u.balanceTotal || 0, balancePending: u.balancePending || 0,
      balanceAvailable: (u.balanceTotal || 0) - (u.balancePending || 0),
      counters: userCounters(u.id) };
  }

  // ---------- Лиды отдела продаж ----------
  const salesAgentAdm = require('./sales-agent');
  app.get('/api/admin/leads', requireAdmin, (req, res) => {
    const rows = db().leads || [];
    const qq = String(req.query.q || '').toLowerCase().trim();
    const st = String(req.query.status || 'all');
    let list = rows;
    if (qq) list = list.filter(l => (l.name || '').toLowerCase().includes(qq) || (l.phone || '').includes(qq) || (l.email || '').toLowerCase().includes(qq) || (l.company || '').toLowerCase().includes(qq));
    if (st !== 'all') list = list.filter(l => (l.status || 'new') === st);
    list = [...list].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const items = list.map(l => ({ id: l.id, name: l.name || '', phone: l.phone || '', email: l.email || '', company: l.company || '',
      lang: l.lang || 'ru', source: l.source || '', status: l.status || 'new', createdAt: l.createdAt || null,
      calls: (l.aiCallLog || []).length, lastCallAt: (l.aiCallLog || []).length ? (l.aiCallLog[l.aiCallLog.length - 1].createdAt || null) : null,
      interest: l.interest || '', callbackWhen: l.callbackWhen || '', userId: l.userId || null,
      user: l.userId ? (u => u ? userBrief(u) : null)(findUser(l.userId)) : null }));
    res.json(pageOf(items, req.query.page, req.query.perPage || 50));
  });
  app.post('/api/admin/leads', requireAdmin, (req, res) => {
    // Ручное создание лида (полная форма в админке)
    const b = req.body || {};
    const phone = String(b.phone || '').trim().slice(0, 30);
    if (!phone && !String(b.email || '').trim()) return res.status(400).json({ error: 'Укажите телефон или email' });
    const lead = { id: uid(12), name: String(b.name || '').trim().slice(0, 80), phone,
      email: String(b.email || '').trim().toLowerCase().slice(0, 120), company: String(b.company || '').trim().slice(0, 120),
      lang: ['ru', 'pl', 'en'].includes(b.lang) ? b.lang : 'ru', source: 'manual', status: 'new',
      interest: String(b.interest || '').trim().slice(0, 500), createdAt: nowISO(), aiCallLog: [] };
    db().leads.push(lead);
    logAdmin(req, 'lead_create', 'lead', lead.id);
    save(); res.json({ lead });
  });
  app.get('/api/admin/leads/:id', requireAdmin, (req, res) => {
    const l = (db().leads || []).find(x => x.id === req.params.id);
    if (!l) return res.status(404).json({ error: 'Не найдено' });
    const u = l.userId ? findUser(l.userId) : null;
    res.json({ lead: l, user: u ? { ...userBrief(u), createdAt: u.createdAt } : null });
  });
  app.put('/api/admin/leads/:id', requireAdmin, (req, res) => {
    // Редактирование данных лида
    const l = (db().leads || []).find(x => x.id === req.params.id);
    if (!l) return res.status(404).json({ error: 'Не найдено' });
    const b = req.body || {};
    const set = (k, max) => { if (typeof b[k] === 'string') l[k] = b[k].trim().slice(0, max || 200); };
    set('name', 80); set('phone', 30); set('company', 120); set('interest', 500); set('callbackWhen', 200);
    if (typeof b.email === 'string') l.email = b.email.trim().toLowerCase().slice(0, 120);
    if (['ru', 'pl', 'en'].includes(b.lang)) l.lang = b.lang;
    if (typeof b.status === 'string' && ['new', 'no_answer', 'talked', 'callback', 'registered', 'refused', 'do_not_call', 'converted'].includes(b.status)) l.status = b.status;
    logAdmin(req, 'lead_update', 'lead', l.id);
    save(); res.json({ lead: l });
  });
  app.delete('/api/admin/leads/:id', requireAdmin, (req, res) => {
    const data = db();
    data.leads = (data.leads || []).filter(x => x.id !== req.params.id);
    logAdmin(req, 'lead_delete', 'lead', req.params.id);
    save(); res.json({ ok: true });
  });
  // Ручной ИИ-перезвон Софии (лид или клиент) с целью и доп. контекстом.
  async function startManualSalesCall({ phone, lang, name, lead, clientUser, goal, extra, metadata }) {
    const gs = portalSettings();
    const vcfg = integ.cfgOf(null, 'vapi');
    const salesPhoneId = gs.vapiSalesPhoneId || vcfg.salesPhoneNumberId || '';
    if (!vcfg.apiKey || !salesPhoneId) throw new Error('Vapi не настроен (номер отдела продаж)');
    const secret = gs.vapiInboundSecret || '';
    const base = getBaseUrl().replace(/\/+$/, '');
    const g = salesAgentAdm.CALL_GOALS[goal] || salesAgentAdm.CALL_GOALS.close;
    let block = '';
    if (clientUser) block = [`Компания: ${clientUser.company || '—'}.`, `Баланс тестов: ${Math.max(0, (clientUser.balanceTotal || 0) - (clientUser.balancePending || 0))} доступно.`, `Зарегистрирован: ${String(clientUser.createdAt || '').slice(0, 10)}.`].join('\n');
    else if (lead) block = salesAgentAdm.leadContext(lead);
    const histSrc = clientUser ? { aiCallLog: clientUser.salesCalls || [] } : lead;
    const hist = histSrc ? salesAgentAdm.historyBlock(histSrc) : '';
    const extraBlock = extra ? `\nДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ОТ МЕНЕДЖЕРА (активно используй в разговоре, это твой козырь): ${String(extra).slice(0, 600)}` : '';
    const leadBlock = [block, hist, '\n' + g.prompt + extraBlock].filter(Boolean).join('\n\n');
    const assistant = salesAgentAdm.buildAssistant({ mode: clientUser ? 'client' : 'lead', lang, name: name || '', company: clientUser ? (clientUser.company || '') : '', leadBlock,
      plans: gs.plans, currency: gs.currency, inbound: false, elevenKey: integ.cfgOf(null, 'elevenlabs').apiKey,
      toolServerUrl: base + '/api/vapi/sales-inbound', toolSecret: secret });
    if (clientUser) {
      assistant.firstMessage = lang === 'pl' ? `Dzień dobry${name ? ', ' + name : ''}! Tu Zofia z HR-PRO.AI. Dzwonię w sprawie naszego portalu — ma Pan chwilę?`
        : lang === 'en' ? `Hello${name ? ', ' + name : ''}! This is Sofia from HR-PRO.AI. I'm calling about our portal — do you have a minute?`
        : `Здравствуйте${name ? ', ' + name : ''}! Это София из HR-PRO.AI. Звоню по поводу нашего портала — есть минутка?`;
    }
    if (secret) assistant.server = { url: base + '/api/vapi/sales-inbound', secret };
    const callBody = { phoneNumberId: salesPhoneId, customer: { number: salesAgentAdm.toE164(phone) }, assistant };
    if (metadata) callBody.metadata = metadata;
    const r = await fetch('https://api.vapi.ai/call', { method: 'POST', headers: { Authorization: 'Bearer ' + vcfg.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(callBody) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.id) throw new Error('Vapi: ' + ((d && (Array.isArray(d.message) ? d.message.join('; ') : d.message)) || r.status));
    return d.id;
  }
  app.post('/api/admin/leads/:id/call', requireAdmin, async (req, res) => {
    const l = (db().leads || []).find(x => x.id === req.params.id);
    if (!l) return res.status(404).json({ error: 'Не найдено' });
    if (!l.phone) return res.status(400).json({ error: 'У лида не указан телефон' });
    try {
      const callId = await startManualSalesCall({ phone: l.phone, lang: l.lang || 'ru', name: l.name || '', lead: l, goal: req.body && req.body.goal, extra: req.body && req.body.extra });
      l.aiCallLog = Array.isArray(l.aiCallLog) ? l.aiCallLog : [];
      l.aiCallLog.push({ callId, kind: 'manual', dir: 'out', goal: (req.body && req.body.goal) || 'close', createdAt: nowISO(), status: 'calling', lang: l.lang || 'ru' });
      logAdmin(req, 'lead_call', 'lead', l.id, { goal: req.body && req.body.goal });
      save(); res.json({ ok: true, callId });
    } catch (e) { res.status(502).json({ error: e.message }); }
  });
  app.post('/api/admin/users/:id/call', requireAdmin, async (req, res) => {
    const cu = findUser(req.params.id);
    if (!cu) return res.status(404).json({ error: 'Не найдено' });
    const phone = (cu.settings && cu.settings.phone) || '';
    if (!phone) return res.status(400).json({ error: 'У клиента не указан телефон (карточка → Изменить → Телефон)' });
    try {
      const lang = ['ru', 'pl', 'en'].includes(cu.settings && cu.settings.uiLang) ? cu.settings.uiLang : 'ru';
      // Журнал — на аккаунте клиента (не в лидах). Отчёт вернётся по metadata.userId.
      const callId = await startManualSalesCall({ phone, lang, name: cu.name || '', clientUser: cu, goal: req.body && req.body.goal, extra: req.body && req.body.extra, metadata: { kind: 'client', userId: cu.id } });
      cu.salesCalls = Array.isArray(cu.salesCalls) ? cu.salesCalls : [];
      cu.salesCalls.push({ callId, kind: 'manual', dir: 'out', goal: (req.body && req.body.goal) || 'upsell', createdAt: nowISO(), status: 'calling', lang });
      logAdmin(req, 'client_call', 'user', cu.id, { goal: req.body && req.body.goal });
      save(); res.json({ ok: true, callId });
    } catch (e) { res.status(502).json({ error: e.message }); }
  });
  app.post('/api/admin/users/:id/calls/refresh', requireAdmin, async (req, res) => {
    const cu = findUser(req.params.id);
    if (!cu) return res.status(404).json({ error: 'Не найдено' });
    const vcfg = integ.cfgOf(null, 'vapi');
    if (vcfg.apiKey && Array.isArray(cu.salesCalls)) {
      for (const e of cu.salesCalls) {
        if (!e.callId) continue;
        try {
          const r = await fetch('https://api.vapi.ai/call/' + encodeURIComponent(e.callId), { headers: { Authorization: 'Bearer ' + vcfg.apiKey } });
          const d = await r.json().catch(() => ({})); if (!r.ok) continue;
          const art = d.artifact || {}; const rec = art.recording || {}; const a = d.analysis || {};
          if (d.status === 'ended') { e.status = 'done'; e.endedAt = d.endedAt || e.endedAt; }
          e.transcript = d.transcript || art.transcript || e.transcript || '';
          e.recordingUrl = art.presignedStereoUrl || art.presignedMonoUrl || d.recordingUrl || art.recordingUrl || (rec.mono && rec.mono.combinedUrl) || rec.stereoUrl || art.stereoRecordingUrl || e.recordingUrl || null;
          e.summary = a.summary || e.summary || ''; e.answers = a.structuredData || e.answers || null;
          if (d.startedAt && d.endedAt) e.durationSec = Math.max(0, Math.round((new Date(d.endedAt) - new Date(d.startedAt)) / 1000));
        } catch (_) {}
      }
      save();
    }
    res.json({ calls: cu.salesCalls || [] });
  });
  app.post('/api/admin/leads/:id/refresh', requireAdmin, async (req, res) => {
    const l = (db().leads || []).find(x => x.id === req.params.id);
    if (!l) return res.status(404).json({ error: 'Не найдено' });
    const vcfg = integ.cfgOf(null, 'vapi');
    if (vcfg.apiKey) {
      for (const e of (l.aiCallLog || [])) {
        if (!e.callId) continue; // всегда обновляем: подписанные ссылки записей (R2) истекают
        try {
          const r = await fetch('https://api.vapi.ai/call/' + encodeURIComponent(e.callId), { headers: { Authorization: 'Bearer ' + vcfg.apiKey } });
          const d = await r.json().catch(() => ({}));
          if (!r.ok) continue;
          const art = d.artifact || {}; const rec = art.recording || {};
          if (d.status === 'ended') { e.status = 'done'; e.endedAt = d.endedAt || e.endedAt; }
          e.transcript = d.transcript || art.transcript || e.transcript || '';
          e.recordingUrl = art.presignedStereoUrl || art.presignedMonoUrl || d.recordingUrl || art.recordingUrl || (rec.mono && rec.mono.combinedUrl) || rec.stereoUrl || art.stereoRecordingUrl || e.recordingUrl || null;
          const a = d.analysis || {};
          e.summary = a.summary || e.summary || '';
          e.answers = a.structuredData || e.answers || null;
          if (d.startedAt && d.endedAt) e.durationSec = Math.max(0, Math.round((new Date(d.endedAt) - new Date(d.startedAt)) / 1000));
          if (e.status === 'done') salesAgentAdm.applyCallResult(l, { summary: e.summary, sd: e.answers, transcript: e.transcript });
        } catch (_) {}
      }
      save();
    }
    res.json({ lead: l });
  });

  // ---------- Создание клиента вручную ----------
  app.post('/api/admin/users', requireAdmin, (req, res) => {
    const b = req.body || {};
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Укажите корректный email' });
    const data = db();
    if (data.users.find(u => u.email.toLowerCase() === email)) return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    const password = String(b.password || '');
    if (password.length < 6) return res.status(400).json({ error: 'Пароль — минимум 6 символов' });
    const bonus = Math.max(0, Math.min(1000, parseInt(b.balance, 10) || 0));
    const u = { id: uid(12), email, password: hashPassword(password), name: String(b.name || '').trim().slice(0, 80) || email.split('@')[0],
      company: String(b.company || '').trim().slice(0, 120), balanceTotal: bonus, balancePending: 0, balanceLots: [],
      settings: { uiLang: ['ru', 'pl', 'en'].includes(b.uiLang) ? b.uiLang : 'ru', surname: String(b.surname || '').trim().slice(0, 80), phone: String(b.phone || '').trim().slice(0, 30) },
      role: 'user', blocked: false, adminNote: String(b.note || '').slice(0, 500), onboarded: true, emailVerified: true, createdAt: nowISO(), lastLoginAt: null };
    if (bonus > 0) { addBalanceLot(u, bonus, 'admin_add'); logBalance(u.id, bonus, 'admin_add', { comment: 'Стартовый баланс (создание клиента админом)' }); }
    data.users.push(u);
    // лид с этим email/телефоном → клиент
    data.leads.forEach(l => {
      if (l.userId) return;
      const pk9 = s => String(s || '').replace(/\D/g, '').replace(/^00/, '').slice(-9);
      if ((l.email && l.email.toLowerCase() === email) || (u.settings.phone && pk9(u.settings.phone) && pk9(l.phone) === pk9(u.settings.phone))) {
        l.userId = u.id; l.status = 'converted'; l.convertedAt = nowISO();
      }
    });
    logAdmin(req, 'user_create', 'user', u.id, { email });
    save(); res.json({ user: userItem(u) });
  });

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
      salesCalls: u.salesCalls || [],
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
    if (b.phone !== undefined) { ensureSettings(u); u.settings.phone = String(b.phone).trim().slice(0, 30); }
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
    res.cookie('impersonate_uid', u.id, { signed: true, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 2 * 3600e3 });
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
    ['vapiInboundSecret', 'telegramWebhookSecret', 'telegramBotToken', 'cronSecret', 'videoOAuth'].forEach(k => delete out[k]);
    Object.keys(out).forEach(k => { if (/secret|token|password|apikey|clientsecret/i.test(k)) delete out[k]; });
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
