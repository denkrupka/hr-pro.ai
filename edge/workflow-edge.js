// Движок воронки найма для edge: этапы кандидата, ИИ-анализ, авторешение, канбан.
// Портирован из server.js buildWorkflow, но данные (вакансия, тесты) передаются извне
// (в edge нет глобального db()).
import * as recruit from '../src/recruitment.js';
import * as ai from '../src/ai.js';
import * as air from '../src/ai-recruit.js';
import { computeResult, gradeKnowledge, localizeResult } from './tests-edge.js';
import { REF_LABELS } from '../src/ai-call-prompts.js';

// Метки собранных ИИ-звонком ответов (для кнопки «Смотреть результат»)
const AICALL_LABELS = {
  afterResult: {
    ru: { q1_answer: 'Что важно в работе/компании', q2_answer: 'Почему откликнулся и что знает', q3_answer: 'Критерии при равной зарплате', q4_answer: 'Что откликнулось в миссии', q5_questions: 'Вопросы кандидата' },
    pl: { q1_answer: 'Co ważne w pracy/firmie', q2_answer: 'Dlaczego aplikował i co wie', q3_answer: 'Kryteria przy równej płacy', q4_answer: 'Co poruszyło w misji', q5_questions: 'Pytania kandydata' },
    en: { q1_answer: 'What matters in job/company', q2_answer: 'Why applied and what knows', q3_answer: 'Criteria at equal pay', q4_answer: 'What resonated in mission', q5_questions: 'Candidate questions' },
  },
  references: { ru: REF_LABELS, pl: REF_LABELS, en: REF_LABELS },
};

const OPT_TITLE = {
  logic: { ru: 'Тест на логику (Логис)', pl: 'Test logiki (Logic)', en: 'Logic test (Logic)' },
  sales: { ru: 'Тест на продажи (Sales)', pl: 'Test sprzedaży (Sales)', en: 'Sales test (Sales)' },
};

export function knowledgeTestsOf(v) {
  if (!Array.isArray(v.knowledgeTests)) v.knowledgeTests = [];
  if (!v.knowledgeTests.length && v.knowledge && Array.isArray(v.knowledge.questions) && v.knowledge.questions.length) {
    v.knowledgeTests.push({ id: Math.random().toString(36).slice(2, 10), name: 'Тест 1', questions: v.knowledge.questions, passScore: v.knowledge.passScore || 60 });
  }
  return v.knowledgeTests;
}

export function processOf(v) {
  const def = { auto: false, linkDays: 3,
    order: ['result', 'motivation', 'tools', 'logic', 'sales', 'knowledge'],
    stages: { result: true, references: true, tools: true, motivation: true, knowledge: true },
    optional: { logic: false, sales: false },
    aiCalls: { first: false, afterResult: false, afterTools: false, motivation: false, references: false },
    critical: { result: true, references: true, tools: true, motivation: false, knowledge: false } };
  if (!v.process || typeof v.process !== 'object') v.process = {};
  v.process.stages = Object.assign({}, def.stages, v.process.stages || {});
  v.process.optional = Object.assign({}, def.optional, v.process.optional || {});
  v.process.aiCalls = Object.assign({}, def.aiCalls, v.process.aiCalls || {});
  v.process.critical = Object.assign({}, def.critical, v.process.critical || {});
  if (typeof v.process.auto !== 'boolean') v.process.auto = false;
  if (!Number.isFinite(v.process.linkDays)) v.process.linkDays = def.linkDays;
  if (!Array.isArray(v.process.order) || v.process.order.slice().sort().join() !== def.order.slice().sort().join())
    v.process.order = def.order.slice();
  return v.process;
}

export function vacFull(v) {
  return { id: v.id, name: v.name, lang: v.lang, sectionId: v.sectionId || null,
    requisitionId: v.requisitionId || null, adText: v.adText || '', adMode: v.adMode || 'manual',
    published: !!v.published, workflow: Array.isArray(v.workflow) ? v.workflow : recruit.STAGE_KEYS.slice(),
    knowledge: v.knowledge || { questions: [], passScore: 60 },
    knowledgeTests: knowledgeTestsOf(v),
    process: processOf(v),
    motivationQuestions: Array.isArray(v.motivationQuestions) ? v.motivationQuestions : [] };
}

export const KANBAN_COLS = ['new', ...recruit.STAGE_KEYS, 'hired', 'rejected'];

