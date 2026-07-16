'use strict';
// Контент 3-й программы «Выявление продуктивных кандидатов» (ru/en/pl). Мёржится в learning.js.

// Врезки-боксы 1-в-1 из программы productivity-winners.
// b — нейтральный серый (ПРИМЕР / НА ЗАМЕТКУ), k — фиолетовый (КЛЮЧЕВАЯ ИДЕЯ / ЗАПОМНИТЕ),
// r — зелёный (ПРАВИЛО), t — синий (ПРИЁМ). Внутри — абзацы p().
function bp(text, last) {
  return '<p style="margin:0' + (last ? '' : ' 0 10px') + ';font-size:16px;line-height:1.68;color:#d3d9ec">' + text + '</p>';
}
function box(bg, border, dot, label, inner) {
  return '<div style="margin:26px 0;padding:18px 22px;border-radius:16px;background:' + bg + ';border:1px solid ' + border + '">' +
    '<div style="display:flex;align-items:center;gap:9px;font-family:JetBrains Mono,monospace;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' + dot + ';margin-bottom:10px">' +
    '<span style="width:6px;height:6px;border-radius:50%;background:' + dot + ';box-shadow:0 0 8px ' + dot + '"></span>' + label + '</div>' + inner + '</div>';
}
function b(label, inner) { return box('rgba(255,255,255,.03)', 'rgba(255,255,255,.09)', '#8b93ad', label, inner); }
function k(label, inner) { return box('linear-gradient(120deg,rgba(139,108,255,.10),rgba(111,151,255,.04))', 'rgba(139,108,255,.22)', '#b3a4ff', label, inner); }
function r(label, inner) { return box('rgba(67,224,160,.06)', 'rgba(67,224,160,.18)', '#43e0a0', label, inner); }
function t(label, inner) { return box('rgba(111,151,255,.06)', 'rgba(111,151,255,.18)', '#6f97ff', label, inner); }

