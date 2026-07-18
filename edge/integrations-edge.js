// Vapi-звонки для edge/Workers. Ключи — из env (VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, ELEVENLABS_API_KEY).
const VOICE_BY_LANG = { ru: 'ymDCYd8puC7gYjxIamPt', pl: 'd4Z5Fvjohw3zxGpV8XUV', en: 'EST9Ui6982FZPSi7gCHi' };

// Универсальное правило: попал на автоответчик/голосовую почту → сразу завершить звонок, ничего не наговаривая.
const VOICEMAIL_RULE = 'КРИТИЧЕСКИ ВАЖНО ПРО АВТООТВЕТЧИК: если в начале звучит записанное приветствие, длинная непрерывная реплика без пауз для тебя, гудок/сигнал «бип», просьба оставить сообщение после сигнала, музыка ожидания, автоматическое меню (IVR) или тишина вместо живого человека — это НЕ живой собеседник, а голосовая почта/автоответчик. ВАЖНО: приветствие автоответчика может быть НА ЛЮБОМ ЯЗЫКЕ (например, польском или английском), даже если ты ведёшь звонок по-русски — номер может быть в другой стране. Распознавай автоответчик по СМЫСЛУ на любом языке (напр. польское «poczta głosowa / zostaw wiadomość / nagraj po sygnale», английское «leave a message after the beep»). В этом случае НЕМЕДЛЕННО заверши звонок (вызови функцию завершения звонка), НЕ говори ничего и НЕ оставляй сообщений. Не пытайся вести диалог с записью. ';

// Признаки того, что попали на голосовую почту/автоответчик (ru/pl/en) — по транскрипту.
const VM_RX = /(оставьте|оставить|запишите|запиш(и|ите)).{0,20}сообщени|после\s+(звукового\s+)?сигнал|автоответчик|голосов\w*\s+почт|абонент\s+(недоступен|временно)|не\s+может\s+прин|zostaw\s+wiadomo|nagra\w+\s+wiadomo|po\s+sygnale|automatyczn\w+\s+sekretar|poczt\w*\s+głosow|niedostępn|leave\s+a\s+message|after\s+the\s+(tone|beep)|voice\s?mail|not\s+available|record\s+your\s+message|please\s+leave/i;
export function looksLikeVoicemail(transcript) { return VM_RX.test(String(transcript || '')); }

export function vapiConfigured(env) { return !!(env && env.VAPI_API_KEY && env.VAPI_PHONE_NUMBER_ID); }

export async function startCall(env, { to, task, firstMessage, language, structuredDataSchema, summaryPrompt, maxDurationMin, signal }) {
  if (!env.VAPI_API_KEY) return { skipped: true, reason: 'Vapi не настроен' };
  if (!env.VAPI_PHONE_NUMBER_ID) return { skipped: true, reason: 'Vapi: не указан Phone Number ID' };
  const body = { phoneNumberId: env.VAPI_PHONE_NUMBER_ID, customer: { number: String(to) } };
  const analysisPlan = {};
  if (summaryPrompt) analysisPlan.summaryPlan = { enabled: true, messages: [
    { role: 'system', content: summaryPrompt }, { role: 'user', content: 'Транскрипт разговора:\n\n{{transcript}}' }] };
  if (structuredDataSchema) analysisPlan.structuredDataPlan = { enabled: true, schema: structuredDataSchema, messages: [
    { role: 'system', content: 'Извлеки ответы из расшифровки звонка строго по JSON-схеме. Если на пункт не ответили — оставь поле пустым. Верни только данные по схеме.' },
    { role: 'user', content: 'Транскрипт разговора:\n\n{{transcript}}' }] };
  const artifactPlan = { recordingEnabled: true, recordingFormat: 'mp3' };
  const maxDurationSeconds = Number.isFinite(+maxDurationMin) && +maxDurationMin > 0 ? Math.round(+maxDurationMin * 60) : null;
  const vlang = language === 'de' ? 'en' : (VOICE_BY_LANG[language] ? language : 'ru');
  body.assistant = {
    model: { provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'system', content: VOICEMAIL_RULE + 'Ты — вежливый HR-ассистент компании. Говори кратко и по делу. Задание: ' + (task || 'тестовый звонок — поздоровайся и попрощайся.') }] },
    firstMessage: firstMessage || 'Здравствуйте! Это ассистент отдела подбора персонала.',
    transcriber: { provider: 'deepgram', model: 'nova-2', language: language || 'ru' },
    endCallFunctionEnabled: true,
    artifactPlan,
  };
  if (env.ELEVENLABS_API_KEY) body.assistant.voice = { provider: '11labs', voiceId: VOICE_BY_LANG[vlang], model: 'eleven_multilingual_v2' };
  else body.assistant.voice = { provider: 'azure', voiceId: (language === 'pl' ? 'pl-PL-AgnieszkaNeural' : language === 'en' ? 'en-US-JennyNeural' : 'ru-RU-SvetlanaNeural') };
  if (Object.keys(analysisPlan).length) body.assistant.analysisPlan = analysisPlan;
  if (maxDurationSeconds) body.assistant.maxDurationSeconds = maxDurationSeconds;
  // Аудио-детект автоответчика (provider 'vapi' — работает с BYO-SIP Zadarma), настроен на раннее срабатывание.
  // Основная защита — правило VOICEMAIL_RULE + endCallFunctionEnabled (модель сама вешает трубку): voicemailMessage НЕ задаём.
  body.assistant.voicemailDetection = { provider: 'vapi', backoffPlan: { maxRetries: 6, startAtSeconds: 2, frequencySeconds: 2.5 } };
  const r = await fetch('https://api.vapi.ai/call', {
    method: 'POST', headers: { Authorization: 'Bearer ' + env.VAPI_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Vapi: ' + ((d && d.message) || r.status));
  return { ok: true, callId: d && d.id, status: d && d.status };
}

export async function getCall(env, callId, signal) {
  if (!env.VAPI_API_KEY) return { skipped: true, reason: 'Vapi не настроен' };
  const r = await fetch('https://api.vapi.ai/call/' + encodeURIComponent(callId), { headers: { Authorization: 'Bearer ' + env.VAPI_API_KEY }, signal });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Vapi: ' + ((d && d.message) || r.status));
  const a = (d && d.analysis) || {};
  const art = (d && d.artifact) || {};
  const rec = art.recording || {};
  const recordingUrl = d.recordingUrl || art.recordingUrl || (rec.mono && rec.mono.combinedUrl) || rec.stereoUrl || art.stereoRecordingUrl || null;
  const startedAt = d.startedAt || null, endedAt = d.endedAt || null;
  const durationSec = (startedAt && endedAt) ? Math.max(0, Math.round((new Date(endedAt) - new Date(startedAt)) / 1000)) : (d.durationSeconds || null);
  const endedReason = d && d.endedReason;
  const transcript = (d && d.transcript) || art.transcript || null;
  const voicemail = /voicemail/i.test(String(endedReason || '')) || looksLikeVoicemail(transcript);
  return {
    ok: true, id: d && d.id, status: d && d.status, endedReason,
    noAnswer: isNoAnswer(endedReason) || voicemail, voicemail,
    transcript, summary: a.summary || null, structuredData: a.structuredData || null,
    recordingUrl, startedAt, endedAt, durationSec,
  };
}

// Исход «не дозвонился» (как будто не взяли трубку): голосовая почта, нет ответа, занято, отклонён.
export function isNoAnswer(endedReason) {
  return /voicemail|no-answer|did-not-answer|customer-busy|\bbusy\b|no-?answer|not-?answer|rejected|declined/i.test(String(endedReason || ''));
}
