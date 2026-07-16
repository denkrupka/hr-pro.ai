'use strict';
// Платные программы обучения (первая версия — контент зашит в код; редактор в админке добавим позже).
// Оплата — списанием с баланса тестов (программа стоит N «тестов»). Покупка одноразовая.
// Последовательность: следующую программу можно купить только когда предыдущая ЗАВЕРШЕНА
// (все разделы пройдены + сдан итоговый тест ≥ passScore).
// Прогресс/покупки пользователя хранятся в user.learning[programId] =
//   { boughtAt, sectionsDone:[sectionId...], quizPassed:bool, quizBest:pct, completedAt }.
//
// Контент разделов/квиза сейчас на русском; заголовки и описания — ru/pl/en. Полная локализация
// длинных материалов — отдельная контент-задача (L() делает фолбэк на ru).

let CONTENT = {};
try { CONTENT = require('./learning-content'); } catch (_) { CONTENT = {}; }
function tri(ru, pl, en) { return { ru, pl: pl || ru, en: en || ru }; }
function L(o, lang) { return (o && (o[lang] || o.ru)) || ''; }

const PROGRAMS = [
  {
    id: 'method-basics', order: 1, price: 10,
    title: tri('Основы методики найма', 'Podstawy metodyki rekrutacji', 'Hiring methodology basics'),
    desc: tri('Продукт должности, типология Виннер / Дуер / Вейтер и три ключевых вопроса, на которых строится весь отбор.',
      'Produkt stanowiska, typologia Winner / Doer / Waiter oraz trzy kluczowe pytania.',
      'Product of the role, the Winner / Doer / Waiter typology and the three key questions.'),
    // Ссылки на видео-трейлер по языкам (mp4/HLS). Заполните URL — модалка проиграет нужный по языку портала.
    trailer: tri('', '', ''),
    sections: [
      { id: 'product', title: tri('Продукт должности', 'Produkt stanowiska', 'Product of the role'),
        desc: tri('Что такое конечный продукт должности и почему это главный маркер результата.', 'Czym jest produkt końcowy stanowiska i dlaczego to główny marker.', 'What the end product of a role is and why it is the key marker.'), html: tri(
        `<p style="margin:0 0 22px">Любая должность существует ради конечного результата — <strong>продукта должности</strong>. Это не список обязанностей, а то, что остаётся «на выходе» и за что компания платит зарплату.</p>
         <ul style="list-style:none;margin:0 0 26px;padding:0;display:flex;flex-direction:column;gap:12px">
           <li style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-left:2px solid rgba(139,108,255,.55)"><span style="flex:none;margin-top:3px;width:8px;height:8px;border-radius:50%;background:#8b6cff;box-shadow:0 0 8px rgba(139,108,255,.6)"></span><span>Дворник → <strong>чистый двор</strong> <span style="color:#8b93ad">(а не «подметание»).</span></span></li>
           <li style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-left:2px solid rgba(111,151,255,.55)"><span style="flex:none;margin-top:3px;width:8px;height:8px;border-radius:50%;background:#6f97ff;box-shadow:0 0 8px rgba(111,151,255,.6)"></span><span>Секретарь → <strong>быстро соединённый с нужным сотрудником звонок.</strong></span></li>
           <li style="display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-left:2px solid rgba(67,224,160,.55)"><span style="flex:none;margin-top:3px;width:8px;height:8px;border-radius:50%;background:#43e0a0;box-shadow:0 0 8px rgba(67,224,160,.6)"></span><span>Продавец → <strong>оплаченный и довольный клиент.</strong></span></li>
         </ul>
         <p style="margin:0 0 8px">Кандидат, который умеет назвать продукт своей прошлой должности, мыслит результатом, а не процессом. Это первый и самый сильный маркер <strong>«виннера»</strong>.</p>
         <div style="margin:36px 0 0;padding:22px 24px;border-radius:16px;background:linear-gradient(120deg,rgba(139,108,255,.09),rgba(111,151,255,.04));border:1px solid rgba(139,108,255,.2)">
           <div style="display:flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b3a4ff;margin-bottom:9px">✦ Как применять</div>
           <p style="margin:0;font-size:16px;line-height:1.66;color:#d3d9ec">Просите кандидата назвать продукт его прошлой должности. Не должность, не обязанности — именно результат «на выходе». Ответ за 15 секунд отделяет виннера от вейтера.</p>
         </div>`) },
      { id: 'typology', title: tri('Виннер, Дуер, Вейтер', 'Winner, Doer, Waiter', 'Winner, Doer, Waiter'),
        desc: tri('Три типа кандидатов по отношению к продукту и когда кто подходит.', 'Trzy typy kandydatów wobec produktu i kiedy kto pasuje.', 'Three candidate types by their relation to the product and who fits when.'), html: tri(
        `<p>Три типа по отношению к продукту:</p>
         <ul><li><b>Виннер</b> — видит продукт, измеряет и сравнивает результаты, берёт ответственность, растёт.</li>
         <li><b>Дуер</b> — хороший исполнитель: производит продукт, но не формулирует его. Эффективен под руководством виннера.</li>
         <li><b>Вейтер</b> — избегает лишней работы и ответственности, «затирает» вместо конкретики. Высокий риск.</li></ul>
         <p>Для руководящих ролей ищем виннера, для линейных часто достаточно надёжного дуера.</p>`) },
      { id: 'questions', title: tri('Три ключевых вопроса', 'Trzy kluczowe pytania', 'The three key questions'),
        desc: tri('Три вопроса на финале и как отличать факты от красивых слов.', 'Trzy pytania na finale i jak odróżnić fakty od ładnych słów.', 'Three final-round questions and how to tell facts from nice words.'), html: tri(
        `<p>На финале задайте три вопроса и слушайте <b>факты</b>, а не намерения:</p>
         <ol><li>Какой продукт вы производили на прошлой должности?</li><li>Как вы измеряли и с чем сравнивали свой результат?</li><li>Как со временем менялся объём вашей работы и ответственности?</li></ol>
         <p>Красивые слова о будущем возвращайте в прошлое: «А как это было на последнем месте?» — и записывайте, кто может подтвердить факты.</p>`) },
    ],
    quiz: {
      passScore: 60,
      questions: [
        { q: tri('Что такое «продукт должности»?'), opts: [tri('Список обязанностей сотрудника'), tri('Конечный результат, за который платят зарплату'), tri('Должностная инструкция')], correct: 1 },
        { q: tri('Кто из типов формулирует конечный продукт и берёт ответственность?'), opts: [tri('Вейтер'), tri('Дуер'), tri('Виннер')], correct: 2 },
        { q: tri('Как проверять «красивые слова» о будущем на собеседовании?'), opts: [tri('Возвращать вопрос в прошлое — как было на последнем месте'), tri('Верить на слово'), tri('Спрашивать про планы на 5 лет')], correct: 0 },
      ],
    },
  },
  {
    id: 'productivity-winners', order: 2, price: 15,
    title: tri('Продуктивность и Виннеры', 'Produktywność i Winnerzy', 'Productivity and Winners'),
    desc: tri('Продукт должности, виннеры и дуеры, интервью на продуктивность и фактор таланта.',
      'Produkt stanowiska, winnerzy i doerzy, rozmowa produktywnościowa i czynnik talentu.',
      'The product of a role, winners and doers, the productivity interview and the talent factor.'),
    trailer: tri('', '', ''),
    sections: [
      { id: 'result-tools', title: tri('Резалт и Тулс', 'Result i Tools', 'Result & Tools'),
        desc: tri('Как читать тип продуктивности и спектр инструментов мышления.', 'Jak czytać typ produktywności i spektrum narzędzi myślenia.', 'How to read the productivity type and the thinking-tools spectrum.'), html: tri(
        `<p><b>Резалт</b> определяет тип продуктивности (виннер / дуер / вейтер) по открытым ответам. <b>Тулс</b> показывает спектр инструментов мышления: внимательность, уверенность, эффективность, отношения.</p>
         <p>Точка D (уверенность) — ключевой маркер надёжности. Смотрите не на отдельный показатель, а на общий силуэт спектра и синдромы.</p>`) },
      { id: 'logic-sales', title: tri('Логис и Сэйлс', 'Logic i Sales', 'Logic & Sales'),
        desc: tri('Уровень интеллекта под сложность роли и профиль продавца.', 'Poziom intelektu wobec złożoności roli i profil sprzedawcy.', 'Intelligence level for role complexity and the salesperson profile.'), html: tri(
        `<p><b>Логис</b> — уровень интеллекта (IQ). До 100 — простые решения, 100–120 — линейные роли, 120+ — руководящие и аналитические.</p>
         <p><b>Сэйлс</b> — профиль продавца по 12 показателям. Настойчивость и результативность важнее «мягких» шкал для активных продаж.</p>`) },
      { id: 'decision', title: tri('Кадровое решение', 'Decyzja kadrowa', 'The hiring decision'),
        desc: tri('Как собрать все сигналы в одно кадровое решение.', 'Jak zebrać wszystkie sygnały w jedną decyzję kadrową.', 'How to combine all signals into a single hiring decision.'), html: tri(
        `<p>Тесты — это отсев и подсказка, а не приговор. Сопоставляйте:</p>
         <ul><li>тип продуктивности (Резалт);</li><li>спектр качеств (Тулс);</li><li>интеллект под сложность роли (Логис);</li><li>опыт, мотивацию и референсы.</li></ul>
         <p>Финальное решение всегда за рекрутёром — после интервью и наведения справок.</p>`) },
    ],
    quiz: {
      passScore: 60,
      questions: [
        { q: tri('Какой показатель «Тулс» считается ключевым маркером надёжности?'), opts: [tri('Активность'), tri('Уверенность (D)'), tri('Позитивность')], correct: 1 },
        { q: tri('Уровень IQ 100–120 по «Логис» подходит для…'), opts: [tri('Только руководящих ролей'), tri('Линейных должностей'), tri('Не подходит ни для чего')], correct: 1 },
        { q: tri('Тесты в методике — это…'), opts: [tri('Окончательный приговор'), tri('Отсев и подсказка перед решением рекрутёра'), tri('Замена собеседованию')], correct: 1 },
      ],
    },
  },
  {
    id: 'interview-adapt', order: 3, price: 20,
    title: tri('Собеседование и адаптация', 'Rozmowa i adaptacja', 'Interview & onboarding'),
    desc: tri('Ситуационные кейсы на интервью, проверка «под давлением» и грамотный онбординг нового сотрудника.',
      'Kejsy sytuacyjne, sprawdzenie „pod presją” i wdrożenie nowego pracownika.',
      'Situational cases, checking under pressure and proper onboarding.'),
    trailer: tri('', '', ''),
    sections: [
      { id: 'prep', title: tri('Подготовка к интервью', 'Przygotowanie', 'Preparation'),
        desc: tri('Что собрать и подготовить перед интервью.', 'Co zebrać i przygotować przed rozmową.', 'What to gather and prepare before the interview.'), html: tri(
        `<p>Перед интервью соберите картину: результаты тестов, подсказку ИИ, зоны риска. Заранее выпишите 2–3 ситуационных кейса под конкретную роль.</p>`) },
      { id: 'cases', title: tri('Ситуационные кейсы', 'Kejsy sytuacyjne', 'Situational cases'),
        desc: tri('Ситуационные кейсы и проверка кандидата под давлением.', 'Kejsy sytuacyjne i sprawdzenie kandydata pod presją.', 'Situational cases and checking the candidate under pressure.'), html: tri(
        `<p>Вместо «расскажите о себе» давайте кейс: «Клиент недоволен и повышает голос — ваши действия?». Смотрите, как кандидат реагирует под давлением: жёстко/формально — риск; гибко и по существу — хороший знак.</p>`) },
      { id: 'onboarding', title: tri('Онбординг', 'Onboarding', 'Onboarding'),
        desc: tri('Первые недели: как быстро вывести новичка на результат.', 'Pierwsze tygodnie: jak szybko doprowadzić nowicjusza do wyniku.', 'The first weeks: how to get a newcomer to results fast.'), html: tri(
        `<p>Первые недели решают. Дайте новичку измеримый продукт должности, наставника-виннера и короткие циклы обратной связи. Так дуер быстро выходит на результат, а слабый профиль виден заранее.</p>`) },
    ],
    quiz: {
      passScore: 60,
      questions: [
        { q: tri('Зачем на интервью давать ситуационный кейс?'), opts: [tri('Чтобы увидеть реакцию под давлением'), tri('Чтобы заполнить время'), tri('Чтобы проверить знание теории')], correct: 0 },
        { q: tri('Что важно дать новичку в онбординге?'), opts: [tri('Только рабочее место'), tri('Измеримый продукт должности и наставника'), tri('Список правил без объяснений')], correct: 1 },
        { q: tri('Жёсткая и формальная реакция на недовольного клиента — это…'), opts: [tri('Хороший знак'), tri('Зона риска'), tri('Не имеет значения')], correct: 1 },
      ],
    },
  },
];

