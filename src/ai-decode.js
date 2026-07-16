'use strict';
// AI-расшифровки тестов через Claude (Anthropic) с prompt caching.
//
// Схема запроса (см. brief_for_claude_code.md):
//   system = [ {KB методологии, cache_control ephemeral 1h}, {промт кнопки + guardrails} ]
//   messages = [ {role:user, контекст вакансии + результат теста} ]
// KB — единый кэшируемый префикс для всех кнопок «Тулс» (и чата). У «Резалт» свой KB.
//
// Модель: claude-opus-4-8, max_tokens с запасом, temperature НЕ задаём (Opus 4.8 её не принимает).
// API-ключ — только на сервере: ANTHROPIC_API_KEY (env) либо integrations.config.json → anthropic.apiKey.

const fs = require('fs');
const path = require('path');
const tpl = require('./ai-decode-template');

const MODEL = 'claude-opus-4-8';
const MAX_TOKENS_DECODE = 32000;   // расшифровки длинные; платится только фактический вывод
const MAX_TOKENS_CHAT = 8000;      // ответы чата короче
const KB_DIR = path.join(__dirname, '..', 'data', 'kb');

function readOr(p, fallback) { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return fallback || ''; } }

// ─────────────── KB и промты (загружаются один раз) ───────────────
const TOOLS_KB = readOr(path.join(KB_DIR, 'tools', 'konspekt.txt'));
const PROD_KB = [
  ['1_metodologia.txt', 'МЕТОДОЛОГИЯ НАЙМА'],
  ['2_vinnery.txt', 'ПРОДУКТИВНОСТЬ И ВИННЕРЫ'],
  ['3_vyavlenie.txt', 'ВЫЯВЛЕНИЕ ПРОДУКТИВНЫХ КАНДИДАТОВ'],
].map(([f]) => readOr(path.join(KB_DIR, 'productivity', f)))
  .filter(Boolean).join('\n\n\n===== СЛЕДУЮЩИЙ ДОКУМЕНТ =====\n\n');

const PROMPTS = {
  full: readOr(path.join(KB_DIR, 'prompts', 'full.txt')),
  manual: readOr(path.join(KB_DIR, 'prompts', 'manual.txt')),
  presentation: readOr(path.join(KB_DIR, 'prompts', 'presentation.txt')),
  chat: readOr(path.join(KB_DIR, 'prompts', 'chat.txt')),
  productivity: readOr(path.join(KB_DIR, 'prompts', 'productivity.txt')),
};

// KB как отдельный (кэшируемый) блок; префикс всегда идентичен, чтобы кэш переиспользовался.
const TOOLS_KB_BLOCK = '=== БАЗА ЗНАНИЙ: методология «Тулс» (личностные качества, точки A–J, компульсивность, синдромы) ===\n\n' + TOOLS_KB;
const PROD_KB_BLOCK = '=== БАЗА ЗНАНИЙ: методология продуктивности (Виннер/Дуер/Вейтер) ===\n\n' + PROD_KB;

// ─────────────── Guardrails и контракт вывода (HTML-компоненты дизайна) ───────────────
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

// Контракт вывода: тот же дизайн-язык, что у страниц Decode/Manual Kowalska.
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

// Язык ответа = язык портала. Инструкция добавляется в промт кнопки/чата.
const LANG_NAME = { ru: 'русском', pl: 'польском (polski)', en: 'английском (English)' };
function langLine(lang) {
  const n = LANG_NAME[lang] || LANG_NAME.ru;
  return `\n\n━━━ ЯЗЫК ОТВЕТА ━━━\nВесь ответ (заголовки, тексты, подписи) дай СТРОГО на ${n} языке — на языке интерфейса портала. Специальную лексику методики и буквы точек A–J сохраняй как есть.`;
}

// ─────────────── Вызов Claude ───────────────
function getApiKey() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integrations.config.json'), 'utf8'));
    if (cfg && cfg.anthropic && cfg.anthropic.apiKey) return cfg.anthropic.apiKey;
  } catch (_) {}
  return null;
}
function hasApiKey() { return !!getApiKey(); }

// kbBlock — кэшируемый префикс; promptBlock — промт кнопки (+guardrails+контракт); messages — диалог.
async function callClaude({ kbBlock, promptBlock, messages, maxTokens }) {
  const key = getApiKey();
  if (!key) throw new Error('ANTHROPIC_API_KEY не задан (env или integrations.config.json → anthropic.apiKey)');
  const system = [
    { type: 'text', text: kbBlock, cache_control: { type: 'ephemeral', ttl: '1h' } },
    { type: 'text', text: promptBlock },
  ];
  const body = { model: MODEL, max_tokens: maxTokens, system, messages };
  // temperature НЕ передаём: Opus 4.8 не принимает свою температуру (ошибка 400).
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': 'context-1m-2025-08-07',   // 1M-контекст под большой KB
      },
      body: JSON.stringify(body),
    });
  } catch (e) { throw new Error('Сеть/Anthropic: ' + e.message); }
  const data = await r.json().catch(() => null);
  if (!r.ok) {
    const msg = (data && data.error && (data.error.message || data.error.type)) || ('HTTP ' + r.status);
    throw new Error('Anthropic: ' + msg);
  }
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return { text, stopReason: data.stop_reason, usage: data.usage || {} };
}

// ─────────────── Нормализация вывода модели в HTML-фрагмент ───────────────
function stripFences(s) {
  let t = String(s || '').trim();
  t = t.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
  return t;
}
function looksHtml(s) { return /<(section|article|div|table|ul|ol|p|h2|h3)[\s>]/i.test(s); }
// Мини-конвертер markdown→HTML на случай, если модель не вернула HTML (запасной путь).
function mdToHtml(md) {
  const esc = tpl.esc;
  const lines = String(md).split(/\r?\n/);
  let out = [], list = null;
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
  closeList();
  return `<section class="sec">${out.join('\n')}</section>`;
}
function toContentHtml(text) {
  const t = stripFences(text);
  if (looksHtml(t)) {
    // вырезаем всё за пределами первой <section и последней </section>, если модель обернула лишним
    const i = t.indexOf('<section');
    const j = t.lastIndexOf('</section>');
    if (i >= 0 && j > i) return t.slice(i, j + '</section>'.length);
    return t;
  }
  return mdToHtml(t);
}

// ─────────────── Сборка входных данных ───────────────
// Текст результата «Тулс» в буквенном виде + компульсивность + синдромы.
function toolsResultText(result) {
  const { points, order } = result;
  const ci = tpl.compInfo(points, order);
  const lines = order.map(k => {
    const pt = points[k]; const v = pt.value; const z = tpl.zoneOf(v);
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

module.exports = {
  MODEL, MAX_TOKENS_DECODE, MAX_TOKENS_CHAT,
  hasApiKey, getApiKey, callClaude, langLine,
  TOOLS_KB_BLOCK, PROD_KB_BLOCK, PROMPTS,
  GUARD_TOOLS, GUARD_PROD, HTML_CONTRACT,
  toContentHtml, toolsResultText, tpl,
};
