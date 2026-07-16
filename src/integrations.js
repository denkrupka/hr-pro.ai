'use strict';
// Связка внешних сервисов: Resend (email), SMSAPI (SMS), Vapi.ai (ИИ-звонки),
// ElevenLabs (голос), Zadarma (виртуальный номер / телефония).
// Ключи хранятся в settings.integrations пользователя; пока ключ не задан —
// соответствующий канал просто неактивен (isConfigured=false), портал работает как раньше.
// Планируемые сценарии ИИ-звонков: приглашение пройти анкету/тесты, наведение справок
// у прошлых работодателей — вызываются через startCall({task, ...}).

const crypto = require('crypto');

// Описание провайдеров: какие поля нужны и где взять ключ (показывается в UI).
const PROVIDERS = {
  resend: {
    title: 'Resend', purpose_ru: 'Отправка e-mail кандидатам (приглашения на тесты, статусы).',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true, hint: 'resend.com → API Keys (re_…)' },
      { key: 'from', label: 'From (отправитель)', secret: false, hint: 'например, HR PRO AI <hr@ваш-домен.com> — домен должен быть верифицирован в Resend' },
    ],
  },
  smsapi: {
    title: 'SMSAPI', purpose_ru: 'SMS кандидатам (ссылки на тесты, напоминания).',
    fields: [
      { key: 'token', label: 'OAuth Token', secret: true, hint: 'smsapi.pl / smsapi.com → API Tokens' },
      { key: 'from', label: 'Имя отправителя', secret: false, hint: 'зарегистрированное поле «от кого» (например, Info)' },
      { key: 'endpoint', label: 'Endpoint', secret: false, hint: 'https://api.smsapi.pl (PL) или https://api.smsapi.com (COM); по умолчанию PL' },
    ],
  },
  vapi: {
    title: 'Vapi.ai', purpose_ru: 'ИИ-звонки: приглашение пройти анкету/тесты, наведение справок у прошлых работодателей.',
    fields: [
      { key: 'apiKey', label: 'Private API Key', secret: true, hint: 'dashboard.vapi.ai → Organization → API Keys' },
      { key: 'phoneNumberId', label: 'Phone Number ID', secret: false, hint: 'ID номера в Vapi (импортируйте SIP-номер Zadarma в Vapi → Phone Numbers)' },
      { key: 'assistantId', label: 'Assistant ID (опционально)', secret: false, hint: 'готовый ассистент; если пусто — создаётся временный с голосом ElevenLabs' },
    ],
  },
  elevenlabs: {
    title: 'ElevenLabs', purpose_ru: 'Голос для ИИ-звонков (озвучка Vapi через 11labs).',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true, hint: 'elevenlabs.io → Profile → API Keys (xi-…)' },
      { key: 'voiceId', label: 'Voice ID', secret: false, hint: 'ID голоса из Voice Library (например, для русского/польского)' },
    ],
  },
  zadarma: {
    title: 'Zadarma', purpose_ru: 'Виртуальный номер и SIP для исходящих звонков (подключается к Vapi как SIP-транк).',
    fields: [
      { key: 'apiKey', label: 'API Key', secret: true, hint: 'my.zadarma.com → Настройки → API' },
      { key: 'apiSecret', label: 'API Secret', secret: true, hint: 'там же, рядом с ключом' },
      { key: 'number', label: 'Виртуальный номер', secret: false, hint: 'номер в формате +48…, используется как Caller ID' },
    ],
  },
};

