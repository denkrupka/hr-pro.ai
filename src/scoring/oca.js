'use strict';
// Движок подсчёта теста «Тулс» (OCA).
const { POINTS, SCORING, POINT_QUESTIONS, INTERP, SYNDROMES } = require('./oca-data');

let PERCENTILES = null;
try {
  const p = require('../../data/oca-percentiles.json');
  if (p && p.available !== false) PERCENTILES = p;
} catch (_) { /* нет таблиц — используем линейную нормализацию */ }

// Границы зон на шкале -100..100 (как на портале hrscanner):
// [-100,-68] очень низкий, [-68,-32] низкий, [-32,32] средний, [32,68] высокий, [68,100] очень высокий.
const ZONES = [
  { min: -100, max: -68, label: 'Очень низкая', band: 'Очень низкий', level: 4 },
  { min: -68, max: -32, label: 'Низкая', band: 'Низкий', level: 3 },
  { min: -32, max: 32, label: 'Средняя', band: 'Средний', level: 2 },
  { min: 32, max: 68, label: 'Высокая', band: 'Высокий', level: 1 },
  { min: 68, max: 100.01, label: 'Очень высокая', band: 'Очень высокий', level: 1 },
];

// Теоретический минимум/максимум сырого балла по каждой точке (для линейной нормализации).
const RAW_RANGE = {};
for (const key of Object.keys(POINT_QUESTIONS)) {
  let min = 0, max = 0;
  for (const q of POINT_QUESTIONS[key]) {
    const s = SCORING[q];
    min += Math.min(s[0], s[1], s[2]);
    max += Math.max(s[0], s[1], s[2]);
  }
  RAW_RANGE[key] = { min, max };
}

// answers: объект { "1": "+"|"M"|"-", ... } для вопросов 1..200
function scoreAnswer(ans) { // "-" -> idx0, "M" -> idx1, "+" -> idx2
  if (ans === '+') return 2;
  if (ans === '-') return 0;
  return 1; // M / пусто
}

function rawScore(key, answers) {
  let sum = 0;
  for (const q of POINT_QUESTIONS[key]) {
    const s = SCORING[q];
    sum += s[scoreAnswer(answers[q])];
  }
  return sum;
}

// Перевод сырого балла в значение -100..+100.
function rawToPercent(key, raw, demo) {
  if (PERCENTILES && demo && PERCENTILES[demo] && PERCENTILES[demo][key]) {
    const t = PERCENTILES[demo][key];
    const exact = (arr) => arr && arr.find(r => r[0] === raw);
    const closest = (arr) => {
      if (!arr || !arr.length) return null;
      let best = arr[0];
      for (const row of arr) if (Math.abs(row[0] - raw) < Math.abs(best[0] - raw)) best = row;
      return best;
    };
    const ep = exact(t.plus), em = exact(t.minus);
    if (ep) return ep[1];
    if (em) return -em[1];
    // нет точного совпадения — берём ближайшую строку из обеих половин
    const cp = closest(t.plus), cm = closest(t.minus);
    const cands = [];
    if (cp) cands.push({ v: cp[1], d: Math.abs(cp[0] - raw) });
    if (cm) cands.push({ v: -cm[1], d: Math.abs(cm[0] - raw) });
    if (cands.length) { cands.sort((a, b) => a.d - b.d); return cands[0].v; }
  }
  // линейная нормализация
  const { min, max } = RAW_RANGE[key];
  const pct = -100 + 200 * (raw - min) / (max - min || 1);
  return Math.round(Math.max(-100, Math.min(100, pct)));
}

function zoneFor(value) {
  for (const z of ZONES) if (value >= z.min && value < z.max) return z;
  return ZONES[2];
}

// уровень интерпретации 1..4 по значению
function interpLevel(value) {
  if (value >= 32) return 1;      // высокий/очень высокий
  if (value >= -20) return 2;     // средний
  if (value >= -60) return 3;     // низкий
  return 4;                       // очень низкий
}

function detectCheating(answers, points) {
  // 1) слишком много «М» (неопределённых) ответов
  let mCount = 0, answered = 0;
  for (let q = 1; q <= 200; q++) {
    const a = answers[q];
    if (a === '+' || a === '-' || a === 'M') answered++;
    if (a === 'M' || a === undefined) mCount++;
  }
  const flags = [];
  // «случайный график» — детектор недостоверного заполнения из документа-инструкции.
  // Числовые границы матрицы взяты дословно из методики OCA (013sposobnosti.doc).
  const V = k => points[k].value;
  const inRandomMatrix =
    V('A') >= -95 && V('A') <= -38 &&
    V('B') >= -100 && V('B') <= -65 &&
    V('C') >= -96 && V('C') <= -63 &&
    V('D') >= -83 && V('D') <= 35 &&
    V('E') >= 3 && V('E') <= 45 &&
    V('F') >= 22 && V('F') <= 72 &&
    V('G') >= -92 && V('G') <= -55 &&
    V('H') >= -98 && V('H') <= -35 &&
    V('I') >= -90 && V('I') <= 18 &&
    V('J') >= -72 && V('J') <= 22;
  if (inRandomMatrix) flags.push('График попадает в матрицу «случайного графика» — тест мог быть заполнен наугад, результат недостоверен');
  return { mCount, answered, cheating: flags.length > 0, flags };
}

function evaluate(answers, opts = {}) {
  answers = answers || {};
  const demo = opts.demo || null; // 'women'|'men'|'boys'|'girls'
  const points = {};
  for (const p of POINTS) {
    const raw = rawScore(p.key, answers);
    const value = rawToPercent(p.key, raw, demo);
    const z = zoneFor(value);
    const lvl = interpLevel(value);
    points[p.key] = {
      key: p.key, name: p.name, low: p.low, high: p.high,
      raw, value, band: z.band, label: z.label, level: lvl,
      interpretation: INTERP[p.key][lvl],
    };
  }
  // Маники (нестабильность): Q22«+»→E, Q197«+»→B
  const manics = [];
  if (answers[22] === '+') { points.E.manic = true; manics.push({ key: 'E', text: 'Маник по активности (E): уровень активности нестабилен — периоды активности сменяются пассивностью.' }); }
  if (answers[197] === '+') { points.B.manic = true; manics.push({ key: 'B', text: 'Маник по счастью (B): уровень настроения нестабилен — периоды подъёма сменяются подавленностью.' }); }

  const values = {};
  for (const k of Object.keys(points)) values[k] = points[k].value;
  const syndromes = SYNDROMES.filter(s => { try { return s.cond(values); } catch (_) { return false; } })
    .map(s => ({ id: s.id, title: s.title, text: s.text }));

  const cheat = detectCheating(answers, points);

  return {
    points, order: POINTS.map(p => p.key),
    manics, syndromes,
    mAnswers: cheat.mCount, cheating: cheat.cheating, cheatingFlags: cheat.flags,
  };
}

module.exports = { evaluate, POINTS, ZONES };
