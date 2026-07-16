'use strict';
// Контент программы «Личностные качества (Оценка: Шаги предоставления)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-delivery-steps'.

// Врезки-боксы 1-в-1 из программы productivity-winners.
// b — нейтральный серый (ПРИМЕР / НА ЗАМЕТКУ), k — фиолетовый (КЛЮЧЕВАЯ ИДЕЯ / ЗАПОМНИТЕ / ОПРЕДЕЛЕНИЕ),
// r — зелёный (ПРАВИЛО / ШАГ), t — синий (ПРИЁМ / ПРИМЕНЕНИЕ). Внутри — абзацы p().
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
  'module-delivery-steps': {
    sections: [
      // 1 — ВВЕДЕНИЕ + ГЛАВА 1
      {
        id: 'intro',
        title: {
          ru: 'Шаги предоставления оценки · Введение',
          en: 'The delivery steps · Introduction',
          pl: 'Kroki przekazywania oceny · Wprowadzenie',
        },
        desc: {
          ru: 'Почему беседа по тесту строится так, чтобы человек сначала увидел в вас друга.',
          en: 'Why the conversation about the test is built so that the person first sees a friend in you.',
          pl: 'Dlaczego rozmowa o teście budowana jest tak, aby człowiek najpierw zobaczył w tobie przyjaciela.',
        },
        html: {
          ru:
            '<p><strong>ОЦЕНКА ТЕСТОВ: ШАГИ ПРЕДОСТАВЛЕНИЯ</strong></p>' +
            '<p>Программа обучения · Найм по технологии HR-PRO.AI</p>' +
            '<p>Пошаговая беседа по тесту: вступить в контакт, уладить всё и долго говорить о плюсах — и лишь потом о минусах; наблюдать, принимать решения, действовать.</p>' +
            '<h2>Модуль 5. Оценка тестов: шаги предоставления</h2>' +
            '<p>В предыдущем модуле мы заложили основу: разобрали истину и ложь, наблюдение и конфронт, поняли, что страх недопустим и что у человека есть три линии общения, из которых главная — когда он смотрит внутрь себя. Теперь перейдём к самой процедуре: как по шагам вести беседу по тесту.</p>' +
            '<p>Вся последовательность построена так, чтобы решить одну проблему. Люди просто так не хотят говорить о том, что у них по-настоящему болит: их слишком часто задевали те, кто заговаривал об этом раньше — либо по некомпетентности, либо с плохими намерениями (а чаще и то, и другое). Если человеку несколько раз плюнули в душу, он не спешит открывать её ещё одному желающему. Поэтому вся структура беседы направлена на то, чтобы сначала стать для человека другом, вызвать доверие и убрать страх, — и только потом касаться минусов.</p>' +
            '<h2>Глава 1. Изучать тест — одно, предоставлять — другое</h2>' +
            '<p>Здесь важно не перепутать две разные последовательности.</p>' +
            '<p>Есть последовательность, в которой мы изучаем тест для себя: сначала основные синдромы, затем вторичный синдром, потом дополнительные синдромы, потом тон — и лишь в последнюю очередь каждая точка по отдельности. Пока у вас нет опыта, именно в таком порядке стоит изучить тест перед беседой. Со временем это перестаёт быть отдельной работой: берёшь тест — и уже его видишь; это просто вопрос знания основ и практики.</p>' +
            '<p>Но предоставляем оценку мы в совершенно другом порядке. Представьте, что мы сели напротив человека и начали по порядку изучения: «Основной синдром — синдром вора, вы легко присваиваете чужое. Вторичного нет, перехожу к дополнительным: повреждающая тирания, розовые очки, самообесценка, неэффективность, манипулятор». Чувствуете, как это располагает человека раскрыться? Никак. Поэтому последовательность изучения для беседы не годится.</p>' +
            '<p>Почему? Вспомните: человек боится говорить о своих проблемах с врагом, а не с другом. А кого он считает врагом, а кого другом? Человек с низкой правильностью оценки смотрит на людей в минусы — и его принимают за врага, а когда враг тычет нам в минус, мы не исправляемся, а становимся в стойку. Человек же с высокой правильностью оценки смотрит на плюсы, стремится к согласию — и его принимают за друга; и если такой человек укажет один минус, его исправляют.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Изучаем тест мы в одном порядке (синдромы, тон, потом точки), а предоставляем оценку — в совершенно другом. Ведь о том, что болит, человек станет говорить только с другом, а не с врагом. Поэтому беседа строится так, чтобы человек увидел в вас друга, — а значит, начинается она не с минусов.', true)),
          en:
            '<p><strong>TEST ASSESSMENT: THE DELIVERY STEPS</strong></p>' +
            '<p>Training program · Hiring with HR-PRO.AI technology</p>' +
            '<p>A step-by-step conversation about the test: establish contact, handle everything and talk at length about the pluses — and only then about the minuses; observe, make decisions, act.</p>' +
            '<h2>Module 5. Test assessment: the delivery steps</h2>' +
            '<p>In the previous module we laid the foundation: we examined truth and falsehood, observation and confront, understood that fear is inadmissible and that a person has three lines of communication, of which the main one is when he looks inside himself. Now let us move on to the procedure itself: how to conduct the conversation about the test step by step.</p>' +
            '<p>The whole sequence is built so as to solve one problem. People do not just want to talk about what truly hurts them: too often they have been wounded by those who broached the subject earlier — either out of incompetence or with bad intentions (and more often both). If a person has been spat in the soul a few times, he is in no hurry to open it to yet another eager party. That is why the entire structure of the conversation is aimed at first becoming the person\'s friend, inspiring trust, and removing fear — and only then touching on the minuses.</p>' +
            '<h2>Chapter 1. Studying the test is one thing, delivering it is another</h2>' +
            '<p>Here it is important not to confuse two different sequences.</p>' +
            '<p>There is the sequence in which we study the test for ourselves: first the main syndromes, then the secondary syndrome, then the additional syndromes, then the tone — and only last of all each point separately. As long as you have no experience, it is in precisely this order that the test should be studied before the conversation. Over time this ceases to be a separate task: you take a test — and you already see it; it is simply a matter of knowing the basics and of practice.</p>' +
            '<p>But we deliver the assessment in a completely different order. Imagine that we have sat down opposite the person and begun in the order of study: "The main syndrome is the thief syndrome, you easily appropriate what belongs to others. There is no secondary one, I move on to the additional ones: damaging tyranny, rose-colored glasses, self-invalidation, ineffectiveness, manipulator." Do you feel how that disposes the person to open up? Not at all. That is why the study sequence is no good for the conversation.</p>' +
            '<p>Why? Recall: a person is afraid to talk about his problems with an enemy, not with a friend. And whom does he consider an enemy, and whom a friend? A person with low correctness of evaluation looks at people in terms of minuses — and is taken for an enemy, and when an enemy pokes us in a minus, we do not correct ourselves but take a defensive stance. A person with high correctness of evaluation, however, looks at the pluses, strives for agreement — and is taken for a friend; and if such a person points out a single minus, it gets corrected.</p>' +
            k('KEY IDEA',
              bp('We study the test in one order (syndromes, tone, then points), while we deliver the assessment in a completely different one. For a person will talk about what hurts only with a friend, not with an enemy. That is why the conversation is built so that the person sees a friend in you — and therefore it does not begin with the minuses.', true)),
          pl:
            '<p><strong>OCENA TESTÓW: KROKI PRZEKAZYWANIA</strong></p>' +
            '<p>Program szkoleniowy · Rekrutacja w technologii HR-PRO.AI</p>' +
            '<p>Rozmowa o teście krok po kroku: nawiązać kontakt, wszystko rozładować i długo mówić o plusach — a dopiero potem o minusach; obserwować, podejmować decyzje, działać.</p>' +
            '<h2>Moduł 5. Ocena testów: kroki przekazywania</h2>' +
            '<p>W poprzednim module założyliśmy podstawę: omówiliśmy prawdę i fałsz, obserwację i konfront, zrozumieliśmy, że strach jest niedopuszczalny i że człowiek ma trzy linie komunikacji, z których główna to ta, gdy patrzy w głąb siebie. Teraz przejdźmy do samej procedury: jak krok po kroku prowadzić rozmowę o teście.</p>' +
            '<p>Cała sekwencja zbudowana jest tak, aby rozwiązać jeden problem. Ludzie tak po prostu nie chcą mówić o tym, co ich naprawdę boli: zbyt często ranili ich ci, którzy zaczynali o tym mówić wcześniej — albo przez niekompetencję, albo w złych zamiarach (a częściej i jedno, i drugie). Jeśli człowiekowi kilka razy napluto w duszę, nie spieszy się z otwieraniem jej kolejnemu chętnemu. Dlatego cała struktura rozmowy nakierowana jest na to, aby najpierw stać się dla człowieka przyjacielem, wzbudzić zaufanie i usunąć strach — i dopiero potem dotykać minusów.</p>' +
            '<h2>Rozdział 1. Studiować test to jedno, przekazywać to co innego</h2>' +
            '<p>Tu ważne jest, żeby nie pomylić dwóch różnych sekwencji.</p>' +
            '<p>Jest sekwencja, w której studiujemy test dla siebie: najpierw główne syndromy, następnie syndrom wtórny, potem syndromy dodatkowe, potem ton — i dopiero na samym końcu każdy punkt z osobna. Póki nie macie doświadczenia, właśnie w takiej kolejności warto przestudiować test przed rozmową. Z czasem przestaje to być osobną pracą: bierzesz test — i już go widzisz; to po prostu kwestia znajomości podstaw i praktyki.</p>' +
            '<p>Ale przekazujemy ocenę w zupełnie innej kolejności. Wyobraźcie sobie, że usiedliśmy naprzeciw człowieka i zaczęliśmy według kolejności studiowania: „Główny syndrom — syndrom złodzieja, łatwo przywłaszczasz sobie cudze. Wtórnego nie ma, przechodzę do dodatkowych: uszkadzająca tyrania, różowe okulary, samoobniżanie wartości, nieefektywność, manipulator". Czujecie, jak to skłania człowieka do otwarcia się? Nijak. Dlatego sekwencja studiowania do rozmowy się nie nadaje.</p>' +
            '<p>Dlaczego? Przypomnijcie sobie: człowiek boi się mówić o swoich problemach z wrogiem, a nie z przyjacielem. A kogo uważa za wroga, a kogo za przyjaciela? Człowiek z niską poprawnością oceny patrzy na ludzi w minusy — i biorą go za wroga, a gdy wróg wytyka nam minus, my nie poprawiamy się, lecz stajemy w postawie obronnej. Człowiek zaś z wysoką poprawnością oceny patrzy na plusy, dąży do zgody — i biorą go za przyjaciela; a jeśli taki człowiek wskaże jeden minus, to go poprawiają.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Test studiujemy w jednej kolejności (syndromy, ton, potem punkty), a przekazujemy ocenę — w zupełnie innej. Przecież o tym, co boli, człowiek będzie mówił tylko z przyjacielem, a nie z wrogiem. Dlatego rozmowa budowana jest tak, aby człowiek zobaczył w tobie przyjaciela — a więc zaczyna się nie od minusów.', true)),
        },
      },

      // 2 — ШАГ 1: ВСТУПИТЬ В КОНТАКТ
      {
        id: 'step1-contact',
        title: {
          ru: 'Шаг 1. Вступить в контакт',
          en: 'Step 1. Establish contact',
          pl: 'Krok 1. Nawiązać kontakt',
        },
        desc: {
          ru: 'Как за пару фраз начать разговор, напомнить цель тестирования и сразу убрать страх.',
          en: 'How to start the conversation in a couple of phrases, remind him of the goal of the testing, and remove fear at once.',
          pl: 'Jak w parę zdań zacząć rozmowę, przypomnieć cel testowania i od razu usunąć strach.',
        },
        html: {
          ru:
            '<h2>Глава 2. Шаг 1 — вступить в контакт</h2>' +
            '<p>Первый шаг делается буквально за пару фраз: надо просто начать общение, ведь предоставление теста — это разговор. «Привет, как дела? Помнишь, мы недавно тестировали сотрудников. Хочу с тобой пару слов сказать, если у тебя есть время». Продукт этого шага очень простой: человек с вами общается, и ничего ему не мешает — он никуда не торопится и не отвлекается.</p>' +
            '<p>Здесь же полезно сразу напомнить, зачем вы вообще проводите тестирование, — так, как вы объявили это всем на собрании.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · С чего начать разговор',
              bp('Опереться можно примерно на такую мысль: «Ты слышал, я говорил, что тест предоставляю хорошим сотрудникам — тем, кто даёт результат, кто, образно говоря, „дома строит“. Ты ведь не кандидат — я уже вижу, что ты строишь. Поэтому мой тест — это благодарность тебе и попытка облегчить тебе жизнь, чтобы ты работал ещё эффективнее и больше зарабатывал, а мы вместе процветали. Увольнять я буду только за плохие результаты, а брать на работу — только за хорошие; и сам факт, что я предоставляю тебе тест, значит, что результат у тебя есть. Если не хочешь — мы остановимся прямо сейчас, без проблем».', true)) +
            '<p>Обратите внимание: этим вы одновременно убираете страх (тестирование добровольно, это награда, и никаких решений об увольнении по тесту) и показываете, что цель — помочь. Если человек говорит «давай остановимся» — нет проблем. А если говорит «нет, я хочу» — значит, страхом уже и не пахнет, и человек начинает открываться.</p>',
          en:
            '<h2>Chapter 2. Step 1 — establish contact</h2>' +
            '<p>The first step is done in literally a couple of phrases: you simply have to start a conversation, since delivering the test is a conversation. "Hi, how are you? Remember, we recently tested the employees. I\'d like to have a couple of words with you, if you have time." The product of this step is very simple: the person is talking with you, and nothing is getting in his way — he is in no hurry and is not distracted.</p>' +
            '<p>Here it is also useful to remind him at once why you are conducting the testing at all — the way you announced it to everyone at the meeting.</p>' +
            t('APPLICATION IN HIRING · How to begin the conversation',
              bp('You can lean on roughly this idea: "You heard me say that I deliver the test to good employees — to those who produce a result, who, figuratively speaking, \'build houses.\' You are not a candidate, after all — I already see that you build. So my test is a way of thanking you and an attempt to make your life easier, so that you work even more effectively and earn more, and we prosper together. I will fire only for bad results, and hire only for good ones; and the very fact that I am delivering the test to you means that you do have a result. If you don\'t want to — we\'ll stop right now, no problem."', true)) +
            '<p>Note: with this you simultaneously remove fear (the testing is voluntary, it is a reward, and there are no firing decisions based on the test) and show that the goal is to help. If the person says "let\'s stop" — no problem. And if he says "no, I want to" — it means there is no longer even a whiff of fear, and the person begins to open up.</p>',
          pl:
            '<h2>Rozdział 2. Krok 1 — nawiązać kontakt</h2>' +
            '<p>Pierwszy krok robi się dosłownie w parę zdań: trzeba po prostu zacząć rozmowę, przecież przekazywanie testu to rozmowa. „Cześć, jak leci? Pamiętasz, niedawno testowaliśmy pracowników. Chcę z tobą zamienić parę słów, jeśli masz czas". Produkt tego kroku jest bardzo prosty: człowiek z tobą rozmawia i nic mu nie przeszkadza — nigdzie się nie spieszy i nie rozprasza się.</p>' +
            '<p>Tu też warto od razu przypomnieć, po co w ogóle przeprowadzasz testowanie — tak, jak ogłosiłeś to wszystkim na zebraniu.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Od czego zacząć rozmowę',
              bp('Oprzeć się można mniej więcej na takiej myśli: „Słyszałeś, mówiłem, że test przekazuję dobrym pracownikom — tym, którzy dają wynik, którzy, mówiąc obrazowo, «budują domy». Ty przecież nie jesteś kandydatem — już widzę, że budujesz. Dlatego mój test to podziękowanie tobie i próba ułatwienia ci życia, żebyś pracował jeszcze efektywniej i więcej zarabiał, a my razem prosperowali. Zwalniać będę tylko za złe wyniki, a przyjmować do pracy — tylko za dobre; i sam fakt, że przekazuję ci test, znaczy, że wynik masz. Jeśli nie chcesz — zatrzymamy się właśnie teraz, bez problemu".', true)) +
            '<p>Zwróćcie uwagę: tym jednocześnie usuwacie strach (testowanie jest dobrowolne, to nagroda, i żadnych decyzji o zwolnieniu na podstawie testu) i pokazujecie, że cel to pomóc. Jeśli człowiek mówi „dobra, zatrzymajmy się" — nie ma problemu. A jeśli mówi „nie, chcę" — to znaczy, że strachem już nawet nie pachnie, i człowiek zaczyna się otwierać.</p>',
        },
      },

      // 3 — ШАГ 2a: УЛАДИТЬ ВСЁ
      {
        id: 'step2a-handle',
        title: {
          ru: 'Шаг 2a. Уладить всё и объяснить, что показывает тест',
          en: 'Step 2a. Handle everything and explain what the test shows',
          pl: 'Krok 2a. Wszystko rozładować i wyjaśnić, co pokazuje test',
        },
        desc: {
          ru: 'Улаживаем страхи и недоверие и на пальцах объясняем, что именно показывает тест.',
          en: 'We handle fears and distrust and explain in plain terms exactly what the test shows.',
          pl: 'Rozładowujemy lęki i nieufność i na palcach wyjaśniamy, co dokładnie pokazuje test.',
        },
        html: {
          ru:
            '<h2>Глава 3. Шаг 2a — уладить всё и объяснить, что показывает тест</h2>' +
            '<p>Второй шаг — самый важный во всей оценке, и мы разделим его на две части: 2a и 2b.</p>' +
            '<p>Часть 2a — уладить всё, что всплывает. Что бы человеку ни мешало — страх, что его уволят из-за теста, недовольство тем, что его вообще тестируют, обида за задержанную три дня назад премию (ведь мы ассоциируемся у него со всем руководством и всей компанией), — всё это надо уладить. Помните: пока человек чего-то боится или чем-то недоволен, ничего не получится. И будьте готовы к тому, что уладить получится не всегда: «Я не могу сейчас, у меня жена в роддоме». — «Конечно, езжай, о чём речь, поговорим потом». То есть иногда оценку в этот момент просто прекращают.</p>' +
            '<p>Отдельно — то, что улаживать нужно почти всегда, даже если это не выглядит проблемой: недоверие человека к тесту. Мало кто понимает, что такое тест (даже некоторые наши клиенты по ошибке пытаются нанимать «по хорошему тесту»). А если человек раньше уже сталкивался с тестированием, то, скорее всего, оно было неприятным — где-то по тестам увольняли или не брали на работу, где-то задели. Поэтому на этом шаге мы обязательно объясняем, что показывает тест. За многие годы я предоставил тест много сотен раз и ни разу не пропускал этот шаг — очень не советую пропускать его и вам.</p>' +
            '<p>Объяснять я предлагаю так — прямо рисуя на бумаге. Вот человек, и вокруг него течёт жизнь. Время от времени жизнь подкидывает разные проблемы. Человек видит проблему (если видит) и берёт какой-то инструмент, чтобы её «разрезать». Если инструмент правильный — проблема уходит. А если инструмент неправильный — проблема остаётся, а иногда даже увеличивается.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Тест показывает ваши инструменты — то есть решения — и то, насколько они рациональны или нерациональны в различных областях жизни. Очень важно: на тесте я вижу не вас, а только ваш набор инструментов.', true)) +
            '<p>Здесь же уместна метафора, к которой мы будем возвращаться. Представьте, что мы строим деревянный дом, и к нам приходят наниматься два плотника с чемоданами инструментов — это их тесты. Открываем: у одного молоток, топор и отвёртка, у другого полный набор. Кого возьмём? Человек обычно отвечает: «того, у кого полный набор». И тут важный приём: даже если он ответил, на мой взгляд, неверно, я не говорю «нет, ты не прав». Я говорю: «Да, инструменты, конечно, лучше, чем их отсутствие. Но не встречали ли вы человека с полным набором инструментов, который гвоздя забить не может, — и другого, который строит дома молотком, топором и отвёрткой?» Кого мы возьмём на самом деле? Того, кто уже построил дома. Именно поэтому в найме тест имеет лишь вспомогательное, второстепенное (хоть и важное) значение, а первостепенное — интервью на продуктивность, где мы проверяем реальные результаты человека в прошлом: какие «дома» он этими инструментами через все проблемы жизни построил.</p>' +
            '<p>Если человек боится из-за прошлого опыта, помогает такой приём. Реактивный ум всё «объединяет» (по принципу «А равно А равно А»), и в нём прошлая компания слилась с нашей — поэтому человек и боится. А наша задача — разъединить: «Не знаю, кто занимался тестированием на вашей прошлой работе восемь лет назад, — не наш вопрос. Важно, что сейчас вы в этой компании. За последние шесть лет вас здесь кто-то обижал из-за тестов? Нет. Наш тест сильный, и цель у него сейчас одна — усилить вас».</p>' +
            r('ПРАВИЛО',
              bp('И ещё одно правило для всего этого шага: пока вы что-либо объясняете, держитесь так, будто у вас самого высокая правильность оценки, — то есть во всём, что говорит человек, старайтесь найти согласие, а не поправлять. Он говорит «при неправильном инструменте проблема остаётся» — вы отвечаете «точно, а иногда и увеличивается». Так он видит в вас друга.', true)),
          en:
            '<h2>Chapter 3. Step 2a — handle everything and explain what the test shows</h2>' +
            '<p>The second step is the most important in the whole assessment, and we will divide it into two parts: 2a and 2b.</p>' +
            '<p>Part 2a is to handle everything that comes up. Whatever might be getting in the person\'s way — fear that he will be fired because of the test, dissatisfaction that he is being tested at all, resentment over a bonus that was withheld three days ago (for we are associated in his mind with the entire management and the entire company) — all of this must be handled. Remember: as long as a person is afraid of something or dissatisfied with something, nothing will work. And be prepared for the fact that handling will not always succeed: "I can\'t right now, my wife is at the maternity hospital." — "Of course, go, no question, we\'ll talk later." That is, sometimes the assessment is simply stopped at that moment.</p>' +
            '<p>Separately — the thing that must be handled almost always, even if it does not look like a problem: the person\'s distrust of the test. Few understand what a test is (even some of our clients mistakenly try to hire "based on a good test"). And if a person has already encountered testing before, then most likely it was unpleasant — somewhere people were fired or not hired based on tests, somewhere they were hurt. That is why at this step we must explain what the test shows. Over many years I have delivered the test many hundreds of times and never once skipped this step — I strongly advise you, too, not to skip it.</p>' +
            '<p>I suggest explaining it like this — drawing directly on paper. Here is the person, and around him life flows. From time to time life throws up various problems. The person sees the problem (if he sees it) and takes some tool in order to "cut through" it. If the tool is the right one — the problem goes away. And if the tool is the wrong one — the problem remains, and sometimes even grows.</p>' +
            k('DEFINITION',
              bp('The test shows your tools — that is, your solutions — and how rational or irrational they are in various areas of life. Very important: on the test I see not you, but only your set of tools.', true)) +
            '<p>Here, too, a metaphor is apt, one we will keep returning to. Imagine that we are building a wooden house, and two carpenters come to us to seek work, with suitcases of tools — these are their tests. We open them: one has a hammer, an axe, and a screwdriver, the other a full set. Whom will we take? A person usually answers: "the one with the full set." And here is an important technique: even if he has answered, in my view, incorrectly, I do not say "no, you\'re wrong." I say: "Yes, tools are of course better than their absence. But have you not met a person with a full set of tools who cannot even drive in a nail — and another who builds houses with a hammer, an axe, and a screwdriver?" Whom will we actually take? The one who has already built houses. That is precisely why, in hiring, the test has only an auxiliary, secondary (though important) significance, while the primary one is the productivity interview, where we check the person\'s real results in the past: what "houses" he has built with these tools, through all the problems of life.</p>' +
            '<p>If a person is afraid because of past experience, the following technique helps. The reactive mind "lumps everything together" (on the principle "A equals A equals A"), and in it the previous company has merged with ours — that is why the person is afraid. And our task is to separate them: "I don\'t know who handled the testing at your previous job eight years ago — that\'s not our concern. What matters is that now you are in this company. In the last six years, has anyone here hurt you because of tests? No. Our test is strong, and its goal now is one thing — to strengthen you."</p>' +
            r('RULE',
              bp('And one more rule for this whole step: as long as you are explaining anything, hold yourself as if you yourself had high correctness of evaluation — that is, in everything the person says, try to find agreement rather than correct him. He says "with the wrong tool the problem remains" — you answer "exactly, and sometimes it even grows." That is how he sees a friend in you.', true)),
          pl:
            '<h2>Rozdział 3. Krok 2a — wszystko rozładować i wyjaśnić, co pokazuje test</h2>' +
            '<p>Drugi krok jest najważniejszy w całej ocenie i podzielimy go na dwie części: 2a i 2b.</p>' +
            '<p>Część 2a — rozładować wszystko, co wypływa. Cokolwiek by człowiekowi przeszkadzało — strach, że go zwolnią z powodu testu, niezadowolenie z tego, że go w ogóle testują, uraza za wstrzymaną trzy dni temu premię (przecież kojarzymy mu się z całym kierownictwem i całą firmą) — wszystko to trzeba rozładować. Pamiętajcie: dopóki człowiek czegoś się boi albo z czegoś jest niezadowolony, nic się nie uda. I bądźcie gotowi na to, że rozładować uda się nie zawsze: „Nie mogę teraz, mam żonę w szpitalu położniczym". — „Oczywiście, jedź, o czym mowa, porozmawiamy potem". Czyli czasem ocenę w tym momencie po prostu się przerywa.</p>' +
            '<p>Osobno — to, co rozładować trzeba prawie zawsze, nawet jeśli nie wygląda to na problem: nieufność człowieka do testu. Mało kto rozumie, czym jest test (nawet niektórzy nasi klienci przez pomyłkę próbują zatrudniać „na podstawie dobrego testu"). A jeśli człowiek wcześniej już zetknął się z testowaniem, to najprawdopodobniej było ono nieprzyjemne — gdzieś na podstawie testów zwalniano albo nie przyjmowano do pracy, gdzieś go dotknięto. Dlatego na tym kroku obowiązkowo wyjaśniamy, co pokazuje test. Przez wiele lat przekazałem test wiele setek razy i ani razu nie pominąłem tego kroku — bardzo odradzam pomijanie go i wam.</p>' +
            '<p>Wyjaśniać proponuję tak — wprost rysując na papierze. Oto człowiek, i wokół niego płynie życie. Od czasu do czasu życie podrzuca różne problemy. Człowiek widzi problem (jeśli widzi) i bierze jakieś narzędzie, żeby go „przeciąć". Jeśli narzędzie jest właściwe — problem znika. A jeśli narzędzie jest niewłaściwe — problem zostaje, a czasem nawet się powiększa.</p>' +
            k('DEFINICJA',
              bp('Test pokazuje wasze narzędzia — czyli rozwiązania — oraz to, na ile są one racjonalne lub nieracjonalne w różnych obszarach życia. Bardzo ważne: na teście widzę nie was, lecz tylko wasz zestaw narzędzi.', true)) +
            '<p>Tu też na miejscu jest metafora, do której będziemy wracać. Wyobraźcie sobie, że budujemy drewniany dom, i przychodzi do nas najmować się dwóch cieśli z walizkami narzędzi — to ich testy. Otwieramy: jeden ma młotek, siekierę i śrubokręt, drugi pełen zestaw. Kogo weźmiemy? Człowiek zwykle odpowiada: „tego, kto ma pełen zestaw". I tu ważny chwyt: nawet jeśli odpowiedział, moim zdaniem, błędnie, nie mówię „nie, nie masz racji". Mówię: „Tak, narzędzia oczywiście są lepsze niż ich brak. Ale czy nie spotykaliście człowieka z pełnym zestawem narzędzi, który gwoździa wbić nie potrafi — i innego, który buduje domy młotkiem, siekierą i śrubokrętem?" Kogo weźmiemy naprawdę? Tego, kto już zbudował domy. Właśnie dlatego w rekrutacji test ma jedynie pomocnicze, drugorzędne (choć ważne) znaczenie, a pierwszorzędne — rozmowa o produktywności, gdzie sprawdzamy realne wyniki człowieka w przeszłości: jakie „domy" tymi narzędziami, przez wszystkie problemy życia, zbudował.</p>' +
            '<p>Jeśli człowiek boi się z powodu przeszłego doświadczenia, pomaga taki chwyt. Umysł reaktywny wszystko „łączy" (według zasady „A równa się A równa się A"), i w nim poprzednia firma zlała się z naszą — dlatego człowiek się boi. A naszym zadaniem jest rozdzielić: „Nie wiem, kto zajmował się testowaniem w twojej poprzedniej pracy osiem lat temu — to nie nasza sprawa. Ważne, że teraz jesteś w tej firmie. Przez ostatnie sześć lat ktoś cię tu skrzywdził z powodu testów? Nie. Nasz test jest silny, i cel ma teraz jeden — wzmocnić cię".</p>' +
            r('ZASADA',
              bp('I jeszcze jedna zasada dla całego tego kroku: dopóki cokolwiek wyjaśniasz, trzymaj się tak, jakbyś sam miał wysoką poprawność oceny — czyli we wszystkim, co mówi człowiek, staraj się znaleźć zgodę, a nie poprawiać. On mówi „przy niewłaściwym narzędziu problem zostaje" — ty odpowiadasz „dokładnie, a czasem i się powiększa". Tak widzi w tobie przyjaciela.', true)),
        },
      },

      // 4 — ШАГ 2b: ДОЛГО О ПЛЮСАХ
      {
        id: 'step2b-strengths',
        title: {
          ru: 'Шаг 2b. Долго говорить о плюсах',
          en: 'Step 2b. Talk at length about the pluses',
          pl: 'Krok 2b. Długo mówić o plusach',
        },
        desc: {
          ru: 'Компетентный разговор о плюсах, из-за которого человек видит в вас друга и хочет обсудить минусы.',
          en: 'A competent conversation about the pluses, because of which the person sees a friend in you and wants to discuss the minuses.',
          pl: 'Kompetentna rozmowa o plusach, dzięki której człowiek widzi w tobie przyjaciela i chce omówić minusy.',
        },
        html: {
          ru:
            '<h2>Глава 4. Шаг 2b — долго говорить о плюсах</h2>' +
            '<p>Часть 2b — более глубокое улаживание: здесь мы улаживаем недоверие человека к тесту и к вам, чтобы он понял, что вы его друг, что вы очень компетентны и видите на тесте то, чего другие не видят даже близко. А делаем мы это, долго и подробно говоря о его плюсах.</p>' +
            '<p>Подчёркиваю — долго. Многие думают, что главное в оценке — найти минус и о нём сказать. На самом деле это как раз неважно и второстепенно: если вы найдёте минус и назовёте его, толку не будет — вы просто встанете в ряд тех, кто уже тыкал человека в этот минус, и он закроется. Поэтому сначала — долго о плюсах. Но не пустая похвала «какой ты хороший» (это человек слышал сто раз, и это враньё), а разговор о плюсах компетентный, где вы называете именно его плюсы, которые видите на тесте. Тогда человек, во-первых, увидит в вас друга, а во-вторых, увидит, что вы его понимаете так, как никто раньше.</p>' +
            '<p>О плюсах по высокой точке говорить просто: берёте высокую точку, смотрите её описание и описываете сильные стороны. А что делать, если высоких точек нет? Вот здесь и начинается истинное мастерство — говорить о низкой точке с точки зрения плюсов.</p>' +
            b('ПРИМЕР · Как говорить о низкой точке как о плюсе',
              bp('Низкая точка — это нерациональность, идущая от реактивного ума. Но большинство людей не знают, что у них есть реактивный ум. Когда он берёт над человеком верх и толкает его на странные действия, человеку — чтобы оставаться правым — приходится как-то объяснять эти действия самому себе. И вот это самооправдание и есть «плюс» такого поведения, о котором мы ему и скажем.') +
              bp('Возьмём низкую правильность оценки. Такой человек везде видит минусы — и сам себе это объясняет так: «я всё стараюсь улучшать, я не развесил уши и не верю всему подряд; если что-то не так, я это вижу». Значит, о его плюсах я скажу ровно это: «Ты всё стремишься улучшать, ты иголку в стоге сена найдёшь; тебе можно доверить — ты не пропустишь то, что нельзя пропускать». Я попадаю один в один в то, что он сам себе про это говорит, — и в этот момент он видит и друга, и то, что я понимаю его как никто. По сути, даже если у человека вообще «торчит» всего одна точка, какая угодно, — это уже плюс, и о нём можно говорить.', true)) +
            '<p>Именно эти шаги — 2a и 2b — самые важные в оценке. Дело в том, что друзьям мы прощаем ошибки, а от врагов не принимаем помощь. Поэтому, даже если всё остальное вы сделаете неправильно, но шаг 2 сделаете хорошо, человек простит вам всё. А если шаг 2 вы сделаете плохо, то, как бы блестяще вы ни провели последующие шаги, у вас будут проблемы.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Продукт шага 2: человек вам доверяет, вы для него реальны, он с вами согласен и считает вас другом — и он сам интересуется своими минусами и нерациональностями и хочет их с вами обсудить (иногда прямо просит: «ну хорошо, а какие у меня минусы, давайте посмотрим»). Пока этого продукта нет, вы продолжаете делать шаг 2 и дальше не идёте. Идти к минусам, не сделав этого, — всё равно что начинать операцию, не дождавшись наркоза.', true)) +
            '<p>Кстати, когда человек уже сам просит перейти к минусам, можно даже ответить: «Есть минусы, скажу, но у тебя ещё много плюсов — дай мне пару слов и о них». Потому что в жизни нас, как правило, недостаточно хвалят.</p>',
          en:
            '<h2>Chapter 4. Step 2b — talk at length about the pluses</h2>' +
            '<p>Part 2b is a deeper handling: here we handle the person\'s distrust of the test and of you, so that he understands that you are his friend, that you are very competent and see on the test what others do not even come close to seeing. And we do this by talking at length and in detail about his pluses.</p>' +
            '<p>I emphasize — at length. Many think that the main thing in an assessment is to find a minus and speak of it. In fact this is precisely what is unimportant and secondary: if you find a minus and name it, there will be no use in it — you will simply take your place in the row of those who have already poked the person in that minus, and he will close up. That is why first — at length about the pluses. But not empty praise, "what a good person you are" (the person has heard that a hundred times, and it is a lie), but a competent conversation about the pluses, in which you name precisely his pluses, the ones you see on the test. Then the person, first, will see a friend in you, and second, will see that you understand him as no one has before.</p>' +
            '<p>Talking about the pluses of a high point is simple: you take the high point, look at its description, and describe the strengths. But what is to be done if there are no high points? This is where true mastery begins — to talk about a low point from the standpoint of the pluses.</p>' +
            b('EXAMPLE · How to talk about a low point as a plus',
              bp('A low point is an irrationality coming from the reactive mind. But most people do not know that they have a reactive mind. When it gets the upper hand over a person and pushes him into strange actions, the person — in order to remain right — has to explain these actions to himself somehow. And it is this self-justification that is the "plus" of such behavior, and it is this that we will tell him about.') +
              bp('Take low correctness of evaluation. Such a person sees minuses everywhere — and explains it to himself like this: "I try to improve everything, I haven\'t let my guard down and don\'t believe everything at face value; if something is off, I see it." So about his pluses I will say exactly that: "You strive to improve everything, you would find a needle in a haystack; you can be trusted — you won\'t miss what must not be missed." I hit exactly, one-to-one, what he himself says to himself about it — and at that moment he sees both a friend and the fact that I understand him as no one does. In essence, even if a person has only one point "sticking out" at all, whichever one it may be — that is already a plus, and it can be talked about.', true)) +
            '<p>It is precisely these steps — 2a and 2b — that are the most important in the assessment. The thing is, we forgive friends their mistakes, and from enemies we do not accept help. That is why, even if you do everything else wrong, but do step 2 well, the person will forgive you everything. And if you do step 2 badly, then no matter how brilliantly you carry out the subsequent steps, you will have problems.</p>' +
            k('KEY IDEA',
              bp('The product of step 2: the person trusts you, you are real to him, he agrees with you and considers you a friend — and he himself takes an interest in his minuses and irrationalities and wants to discuss them with you (sometimes he asks outright: "all right, so what are my minuses, let\'s take a look"). As long as this product is not there, you keep doing step 2 and do not go further. To go to the minuses without having done this is like starting an operation without waiting for the anesthesia to take effect.', true)) +
            '<p>By the way, when the person is already asking to move on to the minuses himself, you can even answer: "There are minuses, I\'ll tell you, but you still have a lot of pluses — let me say a couple of words about those too." Because in life, as a rule, we are not praised enough.</p>',
          pl:
            '<h2>Rozdział 4. Krok 2b — długo mówić o plusach</h2>' +
            '<p>Część 2b — głębsze rozładowanie: tu rozładowujemy nieufność człowieka do testu i do ciebie, żeby zrozumiał, że jesteś jego przyjacielem, że jesteś bardzo kompetentny i widzisz na teście to, czego inni nie widzą nawet w przybliżeniu. A robimy to, długo i szczegółowo mówiąc o jego plusach.</p>' +
            '<p>Podkreślam — długo. Wielu myśli, że najważniejsze w ocenie to znaleźć minus i o nim powiedzieć. W istocie to akurat nieważne i drugorzędne: jeśli znajdziecie minus i go nazwiecie, nie będzie z tego pożytku — po prostu staniecie w rzędzie tych, którzy już wytykali człowiekowi ten minus, i on się zamknie. Dlatego najpierw — długo o plusach. Ale nie pusta pochwała „jaki ty dobry" (to człowiek słyszał sto razy, i to kłamstwo), lecz rozmowa o plusach kompetentna, gdzie nazywacie właśnie jego plusy, które widzicie na teście. Wtedy człowiek, po pierwsze, zobaczy w was przyjaciela, a po drugie, zobaczy, że rozumiecie go tak, jak nikt wcześniej.</p>' +
            '<p>O plusach przy wysokim punkcie mówić jest prosto: bierzecie wysoki punkt, patrzycie na jego opis i opisujecie mocne strony. A co robić, jeśli wysokich punktów nie ma? Otóż tu zaczyna się prawdziwe mistrzostwo — mówić o niskim punkcie z punktu widzenia plusów.</p>' +
            b('PRZYKŁAD · Jak mówić o niskim punkcie jako o plusie',
              bp('Niski punkt to nieracjonalność, idąca od umysłu reaktywnego. Ale większość ludzi nie wie, że mają umysł reaktywny. Gdy bierze on nad człowiekiem górę i popycha go do dziwnych działań, człowiek — żeby pozostać w prawie — musi jakoś tłumaczyć te działania samemu sobie. I właśnie to samousprawiedliwienie jest „plusem" takiego zachowania, o którym mu powiemy.') +
              bp('Weźmy niską poprawność oceny. Taki człowiek wszędzie widzi minusy — i sam sobie to tłumaczy tak: „ja wszystko staram się ulepszać, nie rozwiesiłem uszu i nie wierzę we wszystko po kolei; jeśli coś jest nie tak, to ja to widzę". A więc o jego plusach powiem dokładnie to: „Ty wszystko dążysz ulepszać, ty igłę w stogu siana znajdziesz; tobie można zaufać — nie przeoczysz tego, czego przeoczyć nie wolno". Trafiam jeden w jeden w to, co on sam sobie o tym mówi — i w tym momencie widzi i przyjaciela, i to, że rozumiem go jak nikt. W istocie, nawet jeśli u człowieka w ogóle „wystaje" tylko jeden punkt, jakikolwiek — to już plus, i o nim można mówić.', true)) +
            '<p>Właśnie te kroki — 2a i 2b — są najważniejsze w ocenie. Rzecz w tym, że przyjaciołom wybaczamy błędy, a od wrogów nie przyjmujemy pomocy. Dlatego nawet jeśli wszystko pozostałe zrobicie źle, ale krok 2 zrobicie dobrze, człowiek wybaczy wam wszystko. A jeśli krok 2 zrobicie źle, to choćbyście kolejne kroki przeprowadzili genialnie, będziecie mieć problemy.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Produkt kroku 2: człowiek wam ufa, jesteście dla niego realni, zgadza się z wami i uważa was za przyjaciela — i sam interesuje się swoimi minusami i nieracjonalnościami, i chce je z wami omówić (czasem wprost prosi: „no dobrze, a jakie mam minusy, popatrzmy"). Dopóki tego produktu nie ma, kontynuujecie krok 2 i dalej nie idziecie. Iść do minusów, nie zrobiwszy tego, to jak zaczynać operację, nie doczekawszy się narkozy.', true)) +
            '<p>Swoją drogą, gdy człowiek już sam prosi, żeby przejść do minusów, można nawet odpowiedzieć: „Są minusy, powiem, ale masz jeszcze mnóstwo plusów — daj mi parę słów i o nich". Bo w życiu, z reguły, za mało nas chwalą.</p>',
        },
      },

      // 5 — ШАГ 3: О МИНУСАХ + ШАГ 4: ЧТО ДЕЛАТЬ
      {
        id: 'steps3-4-minuses-action',
        title: {
          ru: 'Шаги 3–4. Говорить о минусах и что с этим делать',
          en: 'Steps 3–4. Talk about the minuses and what to do about it',
          pl: 'Kroki 3–4. Mówić o minusach i co z tym robić',
        },
        desc: {
          ru: 'Как назвать минусы, замолчать вовремя и провести человека через наблюдение, решение и действие.',
          en: 'How to name the minuses, fall silent in time, and lead the person through observation, decision, and action.',
          pl: 'Jak nazwać minusy, zamilknąć w porę i przeprowadzić człowieka przez obserwację, decyzję i działanie.',
        },
        html: {
          ru:
            '<h2>Глава 5. Шаг 3 — говорить о минусах</h2>' +
            '<p>Теперь, когда человек видит в вас друга и сам хочет разговора, можно перейти к минусам. Делается это просто: «Я вижу у тебя на тесте вот это и вот это. Как ты вообще с этим? Это же, наверное, вот такая проблема». Человек отвечает «да!», начинает смотреть внутрь себя — и в этот момент, как мы уже знаем, оценщик должен замолчать. Важная деталь: чтобы человек «отчалил», а вы замолчали, вы сначала должны действительно говорить о его тесте и минусах. Если вы будете рассуждать о погоде или о том, какие у него симпатичные часы, он никуда не отчалит.</p>' +
            '<p>При этом не забывайте: тестовый бланк — это не человек. Так и скажите: «Это всего лишь бумажка, на ней написано что-то о твоих инструментах, но это не ты. Важен ты. Есть плотник, который молотком, топором и отвёрткой строит дома, а есть тот, кто с полным набором инструментов и гвоздя забить не может. Мы посмотрим на твои инструменты, чтобы, может, я подсказал тебе что-то, — дай хорошему плотнику ещё один инструмент, он построит больше и заработает больше. И знай: это ты можешь изменить, я не могу — но ты можешь, а я лишь помогу». А затем небрежно отложите бланк в сторону. Внимание человека к бумажке привлекать не нужно (чем больше он смотрит на бланк, тем меньше смотрит внутрь себя), но и прятать бланк нельзя — спрятанное только сильнее притягивает интерес. Если человек попросит: «дай посмотреть» — спокойно дайте, добавив, что сам он вряд ли что-то поймёт, и не потому, что глуп, а потому, что за этим стоит технология, которой долго учатся. И главное на этом шаге — ваш собственный конфронт: не дёргайтесь, не бойтесь, не напрягайтесь, будьте готовы к чему угодно. Ваш спокойный конфронт — залог успеха.</p>' +
            '<h2>Глава 6. Шаг 4 — что с этим делать: наблюдать, решать, действовать</h2>' +
            '<p>Шаги 3 и 4 идут вместе, их даже трудно разделить: на четвёртом мы разбираем, что со всем этим делать. А в основе — те самые три составляющие способности: наблюдать, принимать решения и действовать. Мы хотим, чтобы человек усилился, то есть чтобы осознанное им повлияло на его действия в жизни.</p>' +
            '<p>Самый важный из трёх — первый шаг, наблюдение; чем лучше он сделан, тем проще идут следующие. Отсюда простое правило: если человек не может принять решение или начать действовать, если он возвращается и говорит «не получается» или «боюсь», — вы всегда возвращаетесь назад, к наблюдению. Значит, он что-то недостаточно рассмотрел — пусть посмотрит ещё раз. Помогают ему в этом ваши вопросы: «А если ты сделаешь так — что будет? А если так?» Человек смотрит и сам вам отвечает; вы лишь наталкиваете его вопросами, но решения не подсказываете. Особенно это касается ситуаций, где он застрял в состоянии «может быть»: помогите ему рассмотреть последствия каждого из вариантов, и это выведет его из сомнения. А приняв решение, он должен его исполнить — но сделать это он может только в жизни, а не во время оценки (нельзя же прямо на беседе разбираться с женой). Поэтому, чтобы довести дело до конца, его нужно отпустить действовать. И решение — его, и последствия тоже его: «Твоё решение, твои действия, последствия — тоже твои. Не спрашивай моего одобрения, я тебе не господь бог».</p>' +
            '<p>Из правила «не подсказывать» есть, к сожалению, одно исключение — ради него мы в своё время и разбирали, что обход равен опасности. Есть люди, которые уже находятся в большой опасности: они не могут ни увидеть, ни решить сами. Таких приходится «обходить» — то есть решать за них и прямо говорить, что делать. Это люди, полностью ушедшие в реактивный ум, — с очень низким тестом (например, A минус 98, B минус 96). Не думайте, что таких тестов не бывает или что это непременно немощный человек: с такими тестами нередко встречаются очень богатые люди — некоторые наши сотрудники в шутку называют это «синдромом олигарха». Если A очень низкая, всё внимание человека и так постоянно в реактивном уме — он приходит уже «отчалившим», и ждать, пока он куда-то отчалит, бесполезно. Тогда вы говорите ему прямо: «У тебя есть такая-то проблема, тебе надо делать вот это». Но — только если вы действительно знаете, что ему надо делать. Если не знаете — просто не говорите об этом: вы не берёте за это денег и никому ничего не обязаны, а человек и так не знает, что вы видите на тесте. Даже одной сотой того, что вы видите, хватит, чтобы поразить его своей прозорливостью.</p>' +
            '<p>Наконец, о завершении. Не пытайтесь за одну оценку решить всё. Разобрали одну проблему — человек посмотрел, что-то увидел, принял решение и готов действовать — на этом оценку заканчивайте. Пусть вы сказали ему три процента из того, что видите на тесте, — неважно: таких улучшений, как это, он за свою жизнь, скорее всего, и не испытывал. Дайте ему пойти и получить успех; ничто не мешает продолжить через пару недель — он ещё сам придёт «с цветами и шампанским». Проблема оценщиков не в том, что они мало говорят, а в том, что они говорят слишком много. Заканчивайте, когда человек что-то пронаблюдал и осознал, принял решение, знает, что будет делать, и горит желанием начать.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Заканчивайте оценку, получив хотя бы одно, пусть небольшое, но настоящее улучшение: человек увидел что-то новое, принял решение и готов действовать. Не вываливайте всё сразу — главная ошибка оценщика в том, что он говорит слишком много.', true)),
          en:
            '<h2>Chapter 5. Step 3 — talk about the minuses</h2>' +
            '<p>Now, when the person sees a friend in you and himself wants the conversation, you can move on to the minuses. This is done simply: "I see this and this on your test. How are you with this, generally? This is probably such-and-such a problem, isn\'t it." The person answers "yes!", begins to look inside himself — and at that moment, as we already know, the assessor must fall silent. An important detail: in order for the person to "cast off" and for you to fall silent, you must first actually talk about his test and his minuses. If you go on about the weather or about what a nice watch he has, he will not cast off anywhere.</p>' +
            '<p>At the same time, do not forget: the test form is not the person. Say so directly: "This is just a piece of paper, something is written on it about your tools, but it is not you. You are what matters. There is a carpenter who builds houses with a hammer, an axe, and a screwdriver, and there is one who, with a full set of tools, cannot even drive in a nail. We will look at your tools so that I might perhaps suggest something to you — give a good carpenter one more tool, and he will build more and earn more. And know this: this is something you can change, I cannot — but you can, and I will only help." And then casually set the form aside. There is no need to draw the person\'s attention to the piece of paper (the more he looks at the form, the less he looks inside himself), but you must not hide the form either — what is hidden only attracts interest more strongly. If the person asks, "let me have a look" — calmly give it, adding that he is unlikely to understand much of it himself, and not because he is stupid, but because behind it stands a technology that takes a long time to learn. And the main thing at this step is your own confront: do not fidget, do not be afraid, do not tense up, be ready for anything. Your calm confront is the key to success.</p>' +
            '<h2>Chapter 6. Step 4 — what to do about it: observe, decide, act</h2>' +
            '<p>Steps 3 and 4 go together, it is even hard to separate them: in the fourth we work out what to do with all of this. And at the base are those same three components of ability: to observe, to make decisions, and to act. We want the person to grow stronger, that is, for what he has become aware of to influence his actions in life.</p>' +
            '<p>The most important of the three is the first step, observation; the better it is done, the more easily the following ones go. Hence a simple rule: if a person cannot make a decision or begin to act, if he comes back and says "it\'s not working" or "I\'m afraid" — you always go back, to observation. It means he has not examined something sufficiently — let him look again. Your questions help him in this: "And if you do this — what will happen? And if this?" The person looks and answers you himself; you only nudge him with questions but do not suggest the decisions. This especially concerns situations where he is stuck in a state of "maybe": help him examine the consequences of each of the options, and this will lead him out of doubt. And having made a decision, he must carry it out — but he can do this only in life, not during the assessment (you can\'t very well settle things with your wife right there in the conversation). That is why, in order to see the matter through, he must be released to act. And both the decision is his and the consequences are his too: "Your decision, your actions, the consequences — also yours. Do not ask for my approval, I am not the Lord God to you."</p>' +
            '<p>From the rule of "not suggesting" there is, unfortunately, one exception — it is for its sake that we examined, at one time, that a bypass equals danger. There are people who are already in great danger: they can neither see nor decide for themselves. Such people have to be "bypassed" — that is, you decide for them and tell them directly what to do. These are people who have gone completely into the reactive mind — with a very low test (for example, A minus 98, B minus 96). Do not think that such tests do not occur or that this is necessarily a feeble person: very rich people are not infrequently found with such tests — some of our employees jokingly call this "the oligarch syndrome." If A is very low, all of the person\'s attention is in any case constantly in the reactive mind — he comes already "cast off," and it is pointless to wait for him to cast off somewhere. Then you tell him directly: "You have such-and-such a problem, you need to do this." But — only if you really know what he needs to do. If you do not know — simply do not speak of it: you are not taking money for it and owe no one anything, and the person in any case does not know what you see on the test. Even one hundredth of what you see is enough to astonish him with your perceptiveness.</p>' +
            '<p>Finally, about finishing. Do not try to solve everything in a single assessment. You worked through one problem — the person looked, saw something, made a decision, and is ready to act — end the assessment there. Even if you have told him three percent of what you see on the test — it does not matter: improvements like this one he has most likely never experienced in his whole life. Let him go and get a success; nothing prevents you from continuing in a couple of weeks — he will come to you himself "with flowers and champagne." The problem of assessors is not that they say too little, but that they say too much. Finish when the person has observed and become aware of something, has made a decision, knows what he will do, and is burning with the desire to begin.</p>' +
            k('KEY IDEA',
              bp('End the assessment once you have obtained at least one improvement — a small one, perhaps, but a real one: the person has seen something new, made a decision, and is ready to act. Do not dump everything at once — the assessor\'s main mistake is that he says too much.', true)),
          pl:
            '<h2>Rozdział 5. Krok 3 — mówić o minusach</h2>' +
            '<p>Teraz, gdy człowiek widzi w tobie przyjaciela i sam chce rozmowy, można przejść do minusów. Robi się to prosto: „Widzę u ciebie na teście to i to. Jak ty w ogóle z tym? To chyba jest taki oto problem". Człowiek odpowiada „tak!", zaczyna patrzeć w głąb siebie — i w tym momencie, jak już wiemy, oceniający powinien zamilknąć. Ważny szczegół: żeby człowiek „odpłynął", a wy zamilkli, musicie najpierw naprawdę mówić o jego teście i minusach. Jeśli będziecie rozprawiać o pogodzie albo o tym, jaki ma sympatyczny zegarek, on nigdzie nie odpłynie.</p>' +
            '<p>Przy tym nie zapominajcie: arkusz testowy to nie człowiek. Tak też powiedzcie: „To tylko papierek, napisane jest na nim coś o twoich narzędziach, ale to nie ty. Ważny jesteś ty. Jest cieśla, który młotkiem, siekierą i śrubokrętem buduje domy, a jest taki, kto z pełnym zestawem narzędzi i gwoździa wbić nie potrafi. Popatrzymy na twoje narzędzia, żebym może podpowiedział ci coś — daj dobremu cieśli jeszcze jedno narzędzie, a zbuduje więcej i zarobi więcej. I wiedz: to ty możesz zmienić, ja nie mogę — ale ty możesz, a ja tylko pomogę". A następnie niedbale odłóżcie arkusz na bok. Uwagi człowieka do papierka przyciągać nie trzeba (im więcej patrzy na arkusz, tym mniej patrzy w głąb siebie), ale i chować arkusza nie wolno — schowane tylko silniej przyciąga zainteresowanie. Jeśli człowiek poprosi: „daj popatrzeć" — spokojnie dajcie, dodając, że sam raczej niewiele zrozumie, i nie dlatego, że jest głupi, lecz dlatego, że za tym stoi technologia, której długo się uczy. I najważniejsze na tym kroku — wasz własny konfront: nie szarpcie się, nie bójcie się, nie spinajcie się, bądźcie gotowi na cokolwiek. Wasz spokojny konfront jest gwarancją sukcesu.</p>' +
            '<h2>Rozdział 6. Krok 4 — co z tym robić: obserwować, decydować, działać</h2>' +
            '<p>Kroki 3 i 4 idą razem, trudno je nawet rozdzielić: na czwartym omawiamy, co z tym wszystkim robić. A u podstaw — te same trzy składowe zdolności: obserwować, podejmować decyzje i działać. Chcemy, żeby człowiek się wzmocnił, czyli żeby to, co uświadomił sobie, wpłynęło na jego działania w życiu.</p>' +
            '<p>Najważniejszy z trzech to pierwszy krok, obserwacja; im lepiej jest zrobiony, tym łatwiej idą następne. Stąd prosta zasada: jeśli człowiek nie może podjąć decyzji albo zacząć działać, jeśli wraca i mówi „nie wychodzi" albo „boję się" — wy zawsze wracacie wstecz, do obserwacji. To znaczy, że czegoś niewystarczająco się przyjrzał — niech popatrzy jeszcze raz. Pomagają mu w tym wasze pytania: „A jeśli zrobisz tak — co będzie? A jeśli tak?" Człowiek patrzy i sam wam odpowiada; wy tylko naprowadzacie go pytaniami, ale rozwiązań nie podpowiadacie. Szczególnie dotyczy to sytuacji, gdzie utknął w stanie „być może": pomóżcie mu rozpatrzyć następstwa każdego z wariantów, a to wyprowadzi go z wątpliwości. A podjąwszy decyzję, powinien ją wykonać — ale zrobić to może tylko w życiu, a nie podczas oceny (nie można przecież wprost na rozmowie rozprawiać się z żoną). Dlatego, żeby doprowadzić sprawę do końca, trzeba go wypuścić, by działał. I decyzja jest jego, i następstwa też jego: „Twoja decyzja, twoje działania, następstwa — też twoje. Nie pytaj o moją aprobatę, nie jestem dla ciebie panem bogiem".</p>' +
            '<p>Z zasady „nie podpowiadać" jest, niestety, jeden wyjątek — właśnie dla niego swego czasu omawialiśmy, że obejście równa się niebezpieczeństwu. Są ludzie, którzy już znajdują się w wielkim niebezpieczeństwie: nie mogą ani zobaczyć, ani zdecydować sami. Takich trzeba „obchodzić" — czyli decydować za nich i wprost mówić, co robić. To ludzie całkowicie pogrążeni w umyśle reaktywnym — z bardzo niskim testem (na przykład A minus 98, B minus 96). Nie myślcie, że takich testów nie ma albo że to koniecznie niemrawy człowiek: z takimi testami nierzadko spotyka się bardzo bogatych ludzi — niektórzy nasi pracownicy żartobliwie nazywają to „syndromem oligarchy". Jeśli A jest bardzo niska, cała uwaga człowieka i tak stale tkwi w umyśle reaktywnym — przychodzi już „odpłynięty", i czekać, aż gdzieś odpłynie, jest bezcelowo. Wtedy mówicie mu wprost: „Masz taki a taki problem, musisz robić to a to". Ale — tylko jeśli naprawdę wiecie, co ma robić. Jeśli nie wiecie — po prostu o tym nie mówcie: nie bierzecie za to pieniędzy i nikomu nic nie jesteście winni, a człowiek i tak nie wie, co widzicie na teście. Nawet jedna setna tego, co widzicie, wystarczy, żeby porazić go swoją przenikliwością.</p>' +
            '<p>Wreszcie o zakończeniu. Nie próbujcie za jedną ocenę rozwiązać wszystkiego. Omówiliście jeden problem — człowiek popatrzył, coś zobaczył, podjął decyzję i jest gotów działać — na tym ocenę kończcie. Choćbyście powiedzieli mu trzy procent z tego, co widzicie na teście — nieważne: takich poprawień jak to prawdopodobnie przez całe swoje życie nie doświadczał. Dajcie mu pójść i uzyskać sukces; nic nie stoi na przeszkodzie, żeby kontynuować za parę tygodni — on jeszcze sam przyjdzie „z kwiatami i szampanem". Problem oceniających nie polega na tym, że mówią mało, lecz na tym, że mówią za dużo. Kończcie, gdy człowiek coś zaobserwował i uświadomił sobie, podjął decyzję, wie, co będzie robił, i pała chęcią, żeby zacząć.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Kończcie ocenę, uzyskawszy choćby jedno, niech niewielkie, ale prawdziwe poprawienie: człowiek zobaczył coś nowego, podjął decyzję i jest gotów działać. Nie wywalajcie wszystkiego naraz — główny błąd oceniającego polega na tym, że mówi za dużo.', true)),
        },
      },

      // 6 — ГЛАВА 7: ПРАВИЛА И ПРЕДОСТЕРЕЖЕНИЕ
      {
        id: 'rules-warning',
        title: {
          ru: 'Глава 7. Важные правила и одно предостережение',
          en: 'Chapter 7. Important rules and one word of caution',
          pl: 'Rozdział 7. Ważne zasady i jedno przestrzeżenie',
        },
        desc: {
          ru: 'Правила, скрепляющие процедуру, и принципиальное предостережение об уважении к продуктивному сотруднику.',
          en: 'The rules that hold the procedure together, and a fundamental word of caution about respect for a productive employee.',
          pl: 'Zasady spinające procedurę i zasadnicze przestrzeżenie o szacunku dla produktywnego pracownika.',
        },
        html: {
          ru:
            '<h2>Глава 7. Важные правила и одно предостережение</h2>' +
            '<p>Несколько правил, которые скрепляют всю процедуру.</p>' +
            r('ПРАВИЛО',
              bp('Чем ниже и слабее тест, тем тщательнее нужно делать шаг 2. Если тест очень сильный, шаг можно сделать быстро (но сделать обязательно). А если тест слабый, один только шаг 2a — рассказ о том, что показывает тест, — может занять пятнадцать-двадцать минут, и это не преувеличение.', true)) +
            '<p>Если во время беседы вам нужно посоветоваться с консультантом — сделайте это до беседы или в тот момент, когда человек «отчалил» (тогда постарайтесь подольше удержать его на третьей линии и тихонько позвоните). Не превращайте оценку в паузы «подожди, я сейчас позвоню, что с этим делать» — для этого и нужно как следует изучить тест заранее.</p>' +
            '<p>Будьте готовы к сильным эмоциям: кто-то может расплакаться у вас на плече, и это серьёзно. Если вы к этому не готовы — не беритесь предоставлять оценку, значит, у вас самого слабоват конфронт. Нельзя быть «чуть-чуть беременным»: взявшись за оценку, будьте готовы идти до конца — вас туда затянет. Если человек плачет — просто дайте ему выплакаться, подайте салфетки или, если нужно, выйдите и вернитесь, когда он будет готов.</p>' +
            k('ПРЕДОСТЕРЕЖЕНИЕ',
              bp('И, наконец, предостережение, которое я считаю принципиальным. Оценку теста предоставляют только продуктивным сотрудникам, и для такого сотрудника это благодарность, а не повод для санкций. Никогда не увольняйте и не обижайте хорошего сотрудника из-за плохого теста. Увольнять нужно только за плохие результаты работы, а брать — только за хорошие; сам факт, что вы предоставляете человеку тест, означает, что результат у него есть. Человек, который производит продукт, заслуживает уважения, благодарности и желания помочь — независимо от того, что нарисовано на «этой вшивой бумажке». А если кого-то оскорбить из-за теста, он вполне может затем написать разгромные отзывы, — но главное даже не в этом, а в том, что это просто несправедливо по отношению к тому, кто приносит пользу.', true)) +
            '<p>А как читать сам тест — что показывает каждая из десяти точек и как говорить о каждой из них и с положительной, и с отрицательной стороны — мы разберём в следующих модулях, идя по точкам A–J.</p>',
          en:
            '<h2>Chapter 7. Important rules and one word of caution</h2>' +
            '<p>A few rules that hold the whole procedure together.</p>' +
            r('RULE',
              bp('The lower and weaker the test, the more carefully step 2 must be done. If the test is very strong, the step can be done quickly (but it must be done). And if the test is weak, step 2a alone — the account of what the test shows — can take fifteen to twenty minutes, and that is no exaggeration.', true)) +
            '<p>If during the conversation you need to consult a consultant — do it before the conversation or at the moment when the person has "cast off" (then try to keep him on the third line a bit longer and quietly make the call). Do not turn the assessment into pauses of "hold on, I\'ll just call to find out what to do with this" — that is exactly why you should study the test thoroughly in advance.</p>' +
            '<p>Be ready for strong emotions: someone may burst into tears on your shoulder, and this is serious. If you are not ready for this — do not undertake to deliver the assessment, it means your own confront is a bit weak. You cannot be "a little bit pregnant": having taken on the assessment, be ready to go all the way — you will be pulled into it. If the person is crying — simply let him cry it out, hand him tissues or, if need be, step out and come back when he is ready.</p>' +
            k('WORD OF CAUTION',
              bp('And, finally, a word of caution that I consider fundamental. A test assessment is delivered only to productive employees, and for such an employee it is a token of thanks, not a pretext for sanctions. Never fire or offend a good employee because of a bad test. You should fire only for bad work results, and hire only for good ones; the very fact that you are delivering the test to a person means that he does have a result. A person who produces a product deserves respect, gratitude, and the desire to help — regardless of what is drawn on "that lousy piece of paper." And if you offend someone because of a test, he may well go on to write scathing reviews — but the main point is not even that, it is that it is simply unjust toward the one who is being of benefit.', true)) +
            '<p>And how to read the test itself — what each of the ten points shows and how to talk about each of them from both the positive and the negative side — we will examine in the following modules, going through the points A–J.</p>',
          pl:
            '<h2>Rozdział 7. Ważne zasady i jedno przestrzeżenie</h2>' +
            '<p>Kilka zasad, które spinają całą procedurę.</p>' +
            r('ZASADA',
              bp('Im niższy i słabszy test, tym staranniej trzeba robić krok 2. Jeśli test jest bardzo silny, krok można zrobić szybko (ale zrobić obowiązkowo). A jeśli test jest słaby, sam tylko krok 2a — opowieść o tym, co pokazuje test — może zająć piętnaście-dwadzieścia minut, i to nie przesada.', true)) +
            '<p>Jeśli podczas rozmowy musicie skonsultować się z konsultantem — zróbcie to przed rozmową albo w tym momencie, gdy człowiek „odpłynął" (wtedy postarajcie się dłużej utrzymać go na trzeciej linii i po cichu zadzwońcie). Nie zamieniajcie oceny w pauzy „poczekaj, zaraz zadzwonię, co z tym robić" — po to właśnie trzeba porządnie przestudiować test zawczasu.</p>' +
            '<p>Bądźcie gotowi na silne emocje: ktoś może rozpłakać się na waszym ramieniu, i to na serio. Jeśli nie jesteście na to gotowi — nie bierzcie się za przekazywanie oceny, to znaczy, że wam samym konfront jest słabawy. Nie można być „trochę w ciąży": wziąwszy się za ocenę, bądźcie gotowi iść do końca — wciągnie was tam. Jeśli człowiek płacze — po prostu dajcie mu się wypłakać, podajcie chusteczki albo, jeśli trzeba, wyjdźcie i wróćcie, gdy będzie gotów.</p>' +
            k('PRZESTRZEŻENIE',
              bp('I wreszcie przestrzeżenie, które uważam za zasadnicze. Ocenę testu przekazuje się tylko produktywnym pracownikom, i dla takiego pracownika to podziękowanie, a nie powód do sankcji. Nigdy nie zwalniajcie i nie krzywdźcie dobrego pracownika z powodu złego testu. Zwalniać trzeba tylko za złe wyniki pracy, a przyjmować — tylko za dobre; sam fakt, że przekazujecie człowiekowi test, oznacza, że wynik ma. Człowiek, który wytwarza produkt, zasługuje na szacunek, wdzięczność i chęć pomocy — niezależnie od tego, co narysowane na „tym parszywym papierku". A jeśli kogoś obrazić z powodu testu, może on potem napisać druzgocące opinie — ale najważniejsze nawet nie w tym, lecz w tym, że to po prostu niesprawiedliwe wobec tego, kto przynosi pożytek.', true)) +
            '<p>A jak czytać sam test — co pokazuje każdy z dziesięciu punktów i jak mówić o każdym z nich zarówno z pozytywnej, jak i z negatywnej strony — omówimy w kolejnych modułach, idąc po punktach A–J.</p>',
        },
      },
    ],
    quiz: {
      passScore: 60,
      questions: [
        {
          q: {
            ru: 'Почему беседу по тесту нельзя вести в том же порядке, в каком мы изучаем тест для себя?',
            en: 'Why can the conversation about the test not be conducted in the same order in which we study the test for ourselves?',
            pl: 'Dlaczego rozmowy o teście nie można prowadzić w tej samej kolejności, w jakiej studiujemy test dla siebie?',
          },
          opts: [
            {
              ru: 'Так дольше и утомительнее для оценщика.',
              en: 'It takes longer and is more tiring for the assessor.',
              pl: 'Tak jest dłużej i bardziej męcząco dla oceniającego.',
            },
            {
              ru: 'Начав с синдромов и минусов, вы предстаёте врагом, и человек закрывается, а не раскрывается.',
              en: 'Starting with syndromes and minuses, you appear as an enemy, and the person closes up rather than opens up.',
              pl: 'Zaczynając od syndromów i minusów, jawisz się jako wróg, i człowiek zamyka się, a nie otwiera.',
            },
            {
              ru: 'Порядок изучения запрещён технологией.',
              en: 'The order of study is forbidden by the technology.',
              pl: 'Kolejność studiowania jest zakazana przez technologię.',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что является продуктом (целью) шага 2 — самого важного шага оценки?',
            en: 'What is the product (goal) of step 2 — the most important step of the assessment?',
            pl: 'Co jest produktem (celem) kroku 2 — najważniejszego kroku oceny?',
          },
          opts: [
            {
              ru: 'Найти у человека главный минус и прямо назвать его.',
              en: 'To find the person\'s main minus and name it directly.',
              pl: 'Znaleźć u człowieka główny minus i wprost go nazwać.',
            },
            {
              ru: 'Быстро заполнить и убрать тестовый бланк.',
              en: 'To quickly fill out and put away the test form.',
              pl: 'Szybko wypełnić i schować arkusz testowy.',
            },
            {
              ru: 'Человек доверяет вам, видит в вас друга и сам хочет обсудить свои минусы.',
              en: 'The person trusts you, sees a friend in you, and himself wants to discuss his minuses.',
              pl: 'Człowiek wam ufa, widzi w was przyjaciela i sam chce omówić swoje minusy.',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Если человек не может принять решение или начать действовать, куда всегда возвращается оценщик?',
            en: 'If a person cannot make a decision or begin to act, where does the assessor always go back to?',
            pl: 'Jeśli człowiek nie może podjąć decyzji albo zacząć działać, dokąd zawsze wraca oceniający?',
          },
          opts: [
            {
              ru: 'К наблюдению — значит, человек что-то недостаточно рассмотрел.',
              en: 'To observation — it means the person has not examined something sufficiently.',
              pl: 'Do obserwacji — to znaczy, że człowiek czegoś niewystarczająco się przyjrzał.',
            },
            {
              ru: 'К минусам — надо назвать ещё несколько минусов.',
              en: 'To the minuses — a few more minuses need to be named.',
              pl: 'Do minusów — trzeba nazwać jeszcze kilka minusów.',
            },
            {
              ru: 'К похвале — надо ещё дольше говорить о плюсах.',
              en: 'To praise — one must talk about the pluses for even longer.',
              pl: 'Do pochwały — trzeba jeszcze dłużej mówić o plusach.',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Как правильно относиться к продуктивному сотруднику с плохим тестом?',
            en: 'How should one correctly treat a productive employee with a bad test?',
            pl: 'Jak właściwie odnosić się do produktywnego pracownika ze złym testem?',
          },
          opts: [
            {
              ru: 'Уволить или наказать его из-за плохого теста.',
              en: 'Fire or punish him because of the bad test.',
              pl: 'Zwolnić albo ukarać go z powodu złego testu.',
            },
            {
              ru: 'Никогда не обижать: тест — благодарность, увольняют только за плохие результаты работы.',
              en: 'Never offend him: the test is a token of thanks; one fires only for bad work results.',
              pl: 'Nigdy nie krzywdzić: test to podziękowanie, zwalnia się tylko za złe wyniki pracy.',
            },
            {
              ru: 'Перевести его на менее ответственную должность.',
              en: 'Transfer him to a less responsible position.',
              pl: 'Przenieść go na mniej odpowiedzialne stanowisko.',
            },
          ],
          correct: 1,
        },
      ],
    },
  },
};
