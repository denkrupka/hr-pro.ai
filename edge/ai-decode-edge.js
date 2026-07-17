// AI-расшифровки тестов на edge/Workers (Claude через env.ANTHROPIC_API_KEY).
// Логика портирована из src/ai-decode.js + src/ai-decode-routes.js. KB инлайнится
// в бандл esbuild-лоадером text (см. scripts/build-edge.sh: --loader:.txt=text).
import { page as tplPage, spectrum as tplSpectrum, compInfo, zoneOf, esc } from './ai-decode-template.js';
import prodKb1 from '../data/kb/productivity/1_metodologia.txt';
import prodKb2 from '../data/kb/productivity/2_vinnery.txt';
import prodKb3 from '../data/kb/productivity/3_vyavlenie.txt';
import toolsKb from '../data/kb/tools/konspekt.txt';
import promptFull from '../data/kb/prompts/full.txt';
import promptManual from '../data/kb/prompts/manual.txt';
import promptPresentation from '../data/kb/prompts/presentation.txt';
import promptChat from '../data/kb/prompts/chat.txt';
import promptProductivity from '../data/kb/prompts/productivity.txt';

const MODEL = 'claude-opus-4-8';
// На edge/Workers держим синхронный I/O-запрос, поэтому ограничиваем объём вывода,
// чтобы уложиться в окно Cloudflare (waitUntil обрывает долгие фон-задачи).
const MAX_TOKENS_DECODE = 12000;
const MAX_TOKENS_CHAT = 6000;

const PROD_KB = [prodKb1, prodKb2, prodKb3].filter(Boolean).join('\n\n\n===== СЛЕДУЮЩИЙ ДОКУМЕНТ =====\n\n');
const TOOLS_KB_BLOCK = '=== БАЗА ЗНАНИЙ: методология «Тулс» (личностные качества, точки A–J, компульсивность, синдромы) ===\n\n' + toolsKb;
const PROD_KB_BLOCK = '=== БАЗА ЗНАНИЙ: методология продуктивности (Виннер/Дуер/Вейтер) ===\n\n' + PROD_KB;
const PROMPTS = { full: promptFull, manual: promptManual, presentation: promptPresentation, chat: promptChat, productivity: promptProductivity };

const GUARD_TOOLS = `
━━━ ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА (guardrails) ━━━
• Разбери ВСЕ 10 точек A–J РОВНО по одному разу — ничего не потеряй и не продублируй.
• Значения по шкале −100…+100. Порог компульсивности: точка (кроме D) компульсивна, если её значение выше D хотя бы на 1 при D ≥ +32.
• Синдромы бери ТОЛЬКО из методологии базы знаний. Не выдумывай свои. Если синдром не подтверждается точками — не пиши его.
• Опирайся только на базу знаний (транскрипции лекций). Никаких внешних психологических теорий.
• Всегда используй БУКВЕННЫЕ обозначения точек (A–J), как в базе знаний.
• Учитывай тип должности (руководящая/рядовая) из контекста вакансии — методика оценивает их по-разному.`;

const GUARD_PROD = `
━━━ ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА (guardrails) ━━━
• Опирайся ТОЛЬКО на базу знаний по продуктивности (Виннер/Дуер/Вейтер) и на переданные данные кандидата.
• Не выдумывай факты, которых нет в ответах кандидата или в готовом AI-анализе (плашке).
• Термины строго из методики: виннер / дуер / вейтер, продукт должности, шкала тонов, потоки.
• Учитывай тип должности (руководящая/рядовая) — методика оценивает их по-разному.`;

