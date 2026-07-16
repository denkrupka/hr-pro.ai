'use strict';
// Планировщик ИИ-звонков: очередь (db().callQueue), рабочее окно, повтор при неответе, наследование настроек.
// Сами звонки размещаются через ai-call-log (журнал+транскрипт+запись+докрутка при обрыве).
const integ = require('./integrations');
const callLog = require('./ai-call-log');

const DEFAULTS = { agentName: '', companyMission: '', hoursFrom: '10:00', hoursTo: '19:00', days: [1, 2, 3, 4, 5], maxDurationMin: 10, retryAfterMin: 60, retryCount: 3, offHoursCallback: 'defer' };
// endedReason'ы «не подняли трубку / не дошло до разговора» — повод для перезвона планировщиком.
const NO_ANSWER = ['no-answer', 'did-not-answer', 'voicemail', 'busy', 'customer-busy', 'no-microphone-permission', 'failed-to-connect', 'did-not-receive-customer-audio', 'twilio-failed'];

function uid(n) { let s = ''; const a = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < (n || 10); i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
function nowISO() { return new Date().toISOString(); }
function clampInt(v, lo, hi, d) { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; }
function hm(str) { const p = String(str || '').split(':'); const h = parseInt(p[0], 10), m = parseInt(p[1], 10); return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0); }
function validTime(s, d) { return /^\d{1,2}:\d{2}$/.test(String(s || '')) ? s : d; }

// Привести настройки к валидному виду с дефолтами.
function normalizeCfg(a) {
  a = a || {};
  let days = Array.isArray(a.days) ? a.days.map(x => parseInt(x, 10)).filter(x => x >= 1 && x <= 7) : DEFAULTS.days.slice();
  days = Array.from(new Set(days)).sort();
  if (!days.length) days = DEFAULTS.days.slice();
  const from = validTime(a.hoursFrom, DEFAULTS.hoursFrom), to = validTime(a.hoursTo, DEFAULTS.hoursTo);
  return {
    agentName: String(a.agentName || '').slice(0, 60),
    companyMission: String(a.companyMission || '').slice(0, 1200),
    hoursFrom: hm(from) < hm(to) ? from : DEFAULTS.hoursFrom,
    hoursTo: hm(from) < hm(to) ? to : DEFAULTS.hoursTo,
    days,
    maxDurationMin: clampInt(a.maxDurationMin, 1, 30, DEFAULTS.maxDurationMin),
    retryAfterMin: clampInt(a.retryAfterMin, 5, 1440, DEFAULTS.retryAfterMin),
    retryCount: clampInt(a.retryCount, 1, 10, DEFAULTS.retryCount),
    offHoursCallback: a.offHoursCallback === 'call' ? 'call' : 'defer',
  };
}

