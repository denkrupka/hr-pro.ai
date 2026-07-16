// Настройки ИИ-звонков (edge): нормализация + наследование. Чистая логика из src/call-scheduler.js.
// Реального размещения звонков на edge пока нет (нужны Vapi-секреты + Cron Worker).
export const DEFAULTS = { agentName: '', companyMission: '', hoursFrom: '10:00', hoursTo: '19:00', days: [1, 2, 3, 4, 5], maxDurationMin: 10, retryAfterMin: 60, retryCount: 3, offHoursCallback: 'defer' };

function clampInt(v, lo, hi, d) { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; }
function hm(s) { const p = String(s || '').split(':'); const h = parseInt(p[0], 10), m = parseInt(p[1], 10); return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0); }
function validTime(s, d) { return /^\d{1,2}:\d{2}$/.test(String(s || '')) ? s : d; }

export function normalizeCfg(a) {
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

// Наследование: своё у вакансии → первое заданное среди вакансий пользователя → дефолты.
export function resolveAiCall(vacancies, ownerId, vac) {
  if (vac && vac.process && vac.process.aiCall) return normalizeCfg(vac.process.aiCall);
  const vs = (vacancies || []).filter(v => v.userId === ownerId)
    .sort((a, b) => ((a.order || 0) - (b.order || 0)) || String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  for (const v of vs) if (v.process && v.process.aiCall) return normalizeCfg(v.process.aiCall);
  return Object.assign({}, DEFAULTS);
}
