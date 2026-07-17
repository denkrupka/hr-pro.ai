// Планировщик ИИ-звонков для edge: очередь на participant.workflow.callQueue, рабочее окно, авто-перезвон.
// Тик дёргается Cron Worker'ом (на Pages нет setInterval). Размещение — через ai-call-log-edge.
import * as callLog from './ai-call-log-edge.js';
import { normalizeCfg } from './call-settings-edge.js';
import * as analyzer from './ai-call-analyzer-edge.js';

const MAX_CALLBACKS = 2;
const NO_ANSWER = ['no-answer', 'did-not-answer', 'voicemail', 'busy', 'customer-busy', 'no-microphone-permission', 'failed-to-connect', 'did-not-receive-customer-audio', 'twilio-failed'];

function uid(n) { let s = ''; const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < (n || 10); i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
function hm(s) { const p = String(s || '').split(':'); const h = parseInt(p[0], 10), m = parseInt(p[1], 10); return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0); }
function dow(d) { const n = d.getDay(); return n === 0 ? 7 : n; }
export function isWorkingTime(cfg, date) {
  const d = date || new Date();
  if (!(cfg.days || []).includes(dow(d))) return false;
  const cur = d.getHours() * 60 + d.getMinutes();
  return cur >= hm(cfg.hoursFrom) && cur < hm(cfg.hoursTo);
}
export function nextWorkingSlot(cfg, from) {
  const start = hm(cfg.hoursFrom);
  const base = new Date(from || Date.now());
  for (let day = 0; day < 8; day++) {
    const cand = new Date(base); cand.setDate(base.getDate() + day);
    if (!(cfg.days || []).includes(dow(cand))) continue;
    if (day === 0) {
      if (isWorkingTime(cfg, base)) return new Date(base);
      const cur = base.getHours() * 60 + base.getMinutes();
      if (cur < start) { cand.setHours(Math.floor(start / 60), start % 60, 0, 0); return cand; }
      continue;
    }
    cand.setHours(Math.floor(start / 60), start % 60, 0, 0); return cand;
  }
  return new Date(base);
}

function queueOf(part) { part.workflow = part.workflow || {}; part.workflow.callQueue = part.workflow.callQueue || []; return part.workflow.callQueue; }

async function placeItem(env, part, item) {
  const o = item.opts || {};
  const r = await callLog.startCall(env, part, {
    kind: item.kind, refIndex: item.refIndex, to: o.to, lang: o.lang, task: o.task, firstMessage: o.firstMessage,
    structuredDataSchema: o.structuredDataSchema, summaryPrompt: o.summaryPrompt, vars: o.vars, maxDurationMin: item.cfg && item.cfg.maxDurationMin,
  });
  if (r && r.skipped) { item.status = 'failed'; item.lastReason = r.reason || 'skipped'; return r; }
  item.entryId = r.entry.id; item.callId = r.callId; item.attempts = (item.attempts || 0) + 1; item.status = 'calling';
  return r;
}

// Поставить звонок в очередь. В рабочее время — разместить сразу. Мутирует part. Возвращает {item, placed}.
export async function enqueue(env, part, spec) {
  const cfg = normalizeCfg(spec.cfg);
  const q = queueOf(part);
  const now = new Date();
  const item = { id: uid(10), kind: spec.kind, refIndex: spec.refIndex != null ? spec.refIndex : null,
    status: 'pending', attempts: 0, callbacks: 0, nextAt: now.toISOString(), opts: spec.opts || {}, cfg, entryId: null, callId: null, createdAt: now.toISOString(), lastReason: null };
  q.push(item);
  if (isWorkingTime(cfg, now)) { try { await placeItem(env, part, item); } catch (e) { item.lastReason = e.message; } }
  else item.nextAt = nextWorkingSlot(cfg, now).toISOString();
  part.callsActive = true;   // маркер для быстрого отбора в cron-тике (фильтр по JSON, без скана всей таблицы)
  return { item, placed: item.status === 'calling' };
}

