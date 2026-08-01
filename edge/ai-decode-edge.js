// AI-расшифровки тестов на edge/Workers (Claude через env.ANTHROPIC_API_KEY).
// Логика портирована из src/ai-decode.js + src/ai-decode-routes.js. KB инлайнится
// в бандл esbuild-лоадером text (см. scripts/build-edge.sh: --loader:.txt=text).
import { page as tplPage, spectrum as tplSpectrum, syndromesBlock as tplSyndromes, compInfo, zoneOf, esc } from './ai-decode-template.js';
import prodKb1 from '../data/kb/productivity/1_metodologia.txt';
import prodKb2 from '../data/kb/productivity/2_vinnery.txt';
import prodKb3 from '../data/kb/productivity/3_vyavlenie.txt';
import toolsKb from '../data/kb/tools/konspekt.txt';
import promptFull from '../data/kb/prompts/full.txt';
import promptManual from '../data/kb/prompts/manual.txt';
import promptPresentation from '../data/kb/prompts/presentation.txt';
import promptChat from '../data/kb/prompts/chat.txt';
import promptProductivity from '../data/kb/prompts/productivity.txt';

// На edge/Workers у воркера ограниченное окно выполнения. Opus 4.8 на 12000 токенов генерирует >4 мин —
// не укладывается и «зависает». Берём быстрый Sonnet 4.6 и умеренный объём → генерация ~60–90с в фоне (waitUntil)
// + потоковый вызов (stream) держит воркер активным. Node-стек остаётся на Opus (там нет лимита CF).
const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS_DECODE = 9000;
const MAX_TOKENS_CHAT = 5000;

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
Не используй других классов и inline-стилей (кроме тех, что показаны). Пиши на русском языке, содержательно и глубоко, как лектор методики.

