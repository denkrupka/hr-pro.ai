// Центр уведомлений: типы по категориям + доставка по каналам (портал/email/telegram) согласно настройкам рекрутёра.
// По умолчанию: всё — в портал (push); важные — ещё на email и в Telegram.
import { wrapEmailEdge } from './notify-edge.js';

export const NOTIF_CATS = [
  { key: 'candidates', label: 'Кандидаты' },
  { key: 'tests', label: 'Тесты и анкеты' },
  { key: 'references', label: 'Референсы' },
  { key: 'calls', label: 'ИИ-звонки' },
  { key: 'workflow', label: 'Этапы и решения' },
];
// important=true → по умолчанию email+telegram включены.
export const NOTIF_TYPES = [
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

export function defaultNotifPrefs() {
  const p = {};
  for (const t of NOTIF_TYPES) p[t.key] = { push: true, email: !!t.important, telegram: !!t.important };
  return p;
}
// Актуальные настройки канала для типа (с учётом дефолтов для новых типов).
function prefsFor(user, typeKey) {
  const t = TYPE[typeKey] || {};
  const saved = ((user.settings || {}).notifPrefs || {})[typeKey];
  if (saved) return { push: saved.push !== false, email: !!saved.email, telegram: !!saved.telegram };
  return { push: true, email: !!t.important, telegram: !!t.important };
}

export function telegramConfigured(env, user) {
  return !!(env && env.TELEGRAM_BOT_TOKEN && user && user.settings && user.settings.telegram && user.settings.telegram.chatId);
}
async function sendTelegram(env, user, text, cardUrl) {
  try {
    const msg = { chat_id: user.settings.telegram.chatId, text, parse_mode: 'HTML', disable_web_page_preview: true };
    if (cardUrl) msg.reply_markup = { inline_keyboard: [[{ text: '👤 Открыть карточку кандидата', url: cardUrl }]] };
    await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg),
    });
  } catch (_) {}
}

// Создать уведомление рекрутёру и доставить по включённым каналам. Сохраняет пользователя. user — объект рекрутёра (владельца).
// pid — id кандидата: добавляет ссылку/кнопку «Открыть карточку» в портал и Telegram.
export async function pushNotif(env, S, user, typeKey, { title, body = '', link = '', pid = '' } = {}) {
  if (!user || !user.id) return;
  const t = TYPE[typeKey] || { cat: 'workflow' };
  const pr = prefsFor(user, typeKey);
  const now = new Date().toISOString();
  const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
  const cardUrl = pid ? `${base}/app?openc=${pid}` : (link || '');
  const n = { id: (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : (typeKey + '-' + now)).slice(0, 40), type: typeKey, cat: t.cat, title: String(title || t.label || ''), body: String(body || ''), link: cardUrl, pid: String(pid || ''), ts: now, read: false };
  if (pr.push !== false) {
    user.notifs = Array.isArray(user.notifs) ? user.notifs : [];
    user.notifs.unshift(n);
    if (user.notifs.length > 100) user.notifs = user.notifs.slice(0, 100);
  }
  // Email
  if (pr.email && env.RESEND_API_KEY && user.email) {
    try {
      const lang = ['ru', 'pl', 'en'].includes((user.settings || {}).uiLang) ? user.settings.uiLang : 'ru';
      const html = wrapEmailEdge({ lang, baseUrl: env.BASE_URL || 'https://hr-pro.ai', subject: n.title, eyebrow: 'HR PRO AI', headline: n.title, bodyHtml: (n.body ? String(n.body).replace(/</g, '&lt;').replace(/\n/g, '<br>') : '') + (n.link ? `<br><br><a href="${n.link}">Открыть в портале</a>` : '') });
      await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM || 'HR PRO AI <info@hr-pro.ai>', to: [user.email], subject: n.title, html }) });
    } catch (_) {}
  }
  // Telegram
  if (pr.telegram && telegramConfigured(env, user)) {
    await sendTelegram(env, user, `<b>${n.title}</b>${n.body ? '\n' + n.body : ''}`, n.link);
  }
  try { await S.upsert('users', { id: user.id, data: user }); } catch (_) {}
  return n;
}

// Каталог для UI настроек (категории → типы).
export function notifCatalog() {
  return NOTIF_CATS.map(c => ({ ...c, types: NOTIF_TYPES.filter(t => t.cat === c.key).map(t => ({ key: t.key, label: t.label, important: !!t.important })) }));
}