const HTML_CONTRACT = `
━━━ ФОРМАТ ВЫВОДА — HTML (ВАЖНО: ПЕРЕОПРЕДЕЛЯЕТ ЛЮБОЙ ТЕКСТОВЫЙ ФОРМАТ ВЫШЕ) ━━━
Верни ТОЛЬКО HTML-фрагмент (без <html>, <head>, <body>, без markdown и без \`\`\`). Спектр профиля и шапку НЕ рисуй — их добавляет портал. Начни сразу с содержательных секций.
Используй СТРОГО эти классы дизайн-системы HR PRO AI (тёмная тема):

• Секция: <section class="sec"><div class="sec-head"><span class="sec-num">1</span><h2>Заголовок</h2></div> …контент… </section> (нумеруй по порядку).
• Подзаголовок внутри секции: <h3 class="subh">…</h3>
• Карточки точек (для поточечного разбора): <div class="pgrid"> <article class="pcard"> <div class="pc-top"><div class="pc-id"><span class="pc-letter">A</span><div class="pc-name">Внимательность</div></div><div class="pc-val"><span class="pc-num">+50</span><span class="pc-zone z-high">высокая</span></div></div> <div class="pc-body"><b>Что измеряет.</b> …<br><br><b>Проявления.</b> …</div> </article> …10 карточек A–J… </div>
  Для компульсивной точки: <article class="pcard comp">, <span class="pc-letter"> оставь буквой, добавь <span class="pc-comp">компульсивная</span> внутри .pc-name, <span class="pc-num comp">, класс зоны z-vhigh/z-high.
  Классы зон значения: z-vhigh (≥68), z-high (≥32), z-mid (−31…31), z-low (−67…−33), z-vlow (≤−68) и подпись: очень высокая/высокая/средняя/низкая/очень низкая.
• Врезки-акценты: <div class="callout"><div class="co-title">Заголовок</div><div class="co-body">…</div></div>. Варианты: class="callout warn" (внимание), "callout risk" (риск/красное), "callout ok" (зелёное/позитив).
• Таблицы: <div class="tw"><table><thead><tr><th>…</th><th>…</th></tr></thead><tbody><tr><td>…</td><td>…</td></tr></tbody></table></div>
• Синдромы: <div class="synd-grid"> <div class="synd yes"><div class="synd-h"><span class="synd-ic">✓</span><b>Название</b></div><div class="synd-trig">триггер по точкам</div><div class="synd-mean">…</div></div> …(class="synd no" и <span class="synd-ic">–</span> для НЕ сработавших)… </div>
• Памятки «делать/не делать»: <div class="chiprow"><span class="chip do">Делать…</span><span class="chip dont">Не делать…</span>…</div>
• Списки: <ul class="clean"><li><b>Тезис.</b> …</li></ul> или <ol><li>…</li></ol>
• Итоговый вердикт: <div class="verdict"><div class="verdict-h"><span class="verdict-badge">ВЕРДИКТ</span><h3>Короткий итог</h3></div><div class="verdict-body">…<div class="vcols"><div class="vcol"><h4>Сильные стороны</h4><ul><li>…</li></ul></div><div class="vcol"><h4>Риски</h4><ul><li>…</li></ul></div></div></div></div>. Для положительного — <div class="verdict ok">, для отрицательного — <div class="verdict risk">.
• Выделяй ключевое через <b>…</b>. Абзацы — <p>…</p>. Внутри врезок/карточек перенос строки — <br>.
Не используй других классов и inline-стилей (кроме тех, что показаны). Пиши на русском языке, содержательно и глубоко, как лектор методики.`;

const LANG_NAME = { ru: 'русском', pl: 'польском (polski)', en: 'английском (English)' };
function langLine(lang) {
  const n = LANG_NAME[lang] || LANG_NAME.ru;
  return `\n\n━━━ ЯЗЫК ОТВЕТА ━━━\nВесь ответ (заголовки, тексты, подписи) дай СТРОГО на ${n} языке — на языке интерфейса портала. Специальную лексику методики и буквы точек A–J сохраняй как есть.`;
}

export function hasApiKey(env) { return !!(env && env.ANTHROPIC_API_KEY); }

async function callClaude(env, { kbBlock, promptBlock, messages, maxTokens }) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY не задан');
  const system = [
    { type: 'text', text: kbBlock, cache_control: { type: 'ephemeral', ttl: '1h' } },
    { type: 'text', text: promptBlock },
  ];
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-beta': 'context-1m-2025-08-07',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  const data = await r.json().catch(() => null);
  if (!r.ok) { const msg = (data && data.error && (data.error.message || data.error.type)) || ('HTTP ' + r.status); throw new Error('Anthropic: ' + msg); }
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return { text, stopReason: data.stop_reason };
}

function stripFences(s) { return String(s || '').trim().replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim(); }
function looksHtml(s) { return /<(section|article|div|table|ul|ol|p|h2|h3)[\s>]/i.test(s); }
function mdToHtml(md) {
  const lines = String(md).split(/\r?\n/); let out = [], list = null;
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{1,2}\s+/.test(line)) { closeList(); out.push(`<div class="sec-head"><h2>${inline(line.replace(/^#{1,2}\s+/, ''))}</h2></div>`); continue; }
    if (/^#{3,}\s+/.test(line)) { closeList(); out.push(`<h3 class="subh">${inline(line.replace(/^#{3,}\s+/, ''))}</h3>`); continue; }
    if (/^[-*]\s+/.test(line)) { if (list !== 'ul') { closeList(); list = 'ul'; out.push('<ul class="clean">'); } out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`); continue; }
    if (/^\d+\.\s+/.test(line)) { if (list !== 'ol') { closeList(); list = 'ol'; out.push('<ol>'); } out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`); continue; }
    if (!line) { closeList(); continue; }
    closeList(); out.push(`<p>${inline(line)}</p>`);
  }
  closeList(); return `<section class="sec">${out.join('\n')}</section>`;
}
function toContentHtml(text) {
  const t = stripFences(text);
  if (looksHtml(t)) { const i = t.indexOf('<section'), j = t.lastIndexOf('</section>'); if (i >= 0 && j > i) return t.slice(i, j + '</section>'.length); return t; }
  return mdToHtml(t);
}

