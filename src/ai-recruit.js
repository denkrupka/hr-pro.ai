'use strict';
// ИИ-ассистент этапов рекрутации (офлайн, эвристики + шаблоны).
// Анализ заявки, генерация объявления, анализ мотивации/референсов/знаний и итоговое решение.
const R = require('./recruitment');

function pick(o, lang) { return (o && (o[lang] || o.ru)) || ''; }
function val(form, key) { return String((form && form[key] != null ? form[key] : '') || '').trim(); }

const P = {
  // Заголовки анализа заявки
  a_profile: { ru: 'Профиль должности', pl: 'Profil stanowiska', en: 'Role profile' },
  a_target_performer: { ru: 'Целевой тип: Виннер. Руководящая должность — нужен только нацеленный на результат. Подчеркните в объявлении амбиции, высокие требования и рост.', pl: 'Typ docelowy: Winner. Stanowisko kierownicze — potrzebny wyłącznie nastawiony na wynik. W ogłoszeniu podkreśl ambicje, wysokie wymagania i rozwój.', en: 'Target type: Winner. A leadership role — only a results-driven person will do. In the ad, emphasise ambition, high standards and growth.' },
  a_target_choice: { ru: 'Целевой тип: Виннер или Дуер. Рядовая должность — подойдёт и нацеленный на результат Виннер, и надёжный исполнитель Дуер; тип выберите при генерации объявления.', pl: 'Typ docelowy: Winner lub Doer. Stanowisko szeregowe — sprawdzi się zarówno nastawiony na wynik Winner, jak i solidny Doer; typ wybierz przy generowaniu ogłoszenia.', en: 'Target type: Winner or Doer. A rank-and-file role — both a results-driven Winner and a reliable Doer will fit; choose the type when generating the ad.' },
  a_traits: { ru: 'Ключевые качества для проверки тестом «Тулс»: ', pl: 'Kluczowe cechy do sprawdzenia testem „Tools”: ', en: 'Key traits to verify with the “Tools” test: ' },
  a_missing: { ru: 'Не заполнено: ', pl: 'Nie wypełniono: ', en: 'Not filled in: ' },
  a_warn_edu: { ru: 'Требование высшего образования — убедитесь, что оно действительно необходимо (методика советует избегать лишних барьеров).', pl: 'Wymóg wyższego wykształcenia — upewnij się, że jest naprawdę konieczny (metodyka zaleca unikać zbędnych barier).', en: 'Higher-education requirement — make sure it is truly necessary (the method advises avoiding needless barriers).' },
  a_warn_age: { ru: 'Ограничение по возрасту/полу — используйте только при реальной обоснованности (риск дискриминации).', pl: 'Ograniczenie wieku/płci — stosuj tylko przy realnym uzasadnieniu (ryzyko dyskryminacji).', en: 'Age/gender restriction — use only when genuinely justified (discrimination risk).' },
  a_warn_product: { ru: 'Не описан продукт должности — без него сложно оценивать кандидатов. Уточните ожидаемый результат.', pl: 'Nie opisano produktu stanowiska — bez tego trudno oceniać kandydatów. Doprecyzuj oczekiwany wynik.', en: 'The role’s product is not described — hard to assess candidates without it. Clarify the expected result.' },
  a_ok: { ru: 'Заявка заполнена достаточно для запуска подбора.', pl: 'Wniosek wypełniony wystarczająco, by rozpocząć rekrutację.', en: 'The requisition is complete enough to start recruiting.' },
  // Мотивация
  m_verdict: { ru: 'Уровень мотивации: ', pl: 'Poziom motywacji: ', en: 'Motivation level: ' },
  m_hi: { ru: 'Сильная внутренняя мотивация — благоприятный признак для долгой работы.', pl: 'Silna motywacja wewnętrzna — dobry znak dla długiej współpracy.', en: 'Strong intrinsic motivation — a good sign for a long tenure.' },
  m_lo: { ru: 'Мотивация в основном внешняя (деньги/выгода) — выше риск быстрого ухода.', pl: 'Motywacja głównie zewnętrzna (pieniądze/korzyści) — wyższe ryzyko szybkiego odejścia.', en: 'Mostly extrinsic motivation (money/benefit) — higher risk of leaving soon.' },
  m_hint: { ru: 'Не делайте вывод по одному ответу — оценивайте совокупность ответов, опыт и результат теста «Тулс».', pl: 'Nie wyciągaj wniosków z jednej odpowiedzi — oceń całość odpowiedzi, doświadczenie i wynik testu „Tools”.', en: 'Don’t judge by one answer — assess the whole set of answers, experience and the “Tools” test.' },
  // Референсы
  r_verdict_hi: { ru: 'Референс сильно положительный', pl: 'Referencja zdecydowanie pozytywna', en: 'Strongly positive reference' },
  r_verdict_ok: { ru: 'Референс в целом положительный', pl: 'Referencja ogólnie pozytywna', en: 'Generally positive reference' },
  r_verdict_mid: { ru: 'Референс смешанный — уточните детали', pl: 'Referencja mieszana — dopytaj szczegóły', en: 'Mixed reference — clarify details' },
  r_verdict_lo: { ru: 'Референс скорее отрицательный', pl: 'Referencja raczej negatywna', en: 'Rather negative reference' },
  r_score: { ru: 'Итоговая оценка от источника: {n}/10.', pl: 'Ocena końcowa od źródła: {n}/10.', en: 'Final score from the source: {n}/10.' },
  r_hire: { ru: 'Готов нанять снова: {v}.', pl: 'Gotów zatrudnić ponownie: {v}.', en: 'Would hire again: {v}.' },
  r_mood: { ru: 'Наблюдайте за настроением собеседника: улучшается при воспоминании о продуктивном сотруднике.', pl: 'Obserwuj nastrój rozmówcy: poprawia się przy wspomnieniu produktywnego pracownika.', en: 'Watch the referee’s mood: it improves when recalling a productive employee.' },
  // Знания
  k_pass: { ru: 'Знания подтверждены', pl: 'Wiedza potwierdzona', en: 'Knowledge confirmed' },
  k_fail: { ru: 'Знаний недостаточно', pl: 'Niewystarczająca wiedza', en: 'Insufficient knowledge' },
  k_score: { ru: 'Верных ответов: {c}/{t} ({p}%).', pl: 'Poprawnych odpowiedzi: {c}/{t} ({p}%).', en: 'Correct answers: {c}/{t} ({p}%).' },
  // Итоговое решение
  d_hire: { ru: 'Рекомендация: направить к трудоустройству', pl: 'Rekomendacja: skierować do zatrudnienia', en: 'Recommendation: proceed to employment' },
  d_reject: { ru: 'Рекомендация: отказ', pl: 'Rekomendacja: odmowa', en: 'Recommendation: reject' },
  d_progress: { ru: 'Кандидат в процессе — пройдены не все этапы', pl: 'Kandydat w trakcie — nie wszystkie etapy ukończone', en: 'Candidate in progress — not all stages completed' },
  d_failed_at: { ru: 'Отсев на этапе: ', pl: 'Odsiew na etapie: ', en: 'Rejected at stage: ' },
  d_soft_fail: { ru: 'Ниже ожиданий (этап не критичен, процесс продолжается): ', pl: 'Poniżej oczekiwań (etap niekrytyczny, proces trwa): ', en: 'Below expectations (non-critical stage, process continues): ' },
  d_all_ok: { ru: 'Все этапы пройдены успешно.', pl: 'Wszystkie etapy zaliczone.', en: 'All stages passed successfully.' },
};
function TT(key, lang, vars) {
  let s = (P[key] && (P[key][lang] || P[key].ru)) || '';
  if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

// ---------- Анализ заявки ----------
function requisitionAnalysis(form, lang) {
  lang = lang || 'ru';
  form = form || {};
  const notes = [];
  const position = val(form, 'position') || '—';
  notes.push(TT('a_profile', lang) + ': ' + position + (val(form, 'product') ? ' — ' + val(form, 'product').slice(0, 140) : ''));

  // Руководящая должность — всегда Виннер; рядовая — Виннер или Дуер на выбор пользователя
  const boss = isBossPosition(position + ' ' + val(form, 'responsibilities'));
  notes.push(TT(boss ? 'a_target_performer' : 'a_target_choice', lang));

  // Качества
  let traits = form.traits;
  if (typeof traits === 'string') traits = traits.split(',').map(s => s.trim()).filter(Boolean);
  if (Array.isArray(traits) && traits.length) {
    notes.push(TT('a_traits', lang) + traits.map(k => R.traitLabel(k, lang)).join(', ') + '.');
  }

  // Предупреждения
  if (!val(form, 'product')) notes.push(TT('a_warn_product', lang));
  if (/высш|wyższe|higher|magister|диплом/i.test(val(form, 'education'))) notes.push(TT('a_warn_edu', lang));
  const ageV = val(form, 'age'), genderV = val(form, 'gender');
  if ((ageV && !/неважн|nieistotny|any|любой/i.test(ageV)) || (genderV && !/неважн|nieistotny|any|любой/i.test(genderV)))
    notes.push(TT('a_warn_age', lang));

  // Незаполненные ключевые поля
  const missing = R.REQUISITION_FIELDS.filter(f => ['position', 'product', 'responsibilities', 'salary'].includes(f.key) && !val(form, f.key));
  if (missing.length) notes.push(TT('a_missing', lang) + missing.map(f => f.label).join(', ') + '.');
  else notes.push(TT('a_ok', lang));

  const ready = !!val(form, 'position') && !!val(form, 'product');
  return { verdict: position, ready, notes };
}

// ---------- Генерация объявления ----------
// Методика (лекция «Объявления о найме»): объявление — приманка для продуктивных.
// Продуктивные любят преодолевать препятствия, поэтому «на крючок вешаем» вызов и
// сложности, а не «лёгкие деньги». Для виннера пишем о конечном продукте и результатах
// и просим список достижений; для дуэра — об объёме обязанностей и ответственности.
// Входящий поток (обучение, инструменты, поддержка) — умеренно, деньги — в последнюю очередь.
function generateAd(form, lang, opts) {
  lang = lang || 'ru';
  form = form || {};
  opts = opts || {};
  const position = val(form, 'position') || (lang === 'pl' ? 'Stanowisko' : lang === 'en' ? 'Position' : 'Должность');
  const company = opts.company || '';
  const product = val(form, 'product');
  const resp = val(form, 'responsibilities');
  const comps = val(form, 'competencies');
  const exp = val(form, 'experience');
  const edu = val(form, 'education');
  const otherReq = val(form, 'otherReq');
  const challenges = val(form, 'challenges');
  const travel = val(form, 'travel');
  const salary = val(form, 'salary') || val(form, 'probationSalary');
  // Руководящая должность — всегда Виннер; для рядовой тип задаёт пользователь (по умолчанию Виннер)
  const winner = isBossPosition(position) || opts.target !== 'executor';
  const q = (s) => lang === 'pl' ? `„${s}”` : lang === 'en' ? `“${s}”` : `«${s}»`;
  const pos = q(position);

  // Стиль примеров методики: коротко, хлёстко, вопрос-вызов, без канцелярита и длинных списков.
  const inline = s => String(s || '').split(/[\n;•]+/).map(x => x.trim()).filter(Boolean)
    .map((x, i) => i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1)).join(', ');
  const L = {
    // Хук-вызов (должность остаётся в именительном падеже — без ломаного склонения)
    hook_win: { ru: `${product ? `Умеешь давать результат — ${esc(product.toLowerCase())}? ` : 'Умеешь добиваться результата и можешь доказать это цифрами? '}Тогда докажи это делом: покажи, что делаешь больше, чем другие. Лёгких денег не обещаем — обещаем настоящий вызов.`,
      pl: `${product ? `Potrafisz dawać rezultat — ${esc(product.toLowerCase())}? ` : 'Osiągasz rezultaty i umiesz to udowodnić liczbami? '}To udowodnij to czynem: pokaż, że robisz więcej niż inni. Nie obiecujemy łatwych pieniędzy — obiecujemy prawdziwe wyzwanie.`,
      en: `${product ? `Can you deliver the result — ${esc(product.toLowerCase())}? ` : 'Do you deliver results and can prove it with numbers? '}Then prove it in action: show you do more than others. We don’t promise easy money — we promise a real challenge.` },
    hook_doer: { ru: `Любишь работу, где всё понятно и её много? Ищем на должность ${pos} человека, который не боится ответственности и доводит дела до конца.`,
      pl: `Lubisz pracę, w której wszystko jest jasne i jest jej dużo? Na stanowisko ${pos} szukamy osoby, która nie boi się odpowiedzialności i doprowadza sprawy do końca.`,
      en: `Do you like clear work and plenty of it? For the ${pos} role we need someone who isn’t afraid of responsibility and sees things through.` },
    task: { ru: 'Твоя задача', pl: 'Twoje zadanie', en: 'Your mission' },
    todo: { ru: 'Что предстоит', pl: 'Co będziesz robić', en: 'What you’ll do' },
    expect: { ru: 'Ждём от тебя', pl: 'Oczekujemy', en: 'We expect' },
    exp_win: { ru: 'и главное — реальные результаты на прошлых местах, цифрами', pl: 'a przede wszystkim — realne wyniki z poprzednich miejsc, w liczbach', en: 'and above all — real results from past jobs, in numbers' },
    exp_doer: { ru: 'и главное — желание работать', pl: 'a przede wszystkim — chęć do pracy', en: 'and above all — a real appetite for work' },
    offer_win: { ru: 'Взамен — амбициозные задачи, реальная ответственность и рост вместе с результатами.', pl: 'W zamian — ambitne zadania, realna odpowiedzialność i rozwój wraz z wynikami.', en: 'In return — ambitious goals, real responsibility and growth that follows your results.' },
    offer_doer: { ru: 'Взамен — обучение, поддержка руководителя и стабильная загрузка.', pl: 'W zamian — szkolenia, wsparcie przełożonego i stabilny zakres pracy.', en: 'In return — training, a supportive manager and a steady workload.' },
    pay: { ru: 'Оплата', pl: 'Wynagrodzenie', en: 'Pay' },
    notfit: { ru: 'Не откликайся, если не готов отвечать за результат.', pl: 'Nie aplikuj, jeśli nie jesteś gotów odpowiadać za wynik.', en: 'Don’t apply if you’re not ready to own the result.' },
    apply_win: { ru: 'Откликнись и приложи список своих достижений — он скажет о тебе больше, чем резюме.', pl: 'Zgłoś się i dołącz listę swoich osiągnięć — powie o Tobie więcej niż CV.', en: 'Apply and attach a list of your achievements — it says more about you than a CV.' },
    apply_doer: { ru: 'Откликнись — заполни короткую анкету, и мы свяжемся с тобой.', pl: 'Zgłoś się — wypełnij krótką ankietę, a my się odezwiemy.', en: 'Apply — fill in a short form and we’ll get back to you.' },
  };
  const g = k => L[k][lang] || L[k].ru;

  // Компактно: заголовок, хук-вызов, 1 строка задачи, 1 строка дел, 1 строка ожиданий, оффер, фильтр, CTA
  const lines = [];
  lines.push('<h2>' + esc(position) + (company ? ' — ' + esc(company) : '') + '</h2>');
  lines.push('<p>' + g(winner ? 'hook_win' : 'hook_doer') + '</p>');
  if (winner && product) lines.push('<p><b>' + g('task') + ':</b> ' + esc(product) + (challenges ? ' ' + (lang === 'pl' ? 'Nie będzie łatwo: ' : lang === 'en' ? 'It won’t be easy: ' : 'Будет непросто: ') + esc(challenges.toLowerCase()) : '') + '</p>');
  if (!winner && product) lines.push('<p><b>' + g('task') + ':</b> ' + esc(product) + '</p>');
  if (resp) lines.push('<p><b>' + g('todo') + ':</b> ' + esc(inline(resp)) + (travel ? ' · ' + esc(travel.toLowerCase()) : '') + '.</p>');
  const expectParts = [exp, comps, edu, otherReq].filter(Boolean).map(inline);
  lines.push('<p><b>' + g('expect') + ':</b> ' + (expectParts.length ? esc(expectParts.join(', ')) + ', ' : '') + g(winner ? 'exp_win' : 'exp_doer') + '.</p>');
  lines.push('<p>' + g(winner ? 'offer_win' : 'offer_doer') + (salary ? ' <b>' + g('pay') + ':</b> ' + esc(salary) + '.' : '') + '</p>');
  if (winner) lines.push('<p><i>' + g('notfit') + '</i></p>');
  lines.push('<p>' + g(winner ? 'apply_win' : 'apply_doer') + '</p>');
  return lines.join('\n');
}
// Руководящая должность (по методике для неё всегда нужен Виннер)
function isBossPosition(s) {
  return /руковод|директор|начальн|заведующ|управляющ|главн|kierownik|dyrektor|szef|prezes|zarządzając|head|chief|director|team lead|supervisor|ceo|coo|cto/i.test(String(s || ''));
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
function bullets(text) {
  const items = String(text).split(/[\n;•]+/).map(s => s.trim()).filter(Boolean);
  if (items.length <= 1) return '<p>' + esc(text) + '</p>';
  return '<ul>' + items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
}

// ---------- Генерация теста проверки знаний по материалам вакансии ----------
// Важно: кандидат ещё НЕ работает в компании и не может знать внутренностей заявки.
// Поэтому тест проверяет профессиональные знания в отрасли: заявка (должность, продукт,
// обязанности) используется, чтобы определить профессию и подобрать вопросы из банка
// (например, для продажника — классические вопросы на знание техники продаж),
// плюс универсальные вопросы рабочей культуры (результат vs процесс, приоритеты, ошибки).
// Результат — черновик, который рекрутёр может отредактировать в конструкторе.

// Банки вопросов: q — текст, ok — верные варианты, no — неверные, multi — несколько ответов
const KN_BANK = {
  sales: [
    { multi: false,
      q: { ru: 'Клиент говорит: «Это дорого». Каким должен быть первый шаг продавца?', pl: 'Klient mówi: „To za drogo”. Jaki powinien być pierwszy krok sprzedawcy?', en: 'A client says: “It’s too expensive.” What should the salesperson do first?' },
      ok: [{ ru: 'Выяснить, с чем клиент сравнивает и что для него стоит за словом «дорого»', pl: 'Dowiedzieć się, z czym klient porównuje i co dla niego znaczy „za drogo”', en: 'Find out what the client compares it with and what “expensive” means to them' }],
      no: [{ ru: 'Сразу предложить максимальную скидку', pl: 'Od razu zaproponować maksymalny rabat', en: 'Immediately offer the biggest discount' },
        { ru: 'Согласиться и завершить разговор', pl: 'Zgodzić się i zakończyć rozmowę', en: 'Agree and end the conversation' },
        { ru: 'Спорить и доказывать, что цена справедливая', pl: 'Spierać się i udowadniać, że cena jest uczciwa', en: 'Argue and prove the price is fair' }] },
    { multi: true,
      q: { ru: 'Что относится к классическим этапам продажи? (несколько вариантов)', pl: 'Co należy do klasycznych etapów sprzedaży? (kilka odpowiedzi)', en: 'Which of these are classic stages of a sale? (several answers)' },
      ok: [{ ru: 'Установление контакта', pl: 'Nawiązanie kontaktu', en: 'Making contact' },
        { ru: 'Выявление потребностей', pl: 'Badanie potrzeb', en: 'Discovering needs' },
        { ru: 'Презентация решения', pl: 'Prezentacja rozwiązania', en: 'Presenting the solution' },
        { ru: 'Работа с возражениями', pl: 'Praca z obiekcjami', en: 'Handling objections' }],
      no: [{ ru: 'Инвентаризация склада', pl: 'Inwentaryzacja magazynu', en: 'Stock-taking' },
        { ru: 'Согласование отпусков', pl: 'Ustalanie urlopów', en: 'Approving annual leave' }] },
    { multi: false,
      q: { ru: 'Зачем продавцу задавать клиенту вопросы?', pl: 'Po co sprzedawca zadaje klientowi pytania?', en: 'Why should a salesperson ask the client questions?' },
      ok: [{ ru: 'Чтобы понять задачу, критерии и бюджет клиента и предложить подходящее решение', pl: 'Aby zrozumieć zadanie, kryteria i budżet klienta i zaproponować właściwe rozwiązanie', en: 'To understand the client’s task, criteria and budget, and offer the right solution' }],
      no: [{ ru: 'Чтобы потянуть время', pl: 'Aby zyskać na czasie', en: 'To play for time' },
        { ru: 'Вопросы не нужны — главное хорошо презентовать', pl: 'Pytania są zbędne — najważniejsza jest dobra prezentacja', en: 'No need for questions — a good pitch is what matters' },
        { ru: 'Чтобы показать свою экспертность', pl: 'Aby pokazać swoją wiedzę', en: 'To show off expertise' }] },
    { multi: false,
      q: { ru: 'Клиент перестал отвечать после отправки предложения. Что правильнее сделать?', pl: 'Klient przestał odpowiadać po otrzymaniu oferty. Co zrobić?', en: 'A client goes silent after receiving the proposal. What’s the right move?' },
      ok: [{ ru: 'Напомнить о себе: уточнить, какие вопросы остались, и договориться о конкретном следующем шаге', pl: 'Przypomnieć o sobie: dopytać o wątpliwości i umówić konkretny następny krok', en: 'Follow up: ask what questions remain and agree on a concrete next step' }],
      no: [{ ru: 'Ждать, пока клиент сам напишет', pl: 'Czekać, aż klient sam napisze', en: 'Wait until the client writes back' },
        { ru: 'Отправить то же предложение ещё раз без изменений', pl: 'Wysłać tę samą ofertę jeszcze raz bez zmian', en: 'Send the same proposal again unchanged' },
        { ru: 'Удалить клиента из базы', pl: 'Usunąć klienta z bazy', en: 'Delete the client from the database' }] },
    { multi: false,
      q: { ru: 'Что важнее всего для повторных продаж и рекомендаций?', pl: 'Co jest najważniejsze dla ponownych zakupów i poleceń?', en: 'What matters most for repeat sales and referrals?' },
      ok: [{ ru: 'Клиент получил обещанный результат и доволен', pl: 'Klient otrzymał obiecany rezultat i jest zadowolony', en: 'The client got the promised result and is happy' }],
      no: [{ ru: 'Самая низкая цена на рынке', pl: 'Najniższa cena na rynku', en: 'The lowest price on the market' },
        { ru: 'Частые звонки клиенту', pl: 'Częste telefony do klienta', en: 'Frequent calls to the client' },
        { ru: 'Большой рекламный бюджет', pl: 'Duży budżet reklamowy', en: 'A big advertising budget' }] },
  ],
  service: [
    { multi: false,
      q: { ru: 'Клиент злится и повышает голос. Каким должен быть первый шаг?', pl: 'Klient jest zdenerwowany i podnosi głos. Jaki powinien być pierwszy krok?', en: 'A client is angry and raising their voice. What’s the right first step?' },
      ok: [{ ru: 'Спокойно выслушать до конца и показать, что вы поняли суть проблемы', pl: 'Spokojnie wysłuchać do końca i pokazać, że rozumiemy istotę problemu', en: 'Calmly hear them out and show you understood the problem' }],
      no: [{ ru: 'Перебить и объяснить, что клиент не прав', pl: 'Przerwać i wyjaśnić, że klient nie ma racji', en: 'Interrupt and explain the client is wrong' },
        { ru: 'Прекратить разговор', pl: 'Zakończyć rozmowę', en: 'End the conversation' },
        { ru: 'Сразу перевести на руководителя', pl: 'Od razu przełączyć do przełożonego', en: 'Immediately transfer to a manager' }] },
    { multi: false,
      q: { ru: 'Вы не знаете ответа на вопрос клиента. Как правильно поступить?', pl: 'Nie znasz odpowiedzi na pytanie klienta. Co zrobić?', en: 'You don’t know the answer to a client’s question. What’s right?' },
      ok: [{ ru: 'Честно сказать, что уточните, назвать срок и вернуться с ответом', pl: 'Uczciwie powiedzieć, że to sprawdzisz, podać termin i wrócić z odpowiedzią', en: 'Say honestly you’ll check, give a deadline and come back with the answer' }],
      no: [{ ru: 'Придумать правдоподобный ответ', pl: 'Wymyślić wiarygodną odpowiedź', en: 'Make up a plausible answer' },
        { ru: 'Сказать «это не ко мне»', pl: 'Powiedzieć „to nie do mnie”', en: 'Say “that’s not my job”' },
        { ru: 'Проигнорировать вопрос', pl: 'Zignorować pytanie', en: 'Ignore the question' }] },
  ],
  generic: [
    { multi: false,
      q: { ru: 'Чем в первую очередь измеряется результат работы сотрудника?', pl: 'Czym przede wszystkim mierzy się wynik pracy pracownika?', en: 'How is an employee’s result primarily measured?' },
      ok: [{ ru: 'Конечным продуктом — тем, что готово и чем можно пользоваться', pl: 'Końcowym produktem — tym, co jest gotowe i z czego można korzystać', en: 'By the end product — something finished that can be used' }],
      no: [{ ru: 'Количеством проведённых на работе часов', pl: 'Liczbą godzin spędzonych w pracy', en: 'By hours spent at work' },
        { ru: 'Занятостью и количеством усилий', pl: 'Zajętością i ilością wysiłku', en: 'By busyness and effort' },
        { ru: 'Красивым отчётом о проделанной работе', pl: 'Ładnym raportem z wykonanej pracy', en: 'By a nicely written activity report' }] },
    { multi: false,
      q: { ru: 'У вас несколько срочных задач одновременно. Как правильно поступить?', pl: 'Masz kilka pilnych zadań naraz. Co zrobić?', en: 'You have several urgent tasks at once. What’s the right approach?' },
      ok: [{ ru: 'Определить, что критичнее по результату и сроку, и начать с этого', pl: 'Ustalić, co jest najważniejsze pod względem wyniku i terminu, i od tego zacząć', en: 'Decide what is most critical by result and deadline, and start there' }],
      no: [{ ru: 'Делать все задачи по чуть-чуть параллельно', pl: 'Robić wszystko po trochu równolegle', en: 'Do a bit of everything in parallel' },
        { ru: 'Выполнять в порядке поступления, не разбираясь', pl: 'Wykonywać w kolejności zgłoszeń, bez analizy', en: 'Handle them in order of arrival without thinking' },
        { ru: 'Ждать, пока приоритеты расставит кто-то другой', pl: 'Czekać, aż ktoś inny ustali priorytety', en: 'Wait for someone else to set priorities' }] },
    { multi: false,
      q: { ru: 'Вы допустили ошибку, которую пока никто не заметил. Как правильно поступить?', pl: 'Popełniłeś błąd, którego nikt jeszcze nie zauważył. Co zrobić?', en: 'You made a mistake nobody has noticed yet. What’s right?' },
      ok: [{ ru: 'Сообщить, исправить и предложить, как не допустить повторения', pl: 'Zgłosić, naprawić i zaproponować, jak uniknąć powtórki', en: 'Report it, fix it and suggest how to prevent it happening again' }],
      no: [{ ru: 'Молчать — возможно, никто не узнает', pl: 'Milczeć — może nikt się nie dowie', en: 'Stay silent — maybe nobody will find out' },
        { ru: 'Подождать, пока заметят', pl: 'Poczekać, aż ktoś zauważy', en: 'Wait until someone notices' }] },
  ],
};
// Определяем профессию по должности/обязанностям/продукту из заявки и тексту объявления
function detectProfession(form, adText) {
  const hay = [form.position, form.responsibilities, form.product, form.competencies, adText].join(' ').toLowerCase();
  if (/продаж|продав|торгов|sprzeda|handlow|sales|handel/.test(hay)) return 'sales';
  if (/обслуж|поддерж|консульт|оператор|колл-центр|клиент|obsług|serwis|konsult|infolini|support|customer|call cent/.test(hay)) return 'service';
  return null;
}
function generateKnowledgeTest(form, adText, lang) {
  lang = lang || 'ru';
  form = form || {};
  const pick = o => o[lang] || o.ru;
  const qs = [];
  let n = 0;
  const mk = (text, correct, wrong, multi) => {
    const options = correct.map(t => ({ text: t, correct: true })).concat(wrong.map(t => ({ text: t, correct: false })));
    // перемешиваем детерминированно (по длине), чтобы правильные не были всегда сверху
    options.sort((a, b) => (a.text.length % 3) - (b.text.length % 3));
    qs.push({ id: 'ai' + (++n), text, type: multi ? 'multi' : 'single', image: '', video: '', options });
  };
  // Вопрос «результат vs процесс» на материале заявки: продукт должности назван в самой
  // вакансии/объявлении, а отличить результат от процесса — профессиональная культура
  const product = String(form.product || '').trim();
  const position = String(form.position || '').trim();
  if (product) {
    const qProd = {
      ru: `Что из перечисленного — полноценный конечный результат работы${position ? ` на должности «${position}»` : ''}, а не просто процесс?`,
      pl: `Co z poniższych jest pełnowartościowym końcowym rezultatem pracy${position ? ` na stanowisku „${position}”` : ''}, a nie tylko procesem?`,
      en: `Which of these is a real end result of the ${position ? `“${position}” ` : ''}job, not just activity?`,
    };
    const dProd = {
      ru: ['Присутствие на рабочем месте с 9 до 17', 'Выполнение поручений руководителя', 'Красиво оформленный отчёт о работе'],
      pl: ['Obecność w pracy od 9 do 17', 'Wykonywanie poleceń przełożonego', 'Ładnie przygotowany raport z pracy'],
      en: ['Being at the workplace from 9 to 5', 'Following the manager’s instructions', 'A nicely formatted work report'],
    };
    mk(pick(qProd), [product.slice(0, 300)], pick(dProd), false);
  }
  // Профессиональные вопросы отрасли + универсальные вопросы рабочей культуры
  const prof = detectProfession(form, adText);
  const bank = (prof ? KN_BANK[prof] : []).concat(KN_BANK.generic);
  for (const b of bank) {
    if (qs.length >= 8) break;
    mk(pick(b.q), b.ok.map(pick), b.no.map(pick), b.multi);
  }
  return qs;
}

// ---------- Мотивация ----------
function motivationAnalysis(levelKey, lang) {
  lang = lang || 'ru';
  const lvl = R.MOTIVATION_LEVELS.find(m => m.key === levelKey);
  const notes = [];
  if (lvl) {
    notes.push(TT('m_verdict', lang) + pick(lvl, lang) + ' — ' + pick({ ru: lvl.d_ru, pl: lvl.d_pl, en: lvl.d_en }, lang));
    notes.push(lvl.score >= 3 ? TT('m_hi', lang) : TT('m_lo', lang));
  }
  notes.push(TT('m_hint', lang));
  const verdict = lvl ? pick(lvl, lang) : '—';
  return { verdict, tone: lvl && lvl.score >= 3 ? 'good' : lvl && lvl.score === 2 ? 'mid' : 'low', notes };
}

// ---------- Референсы ----------
function referencesAnalysis(answers, lang) {
  lang = lang || 'ru';
  answers = answers || {};
  const notes = [];
  const score10 = parseInt(answers.r15, 10);
  // r5 (эффективность): индекс 0 лучший
  const eff = typeof answers.r5 === 'number' ? answers.r5 : parseInt(answers.r5, 10);
  const hire = typeof answers.r13 === 'number' ? answers.r13 : parseInt(answers.r13, 10);
  let good = 0, bad = 0;
  if (!isNaN(score10)) { if (score10 >= 8) good += 2; else if (score10 >= 6) good += 1; else if (score10 <= 4) bad += 2; }
  if (!isNaN(eff)) { if (eff <= 1) good += 1; else if (eff >= 4) bad += 1; }
  if (!isNaN(hire)) { if (hire <= 1) good += 1; else if (hire >= 3) bad += 1; }
  let verdict, tone;
  if (good - bad >= 3) { verdict = TT('r_verdict_hi', lang); tone = 'good'; }
  else if (good - bad >= 1) { verdict = TT('r_verdict_ok', lang); tone = 'good'; }
  else if (good - bad <= -2) { verdict = TT('r_verdict_lo', lang); tone = 'low'; }
  else { verdict = TT('r_verdict_mid', lang); tone = 'mid'; }
  if (!isNaN(score10)) notes.push(TT('r_score', lang, { n: score10 }));
  const q = R.REFERENCE_QUESTIONS.find(x => x.id === 'r13');
  if (!isNaN(hire) && q && q.opts[hire]) notes.push(TT('r_hire', lang, { v: (q.opts[hire][lang] || q.opts[hire].ru) }));
  notes.push(TT('r_mood', lang));
  return { verdict, tone, notes };
}

// ---------- Знания ----------
function knowledgeAnalysis(correct, total, passScore, lang) {
  lang = lang || 'ru';
  const percent = total ? Math.round(100 * correct / total) : 0;
  const pass = percent >= (passScore || 60);
  return { verdict: pass ? TT('k_pass', lang) : TT('k_fail', lang), pass, percent,
    notes: [TT('k_score', lang, { c: correct, t: total, p: percent })] };
}

// ---------- Итоговое решение по кандидату ----------
// wf: { result:{status}, tools:{...}, knowledge:{pass}, motivation:{score}, references:{tone} }
// critical — критерии отбора вакансии: некритичный провал не даёт отказ, только заметку
function workflowDecision(wf, stages, lang, critical) {
  lang = lang || 'ru';
  const notes = [];
  let failedStage = null;
  const isCrit = k => !critical || critical[k] !== false;
  for (const key of stages) {
    const st = wf[key];
    if (!st) return { verdict: TT('d_progress', lang), decision: null, notes };
    if (st.passed === false) {
      if (isCrit(key)) { failedStage = key; break; }
      notes.push(TT('d_soft_fail', lang) + R.stageTitle(key, lang));
      continue;
    }
    if (st.status && st.status !== 'done' && st.status !== 'passed') return { verdict: TT('d_progress', lang), decision: null, notes };
  }
  if (failedStage) {
    notes.push(TT('d_failed_at', lang) + R.stageTitle(failedStage, lang));
    return { verdict: TT('d_reject', lang), decision: 'rejected', notes };
  }
  notes.push(TT('d_all_ok', lang));
  return { verdict: TT('d_hire', lang), decision: 'hired', notes };
}

module.exports = { requisitionAnalysis, generateAd, generateKnowledgeTest, motivationAnalysis, referencesAnalysis, knowledgeAnalysis, workflowDecision };
