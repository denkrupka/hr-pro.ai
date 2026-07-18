'use strict';
// Центр уведомлений (Node-стек, паритет с edge/notifications-edge.js). Доставка: портал(push) + email.
// Telegram работает на проде (edge) через вебхук; локально шлётся, только если задан токен бота.
const integ = require('./integrations');

const NOTIF_CATS = [
  { key: 'candidates', label: 'Кандидаты' },
  { key: 'tests', label: 'Тесты и анкеты' },
  { key: 'references', label: 'Референсы' },
  { key: 'calls', label: 'ИИ-звонки' },
  { key: 'workflow', label: 'Этапы и решения' },
];
const NOTIF_TYPES = [
  { key: 'cand_new', cat: 'candidates', label: 'Новый кандидат (отклик на вакансию)' },
  { key: 'test_done', cat: 'tests', label: 'Кандидат прошёл тест' },
  { key: 'test_failed', cat: 'tests', label: 'Кандидат не прошёл тест' },
  { key: 'ref_done', cat: 'references', label: 'Получен референс' },
  { key: 'call_recruiter', cat: 'calls', label: 'Кандидат просит связаться с рекрутёром', important: true },
  { key: 'call_done', cat: 'calls', label: 'ИИ-звонок завершён (собраны данные)' },
  { key: 'call_noanswer', cat: 'calls', label: 'ИИ не дозвонился до кандидата' },
  { key: 'stage_change', cat: 'workflow', label: 'Смена этапа кандидата' },
  { key: 'decision', cat: 'workflow', label: 'Решение по кандидату (принят/отклонён)', important: true },
];
const TYPE = Object.fromEntries(NOTIF_TYPES.map(t => [t.key, t]));

function defaultNotifPrefs() {
  const p = {};
  for (const t of NOTIF_TYPES) p[t.key] = { push: true, email: !!t.important, telegram: !!t.important };
  return p;
}
function prefsFor(user, k) {
  const t = TYPE[k] || {};
  const s = ((user.settings || {}).notifPrefs || {})[k];
  if (s) return { push: s.push !== false, email: !!s.email, telegram: !!s.telegram };
  return { push: true, email: !!t.important, telegram: !!t.important };
}
function notifCatalog() {
  return NOTIF_CATS.map(c => ({ ...c, types: NOTIF_TYPES.filter(t => t.cat === c.key).map(t => ({ key: t.key, label: t.label, important: !!t.important })) }));
}

// user — объект рекрутёра (владельца). save — функция сохранения БД. mutates user.notifs, шлёт email/telegram по настройкам.
async function pushNotif(user, typeKey, { title, body = '', link = '' } = {}, save) {
  if (!user || !user.id) return;
  const t = TYPE[typeKey] || { cat: 'workflow' };
  const pr = prefsFor(user, typeKey);
  const n = { id: typeKey + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), type: typeKey, cat: t.cat, title: String(title || t.label || ''), body: String(body || ''), link: String(link || ''), ts: new Date().toISOString(), read: false };
  if (pr.push !== false) {
    user.notifs = Array.isArray(user.notifs) ? user.notifs : [];
    user.notifs.unshift(n);
    if (user.notifs.length > 100) user.notifs = user.notifs.slice(0, 100);
  }
  if (pr.email && user.email) {
    try { await integ.sendEmail(user.settings, { to: user.email, subject: n.title, lang: (user.settings && user.settings.uiLang) || 'ru', headline: n.title, eyebrow: 'HR PRO AI', text: n.body + (n.link ? '\n\n' + n.link : '') }); } catch (_) {}
  }
  const tg = (user.settings && user.settings.telegram) || {};
  const botToken = (integ.cfgOf ? (integ.cfgOf(user.settings, 'telegram') || {}).token : '') || process.env.TELEGRAM_BOT_TOKEN || '';
  if (pr.telegram && botToken && tg.chatId) {
    try { await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: tg.chatId, text: '<b>' + n.title + '</b>' + (n.body ? '\n' + n.body : ''), parse_mode: 'HTML' }) }); } catch (_) {}
  }
  if (typeof save === 'function') await save();
  return n;
}

module.exports = { NOTIF_CATS, NOTIF_TYPES, defaultNotifPrefs, notifCatalog, pushNotif };