// Подмешиваем реальный контент программ (html разделов, трейлеры, квизы) из learning-content.js,
// оставляя цену/порядок/название из PROGRAMS. Так контент удобно дополнять языками и программами.
for (const p of PROGRAMS) {
  const c = CONTENT[p.id];
  if (!c) continue;
  if (c.trailer) p.trailer = c.trailer;
  if (c.sections) p.sections = c.sections;
  if (c.quiz) p.quiz = c.quiz;
}

function progOf(id) { return PROGRAMS.find(p => p.id === id) || null; }
function sortedPrograms() { return PROGRAMS.slice().sort((a, b) => a.order - b.order); }

function progressFor(user, p) {
  const st = (user && user.learning && user.learning[p.id]) || null;
  const purchased = !!(st && st.boughtAt);
  const sectionsDone = (st && st.sectionsDone) || [];
  const total = p.sections.length;
  const done = p.sections.filter(s => sectionsDone.includes(s.id)).length;
  const allSectionsDone = total > 0 && done >= total;
  const quizPassed = !!(st && st.quizPassed);
  const completed = !!(st && st.completedAt);
  const pct = total ? Math.round(100 * done / total) : 0;
  return { st, purchased, sectionsDone, done, total, allSectionsDone, quizPassed, completed, pct };
}

