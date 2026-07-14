'use strict';
// Модуль рекрутации: справочники и бизнес-логика полного workflow найма.
// Источник — методология MaxMaster (документы «WPROWADZENIE NA STANOWISKO»):
//   Заявка (форма подбора) → Объявление → Result → Tools → Проверка знаний →
//   Мотивация → Референсы → Решение (найм/отказ).
// Все справочники трёхъязычны (ru/pl/en). Польский взят из первоисточников.

// ---------- Этапы workflow кандидата ----------
// order — порядок; key — идентификатор; тип test — переиспользует движок тестов.
const WORKFLOW_STAGES = [
  { key: 'result',     kind: 'test',       title: { ru: 'Продуктивность (Резалт)', pl: 'Produktywność (Result)', en: 'Productivity (Result)' } },
  { key: 'references', kind: 'references',  title: { ru: 'Референсы',                 pl: 'Referencje',             en: 'References' } },
  { key: 'tools',      kind: 'test',       title: { ru: 'Личность (Тулс)',          pl: 'Osobowość (Tools)',      en: 'Personality (Tools)' } },
  { key: 'motivation', kind: 'motivation', title: { ru: 'Уровень мотивации',         pl: 'Poziom motywacji',       en: 'Motivation level' } },
  { key: 'knowledge',  kind: 'knowledge',  title: { ru: 'Проверка знаний',          pl: 'Sprawdzenie wiedzy',     en: 'Knowledge check' } },
];
const STAGE_KEYS = WORKFLOW_STAGES.map(s => s.key);

// ---------- 12 личностных качеств (из формы подбора, п.11) ----------
// Ключи соответствуют показателям, которые оценивает тест Тулс.
// 10 точек A–J теста «Тулс» — качества заявки совпадают с тем, что реально проверяет тест.
const PERSONALITY_TRAITS = [
  { key: 'A', ru: 'A · Внимательность', pl: 'A · Uważność', en: 'A · Attentiveness',
    d_ru: 'Способность концентрироваться на задаче и замечать детали и отклонения.',
    d_pl: 'Zdolność koncentracji na zadaniu i dostrzegania szczegółów oraz odchyleń.',
    d_en: 'Ability to concentrate on a task and notice details and deviations.' },
  { key: 'B', ru: 'B · Позитивность', pl: 'B · Pozytywność', en: 'B · Positivity',
    d_ru: 'Общий настрой и оптимизм; поддерживает коллектив и клиентов.',
    d_pl: 'Ogólne nastawienie i optymizm; wspiera zespół i klientów.',
    d_en: 'Overall attitude and optimism; lifts the team and clients.' },
  { key: 'C', ru: 'C · Самообладание', pl: 'C · Samokontrola', en: 'C · Composure',
    d_ru: 'Спокойствие и устойчивость под давлением, в конфликтах и при потоке людей.',
    d_pl: 'Spokój i stabilność pod presją, w konfliktach i przy dużym ruchu.',
    d_en: 'Calm and stability under pressure, in conflicts and heavy people flow.' },
  { key: 'D', ru: 'D · Уверенность', pl: 'D · Pewność', en: 'D · Certainty',
    d_ru: 'Предсказуемость и надёжность: человек делает то, что обещал.',
    d_pl: 'Przewidywalność i niezawodność: człowiek robi to, co obiecał.',
    d_en: 'Predictability and reliability: the person does what they promised.' },
  { key: 'E', ru: 'E · Активность', pl: 'E · Aktywność', en: 'E · Activity',
    d_ru: 'Энергия и темп работы: движение, звонки, встречи.',
    d_pl: 'Energia i tempo pracy: ruch, telefony, spotkania.',
    d_en: 'Energy and work pace: movement, calls, meetings.' },
  { key: 'F', ru: 'F · Настойчивость', pl: 'F · Wytrwałość', en: 'F · Persistence',
    d_ru: 'Способность доводить дело до результата вопреки препятствиям и отказам.',
    d_pl: 'Zdolność doprowadzania spraw do rezultatu mimo przeszkód i odmów.',
    d_en: 'Ability to drive things to a result despite obstacles and rejections.' },
  { key: 'G', ru: 'G · Ответственность', pl: 'G · Odpowiedzialność', en: 'G · Responsibility',
    d_ru: 'Готовность брать на себя задачи и отвечать за результат без «пинка».',
    d_pl: 'Gotowość brania na siebie zadań i odpowiadania za wynik bez „popędzania”.',
    d_en: 'Willingness to take on tasks and own the result without a “kick”.' },
  { key: 'H', ru: 'H · Объективность', pl: 'H · Obiektywność', en: 'H · Objectivity',
    d_ru: 'Трезвая, справедливая оценка людей и фактов.',
    d_pl: 'Trzeźwa, sprawiedliwa ocena ludzi i faktów.',
    d_en: 'Sober, fair judgement of people and facts.' },
  { key: 'I', ru: 'I · Чуткость', pl: 'I · Wrażliwość', en: 'I · Empathy',
    d_ru: 'Эмпатия и внимание к людям; сервис и работа с людьми.',
    d_pl: 'Empatia i uwaga wobec ludzi; obsługa i praca z ludźmi.',
    d_en: 'Empathy and attention to people; service and people work.' },
  { key: 'J', ru: 'J · Общительность', pl: 'J · Towarzyskość', en: 'J · Sociability',
    d_ru: 'Лёгкость общения и установления контакта.',
    d_pl: 'Łatwość komunikacji i nawiązywania kontaktu.',
    d_en: 'Ease of communication and making contact.' },
];

