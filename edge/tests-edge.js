// Прохождение тестов и скоринг для edge (Cloudflare Pages).
// Статически импортируем банки вопросов (все языки) и чистые модули скоринга —
// esbuild забандлит их в _worker.js. Динамический require из server.js здесь недоступен.
import oca from '../src/scoring/oca.js';
import sales from '../src/scoring/sales.js';
import * as ai from '../src/ai.js';
import * as air from '../src/ai-recruit.js';
import { localizeResult } from '../src/i18n-content.js';

import RESULT_RU from '../data/result-test.json';
import RESULT_PL from '../data/result-test.pl.json';
import RESULT_EN from '../data/result-test.en.json';
import LOGIC_RU from '../data/logic-test.json';
import LOGIC_PL from '../data/logic-test.pl.json';
import LOGIC_EN from '../data/logic-test.en.json';
import SALES_RU from '../data/sales-test.json';
import SALES_PL from '../data/sales-test.pl.json';
import SALES_EN from '../data/sales-test.en.json';
import OCA_RU from '../data/oca-questions.json';
import OCA_PL from '../data/oca-questions.pl.json';
import OCA_EN from '../data/oca-questions.en.json';

export const TEST_TYPES = {
  tools: { key: 'tools', title: 'Тулс' },
  result: { key: 'result', title: 'Резалт' },
  logic: { key: 'logic', title: 'Логис' },
  sales: { key: 'sales', title: 'Сэйлс' },
};
export function testTitleOf(type) {
  return (TEST_TYPES[type] && TEST_TYPES[type].title) || (type === 'knowledge' ? 'Проверка знаний' : type);
}

const TOOLS_TITLE = { ru: 'Тулс', pl: 'Tools', en: 'Tools' };
const toolsBank = (q, lang) => ({ type: 'tools', title: TOOLS_TITLE[lang] || 'Тулс', questions: q });
const BANKS = {
  result: { ru: RESULT_RU, pl: RESULT_PL, en: RESULT_EN },
  logic: { ru: LOGIC_RU, pl: LOGIC_PL, en: LOGIC_EN },
  sales: { ru: SALES_RU, pl: SALES_PL, en: SALES_EN },
  tools: { ru: toolsBank(OCA_RU, 'ru'), pl: toolsBank(OCA_PL, 'pl'), en: toolsBank(OCA_EN, 'en') },
};

export function testQuestionsFor(type, lang) {
  if (!BANKS[type]) type = 'tools';
  const l = (lang === 'pl' || lang === 'en') ? lang : 'ru';
  return BANKS[type][l] || BANKS[type].ru;
}

function demoFor(p) {
  if (!p) return 'women';
  const age = parseInt(p && p.age, 10);
  const male = /^(м|m|муж|male)/i.test(String((p && p.sex) || ''));
  const teen = age && age >= 14 && age <= 18;
  if (male) return teen ? 'boys' : 'men';
  return teen ? 'girls' : 'women';
}

export function gradeKnowledge(test) {
  const qs = (test.knowledge && test.knowledge.questions) || [];
  let correct = 0;
  const details = qs.map(q => {
    const given = test.answers ? test.answers[q.id] : undefined;
    const correctIdx = q.options.map((o, i) => (o.correct ? i : -1)).filter(i => i >= 0).sort((a, b) => a - b);
    let ok;
    if (q.type === 'multi') {
      const gset = Array.isArray(given) ? given.map(Number).sort((a, b) => a - b) : [];
      ok = gset.length === correctIdx.length && gset.every((v, i) => v === correctIdx[i]);
    } else {
      ok = correctIdx.includes(Number(given));
    }
    if (ok) correct++;
    return { id: q.id, text: q.text, image: q.image || null, ok, given, correctIdx, options: q.options.map(o => o.text) };
  });
  const total = qs.length;
  return { correct, total, percent: total ? Math.round(100 * correct / total) : 0, details };
}

// Скоринг теста. participant нужен для tools (demo-нормировка percentiles).
export function computeResult(test, participant) {
  if (test.type === 'knowledge') return gradeKnowledge(test);
  if (test.type === 'tools') {
    return oca.evaluate(test.answers, { demo: demoFor(participant) });
  }
  if (test.type === 'logic') {
    const lb = testQuestionsFor('logic', test.lang);
    let correct = 0; const total = lb.questions.filter(q => !q.unscored).length;
    const details = lb.questions.map(q => {
      const given = test.answers[q.id];
      const ok = !q.unscored && q.answer != null && Number(given) === q.answer;
      if (ok) correct++;
      return { id: q.id, text: q.text, options: q.options, image: q.image || null,
        optionImages: q.optionImages || null, unscored: !!q.unscored,
        given: given != null ? Number(given) : null, answer: q.answer, correct: ok };
    });
    const percent = Math.round(100 * correct / total);
    const iq = Math.round(75 + correct * (80 / total));
    const level = iq < 80 ? 'Очень низкий' : iq < 100 ? 'Низкий' : iq < 120 ? 'Средний' : iq < 140 ? 'Высокий' : 'Очень высокий';
    const bands = [
      { range: 'До 80 баллов', text: 'Очень низкий уровень интеллекта. Не подходит для руководящих должностей и должностей, требующих применения умственных способностей.' },
      { range: '80–100 баллов', text: 'Низкий уровень интеллекта. Человек с таким интеллектом с трудом оценивает ситуацию и принимает разумные решения. Не подходит для руководящих должностей и решения задач, требующих применения аналитических способностей.' },
      { range: '100–120 баллов', text: 'Средний уровень интеллекта. Человек с таким интеллектом в целом может оценивать ситуации. Этого уровня интеллекта хватит для принятия не очень сложных решений, но такой сотрудник не рекомендован для руководящих должностей.' },
      { range: '120–140 баллов', text: 'Высокий уровень интеллекта. Человек с таким интеллектом способен хорошо оценивать ситуации, принимать решения, которые требуют логического и аналитического мышления. Подходит для руководящих и линейных должностей.' },
      { range: 'от 140 баллов', text: 'Очень высокий уровень интеллекта. Человек с таким интеллектом способен оценивать ситуацию, принимать решения, которые требуют логического и аналитического мышления. Рекомендован на руководящие и любые другие должности.' },
    ];
    return { correct, total, percent, iq, level, bands, details };
  }
  if (test.type === 'sales') {
    return sales.evaluate(test.answers);
  }
  // result — открытые ответы
  const items = testQuestionsFor('result', test.lang).questions.map(q => ({ id: q.id, text: q.text, type: q.type,
    options: q.options || null, answer: test.answers[q.id] != null ? test.answers[q.id] : '',
    timeSec: (test.times || {})[q.id] || 0, stars: (test.ratings || {})[q.id] || 0 }));
  return { items };
}

// ИИ-подсказка к отчёту (эвристика, без внешних вызовов).
export function resultHintFor(test, result, lang) {
  if (test.type === 'result') return ai.resultHint(test, lang);
  if (test.type === 'tools') return ai.toolsHint(result, lang);
  if (test.type === 'sales') return ai.salesHint(result, lang);
  if (test.type === 'logic') return ai.logicHint(result, lang);
  if (test.type === 'knowledge') return air.knowledgeAnalysis(result.correct, result.total, (test.knowledge && test.knowledge.passScore) || 60, lang);
  return null;
}

export { localizeResult, demoFor, ai, air };