export function kanbanColTitle(key, lang) {
  const M = { new: { ru: 'Новые', pl: 'Nowi', en: 'New' }, hired: { ru: 'Найм', pl: 'Zatrudnienie', en: 'Hired' }, rejected: { ru: 'Отказ', pl: 'Odmowa', en: 'Rejected' } };
  key = String(key || '');
  if (M[key]) return M[key][lang] || M[key].ru;
  if (key.startsWith('opt:')) { const o = OPT_TITLE[key.slice(4)]; if (o) return o[lang] || o.ru; }
  if (key.startsWith('knowledge:')) return recruit.stageTitle('knowledge', lang);
  return recruit.stageTitle(key, lang);
}

// Построить состояние workflow кандидата. vac — вакансия кандидата (или null), tests — его тесты.
export function buildWorkflow(p, lang, vac, tests) {
  const proc = vac ? processOf(vac) : null;
  const cfgStages = recruit.STAGE_KEYS.filter(k => !proc || proc.stages[k] !== false);
  const wf = p.workflow || {};
  const gates = wf.gates || {};
  const skipped = wf.skipped || {};
  const myTests = (tests || []).filter(t => t.participantId === p.id);
  const stages = cfgStages.map(key => {
    const st = { key, title: recruit.stageTitle(key, lang), kind: (recruit.WORKFLOW_STAGES.find(s => s.key === key) || {}).kind, skipped: !!skipped[key] };
    if (key === 'knowledge' && vac && knowledgeTestsOf(vac).length > 1) {
      const kts = knowledgeTestsOf(vac);
      const kTests = myTests.filter(x => x.type === 'knowledge').sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
      st.items = kts.map((kt, i) => {
        const t = kTests.find(x => (x.knowledge && x.knowledge.ktId) === kt.id) || (i === 0 ? kTests.find(x => !(x.knowledge && x.knowledge.ktId)) : null);
        const item = { ktId: kt.id, name: kt.name, status: t ? t.status : 'none', testId: t ? t.id : null, testCode: t ? t.code : null };
        if (t && t.status === 'done') { const gr = gradeKnowledge(t); item.percent = gr.percent; item.pass = gr.percent >= (kt.passScore || 60); }
        return item;
      });
      st.status = st.items.every(i => i.status === 'done') ? 'done' : st.items.some(i => i.status !== 'none') ? 'sent' : 'none';
      if (st.status === 'done') {
        st.suggested = st.items.every(i => i.pass === true);
        st.analysis = { verdict: st.suggested ? 'Знания подтверждены' : 'Знаний недостаточно', tone: st.suggested ? 'good' : 'low',
          notes: st.items.map(i => `${i.name}: ${i.percent}% — ${i.pass ? 'сдан' : 'не сдан'}`) };
      }
      st.passed = gates[key] !== undefined ? gates[key] : (st.status === 'done' ? st.suggested : null);
      return st;
    }
    if (key === 'result' || key === 'tools' || key === 'knowledge') {
      const t = myTests.filter(x => x.type === key).sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
      st.testId = t ? t.id : null; st.testCode = t ? t.code : null; st.status = t ? t.status : 'none';
      if (t && t.status === 'done') {
        if (key === 'knowledge') {
          const gr = gradeKnowledge(t);
          st.analysis = air.knowledgeAnalysis(gr.correct, gr.total, (t.knowledge && t.knowledge.passScore) || 60, lang);
          st.suggested = gr.percent >= ((t.knowledge && t.knowledge.passScore) || 60);
        } else if (key === 'result') {
          const h = ai.resultHint(t, lang); st.analysis = { verdict: h.verdict, notes: h.notes, tone: h.tone };
          st.suggested = h.category !== 'Вейтер';
        } else {
          const r = localizeResult(computeResult(t), 'tools', lang); const h = ai.toolsHint(r, lang);
          st.analysis = { verdict: h.verdict, notes: h.notes }; st.suggested = true;
        }
      }
      st.passed = gates[key] !== undefined ? gates[key] : (st.status === 'done' ? st.suggested : null);
    } else if (key === 'motivation') {
      const mo = wf.motivation;
      st.done = !!(mo && mo.level); st.level = mo ? mo.level : null;
      if (mo && mo.level) { st.analysis = air.motivationAnalysis(mo.level, lang); st.suggested = (recruit.MOTIVATION_LEVELS.find(x => x.key === mo.level) || {}).score >= 2; }
      const am = wf.aiMotivation;
      if (am && am.answers && Object.keys(am.answers).some(k => (am.answers[k] || '').trim())) {
        const labels = AICALL_LABELS.afterResult[lang] || AICALL_LABELS.afterResult.ru;
        st.aiResult = { summary: am.summary || '', at: am.at || null, attempts: am.attempts || 1,
          answers: Object.entries(am.answers).filter(([, v]) => (v || '').trim()).map(([k, v]) => ({ label: labels[k] || k, value: v })) };
      }
      st.passed = gates[key] !== undefined ? gates[key] : (st.done ? st.suggested : null);
    } else if (key === 'references') {
      const rf = wf.references || {};
      st.aiCall = !!(proc && proc.aiCalls && proc.aiCalls.references);   // тумблер ИИ-референсов (Vapi проверяется на сервере при звонке)
      const doneResult = myTests.filter(x => x.type === 'result' && x.status === 'done').sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
      let contacts = [];
      const raw = doneResult && doneResult.answers && (doneResult.answers['13'] != null ? doneResult.answers['13'] : doneResult.answers[13]);
      if (Array.isArray(raw)) contacts = raw.filter(c => c && (c.name || c.surname || c.phone));
      const multi = rf.multi || {};
      if (contacts.length) {
        st.refs = contacts.map((c, i) => {
          const mi = multi[i] || {};
          const aiDone = !!(mi.aiCall && mi.aiCall.status === 'done');
          const filled = !!(mi.answers && Object.keys(mi.answers).length);
          const r = { i, contact: c, done: filled || aiDone, phone: c.phone || '', aiStatus: (mi.aiCall && mi.aiCall.status) || null };
          if (aiDone) { r.verdict = (mi.aiCall.summary || 'Референс собран ИИ').slice(0, 200); r.tone = 'good'; }
          else if (filled) { const an = air.referencesAnalysis(mi.answers, lang); r.verdict = an.verdict; r.tone = an.tone; }
          if (mi.answers && Object.keys(mi.answers).some(k => (mi.answers[k] || '').toString().trim())) {
            const labels = AICALL_LABELS.references[lang] || AICALL_LABELS.references.ru;
            r.aiResult = { summary: (mi.aiCall && mi.aiCall.summary) || '', by: aiDone ? 'ai' : 'manual',
              answers: Object.entries(mi.answers).filter(([, v]) => (v || '').toString().trim()).map(([k, v]) => ({ label: labels[k] || k, value: String(v) })) };
          }
          return r;
        });
        st.done = st.refs.every(r => r.done);
        const filled = st.refs.filter(r => r.done);
        if (filled.length) {
          st.suggested = !filled.some(r => r.tone === 'low');
          st.analysis = { verdict: filled.map(r => r.verdict).join(' · '), tone: st.suggested ? 'good' : 'low',
            notes: st.refs.map(r => `${((r.contact.name || '') + ' ' + (r.contact.surname || '')).trim()}${r.contact.position ? ' (' + r.contact.position + ')' : ''}: ${r.done ? r.verdict : '—'}`) };
        }
        st.passed = gates[key] !== undefined ? gates[key] : (st.done ? (st.suggested !== false) : null);
      } else {
        st.done = !!(rf.answers && Object.keys(rf.answers).length);
        if (st.done) st.analysis = air.referencesAnalysis(rf.answers, lang);
        st.passed = gates[key] !== undefined ? gates[key] : (st.done ? (st.analysis && st.analysis.tone !== 'low') : null);
      }
    }
    return st;
  });
  let decision = wf.decision || null;
  const gateState = {}; stages.forEach(s => { gateState[s.key] = { passed: s.passed, status: s.status || (s.done ? 'done' : 'none') }; });
  const critical = proc ? proc.critical : null;
  const isCrit = k => !critical || critical[k] !== false;
  const auto = air.workflowDecision(gateState, cfgStages.filter(k => !skipped[k]), lang, critical);
  if (!decision && auto.decision === 'rejected') decision = 'rejected';
  const optional = ['logic', 'sales'].filter(key => (proc && proc.optional[key]) || myTests.some(t => t.type === key) || !vac).map(key => {
    const t = myTests.filter(x => x.type === key).sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
    const o = { key, title: OPT_TITLE[key][lang] || OPT_TITLE[key].ru, status: t ? t.status : 'none', testId: t ? t.id : null, testCode: t ? t.code : null, skipped: !!skipped['opt:' + key] };
    if (t && t.status === 'done') {
      const r = localizeResult(computeResult(t), key, lang);
      if (key === 'logic') o.analysis = { verdict: 'IQ ' + r.iq + ' · ' + r.level, notes: [] };
      else { const h = ai.salesHint(r, lang); o.analysis = { verdict: h.verdict, notes: h.notes }; }
    }
    return o;
  });
  let column;
  if (wf.column) column = wf.column;
  else if (decision === 'hired') column = 'hired';
  else if (decision === 'rejected' || stages.some(s => s.passed === false && !s.skipped && isCrit(s.key))) column = 'rejected';
  else {
    const firstUndone = stages.find(s => !s.skipped && s.passed !== true && !(s.passed === false && !isCrit(s.key)));
    const anyActivity = stages.some(s => (s.status && s.status !== 'none') || s.done);
    column = !firstUndone ? 'hired' : (!anyActivity ? 'new' : firstUndone.key);
  }
  const resolved = s => s.skipped || s.passed === true || s.passed === false || s.done || s.status === 'done';
  const finalReady = stages.length > 0 && stages.every(resolved) && stages.some(s => !s.skipped && s.analysis);
  const finalAnalysis = (wf && wf.finalAnalysis) || null;
  return { stages, decision, autoDecision: auto, column, optional, finalReady, finalAnalysis };
}