// ---------- Уровни мотивации (инструкция «Jak ocenić poziom motywacji») ----------
// Отсортированы от высшего к низшему (score: 4→1).
const MOTIVATION_LEVELS = [
  { key: 'duty', score: 4, ru: 'Чувство долга', pl: 'Poczucie obowiązku', en: 'Sense of duty',
    d_ru: 'Отождествляет себя с главной целью компании, увлечён её реализацией и вовлечён в её видение.',
    d_pl: 'Utożsamia się z głównym celem firmy, pasjonuje się jego realizacją i jest zaangażowany w jej wizję.',
    d_en: 'Identifies with the company’s main goal, is passionate about it and engaged in its vision.' },
  { key: 'conviction', score: 3, ru: 'Личное убеждение', pl: 'Osobiste przekonanie', en: 'Personal conviction',
    d_ru: 'Руководствуется собственными принципами и удовлетворением от хорошо выполненной работы, стремится к профессионализму.',
    d_pl: 'Kieruje się własnymi zasadami i satysfakcją z dobrze wykonanej pracy, dąży do profesjonalizmu.',
    d_en: 'Guided by own principles and satisfaction from work well done, strives for professionalism.' },
  { key: 'benefit', score: 2, ru: 'Личная выгода', pl: 'Osobiste korzyści', en: 'Personal benefit',
    d_ru: 'Ключевое — стабильность, бенефиты и личный рост; креативность направлена на выгоду для себя, а не на цели компании.',
    d_pl: 'Kluczowe są stabilność, benefity i rozwój osobisty; kreatywność skupia się na korzyściach dla siebie.',
    d_en: 'Values stability, benefits and personal growth; creativity aimed at own benefit, not company goals.' },
  { key: 'money', score: 1, ru: 'Финансовая мотивация', pl: 'Motywacja finansowa', en: 'Financial motivation',
    d_ru: 'Главный фактор вовлечённости — размер вознаграждения.',
    d_pl: 'Głównym czynnikiem zaangażowania jest wysokość wynagrodzenia.',
    d_en: 'The main engagement factor is the level of pay.' },
];