// Глобальная конфигурация (без UI в портале): файл integrations.config.json в корне проекта
// и/или переменные окружения. Пример файла:
// { "resend": { "apiKey": "re_...", "from": "HR <hr@domain.com>" },
//   "smsapi": { "token": "...", "from": "Info" },
//   "vapi": { "apiKey": "...", "phoneNumberId": "...", "assistantId": "" },
//   "elevenlabs": { "apiKey": "xi-...", "voiceId": "..." },
//   "zadarma": { "apiKey": "...", "apiSecret": "...", "number": "+48..." } }
// Env-переменные (перекрывают файл): RESEND_API_KEY, RESEND_FROM, SMSAPI_TOKEN, SMSAPI_FROM,
// VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, VAPI_ASSISTANT_ID, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID,
// ZADARMA_API_KEY, ZADARMA_API_SECRET, ZADARMA_NUMBER.
const fs = require('fs');
const path = require('path');
let GLOBAL = {};
try { GLOBAL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integrations.config.json'), 'utf8')); } catch (_) { GLOBAL = {}; }
const ENV_MAP = {
  resend: { apiKey: 'RESEND_API_KEY', from: 'RESEND_FROM' },
  smsapi: { token: 'SMSAPI_TOKEN', from: 'SMSAPI_FROM', endpoint: 'SMSAPI_ENDPOINT' },
  vapi: { apiKey: 'VAPI_API_KEY', phoneNumberId: 'VAPI_PHONE_NUMBER_ID', assistantId: 'VAPI_ASSISTANT_ID' },
  elevenlabs: { apiKey: 'ELEVENLABS_API_KEY', voiceId: 'ELEVENLABS_VOICE_ID' },
  zadarma: { apiKey: 'ZADARMA_API_KEY', apiSecret: 'ZADARMA_API_SECRET', number: 'ZADARMA_NUMBER' },
};
function cfgOf(settings, provider) {
  // приоритет слоёв: файл < env < глобальные настройки портала (админка) < настройки клиента
  const out = Object.assign({}, GLOBAL[provider] || {});
  Object.entries(ENV_MAP[provider] || {}).forEach(([k, env]) => { if (process.env[env]) out[k] = process.env[env]; });
  try {
    const gi = (require('./db').db().settings || {}).integrations || {};
    Object.entries(gi[provider] || {}).forEach(([k, v]) => { if (v !== '' && v != null) out[k] = v; });
  } catch (_) {}
  Object.entries(((settings && settings.integrations) || {})[provider] || {}).forEach(([k, v]) => { if (v !== '' && v != null) out[k] = v; });
  return out;
}
function isConfigured(settings, provider) {
  const c = cfgOf(settings, provider);
  const req = { resend: ['apiKey'], smsapi: ['token'], vapi: ['apiKey'], elevenlabs: ['apiKey'], zadarma: ['apiKey', 'apiSecret'] }[provider] || [];
  return req.every(k => c[k]);
}

async function http(url, opts) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let json = null; try { json = JSON.parse(text); } catch (_) {}
  if (!r.ok) {
    const msg = (json && (json.message || json.error || (json.errors && JSON.stringify(json.errors)))) || text.slice(0, 300) || ('HTTP ' + r.status);
    const e = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)); e.status = r.status; throw e;
  }
  return json != null ? json : text;
}