// Наследование: своё у вакансии → первое заданное среди вакансий пользователя → стандартные дефолты.
function resolveAiCall(vacancies, ownerId, vac) {
  if (vac && vac.process && vac.process.aiCall) return normalizeCfg(vac.process.aiCall);
  const vs = (vacancies || []).filter(v => v.userId === ownerId)
    .sort((a, b) => ((a.order || 0) - (b.order || 0)) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  for (const v of vs) if (v.process && v.process.aiCall) return normalizeCfg(v.process.aiCall);
  return Object.assign({}, DEFAULTS);
}

function dow(d) { const n = d.getDay(); return n === 0 ? 7 : n; }   // 1=Пн … 7=Вс
function isWorkingTime(cfg, date) {
  const d = date || new Date();
  if (!(cfg.days || []).includes(dow(d))) return false;
  const cur = d.getHours() * 60 + d.getMinutes();
  return cur >= hm(cfg.hoursFrom) && cur < hm(cfg.hoursTo);
}
// Ближайший момент внутри рабочего окна (сейчас, если уже в окне).
function nextWorkingSlot(cfg, from) {
  const start = hm(cfg.hoursFrom);
  const base = new Date(from || Date.now());
  for (let day = 0; day < 8; day++) {
    const cand = new Date(base); cand.setDate(base.getDate() + day);
    if (!(cfg.days || []).includes(dow(cand))) continue;
    if (day === 0) {
      if (isWorkingTime(cfg, base)) return new Date(base);
      const cur = base.getHours() * 60 + base.getMinutes();
      if (cur < start) { cand.setHours(Math.floor(start / 60), start % 60, 0, 0); return cand; }
      continue; // сегодня окно уже закрыто — ищем следующий день
    }
    cand.setHours(Math.floor(start / 60), start % 60, 0, 0); return cand;
  }
  return new Date(base);
}

// Разместить звонок задачи через журнал (ai-call-log). Мутирует item.
async function placeCall(settings, p, item) {
  const o = item.opts || {};
  const r = await callLog.startCall(settings, p, {
    kind: item.kind, refIndex: item.refIndex, to: o.to, lang: o.lang,
    task: o.task, firstMessage: o.firstMessage,
    structuredDataSchema: o.structuredDataSchema, summaryPrompt: o.summaryPrompt,
    vars: o.vars, maxDurationMin: item.cfg && item.cfg.maxDurationMin,
  }, null);
  if (r && r.skipped) { item.status = 'failed'; item.lastReason = r.reason || 'skipped'; return r; }
  item.entryId = r.entry.id; item.callId = r.callId; item.attempts++; item.status = 'calling';
  return r;
}

// Поставить звонок в очередь. Если сейчас рабочее время — разместить сразу (чтобы кнопка-референс не ждала тик).
async function enqueueCall(dbData, save, settings, p, spec) {
  dbData.callQueue = dbData.callQueue || [];
  const cfg = normalizeCfg(spec.cfg);
  const now = new Date();
  const item = {
    id: uid(10), userId: spec.userId, participantId: spec.participantId,
    kind: spec.kind, refIndex: spec.refIndex != null ? spec.refIndex : null,
    status: 'pending', attempts: 0, nextAt: now.toISOString(),
    opts: spec.opts || {}, cfg, entryId: null, callId: null, createdAt: now.toISOString(), lastReason: null,
  };
  dbData.callQueue.push(item);
  let placed = null;
  if (isWorkingTime(cfg, now)) { try { placed = await placeCall(settings, p, item); } catch (e) { item.lastReason = e.message; item.status = 'pending'; } }
  else item.nextAt = nextWorkingSlot(cfg, now).toISOString();
  if (save) save();
  return { item, callId: item.callId, deferred: !item.callId, skipped: placed && placed.skipped, reason: item.lastReason };
}

// Тик планировщика: разместить назревшие, обновить активные, повторить неответы.
async function tick(dbData, save) {
  const q = dbData.callQueue || [];
  const now = new Date();
  let touched = false;
  for (const item of q) {
    if (['done', 'failed', 'stopped'].includes(item.status)) continue;
    const owner = (dbData.users || []).find(u => u.id === item.userId);
    const p = (dbData.participants || []).find(x => x.id === item.participantId);
    if (!owner || !p) { item.status = 'failed'; item.lastReason = 'нет владельца/кандидата'; touched = true; continue; }
    const settings = owner.settings;
    try {
      if (item.status === 'pending') {
        if (new Date(item.nextAt) > now) continue;
        if (!isWorkingTime(item.cfg, now)) { item.nextAt = nextWorkingSlot(item.cfg, now).toISOString(); touched = true; continue; }
        await placeCall(settings, p, item); touched = true; continue;
      }
      if (item.status === 'calling') {
        const entry = ((p.workflow && p.workflow.aiCallLog) || []).find(e => e.id === item.entryId);
        if (!entry) { item.status = 'failed'; item.lastReason = 'запись звонка потеряна'; touched = true; continue; }
        if (!callLog.isFinal(entry)) await callLog.refreshEntry(settings, p, entry, null);
        if (!callLog.isFinal(entry)) { touched = true; continue; }   // ещё идёт / докручивается
        const last = (entry.attempts || [])[entry.attempts.length - 1] || {};
        const answered = String(last.transcript || '').trim().length >= 20;
        const reason = String(last.endedReason || '');
        const noAnswer = !answered && (NO_ANSWER.some(x => reason.includes(x)) || !last.transcript);
        if (noAnswer && item.attempts < item.cfg.retryCount) {
          item.status = 'pending'; item.nextAt = new Date(now.getTime() + item.cfg.retryAfterMin * 60000).toISOString(); item.lastReason = 'неответ, перезвон';
        } else if (noAnswer) {
          item.status = 'stopped'; item.lastReason = 'нет ответа после ' + item.attempts + ' попыток';
        } else {
          item.status = 'done'; item.lastReason = reason || 'завершён';
        }
        touched = true;
      }
    } catch (e) { item.lastReason = 'tick: ' + e.message; touched = true; }
  }
  // Подчистить давние завершённые задачи (>7 дней), чтобы очередь не пухла.
  const weekAgo = new Date(now.getTime() - 7 * 864e5).toISOString();
  const keep = q.filter(it => !(['done', 'failed', 'stopped'].includes(it.status) && (it.createdAt || '') < weekAgo));
  if (keep.length !== q.length) { dbData.callQueue = keep; touched = true; }
  if (touched && save) save();
  return touched;
}

module.exports = { DEFAULTS, normalizeCfg, resolveAiCall, isWorkingTime, nextWorkingSlot, enqueueCall, tick, placeCall };
