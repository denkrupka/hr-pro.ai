'use strict';
// Анализ ИИ-звонков через Claude: завершён/прерван, докручивающий перезвон, агрегация ответов по этапу.
// Транскрипт берём из Vapi (getCall), анализ и извлечение — Claude (надёжнее structuredData Vapi).
const fs = require('fs');
const path = require('path');

const MODEL = 'claude-sonnet-4-6';   // анализ/извлечение — быстрый и дешёвый

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
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens || 900, system, messages: [{ role: 'user', content: user }] }),
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

// Что должно быть покрыто в звонке — по типу этапа (для анализа завершённости).
const GOALS = {
  first: 'Пригласить кандидата заполнить вступительную анкету и попросить сделать это сегодня.',
  afterResult: 'Задать и получить ответы на 5 вопросов о мотивации (1 что важно в работе/компании; 2 почему откликнулся и что знает о компании; 3 критерии при равной зарплате; 4 что откликнулось в миссии; 5 вопросы кандидата) и пригласить пройти второй тест.',
  afterTools: 'Поблагодарить за прохождение заключительного теста и сообщить, что дальше свяжется рекрутёр.',
  references: 'Получить ответы бывшего руководителя на 17 вопросов о кандидате (отношения, продукт и объём, обязанности, эффективность, реальные результаты, знания, отсутствия, работа с коллегами, руководство, документы, доверие задачи, повторный найм, справится ли, сильные стороны, что улучшить, оценка 1–10, дополнение).',
};

// 1) Завершён ли звонок или прервался. Вернёт {complete, covered[], remaining[], reason}.
async function analyzeCompleteness(transcript, kind, endedReason) {
  if (!transcript || transcript.trim().length < 20) {
    return { complete: false, covered: [], remaining: ['весь разговор'], reason: 'нет содержательного транскрипта (звонок не состоялся/не подняли)' };
  }
  const goal = GOALS[kind] || 'Провести разговор по сценарию и получить ответы.';
  const system = `Ты анализируешь расшифровку телефонного разговора ИИ-ассистента. Определи, ДОВЕДЁН ЛИ разговор до конца или ПРЕРВАЛСЯ (собеседник бросил трубку, замолчал, не договорили, не получили ответ на часть вопросов, техпроблема).
Цель звонка: ${goal}
Служебная причина завершения (от телефонии, для контекста): ${endedReason || 'неизвестна'}.
Верни СТРОГО JSON без пояснений: {"complete": true|false, "covered": ["коротко что уже обсудили/на что ответили"], "remaining": ["что осталось задать/узнать, если прервалось; пусто если complete"], "reason": "1 фраза почему complete или где/почему прервалось"}.
complete=true только если пройдены все ключевые пункты цели и разговор корректно завершён.`;
  const out = await callClaude(system, 'Расшифровка разговора:\n\n' + transcript, 700);
  const j = parseJson(out);
  if (!j || typeof j.complete !== 'boolean') return { complete: false, covered: [], remaining: ['уточнить'], reason: 'не удалось разобрать анализ' };
  return { complete: !!j.complete, covered: j.covered || [], remaining: j.remaining || [], reason: j.reason || '' };
}

// 2) Промт-«докрутка» для повторного звонка: что уже обсудили + где прервалось + что осталось.
// basePrompt — исходный системный промт этапа (со всеми вопросами); analysis — из analyzeCompleteness.
function continuationTask(basePrompt, analysis, vars) {
  const covered = (analysis.covered || []).map(c => '• ' + c).join('\n') || '—';
  const remaining = (analysis.remaining || []).map(c => '• ' + c).join('\n') || '—';
  const name = vars.candidate || vars.supervisor || '';
  return `ЭТО ПОВТОРНЫЙ ЗВОНОК: предыдущий разговор прервался (${analysis.reason || 'обрыв'}). Ты продолжаешь его с того же человека${name ? ' (' + name + ')' : ''}.
Начни с короткого извинения за обрыв связи: «Прошу прощения, наш прошлый разговор прервался. Можем продолжить?» — дождись согласия.
УЖЕ ОБСУДИЛИ (не спрашивай это повторно):
${covered}
ОСТАЛОСЬ ЗАДАТЬ/УЗНАТЬ (пройди именно это, по одному, благодаря после каждого ответа):
${remaining}
Дальше действуй по общему сценарию ниже, но не повторяй уже пройденное.\n\n` + basePrompt;
}
function continuationFirst(kind, lang, vars) {
  const L = { ru: 'Здравствуйте! Это снова ' + (vars.agent_name || 'Ева') + ' из ' + (vars.company || '') + '. Наш прошлый разговор прервался — можем продолжить?',
    pl: 'Dzień dobry! Znów ' + (vars.agent_name || 'Ewa') + ' z ' + (vars.company || '') + '. Nasza poprzednia rozmowa się urwała — możemy kontynuować?',
    en: 'Hello! It’s ' + (vars.agent_name || 'Eva') + ' from ' + (vars.company || '') + ' again. Our previous call dropped — may we continue?' };
  return L[lang] || L.ru;
}

// 3) Итоговое извлечение ответов по этапу из ВСЕХ попыток (склеенные транскрипты).
// kind: 'afterResult' (мотивация) | 'references'. Возвращает {answers, summary}.
async function extractAnswers(transcripts, kind, extra) {
  const joined = (transcripts || []).filter(Boolean).map((t, i) => `=== ПОПЫТКА ${i + 1} ===\n${t}`).join('\n\n');
  if (!joined.trim()) return { answers: {}, summary: '' };
  let schemaHint, sumHint;
  if (kind === 'references') {
    schemaHint = `{"q1_relationship":"","q2_product_and_volume":"","q3_duties":"","q4_effectiveness":"","q5_real_results":"","q6_professional_knowledge":"","q7_absences":"","q8_cooperation":"","q9_leadership":"","q10_paperwork":"","q11_entrust_task":"","q12_rehire":"","q13_will_handle":"","q14_strengths":"","q15_to_improve":"","q16_rating_1_10":"","q17_additional":"","additional_reference":"","summary":"3-5 предложений: продукт/объём, реальные результаты, сильные стороны и риски, кем приходится, оценка 1-10"}`;
    sumHint = 'референс бывшего руководителя (17 вопросов)';
  } else {
    schemaHint = `{"q1_answer":"что важно при выборе работы/компании","q2_answer":"почему откликнулся и что знает о компании","q3_answer":"критерии при равной зарплате","q4_answer":"что откликнулось в миссии","q5_questions":"вопросы кандидата","callback_time":"если просил перезвонить — когда","summary":"3-4 предложения по мотивации, только по сказанному"}`;
    sumHint = 'ответы кандидата о мотивации';
  }
  const system = `Извлеки из расшифровок телефонного разговора (${sumHint}) ответы и верни СТРОГО JSON по форме: ${schemaHint}. Бери только реально сказанное собеседником; если на пункт не ответили — оставь пустую строку. Ничего не выдумывай и не оценивай.`;
  const out = await callClaude(system, 'Расшифровки (все попытки одного этапа):\n\n' + joined, 1400);
  const j = parseJson(out) || {};
  const summary = j.summary || '';
  delete j.summary;
  return { answers: j, summary };
}

module.exports = { analyzeCompleteness, continuationTask, continuationFirst, extractAnswers, GOALS, MODEL };