// ---------- Resend: e-mail ----------
// ---------- Дизайн-обёртка письма (единый шаблон HR PRO AI для всех писем) ----------
const EMAIL_I18N = {
  ru: { eyebrow: 'Уведомление', tagline: 'Технология, которая чувствует людей', help: 'Помощь', privacy: 'Конфиденциальность', terms: 'Условия', unsub: 'Отписаться',
    legal: 'Вы получили это письмо, потому что участвуете в подборе через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  pl: { eyebrow: 'Powiadomienie', tagline: 'Technologia, która czuje ludzi', help: 'Pomoc', privacy: 'Prywatność', terms: 'Regulamin', unsub: 'Wypisz się',
    legal: 'Otrzymujesz tę wiadomość, ponieważ bierzesz udział w rekrutacji przez platformę HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  en: { eyebrow: 'Notification', tagline: 'Technology that reads people', help: 'Help', privacy: 'Privacy', terms: 'Terms', unsub: 'Unsubscribe',
    legal: 'You received this email because you are part of a hiring process on the HR PRO AI platform. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warsaw, Poland.' },
};
const LOGO_SVG = (stroke, w) => `<svg viewBox="0 0 64 64" fill="none" style="width:${w}px;height:${w}px;vertical-align:middle"><path d="M32 4 56 18 56 46 32 60 8 46 8 18Z" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round" opacity=".92"/><line x1="33" y1="31" x2="22" y2="25" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="41" y2="21" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="46" y2="35" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="29" y2="45" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><circle cx="22" cy="25" r="3.2" stroke="${stroke}" stroke-width="1.8"/><circle cx="41" cy="21" r="3.4" stroke="${stroke}" stroke-width="1.8"/><circle cx="46" cy="35" r="3" stroke="${stroke}" stroke-width="1.8"/><circle cx="29" cy="45" r="2.8" stroke="${stroke}" stroke-width="1.8"/><circle cx="33" cy="31" r="4.2" fill="#FF7A5C"/></svg>`;
function wrapEmailHtml(opts) {
  const o = opts || {};
  const L = EMAIL_I18N[o.lang] || EMAIL_I18N.ru;
  const base = (o.baseUrl || '').replace(/\/+$/, '');
  const headline = o.headline || o.subject || '';
  const eyebrow = o.eyebrow || L.eyebrow;
  const helpUrl = 'mailto:help@hr-pro.ai';
  const privacyUrl = base + '/privacy?lang=' + (o.lang || 'ru');
  const termsUrl = base + '/terms?lang=' + (o.lang || 'ru');
  const unsubUrl = o.unsubUrl || (base + '/unsubscribe');
  const neural = `<svg viewBox="0 0 320 120" preserveAspectRatio="none" style="position:absolute;right:0;top:0;height:100%;width:60%;opacity:.5"><g stroke="rgba(150,140,255,.5)" stroke-width="1" fill="none"><line x1="60" y1="30" x2="150" y2="60"/><line x1="150" y1="60" x2="240" y2="28"/><line x1="150" y1="60" x2="210" y2="100"/><line x1="150" y1="60" x2="90" y2="98"/><line x1="240" y1="28" x2="300" y2="66"/></g><g fill="rgba(180,170,255,.75)"><circle cx="60" cy="30" r="3"/><circle cx="240" cy="28" r="3.4"/><circle cx="210" cy="100" r="2.8"/><circle cx="90" cy="98" r="2.6"/><circle cx="300" cy="66" r="3"/></g><circle cx="150" cy="60" r="5" fill="#FF7A5C"/></svg>`;
  const cta = o.ctaLabel && o.ctaUrl ? `<div style="text-align:center;margin:6px 0 26px"><a href="${o.ctaUrl}" style="display:inline-block;font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:15px;color:#fff;padding:15px 40px;border-radius:13px;background:linear-gradient(135deg,#8b6cff,#6f97ff);text-decoration:none">${o.ctaLabel}</a>${o.ctaNote ? `<div style="font-size:12px;color:#6b7492;margin-top:12px">${o.ctaNote}</div>` : ''}</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;background:#05060d;font-family:Inter,Arial,system-ui,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#05060d;padding:28px 12px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:660px;width:100%;border-collapse:collapse;background:#0d1024;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden">
  <tr><td style="position:relative;overflow:hidden;padding:34px 40px 30px;background:radial-gradient(ellipse 80% 130% at 78% 0%,rgba(139,108,255,.28),transparent 62%),linear-gradient(160deg,#141634,#0a0b1c)">
    ${neural}
    <div style="position:relative;display:inline-block">${LOGO_SVG('#fff', 30)} <span style="font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:16px;color:#fff;letter-spacing:-.01em;vertical-align:middle">HR&nbsp;PRO&nbsp;AI</span></div>
    <div style="position:relative;margin-top:22px">
      <span style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b7a8ff">${eyebrow}</span>
      <div style="font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:24px;line-height:1.25;letter-spacing:-.02em;color:#fff;margin:10px 0 0;max-width:440px">${headline}</div>
    </div>
  </td></tr>
  <tr><td style="padding:30px 40px 6px;font-size:14.5px;line-height:1.62;color:#c3cbe4">
    ${o.bodyHtml || ''}
    ${cta}
  </td></tr>
  <tr><td style="padding:22px 40px 30px;background:rgba(0,0,0,.22);border-top:1px solid rgba(255,255,255,.06)">
    <div style="margin-bottom:12px">${LOGO_SVG('#8b93ad', 20)} <span style="font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:13px;color:#c3cbe4;vertical-align:middle">HR PRO AI</span> <span style="font-size:12px;color:#6b7492">· ${L.tagline}</span></div>
    <p style="font-size:11.5px;line-height:1.6;color:#6b7492;margin:0 0 10px;max-width:460px">${L.legal}</p>
    <div style="font-size:11.5px">
      <a href="${helpUrl}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.help}</a>
      <a href="${privacyUrl}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.privacy}</a>
      <a href="${termsUrl}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.terms}</a>
      <a href="${unsubUrl}" style="color:#8b93ad;text-decoration:none">${L.unsub}</a>
    </div>
  </td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmail(settings, { to, subject, html, text, lang, baseUrl, unsubUrl, eyebrow, headline, ctaLabel, ctaUrl, ctaNote, raw }) {
  const c = cfgOf(settings, 'resend');
  if (!c.apiKey) return { skipped: true, reason: 'Resend не настроен' };
  const body = { from: c.from || 'onboarding@resend.dev', to: Array.isArray(to) ? to : [to], subject: subject || '' };
  // Оборачиваем содержимое в единый дизайн письма HR PRO AI (если не raw)
  if (!raw) {
    const bodyHtml = html || (text ? String(text).replace(/\n/g, '<br>') : '');
    body.html = wrapEmailHtml({ lang, baseUrl, unsubUrl, subject, eyebrow, headline, ctaLabel, ctaUrl, ctaNote, bodyHtml });
  } else if (html) body.html = html; else body.text = text || '';
  const d = await http('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: 'Bearer ' + c.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: true, id: d && d.id };
}

// ---------- SMSAPI: SMS ----------
async function sendSms(settings, { to, message }) {
  const c = cfgOf(settings, 'smsapi');
  if (!c.token) return { skipped: true, reason: 'SMSAPI не настроен' };
  const base = (c.endpoint || 'https://api.smsapi.pl').replace(/\/+$/, '');
  const params = new URLSearchParams({ to: String(to).replace(/[^\d+]/g, ''), message: String(message || '').slice(0, 800), format: 'json', encoding: 'utf-8' });
  if (c.from) params.set('from', c.from);
  const d = await http(base + '/sms.do', {
    method: 'POST', headers: { Authorization: 'Bearer ' + c.token, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (d && d.error) throw new Error('SMSAPI: ' + (d.message || d.error));
  return { ok: true, count: d && d.count };
}

// ---------- ElevenLabs: голос ----------
async function listVoices(settings) {
  const c = cfgOf(settings, 'elevenlabs');
  if (!c.apiKey) return { skipped: true, reason: 'ElevenLabs не настроен' };
  const d = await http('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': c.apiKey } });
  return { ok: true, voices: (d.voices || []).map(v => ({ id: v.voice_id, name: v.name })) };
}

// ---------- Vapi.ai: ИИ-звонок ----------
// task — текст задания ассистенту (пригласить на анкету/тест, навести справки и т.п.)
// Опц.: structuredDataSchema + summaryPrompt — для сбора структурированного результата (референсы).
async function startCall(settings, { to, task, firstMessage, language, structuredDataSchema, summaryPrompt }) {
  const c = cfgOf(settings, 'vapi');
  if (!c.apiKey) return { skipped: true, reason: 'Vapi не настроен' };
  if (!c.phoneNumberId) throw new Error('Vapi: не указан Phone Number ID (импортируйте номер Zadarma в Vapi)');
  const el = cfgOf(settings, 'elevenlabs');
  const body = { phoneNumberId: c.phoneNumberId, customer: { number: String(to) } };
  // План разбора звонка: краткое резюме + извлечение структурированных ответов (референсы).
  const analysisPlan = {};
  if (summaryPrompt) analysisPlan.summaryPlan = { messages: [{ role: 'system', content: summaryPrompt }] };
  if (structuredDataSchema) analysisPlan.structuredDataPlan = {
    enabled: true,
    schema: structuredDataSchema,
    messages: [{ role: 'system', content: 'Извлеки из расшифровки звонка ответы на вопросы референса строго по JSON-схеме. Если на вопрос не ответили — оставь поле пустым.' }],
  };
  if (c.assistantId) {
    body.assistantId = c.assistantId;
    if (task) body.assistantOverrides = { variableValues: { task } };
  } else {
    // Временный ассистент: GPT-4o mini + голос ElevenLabs (если настроен)
    body.assistant = {
      model: { provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'system', content: 'Ты — вежливый HR-ассистент компании. Говори кратко и по делу. Задание: ' + (task || 'тестовый звонок — поздоровайся и попрощайся.') }] },
      firstMessage: firstMessage || 'Здравствуйте! Это ассистент отдела подбора персонала.',
      transcriber: { provider: 'deepgram', model: 'nova-2', language: language || 'ru' },
    };
    if (el.apiKey && el.voiceId) body.assistant.voice = { provider: '11labs', voiceId: el.voiceId };
    if (Object.keys(analysisPlan).length) body.assistant.analysisPlan = analysisPlan;
  }
  const d = await http('https://api.vapi.ai/call', {
    method: 'POST', headers: { Authorization: 'Bearer ' + c.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: true, callId: d && d.id, status: d && d.status };
}
// Забрать состояние/результат звонка по id (для сбора референсов после завершения).
async function getCall(settings, callId) {
  const c = cfgOf(settings, 'vapi');
  if (!c.apiKey) return { skipped: true, reason: 'Vapi не настроен' };
  const d = await http('https://api.vapi.ai/call/' + encodeURIComponent(callId), { headers: { Authorization: 'Bearer ' + c.apiKey } });
  const a = (d && d.analysis) || {};
  return {
    ok: true, id: d && d.id, status: d && d.status, endedReason: d && d.endedReason,
    transcript: d && d.transcript, summary: a.summary || null, structuredData: a.structuredData || null,
  };
}
async function vapiPing(settings) {
  const c = cfgOf(settings, 'vapi');
  if (!c.apiKey) return { skipped: true, reason: 'Vapi не настроен' };
  const d = await http('https://api.vapi.ai/assistant?limit=1', { headers: { Authorization: 'Bearer ' + c.apiKey } });
  return { ok: true, assistants: Array.isArray(d) ? d.length : 0 };
}

// ---------- Zadarma: подпись запросов и проверка ----------
function zadarmaAuth(method, params, key, secret) {
  const qs = new URLSearchParams(Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]))).toString();
  const md5 = crypto.createHash('md5').update(qs).digest('hex');
  const sign = crypto.createHmac('sha1', secret).update(method + qs + md5).digest('hex');
  return { qs, header: key + ':' + Buffer.from(sign).toString('base64') };
}
async function zadarmaRequest(settings, method, params) {
  const c = cfgOf(settings, 'zadarma');
  if (!c.apiKey || !c.apiSecret) return { skipped: true, reason: 'Zadarma не настроена' };
  const { qs, header } = zadarmaAuth(method, params || {}, c.apiKey, c.apiSecret);
  const d = await http('https://api.zadarma.com' + method + (qs ? '?' + qs : ''), { headers: { Authorization: header } });
  if (d && d.status === 'error') throw new Error('Zadarma: ' + (d.message || 'ошибка'));
  return d;
}
async function zadarmaBalance(settings) {
  const d = await zadarmaRequest(settings, '/v1/info/balance/', {});
  if (d.skipped) return d;
  return { ok: true, balance: d.balance, currency: d.currency };
}

module.exports = { PROVIDERS, cfgOf, isConfigured, sendEmail, wrapEmailHtml, sendSms, listVoices, startCall, getCall, vapiPing, zadarmaBalance, zadarmaRequest };
