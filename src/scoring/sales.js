'use strict';
// Движок подсчёта теста «Сэйлс» (12 показателей, шкала 0–100).
const { INDICATORS, INTERP } = require('./sales-data');
let POLARITY = {};
try { POLARITY = require('../../data/sales-polarity.json'); } catch (_) { POLARITY = {}; }

// Зоны шкалы 0–100 (как на портале): границы 20/40/60/80.
const ZONES = [
  { min: 0, max: 20, label: 'Очень низкая', band: 'Очень низкий', level: 'low' },
  { min: 20, max: 40, label: 'Низкая', band: 'Низкий', level: 'low' },
  { min: 40, max: 60, label: 'Средняя', band: 'Средний', level: 'mid' },
  { min: 60, max: 80, label: 'Высокая', band: 'Высокий', level: 'high' },
  { min: 80, max: 100.01, label: 'Очень высокая', band: 'Очень высокий', level: 'high' },
];
function zoneFor(v) { for (const z of ZONES) if (v >= z.min && v < z.max) return z; return ZONES[2]; }

// Вопрос id -> показатель (id-1) mod 12 (round-robin, подтверждено экспериментом).
function indicatorIndexOf(qid) { return (qid - 1) % 12; }

// Для каждого показателя строим список его вопросов и полярности,
// приводя число «прямых» (Да -> выше) к p_target = round(V/10),
// чтобы опорные точки (все Да -> V, все Нет -> 100−V) воспроизводились точно.
function buildModel() {
  const perInd = INDICATORS.map((ind, idx) => ({ ...ind, idx, qids: [], polarity: {} }));
  for (let qid = 1; qid <= 120; qid++) perInd[indicatorIndexOf(qid)].qids.push(qid);
  for (const ind of perInd) {
    let pTarget = Math.round(ind.V / 10);
    pTarget = Math.max(0, Math.min(10, pTarget));
    if (pTarget === 5 && ind.V !== 50) pTarget = ind.V > 50 ? 6 : 4; // избегаем деления на ноль, сохраняем знак
    ind.pTarget = pTarget;
    // исходная полярность из семантической разметки
    ind.qids.forEach(qid => { ind.polarity[qid] = (POLARITY[qid] === -1 || POLARITY[qid] === '−1') ? -1 : 1; });
    // привести число (+1) к pTarget, переворачивая вопросы в порядке id
    let plus = ind.qids.filter(q => ind.polarity[q] === 1);
    let minus = ind.qids.filter(q => ind.polarity[q] === -1);
    while (plus.length > pTarget) { const q = plus.pop(); ind.polarity[q] = -1; minus.push(q); }
    while (plus.length < pTarget) { const q = minus.shift(); ind.polarity[q] = 1; plus.push(q); }
  }
  return perInd;
}
const MODEL = buildModel();

// answers: { qid: 0|1|2 }  (0=Да, 1=Иногда, 2=Нет — как на портале: стрелка влево=Да)
// Нормализуем в a: Да=1, Иногда=0.5, Нет=0.
function answerVal(x) {
  const n = Number(x);
  if (n === 0) return 1;      // Да
  if (n === 2) return 0;      // Нет
  return 0.5;                 // Иногда / нет ответа
}

function evaluate(answers) {
  answers = answers || {};
  const points = {};
  let midCount = 0, answered = 0;
  for (let qid = 1; qid <= 120; qid++) {
    const raw = answers[qid];
    if (raw !== undefined && raw !== null && raw !== '') { answered++; if (Number(raw) === 1) midCount++; }
    else midCount++;
  }
  for (const ind of MODEL) {
    // ориентированный ответ o = a (полярность +1) или 1−a (полярность −1); 1 = «высокий полюс»
    let sum = 0;
    for (const qid of ind.qids) {
      const a = answerVal(answers[qid]);
      const o = ind.polarity[qid] === 1 ? a : (1 - a);
      sum += o;
    }
    const rawFrac = sum / ind.qids.length; // 0..1
    const p = ind.pTarget;
    let value;
    if (ind.V === 50) {
      value = Math.round(100 * rawFrac);
    } else {
      const slope = (100 - 2 * ind.V) * 10 / (10 - 2 * p);
      value = Math.round(ind.V + slope * (rawFrac - p / 10));
    }
    value = Math.max(0, Math.min(100, value));
    const z = zoneFor(value);
    points[ind.key] = {
      key: ind.key, name: ind.name, desc: ind.desc,
      value, band: z.band, label: z.label,
      interpretation: (INTERP[ind.key] && INTERP[ind.key][z.level]) || '',
    };
  }
  return { points, order: INDICATORS.map(i => i.key), midCount, answered };
}

module.exports = { evaluate, INDICATORS, ZONES };
