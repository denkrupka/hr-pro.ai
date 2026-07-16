'use strict';
// Контент программы «Личностные качества (Точки D, E, F и Треугольник АРО)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-def'.

// Врезки-боксы 1-в-1 из программы productivity-winners / module-abc.
// b — нейтральный серый (ПРИМЕР / НА ЗАМЕТКУ / ЗАМЕТКА), k — фиолетовый (КЛЮЧЕВАЯ ИДЕЯ / ЗАПОМНИТЕ / ОПРЕДЕЛЕНИЕ),
// r — зелёный (ПРАВИЛО), t — синий (ПРИЁМ / ПРИМЕНЕНИЕ). Внутри — абзацы p().
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
  'module-def': {
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: {
          ru: 'АРО и точки D, E, F · Введение',
          en: 'ARC and points D, E, F · Introduction',
          pl: 'ARC i punkty D, E, F · Wprowadzenie',
        },
        desc: {
          ru: 'О чём этот модуль: точка D в оценке, закон треугольника АРО и точки активности и настойчивости.',
          en: 'What this module is about: point D in an assessment, the law of the ARC triangle, and the points of activity and persistence.',
          pl: 'O czym jest ten moduł: punkt D w ocenie, prawo trójkąta ARC oraz punkty aktywności i wytrwałości.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 7 · АРО И ТОЧКИ D–F</strong></p>' +
            '<p>Закон треугольника АРО и точки D, E, F</p>' +
            '<p>Точка D в оценке и разворот упрямства, закон аффинити–реальность–общение и как менять реальность человека, а также точки активности и настойчивости.</p>' +
            '<h2>Модуль 7. Закон треугольника АРО и точки D, E, F</h2>' +
            '<p>Мы продолжаем разбирать точки в контексте оценки. В этом модуле три темы. Сначала мы вернёмся к точке D — но уже с точки зрения оценки: как говорить о ней с человеком и какой приём применять, если D очень высокая. Затем разберём закон треугольника АРО — один из фундаментальных законов, на котором держится и вся оценка, и общение с людьми вообще. И наконец, пройдём точки E (активность) и F (настойчивость).</p>',
          en:
            '<p><strong>MODULE 7 · ARC AND POINTS D–F</strong></p>' +
            '<p>The law of the ARC triangle and points D, E, F</p>' +
            '<p>Point D in an assessment and the reversal of stubbornness, the law of affinity–reality–communication and how to change a person\'s reality, and also the points of activity and persistence.</p>' +
            '<h2>Module 7. The law of the ARC triangle and points D, E, F</h2>' +
            '<p>We continue to examine the points in the context of an assessment. In this module there are three themes. First we will return to point D — but now from the standpoint of an assessment: how to speak about it with a person and what technique to apply if D is very high. Then we will examine the law of the ARC triangle — one of the fundamental laws on which both the whole assessment and communication with people in general rest. And finally, we will go through points E (activity) and F (persistence).</p>',
          pl:
            '<p><strong>MODUŁ 7 · ARC I PUNKTY D–F</strong></p>' +
            '<p>Prawo trójkąta ARC i punkty D, E, F</p>' +
            '<p>Punkt D w ocenie i odwrócenie uporu, prawo affinity–rzeczywistość–komunikacja i jak zmieniać rzeczywistość człowieka, a także punkty aktywności i wytrwałości.</p>' +
            '<h2>Moduł 7. Prawo trójkąta ARC i punkty D, E, F</h2>' +
            '<p>Kontynuujemy omawianie punktów w kontekście oceny. W tym module są trzy tematy. Najpierw wrócimy do punktu D — ale już z punktu widzenia oceny: jak mówić o nim z człowiekiem i jaki chwyt stosować, jeśli D jest bardzo wysokie. Następnie omówimy prawo trójkąta ARC — jedno z fundamentalnych praw, na którym trzyma się i cała ocena, i komunikacja z ludźmi w ogóle. I wreszcie przejdziemy przez punkty E (aktywność) i F (wytrwałość).</p>',
        },
      },

      // 2 — ТОЧКА D В ОЦЕНКЕ
      {
        id: 'point-d',
        title: {
          ru: 'Точка D в оценке',
          en: 'Point D in an assessment',
          pl: 'Punkt D w ocenie',
        },
        desc: {
          ru: 'Как говорить о точке D в шаге о плюсах и особый приём «разворот упрямства» при очень высокой D.',
          en: 'How to speak about point D in the pluses step and the special technique of "reversing the stubbornness" when D is very high.',
          pl: 'Jak mówić o punkcie D w kroku o plusach i szczególny chwyt „odwrócenie uporu" przy bardzo wysokim D.',
        },
        html: {
          ru:
            '<h2>Глава 1. Точка D в оценке: как говорить о плюсах</h2>' +
            '<p>Сам концепт точки D — предсказуемость — мы подробно разобрали в отдельном модуле, там же и все сочетания D с активностью. Здесь остановимся на том, как говорить о D в шаге о плюсах.</p>' +
            '<p>Если D низкая, положительно это можно подать так. «Ты готов рискнуть» — ведь риск это всегда шаг в неизвестное, а низкая D любит пробовать до того, как узнает. «Тебе необязательно всё узнать, чтобы начать действовать». «Тебя нелегко просчитать» — и это правда: если у большого бизнесмена очень импульсивная D, служба безопасности может спать спокойно, потому что наёмному убийце его не вычислить (тот замечает, во сколько и по какой дороге человек ездит, готовится — а этот уже десять раз всё поменял; он и сам не знает, как завтра поедет домой). «Ты можешь быть разным в разных ситуациях» — он скажет: «да, я и есть разный». И ещё важный плюс: «у тебя нет идей, что ты знаешь всё» (раз он сомневается, значит, такой идеи у него нет). А также: «если надо что-то поменять, ты никогда не безнадёжен — ты можешь измениться, если надо, в отличие от твердолобых». Низкая D гибкая, её легче изменить — это реальный плюс. (Помните пример: если у сына первые три точки слабые, но D минус 60, есть шанс «слепить»; а вот при D плюс 95 было бы тяжело.) Если при этом высокая активность, ко всему можно прибавлять «очень» и «очень быстро»: низкая D с высокой активностью — это как мячик-попрыгунчик, с силой брошенный в стену. Кстати, иногда низкая D на тесте незаметна в жизни — если активность низкая: непредсказуемость медленного человека в глаза не бросается, а ускорьте её в десять раз — и получите ясную картину.</p>' +
            b('ЗАМЕТКА · Низкая D — не плюс, а гибкость',
              bp('Помните: по-настоящему низкая D никогда не является плюсом — она лишь иногда меньше вредит. Стремление узнать что-то перед тем, как делать, — очень рациональное: оно экономит деньги и сохраняет жизни. На любом новом рынке всё равно надо пройти несуществование, узнать спрос, выпустить новый продукт сначала маленьким объёмом. А «креативный подход» в кавычках — это часто просто отсутствие знаний. Так что низкую D мы подаём как гибкость, но не выдаём за достоинство.', true)) +
            '<h3>Глава 2. Очень высокая D и приём «разворот упрямства»</h3>' +
            '<p>Особый случай — очень высокая D, которая «торчит» выше всех остальных точек. Такому человеку изменить себя очень тяжело, и это его основной синдром. (Иногда такую D для краткости называют «компульсивной D» — это условное название, ведь строго говоря компульсивной точка считается, когда она выше D, а тут мы называем так саму D.)</p>' +
            '<p>Положительно это подаётся в самом начале оценки или в начале шага о плюсах так: «Ты очень уверен в своих выводах и решениях. Тебя нелегко изменить». Можно даже позволить себе шутку: «многие пытались тебя изменить, да мало кто дожил до нынешних дней».</p>' +
            '<p>А дальше — приём, ради которого стоит запомнить всё вышесказанное.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Разворот упрямства',
              bp('Установив «тебя нелегко изменить», скажите примерно так: «Слушай, у нас с тобой проблема. Цель того, что я делаю, — оценки теста — в том, чтобы, во-первых, показать тебе, что есть что-то, чего ты пока не знаешь, а во-вторых, изменить тебя в лучшую сторону. А ты, во-первых, всё уже знаешь — что бы я тебе ни сказал, ты скажешь, что уже это знаешь. А во-вторых, ты не изменишься». И замолчите. Это едва ли не единственный шанс что-то сдвинуть. Потому что теперь у него один выход — начать возражать: «нет, я не всё знаю, и я поменяюсь». А вы: «нет, ты же сам сказал, что знаешь всё и не поменяешься». Он: «поменяюсь». Вы: «нет». Он: «да». Вы: «тогда попробуй». Вы разворачиваете его упрямство в нужную сторону: теперь он сам настаивает, что способен измениться, — и появляется реальный шанс, что он что-то сделает.', true)),
          en:
            '<h2>Chapter 1. Point D in an assessment: how to speak about the pluses</h2>' +
            '<p>The concept of point D itself — predictability — we examined in detail in a separate module, along with all the combinations of D with activity. Here we will dwell on how to speak about D in the pluses step.</p>' +
            '<p>If D is low, positively this can be presented as follows. "You\'re ready to take a risk" — for risk is always a step into the unknown, and a low D likes to try before it knows. "You don\'t have to know everything in order to start acting." "You\'re not easy to figure out" — and this is true: if a big businessman has a very impulsive D, the security service can sleep easy, because a hired killer cannot pin him down (the killer notes what time and by which road the person drives, prepares — but this one has already changed everything ten times over; he himself does not know how he\'ll drive home tomorrow). "You can be different in different situations" — he will say: "yes, I am different." And one more important plus: "you don\'t have any ideas that you know everything" (since he doubts, it means he has no such idea). And also: "if something needs to be changed, you\'re never hopeless — you can change if need be, unlike the thick-headed." A low D is flexible, it is easier to change — this is a real plus. (Recall the example: if a son\'s first three points are weak, but his D is minus 60, there is a chance to "mold" him; whereas with a D of plus 95 it would be hard.) If together with this there is high activity, one can add "very" and "very quickly" to everything: a low D with high activity is like a bouncy ball thrown at a wall with force. Incidentally, sometimes a low D on the test is unnoticeable in life — if activity is low: the unpredictability of a slow person does not catch the eye, but speed it up tenfold — and you get a clear picture.</p>' +
            b('NOTE · A low D is not a plus, but flexibility',
              bp('Remember: a truly low D is never a plus — it merely sometimes does less harm. The striving to find out something before doing is very rational: it saves money and preserves lives. In any new market one still has to go through non-existence, learn the demand, launch a new product first in a small volume. And a "creative approach" in quotation marks is often simply an absence of knowledge. So we present a low D as flexibility, but do not pass it off as a virtue.', true)) +
            '<h3>Chapter 2. A very high D and the technique of "reversing the stubbornness"</h3>' +
            '<p>A special case is a very high D that "sticks up" higher than all the other points. For such a person it is very hard to change himself, and this is his main syndrome. (Sometimes such a D is called, for short, a "compulsive D" — this is a conditional name, for strictly speaking a point is considered compulsive when it is higher than D, whereas here we call D itself that.)</p>' +
            '<p>Positively, this is presented at the very beginning of the assessment or at the start of the pluses step like this: "You\'re very sure of your conclusions and decisions. You\'re not easy to change." One may even allow oneself a joke: "many have tried to change you, but few have lived to see the present day."</p>' +
            '<p>And then — the technique for the sake of which it is worth remembering everything said above.</p>' +
            k('KEY IDEA · Reversing the stubbornness',
              bp('Having established "you\'re not easy to change," say roughly this: "Listen, you and I have a problem. The goal of what I\'m doing — the test assessment — is, first, to show you that there\'s something you don\'t yet know, and second, to change you for the better. But you, first, already know everything — whatever I tell you, you\'ll say you already know it. And second, you won\'t change." And fall silent. This is well-nigh the only chance to shift anything. Because now he has one way out — to begin objecting: "no, I don\'t know everything, and I will change." And you: "no, you said yourself that you know everything and won\'t change." He: "I will change." You: "no." He: "yes." You: "then try." You turn his stubbornness in the needed direction: now he himself insists that he is capable of changing — and a real chance appears that he will do something.', true)),
          pl:
            '<h2>Rozdział 1. Punkt D w ocenie: jak mówić o plusach</h2>' +
            '<p>Sam koncept punktu D — przewidywalność — szczegółowo omówiliśmy w osobnym module, tam też i wszystkie połączenia D z aktywnością. Tu zatrzymamy się na tym, jak mówić o D w kroku o plusach.</p>' +
            '<p>Jeśli D jest niskie, pozytywnie można to podać tak. „Jesteś gotów zaryzykować" — ryzyko to przecież zawsze krok w nieznane, a niskie D lubi próbować, zanim się dowie. „Nie musisz wszystkiego wiedzieć, żeby zacząć działać". „Niełatwo cię przewidzieć" — i to prawda: jeśli u dużego biznesmena D jest bardzo impulsywne, służba bezpieczeństwa może spać spokojnie, bo płatny zabójca go nie namierzy (ów zauważa, o której i którą drogą człowiek jeździ, przygotowuje się — a ten już dziesięć razy wszystko zmienił; sam nie wie, jak jutro pojedzie do domu). „Możesz być różny w różnych sytuacjach" — powie: „tak, ja i jestem różny". I jeszcze ważny plus: „nie masz idei, że wiesz wszystko" (skoro wątpi, znaczy, takiej idei nie ma). A także: „jeśli trzeba coś zmienić, nigdy nie jesteś beznadziejny — możesz się zmienić, jeśli trzeba, w odróżnieniu od twardogłowych". Niskie D jest elastyczne, łatwiej je zmienić — to realny plus. (Pamiętajcie przykład: jeśli u syna pierwsze trzy punkty są słabe, ale D minus 60, jest szansa „ulepić"; a oto przy D plus 95 byłoby ciężko.) Jeśli przy tym jest wysoka aktywność, do wszystkiego można dodawać „bardzo" i „bardzo szybko": niskie D z wysoką aktywnością to jak piłeczka-skakanka z siłą rzucona w ścianę. Swoją drogą, czasem niskie D na teście jest niezauważalne w życiu — jeśli aktywność jest niska: nieprzewidywalność powolnego człowieka nie rzuca się w oczy, a przyspieszcie ją dziesięciokrotnie — i dostaniecie jasny obraz.</p>' +
            b('NOTATKA · Niskie D — nie plus, lecz elastyczność',
              bp('Pamiętajcie: naprawdę niskie D nigdy nie jest plusem — jedynie czasem mniej szkodzi. Dążenie, żeby czegoś się dowiedzieć przed zrobieniem, jest bardzo racjonalne: oszczędza pieniądze i ratuje życie. Na każdym nowym rynku i tak trzeba przejść nieistnienie, poznać popyt, wypuścić nowy produkt najpierw małym wolumenem. A „kreatywne podejście" w cudzysłowie — to często po prostu brak wiedzy. Tak więc niskie D podajemy jako elastyczność, ale nie wydajemy za zaletę.', true)) +
            '<h3>Rozdział 2. Bardzo wysokie D i chwyt „odwrócenie uporu"</h3>' +
            '<p>Szczególny przypadek — bardzo wysokie D, które „sterczy" wyżej od wszystkich pozostałych punktów. Takiemu człowiekowi zmienić siebie jest bardzo ciężko, i to jego podstawowy syndrom. (Czasem takie D dla skrótu nazywa się „kompulsywnym D" — to umowna nazwa, bo ściśle rzecz biorąc punkt uważa się za kompulsywny, gdy jest wyższy od D, a tu nazywamy tak samo D.)</p>' +
            '<p>Pozytywnie podaje się to na samym początku oceny albo na początku kroku o plusach tak: „Jesteś bardzo pewny swoich wniosków i decyzji. Niełatwo cię zmienić". Można nawet pozwolić sobie na żart: „wielu próbowało cię zmienić, ale mało kto dożył dzisiejszych czasów".</p>' +
            '<p>A dalej — chwyt, dla którego warto zapamiętać wszystko powyższe.</p>' +
            k('KLUCZOWA MYŚL · Odwrócenie uporu',
              bp('Ustaliwszy „niełatwo cię zmienić", powiedzcie mniej więcej tak: „Słuchaj, mamy z tobą problem. Cel tego, co robię — oceny testu — polega na tym, żeby, po pierwsze, pokazać ci, że jest coś, czego na razie nie wiesz, a po drugie, zmienić cię na lepsze. A ty, po pierwsze, wszystko już wiesz — cokolwiek bym ci powiedział, powiesz, że już to wiesz. A po drugie, nie zmienisz się". I zamilknijcie. To bodaj jedyna szansa, żeby coś ruszyć. Bo teraz ma jedno wyjście — zacząć oponować: „nie, nie wszystko wiem, i zmienię się". A wy: „nie, sam przecież powiedziałeś, że wiesz wszystko i się nie zmienisz". On: „zmienię się". Wy: „nie". On: „tak". Wy: „to spróbuj". Odwracacie jego upór we właściwą stronę: teraz on sam nalega, że jest zdolny się zmienić — i pojawia się realna szansa, że coś zrobi.', true)),
        },
      },

      // 3 — ЗАКОН ТРЕУГОЛЬНИКА АРО
      {
        id: 'aro-triangle',
        title: {
          ru: 'Закон треугольника АРО',
          en: 'The law of the ARC triangle',
          pl: 'Prawo trójkąta ARC',
        },
        desc: {
          ru: 'Аффинити, реальность и общение: как связаны три вершины и почему их площадь равна пониманию.',
          en: 'Affinity, reality, and communication: how the three vertices are connected and why their area equals understanding.',
          pl: 'Affinity, rzeczywistość i komunikacja: jak powiązane są trzy wierzchołki i dlaczego ich pole równa się zrozumieniu.',
        },
        html: {
          ru:
            '<h2>Глава 3. Закон треугольника АРО</h2>' +
            '<p>Есть ещё один важный закон — треугольник АРО. Три его вершины — это аффинити, реальность и общение.</p>' +
            '<p>Аффинити (от английского affinity) — это степень дружеского расположения или его отсутствия, в некотором смысле симпатия. К тому, к чему у нас высокое аффинити, мы стараемся быть поближе; к тому, к чему низкое, — подальше; а к тому, к чему аффинити нулевое, мы вообще безразличны и даже не замечаем. Любовь — это, в некотором смысле, высшая степень аффинити: стремление занять одну точку в пространстве.</p>' +
            '<p>Реальность. Если спросить, что такое реальность, большинство ответит: «то, что происходит на самом деле». И это ошибка. Тысячу лет назад, скажи я вам «наша реальность в том, что Земля круглая», вы сожгли бы меня на костре — как сожгли Джордано Бруно. Значит, реальность — это не обязательно то, что происходит на самом деле. Реальность — это согласие, то, с чем мы согласны. Тысячу лет назад согласием было, что Земля плоская, и это была реальность; сегодня согласие другое. А это архиважно для общения: если я меняю согласие человека, я меняю его реальность.</p>' +
            '<p>Общение — это обмен идеями или частицами между двумя людьми. Слова — лишь инструмент общения, а его продукт — понимание, когда человек понял то, что я хотел ему сказать. Добиться этого можно словами, а иногда взглядом или жестом (немые прекрасно общаются и без слов).</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Аффинити — степень дружеского расположения (симпатии). Реальность — это согласие, то, с чем человек согласен, а не обязательно то, что происходит на самом деле. Общение — обмен идеями или частицами, продукт которого — понимание.', true)) +
            '<p>Первая часть закона (она похожа на треугольник ЗОК): эти три фактора неразрывно связаны. Если один из них увеличивается, увеличиваются и два других, и треугольник растёт; если один уменьшается — уменьшаются и остальные, треугольник сжимается. Проверим: если вы боитесь змей, у вас к ним низкое аффинити, а значит, и низкое согласие (вы не знаете, чем они живут, дышат, питаются, что им нравится), и общались вы с ними мало. А у змеелова аффинити высокое — и реальность в отношении змей высокая, и общается он с ними много. Отсюда практический вывод. Со временем у людей нередко появляется низкое аффинити к другим людям — их начинают не любить и бояться, потому что те когда-то обманули или причинили зло. Но если человек не любит людей, значит, у него на самом деле низкая реальность в отношении людей — он думает, что «все одинаковые, всем нужно одно и то же», а это неправда, и по-настоящему он с людьми не общается. Лучший способ перестать бояться людей — узнать их; а чтобы узнать, надо общаться.</p>' +
            '<p>Вторая часть закона: площадь этого треугольника равна пониманию. Мы, как духовные существа, больше всего в жизни любим понимать. И Хаббард был первым, кто объяснил, из чего понимание состоит, — из аффинити, реальности и общения.</p>',
          en:
            '<h2>Chapter 3. The law of the ARC triangle</h2>' +
            '<p>There is one more important law — the ARC triangle. Its three vertices are affinity, reality, and communication.</p>' +
            '<p>Affinity — the degree of friendly disposition or its absence, in a sense, liking. To that toward which we have high affinity, we try to be closer; to that toward which it is low — farther; and to that toward which affinity is zero, we are altogether indifferent and do not even notice it. Love is, in a sense, the highest degree of affinity: the striving to occupy one point in space.</p>' +
            '<p>Reality. If you ask what reality is, most will answer: "that which actually happens." And this is a mistake. A thousand years ago, had I told you "our reality is that the Earth is round," you would have burned me at the stake — as Giordano Bruno was burned. So reality is not necessarily that which actually happens. Reality is agreement, that with which we agree. A thousand years ago the agreement was that the Earth is flat, and that was the reality; today the agreement is different. And this is supremely important for communication: if I change a person\'s agreement, I change his reality.</p>' +
            '<p>Communication — an exchange of ideas or particles between two people. Words are merely a tool of communication, and its product is understanding, when a person has understood what I wanted to say to him. This can be achieved with words, and sometimes with a look or a gesture (mute people communicate splendidly even without words).</p>' +
            k('DEFINITION',
              bp('Affinity — the degree of friendly disposition (liking). Reality is agreement, that with which a person agrees, and not necessarily that which actually happens. Communication — an exchange of ideas or particles, the product of which is understanding.', true)) +
            '<p>The first part of the law (it is similar to the KRC triangle): these three factors are inseparably connected. If one of them increases, the other two increase as well, and the triangle grows; if one decreases — the others decrease too, and the triangle contracts. Let us check: if you are afraid of snakes, you have low affinity toward them, and hence low agreement too (you do not know what they live on, breathe, feed on, what they like), and you have communicated with them little. But a snake handler has high affinity — and high reality with respect to snakes, and he communicates with them a lot. Hence a practical conclusion. Over time people not infrequently develop a low affinity toward other people — they come to dislike and fear them, because those once deceived them or did them wrong. But if a person dislikes people, it means he actually has low reality with respect to people — he thinks that "everyone is the same, everyone needs the same thing," and this is not true, and he does not really communicate with people. The best way to stop fearing people is to get to know them; and in order to get to know them, one must communicate.</p>' +
            '<p>The second part of the law: the area of this triangle equals understanding. We, as spiritual beings, love most of all in life to understand. And Hubbard was the first to explain what understanding consists of — of affinity, reality, and communication.</p>',
          pl:
            '<h2>Rozdział 3. Prawo trójkąta ARC</h2>' +
            '<p>Jest jeszcze jedno ważne prawo — trójkąt ARC. Trzy jego wierzchołki to affinity, rzeczywistość i komunikacja.</p>' +
            '<p>Affinity (z angielskiego affinity) — to stopień przyjaznego usposobienia albo jego braku, w pewnym sensie sympatia. Do tego, do czego mamy wysokie affinity, staramy się być bliżej; do tego, do czego niskie — dalej; a do tego, do czego affinity jest zerowe, jesteśmy w ogóle obojętni i nawet tego nie zauważamy. Miłość to, w pewnym sensie, najwyższy stopień affinity: dążenie, żeby zająć jeden punkt w przestrzeni.</p>' +
            '<p>Rzeczywistość. Jeśli zapytać, czym jest rzeczywistość, większość odpowie: „tym, co dzieje się naprawdę". I to błąd. Tysiąc lat temu, gdybym powiedział wam „nasza rzeczywistość jest taka, że Ziemia jest okrągła", spalilibyście mnie na stosie — jak spalono Giordana Bruna. Znaczy, rzeczywistość to niekoniecznie to, co dzieje się naprawdę. Rzeczywistość to zgoda, to, z czym się zgadzamy. Tysiąc lat temu zgodą było, że Ziemia jest płaska, i to była rzeczywistość; dziś zgoda jest inna. A to arcyważne dla komunikacji: jeśli zmieniam zgodę człowieka, zmieniam jego rzeczywistość.</p>' +
            '<p>Komunikacja — to wymiana idei albo cząstek między dwoma ludźmi. Słowa to jedynie narzędzie komunikacji, a jej produkt to zrozumienie, gdy człowiek zrozumiał to, co chciałem mu powiedzieć. Osiągnąć to można słowami, a czasem spojrzeniem albo gestem (niemi wspaniale komunikują się i bez słów).</p>' +
            k('DEFINICJA',
              bp('Affinity — stopień przyjaznego usposobienia (sympatii). Rzeczywistość — to zgoda, to, z czym człowiek się zgadza, a niekoniecznie to, co dzieje się naprawdę. Komunikacja — wymiana idei albo cząstek, której produktem jest zrozumienie.', true)) +
            '<p>Pierwsza część prawa (jest podobna do trójkąta WOK): te trzy czynniki są nierozerwalnie powiązane. Jeśli jeden z nich rośnie, rosną i dwa pozostałe, i trójkąt się powiększa; jeśli jeden maleje — maleją i pozostałe, trójkąt się kurczy. Sprawdźmy: jeśli boicie się węży, macie do nich niskie affinity, a znaczy, i niską zgodę (nie wiecie, czym żyją, oddychają, żywią się, co lubią), i komunikowaliście się z nimi mało. A u poskramiacza węży affinity jest wysokie — i rzeczywistość w odniesieniu do węży wysoka, i komunikuje się z nimi dużo. Stąd praktyczny wniosek. Z czasem u ludzi nierzadko pojawia się niskie affinity do innych ludzi — zaczynają ich nie lubić i się bać, bo ci kiedyś oszukali albo wyrządzili zło. Ale jeśli człowiek nie lubi ludzi, znaczy, ma naprawdę niską rzeczywistość w odniesieniu do ludzi — myśli, że „wszyscy są jednakowi, wszystkim potrzebne jest to samo", a to nieprawda, i naprawdę z ludźmi się nie komunikuje. Najlepszy sposób, żeby przestać bać się ludzi — poznać ich; a żeby poznać, trzeba się komunikować.</p>' +
            '<p>Druga część prawa: pole tego trójkąta równa się zrozumieniu. My, jako istoty duchowe, najbardziej w życiu lubimy rozumieć. I Hubbard był pierwszym, kto objaśnił, z czego zrozumienie się składa — z affinity, rzeczywistości i komunikacji.</p>',
        },
      },

      // 4 — КАК МЕНЯТЬ РЕАЛЬНОСТЬ
      {
        id: 'change-reality',
        title: {
          ru: 'Как менять реальность',
          en: 'How to change reality',
          pl: 'Jak zmieniać rzeczywistość',
        },
        desc: {
          ru: 'Почему изменение реальности людей — суть общения в бизнесе и почему начинать надо с реальности другого.',
          en: 'Why changing people\'s reality is the essence of communication in business and why one must begin with the other person\'s reality.',
          pl: 'Dlaczego zmiana rzeczywistości ludzi to istota komunikacji w biznesie i dlaczego zaczynać trzeba od rzeczywistości drugiego.',
        },
        html: {
          ru:
            '<h2>Глава 4. Как менять реальность: начинай с реальности другого</h2>' +
            '<p>Зачем нам всё это в бизнесе? Задумайтесь: большая часть вашего общения с сотрудниками — это, по сути, изменение их реальности. Они не знают целей компании — вы доносите цель и хотите, чтобы они с ней согласились. Они считают нормальным обходить друг друга — вы общаетесь, чтобы они согласились, что обходить нельзя. Человек, который умеет менять реальность людей, — это мастер, способный решить практически любую проблему.</p>' +
            '<p>Сюда же относятся и правила компании, которые мы советовали записывать. В треугольнике АРО правило — это одновременно и общение (я передаю свои идеи), и реальность (я устанавливаю то, с чем все должны согласиться). Поэтому правила стоит создавать естественно — рождая их из формул опасности и успешных действий, — чтобы с ними соглашалось как можно больше людей и уходили лишь единицы. А когда правильное общение устанавливает согласие, у людей по закону АРО появляется аффинити к происходящему — а это уже очень близко к вовлечённости.</p>' +
            '<p>Теперь — самое важное: как именно менять реальность. Возьмём простой пример: сотрудник считает, что платить надо оклад (за время), а вы хотите платить сдельно (за продукт). С чего обычно начинают? С того, что начинают убеждать его в своей правоте — говорить о сдельной оплате. И это ошибка.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Начинайте с того, с чем человек согласен',
              bp('Как только вы заговорили о своей реальности (сдельно), сотрудник с ней не согласен — и по закону АРО его реальность падает. А если падает реальность, падает и его желание находиться рядом с вами (остаётся он только из страха, что вы начальник), и желание по-настоящему с вами общаться. Треугольник сжимается — а вместе с ним сжимается и понимание. По сути, вы забили гол в свои ворота ещё до начала игры, а потом пытаетесь в этот крохотный кусочек понимания что-то втолковать и удивляетесь: «ну почему он такой непонятливый?»') +
              bp('Как надо: чуть-чуть забыть о себе и по-настоящему заинтересоваться тем, что считает правильным другой человек, — и начать с его реальности, плавно разматывая её в свою сторону (принцип постепенности, «тише едешь — дальше будешь»). «Скажи, а за что я должен тебе платить?» — «Ну как, я хожу на работу, плати оклад». — «Понял: сорок часов в неделю, скажем, двадцать тысяч?» — «Да». — «А если ты половину этого времени играешь и смотришь фильм, ты хочешь, чтобы я платил?» — «Нет». — «То есть ты хочешь, чтобы я платил за время, когда ты работаешь?» — «Да» (заметьте, он уже чуть сдвинулся). — «А как понять, работаешь ты или нет? Если ты сейчас начнёшь бегать вокруг офиса с книжками — ты работаешь?» — «Нет». — «А если кто-то заинтересуется и купит у нас эти книжки?» — «Тогда работаю». — «Значит, критерий в том, получается ли что-то полезное в результате?» — «Да». — «То есть ты хочешь, чтобы я платил за время, когда ты делаешь что-то полезное и когда это получается?» — «Да!» Ни на секунду не сжимая его треугольник, вы всё время говорите о том, с чем он согласен, — и плавно приводите к своей реальности.', true)) +
            '<p>Тот же принцип работает и дома, и с детьми. Жена не хочет готовить ужин в три ночи — не будите её с претензией (она уже изначально не согласна), а спросите, почему она считает, что готовить не должна, и разматывайте оттуда. Ребёнок не хочет идти в школу — не «надо идти», а: «А что там делать? Я, кстати, согласен. Но почему неделю назад ты шёл с радостью? Что изменилось?» — «Верка заболела». — «А ведь Верка пропустит, и ей потом надо будет всё объяснять; ты тоже пропустишь — значит, объяснять ей будет кто-то другой?» И ребёнок сам говорит: «Пап, спасибо, я пошёл в школу». Всё держится на том, что вы искренне интересуетесь другим человеком и разматываете из его реальности. И к оценке теста это относится напрямую: чтобы изменить реальность человека о его минусах, надо начинать с его реальности — с его плюсов и с того, что он сам считает правильным.</p>',
          en:
            '<h2>Chapter 4. How to change reality: begin with the other person\'s reality</h2>' +
            '<p>Why do we need all this in business? Consider: the greater part of your communication with employees is, in essence, a changing of their reality. They do not know the company\'s goals — you convey the goal and want them to agree with it. They consider it normal to bypass one another — you communicate so that they will agree that bypassing is not allowed. A person who knows how to change people\'s reality is a master capable of solving practically any problem.</p>' +
            '<p>Here belong the company\'s rules too, which we advised writing down. In the ARC triangle a rule is at once both communication (I convey my ideas) and reality (I establish that with which everyone must agree). That is why rules should be created naturally — by giving birth to them out of danger formulas and successful actions — so that as many people as possible agree with them, and only a few leave. And when correct communication establishes agreement, by the law of ARC people develop affinity toward what is happening — and this is already very close to engagement.</p>' +
            '<p>Now — the most important thing: how exactly to change reality. Let us take a simple example: an employee believes that one should pay a salary (for time), while you want to pay piece-rate (for product). Where does one usually begin? By beginning to convince him of your rightness — to talk about piece-rate pay. And this is a mistake.</p>' +
            t('APPLICATION IN HIRING · Begin with what the person agrees with',
              bp('As soon as you have started talking about your reality (piece-rate), the employee does not agree with it — and by the law of ARC his reality falls. And if reality falls, so does his desire to be near you (he stays only out of fear that you are the boss) and his desire to really communicate with you. The triangle contracts — and with it understanding contracts too. In essence, you scored an own goal before the game even began, and then you try to cram something into this tiny scrap of understanding and are surprised: "why is he so slow on the uptake?"') +
              bp('How it should be done: to forget about yourself a little and become genuinely interested in what the other person considers right — and to begin with his reality, smoothly unwinding it in your direction (the principle of graduality, "the slower you go, the farther you\'ll get"). "Tell me, what should I be paying you for?" — "Well, I come to work, pay me a salary." — "Got it: forty hours a week, say, twenty thousand?" — "Yes." — "And if for half of that time you play games and watch a film, do you want me to pay?" — "No." — "So you want me to pay for the time when you\'re working?" — "Yes" (note, he has already shifted a little). — "And how do I tell whether you\'re working or not? If you now start running around the office with books — are you working?" — "No." — "And if someone gets interested and buys these books from us?" — "Then I\'m working." — "So the criterion is whether something useful results?" — "Yes." — "So you want me to pay for the time when you\'re doing something useful and when it succeeds?" — "Yes!" Without contracting his triangle for even a second, you speak all the while about what he agrees with — and smoothly bring him to your reality.', true)) +
            '<p>The same principle works at home too, and with children. Your wife does not want to cook dinner at three in the morning — do not wake her with a grievance (she disagrees from the outset), but ask why she thinks she should not cook, and unwind from there. A child does not want to go to school — not "you have to go," but: "And what\'s there to do there? I agree, by the way. But why did you go gladly a week ago? What\'s changed?" — "Verka got sick." — "But Verka will fall behind, and she\'ll then have to have everything explained to her; you\'ll fall behind too — so someone else will have to explain it to her?" And the child says himself: "Dad, thanks, I\'m off to school." Everything rests on your being sincerely interested in the other person and unwinding from his reality. And this applies directly to a test assessment: in order to change a person\'s reality about his minuses, one must begin with his reality — with his pluses and with what he himself considers right.</p>',
          pl:
            '<h2>Rozdział 4. Jak zmieniać rzeczywistość: zaczynaj od rzeczywistości drugiego</h2>' +
            '<p>Po co nam to wszystko w biznesie? Zastanówcie się: większa część waszej komunikacji z pracownikami to w istocie zmiana ich rzeczywistości. Nie znają celów firmy — wy przekazujecie cel i chcecie, żeby się z nim zgodzili. Uważają za normalne obchodzenie się nawzajem — wy komunikujecie się, żeby zgodzili się, że obchodzić nie wolno. Człowiek, który umie zmieniać rzeczywistość ludzi, to mistrz zdolny rozwiązać praktycznie każdy problem.</p>' +
            '<p>Tu należą i zasady firmy, które radziliśmy zapisywać. W trójkącie ARC zasada to jednocześnie i komunikacja (przekazuję swoje idee), i rzeczywistość (ustanawiam to, z czym wszyscy powinni się zgodzić). Dlatego zasady warto tworzyć naturalnie — rodząc je z formuł niebezpieczeństwa i udanych działań — żeby zgadzało się z nimi jak najwięcej ludzi, a odchodziły tylko jednostki. A gdy prawidłowa komunikacja ustanawia zgodę, u ludzi zgodnie z prawem ARC pojawia się affinity do tego, co się dzieje — a to już bardzo blisko zaangażowania.</p>' +
            '<p>Teraz — najważniejsze: jak dokładnie zmieniać rzeczywistość. Weźmy prosty przykład: pracownik uważa, że płacić trzeba pensję (za czas), a wy chcecie płacić akordowo (za produkt). Od czego zwykle się zaczyna? Od tego, że zaczyna się przekonywać go o swojej racji — mówić o płacy akordowej. I to błąd.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Zaczynajcie od tego, z czym człowiek się zgadza',
              bp('Gdy tylko zaczęliście mówić o swojej rzeczywistości (akordowo), pracownik się z nią nie zgadza — i zgodnie z prawem ARC jego rzeczywistość spada. A jeśli spada rzeczywistość, spada i jego chęć znajdowania się obok was (zostaje tylko ze strachu, że jesteście przełożonym) i chęć naprawdę się z wami komunikować. Trójkąt się kurczy — a wraz z nim kurczy się i zrozumienie. W istocie wbiliście gola do własnej bramki jeszcze przed rozpoczęciem gry, a potem próbujecie w ten maleńki kawałeczek zrozumienia coś wtłoczyć i dziwicie się: „no dlaczego on jest taki niepojętny?"') +
              bp('Jak trzeba: trochę zapomnieć o sobie i naprawdę zainteresować się tym, co drugi człowiek uważa za słuszne — i zacząć od jego rzeczywistości, płynnie rozwijając ją w swoją stronę (zasada stopniowości, „śpiesz się powoli"). „Powiedz, a za co mam ci płacić?" — „No jak, chodzę do pracy, płać pensję". — „Zrozumiałem: czterdzieści godzin tygodniowo, powiedzmy, dwadzieścia tysięcy?" — „Tak". — „A jeśli połowę tego czasu grasz i oglądasz film, chcesz, żebym płacił?" — „Nie". — „Czyli chcesz, żebym płacił za czas, kiedy pracujesz?" — „Tak" (zauważcie, już się trochę przesunął). — „A jak zrozumieć, pracujesz czy nie? Jeśli teraz zaczniesz biegać wokół biura z książkami — pracujesz?" — „Nie". — „A jeśli ktoś się zainteresuje i kupi u nas te książki?" — „Wtedy pracuję". — „Znaczy, kryterium jest w tym, czy powstaje coś pożytecznego w rezultacie?" — „Tak". — „Czyli chcesz, żebym płacił za czas, kiedy robisz coś pożytecznego i kiedy to się udaje?" — „Tak!" Ani na sekundę nie kurcząc jego trójkąta, cały czas mówicie o tym, z czym się zgadza — i płynnie doprowadzacie do swojej rzeczywistości.', true)) +
            '<p>Ta sama zasada działa i w domu, i z dziećmi. Żona nie chce gotować kolacji o trzeciej w nocy — nie budźcie jej z pretensją (ona już z założenia się nie zgadza), lecz zapytajcie, dlaczego uważa, że gotować nie powinna, i rozwijajcie stamtąd. Dziecko nie chce iść do szkoły — nie „trzeba iść", lecz: „A co tam robić? Ja, à propos, się zgadzam. Ale dlaczego tydzień temu szedłeś z radością? Co się zmieniło?" — „Werka zachorowała". — „A przecież Werka opuści, i jej potem trzeba będzie wszystko tłumaczyć; ty też opuścisz — znaczy, tłumaczyć jej będzie ktoś inny?" I dziecko samo mówi: „Tato, dziękuję, poszedłem do szkoły". Wszystko trzyma się na tym, że szczerze interesujecie się drugim człowiekiem i rozwijacie z jego rzeczywistości. I do oceny testu odnosi się to wprost: żeby zmienić rzeczywistość człowieka co do jego minusów, trzeba zaczynać od jego rzeczywistości — od jego plusów i od tego, co on sam uważa za słuszne.</p>',
        },
      },

      // 5 — ТОЧКА E. АКТИВНОСТЬ
      {
        id: 'point-e',
        title: {
          ru: 'Точка E. Активность',
          en: 'Point E. Activity',
          pl: 'Punkt E. Aktywność',
        },
        desc: {
          ru: 'Энергия и инициатива: как активность связана с тягой к новому и что советовать руководителю.',
          en: 'Energy and initiative: how activity is connected with the craving for the new and what to advise the manager.',
          pl: 'Energia i inicjatywa: jak aktywność wiąże się z ciągiem ku nowemu i co doradzać kierownikowi.',
        },
        html: {
          ru:
            '<h2>Глава 5. Точка E. Активность</h2>' +
            '<p>Ключевой концепт точки E — энергия: попросту, много энергии или мало. Точка очень простая. Человек с высокой E любит физические движения, любит начинать деятельность, он более живой и бдительный (ведь и заговорить, и подойти разобраться, и подбежать — всё требует энергии) и более инициативный. Человек с низкой E движений не любит, предпочитает сидеть и наблюдать и с инициативой не выступает.</p>' +
            '<p>Почему энергия связана с инициативой? Отчасти потому, что инициатива, как известно, наказуема: предложил уху — иди руби дрова, предложил волейбол — иди натягивай сетку. Активный не боится это делать — он с удовольствием сжигает энергию, которой у него много; а низкоэнергичный знает, что его тут же отправят «за дровами», и потому молчит. С этим же связан и интерес к новому: когда мы идём в новую область, мы сжигаем много энергии (новички всегда суетятся и делают массу лишних движений), поэтому чем больше энергии, тем сильнее тянет в новое. Именно поэтому мы сравниваем E с D: D показывает уровень известной области, и если активность «торчит» выше D, значит, человек любит начинать деятельность в новом. Плюс к этому — более живое общение и просто больше выносливости и силы.</p>' +
            '<p>Компульсивная активность — это когда активность выше D: человек не может не двигаться и не сжигать энергию, ему нужно новое, а если нового нет — он скучает. И развеем один миф: энергия нужна вовсе не только тем, кто занят физическим трудом. Она нужна всем, а особенно — тем, кто должен идти в новое, и руководителю. Ведь руководитель с низкой энергией большую часть времени сидит в кресле, а значит, принимает решения не на основании того, что он сам видит, а на основании того, что ему докладывают подчинённые, — а как часто, пойдя и посмотрев самому, обнаруживаешь, что всё совсем не так, как рассказывали.</p>' +
            '<p>Как говорить о точке E в шаге о плюсах — прежде всего через её сочетание с D (мы разбирали это в модуле про точку D). Если E выше D (и D не ниже 32) — «ты можешь и хочешь делать вещи, выходящие за пределы того, что ты знаешь, и при этом стараешься сначала что-то узнать» (очень гармонично: идёт в новое, но не прыгает с моста, не проверив дно). Если E примерно на уровне D — «ты можешь и рутиной заниматься без нового, и в новое идти, не скучая по рутине». Если E ниже D — «ты прекрасно справляешься с рутиной, не любишь рисковать, любишь точно знать прежде чем делать»; такому человеку можно доверить много однообразной административной работы, и это очень ценно. Это первое, о чём стоит говорить с сотрудниками по их точкам D и E, — и первое, что учитывают в «инструкции по эксплуатации».</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка E',
              bp('Если активность высокая (тем более компульсивная), руководителю стоит посоветовать: следи, чтобы сотрудник не соскучился, — позаботься, чтобы у него всегда было хоть что-то новенькое (если D не ниже 32, он может и рутину делать, но новое ему необходимо). Точно такой же совет, кстати, подходит и супругу такого человека: этой тяге к новому нужно давать выход, иначе она найдёт его на стороне; и касается это всего — от еды и одежды до того, как проводят вместе время.') +
              bp('Если активность низкая (или ниже D), руководителю стоит посоветовать давать поменьше нового; а если новое дать всё же приходится — не гнать сотрудника, а дать ему время изучить, познакомиться, освоиться. И полезно объяснить это руководителю с высокой активностью (а таких начальников немало): раз тебе самому в радость идти в новое, ты и от подчинённого этого ждёшь, — а ему нужно время.', true)),
          en:
            '<h2>Chapter 5. Point E. Activity</h2>' +
            '<p>The key concept of point E is energy: simply, a lot of energy or a little. A very simple point. A person with a high E likes physical movement, likes to begin activity, is more lively and alert (for to strike up a conversation, and to come over to sort something out, and to run up — all of it requires energy) and more initiative-taking. A person with a low E does not like movement, prefers to sit and observe, and does not come forward with initiative.</p>' +
            '<p>Why is energy connected with initiative? Partly because initiative, as is well known, is punishable: you suggested fish soup — go chop the wood; you suggested volleyball — go put up the net. An active person is not afraid to do this — he gladly burns off the energy of which he has a lot; whereas the low-energy one knows that he will at once be sent "for the wood," and so he keeps silent. Connected with the same thing is the interest in the new: when we go into a new area, we burn a lot of energy (newcomers always bustle about and make a mass of unnecessary movements), which is why the more energy, the more strongly one is drawn to the new. It is precisely for this reason that we compare E with D: D shows the level of the known area, and if activity "sticks up" above D, it means the person likes to begin activity in the new. Added to this — livelier communication and simply more endurance and strength.</p>' +
            '<p>Compulsive activity is when activity is higher than D: the person cannot help moving and burning energy, he needs the new, and if there is no new — he is bored. And let us dispel one myth: energy is needed not only by those engaged in physical labor. It is needed by everyone, and especially by those who must go into the new, and by a manager. For a manager with low energy sits in his chair most of the time, and hence makes decisions not on the basis of what he himself sees, but on the basis of what his subordinates report — and how often, having gone and looked for himself, one discovers that everything is quite different from what was described.</p>' +
            '<p>How to speak about point E in the pluses step — above all through its combination with D (we examined this in the module on point D). If E is higher than D (and D is not below 32) — "you can and want to do things that go beyond what you know, and at the same time you try to find something out first" (very harmonious: he goes into the new, but does not jump off a bridge without checking the bottom). If E is at roughly the level of D — "you can both do routine without anything new and go into the new without missing the routine." If E is lower than D — "you cope splendidly with routine, don\'t like to take risks, like to know for sure before doing"; such a person can be entrusted with a lot of monotonous administrative work, and this is very valuable. This is the first thing worth talking about with employees regarding their points D and E — and the first thing taken into account in the "operating manual."</p>' +
            t('APPLICATION IN HIRING · Operating manual: point E',
              bp('If activity is high (all the more so if compulsive), it is worth advising the manager: see to it that the employee does not get bored — make sure he always has at least something new (if D is not below 32, he can do routine too, but the new is essential to him). Exactly the same advice, by the way, suits the spouse of such a person as well: this craving for the new must be given an outlet, otherwise it will find one on the side; and this concerns everything — from food and clothes to how time is spent together.') +
              bp('If activity is low (or lower than D), it is worth advising the manager to give less of the new; and if the new must be given after all — not to rush the employee, but to give him time to study, get acquainted, settle in. And it is useful to explain this to a manager with high activity (and there are quite a few such superiors): since it is a joy for you yourself to go into the new, you expect this of a subordinate too — but he needs time.', true)),
          pl:
            '<h2>Rozdział 5. Punkt E. Aktywność</h2>' +
            '<p>Kluczowy koncept punktu E to energia: po prostu, dużo energii albo mało. Punkt bardzo prosty. Człowiek z wysokim E lubi ruchy fizyczne, lubi zaczynać działalność, jest bardziej żywy i czujny (bo i zagadać, i podejść się rozeznać, i podbiec — wszystko wymaga energii) i bardziej inicjatywny. Człowiek z niskim E ruchów nie lubi, woli siedzieć i obserwować i z inicjatywą nie występuje.</p>' +
            '<p>Dlaczego energia jest związana z inicjatywą? Po części dlatego, że inicjatywa, jak wiadomo, jest karalna: zaproponowałeś zupę rybną — idź rąb drewno, zaproponowałeś siatkówkę — idź naciągaj siatkę. Aktywny nie boi się tego robić — z przyjemnością spala energię, której ma dużo; a niskoenergetyczny wie, że go od razu wyślą „po drewno", i dlatego milczy. Z tym samym związany jest i zainteresowanie nowym: gdy idziemy w nowy obszar, spalamy dużo energii (nowicjusze zawsze się krzątają i robią masę zbędnych ruchów), dlatego im więcej energii, tym silniej ciągnie w nowe. Właśnie dlatego porównujemy E z D: D pokazuje poziom znanego obszaru, i jeśli aktywność „sterczy" wyżej od D, znaczy, człowiek lubi zaczynać działalność w nowym. Plus do tego — bardziej żywa komunikacja i po prostu więcej wytrzymałości i siły.</p>' +
            '<p>Kompulsywna aktywność — to gdy aktywność jest wyższa od D: człowiek nie może się nie ruszać i nie spalać energii, potrzebne mu jest nowe, a jeśli nowego nie ma — nudzi się. I rozwiejmy jeden mit: energia potrzebna jest wcale nie tylko tym, którzy zajmują się pracą fizyczną. Potrzebna jest wszystkim, a szczególnie — tym, którzy mają iść w nowe, i kierownikowi. Kierownik z niską energią bowiem większość czasu siedzi w fotelu, a znaczy, podejmuje decyzje nie na podstawie tego, co sam widzi, lecz na podstawie tego, co mu meldują podwładni — a jak często, poszedłszy i popatrzywszy samemu, odkrywasz, że wszystko jest zupełnie nie tak, jak opowiadano.</p>' +
            '<p>Jak mówić o punkcie E w kroku o plusach — przede wszystkim przez jego połączenie z D (omawialiśmy to w module o punkcie D). Jeśli E jest wyższe od D (i D nie jest niższe niż 32) — „możesz i chcesz robić rzeczy wykraczające poza to, co znasz, i przy tym starasz się najpierw czegoś się dowiedzieć" (bardzo harmonijnie: idzie w nowe, ale nie skacze z mostu, nie sprawdziwszy dna). Jeśli E jest mniej więcej na poziomie D — „możesz i rutyną się zajmować bez nowego, i w nowe iść, nie tęskniąc za rutyną". Jeśli E jest niższe od D — „wspaniale radzisz sobie z rutyną, nie lubisz ryzykować, lubisz dokładnie wiedzieć, zanim zrobisz"; takiemu człowiekowi można powierzyć dużo jednostajnej pracy administracyjnej, i to bardzo cenne. To pierwsze, o czym warto mówić z pracownikami po ich punktach D i E — i pierwsze, co uwzględnia się w „instrukcji obsługi".</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt E',
              bp('Jeśli aktywność jest wysoka (tym bardziej kompulsywna), kierownikowi warto poradzić: pilnuj, żeby pracownik się nie znudził — zadbaj, żeby zawsze miał choć coś nowego (jeśli D nie jest niższe niż 32, może i rutynę robić, ale nowe jest mu niezbędne). Dokładnie taka sama rada, à propos, pasuje i małżonkowi takiego człowieka: temu ciągowi ku nowemu trzeba dawać ujście, inaczej znajdzie je na boku; i dotyczy to wszystkiego — od jedzenia i ubrania po to, jak spędza się razem czas.') +
              bp('Jeśli aktywność jest niska (albo niższa od D), kierownikowi warto poradzić, żeby dawał mniej nowego; a jeśli nowe dać jednak trzeba — nie poganiać pracownika, lecz dać mu czas na przestudiowanie, zapoznanie się, oswojenie. I pożytecznie jest objaśnić to kierownikowi z wysoką aktywnością (a takich przełożonych jest niemało): skoro tobie samemu w radość iść w nowe, ty i od podwładnego tego oczekujesz — a jemu potrzebny jest czas.', true)),
        },
      },

      // 6 — ТОЧКА F. НАСТОЙЧИВОСТЬ
      {
        id: 'point-f',
        title: {
          ru: 'Точка F. Настойчивость',
          en: 'Point F. Persistence',
          pl: 'Punkt F. Wytrwałość',
        },
        desc: {
          ru: 'Прямота и ориентация на результат: плюсы высокой F, тонкость с тоном и работа с низкой настойчивостью.',
          en: 'Directness and orientation toward the result: the pluses of a high F, the subtlety with tone, and working with low persistence.',
          pl: 'Bezpośredniość i nastawienie na wynik: plusy wysokiego F, subtelność z tonem i praca z niską wytrwałością.',
        },
        html: {
          ru:
            '<h2>Глава 6. Точка F. Настойчивость</h2>' +
            '<p>Ключевой концепт точки F — прямота. Настойчивый человек действует прямо и демонстрирует потенциал: «да, я это смогу, мне под силу». Человек с низкой настойчивостью действует осторожно и неэффективно: «ну, я попробую, посмотрим, что можно сделать». Высокая F ориентирована на высокий результат («в следующем квартале задерём показатель на сорок процентов, и это минимум»), открыто показывает своё отношение, общается прямо (не переспрашиваешь, вам ли адресовано). Часто у неё «суперменистный» подход — «сейчас, в шесть секунд!», — и он помогает, потому что окружающие пугаются и убегают (возможно, поэтому он так и делает). Ещё высокая F стремится закончить любой цикл действия и даже учится быстрее — пробивается через материал, не вязнет в деталях. Низкая F, наоборот, удерживает себя даже в том, чтобы показать своё мнение, вязнет в деталях вместо результата, а её общение будто «не добрасывает» до собеседника.</p>' +
            '<p>Важная тонкость: если противник не убегает, а держится, то одного напора мало — тут в дело вступает уже ответственность (точка G). Если ответственность низкая, «супермен» через две минуты начинает скулить — то шнурки завязывает, то за сигаретами ушёл. Но это проблема не высокой настойчивости, а низкой ответственности.</p>' +
            '<p>Компульсивная настойчивость — это когда F выше D. Чем выше настойчивость сама по себе, тем лучше (F девяносто при D девяносто восемь — это превосходная настойчивость с исправным «регулятором мощности»). А «чрезмерная» она именно тогда, когда выше D: тогда у человека будто сломался регулятор мощности — он всё время «врубает» полный напор и стреляет из пушки по воробьям. На затянувшемся перекуре, чтобы поднять тридцать рабочих, такой напор уместен; а вот дома, с женой и дочкой, прикрутить его сложно.</p>' +
            '<p>Как говорить о точке F в шаге о плюсах. Если F очень низкая — это, конечно, осторожность и неэффективность, но положительно можно сказать: «ты стараешься не делать ошибок, которых можно избежать; ты осторожен с людьми, стараешься быть приятным и дружелюбным». (Именно «с людьми» — потому что осторожность рождается из банка, а обжигаемся и ошибаемся мы чаще всего именно с людьми.) Если F высокая или компульсивная — говорим о плюсах высокой F, а для компульсивной можно добавить: «если ты чего-то очень хочешь, ты знаешь, как этого добиться; если нужно, ты можешь и „нож на стол положить“ — сказал, что будет так, и всё; ты прорвёшься, добьёшься; ты можешь быть жёстким, даже агрессивным». Во многих ситуациях это и правда плюс, и он сам это ценит.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Прежде чем хвалить за результаты — посмотрите на тон',
              bp('Внимание: перед тем как хвалить человека с высокой F за результаты и эффективность, обязательно посмотрите на точки B, G и H — те, что указывают тон. Если при такой настойчивости тон низкий (B, G, H низкие) и человек не берёт ответственность за свои результаты, то результаты у него, скорее всего, плачевные — плачущие дети, несчастные жёны, разбегающиеся сотрудники. И если вы начнёте хвалить его за результаты, он сам почувствует, что что-то не так, ведь всю жизнь его за эти результаты как раз корили. Поэтому при явно низком тоне удержитесь от того, чтобы на шаге о плюсах говорить о его результатах и эффективности.', true)) +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка F',
              bp('Сделать человека с низкой настойчивостью эффективнее помогает одно — ориентация на результат, на продукт, ведь низкая F как раз на результат не ориентирована. Поэтому руководителю стоит, во-первых, прояснить сотруднику продукт его должности (самый конечный результат, который от него ожидается), а во-вторых, помогать ему увидеть и понять ожидаемый результат каждого действия и задания.') +
              bp('Например, поручая такому сотруднику обзвонить клиентов о конференции, не ограничивайтесь словами «обзвони их», а проясните конкретные результаты: результат первый — каждый в списке точно знает о конференции, её теме и дате и о том, что до Нового года можно внести взнос по льготной цене (это задача-минимум); результат второй — ожидаемое число заявок в финансовую службу на выставление счёта; и, если появится, результат третий — сведения о тех, кто захочет присоединиться позже, переданные их менеджеру. Попросите повторить. Такой десятиминутный разговор — по сути, тот же чек-лист с галочками — заметно снижает влияние низкой настойчивости на выполнение поручения.', true)),
          en:
            '<h2>Chapter 6. Point F. Persistence</h2>' +
            '<p>The key concept of point F is directness. A persistent person acts directly and demonstrates potential: "yes, I can do it, it\'s within my power." A person with low persistence acts cautiously and ineffectively: "well, I\'ll try, let\'s see what can be done." A high F is oriented toward a high result ("next quarter we\'ll jack the figure up by forty percent, and that\'s the minimum"), openly shows its attitude, communicates directly (you don\'t ask again whether it\'s addressed to you). Often it has a "superman-like" approach — "right now, in six seconds!" — and it helps, because those around take fright and run away (perhaps that\'s why he does it). Also, a high F strives to finish any cycle of action and even learns faster — it breaks through the material, does not get bogged down in details. A low F, on the contrary, holds itself back even from showing its opinion, gets bogged down in details instead of the result, and its communication seems to "not quite reach" the interlocutor.</p>' +
            '<p>An important subtlety: if the opponent does not run away but holds his ground, then thrust alone is not enough — here responsibility (point G) already comes into play. If responsibility is low, the "superman" starts whimpering after two minutes — now he\'s tying his shoelaces, now he\'s gone off for cigarettes. But this is a problem not of high persistence but of low responsibility.</p>' +
            '<p>Compulsive persistence is when F is higher than D. The higher persistence in itself, the better (an F of ninety with a D of ninety-eight is superb persistence with a sound "power regulator"). And it is "excessive" precisely when it is higher than D: then it is as if the person\'s power regulator has broken — he keeps "switching on" full thrust and shoots sparrows with a cannon. During a drawn-out smoke break, to rouse thirty workers, such thrust is fitting; but at home, with the wife and daughter, it is hard to dial it down.</p>' +
            '<p>How to speak about point F in the pluses step. If F is very low — this is, of course, caution and ineffectiveness, but positively one can say: "you try not to make mistakes that can be avoided; you\'re careful with people, you try to be pleasant and friendly." (Precisely "with people" — because caution is born of the bank, and it is most often with people that we get burned and make mistakes.) If F is high or compulsive — we speak of the pluses of a high F, and for a compulsive one one can add: "if you really want something, you know how to achieve it; if need be, you can \'lay the knife on the table\' — you said it\'ll be so, and that\'s that; you\'ll break through, you\'ll achieve it; you can be tough, even aggressive." In many situations this is indeed a plus, and he himself values it.</p>' +
            k('KEY IDEA · Before praising for results — look at the tone',
              bp('Attention: before praising a person with a high F for results and effectiveness, be sure to look at points B, G, and H — those that indicate tone. If, together with such persistence, the tone is low (B, G, H low) and the person does not take responsibility for his results, then his results are most likely dismal — crying children, unhappy wives, employees scattering in all directions. And if you begin to praise him for results, he himself will feel that something is off, for all his life he has been reproached for precisely those results. That is why, when the tone is clearly low, refrain from talking in the pluses step about his results and effectiveness.', true)) +
            t('APPLICATION IN HIRING · Operating manual: point F',
              bp('Making a person with low persistence more effective is helped by one thing — an orientation toward the result, toward the product, for a low F is precisely not oriented toward the result. That is why it is worth, first, clarifying for the employee the product of his position (the very final result expected of him), and second, helping him see and understand the expected result of each action and task.') +
              bp('For example, when assigning such an employee to call clients about a conference, do not limit yourself to the words "call them," but clarify the concrete results: result one — everyone on the list knows for sure about the conference, its topic and date, and about the fact that until the New Year one can pay the fee at a discounted price (this is the minimum task); result two — the expected number of applications to the finance service to issue an invoice; and, if it arises, result three — information about those who will want to join later, passed on to their manager. Ask him to repeat it back. Such a ten-minute conversation — in essence the same checklist with ticks — noticeably reduces the effect of low persistence on carrying out the assignment.', true)),
          pl:
            '<h2>Rozdział 6. Punkt F. Wytrwałość</h2>' +
            '<p>Kluczowy koncept punktu F to bezpośredniość. Wytrwały człowiek działa wprost i demonstruje potencjał: „tak, dam radę, jest to w moich siłach". Człowiek z niską wytrwałością działa ostrożnie i nieefektywnie: „no, spróbuję, zobaczymy, co da się zrobić". Wysokie F jest nastawione na wysoki wynik („w następnym kwartale podskoczymy ze wskaźnikiem o czterdzieści procent, i to minimum"), otwarcie pokazuje swój stosunek, komunikuje się wprost (nie dopytujesz, czy do ciebie skierowane). Często ma „supermeńskie" podejście — „już, w sześć sekund!" — i ono pomaga, bo otoczenie się boi i ucieka (być może dlatego on tak robi). Jeszcze wysokie F dąży, żeby zakończyć każdy cykl działania, i nawet uczy się szybciej — przebija się przez materiał, nie grzęźnie w szczegółach. Niskie F, przeciwnie, powstrzymuje się nawet przed pokazaniem swojego zdania, grzęźnie w szczegółach zamiast wyniku, a jego komunikacja jakby „nie dorzuca" do rozmówcy.</p>' +
            '<p>Ważna subtelność: jeśli przeciwnik nie ucieka, lecz się trzyma, to samego naporu za mało — tu w grę wchodzi już odpowiedzialność (punkt G). Jeśli odpowiedzialność jest niska, „superman" po dwóch minutach zaczyna skomleć — to sznurówki wiąże, to po papierosy poszedł. Ale to problem nie wysokiej wytrwałości, lecz niskiej odpowiedzialności.</p>' +
            '<p>Kompulsywna wytrwałość — to gdy F jest wyższe od D. Im wyższa wytrwałość sama w sobie, tym lepiej (F dziewięćdziesiąt przy D dziewięćdziesiąt osiem — to znakomita wytrwałość ze sprawnym „regulatorem mocy"). A „nadmierna" jest właśnie wtedy, gdy jest wyższa od D: wtedy u człowieka jakby zepsuł się regulator mocy — cały czas „włącza" pełny napór i strzela z armaty do wróbli. Na przeciągającej się przerwie na papierosa, żeby poderwać trzydziestu robotników, taki napór jest na miejscu; a oto w domu, z żoną i córką, przykręcić go jest trudno.</p>' +
            '<p>Jak mówić o punkcie F w kroku o plusach. Jeśli F jest bardzo niskie — to oczywiście ostrożność i nieefektywność, ale pozytywnie można powiedzieć: „starasz się nie robić błędów, których można uniknąć; jesteś ostrożny z ludźmi, starasz się być przyjemny i przyjazny". (Właśnie „z ludźmi" — bo ostrożność rodzi się z banku, a parzymy się i mylimy najczęściej właśnie z ludźmi.) Jeśli F jest wysokie albo kompulsywne — mówimy o plusach wysokiego F, a dla kompulsywnego można dodać: „jeśli czegoś bardzo chcesz, wiesz, jak to osiągnąć; jeśli trzeba, możesz i «nóż na stół położyć» — powiedziałeś, że będzie tak, i koniec; przebijesz się, osiągniesz; możesz być twardy, nawet agresywny". W wielu sytuacjach to i naprawdę plus, i on sam to ceni.</p>' +
            k('KLUCZOWA MYŚL · Zanim pochwalisz za wyniki — spójrz na ton',
              bp('Uwaga: zanim pochwalicie człowieka z wysokim F za wyniki i efektywność, obowiązkowo spójrzcie na punkty B, G i H — te, które wskazują ton. Jeśli przy takiej wytrwałości ton jest niski (B, G, H niskie) i człowiek nie bierze odpowiedzialności za swoje wyniki, to wyniki ma najprawdopodobniej opłakane — płaczące dzieci, nieszczęśliwe żony, rozbiegające się załogi. I jeśli zaczniecie chwalić go za wyniki, sam poczuje, że coś jest nie tak, bo całe życie za te wyniki właśnie go łajano. Dlatego przy wyraźnie niskim tonie powstrzymajcie się od mówienia w kroku o plusach o jego wynikach i efektywności.', true)) +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt F',
              bp('Uczynić człowieka z niską wytrwałością bardziej efektywnym pomaga jedno — nastawienie na wynik, na produkt, bo niskie F właśnie na wynik nie jest nastawione. Dlatego kierownikowi warto, po pierwsze, wyjaśnić pracownikowi produkt jego stanowiska (najbardziej końcowy wynik, którego się od niego oczekuje), a po drugie, pomagać mu zobaczyć i zrozumieć oczekiwany wynik każdego działania i zadania.') +
              bp('Na przykład, zlecając takiemu pracownikowi obdzwonienie klientów w sprawie konferencji, nie ograniczajcie się do słów „obdzwoń ich", lecz wyjaśnijcie konkretne wyniki: wynik pierwszy — każdy na liście dokładnie wie o konferencji, jej temacie i dacie oraz o tym, że do Nowego Roku można wnieść składkę po cenie promocyjnej (to zadanie-minimum); wynik drugi — oczekiwana liczba zgłoszeń do służby finansowej na wystawienie faktury; i, jeśli się pojawi, wynik trzeci — informacje o tych, którzy zechcą dołączyć później, przekazane ich menedżerowi. Poproście o powtórzenie. Taka dziesięciominutowa rozmowa — w istocie ten sam checklist z ptaszkami — zauważalnie obniża wpływ niskiej wytrwałości na wykonanie zlecenia.', true)),
        },
      },
    ],
    quiz: {
      passScore: 60,
      questions: [
        {
          q: {
            ru: 'В чём суть приёма «разворот упрямства» при очень высокой D?',
            en: 'What is the essence of the "reversing the stubbornness" technique when D is very high?',
            pl: 'Na czym polega istota chwytu „odwrócenie uporu" przy bardzo wysokim D?',
          },
          opts: [
            {
              ru: 'Установить «тебя нелегко изменить» и заявить, что человек всё знает и не изменится, — чтобы он сам начал возражать и настаивать, что способен измениться',
              en: 'Establish "you\'re not easy to change" and declare that the person already knows everything and won\'t change — so that he himself begins to object and insist that he is capable of changing',
              pl: 'Ustalić „niełatwo cię zmienić" i oświadczyć, że człowiek wszystko wie i się nie zmieni — żeby sam zaczął oponować i nalegać, że jest zdolny się zmienić',
            },
            {
              ru: 'Прямо доказывать человеку, что он неправ, пока он не согласится',
              en: 'Directly prove to the person that he is wrong until he agrees',
              pl: 'Wprost udowadniać człowiekowi, że nie ma racji, aż się zgodzi',
            },
            {
              ru: 'Полностью избегать разговора о минусах, чтобы не спорить',
              en: 'Completely avoid talking about the minuses in order not to argue',
              pl: 'Całkowicie unikać rozmowy o minusach, żeby się nie spierać',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что такое реальность в законе треугольника АРО?',
            en: 'What is reality in the law of the ARC triangle?',
            pl: 'Czym jest rzeczywistość w prawie trójkąta ARC?',
          },
          opts: [
            {
              ru: 'То, что происходит на самом деле, независимо от людей',
              en: 'That which actually happens, independently of people',
              pl: 'To, co dzieje się naprawdę, niezależnie od ludzi',
            },
            {
              ru: 'Согласие — то, с чем человек согласен, а не обязательно то, что происходит на самом деле',
              en: 'Agreement — that with which a person agrees, and not necessarily that which actually happens',
              pl: 'Zgoda — to, z czym człowiek się zgadza, a niekoniecznie to, co dzieje się naprawdę',
            },
            {
              ru: 'Степень дружеского расположения к чему-либо',
              en: 'The degree of friendly disposition toward something',
              pl: 'Stopień przyjaznego usposobienia do czegoś',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'С чего правильно начинать, когда вы хотите изменить реальность человека?',
            en: 'Where is it correct to begin when you want to change a person\'s reality?',
            pl: 'Od czego prawidłowo zaczynać, gdy chcecie zmienić rzeczywistość człowieka?',
          },
          opts: [
            {
              ru: 'Сразу убеждать его в своей правоте и говорить о своей реальности',
              en: 'Immediately convince him of your rightness and talk about your reality',
              pl: 'Od razu przekonywać go o swojej racji i mówić o swojej rzeczywistości',
            },
            {
              ru: 'С его реальности — с того, с чем он согласен, плавно разматывая её в свою сторону',
              en: 'With his reality — with what he agrees with, smoothly unwinding it in your direction',
              pl: 'Od jego rzeczywistości — od tego, z czym się zgadza, płynnie rozwijając ją w swoją stronę',
            },
            {
              ru: 'С указания на его ошибки и минусы',
              en: 'By pointing out his mistakes and minuses',
              pl: 'Od wskazania jego błędów i minusów',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что помогает сделать человека с низкой настойчивостью (F) эффективнее?',
            en: 'What helps make a person with low persistence (F) more effective?',
            pl: 'Co pomaga uczynić człowieka z niską wytrwałością (F) bardziej efektywnym?',
          },
          opts: [
            {
              ru: 'Требовать от него больше напора и жёсткости',
              en: 'Demand more thrust and toughness from him',
              pl: 'Wymagać od niego więcej naporu i twardości',
            },
            {
              ru: 'Давать ему как можно больше нового, чтобы он не скучал',
              en: 'Give him as much of the new as possible so that he does not get bored',
              pl: 'Dawać mu jak najwięcej nowego, żeby się nie nudził',
            },
            {
              ru: 'Ориентация на результат: прояснить продукт должности и ожидаемый результат каждого задания',
              en: 'Orientation toward the result: clarify the product of the position and the expected result of each task',
              pl: 'Nastawienie na wynik: wyjaśnić produkt stanowiska i oczekiwany wynik każdego zadania',
            },
          ],
          correct: 2,
        },
      ],
    },
  },
};
