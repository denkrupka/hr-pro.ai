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
// Контент 3-й программы «Выявление продуктивных кандидатов» — отдельным модулем (ru/en/pl).
try { Object.assign(CONTENT, require('./learning-content-productive')); } catch (_) {}
// Программы «Личностные качества» (Основы / Уверенность / Продуктивность) — пока RU, языки позже.
try { Object.assign(CONTENT, require('./learning-content-mod1')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod2')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod3')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod4')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod5')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod6')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod7')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod8')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod9')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod10')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod11')); } catch (_) {}
try { Object.assign(CONTENT, require('./learning-content-mod12')); } catch (_) {}
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
    id: 'finding-producers', order: 3, price: 20,
    title: tri('Выявление продуктивных кандидатов', 'Rozpoznawanie produktywnych kandydatów', 'Identifying Productive Candidates'),
    desc: tri('Интервью на продуктивность: продукт должности, виннеры и дуеры, главный вопрос — и как за пять минут увидеть, кто принесёт результат.',
      'Wywiad produktywnościowy: produkt stanowiska, winnerzy i doerzy, kluczowe pytanie — i jak w pięć minut rozpoznać, kto przyniesie wyniki.',
      'The productivity interview: the product of a role, winners and doers, the key question — and how to see in five minutes who will deliver results.'),
    // Трейлер и полный контент (6 разделов + квиз) подмешиваются из learning-content-productive.js.
    trailer: tri('/media/learn3-trailer-ru.mp4', '/media/learn3-trailer-pl.mp4', '/media/learn3-trailer-en.mp4'),
    sections: [
      { id: 'intro', title: tri('Введение', 'Introduction', 'Wprowadzenie'),
        desc: tri('О чём это руководство и почему продуктивность важнее резюме.', 'What this guide is about and why productivity matters more than a résumé.', 'O czym jest ten przewodnik i dlaczego produktywność jest ważniejsza niż CV.'), html: tri('<p>Материал загружается…</p>') },
      { id: 'product', title: tri('Продукт должности', 'The product of a role', 'Produkt stanowiska'),
        desc: tri('Шаг 0: что такое продукт и как объяснить это слово.', 'Step 0: what a product is and how to explain the word.', 'Krok 0: czym jest produkt i jak wyjaśnić to słowo.'), html: tri('<p>Материал загружается…</p>') },
      { id: 'winner-doer', title: tri('Виннер и дуер', 'Winner and doer', 'Winner i doer'),
        desc: tri('В чём разница и кому кто подходит.', 'The difference and who fits whom.', 'Na czym polega różnica i kto do kogo pasuje.'), html: tri('<p>Материал загружается…</p>') },
      { id: 'main-question', title: tri('Главный вопрос', 'The key question', 'Kluczowe pytanie'),
        desc: tri('Шаг 1: главный вопрос интервью, второй шанс и «пиар».', 'Step 1: the key question, the second chance and “PR”.', 'Krok 1: kluczowe pytanie, druga szansa i „PR”.'), html: tri('<p>Материал загружается…</p>') },
      { id: 'measure', title: tri('Как измерять результат', 'How to measure results', 'Jak mierzyć wyniki'),
        desc: tri('Шаги 2–3: «как измеряли» и «сколько произвели».', 'Steps 2–3: “how you measured” and “how much you produced”.', 'Kroki 2–3: „jak mierzyłeś” i „ile wyprodukowałeś”.'), html: tri('<p>Материал загружается…</p>') },
      { id: 'summary', title: tri('Итоги', 'Summary', 'Podsumowanie'),
        desc: tri('Как за пять минут увидеть продуктивного кандидата.', 'How to spot a productive candidate in five minutes.', 'Jak w pięć minut rozpoznać produktywnego kandydata.'), html: tri('<p>Материал загружается…</p>') },
    ],
    quiz: {
      passScore: 60,
      questions: [
        { q: tri('Что такое «продукт должности»?'), opts: [tri('Список обязанностей'), tri('Конечный результат, за который платят'), tri('Отработанные часы')], correct: 1 },
        { q: tri('Кто формулирует продукт и мыслит результатом?'), opts: [tri('Дуер'), tri('Виннер'), tri('Вейтер')], correct: 1 },
        { q: tri('Почему «пиар» кандидата опасен для бизнеса?'), opts: [tri('Красивые слова не равны результату'), tri('Это всегда обман'), tri('Это неважно')], correct: 0 },
      ],
    },
  },
  // ── Линейка «Личностные качества» (полный контент подмешивается из learning-content-mod1..4.js; пока RU) ──
  {
    id: 'module-foundations', order: 4, price: 20,
    title: tri('Личностные качества (Основы)', 'Cechy osobowości (Podstawy)', 'Personality traits (Basics)'),
    desc: tri('Рабочая модель разума и закон обмена — фундамент, на котором держится вся технология найма. Сможете понимать, почему люди ведут себя именно так, и что на самом деле измеряет тест.',
      'Robocza model umysłu i prawo wymiany — fundament, na którym opiera się cała technologia rekrutacji. Zrozumiesz, dlaczego ludzie zachowują się właśnie tak i co naprawdę mierzy test.',
      'A working model of the mind and the law of exchange — the foundation the whole hiring technology rests on. You’ll understand why people behave the way they do and what the test actually measures.'),
    trailer: tri('/media/module1-trailer-ru.mp4', '', ''),
    sections: [{ id: 'intro', title: tri('Основы'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-point-d', order: 5, price: 20,
    title: tri('Личностные качества (Уверенность)', 'Cechy osobowości (Pewność)', 'Personality traits (Confidence)'),
    desc: tri('Стержень теста — предсказуемость человека и связка «D + активность». Сможете по одному показателю понять, надёжен ли сотрудник и можно ли доверять остальным точкам его теста, — и не «сгорать» на импульсивных.',
      'Rdzeń testu — przewidywalność człowieka i połączenie „D + aktywność”. Po jednym wskaźniku ocenisz, czy pracownik jest niezawodny i czy można ufać pozostałym punktom jego testu — i nie „sparzysz się” na impulsywnych.',
      'The core of the test — a person’s predictability and the “D + activity” pairing. From a single indicator you’ll tell whether an employee is reliable and whether the other points of their test can be trusted — and avoid getting burned by impulsive ones.'),
    trailer: tri('/media/module2-trailer-ru.mp4', '', ''),
    sections: [{ id: 'intro', title: tri('Точка D'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-states', order: 6, price: 20,
    title: tri('Личностные качества (Продуктивность)', 'Cechy osobowości (Produktywność)', 'Personality traits (Productivity)'),
    desc: tri('Что делать с новичком в первые часы и дни + универсальные формулы состояний (несуществование и опасность). Сможете вводить нового сотрудника так, чтобы он приносил пользу с первого дня, а не «скисал» через три недели.',
      'Co robić z nowicjuszem w pierwszych godzinach i dniach + uniwersalne formuły stanów (nieistnienie i zagrożenie). Wdrożysz nowego pracownika tak, by przynosił pożytek od pierwszego dnia, a nie „skisł” po trzech tygodniach.',
      'What to do with a newcomer in the first hours and days + universal formulas of states (non-existence and danger). You’ll onboard a new hire so they add value from day one instead of fizzling out after three weeks.'),
    trailer: tri('/media/module3-trailer-ru.mp4', '', ''),
    sections: [{ id: 'intro', title: tri('Продуктивность'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-assessment', order: 7, price: 20,
    title: tri('Личностные качества (Оценка тестов: Основа)', 'Cechy osobowości (Ocena testów: Podstawa)', 'Personality traits (Test assessment: Basics)'),
    desc: tri('Истина и ложь за каждой точкой теста, наблюдение и конфронт. Сможете использовать тест не для отбраковки, а для усиления работающих сотрудников — и понимать, кому давать оценку, а кому нет.',
      'Prawda i fałsz za każdym punktem testu, obserwacja i konfront. Wykorzystasz test nie do odsiewania, lecz do wzmacniania pracujących ludzi — i zrozumiesz, komu przekazywać ocenę, a komu nie.',
      'Truth and lie behind each test point, observation and confront. You’ll use the test not to weed people out but to strengthen working employees — and know who to give an assessment to and who not.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Оценка тестов'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-delivery-steps', order: 8, price: 20,
    title: tri('Личностные качества (Оценка: Шаги предоставления)', 'Cechy osobowości (Ocena: Kroki przekazania)', 'Personality traits (Assessment: Delivery steps)'),
    desc: tri('Пошаговый разбор самой беседы-оценки — от первой фразы до результата. Сможете провести оценку так, чтобы человек сам всё увидел и изменился, доведя дело до конкретного продукта.',
      'Analiza krok po kroku samej rozmowy-oceny — od pierwszego zdania do rezultatu. Przeprowadzisz ocenę tak, by człowiek sam wszystko zobaczył i zmienił się, doprowadzając sprawę do konkretnego produktu.',
      'A step-by-step breakdown of the assessment conversation itself — from the first sentence to the result. You’ll deliver the assessment so the person sees everything themselves and changes, carrying it through to a concrete product.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Шаги предоставления'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-abc', order: 9, price: 20,
    title: tri('Личностные качества (Точки A, B, C)', 'Cechy osobowości (Punkty A, B, C)', 'Personality traits (Points A, B, C)'),
    desc: tri('Первая тройка точек личности: внимательность (A), позитивность (B) и самообладание (C) — с «инструкцией по эксплуатации» под каждую. Сможете читать эти точки в тесте, грамотно говорить о них с человеком в шаге о плюсах и подсказывать необученному руководителю, как обращаться с таким сотрудником.',
      'Pierwsza trójka punktów osobowości: uważność (A), pozytywność (B) i opanowanie (C) — z „instrukcją obsługi” do każdego. Nauczysz się czytać te punkty w teście, mądrze rozmawiać o nich z człowiekiem na etapie plusów i podpowiadać nieprzeszkolonemu menedżerowi, jak obchodzić się z takim pracownikiem.',
      'The first three personality points: attention (A), positivity (B) and composure (C) — each with its own “operating manual”. You’ll read these points in the test, talk about them with the person correctly during the strengths step, and coach an untrained manager on how to handle such an employee.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Точки A, B, C'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-def', order: 10, price: 20,
    title: tri('Личностные качества (Точки D, E, F и Треугольник АРО)', 'Cechy osobowości (Punkty D, E, F i Trójkąt ARO)', 'Personality traits (Points D, E, F and the ARC Triangle)'),
    desc: tri('Фундаментальный закон «аффинити — реальность — общение» плюс активность (E) и настойчивость (F). Сможете менять реальность человека, начиная с того, с чем он уже согласен, и правильно подавать точки D, E, F в оценке — включая приём «разворот упрямства» для очень высокой D.',
      'Fundamentalne prawo „affinity — rzeczywistość — komunikacja” plus aktywność (E) i wytrwałość (F). Nauczysz się zmieniać rzeczywistość człowieka, zaczynając od tego, z czym już się zgadza, i właściwie przedstawiać punkty D, E, F w ocenie — łącznie z techniką „odwrócenia uporu” przy bardzo wysokim D.',
      'The fundamental law of “affinity — reality — communication” plus activity (E) and persistence (F). You’ll change a person’s reality by starting from what they already agree with, and present points D, E, F correctly in the assessment — including the “stubbornness reversal” technique for a very high D.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Точки D, E, F и АРО'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-g', order: 11, price: 20,
    title: tri('Личностные качества (Точка G)', 'Cechy osobowości (Punkt G)', 'Personality traits (Point G)'),
    desc: tri('Самая непонятая точка: ответственность как устойчивость экстраверсии (модель «пушки»), где низкая G — это ранимость, а не «безответственность». Сможете верно читать эту точку и не отбраковывать ценных людей, распознавать компульсивную ответственность и манипуляцию и говорить об ответственности так, чтобы не задеть человека.',
      'Najbardziej niezrozumiany punkt: odpowiedzialność jako odporność ekstrawersji (model „armaty”), gdzie niskie G to wrażliwość, a nie „nieodpowiedzialność”. Nauczysz się poprawnie czytać ten punkt i nie odrzucać wartościowych ludzi, rozpoznawać kompulsywną odpowiedzialność i manipulację oraz mówić o odpowiedzialności tak, by nie urazić człowieka.',
      'The most misunderstood point: responsibility as the stability of extraversion (the “cannon” model), where a low G is vulnerability, not “irresponsibility”. You’ll read this point correctly and stop rejecting valuable people, recognize compulsive responsibility and manipulation, and talk about responsibility without hurting the person.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Точка G'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-hij', order: 12, price: 20,
    title: tri('Личностные качества (Точки H, I, J)', 'Cechy osobowości (Punkty H, I, J)', 'Personality traits (Points H, I, J)'),
    desc: tri('Последняя тройка точек: объективность / правильность оценки (H), чуткость (I) и общительность (J) — плюс приём «ассист» и навык подтверждения. Здесь же важное предупреждение: название точки J обманчиво и показывает «яркость», а не то, насколько хорошо человек общается. Сможете дочитать тест до конца по всем десяти точкам, гасить конфликты через согласие, распознавать «холодность» и теплоту сотрудника — и одним навыком подтверждения снимать до половины конфликтов в команде.',
      'Ostatnia trójka punktów: obiektywność / trafność oceny (H), empatia (I) i towarzyskość (J) — plus technika „asysty” i umiejętność potwierdzania. Tutaj ważne ostrzeżenie: nazwa punktu J jest myląca i pokazuje „jaskrawość”, a nie to, jak dobrze człowiek się komunikuje. Doczytasz test do końca po wszystkich dziesięciu punktach, wygasisz konflikty przez zgodę, rozpoznasz „chłód” i ciepło pracownika — i jedną umiejętnością potwierdzania zdejmiesz do połowy konfliktów w zespole.',
      'The last three points: objectivity / correctness of judgment (H), empathy (I) and sociability (J) — plus the “assist” technique and the acknowledgement skill. An important warning here: the name of point J is misleading — it shows “brightness”, not how well a person actually communicates. You’ll read the test through to the end across all ten points, defuse conflicts through agreement, recognize an employee’s coldness and warmth — and remove up to half of team conflicts with the single skill of acknowledgement.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Точки H, I, J'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-demo', order: 13, price: 20,
    title: tri('Личностные качества (Демонстрация оценки и шаги 3–4)', 'Cechy osobowości (Demonstracja oceny i kroki 3–4)', 'Personality traits (Assessment demonstration and steps 3–4)'),
    desc: tri('Разбор на живом тесте: как выбирать и выстраивать плюсы (шаг 2b), как обходиться с очень слабым, но продуктивным тестом, и как переходить к минусам (шаги 3–4) по правилу «смазки» — пара фраз о плюсе перед каждым минусом. Полная демонстрация разговора о минусах показана на точке D. Сможете провести оценку целиком — от вступления до разбора минусов — усиливая сотрудника по принципу постепенности и не задевая его. Этим завершается методика оценки (Часть II).',
      'Analiza na żywym teście: jak wybierać i budować plusy (krok 2b), jak postępować z bardzo słabym, ale produktywnym testem, i jak przechodzić do minusów (kroki 3–4) według zasady „smaru” — kilka zdań o plusie przed każdym minusem. Pełna demonstracja rozmowy o minusach pokazana na punkcie D. Przeprowadzisz ocenę w całości — od wstępu do omówienia minusów — wzmacniając pracownika zgodnie z zasadą stopniowości i nie raniąc go. Na tym kończy się metodyka oceny (Część II).',
      'A walk-through on a live test: how to choose and build up the pluses (step 2b), how to handle a very weak but productive test, and how to move on to the minuses (steps 3–4) by the “lubrication” rule — a couple of sentences about a plus before every minus. A full demonstration of the minus conversation is shown on point D. You’ll run the whole assessment — from the opening to the minuses — strengthening the employee gradually and without hurting them. This completes the assessment methodology (Part II).'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Демонстрация и шаги 3–4'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-tools', order: 14, price: 20,
    title: tri('Личностные качества (Тест Тулс)', 'Cechy osobowości (Test Tools)', 'Personality traits (The Tools test)'),
    desc: tri('Начало Части III: что именно измеряет тест (десять «инструментов» эффективности), почему он работает только в связке с тестом продуктивности «Тест Резалт», что такое пять диапазонов и компульсивная точка — и практическое чтение всех десяти точек с их низким / высоким / компульсивным вариантами и примерами вопросов. Сможете быстро и по делу читать любой тест: видеть сильные и слабые «инструменты» человека, распознавать компульсивность и «плавающие» точки под подавлением и делать по каждой точке выводы для подбора и управления.',
      'Początek Części III: co dokładnie mierzy test (dziesięć „narzędzi” efektywności), dlaczego działa tylko w połączeniu z testem produktywności „Test Result”, czym jest pięć zakresów i punkt kompulsywny — oraz praktyczne czytanie wszystkich dziesięciu punktów z ich wariantami niskim / wysokim / kompulsywnym i przykładami pytań. Nauczysz się szybko i rzeczowo czytać każdy test: widzieć mocne i słabe „narzędzia” człowieka, rozpoznawać kompulsywność i „pływające” punkty pod tłumieniem oraz wyciągać z każdego punktu wnioski do rekrutacji i zarządzania.',
      'The start of Part III: what exactly the test measures (ten “tools” of effectiveness), why it only works together with the “Result” productivity test, what the five ranges and the compulsive point are — and a practical reading of all ten points with their low / high / compulsive variants and sample questions. You’ll read any test quickly and to the point: see a person’s strong and weak “tools”, recognize compulsivity and “floating” points under suppression, and draw conclusions for hiring and management from each point.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Тест Тулс'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
  },
  {
    id: 'module-syndromes', order: 15, price: 20,
    title: tri('Личностные качества (Синдромы «Тест Тулс»)', 'Cechy osobowości (Syndromy „Test Tools”)', 'Personality traits (“Tools test” syndromes)'),
    desc: tri('Заключительный модуль: каталог синдромов — три зоны теста (быть / делать / иметь), синдромы соотношений точек (рутина/новое, «бросает дела»/«ленивый»), плавающие точки и ПИН под подавлением, а также готовые сочетания (обвиняющий, плюшевый мишка, динамит, лояльный, карьерист и др.). Сможете читать тест как единую картину: по трём зонам и характерным сочетаниям точек быстро понимать человека, прогнозировать его поведение в работе и отношениях и точнее принимать решения о найме и расстановке.',
      'Moduł końcowy: katalog syndromów — trzy strefy testu (być / robić / mieć), syndromy relacji punktów (rutyna/nowość, „porzuca sprawy”/„leniwy”), pływające punkty i PIN pod tłumieniem oraz gotowe kombinacje (oskarżający, pluszowy miś, dynamit, lojalny, karierowicz i in.). Nauczysz się czytać test jako jeden obraz: po trzech strefach i charakterystycznych kombinacjach punktów szybko rozumieć człowieka, prognozować jego zachowanie w pracy i relacjach oraz trafniej decydować o rekrutacji i rozstawieniu.',
      'The final module: a catalog of syndromes — the three test zones (be / do / have), point-ratio syndromes (routine/novelty, “drops things”/“lazy”), floating points and the PIN under suppression, plus ready-made combinations (the accuser, the teddy bear, dynamite, the loyal one, the careerist, etc.). You’ll read the test as a single picture: using the three zones and characteristic point combinations to quickly understand a person, predict their behavior at work and in relationships, and make sharper hiring and placement decisions.'),
    trailer: tri('', '', ''),
    sections: [{ id: 'intro', title: tri('Синдромы'), desc: tri('Материал загружается…'), html: tri('<p>Материал загружается…</p>') }],
    quiz: { passScore: 60, questions: [{ q: tri('Готовы начать?'), opts: [tri('Да'), tri('Позже')], correct: 0 }] },
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
