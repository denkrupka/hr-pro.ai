// Vapi-звонки для edge/Workers. Ключи — из env (VAPI_API_KEY, VAPI_PHONE_NUMBER_ID, ELEVENLABS_API_KEY).
const VOICE_BY_LANG = { ru: 'YjESejviApN7SHrbfnA2', pl: 'd4Z5Fvjohw3zxGpV8XUV', en: 'EST9Ui6982FZPSi7gCHi' };

// Универсальное правило: попал на автоответчик/голосовую почту → сразу завершить звонок, ничего не наговаривая.
const VOICEMAIL_RULE = 'КРИТИЧЕСКИ ВАЖНО ПРО АВТООТВЕТЧИК: если в начале звучит записанное приветствие, длинная непрерывная реплика без пауз для тебя, гудок/сигнал «бип», просьба оставить сообщение после сигнала, музыка ожидания, автоматическое меню (IVR) или тишина вместо живого человека — это НЕ живой собеседник, а голосовая почта/автоответчик. ВАЖНО: приветствие автоответчика может быть НА ЛЮБОМ ЯЗЫКЕ (например, польском или английском), даже если ты ведёшь звонок по-русски — номер может быть в другой стране. Распознавай автоответчик по СМЫСЛУ на любом языке (напр. польское «poczta głosowa / zostaw wiadomość / nagraj po sygnale», английское «leave a message after the beep»). В этом случае НЕМЕДЛЕННО заверши звонок (вызови функцию завершения звонка), НЕ говори ничего и НЕ оставляй сообщений. Не пытайся вести диалог с записью. ';

// Признаки того, что попали на голосовую почту/автоответчик (ru/pl/en) — по транскрипту.
const VM_RX = /(оставьте|оставить|запишите|запиш(и|ите)).{0,20}сообщени|после\s+(звукового\s+)?сигнал|автоответчик|голосов\S*\s+почт|абонент\s+(недоступен|временно)|не\s+может\s+прин|zostaw\s+wiadomo|nagra\S+\s+wiadomo|po\s+sygnale|automatyczn\S+\s+sekretar|poczt\S*\s+głosow|niedostępn|leave\s+a\s+message|after\s+the\s+(tone|beep)|voice\s?mail|not\s+available|record\s+your\s+message|please\s+leave/i;
export function looksLikeVoicemail(transcript) { return VM_RX.test(String(transcript || '')); }

