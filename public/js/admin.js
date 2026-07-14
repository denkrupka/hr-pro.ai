'use strict';
// ================= Админ-панель HR PRO AI (SPA, паттерны app.js) =================
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const api = async (url, opts = {}) => {
  const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  if (r.status === 401) { location.href = '/login?next=/admin'; throw new Error('unauth'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Ошибка запроса');
  return d;
};
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); };
const _svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON_SEARCH = _svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>');
const ICON_COPY = _svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>');
const ICON_TRASH = _svg('<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>');
const AV_COLORS = ['#3d6cd1', '#7b52c9', '#1f9d6b', '#e0982a', '#e8553b', '#1780a1', '#c2447a'];
const avColor = s => AV_COLORS[Math.abs(String(s || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AV_COLORS.length];
const initials = (nm, email) => { const p = String(nm || '').trim().split(/\s+/).filter(Boolean); if (p.length) return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase(); return (String(email || '?')[0] || '?').toUpperCase(); };
function fmtDate(iso) { if (!iso) return '—'; const d = new Date(iso), p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)} ${p(d.getHours())}:${p(d.getMinutes())}`; }
const CUR_SIGN = { eur: '€', usd: '$', pln: 'zł', rub: '₽' };
const money = (n, cur) => (n || 0).toLocaleString('ru-RU') + ' ' + (CUR_SIGN[cur] || cur || '');
function openModal(html, wide) {
  $('#modal-root').innerHTML = `<div class="overlay" id="ov"><div class="modal" style="${wide ? '' : 'max-width:640px'}"><button class="close" onclick="closeModal()">×</button>${html}</div></div>`;
  $('#ov').onclick = e => { if (e.target.id === 'ov') closeModal(); };
}
function closeModal() { $('#modal-root').innerHTML = ''; }
window.closeModal = closeModal;
function kpiCard(n, label, color, icon) { return `<div class="kpi"><div class="kpi-ic" style="background:${color}1f;color:${color}">${icon}</div><div><div class="kpi-n" style="color:${color}">${n}</div><div class="kpi-l">${label}</div></div></div>`; }
function sparkArea(vals, id) {
  const max = Math.max(1, ...vals); const n = vals.length;
  const xy = vals.map((v, i) => [+(i / (n - 1) * 300).toFixed(1), +(72 - v / max * 60).toFixed(1)]);
  const pts = xy.map(p => p.join(',')).join(' ');
  const last = xy[xy.length - 1];
  return `<svg viewBox="0 0 300 80" preserveAspectRatio="none" class="spark"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".3"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs><polygon points="0,80 ${pts} 300,80" fill="url(#${id})"/><polyline points="${pts}" fill="none" stroke="var(--brand)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2.5"/></svg>`;
}
function donut(entries, totalLabel) {
  const list = entries.filter(e => e.value > 0);
  const total = list.reduce((a, e) => a + e.value, 0) || 1; const R = 42, C = 2 * Math.PI * R; let acc = 0;
  const segs = list.map(e => { const dash = e.value / total * C; const s = `<circle r="${R}" cx="60" cy="60" fill="none" stroke="${e.color}" stroke-width="15" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 60 60)"/>`; acc += dash; return s; }).join('');
  const legend = list.map(e => `<div class="dn-leg"><i style="background:${e.color}"></i>${esc(e.label)} <b>${e.value}</b></div>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 120 120" class="donut">${segs}<text x="60" y="57" text-anchor="middle" class="donut-n">${total}</text><text x="60" y="74" text-anchor="middle" class="donut-l">${esc(totalLabel)}</text></svg><div class="dn-legend">${legend || '<span class="muted">Нет данных</span>'}</div></div>`;
}
function pager(cur, total, perPage, onGo) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return '';
  const btns = [];
  const push = p => btns.push(`<button class="${p === cur ? 'on' : ''}" data-pg="${p}">${p}</button>`);
  btns.push(`<button data-pg="${cur - 1}" ${cur <= 1 ? 'disabled' : ''}>‹</button>`);
  const around = [...new Set([1, cur - 1, cur, cur + 1, pages].filter(p => p >= 1 && p <= pages))].sort((a, b) => a - b);
  let prev = 0;
  around.forEach(p => { if (p - prev > 1) btns.push('<span class="muted">…</span>'); push(p); prev = p; });
  btns.push(`<button data-pg="${cur + 1}" ${cur >= pages ? 'disabled' : ''}>›</button>`);
  window.__pgGo = onGo;
  return `<div class="adm-pager" onclick="if(event.target.dataset.pg)__pgGo(+event.target.dataset.pg)">${btns.join('')}</div>`;
}
function exportCsv(name, headers, rows) {
  if (!rows.length) return toast('Нет данных для экспорта');
  const escC = v => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = '﻿' + [headers.map(escC).join(';'), ...rows.map(r => r.map(escC).join(';'))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name + '.csv'; a.click();
}
const TEST_LABEL = { tools: 'Тулс', result: 'Резалт', logic: 'Логис', sales: 'Сэйлс', knowledge: 'Знания' };
const KIND_LABEL = { purchase: 'Покупка', admin_add: 'Начисление', admin_sub: 'Списание', test_spend: 'Тест', refund: 'Возврат', signup_bonus: 'Бонус' };

const state = { me: null, view: 'dashboard', clientsQ: { q: '', status: 'all', sort: 'created_desc', page: 1 }, payQ: { q: '', method: 'all', from: '', to: '', page: 1, tab: 'purchases' }, currency: 'eur' };

// ---------- Каркас ----------
$('#theme-toggle').onclick = () => {
  const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = cur; localStorage.setItem('theme', cur);
};
if (localStorage.getItem('theme') === 'dark') document.documentElement.dataset.theme = 'dark';
$('#logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); location.href = '/login'; };
$('#to-app').onclick = () => { location.href = '/app'; };
$('#brand-home').onclick = () => setView('dashboard');
$$('.nav-item[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));

function setView(v) {
  state.view = v;
  $$('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  ({ dashboard: renderAdmDashboard, clients: renderAdmClients, payments: renderAdmPayments, plans: renderAdmPlans,
    integrations: renderAdmIntegrations, content: renderAdmContent, log: renderAdmLog }[v] || renderAdmDashboard)();
}

// ---------- Дашборд ----------
async function renderAdmDashboard() {
  const d = await api('/api/admin/stats');
  state.currency = d.revenue.currency;
  const cur = d.revenue.currency;
  const warn = [];
  if (d.warnings.maintenance) warn.push(`<div class="ai-note tone-low"><div class="ai-h">Включён режим обслуживания — портал скрыт от клиентов</div></div>`);
  if (d.warnings.stripe) warn.push(`<div class="ai-note tone-mid"><div class="ai-h">Stripe не настроен — все покупки зачисляются бесплатно (демо-режим)</div></div>`);
  if (d.warnings.resend) warn.push(`<div class="ai-note tone-mid"><div class="ai-h">Email-рассылка не настроена — письма кандидатам не отправляются</div></div>`);
  if (d.warnings.secretDefault) warn.push(`<div class="ai-note tone-low"><div class="ai-h">SECRET по умолчанию — смените его в продакшене (env SECRET)</div></div>`);
  const regRows = d.recentUsers.map(u => `<div class="dash-recent-row adm-row" data-uid="${u.id}"><span class="avatar" style="width:30px;height:30px;background:${avColor(u.email)}">${initials(u.name, u.email)}</span><div class="rr-main"><b>${esc(u.name || u.email)}</b><span class="muted">${esc(u.email)}</span></div><span class="muted" style="font-size:12px">${fmtDate(u.createdAt)}</span></div>`).join('') || '<p class="muted">Пока пусто</p>';
  const payRows = d.recentPurchases.map(p => `<div class="dash-recent-row adm-row" data-pay="${esc(p.userEmail)}"><div class="rr-main"><b>${money(p.amount, cur)} · ${esc(p.planId)}</b><span class="muted">${esc(p.userEmail)}</span></div><span class="blk m-${p.method}">${p.method}</span><span class="muted" style="font-size:12px">${fmtDate(p.createdAt)}</span></div>`).join('') || '<p class="muted">Покупок пока нет</p>';
  $('#main').innerHTML = `<div class="eyebrow reveal">Админ-панель</div><h1 class="page-h reveal d1" style="margin-top:10px">Дашборд портала</h1>
    <div class="reveal d1">${warn.join('')}</div>
    <div class="kpi-grid reveal d1" style="margin-top:8px">
      ${kpiCard(d.users.total, 'Клиентов всего', '#3d6cd1', _svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0-1-5.8M21 20a5 5 0 0 0-6-4.9"/>'))}
      ${kpiCard(d.users.new30d, 'Новых за 30 дней', '#7b52c9', _svg('<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0M19 5h4M21 3v4"/>'))}
      ${kpiCard(d.users.activeWeek, 'Активных за неделю', '#1f9d6b', _svg('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>'))}
      ${kpiCard(money(d.revenue.m30, cur), 'Выручка за 30 дней', '#e0982a', _svg('<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/>'))}
      ${kpiCard(d.tests.doneTotal, 'Тестов пройдено', '#17a8a0', _svg('<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>'))}
      ${kpiCard(d.balance.pendingTotal, 'Тестов в ожидании', '#c98a1e', _svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'))}
    </div>
    <div class="dash-grid reveal d2">
      <div class="card"><div class="adm-chart-h"><h3>Регистрации · 30 дней</h3><b>${d.users.new30d}</b></div>${sparkArea(d.days.map(x => x.regs), 'sgA')}</div>
      <div class="card"><div class="adm-chart-h"><h3>Выручка · 30 дней</h3><b>${money(d.revenue.m30, cur)}</b></div>${sparkArea(d.days.map(x => x.revenue), 'sgB')}</div>
      <div class="card"><div class="adm-chart-h"><h3>Тесты по типам</h3></div>${donut([
        { label: 'Резалт', value: d.tests.byType.result, color: '#1f9d6b' },
        { label: 'Тулс', value: d.tests.byType.tools, color: '#3d6cd1' },
        { label: 'Логис', value: d.tests.byType.logic, color: '#7b52c9' },
        { label: 'Сэйлс', value: d.tests.byType.sales, color: '#e8553b' },
        { label: 'Знания', value: d.tests.byType.knowledge, color: '#17a8a0' },
      ], 'пройдено')}</div>
      <div class="card"><div class="adm-chart-h"><h3>Последние регистрации</h3></div>${regRows}</div>
      <div class="card dash-col-2"><div class="adm-chart-h"><h3>Последние платежи</h3></div>${payRows}</div>
    </div>`;
  $$('[data-uid]').forEach(r => r.onclick = () => openClient(r.dataset.uid));
  $$('[data-pay]').forEach(r => r.onclick = () => { state.payQ.q = r.dataset.pay; state.payQ.page = 1; setView('payments'); });
}

// ---------- Клиенты: список ----------
async function renderAdmClients() {
  const q = state.clientsQ;
  const d = await api(`/api/admin/users?q=${encodeURIComponent(q.q)}&status=${q.status}&sort=${q.sort}&page=${q.page}`);
  const rows = d.items.map(u => `<tr class="adm-row" data-uid="${u.id}">
    <td><div class="cand"><span class="avatar" style="width:32px;height:32px;background:${avColor(u.email)}">${initials(u.name, u.email)}</span>
      <div><b>${esc((u.name + ' ' + u.surname).trim() || u.email)}</b><div class="muted" style="font-size:12px">${esc(u.email)}</div></div></div></td>
    <td>${esc(u.company || '—')}</td><td class="muted">${fmtDate(u.createdAt)}</td><td class="muted">${fmtDate(u.lastLoginAt)}</td>
    <td class="mono">${u.balanceAvailable} / ${u.balanceTotal}</td>
    <td style="text-align:center"><b>${u.counters.testsDone}</b></td>
    <td>${u.counters.purchases} / ${money(u.counters.revenue, state.currency)}</td>
    <td><span class="blk ${u.blocked ? 'st-off' : 'st-on'}">${u.blocked ? 'Заблокирован' : 'Активен'}</span>${u.role === 'admin' ? ' <span class="blk m-stripe">admin</span>' : ''}</td></tr>`).join('');
  $('#main').innerHTML = `<div class="topbar reveal"><div><div class="eyebrow">Админ-панель</div><h1 class="page-h" style="margin-top:8px">Клиенты</h1></div>
      <span class="tag">Всего: <b>${d.total}</b></span></div>
    <div class="card reveal d1">
      <div class="row" style="gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div class="search-wrap grow" style="flex:1;min-width:220px"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="cq" value="${esc(q.q)}" placeholder="Поиск по email, имени, компании…"></div>
        <select class="field" id="cstatus" style="max-width:190px">
          <option value="all" ${q.status === 'all' ? 'selected' : ''}>Все</option>
          <option value="active" ${q.status === 'active' ? 'selected' : ''}>Активные</option>
          <option value="blocked" ${q.status === 'blocked' ? 'selected' : ''}>Заблокированные</option>
          <option value="paying" ${q.status === 'paying' ? 'selected' : ''}>Платящие</option></select>
        <select class="field" id="csort" style="max-width:210px">
          <option value="created_desc" ${q.sort === 'created_desc' ? 'selected' : ''}>Сначала новые</option>
          <option value="created_asc" ${q.sort === 'created_asc' ? 'selected' : ''}>Сначала старые</option>
          <option value="balance_desc" ${q.sort === 'balance_desc' ? 'selected' : ''}>По балансу</option>
          <option value="activity_desc" ${q.sort === 'activity_desc' ? 'selected' : ''}>По активности</option>
          <option value="revenue_desc" ${q.sort === 'revenue_desc' ? 'selected' : ''}>По выручке</option></select>
        <button class="btn ghost" id="cexport">Экспорт CSV</button></div>
      <div class="table-wrap" style="box-shadow:none"><table><thead><tr>
        <th>Клиент</th><th>Компания</th><th>Регистрация</th><th>Последний вход</th><th>Баланс</th><th>Тестов</th><th>Покупки</th><th>Статус</th>
      </tr></thead><tbody>${rows || `<tr><td colspan="8" class="muted" style="text-align:center;padding:30px">Никого не найдено</td></tr>`}</tbody></table></div>
      ${pager(d.page, d.total, d.perPage, p => { state.clientsQ.page = p; renderAdmClients(); })}</div>`;
  let td;
  $('#cq').oninput = e => { clearTimeout(td); td = setTimeout(() => { q.q = e.target.value.trim(); q.page = 1; renderAdmClients(); }, 350); };
  $('#cstatus').onchange = e => { q.status = e.target.value; q.page = 1; renderAdmClients(); };
  $('#csort').onchange = e => { q.sort = e.target.value; q.page = 1; renderAdmClients(); };
  $('#cexport').onclick = () => exportCsv('clients', ['Email', 'Имя', 'Компания', 'Регистрация', 'Последний вход', 'Баланс доступно', 'Баланс всего', 'Тестов пройдено', 'Покупок', 'Выручка', 'Статус'],
    d.items.map(u => [u.email, (u.name + ' ' + u.surname).trim(), u.company, u.createdAt, u.lastLoginAt || '', u.balanceAvailable, u.balanceTotal, u.counters.testsDone, u.counters.purchases, u.counters.revenue, u.blocked ? 'blocked' : 'active']));
  $$('tr[data-uid]').forEach(r => r.onclick = () => openClient(r.dataset.uid));
}

// ---------- Клиенты: карточка ----------
let clientTab = 'overview';
async function openClient(uid, tab) {
  clientTab = tab || 'overview';
  $$('.nav-item[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === 'clients'));
  const d = await api('/api/admin/users/' + uid);
  const u = d.user;
  const c = u.counters;
  const isSelf = state.me && state.me.id === u.id;
  const tabs = [['overview', 'Обзор'], ['balance', 'Платежи и баланс'], ['tests', 'Тесты'], ['settings', 'Настройки клиента']];
  $('#main').innerHTML = `
    <button class="btn ghost sm reveal" id="back-clients" style="margin-bottom:12px">← Клиенты</button>
    <div class="card cand-head reveal d1">
      <span class="avatar" style="width:52px;height:52px;border-radius:15px;font-size:19px;background:${avColor(u.email)}">${initials(u.name, u.email)}</span>
      <div style="flex:1;min-width:0"><h1 style="margin:0;font-size:24px">${esc((u.name + ' ' + u.surname).trim() || u.email)}</h1>
        <div class="muted" style="font-size:13.5px">${esc(u.email)}${u.company ? ' · ' + esc(u.company) : ''} · рег. ${fmtDate(u.createdAt)} · вход ${fmtDate(u.lastLoginAt)}</div></div>
      <span class="blk ${u.blocked ? 'st-off' : 'st-on'}">${u.blocked ? 'Заблокирован' : 'Активен'}</span>
      ${u.role === 'admin' ? '<span class="blk m-stripe">admin</span>' : ''}</div>
    <div class="row reveal d1" style="gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn soft sm" id="c-edit">Изменить</button>
      <button class="btn soft sm" id="c-balance">± Баланс</button>
      ${u.role !== 'admin' && !u.blocked ? '<button class="btn ghost sm" id="c-imp">Войти как клиент</button>' : ''}
      <button class="btn ghost sm" id="c-pwd">Сбросить пароль</button>
      ${isSelf || u.role === 'admin' ? '' : (u.blocked
        ? '<button class="btn ghost sm" id="c-unblock">Разблокировать</button>'
        : '<button class="btn ghost danger sm" id="c-block">Заблокировать</button>')}
      ${isSelf || u.role === 'admin' ? '' : `<button class="btn ghost danger sm ic-btn" id="c-del">${ICON_TRASH}Удалить</button>`}</div>
    <div class="adm-stats reveal d2">
      <div class="adm-stat"><b>${u.balanceAvailable}</b><span>Доступный баланс</span></div>
      <div class="adm-stat"><b>${u.balanceTotal}</b><span>Всего на балансе</span></div>
      <div class="adm-stat"><b>${u.balancePending}</b><span>В брони</span></div>
      <div class="adm-stat"><b>${c.vacancies}</b><span>Вакансий</span></div>
      <div class="adm-stat"><b>${c.participants}</b><span>Кандидатов</span></div>
      <div class="adm-stat"><b>${c.testsSent} / ${c.testsDone}</b><span>Тестов отправлено / пройдено</span></div>
      <div class="adm-stat"><b>${money(c.revenue, state.currency)}</b><span>Покупок на сумму (${c.purchases})</span></div>
    </div>
    <div class="settabs reveal d2">${tabs.map(([k, l]) => `<button class="seg-tab ${clientTab === k ? 'on' : ''}" data-ctab="${k}">${l}</button>`).join('')}</div>
    <div class="reveal d2" id="client-body"><p class="muted">Загрузка…</p></div>`;
  $('#back-clients').onclick = () => setView('clients');
  $$('[data-ctab]').forEach(b => b.onclick = () => openClient(uid, b.dataset.ctab));
  // --- модалки шапки ---
  $('#c-edit').onclick = () => {
    openModal(`<h2 style="margin:0 0 16px">Редактирование клиента</h2>
      <div class="form-grid">
        <div><label class="lbl">Имя</label><input class="field" id="e-name" value="${esc(u.name)}"></div>
        <div><label class="lbl">Фамилия</label><input class="field" id="e-surname" value="${esc(u.surname)}"></div>
        <div><label class="lbl">Компания</label><input class="field" id="e-company" value="${esc(u.company)}"></div>
        <div><label class="lbl">Email</label><input class="field" id="e-email" value="${esc(u.email)}"></div>
        <div class="full"><label class="lbl">Роль</label><select class="field" id="e-role">
          <option value="user" ${u.role !== 'admin' ? 'selected' : ''}>Пользователь</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Администратор</option></select>
          <p id="e-role-warn" class="muted" style="display:none;color:var(--bad);margin:6px 0 0;font-size:12.5px">Пользователь получит полный доступ к админ-панели.</p></div></div>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="e-save">Сохранить</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#e-role').onchange = e => { $('#e-role-warn').style.display = e.target.value === 'admin' && u.role !== 'admin' ? '' : 'none'; };
    $('#e-save').onclick = async () => {
      try {
        await api('/api/admin/users/' + uid, { method: 'PUT', body: JSON.stringify({
          name: $('#e-name').value, surname: $('#e-surname').value, company: $('#e-company').value,
          email: $('#e-email').value, role: $('#e-role').value }) });
        toast('Сохранено ✓'); closeModal(); openClient(uid, clientTab);
      } catch (e) { toast(e.message); }
    };
  };
  $('#c-balance').onclick = () => {
    openModal(`<h2 style="margin:0 0 6px">Изменение баланса</h2>
      <p class="muted" style="margin:0 0 14px">Текущий баланс: <b>${u.balanceAvailable}</b> доступно / <b>${u.balancePending}</b> в брони</p>
      <div class="row" style="gap:6px;margin-bottom:12px">
        <button class="seg-tab on" id="b-add">Начислить</button><button class="seg-tab" id="b-sub">Списать</button></div>
      <label class="lbl">Количество тестов</label><input class="field" id="b-qty" type="number" min="1" value="10">
      <label class="lbl" style="margin-top:10px">Комментарий (обязательно)</label><input class="field" id="b-comment" placeholder="Например: бонус за пилот / компенсация">
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="b-apply" disabled>Применить</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    let sign = 1;
    $('#b-add').onclick = () => { sign = 1; $('#b-add').classList.add('on'); $('#b-sub').classList.remove('on'); };
    $('#b-sub').onclick = () => { sign = -1; $('#b-sub').classList.add('on'); $('#b-add').classList.remove('on'); };
    $('#b-comment').oninput = e => { $('#b-apply').disabled = e.target.value.trim().length < 3; };
    $('#b-apply').onclick = async () => {
      try {
        const delta = sign * Math.max(1, parseInt($('#b-qty').value, 10) || 0);
        await api(`/api/admin/users/${uid}/balance`, { method: 'POST', body: JSON.stringify({ delta, comment: $('#b-comment').value.trim() }) });
        toast('Баланс изменён ✓'); closeModal(); openClient(uid, clientTab);
      } catch (e) { toast(e.message); }
    };
  };
  const imp = $('#c-imp'); if (imp) imp.onclick = () => {
    openModal(`<h2 style="margin:0 0 10px">Войти как клиент</h2>
      <p class="muted" style="line-height:1.6">Вы увидите кабинет глазами клиента <b>${esc(u.email)}</b>. Все изменения будут записаны в журнал.</p>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="imp-go">Войти</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#imp-go').onclick = async () => {
      try { await api(`/api/admin/users/${uid}/impersonate`, { method: 'POST' }); location.href = '/app'; }
      catch (e) { toast(e.message); }
    };
  };
  $('#c-pwd').onclick = () => {
    openModal(`<h2 style="margin:0 0 10px">Сброс пароля</h2>
      <p class="muted" style="line-height:1.6">Текущий пароль клиента перестанет действовать. Будет сгенерирован временный пароль — передайте его клиенту вручную.</p>
      <div id="pwd-out"></div>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="pwd-gen">Сгенерировать новый пароль</button>
        <button class="btn ghost" onclick="closeModal()">Закрыть</button></div>`);
    $('#pwd-gen').onclick = async () => {
      try {
        const r = await api(`/api/admin/users/${uid}/reset-password`, { method: 'POST' });
        $('#pwd-out').innerHTML = `<div class="row" style="gap:10px;align-items:center;margin-top:14px;background:var(--surface-2);border-radius:10px;padding:14px 16px">
          <b class="mono" style="font-size:22px;letter-spacing:.06em">${esc(r.password)}</b>
          <button class="btn ghost sm ic-btn" id="pwd-copy">${ICON_COPY}Копировать</button></div>
          <p class="muted" style="font-size:12.5px;margin:8px 0 0">Пароль показан один раз. Передайте его клиенту.</p>`;
        $('#pwd-gen').style.display = 'none';
        $('#pwd-copy').onclick = () => { navigator.clipboard.writeText(r.password); toast('Скопировано'); };
      } catch (e) { toast(e.message); }
    };
  };
  const blk = $('#c-block'); if (blk) blk.onclick = () => {
    openModal(`<h2 style="margin:0 0 10px">Блокировка клиента</h2>
      <p class="muted" style="line-height:1.6">Клиент не сможет войти; ссылки его кандидатов перестанут открываться. Данные сохраняются.</p>
      <label class="lbl" style="margin-top:8px">Причина</label><input class="field" id="blk-reason" placeholder="Например: неоплата / нарушение условий">
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn danger" id="blk-go">Заблокировать</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#blk-go').onclick = async () => {
      try { await api(`/api/admin/users/${uid}/block`, { method: 'POST', body: JSON.stringify({ blocked: true, reason: $('#blk-reason').value }) });
        toast('Клиент заблокирован'); closeModal(); openClient(uid, clientTab); } catch (e) { toast(e.message); }
    };
  };
  const ublk = $('#c-unblock'); if (ublk) ublk.onclick = async () => {
    if (!confirm('Разблокировать клиента ' + u.email + '?')) return;
    await api(`/api/admin/users/${uid}/block`, { method: 'POST', body: JSON.stringify({ blocked: false }) });
    toast('Клиент разблокирован'); openClient(uid, clientTab);
  };
  const del = $('#c-del'); if (del) del.onclick = () => {
    openModal(`<h2 style="margin:0 0 10px">Удаление клиента</h2>
      <p class="muted" style="line-height:1.6">Будут удалены безвозвратно: <b>${c.vacancies}</b> вакансий, <b>${c.participants}</b> кандидатов, <b>${c.testsSent}</b> тестов, разделы, анкеты и заявки. История покупок сохранится для бухгалтерии.</p>
      <label class="lbl" style="margin-top:8px">Введите email клиента для подтверждения</label><input class="field" id="del-email" placeholder="${esc(u.email)}">
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn danger" id="del-go" disabled>Удалить навсегда</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#del-email').oninput = e => { $('#del-go').disabled = e.target.value.trim().toLowerCase() !== u.email.toLowerCase(); };
    $('#del-go').onclick = async () => {
      try { await api('/api/admin/users/' + uid, { method: 'DELETE' }); toast('Клиент удалён'); closeModal(); setView('clients'); }
      catch (e) { toast(e.message); }
    };
  };
  // --- вкладки ---
  const body = $('#client-body');
  if (clientTab === 'overview') {
    const hasActivity = d.days.some(x => x.sent || x.done);
    const maxV = Math.max(1, ...d.days.map(x => Math.max(x.sent, x.done)));
    const bars = d.days.map(x => `<div class="tb-col" title="${x.date}: отправлено ${x.sent}, пройдено ${x.done}" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:1px;height:70px">
      <div style="height:${Math.round(x.sent / maxV * 100)}%;background:var(--brand);opacity:.35;border-radius:3px 3px 0 0"></div>
      <div style="height:${Math.round(x.done / maxV * 100)}%;background:var(--good);border-radius:0 0 2px 2px"></div></div>`).join('');
    body.innerHTML = `<div class="card"><div class="adm-chart-h"><h3>Активность за 30 дней</h3><span class="muted" style="font-size:12px">синий — отправлено · зелёный — пройдено</span></div>
        ${hasActivity ? `<div style="display:flex;gap:2px;align-items:flex-end">${bars}</div>`
          : '<p class="muted" style="margin:20px 0;text-align:center">За последние 30 дней активности не было</p>'}</div>
      <div class="card" style="margin-top:14px"><h3 style="margin:0 0 10px">Заметка администратора</h3>
        <textarea class="field" id="c-note" rows="3" placeholder="Внутренняя заметка — клиенту не видна">${esc(u.adminNote)}</textarea>
        <button class="btn soft sm" id="c-note-save" style="margin-top:10px">Сохранить</button></div>`;
    $('#c-note-save').onclick = async () => {
      await api('/api/admin/users/' + uid, { method: 'PUT', body: JSON.stringify({ adminNote: $('#c-note').value }) });
      toast('Сохранено ✓');
    };
  } else if (clientTab === 'balance') {
    const bd = await api(`/api/admin/users/${uid}/balance-log`);
    const logRows = bd.log.map(l => `<tr><td class="muted mono" style="white-space:nowrap">${fmtDate(l.createdAt)}</td>
      <td><span class="blk ${l.kind}">${KIND_LABEL[l.kind] || l.kind}</span></td>
      <td class="mono" style="color:${l.delta >= 0 ? 'var(--good)' : 'var(--bad)'}">${l.delta >= 0 ? '+' : '−'}${Math.abs(l.delta)}</td>
      <td class="mono">${l.balanceAfter != null ? l.balanceAfter : '—'}</td>
      <td>${esc(l.comment || '')}</td><td class="muted">${l.adminEmail ? esc(l.adminEmail) : (l.kind === 'purchase' ? 'Stripe/демо' : 'система')}</td></tr>`).join('');
    const purchRows = bd.purchases.map(p => `<tr><td class="muted mono">${fmtDate(p.createdAt)}</td><td>${esc(p.planId)} · ${p.qty}</td>
      <td>${money(p.amount, state.currency)}</td><td><span class="blk m-${p.method}">${p.method}</span></td><td>${p.status}</td></tr>`).join('');
    body.innerHTML = `<div class="card"><h3 style="margin:0 0 10px">Журнал баланса</h3>
        <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>Дата</th><th>Операция</th><th>Δ</th><th>После</th><th>Комментарий</th><th>Кто</th></tr></thead>
        <tbody>${logRows || '<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">Операций нет</td></tr>'}</tbody></table></div></div>
      <div class="card" style="margin-top:14px"><h3 style="margin:0 0 10px">Покупки</h3>
        <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>Дата</th><th>Пакет</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
        <tbody>${purchRows || '<tr><td colspan="5" class="muted" style="text-align:center;padding:24px">Покупок нет</td></tr>'}</tbody></table></div></div>`;
  } else if (clientTab === 'tests') {
    const td2 = await api(`/api/admin/users/${uid}/tests`);
    const rows = td2.tests.map(t => `<tr><td>${esc(t.candidate)}</td><td>${esc(TEST_LABEL[t.type] || t.title)}</td>
      <td><span class="cstep-st ${t.status === 'done' ? 'done' : t.status === 'sent' ? 'sent' : ''}">${t.status === 'done' ? 'Пройден' : t.status === 'in_progress' ? 'Проходит' : 'Отправлен'}</span></td>
      <td class="muted mono">${fmtDate(t.sentAt)}</td><td class="muted mono">${fmtDate(t.finishedAt)}</td></tr>`).join('');
    body.innerHTML = `<div class="card"><p class="muted" style="margin:0 0 10px;font-size:12.5px">Только список — содержимое отчётов недоступно (приватность кандидатов).</p>
      <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>Кандидат</th><th>Тип</th><th>Статус</th><th>Отправлен</th><th>Пройден</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" class="muted" style="text-align:center;padding:24px">Тестов нет</td></tr>'}</tbody></table></div></div>`;
  } else if (clientTab === 'settings') {
    const s = d.settings;
    body.innerHTML = `<div class="card"><h3 style="margin:0 0 12px">Настройки клиента (только чтение)</h3>
      <div class="form-grid">
        <div><label class="lbl">Язык интерфейса</label><div class="mono">${esc(s.uiLang || 'ru')}</div></div>
        <div><label class="lbl">Часовой пояс</label><div class="mono">${esc(s.timezone || '—')}</div></div>
        <div class="full"><label class="lbl">Джоб-порталы</label><div>${s.jobPortals.length ? s.jobPortals.map(esc).join(', ') : '<span class="muted">не подключены</span>'}</div></div>
        <div class="full"><label class="lbl">Интеграции (Resend, SMSAPI, Vapi, ElevenLabs, Zadarma)</label>
          <div class="muted" style="font-size:13px;line-height:1.5">Настраиваются администратором на уровне портала и действуют для всех клиентов.</div>
          <button class="btn soft sm" style="margin-top:8px" id="c-goto-intg">Открыть «Интеграции»</button></div>
      </div></div>`;
    $('#c-goto-intg').onclick = () => setView('integrations');
  }
}

// ---------- Платежи ----------
async function renderAdmPayments() {
  const q = state.payQ;
  const [st, d] = await Promise.all([
    api('/api/admin/stripe/status'),
    q.tab === 'purchases'
      ? api(`/api/admin/purchases?q=${encodeURIComponent(q.q)}&method=${q.method}&from=${q.from}&to=${q.to}&page=${q.page}`)
      : api(`/api/admin/balance-log?page=${q.page}`),
  ]);
  const totals = q.tab === 'purchases' ? d.totals : null;
  if (totals) state.currency = totals.currency;
  const banner = !st.configured ? `<div class="ai-note tone-mid"><div class="ai-h">Stripe не настроен — покупки зачисляются в демо-режиме</div>
      <div class="row" style="margin-top:8px"><button class="btn soft sm" onclick="setView('integrations')">Настроить</button></div></div>` : '';
  let tableHtml = '';
  if (q.tab === 'purchases') {
    tableHtml = `<div class="table-wrap" style="box-shadow:none"><table><thead><tr>
      <th>Дата</th><th>Клиент</th><th>Пакет</th><th>Сумма</th><th>Метод</th><th>Статус</th><th>Session</th><th></th></tr></thead><tbody>
      ${d.items.map(p => `<tr><td class="muted mono">${fmtDate(p.createdAt)}</td>
        <td><a href="#" data-payuser="${p.userId}">${esc(p.userEmail)}</a></td>
        <td>${esc(p.planId)} · ${p.qty}</td><td><b>${money(p.amount, totals.currency)}</b></td>
        <td><span class="blk m-${p.method}">${p.method === 'stripe' ? 'Stripe' : 'Демо'}</span></td>
        <td>${p.status === 'refunded' ? '<span class="blk refund">refunded</span>' : '<span class="blk purchase">paid</span>'}</td>
        <td class="mono" title="${esc(p.sessionId || '')}">${p.sessionId ? esc(p.sessionId.slice(0, 14)) + '…' : '—'}</td>
        <td>${p.status !== 'refunded' ? `<button class="btn ghost xs" data-refund="${p.id}" data-rqty="${p.qty}" data-ramount="${p.amount}" title="Возврат">↩</button>` : ''}</td></tr>`).join('')
        || '<tr><td colspan="8" class="muted" style="text-align:center;padding:26px">Покупок нет</td></tr>'}
      </tbody></table></div>
      ${pager(d.page, d.total, d.perPage, p => { q.page = p; renderAdmPayments(); })}`;
  } else {
    tableHtml = `<div class="table-wrap" style="box-shadow:none"><table><thead><tr>
      <th>Дата</th><th>Клиент</th><th>Операция</th><th>Δ</th><th>После</th><th>Комментарий</th><th>Инициатор</th></tr></thead><tbody>
      ${d.items.map(l => `<tr><td class="muted mono">${fmtDate(l.createdAt)}</td><td>${esc(l.userEmail)}</td>
        <td><span class="blk ${l.kind}">${KIND_LABEL[l.kind] || l.kind}</span></td>
        <td class="mono" style="color:${l.delta >= 0 ? 'var(--good)' : 'var(--bad)'}">${l.delta >= 0 ? '+' : '−'}${Math.abs(l.delta)}</td>
        <td class="mono">${l.balanceAfter != null ? l.balanceAfter : '—'}</td>
        <td>${esc(l.comment || '')}</td><td class="muted">${l.adminEmail ? esc(l.adminEmail) : 'система'}</td></tr>`).join('')
        || '<tr><td colspan="7" class="muted" style="text-align:center;padding:26px">Записей нет</td></tr>'}
      </tbody></table></div>
      ${pager(d.page, d.total, d.perPage, p => { q.page = p; renderAdmPayments(); })}`;
  }
  $('#main').innerHTML = `<div class="eyebrow reveal">Админ-панель</div><h1 class="page-h reveal d1" style="margin-top:10px">Платежи</h1>
    <div class="reveal d1">${banner}</div>
    ${totals ? `<div class="adm-stats reveal d1">
      <div class="adm-stat"><b>${money(totals.totalAmount, totals.currency)}</b><span>Выручка (по фильтру)</span></div>
      <div class="adm-stat"><b>${money(totals.m30, totals.currency)}</b><span>Выручка за 30 дней</span></div>
      <div class="adm-stat"><b>${totals.count}</b><span>Покупок всего</span></div></div>` : ''}
    <div class="card reveal d2">
      <div class="settabs" style="margin-bottom:14px">
        <button class="seg-tab ${q.tab === 'purchases' ? 'on' : ''}" data-ptab="purchases">Покупки</button>
        <button class="seg-tab ${q.tab === 'log' ? 'on' : ''}" data-ptab="log">Журнал баланса</button></div>
      ${q.tab === 'purchases' ? `<div class="row" style="gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <div class="search-wrap grow" style="flex:1;min-width:200px"><span class="search-ic">${ICON_SEARCH}</span><input class="field" id="pq" value="${esc(q.q)}" placeholder="Поиск по email клиента…"></div>
        <select class="field" id="pmethod" style="max-width:150px">
          <option value="all" ${q.method === 'all' ? 'selected' : ''}>Все</option>
          <option value="stripe" ${q.method === 'stripe' ? 'selected' : ''}>Stripe</option>
          <option value="demo" ${q.method === 'demo' ? 'selected' : ''}>Демо</option></select>
        <input class="field" id="pfrom" type="date" value="${q.from}" style="max-width:160px">
        <input class="field" id="pto" type="date" value="${q.to}" style="max-width:160px">
        <button class="btn ghost" id="pexport">Экспорт CSV</button></div>` : ''}
      ${tableHtml}</div>`;
  $$('[data-ptab]').forEach(b => b.onclick = () => { q.tab = b.dataset.ptab; q.page = 1; renderAdmPayments(); });
  const pq = $('#pq'); if (pq) { let td; pq.oninput = e => { clearTimeout(td); td = setTimeout(() => { q.q = e.target.value.trim(); q.page = 1; renderAdmPayments(); }, 350); }; }
  const pm = $('#pmethod'); if (pm) pm.onchange = e => { q.method = e.target.value; q.page = 1; renderAdmPayments(); };
  const pf = $('#pfrom'); if (pf) pf.onchange = e => { q.from = e.target.value; q.page = 1; renderAdmPayments(); };
  const pt = $('#pto'); if (pt) pt.onchange = e => { q.to = e.target.value; q.page = 1; renderAdmPayments(); };
  const pe = $('#pexport'); if (pe) pe.onclick = () => exportCsv('purchases', ['Дата', 'Клиент', 'Пакет', 'Кол-во', 'Сумма', 'Метод', 'Статус'],
    d.items.map(p => [p.createdAt, p.userEmail, p.planId, p.qty, p.amount, p.method, p.status]));
  $$('[data-payuser]').forEach(a => a.onclick = e => { e.preventDefault(); openClient(a.dataset.payuser); });
  $$('[data-refund]').forEach(b => b.onclick = () => {
    openModal(`<h2 style="margin:0 0 10px">Возврат покупки</h2>
      <p class="muted" style="line-height:1.6">С баланса клиента будет списано <b>${b.dataset.rqty}</b> тестов (не ниже брони).
      Возврат денег (<b>${money(+b.dataset.ramount, state.currency)}</b>) выполните вручную в Stripe Dashboard —
      эта операция только корректирует баланс на портале.</p>
      <label class="lbl" style="margin-top:8px">Комментарий (обязательно)</label><input class="field" id="rf-comment">
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn danger" id="rf-go" disabled>Выполнить возврат</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#rf-comment').oninput = e => { $('#rf-go').disabled = e.target.value.trim().length < 3; };
    $('#rf-go').onclick = async () => {
      try { await api(`/api/admin/purchases/${b.dataset.refund}/refund`, { method: 'POST', body: JSON.stringify({ comment: $('#rf-comment').value.trim() }) });
        toast('Возврат выполнен'); closeModal(); renderAdmPayments(); } catch (e) { toast(e.message); }
    };
  });
}

// ---------- Тарифы ----------
async function renderAdmPlans() {
  const d = await api('/api/admin/plans');
  state.currency = d.currency;
  const sign = CUR_SIGN[d.currency] || d.currency;
  const planCard = p => `<div class="plan ${p.popular ? 'pop' : ''}" style="${p.active === false ? 'opacity:.5' : ''}">
    ${p.popular ? '<div class="ribbon">Хит</div>' : ''}
    <div class="qty">${p.qty}</div><div class="per">тестов</div>
    <div class="price">${p.price.toLocaleString('ru-RU')} ${sign}</div>
    ${p.save ? `<span class="save">Выгода ${p.save}%</span>` : ''}
    <div class="row" style="gap:8px;margin-top:10px;align-items:center">
      <button class="btn soft sm" data-plan-edit="${p.id}">Изменить</button>
      <span class="switch ${p.active !== false ? 'on' : ''}" data-plan-toggle="${p.id}" role="switch" tabindex="0"><i></i></span></div></div>`;
  $('#main').innerHTML = `<div class="topbar reveal"><div><div class="eyebrow">Админ-панель</div><h1 class="page-h" style="margin-top:8px">Тарифы</h1></div>
      <div class="row" style="gap:8px"><button class="btn ghost" id="pl-params">Параметры</button><button class="btn" id="pl-add">+ Добавить пакет</button></div></div>
    <div class="adm-stats reveal d1">
      <div class="adm-stat"><b>${d.plans.filter(p => p.active !== false).length}</b><span>Активных пакетов</span></div>
      <div class="adm-stat"><b>${d.currency.toUpperCase()} ${sign}</b><span>Валюта</span></div>
      <div class="adm-stat"><b>${d.stripeConfigured ? 'Stripe' : 'Демо'}</b><span>Режим оплаты</span></div></div>
    <div class="plan-grid reveal d2">${d.plans.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(planCard).join('')}</div>
    <div class="card reveal d2" style="margin-top:18px"><h3 style="margin:0 0 4px">Так видит клиент</h3>
      <p class="muted" style="margin:0 0 14px;font-size:12.5px">Активные пакеты в том виде, в котором они показаны на экране «Баланс».</p>
      <div class="plan-grid">${d.plans.filter(p => p.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map(p => `
        <div class="plan ${p.popular ? 'pop' : ''}">${p.popular ? '<div class="ribbon">Хит</div>' : ''}
        <div class="qty">${p.qty}</div><div class="per">тестов · ${(p.price / p.qty).toFixed(1)} ${sign} за тест</div>
        <div class="price">${p.price.toLocaleString('ru-RU')} ${sign}</div>
        ${p.save ? `<span class="save">Выгода ${p.save}%</span>` : ''}
        <button class="btn soft" disabled style="width:100%">Купить</button></div>`).join('')}</div></div>`;
  const savePlans = async plans => {
    await api('/api/admin/plans', { method: 'PUT', body: JSON.stringify({ plans }) });
    toast('Сохранено ✓'); renderAdmPlans();
  };
  $('#pl-params').onclick = () => {
    openModal(`<h2 style="margin:0 0 16px">Общие параметры продаж</h2>
      <label class="lbl">Валюта</label><select class="field" id="gp-cur">
        ${['eur', 'usd', 'pln', 'rub'].map(c => `<option value="${c}" ${d.currency === c ? 'selected' : ''}>${c.toUpperCase()} (${CUR_SIGN[c]})</option>`).join('')}</select>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="gp-save">Сохранить</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#gp-save').onclick = async () => {
      await api('/api/admin/plans', { method: 'PUT', body: JSON.stringify({ currency: $('#gp-cur').value }) });
      toast('Сохранено ✓'); closeModal(); renderAdmPlans();
    };
  };
  const openPlanModal = plan => {
    const isNew = !plan;
    const p = plan || { id: '', qty: 100, price: 0, save: 0, popular: false, active: true, order: d.plans.length + 1 };
    openModal(`<h2 style="margin:0 0 16px">${isNew ? 'Новый пакет' : 'Пакет «' + esc(p.id) + '»'}</h2>
      <div class="form-grid">
        <div><label class="lbl">ID (латиницей)</label><input class="field mono" id="pm-id" value="${esc(p.id)}" ${isNew ? '' : 'readonly'}></div>
        <div><label class="lbl">Количество тестов</label><input class="field" id="pm-qty" type="number" min="1" value="${p.qty}"></div>
        <div><label class="lbl">Цена (${sign})</label><input class="field" id="pm-price" type="number" min="0" value="${p.price}"></div>
        <div><label class="lbl">Скидка, % (лента)</label><input class="field" id="pm-save" type="number" min="0" max="99" value="${p.save || 0}"></div>
        <div><label class="lbl">Порядок</label><input class="field" id="pm-order" type="number" value="${p.order || 1}"></div>
        <div style="display:flex;align-items:flex-end;padding-bottom:6px"><label class="switchrow" style="border:none;padding:0;gap:10px"><span>Хит (выделить)</span>
          <span class="switch ${p.popular ? 'on' : ''}" id="pm-pop"><i></i></span></label></div></div>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="pm-save-btn">Сохранить</button>
        ${isNew ? '' : '<button class="btn ghost danger" id="pm-del">Удалить пакет</button>'}
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $('#pm-pop').onclick = () => $('#pm-pop').classList.toggle('on');
    $('#pm-save-btn').onclick = async () => {
      const upd = { id: ($('#pm-id').value || '').trim().toLowerCase(), qty: +$('#pm-qty').value, price: +$('#pm-price').value,
        save: +$('#pm-save').value || 0, popular: $('#pm-pop').classList.contains('on'), active: p.active !== false, order: +$('#pm-order').value || 1 };
      if (!upd.id) return toast('Укажите ID пакета');
      let plans = d.plans.slice();
      if (isNew) { if (plans.some(x => x.id === upd.id)) return toast('Такой ID уже есть'); plans.push(upd); }
      else plans = plans.map(x => x.id === p.id ? Object.assign({}, x, upd, { id: p.id }) : x);
      if (upd.popular) plans = plans.map(x => x.id === (isNew ? upd.id : p.id) ? x : Object.assign({}, x, { popular: false }));
      try { await savePlans(plans); closeModal(); } catch (e) { toast(e.message); }
    };
    const delBtn = $('#pm-del'); if (delBtn) delBtn.onclick = async () => {
      if (!confirm('Удалить пакет «' + p.id + '»? История покупок сохранится.')) return;
      try { await savePlans(d.plans.filter(x => x.id !== p.id)); closeModal(); } catch (e) { toast(e.message); }
    };
  };
  $('#pl-add').onclick = () => openPlanModal(null);
  $$('[data-plan-edit]').forEach(b => b.onclick = () => openPlanModal(d.plans.find(x => x.id === b.dataset.planEdit)));
  $$('[data-plan-toggle]').forEach(sw => sw.onclick = async () => {
    const plans = d.plans.map(x => x.id === sw.dataset.planToggle ? Object.assign({}, x, { active: x.active === false }) : x);
    try { await savePlans(plans); } catch (e) { toast(e.message); }
  });
}

// ---------- Интеграции ----------
async function renderAdmIntegrations() {
  const d = await api('/api/admin/integrations');
  const cards = d.providers.map(p => {
    const st = p.source === 'db' ? '<span class="blk st-on">Работает (портал)</span>'
      : p.configured ? `<span class="blk test_spend">Через ${esc(p.source || 'env/файл')}</span>`
      : '<span class="blk st-off">Не настроено</span>';
    return `<div class="card intg-card">
      <div class="row" style="justify-content:space-between;align-items:center;gap:8px">
        <b style="font-size:15.5px">${esc(p.name)}</b>${st}</div>
      <p class="muted" style="font-size:12.5px;margin:6px 0 4px;min-height:36px">${esc(p.purpose)}</p>
      ${p.usersConfigured ? `<div class="adm-intg-src">Свои ключи у ${p.usersConfigured} клиент(ов)</div>` : '<div class="adm-intg-src">Все клиенты используют глобальные ключи</div>'}
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn soft sm" data-intg-cfg="${p.id}">Настроить</button>
        <button class="btn ghost sm" data-intg-test="${p.id}">Проверить</button>
        ${p.source === 'db' ? `<button class="btn ghost danger sm" data-intg-off="${p.id}">Отключить</button>` : ''}
        <span style="font-size:12px" id="intg-res-${p.id}"></span></div></div>`;
  }).join('');
  $('#main').innerHTML = `<div class="eyebrow reveal">Админ-панель</div><h1 class="page-h reveal d1" style="margin-top:10px">Интеграции портала</h1>
    <p class="muted reveal d1" style="max-width:760px;line-height:1.55">Глобальные ключи действуют для всех клиентов, не настроивших свои
      (приоритет: файл → env → портал → клиент). Секреты хранятся в базе и показываются маской.</p>
    <div class="intg-grid reveal d2" style="margin-top:14px">${cards}</div>`;
  const doTest = async (id, to, outEl) => {
    outEl.style.color = 'var(--muted)'; outEl.textContent = '…';
    try {
      const r = await api(`/api/admin/integrations/${id}/test`, { method: 'POST', body: JSON.stringify({ to: to || '' }) });
      outEl.style.color = 'var(--good)';
      outEl.textContent = '✓ ' + (r.result && r.result.available ? 'Баланс: ' + r.result.available
        : r.result && r.result.voices ? 'Голосов: ' + r.result.voices.length
        : r.result && r.result.balance != null ? 'Баланс: ' + r.result.balance : 'Работает');
    } catch (e) { outEl.style.color = 'var(--bad)'; outEl.textContent = '✕ ' + e.message; }
  };
  $$('[data-intg-test]').forEach(b => b.onclick = () => {
    const id = b.dataset.intgTest;
    const out = $('#intg-res-' + id);
    if (['resend', 'smsapi', 'vapi'].includes(id)) {
      openModal(`<h2 style="margin:0 0 12px">Проверка ${esc(id)}</h2>
        <label class="lbl">${id === 'resend' ? 'Кому (email)' : 'Кому (телефон)'}</label>
        <input class="field" id="tst-to" placeholder="${id === 'resend' ? 'you@company.com' : '+48…'}">
        <div class="row" style="gap:8px;margin-top:14px"><button class="btn" id="tst-go">Отправить тест</button>
          <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
      $('#tst-go').onclick = () => { const to = $('#tst-to').value.trim(); closeModal(); doTest(id, to, out); };
    } else doTest(id, '', out);
  });
  $$('[data-intg-off]').forEach(b => b.onclick = async () => {
    const id = b.dataset.intgOff;
    if (!confirm('Удалить глобальные ключи «' + id + '» из базы?')) return;
    const p = d.providers.find(x => x.id === id);
    const values = {}; p.fields.forEach(f => { values[f.key] = null; });
    await api('/api/admin/integrations/' + id, { method: 'PUT', body: JSON.stringify({ values }) });
    toast('Отключено'); renderAdmIntegrations();
  });
  $$('[data-intg-cfg]').forEach(b => b.onclick = () => {
    const p = d.providers.find(x => x.id === b.dataset.intgCfg);
    const fields = p.fields.map(f => `<div class="full"><label class="lbl">${esc(f.label)}</label>
      <div class="row" style="gap:6px"><input class="field" id="if-${f.key}" type="${f.secret ? 'password' : 'text'}"
        placeholder="${esc(p.values[f.key] || f.placeholder || '')}" autocomplete="off" style="flex:1">
      ${f.secret ? `<button class="btn ghost sm" data-eye="if-${f.key}" title="Показать">👁</button>` : ''}</div></div>`).join('');
    const help = { stripe: 'dashboard.stripe.com → Developers → API keys. Webhook Secret — после создания вебхука.',
      resend: 'resend.com → API Keys (re_…). From — адрес отправителя с подтверждённым доменом.',
      smsapi: 'smsapi.pl / smsapi.com → токен OAuth.', vapi: 'dashboard.vapi.ai → Organization → API Keys. Phone Number ID — импортированный номер. Звонки ИИ включаются клиентами в настройках процесса вакансии; без этого ключа шаг звонка тихо пропускается.',
      elevenlabs: 'elevenlabs.io → Profile → API Keys (xi-…).', zadarma: 'my.zadarma.com → Настройки → API.' }[p.id] || '';
    openModal(`<h2 style="margin:0 0 6px">Настройка ${esc(p.name)}</h2>
      <p class="muted" style="margin:0 0 14px;font-size:12.5px;line-height:1.5">${esc(help)} Пустое поле — не менять текущее значение.</p>
      <div class="form-grid">${fields}
      ${p.id === 'stripe' ? `<div class="full"><label class="lbl">URL вебхука (событие checkout.session.completed)</label>
        <div class="row" style="gap:6px"><input class="field mono" readonly value="${esc(p.webhookUrl)}" style="flex:1">
        <button class="btn ghost sm ic-btn" id="wh-copy">${ICON_COPY}</button></div></div>` : ''}</div>
      <div class="row" style="gap:8px;margin-top:16px"><button class="btn" id="if-save">Сохранить</button>
        <button class="btn ghost" onclick="closeModal()">Отмена</button></div>`);
    $$('[data-eye]').forEach(e => e.onclick = () => { const inp = $('#' + e.dataset.eye); inp.type = inp.type === 'password' ? 'text' : 'password'; });
    const wc = $('#wh-copy'); if (wc) wc.onclick = () => { navigator.clipboard.writeText(p.webhookUrl); toast('Скопировано'); };
    $('#if-save').onclick = async () => {
      const values = {};
      p.fields.forEach(f => { const v = $('#if-' + f.key).value.trim(); if (v) values[f.key] = v; });
      try { await api('/api/admin/integrations/' + p.id, { method: 'PUT', body: JSON.stringify({ values }) });
        toast('Сохранено ✓'); closeModal(); renderAdmIntegrations(); } catch (e) { toast(e.message); }
    };
  });
}

// ---------- HTML-редактор писем (визуальный режим + исходник) ----------
function rteHtml(id, value) {
  const isHtml = /<[a-z][\s\S]*>/i.test(value);
  const html = isHtml ? value : esc(value).replace(/\n/g, '<br>');
  return `<div class="rte-box" id="${id}-box">
    <div class="rte-bar">
      <button type="button" data-cmd="bold" title="Жирный"><b>Ж</b></button>
      <button type="button" data-cmd="italic" title="Курсив"><i>К</i></button>
      <button type="button" data-cmd="underline" title="Подчёркнутый"><u>Ч</u></button>
      <button type="button" data-cmd="insertUnorderedList" title="Маркированный список">•&nbsp;список</button>
      <button type="button" data-cmd="insertOrderedList" title="Нумерованный список">1.&nbsp;список</button>
      <button type="button" data-cmd="createLink" title="Вставить ссылку">Ссылка</button>
      <span style="flex:1"></span>
      <button type="button" data-rte-src="${id}" title="Редактировать HTML-исходник">HTML</button>
    </div>
    <div class="rte-area" id="${id}" contenteditable="true">${html}</div>
    <textarea class="field rte-code" id="${id}-src" style="display:none" rows="12"></textarea></div>`;
}
function wireRte(id) {
  const box = $('#' + id + '-box'), area = $('#' + id), src = $('#' + id + '-src');
  $$('.rte-bar button', box).forEach(b => b.onclick = () => {
    if (b.dataset.rteSrc !== undefined) {
      const toSrc = src.style.display === 'none';
      if (toSrc) src.value = area.innerHTML; else area.innerHTML = src.value;
      src.style.display = toSrc ? '' : 'none'; area.style.display = toSrc ? 'none' : '';
      b.classList.toggle('on', toSrc);
      return;
    }
    area.focus();
    if (b.dataset.cmd === 'createLink') { const u = prompt('Адрес ссылки (https://…):'); if (u) document.execCommand('createLink', false, u); }
    else document.execCommand(b.dataset.cmd, false, null);
  });
}
function rteValue(id) {
  const area = $('#' + id), src = $('#' + id + '-src');
  return src.style.display !== 'none' ? src.value : area.innerHTML;
}
function rteInsert(id, text) {
  const area = $('#' + id), src = $('#' + id + '-src');
  if (src.style.display !== 'none') { const pos = src.selectionStart || src.value.length; src.value = src.value.slice(0, pos) + text + src.value.slice(pos); src.focus(); }
  else { area.focus(); document.execCommand('insertText', false, text); }
}
// ---------- Контент и шаблоны ----------
let contentTab = 'templates', tplKind = 'email', tplLang = 'ru';
let mailCat = 'send', mailItem = 'result', mailLang = 'ru';
async function renderAdmContent() {
  $('#main').innerHTML = `<div class="eyebrow reveal">Админ-панель</div><h1 class="page-h reveal d1" style="margin-top:10px">Контент и шаблоны</h1>
    <div class="settabs reveal d1"><button class="seg-tab ${contentTab === 'templates' ? 'on' : ''}" data-cnt="templates">Приглашения</button>
      <button class="seg-tab ${contentTab === 'mail' ? 'on' : ''}" data-cnt="mail">Письма по событиям</button></div>
    <div id="cnt-body" class="reveal d2"><p class="muted">Загрузка…</p></div>`;
  $$('[data-cnt]').forEach(b => b.onclick = () => { contentTab = b.dataset.cnt; renderAdmContent(); });
  const body = $('#cnt-body');
  if (contentTab === 'templates') {
    const d = await api('/api/admin/templates');
    const langs = d.langs;
    const tpl = tplKind === 'email' ? d.emailTemplates : d.smsTemplates;
    const cur = tpl[tplLang] || (tplKind === 'email' ? { subject: '', body: '' } : '');
    const chips = d.placeholders.map(p => `<button class="chip" data-chip="${esc(p)}">${esc(p)}</button>`).join(' ');
    body.innerHTML = `<div class="card">
      <div class="ai-note tone-mid" style="margin-bottom:14px"><div class="ai-h">Это шаблоны по умолчанию</div>
        <p style="margin:4px 0 0">Применяются к новым клиентам и рассылкам без переопределения. Клиенты, изменившие шаблоны у себя, продолжат использовать свои.</p></div>
      <div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div class="settabs" style="margin:0"><button class="seg-tab ${tplKind === 'email' ? 'on' : ''}" data-tk="email">E-mail</button>
          <button class="seg-tab ${tplKind === 'sms' ? 'on' : ''}" data-tk="sms">SMS</button></div>
        <div class="settabs" style="margin:0">${langs.map(l => `<button class="seg-tab ${tplLang === l.code ? 'on' : ''}" data-tl="${l.code}">${l.code.toUpperCase()}</button>`).join('')}</div></div>
      ${tplKind === 'email' ? `<label class="lbl">Тема письма</label><input class="field" id="tpl-subject" value="${esc(cur.subject || '')}">
        <label class="lbl" style="margin-top:10px">Текст письма</label>${rteHtml('tpl-rte', cur.body || '')}`
      : `<label class="lbl">Текст SMS (до 360 символов)</label><textarea class="field" id="tpl-body" rows="4" maxlength="360">${esc(cur)}</textarea>`}
      <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><span class="muted" style="font-size:12px;align-self:center">Переменные:</span>${chips}</div>
      <div class="row" style="gap:8px;margin-top:16px">
        <button class="btn" id="tpl-save">Сохранить</button>
        <button class="btn ghost" id="tpl-preview">Превью</button>
        <button class="btn ghost danger" id="tpl-reset">Вернуть заводские</button></div></div>`;
    if (tplKind === 'email') wireRte('tpl-rte');
    const tplBody = () => tplKind === 'email' ? rteValue('tpl-rte') : $('#tpl-body').value;
    $$('[data-tk]').forEach(b => b.onclick = () => { tplKind = b.dataset.tk; renderAdmContent(); });
    $$('[data-tl]').forEach(b => b.onclick = () => { tplLang = b.dataset.tl; renderAdmContent(); });
    $$('[data-chip]').forEach(ch => ch.onclick = () => {
      if (tplKind === 'email') return rteInsert('tpl-rte', ch.dataset.chip);
      const ta = $('#tpl-body'); const pos = ta.selectionStart || ta.value.length;
      ta.value = ta.value.slice(0, pos) + ch.dataset.chip + ta.value.slice(pos); ta.focus();
    });
    $('#tpl-save').onclick = async () => {
      const bodyPatch = {};
      if (tplKind === 'email') bodyPatch.emailTemplates = { [tplLang]: { subject: $('#tpl-subject').value, body: tplBody() } };
      else bodyPatch.smsTemplates = { [tplLang]: tplBody() };
      await api('/api/admin/templates', { method: 'PUT', body: JSON.stringify(bodyPatch) });
      toast('Сохранено ✓');
    };
    $('#tpl-preview').onclick = async () => {
      const r = await api('/api/admin/templates/preview', { method: 'POST', body: JSON.stringify({
        kind: tplKind, lang: tplLang, subject: tplKind === 'email' ? $('#tpl-subject').value : '', body: tplBody() }) });
      openModal(`<h2 style="margin:0 0 12px">Превью (${tplLang.toUpperCase()})</h2>
        ${r.subject ? `<p><b>Тема:</b> ${esc(r.subject)}</p>` : ''}
        <div class="card" style="background:var(--surface-2)">${r.body}</div>`);
    };
    $('#tpl-reset').onclick = async () => {
      if (!confirm('Вернуть заводские шаблоны (' + (tplKind === 'email' ? 'E-mail' : 'SMS') + ')?')) return;
      await api('/api/admin/templates/reset', { method: 'POST', body: JSON.stringify({ scope: tplKind }) });
      toast('Возвращены заводские'); renderAdmContent();
    };
  } else if (contentTab === 'mail') {
    // Дефолтные письма по событиям (send: приглашение на тест; status: смена статуса кандидата)
    const d = await api('/api/admin/templates');
    const items = mailCat === 'send' ? d.mailSendItems : d.mailStatusItems;
    if (!items.includes(mailItem)) mailItem = items[0];
    const STATUS_LABEL = { rejected: 'Отказано', interview: 'Собеседование', reserve: 'Резерв', accepted: 'Принят' };
    const itemLabel = k => mailCat === 'send' ? ((d.testNames.ru || {})[k] || k) : (STATUS_LABEL[k] || k);
    const cur = ((d.mailTemplates[mailCat] || {})[mailItem] || {})[mailLang] || { subject: '', body: '' };
    const chips = d.mailPlaceholders.map(p => `<button class="chip" data-chip="${esc(p)}">${esc(p)}</button>`).join(' ');
    body.innerHTML = `<div class="card">
      <div class="ai-note tone-mid" style="margin-bottom:14px"><div class="ai-h">Это шаблоны по умолчанию</div>
        <p style="margin:4px 0 0">Используются для всех новых клиентов. Клиенты, изменившие шаблоны у себя в настройках, продолжат использовать свои.</p></div>
      <div class="row" style="gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <div class="settabs" style="margin:0">
          <button class="seg-tab ${mailCat === 'send' ? 'on' : ''}" data-mc="send">При отправке тестов</button>
          <button class="seg-tab ${mailCat === 'status' ? 'on' : ''}" data-mc="status">При изменении статуса</button></div>
        <select class="field" id="mail-item" style="max-width:240px">${items.map(k => `<option value="${k}" ${mailItem === k ? 'selected' : ''}>${esc(itemLabel(k))}</option>`).join('')}</select>
        <div class="settabs" style="margin:0">${d.mailLangs.map(l => `<button class="seg-tab ${mailLang === l ? 'on' : ''}" data-ml="${l}">${l.toUpperCase()}</button>`).join('')}</div></div>
      <label class="lbl">Тема письма</label><input class="field" id="mail-subject" value="${esc(cur.subject)}">
      <label class="lbl" style="margin-top:10px">Текст письма</label>${rteHtml('mail-rte', cur.body)}
      <div class="row" style="gap:6px;margin-top:10px;flex-wrap:wrap"><span class="muted" style="font-size:12px;align-self:center">Переменные:</span>${chips}</div>
      <div class="row" style="gap:8px;margin-top:16px">
        <button class="btn" id="mail-save">Сохранить</button>
        <button class="btn ghost" id="mail-preview">Превью</button>
        <button class="btn ghost danger" id="mail-reset">Вернуть заводские</button></div></div>`;
    wireRte('mail-rte');
    $$('[data-mc]').forEach(b => b.onclick = () => { mailCat = b.dataset.mc; renderAdmContent(); });
    $('#mail-item').onchange = e => { mailItem = e.target.value; renderAdmContent(); };
    $$('[data-ml]').forEach(b => b.onclick = () => { mailLang = b.dataset.ml; renderAdmContent(); });
    $$('[data-chip]').forEach(ch => ch.onclick = () => rteInsert('mail-rte', ch.dataset.chip));
    $('#mail-save').onclick = async () => {
      await api('/api/admin/templates', { method: 'PUT', body: JSON.stringify({
        mailTemplates: { [mailCat]: { [mailItem]: { [mailLang]: { subject: $('#mail-subject').value, body: rteValue('mail-rte') } } } } }) });
      toast('Сохранено ✓');
    };
    $('#mail-preview').onclick = async () => {
      const r = await api('/api/admin/templates/preview', { method: 'POST', body: JSON.stringify({
        kind: 'mail', lang: mailLang, subject: $('#mail-subject').value, body: rteValue('mail-rte') }) });
      openModal(`<h2 style="margin:0 0 12px">Превью — ${esc(itemLabel(mailItem))} (${mailLang.toUpperCase()})</h2>
        <p><b>Тема:</b> ${esc(r.subject)}</p><div class="card" style="background:var(--surface-2)">${r.body}</div>`, true);
    };
    $('#mail-reset').onclick = async () => {
      if (!confirm('Вернуть ВСЕ письма по событиям к заводским?')) return;
      await api('/api/admin/templates/reset', { method: 'POST', body: JSON.stringify({ scope: 'mail' }) });
      toast('Возвращены заводские'); renderAdmContent();
    };
  }
}

// ---------- Журнал действий ----------
let logQ = { adminId: '', action: '', page: 1 };
async function renderAdmLog() {
  const d = await api(`/api/admin/log?adminId=${logQ.adminId}&action=${logQ.action}&page=${logQ.page}`);
  const rows = d.items.map(l => `<tr>
    <td class="muted mono" style="white-space:nowrap">${fmtDate(l.createdAt)}</td>
    <td>${esc(l.adminEmail)}</td><td>${esc(l.actionLabel)}</td>
    <td>${l.targetType === 'user' && l.targetId ? `<a href="#" data-loguser="${esc(l.targetId)}">${esc(l.targetLabel)}</a>` : esc(l.targetLabel || '—')}</td>
    <td>${Object.keys(l.details || {}).length ? `<button class="btn ghost xs" data-logdet="${esc(l.id)}">…</button>` : ''}</td></tr>`).join('');
  $('#main').innerHTML = `<div class="eyebrow reveal">Админ-панель</div><h1 class="page-h reveal d1" style="margin-top:10px">Журнал действий</h1>
    <div class="card reveal d1">
      <div class="row" style="gap:10px;margin-bottom:14px;flex-wrap:wrap">
        <select class="field" id="lg-admin" style="max-width:240px"><option value="">Все админы</option>
          ${d.admins.map(a => `<option value="${a.id}" ${logQ.adminId === a.id ? 'selected' : ''}>${esc(a.email)}</option>`).join('')}</select>
        <select class="field" id="lg-action" style="max-width:280px"><option value="">Все действия</option>
          ${Object.entries(d.actions).map(([k, v]) => `<option value="${k}" ${logQ.action === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
      <div class="table-wrap" style="box-shadow:none"><table><thead><tr><th>Дата</th><th>Админ</th><th>Действие</th><th>Цель</th><th>Детали</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" class="muted" style="text-align:center;padding:26px">Записей нет</td></tr>'}</tbody></table></div>
      ${pager(d.page, d.total, d.perPage, p => { logQ.page = p; renderAdmLog(); })}</div>`;
  $('#lg-admin').onchange = e => { logQ.adminId = e.target.value; logQ.page = 1; renderAdmLog(); };
  $('#lg-action').onchange = e => { logQ.action = e.target.value; logQ.page = 1; renderAdmLog(); };
  $$('[data-loguser]').forEach(a => a.onclick = e => { e.preventDefault(); openClient(a.dataset.loguser); });
  $$('[data-logdet]').forEach(b => b.onclick = () => {
    const l = d.items.find(x => x.id === b.dataset.logdet);
    openModal(`<h2 style="margin:0 0 12px">${esc(l.actionLabel)}</h2>
      <div class="adm-json">${esc(JSON.stringify(l.details, null, 2))}</div>`);
  });
}

// ---------- init ----------
(async function init() {
  try {
    const d = await api('/api/me');
    if (!d.user || d.user.role !== 'admin') { location.href = '/app'; return; }
    state.me = d.user;
    const nm = (d.user.name || d.user.email || 'A').trim();
    $('#side-name').textContent = nm;
    $('#side-ava').textContent = (nm[0] || 'A').toUpperCase();
    setView('dashboard');
  } catch (e) { /* 401 → редирект в api() */ }
})();
