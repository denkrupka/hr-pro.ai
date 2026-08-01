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

// Доп. структура ТОЛЬКО для полной расшифровки (kind=full): порядок блоков и новые дизайн-элементы
// (суть/статус, at-a-glance, framework быть/делать/иметь, нотация, плитки точек в синдромах, фасеты точек,
// портрет, перспектива). Базовый контракт выше остаётся в силе; здесь — как собрать его в макет дизайна.
const FULL_STRUCTURE = `
━━━ СТРУКТУРА ПОЛНОЙ РАСШИФРОВКИ (ДИЗАЙН — соблюдай порядок и блоки) ━━━
ВНИМАНИЕ: эта структура ПЕРЕОПРЕДЕЛЯЕТ примеры формата выше для полной расшифровки. Собери ответ строго в этом порядке. Шапку, спектр, синдромы и футер НЕ рисуй — их вставляет портал. КАТЕГОРИЧЕСКИ НЕ пиши сам блок синдромов (никаких <div class="synd-grid"> и <div class="syn-leg">) — его целиком вставляет портал по маркеру [[SYNDROMES]].

1) Суть одной строкой + статус пригодности:
<div class="essence" data-fit="ok|mid|risk" data-fit-label="статус 3–6 слов (напр. «Подходит · с правильным позиционированием»)">
  <div class="ess-eyebrow">Суть человека одной строкой</div>
  <div class="ess-line">Одно ёмкое предложение — что это за человек.</div>
  <div class="ess-split">
    <div class="ess-good"><div class="el">Сильные стороны</div><div class="et">коротко</div></div>
    <div class="ess-bad"><div class="el">Слабые стороны</div><div class="et">коротко</div></div>
  </div>
</div>
  data-fit: ok — уверенно подходит; mid — с оговорками/позиционированием; risk — не рекомендован. data-fit-label — та же мысль 3–6 словами.

2) Ключевые факты — РОВНО 4 карточки. Метки .gk используй ДОСЛОВНО (не заменяй синонимами): «Достоверность», «Ядро профиля», «Синдромов», «Тип».
<div class="glance">
  <div class="gcard"><div class="gk">Достоверность</div><div class="gv good">D +54</div><div class="gs">выше порога — тесту можно доверять</div></div>
  <div class="gcard"><div class="gk">Ядро профиля</div><div class="gv hi">E +94</div><div class="gs">компульсивная активность — мотор</div></div>
  <div class="gcard"><div class="gk">Синдромов</div><div class="gv">3</div><div class="gs">сработало из проверенных</div></div>
  <div class="gcard"><div class="gk">Тип</div><div class="gv hi">Результатник</div><div class="gs">сильное «делать», слабое «иметь»</div></div>
</div>
  • Достоверность — по точке D (надёжность/предсказуемость) и детектору читинга: «выше порога — тесту можно доверять» (gv good) или «ниже порога — читать с осторожностью» (gv warn/bad).
  • Ядро профиля — самая доминирующая (обычно компульсивная) точка + короткое пояснение (gv hi).
  • Синдромов — сколько синдромов реально сработало (число) + «сработало из проверенных».
  • Тип — краткий ярлык профиля (Результатник / Исполнитель / Коммуникатор / Аналитик …) по сильной группе точек (gv hi) + связка «сильное «делать», слабое «иметь»» и т.п.

3) Спектр профиля — вставь РОВНО этот маркер (портал заменит готовым спектром), больше ничего:
[[SPECTRUM]]

4) Синдромы — вставь РОВНО этот маркер (портал сам подставит блок синдромов из методики). НЕ пиши карточки синдромов сам:
[[SYNDROMES]]

5) Секция 02 «Анализ каждой точки»: <div class="sec-head"><span class="sec-num">02</span><h2>Анализ каждой точки</h2><div class="rule"></div></div>
  10 карточек A–J в <div class="pgrid">. ВАЖНО: у КАЖДОЙ из 10 точек ОДИНАКОВЫЙ набор ровно из 4 фасетов с ДОСЛОВНО этими метками .facet-l (не перефразируй, не пропускай, порядок сохраняй):
  «Измеряет» · «Как проявляется» · «В работе» · «На эту должность».
  <article class="pcard"><div class="pc-head"><span class="pc-letter">A</span><div class="pc-mid"><div class="pc-name">Внимательность</div></div><div class="pc-val"><span class="pc-num">+50</span><span class="pc-zone z-high">высокая</span></div></div>
    <div class="pc-facets">
      <div class="facet"><div class="facet-l">Измеряет</div><div class="facet-t">что показывает точка</div></div>
      <div class="facet"><div class="facet-l">Как проявляется</div><div class="facet-t">поведение при таком значении</div></div>
      <div class="facet"><div class="facet-l">В работе</div><div class="facet-t">плюсы/минусы в деле, связки с другими точками</div></div>
      <div class="facet"><div class="facet-l">На эту должность</div><div class="facet-t">что это значит именно для этой вакансии</div></div>
    </div>
  </article>
  Компульсивная точка: <article class="pcard comp"> и <span class="pc-comp">компульсивная</span> в .pc-name. Класс зоны значения: z-vhigh (≥68), z-high (≥32), z-mid (−31…31), z-low (−67…−33), z-vlow (≤−68).

6) Секция 03 «Комплексный портрет» — ДЕТАЛЬНЫЙ. ОБЯЗАТЕЛЬНО 4 подраздела, каждый — своя <div class="pr-card"> с <h3> и развёрнутым текстом. Это ключевой большой раздел, не сокращай его:
  <div class="portrait">
    <div class="pr-card"><h3>Общая характеристика</h3><div class="pr-body">развёрнутый абзац о человеке в целом…</div>
      <div class="pr-bullets"><div class="pr-bul"><span class="mk">›</span><span><b>Мотивы:</b> …</span></div><div class="pr-bul"><span class="mk">›</span><span><b>Решения:</b> …</span></div><div class="pr-bul"><span class="mk">›</span><span><b>К системам:</b> …</span></div><div class="pr-bul"><span class="mk">›</span><span><b>К авторитетам:</b> …</span></div></div></div>
    <div class="pr-card"><h3>Что ожидать при поручении заданий</h3><div class="pr-body"><b>Будет:</b> … <b>Сложности:</b> … <b>Как формулировать:</b> … <b>Скорость</b> и <b>доведение</b> … <b>контроль</b> …</div></div>
    <div class="pr-card"><h3>Если нарушает обещание</h3><div class="pr-body">как себя поведёт, как с ним говорить…</div></div>
    <div class="pr-card"><h3>Как мотивировать и удерживать</h3><div class="pr-body">что драйвит, чего избегать…</div></div>
  </div>

7) Вердикт (.verdict) — с колонками: <div class="vcols"><div class="vcol ok"><h4>Условия для успеха</h4><div class="vitem"><span class="mk">✓</span>…</div>…</div><div class="vcol risk"><h4>Красные флаги</h4><div class="vitem"><span class="mk">!</span>…</div>…</div></div>

8) Перспектива роста — добавляй ТОЛЬКО если должность в контексте вакансии РУКОВОДЯЩАЯ. Для рядовой должности этот блок НЕ выводи:
  <div class="persp"><span class="persp-ic">☀</span><div><div class="persp-h">Заголовок про перспективу руководителя</div><div class="persp-b">управленческий каркас, ограничители, как продвигать…</div></div></div>`;