function prevProgram(p) {
  return sortedPrograms().filter(x => x.order < p.order).sort((a, b) => b.order - a.order)[0] || null;
}
// Разблокирована ли программа к покупке: предыдущая по порядку должна быть ЗАВЕРШЕНА.
function unlocked(user, p) {
  const prev = prevProgram(p);
  if (!prev) return true;
  return progressFor(user, prev).completed;
}
// Разблокирован ли ТРЕЙЛЕР: предыдущая программа должна быть КУПЛЕНА (необязательно завершена).
function trailerUnlocked(user, p) {
  const prev = prevProgram(p);
  if (!prev) return true;
  return progressFor(user, prev).purchased;
}

function listView(user, lang) {
  return sortedPrograms().map(p => {
    const pr = progressFor(user, p);
    return {
      id: p.id, order: p.order, price: p.price,
      title: L(p.title, lang), desc: L(p.desc, lang),
      sectionsCount: p.sections.length,
      purchased: pr.purchased, completed: pr.completed, quizPassed: pr.quizPassed,
      done: pr.done, total: pr.total, pct: pr.pct,
      unlocked: unlocked(user, p),
      trailer: L(p.trailer, lang), trailerUnlocked: trailerUnlocked(user, p),
    };
  });
}

function detailView(user, id, lang) {
  const p = progOf(id); if (!p) return null;
  const pr = progressFor(user, p);
  return {
    id: p.id, order: p.order, price: p.price,
    title: L(p.title, lang), desc: L(p.desc, lang),
    purchased: pr.purchased, completed: pr.completed, quizPassed: pr.quizPassed,
    unlocked: unlocked(user, p),
    done: pr.done, total: pr.total, pct: pr.pct, allSectionsDone: pr.allSectionsDone,
    sections: p.sections.map((s, i) => {
      // Последовательность: раздел открыт, только когда все предыдущие пройдены.
      const secUnlocked = i === 0 || p.sections.slice(0, i).every(x => pr.sectionsDone.includes(x.id));
      const hasBm = !!(pr.st && pr.st.bookmarks && Object.prototype.hasOwnProperty.call(pr.st.bookmarks, s.id));
      return {
        id: s.id, title: L(s.title, lang), desc: L(s.desc, lang),
        html: (pr.purchased && secUnlocked) ? L(s.html, lang) : '',
        done: pr.sectionsDone.includes(s.id),
        unlocked: secUnlocked,
        bookmark: hasBm ? pr.st.bookmarks[s.id] : null,
      };
    }),
    quiz: {
      passScore: p.quiz.passScore, count: p.quiz.questions.length,
      questions: pr.purchased ? p.quiz.questions.map((q, i) => ({ id: i, q: L(q.q, lang), opts: q.opts.map(o => L(o, lang)) })) : [],
    },
  };
}

function checkQuiz(p, answers) {
  const qs = p.quiz.questions;
  let correct = 0;
  qs.forEach((q, i) => { if (Number(answers[i]) === q.correct) correct++; });
  const pct = qs.length ? Math.round(100 * correct / qs.length) : 0;
  return { correct, total: qs.length, pct, passed: pct >= p.quiz.passScore };
}

module.exports = { PROGRAMS, progOf, sortedPrograms, progressFor, unlocked, trailerUnlocked, listView, detailView, checkQuiz, L };