// ---------- Вопросы для оценки мотивации (инструкция 2.2.3 + лекция «Факторы найма») ----------
// hint (h_*) — подсказка рекрутёру: как спрашивать и на что обращать внимание.
const MOTIVATION_QUESTIONS = [
  { id: 'm1', ru: 'Что для тебя важно при выборе новой работы и компании?',
    pl: 'Co jest dla Ciebie ważne przy wyborze nowej pracy i firmy?',
    en: 'What matters to you when choosing a new job and company?',
    h_ru: 'Задайте вопрос открыто, без подсказок. Общий ответ («хорошая компания», «интересный продукт») — уточните: какой именно продукт? какая компания? Если «продукт должен легко продаваться» — это мотив комфорта, а не ценности продукта. Если «стабильная компания» — спросите почему: страх задержек зарплаты (деньги) или честность к клиентам (убеждение).',
    h_pl: 'Zadaj pytanie otwarcie, bez podpowiedzi. Ogólna odpowiedź („dobra firma”, „ciekawy produkt”) — dopytaj: jaki produkt? jaka firma? Jeśli „produkt ma się łatwo sprzedawać” — to motyw komfortu, nie wartości produktu. Jeśli „stabilna firma” — zapytaj dlaczego: obawa o wypłaty (pieniądze) czy uczciwość wobec klientów (przekonanie).',
    h_en: 'Ask openly, with no prompts. A vague answer (“a good company”, “an interesting product”) — probe: which product? what kind of company? “The product should sell easily” signals comfort, not belief in the product. “A stable company” — ask why: fear of delayed pay (money) or honesty towards clients (conviction).' },
  { id: 'm2', ru: 'Почему ты откликнулся на нашу вакансию? Что тебя привлекло?',
    pl: 'Dlaczego odpowiedziałeś na naszą ofertę pracy? Co Cię przyciągnęło?',
    en: 'Why did you respond to our job offer? What attracted you?',
    h_ru: 'Слушайте, на что кандидат делает упор. Спросите: «Что ты уже знаешь о нашей компании? Смотрел сайт, соцсети, отзывы?» Действительно заинтересованные изучают компанию до собеседования (исключение — те, кого пригласили сразу после отклика).',
    h_pl: 'Słuchaj, na co kandydat kładzie nacisk. Zapytaj: „Co już wiesz o naszej firmie? Widziałeś stronę, social media, opinie?” Naprawdę zainteresowani poznają firmę przed rozmową (wyjątek — zaproszeni od razu po aplikacji).',
    h_en: 'Listen to what the candidate emphasises. Ask: “What do you already know about us? Did you check our site, socials, reviews?” Genuinely interested candidates research the company before the interview (except those invited right after applying).' },
  { id: 'm3', ru: 'Представь: у тебя два предложения с одинаковой оплатой. По каким критериям выбираешь?',
    pl: 'Masz dwie oferty pracy z takim samym wynagrodzeniem. Jakimi kryteriami się kierujesz?',
    en: 'Imagine two offers with the same pay. By what criteria do you choose?',
    h_ru: 'Ключевой вопрос про истинные приоритеты. Бенефиты, стабильность, удобство — личная выгода. Миссия, культура, ценности, продукт компании — личное убеждение.',
    h_pl: 'Kluczowe pytanie o prawdziwe priorytety. Benefity, stabilność, wygoda — osobiste korzyści. Misja, kultura, wartości, produkt firmy — osobiste przekonanie.',
    h_en: 'A key question about true priorities. Benefits, stability, comfort — personal benefit. Mission, culture, values, the product — personal conviction.' },
  { id: 'm4', ru: 'Расскажите кандидату о миссии, продукте и ценностях компании — какая реакция?',
    pl: 'Opowiedz kandydatowi o misji, produkcie i wartościach firmy — jaka reakcja?',
    en: 'Tell the candidate about the company mission, product and values — what is the reaction?',
    h_ru: 'Наблюдайте: проявляет интерес? Задаёт вопросы или пассивно слушает? После рассказа спросите, что зацепило больше всего. Учтите: «огонёк в глазах» можно изобразить — профессиональные соискатели умеют. Проверка одна: просите пример из прошлого.',
    h_pl: 'Obserwuj: wykazuje zainteresowanie? Zadaje pytania czy biernie słucha? Po opowieści zapytaj, co go najbardziej zaciekawiło. Uwaga: „błysk w oku” można zagrać — zawodowi kandydaci to potrafią. Jedyny test: proś o przykład z przeszłości.',
    h_en: 'Observe: do they show interest? Ask questions or just listen passively? Afterwards ask what caught their attention most. Note: a “spark in the eyes” can be faked — professional job-seekers know how. The one test: ask for an example from the past.' },
  { id: 'm5', ru: 'Какие у тебя есть вопросы к нам?',
    pl: 'Jakie masz pytania do nas?',
    en: 'What questions do you have for us?',
    h_ru: 'О чём спрашивает сам: о продукте, клиентах, инструментах, развитии (исходящий поток — то, что он будет ДЕЛАТЬ) или только о бенефитах и оплате (входящий — то, что он будет ПОЛУЧАТЬ)? Вопросы о зарплате — нормально, человеку нужно кормить семью. Тревожно, если КРОМЕ них нет ничего.',
    h_pl: 'O co pyta sam: o produkt, klientów, narzędzia, rozwój (strumień wychodzący — to, co będzie ROBIĆ) czy tylko o benefity i wynagrodzenie (przychodzący — to, co będzie DOSTAWAĆ)? Pytania o pensję są normalne. Niepokojące jest, gdy POZA nimi nie ma nic.',
    h_en: 'What do they ask about: the product, clients, tools, growth (outflow — what they will DO) or only benefits and pay (inflow — what they will GET)? Salary questions are normal. It is a red flag only when there is NOTHING besides them.' },
  { id: 'm6', ru: 'Было ли в прошлом что-то, что ты делал не только ради денег? Что именно?',
    pl: 'Czy w przeszłości robiłeś coś nie tylko dla pieniędzy? Co dokładnie?',
    en: 'In the past, did you ever do something not just for the money? What exactly?',
    h_ru: 'Главная проверка: красивые слова о будущем разворачивайте в прошлое. Если кандидат «вдохновлён вашей целью» — спросите, было ли подобное раньше. Записывайте детали и КТО может это подтвердить: факты из прошлого проверяемы, разговоры о будущем — нет. Предупредите, что будете проверять — это отсеивает врунов; ничего личного, это правила.',
    h_pl: 'Główny test: piękne słowa o przyszłości zawracaj do przeszłości. Jeśli kandydat „jest zainspirowany waszym celem” — zapytaj, czy coś podobnego już robił. Zapisuj szczegóły i KTO może to potwierdzić: fakty z przeszłości można sprawdzić, deklaracje o przyszłości — nie. Uprzedź, że będziesz weryfikować — to odsiewa kłamców; nic osobistego, takie zasady.',
    h_en: 'The main test: turn fine words about the future back to the past. If the candidate is “inspired by your mission” — ask whether they ever did anything similar before. Write down details and WHO can confirm it: past facts are verifiable, future talk is not. Warn them you will check — it filters out liars; nothing personal, just the rules.' },
];

