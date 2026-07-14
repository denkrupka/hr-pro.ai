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
async function sendEmail(settings, { to, subject, html, text }) {
  const c = cfgOf(settings, 'resend');
  if (!c.apiKey) return { skipped: true, reason: 'Resend не настроен' };
  const body = { from: c.from || 'onboarding@resend.dev', to: Array.isArray(to) ? to : [to], subject: subject || '' };
  if (html) body.html = html; else body.text = text || '';
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
async function startCall(settings, { to, task, firstMessage, language }) {
  const c = cfgOf(settings, 'vapi');
  if (!c.apiKey) return { skipped: true, reason: 'Vapi не настроен' };
  if (!c.phoneNumberId) throw new Error('Vapi: не указан Phone Number ID (импортируйте номер Zadarma в Vapi)');
  const el = cfgOf(settings, 'elevenlabs');
  const body = { phoneNumberId: c.phoneNumberId, customer: { number: String(to) } };
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
  }
  const d = await http('https://api.vapi.ai/call', {
    method: 'POST', headers: { Authorization: 'Bearer ' + c.apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: true, callId: d && d.id, status: d && d.status };
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

module.exports = { PROVIDERS, cfgOf, isConfigured, sendEmail, sendSms, listVoices, startCall, vapiPing, zadarmaBalance, zadarmaRequest };