// Признаки просьбы «не звонить» — по словам кандидата ИЛИ по ответу нашего ИИ (он по правилу обещает не звонить/удалить контакт). ru/pl/en.
const OPTOUT_RX = /не\s+(звони|звоните)|не\s+буду.{0,14}звонить|(больше\s+)?не\s+(надо|нужно|стоит)\s+(мне\s+)?звонить|не\s+беспоко|уже\s+звонили|это\s+спам|отстаньте|удал\S+\s+(ваш\s+)?контакт|удал\S+\s+из\s+обзвон|proszę\s+(już\s+)?nie\s+dzwoni|nie\s+dzwońcie|to\s+spam|już\s+dzwonili|(please\s+)?(do\s+not|don'?t)\s+call|stop\s+calling|already\s+called|remove\s+(me|my)\b/i;
export function looksLikeOptOut(transcript) { return OPTOUT_RX.test(String(transcript || '')); }
// Из авто-полей Vapi тоже вытащим сигнал (имена полей у Vapi могут отличаться от нашей схемы).
export function optOutFromData(sd) {
  if (!sd || typeof sd !== 'object') return false;
  if (sd.do_not_call === true) return true;
  if (sd.user_consent_to_call_again && /^(no|false|нет)$/i.test(String(sd.user_consent_to_call_again))) return true;
  if (sd.do_not_call_again === true || sd.opt_out === true) return true;
  return false;
}

// Статус обзвона: единый итог звонка после анализа разговора. Приоритет — надёжные сигналы, иначе строка «СТАТУС:» из резюме.
export function deriveCallStatus(o, summary) {
  const sm = String(summary || '');
  const reason = (sm.match(/ПРИЧИНА:\s*([^\n]+)/i) || [])[1];
  const cleanReason = reason && !/^[—\-\s]*$/.test(reason) ? reason.trim() : null;
  if (o.voicemail) return { callStatus: 'Не дозвонились (автоответчик)', statusReason: null };
  if (o.noAnswer) return { callStatus: 'Не дозвонились', statusReason: null };
  if (o.doNotCall) return { callStatus: 'Просил не звонить', statusReason: cleanReason };
  if (o.callbackRequested) return { callStatus: 'Договорились о перезвоне', statusReason: o.callbackWhen || cleanReason };
  const st = (sm.match(/СТАТУС:\s*([^\n]+)/i) || [])[1];
  if (st) return { callStatus: st.trim(), statusReason: cleanReason };
  if (!o.transcript || String(o.transcript).trim().length < 40) return { callStatus: 'Не удалось поговорить', statusReason: null };
  return { callStatus: 'Поговорили', statusReason: cleanReason };
}

const LANG_NAME = { ru: 'русском', pl: 'польском', en: 'английском', uk: 'украинском', de: 'немецком' };
// Правило языка: вести разговор на языке заявки; если кандидат отвечает на другом языке — продолжать на языке заявки, но зафиксировать язык кандидата.
function languageRule(language) {
  const L = LANG_NAME[language] || 'русском';
  return `ЯЗЫК РАЗГОВОРА: веди беседу на ${L} языке — это язык заявки. Если кандидат отвечает на ДРУГОМ языке (например, украинском, польском, английском), НЕ переходи на его язык — вежливо продолжай на ${L}. При этом обязательно отметь в итоге, на каком языке фактически говорил кандидат, если он отличается от ${L}. `;
}
// Правило реакции на «нет»/отказ: НЕ вешать трубку сразу — один раз мягко выяснить причину открытым вопросом, затем действовать по ситуации.
const OPT_OUT_RULE = 'РЕАКЦИЯ НА «НЕТ»/ОТКАЗ (очень важно): если на вопрос «удобно ли говорить» или в начале разговора кандидат отвечает «нет», колеблется или отказывается — НЕ вешай трубку сразу и НЕ считай это автоматически отказом. Сначала ОДИН раз, мягко и ненавязчиво, уточни причину ОТКРЫТЫМ вопросом (например: «Подскажите, а почему?» / «Что именно не подходит?») — НЕ перечисляй варианты сам, дай кандидату ответить своими словами. Спрашиваешь причину только ОДИН раз, если не хочет отвечать — не настаивай. Затем действуй по ситуации: '
  + '(1) НЕУДОБНО СЕЙЧАС (занят, за рулём, не вовремя) — не дави. ОБЯЗАТЕЛЬНО скажи, что ТЫ САМА перезвонишь в удобное время, и уточни КОНКРЕТНО, когда удобно (день и примерное время). Если кандидат говорит «я сам перезвоню / я вас наберу» — вежливо, но чётко объясни, что удобнее, если перезвонишь ты сама (входящие звонки мы не принимаем), и ВСЁ РАВНО добейся конкретного времени для звонка. НЕ соглашайся просто ждать звонка от кандидата и не прощайся, пока не уточнил время. Затем поблагодари и попрощайся. Это НЕ отказ — мы перезвоним. '
  + '(2) НЕ ИНТЕРЕСНА вакансия (уже нашёл работу, не хочет работать в этой сфере, не устраивают условия и т.п. — запомни, что именно назвал кандидат) — поблагодари за уделённое время, скажи, что не будешь больше беспокоить по этой вакансии, и вежливо заверши звонок. '
  + '(3) ПРОСИТ БОЛЬШЕ НЕ ЗВОНИТЬ, раздражён, называет это спамом или говорит, что с ним уже связывались и просил прекратить — искренне извинись за беспокойство, ОДИН раз мягко уточни причину (если ещё не назвал), пообещай удалить контакт из обзвона и больше не звонить, вежливо заверши звонок. '
  + 'Ни в одном случае не уговаривай и не настаивай. Заверши звонок функцией завершения, когда вопрос исчерпан. ';

// Универсальные поля отчёта, которые извлекаем ИЗ ЛЮБОГО звонка (язык кандидата, просьба не звонить, повторный контакт).
function withUniversalFields(schema) {
  const extra = {
    spoken_language: { type: 'string', description: 'Язык, на котором ФАКТИЧЕСКИ говорил кандидат, если он ОТЛИЧАЕТСЯ от языка звонка (например: "украинский"). Оставь пустым, если кандидат говорил на языке звонка.' },
    do_not_call: { type: 'boolean', description: 'true ТОЛЬКО если кандидат прямо просил больше ему не звонить, был против звонков, назвал это спамом или просил прекратить. НЕ ставь true, если ему просто сейчас неудобно говорить.' },
    already_contacted: { type: 'boolean', description: 'true, если кандидат сказал, что с ним уже связывались или уже звонили по этому вопросу.' },
    callback_requested: { type: 'boolean', description: 'true, если кандидату сейчас неудобно и он согласен, чтобы перезвонили позже.' },
    callback_when: { type: 'string', description: 'Когда кандидат просил перезвонить (как он это сказал, например «завтра после обеда», «вечером»). Пусто, если перезвон не обсуждали.' },
  };
  if (!schema || typeof schema !== 'object') return { type: 'object', properties: { ...extra } };
  return { ...schema, properties: { ...(schema.properties || {}), ...extra } };
}

export function vapiConfigured(env) { return !!(env && env.VAPI_API_KEY && env.VAPI_PHONE_NUMBER_ID); }

export async function startCall(env, { to, task, firstMessage, language, structuredDataSchema, summaryPrompt, maxDurationMin, signal }) {
  if (!env.VAPI_API_KEY) return { skipped: true, reason: 'Vapi не настроен' };
  if (!env.VAPI_PHONE_NUMBER_ID) return { skipped: true, reason: 'Vapi: не указан Phone Number ID' };
  const body = { phoneNumberId: env.VAPI_PHONE_NUMBER_ID, customer: { number: String(to) } };
  const analysisPlan = {};
  if (summaryPrompt) analysisPlan.summaryPlan = { enabled: true, messages: [
    { role: 'system', content: summaryPrompt }, { role: 'user', content: 'Транскрипт разговора:\n\n{{transcript}}' }] };
  // Структурные данные извлекаем ВСЕГДА: к переданной схеме добавляем универсальные поля (язык кандидата, «не звонить», повторный контакт).
  analysisPlan.structuredDataPlan = { enabled: true, schema: withUniversalFields(structuredDataSchema), messages: [
    { role: 'system', content: 'Извлеки ответы из расшифровки звонка строго по JSON-схеме. Если на пункт не ответили — оставь поле пустым. Верни только данные по схеме.' },
    { role: 'user', content: 'Транскрипт разговора:\n\n{{transcript}}' }] };
  const artifactPlan = { recordingEnabled: true, recordingFormat: 'mp3' };
  const maxDurationSeconds = Number.isFinite(+maxDurationMin) && +maxDurationMin > 0 ? Math.round(+maxDurationMin * 60) : null;
  const vlang = language === 'de' ? 'en' : (VOICE_BY_LANG[language] ? language : 'ru');
  body.assistant = {
    model: { provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'system', content: VOICEMAIL_RULE + languageRule(language) + OPT_OUT_RULE + 'Ты — вежливый HR-ассистент компании. Говори кратко и по делу. Задание: ' + (task || 'тестовый звонок — поздоровайся и попрощайся.') }] },
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
  body.assistant.voicemailDetection = { provider: 'vapi', backoffPlan: { maxRetries: 10, startAtSeconds: 2, frequencySeconds: 2.5 } };
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
  const sd = a.structuredData || null;
  // «Не звонить» надёжно: наша схема ИЛИ авто-поля Vapi ИЛИ эвристика по транскрипту (без voicemail — там ИИ тоже прощается).
  const doNotCall = !voicemail && (optOutFromData(sd) || looksLikeOptOut(transcript));
  const base = {
    ok: true, id: d && d.id, status: d && d.status, endedReason,
    noAnswer: isNoAnswer(endedReason) || voicemail, voicemail,
    doNotCall, spokenLanguage: (sd && (sd.spoken_language || sd.candidate_language)) || null, alreadyContacted: !!(sd && (sd.already_contacted || (sd.was_contacted_before))),
    callbackRequested: !!(sd && sd.callback_requested), callbackWhen: (sd && sd.callback_when) || null,
    customerNumber: (d && d.customer && d.customer.number) || null,
    transcript, summary: a.summary || null, structuredData: sd,
    recordingUrl, startedAt, endedAt, durationSec,
  };
  const cs = deriveCallStatus(base, a.summary);
  base.callStatus = cs.callStatus; base.statusReason = cs.statusReason;
  return base;
}

// Исход «не дозвонился» (как будто не взяли трубку): голосовая почта, нет ответа, занято, отклонён.
export function isNoAnswer(endedReason) {
  return /voicemail|no-answer|did-not-answer|customer-busy|\bbusy\b|no-?answer|not-?answer|rejected|declined/i.test(String(endedReason || ''));
}
