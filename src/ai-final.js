'use strict';
// Итоговый ИИ-анализ кандидата: собирает анализы всех пройденных этапов найма + заявку + объявление
// и даёт взвешенное заключение, подходит ли кандидат на должность (для плашки «Итоговое решение»).
const fs = require('fs');
const path = require('path');

const MODEL = 'claude-opus-4-8';   // итоговое кадровое решение — сильная модель

function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try { const c = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integrations.config.json'), 'utf8')); if (c.anthropic && c.anthropic.apiKey) return c.anthropic.apiKey; } catch (_) {}
  return null;
}
async function callClaude(system, user, maxTokens) {
  const key = getApiKey();
  if (!key) throw new Error('ANTHROPIC_API_KEY не задан');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens || 2000, system, messages: [{ role: 'user', content: user }] }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error('Anthropic: ' + ((d.error && d.error.message) || r.status));
  return (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}
function parseJson(t) {
  let s = String(t || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const i = s.indexOf('{'), k = s.lastIndexOf('}');
  if (i >= 0 && k > i) s = s.slice(i, k + 1);
  try { return JSON.parse(s); } catch (_) { return null; }
}

const LANGLINE = { ru: 'русском', pl: 'польском (polski)', en: 'английском (English)' };

// Собрать текстовый дайджест этапов с их анализами.
function stagesDigest(stages) {
  return (stages || []).filter(s => s && !s.skipped).map(s => {
    const a = s.analysis || {};
    const verdict = a.verdict ? String(a.verdict) : '';
    const notes = Array.isArray(a.notes) && a.notes.length ? '\n   ' + a.notes.map(n => '- ' + n).join('\n   ') : '';
    const passed = s.passed === true ? 'пройден' : s.passed === false ? 'НЕ пройден' : (s.done || s.status === 'done') ? 'завершён' : 'нет данных';
    return `• ${s.title} [${passed}]${verdict ? ': ' + verdict : ''}${notes}`;
  }).join('\n');
}

// Главный вызов: заключение по кандидату. Возвращает {verdict, fit_score, headline, summary, strengths[], concerns[], recommendation}.
async function finalAssessment(ctx) {
  const lang = ['ru', 'pl', 'en'].includes(ctx.lang) ? ctx.lang : 'ru';
  const f = ctx.form || {};
  const reqLines = [
    f.position ? 'Должность: ' + f.position : '',
    f.product ? 'Ожидаемый продукт/результат: ' + f.product : '',
    f.responsibilities ? 'Обязанности: ' + f.responsibilities : '',
    f.requirements ? 'Требования: ' + f.requirements : '',
    f.education ? 'Образование: ' + f.education : '',
    f.experience ? 'Опыт: ' + f.experience : '',
    f.salary ? 'Оплата: ' + f.salary : '',
    (Array.isArray(f.traits) ? f.traits.join(', ') : f.traits) ? 'Желаемые качества: ' + (Array.isArray(f.traits) ? f.traits.join(', ') : f.traits) : '',
  ].filter(Boolean).join('\n');

  const cand = ctx.candidate || {};
  const candLine = [cand.name, cand.surname].filter(Boolean).join(' ') + (cand.age ? ', ' + cand.age + ' лет' : '') + (cand.city ? ', ' + cand.city : '');

  const auto = ctx.autoDecision || {};
  const autoLine = auto.decision ? `Авто-рекомендация системы по методике: ${auto.decision === 'hired' ? 'скорее нанять' : auto.decision === 'rejected' ? 'скорее отказать' : 'в процессе'}${auto.verdict ? ' (' + auto.verdict + ')' : ''}.` : '';

  const digest = stagesDigest(ctx.stages) + (ctx.optional && ctx.optional.length ? '\n' + stagesDigest(ctx.optional) : '');

  const system = `Ты — старший специалист по подбору персонала, работающий по методике HR PRO AI (ключевое — продуктивность и личностные качества кандидата, затем мотивация и референсы). Тебе дают полную картину: требования должности (заявка), текст объявления и результаты всех пройденных этапов оценки с их анализами. Дай ВЗВЕШЕННОЕ итоговое заключение — подходит ли кандидат на ЭТУ должность.
Пиши на ${LANGLINE[lang]} языке. Опирайся ТОЛЬКО на предоставленные данные, не выдумывай фактов. Если данных по этапу нет — учитывай это как неопределённость, а не как минус.
Приоритет: продуктивность («Резалт») и личностные качества («Тулс») — важнее всего; мотивация, знания и референсы — подтверждают или настораживают. Критично не пройденные этапы — сильный повод для отказа.
Верни СТРОГО JSON без пояснений:
{"verdict":"hire"|"consider"|"reject","fit_score":0-100,"headline":"вывод одной короткой фразой","summary":"3-5 предложений обоснования","strengths":["сильные стороны кандидата под эту должность"],"concerns":["риски и слабые места"],"recommendation":"что рекомендуешь рекрутёру сделать"}`;

  const user = `ДОЛЖНОСТЬ И ТРЕБОВАНИЯ (заявка):
${reqLines || '— не заполнено'}

ОБЪЯВЛЕНИЕ О ВАКАНСИИ:
${(ctx.ad || '').trim().slice(0, 6000) || '— нет текста'}

КАНДИДАТ: ${candLine || '—'}

РЕЗУЛЬТАТЫ ЭТАПОВ ОЦЕНКИ (с анализами ИИ по каждому):
${digest || '— этапы не пройдены'}

${autoLine}

Дай итоговое заключение по форме.`;

  const out = await callClaude(system, user, 3200);
  const j = parseJson(out) || {};
  const verdict = ['hire', 'consider', 'reject'].includes(j.verdict) ? j.verdict : 'consider';
  return {
    verdict,
    fit_score: Math.max(0, Math.min(100, parseInt(j.fit_score, 10) || 0)),
    headline: String(j.headline || '').slice(0, 300),
    summary: String(j.summary || '').slice(0, 2000),
    strengths: Array.isArray(j.strengths) ? j.strengths.slice(0, 8).map(String) : [],
    concerns: Array.isArray(j.concerns) ? j.concerns.slice(0, 8).map(String) : [],
    recommendation: String(j.recommendation || '').slice(0, 800),
  };
}

module.exports = { finalAssessment, MODEL };