// ---------- Форма получения референсов (16 вопросов, PDF-первоисточник) ----------
// scale — набор вариантов ответа; open — открытое поле; num10 — шкала 1..10.
const REFERENCE_QUESTIONS = [
  { id: 'r1', kind: 'open', ru: 'Имя того, от кого получаем референс, и название компании.',
    pl: 'Imię osoby, od kogo otrzymujemy referencje, i nazwa firmy.', en: 'Name of the referee and the company.',
    h_ru: 'Звоните по контактам, которые дал сам кандидат (лучший источник — бывший прямой руководитель). Представьтесь, скажите, что кандидат указал собеседника как человека, который может подтвердить его результаты, и попросите 5–10 минут.',
    h_pl: 'Dzwoń na kontakty podane przez kandydata (najlepsze źródło — były bezpośredni przełożony). Przedstaw się, powiedz, że kandydat wskazał rozmówcę jako osobę mogącą potwierdzić jego wyniki, i poproś o 5–10 minut.',
    h_en: 'Call the contacts the candidate gave (the best source is a former direct supervisor). Introduce yourself, say the candidate named them as someone who can confirm their results, and ask for 5–10 minutes.' },
  { id: 'r2', kind: 'scale', ru: 'В каких отношениях вы были с этим человеком?',
    pl: 'W jakich relacjach był(a) Pan(i) z tą osobą?', en: 'What was your relationship with this person?',
    h_ru: 'Вес референса зависит от источника: прямой руководитель — самый ценный, коллега — средний, друг или родственник почти всегда хвалит (учитывайте это при выводах).',
    h_pl: 'Waga referencji zależy od źródła: bezpośredni przełożony — najcenniejszy, kolega — średnio, przyjaciel lub krewny prawie zawsze chwali (uwzględnij to we wnioskach).',
    h_en: 'The weight of a reference depends on the source: a direct supervisor is the most valuable, a colleague is average, a friend or relative almost always praises (factor this in).',
    opts: [
      { ru: 'Был его/её прямым руководителем', pl: 'Byłem jej/jego bezpośrednim przełożonym', en: 'I was their direct supervisor' },
      { ru: 'Был прямым руководителем (в прошлом)', pl: 'Byłem bezpośrednim przełożonym (w przeszłości)', en: 'I was their direct supervisor (in the past)' },
      { ru: 'Руководитель, но не прямой', pl: 'Jestem przełożonym, ale nie bezpośrednim', en: 'A supervisor, but not direct' },
      { ru: 'Коллега', pl: 'Kolega', en: 'A colleague' },
      { ru: 'Близкий друг', pl: 'Bliski przyjaciel', en: 'A close friend' },
      { ru: 'Родственник', pl: 'Krewny', en: 'A relative' },
      { ru: 'Другое', pl: 'Inne', en: 'Other' },
    ] },
  { id: 'r3', kind: 'open', ru: 'Какой продукт ожидался от кандидата и в каком объёме он его производил?',
    pl: 'Jaki produkt oczekiwano od kandydata i w jakiej ilości go wytwarzał?', en: 'What product was expected from the candidate and in what volume did they produce it?',
    h_ru: 'Ключевой вопрос методики. Просите конкретику и цифры и сверяйте с тем, что кандидат сам писал в тесте «Резалт» — расхождения важнее самих цифр.',
    h_pl: 'Kluczowe pytanie metodyki. Proś o konkrety i liczby i porównuj z tym, co kandydat sam napisał w teście „Result” — rozbieżności są ważniejsze niż same liczby.',
    h_en: 'The key question of the method. Ask for specifics and numbers, and compare with what the candidate wrote in the “Result” test — discrepancies matter more than the numbers themselves.' },
  { id: 'r4', kind: 'open', ru: 'В чём заключалась работа этого человека (какие обязанности)?',
    pl: 'Na czym polegała praca tej osoby (jakie obowiązki)?', en: 'What did this person’s job involve (what duties)?' },
  { id: 'r5', kind: 'scale', ru: 'Насколько эффективно справлялся с обязанностями?',
    pl: 'Jak skutecznie radził(a) sobie z obowiązkami?', en: 'How effectively did they handle their duties?',
    h_ru: 'Слушайте не только слова, но и настроение собеседника: при воспоминании о продуктивном сотруднике настроение заметно улучшается. Паузы, вздохи, сухие формальные ответы — тревожный знак.',
    h_pl: 'Słuchaj nie tylko słów, ale i nastroju rozmówcy: przy wspomnieniu produktywnego pracownika nastrój wyraźnie się poprawia. Pauzy, westchnienia, suche formalne odpowiedzi — znak ostrzegawczy.',
    h_en: 'Listen to the mood, not just the words: recalling a productive employee visibly lifts the referee’s mood. Pauses, sighs and dry formal answers are a warning sign.',
    opts: [
      { ru: 'Исключительно хорошо', pl: 'Wyjątkowo dobrze', en: 'Exceptionally well' },
      { ru: 'Очень хорошо', pl: 'Bardzo dobrze', en: 'Very well' },
      { ru: 'Хорошо', pl: 'Dobrze', en: 'Well' },
      { ru: 'Средне', pl: 'Przeciętnie', en: 'Average' },
      { ru: 'Не очень хорошо', pl: 'Niezbyt dobrze', en: 'Not very well' },
      { ru: 'Плохо', pl: 'Źle', en: 'Poorly' },
    ] },
  { id: 'r6', kind: 'scale', ru: 'Каковы были реальные результаты работы?',
    pl: 'Jakie były realne wyniki pracy tej osoby?', en: 'What were the real results of their work?',
    opts: [
      { ru: 'Очень хорошие, измеримые', pl: 'Bardzo dobre, mierzalne', en: 'Very good, measurable' },
      { ru: 'Хорошие, измеримые', pl: 'Dobre, mierzalne', en: 'Good, measurable' },
      { ru: 'Хорошие, но неизмеримые', pl: 'Dobre, ale niemierzalne', en: 'Good, but not measurable' },
      { ru: 'Трудно сказать (измерить)', pl: 'Trudno powiedzieć (zmierzyć)', en: 'Hard to say (measure)' },
      { ru: 'Не знаю точно', pl: 'Nie wiem dokładnie', en: 'I don’t know exactly' },
    ] },
  { id: 'r7', kind: 'scale', ru: 'Насколько хорошо владел профессиональными знаниями и навыками?',
    pl: 'Jak dobrze opanował(a) wiedzę zawodową i umiejętności?', en: 'How well did they master professional knowledge and skills?',
    opts: [
      { ru: 'Исключительно хорошо', pl: 'Wyjątkowo dobrze', en: 'Exceptionally well' },
      { ru: 'Очень хорошо', pl: 'Bardzo dobrze', en: 'Very well' },
      { ru: 'Хорошо', pl: 'Dobrze', en: 'Well' },
      { ru: 'Средне', pl: 'Przeciętnie', en: 'Average' },
      { ru: 'Слабовато', pl: 'Nieco słabo', en: 'Somewhat weak' },
      { ru: 'Слабо', pl: 'Słabo', en: 'Weak' },
      { ru: 'Не знаю', pl: 'Nie wiem', en: 'I don’t know' },
    ] },
  { id: 'r8', kind: 'scale', ru: 'Замечали ли вы частое/долгое отсутствие на работе (болезнь и пр.)?',
    pl: 'Czy zauważył(a) Pan(i) częstą/długą nieobecność w pracy?', en: 'Did you notice frequent/long absences from work?',
    opts: [
      { ru: 'Нет, никогда', pl: 'Nie, nigdy', en: 'No, never' },
      { ru: 'Иногда / редко', pl: 'Czasami / rzadko', en: 'Sometimes / rarely' },
      { ru: 'Да, довольно часто', pl: 'Tak, dość często', en: 'Yes, quite often' },
    ] },
  { id: 'r9', kind: 'scale', ru: 'Насколько хорошо сотрудничал с коллегами?',
    pl: 'Jak dobrze współpracował(a) z kolegami?', en: 'How well did they cooperate with colleagues?',
    opts: [
      { ru: 'Очень хорошо, все его/её любили', pl: 'Bardzo dobrze, wszyscy go/ją lubili', en: 'Very well, everyone liked them' },
      { ru: 'Очень хорошо', pl: 'Bardzo dobrze', en: 'Very well' },
      { ru: 'Хорошо', pl: 'Dobrze', en: 'Well' },
      { ru: 'Не всегда хорошо', pl: 'Nie zawsze dobrze', en: 'Not always well' },
      { ru: 'Плохо', pl: 'Źle', en: 'Poorly' },
    ] },
  { id: 'r10', kind: 'scale', ru: 'Насколько хорошо умел руководить другими?',
    pl: 'Jak dobrze potrafił(a) przewodzić innym?', en: 'How well could they lead others?',
    opts: [
      { ru: 'Очень хорошо', pl: 'Bardzo dobrze', en: 'Very well' },
      { ru: 'Хорошо', pl: 'Dobrze', en: 'Well' },
      { ru: 'Не всегда хорошо', pl: 'Nie zawsze dobrze', en: 'Not always well' },
      { ru: 'Не знаю', pl: 'Nie wiem', en: 'I don’t know' },
    ] },
  { id: 'r11', kind: 'scale', ru: 'Как справлялся с бумажной работой, документацией, отчётностью?',
    pl: 'Jak radził(a) sobie z pracą papierkową, dokumentacją, sprawozdawczością?', en: 'How did they handle paperwork, documentation, reporting?',
    opts: [
      { ru: 'Очень хорошо', pl: 'Bardzo dobrze', en: 'Very well' },
      { ru: 'Хорошо', pl: 'Dobrze', en: 'Well' },
      { ru: 'Не очень хорошо', pl: 'Niezbyt dobrze', en: 'Not very well' },
      { ru: 'Плохо', pl: 'Źle', en: 'Poorly' },
      { ru: 'Не знаю', pl: 'Nie wiem', en: 'I don’t know' },
    ] },
  { id: 'r12', kind: 'scale', ru: 'Доверили бы вы этому человеку очень важное для вас задание?',
    pl: 'Czy powierzył(a)byś tej osobie bardzo ważne zadanie?', en: 'Would you entrust this person with a task very important to you?',
    opts: [
      { ru: 'Конечно! Без сомнений', pl: 'Oczywiście! Bez wątpliwości', en: 'Absolutely! No doubt' },
      { ru: 'Да', pl: 'Tak', en: 'Yes' },
      { ru: 'Может быть (не вполне уверен)', pl: 'Może (nie jestem pewien)', en: 'Maybe (not fully sure)' },
      { ru: 'Скорее нет', pl: 'Raczej nie', en: 'Rather not' },
      { ru: 'Определённо нет', pl: 'Zdecydowanie nie', en: 'Definitely not' },
    ] },
  { id: 'r13', kind: 'scale', ru: 'Наняли бы вы этого человека снова на подходящую позицию?',
    pl: 'Czy zatrudnił(a)byś tę osobę ponownie na odpowiednie stanowisko?', en: 'Would you hire this person again for a suitable position?',
    h_ru: 'Самый честный индикатор всего разговора. Любые колебания и оговорки («ну-у, наверное», «смотря куда») на деле означают «нет».',
    h_pl: 'Najszczerszy wskaźnik całej rozmowy. Wszelkie wahania i zastrzeżenia („no-o, chyba tak”, „zależy gdzie”) w praktyce oznaczają „nie”.',
    h_en: 'The most honest indicator of the whole call. Any hesitation or hedging (“well… probably”, “depends where”) really means “no”.',
    opts: [
      { ru: 'Конечно! Без сомнений', pl: 'Oczywiście! Bez wątpliwości', en: 'Absolutely! No doubt' },
      { ru: 'Да', pl: 'Tak', en: 'Yes' },
      { ru: 'Может быть', pl: 'Może', en: 'Maybe' },
      { ru: 'Скорее нет', pl: 'Raczej nie', en: 'Rather not' },
      { ru: 'Определённо нет', pl: 'Zdecydowanie nie', en: 'Definitely not' },
    ] },
  { id: 'r14', kind: 'open', ru: 'Что этому человеку стоило бы в себе улучшить?',
    pl: 'Co ta osoba powinna w sobie poprawić?', en: 'What should this person improve about themselves?',
    h_ru: 'Мягкая формулировка «разрешает» собеседнику говорить о минусах — на прямой вопрос «какие недостатки?» отвечают неохотно. Записывайте дословно.',
    h_pl: 'Łagodne sformułowanie „pozwala” rozmówcy mówić o minusach — na wprost zadane pytanie „jakie wady?” odpowiadają niechętnie. Zapisuj dosłownie.',
    h_en: 'The soft wording “allows” the referee to mention weaknesses — a blunt “what are their flaws?” rarely gets an honest answer. Write it down verbatim.' },
  { id: 'r15', kind: 'num10', ru: 'Оцените этого человека по шкале 1–10 (1 — очень плохо, 10 — отлично).',
    pl: 'Oceń tę osobę w skali 1–10 (1 — bardzo źle, 10 — doskonale).', en: 'Rate this person on a 1–10 scale (1 — very poor, 10 — excellent).',
    h_ru: 'Ориентир: 8–10 — сильный референс; 6–7 — средний, уточните детали; 5 и ниже — плохой.',
    h_pl: 'Orientacyjnie: 8–10 — mocna referencja; 6–7 — średnia, dopytaj o szczegóły; 5 i mniej — zła.',
    h_en: 'Rule of thumb: 8–10 — a strong reference; 6–7 — average, clarify details; 5 or below — a poor one.' },
  { id: 'r15b', kind: 'open', ru: 'Если оценка ниже 10: что нужно было бы исправить, чтобы вы оценили его на самую высокую оценку?',
    pl: 'Jeśli ocena jest niższa niż 10: co należałoby poprawić, aby mógł Pan / mogła Pani dać najwyższą ocenę?',
    en: 'If the rating is below 10: what would need to change for you to give the highest rating?',
    h_ru: 'Задавайте, только если собеседник поставил меньше максимума. Ответ записывайте дословно — в этих словах обычно и есть настоящий недостаток кандидата.',
    h_pl: 'Zadaj tylko wtedy, gdy rozmówca dał mniej niż maksimum. Odpowiedź zapisuj dosłownie — w tych słowach zwykle kryje się prawdziwa słabość kandydata.',
    h_en: 'Ask only if the referee gave less than the maximum. Write the answer down verbatim — those words usually contain the candidate’s real weakness.' },
  { id: 'r16', kind: 'open', ru: 'Что ещё вы хотели бы добавить к общей картине?',
    pl: 'Czy jest coś jeszcze, co chciał(a)byś dodać do ogólnego obrazu?', en: 'Is there anything else you would add to the overall picture?',
    h_ru: 'Дайте собеседнику высказаться свободно и не перебивайте — самое ценное часто говорят в конце разговора.',
    h_pl: 'Pozwól rozmówcy wypowiedzieć się swobodnie i nie przerywaj — najcenniejsze rzeczy często padają na końcu rozmowy.',
    h_en: 'Let the referee speak freely and don’t interrupt — the most valuable things are often said at the end of the call.' },
];

