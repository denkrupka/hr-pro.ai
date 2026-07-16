// Единый журнал ИИ-звонков (edge). Оркестрация выполняется в рамках запроса (без фонового планировщика).
// Журнал живёт на participant.workflow.aiCallLog; вызывающий делает S.upsert('participants', ...) после мутаций.
import { startCall as igStart, getCall as igGet } from './integrations-edge.js';
import * as analyzer from './ai-call-analyzer-edge.js';
import { REF_LABELS } from '../src/ai-call-prompts.js';

const MAX_CONTINUATIONS = 2;
const KINDS_EXTRACT = ['afterResult', 'motivation', 'references'];

function nowISO() { return new Date().toISOString(); }
function uid(n) { let s = ''; const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < (n || 8); i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
function akind(kind) { return kind === 'motivation' ? 'afterResult' : kind; }
function needsExtract(kind) { return KINDS_EXTRACT.includes(kind); }

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
export function labelsOf(kind, lang) { if (kind === 'references') return REF_LABELS || {}; return MOT_LABELS[lang] || MOT_LABELS.ru; }

function logOf(p) { p.workflow = p.workflow || {}; p.workflow.aiCallLog = p.workflow.aiCallLog || []; return p.workflow.aiCallLog; }
export function isFinal(e) { return e.status === 'done' || e.status === 'failed'; }
function lastAttempt(e) { return e.attempts && e.attempts[e.attempts.length - 1]; }
function countFilled(ans) { return Object.values(ans || {}).filter(v => typeof v === 'string' && v.trim()).length; }

export async function startCall(env, p, opts) {
  const r = await igStart(env, {
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
  return { entry, callId: r.callId };
}

export async function refreshEntry(env, p, entry) {
  if (!entry || isFinal(entry)) return entry;
  const att = lastAttempt(entry);
  if (!att || !att.callId) { entry.status = 'failed'; return entry; }
  let call;
  try { call = await igGet(env, att.callId); } catch (e) { entry.lastError = e.message; return entry; }
  if (call.skipped) return entry;
  att.status = call.status || att.status;
  att.endedReason = call.endedReason || att.endedReason;
  att.transcript = call.transcript || att.transcript;
  att.recordingUrl = call.recordingUrl || att.recordingUrl;
  att.summary = call.summary || att.summary;
  att.durationSec = call.durationSec != null ? call.durationSec : att.durationSec;
  att.endedAt = call.endedAt || att.endedAt;
  const ended = call.status === 'ended' || !!call.endedReason;
  if (!ended) { entry.status = 'calling'; return entry; }

  entry.status = 'analyzing';
  let analysis;
  try { analysis = await analyzer.analyzeCompleteness(env, att.transcript || '', akind(entry.kind), att.endedReason); }
  catch (e) { analysis = { complete: false, covered: [], remaining: ['уточнить'], reason: 'анализ не выполнен: ' + e.message }; }
  entry.analysis = analysis;

  const answered = (att.transcript || '').trim().length >= 20;
  const canContinue = answered && !analysis.complete && entry.attempts.length <= MAX_CONTINUATIONS;
  if (canContinue) {
    const contTask = analyzer.continuationTask(entry.basePrompt, analysis, entry.vars || {});
    const contFirst = analyzer.continuationFirst(akind(entry.kind), entry.lang, entry.vars || {});
    try {
      const r = await igStart(env, {
        to: entry.to, task: contTask, firstMessage: contFirst, language: entry.lang,
        structuredDataSchema: entry.callConfig && entry.callConfig.structuredDataSchema,
        summaryPrompt: entry.callConfig && entry.callConfig.summaryPrompt,
        maxDurationMin: entry.callConfig && entry.callConfig.maxDurationMin,
      });
      if (r && r.callId) {
        entry.attempts.push({ callId: r.callId, status: 'calling', startedAt: nowISO(), endedAt: null, endedReason: null, durationSec: null, transcript: null, recordingUrl: null, summary: null, continuation: true });
        entry.status = 'continuing';
        return entry;
      }
    } catch (e) { entry.lastError = 'перезвон: ' + e.message; }
  }
  await finalize(env, p, entry);
  entry.status = 'done';
  entry.doneAt = nowISO();
  return entry;
}

async function finalize(env, p, entry) {
  const transcripts = (entry.attempts || []).map(a => a.transcript).filter(Boolean);
  if (needsExtract(entry.kind)) {
    let ex = { answers: {}, summary: '' };
    try { if (transcripts.length) ex = await analyzer.extractAnswers(env, transcripts, akind(entry.kind)); }
    catch (e) { entry.lastError = 'извлечение: ' + e.message; }
    entry.answers = ex.answers || {};
    entry.summary = ex.summary || '';
    entry.filled = countFilled(entry.answers);
    writeStageForm(p, entry);
  } else {
    entry.summary = (lastAttempt(entry) && lastAttempt(entry).summary) || entry.summary || '';
  }
}

function transcriptJoin(entry) {
  return (entry.attempts || []).map((a, i) => (entry.attempts.length > 1 ? `=== Попытка ${i + 1} ===\n` : '') + (a.transcript || '')).filter(s => s.trim()).join('\n\n');
}
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
    p.workflow.aiMotivation = { answers: entry.answers || {}, summary: entry.summary || '', at: nowISO(), entryId: entry.id, attempts: entry.attempts.length };
  }
}

export async function refreshAll(env, p) {
  const log = logOf(p);
  let n = 0;
  for (const e of log) { if (!isFinal(e)) { await refreshEntry(env, p, e); n++; } }
  return n;
}

export function publicView(p, lang) {
  const log = (p.workflow && p.workflow.aiCallLog) || [];
  return log.map(e => {
    const labels = labelsOf(e.kind, lang);
    const answers = e.answers && Object.keys(e.answers).length
      ? Object.entries(e.answers).filter(([, v]) => typeof v === 'string' && v.trim()).map(([k, v]) => ({ key: k, label: labels[k] || k, value: v }))
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
