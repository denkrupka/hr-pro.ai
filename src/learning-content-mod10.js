'use strict';
// Контент программы «Личностные качества (Демонстрация оценки и шаги 3–4)» (ru/en/pl; ru — рабочий перевод с EN).
// Мёржится в learning.js по ключу 'module-demo'.

// Врезки-боксы 1-в-1 из mod8 / productivity-winners / module-abc.
// b — нейтральный серый (ПРИМЕР / ЗАМЕТКА), k — фиолетовый (КЛЮЧЕВАЯ ИДЕЯ),
// r — зелёный (ПРАВИЛО), t — синий (ПРИМЕНЕНИЕ В НАЙМЕ). Внутри — абзацы bp().
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
  'module-demo': {
    sections: [
      // 1 — ВВЕДЕНИЕ + ШАГ 2b НА ЦЕЛОМ ТЕСТЕ
      {
        id: 'intro',
        title: {
          ru: 'Демонстрация оценки и шаги 3–4 · Введение',
          en: 'Demonstration and steps 3–4 · Introduction',
          pl: 'Demonstracja i kroki 3–4 · Wprowadzenie',
        },
        desc: {
          ru: 'О чём этот модуль и как на целом тесте выбирать и подавать плюсы (шаг 2b): порядок, обычные точки, чувствительность.',
          en: 'What this module is about and how to choose and build the pluses on a whole test (step 2b): the order, the obvious points, sensitivity.',
          pl: 'O czym jest ten moduł i jak na całym teście wybierać i budować plusy (krok 2b): kolejność, oczywiste punkty, wrażliwość.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 10 · ДЕМОНСТРАЦИЯ ОЦЕНКИ И ШАГИ 3–4</strong></p>' +
            '<p>Демонстрация оценки и шаги 3–4: разговор о минусах</p>' +
            '<p>Как на целом тесте выбирать и подавать плюсы, а затем — как переходить к минусам и что с ними делать (на примере точки D).</p>' +
            '<h2>Модуль 10. Демонстрация оценки и шаги 3–4</h2>' +
            '<p>Мы разобрали все десять точек и всю структуру разговора. Теперь — демонстрация: как на целом тесте выбирать и строить плюсы (шаг 2b), а затем как переходить к минусам (шаги 3 и 4) и что с ними делать. Разбор минусов покажем на примере точки D. На этом методика оценки (Часть II) завершается; дальше мы перейдём к самому тесту (Часть III).</p>' +
            '<h3>Глава 1. Шаг 2b на целом тесте: как выбирать и строить плюсы</h3>' +
            '<p>Теперь мы можем делать шаг 2b по любой точке — кроме тех диапазонов, где мы храним понимающее молчание. Наша цель — добиться одного-единственного улучшения, но говорить при этом о как можно большем числе плюсов.</p>' +
            '<p>Порядок такой: сначала плюсы высоких точек, потом плюсы низких. А внутри этого — начинайте с того, что для человека очевидно и реально, и, что самое важное, с того, о чём вы сами можете говорить уверенно: вы помните формулировку, вы её понимаете, сомнений нет.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Одна из важнейших идей всей оценки: что можно сказать по тесту, знаете только вы сами (да и то не всегда). Человек не знает, что вы «должны» сказать по его тесту. Поэтому если по какой-то точке вы не уверены или что-то не сходится — просто не говорите об этой точке. Никакой проблемы в этом нет — при одном условии: вы сами из-за этого не напрягаетесь. А если напряжётесь, человек это сразу почувствует и напряжётся тоже. Не знаете, что сказать — не говорите; расслабьтесь и говорите о том, что для человека реально, с чем он согласится и в чём вы уверены.', true)) +
            '<p>Больше твёрдых правил нет — дальше всё очень индивидуально. Но по опыту обычно удобно начинать с очевидных точек: A (много внимания, умеет планировать, концентрироваться) и E (энергичный, любит начинать, инициативный) — о них человеку легко и приятно услышать. О J, если она высокая, тоже легко: «яркая личность, тебе легко заговорить, легко войти в контакт». А вот с чувствительностью — внимание: если она компульсивная и рядом с ней низкая коммуникация или низкая правильность оценки, с неё начинать нельзя (иначе вы сразу свалитесь в разговор о минусах); её оставляют на самый конец шага 2b.</p>',
          en:
            '<p><strong>MODULE 10 · DEMONSTRATION AND STEPS 3–4</strong></p>' +
            '<p>Demonstration of an assessment and steps 3–4: the conversation about minuses</p>' +
            '<p>How to choose and present the pluses on a whole test, and then — how to move on to the minuses and what to do with them (using point D as an example).</p>' +
            '<h2>Module 10. Demonstration of an assessment and steps 3–4</h2>' +
            '<p>We have examined all ten points and the whole structure of the conversation. Now — a demonstration: how to choose and build the pluses on a whole test (step 2b), and then how to move on to the minuses (steps 3 and 4) and what to do with them. The examination of the minuses we will show using point D as an example. With this the methodology of assessment (Part II) is concluded; next we will move on to the test itself (Part III).</p>' +
            '<h3>Chapter 1. Step 2b on a whole test: how to choose and build the pluses</h3>' +
            '<p>Now we can do step 2b for any point — except those ranges where we keep an understanding silence. Our goal is to achieve one single improvement, but to speak in the process about as many pluses as possible.</p>' +
            '<p>The order is this: first the pluses of the high points, then the pluses of the low ones. And within that — begin with what is obvious and real for the person, and, most important, with what you yourself can speak about with confidence: you remember the formulation, you understand it, there are no doubts.</p>' +
            k('KEY IDEA',
              bp('One of the most important ideas of the whole assessment: what can be said from the test is known only to you yourself (and even then not always). The person does not know what you are "supposed" to say from his test. That is why, if on some point you are not sure or something does not add up — simply do not speak about that point. There is no problem in this whatsoever — on one condition: you yourself do not tense up about it. But if you do tense up, the person will immediately feel it and tense up too. If you don\'t know what to say — don\'t say it; relax and speak about what is real for the person, what he will agree with, and what you are sure of.', true)) +
            '<p>There are no more hard rules — beyond this everything is very individual. But from experience it is usually convenient to begin with the obvious points: A (a lot of attention, able to plan, to concentrate) and E (energetic, likes to begin, takes initiative) — about these it is easy and pleasant for the person to hear. About J, if it is high, it is easy too: "a vivid personality, it\'s easy for you to strike up a conversation, easy to make contact." But with sensitivity — attention: if it is compulsive and next to it there is low communication or a low correctness of evaluation, one must not begin with it (otherwise you will at once tumble into the conversation about minuses); it is left for the very end of step 2b.</p>',
          pl:
            '<p><strong>MODUŁ 10 · DEMONSTRACJA I KROKI 3–4</strong></p>' +
            '<p>Demonstracja oceny i kroki 3–4: rozmowa o minusach</p>' +
            '<p>Jak na całym teście wybierać i podawać plusy, a następnie — jak przechodzić do minusów i co z nimi robić (na przykładzie punktu D).</p>' +
            '<h2>Moduł 10. Demonstracja oceny i kroki 3–4</h2>' +
            '<p>Omówiliśmy wszystkie dziesięć punktów i całą strukturę rozmowy. Teraz — demonstracja: jak na całym teście wybierać i budować plusy (krok 2b), a następnie jak przechodzić do minusów (kroki 3 i 4) i co z nimi robić. Omówienie minusów pokażemy na przykładzie punktu D. Tym kończy się metodyka oceny (Część II); dalej przejdziemy do samego testu (Część III).</p>' +
            '<h3>Rozdział 1. Krok 2b na całym teście: jak wybierać i budować plusy</h3>' +
            '<p>Teraz możemy robić krok 2b przy każdym punkcie — poza tymi zakresami, gdzie milczymy ze zrozumieniem. Naszym celem jest doprowadzić do jednego ulepszenia, ale mówić przy tym o jak największej liczbie plusów.</p>' +
            '<p>Kolejność jest taka: najpierw plusy wysokich punktów, potem plusy niskich. A wewnątrz tego — zaczynajcie od tego, co dla człowieka jest oczywiste i realne, i, co bardzo ważne, od tego, o czym wy sami możecie mówić pewnie: pamiętacie sformułowanie, rozumiecie je, wątpliwości nie ma.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Jedna z najważniejszych idei całej oceny: to, co można powiedzieć na podstawie testu, wiecie tylko wy sami (i to nie zawsze). Człowiek nie wie, co „powinniście” powiedzieć na podstawie jego testu. Dlatego jeśli co do jakiegoś punktu nie jesteście pewni albo coś się nie składa — po prostu nie mówcie o tym punkcie. Żadnego problemu w tym nie ma — pod jednym warunkiem: sami z tego powodu się nie spinacie. A jeśli się spinacie, człowiek to od razu poczuje i spnie się też. Nie wiecie, co powiedzieć — nie mówcie; rozluźnijcie się i mówcie o tym, co jest realne dla człowieka, z czym się zgodzi i czego jesteście pewni.', true)) +
            '<p>Więcej twardych zasad nie ma — dalej wszystko jest bardzo indywidualne. Ale z doświadczenia zwykle wygodnie jest zaczynać od oczywistych punktów: A (dużo uwagi, umie planować, koncentrować się) i E (energiczny, lubi zaczynać, inicjatywny) — o nich człowiekowi łatwo i przyjemnie usłyszeć. O J, jeśli jest wysokie, też łatwo: „barwna osobowość, łatwo ci zagadać, łatwo wejść w kontakt”. A oto z wrażliwością — uwaga: jeśli jest kompulsywna i obok niej jest niska komunikacja albo niska poprawność oceny, od niej zaczynać nie wolno (inaczej od razu spadniecie w rozmowę o minusach); zostawia się ją na sam koniec kroku 2b.</p>',
        },
      },

      // 2 — ДЕМОНСТРАЦИЯ: ПЛЮСЫ НА РЕАЛЬНОМ ТЕСТЕ
      {
        id: 'demo-pluses',
        title: {
          ru: 'Демонстрация: плюсы на реальном тесте',
          en: 'Demonstration: the pluses on a real test',
          pl: 'Demonstracja: plusy na realnym teście',
        },
        desc: {
          ru: 'Как последовательно проговорить плюсы по точкам A, E, C, B, G, J, D — и почему это самый важный шаг.',
          en: 'How to work through the pluses point by point — A, E, C, B, G, J, D — and why this is the most important step.',
          pl: 'Jak po kolei omówić plusy po punktach A, E, C, B, G, J, D — i dlaczego to najważniejszy krok.',
        },
        html: {
          ru:
            '<h2>Глава 2. Демонстрация: плюсы на реальном тесте</h2>' +
            '<p>Покажем это на примере. Вот тест — мы ориентируемся, смотрим, что высоко, а что низко, — и начинаем шаг 2b.</p>' +
            '<p>Я бы начал с точки A: «ты внимательный, можешь концентрироваться, хорошо планируешь и организуешь, умеешь надеть маску и знаешь, как ответить». Если рядом видна педантичность — «ты аккуратный, у тебя порядок даже в мелочах; при такой педантичности можно быть уверенным, что ничего не потеряется». Дальше — точка E: «у тебя столько энергии, что тебя тянет к новому; даже если ты начинаешь скучать без нового, ты не жалеешь энергии, любишь её жечь; ты инициативный». Затем C: «ты спокойно держишь себя в руках, почти не взрываешься, но при этом не пытаешься всё контролировать — даёшь потоку вытекать». И B: «ты видишь решения, ты ориентирован на исходящий поток, тебе не всё равно, чем заниматься, ты любишь достойные начинания и видишь всю картину». Потом G: «ты по-настоящему крутой, внутри у тебя стальной стержень; те, кто принимал твою внешнюю мягкость за слабость, обломали об тебя руку; мало кто видел, как ты убегаешь с зажмуренными глазами — думаю, никто; а когда в жизни что-то не так, ты не ищешь виноватых — ты знаешь, что быстрее всего подойти к зеркалу». И тут же — B как лояльность: «ты лояльный, в тяжёлой ситуации на тебя можно положиться». Затем J: «тебе легко познакомиться и войти в контакт, ты хорошо продвигаешь — в том числе на исходящем потоке, но можешь и промолчать; ты можешь и говорить, и слушать». И D: «ты надёжный, ты не бьёшь сюрпризами, люди знают, чего от тебя ждать». А вот чувствительность на этом тесте я оставлю на конец: она сочетается с самой низкой точкой (низкой правильностью оценки) — это больное место, и, начав о ней, я сразу окажусь в разговоре о минусах.</p>' +
            '<p>Заметьте несколько вещей. Во-первых, порядок гибкий: начать с A и E или, наоборот, с D, E, F — совершенно неважно. Во-вторых, работает правило «что торчит, то и плюс»: если у человека торчат, скажем, четыре точки — это уже четыре плюса, а по остальным шести можно говорить о плюсах низкой точки. В-третьих, срезаем мы только компульсивные точки (некомпульсивную не срезаем никогда).</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Даже если бы вся оценка состояла только из шага 1 (вы вошли в контакт), шага 2a (вы разрядили и рассказали, что показывает тест) и шага 2b (вы долго и подробно похвалили за конкретные плюсы) — и на этом «спасибо, до свидания» — люди были бы очень довольны, а польза была бы огромной. Ведь людей у нас слишком мало хвалят, а если и хвалят, то общими словами, а не за конкретику. Поэтому не халтурьте на шаге 2b: для этого человека всё это в первый раз, и вы попадаете не в бровь, а в глаз. Это самый важный шаг.', true)) +
            '<p>По дороге через плюсы полезно вплетать и вовлечённость: «я позабочусь, чтобы у тебя всегда было что-то новое — только продолжай давать результаты». А ещё встречаются близкие синдромы, которые важно не спутать: чтобы говорить о синдроме неэффективности, разница между точками должна быть значимой (не меньше пятнадцати пунктов; разница в пять пунктов — это «на одном уровне»). А о синдроме лени плюс подаётся так: «ты знаешь, что способен на большее»; и руководителю такого сотрудника стоит посоветовать поработать над его мотивацией — зацепить интерес, поставить рядом более сильного сотрудника или придумать игру с призом, которая его вовлечёт.</p>',
          en:
            '<h2>Chapter 2. Demonstration: the pluses on a real test</h2>' +
            '<p>Let us show this by an example. Here is a test — we get our bearings, look at what is high and what is low — and we begin step 2b.</p>' +
            '<p>I would begin with point A: "you\'re attentive, you can concentrate, you plan and organize well, you can put on a mask and know how to answer." If pedantry is visible alongside — "you\'re neat, you have order even in the little things; with such pedantry one can be sure that nothing will get lost." Next — point E: "you have so much energy that you\'re drawn to the new; even if you start getting bored without the new, you don\'t spare your energy, you like to burn it; you take initiative." Then C: "you calmly keep yourself in hand, you hardly ever explode, but at the same time you don\'t try to control everything — you let the flow flow out." And B: "you see solutions, you\'re oriented toward the outflow, you\'re not indifferent to what you occupy yourself with, you like worthy undertakings and see the whole picture." Then G: "you\'re really strong, you have a steel core inside; those who took your outward softness for weakness hurt their hand on you; few have seen you run away with your eyes shut — I think no one has; and when something in life is off, you don\'t look for the guilty — you know that the quickest thing is to step up to the mirror." And right here — B as loyalty: "you\'re loyal, in a hard situation you can be relied upon." Then J: "it\'s easy for you to get acquainted and make contact, you promote well — including on the outflow — but you can also keep silent; you can both speak and listen." And D: "you\'re reliable, you don\'t strike with surprises, people know what to expect of you." But sensitivity on this test I will leave for the end: it is combined with the lowest point (a low correctness of evaluation) — this is a sore spot, and, having started on it, I will at once find myself in the conversation about minuses.</p>' +
            '<p>Note several things. First, the order is flexible: to begin with A and E or, conversely, with D, E, F — is completely unimportant. Second, the rule "whatever sticks out is a plus" applies: if a person has, say, four points sticking out — that\'s already four pluses, and for the remaining six one can speak about the pluses of a low point. Third, we trim only compulsive points (a non-compulsive one we never trim).</p>' +
            k('KEY IDEA',
              bp('Even if the whole assessment consisted only of step 1 (you made contact), step 2a (you handled things and explained what the test shows), and step 2b (you praised at length and in detail for concrete pluses) — and with that, "thank you, goodbye" — people would be very pleased, and the benefit would be enormous. For people are praised too little among us, and if they are praised, it is in general terms and not for something concrete. That is why do not do a slapdash job at step 2b: for this person all of this is for the first time, and you hit not the eyebrow but the eye. This is the most important step.', true)) +
            '<p>Along the way through the pluses, it is useful to weave in engagement too: "I\'ll see to it that you always have something new — just keep delivering results." And there are also similar syndromes that it is important not to confuse: to speak of the syndrome of ineffectiveness, the difference between the points must be significant (no less than fifteen points; a difference of five points is "on the same level"). And regarding the syndrome of laziness, the plus is presented like this: "you know that you\'re capable of more"; and it is worth advising the manager of such an employee to work on his motivation — to hook his interest, to place a stronger employee beside him, or to devise a game with a prize that will engage him.</p>',
          pl:
            '<h2>Rozdział 2. Demonstracja: plusy na realnym teście</h2>' +
            '<p>Pokażmy to na przykładzie. Oto test — oswajamy się, patrzymy, co jest wysoko, co nisko — i zaczynamy krok 2b.</p>' +
            '<p>Zacząłbym od punktu A: „jesteś uważny, umiesz się skoncentrować, dobrze planujesz i organizujesz, umiesz założyć maskę i wiesz, jak odpowiedzieć”. Jeśli obok widać pedanterię — „jesteś schludny, masz porządek nawet w drobiazgach; przy takiej pedanterii można być pewnym, że nic się nie zgubi”. Dalej — punkt E: „masz tyle energii, że ciągnie cię w nowe; nawet jeśli zaczynasz się nudzić bez nowego, nie żałujesz energii, lubisz ją spalać; jesteś inicjatywny”. Następnie C: „spokojnie trzymasz się w garści, prawie nie wybuchasz, ale przy tym nie próbujesz wszystkiego kontrolować — dajesz przepływowi utekać”. I B: „widzisz rozwiązania, jesteś nastawiony na przepływ wychodzący, nie jest ci obojętne, czym się zajmować, lubisz godne sprawy i widzisz cały obraz”. Potem G: „jesteś naprawdę klasowy, w środku masz stalowy rdzeń; ci, którzy brali twoją zewnętrzną miękkość za słabość, odbili sobie o ciebie rękę; mało kto widział, jak uciekasz z zaciśniętymi oczami — myślę, że nikt; a gdy w życiu coś jest nie tak, nie szukasz winnych — wiesz, że najszybciej jest podejść do lustra”. Tu też — B jako lojalność: „jesteś lojalny, w ciężkiej sytuacji można na tobie polegać”. Następnie J: „łatwo ci się poznać i wejść w kontakt, dobrze promujesz — i na przepływie wychodzącym, a możesz i przemilczeć; możesz i mówić, i słuchać”. I D: „jesteś niezawodny, nie zaskakujesz niespodziankami, ludzie wiedzą, czego się po tobie spodziewać”. A oto wrażliwość na tym teście odłożę na koniec: jest połączona z najniższym punktem (niską poprawnością oceny) — to bolesne miejsce, i zacząwszy o niej, od razu znajdę się w rozmowie o minusach.</p>' +
            '<p>Zwróćcie uwagę na kilka rzeczy. Po pierwsze, kolejność jest elastyczna: zacząć od A i E albo, przeciwnie, od D, E, F — zupełnie nieważne. Po drugie, działa zasada „co sterczy, to i plus”: jeśli u człowieka sterczą, powiedzmy, cztery punkty — to już cztery plusy, a co do pozostałych sześciu można mówić o plusach niskiego punktu. Po trzecie, obcinamy tylko punkty kompulsywne (niekompulsywnego nie obcinamy nigdy).</p>' +
            k('KLUCZOWA MYŚL',
              bp('Nawet gdyby cała ocena składała się tylko z kroku 1 (weszliście w kontakt), kroku 2a (rozładowaliście i opowiedzieliście, co pokazuje test) i kroku 2b (długo i szczegółowo pochwaliliście za konkretne plusy) — i na tym „dziękuję, do widzenia” — ludzie byliby bardzo zadowoleni, a pożytek byłby ogromny. Ludzi u nas przecież za mało chwali się, a jeśli i chwali, to ogólnymi słowami, a nie za konkret. Dlatego nie fuszerujcie na kroku 2b: dla tego człowieka to wszystko jest po raz pierwszy, i trafiacie nie w brew, lecz w oko. To i jest najważniejszy krok.', true)) +
            '<p>Po drodze przez plusy pożytecznie jest wplatać i zaangażowanie: „zadbam, żebyś zawsze miał coś nowego — tylko dawaj dalej wyniki”. A jeszcze zdarzają się bliskie syndromy, których ważne jest nie pomylić: żeby mówić o syndromie nieefektywności, różnica między punktami musi być znacząca (nie mniejsza niż piętnaście punktów; różnica pięciu punktów to „na jednym poziomie”). A o syndromie lenistwa plus podaje się tak: „wiesz, że stać cię na więcej”; i kierownikowi takiego pracownika warto poradzić, żeby pracował nad jego motywacją — wziąć na zainteresowanie, postawić obok silniejszego pracownika albo wymyślić grę z nagrodą, która go wciągnie.</p>',
        },
      },

      // 3 — ОСОБЫЙ СЛУЧАЙ: ОЧЕНЬ СЛАБЫЙ ТЕСТ ПРОДУКТИВНОГО СОТРУДНИКА
      {
        id: 'weak-productive',
        title: {
          ru: 'Особый случай: очень слабый тест продуктивного сотрудника',
          en: 'A special case: a very weak test of a productive employee',
          pl: 'Szczególny przypadek: bardzo słaby test produktywnego pracownika',
        },
        desc: {
          ru: 'Почему нельзя тестировать непродуктивных, а слабый тест продуктивного — это огромный плюс («плотник с молотком и топором»).',
          en: 'Why one must not test unproductive employees, and why a weak test of a productive one is an enormous plus (the "carpenter with a hammer and an axe").',
          pl: 'Dlaczego nie wolno testować nieproduktywnych, a słaby test produktywnego to ogromny plus („cieśla z młotkiem i siekierą”).',
        },
        html: {
          ru:
            '<h2>Глава 3. Особый случай: очень слабый тест продуктивного сотрудника</h2>' +
            '<p>Отдельно — очень слабый тест. Если человек при этом не имеет продуктов, такой тест буквально убивает надежду. Именно поэтому не стоит тестировать непродуктивных сотрудников: тест убьёт надежду, а уволить человека вы всё равно потом уволите — и все решат, что уволили «за тест».</p>' +
            '<p>А вот если сотрудник со слабым тестом всё-таки продуктивен — это огромный плюс: значит, он и есть тот самый плотник, который строит дома молотком, топором и отвёрткой. При таком тесте особенно тщательно делайте шаг 2a: объясните, что показывает тест, и прямо скажите ему, что он и есть тот плотник, а плотник, который строит дома простым инструментом, вызывает уважение, благодарность и желание помочь. Низких точек не бойтесь: человек ведь не понимает, что низкая точка означает «нет внимания» или «мало знает» — он просто видит, что что-то у него «торчит». «Смотри: у тебя есть молоток, топор и отвёртка, и ты строишь дома».</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Твёрдое предупреждение: не пытайтесь «спасать» непродуктивных людей и людей с совсем тяжёлыми тестами. Это благородная, но совершенно другая область (зависимости, депрессия и тому подобное), она не входит в задачи технологии найма, и без специальной подготовки туда лучше не лезть — это может обернуться проблемами и для вас. Достаточно сказать, что после неосторожного разговора человек может, например, решить развестись, а последствия (вплоть до суда или публикаций в прессе) прилетят и к вам, и к компании. Ваша задача — практическая польза, а не спасение людей с большими несчастьями.', true)),
          en:
            '<h2>Chapter 3. A special case: a very weak test of a productive employee</h2>' +
            '<p>Separately — a very weak test. If, on top of that, the person has no products, such a test literally kills hope. It is precisely for this reason that one should not test unproductive employees: the test will kill hope, and you will fire the person afterward all the same — and everyone will decide that he was fired "for the test."</p>' +
            '<p>But if an employee with a weak test is nonetheless productive — this is an enormous plus: it means he is that very carpenter who builds houses with a hammer, an axe, and a screwdriver. With such a test, do step 2a especially carefully: explain what the test shows, and tell him directly that he is that carpenter, and that a carpenter who builds houses with simple tools inspires respect, gratitude, and a desire to help. Do not be afraid of the low points: the person, after all, does not understand that a low point means "no attention" or "knows little" — he simply sees that something of his "sticks out." "Look: you have a hammer, an axe, and a screwdriver, and you build houses."</p>' +
            k('KEY IDEA',
              bp('A firm warning: do not try to "save" unproductive people and people with truly heavy tests. This is a noble but entirely different area (addictions, depression, and the like), it is not part of the tasks of the hiring technology, and without special training it is better not to get into it — it may turn into problems for you as well. Suffice it to say that after a careless conversation a person may, for example, decide to get divorced, and the consequences (up to and including a court case or publications in the press) will land on you and the company too. Your task is practical benefit, not the saving of people with great misfortunes.', true)),
          pl:
            '<h2>Rozdział 3. Szczególny przypadek: bardzo słaby test produktywnego pracownika</h2>' +
            '<p>Osobno — bardzo słaby test. Jeśli człowiek przy tym nie ma produktów, taki test dosłownie zabija nadzieję. Właśnie dlatego nie warto testować nieproduktywnych pracowników: test nadzieję zabije, a zwolnić człowieka i tak potem zwolnicie — i wszyscy uznają, że zwolniono „za test”.</p>' +
            '<p>A oto jeśli pracownik ze słabym testem jednak jest produktywny — to ogromny plus: znaczy, że on i jest tym samym cieślą, który buduje domy młotkiem, siekierą i śrubokrętem. Przy takim teście szczególnie starannie róbcie krok 2a: objaśnijcie, co pokazuje test, i wprost powiedzcie mu, że on i jest tym cieślą, a cieśla, który buduje domy prostym narzędziem, budzi szacunek, wdzięczność i chęć pomocy. Niskich punktów się nie bójcie: człowiek przecież nie rozumie, że niski punkt oznacza „brak uwagi” albo „mało wie” — po prostu widzi, że coś mu „sterczy”. „Popatrz: masz młotek, siekierę i śrubokręt, i budujesz domy”.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Twarde ostrzeżenie: nie próbujcie „ratować” nieproduktywnych ludzi i ludzi z zupełnie ciężkimi testami. To szlachetny, ale zupełnie inny obszar (uzależnienia, depresja i tym podobne), nie wchodzi on w zadania technologii rekrutacji, i bez specjalnego przygotowania lepiej tam nie wchodzić — może to obrócić się problemami i dla was. Wystarczy powiedzieć, że po nieostrożnej rozmowie człowiek może na przykład postanowić się rozwieść, a następstwa (aż po sąd czy publikacje w prasie) przylecą i do was, i do firmy. Waszym zadaniem jest praktyczny pożytek, a nie ratowanie ludzi z wielkimi nieszczęściami.', true)),
        },
      },

      // 4 — ПЕРЕХОД К ШАГАМ 3 И 4; ПРАВИЛО «СМАЗКИ»
      {
        id: 'transition-minuses',
        title: {
          ru: 'Переход к шагам 3 и 4; правило «смазки»',
          en: 'The transition to steps 3 and 4; the "lubrication" rule',
          pl: 'Przejście do kroków 3 i 4; zasada „smarowania”',
        },
        desc: {
          ru: 'Аналогия с фундаментом, принцип постепенности и правило «смазки»: пара фраз о плюсе перед каждым минусом.',
          en: 'The foundation analogy, the principle of graduality, and the "lubrication" rule: a couple of phrases about a plus before each minus.',
          pl: 'Analogia z fundamentem, zasada stopniowości i zasada „smarowania”: para zdań o plusie przed każdym minusem.',
        },
        html: {
          ru:
            '<h2>Глава 4. Переход к шагам 3 и 4: разговор о минусах</h2>' +
            '<p>Разберём, как переходить к минусам. Здесь уместна аналогия со стройкой. Дилетант, думая о доме, спорит, где сделать комнату и где пространство в два этажа; а профессионал-строитель прежде всего думает о фундаменте и коммуникациях — чтобы дом не «поплыл» и стены не потрескались. Всё остальное — детали. Так вот, фундамент и коммуникации — это шаг 2 (2a и 2b), а всё остальное — уже мелочь.</p>' +
            '<p>Главная задача — чтобы человек просто посмотрел: если он посмотрит, то с высокой вероятностью увидит для себя что-то полезное. Но посмотрит он только в том случае, если вы хорошо сделали шаги 2a и 2b. Сделаете плохо — не посмотрит, и всё будет бесполезно.</p>' +
            '<p>И ещё: если на шаге 2b мы старались сказать обо всех плюсах, то на шагах 3 и 4 мы не говорим обо всех минусах. Такой задачи нет. Наша задача — усилить человека по принципу постепенности: хоть в чём-то усилить — уже хорошо.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Правило «смазки»: пара фраз о плюсе перед каждым минусом',
              bp('Важнейшее правило, которое стоит поместить в рамку. Когда на шаге 3 вы начинаете говорить о какой-то точке (а на шаге 3 вы говорите только о низкой или компульсивной точке — о хорошей речи нет), в этот самый момент сделайте пару шагов назад и сначала повторите по этой же точке несколько фраз из шага 2b — даже если вы уже говорили о ней раньше. Например, о низкой правильности оценки вы уже сказали на 2b: «ты хорошо видишь минусы, ты хорошо работаешь с техникой». Переходя к минусу этой точки, вы снова начинаете с этого — и только потом: «но этот подход ты переносишь и на людей, в них ты тоже ищешь минусы». Это как смазка для двигателя: масло нужно, чтобы ничто не заклинило и не повредилось. Всегда, начиная разговор о минусе, сначала скажите пару фраз о плюсе той же точки.', true)),
          en:
            '<h2>Chapter 4. The transition to steps 3 and 4: the conversation about minuses</h2>' +
            '<p>Let us examine how to move on to the minuses. Here an analogy with construction is fitting. A dilettante, thinking about a house, argues about where to put a room and where a double-height space; whereas a professional builder thinks first of all about the foundation and the utilities — so that the house does not "float away" and the walls do not crack. Everything else is details. Well then, the foundation and the utilities are step 2 (2a and 2b), and everything else is already a trifle.</p>' +
            '<p>The main task is for the person simply to look: if he looks, then with high probability he will see something useful for himself. But he will look only if you did steps 2a and 2b well. Do them badly — and he will not look, and everything will be useless.</p>' +
            '<p>And one more thing: whereas at step 2b we tried to speak about all the pluses, at steps 3 and 4 we do not speak about all the minuses. There is no such task. Our task is to strengthen the person by the principle of graduality: to strengthen him even in some one thing is already good.</p>' +
            k('KEY IDEA · The "lubrication" rule: a couple of phrases about a plus before each minus',
              bp('A most important rule, which is worth putting in a frame. When at step 3 you begin to speak about some point (and at step 3 you speak only about a low or compulsive point — a good one is out of the question), at that very moment take a couple of steps back and first repeat, on that same point, a few phrases from step 2b — even if you already spoke about it earlier. For example, about a low correctness of evaluation you already said at 2b: "you see minuses well, you work well with machinery." Moving on to the minus of this point, you again begin with this — and only then: "but this approach you carry over to people too, at them you also look for minuses." It is like a lubricant for an engine: oil is needed so that nothing seizes up and gets damaged. Always, when beginning a conversation about a minus, first say a couple of phrases about the plus of the same point.', true)),
          pl:
            '<h2>Rozdział 4. Przejście do kroków 3 i 4: rozmowa o minusach</h2>' +
            '<p>Omówmy, jak przechodzić do minusów. Tu na miejscu jest analogia z budownictwem. Dyletant, myśląc o domu, spiera się, gdzie zrobić pokój i gdzie przestrzeń o podwójnej wysokości; a profesjonalista-budowlaniec przede wszystkim myśli o fundamencie i instalacjach — żeby dom nie „popłynął” i ściany nie pękły. Cała reszta to detale. Otóż fundament i instalacje to krok 2 (2a i 2b), a cała reszta to już drobiazg.</p>' +
            '<p>Głównym zadaniem jest, żeby człowiek po prostu popatrzył: jeśli popatrzy, to z dużym prawdopodobieństwem zobaczy dla siebie coś pożytecznego. Ale popatrzy tylko w tym przypadku, jeśli dobrze zrobiliście kroki 2a i 2b. Zrobicie źle — nie popatrzy, i wszystko będzie bezużyteczne.</p>' +
            '<p>I jeszcze: jeśli na kroku 2b staraliśmy się powiedzieć o wszystkich plusach, to na krokach 3 i 4 nie mówimy o wszystkich minusach. Takiego zadania nie ma. Naszym zadaniem jest wzmocnić człowieka na zasadzie stopniowości: choć w czymś wzmocnić — już dobrze.</p>' +
            k('KLUCZOWA MYŚL · Zasada „smarowania”: para zdań o plusie przed każdym minusem',
              bp('Najważniejsza zasada, którą warto umieścić w ramce. Gdy na kroku 3 zaczynacie mówić o jakimś punkcie (a na kroku 3 mówicie tylko o niskim albo kompulsywnym punkcie — o dobrym mowy nie ma), w tym samym momencie zróbcie parę kroków wstecz i najpierw powtórzcie co do tego samego punktu kilka zdań z kroku 2b — nawet jeśli już o nim mówiliście wcześniej. Na przykład o niskiej poprawności oceny powiedzieliście już na 2b: „dobrze widzisz minusy, dobrze pracujesz z techniką”. Przechodząc do minusu tego punktu, znów zaczynacie od tego — i dopiero potem: „ale to podejście przenosisz i na ludzi, im też patrzysz w minusy”. To jak smar do silnika: olej jest potrzebny, żeby nic się nie zacięło i nie uszkodziło. Zawsze, zaczynając rozmowę o minusie, najpierw powiedzcie parę zdań o plusie tego samego punktu.', true)),
        },
      },

      // 5 — ТОЧКА D НА ШАГАХ 3 И 4 (ДЕМОНСТРАЦИЯ РАЗГОВОРА О МИНУСАХ)
      {
        id: 'point-d-demo',
        title: {
          ru: 'Точка D на шагах 3 и 4 (демонстрация разговора о минусах)',
          en: 'Point D in steps 3 and 4 (a demonstration of the conversation about minuses)',
          pl: 'Punkt D na krokach 3 i 4 (demonstracja rozmowy o minusach)',
        },
        desc: {
          ru: 'Разворот упрямства при компульсивной D, «весы изменений», обходы — и что советовать человеку с низкой D.',
          en: 'Reversing stubbornness with a compulsive D, the "scales of change," bypasses — and what to advise a person with a low D.',
          pl: 'Odwrócenie uporu przy kompulsywnym D, „waga zmian”, obejścia — i co doradzać człowiekowi z niskim D.',
        },
        html: {
          ru:
            '<h2>Глава 5. Точка D на шагах 3 и 4 (демонстрация разговора о минусах)</h2>' +
            '<p>Покажем шаги 3 и 4 на точке D.</p>' +
            '<p>Если D компульсивная (то есть «торчит» на 25–30 пунктов над остальными), в игру вступает приём «разворот упрямства», который мы разбирали: «что бы я тебе ни сказал, ты скажешь, что знаешь и всё равно не изменишься; так зачем нам терять время?» Если он соглашается — «вот именно поэтому нет смысла делать оценку, пока что». Если возражает «нет, я изменюсь» — «не изменишься» — «изменюсь» — «ну, тогда попробуй».</p>' +
            '<p>Если D низкая (а низкой она считается уже с 31), поступаем по общему правилу — сначала пара фраз о плюсе: «ты любишь новое, ты не любишь рутину». Он соглашается — и мы переходим к минусу. А этот минус, особенно если перед вами руководитель, едва ли не самый важный для бизнеса.</p>' +
            '<p>Суть минуса: человек вводит своих сотрудников в замешательство. То количество изменений, которое комфортно для него, для большинства сотрудников — сильный перебор; а если на тесте ещё и высокая активность, то он делает всё это быстро. Это стоит показать прямо: «вот твои сотрудники, а вот ты; ты говоришь «идём сюда», они тронулись — а тебе уже пришла новая идея, и ты машешь: «нет, туда»; этот развернулся, тот остановился, а у тебя уже третья идея». Чем выше активность и ниже D, тем тяжелее это для людей: они чувствуют себя растерянными, как будто стоят на цыпочках, и иногда вздрагивают от одной твоей улыбки — ведь улыбаешься ты обычно новой идее. Отсюда первый практический совет (уже на шаге 4), полушутливый, но полезный: «не улыбайся при подчинённых» — иначе, увидев улыбку, они понимают, что сейчас всё снова изменится.</p>' +
            '<p>Дальше можно копнуть глубже — о «весах изменений». Меняться надо, всё вокруг меняется; и перед каждым изменением человек как бы взвешивает плюсы и минусы. Но у человека с низкой D на чашу «изменений» уже заранее подложена гирька — он просто любит изменения; а самое главное, на чашу минусов он не кладёт то самое замешательство, которое его изменения вызывают у людей. Стоит убрать эту гирьку и положить на минусы замешательство — и в большинстве случаев окажется, что сворачивать вовсе не нужно: лучше дойти туда, куда люди уже направились, а потом спокойно решать. И чем больше людей за ним идёт, тем это важнее (на маленьком катере можно и резко свернуть, а когда за тобой двести человек — уже нет). Главная мысль, которую надо донести: люди все разные, и ошибка человека с низкой D в том, что он думает, будто все такие же, как он.</p>' +
            '<p>Второй большой минус низкой D — обходы. В любой организации есть стандартные маршруты для разных дел: письма отправляет секретарь, недовольного клиента разряжает менеджер, продавец продаёт. Всё это должно происходить единообразно — только тогда организация может расти. А у человека с низкой D, стоит ему пару раз сделать что-то одинаково, это превращается в рутину, и возникает естественное желание сделать иначе — и, делая иначе, он обходит того, через кого дело должно было пройти. Обход — это когда кто-то без ведома человека вторгается в область, за которую тот отвечает; и каждый такой обход ведёт к расстройствам и конфликтам. Совет прост: «не обходи, нравится тебе это или нет». Ведь низкая D, по сути, враг администрирования: из-за неё организация получает меньше денег. Тот, кто должен делать что-то постоянно, делает это лучше всех; а если он перегружен, правильное решение — не спихивать дело обходом через другой отдел, а нанять ему помощника в его же отдел. У руководителя обходы ведут ещё и к тому, что у людей опускаются руки («ну тогда сам и делай») — и он в итоге работает за них.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Точка D: что советовать (шаг 4)',
              bp('Практические советы для человека с низкой D: не улыбаться при подчинённых; при взвешивании изменений — осознанно класть на чашу минусов то замешательство, которое изменения вызывают у людей; и не обходить установленные маршруты и структуру. Ещё один важный совет — обучение: точка D поднимается знаниями. Чем лучше человек знает своё дело, тем предсказуемее он в нём действует (мечутся обычно менее компетентные), поэтому в первую очередь дайте ему профессиональные знания; а чтобы он вёл себя предсказуемее и с людьми, стоит научить его пониманию людей и жизни.', false) +
              bp('Два предупреждения насчёт тона. Сильные, жёсткие формулировки («это реально вредит, из-за этого компания получает меньше денег») уместны только при высокой ответственности; если ответственность низкая — их надо убрать. И никогда не называйте это «низкой точкой D» в лицо: для человека это непонятный термин — говорите «с твоей непредсказуемостью» или «с твоей импульсивностью». И, само собой, весь этот разговор о минусах ведётся только после хорошо сделанного шага 2b — когда человек уже знает, что вы ему друг, и слушает спокойно и расслабленно, не ожидая, что вы надавите на больное место.', true)),
          en:
            '<h2>Chapter 5. Point D in steps 3 and 4 (a demonstration of the conversation about minuses)</h2>' +
            '<p>Let us show steps 3 and 4 on point D.</p>' +
            '<p>If D is compulsive (that is, "sticks up" 25–30 points above the rest), the "reversing the stubbornness" technique that we examined comes into play: "whatever I tell you, you\'ll say you know it and won\'t change anyway; so why should we waste time?" If he agrees — "that\'s exactly why there\'s no point in doing an assessment, for now." If he objects "no, I will change" — "you won\'t change" — "I will change" — "well, then try."</p>' +
            '<p>If D is low (and it is considered low already from 31 on), we proceed by the general rule — first a couple of phrases about a plus: "you like the new, you don\'t like routine." He agrees — and we move on to the minus. And this minus, especially if a manager is in front of you, is well-nigh the most important for business.</p>' +
            '<p>The essence of the minus: the person throws his employees into confusion. The amount of change that is comfortable for him is, for most employees, far too much; and if there is also high activity on the test, then he does all of this quickly. This is worth showing directly: "here are your employees, and here are you; you say \'we\'re going here,\' they set off — but you\'ve already had a new idea, and you wave: \'no, over there\'; this one turned, that one stopped, and you already have a third idea." The higher the activity and the lower the D, the harder this is for people: they feel bewildered, as if they are standing on tiptoe, and sometimes they flinch at a single smile from you — because you usually smile at a new idea. Hence the first practical piece of advice (already at step 4), half in jest but useful: "don\'t smile in front of subordinates" — otherwise, on seeing a smile, they understand that everything is about to change again.</p>' +
            '<p>Further, one can dig deeper — about the "scales of change." One has to change, everything around is changing; and before each change a person, as it were, weighs the pluses and minuses. But a person with a low D already has a little weight placed in advance on the "change" pan — he simply likes changes; and, most importantly, on the minuses pan he does not put that very confusion that his changes cause in people. It is worth removing this weight and putting the confusion on the minuses — and in most cases it will turn out that there is no need to turn at all: better to reach the place where the people have already headed, and then calmly decide. And the more people follow him, the more important this is (on a small motorboat one can turn sharply, but when there are two hundred people behind you — no longer). The main thought that must be conveyed: all people are different, and the mistake of a person with a low D is that he thinks everyone is the same as he is.</p>' +
            '<p>The second big minus of a low D is bypasses. In any organization there are standard routes for various matters: letters are sent by the secretary, a dissatisfied client is handled by the manager, a salesperson sells. All of this must happen uniformly — only then can the organization grow. But with a person who has a low D, as soon as he does something the same way a couple of times, it turns into routine, and a natural desire arises to do it differently — and, doing it differently, he bypasses the one through whom the matter was supposed to pass. A bypass is when someone, without the person\'s knowledge, intrudes into an area for which that person is responsible; and every such bypass leads to upsets and conflicts. The advice is simple: "don\'t bypass, whether you like it or not." For a low D is, in essence, the enemy of administration: because of it the organization gets less money. The one who is supposed to do something constantly does it best of all; and if he is overloaded, the correct solution is not to shove the matter off, via a bypass, through another department, but to hire him an assistant in his own department. With a manager, bypasses lead also to people\'s giving up ("fine, do it yourself, then") — and he ends up doing their work.</p>' +
            t('APPLICATION IN HIRING · Point D: what to advise (step 4)',
              bp('Practical advice for a person with a low D: not to smile in front of subordinates; when weighing changes, to consciously place on the minuses pan the confusion that changes cause in people; and not to bypass the established routes and structure. One more important piece of advice — training: point D is raised by knowledge. The better a person knows his job, the more predictably he acts in it (it is usually the less competent who dart about), so first of all give him professional knowledge; and so that he behaves more predictably with people too, it is worth teaching him an understanding of people and of life.', false) +
              bp('Two warnings about tone. Strong, harsh formulations ("this really does harm, because of it the company gets less money") are appropriate only with high responsibility; if responsibility is low — they must be removed. And never call it a "low point D" to his face: for the person this is an incomprehensible term — say "with your unpredictability" or "with your impulsiveness." And, it goes without saying, this whole conversation about minuses is conducted only after a well-done step 2b — when the person already knows that you are his friend, and listens calmly and relaxed, not expecting you to press on a sore spot.', true)),
          pl:
            '<h2>Rozdział 5. Punkt D na krokach 3 i 4 (demonstracja rozmowy o minusach)</h2>' +
            '<p>Pokażmy kroki 3 i 4 na punkcie D.</p>' +
            '<p>Jeśli D jest kompulsywne (czyli „sterczy” o 25–30 punktów nad pozostałymi), w grę wchodzi chwyt „odwrócenie uporu”, który omawialiśmy: „cokolwiek bym ci powiedział, powiesz, że wiesz i i tak nie zmienisz; to po co mamy tracić czas?” Jeśli się zgadza — „właśnie dlatego nie ma sensu robić oceny, na razie”. Jeśli oponuje „nie, zmienię” — „nie zmienisz” — „zmienię” — „no, to spróbuj”.</p>' +
            '<p>Jeśli D jest niskie (a za niskie uważa się już od 31), postępujemy według ogólnej zasady — najpierw para zdań o plusie: „lubisz nowe, nie lubisz rutyny”. Zgadza się — i przechodzimy do minusu. A ten minus, szczególnie jeśli przed wami jest kierownik, jest bodaj najważniejszy dla biznesu.</p>' +
            '<p>Istota minusu: człowiek wprowadza swoich pracowników w zamęt. Ta ilość zmian, która jest komfortowa dla niego, dla większości pracowników jest silną przesadą; a jeśli na teście jest jeszcze i wysoka aktywność, to robi to wszystko szybko. Warto to wprost pokazać: „oto twoi pracownicy, a oto ty; mówisz «idziemy tu», ruszyli — a tobie już przyszła nowa idea, i machasz: «nie, tam»; ten się odwrócił, tamten się zatrzymał, a ty masz już trzecią ideę”. Im wyższa aktywność i niższe D, tym ciężej to dla ludzi: czują się roztrzęsieni, jakby stali na palcach, i czasem zaciskają oczy od jednego twojego uśmiechu — bo uśmiechasz się zwykle do nowej idei. Stąd pierwsza praktyczna rada (już na kroku 4), półżartobliwa, ale pożyteczna: „nie uśmiechaj się przy podwładnych” — inaczej, zobaczywszy uśmiech, rozumieją, że zaraz wszystko znów się zmieni.</p>' +
            '<p>Dalej można kopnąć głębiej — o „wadze zmian”. Zmieniać się trzeba, wszystko wokół się zmienia; i przed każdą zmianą człowiek jakby waży plusy i minusy. Ale u człowieka z niskim D na szalę „zmian” już z góry podłożono odważnik — po prostu lubi zmiany; a co najważniejsze, na szalę minusów nie kładzie tego samego zamętu, który jego zmiany wywołują u ludzi. Wystarczy usunąć ten odważnik i położyć na minusy zamęt — a w większości przypadków okaże się, że skręcać wcale nie trzeba: lepiej dojść tam, dokąd ludzie już się skierowali, a potem spokojnie decydować. I im więcej ludzi za nim idzie, tym to ważniejsze (na małym kutrze można i gwałtownie skręcać, a gdy za tobą jest dwustu ludzi — już nie). Główna myśl, którą trzeba przekazać: ludzie wszyscy są różni, i błąd człowieka z niskim D polega na tym, że myśli, jakoby wszyscy byli tacy sami jak on.</p>' +
            '<p>Drugi duży minus niskiego D to obejścia. W każdej organizacji są standardowe trasy dla różnych spraw: listy wysyła sekretarka, niezadowolonego klienta rozładowuje menedżer, sprzedawca sprzedaje. Wszystko to powinno odbywać się jednolicie — tylko wtedy organizacja może rosnąć. A u człowieka z niskim D, gdy tylko parę razy zrobi coś jednakowo, zamienia się to w rutynę, i powstaje naturalne pragnienie, żeby zrobić inaczej — i, robiąc inaczej, obchodzi tego, przez kogo sprawa miała przejść. Obejście to gdy ktoś bez wiedzy człowieka wtargnie w obszar, za który tamten odpowiada; i każde takie obejście prowadzi do rozstrojeń i konfliktów. Rada jest prosta: „nie obchodź, podoba ci się to czy nie”. Niskie D jest bowiem w istocie wrogiem administrowania: z jego powodu organizacja dostaje mniej pieniędzy. Ten, kto ma robić coś stale, robi to najlepiej ze wszystkich; a jeśli jest przeciążony, właściwym rozwiązaniem jest nie spychać sprawy obejściem przez inny dział, lecz zatrudnić mu asystenta do jego własnego działu. U kierownika obejścia prowadzą jeszcze i do tego, że u ludzi opadają ręce („no to rób sam”) — i on w efekcie pracuje za nich.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Punkt D: co doradzać (krok 4)',
              bp('Praktyczne rady dla człowieka z niskim D: nie uśmiechać się przy podwładnych; przy ważeniu zmian — świadomie kłaść na szalę minusów ten zamęt, który zmiany wywołują u ludzi; i nie obchodzić ustalonych tras i struktury. Jeszcze jedna ważna rada — szkolenie: punkt D podnosi się wiedzą. Im lepiej człowiek zna swoją sprawę, tym bardziej przewidywalnie w niej działa (miotają się zwykle mniej kompetentni), dlatego w pierwszej kolejności dajcie mu wiedzę zawodową; a żeby zachowywał się przewidywalniej i z ludźmi, warto go nauczyć rozumienia ludzi i życia.', false) +
              bp('Dwa ostrzeżenia co do tonu. Mocne, twarde sformułowania („to realnie szkodzi, z tego powodu firma dostaje mniej pieniędzy”) są na miejscu tylko przy wysokiej odpowiedzialności; jeśli odpowiedzialność jest niska — trzeba je usunąć. I nigdy nie nazywajcie tego „niskim punktem D” wprost: dla człowieka to niezrozumiały termin — mówcie „z twoją nieprzewidywalnością” albo „z twoją impulsywnością”. I, rzecz jasna, całą tę rozmowę o minusach prowadzi się tylko po dobrze zrobionym kroku 2b — gdy człowiek już wie, że jesteście mu przyjacielem, i słucha spokojnie i rozluźniony, nie oczekując, że naciśniecie na bolący odcisk.', true)),
        },
      },

      // 6 — ИТОГ: ЗАВЕРШЕНИЕ ЧАСТИ II
      {
        id: 'part2-summary',
        title: {
          ru: 'Итог: завершение Части II',
          en: 'Summary: the conclusion of Part II',
          pl: 'Podsumowanie: zakończenie Części II',
        },
        desc: {
          ru: 'Чем завершается методика оценки тестов (Часть II) и что ждёт впереди в Части III.',
          en: 'What concludes the methodology of assessing tests (Part II) and what awaits ahead in Part III.',
          pl: 'Czym kończy się metodyka oceny testów (Część II) i co czeka dalej w Części III.',
        },
        html: {
          ru:
            '<h2>Итог: завершение Части II</h2>' +
            '<p>На этом мы завершаем Часть II — методику оценки тестов. Дальше нас ждёт Часть III: сам «Тест инструментов» — его структура, точки и синдромы.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Мы разобрали, как на целом тесте выбирать и подавать плюсы (шаг 2b), как переходить к минусам (шаги 3 и 4) и что с ними делать — на примере точки D. Фундамент всего разговора — это шаги 2a и 2b: сделаете их хорошо, и человек посмотрит на минусы и увидит для себя полезное; сделаете плохо — всё будет бесполезно. И помните правило «смазки»: всегда начинайте разговор о минусе с пары фраз о плюсе той же точки.', true)),
          en:
            '<h2>Summary: the conclusion of Part II</h2>' +
            '<p>With this we conclude Part II — the methodology of assessing tests. Next awaits us Part III: the "Tools Test" itself — its structure, points, and syndromes.</p>' +
            k('KEY IDEA',
              bp('We have examined how to choose and present the pluses on a whole test (step 2b), how to move on to the minuses (steps 3 and 4), and what to do with them — using point D as an example. The foundation of the whole conversation is steps 2a and 2b: do them well, and the person will look at the minuses and see something useful for himself; do them badly, and everything will be useless. And remember the "lubrication" rule: always begin a conversation about a minus with a couple of phrases about the plus of the same point.', true)),
          pl:
            '<h2>Podsumowanie: zakończenie Części II</h2>' +
            '<p>Na tym kończymy Część II — metodykę oceny testów. Dalej czeka nas Część III: sam „Test Tools” — jego budowa, punkty i syndromy.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Omówiliśmy, jak na całym teście wybierać i podawać plusy (krok 2b), jak przechodzić do minusów (kroki 3 i 4) i co z nimi robić — na przykładzie punktu D. Fundamentem całej rozmowy są kroki 2a i 2b: zróbcie je dobrze, a człowiek popatrzy na minusy i zobaczy dla siebie coś pożytecznego; zróbcie źle — wszystko będzie bezużyteczne. I pamiętajcie o zasadzie „smarowania”: zawsze zaczynajcie rozmowę o minusie od pary zdań o plusie tego samego punktu.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Какова цель шага 2b на целом тесте?',
            en: 'What is the goal of step 2b on the whole test?',
            pl: 'Jaki jest cel kroku 2b na całym teście?',
          },
          opts: [
            {
              ru: 'добиться одного улучшения, но говорить при этом о как можно большем числе плюсов',
              en: 'to achieve one improvement, while speaking about as many pluses as possible',
              pl: 'osiągnąć jedno usprawnienie, ale mówić przy tym o jak największej liczbie plusów',
            },
            {
              ru: 'назвать все минусы сразу',
              en: 'to name all the minuses at once',
              pl: 'wymienić wszystkie minusy naraz',
            },
            {
              ru: 'обсудить только одну точку',
              en: 'to discuss only one point',
              pl: 'omówić tylko jeden punkt',
            },
            {
              ru: 'быстро закончить беседу',
              en: 'to finish the conversation quickly',
              pl: 'szybko zakończyć rozmowę',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'В каком порядке говорят о плюсах на шаге 2b?',
            en: 'In what order do you speak about the pluses at step 2b?',
            pl: 'W jakiej kolejności mówi się o plusach na kroku 2b?',
          },
          opts: [
            {
              ru: 'только о низких точках',
              en: 'only about the low points',
              pl: 'tylko o niskich punktach',
            },
            {
              ru: 'в случайном порядке',
              en: 'in random order',
              pl: 'w przypadkowej kolejności',
            },
            {
              ru: 'сначала плюсы высоких точек, потом плюсы низких; начиная с того, что очевидно и в чём вы сами уверены',
              en: 'first the pluses of the high points, then the pluses of the low ones; beginning with what is obvious and what you yourself are sure of',
              pl: 'najpierw plusy wysokich punktów, potem plusy niskich; zaczynając od tego, co oczywiste i czego sami jesteście pewni',
            },
            {
              ru: 'сначала о минусах',
              en: 'first about the minuses',
              pl: 'najpierw o minusach',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Ключевая идея: что можно сказать по тесту, знаете:',
            en: 'The key idea: what can be said about the test is known by:',
            pl: 'Kluczowa myśl: co można powiedzieć na podstawie testu, wie:',
          },
          opts: [
            {
              ru: 'все вокруг',
              en: 'everyone around',
              pl: 'wszyscy dookoła',
            },
            {
              ru: 'только вы сами (человек не знает, что вы «должны» сказать) — если по точке не уверены, просто не говорите о ней',
              en: 'only you yourself (the person does not know what you are "supposed" to say) — if you are not sure about a point, simply do not speak about it',
              pl: 'tylko wy sami (człowiek nie wie, co „powinniście" powiedzieć) — jeśli nie jesteście pewni punktu, po prostu o nim nie mówcie',
            },
            {
              ru: 'сам человек',
              en: 'the person himself',
              pl: 'sam człowiek',
            },
            {
              ru: 'любой коллега',
              en: 'any colleague',
              pl: 'każdy współpracownik',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'С каких точек обычно удобно начинать говорить о плюсах?',
            en: 'From which points is it usually convenient to begin speaking about the pluses?',
            pl: 'Od których punktów zwykle wygodnie jest zacząć mówić o plusach?',
          },
          opts: [
            {
              ru: 'с самых низких',
              en: 'from the very lowest',
              pl: 'od najniższych',
            },
            {
              ru: 'с точки D',
              en: 'from point D',
              pl: 'od punktu D',
            },
            {
              ru: 'с компульсивной чуткости',
              en: 'from compulsive sensitivity',
              pl: 'od kompulsywnej wrażliwości',
            },
            {
              ru: 'с очевидных — A (внимание, планирование) и E (энергия, инициатива), а также J, если оно высокое',
              en: 'from the obvious ones — A (attention, planning) and E (energy, initiative), as well as J, if it is high',
              pl: 'od oczywistych — A (uwaga, planowanie) i E (energia, inicjatywa), a także J, jeśli jest wysokie',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Почему компульсивную чуткость оставляют на конец шага 2b?',
            en: 'Why is compulsive sensitivity left for the end of step 2b?',
            pl: 'Dlaczego kompulsywną wrażliwość zostawia się na koniec kroku 2b?',
          },
          opts: [
            {
              ru: 'начав с неё (особенно при низком J или низкой H), сразу свалишься в разговор о минусах',
              en: 'starting with it (especially with a low J or low H), you immediately slide into a conversation about the minuses',
              pl: 'zaczynając od niej (zwłaszcza przy niskim J lub niskim H), od razu zsuniesz się w rozmowę o minusach',
            },
            {
              ru: 'потому что это высокая точка',
              en: 'because it is a high point',
              pl: 'ponieważ to wysoki punkt',
            },
            {
              ru: 'потому что о ней вообще нельзя говорить',
              en: 'because it must not be spoken about at all',
              pl: 'ponieważ w ogóle nie wolno o niej mówić',
            },
            {
              ru: 'потому что она неважна',
              en: 'because it is unimportant',
              pl: 'ponieważ jest nieważna',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Какие точки «обрезают» (не подают целиком как плюс)?',
            en: 'Which points do you "trim" (not present in full as a plus)?',
            pl: 'Które punkty „przycina się" (nie podaje w całości jako plus)?',
          },
          opts: [
            {
              ru: 'все низкие',
              en: 'all the low ones',
              pl: 'wszystkie niskie',
            },
            {
              ru: 'все высокие',
              en: 'all the high ones',
              pl: 'wszystkie wysokie',
            },
            {
              ru: 'только компульсивные (некомпульсивную не обрезают никогда)',
              en: 'only the compulsive ones (a non-compulsive one is never trimmed)',
              pl: 'tylko kompulsywne (niekompulsywnego nigdy się nie przycina)',
            },
            {
              ru: 'никакие',
              en: 'none',
              pl: 'żadnych',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Почему нельзя халтурить на шаге 2b?',
            en: 'Why must you not do a sloppy job at step 2b?',
            pl: 'Dlaczego nie wolno partaczyć na kroku 2b?',
          },
          opts: [
            {
              ru: 'он самый короткий',
              en: 'it is the shortest',
              pl: 'jest najkrótszy',
            },
            {
              ru: 'для этого человека всё это — впервые; вы «бьёте не в бровь, а в глаз»; это самый важный шаг',
              en: 'for this person all of this is happening for the first time; you "hit the nail on the head"; it is the most important step',
              pl: 'dla tego człowieka to wszystko dzieje się po raz pierwszy; „trafiacie w samo sedno"; to najważniejszy krok',
            },
            {
              ru: 'его требует закон',
              en: 'the law requires it',
              pl: 'wymaga tego prawo',
            },
            {
              ru: 'он второстепенный',
              en: 'it is secondary',
              pl: 'jest drugorzędny',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Насколько должна различаться пара точек, чтобы говорить о синдроме неэффективности?',
            en: 'By how much must a pair of points differ in order to speak of an inefficiency syndrome?',
            pl: 'O ile musi różnić się para punktów, żeby mówić o syndromie nieefektywności?',
          },
          opts: [
            {
              ru: 'достаточно любой разницы',
              en: 'any difference is enough',
              pl: 'wystarczy jakakolwiek różnica',
            },
            {
              ru: 'ровно на 5 пунктов',
              en: 'exactly by 5 points',
              pl: 'dokładnie o 5 punktów',
            },
            {
              ru: 'на 100 пунктов',
              en: 'by 100 points',
              pl: 'o 100 punktów',
            },
            {
              ru: 'не меньше чем на 15 пунктов (разница в 5 пунктов — это «на одном уровне»)',
              en: 'by no less than 15 points (a difference of 5 points is "on the same level")',
              pl: 'nie mniej niż o 15 punktów (różnica 5 punktów to „na tym samym poziomie")',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Как подают плюс при синдроме лени?',
            en: 'How is the plus presented in the case of a laziness syndrome?',
            pl: 'Jak podaje się plus przy syndromie lenistwa?',
          },
          opts: [
            {
              ru: '«ты знаешь, что способен на большее»; а руководителю советуют работать над мотивацией',
              en: '"you know that you are capable of more"; and the manager is advised to work on motivation',
              pl: '„wiesz, że stać cię na więcej"; a kierownikowi doradza się pracę nad motywacją',
            },
            {
              ru: '«ты ленивый»',
              en: '"you are lazy"',
              pl: '„jesteś leniwy"',
            },
            {
              ru: '«тебе ничего нельзя поручить»',
              en: '"nothing can be entrusted to you"',
              pl: '„nic nie można ci powierzyć"',
            },
            {
              ru: 'лучше промолчать',
              en: 'it is better to stay silent',
              pl: 'lepiej przemilczeć',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Как относиться к очень слабому, но продуктивному тесту?',
            en: 'How should you regard a very weak but productive test?',
            pl: 'Jak traktować bardzo słaby, ale produktywny test?',
          },
          opts: [
            {
              ru: 'сразу уволить человека',
              en: 'fire the person immediately',
              pl: 'od razu zwolnić człowieka',
            },
            {
              ru: 'это безнадёжный случай',
              en: 'it is a hopeless case',
              pl: 'to przypadek beznadziejny',
            },
            {
              ru: 'это огромный плюс: человек — «плотник, который строит дома молотком, топором и отвёрткой»',
              en: 'it is an enormous plus: the person is a "carpenter who builds houses with a hammer, an axe and a screwdriver"',
              pl: 'to ogromny plus: człowiek to „cieśla, który buduje domy młotkiem, siekierą i śrubokrętem"',
            },
            {
              ru: 'это ошибка теста',
              en: 'it is an error in the test',
              pl: 'to błąd testu',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Почему не стоит тестировать непродуктивных сотрудников?',
            en: 'Why should you not test unproductive employees?',
            pl: 'Dlaczego nie warto testować nieproduktywnych pracowników?',
          },
          opts: [
            {
              ru: 'тест слишком дорогой',
              en: 'the test is too expensive',
              pl: 'test jest zbyt drogi',
            },
            {
              ru: 'слабый тест убивает надежду, а уволить вы всё равно уволите — и все решат, что «за тест»',
              en: 'a weak test kills hope, and you will fire them anyway — and everyone will decide it was "because of the test"',
              pl: 'słaby test zabija nadzieję, a i tak zwolnicie — i wszyscy uznają, że „za test"',
            },
            {
              ru: 'они не умеют читать',
              en: 'they cannot read',
              pl: 'nie umieją czytać',
            },
            {
              ru: 'их тесты всегда высокие',
              en: 'their tests are always high',
              pl: 'ich testy są zawsze wysokie',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Стоит ли пытаться «спасать» людей с очень тяжёлыми тестами (зависимости, депрессия)?',
            en: 'Should you try to "save" people with very heavy tests (addictions, depression)?',
            pl: 'Czy warto próbować „ratować" ludzi z bardzo ciężkimi testami (uzależnienia, depresja)?',
          },
          opts: [
            {
              ru: 'да, это главная задача найма',
              en: 'yes, it is the main task of hiring',
              pl: 'tak, to główne zadanie rekrutacji',
            },
            {
              ru: 'да, всегда',
              en: 'yes, always',
              pl: 'tak, zawsze',
            },
            {
              ru: 'да, если тест низкий',
              en: 'yes, if the test is low',
              pl: 'tak, jeśli test jest niski',
            },
            {
              ru: 'нет: это благородная, но совсем другая область, не входящая в задачи технологии найма, — без спецподготовки туда лучше не лезть',
              en: 'no: it is a noble but entirely different field, not part of the tasks of the hiring technology — without special training it is better not to get into it',
              pl: 'nie: to szlachetna, ale zupełnie inna dziedzina, nienależąca do zadań technologii rekrutacji — bez specjalnego przygotowania lepiej się w to nie wdawać',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'В аналогии со строительством, что соответствует «фундаменту и коммуникациям»?',
            en: 'In the construction analogy, what corresponds to the "foundation and utilities"?',
            pl: 'W analogii z budową, co odpowiada „fundamentowi i instalacjom"?',
          },
          opts: [
            {
              ru: 'шаг 2 (2a и 2b) — а всё прочее уже мелочь',
              en: 'step 2 (2a and 2b) — and everything else is already a trifle',
              pl: 'krok 2 (2a i 2b) — a cała reszta to już drobiazg',
            },
            {
              ru: 'шаг 4',
              en: 'step 4',
              pl: 'krok 4',
            },
            {
              ru: 'выбор цвета стен',
              en: 'the choice of wall colour',
              pl: 'wybór koloru ścian',
            },
            {
              ru: 'разговор о минусах',
              en: 'the conversation about the minuses',
              pl: 'rozmowa o minusach',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Говорят ли на шагах 3 и 4 обо ВСЕХ минусах?',
            en: 'At steps 3 and 4, do you speak about ALL the minuses?',
            pl: 'Czy na krokach 3 i 4 mówi się o WSZYSTKICH minusach?',
          },
          opts: [
            {
              ru: 'да, обо всех обязательно',
              en: 'yes, about all of them without fail',
              pl: 'tak, o wszystkich obowiązkowo',
            },
            {
              ru: 'да, но только руководителю',
              en: 'yes, but only to the manager',
              pl: 'tak, ale tylko kierownikowi',
            },
            {
              ru: 'нет: задача — усилить человека по принципу постепенности (хоть в чём-то — уже хорошо)',
              en: 'no: the task is to strengthen the person on the principle of gradualness (even in something — is already good)',
              pl: 'nie: zadaniem jest wzmocnić człowieka na zasadzie stopniowości (choćby w czymś — już dobrze)',
            },
            {
              ru: 'да, если минусов немного',
              en: 'yes, if there are few minuses',
              pl: 'tak, jeśli minusów jest niewiele',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'В чём состоит правило «смазки»?',
            en: 'What does the "lubrication" rule consist of?',
            pl: 'Na czym polega zasada „smarowania"?',
          },
          opts: [
            {
              ru: 'хвалить человека после беседы',
              en: 'to praise the person after the conversation',
              pl: 'chwalić człowieka po rozmowie',
            },
            {
              ru: 'начиная разговор о минусе точки, сначала повторить пару фраз о плюсе той же точки',
              en: 'when beginning a conversation about a minus of a point, first repeat a couple of phrases about the plus of the same point',
              pl: 'zaczynając rozmowę o minusie punktu, najpierw powtórzyć parę zdań o plusie tego samego punktu',
            },
            {
              ru: 'говорить только о плюсах',
              en: 'to speak only about the pluses',
              pl: 'mówić tylko o plusach',
            },
            {
              ru: '«смазывать» формулировки лестью',
              en: 'to "lubricate" the wording with flattery',
              pl: '„smarować" sformułowania pochlebstwem',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какой приём применяют к компульсивной D на шагах 3–4?',
            en: 'What technique is applied to a compulsive D at steps 3–4?',
            pl: 'Jaką technikę stosuje się wobec kompulsywnego D na krokach 3–4?',
          },
          opts: [
            {
              ru: '«правило смазки»',
              en: 'the "lubrication rule"',
              pl: '„zasadę smarowania"',
            },
            {
              ru: '«ассист»',
              en: 'the "assist"',
              pl: '„asystę"',
            },
            {
              ru: 'молчание',
              en: 'silence',
              pl: 'milczenie',
            },
            {
              ru: '«разворот упрямства»',
              en: 'the "turnaround of stubbornness"',
              pl: '„odwrócenie uporu"',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'В чём главный минус низкой D для бизнеса?',
            en: 'What is the main downside of a low D for business?',
            pl: 'Na czym polega główny minus niskiego D dla biznesu?',
          },
          opts: [
            {
              ru: 'человек вводит своих сотрудников в замешательство: комфортное для него число изменений для большинства — перебор',
              en: 'the person throws his employees into confusion: the number of changes comfortable for him is too much for the majority',
              pl: 'człowiek wprowadza swoich pracowników w zamęt: komfortowa dla niego liczba zmian dla większości to przesada',
            },
            {
              ru: 'человек слишком осторожен',
              en: 'the person is too cautious',
              pl: 'człowiek jest zbyt ostrożny',
            },
            {
              ru: 'человек не имеет своего мнения',
              en: 'the person has no opinion of his own',
              pl: 'człowiek nie ma własnego zdania',
            },
            {
              ru: 'человек боится всего нового',
              en: 'the person is afraid of everything new',
              pl: 'człowiek boi się wszystkiego, co nowe',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Какой полушуточный, но полезный совет дают человеку с низкой D (шаг 4)?',
            en: 'What half-joking but useful advice is given to a person with a low D (step 4)?',
            pl: 'Jaką pół żartem, ale pożyteczną radę daje się człowiekowi z niskim D (krok 4)?',
          },
          opts: [
            {
              ru: '«улыбайся почаще подчинённым»',
              en: '"smile at your subordinates more often"',
              pl: '„uśmiechaj się częściej do podwładnych"',
            },
            {
              ru: '«меняй планы каждый день»',
              en: '"change your plans every day"',
              pl: '„zmieniaj plany każdego dnia"',
            },
            {
              ru: '«не улыбайся при подчинённых» — иначе, увидев улыбку, они понимают, что сейчас всё опять поменяется',
              en: '"do not smile in front of your subordinates" — otherwise, seeing a smile, they realize that now everything is about to change again',
              pl: '„nie uśmiechaj się przy podwładnych" — inaczej, widząc uśmiech, rozumieją, że zaraz wszystko znów się zmieni',
            },
            {
              ru: '«никогда ничего не планируй»',
              en: '"never plan anything"',
              pl: '„nigdy niczego nie planuj"',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что предлагает сделать образ «весов изменений»?',
            en: 'What does the image of the "scales of change" suggest doing?',
            pl: 'Co proponuje zrobić obraz „wagi zmian"?',
          },
          opts: [
            {
              ru: 'всегда сворачивать при новой идее',
              en: 'to always turn aside at a new idea',
              pl: 'zawsze zbaczać przy nowym pomyśle',
            },
            {
              ru: 'убрать «гирьку» любви к переменам и положить на чашу минусов замешательство, которое изменения вызывают у людей',
              en: 'to remove the "weight" of the love of change and place on the minus pan the confusion that changes cause in people',
              pl: 'zdjąć „odważnik" umiłowania zmian i położyć na szali minusów zamęt, który zmiany wywołują u ludzi',
            },
            {
              ru: 'взвешивать только плюсы',
              en: 'to weigh only the pluses',
              pl: 'ważyć tylko plusy',
            },
            {
              ru: 'не меняться никогда',
              en: 'to never change',
              pl: 'nigdy się nie zmieniać',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Второй крупный минус низкой D — это:',
            en: 'The second major downside of a low D is:',
            pl: 'Drugi duży minus niskiego D to:',
          },
          opts: [
            {
              ru: 'излишняя рутина',
              en: 'excessive routine',
              pl: 'nadmierna rutyna',
            },
            {
              ru: 'молчаливость',
              en: 'taciturnity',
              pl: 'małomówność',
            },
            {
              ru: 'высокая честность',
              en: 'high honesty',
              pl: 'wysoka uczciwość',
            },
            {
              ru: 'обходы (человеку быстро надоедает делать одинаково, и он обходит того, через кого должно пройти дело)',
              en: 'bypasses (the person quickly tires of doing things the same way and bypasses the one through whom the matter should pass)',
              pl: 'obejścia (człowiekowi szybko nudzi się robić tak samo i omija tego, przez kogo sprawa powinna przejść)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Как повышается точка D?',
            en: 'How is point D raised?',
            pl: 'Jak podnosi się punkt D?',
          },
          opts: [
            {
              ru: 'знаниями/обучением: чем лучше человек знает своё дело, тем предсказуемее в нём действует',
              en: 'by knowledge/training: the better a person knows his job, the more predictably he acts in it',
              pl: 'wiedzą/szkoleniem: im lepiej człowiek zna swoją pracę, tym przewidywalniej w niej działa',
            },
            {
              ru: 'критикой',
              en: 'by criticism',
              pl: 'krytyką',
            },
            {
              ru: 'давлением',
              en: 'by pressure',
              pl: 'naciskiem',
            },
            {
              ru: 'её нельзя повысить',
              en: 'it cannot be raised',
              pl: 'nie można go podnieść',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Когда уместны крепкие, жёсткие формулировки («это реально вредит компании»)?',
            en: 'When are strong, harsh formulations ("this really harms the company") appropriate?',
            pl: 'Kiedy stosowne są mocne, twarde sformułowania („to naprawdę szkodzi firmie")?',
          },
          opts: [
            {
              ru: 'всегда',
              en: 'always',
              pl: 'zawsze',
            },
            {
              ru: 'при низкой ответственности',
              en: 'with a low responsibility',
              pl: 'przy niskiej odpowiedzialności',
            },
            {
              ru: 'только при высокой ответственности (при низкой их надо убрать)',
              en: 'only with a high responsibility (with a low one they must be removed)',
              pl: 'tylko przy wysokiej odpowiedzialności (przy niskiej trzeba je usunąć)',
            },
            {
              ru: 'никогда',
              en: 'never',
              pl: 'nigdy',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Как нельзя называть низкую D «в лоб»?',
            en: 'How must you not name a low D "head-on"?',
            pl: 'Jak nie wolno nazywać niskiego D „wprost"?',
          },
          opts: [
            {
              ru: '«с вашей импульсивностью»',
              en: '"with your impulsiveness"',
              pl: '„z waszą impulsywnością"',
            },
            {
              ru: '«низкой точкой D» (для человека это непонятный термин — лучше «с вашей непредсказуемостью»)',
              en: '"a low point D" (for the person this is an incomprehensible term — better "with your unpredictability")',
              pl: '„niskim punktem D" (dla człowieka to niezrozumiały termin — lepiej „z waszą nieprzewidywalnością")',
            },
            {
              ru: '«с вашей непредсказуемостью»',
              en: '"with your unpredictability"',
              pl: '„z waszą nieprzewidywalnością"',
            },
            {
              ru: '«склонностью к новому»',
              en: '"an inclination toward the new"',
              pl: '„skłonnością do nowego"',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Когда ведут весь разговор о минусах?',
            en: 'When do you conduct the whole conversation about the minuses?',
            pl: 'Kiedy prowadzi się całą rozmowę o minusach?',
          },
          opts: [
            {
              ru: 'в самом начале беседы',
              en: 'at the very beginning of the conversation',
              pl: 'na samym początku rozmowy',
            },
            {
              ru: 'до шага 2',
              en: 'before step 2',
              pl: 'przed krokiem 2',
            },
            {
              ru: 'вместо шага 2b',
              en: 'instead of step 2b',
              pl: 'zamiast kroku 2b',
            },
            {
              ru: 'только после хорошо сделанного шага 2b — когда человек уже знает, что вы ему друг, и слушает спокойно',
              en: 'only after a well-done step 2b — when the person already knows that you are his friend and listens calmly',
              pl: 'dopiero po dobrze wykonanym kroku 2b — gdy człowiek już wie, że jesteście jego przyjacielem, i słucha spokojnie',
            },
          ],
          correct: 3,
        },
      ],
    },
  },
};