// Оформление ИНСТРУКЦИИ (kind=manual) и СЦЕНАРИЯ ВСТРЕЧИ (kind=presentation) в дизайне расшифровки.
const MANUAL_STRUCTURE = `
━━━ ОФОРМЛЕНИЕ ИНСТРУКЦИИ (ДИЗАЙН — ПЕРЕОПРЕДЕЛЯЕТ примеры формата выше) ━━━
Верни HTML строго в этом порядке. Шапку, спектр и футер НЕ рисуй — их вставляет портал. Синдромы отдельным блоком НЕ рисуй.

1) Суть + режим управления:
<div class="essence" data-fit="ok|mid|risk" data-fit-label="режим управления 3–6 слов (напр. «Гибкий контроль · по результату»)">
  <div class="ess-eyebrow">Как управлять этим человеком</div>
  <div class="ess-line">одна ёмкая строка про оптимальный стиль управления этим сотрудником</div>
  <div class="ess-split"><div class="ess-good"><div class="el">Что работает</div><div class="et">коротко</div></div><div class="ess-bad"><div class="el">Что вредит</div><div class="et">коротко</div></div></div>
</div>
  data-fit: ok — лёгок в управлении; mid — требует особого подхода; risk — сложный в управлении.

2) Ключевые факты — РОВНО 4 карточки. Метки .gk ДОСЛОВНО: «Стиль управления», «Уровень контроля», «Главный мотиватор», «Главный триггер».
<div class="glance"><div class="gcard"><div class="gk">Стиль управления</div><div class="gv hi">напр. Партнёрский</div><div class="gs">коротко почему</div></div> …ещё 3… </div>

3) Спектр профиля — вставь РОВНО маркер: [[SPECTRUM]]

4) Разделы инструкции — каждый своя <section class="sec"> с нумерованной шапкой <div class="sec-head"><span class="sec-num">1</span><h2>Заголовок</h2><div class="rule"></div></div>. Ровно 9 разделов по порядку:
  1 Стиль управления · 2 Как с ним разговаривать · 3 Как его мотивировать · 4 Как контролировать · 5 Обратная связь · 6 Что вызывает сопротивление · 7 Что повышает продуктивность · 8 Конфликтные ситуации · 9 Типичные ошибки.
  Внутри разделов используй дизайн-блоки: «Делать / Не делать» — <div class="chiprow"><span class="chip do">…</span><span class="chip dont">…</span>…</div>; конкретные формулировки и предупреждения — <div class="callout ok|warn|risk"><div class="co-title">…</div><div class="co-body">…</div></div>; списки — <ul class="clean"><li><b>Тезис.</b> …</li></ul>; «частота/формат контроля» — таблицей <div class="tw"><table>…</table></div>. Пиши развёрнуто, практично, с опорой на точки.

5) Итог — <div class="verdict ok|risk"><div class="verdict-h"><span class="verdict-badge">Итог</span><h3>Как выжать максимум из этого сотрудника</h3></div><div class="verdict-body"><div class="verdict-lead">…</div><div class="vcols"><div class="vcol ok"><h4>Главное — делать</h4><div class="vitem"><span class="mk">✓</span>…</div>…</div><div class="vcol risk"><h4>Главное — избегать</h4><div class="vitem"><span class="mk">!</span>…</div>…</div></div></div></div>`;
const PRESENTATION_STRUCTURE = `
━━━ ОФОРМЛЕНИЕ СЦЕНАРИЯ ВСТРЕЧИ (ДИЗАЙН — ПЕРЕОПРЕДЕЛЯЕТ примеры формата выше) ━━━
Верни HTML строго в этом порядке. Шапку, спектр и футер НЕ рисуй — их вставляет портал. Отдельный блок синдромов НЕ рисуй.

1) Суть + тон встречи:
<div class="essence" data-fit="ok|mid|risk" data-fit-label="тон встречи 3–6 слов (напр. «Тёплый · начать с сильных»)">
  <div class="ess-eyebrow">Сценарий встречи с кандидатом</div>
  <div class="ess-line">одна строка о цели встречи и правильном тоне</div>
  <div class="ess-split"><div class="ess-good"><div class="el">С чего начать</div><div class="et">с сильных сторон</div></div><div class="ess-bad"><div class="el">Осторожно</div><div class="et">зоны развития — мягко</div></div></div>
</div>
  data-fit: ok — встреча пройдёт легко; mid — нужна деликатность; risk — высокий риск задеть, максимально бережно.

2) Ключевые факты — РОВНО 4 карточки. Метки .gk ДОСЛОВНО: «Сильные стороны», «Зоны развития», «Синдромов», «Тон встречи».
<div class="glance"><div class="gcard"><div class="gk">Сильные стороны</div><div class="gv good">напр. A, C, D</div><div class="gs">с них начинаем</div></div> …ещё 3… </div>

3) Спектр профиля — вставь РОВНО маркер: [[SPECTRUM]]

4) Подготовка — <section class="sec"> с шапкой «Подготовка к встрече» (что подготовить, обстановка, внутренний настрой) через <ul class="clean"> и .callout.

5) Шаги встречи — каждый шаг своя <section class="sec"> с нумерованной шапкой (1–8): 1 Открытие · 2 Суть теста · 3 Сильные стороны · 4 Зоны развития · 5 Синдромы · 6 Рекомендации по развитию · 7 Ответы на вопросы · 8 Завершение.
  «Что говорить (дословно)» оформляй как <div class="callout ok"><div class="co-title">Говорить дословно</div><div class="co-body">«точная фраза для сотрудника»</div></div>. «Чего избегать / чего НЕ говорить» — <div class="callout risk"><div class="co-title">Не говорить</div><div class="co-body">…</div></div>. «Цель шага / что наблюдать» — <div class="callout warn"> или обычный текст. Ключевые пункты — <ul class="clean">.

6) Итог — <div class="verdict ok"><div class="verdict-h"><span class="verdict-badge">Итог</span><h3>Ключ к результативной встрече</h3></div><div class="verdict-body"><div class="verdict-lead">…</div><div class="vcols"><div class="vcol ok"><h4>Принципы</h4><div class="vitem"><span class="mk">✓</span>…</div>…</div><div class="vcol risk"><h4>Типичные ошибки</h4><div class="vitem"><span class="mk">!</span>…</div>…</div></div></div></div>`;


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
  // Таймаут: если Anthropic завис, обрываем запрос, чтобы фоновая задача не осталась в «pending» навсегда.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4 * 60 * 1000);
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
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'Anthropic: превышено время ожидания (4 мин)' : 'Сеть/Anthropic: ' + e.message);
  } finally {
    clearTimeout(timer);
  }
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
  let t = stripFences(text);
  if (!looksHtml(t)) return mdToHtml(t);
  // Срезаем только болтовню ДО первого HTML-тега и ПОСЛЕ последнего '>', НЕ трогая внутренние блоки:
  // в новой структуре essence/glance идут до секций, а verdict/perspective — после них.
  const m = t.match(/<(?:section|article|div|table|ul|ol|h2|h3|p)[\s>]/i);
  if (m && m.index > 0) t = t.slice(m.index);
  const j = t.lastIndexOf('>');
  if (j >= 0) t = t.slice(0, j + 1);
  return t.trim();
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

// Платные AI-функции теста «Тулс»: цена в тестах и последовательность покупки.
// full → manual → presentation покупаются по очереди; chat («Узнать о кандидате») — независимо.
const AI_FEATURE_PRICES = { full: 0.5, manual: 1, presentation: 0.5, chat: 1 };
const AI_FEATURE_SEQ = ['full', 'manual', 'presentation'];
// «Продуктивность» (Резалт) — одна платная кнопка, разово.
const AI_FEATURE_PRICES_PROD = { productivity: 0.5 };

module.exports = {
  MODEL, MAX_TOKENS_DECODE, MAX_TOKENS_CHAT,
  hasApiKey, getApiKey, callClaude, langLine,
  TOOLS_KB_BLOCK, PROD_KB_BLOCK, PROMPTS,
  GUARD_TOOLS, GUARD_PROD, HTML_CONTRACT, FULL_STRUCTURE, MANUAL_STRUCTURE, PRESENTATION_STRUCTURE,
  toContentHtml, toolsResultText, tpl,
  AI_FEATURE_PRICES, AI_FEATURE_SEQ, AI_FEATURE_PRICES_PROD,
};
