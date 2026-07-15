// Реальный ИИ-анализ результатов тестов (Claude). Grounding — на сигналах эвристики
// (вердикт + пункты из scoring), чтобы ИИ формулировал вывод для рекрутёра, но НЕ выдумывал числа.
// Кэш — на записи теста (test.aiAnalysis[lang]), чтобы не дёргать API при каждом открытии карточки.
const MODEL = 'claude-sonnet-4-6';

const TYPE_CTX = {
  result: { ru: 'тест продуктивности (типология Виннер/Дуер/Вейтер — способность создавать конечный продукт должности)', pl: 'test produktywności (typologia Winner/Doer/Waiter)', en: 'productivity test (Winner/Doer/Waiter typology)' },
  tools: { ru: 'тест инструментов мышления (как человек обрабатывает задачи и принимает решения)', pl: 'test narzędzi myślenia', en: 'thinking-tools test' },
  sales: { ru: 'тест на продажи (профиль продавца)', pl: 'test sprzedażowy', en: 'sales aptitude test' },
  knowledge: { ru: 'тест знаний по теме должности', pl: 'test wiedzy', en: 'knowledge test' },
  logic: { ru: 'тест логики (уровень IQ)', pl: 'test logiczny (IQ)', en: 'logic test (IQ)' },
};
const LANG_NAME = { ru: 'русский', pl: 'polski', en: 'English' };

function parseJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const i = t.indexOf('{'), k = t.lastIndexOf('}');
  if (i >= 0 && k > i) t = t.slice(i, k + 1);
  try { return JSON.parse(t); } catch (e) { return null; }
}

async function callClaude(env, system, user, maxTokens) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return null;
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens || 700, system, messages: [{ role: 'user', content: user }] }),
    });
  } catch (e) { return null; }
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  return data && data.content && data.content[0] && data.content[0].text;
}

// Один тест → {verdict, notes[]} (последний пункт — actionable-рекомендация рекрутёру)
async function analyzeOne(env, { type, lang, heuristic, target, vacName }) {
  const ln = LANG_NAME[lang] || 'русский';
  const ctx = (TYPE_CTX[type] && (TYPE_CTX[type][lang] || TYPE_CTX[type].ru)) || type;
  const system = [
    'Ты — ассистент рекрутёра в платформе HR PRO AI (психометрическая оценка кандидатов по методике Виннер/Дуер/Вейтер).',
    'Тебе дают СЫРЫЕ сигналы скоринга по одному тесту кандидата (вердикт эвристики и пункты-факты).',
    'Задача: превратить их в короткий, живой и деловой вывод для рекрутёра — как опытный HR-эксперт, а не как робот.',
    'СТРОГО опирайся только на переданные сигналы: не выдумывай баллы, проценты и факты, которых нет во входных данных.',
    `Верни СТРОГО один JSON без пояснений и markdown: {"verdict":"3-6 слов — суть итога","notes":["4-6 коротких пунктов; последний пункт — конкретная рекомендация рекрутёру, что делать дальше"]}.`,
    `Язык ответа — ${ln}, обращение на «вы», тон профессиональный и уверенный.`,
  ].join(' ');
  const user = `Тип теста: ${ctx}\nЦель вакансии (кого ищем): ${target || 'не задано'}\nВакансия: ${vacName || 'не указана'}\n\nСигналы скоринга:\nВердикт эвристики: ${heuristic.verdict || '—'}\nФакты:\n- ${(heuristic.notes || []).filter(Boolean).join('\n- ') || '—'}\n\nСформулируй вывод для рекрутёра по схеме.`;
  const text = await callClaude(env, system, user, 700);
  const parsed = parseJson(text);
  if (!parsed || !parsed.verdict || !Array.isArray(parsed.notes)) return null;
  return { verdict: String(parsed.verdict).slice(0, 120), notes: parsed.notes.map(n => String(n).slice(0, 300)).slice(0, 6) };
}

// Кэшированный ИИ-хинт для одного теста (для страниц отчёта). heuristic — grounding/fallback.
// Возвращает { hint, dirty } — если dirty=true, запись теста нужно сохранить снаружи.
export async function aiHintForTest(env, { test, type, heuristic, lang, target, vacName }) {
  if (!env.ANTHROPIC_API_KEY || !heuristic || !heuristic.verdict) return { hint: heuristic, dirty: false };
  const AI_TYPES = ['result', 'tools', 'sales', 'knowledge', 'logic'];
  if (!AI_TYPES.includes(type)) return { hint: heuristic, dirty: false };
  const cached = test && test.aiAnalysis && test.aiAnalysis[lang];
  if (cached && cached.verdict) return { hint: { ...heuristic, verdict: cached.verdict, notes: cached.notes, ai: true }, dirty: false };
  const out = await analyzeOne(env, { type, lang, heuristic, target, vacName });
  if (!out) return { hint: heuristic, dirty: false };
  if (test) { test.aiAnalysis = test.aiAnalysis || {}; test.aiAnalysis[lang] = out; }
  return { hint: { ...heuristic, verdict: out.verdict, notes: out.notes, ai: true }, dirty: !!test };
}

// Обогатить stages рабочего процесса реальным ИИ. Мутирует stage.analysis in-place.
// stages: [{key, testId, status, analysis:{verdict,notes,tone}}], tests — записи тестов (для кэша).
// Возвращает Set id тестов, которым обновили кэш (их нужно сохранить в БД снаружи).
export async function enrichWorkflowAI(env, { stages, tests, lang, target, vacName }) {
  if (!env.ANTHROPIC_API_KEY) return new Set();
  const byId = new Map(tests.map(t => [t.id, t]));
  const dirty = new Set();
  const jobs = [];
  for (const st of stages) {
    if (!st || !st.testId || st.status !== 'done' || !st.analysis || !st.analysis.verdict) continue;
    const AI_TYPES = ['result', 'tools', 'sales', 'knowledge', 'logic'];
    const type = st.key === 'result' || st.key === 'tools' || st.key === 'knowledge' ? st.key : (st.key === 'logic' || st.key === 'sales' ? st.key : null);
    if (!AI_TYPES.includes(type)) continue;
    const test = byId.get(st.testId);
    const cached = test && test.aiAnalysis && test.aiAnalysis[lang];
    if (cached && cached.verdict) { st.analysis = { ...st.analysis, verdict: cached.verdict, notes: cached.notes, ai: true }; continue; }
    jobs.push((async () => {
      const out = await analyzeOne(env, { type, lang, heuristic: st.analysis, target, vacName });
      if (!out) return;
      st.analysis = { ...st.analysis, verdict: out.verdict, notes: out.notes, ai: true };
      if (test) { test.aiAnalysis = test.aiAnalysis || {}; test.aiAnalysis[lang] = out; dirty.add(test.id); }
    })());
  }
  await Promise.all(jobs);
  return dirty;
}