━━━ БЮДЖЕТ ОБЪЁМА (КРИТИЧНО — ответ жёстко ограничен по длине, при переборе он обрежется на полуслове) ━━━
Пиши предельно плотно, без воды, вступлений и повторов.
Строго соблюдай структуру из раздела «СТРУКТУРА/ОФОРМЛЕНИЕ …» ниже — она задаёт порядок блоков ИМЕННО для этого документа и ПЕРЕОПРЕДЕЛЯЕТ примеры формата выше. ОБЯЗАТЕЛЬНО доведи ответ до конца целиком, включая завершающий блок <div class="verdict"> (итог) — он самый важный и обязан присутствовать.
Если приближаешься к лимиту длины — сокращай детали в середине, но начало (суть, ключевые факты) и конец (итог) сохраняй.`;

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


const LANG_NAME = { ru: 'русском', pl: 'польском (polski)', en: 'английском (English)' };
function langLine(lang) {
  const n = LANG_NAME[lang] || LANG_NAME.ru;
  return `\n\n━━━ ЯЗЫК ОТВЕТА ━━━\nВесь ответ (заголовки, тексты, подписи) дай СТРОГО на ${n} языке — на языке интерфейса портала. Специальную лексику методики и буквы точек A–J сохраняй как есть.`;
}

export function hasApiKey(env) { return !!(env && env.ANTHROPIC_API_KEY); }

// ПОТОКОВЫЙ вызов Claude (stream: true). На Cloudflare Workers долгий НЕ-потоковый запрос простаивает
// без активности и воркер убивают до завершения → генерация «зависает». Потоковое чтение держит воркер
// активным (постоянно приходят чанки), поэтому длинная генерация доходит до конца.
// Обёртка с авто-ретраем временных сбоев (перегрузка/лимиты/сеть). Ретраим только когда безопасно —
// на ранних ошибках (до стрима) это быстро; мид-стрим сбои редки. До 3 попыток с нарастающей паузой.
async function callClaude(env, opts) {
  const transient = e => /HTTP (429|500|502|503|529)|overloaded|rate.?limit|Сеть\/Anthropic|Network|fetch failed|ECONN|ETIMEDOUT|время ожидания/i.test(String((e && e.message) || e));
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await callClaudeOnce(env, opts); }
    catch (e) {
      lastErr = e;
      if (attempt < 2 && transient(e)) { await new Promise(r => setTimeout(r, 1500 * (attempt + 1))); continue; }
      throw e;
    }
  }
  throw lastErr;
}
async function callClaudeOnce(env, { kbBlock, promptBlock, messages, maxTokens }) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY не задан');
  const system = [
    { type: 'text', text: kbBlock, cache_control: { type: 'ephemeral', ttl: '1h' } },
    { type: 'text', text: promptBlock },
  ];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5 * 60 * 1000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-beta': 'context-1m-2025-08-07',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages, stream: true }),
      signal: ctrl.signal,
    });
    if (!r.ok) { const data = await r.json().catch(() => null); throw new Error('Anthropic: ' + ((data && data.error && (data.error.message || data.error.type)) || ('HTTP ' + r.status))); }
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '', stopReason = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let ev; try { ev = JSON.parse(payload); } catch (_) { continue; }
        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') text += ev.delta.text;
        else if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) stopReason = ev.delta.stop_reason;
        else if (ev.type === 'error') throw new Error('Anthropic: ' + ((ev.error && ev.error.message) || 'stream error'));
      }
    }
    return { text, stopReason };
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'Anthropic: превышено время ожидания генерации' : (String(e.message || e).startsWith('Anthropic') ? e.message : 'Сеть/Anthropic: ' + e.message));
  } finally {
    clearTimeout(timer);
  }
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
// Достаёт завершающий блок <div class="verdict">…</div> из HTML (со всеми вложенными div до баланса).
function extractVerdict(html) {
  const start = html.indexOf('<div class="verdict');
  if (start < 0) return '';
  let i = start, depth = 0;
  const re = /<div\b|<\/div>/g; re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') { depth--; if (depth === 0) return html.slice(start, m.index + 6); }
    else depth++;
  }
  return html.slice(start); // не сбалансировано — вернём хвост как есть
}
export async function runTools(env, { kind, ctx, result, lang }) {
  const STRUCT = { full: FULL_STRUCTURE, manual: MANUAL_STRUCTURE, presentation: PRESENTATION_STRUCTURE }[kind];
  const promptBlock = PROMPTS[kind] + '\n\n' + GUARD_TOOLS + langLine(lang) + '\n\n' + HTML_CONTRACT +
    (STRUCT ? '\n\n' + STRUCT : '');
  const TASK = {
    full: 'Разбери ВСЕ 10 точек A–J и собери полную расшифровку по структуре ниже.',
    manual: 'Составь ДЕТАЛЬНУЮ инструкцию по эксплуатации сотрудника (как им управлять, мотивировать, контролировать) — по структуре из раздела ОФОРМЛЕНИЕ ИНСТРУКЦИИ. Не делай поточечный разбор 10 точек — только выводы для управления.',
    presentation: 'Составь ПОШАГОВЫЙ сценарий встречи для предоставления оценки сотруднику — по структуре из раздела ОФОРМЛЕНИЕ СЦЕНАРИЯ ВСТРЕЧИ. Не делай поточечный разбор 10 точек — это скрипт встречи с дословными фразами.',
  }[kind] || 'Выполни задачу по методике.';
  const userContent = jobContextText(ctx) + '\n\n' + toolsResultText(result) +
    '\n\nВыполни задачу строго по методике из базы знаний и в заданном HTML-формате. ' + TASK;
  const out = await callClaude(env, { kbBlock: TOOLS_KB_BLOCK, promptBlock, messages: [{ role: 'user', content: userContent }], maxTokens: MAX_TOKENS_DECODE });
  let html = toContentHtml(out.text);
  // Гарантия вердикта: тело расшифровки либо обрезается по лимиту ДО вердикта, либо модель заканчивает
  // ответ без вердикта сама. В ОБОИХ случаях (если блока .verdict нет) догенерируем ТОЛЬКО вердикт вторым
  // коротким вызовом и допишем его в конец. Это самая важная для рекрутёра секция — она должна быть всегда.
  if ((kind === 'full' || kind === 'manual' || kind === 'presentation') && !/class="verdict/.test(html)) {
    try {
      const vPrompt = PROMPTS[kind] + '\n\n' + GUARD_TOOLS + langLine(lang) + '\n\n' + HTML_CONTRACT +
        '\n\n━━━ ЗАДАЧА ━━━\nВерни ТОЛЬКО завершающий блок <div class="verdict ok|risk"><div class="verdict-h"><span class="verdict-badge">Итог</span><h3>…</h3></div><div class="verdict-body"><div class="verdict-lead">…</div><div class="vcols"><div class="vcol ok"><h4>…</h4><div class="vitem"><span class="mk">✓</span>…</div></div><div class="vcol risk"><h4>…</h4><div class="vitem"><span class="mk">!</span>…</div></div></div></div></div> — итог по этому документу. Без других секций.';
      const vOut = await callClaude(env, { kbBlock: TOOLS_KB_BLOCK, promptBlock: vPrompt, messages: [{ role: 'user', content: userContent + '\n\nСформулируй только итоговый блок.' }], maxTokens: 1800 });
      const vHtml = extractVerdict(toContentHtml(vOut.text)) || toContentHtml(vOut.text);
      if (vHtml) html += '\n' + vHtml;
    } catch (_) { /* если догенерация не удалась — оставляем тело без вердикта */ }
  }
  return { contentHtml: html, stopReason: out.stopReason };
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
export async function runChat(env, { history, message, ctx, result, lang, dossier }) {
  // Полное досье (все тесты + заявка + вакансия + объявление + резюме), если собрано; иначе — базовый контекст.
  const contextBlock = dossier || ('КОНТЕКСТ КАНДИДАТА (не меняется в течение беседы):\n\n' + jobContextText(ctx) + '\n\n' + toolsResultText(result));
  const promptBlock = PROMPTS.chat + '\n\n' + GUARD_TOOLS + langLine(lang) + '\n\n' + contextBlock +
    '\n\nУ тебя есть ПОЛНОЕ досье кандидата: результаты всех его тестов (личность «Тулс», продажи «Сейлс», интеллект «Логис», продуктивность «Резалт», знания), заявка на найм, вакансия, объявление и резюме. Отвечай на вопросы рекрутёра развёрнуто и практично, опираясь на методику из базы знаний и на эти данные. Можешь давать полноценные кадровые рекомендации: подходит ли кандидат на роль или на перевод (например, с тёплых продаж на холодные, в поле за новыми клиентами), стоит ли это делать, как ставить ему задачи, как контролировать, в чём риски и как мотивировать. Если данных по какому-то тесту нет — так и скажи, не выдумывай. Обычный текст/markdown (без больших HTML-документов).';
  const out = await callClaude(env, { kbBlock: TOOLS_KB_BLOCK, promptBlock, messages: [...(history || []), { role: 'user', content: message }], maxTokens: MAX_TOKENS_CHAT });
  return { answer: (out.text || '').trim() };
}
export { tplPage as page, tplSpectrum as spectrum, tplSyndromes as syndromesBlock };