// ---------- Схема заявки на подбор персонала (23 пункта) ----------
// Русские метки — для контекста ИИ и валидации; форма рендерится на клиенте.
const REQUISITION_FIELDS = [
  { key: 'position',          label: 'Название должности' },
  { key: 'product',           label: 'Ожидаемый продукт (результат работы)' },
  { key: 'reason',            label: 'Причина возникновения вакансии' },
  { key: 'headcount',         label: 'Требуемое число сотрудников' },
  { key: 'supervisor',        label: 'Будущий непосредственный руководитель' },
  { key: 'decisionMaker',     label: 'Кто принимает решение о найме/отказе' },
  { key: 'responsibilities',  label: 'За что отвечает новый сотрудник' },
  { key: 'probationCriteria', label: 'Критерии завершения испытательного срока' },
  { key: 'experience',        label: 'Требуемый опыт работы' },
  { key: 'competencies',      label: 'Необходимые компетенции' },
  { key: 'traits',            label: '3 главных личностных качества' },
  { key: 'challenges',        label: 'Непредвиденные вызовы и их частота' },
  { key: 'creativity',        label: 'Требуется ли креативность' },
  { key: 'travel',            label: 'Командировки' },
  { key: 'workType',          label: 'Характер работы' },
  { key: 'routine',           label: 'Уровень рутины' },
  { key: 'probationSalary',   label: 'Оплата на испытательном сроке' },
  { key: 'salary',            label: 'Оплата после испытательного срока' },
  { key: 'otherReq',          label: 'Другие требования' },
  { key: 'age',               label: 'Предпочтительный возраст' },
  { key: 'gender',            label: 'Предпочтительный пол' },
  { key: 'education',         label: 'Образование и требования к квалификации' },
  { key: 'hireDate',          label: 'Планируемая дата найма' },
];

