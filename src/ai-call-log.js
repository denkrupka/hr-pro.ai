'use strict';
// Единый журнал ИИ-звонков кандидата + оркестрация: захват транскрипта/записи,
// анализ завершённости (прервался/довели), докручивающий перезвон, агрегация ответов по этапу.
// Журнал живёт на p.workflow.aiCallLog (массив записей-этапов; в каждой — попытки звонков).
const integ = require('./integrations');
const analyzer = require('./ai-call-analyzer');
const prompts = require('./ai-call-prompts');

const MAX_CONTINUATIONS = 2;          // сколько раз докручиваем прерванный разговор (итого до 3 звонков на этап)
const KINDS_EXTRACT = ['afterResult', 'motivation', 'references'];  // этапы, из которых извлекаем ответы в форму

function nowISO() { return new Date().toISOString(); }
function uid(n) { let s = ''; const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < (n || 8); i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
// Тип этапа → тип для анализатора (мотивация после теста и отдельный мотивационный звонок — одно и то же).
function akind(kind) { return kind === 'motivation' ? 'afterResult' : kind; }
function needsExtract(kind) { return KINDS_EXTRACT.includes(kind); }

// Человеко-понятное название этапа (для модалки «Звонки ИИ»).
const TITLE = {
  first: { ru: 'Первый контакт', pl: 'Pierwszy kontakt', en: 'First contact' },
  afterResult: { ru: 'Мотивация (после «Резалта»)', pl: 'Motywacja (po „Result”)', en: 'Motivation (after Result)' },
  motivation: { ru: 'Уровень мотивации', pl: 'Poziom motywacji', en: 'Motivation level' },
  afterTools: { ru: 'После заключительного теста', pl: 'Po teście końcowym', en: 'After final test' },
  references: { ru: 'Референс руководителя', pl: 'Referencja przełożonego', en: 'Manager reference' },
};
function titleOf(kind, lang) { const g = TITLE[kind] || TITLE.first; return g[lang] || g.ru; }

const MOT_LABELS = {
  ru: { q1_answer: 'Что важно в работе/компании', q2_answer: 'Почему откликнулся и что знает', q3_answer: 'Критерии при равной зарплате', q4_answer: 'Что откликнулось в миссии', q5_questions: 'Вопросы кандидата', callback_time: 'Когда перезвонить' },
  pl: { q1_answer: 'Co ważne w pracy/firmie', q2_answer: 'Dlaczego aplikował i co wie', q3_answer: 'Kryteria przy równej płacy', q4_answer: 'Co poruszyło w misji', q5_questions: 'Pytania kandydata', callback_time: 'Kiedy oddzwonić' },
  en: { q1_answer: 'What matters in job/company', q2_answer: 'Why applied and what knows', q3_answer: 'Criteria at equal pay', q4_answer: 'What resonated in mission', q5_questions: 'Candidate questions', callback_time: 'When to call back' },
};
function labelsOf(kind, lang) {
  if (kind === 'references') return prompts.REF_LABELS || {};
  return MOT_LABELS[lang] || MOT_LABELS.ru;
}

function logOf(p) { p.workflow = p.workflow || {}; p.workflow.aiCallLog = p.workflow.aiCallLog || []; return p.workflow.aiCallLog; }
function isFinal(e) { return e.status === 'done' || e.status === 'failed'; }
function lastAttempt(e) { return e.attempts && e.attempts[e.attempts.length - 1]; }
function countFilled(ans) { return Object.values(ans || {}).filter(v => typeof v === 'string' && v.trim()).length; }

// Создать запись этапа и запустить первый звонок. Возвращает {entry} | {skipped,reason} | {error}.
async function startCall(settings, p, opts, save) {
  // opts: {kind, refIndex?, to, lang, task, firstMessage, structuredDataSchema?, summaryPrompt?, vars}
  const r = await integ.startCall(settings, {
    to: opts.to, task: opts.task, firstMessage: opts.firstMessage, language: opts.lang,
    structuredDataSchema: opts.structuredDataSchema, summaryPrompt: opts.summaryPrompt, maxDurationMin: opts.maxDurationMin,
  });
  if (r && r.skipped) return { skipped: true, reason: r.reason };
  const log = logOf(p);
  const entry = {
    id: uid(8), kind: opts.kind, refIndex: opts.refIndex != null ? opts.refIndex : null,
    to: opts.to, lang: opts.lang || 'ru', createdAt: nowISO(), status: 'calling',
    basePrompt: opts.task || '', vars: opts.vars || {},
    callConfig: { structuredDataSchema: opts.structuredDataSchema || null, summaryPrompt: opts.summaryPrompt || null, maxDurationMin: opts.maxDurationMin || null },
    attempts: [{ callId: r.callId, status: 'calling', startedAt: nowISO(), endedAt: null, endedReason: null, durationSec: null, transcript: null, recordingUrl: null, summary: null }],
    analysis: null, answers: null, summary: '', filled: 0,
  };
  log.push(entry);
  if (save) save();
  return { entry, callId: r.callId };
}

// Обновить одну запись: подтянуть звонок, при завершении — анализ; прервался → докрутка; довели → агрегация+извлечение.
async function refreshEntry(settings, p, entry, save) {
  if (!entry || isFinal(entry)) return entry;
  const att = lastAttempt(entry);
  if (!att || !att.callId) { entry.status = 'failed'; if (save) save(); return entry; }
  let call;
  try { call = await integ.getCall(settings, att.callId); }
  catch (e) { entry.lastError = e.message; if (save) save(); return entry; }
  if (call.skipped) return entry;
  // Записать всё, что уже отдал Vapi (транскрипт/запись доступны и на живом звонке частично).
  att.status = call.status || att.status;
  att.endedReason = call.endedReason || att.endedReason;
  att.transcript = call.transcript || att.transcript;
  att.recordingUrl = call.recordingUrl || att.recordingUrl;
  att.summary = call.summary || att.summary;
  att.durationSec = call.durationSec != null ? call.durationSec : att.durationSec;
  att.endedAt = call.endedAt || att.endedAt;
  const ended = call.status === 'ended' || !!call.endedReason;
  if (!ended) { entry.status = 'calling'; if (save) save(); return entry; }

  // Разговор завершился (успешно или обрывом) — анализируем завершённость.
  entry.status = 'analyzing';
  let analysis;
  try { analysis = await analyzer.analyzeCompleteness(att.transcript || '', akind(entry.kind), att.endedReason); }
  catch (e) { analysis = { complete: false, covered: [], remaining: ['уточнить'], reason: 'анализ не выполнен: ' + e.message }; }
  entry.analysis = analysis;

  // Докручиваем только если разговор реально состоялся и прервался (есть содержательный транскрипт).
  // Неответ/сброс до разговора — не докручиваем здесь: это зона планировщика (retryAfterMin/retryCount).
  const answered = (att.transcript || '').trim().length >= 20;
  const canContinue = answered && !analysis.complete && entry.attempts.length <= MAX_CONTINUATIONS;
  if (canContinue) {
    // Докручивающий перезвон: собрать промт «что уже обсудили / где прервалось / что осталось».
    const contTask = analyzer.continuationTask(entry.basePrompt, analysis, entry.vars || {});
    const contFirst = analyzer.continuationFirst(akind(entry.kind), entry.lang, entry.vars || {});
    try {
      const r = await integ.startCall(settings, {
        to: entry.to, task: contTask, firstMessage: contFirst, language: entry.lang,
        structuredDataSchema: entry.callConfig && entry.callConfig.structuredDataSchema,
        summaryPrompt: entry.callConfig && entry.callConfig.summaryPrompt,
        maxDurationMin: entry.callConfig && entry.callConfig.maxDurationMin,
      });
      if (r && r.callId) {
        entry.attempts.push({ callId: r.callId, status: 'calling', startedAt: nowISO(), endedAt: null, endedReason: null, durationSec: null, transcript: null, recordingUrl: null, summary: null, continuation: true });
        entry.status = 'continuing';
        if (save) save();
        return entry;
      }
    } catch (e) { entry.lastError = 'перезвон: ' + e.message; }
    // не удалось перезвонить — падаем в финализацию по тому, что есть
  }

  // Финализация: агрегируем все попытки этапа и (для нужных этапов) извлекаем ответы в форму.
  await finalize(p, entry);
  entry.status = 'done';
  entry.doneAt = nowISO();
  if (save) save();
  return entry;
}

// Свести все попытки этапа: извлечь ответы (Claude из склеенных транскриптов) и записать в форму этапа.
async function finalize(p, entry) {
  const transcripts = (entry.attempts || []).map(a => a.transcript).filter(Boolean);
  if (needsExtract(entry.kind)) {
    let ex = { answers: {}, summary: '' };
    try { if (transcripts.length) ex = await analyzer.extractAnswers(transcripts, akind(entry.kind)); }
    catch (e) { entry.lastError = 'извлечение: ' + e.message; }
    entry.answers = ex.answers || {};
    entry.summary = ex.summary || '';
    entry.filled = countFilled(entry.answers);
    writeStageForm(p, entry);
  } else {
    // Информационные звонки (первый контакт, после теста) — только резюме последней попытки.
    entry.summary = (lastAttempt(entry) && lastAttempt(entry).summary) || entry.summary || '';
  }
}

// Записать извлечённые ответы в форму соответствующего этапа найма (референсы / мотивация).
function writeStageForm(p, entry) {
  p.workflow = p.workflow || {};
  if (entry.kind === 'references' && entry.refIndex != null) {
    p.workflow.references = p.workflow.references || {};
    p.workflow.references.multi = p.workflow.references.multi || {};
    const cur = p.workflow.references.multi[entry.refIndex] || {};
    cur.answers = Object.assign({}, cur.answers || {}, entry.answers || {});
    cur.at = nowISO();
    cur.aiCall = { callId: (lastAttempt(entry) || {}).callId, status: 'done', summary: entry.summary, transcript: transcriptJoin(entry), doneAt: nowISO(), attempts: entry.attempts.length };
    p.workflow.references.multi[entry.refIndex] = cur;
  } else {
    // Мотивация — общая для кандидата форма (последний собранный этап перезаписывает).
    p.workflow.aiMotivation = { answers: entry.answers || {}, summary: entry.summary || '', at: nowISO(), entryId: entry.id, attempts: entry.attempts.length };
  }
}
function transcriptJoin(entry) {
  return (entry.attempts || []).map((a, i) => (entry.attempts.length > 1 ? `=== Попытка ${i + 1} ===\n` : '') + (a.transcript || '')).filter(s => s.trim()).join('\n\n');
}

// Обновить все незавершённые записи журнала. Возвращает число обновлённых.
async function refreshAll(settings, p, save) {
  const log = logOf(p);
  let n = 0;
  for (const e of log) { if (!isFinal(e)) { await refreshEntry(settings, p, e, null); n++; } }
  if (save) save();
  return n;
}

// Представление журнала для клиента (без служебных промтов/переменных).
function publicView(p, lang) {
  const log = (p.workflow && p.workflow.aiCallLog) || [];
  return log.map(e => {
    const labels = labelsOf(e.kind, lang);
    const answers = e.answers && Object.keys(e.answers).length
      ? Object.entries(e.answers).filter(([, v]) => typeof v === 'string' && v.trim())
        .map(([k, v]) => ({ key: k, label: labels[k] || k, value: v }))
      : [];
    return {
      id: e.id, kind: e.kind, refIndex: e.refIndex, title: titleOf(e.kind, lang),
      status: e.status, createdAt: e.createdAt, doneAt: e.doneAt || null, to: e.to,
      attempts: (e.attempts || []).map((a, i) => ({
        n: i + 1, continuation: !!a.continuation, status: a.status,
        startedAt: a.startedAt, endedReason: a.endedReason, durationSec: a.durationSec,
        transcript: a.transcript || '', recordingUrl: a.recordingUrl || null, summary: a.summary || '',
      })),
      analysis: e.analysis ? { complete: !!e.analysis.complete, reason: e.analysis.reason || '', remaining: e.analysis.remaining || [] } : null,
      summary: e.summary || '', answers, filled: e.filled || 0,
    };
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

module.exports = { startCall, refreshEntry, refreshAll, publicView, logOf, titleOf, labelsOf, isFinal, MAX_CONTINUATIONS };
