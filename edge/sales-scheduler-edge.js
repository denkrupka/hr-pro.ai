// Планировщик перезвонов Софии (отдел продаж, лиды) для edge.
// Портирует нюансы Евы (call-scheduler-edge): распознавание времени перезвона, авто-перезвон,
// ретраи при недозвоне, рабочее окно, защита от петель. Само размещение звонка — в worker (placeSalesLeadCall).
import { isWorkingTime, nextWorkingSlot } from './call-scheduler-edge.js';
import { normalizeCfg } from './call-settings-edge.js';
import * as analyzer from './ai-call-analyzer-edge.js';

export const MAX_CALLBACKS = 2;   // сколько раз уважаем просьбу «перезвоните позже» (защита от петли)
const NO_ANSWER = ['no-answer', 'did-not-answer', 'voicemail', 'busy', 'customer-busy', 'no-microphone-permission', 'failed-to-connect', 'did-not-receive-customer-audio', 'twilio-failed'];
// Статусы лида, при которых перезванивать нельзя.
const TERMINAL = ['do_not_call', 'refused', 'registered', 'converted'];

export { isWorkingTime, nextWorkingSlot };

// Конфиг расписания продаж-звонков: из настроек портала (pt.salesCall) или дефолты.
export function salesCfg(pt) { return normalizeCfg((pt && pt.salesCall) || {}); }

export function isTerminal(lead) { return TERMINAL.includes(lead && lead.status); }

// Решение после завершения звонка Софии. Мутирует lead.callSchedule и lead.callActive.
// ctx = { now, cfg, transcript, endedReason, lang, redialed, terminal }. Возвращает {action, at}.
export async function scheduleAfterReport(env, lead, ctx) {
  const now = ctx.now || new Date();
  const cfg = ctx.cfg;
  const sch = lead.callSchedule = lead.callSchedule || { status: 'calling', attempts: 1, callbacks: 0 };
  // Технический обрыв уже перезвонили сразу (wasInterrupted) — ждём отчёт нового звонка.
  if (ctx.redialed) { sch.status = 'calling'; sch.startedAt = now.toISOString(); sch.attempts = (sch.attempts || 1); sch.lastReason = 'техн. обрыв — перезвон'; lead.callActive = true; return { action: 'redial' }; }
  // Терминальный статус лида — прекращаем всякий перезвон.
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
  // Разговор состоялся — не просили ли перезвонить в конкретное время?
  let cb = null;
  if ((sch.callbacks || 0) < MAX_CALLBACKS) {
    try { const d = await analyzer.detectCallback(env, transcript, now.toISOString(), ctx.lang || 'ru'); if (d && d.requested && d.at) { const t = new Date(d.at); if (!isNaN(t) && t > now) cb = t; } } catch (_) {}
  }
  if (cb) {
    // offHoursCallback: 'call' — звоним как есть; 'defer' — переносим на ближайшее рабочее окно.
    if (cfg.offHoursCallback !== 'call' && !isWorkingTime(cfg, cb)) cb = nextWorkingSlot(cfg, cb);
    sch.status = 'pending'; sch.nextAt = cb.toISOString(); sch.attempts = 0; sch.callbacks = (sch.callbacks || 0) + 1;
    sch.lastReason = 'перезвон по просьбе'; lead.callActive = true;
    return { action: 'callback', at: sch.nextAt };
  }
  sch.status = 'done'; sch.lastReason = reason || 'завершён'; lead.callActive = false;
  return { action: 'done' };
}

// Готов ли лид к размещению звонка сейчас (для cron). Мутирует sch.nextAt при переносе за окно.
export function dueForCall(lead, cfg, now) {
  const sch = lead.callSchedule;
  if (!sch || sch.status !== 'pending') return { due: false };
  if (new Date(sch.nextAt) > now) return { due: false };
  if (!isWorkingTime(cfg, now)) { sch.nextAt = nextWorkingSlot(cfg, now).toISOString(); return { due: false, deferred: true }; }
  return { due: true };
}

// Зависший 'calling' без отчёта дольше maxMin — освобождаем лид, чтобы не крутился в cron.
export function releaseIfStuck(lead, now, maxMin) {
  const sch = lead.callSchedule;
  if (!sch || sch.status !== 'calling' || !sch.startedAt) return false;
  if (now.getTime() - new Date(sch.startedAt).getTime() < (maxMin || 20) * 60000) return false;
  sch.status = 'done'; sch.lastReason = 'нет отчёта о звонке (таймаут)'; lead.callActive = false;
  return true;
}