function tf(obj, lang) { return (obj && (obj[lang] || obj.ru)) || ''; }

// Локализовать этап/справочник для отдачи клиенту
function stageTitle(key, lang) { const s = WORKFLOW_STAGES.find(x => x.key === key); return s ? tf(s.title, lang) : key; }
function traitLabel(key, lang) { const t = PERSONALITY_TRAITS.find(x => x.key === key); return t ? (t[lang] || t.ru) : key; }
function motivationLabel(key, lang) { const m = MOTIVATION_LEVELS.find(x => x.key === key); return m ? (m[lang] || m.ru) : key; }

function traitsFor(lang) { return PERSONALITY_TRAITS.map(t => ({ key: t.key, label: t[lang] || t.ru, desc: t['d_' + lang] || t.d_ru })); }
function motivationLevelsFor(lang) { return MOTIVATION_LEVELS.map(m => ({ key: m.key, score: m.score, label: m[lang] || m.ru, desc: m['d_' + lang] || m.d_ru })); }
function motivationQuestionsFor(lang) { return MOTIVATION_QUESTIONS.map(q => ({ id: q.id, text: q[lang] || q.ru, hint: q['h_' + lang] || q.h_ru || '' })); }
function referenceQuestionsFor(lang) {
  return REFERENCE_QUESTIONS.map(q => ({ id: q.id, kind: q.kind, text: q[lang] || q.ru,
    hint: q['h_' + lang] || q.h_ru || '', opts: q.opts ? q.opts.map(o => o[lang] || o.ru) : null }));
}

module.exports = {
  WORKFLOW_STAGES, STAGE_KEYS, PERSONALITY_TRAITS, MOTIVATION_LEVELS, MOTIVATION_QUESTIONS,
  REFERENCE_QUESTIONS, REQUISITION_FIELDS,
  stageTitle, traitLabel, motivationLabel,
  traitsFor, motivationLevelsFor, motivationQuestionsFor, referenceQuestionsFor,
};