// Сборка канбан-доски вакансии.
export function buildBoard(v, parts, tests, lang) {
  const kts = knowledgeTestsOf(v);
  const multiKn = kts.length > 1;
  const proc = processOf(v);
  const partIds = new Set(parts.map(p => p.id));
  const hasOpt = key => proc.optional[key] || tests.some(t => partIds.has(t.participantId) && t.type === key);
  let colKeys = KANBAN_COLS.filter(k => !recruit.STAGE_KEYS.includes(k) || proc.stages[k] !== false);
  if (multiKn) colKeys = colKeys.flatMap(k => k === 'knowledge' ? kts.map(kt => 'knowledge:' + kt.id) : [k]);
  const optCols = ['logic', 'sales'].filter(hasOpt).map(k => 'opt:' + k);
  if (optCols.length && colKeys.includes('tools')) colKeys.splice(colKeys.indexOf('tools') + 1, 0, ...optCols);
  const cards = parts.map(p => {
    const wf = buildWorkflow(p, lang, v, tests);
    const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email;
    let column = wf.column;
    if (multiKn && column === 'knowledge') {
      const st = wf.stages.find(s => s.key === 'knowledge');
      const items = (st && st.items) || [];
      const it = items.find(x => !(x.status === 'done' && x.pass)) || items[items.length - 1];
      if (it) column = 'knowledge:' + it.ktId;
    }
    if (column === 'hired' && !wf.decision) {
      const pend = (wf.optional || []).find(o => !o.skipped && o.status !== 'none' && o.status !== 'done' && colKeys.includes('opt:' + o.key));
      if (pend) column = 'opt:' + pend.key;
    }
    if (!colKeys.includes(column)) column = column.startsWith('knowledge') ? (multiKn ? 'knowledge:' + kts[0].id : 'knowledge') : column.startsWith('opt:') ? 'tools' : 'new';
    return { id: p.id, name: nm, email: p.email, tel: p.tel || '', city: p.city || '', cv: p.cv || null,
      column, decision: wf.decision,
      stages: wf.stages.map(s => ({ key: s.key, title: s.title, status: s.status || (s.done ? 'done' : 'none'), passed: s.passed })) };
  });
  const passedCount = key => cards.filter(c => (c.stages.find(s => s.key === key) || {}).passed === true).length;
  const FOUND_LBL = { ru: 'Найдено', pl: 'Znalezieni', en: 'Found' };
  const funnel = [
    { key: 'found', label: FOUND_LBL[lang] || FOUND_LBL.ru, count: cards.length },
    ...recruit.STAGE_KEYS.filter(k => proc.stages[k] !== false).map(k => ({ key: k, label: recruit.stageTitle(k, lang), count: passedCount(k) })),
    { key: 'hired', label: kanbanColTitle('hired', lang), count: cards.filter(c => c.column === 'hired').length },
  ];
  const columns = colKeys.map(key => ({ key,
    title: key.startsWith('knowledge:') ? ((kts.find(kt => 'knowledge:' + kt.id === key) || {}).name || kanbanColTitle('knowledge', lang)) : kanbanColTitle(key, lang) }));
  return { vacancy: vacFull(v), cards, funnel, columns };
}

export { recruit, ai, air, OPT_TITLE };