module.exports = {
  'finding-producers': {
    trailer: { ru: '/media/learn3-trailer-ru.mp4', en: '/media/learn3-trailer-en.mp4', pl: '/media/learn3-trailer-pl.mp4' },
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: { ru: 'Выявление продуктивных кандидатов · Введение', en: 'Identifying Productive Candidates · Intro', pl: 'Rozpoznawanie produktywnych kandydatów · Wprowadzenie' },
        desc: { ru: 'О чём руководство: продуктивность важнее резюме и диплома.', en: 'What the guide is about: productivity matters more than a résumé.', pl: 'O czym jest przewodnik: produktywność ważniejsza niż CV.' },
        html: {
          ru:
            '<p><strong>ВЫЯВЛЕНИЕ ПРОДУКТИВНЫХ КАНДИДАТОВ</strong></p>' +
            '<p>Практическое руководство по методике найма HR-PRO.AI</p>' +
            '<p>Как за пять минут увидеть, способен ли человек приносить результаты — и кто он на самом деле</p>' +
            '<h2>О чём это руководство и почему оно важно</h2>' +
            '<p>Представьте: к вам приходит кандидат. Дорогой пиджак, часы, идеальное резюме, два высших образования, прекрасные рекомендации. Хочется встать и поздороваться. А рядом лежит резюме токаря-фрезеровщика — короткое, невзрачное, никаких регалий. Кого вы возьмёте, если судить по бумагам?</p>' +
            '<p>А теперь другой вопрос: кто из них принесёт вашему бизнесу больше пользы? Резюме на него не ответит. Диплом — тем более. Опыт «работал там-то пять лет» тоже не отвечает: можно пять лет просиживать штаны. Ни одна привычная зацепка при найме не говорит вам главного — способен ли человек производить результаты.</p>' +
            '<p>Именно это умеет методика HR-PRO.AI. В её основе лежит короткое — буквально пятиминутное — интервью, которое даёт ответ на два самых важных для найма вопроса. Есть люди, которые говорят, что несколькими этими вопросами изменили судьбу своего бизнеса. Это не преувеличение. Когда вы научитесь видеть продуктивность человека, вы перестанете нанимать «красивые резюме» и начнёте нанимать тех, кто действительно тащит.</p>' +
            '<h3>Что вы получите, пройдя это руководство</h3>' +
            '<ul>' +
            '<li>Научитесь проводить интервью на продуктивность — и за 5–10 минут понимать, производил ли человек результаты в прошлом.</li>' +
            '<li>Научитесь отличать виннера от дуера и от вейтера — и понимать, кого из них и на какую должность можно ставить.</li>' +
            '<li>Поймёте, кто именно в вашей компании должен проводить это интервью, — и почему на этом чаще всего спотыкаются.</li>' +
            '<li>Разберёте десятки реальных примеров — живые интервью настоящих кандидатов — и научитесь мгновенно видеть, с кем стоит разговаривать, а с кем нет.</li>' +
            '</ul>' +
            '<h3>Как устроено руководство</h3>' +
            '<p>В центре методики — «Интервью на продуктивность». Это её ядро: живой разговор с кандидатом. Здесь мы разберём интервью на виннера и на дуера по шагам, обсудим кандидатов без опыта, разницу между результатом и продуктом, тонкие ситуации и наведение справок.</p>' +
            b('НА ЗАМЕТКУ',
              bp('На протяжении всего руководства встречаются три ключевых типа людей. Коротко: <strong>виннер</strong> — тот, кто видит конечный продукт своей работы и мыслит результатом. <strong>Дуер</strong> — тот, кто, может, и не видит продукт, но очень хочет работать и приносит массу пользы как исполнитель. <strong>Вейтер</strong> — тот, кто работать не любит, избегает ответственности и лишней работы.', true)),
          en:
            '<p><strong>IDENTIFYING PRODUCTIVE CANDIDATES</strong></p>' +
            '<p>A practical guide to the HR-PRO.AI hiring method</p>' +
            '<p>How to see in five minutes whether a person can deliver results — and who they really are</p>' +
            '<h2>What this guide is about, and why it matters</h2>' +
            '<p>Picture this: a candidate walks in. An expensive jacket, a nice watch, a flawless résumé, two university degrees, glowing references. You almost want to stand up to greet them. And next to that lies the résumé of a machinist — short, plain, no distinctions. Who would you hire if you judged by the paperwork?</p>' +
            '<p>Now a different question: which of the two will bring your business more value? A résumé won\'t answer that. A diploma even less so. And "worked there for five years" doesn\'t answer it either — you can warm a seat for five years. Not a single familiar hiring cue tells you the one thing that matters — whether the person can actually produce results.</p>' +
            '<p>That is exactly what the HR-PRO.AI method does. At its core is a short — literally five-minute — interview that answers the two most important hiring questions. Some people say that with just these few questions they changed the fate of their business. That is no exaggeration. Once you learn to see a person\'s productivity, you stop hiring "beautiful résumés" and start hiring the people who actually carry the load.</p>' +
            '<h3>What you will gain from this guide</h3>' +
            '<ul>' +
            '<li>You will learn to run a productivity interview — and in 5–10 minutes understand whether a person produced results in the past.</li>' +
            '<li>You will learn to tell a winner from a doer and from a waiter — and understand who belongs in which role.</li>' +
            '<li>You will understand who exactly in your company should run this interview — and why this is where people most often stumble.</li>' +
            '<li>You will study dozens of real examples — live interviews of actual candidates — and learn to see instantly who is worth talking to and who is not.</li>' +
            '</ul>' +
            '<h3>How the guide is organized</h3>' +
            '<p>At the heart of the method is "The Productivity Interview." This is its core: the live conversation with the candidate. Here we break down the winner interview and the doer interview step by step, discuss candidates with no work experience, the difference between a result and a product, tricky situations, and reference checking.</p>' +
            b('NOTE',
              bp('Three key types of people run through this whole guide. Briefly: a <strong>winner</strong> sees the final product of their work and thinks in terms of results. A <strong>doer</strong> may not see the product, but wants to work intensely and delivers enormous value as an executor. A <strong>waiter</strong> doesn\'t enjoy work, avoids responsibility, and dodges extra tasks.', true)),
          pl:
            '<p><strong>ROZPOZNAWANIE PRODUKTYWNYCH KANDYDATÓW</strong></p>' +
            '<p>Praktyczny przewodnik po metodzie rekrutacji HR-PRO.AI</p>' +
            '<p>Jak w pięć minut dostrzec, czy człowiek potrafi przynosić rezultaty — i kim naprawdę jest</p>' +
            '<h2>O czym jest ten przewodnik i dlaczego jest ważny</h2>' +
            '<p>Wyobraź sobie: przychodzi do ciebie kandydat. Droga marynarka, zegarek, nienaganne CV, dwa dyplomy, znakomite referencje. Aż chce się wstać, żeby go powitać. A obok leży CV tokarza-frezera — krótkie, niepozorne, żadnych tytułów. Kogo zatrudnisz, jeśli będziesz oceniać po papierach?</p>' +
            '<p>A teraz inne pytanie: który z nich przyniesie twojej firmie więcej pożytku? CV tego nie powie. Dyplom tym bardziej. „Pracował tam pięć lat” też nie odpowiada: przez pięć lat można odsiadywać godziny. Żadna typowa przy rekrutacji poszlaka nie mówi ci tego, co najważniejsze — czy człowiek potrafi wytwarzać rezultaty.</p>' +
            '<p>I właśnie to potrafi metoda HR-PRO.AI. Jej podstawą jest krótka — dosłownie pięciominutowa — rozmowa, która odpowiada na dwa najważniejsze dla rekrutacji pytania. Są ludzie, którzy mówią, że tymi kilkoma pytaniami zmienili los swojej firmy. To nie przesada. Gdy nauczysz się dostrzegać produktywność człowieka, przestaniesz zatrudniać „ładne CV”, a zaczniesz zatrudniać tych, którzy naprawdę ciągną firmę do przodu.</p>' +
            '<h3>Co zyskasz dzięki temu przewodnikowi</h3>' +
            '<ul>' +
            '<li>Nauczysz się prowadzić wywiad na produktywność — i w 5–10 minut rozumieć, czy człowiek wytwarzał rezultaty w przeszłości.</li>' +
            '<li>Nauczysz się odróżniać winnera od doera i od waitera — i rozumieć, kogo i na jakie stanowisko można postawić.</li>' +
            '<li>Zrozumiesz, kto dokładnie w twojej firmie powinien prowadzić ten wywiad — i dlaczego właśnie tu najczęściej ludzie się potykają.</li>' +
            '<li>Przeanalizujesz dziesiątki prawdziwych przykładów — żywe wywiady prawdziwych kandydatów — i nauczysz się od razu dostrzegać, z kim warto rozmawiać, a z kim nie.</li>' +
            '</ul>' +
            '<h3>Jak zbudowany jest przewodnik</h3>' +
            '<p>W centrum metody jest „Wywiad na produktywność”. To jej rdzeń: żywa rozmowa z kandydatem. Rozłożymy tu na czynniki wywiad na winnera i na doera, omówimy kandydatów bez doświadczenia, różnicę między rezultatem a produktem, subtelne sytuacje oraz sprawdzanie referencji.</p>' +
            b('UWAGA',
              bp('Przez cały przewodnik przewijają się trzy kluczowe typy ludzi. Krótko: <strong>winner</strong> to ten, kto widzi końcowy produkt swojej pracy i myśli rezultatem. <strong>Doer</strong> może i nie widzi produktu, ale bardzo chce pracować i przynosi mnóstwo pożytku jako wykonawca. <strong>Waiter</strong> to ten, kto nie lubi pracy, unika odpowiedzialności i dodatkowych zadań.', true)),
        },
      },

      // 2 — ШАГ 0: ПРОДУКТ
      {
        id: 'product',
        title: { ru: 'Шаг 0. Что такое «продукт» должности', en: 'Step 0. What the "product" of a role is', pl: 'Krok 0. Czym jest „produkt” stanowiska' },
        desc: { ru: 'Определение продукта, как объяснить это слово кандидату.', en: 'Defining the product and how to explain the word to a candidate.', pl: 'Definicja produktu i jak wyjaśnić to słowo kandydatowi.' },
        html: {
          ru:
            '<h2>Что мы проверяем и зачем</h2>' +
            '<p>Когда мы проводим интервью на продуктивность, мы всегда пытаемся выяснить две вещи. Первое — производил ли этот человек результаты в прошлом. Это самое главное: если результатов нет — до свидания. Прошлое для нас важнее любых обещаний насчёт будущего. Второе — кто он: виннер или дуер.</p>' +
            k('ЗАПОМНИТЕ',
              bp('Продуктивность — это характеристика (качество) человека, указывающая на наличие пользы, то есть результатов, на работе и/или в жизни, в настоящем времени и/или в прошлом.', true)) +
            '<p>Отсюда два вывода. Во-первых, продуктивность проявляется на работе или в жизни — значит, даже если человек ещё не работал, у него есть жизнь, и там тоже можно искать следы продуктивности. Во-вторых, она относится к прошлому и настоящему, а не к будущему, — поэтому мы и проверяем прошлое. Если в прошлом человека нет следов продуктивности, у нас нет оснований ожидать, что он внезапно прозреет и начнёт производить результаты именно у нас.</p>' +
            '<h2>Шаг 0. Определите слово «продукт»</h2>' +
            '<p>Прежде чем задавать главный вопрос, нам нужно договориться с кандидатом об одном слове — «продукт». В обычном языке у него куча значений: от того, что мы едим, до любого результата вообще. А мы вкладываем в него совершенно конкретный смысл.</p>' +
            k('ЗАПОМНИТЕ',
              bp('Под словом «продукт» мы имеем в виду формулировку того, что от человека ожидалось как результат всей его работы на данной должности — то есть что должно было получаться в результате всех его действий и всей работы. Не «какие результаты он достиг» и не «что полезного сделал». Мы просим именно формулировку ожидаемого конечного результата должности.', true)) +
            '<p>Определить это слово можно очень быстро — не нужно читать трёхчасовую лекцию, достаточно нескольких предложений. Обязательно приведите пример — так больше шансов, что человек поймёт, что именно вы спрашиваете. Возьмите любую должность и прямо проговорите ожидаемый конечный результат:</p>' +
            '<ul>' +
            '<li><strong>Дворник.</strong> Чистый, опрятный двор, по которому удобно ходить и ездить на машине.</li>' +
            '<li><strong>Посудомойка.</strong> Чистая и сухая посуда, к тому же сложенная там, где она должна находиться.</li>' +
            '<li><strong>Учитель.</strong> Ученик, который понял, чему его учил учитель, и может применять это в реальной жизни.</li>' +
            '</ul>' +
            '<h3>«А не наведём ли мы его на правильный ответ?»</h3>' +
            '<p>Частое опасение: если дать определение и пример, не подскажем ли мы кандидату «правильный» ответ? Практика говорит: навести дуера на ответ виннера совсем не так легко. Вы даже удивитесь, насколько это сложно. Так что не беспокойтесь и делайте этот шаг как следует.</p>' +
            b('НА ЗАМЕТКУ',
              bp('Если человек устраивается к вам, например, охранником, объясняйте слово «продукт» не на примере охранника, а на примере любых других должностей (водитель, дворник), чтобы не подсказать. На самом интервью вы никому ничего не объясняете, кроме определений слов.', true)),
          en:
            '<h2>What we are testing, and why</h2>' +
            '<p>When we run a productivity interview, we are always trying to establish two things. First — did this person produce results in the past. This is the main thing: no results — goodbye. For us the past matters more than any promises about the future. Second — who they are: a winner or a doer.</p>' +
            k('REMEMBER',
              bp('Productivity is a trait (quality) of a person that indicates the presence of value — that is, results — at work and/or in life, in the present and/or in the past.', true)) +
            '<p>Two conclusions follow. First, productivity shows up at work or in life — so even if a person hasn\'t worked yet, they have a life, and you can look for traces of productivity there too. Second, it concerns the past and the present, not the future — which is why we test the past. If there are no traces of productivity in a person\'s past, we have no grounds to expect that they will suddenly see the light and start producing results here.</p>' +
            '<h2>Step 0. Define the word "product"</h2>' +
            '<p>Before asking the main question, we need to agree with the candidate on one word — "product." In ordinary language it has a pile of meanings, from what we eat to any result whatsoever. And we put a very specific meaning into it.</p>' +
            k('REMEMBER',
              bp('By "product" we mean the formulation of what was expected from the person as the result of all their work in the given role — that is, what should have come out of all their actions and all their work. Not "what results they achieved" and not "what useful things they did." We are asking specifically for the formulation of the role\'s expected final result.', true)) +
            '<p>You can define this word very quickly — no need for a three-hour lecture, a few sentences will do. Be sure to give an example — that way the person is much more likely to grasp what exactly you\'re asking. Take any role and state its expected final result out loud:</p>' +
            '<ul>' +
            '<li><strong>A street sweeper.</strong> A clean, tidy yard that\'s pleasant to walk and drive through.</li>' +
            '<li><strong>A dishwasher.</strong> Clean, dry dishes, and put away where they belong.</li>' +
            '<li><strong>A teacher.</strong> A student who understood what the teacher taught and can apply it in real life.</li>' +
            '</ul>' +
            '<h3>"Won\'t we lead them to the right answer?"</h3>' +
            '<p>A common worry: if we give a definition and an example, won\'t we prompt the candidate with the "right" answer? Practice says: leading a doer to a winner\'s answer is not at all that easy. You\'ll be surprised how hard it is. So don\'t worry, and do this step properly.</p>' +
            b('NOTE',
              bp('If a person is applying to you as, say, a security guard, explain the word "product" using other roles (a driver, a sweeper), not a guard, so as not to prompt them. In the interview itself you explain nothing to anyone except the definitions of words.', true)),
          pl:
            '<h2>Co sprawdzamy i po co</h2>' +
            '<p>Prowadząc wywiad na produktywność, zawsze staramy się ustalić dwie rzeczy. Pierwsza — czy ten człowiek wytwarzał rezultaty w przeszłości. To najważniejsze: nie ma rezultatów — do widzenia. Przeszłość jest dla nas ważniejsza niż jakiekolwiek obietnice na przyszłość. Druga — kim jest: winnerem czy doerem.</p>' +
            k('ZAPAMIĘTAJ',
              bp('Produktywność to cecha (właściwość) człowieka, wskazująca na obecność pożytku, czyli rezultatów, w pracy i/lub w życiu, w teraźniejszości i/lub w przeszłości.', true)) +
            '<p>Wynikają stąd dwa wnioski. Po pierwsze, produktywność przejawia się w pracy lub w życiu — więc nawet jeśli człowiek jeszcze nie pracował, ma życie, i tam też można szukać śladów produktywności. Po drugie, dotyczy ona przeszłości i teraźniejszości, a nie przyszłości — dlatego sprawdzamy przeszłość. Jeśli w przeszłości człowieka nie ma śladów produktywności, nie mamy podstaw, by oczekiwać, że nagle przejrzy na oczy i zacznie wytwarzać rezultaty właśnie u nas.</p>' +
            '<h2>Krok 0. Zdefiniuj słowo „produkt”</h2>' +
            '<p>Zanim zadamy główne pytanie, musimy uzgodnić z kandydatem jedno słowo — „produkt”. W zwykłym języku ma ono mnóstwo znaczeń: od tego, co jemy, po dowolny rezultat w ogóle. A my wkładamy w nie zupełnie konkretny sens.</p>' +
            k('ZAPAMIĘTAJ',
              bp('Przez słowo „produkt” rozumiemy sformułowanie tego, czego od człowieka oczekiwano jako rezultatu całej jego pracy na danym stanowisku — czyli co miało wychodzić z wszystkich jego działań i całej pracy. Nie „jakie rezultaty osiągnął” i nie „co pożytecznego zrobił”. Prosimy właśnie o sformułowanie oczekiwanego końcowego rezultatu stanowiska.', true)) +
            '<p>To słowo można zdefiniować bardzo szybko — nie trzeba czytać trzygodzinnego wykładu, wystarczy kilka zdań. Koniecznie podaj przykład — wtedy jest większa szansa, że człowiek zrozumie, o co dokładnie pytasz. Weź dowolne stanowisko i wprost wypowiedz oczekiwany końcowy rezultat:</p>' +
            '<ul>' +
            '<li><strong>Dozorca.</strong> Czyste, schludne podwórko, po którym wygodnie się chodzi i jeździ.</li>' +
            '<li><strong>Zmywak.</strong> Czyste i suche naczynia, w dodatku ułożone tam, gdzie mają być.</li>' +
            '<li><strong>Nauczyciel.</strong> Uczeń, który zrozumiał to, czego uczył go nauczyciel, i potrafi to zastosować w prawdziwym życiu.</li>' +
            '</ul>' +
            '<h3>„A czy go nie naprowadzimy na właściwą odpowiedź?”</h3>' +
            '<p>Częsta obawa: jeśli podamy definicję i przykład, czy nie podpowiemy kandydatowi „właściwej” odpowiedzi? Praktyka mówi: naprowadzenie doera na odpowiedź winnera wcale nie jest takie łatwe. Aż się zdziwisz, jakie to trudne. Więc nie martw się i wykonaj ten krok jak należy.</p>' +
            b('UWAGA',
              bp('Jeśli ktoś aplikuje do ciebie np. na ochroniarza, wyjaśniaj słowo „produkt” na przykładzie innych stanowisk (kierowca, dozorca), a nie ochroniarza, żeby nie podpowiedzieć. Na samym wywiadzie nikomu nic nie wyjaśniasz poza definicjami słów.', true)),
        },
      },

      // 3 — ВИННЕР И ДУЕР
      {
        id: 'winner-doer',
        title: { ru: 'Виннер и дуер: в чём разница', en: 'Winner and doer: the difference', pl: 'Winner i doer: na czym polega różnica' },
        desc: { ru: 'Кто такие виннер и дуер, ответы каждого и схема развилки.', en: 'Who winners and doers are, their answers, and the fork.', pl: 'Kim są winner i doer, ich odpowiedzi i schemat rozwidlenia.' },
        html: {
          ru:
            '<h2>Виннер и дуер: в чём разница</h2>' +
            '<p>Очень продуктивные люди — это не обязательно виннеры. Продуктивными бывают и виннеры, и дуеры. Запомните это накрепко, иначе будете постоянно путаться.</p>' +
            '<p><strong>Виннер</strong> — это особая точка зрения. Виннер видит формулировку конечного продукта: он всегда смотрит на то, к чему в итоге должна привести работа, что должно получиться в результате.</p>' +
            '<p><strong>Дуер</strong> — человек, который производит результаты за счёт огромного желания работать, активности, упорства, смелости, — но конечный продукт как формулировку он может и не видеть. Производят результаты и виннеры, и дуеры. А вот видят формулировку конечного продукта — только виннеры. Вот эту разницу и нужно поймать.</p>' +
            k('ВАЖНАЯ ИДЕЯ',
              bp('Быть дуером — не значит, что с человеком «что-то не так». Это не значит, что он глупый или непродуктивный. Это значит только одно: у него нет определённой точки зрения виннера. При этом дуер может быть невероятно продуктивным и ценным. Относитесь к хорошим дуерам с уважением.', true)) +
            '<h3>«Сделал бизнес» — ещё не значит «виннер»</h3>' +
            '<p>Частая ловушка: «Если человек создал компанию, значит, он виннер». Нет. Скорее всего, он либо виннер, либо дуер, но утверждать, что именно виннер, нельзя. Человек может построить бизнес просто за счёт активности, смелости и упорства: подтащил того, кто хорошо считает, и того, кто хорошо продаёт, а сам круглые сутки общается с людьми и что-то «мутит». Продукт он при этом может и не видеть.</p>' +
            '<h3>Главный вопрос: «Что было вашим продуктом?»</h3>' +
            '<p>Вы видите по резюме, кем человек работал. Задайте вопрос предметно, привязав его к последней должности: «Что было вашим продуктом как менеджера по продажам?» (или: «что было вашим продуктом на прошлой работе?»). Разберём ответы на примере руководителя отдела продаж.</p>' +
            b('ПРИМЕР',
              bp('<strong>Ответ виннера (варианты):</strong> «Моим продуктом были все продажи компании — у нас, кроме отдела продаж, никто не продавал». «Меня взяли, когда компания уже продавала на 10 миллионов; всё, что свыше 10 миллионов, — это мой продукт». «Весь доход компании — это мой продукт». Разными словами человек описывает один и тот же конечный результат должности.') +
              bp('<strong>Ответ не-виннера (дуера):</strong> «Мой продукт был… я занимался с продавцами, учил их, мотивировал, участвовал в ценообразовании, продавал сам». Это перечисление действий и участия, а не формулировка конечного результата.', true)) +
            '<h3>Схема развилки</h3>' +
            '<p>Главный вопрос — это поворотная точка интервью. Не ответил как виннер → переходим на интервью на дуера. Ответил как виннер → идём к следующему вопросу интервью на виннера. То есть, «сваливаясь» с этого интервью, человек обычно сваливается не на улицу, а на интервью на дуера. Ведь, может быть, перед нами хороший дуер, а хороший дуер — ценнейший человек.</p>',
          en:
            '<h2>Winner and doer: what\'s the difference</h2>' +
            '<p>Highly productive people are not necessarily winners. Both winners and doers can be productive. Memorize this firmly, or you will constantly get confused.</p>' +
            '<p>A <strong>winner</strong> is a particular viewpoint. A winner sees the formulation of the final product: they always look at what the work should ultimately lead to, what should come out of it.</p>' +
            '<p>A <strong>doer</strong> is a person who produces results through an enormous desire to work — through drive, persistence, boldness — but may not see the final product as a formulation. Both winners and doers produce results. But only winners see the formulation of the final product. That is the difference you need to catch.</p>' +
            k('KEY IDEA',
              bp('Being a doer doesn\'t mean something is "wrong" with the person. It doesn\'t mean they\'re unintelligent or unproductive. It means only one thing: they lack a certain winner\'s viewpoint. And a doer can be incredibly productive and valuable. Treat good doers with respect.', true)) +
            '<h3>"Built a business" doesn\'t mean "winner"</h3>' +
            '<p>A common trap: "If a person founded a company, they must be a winner." No. They are most likely either a winner or a doer, but you cannot assert that they are specifically a winner. A person can build a business through sheer drive, boldness, and persistence: they pulled in someone good with numbers and someone good at selling, while they themselves talk to people around the clock and "make things happen." They may not see the product at all.</p>' +
            '<h3>The main question: "What was your product?"</h3>' +
            '<p>You can see from the résumé what the person did. Ask the question concretely, tying it to their last role: "What was your product as a sales manager?" (or: "what was your product at your last job?"). Let\'s look at the answers using a head of sales as an example.</p>' +
            b('EXAMPLE',
              bp('<strong>A winner\'s answer (variants):</strong> "My product was all of the company\'s sales — apart from the sales department, no one at our company sold anything." "I was brought in when the company was already selling ten million; everything above ten million is my product." "The company\'s entire revenue is my product." In different words, the person describes one and the same final result of the role.') +
              bp('<strong>A non-winner\'s answer (a doer):</strong> "My product was… I worked with the salespeople, trained them, motivated them, took part in pricing, sold things myself." This is a list of actions and participation, not a formulation of a final result.', true)) +
            '<h3>The fork in the road</h3>' +
            '<p>The main question is the turning point of the interview. Didn\'t answer like a winner → we move to the doer interview. Answered like a winner → we go to the next question of the winner interview. In other words, when a person "falls off" this interview, they usually fall not out onto the street, but onto the doer interview. Because maybe we have a good doer in front of us, and a good doer is an invaluable person.</p>',
          pl:
            '<h2>Winner i doer: na czym polega różnica</h2>' +
            '<p>Bardzo produktywni ludzie to niekoniecznie winnerzy. Produktywni bywają i winnerzy, i doerzy. Zapamiętaj to na mur, bo inaczej będziesz się stale gubić.</p>' +
            '<p><strong>Winner</strong> to szczególny punkt widzenia. Winner widzi sformułowanie końcowego produktu: zawsze patrzy na to, do czego ostatecznie ma prowadzić praca, co ma z niej wyjść.</p>' +
            '<p><strong>Doer</strong> to człowiek, który wytwarza rezultaty dzięki ogromnej chęci pracy — dzięki aktywności, uporowi, śmiałości — ale końcowego produktu jako sformułowania może nie widzieć. Rezultaty wytwarzają i winnerzy, i doerzy. Ale sformułowanie końcowego produktu widzą tylko winnerzy. I właśnie tę różnicę trzeba wyłapać.</p>' +
            k('KLUCZOWA IDEA',
              bp('Bycie doerem nie znaczy, że z człowiekiem „coś jest nie tak”. Nie znaczy, że jest głupi albo nieproduktywny. Znaczy tylko jedno: nie ma określonego punktu widzenia winnera. Przy tym doer może być niesamowicie produktywny i cenny. Traktuj dobrych doerów z szacunkiem.', true)) +
            '<h3>„Zbudował biznes” — to jeszcze nie znaczy „winner”</h3>' +
            '<p>Częsta pułapka: „Jeśli człowiek założył firmę, to jest winnerem”. Nie. Najpewniej jest albo winnerem, albo doerem, ale nie można twierdzić, że to akurat winner. Człowiek może zbudować biznes po prostu dzięki aktywności, śmiałości i uporowi: podciągnął tego, kto dobrze liczy, i tego, kto dobrze sprzedaje, a sam całą dobę rozmawia z ludźmi i coś „kombinuje”. Produktu przy tym może nie widzieć.</p>' +
            '<h3>Główne pytanie: „Co było twoim produktem?”</h3>' +
            '<p>Z CV widzisz, kim człowiek pracował. Zadaj pytanie konkretnie, wiążąc je z ostatnim stanowiskiem: „Co było twoim produktem jako menedżera sprzedaży?” (albo: „co było twoim produktem w poprzedniej pracy?”). Rozłóżmy odpowiedzi na przykładzie kierownika działu sprzedaży.</p>' +
            b('PRZYKŁAD',
              bp('<strong>Odpowiedź winnera (warianty):</strong> „Moim produktem była cała sprzedaż firmy — poza działem sprzedaży nikt u nas nie sprzedawał”. „Wzięto mnie, gdy firma sprzedawała już za 10 milionów; wszystko powyżej 10 milionów to mój produkt”. „Cały przychód firmy to mój produkt”. Różnymi słowami człowiek opisuje jeden i ten sam końcowy rezultat stanowiska.') +
              bp('<strong>Odpowiedź nie-winnera (doera):</strong> „Moim produktem było… zajmowałem się sprzedawcami, szkoliłem ich, motywowałem, uczestniczyłem w ustalaniu cen, sam sprzedawałem”. To wyliczenie działań i uczestnictwa, a nie sformułowanie końcowego rezultatu.', true)) +
            '<h3>Schemat rozwidlenia</h3>' +
            '<p>Główne pytanie to punkt zwrotny wywiadu. Nie odpowiedział jak winner → przechodzimy do wywiadu na doera. Odpowiedział jak winner → idziemy do kolejnego pytania wywiadu na winnera. Innymi słowy, „spadając” z tego wywiadu, człowiek zwykle spada nie na ulicę, lecz na wywiad na doera. Bo może przed nami dobry doer, a dobry doer to najcenniejszy człowiek.</p>',
        },
      },

      // 4 — ШАГ 1: ГЛАВНЫЙ ВОПРОС, ВТОРОЙ ШАНС, ПИАР
      {
        id: 'main-question',
        title: { ru: 'Шаг 1. Главный вопрос, второй шанс и пиар', en: 'Step 1. The main question, second chance, PR', pl: 'Krok 1. Główne pytanie, druga szansa i PR' },
        desc: { ru: 'Самый важный вопрос интервью, второй шанс и почему «пиар» опасен.', en: 'The most important question, the second chance, and why PR is dangerous.', pl: 'Najważniejsze pytanie, druga szansa i dlaczego PR jest groźny.' },
        html: {
          ru:
            '<h2>Шаг 1. Главный вопрос</h2>' +
            '<p>Ещё раз подчеркну: мы не спрашиваем, каких результатов человек достиг и что полезного сделал. Мы просим формулировку — интересует, видит ли он то, что должно было получиться в результате всей его работы.</p>' +
            k('ЗАПОМНИТЕ',
              bp('Это самый важный вопрос интервью на продуктивность. Если человек на него не отвечает — он не виннер. Вот так быстро часто и заканчивается интервью на виннера. Если на конкретную должность нам нужен только виннер, а перед нами не виннер, интервью, по сути, окончено — закончить его нужно плавно и вежливо.', true)) +
            '<h3>Почему большинство людей начинают перечислять действия</h3>' +
            '<p>Большинство кандидатов вместо продукта начнут перечислять действия: «я встречался, я продавал, презентовал, уговаривал». Почему? Потому что дуер естественным образом не видит продукт — он видит действия. Но есть и второй момент: возможно, это интервью у человека сегодня девятое за день, а на предыдущих восьми его спрашивали ровно об одном — «что вы делали?». Поэтому он может на автомате «поставить пластинку», даже если сам является виннером.</p>' +
            r('ВСЕГДА ДАВАЙТЕ ВТОРОЙ ШАНС',
              bp('Если человек перечисляет действия, дайте ему второй шанс — не в виде двухчасовой лекции, а просто переформулировав вопрос: «За что вам в конечном итоге платили деньги, как вы считаете?»; «А что получалось в результате всех этих ваших действий?»; «Чего ожидало от вас руководство в результате всей вашей работы?»') +
              bp('Пяти формулировок давать не нужно, но хотя бы второй шанс дайте всегда. Это одно лишнее предложение, а вы и так из сорока минут делаете пять.', true)) +
            '<h2>Шаг −1. Предупредите, что интервью будет коротким</h2>' +
            '<p>Перед главным вопросом полезен ещё один подготовительный ход: заранее сообщить кандидату, что интервью будет очень коротким. Это нужно по двум причинам — и первая из них важнее, чем кажется.</p>' +
            '<h3>Причина первая — пиар</h3>' +
            '<p>Через менеджера по найму проходит очень много людей, а берём мы считанных. Со временем тех, кого «прогнали» и не взяли, накапливается целая толпа. И они начинают говорить о вашей компании — потому что кто-то из них за кого-то выходит замуж, куда-то устраивается на работу. Поэтому нельзя злить людей.</p>' +
            b('НА ЗАМЕТКУ',
              bp('<strong>Принцип потоков: исходящий рождает входящий.</strong> Будете вежливо общаться с массой людей — не удивляйтесь, что неожиданно начнёте получать от людей что-то хорошее. Будете злить массу людей — не удивляйтесь, что время от времени вас будут «бить по башке», и вы даже не поймёте, кто и за что.', true)) +
            '<p>Как это бьёт по бизнесу: девочка, которую грубо выгнали с интервью, выходит замуж за сына начальника налоговой инспекции вашего района — и у вас начинаются бесконечные проверки. Или устраивается в отдел закупок вашего крупнейшего клиента — и клиент от вас уходит. А причина одна: ваш менеджер по найму людям хамил. И обиженные ненавидят не его лично, а всю вашу компанию.</p>' +
            '<h3>Два продукта менеджера по найму</h3>' +
            '<p>Главный продукт менеджера по найму — быстро нанятый сотрудник с высоким потенциалом на данную должность. Но есть и побочный продукт: та самая толпа людей, которых он через себя пропустил, и то, как они после этого относятся ко всей компании. Помните про оба.</p>' +
            '<p>Вторая причина предупреждения — настроить кандидата на короткий разговор. Человек привык первые минут десять «раскачиваться» на разминочных вопросах. Предупреждением мы говорим: вступления не будет, начинаем сразу. И заодно человека не шокирует, когда через пять минут вы поблагодарите его и попрощаетесь.</p>',
          en:
            '<h2>Step 1. The main question</h2>' +
            '<p>Once more: we are not asking what results the person achieved or what useful things they did. We\'re asking for the formulation — we want to know whether they see what should have come out of all their work.</p>' +
            k('REMEMBER',
              bp('This is the single most important question of the productivity interview. If the person doesn\'t answer it — they\'re not a winner. That\'s how quickly the winner interview often ends. If a given role requires only a winner, and the person before you isn\'t one, the interview is essentially over — you need to end it smoothly and politely.', true)) +
            '<h3>Why most people start listing actions</h3>' +
            '<p>Instead of a product, most candidates will start listing actions: "I met with people, I sold, I gave presentations, I persuaded." Why? Because a doer naturally doesn\'t see the product — they see actions. But there\'s a second factor: this may be the person\'s ninth interview today, and in the previous eight they were asked about exactly one thing — "what did you do?" So they may automatically "put on the record" they played earlier, even if they themselves are a winner.</p>' +
            r('ALWAYS GIVE A SECOND CHANCE',
              bp('If a person lists actions, give them a second chance — not in the form of a two-hour lecture, but simply by rephrasing the question: "What, in the end, were you paid for, do you think?"; "And what came out of all these actions of yours?"; "What did management expect from you as the result of all your work?"') +
              bp('You don\'t need to give five phrasings, but always give at least a second chance. It\'s one extra sentence, and you\'re already turning forty minutes into five.', true)) +
            '<h2>Step −1. Warn that the interview will be short</h2>' +
            '<p>Before the main question, one more preparatory move is useful: tell the candidate in advance that the interview will be very short. This is for two reasons — and the first is more important than it seems.</p>' +
            '<h3>Reason one — PR</h3>' +
            '<p>A great many people pass through a hiring manager, and we hire only a handful. Over time, the people who were "run off" and not hired pile up into a whole crowd. And they start talking about your company — because sooner or later one of them marries someone, or takes a job somewhere. So you must not anger people.</p>' +
            b('NOTE',
              bp('<strong>The flow principle: outgoing creates incoming.</strong> Be courteous with lots of people and don\'t be surprised when good things unexpectedly start coming your way. Anger lots of people and don\'t be surprised when, from time to time, you get "hit over the head" without even understanding who did it or why.', true)) +
            '<p>How it hits the business: a young woman who was rudely thrown out of an interview marries the son of the head of your district tax office — and endless inspections begin. Or she gets a job in the purchasing department of your biggest client — and the client leaves you. And the cause is one and the same: your hiring manager was rude to people. And the offended don\'t hate that person specifically — they hate your whole company.</p>' +
            '<h3>The two products of a hiring manager</h3>' +
            '<p>The main product of a hiring manager is a quickly hired employee with high potential for the given role. But there is also a by-product: that very crowd of people they passed through, and how those people then feel about the whole company. Remember both.</p>' +
            '<p>The second reason for the warning is to set the candidate up for a short conversation. A person is used to spending the first ten minutes "warming up" on preamble questions. With the warning we\'re saying: there will be no preamble, we start right away. And the person isn\'t shocked when, five minutes in, you thank them and say goodbye.</p>',
          pl:
            '<h2>Krok 1. Główne pytanie</h2>' +
            '<p>Jeszcze raz podkreślam: nie pytamy, jakie rezultaty człowiek osiągnął i co pożytecznego zrobił. Prosimy o sformułowanie — interesuje nas, czy widzi to, co miało wyjść z całej jego pracy.</p>' +
            k('ZAPAMIĘTAJ',
              bp('To najważniejsze pytanie wywiadu na produktywność. Jeśli człowiek na nie nie odpowiada — nie jest winnerem. Tak szybko często kończy się wywiad na winnera. Jeśli na dane stanowisko potrzebny jest wyłącznie winner, a przed nami nie winner, wywiad jest w istocie zakończony — trzeba go zakończyć płynnie i uprzejmie.', true)) +
            '<h3>Dlaczego większość ludzi zaczyna wyliczać działania</h3>' +
            '<p>Zamiast produktu większość kandydatów zacznie wyliczać działania: „spotykałem się, sprzedawałem, prezentowałem, przekonywałem”. Dlaczego? Bo doer w naturalny sposób nie widzi produktu — widzi działania. Ale jest i drugi moment: być może to dziś dziewiąty wywiad tego człowieka, a na poprzednich ośmiu pytano go dokładnie o jedno — „co robiłeś?”. Dlatego może automatycznie „puścić płytę”, nawet jeśli sam jest winnerem.</p>' +
            r('ZAWSZE DAWAJ DRUGĄ SZANSĘ',
              bp('Jeśli człowiek wylicza działania, daj mu drugą szansę — nie w postaci dwugodzinnego wykładu, lecz po prostu przeformułowując pytanie: „Za co ostatecznie płacono ci pieniądze, jak sądzisz?”; „A co wychodziło z wszystkich tych twoich działań?”; „Czego oczekiwało od ciebie kierownictwo w rezultacie całej twojej pracy?”') +
              bp('Pięciu sformułowań dawać nie trzeba, ale przynajmniej drugą szansę dawaj zawsze. To jedno dodatkowe zdanie, a i tak z czterdziestu minut robisz pięć.', true)) +
            '<h2>Krok −1. Uprzedź, że wywiad będzie krótki</h2>' +
            '<p>Przed głównym pytaniem przydaje się jeszcze jeden krok przygotowawczy: z góry powiedzieć kandydatowi, że wywiad będzie bardzo krótki. Jest to potrzebne z dwóch powodów — a pierwszy jest ważniejszy, niż się wydaje.</p>' +
            '<h3>Powód pierwszy — PR</h3>' +
            '<p>Przez rekrutera przewija się bardzo wielu ludzi, a zatrudniamy nielicznych. Z czasem tych, których „odprawiono” i nie zatrudniono, uzbiera się cały tłum. I zaczynają mówić o twojej firmie — bo z czasem ktoś z nich za kogoś wychodzi za mąż, gdzieś się zatrudnia. Dlatego nie wolno ludzi złościć.</p>' +
            b('UWAGA',
              bp('<strong>Zasada przepływów: wychodzący rodzi przychodzący.</strong> Będziesz uprzejmie rozmawiać z mnóstwem ludzi — nie dziw się, że nagle zaczniesz dostawać od ludzi coś dobrego. Będziesz złościć mnóstwo ludzi — nie dziw się, że od czasu do czasu ktoś „przywali ci po głowie”, a ty nawet nie zrozumiesz, kto i za co.', true)) +
            '<p>Jak to uderza w biznes: dziewczyna, którą grubiańsko wyproszono z wywiadu, wychodzi za syna naczelnika urzędu skarbowego w twojej dzielnicy — i zaczynają się niekończące kontrole. Albo zatrudnia się w dziale zakupów twojego największego klienta — i klient od ciebie odchodzi. A przyczyna jest jedna: twój rekruter był dla ludzi niegrzeczny. I obrażeni nienawidzą nie jego osobiście, lecz całej twojej firmy.</p>' +
            '<h3>Dwa produkty rekrutera</h3>' +
            '<p>Główny produkt rekrutera to szybko zatrudniony pracownik o wysokim potencjale na danym stanowisku. Ale jest i produkt uboczny: ów tłum ludzi, których przez siebie przepuścił, i to, jak potem odnoszą się do całej firmy. Pamiętaj o obu.</p>' +
            '<p>Drugi powód uprzedzenia — nastawić kandydata na krótką rozmowę. Człowiek jest przyzwyczajony pierwsze dziesięć minut „rozkręcać się” na pytaniach rozgrzewkowych. Uprzedzeniem mówimy: wstępu nie będzie, zaczynamy od razu. I przy okazji człowiek nie jest zaskoczony, gdy po pięciu minutach dziękujesz mu i się żegnasz.</p>',
        },
      },

      // 5 — ШАГИ 2–3: ИЗМЕРЕНИЕ И КОЛИЧЕСТВО
      {
        id: 'measure',
        title: { ru: 'Шаги 2–3. Как измеряли и сколько произвели', en: 'Steps 2–3. How you measured and how much', pl: 'Kroki 2–3. Jak mierzyłeś i ile wytworzyłeś' },
        desc: { ru: '«Как вы его измеряли» и «сколько произвели», нюанс «я не помню».', en: '"How did you measure it" and "how much," and the "I don\'t remember" nuance.', pl: '„Jak mierzyłeś” i „ile wytworzyłeś”, niuans „nie pamiętam”.' },
        html: {
          ru:
            '<h2>Шаг 2. «Как вы его измеряли?»</h2>' +
            '<p>Допустим, человек ответил на главный вопрос как виннер и назвал свой продукт. Следующий шаг нужен вот для чего: мы хотим убедиться, что это действительно его идея. Нас интересует, стала ли эта идея его собственной: понимает ли он её по-настоящему или просто где-то услышал и повторил.</p>' +
            '<p>Как это проверить? Очень изящно. Если человек по-настоящему видит свой продукт, то его естественным образом интересует, сколько он его производит. А если интересует — значит, он как-то пытается его измерять. Поэтому мы и спрашиваем: «А как вы его измеряли?»</p>' +
            b('ПРИМЕР',
              bp('В одну компанию наняли шефу персонального помощника — девушку. Шеф минимум дважды в день ей повторял: «Твой продукт — это моё время». Когда она вышла на рынок и пришла к нам, на вопрос «что было вашим продуктом?» она вспомнила эти слова и ответила: «Мой продукт — это время шефа». Было бы обидно сразу решить, что она виннер: возможно, она это не увидела сама, а просто услышала и повторила. Как проверить? Спросить, как она его измеряла.', true)) +
            '<p>Хорошие настоящие продавцы (тем более виннеры) измеряют себя множеством способов: сравнивают себя с другими продавцами; сравнивают с прошлым месяцем и с тем же месяцем прошлого года; засекают, сколько времени ушло на сделку, и смотрят величину сделки; смотрят повторные продажи. Если же человек никак не измерял свой продукт и понятия не имеет, как это делается, — скорее всего, он просто где-то услышал формулировку. Вывод: он не виннер, и мы переходим на интервью на дуера.</p>' +
            '<h2>Шаг 3. «Сколько вы произвели?»</h2>' +
            '<p>Если человек назвал продукт и как-то его измерял, вполне уместно поговорить о том, сколько он его произвёл. Формулировка зависит от должности: «сколько за прошлый год», «сколько за всё время работы», «сколько в месяц».</p>' +
            k('ЗАПОМНИТЕ',
              bp('Этот вопрос для нас жутко важен. Одно дело — «виннер, точка зрения хорошая». И совсем другое дело — сколько результатов человек производил. Одно дело — он производил столько, а другое — вот столько. Мы прямо спрашиваем про количество произведённого продукта за уместный период.', true)) +
            '<h3>Нюанс: «Я не помню»</h3>' +
            '<p>Это вы будете слышать очень часто. Человек продукт сформулировал, измерял, а вот сколько производил — «не помню». Рассудим логически. Он либо врёт, либо говорит правду — других вариантов нет. Если врёт, что не помнит, — значит, на самом деле произвёл мало и просто не хочет об этом говорить. Если не врёт и действительно не помнит — мы помним то, чем гордимся, и склонны забывать то, к чему не хотели бы иметь отношения. Значит, помнить было нечего.</p>' +
            b('ПРИМЕР',
              bp('Когда мне было пять лет, я играл в юношеском чемпионате СССР по шахматам с лучшими 14-летними шахматистами. Это достижение, и я его помню в деталях. А теперь спросите, какое место я там занял. Я не помню. Вообще. И это значит только одно: я не выигрывал. Если бы там было что помнить, я бы не забыл.') +
              bp('Проверьте на своих людях: возьмите лучших продавцов и спросите, сколько они продали за конкретный год, — они помнят чуть ли не до копейки. Средние помнят приблизительно. Слабые вообще не в теме вопроса.', true)) +
            '<p>Обе ветки ведут к одному: «не помню» — ценный ответ. Поблагодарите человека за него. Если же человек называет незнакомую вам цифру, найдите базу для сравнения: сколько было продавцов и сколько продавал лучший, сколько — худший. Мы ищем, с чем сравнить, — и тогда цифра оживает.</p>',
          en:
            '<h2>Step 2. "How did you measure it?"</h2>' +
            '<p>Suppose the person answered the main question like a winner and named their product. The next step is for this: we want to make sure it\'s really their own idea. What interests us is whether the idea became their own: do they truly understand it, or did they simply hear it somewhere and repeat it?</p>' +
            '<p>How do we check? Very elegantly. If a person genuinely sees their product, then they are naturally interested in how much of it they produce. And if they\'re interested, they somehow try to measure it. So we ask: "And how did you measure it?"</p>' +
            b('EXAMPLE',
              bp('A company hired a personal assistant for the boss — a young woman. At least twice a day the boss would tell her: "Your product is my time." When she went out on the job market and came to us, at the question "what was your product?" she remembered those words and answered: "My product was the boss\'s time." It would be a shame to immediately decide she was a winner: maybe she didn\'t see it herself — she just heard it and repeated it. How to check? Ask how she measured it.', true)) +
            '<p>Good, real salespeople (and winners all the more) measure themselves in many ways: they compare themselves with other salespeople; they compare with last month and with the same month a year ago; they time how long a deal took and look at its size; they watch repeat sales. But if a person never measured their product and has no idea how it\'s done — then most likely they just heard the formulation somewhere. Conclusion: they\'re not a winner, and we move to the doer interview.</p>' +
            '<h2>Step 3. "How much did you produce?"</h2>' +
            '<p>If the person named a product and measured it somehow, it\'s entirely appropriate to talk about how much of it they produced. The phrasing depends on the role: "how much last year," "how much over your whole time there," "how much per month."</p>' +
            k('REMEMBER',
              bp('This question is hugely important to us. It\'s one thing to say "a winner, good viewpoint." It\'s quite another how many results the person produced. It\'s one thing if they produced this much, and another if they produced that much. We ask directly about the quantity of product produced over an appropriate period.', true)) +
            '<h3>The nuance: "I don\'t remember"</h3>' +
            '<p>You\'ll hear this very often. The person formulated the product, measured it, but as for how much they produced — "I don\'t remember." Let\'s reason it through. They\'re either lying or telling the truth. If they\'re lying about not remembering — then in fact they produced little and simply don\'t want to talk about it. If they\'re not lying and genuinely don\'t remember — we remember what we\'re proud of and tend to forget what we\'d rather not be associated with. So there was nothing to remember.</p>' +
            b('EXAMPLE',
              bp('When I was five, I played in the USSR youth chess championship against the best 14-year-olds. It\'s an achievement, and I remember it in detail. Now ask me what place I took there. I don\'t remember. At all. And that means only one thing: I didn\'t win. If there had been something to remember, I wouldn\'t have forgotten it.') +
              bp('Test it on your own people: take your best salespeople and ask how much they sold in a specific year — they remember almost to the penny. Average ones remember approximately. Weak ones don\'t even understand the question.', true)) +
            '<p>Both branches lead to the same place: "I don\'t remember" is a valuable answer. Thank the person for it. And if a person names a number unfamiliar to you, find a basis of comparison: how many salespeople there were and how much the best one sold, how much the worst. We look for something to compare with — and then the number comes alive.</p>',
          pl:
            '<h2>Krok 2. „Jak go mierzyłeś?”</h2>' +
            '<p>Załóżmy, że człowiek odpowiedział na główne pytanie jak winner i nazwał swój produkt. Kolejny krok służy temu: chcemy się upewnić, że to naprawdę jego pomysł. Interesuje nas, czy ten pomysł stał się jego własnym: czy naprawdę go rozumie, czy tylko gdzieś usłyszał i powtórzył.</p>' +
            '<p>Jak to sprawdzić? Bardzo elegancko. Jeśli człowiek naprawdę widzi swój produkt, to w naturalny sposób interesuje go, ile go wytwarza. A jeśli go to interesuje — to jakoś próbuje go mierzyć. Dlatego pytamy: „A jak go mierzyłeś?”</p>' +
            b('PRZYKŁAD',
              bp('Do pewnej firmy zatrudniono szefowi osobistego asystenta — dziewczynę. Szef co najmniej dwa razy dziennie powtarzał jej: „Twój produkt to mój czas”. Gdy wyszła na rynek pracy i przyszła do nas, na pytanie „co było twoim produktem?” przypomniała sobie te słowa i odpowiedziała: „Mój produkt to czas szefa”. Byłoby przykro od razu uznać, że jest winnerem: może wcale tego sama nie dostrzegła, tylko usłyszała i powtórzyła. Jak sprawdzić? Zapytać, jak go mierzyła.', true)) +
            '<p>Dobrzy, prawdziwi sprzedawcy (a tym bardziej winnerzy) mierzą się na wiele sposobów: porównują się z innymi sprzedawcami; porównują z poprzednim miesiącem i z tym samym miesiącem rok wcześniej; mierzą, ile czasu zajęła transakcja, i patrzą na jej wielkość; patrzą na sprzedaż powtórną. Jeśli zaś człowiek nijak nie mierzył swojego produktu i nie ma pojęcia, jak to się robi — to najpewniej po prostu gdzieś usłyszał sformułowanie. Wniosek: nie jest winnerem, i przechodzimy do wywiadu na doera.</p>' +
            '<h2>Krok 3. „Ile wytworzyłeś?”</h2>' +
            '<p>Jeśli człowiek nazwał produkt i jakoś go mierzył, całkiem na miejscu jest porozmawiać o tym, ile go wytworzył. Sformułowanie zależy od stanowiska: „ile w zeszłym roku”, „ile przez cały okres pracy”, „ile miesięcznie”.</p>' +
            k('ZAPAMIĘTAJ',
              bp('To pytanie jest dla nas strasznie ważne. Jedno to „winner, dobry punkt widzenia”. A co innego — ile rezultatów człowiek wytwarzał. Jedno to, że wytwarzał tyle, a co innego — o tyle. Pytamy wprost o ilość wytworzonego produktu w stosownym okresie.', true)) +
            '<h3>Niuans: „Nie pamiętam”</h3>' +
            '<p>To będziesz słyszał bardzo często. Człowiek produkt sformułował, mierzył, a ile wytwarzał — „nie pamiętam”. Rozumujmy logicznie. Albo kłamie, albo mówi prawdę. Jeśli kłamie, że nie pamięta — to w rzeczywistości wytworzył mało i po prostu nie chce o tym mówić. Jeśli nie kłamie i naprawdę nie pamięta — pamiętamy to, z czego jesteśmy dumni, a skłonni jesteśmy zapominać to, z czym nie chcielibyśmy mieć nic wspólnego. Czyli nie było czego pamiętać.</p>' +
            b('PRZYKŁAD',
              bp('Gdy miałem pięć lat, grałem w młodzieżowych mistrzostwach ZSRR w szachach z najlepszymi 14-latkami. To osiągnięcie i pamiętam je w szczegółach. A teraz zapytaj mnie, które miejsce tam zająłem. Nie pamiętam. W ogóle. I to znaczy tylko jedno: nie wygrywałem. Gdyby było co pamiętać, nie zapomniałbym.') +
              bp('Sprawdź na swoich ludziach: weź najlepszych sprzedawców i zapytaj, ile sprzedali w konkretnym roku — pamiętają niemal co do grosza. Przeciętni pamiętają w przybliżeniu. Słabi w ogóle nie rozumieją pytania.', true)) +
            '<p>Obie ścieżki prowadzą do jednego: „nie pamiętam” to cenna odpowiedź. Podziękuj za nią człowiekowi. A jeśli człowiek podaje nieznaną ci liczbę, znajdź podstawę do porównania: ilu było sprzedawców i ile sprzedawał najlepszy, ile najgorszy. Szukamy, z czym porównać — i wtedy liczba ożywa.</p>',
        },
      },

      // 6 — ИТОГИ / ПАМЯТКА
      {
        id: 'summary',
        title: { ru: 'Итоги: результат vs продукт, пиар и памятка', en: 'Summary: result vs product, PR and takeaways', pl: 'Podsumowanie: rezultat vs produkt, PR i ściąga' },
        desc: { ru: 'Различие результата и продукта, уровень пиара, ключевые принципы.', en: 'Result vs product, PR level, and the key principles.', pl: 'Różnica rezultat–produkt, poziom PR i kluczowe zasady.' },
        html: {
          ru:
            '<h2>Результат и продукт — это разные вещи</h2>' +
            '<p>Это одно из самых важных различений во всей методике. Человек, работая на должности, делает множество дел, и каждое приводит к результату: сделал чашку кофе — результат; забронировал билеты — результат; открыл оптовое направление — тоже результат, только куда более значимый. А тех людей, у кого результатов много и они хорошие, мы называем продуктивными.</p>' +
            k('ЗАПОМНИТЕ',
              bp('Представьте всю деятельность человека на должности: он делает море действий, производит море результатов. А теперь посмотрите — во что это всё должно в итоге вылиться? За что работодатель готов платить деньги? Вот это мы и называем продуктом (ЦКП — ценный конечный продукт). Виннер — тот, кто всегда смотрит на продукт.', true)) +
            '<p>Продукт может быть как наличием чего-то, так и отсутствием чего-то, и это отсутствие тоже измеримо. Продукт охранника — отсутствие нежелательных посетителей и конфликтных ситуаций; продукт айтишника — отсутствие проблем со связью и компьютерами; продукт няни — отсутствие ситуаций, угрожающих здоровью ребёнка.</p>' +
            '<h2>Уровень пиара — почему он опасен</h2>' +
            b('НА ЗАМЕТКУ',
              bp('Высокий пиар — это человек, который с удовольствием рассказывает о себе что-то хорошее. Противоположность — скромный человек: даже если у него есть чем гордиться, из него это приходится вытаскивать клещами.') +
              bp('То, как охотно человек говорит о своих достижениях, — это про уровень пиара, а не напрямую про продуктивность. Скромный человек с кучей достижений и балабол «с одной шелухой» ведут себя противоположно. Поэтому со скромными надо терпеливо разговаривать, а к рассказам людей с высоким пиаром относиться внимательнее и всё проверять.', true)) +
            '<h2>Как за пять минут увидеть продуктивного кандидата</h2>' +
            '<ul>' +
            '<li>Проверяйте прошлое: производил ли человек результаты. Обещания насчёт будущего нас не интересуют.</li>' +
            '<li>Договоритесь о слове «продукт» и приведите пример на чужой должности — не подсказывайте.</li>' +
            '<li>Задайте главный вопрос: «Что было вашим продуктом?» — и всегда давайте второй шанс, переформулировав.</li>' +
            '<li>Ответил как виннер → «как измеряли» и «сколько произвели». Не ответил → плавно переходите на интервью на дуера.</li>' +
            '<li>«Не помню» — ценный ответ. Незнакомую цифру всегда сравнивайте с чем-то.</li>' +
            '<li>Относитесь к людям хорошо: исходящий поток рождает входящий.</li>' +
            '</ul>' +
            r('ГЛАВНОЕ',
              bp('Самое важное в найме — интервью на продуктивность, а самое важное в интервью — кто его проводит. Проводить его должен виннер: только он способен распознать продукт в ответе кандидата. Это самое тонкое место всей методики, и именно на нём чаще всего спотыкаются.', true)),
          en:
            '<h2>A result and a product are different things</h2>' +
            '<p>This is one of the most important distinctions in the whole method. A person working in a role does a multitude of things, and each leads to a result: made a cup of coffee — a result; booked the tickets — a result; launched a wholesale division — a result too, only far more significant. And the people who have many good results we call productive.</p>' +
            k('REMEMBER',
              bp('Picture all of a person\'s activity in a role: they do a sea of actions, produce a sea of results. Now look — what should all of it ultimately amount to? What is the employer willing to pay for? That is what we call the product (the VFP — valuable final product). A winner is someone who always looks at the product.', true)) +
            '<p>A product can be either the presence of something or the absence of something, and that absence is measurable too. A guard\'s product is the absence of unwanted visitors and conflict situations; an IT person\'s product is the absence of problems with connectivity and computers; a nanny\'s product is the absence of situations threatening the child\'s health.</p>' +
            '<h2>PR level — why it\'s dangerous</h2>' +
            b('NOTE',
              bp('High PR is a person who happily talks about something good about themselves. The opposite is a modest person: even if they have something to be proud of, you have to pull it out of them with pliers.') +
              bp('How willingly a person talks about their achievements is about PR level, not directly about productivity. A modest person with a pile of achievements and a windbag with nothing but husk behave in opposite ways. So talk patiently with the modest ones, and treat the stories of high-PR people more carefully and verify everything.', true)) +
            '<h2>How to see a productive candidate in five minutes</h2>' +
            '<ul>' +
            '<li>Test the past: did the person produce results. Promises about the future don\'t interest us.</li>' +
            '<li>Agree on the word "product" and give an example from another role — don\'t prompt them.</li>' +
            '<li>Ask the main question: "What was your product?" — and always give a second chance by rephrasing.</li>' +
            '<li>Answered like a winner → "how you measured it" and "how much you produced." Didn\'t answer → smoothly move to the doer interview.</li>' +
            '<li>"I don\'t remember" is a valuable answer. Always compare an unfamiliar number to something.</li>' +
            '<li>Treat people well: outgoing flow creates incoming flow.</li>' +
            '</ul>' +
            r('THE MAIN THING',
              bp('The most important thing in hiring is the productivity interview, and the most important thing in the interview is who runs it. It must be run by a winner: only they can recognize the product in a candidate\'s answer. This is the most delicate point of the whole method, and it\'s exactly where people most often stumble.', true)),
          pl:
            '<h2>Rezultat i produkt to różne rzeczy</h2>' +
            '<p>To jedno z najważniejszych rozróżnień w całej metodzie. Człowiek, pracując na stanowisku, robi mnóstwo rzeczy, i każda prowadzi do rezultatu: zrobił filiżankę kawy — rezultat; zarezerwował bilety — rezultat; uruchomił dział hurtowy — też rezultat, tyle że o wiele bardziej znaczący. A tych ludzi, u których rezultatów jest dużo i są dobre, nazywamy produktywnymi.</p>' +
            k('ZAPAMIĘTAJ',
              bp('Wyobraź sobie całą działalność człowieka na stanowisku: robi morze działań, wytwarza morze rezultatów. A teraz popatrz — w co to wszystko ma się ostatecznie przełożyć? Za co pracodawca gotów jest płacić pieniądze? Właśnie to nazywamy produktem (CPK — cenny produkt końcowy). Winner to ten, kto zawsze patrzy na produkt.', true)) +
            '<p>Produktem może być zarówno obecność czegoś, jak i brak czegoś, i ten brak też jest mierzalny. Produkt ochroniarza to brak niepożądanych gości i sytuacji konfliktowych; produkt informatyka to brak problemów z łącznością i komputerami; produkt niani to brak sytuacji zagrażających zdrowiu dziecka.</p>' +
            '<h2>Poziom PR — dlaczego jest groźny</h2>' +
            b('UWAGA',
              bp('Wysoki PR to człowiek, który z przyjemnością opowiada o sobie coś dobrego. Przeciwieństwo to człowiek skromny: nawet jeśli ma z czego być dumny, trzeba to z niego wyciągać obcęgami.') +
              bp('To, jak chętnie człowiek mówi o swoich osiągnięciach, dotyczy poziomu PR, a nie wprost produktywności. Skromny człowiek z mnóstwem osiągnięć i gaduła „z samą łuską” zachowują się przeciwnie. Dlatego ze skromnymi trzeba cierpliwie rozmawiać, a do opowieści ludzi o wysokim PR podchodzić uważniej i wszystko sprawdzać.', true)) +
            '<h2>Jak w pięć minut dostrzec produktywnego kandydata</h2>' +
            '<ul>' +
            '<li>Sprawdzaj przeszłość: czy człowiek wytwarzał rezultaty. Obietnice na przyszłość nas nie interesują.</li>' +
            '<li>Uzgodnij słowo „produkt” i podaj przykład na cudzym stanowisku — nie podpowiadaj.</li>' +
            '<li>Zadaj główne pytanie: „Co było twoim produktem?” — i zawsze dawaj drugą szansę, przeformułowując.</li>' +
            '<li>Odpowiedział jak winner → „jak mierzyłeś” i „ile wytworzyłeś”. Nie odpowiedział → płynnie przejdź do wywiadu na doera.</li>' +
            '<li>„Nie pamiętam” to cenna odpowiedź. Nieznaną liczbę zawsze z czymś porównuj.</li>' +
            '<li>Traktuj ludzi dobrze: przepływ wychodzący rodzi przychodzący.</li>' +
            '</ul>' +
            r('NAJWAŻNIEJSZE',
              bp('Najważniejsze w rekrutacji jest wywiad na produktywność, a najważniejsze w wywiadzie — kto go prowadzi. Prowadzić go musi winner: tylko on potrafi rozpoznać produkt w odpowiedzi kandydata. To najsubtelniejsze miejsce całej metody, i właśnie na nim najczęściej ludzie się potykają.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: { ru: 'Что такое продуктивность?', en: 'What is productivity?', pl: 'Czym jest produktywność?' },
          opts: [
            { ru: 'Наличие диплома и стажа работы.', en: 'Having a diploma and work experience.', pl: 'Posiadaniem dyplomu i stażu pracy.' },
            { ru: 'Характеристика человека, указывающая на наличие результатов (пользы) на работе и/или в жизни, в настоящем и/или прошлом.', en: 'A trait of a person indicating the presence of results (value) at work and/or in life, in the present and/or the past.', pl: 'Cechą człowieka wskazującą na obecność rezultatów (pożytku) w pracy i/lub w życiu, w teraźniejszości i/lub przeszłości.' },
            { ru: 'Способность видеть конечный продукт любой должности.', en: 'The ability to see the final product of any role.', pl: 'Zdolnością widzenia końcowego produktu dowolnego stanowiska.' },
            { ru: 'Сильное желание много работать.', en: 'A strong desire to work hard.', pl: 'Silną chęcią ciężkiej pracy.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Виннер — это прежде всего…', en: 'A winner is primarily…', pl: 'Winner to przede wszystkim…' },
          opts: [
            { ru: 'Тот, кто создал успешный бизнес.', en: 'Someone who built a successful business.', pl: 'Ten, kto zbudował udany biznes.' },
            { ru: 'Самый продуктивный сотрудник компании.', en: 'The most productive employee in the company.', pl: 'Najbardziej produktywny pracownik firmy.' },
            { ru: 'Особая точка зрения: человек видит формулировку конечного продукта.', en: 'A particular viewpoint: the person sees the formulation of the final product.', pl: 'Szczególny punkt widzenia: człowiek widzi sformułowanie końcowego produktu.' },
            { ru: 'Руководитель высокого уровня.', en: 'A high-level manager.', pl: 'Menedżer wysokiego szczebla.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Верно ли утверждение: «Если человек очень продуктивен, значит, он виннер»?', en: 'True or false: "If a person is very productive, they must be a winner"?', pl: 'Prawda czy fałsz: „Jeśli człowiek jest bardzo produktywny, to jest winnerem”?' },
          opts: [
            { ru: 'Верно.', en: 'True.', pl: 'Prawda.' },
            { ru: 'Неверно: продуктивными бывают и виннеры, и дуеры.', en: 'False: both winners and doers can be productive.', pl: 'Fałsz: produktywni bywają i winnerzy, i doerzy.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Кто такой дуер?', en: 'Who is a doer?', pl: 'Kim jest doer?' },
          opts: [
            { ru: 'Человек, с которым «что-то не так».', en: 'Someone with whom "something is wrong."', pl: 'Kimś, z kim „coś jest nie tak”.' },
            { ru: 'Ленивый сотрудник, избегающий работы.', en: 'A lazy employee who avoids work.', pl: 'Leniwym pracownikiem unikającym pracy.' },
            { ru: 'Тот, кто производит результаты за счёт желания работать, но может не видеть формулировку продукта.', en: 'Someone who produces results through a desire to work but may not see the product as a formulation.', pl: 'Kimś, kto wytwarza rezultaty dzięki chęci pracy, ale może nie widzieć produktu jako sformułowania.' },
            { ru: 'Новичок без опыта.', en: 'A newcomer with no experience.', pl: 'Nowicjuszem bez doświadczenia.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Почему в интервью мы смотрим в прошлое, а не на будущее?', en: 'Why do we look at the past in the interview, not the future?', pl: 'Dlaczego w wywiadzie patrzymy w przeszłość, a nie w przyszłość?' },
          opts: [
            { ru: 'Прошлое легче проверить документами.', en: 'The past is easier to verify with documents.', pl: 'Przeszłość łatwiej zweryfikować dokumentami.' },
            { ru: 'Продуктивность относится к прошлому и настоящему; нет оснований ожидать, что непродуктивный вдруг станет продуктивным именно у нас.', en: "Productivity concerns the past and the present; there's no reason to expect an unproductive person to suddenly become productive at our company.", pl: 'Produktywność dotyczy przeszłości i teraźniejszości; nie ma podstaw, by oczekiwać, że nieproduktywny nagle stanie się produktywny właśnie u nas.' },
            { ru: 'Так требует трудовое законодательство.', en: 'Labor law requires it.', pl: 'Wymaga tego prawo pracy.' },
            { ru: 'О будущем нельзя говорить на интервью.', en: "You can't discuss the future in an interview.", pl: 'O przyszłości nie wolno rozmawiać na wywiadzie.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'В модели «Быть — Делать — Иметь» виннерство относится к…', en: 'In the "Be — Do — Have" model, winnerness belongs to…', pl: 'W modelu „Być — Robić — Mieć” winnerstwo należy do…' },
          opts: [
            { ru: '«Делать» (действия).', en: '"Do" (actions).', pl: '„Robić” (działania).' },
            { ru: '«Иметь» (результаты).', en: '"Have" (results).', pl: '„Mieć” (rezultaty).' },
            { ru: '«Быть» (идеи, точка зрения).', en: '"Be" (ideas, viewpoint).', pl: '„Być” (idee, punkt widzenia).' },
            { ru: 'Ко всем трём одинаково.', en: 'All three equally.', pl: 'Do wszystkich trzech jednakowo.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Обучение (особенно теоретическое) — это преимущественно…', en: 'Studying (especially theoretical study) is predominantly…', pl: 'Nauka (zwłaszcza teoretyczna) to przede wszystkim…' },
          opts: [
            { ru: 'Исходящий поток.', en: 'Outgoing flow.', pl: 'Przepływ wychodzący.' },
            { ru: 'Входящий поток (поэтому диплом сам по себе не означает продуктивность).', en: 'Incoming flow (which is why a diploma alone does not equal productivity).', pl: 'Przepływ przychodzący (dlatego sam dyplom nie oznacza produktywności).' },
          ],
          correct: 1,
        },
        {
          q: { ru: '«Человек создал компанию» — что это доказывает?', en: '"A person built a company" — what does this prove?', pl: '„Człowiek zbudował firmę” — co to dowodzi?' },
          opts: [
            { ru: 'Что он точно виннер.', en: 'That they are definitely a winner.', pl: 'Że na pewno jest winnerem.' },
            { ru: 'Что он точно дуер.', en: 'That they are definitely a doer.', pl: 'Że na pewno jest doerem.' },
            { ru: 'Что он продуктивен (это про «иметь»); виннер он или нет — отдельный вопрос про «быть».', en: 'That they are productive (that\'s about "Have"); whether they\'re a winner is a separate question about "Be."', pl: 'Że jest produktywny (to o „Mieć”); czy jest winnerem — to osobne pytanie o „Być”.' },
            { ru: 'Ничего не доказывает.', en: 'Nothing at all.', pl: 'Niczego nie dowodzi.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Самый главный вопрос интервью на виннера:', en: 'The single most important question of the winner interview:', pl: 'Najważniejsze pytanie wywiadu na winnera:' },
          opts: [
            { ru: '«Кем вы работали?»', en: '"What did you do?"', pl: '„Kim pracowałeś?”' },
            { ru: '«Что было вашим продуктом?»', en: '"What was your product?"', pl: '„Co było twoim produktem?”' },
            { ru: '«Почему вы ушли с прошлой работы?»', en: '"Why did you leave your last job?"', pl: '„Dlaczego odszedłeś z poprzedniej pracy?”' },
            { ru: '«Какая у вас была зарплата?»', en: '"What was your salary?"', pl: '„Jaką miałeś pensję?”' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Если на главный вопрос человек перечисляет действия («встречался, звонил, презентовал»), вы:', en: 'If, to the main question, a person lists actions ("I met, I called, I presented"), you:', pl: 'Jeśli na główne pytanie człowiek wylicza działania („spotykałem się, dzwoniłem, prezentowałem”), ty:' },
          opts: [
            { ru: 'Сразу прощаетесь.', en: 'Say goodbye immediately.', pl: 'Od razu się żegnasz.' },
            { ru: 'Даёте хотя бы второй шанс, переформулировав вопрос.', en: 'Give at least a second chance by rephrasing the question.', pl: 'Dajesz choćby drugą szansę, przeformułowując pytanie.' },
            { ru: 'Читаете подробную лекцию о том, что такое продукт.', en: 'Deliver a detailed lecture on what a product is.', pl: 'Wygłaszasz szczegółowy wykład o tym, czym jest produkt.' },
            { ru: 'Записываете его как виннера.', en: 'Record them as a winner.', pl: 'Zapisujesz go jako winnera.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Зачем нужен вопрос «Как вы его измеряли?»', en: 'What is the question "How did you measure it?" for?', pl: 'Po co jest pytanie „Jak go mierzyłeś?”' },
          opts: [
            { ru: 'Чтобы узнать зарплату.', en: 'To learn their salary.', pl: 'Żeby poznać pensję.' },
            { ru: 'Чтобы проверить, стала ли идея продукта его собственной: настоящие виннеры измеряют себя.', en: 'To check whether the idea of the product became their own: real winners measure themselves.', pl: 'Żeby sprawdzić, czy idea produktu stała się jego własna: prawdziwi winnerzy mierzą się.' },
            { ru: 'Чтобы усложнить интервью.', en: 'To make the interview harder.', pl: 'Żeby utrudnić wywiad.' },
            { ru: 'Это просто формальность.', en: "It's just a formality.", pl: 'To tylko formalność.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Кандидат отвечает: «Не помню, сколько произвёл». Как это трактовать?', en: 'A candidate answers: "I don\'t remember how much I produced." How to interpret it?', pl: 'Kandydat odpowiada: „Nie pamiętam, ile wytworzyłem”. Jak to interpretować?' },
          opts: [
            { ru: 'Это нормально, память у всех разная — двигаемся дальше.', en: "It's fine, everyone's memory differs — move on.", pl: 'To normalne, każdy ma inną pamięć — idziemy dalej.' },
            { ru: 'Либо врёт (произвёл мало), либо правда нечего помнить — в обоих случаях он нам неинтересен.', en: "Either they're lying (produced little) or there's truly nothing to remember — in both cases they're of no interest to us.", pl: 'Albo kłamie (wytworzył mało), albo naprawdę nie ma czego pamiętać — w obu przypadkach nas nie interesuje.' },
            { ru: 'Сразу берём — значит, честный человек.', en: 'Hire immediately — an honest person.', pl: 'Od razu bierzemy — to uczciwy człowiek.' },
            { ru: 'Задаём тот же вопрос ещё пять раз.', en: 'Ask the same question five more times.', pl: 'Zadajemy to samo pytanie jeszcze pięć razy.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Кто обязательно должен проводить это интервью?', en: 'Who must run this interview?', pl: 'Kto koniecznie musi prowadzić ten wywiad?' },
          opts: [
            { ru: 'Дипломированный психолог.', en: 'A certified psychologist.', pl: 'Dyplomowany psycholog.' },
            { ru: 'Директор по персоналу.', en: 'The HR director.', pl: 'Dyrektor HR.' },
            { ru: 'Виннер — только он способен узнать продукт в ответе кандидата.', en: "A winner — only they can recognize the product in a candidate's answer.", pl: 'Winner — tylko on potrafi rozpoznać produkt w odpowiedzi kandydata.' },
            { ru: 'Любой обученный сотрудник.', en: 'Any trained employee.', pl: 'Dowolny przeszkolony pracownik.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Если первое лицо компании — не виннер, что делать?', en: "If the top person in the company isn't a winner, what do you do?", pl: 'Jeśli najwyższy szef firmy nie jest winnerem, co robić?' },
          opts: [
            { ru: 'Отказаться от методики.', en: 'Abandon the method.', pl: 'Zrezygnować z metody.' },
            { ru: 'Поручить найм тому, кто виннер, и доверять его решениям (как доверяют айтишнику или маркетологу).', en: 'Entrust hiring to someone who is a winner and trust their decisions (as you trust an IT person or a marketer).', pl: 'Powierzyć rekrutację temu, kto jest winnerem, i ufać jego decyzjom (jak ufa się informatykowi czy marketingowcowi).' },
            { ru: 'Отправить первое лицо на обучение, чтобы оно стало виннером.', en: 'Send the top person to training to become a winner.', pl: 'Wysłać najwyższego szefa na szkolenie, by stał się winnerem.' },
            { ru: 'Поручить интервью роботу.', en: 'Have a robot run the interview.', pl: 'Powierzyć wywiad robotowi.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Кандидат: «Сколько я продал — коммерческая тайна». Правильная реакция:', en: 'Candidate: "How much I sold is a trade secret." The correct reaction:', pl: 'Kandydat: „Ile sprzedałem to tajemnica handlowa”. Poprawna reakcja:' },
          opts: [
            { ru: 'Согласиться и не спрашивать о результатах.', en: "Agree and don't ask about results.", pl: 'Zgodzić się i nie pytać o rezultaty.' },
            { ru: 'Объяснить, что чужая компания вам неинтересна; попросить хотя бы динамику (рост/спад); если и это «тайна» — вежливо попрощаться.', en: 'Explain that their former company doesn\'t interest you; ask for at least the trend (growth/decline); if even that is a "secret" — politely say goodbye.', pl: 'Wyjaśnić, że cudza firma cię nie interesuje; poprosić przynajmniej o dynamikę (wzrost/spadek); jeśli i to „tajemnica” — uprzejmie się pożegnać.' },
            { ru: 'Сразу отказать без объяснений.', en: 'Reject on the spot without explanation.', pl: 'Od razu odmówić bez wyjaśnień.' },
            { ru: 'Взять на работу без всякой проверки.', en: 'Hire them with no verification at all.', pl: 'Zatrudnić bez żadnej weryfikacji.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Зачем предупреждать кандидата, что интервью будет коротким? (главная пара причин)', en: 'Why warn a candidate that the interview will be short? (the main pair of reasons)', pl: 'Po co uprzedzać kandydata, że wywiad будет krótki? (główna para powodów)' },
          opts: [
            { ru: 'Чтобы сэкономить на кофе.', en: 'To save on coffee.', pl: 'Żeby zaoszczędzić na kawie.' },
            { ru: 'Пиар (не злить массу непринятых людей) и настрой кандидата на короткий разговор без «раскачки».', en: 'PR (don\'t anger the crowd of unhired people) and setting the candidate up for a short conversation with no "warm-up."', pl: 'PR (nie złościć tłumu niezatrudnionych ludzi) i nastawienie kandydata na krótką rozmowę bez „rozkręcania się”.' },
            { ru: 'Чтобы кандидат нервничал.', en: 'To make the candidate nervous.', pl: 'Żeby kandydat się denerwował.' },
            { ru: 'Этого требует система.', en: 'The system requires it.', pl: 'Wymaga tego system.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Пекарь печёт хлеб, булочки, торты и пирожные. Что из перечисленного — продукт всей должности, а что лишь один из результатов? (выберите верное)', en: 'A baker bakes bread, rolls, cakes, and pastries. Which of these is the product of the whole role, and which is just one of the results? (choose the correct answer)', pl: 'Piekarz piecze chleb, bułki, torty i ciastka. Co z wymienionych jest produktem całego stanowiska, a co tylko jednym z rezultatów? (wybierz poprawną odpowiedź)' },
          opts: [
            { ru: '«Хлеб» — это продукт должности.', en: '"Bread" is the product of the role.', pl: '„Chleb” jest produktem stanowiska.' },
            { ru: 'Продукт — вся свежая качественная выпечка ассортимента, готовая к продаже; «испечённый утром хлеб» — лишь один из результатов.', en: 'The product is all the fresh, quality baked goods of the assortment, ready for sale; "bread baked this morning" is just one of the results.', pl: 'Produkt to całe świeże, jakościowe pieczywo asortymentu, gotowe do sprzedaży; „upieczony rano chleb” to tylko jeden z rezultatów.' },
            { ru: 'У пекаря нет продукта.', en: 'A baker has no product.', pl: 'Piekarz nie ma produktu.' },
            { ru: 'Продукт — довольные клиенты пекарни.', en: "The product is the bakery's satisfied customers.", pl: 'Produkt to zadowoleni klienci piekarni.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Сколько вопросов в Тесте Резалт и сколько времени тратит наниматель на анализ ответа?', en: 'How many questions are in the Result Test, and how long does the hirer spend analyzing an answer?', pl: 'Ile pytań ma Test Rezultat i ile czasu poświęca rekrutujący na analizę odpowiedzi?' },
          opts: [
            { ru: '50 вопросов, около часа.', en: '50 questions, about an hour.', pl: '50 pytań, około godziny.' },
            { ru: '20 вопросов, около 1 минуты (иногда достаточно 10 секунд).', en: '20 questions, about 1 minute (sometimes 10 seconds is enough).', pl: '20 pytań, około 1 minuty (czasem wystarczy 10 sekund).' },
            { ru: '100 вопросов, полдня.', en: '100 questions, half a day.', pl: '100 pytań, pół dnia.' },
            { ru: '10 вопросов, 5 минут.', en: '10 questions, 5 minutes.', pl: '10 pytań, 5 minut.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Что означает «нелинейность» теста?', en: 'What does the test\'s "non-linearity" mean?', pl: 'Co oznacza „nieliniowość” testu?' },
          opts: [
            { ru: 'Вопросы идут в случайном порядке.', en: 'The questions come in random order.', pl: 'Pytania idą w losowej kolejności.' },
            { ru: 'Следующий вопрос зависит от предыдущего ответа (не измеряешь результаты — не спросят, сколько произвёл).', en: "The next question depends on the previous answer (don't measure results — you won't be asked how much you produced).", pl: 'Kolejne pytanie zależy od poprzedniej odpowiedzi (nie mierzysz rezultatów — nie zapytają, ile wytworzyłeś).' },
            { ru: 'Тест можно начинать с любого места.', en: 'You can start the test from any point.', pl: 'Test można zaczynać z dowolnego miejsca.' },
            { ru: 'Ответы не влияют на итоговую оценку.', en: "The answers don't affect the final assessment.", pl: 'Odpowiedzi nie wpływają na końcową ocenę.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Кандидат на все вопросы отвечает «деньги, деньги, деньги». Это…', en: 'A candidate answers "money, money, money" to everything. This is…', pl: 'Kandydat na wszystkie pytania odpowiada „pieniądze, pieniądze, pieniądze”. To…' },
          opts: [
            { ru: 'Идеальный кандидат.', en: 'The ideal candidate.', pl: 'Idealny kandydat.' },
            { ru: 'Самая надёжная мотивация.', en: 'The most reliable motivation.', pl: 'Najpewniejsza motywacja.' },
            { ru: 'Самая слабая мотивация — уйдёт, как только предложат больше (зона риска).', en: "The weakest motivation — they'll leave the moment they're offered more (a risk zone).", pl: 'Najsłabsza motywacja — odejdzie, gdy tylko zaproponują więcej (strefa ryzyka).' },
            { ru: 'Не имеет значения.', en: 'Of no significance.', pl: 'Nie ma znaczenia.' },
          ],
          correct: 2,
        },
        {
          q: { ru: '«Обмен с превышением» — это…', en: '"Exchange with surplus" is…', pl: '„Wymiana z nadwyżką” to…' },
          opts: [
            { ru: 'Воровство (ничего не отдавать).', en: 'Stealing (giving nothing back).', pl: 'Kradzież (nic nie oddawać).' },
            { ru: 'Отдавать ровно столько, сколько взял.', en: 'Giving back exactly as much as you took.', pl: 'Oddawać dokładnie tyle, ile się wzięło.' },
            { ru: 'Отдавать больше, чем от тебя ожидают (за 100 — на 110).', en: 'Giving more than is expected of you (for 100 you give 110).', pl: 'Oddawać więcej, niż się od ciebie oczekuje (za 100 dawać 110).' },
            { ru: 'Обещать килограмм, а класть 900 граммов.', en: 'Promising a kilogram but putting in 900 grams.', pl: 'Obiecać kilogram, a włożyć 900 gramów.' },
          ],
          correct: 2,
        },
        {
          q: { ru: 'Что делать, если результат теста «сверкает», как бриллиант?', en: 'What do you do if a test result "sparkles" like a diamond?', pl: 'Co robić, jeśli wynik testu „lśni” niczym brylant?' },
          opts: [
            { ru: 'Отложить на потом.', en: 'Put it off for later.', pl: 'Odłożyć na później.' },
            { ru: 'Не терять ни секунды и вести кандидата по всем этапам, пока не возьмёшь или не решишь, что он не нужен.', en: "Don't lose a second — take the candidate through all the stages until you hire them or decide you don't need them.", pl: 'Nie tracić ani sekundy i prowadzić kandydata przez wszystkie etapy, aż go zatrudnisz albo zdecydujesz, że nie jest potrzebny.' },
            { ru: 'Сначала спокойно допить кофе.', en: 'First calmly finish your coffee.', pl: 'Najpierw spokojnie dopić kawę.' },
            { ru: 'Отправить стандартный отказ.', en: 'Send a standard rejection.', pl: 'Wysłać standardową odmowę.' },
          ],
          correct: 1,
        },
        {
          q: { ru: 'Принцип «Поручай самому занятому» означает, что…', en: 'The principle "assign it to the busiest person" means that…', pl: 'Zasada „powierzaj najbardziej zajętemu” oznacza, że…' },
          opts: [
            { ru: 'Обязанности нужно распределять строго поровну.', en: 'Responsibilities should be distributed strictly evenly.', pl: 'Obowiązki należy rozdzielać ściśle po równo.' },
            { ru: 'У хорошего дуера круг обязанностей растёт, потому что важное поручают тому, кто уже «везёт».', en: "A good doer's scope of responsibilities grows because important work is given to whoever is already \"carrying the load.\"", pl: 'Dobremu doerowi rośnie zakres obowiązków, bo ważne powierza się temu, kto już „wiezie”.' },
            { ru: 'Занятых нужно, наоборот, разгружать.', en: 'Busy people should, on the contrary, be unburdened.', pl: 'Zajętych trzeba przeciwnie — odciążać.' },
            { ru: 'Больше всего задач дают новичкам.', en: 'Newcomers are given the most tasks.', pl: 'Najwięcej zadań daje się nowicjuszom.' },
          ],
          correct: 1,
        },
      ],
    },
  },
};