// Текст результата «Тулс» (буквенный + компульсивность + синдромы) — как в src/ai-decode.js.
export function toolsResultText(result) {
  const { points, order } = result;
  const ci = compInfo(points, order);
  const lines = order.map(k => {
    const pt = points[k]; const v = pt.value; const z = zoneOf(v);
    const comp = ci.isComp(k) ? (ci.borderline(k) ? `, КОМПУЛЬСИВНАЯ (пограничная, +${v - ci.dVal} над D)` : `, КОМПУЛЬСИВНАЯ (+${v - ci.dVal} над D)`) : '';
    return `${k}. ${pt.name}: ${v > 0 ? '+' : ''}${v} (${z.label}${comp})${pt.manic ? ' [маник — нестабильна]' : ''}`;
  });
  let out = 'РЕЗУЛЬТАТ ТЕСТА «ТУЛС» (шкала −100…+100, порог компульсивности +32):\n' + lines.join('\n');
  out += '\n\nКомпульсивные точки: ' + (ci.comps.length ? ci.comps.map(c => `${c.key} (+${c.diff} над D${c.borderline ? ', пограничная' : ''})`).join(', ') : 'нет');
  if (result.syndromes && result.syndromes.length) out += '\n\nСработавшие синдромы (из методики): ' + result.syndromes.map(s => s.title).join('; ');
  else out += '\n\nСработавшие синдромы (из методики): по формальным условиям не сработали — оцени по совокупности точек.';
  if (result.cheating) out += '\n\n⚠ Детектор: признаки недостоверного заполнения — интерпретируй с осторожностью.';
  return out;
}

export function jobContextText(ctx) {
  const rt = ctx.roleType === 'lead' ? 'руководящая' : ctx.roleType === 'rank' ? 'рядовая' : 'не указан';
  return `КОНТЕКСТ ВАКАНСИИ:\nВакансия: ${ctx.vacName || '—'}\nТип должности: ${rt}\nОсновные обязанности: ${ctx.duties || '—'}`;
}

// ── Раннеры ──
export async function runTools(env, { kind, ctx, result, lang }) {
  const promptBlock = PROMPTS[kind] + '\n\n' + GUARD_TOOLS + langLine(lang) + '\n\n' + HTML_CONTRACT;
  const userContent = jobContextText(ctx) + '\n\n' + toolsResultText(result) +
    '\n\nВыполни задачу строго по методике из базы знаний и в заданном HTML-формате. Разбери ВСЕ 10 точек A–J.';
  const out = await callClaude(env, { kbBlock: TOOLS_KB_BLOCK, promptBlock, messages: [{ role: 'user', content: userContent }], maxTokens: MAX_TOKENS_DECODE });
  return { contentHtml: toContentHtml(out.text), stopReason: out.stopReason };
}
export async function runProductivity(env, { ctx, answersText, plashka, lang }) {
  const promptBlock = PROMPTS.productivity + '\n\n' + GUARD_PROD + langLine(lang) + '\n\n' + HTML_CONTRACT;
  const userContent = jobContextText(ctx) +
    '\n\nОТВЕТЫ КАНДИДАТА (тест «Резалт»):\n' + (answersText || '—') +
    '\n\nГОТОВЫЙ AI-АНАЛИЗ ПОРТАЛА (плашка):\n' + (plashka || '—') +
    '\n\nВыполни анализ продуктивности строго по методике и в заданном HTML-формате.';
  const out = await callClaude(env, { kbBlock: PROD_KB_BLOCK, promptBlock, messages: [{ role: 'user', content: userContent }], maxTokens: MAX_TOKENS_DECODE });
  return { contentHtml: toContentHtml(out.text), stopReason: out.stopReason };
}
export async function runChat(env, { history, message, ctx, result, lang }) {
  const promptBlock = PROMPTS.chat + '\n\n' + GUARD_TOOLS + langLine(lang) + '\n\n' +
    'КОНТЕКСТ КАНДИДАТА (не меняется в течение беседы):\n\n' + jobContextText(ctx) + '\n\n' + toolsResultText(result) +
    '\n\nОтвечай на вопросы пользователя по этому кандидату строго по методике из базы знаний. Кратко и по делу, но полно. Обычный текст/markdown (без больших HTML-документов).';
  const out = await callClaude(env, { kbBlock: TOOLS_KB_BLOCK, promptBlock, messages: [...(history || []), { role: 'user', content: message }], maxTokens: MAX_TOKENS_CHAT });
  return { answer: (out.text || '').trim() };
}
export { tplPage as page, tplSpectrum as spectrum };
