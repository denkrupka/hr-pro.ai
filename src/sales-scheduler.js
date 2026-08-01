'use strict';
// Планировщик перезвонов Софии (отдел продаж, лиды) — Node-зеркало edge/sales-scheduler-edge.js.
// Портирует нюансы Евы (call-scheduler): распознавание времени перезвона, авто-перезвон,
// ретраи при недозвоне, рабочее окно, защита от петель. Размещение звонка — в server.js.
const sched = require('./call-scheduler');
const analyzer = require('./ai-call-analyzer');

const MAX_CALLBACKS = 2;
const NO_ANSWER = ['no-answer', 'did-not-answer', 'voicemail', 'busy', 'customer-busy', 'no-microphone-permission', 'failed-to-connect', 'did-not-receive-customer-audio', 'twilio-failed'];
const TERMINAL = ['do_not_call', 'refused', 'registered', 'converted'];

const isWorkingTime = sched.isWorkingTime;
const nextWorkingSlot = sched.nextWorkingSlot;

function salesCfg(pt) { return sched.normalizeCfg((pt && pt.salesCall) || {}); }
function isTerminal(lead) { return TERMINAL.includes(lead && lead.status); }

// Решение после завершения звонка. Мутирует lead.callSchedule и lead.callActive.
async function scheduleAfterReport(lead, ctx) {
  const now = ctx.now || new Date();
  const cfg = ctx.cfg;
  const sch = lead.callSchedule = lead.callSchedule || { status: 'calling', attempts: 1, callbacks: 0 };
  if (ctx.redialed) { sch.status = 'calling'; sch.startedAt = now.toISOString(); sch.attempts = (sch.attempts || 1); sch.lastReason = 'техн. обрыв — перезвон'; lead.callActive = true; return { action: 'redial' }; }
  if (ctx.terminal || isTerminal(lead)) { sch.status = 'done'; sch.lastReason = 'статус: ' + (lead.status || ''); lead.callActive = false; return { action: 'stop' }; }
  const transcript = String(ctx.transcript || '');
  const reason = String(ctx.endedReason || '');
  const answered = transcript.trim().length >= 20;
  const noAnswer = !answered && (NO_ANSWER.some(x => reason.includes(x)) || !transcript.trim());
  if (noAnswer) {
    if ((sch.attempts || 1) < cfg.retryCount) {
      sch.status = 'pending'; sch.nextAt = new Date(now.getTime() + cfg.retryAfterMin * 60000).toISOString();
      sch.lastReason = 'неответ, перезвон'; lead.callActive = true;
      return { action: 'retry', at: sch.nextAt };
    }
    sch.status = 'stopped'; sch.lastReason = 'нет ответа после ' + (sch.attempts || 1) + ' попыток'; lead.callActive = false;
    return { action: 'give-up' };
  }
  let cb = null;
  if ((sch.callbacks || 0) < MAX_CALLBACKS) {
    try { const d = await analyzer.detectCallback(transcript, now.toISOString(), ctx.lang || 'ru'); if (d && d.requested && d.at) { const t = new Date(d.at); if (!isNaN(t) && t > now) cb = t; } } catch (_) {}
  }
  if (cb) {
    if (cfg.offHoursCallback !== 'call' && !isWorkingTime(cfg, cb)) cb = nextWorkingSlot(cfg, cb);
    sch.status = 'pending'; sch.nextAt = cb.toISOString(); sch.attempts = 0; sch.callbacks = (sch.callbacks || 0) + 1;
    sch.lastReason = 'перезвон по просьбе'; lead.callActive = true;
    return { action: 'callback', at: sch.nextAt };
  }
  sch.status = 'done'; sch.lastReason = reason || 'завершён'; lead.callActive = false;
  return { action: 'done' };
}

function dueForCall(lead, cfg, now) {
  const sch = lead.callSchedule;
  if (!sch || sch.status !== 'pending') return { due: false };
  if (new Date(sch.nextAt) > now) return { due: false };
  if (!isWorkingTime(cfg, now)) { sch.nextAt = nextWorkingSlot(cfg, now).toISOString(); return { due: false, deferred: true }; }
  return { due: true };
}

function releaseIfStuck(lead, now, maxMin) {
  const sch = lead.callSchedule;
  if (!sch || sch.status !== 'calling' || !sch.startedAt) return false;
  if (now.getTime() - new Date(sch.startedAt).getTime() < (maxMin || 20) * 60000) return false;
  sch.status = 'done'; sch.lastReason = 'нет отчёта о звонке (таймаут)'; lead.callActive = false;
  return true;
}

module.exports = { MAX_CALLBACKS, salesCfg, isTerminal, scheduleAfterReport, dueForCall, releaseIfStuck, isWorkingTime, nextWorkingSlot };