// Тик по одному кандидату: разместить назревшие, обновить активные, перезвон при неответе/по просьбе.
// Возвращает true, если что-то изменилось (нужен upsert).
export async function tickParticipant(env, part) {
  const q = (part.workflow && part.workflow.callQueue) || [];
  const now = new Date();
  let touched = false;
  for (const item of q) {
    if (['done', 'failed', 'stopped'].includes(item.status)) continue;
    try {
      if (item.status === 'pending') {
        if (new Date(item.nextAt) > now) continue;
        if (!isWorkingTime(item.cfg, now)) { item.nextAt = nextWorkingSlot(item.cfg, now).toISOString(); touched = true; continue; }
        await placeItem(env, part, item); touched = true; continue;
      }
      if (item.status === 'calling') {
        const entry = ((part.workflow && part.workflow.aiCallLog) || []).find(e => e.id === item.entryId);
        if (!entry) { item.status = 'failed'; item.lastReason = 'запись потеряна'; touched = true; continue; }
        if (!callLog.isFinal(entry)) await callLog.refreshEntry(env, part, entry);
        if (!callLog.isFinal(entry)) { touched = true; continue; }
        const last = (entry.attempts || [])[entry.attempts.length - 1] || {};
        const answered = String(last.transcript || '').trim().length >= 20;
        const reason = String(last.endedReason || '');
        const noAnswer = !answered && (NO_ANSWER.some(x => reason.includes(x)) || !last.transcript);
        if (noAnswer && item.attempts < item.cfg.retryCount) {
          item.status = 'pending'; item.nextAt = new Date(now.getTime() + item.cfg.retryAfterMin * 60000).toISOString(); item.lastReason = 'неответ, перезвон';
        } else if (noAnswer) {
          item.status = 'stopped'; item.lastReason = 'нет ответа после ' + item.attempts + ' попыток';
        } else {
          // разговор состоялся — не просили ли перезвонить в конкретное время?
          let cb = null;
          if ((item.callbacks || 0) < MAX_CALLBACKS && answered) {
            try { const d = await analyzer.detectCallback(env, last.transcript, now.toISOString(), (item.opts && item.opts.lang) || 'ru'); if (d && d.requested && d.at) { const t = new Date(d.at); if (!isNaN(t) && t > now) cb = t; } } catch (_) {}
          }
          if (cb) {
            if (item.cfg.offHoursCallback !== 'call' && !isWorkingTime(item.cfg, cb)) cb = nextWorkingSlot(item.cfg, cb);
            item.status = 'pending'; item.nextAt = cb.toISOString(); item.attempts = 0; item.callbacks = (item.callbacks || 0) + 1; item.lastReason = 'перезвон по просьбе';
          } else { item.status = 'done'; item.lastReason = reason || 'завершён'; }
        }
        touched = true;
      }
    } catch (e) { item.lastReason = 'tick: ' + e.message; touched = true; }
  }
  // Автопрогресс «оторванных» незавершённых записей журнала (напр. референс-звонок размещён напрямую, без очереди)
  const tracked = new Set(q.map(it => it.entryId).filter(Boolean));
  for (const entry of ((part.workflow && part.workflow.aiCallLog) || [])) {
    if (callLog.isFinal(entry) || tracked.has(entry.id)) continue;
    try { await callLog.refreshEntry(env, part, entry); touched = true; } catch (e) { /* пропускаем */ }
  }
  // подчистить давние завершённые (>7 дней)
  const weekAgo = new Date(now.getTime() - 7 * 864e5).toISOString();
  const keep = q.filter(it => !(['done', 'failed', 'stopped'].includes(it.status) && (it.createdAt || '') < weekAgo));
  if (keep.length !== q.length) { part.workflow.callQueue = keep; touched = true; }
  // снять маркер активности, когда работы больше нет (кандидат уходит из cron-выборки)
  const active = hasPending(part);
  if (!!part.callsActive !== active) { part.callsActive = active; touched = true; }
  return touched;
}

// Есть ли у кандидата незавершённая работа планировщика (для отбора в cron).
export function hasPending(part) {
  const q = (part.workflow && part.workflow.callQueue) || [];
  const log = (part.workflow && part.workflow.aiCallLog) || [];
  return q.some(it => !['done', 'failed', 'stopped'].includes(it.status)) || log.some(e => !callLog.isFinal(e));
}
