'use strict';
// Контент программы «Личностные качества (Оценка тестов: Основа)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-assessment'.

// Врезки-боксы 1-в-1 из программы productivity-winners.
// b — нейтральный серый (ПРИМЕР / НА ЗАМЕТКУ), k — фиолетовый (КЛЮЧЕВАЯ ИДЕЯ / ЗАПОМНИТЕ / ОПРЕДЕЛЕНИЕ),
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
  'module-assessment': {
    trailer: { ru: 'https://tnemvzaxtgumtvijpfli.supabase.co/storage/v1/object/public/media/learning/prog7-trailer-ru.mp4', pl: '', en: '' },
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: {
          ru: 'Оценка тестов: основы · Введение',
          en: 'Test assessment: the fundamentals · Introduction',
          pl: 'Ocena testów: podstawy · Wprowadzenie',
        },
        desc: {
          ru: 'Зачем нужна оценка теста и кому её вообще имеет смысл предоставлять.',
          en: 'Why a test assessment is needed and to whom it makes sense to deliver it at all.',
          pl: 'Po co potrzebna jest ocena testu i komu w ogóle ma sens ją przekazywać.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 4 · ОЦЕНКА ТЕСТОВ</strong></p>' +
            '<p>Оценка тестов: основы</p>' +
            '<p>Как тест помогает усиливать сотрудников: истина и ложь за точками теста, наблюдение и конфронт — и почему во время оценки главное дать человеку увидеть самому.</p>' +
            '<h2>Модуль 4. Оценка тестов: основы</h2>' +
            '<p>В предыдущем модуле мы разобрали, что делать с сотрудником в первые часы и дни. Теперь обратимся к самому тесту — но с другой стороны, чем при найме. При найме мы решаем, брать человека или нет. Здесь же сотрудник уже нанят, и наша задача — использовать его Тест Тулс как «инструкцию по эксплуатации» этого человека и как инструмент, чтобы его усилить: помочь ему работать и чувствовать себя лучше.</p>' +
            '<p>Заниматься этим может кто угодно, и в первую очередь — любой руководитель. Взять чей-то тест и сесть поговорить с человеком, а то и просто посмотреть на тест и понять, как с ним лучше себя вести, — почти всегда очень полезно. И ещё одна важная вещь: то, о чём пойдёт речь, нужно даже тем, кто занимается только наймом. Мы будем глубже изучать тест — а это меняет взгляд на него. При найме мы смотрим на тест в основном с отрицательной стороны, вырабатывается критический подход, и многие в итоге не могут никого нанять, потому что «у всех тесты плохие». Узнав то, что мы разберём в этом модуле, вы будете спокойнее смотреть на минусы теста — и это помогает даже просто нанимать.</p>' +
            '<p>В этом модуле мы заложим теоретическую основу: разберём, что такое истина и ложь и как за ними стоит каждая точка теста, что такое наблюдение и конфронт и почему главная цель оценки — чтобы человек увидел что-то сам. А конкретные шаги предоставления оценки мы разберём в следующем модуле.</p>' +
            '<h3>Глава 1. Кому предоставлять оценку теста — и кому нет</h3>' +
            '<p>Начнём с важнейшего ограничения: оценку теста имеет смысл предоставлять только продуктивным сотрудникам. Человеку, на которого навалился реактивный ум (или просто непродуктивному), это, во-первых, бесполезно, а во-вторых, порой даже вредно.</p>' +
            '<p>Почему бесполезно? Чтобы усилиться, человек должен что-то осознать, а чтобы осознать — увидеть различия. Но чтобы что-то увидеть, нужно пространство. Вспомните: чтобы показать разницу между двумя предметами, их помещают в комнату, где вы находитесь, а не в соседнюю — иначе стена не даёт их разглядеть. У человека, у которого банк отодвинут (обмен в порядке), пространство есть, и различия ему показать можно. А у того, на кого банк навалился, картинки реактивного ума встают стеной и не дают ничего разглядеть — объяснять ему что-либо бесполезно, вы будете лишь «кормить банк».</p>' +
            '<p>Почему вредно? Представьте: вы протестировали непродуктивного сотрудника, увидели ужасный тест, но всё же взялись предоставлять ему оценку и «уговаривать», — а через две недели всё равно уволили. За что вы его «уговаривали»? А со стороны все подумают: уволили «за тест». И с этого момента у вас начинаются сложности — сотрудники начинают бояться тестироваться.</p>' +
            '<p>Что же делать с тем, на кого навалился банк? Единственное, что работает, — оказать на него давление сильнее, чем давит на него банк (мы называем это методами этического воздействия — от простого к сильному: посмотреть, поговорить, повысить голос, назначить расследование, поставить жёсткую цель). Под вашим давлением человек отодвигает банк — и вот тогда с ним уже можно разговаривать. А как отличить одного от другого? Продуктивный приносит пользу через обмен; тот, на кого навалился банк, пользы не приносит.</p>',
          en:
            '<p><strong>MODULE 4 · TEST ASSESSMENT</strong></p>' +
            '<p>Test assessment: the fundamentals</p>' +
            '<p>How the test helps to strengthen employees: truth and falsehood behind the points of the test, observation and confront — and why, during an assessment, the main thing is to let the person see for himself.</p>' +
            '<h2>Module 4. Test assessment: the fundamentals</h2>' +
            '<p>In the previous module we examined what to do with an employee in the first hours and days. Now let us turn to the test itself — but from a different side than in hiring. In hiring we decide whether to take the person or not. Here, however, the employee has already been hired, and our task is to use his Tools Test as an "operating manual" for this person and as a tool for strengthening him: to help him work and feel better.</p>' +
            '<p>Anyone can occupy himself with this, and above all — any manager. To take someone\'s test and sit down to talk with the person, or even simply to look at the test and understand how best to behave with him, is almost always very useful. And one more important thing: what is about to be discussed is needed even by those who deal only with hiring. We will study the test more deeply — and this changes one\'s view of it. In hiring we look at the test mainly from the negative side, a critical approach develops, and many end up unable to hire anyone, because "everyone\'s tests are bad." Having learned what we will examine in this module, you will look more calmly at the minuses of the test — and this helps even simply in hiring.</p>' +
            '<p>In this module we will lay the theoretical foundation: we will examine what truth and falsehood are and how each point of the test stands behind them, what observation and confront are, and why the main goal of an assessment is for the person to see something for himself. And the concrete steps of delivering an assessment we will examine in the next module.</p>' +
            '<h3>Chapter 1. To whom to deliver a test assessment — and to whom not</h3>' +
            '<p>Let us begin with the most important restriction: it makes sense to deliver a test assessment only to productive employees. For a person on whom the reactive mind has piled up (or one who is simply unproductive), it is, first, useless, and second, at times even harmful.</p>' +
            '<p>Why useless? In order to grow stronger, a person must become aware of something, and in order to become aware — see differences. But in order to see something, space is needed. Recall: to show the difference between two objects, they are placed in the room where you are, not in the next one — otherwise the wall does not let you make them out. In a person whose bank is pushed away (whose exchange is in order), there is space, and differences can be shown to him. But in one on whom the bank has piled up, the pictures of the reactive mind stand as a wall and let nothing be made out — explaining anything to him is useless, you will only be "feeding the bank."</p>' +
            '<p>Why harmful? Imagine: you tested an unproductive employee, saw a dreadful test, but took to delivering him an assessment and "talking him round" anyway — and two weeks later fired him all the same. What were you "talking him round" for? And from the outside everyone will think: he was fired "for the test." And from that moment your difficulties begin — employees start being afraid to be tested.</p>' +
            '<p>So what is to be done with the one on whom the bank has piled up? The only thing that works is to exert on him a pressure stronger than the one the bank is exerting on him (we call this methods of ethical pressure — from mild to strong: to look, to talk, to raise one\'s voice, to assign an investigation, to set a hard target). Under your pressure the person pushes the bank away — and it is then that one can already talk with him. And how to tell one from the other? A productive person brings benefit through exchange; one on whom the bank has piled up brings no benefit.</p>',
          pl:
            '<p><strong>MODUŁ 4 · OCENA TESTÓW</strong></p>' +
            '<p>Ocena testów: podstawy</p>' +
            '<p>Jak test pomaga wzmacniać pracowników: prawda i fałsz za punktami testu, obserwacja i konfront — i dlaczego podczas oceny najważniejsze jest dać człowiekowi zobaczyć samemu.</p>' +
            '<h2>Moduł 4. Ocena testów: podstawy</h2>' +
            '<p>W poprzednim module omówiliśmy, co robić z pracownikiem w pierwszych godzinach i dniach. Teraz zwróćmy się do samego testu — ale z innej strony niż przy rekrutacji. Przy rekrutacji decydujemy, brać człowieka czy nie. Tu zaś pracownik jest już zatrudniony, i naszym zadaniem jest wykorzystać jego Test Tools jako „instrukcję obsługi” tego człowieka i jako narzędzie, żeby go wzmocnić: pomóc mu pracować i czuć się lepiej.</p>' +
            '<p>Zajmować się tym może ktokolwiek, a w pierwszej kolejności — każdy kierownik. Wziąć czyjś test i usiąść porozmawiać z człowiekiem, a choćby po prostu spojrzeć na test i zrozumieć, jak lepiej się z nim zachowywać — prawie zawsze jest bardzo pożyteczne. I jeszcze jedna ważna rzecz: to, o czym będzie mowa, potrzebne jest nawet tym, którzy zajmują się tylko rekrutacją. Będziemy głębiej studiować test — a to zmienia spojrzenie na niego. Przy rekrutacji patrzymy na test głównie z negatywnej strony, wyrabia się podejście krytyczne, i wielu w efekcie nie może nikogo zatrudnić, bo „u wszystkich testy są złe”. Poznawszy to, co omówimy w tym module, będziecie spokojniej patrzeć na minusy testu — a to pomaga nawet po prostu zatrudniać.</p>' +
            '<p>W tym module założymy podstawę teoretyczną: omówimy, czym jest prawda i fałsz i jak za nimi stoi każdy punkt testu, czym jest obserwacja i konfront i dlaczego głównym celem oceny jest to, żeby człowiek coś zobaczył sam. A konkretne kroki przekazywania oceny omówimy w następnym module.</p>' +
            '<h3>Rozdział 1. Komu przekazywać ocenę testu — a komu nie</h3>' +
            '<p>Zacznijmy od najważniejszego ograniczenia: ocenę testu ma sens przekazywać tylko produktywnym pracownikom. Człowiekowi, na którego zwalił się umysł reaktywny (albo po prostu nieproduktywnemu), jest to, po pierwsze, bezużyteczne, a po drugie, czasem nawet szkodliwe.</p>' +
            '<p>Dlaczego bezużyteczne? Żeby się wzmocnić, człowiek musi coś sobie uświadomić, a żeby uświadomić — zobaczyć różnice. Ale żeby coś zobaczyć, potrzebna jest przestrzeń. Przypomnijcie sobie: żeby pokazać różnicę między dwoma przedmiotami, umieszcza się je w pokoju, w którym się znajdujecie, a nie w sąsiednim — inaczej ściana nie pozwala ich obejrzeć. U człowieka, u którego bank jest odsunięty (wymiana w porządku), przestrzeń jest, i różnice można mu pokazać. A u tego, na kogo zwalił się bank, obrazy umysłu reaktywnego stają ścianą i nie pozwalają niczego obejrzeć — objaśniać mu cokolwiek jest bezużyteczne, będziecie tylko „karmić bank”.</p>' +
            '<p>Dlaczego szkodliwe? Wyobraźcie sobie: przetestowaliście nieproduktywnego pracownika, zobaczyliście okropny test, ale mimo to wzięliście się za przekazywanie mu oceny i „namawianie” — a po dwóch tygodniach i tak go zwolniliście. Za co go „namawialiście”? A z boku wszyscy pomyślą: zwolniono „za test”. I od tego momentu zaczynają się u was trudności — pracownicy zaczynają bać się testowania.</p>' +
            '<p>Co więc robić z tym, na kogo zwalił się bank? Jedyne, co działa, to wywrzeć na niego nacisk silniejszy, niż naciska na niego bank (nazywamy to metodami nacisku etycznego — od prostego do silnego: popatrzeć, porozmawiać, podnieść głos, wyznaczyć dochodzenie, postawić twardy cel). Pod waszym naciskiem człowiek odsuwa bank — i oto wtedy już można z nim rozmawiać. A jak odróżnić jednego od drugiego? Produktywny przynosi pożytek przez wymianę; ten, na kogo zwalił się bank, pożytku nie przynosi.</p>',
        },
      },

      // 2 — ИСТИНА И ЛОЖЬ
      {
        id: 'truth-lie',
        title: {
          ru: 'Истина и ложь: как что-то улучшается',
          en: 'Truth and falsehood: how anything gets improved',
          pl: 'Prawda i fałsz: jak coś się ulepsza',
        },
        desc: {
          ru: 'Что такое истина и ложь и почему за каждой низкой точкой теста стоит ложь.',
          en: 'What truth and falsehood are and why behind every low point of the test stands a lie.',
          pl: 'Czym jest prawda i fałsz i dlaczego za każdym niskim punktem testu stoi fałsz.',
        },
        html: {
          ru:
            '<h2>Глава 2. Истина и ложь: как вообще что-то улучшается</h2>' +
            '<p>Теперь немного теории. Поговорим о таком слове, как истина (по-английски — truth, то есть и «истина», и «правда»).</p>' +
            '<p>Вот определение, которое дал Рон Хаббард. Сначала короткое: истина — это то, что работает. Например, формула несуществования — истина, потому что она работает; закон обмена — истина, потому что работает. Но у определения есть важное продолжение.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Истина — это то, что работает. То, что работает в наибольшем количестве случаев в той области, в которой это применяют.', true)) +
            '<p>Вторая часть определения принципиальна. Допустим, кто-то однажды в сердцах поступил жёстко, и это дало результат. Значит ли это, что жёсткость — истина? Нет: истина проверяется не одним случаем, а большинством. Именно поэтому «готовые рецепты» ценности не имеют: готовый рецепт — это то, что сработало в какой-то одной компании, а это ещё не значит, что он сработает в остальных девяноста девяти. А вот глубокий принцип может быть истиной — тогда, когда он работает везде. Кто-то поголодал сорок дней и, по его словам, вылечился от всех болезней; но если так поступят сто человек, подозреваю, что у большинства прибавятся хотя бы нервные болезни. Один случай — это ещё не истина. Нам с вами нужны именно истины: не красивые и поэтичные данные, а те, что работают с большинством, — потому что мы приходим за тем, что действительно поможет с сотрудниками.</p>' +
            '<p>Почему мы так часто цитируем Хаббарда? По одной причине: он был несравненным мастером в изречении истин, а истины нам и нужны.</p>' +
            '<p>Есть и обратная сторона. Ложь — это то, что не работает. А улучшаем мы что-либо так: находим то, что не работает (ложь), а увидев ложь, видим и правду; когда же правда найдена, ложь исчезает. Одна из моих любимых цитат Хаббарда звучит так:</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('«Проблема, чтобы быть проблемой, должна содержать ложь». Если что-то не работает — значит, там есть ложь: будь там одна правда, всё бы работало. Поэтому, чтобы решить проблему, надо найти в ней ложь и правду — и как только правда найдена, проблема разрешается.', true)) +
            '<p>Примеров тому сколько угодно. Классический — «незаменимый» бухгалтер, который чуть ли не садится руководителю на шею, а уволить его боятся: «без неё никто не разберётся, у неё все ключи и шифры». Где здесь ложь? В том, что она незаменима. Именно так действуют высшие аферисты — заставляют всех чувствовать себя незаменимыми. А когда её наконец увольняют, выясняется, что новый человек делает её работу за семьдесят процентов времени, да ещё и другую в придачу. Два года руководитель верил в ложь о её незаменимости.</p>' +
            '<h3>Глава 3. За каждой низкой точкой стоит ложь</h3>' +
            '<p>Теперь свяжем это напрямую с тестом. Тест личностных качеств показывает, по сути, картинку реактивного ума человека — картинку его нерациональности в той или иной области. А что такое нерациональность? Это когда что-то не работает, не даёт результата. А если что-то не работает — значит, там есть ложь. Отсюда простой, но важный вывод: за каждой низкой точкой теста стоит какая-то ложь.</p>' +
            '<p>Что же нужно, чтобы человека усилить и поднять ему точку — сделать его более рациональным в этой области? Нужно, чтобы он увидел истину. Когда он увидит истину, ложь уйдёт, он станет рациональнее — то есть точка поднимется. На этом и основано усиление сотрудников по технологии найма HR-PRO.AI.</p>' +
            '<p>Значит, наша задача — чтобы человек сам что-то увидел и что-то от нас услышал, а вовсе не чтобы мы выдали ему готовый рецепт: «у тебя то-то плохо, делай то-то». Такие рецепты нам всю жизнь выдают — родители, воспитатели, мужья, жёны, — и толку от них ноль, а то и минус: настолько часто это раздражает.</p>' +
            b('ПРИМЕР · Ребёнок, который сам сказал правду',
              bp('Маленький сын идёт чистить зубы. Вы слышите: хлоп дверцей на кухне, шлёп-шлёп босыми ногами обратно. Идёте — мокрые следы ведут на кухню, там гора конфетных фантиков, следы обратно. «Иди-ка сюда. Это что такое?» — «Это не я». Не «а что это», а сразу «это не я». Тогда спокойно, без наказания: «Не поможешь мне разобраться? Смотри, мокрые следы — это твои ножки, и на стуле отпечаток твоей ноги. Так объясни мне, я не понимаю». И в какой-то момент он говорит: «Это я, я съел конфеты». Вот в этот момент всё уже произошло: он посмотрел, сконфронтировал правду и, набравшись смелости, сказал её. Больше ничего делать не надо — надо просто сказать «молодец, что сказал мне правду», и всё. И горе тем родителям, которые в этот момент начинают наказывать: ребёнок вынесет ровно один урок — «этим не надо говорить правду».') +
              bp('То же с сотрудником, который потратил общие деньги на себя: если он сам это сконфронтирует и скажет начальнику, а тот, не будучи идиотом, ответит «спасибо, что сказал», — деньги, скорее всего, вернутся, и повторяться это не будет.', true)) +
            '<p>Иногда одна брошенная фраза застревает в человеке на десятилетия. Кто-то в детстве, обидев, назвал вас идиотом — и вы тридцать пять лет про себя это повторяете. Как только человек увидит правду (что он вовсе не идиот, а это просто когда-то сказал кто-то, кому было выгодно), ложь уходит.</p>' +
            '<p>Вот почему оценку теста не может выдать компьютер. Компьютер, может, и умнее человека и способен «выплюнуть» текст оценки — но задача не в том, чтобы выдать человеку текст, а в том, чтобы он на что-то посмотрел и что-то увидел. Это компьютеру не под силу.</p>',
          en:
            '<h2>Chapter 2. Truth and falsehood: how anything gets improved at all</h2>' +
            '<p>Now a bit of theory. Let us talk about such a word as truth. (In Russian there are two words for this — истина and правда — and the single English word "truth" covers both of them.)</p>' +
            '<p>Here is the definition Ron Hubbard gave. First the short one: truth is that which works. For example, the formula of non-existence is truth, because it works; the law of exchange is truth, because it works. But the definition has an important continuation.</p>' +
            k('DEFINITION',
              bp('Truth is that which works. That which works in the greatest number of cases in the area in which it is applied.', true)) +
            '<p>The second part of the definition is fundamental. Suppose someone once, in a fit of temper, acted harshly, and it produced a result. Does that mean that harshness is truth? No: truth is verified not by a single case but by the majority. That is precisely why "ready-made recipes" have no value: a ready-made recipe is something that worked in some one company, and that does not yet mean it will work in the other ninety-nine. A deep principle, on the other hand, can be truth — when it works everywhere. Someone fasted for forty days and, by his own account, cured himself of all illnesses; but if a hundred people do the same, I suspect that most will acquire at least some nervous illnesses. A single case is not yet truth. What you and I need is precisely truths: not beautiful and poetic data, but those that work with the majority — because we are coming for what will really help with employees.</p>' +
            '<p>Why do we cite Hubbard so often? For one reason: he was an unrivaled master at the utterance of truths, and truths are exactly what we need.</p>' +
            '<p>There is also the reverse side. A falsehood is that which does not work. And we improve anything like this: we find what does not work (the falsehood), and having seen the falsehood, we see the truth as well; and once the truth is found, the falsehood vanishes. One of my favorite Hubbard quotes goes like this:</p>' +
            k('KEY IDEA',
              bp('"A problem, in order to be a problem, must contain a lie." If something does not work — it means there is a lie in it: were there only truth, everything would work. Therefore, to solve a problem, one must find the lie and the truth in it — and as soon as the truth is found, the problem is resolved.', true)) +
            '<p>There are any number of examples of this. The classic one is the "irreplaceable" bookkeeper, who all but climbs onto the manager\'s neck, and whom they are afraid to fire: "without her no one will figure things out, she has all the keys and codes." Where is the lie here? In the fact that she is irreplaceable. This is exactly how the top swindlers operate — they make everyone feel irreplaceable. And when she is finally fired, it turns out that the new person does her work in seventy percent of the time, and another job on top of that. For two years the manager believed the lie about her irreplaceability.</p>' +
            '<h3>Chapter 3. Behind every low point stands a lie</h3>' +
            '<p>Now let us connect this directly to the test. The personality-traits test shows, in essence, a picture of the person\'s reactive mind — a picture of his irrationality in one area or another. And what is irrationality? It is when something does not work, does not produce a result. And if something does not work — it means there is a lie in it. Hence a simple but important conclusion: behind every low point of the test stands some lie.</p>' +
            '<p>So what is needed in order to strengthen a person and raise a point for him — to make him more rational in that area? He needs to see the truth. When he sees the truth, the lie will go, he will become more rational — that is, the point will rise. This is exactly what the strengthening of employees in the HR-PRO.AI hiring technology is based on.</p>' +
            '<p>That means our task is for the person to see something himself and to hear something from us, and not at all for us to hand him a ready-made recipe: "you have such-and-such a problem, do such-and-such." Such recipes are handed to us all our lives — by parents, educators, husbands, wives — and the use of them is nil, or even a minus: so often does it irritate.</p>' +
            b('EXAMPLE · A child who told the truth himself',
              bp('The little son goes to brush his teeth. You hear: the slam of the cupboard door in the kitchen, the slap-slap of bare feet coming back. You go — wet footprints lead to the kitchen, there is a heap of candy wrappers, footprints leading back. "Come here. What is this?" — "It wasn\'t me." Not "what is this," but at once "it wasn\'t me." Then, calmly, without punishment: "Won\'t you help me figure it out? Look, the wet footprints are your little feet, and on the chair there\'s a print of your foot. So explain it to me, I don\'t understand." And at some point he says: "It was me, I ate the candy." Now, at that moment, everything has already happened: he looked, confronted the truth, and, having plucked up his courage, told it. Nothing more need be done — one need only say "well done for telling me the truth," and that is all. And woe to those parents who at that moment begin to punish: the child will take away exactly one lesson — "these people must not be told the truth."') +
              bp('The same with an employee who spent shared money on himself: if he confronts it himself and tells the boss, and the boss, not being an idiot, answers "thank you for telling me" — the money will most likely come back, and it will not happen again.', true)) +
            '<p>Sometimes a single tossed-off phrase lodges in a person for decades. Someone in childhood, wishing to hurt, called you an idiot — and for thirty-five years you have been repeating it to yourself. As soon as the person sees the truth (that he is not an idiot at all, and that it was simply once said by someone to whom it was advantageous), the lie goes away.</p>' +
            '<p>That is why a computer cannot deliver a test assessment. A computer may even be smarter than a person and able to "spit out" the text of an assessment — but the task is not to hand the person a text, it is for him to look at something and see something. That is beyond a computer\'s power.</p>',
          pl:
            '<h2>Rozdział 2. Prawda i fałsz: jak w ogóle coś się ulepsza</h2>' +
            '<p>Teraz trochę teorii. Porozmawiajmy o takim słowie jak prawda (ros. истина; po angielsku — truth, czyli słowo, które obejmuje zarówno „истину”, jak i „правду”).</p>' +
            '<p>Oto definicja, którą podał Ron Hubbard. Najpierw krótka: prawda to to, co działa. Na przykład formuła nieistnienia jest prawdą, bo działa; prawo wymiany jest prawdą, bo działa. Ale definicja ma ważny ciąg dalszy.</p>' +
            k('DEFINICJA',
              bp('Prawda to to, co działa. To, co działa w największej liczbie przypadków w tej dziedzinie, w której to się stosuje.', true)) +
            '<p>Druga część definicji jest zasadnicza. Załóżmy, że ktoś raz w uniesieniu postąpił twardo, i to dało wynik. Czy znaczy to, że twardość jest prawdą? Nie: prawdy nie sprawdza się jednym przypadkiem, lecz większością. Właśnie dlatego „gotowe recepty” nie mają wartości: gotowa recepta to coś, co zadziałało w jakiejś jednej firmie, a to jeszcze nie znaczy, że zadziała w pozostałych dziewięćdziesięciu dziewięciu. A oto głęboka zasada może być prawdą — wtedy, gdy działa wszędzie. Ktoś pościł czterdzieści dni i, według swoich słów, wyleczył się ze wszystkich chorób; ale jeśli tak postąpi stu ludzi, podejrzewam, że u większości przybędzie przynajmniej chorób nerwowych. Jeden przypadek to jeszcze nie prawda. Nam z wami potrzebne są właśnie prawdy: nie piękne i poetyckie dane, lecz te, które działają z większością — bo przychodzimy po to, co naprawdę pomoże z pracownikami.</p>' +
            '<p>Dlaczego tak często cytujemy Hubbarda? Z jednego powodu: był niezrównanym mistrzem w wypowiadaniu prawd, a prawdy są nam właśnie potrzebne.</p>' +
            '<p>Jest i strona odwrotna. Fałsz to to, co nie działa. A ulepszamy cokolwiek tak: znajdujemy to, co nie działa (fałsz), a zobaczywszy fałsz, widzimy i prawdę; gdy zaś prawda jest znaleziona, fałsz znika. Jeden z moich ulubionych cytatów Hubbarda brzmi tak:</p>' +
            k('KLUCZOWA MYŚL',
              bp('„Problem, żeby być problemem, musi zawierać fałsz”. Jeśli coś nie działa — znaczy, że jest tam fałsz: gdyby była tam sama prawda, wszystko by działało. Dlatego, żeby rozwiązać problem, trzeba znaleźć w nim fałsz i prawdę — i gdy tylko prawda zostaje znaleziona, problem się rozwiązuje.', true)) +
            '<p>Przykładów na to bez liku. Klasyczny — „niezastąpiona” księgowa, która niemal wchodzi kierownikowi na głowę, a zwolnić jej się boją: „bez niej nikt się nie połapie, ma wszystkie klucze i szyfry”. Gdzie tu fałsz? W tym, że jest niezastąpiona. Właśnie tak działają najwięksi kanciarze — sprawiają, że wszyscy czują się niezastąpieni. A gdy ją w końcu zwalniają, okazuje się, że nowy człowiek wykonuje jej pracę w siedemdziesiąt procent czasu, a do tego jeszcze inną w dodatku. Dwa lata kierownik wierzył w fałsz o jej niezastąpioności.</p>' +
            '<h3>Rozdział 3. Za każdym niskim punktem stoi fałsz</h3>' +
            '<p>Teraz powiążmy to wprost z testem. Test cech osobowości pokazuje w istocie obraz umysłu reaktywnego człowieka — obraz jego nieracjonalności w tej czy innej dziedzinie. A czym jest nieracjonalność? To gdy coś nie działa, nie daje wyniku. A jeśli coś nie działa — znaczy, że jest tam fałsz. Stąd prosty, ale ważny wniosek: za każdym niskim punktem testu stoi jakiś fałsz.</p>' +
            '<p>Co więc jest potrzebne, żeby człowieka wzmocnić i podnieść mu punkt — uczynić go bardziej racjonalnym w tej dziedzinie? Potrzeba, żeby zobaczył prawdę. Gdy zobaczy prawdę, fałsz odejdzie, stanie się bardziej racjonalny — czyli punkt się podniesie. Na tym właśnie opiera się wzmacnianie pracowników w technologii rekrutacji HR-PRO.AI.</p>' +
            '<p>Znaczy to, że naszym zadaniem jest, żeby człowiek sam coś zobaczył i coś od nas usłyszał, a wcale nie żebyśmy wydali mu gotową receptę: „u ciebie jest to a to źle, rób to a to”. Takie recepty wydają nam przez całe życie — rodzice, wychowawcy, mężowie, żony — a pożytku z nich zero, a to i minus: tak często to irytuje.</p>' +
            b('PRZYKŁAD · Dziecko, które samo powiedziało prawdę',
              bp('Mały synek idzie myć zęby. Słyszycie: trzask drzwiczkami w kuchni, plaskanie bosych stóp z powrotem. Idziecie — mokre ślady prowadzą do kuchni, tam góra papierków po cukierkach, ślady z powrotem. „Chodź no tu. Co to takiego?” — „To nie ja”. Nie „a co to”, lecz od razu „to nie ja”. Wtedy spokojnie, bez kary: „Nie pomożesz mi się połapać? Popatrz, mokre ślady — to twoje nóżki, i na krześle odcisk twojej stopy. To wyjaśnij mi, bo nie rozumiem”. I w którymś momencie mówi: „To ja, zjadłem cukierki”. Otóż w tym momencie wszystko już się dokonało: popatrzył, skonfrontował prawdę i, zebrawszy się na odwagę, powiedział ją. Więcej nic robić nie trzeba — trzeba po prostu powiedzieć „brawo, że powiedziałeś mi prawdę”, i tyle. I biada tym rodzicom, którzy w tym momencie zaczynają karać: dziecko wyniesie dokładnie jedną lekcję — „tym nie należy mówić prawdy”.') +
              bp('Tak samo z pracownikiem, który wydał wspólne pieniądze na siebie: jeśli sam to skonfrontuje i powie szefowi, a ten, nie będąc idiotą, odpowie „dziękuję, że powiedziałeś” — pieniądze najprawdopodobniej wrócą, i powtarzać się to nie będzie.', true)) +
            '<p>Czasem jedno rzucone zdanie tkwi w człowieku przez dziesięciolecia. Ktoś w dzieciństwie, obraziwszy, nazwał was idiotą — i wy trzydzieści pięć lat w duchu to sobie powtarzacie. Gdy tylko człowiek zobaczy prawdę (że wcale nie jest idiotą, a to po prostu ktoś kiedyś powiedział, komu było to na rękę), fałsz odchodzi.</p>' +
            '<p>Oto dlaczego oceny testu nie może wydać komputer. Komputer może i jest mądrzejszy od człowieka i zdolny „wypluć” tekst oceny — ale zadanie nie polega na tym, żeby wydać człowiekowi tekst, lecz na tym, żeby on na coś popatrzył i coś zobaczył. To komputerowi nie jest pod siłę.</p>',
        },
      },

      // 3 — СПОСОБНОСТЬ, НАБЛЮДЕНИЕ, КОНФРОНТ
      {
        id: 'observe-confront',
        title: {
          ru: 'Способность: наблюдать, решать, действовать',
          en: 'Ability: to observe, decide, and act',
          pl: 'Zdolność: obserwować, decydować i działać',
        },
        desc: {
          ru: 'Почему наблюдение и конфронт — основа усиления и почему труднее всего наблюдать людей.',
          en: 'Why observation and confront are the basis of strengthening and why people are hardest to observe.',
          pl: 'Dlaczego obserwacja i konfront są podstawą wzmacniania i dlaczego najtrudniej obserwować ludzi.',
        },
        html: {
          ru:
            '<h2>Глава 4. Способность — это наблюдать, принимать решения и действовать</h2>' +
            '<p>Мы хотим сделать сотрудника способнее. А что такое способность? Вот определение Хаббарда:</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Способность — это способность наблюдать, принимать решения и действовать. Она состоит из трёх вещей: наблюдать, принимать решения и действовать.', true)) +
            '<p>Самое главное здесь — первое: наблюдать. Это очень непривычный подход. В школе, в институте, в семье нас учат в основном тому, как действовать (в крайнем случае — как принимать решения), а с этим никто не может разобраться именно потому, что всё зависит от наблюдения. А наблюдать — это очень близко к тому, чтобы конфронтировать.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Конфронтировать — значит быть чем-то лицом к лицу: не избегая, не уклоняясь, не пытаясь этого избежать, чувствуя себя комфортно и воспринимая правильно.', true)) +
            '<p>Вернёмся к тому, что каждая проблема содержит ложь. Чтобы её решить, надо увидеть ложь и правду — а для этого нужно наблюдение. Представьте раздражающий звук из-под капота машины. Можно сделать музыку погромче, надеть на машину «намордник» (он и звук глушит), а если от шума болит голова — выпить таблетку; и так одно за другим, а саму проблему никто не видит. А мастер, у которого есть и знания (куда смотреть), и конфронт (не отворачиваться), открывает капот, смотрит с разных сторон и видит: на вентиляторе болтается зацепившийся шнурок, лопасти его задевают. Насколько теперь сложно принять решение? Снять шнурок. А выполнить? Тоже просто. Самым трудным было именно наблюдать. Так почти во всём: где вы способны — там вы прекрасно наблюдаете, и всё для вас просто; там, где вы слабее, — вам это кажется сложным.</p>' +
            '<p>У каждого есть область, где он наблюдает отлично, — у кого рыбалка, у кого управленческий учёт, у кого воспитание детей. А есть области, которые большинству людей наблюдать трудно: деньги, смерть, отношения с противоположным полом, дети. С детьми, например, у многих проблемы — а это значит лишь, что нам трудно их наблюдать: дети двигаются быстрее и выше по тону, чем мы, взрослые, и нам этого движения «слишком много», поэтому мы их останавливаем и раздражаемся.</p>' +
            '<p>А теперь главное. Когда мы предоставляем оценку теста, кого мы должны конфронтировать? Другого человека. Значит, чтобы сделать способнее его, надо вначале стать способным самому — причём конкретно в двух вещах: конфронтировать другого человека (комфортно быть с ним лицом к лицу) и хорошо с ним общаться. Это не механическая работа и не просто знание теста. Знание теста нужно, и чем лучше вы знаете тест, тем больше у вас уверенности, — но кроме компетентности нужен ещё и конфронт. Кстати, именно люди — а не мебель — нам труднее всего наблюдать, и вот почему: в нашем реактивном банке полно картинок, где нам делали больно, а больно нам чаще делали люди, чем мебель. Поэтому, как только напротив нас оказывается человек, какие-то картинки уже активизируются и мешают наблюдать. По большому счёту, способность наблюдать людей и способность с ними общаться — две важнейшие способности вообще: попробуйте назвать важнее — не получится. Ведь чем мы, руководители, в основном и занимаемся? Наблюдаем людей и общаемся с ними; цифры и аналитика — лишь малая часть нашей работы.</p>',
          en:
            '<h2>Chapter 4. Ability is to observe, make decisions, and act</h2>' +
            '<p>We want to make the employee more able. And what is ability? Here is Hubbard\'s definition:</p>' +
            k('DEFINITION',
              bp('Ability is the ability to observe, make decisions, and act. It consists of three things: to observe, to make decisions, and to act.', true)) +
            '<p>The most important thing here is the first: to observe. This is a very unaccustomed approach. At school, at the institute, in the family, we are taught mainly how to act (at most — how to make decisions), and no one can get to the bottom of it precisely because everything depends on observation. And to observe is very close to confronting.</p>' +
            k('DEFINITION',
              bp('To confront means to be face to face with something: without avoiding it, without shying away, without trying to escape it, feeling comfortable and perceiving correctly.', true)) +
            '<p>Let us return to the fact that every problem contains a lie. To solve it, one must see the lie and the truth — and for that, observation is needed. Imagine an irritating sound from under the hood of a car. You can turn the music up louder, put a "muzzle" on the car (it muffles the sound too), and if the noise gives you a headache — take a pill; and so on, one thing after another, while no one sees the problem itself. But a master, who has both the knowledge (where to look) and the confront (not to turn away), opens the hood, looks from various sides, and sees: a string that got caught is dangling on the fan, the blades are catching on it. How hard is it now to make a decision? Remove the string. And to carry it out? Also simple. The hardest thing was precisely to observe. It is so in almost everything: where you are able — there you observe splendidly, and everything is simple for you; where you are weaker — it seems difficult to you.</p>' +
            '<p>Everyone has an area where he observes excellently — for one it is fishing, for another management accounting, for another the raising of children. And there are areas that most people find hard to observe: money, death, relations with the opposite sex, children. With children, for instance, many have problems — and this means only that we find it hard to observe them: children move faster and higher on the tone scale than we adults do, and this movement is "too much" for us, so we stop them and get irritated.</p>' +
            '<p>And now the main thing. When we deliver a test assessment, whom must we confront? The other person. That means that in order to make him more able, we must first become able ourselves — and specifically in two things: to confront the other person (to be comfortably face to face with him) and to communicate well with him. This is not mechanical work, and not simply knowledge of the test. Knowledge of the test is needed, and the better you know the test, the more confidence you have — but besides competence, confront is also needed. Incidentally, it is precisely people — not furniture — that we find hardest to observe, and here is why: in our reactive bank there are plenty of pictures in which we were caused pain, and pain was caused to us more often by people than by furniture. That is why, as soon as a person is in front of us, some pictures already activate and interfere with observation. By and large, the ability to observe people and the ability to communicate with them are the two most important abilities of all: try to name more important ones — you will not manage it. For what is it that we managers mainly do? We observe people and communicate with them; figures and analytics are only a small part of our work.</p>',
          pl:
            '<h2>Rozdział 4. Zdolność to obserwować, podejmować decyzje i działać</h2>' +
            '<p>Chcemy uczynić pracownika bardziej zdolnym. A czym jest zdolność? Oto definicja Hubbarda:</p>' +
            k('DEFINICJA',
              bp('Zdolność to zdolność obserwowania, podejmowania decyzji i działania. Składa się z trzech rzeczy: obserwować, podejmować decyzje i działać.', true)) +
            '<p>Najważniejsze tu jest pierwsze: obserwować. To bardzo nietypowe podejście. W szkole, na uczelni, w rodzinie uczą nas głównie tego, jak działać (w ostateczności — jak podejmować decyzje), a z tym nikt nie może sobie poradzić właśnie dlatego, że wszystko zależy od obserwacji. A obserwować — to bardzo blisko tego, żeby konfrontować.</p>' +
            k('DEFINICJA',
              bp('Konfrontować — znaczy być z czymś twarzą w twarz: nie unikając, nie uchylając się, nie próbując tego uniknąć, czując się komfortowo i postrzegając prawidłowo.', true)) +
            '<p>Wróćmy do tego, że każdy problem zawiera fałsz. Żeby go rozwiązać, trzeba zobaczyć fałsz i prawdę — a do tego potrzebna jest obserwacja. Wyobraźcie sobie irytujący dźwięk spod maski samochodu. Można zrobić muzykę głośniej, założyć samochodowi „kaganiec” (i dźwięk zagłusza), a jeśli od hałasu boli głowa — wypić tabletkę; i tak jedno za drugim, a samego problemu nikt nie widzi. A mechanik, który ma i wiedzę (gdzie patrzeć), i konfront (nie odwracać się), otwiera maskę, patrzy z różnych stron i widzi: na wentylatorze dynda zaczepiony sznurek, łopatki go zawadzają. Na ile teraz trudno jest podjąć decyzję? Zdjąć sznurek. A wykonać? Też prosto. Najtrudniejsze było właśnie obserwować. Tak jest prawie we wszystkim: gdzie jesteście zdolni — tam obserwujecie znakomicie, i wszystko jest dla was proste; tam, gdzie jesteście słabsi — wydaje się wam to trudne.</p>' +
            '<p>Każdy ma dziedzinę, gdzie obserwuje wybornie — u kogo wędkarstwo, u kogo rachunkowość zarządcza, u kogo wychowanie dzieci. A są dziedziny, które większości ludzi trudno obserwować: pieniądze, śmierć, relacje z płcią przeciwną, dzieci. Z dziećmi na przykład wielu ma problemy — a to znaczy tylko, że trudno nam je obserwować: dzieci poruszają się szybciej i wyżej po tonie niż my, dorośli, i tego ruchu jest nam „za dużo”, dlatego je zatrzymujemy i irytujemy się.</p>' +
            '<p>A teraz najważniejsze. Gdy przekazujemy ocenę testu, kogo mamy konfrontować? Drugiego człowieka. Znaczy to, że żeby uczynić bardziej zdolnym jego, trzeba najpierw stać się zdolnym samemu — i to konkretnie w dwóch rzeczach: konfrontować drugiego człowieka (komfortowo być z nim twarzą w twarz) i dobrze się z nim komunikować. To nie jest praca mechaniczna ani po prostu znajomość testu. Znajomość testu jest potrzebna, i im lepiej znacie test, tym więcej macie pewności — ale oprócz kompetencji potrzebny jest jeszcze konfront. Swoją drogą, to właśnie ludzi — a nie meble — najtrudniej nam obserwować, i oto dlaczego: w naszym reaktywnym banku pełno obrazów, gdzie sprawiano nam ból, a ból sprawiali nam częściej ludzie niż meble. Dlatego, gdy tylko naprzeciw nas znajduje się człowiek, jakieś obrazy już się aktywizują i przeszkadzają obserwować. Ogólnie rzecz biorąc, zdolność obserwowania ludzi i zdolność komunikowania się z nimi to dwie najważniejsze zdolności w ogóle: spróbujcie wskazać ważniejsze — nie uda się. Przecież czym my, kierownicy, głównie się zajmujemy? Obserwujemy ludzi i komunikujemy się z nimi; liczby i analityka to jedynie mała część naszej pracy.</p>',
        },
      },

      // 4 — ТОН, ПРОСТОТА, «МОЖЕТ БЫТЬ», СТРАХ
      {
        id: 'tone-fear',
        title: {
          ru: 'Тон, простота, «может быть» и страх',
          en: 'Tone, simplicity, "maybe" and fear',
          pl: 'Ton, prostota, „być może” i strach',
        },
        desc: {
          ru: 'Конфронт наверху шкалы тонов, состояние «может быть» и почему страх недопустим.',
          en: 'Confront at the top of the tone scale, the "maybe" state, and why fear is inadmissible.',
          pl: 'Konfront na górze skali tonów, stan „być może” i dlaczego strach jest niedopuszczalny.',
        },
        html: {
          ru:
            '<h2>Глава 5. Тон, простота и состояние «может быть»</h2>' +
            '<p>Вспомните шкалу тонов. Конфронт находится наверху шкалы, а ещё выше — интерес: если я чем-то по-настоящему интересуюсь (а не стараюсь быть интересным, как внизу шкалы), я тем более это конфронтирую. И там же, наверху, — простота: когда мы смотрим на что-то сверху шкалы тонов, всё выглядит просто.</p>' +
            '<p>Отсюда любопытная мысль. Кого мы называем простыми людьми — высокотонных или низкотонных? Высокотонных. В обществе об этом часто говорят наоборот («он слишком простой»), но истинная простота — это признак верха шкалы: человек смотрит на всё сверху, конфронтирует, и потому он сам простой, и с ним просто. А значит, можно устроить почти игру слов, которая на самом деле глубокая мысль: чтобы руководить сложной областью, человек должен быть простым, а не сложным. Мы постоянно видим это в бизнесе: поднимаясь по иерархии в переговорах, вы проходите средних менеджеров — «сложных ребят» — и заранее боитесь: если они такие, то шеф вообще «съест». А дойдя до шефа, нередко удивляетесь, насколько с ним просто: он менее серьёзен. Чем сложнее область, тем проще должен быть человек, чтобы ей рулить, — а для простоты нужен конфронт наверху шкалы тонов.</p>' +
            '<p>Значит, предоставляя оценку теста, мы, по сути, хотим поднять конфронт человека в какой-то ситуации, чтобы он пронаблюдал и увидел то, чего до этого не видел, — увидел правду, ложь ушла, и там, где он был менее рационален, он стал более рациональным. Вот с этой целью мы и определяемся, прежде чем садиться за оценку; иначе непонятно, что во время неё делать.</p>' +
            '<p>Ещё две цитаты. Первая:</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('«Беспокойство, нерешительность, неуверенность — состояние „может быть“ — может существовать только при условии плохого наблюдения или неспособности наблюдать». Проверьте на себе: там, где у вас нерешительность и тревога, посмотрите, как вы там наблюдаете и силён ли ваш конфронт. Значит, помочь человеку можно только одним способом — подняв его способность наблюдать.', true)) +
            '<p>Состояние «может быть» — это когда человек не может принять решение и застрял в сомнении: жениться или нет, разводиться или нет, покупать или нет, идти на эту работу или нет. Если вспомнить себя в таком состоянии, видно, что это очень скользкий путь вниз по тону: если у вас есть большая проблема, то по отношению к ней вы стоите низко, а самый верный способ опуститься ещё ниже — застрять в сомнении. Поэтому лучше принять неправильное решение и потом его исправить, чем застревать в «может быть». (Уточню: под «духовным» я нигде не имею в виду ничего религиозного — только настроение и мысли, а не тело; религии мы в HR-PRO.AI не касаемся.)</p>' +
            '<p>И маленькая, но важная деталь про язык. Когда человек что-то осознал, по-английски он часто говорит «I see», а по-русски мы иногда говорим «я вижу». Это и есть продукт любого обучения и любого усиления: человек начал что-то видеть.</p>' +
            '<h3>Глава 6. Страх недопустим: как запускать тестирование без страха</h3>' +
            '<p>Ещё одна цитата — про страх, и она для нас ключевая, потому что сотрудники нередко боятся тестироваться.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Страх — это состояние отсутствия восприятия. Страх — это нежелание конфронтировать.', true)) +
            '<p>Если мы боимся собаку — мы не желаем конфронтировать её близко к себе. Если боимся расстроить сотрудника, которого надо уволить, — это просто нежелание конфронтировать расстроенного сотрудника. Боимся бедности — держимся за нежелание конфронтировать бедность. А если я готов всё это конфронтировать, страха у меня нет.</p>' +
            '<p>Отсюда вывод, который резко расходится с привычной практикой: страх недопустим при предоставлении оценки теста ни в каком виде. Страх и конфронт — противоположные вещи с разных концов шкалы тонов: не бывает, что я одновременно боюсь и конфронтирую (при страхе внимание внутри, при конфронте — наружу). А значит, испугать, чтобы усилить, невозможно. Вы определяетесь: вы усиливаете сотрудников или пугаете их. При найме страх не помеха — там нам надо просто увидеть. Но при работе с существующими сотрудниками наша цель — усилить, а значит, страх нужно всячески убирать. Кстати, вот ещё одна причина не тестировать непродуктивных: они боятся больше (боятся, что уволят), а страх и усиление несовместимы.</p>' +
            '<p>Как же запустить тестирование существующих сотрудников, чтобы убрать страх? Об этом должно объявить первое лицо — не директор по персоналу.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Как объявить сотрудникам о тестировании',
              bp('Опереться стоит на три вещи. Первое — это добровольно: не хотите — не надо. Второе — это награда: «Тестировать я буду тех, кто больше всего этого заслуживает, — начну с тех, у кого хороший результат за последний период. На каждого уйдёт куча времени: я изучу тест, посоветуюсь, потом не раз побеседую с вами, — поэтому больше трёх человек в неделю не осилю. И во время этих бесед вы услышите массу полезного, чего вам больше никто не расскажет». Третье — никаких кадровых решений по тестам: «Увольнять, повышать или переводить я решаю в первую очередь по результатам вашей работы. Тест же просто показывает, как с вами лучше обходиться, что вам больше подходит и как сделать вашу работу комфортнее, а заодно — как вас немного усилить. Никаких решений об увольнении на основании тестов приниматься не будет».') +
              bp('Хорошо сюда добавить и главную установку: «В этой компании главное — результат. У кого результат хороший — тому позволено даже больше, чем написано в правилах, тот под моей личной защитой. А у кого результат плохой — тому можно начинать бояться уже сейчас, безо всяких тестов». (Это, конечно, ваш собственный стиль и ваши слова, а не текст для заучивания; но по сути такая беседа сильно снижает страх тестирования.)', true)) +
            '<p>Речь, разумеется, не о вседозволенности — во всём, что касается людей, есть золотая середина. Просто во многих компаниях, увлёкшихся администрированием, перекос в сторону «правила одинаковы для всех без исключений», и полезно сдвинуть акцент к результату.</p>',
          en:
            '<h2>Chapter 5. Tone, simplicity, and the "maybe" state</h2>' +
            '<p>Recall the tone scale. Confront is located at the top of the scale, and higher still — interest: if I am truly interested in something (rather than trying to be interesting, as at the bottom of the scale), I confront it all the more. And there too, at the top — simplicity: when we look at something from the top of the tone scale, everything looks simple.</p>' +
            '<p>Hence a curious thought. Whom do we call simple people — the high-toned or the low-toned? The high-toned. In society this is often spoken of the other way round ("he\'s too simple"), but true simplicity is a sign of the top of the scale: a person looks at everything from above, confronts, and therefore he himself is simple, and it is simple to be with him. And so one can put together almost a play on words that is in fact a deep thought: in order to run a complex area, a person must be simple, not complex. We see this constantly in business: rising through the hierarchy in negotiations, you pass the middle managers — the "complicated fellows" — and you are afraid in advance: if they are like this, the boss will "eat you alive." And on reaching the boss, you are often surprised at how simple it is with him: he is less serious. The more complex the area, the simpler the person must be to steer it — and for simplicity, confront at the top of the tone scale is needed.</p>' +
            '<p>That means that in delivering a test assessment, we in essence want to raise the person\'s confront in some situation, so that he observes and sees what he did not see before — sees the truth, the lie goes away, and where he was less rational, he becomes more rational. It is with this goal that we orient ourselves before sitting down to an assessment; otherwise it is unclear what to do during it.</p>' +
            '<p>Two more quotes. The first:</p>' +
            k('KEY IDEA',
              bp('"Worry, indecision, uncertainty — the \'maybe\' state — can exist only under the condition of poor observation or an inability to observe." Check it on yourself: where you have indecision and anxiety, look at how you observe there and whether your confront is strong. That means a person can be helped in only one way — by raising his ability to observe.', true)) +
            '<p>The "maybe" state is when a person cannot make a decision and is stuck in doubt: to marry or not, to divorce or not, to buy or not, to take this job or not. If you recall yourself in such a state, you can see that it is a very slippery path downward on tone: if you have a big problem, then in relation to it you stand low, and the surest way to sink still lower is to get stuck in doubt. That is why it is better to make a wrong decision and then correct it than to get stuck in "maybe." (Let me clarify: by "spiritual" I nowhere mean anything religious — only mood and thoughts, not the body; we do not touch on religion in HR-PRO.AI.)</p>' +
            '<p>And a small but important point about language. When a person has become aware of something, in English he often says "I see," and in Russian we sometimes say "I see." That is precisely the product of any learning and any strengthening: the person has begun to see something.</p>' +
            '<h3>Chapter 6. Fear is inadmissible: how to launch testing without fear</h3>' +
            '<p>One more quote — about fear, and it is a key one for us, because employees not infrequently are afraid to be tested.</p>' +
            k('DEFINITION',
              bp('Fear is a state of absence of perception. Fear is an unwillingness to confront.', true)) +
            '<p>If we are afraid of a dog — we are unwilling to confront it close to ourselves. If we are afraid of upsetting an employee who has to be fired — it is simply an unwillingness to confront an upset employee. We fear poverty — we cling to an unwillingness to confront poverty. But if I am ready to confront all of this, I have no fear.</p>' +
            '<p>Hence a conclusion that sharply diverges from customary practice: fear is inadmissible in delivering a test assessment, in any form whatsoever. Fear and confront are opposite things, from different ends of the tone scale: it does not happen that I am simultaneously afraid and confronting (in fear, attention is inside; in confront — outward). And that means that to frighten in order to strengthen is impossible. You determine which it is: you are strengthening employees or frightening them. In hiring, fear is no hindrance — there we simply need to see. But in working with existing employees our goal is to strengthen, and that means fear must be removed by every means. Incidentally, here is one more reason not to test the unproductive: they are more afraid (afraid they will be fired), and fear and strengthening are incompatible.</p>' +
            '<p>So how is one to launch the testing of existing employees so as to remove fear? The first person — not the HR director — should announce it.</p>' +
            t('APPLICATION IN HIRING · How to announce the testing to employees',
              bp('It is worth leaning on three things. The first is that it is voluntary: if you don\'t want to, you needn\'t. The second is that it is a reward: "I will test those who deserve it most — I\'ll start with those who have a good result over the last period. Each one will take up a heap of time: I\'ll study the test, take advice, then talk with you more than once — so I won\'t manage more than three people a week. And during these conversations you will hear a mass of useful things that no one else will tell you." The third is no personnel decisions based on the tests: "Whether to fire, promote, or transfer, I decide first of all by the results of your work. The test simply shows how best to deal with you, what suits you better, and how to make your work more comfortable, and at the same time — how to strengthen you a little. No firing decisions will be made on the basis of the tests."') +
              bp('It is good to add here the main attitude as well: "In this company the main thing is the result. Whoever has a good result is allowed even more than is written in the rules, and is under my personal protection. And whoever has a bad result may begin to be afraid already now, without any tests at all." (This, of course, is your own style and your own words, not a text to be memorized; but in essence such a conversation greatly reduces the fear of being tested.)', true)) +
            '<p>This is, of course, not about permissiveness — in everything concerning people there is a golden mean. It is simply that in many companies that have gotten carried away with administration, there is a skew toward "the rules are the same for everyone without exception," and it is useful to shift the emphasis toward the result.</p>',
          pl:
            '<h2>Rozdział 5. Ton, prostota i stan „być może”</h2>' +
            '<p>Przypomnijcie sobie skalę tonów. Konfront znajduje się na górze skali, a jeszcze wyżej — zainteresowanie: jeśli czymś naprawdę się interesuję (a nie staram się być interesujący, jak na dole skali), tym bardziej to konfrontuję. I tam też, na górze — prostota: gdy patrzymy na coś z góry skali tonów, wszystko wygląda prosto.</p>' +
            '<p>Stąd ciekawa myśl. Kogo nazywamy prostymi ludźmi — wysokotonowych czy niskotonowych? Wysokotonowych. W społeczeństwie często mówi się o tym odwrotnie („on jest zbyt prosty”), ale prawdziwa prostota to oznaka góry skali: człowiek patrzy na wszystko z góry, konfrontuje, i dlatego sam jest prosty, i z nim jest prosto. A więc można ułożyć niemal grę słów, która w istocie jest głęboką myślą: żeby kierować złożoną dziedziną, człowiek musi być prosty, a nie złożony. Ciągle widzimy to w biznesie: wznosząc się po hierarchii w negocjacjach, przechodzicie średnich menedżerów — „skomplikowanych gości” — i z góry się boicie: jeśli oni są tacy, to szef w ogóle „pożre”. A dotarłszy do szefa, nierzadko dziwicie się, jak z nim jest prosto: jest mniej poważny. Im bardziej złożona dziedzina, tym prostszy musi być człowiek, żeby nią sterować — a do prostoty potrzebny jest konfront na górze skali tonów.</p>' +
            '<p>Znaczy to, że przekazując ocenę testu, w istocie chcemy podnieść konfront człowieka w jakiejś sytuacji, żeby zaobserwował i zobaczył to, czego wcześniej nie widział — zobaczył prawdę, fałsz odszedł, i tam, gdzie był mniej racjonalny, stał się bardziej racjonalny. Otóż z tym celem się określamy, zanim siądziemy do oceny; inaczej niejasne jest, co podczas niej robić.</p>' +
            '<p>Jeszcze dwa cytaty. Pierwszy:</p>' +
            k('KLUCZOWA MYŚL',
              bp('„Niepokój, niezdecydowanie, niepewność — stan «być może» — może istnieć tylko pod warunkiem złej obserwacji albo niezdolności obserwowania”. Sprawdźcie na sobie: tam, gdzie macie niezdecydowanie i lęk, popatrzcie, jak tam obserwujecie i czy silny jest wasz konfront. Znaczy to, że pomóc człowiekowi można tylko jednym sposobem — podnosząc jego zdolność obserwowania.', true)) +
            '<p>Stan „być może” to gdy człowiek nie może podjąć decyzji i utknął w wątpliwości: żenić się czy nie, rozwodzić się czy nie, kupować czy nie, iść do tej pracy czy nie. Jeśli przypomnieć sobie siebie w takim stanie, widać, że to bardzo śliska droga w dół po tonie: jeśli macie duży problem, to w stosunku do niego stoicie nisko, a najpewniejszy sposób, żeby obniżyć się jeszcze bardziej, to utknąć w wątpliwości. Dlatego lepiej podjąć niewłaściwą decyzję i potem ją poprawić, niż utknąć w „być może”. (Wyjaśnię: przez „duchowe” nigdzie nie mam na myśli niczego religijnego — tylko nastrój i myśli, a nie ciało; religii w HR-PRO.AI nie dotykamy.)</p>' +
            '<p>I mała, ale ważna kwestia dotycząca języka. Gdy człowiek coś sobie uświadomił, po angielsku często mówi „I see”, a po rosyjsku czasem mówimy „widzę”. To właśnie jest produkt każdego uczenia się i każdego wzmocnienia: człowiek zaczął coś widzieć.</p>' +
            '<h3>Rozdział 6. Strach jest niedopuszczalny: jak uruchamiać testowanie bez strachu</h3>' +
            '<p>Jeszcze jeden cytat — o strachu, i jest dla nas kluczowy, bo pracownicy nierzadko boją się testowania.</p>' +
            k('DEFINICJA',
              bp('Strach to stan braku postrzegania. Strach to niechęć do konfrontowania.', true)) +
            '<p>Jeśli boimy się psa — nie chcemy konfrontować go blisko siebie. Jeśli boimy się zdenerwować pracownika, którego trzeba zwolnić — to po prostu niechęć do konfrontowania zdenerwowanego pracownika. Boimy się biedy — trzymamy się niechęci do konfrontowania biedy. A jeśli jestem gotów to wszystko konfrontować, strachu u mnie nie ma.</p>' +
            '<p>Stąd wniosek, który ostro rozchodzi się z przywykłą praktyką: strach jest niedopuszczalny przy przekazywaniu oceny testu w żadnej postaci. Strach i konfront to rzeczy przeciwne, z różnych końców skali tonów: nie bywa tak, że jednocześnie się boję i konfrontuję (przy strachu uwaga jest wewnątrz, przy konfroncie — na zewnątrz). A więc przestraszyć, żeby wzmocnić, jest niemożliwe. Określacie się: wzmacniacie pracowników czy ich straszycie. Przy rekrutacji strach nie jest przeszkodą — tam musimy po prostu zobaczyć. Ale przy pracy z istniejącymi pracownikami naszym celem jest wzmocnić, a więc strach trzeba wszelkimi sposobami usuwać. Swoją drogą, oto jeszcze jeden powód, żeby nie testować nieproduktywnych: boją się bardziej (boją się, że zwolnią), a strach i wzmocnienie są niezgodne.</p>' +
            '<p>Jak więc uruchomić testowanie istniejących pracowników, żeby usunąć strach? O tym powinna ogłosić pierwsza osoba — nie dyrektor ds. personelu.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Jak ogłosić pracownikom o testowaniu',
              bp('Oprzeć się warto na trzech rzeczach. Pierwsza — to dobrowolnie: nie chcecie — nie trzeba. Druga — to nagroda: „Testować będę tych, którzy najbardziej na to zasługują — zacznę od tych, którzy mają dobry wynik za ostatni okres. Na każdego pójdzie kupa czasu: przestudiuję test, poradzę się, potem nieraz porozmawiam z wami — dlatego więcej niż trzech osób tygodniowo nie ogarnę. I podczas tych rozmów usłyszycie masę pożytecznego, czego nikt więcej wam nie opowie”. Trzecia — żadnych decyzji kadrowych na podstawie testów: „Zwalniać, awansować czy przenosić decyduję w pierwszej kolejności według wyników waszej pracy. Test zaś po prostu pokazuje, jak lepiej się z wami obchodzić, co wam bardziej odpowiada i jak uczynić waszą pracę wygodniejszą, a przy okazji — jak was trochę wzmocnić. Żadne decyzje o zwolnieniu na podstawie testów podejmowane nie będą”.') +
              bp('Dobrze dodać tu też główną zasadę: „W tej firmie najważniejszy jest wynik. Kto ma dobry wynik — temu wolno nawet więcej, niż napisano w regułach, ten jest pod moją osobistą ochroną. A kto ma zły wynik — temu można zacząć bać się już teraz, bez żadnych testów”. (To oczywiście wasz własny styl i wasze słowa, a nie tekst do zapamiętania; ale w istocie taka rozmowa mocno obniża strach przed testowaniem.)', true)) +
            '<p>Mowa oczywiście nie o pełnej swobodzie — we wszystkim, co dotyczy ludzi, jest złoty środek. Po prostu w wielu firmach, które zbytnio zapaliły się do administrowania, jest przechylenie w stronę „reguły są jednakowe dla wszystkich bez wyjątku”, i pożyteczne jest przesunąć akcent w stronę wyniku.</p>',
        },
      },

      // 5 — НЕПРОДУКТИВНЫЕ И ДАВЛЕНИЕ
      {
        id: 'pressure',
        title: {
          ru: 'Непродуктивные и как дозировать давление',
          en: 'The unproductive and how to dose the pressure',
          pl: 'Nieproduktywni i jak dozować nacisk',
        },
        desc: {
          ru: 'Что делать с теми, кто не производит, и как дозировать этическое давление.',
          en: 'What to do with those who do not produce, and how to dose ethical pressure.',
          pl: 'Co robić z tymi, którzy nie produkują, i jak dozować nacisk etyczny.',
        },
        html: {
          ru:
            '<h2>Глава 7. Что делать с непродуктивными и как дозировать давление</h2>' +
            '<p>Раз оценку мы предоставляем только продуктивным, договорим и про обратный случай. Если сотрудник не производит — либо мы зря его взяли, либо совсем неправильно им управляем. Что с ним делать? Либо расставаться, либо оказывать давление — но недолго (помните: терпение и надежда — основные ошибки управленцев). По-простому: поставьте реальную цель чуть выше того, что он делал раньше («вот это должно быть сделано за три дня, иначе расстаёмся»), и, если он справился, ставьте следующую, снова чуть выше, — так по принципу постепенности вы либо доводите его до приемлемого уровня, либо прощаетесь. Это гораздо лучше, чем предоставлять оценку теста тому, кто плохо работает.</p>' +
            '<p>Сколько именно давить — зависит от того, как человек производит: чем лучше, тем меньше давления, и здесь та же золотая середина. Представьте туннель, по которому едет машина: пока человек едет ровно (выполняет свою норму, свои квоты), стены на него не давят; но стоит ему свернуть к стене (снизить результат) — он в неё упирается и выравнивается. А кто превышает норму в разы — тому можно и раздвинуть стены туннеля, дав индивидуальные условия. Робот с этим не справится — нужен продуктивный, понимающий руководитель.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('За этим стоят две мысли Хаббарда (близко к тексту). Первая: «Никогда не бойтесь причинить людям вред по справедливой причине». Если поставить руководителем того, кто боится дать людям отпор, вы получите бардак, где никто ничего не делает; а тот, кто готов «в клочья порвать» плохо работающего, обычно готов и носить на руках того, кто работает хорошо, — такими и бывают большинство хороших руководителей.') +
              bp('Вторая: «Цена свободы — это постоянная бдительность и постоянная готовность дать отпор, и нет никакой другой цены». Последствия для того, кто выходит за рамки, должны быть неотвратимы. И труднее всего это применять к близким — к хорошему сотруднику, родственнику, ребёнку: именно им мы чаще всего «проглатываем», когда на них навалился банк и они вытворяют что-то не то.', true)),
          en:
            '<h2>Chapter 7. What to do with the unproductive and how to dose the pressure</h2>' +
            '<p>Since we deliver an assessment only to the productive, let us finish the point about the opposite case as well. If an employee does not produce — either we took him on in vain, or we are managing him quite wrongly. What is to be done with him? Either part with him, or exert pressure — but not for long (remember: patience and hope are the main mistakes of managers). Plainly: set a real target a little above what he was doing before ("this must be done in three days, otherwise we part"), and if he managed it, set the next one, again a little higher — thus, on the principle of graduality, you either bring him up to an acceptable level or say goodbye. This is far better than delivering a test assessment to someone who works badly.</p>' +
            '<p>Exactly how much to press depends on how the person produces: the better, the less pressure, and here is the same golden mean. Imagine a tunnel through which a car is driving: as long as the person drives straight (fulfills his norm, his quotas), the walls do not press on him; but the moment he veers toward a wall (lowers his result) — he runs into it and straightens out. And whoever exceeds the norm many times over — for him one can even move the tunnel walls apart, granting individual terms. A robot cannot cope with this — a productive, understanding manager is needed.</p>' +
            k('KEY IDEA',
              bp('Behind this stand two thoughts of Hubbard (close to the text). The first: "Never be afraid to do people harm for a just cause." If you make a manager of one who is afraid to give people a rebuff, you will get a shambles in which no one does anything; whereas one who is ready to "tear to shreds" someone who works badly is usually also ready to carry on his hands one who works well — and this is what most good managers are like.') +
              bp('The second: "The price of freedom is constant vigilance and constant willingness to give a rebuff, and there is no other price." The consequences for one who goes outside the bounds must be inescapable. And it is hardest of all to apply this to those close to us — to a good employee, a relative, a child: it is precisely to them that we most often "swallow it" when the bank has piled onto them and they are getting up to something amiss.', true)),
          pl:
            '<h2>Rozdział 7. Co robić z nieproduktywnymi i jak dozować nacisk</h2>' +
            '<p>Skoro ocenę przekazujemy tylko produktywnym, dopowiedzmy i o przypadku odwrotnym. Jeśli pracownik nie produkuje — albo na próżno go wzięliśmy, albo zupełnie źle nim zarządzamy. Co z nim robić? Albo się rozstawać, albo wywierać nacisk — ale niedługo (pamiętajcie: cierpliwość i nadzieja to główne błędy zarządzających). Po prostu: postawcie realny cel nieco wyższy od tego, co robił wcześniej („to a to ma być zrobione w ciągu trzech dni, inaczej się rozstajemy”), i jeśli sobie poradził, stawiajcie następny, znów nieco wyższy — tak, na zasadzie stopniowości, albo doprowadzacie go do akceptowalnego poziomu, albo żegnacie się. To znacznie lepsze niż przekazywać ocenę testu temu, kto źle pracuje.</p>' +
            '<p>Ile dokładnie naciskać — zależy od tego, jak człowiek produkuje: im lepiej, tym mniej nacisku, i tu ten sam złoty środek. Wyobraźcie sobie tunel, którym jedzie samochód: dopóki człowiek jedzie równo (wykonuje swoją normę, swoje kwoty), ściany na niego nie naciskają; ale niech tylko skręci ku ścianie (obniży wynik) — wpiera się w nią i się wyrównuje. A kto przekracza normę wielokrotnie — temu można i rozsunąć ściany tunelu, dając indywidualne warunki. Robot z tym sobie nie poradzi — potrzebny jest produktywny, rozumiejący kierownik.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Za tym stoją dwie myśli Hubbarda (blisko tekstu). Pierwsza: „Nigdy nie bójcie się wyrządzić ludziom szkody ze sprawiedliwego powodu”. Jeśli postawić kierownikiem tego, kto boi się dać ludziom odpór, dostaniecie bałagan, gdzie nikt nic nie robi; a ten, kto gotów jest „w strzępy rozerwać” źle pracującego, zwykle gotów jest i nosić na rękach tego, kto pracuje dobrze — tacy właśnie bywa większość dobrych kierowników.') +
              bp('Druga: „Ceną wolności jest nieustanna czujność i nieustanna gotowość do dania odporu, i nie ma żadnej innej ceny”. Następstwa dla tego, kto wychodzi poza ramy, muszą być nieuchronne. I najtrudniej stosować to wobec bliskich — wobec dobrego pracownika, krewnego, dziecka: właśnie im najczęściej „przełykamy”, gdy zwalił się na nich bank i wyczyniają coś nie tak.', true)),
        },
      },

      // 6 — ТРИ ЛИНИИ ОБЩЕНИЯ
      {
        id: 'three-lines',
        title: {
          ru: 'Три линии общения: дать человеку увидеть самому',
          en: 'The three lines of communication: let the person see for himself',
          pl: 'Trzy linie komunikacji: dać człowiekowi zobaczyć samemu',
        },
        desc: {
          ru: 'Самый практичный принцип оценки: вовремя замолчать, когда человек ушёл внутрь себя.',
          en: 'The most practical principle of assessment: fall silent in time when the person goes inward.',
          pl: 'Najbardziej praktyczna zasada oceny: w porę zamilknąć, gdy człowiek poszedł w głąb siebie.',
        },
        html: {
          ru:
            '<h2>Глава 8. Три линии общения: главное — дать человеку увидеть самому</h2>' +
            '<p>И, наконец, самый практичный принцип самой оценки. Мы уже знаем: чтобы человек усилился, он должен куда-то посмотреть и что-то увидеть, сконфронтировать, осознать. И вот когда он начал туда смотреть — как раз и пошёл процесс, ради которого мы всю оценку затеяли. Что же мы должны делать в этот момент? Ответ неожиданный: замолчать.</p>' +
            '<p>Дело в том, что у человека, которого мы усиливаем, есть три линии общения. Первая — то, что вы ему говорите. Вторая — то, что он говорит вам. И третья — когда он как бы разговаривает со своим банком, то есть смотрит внутрь себя. Какая из них важнее? По важности порядок обратный привычному:</p>' +
            '<ul>' +
            '<li><strong>Третья линия — самая важная.</strong> Именно когда человек смотрит внутрь, он может увидеть и осознать то, что раньше не видел, — а это единственное, что способно его усилить.</li>' +
            '<li><strong>Вторая линия важнее первой.</strong> То, что он говорит вам, важнее того, что говорите вы.</li>' +
            '<li><strong>Первая линия — наименее важная.</strong> То, что вы говорите, — всего лишь инструмент, чтобы запустить две другие линии.</li>' +
            '</ul>' +
            r('ПРАВИЛО',
              bp('Как только человек «отчалил» — ушёл внутрь себя, — оценщик должен замолчать, даже если это случилось на полуслове (а обычно так и бывает). Не переживайте, что не договорили: вы не на сцене перед зрителями, вы помогаете человеку, и всё, что вы делаете, — ради того, чтобы он куда-то посмотрел. Он посмотрел — значит, мешать больше нельзя. То же самое, если он сам начал вам что-то говорить: дайте ему сказать, его линия важнее вашей.', true)) +
            '<p>Замолчать психологически трудно: нам кажется, что чем больше мы скажем, тем умнее человек станет, а если чего-то не досказать — он чего-то не поймёт. Эту идею — она есть почти у всех, особенно когда мы кого-то воспитываем, — надо из себя выбить. Вспомните всех, кто читал вам нравоучения о том, как вам усилиться: результат один — раздражение. Так давайте хотя бы во время оценки не будем этого добавлять.</p>' +
            '<p>Отсюда — одна из важнейших способностей оценщика: вовремя заметить, что человек отчалил. Он ведь не скажет «я пошёл внутрь себя, не мешай» — он просто слушал вас или что-то говорил и вдруг отчалил. Если этого не заметить и продолжать говорить, произойдёт нелепое: вы произвели продукт (человек ушёл внутрь) и тут же сами его разрушили, отвлекая его. Замечать этот момент — навык, и его можно тренировать: например, в парах, когда один просто считает или что-то рассказывает, а второй учится ловить момент, когда внимание собеседника уходит. Как и в любом обучении, здесь важен принцип постепенности: начинать с простого, чтобы первый шаг был успешным.</p>' +
            '<p>При этом все мы всегда лишь отчасти «здесь» и отчасти в банке — в зависимости от того, насколько банк активизирован; у каждого есть свой средний уровень. Весь смысл оценки в том, чтобы человек увидел и осознал то, что раньше не видел, — а это обычно и «находится в банке». Поэтому, когда он туда уходит, наше дело — не мешать.</p>' +
            b('НА ЗАМЕТКУ',
              bp('А как это делается по шагам — с чего начать беседу, как вести человека по его точкам и как довести всё до результата — мы подробно разберём в следующем модуле, посвящённом шагам предоставления оценки.', true)),
          en:
            '<h2>Chapter 8. The three lines of communication: the main thing is to let the person see for himself</h2>' +
            '<p>And, finally, the most practical principle of the assessment itself. We already know: for a person to grow stronger, he must look somewhere and see something, confront it, become aware. And when he has begun to look there — that is exactly when the process begins for the sake of which we undertook the whole assessment. So what must we do at that moment? The answer is unexpected: fall silent.</p>' +
            '<p>The thing is that the person we are strengthening has three lines of communication. The first is what you say to him. The second is what he says to you. And the third is when he, as it were, talks with his bank, that is, looks inside himself. Which of them is the more important? In order of importance, the sequence is the reverse of the accustomed one:</p>' +
            '<ul>' +
            '<li><strong>The third line is the most important.</strong> It is precisely when a person looks inward that he can see and become aware of what he did not see before — and that is the only thing capable of strengthening him.</li>' +
            '<li><strong>The second line is more important than the first.</strong> What he says to you is more important than what you say.</li>' +
            '<li><strong>The first line is the least important.</strong> What you say is merely a tool for setting the other two lines going.</li>' +
            '</ul>' +
            r('RULE',
              bp('As soon as the person has "cast off" — gone inside himself — the assessor must fall silent, even if this happened mid-word (and it usually does). Do not worry that you did not finish: you are not on a stage before an audience, you are helping a person, and everything you do is so that he will look somewhere. He has looked — that means one must interfere no longer. The same if he himself has begun to say something to you: let him speak, his line is more important than yours.', true)) +
            '<p>To fall silent is psychologically hard: it seems to us that the more we say, the smarter the person will become, and that if we leave something unsaid — he will fail to understand something. This idea — nearly everyone has it, especially when we are bringing someone up — must be knocked out of oneself. Recall everyone who read you moral lectures about how you ought to strengthen yourself: the result was one — irritation. So let us at least, during an assessment, not add to it.</p>' +
            '<p>Hence — one of the assessor\'s most important abilities: to notice in time that the person has cast off. He will not, after all, say "I\'ve gone inside myself, don\'t interfere" — he was simply listening to you or saying something and suddenly cast off. If one fails to notice this and goes on talking, something absurd occurs: you produced a product (the person went inward) and at once destroyed it yourself, by distracting him. To notice this moment is a skill, and it can be trained: for example, in pairs, where one simply counts or tells something, and the other learns to catch the moment when the interlocutor\'s attention drifts off. As in any learning, the principle of graduality is important here: to begin with the simple, so that the first step is a success.</p>' +
            '<p>At the same time, all of us are always only partly "here" and partly in the bank — depending on how activated the bank is; everyone has his own average level. The whole point of an assessment is for the person to see and become aware of what he did not see before — and that is usually precisely what "resides in the bank." That is why, when he goes there, our business is not to interfere.</p>' +
            b('NOTE',
              bp('And how this is done step by step — how to begin the conversation, how to lead the person through his points, and how to bring everything to a result — we will examine in detail in the next module, devoted to the steps of delivering an assessment.', true)),
          pl:
            '<h2>Rozdział 8. Trzy linie komunikacji: najważniejsze — dać człowiekowi zobaczyć samemu</h2>' +
            '<p>I wreszcie najbardziej praktyczna zasada samej oceny. Już wiemy: żeby człowiek się wzmocnił, musi gdzieś popatrzeć i coś zobaczyć, skonfrontować, uświadomić sobie. I oto gdy zaczął tam patrzeć — właśnie ruszył proces, dla którego całą ocenę urządziliśmy. Co więc mamy robić w tym momencie? Odpowiedź jest nieoczekiwana: zamilknąć.</p>' +
            '<p>Rzecz w tym, że człowiek, którego wzmacniamy, ma trzy linie komunikacji. Pierwsza — to, co wy mu mówicie. Druga — to, co on mówi wam. I trzecia — gdy on jakby rozmawia ze swoim bankiem, czyli patrzy w głąb siebie. Która z nich jest ważniejsza? Pod względem ważności kolejność jest odwrotna do przywykłej:</p>' +
            '<ul>' +
            '<li><strong>Trzecia linia — najważniejsza.</strong> Właśnie gdy człowiek patrzy w głąb, może zobaczyć i uświadomić sobie to, czego wcześniej nie widział — a to jedyne, co zdolne go wzmocnić.</li>' +
            '<li><strong>Druga linia ważniejsza od pierwszej.</strong> To, co on mówi wam, jest ważniejsze od tego, co mówicie wy.</li>' +
            '<li><strong>Pierwsza linia — najmniej ważna.</strong> To, co mówicie wy, to jedynie narzędzie, żeby uruchomić dwie pozostałe linie.</li>' +
            '</ul>' +
            r('ZASADA',
              bp('Gdy tylko człowiek „odpłynął” — poszedł w głąb siebie — oceniający powinien zamilknąć, nawet jeśli stało się to w pół słowa (a zwykle tak właśnie bywa). Nie przejmujcie się, że nie dokończyliście: nie jesteście na scenie przed widzami, pomagacie człowiekowi, i wszystko, co robicie, jest po to, żeby on gdzieś popatrzył. Popatrzył — znaczy, przeszkadzać już nie wolno. To samo, jeśli sam zaczął wam coś mówić: dajcie mu powiedzieć, jego linia jest ważniejsza od waszej.', true)) +
            '<p>Zamilknąć jest psychicznie trudno: wydaje się nam, że im więcej powiemy, tym mądrzejszy człowiek się stanie, a jeśli czegoś nie dopowiedzieć — czegoś nie zrozumie. Tę ideę — jest ona niemal u wszystkich, zwłaszcza gdy kogoś wychowujemy — trzeba z siebie wybić. Przypomnijcie sobie wszystkich, którzy prawili wam morały o tym, jak macie się wzmocnić: wynik jeden — irytacja. Więc nie dodawajmy tego przynajmniej podczas oceny.</p>' +
            '<p>Stąd — jedna z najważniejszych zdolności oceniającego: w porę zauważyć, że człowiek odpłynął. On przecież nie powie „poszedłem w głąb siebie, nie przeszkadzaj” — po prostu słuchał was albo coś mówił i nagle odpłynął. Jeśli tego nie zauważyć i dalej mówić, stanie się coś niedorzecznego: wytworzyliście produkt (człowiek poszedł w głąb) i od razu sami go zniszczyliście, rozpraszając go. Zauważać ten moment — to umiejętność, i można ją trenować: na przykład w parach, gdy jeden po prostu liczy albo coś opowiada, a drugi uczy się łapać moment, gdy uwaga rozmówcy odchodzi. Jak w każdym uczeniu się, tu ważna jest zasada stopniowości: zaczynać od prostego, żeby pierwszy krok był udany.</p>' +
            '<p>Przy tym my wszyscy zawsze jesteśmy tylko po części „tutaj” i po części w banku — w zależności od tego, na ile bank jest zaktywizowany; każdy ma swój średni poziom. Cały sens oceny polega na tym, żeby człowiek zobaczył i uświadomił sobie to, czego wcześniej nie widział — a to zwykle właśnie „znajduje się w banku”. Dlatego, gdy on tam odchodzi, naszą rzeczą jest — nie przeszkadzać.</p>' +
            b('DO ZAPAMIĘTANIA',
              bp('A jak to się robi krok po kroku — od czego zacząć rozmowę, jak prowadzić człowieka po jego punktach i jak doprowadzić wszystko do wyniku — omówimy szczegółowo w następnym module, poświęconym krokom przekazywania oceny.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Кому имеет смысл предоставлять оценку теста?',
            en: 'To whom does it make sense to deliver a test assessment?',
            pl: 'Komu ma sens przekazywać ocenę testu?',
          },
          opts: [
            { ru: 'Любому сотруднику', en: 'To any employee', pl: 'Każdemu pracownikowi' },
            { ru: 'Только продуктивным сотрудникам', en: 'Only to productive employees', pl: 'Tylko produktywnym pracownikom' },
            { ru: 'Только руководителям', en: 'Only to managers', pl: 'Tylko kierownikom' },
            { ru: 'Только новичкам', en: 'Only to newcomers', pl: 'Tylko nowicjuszom' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Почему бесполезно предоставлять оценку тому, на кого навалился банк?',
            en: 'Why is it useless to deliver an assessment to someone on whom the reactive mind has piled up?',
            pl: 'Dlaczego bezużyteczne jest przekazywanie oceny komuś, na kogo napiętrzył się bank?',
          },
          opts: [
            { ru: 'Он слишком умён', en: 'He is too smart', pl: 'Jest zbyt inteligentny' },
            { ru: 'У него нет пространства, картинки реактивного ума встают «стеной» и не дают ничего разглядеть', en: 'He has no space; the pictures of the reactive mind stand like a "wall" and let him see nothing', pl: 'Nie ma przestrzeni, obrazy reaktywnego umysłu stają „ścianą” i nie pozwalają niczego dostrzec' },
            { ru: 'Он не умеет читать', en: 'He cannot read', pl: 'Nie umie czytać' },
            { ru: 'Он всегда согласен', en: 'He always agrees', pl: 'Zawsze się zgadza' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое истина (по короткому определению)?',
            en: 'What is truth (by the short definition)?',
            pl: 'Czym jest prawda (według krótkiej definicji)?',
          },
          opts: [
            { ru: 'То, что красиво звучит', en: 'What sounds beautiful', pl: 'To, co ładnie brzmi' },
            { ru: 'То, что работает (в наибольшем числе случаев в своей области)', en: 'What works (in the greatest number of cases in its area)', pl: 'To, co działa (w największej liczbie przypadków w swojej dziedzinie)' },
            { ru: 'То, что написано в книгах', en: 'What is written in books', pl: 'To, co napisano w książkach' },
            { ru: 'Личное мнение начальника', en: 'The personal opinion of the boss', pl: 'Osobista opinia szefa' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое ложь в этом контексте?',
            en: 'What is falsehood in this context?',
            pl: 'Czym jest fałsz w tym kontekście?',
          },
          opts: [
            { ru: 'Намеренный обман', en: 'Deliberate deception', pl: 'Celowe oszustwo' },
            { ru: 'То, что не работает', en: 'What does not work', pl: 'To, co nie działa' },
            { ru: 'Чужое мнение', en: 'Someone else\'s opinion', pl: 'Cudza opinia' },
            { ru: 'Сложная идея', en: 'A complex idea', pl: 'Skomplikowana idea' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Как звучит идея Хаббарда о проблеме?',
            en: 'How does Hubbard\'s idea about a problem read?',
            pl: 'Jak brzmi idea Hubbarda o problemie?',
          },
          opts: [
            { ru: '«Проблему нельзя решить»', en: '"A problem cannot be solved"', pl: '„Problemu nie da się rozwiązać”' },
            { ru: '«Проблема, чтобы быть проблемой, должна содержать ложь»', en: '"A problem, in order to be a problem, must contain a lie"', pl: '„Problem, aby być problemem, musi zawierać fałsz”' },
            { ru: '«Любая проблема — это ложь целиком»', en: '"Any problem is entirely a lie"', pl: '„Każdy problem to w całości fałsz”' },
            { ru: '«Проблем не существует»', en: '"Problems do not exist"', pl: '„Problemy nie istnieją”' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что стоит за каждой низкой точкой теста?',
            en: 'What stands behind every low point of the test?',
            pl: 'Co stoi za każdym niskim punktem testu?',
          },
          opts: [
            { ru: 'Высокий интеллект', en: 'High intelligence', pl: 'Wysoka inteligencja' },
            { ru: 'Какая-то ложь', en: 'Some lie', pl: 'Jakiś fałsz' },
            { ru: 'Усталость', en: 'Fatigue', pl: 'Zmęczenie' },
            { ru: 'Хорошее качество', en: 'A good quality', pl: 'Dobra cecha' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что нужно, чтобы поднять человеку точку (сделать рациональнее)?',
            en: 'What is needed to raise a person\'s point (to make him more rational)?',
            pl: 'Co jest potrzebne, aby podnieść człowiekowi punkt (uczynić go bardziej racjonalnym)?',
          },
          opts: [
            { ru: 'Чтобы он заучил правильный ответ', en: 'For him to memorize the correct answer', pl: 'Żeby wykuł poprawną odpowiedź' },
            { ru: 'Чтобы он сам увидел истину — тогда ложь уйдёт', en: 'For him to see the truth himself — then the lie will go', pl: 'Żeby sam zobaczył prawdę — wtedy fałsz zniknie' },
            { ru: 'Выдать ему готовый рецепт', en: 'To give him a ready-made recipe', pl: 'Dać mu gotową receptę' },
            { ru: 'Наказать его', en: 'To punish him', pl: 'Ukarać go' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Способность по определению — это способность:',
            en: 'Ability, by definition, is the ability to:',
            pl: 'Zdolność z definicji to zdolność:',
          },
          opts: [
            { ru: 'Наблюдать, принимать решения и действовать', en: 'Observe, make decisions and act', pl: 'Obserwować, podejmować decyzje i działać' },
            { ru: 'Быстро говорить', en: 'Speak quickly', pl: 'Szybko mówić' },
            { ru: 'Нравиться людям', en: 'Be liked by people', pl: 'Podobać się ludziom' },
            { ru: 'Много знать', en: 'Know a lot', pl: 'Dużo wiedzieć' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что из трёх составляющих способности самое главное?',
            en: 'Which of the three components of ability is the most important?',
            pl: 'Co z trzech składników zdolności jest najważniejsze?',
          },
          opts: [
            { ru: 'Действовать', en: 'To act', pl: 'Działać' },
            { ru: 'Принимать решения', en: 'To make decisions', pl: 'Podejmować decyzje' },
            { ru: 'Наблюдать', en: 'To observe', pl: 'Obserwować' },
            { ru: 'Все одинаково важны', en: 'All are equally important', pl: 'Wszystkie są tak samo ważne' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что значит «конфронтировать»?',
            en: 'What does "to confront" mean?',
            pl: 'Co znaczy „konfrontować”?',
          },
          opts: [
            { ru: 'Спорить с человеком', en: 'To argue with a person', pl: 'Kłócić się z człowiekiem' },
            { ru: 'Быть с чем-то лицом к лицу, не избегая и не уклоняясь, чувствуя себя комфортно', en: 'To be face to face with something, without avoiding or evading it, feeling comfortable', pl: 'Być z czymś twarzą w twarz, nie unikając i nie uchylając się, czując się komfortowo' },
            { ru: 'Избегать неприятного', en: 'To avoid the unpleasant', pl: 'Unikać nieprzyjemnego' },
            { ru: 'Нападать первым', en: 'To attack first', pl: 'Atakować pierwszym' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Где на шкале тонов находится конфронт?',
            en: 'Where on the tone scale is confront located?',
            pl: 'Gdzie na skali tonów znajduje się konfront?',
          },
          opts: [
            { ru: 'Внизу шкалы', en: 'At the bottom of the scale', pl: 'Na dole skali' },
            { ru: 'Наверху шкалы', en: 'At the top of the scale', pl: 'Na górze skali' },
            { ru: 'Посередине', en: 'In the middle', pl: 'Pośrodku' },
            { ru: 'Вне шкалы', en: 'Outside the scale', pl: 'Poza skalą' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кого автор называет «простыми людьми»?',
            en: 'Whom does the author call "simple people"?',
            pl: 'Kogo autor nazywa „prostymi ludźmi”?',
          },
          opts: [
            { ru: 'Низкотонных', en: 'Low-toned people', pl: 'Ludzi o niskim tonie' },
            { ru: 'Высокотонных (они смотрят на всё сверху, конфронтируют)', en: 'High-toned people (they look at everything from above, they confront)', pl: 'Ludzi o wysokim tonie (patrzą na wszystko z góry, konfrontują)' },
            { ru: 'Необразованных', en: 'Uneducated people', pl: 'Niewykształconych' },
            { ru: 'Молчаливых', en: 'Silent people', pl: 'Milczących' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое состояние «может быть»?',
            en: 'What is the state of "maybe"?',
            pl: 'Czym jest stan „może być”?',
          },
          opts: [
            { ru: 'Когда человек уверен в решении', en: 'When a person is sure of a decision', pl: 'Gdy człowiek jest pewny decyzji' },
            { ru: 'Когда человек застрял в сомнении и не может принять решение', en: 'When a person is stuck in doubt and cannot make a decision', pl: 'Gdy człowiek utknął w wątpliwości i nie może podjąć decyzji' },
            { ru: 'Когда человек счастлив', en: 'When a person is happy', pl: 'Gdy człowiek jest szczęśliwy' },
            { ru: 'Когда человек занят рутиной', en: 'When a person is busy with routine', pl: 'Gdy człowiek jest zajęty rutyną' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Из-за чего возникает состояние «может быть»?',
            en: 'What gives rise to the state of "maybe"?',
            pl: 'Z czego powstaje stan „może być”?',
          },
          opts: [
            { ru: 'Из-за плохого наблюдения (или неспособности наблюдать)', en: 'From poor observation (or inability to observe)', pl: 'Z powodu słabej obserwacji (lub niezdolności do obserwacji)' },
            { ru: 'Из-за высокого интеллекта', en: 'From high intelligence', pl: 'Z powodu wysokiej inteligencji' },
            { ru: 'Из-за хорошего настроения', en: 'From a good mood', pl: 'Z powodu dobrego nastroju' },
            { ru: 'Из-за большого опыта', en: 'From great experience', pl: 'Z powodu dużego doświadczenia' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что такое страх по определению?',
            en: 'What is fear by definition?',
            pl: 'Czym jest strach z definicji?',
          },
          opts: [
            { ru: 'Состояние отсутствия восприятия; нежелание конфронтировать', en: 'A state of absence of perception; unwillingness to confront', pl: 'Stan braku percepcji; niechęć do konfrontowania' },
            { ru: 'Полезная эмоция для мотивации', en: 'A useful emotion for motivation', pl: 'Przydatna emocja do motywacji' },
            { ru: 'Признак ума', en: 'A sign of intelligence', pl: 'Oznaka inteligencji' },
            { ru: 'Высокий тон', en: 'A high tone', pl: 'Wysoki ton' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Допустим ли страх при предоставлении оценки теста?',
            en: 'Is fear permissible when delivering a test assessment?',
            pl: 'Czy strach jest dopuszczalny przy przekazywaniu oceny testu?',
          },
          opts: [
            { ru: 'Да, страхом легче усилить человека', en: 'Yes, it is easier to strengthen a person through fear', pl: 'Tak, strachem łatwiej wzmocnić człowieka' },
            { ru: 'Нет, страх недопустим ни в каком виде — страх и конфронт несовместимы', en: 'No, fear is inadmissible in any form — fear and confront are incompatible', pl: 'Nie, strach jest niedopuszczalny w żadnej postaci — strach i konfront są niezgodne' },
            { ru: 'Допустим только для новичков', en: 'Permissible only for newcomers', pl: 'Dopuszczalny tylko dla nowicjuszy' },
            { ru: 'Допустим только для руководителей', en: 'Permissible only for managers', pl: 'Dopuszczalny tylko dla kierowników' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что работает с тем, на кого навалился банк (непродуктивным)?',
            en: 'What works with someone on whom the reactive mind has piled up (the unproductive)?',
            pl: 'Co działa na tego, na kogo napiętrzył się bank (nieproduktywnego)?',
          },
          opts: [
            { ru: 'Уговоры и оценка теста', en: 'Persuasion and a test assessment', pl: 'Namowy i ocena testu' },
            { ru: 'Давление сильнее, чем давит банк (методы этического воздействия)', en: 'Pressure stronger than the reactive mind presses (methods of ethics influence)', pl: 'Nacisk silniejszy niż napiera bank (metody oddziaływania etycznego)' },
            { ru: 'Повышение зарплаты', en: 'A pay raise', pl: 'Podwyżka pensji' },
            { ru: 'Отпуск', en: 'A vacation', pl: 'Urlop' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Сколько линий общения есть у человека, которого мы усиливаем?',
            en: 'How many lines of communication does the person we are strengthening have?',
            pl: 'Ile linii komunikacji ma człowiek, którego wzmacniamy?',
          },
          opts: [
            { ru: 'Одна', en: 'One', pl: 'Jedna' },
            { ru: 'Две', en: 'Two', pl: 'Dwie' },
            { ru: 'Три', en: 'Three', pl: 'Trzy' },
            { ru: 'Пять', en: 'Five', pl: 'Pięć' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Какая линия общения самая важная?',
            en: 'Which line of communication is the most important?',
            pl: 'Która linia komunikacji jest najważniejsza?',
          },
          opts: [
            { ru: 'Первая (то, что говорите вы)', en: 'The first (what you say)', pl: 'Pierwsza (to, co mówicie wy)' },
            { ru: 'Вторая (то, что он говорит вам)', en: 'The second (what he says to you)', pl: 'Druga (to, co on mówi wam)' },
            { ru: 'Третья (когда он смотрит внутрь себя, «разговаривает с банком»)', en: 'The third (when he looks inside himself, "talks with the reactive mind")', pl: 'Trzecia (gdy patrzy w głąb siebie, „rozmawia z bankiem”)' },
            { ru: 'Все линии равны', en: 'All lines are equal', pl: 'Wszystkie linie są równe' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что должен сделать оценщик, когда человек «отчалил» (ушёл внутрь себя)?',
            en: 'What must the assessor do when the person has "drifted off" (gone inside himself)?',
            pl: 'Co powinien zrobić oceniający, gdy człowiek „odpłynął” (poszedł w głąb siebie)?',
          },
          opts: [
            { ru: 'Говорить громче', en: 'Speak louder', pl: 'Mówić głośniej' },
            { ru: 'Замолчать, даже если это случилось на полуслове', en: 'Fall silent, even if it happened mid-word', pl: 'Zamilknąć, nawet jeśli stało się to w pół słowa' },
            { ru: 'Задать новый вопрос', en: 'Ask a new question', pl: 'Zadać nowe pytanie' },
            { ru: 'Закончить беседу', en: 'End the conversation', pl: 'Zakończyć rozmowę' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Почему оценку теста не может выдать компьютер?',
            en: 'Why can a computer not deliver a test assessment?',
            pl: 'Dlaczego oceny testu nie może wydać komputer?',
          },
          opts: [
            { ru: 'Компьютеры слишком медленные', en: 'Computers are too slow', pl: 'Komputery są zbyt wolne' },
            { ru: 'Задача не выдать текст, а чтобы человек сам на что-то посмотрел и что-то увидел', en: 'The task is not to output text, but for the person himself to look at something and see something', pl: 'Zadaniem nie jest wydanie tekstu, lecz by człowiek sam na coś spojrzał i coś zobaczył' },
            { ru: 'Компьютеры не умеют считать точки', en: 'Computers cannot count points', pl: 'Komputery nie umieją liczyć punktów' },
            { ru: 'Это неправда, компьютер справится лучше', en: 'That is untrue, a computer will do better', pl: 'To nieprawda, komputer poradzi sobie lepiej' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Почему при найме страх не так мешает, как при оценке?',
            en: 'Why does fear not interfere in hiring as much as in an assessment?',
            pl: 'Dlaczego przy rekrutacji strach nie przeszkadza tak, jak przy ocenie?',
          },
          opts: [
            { ru: 'При найме нам надо просто увидеть человека, а при оценке — усилить (а страх и усиление несовместимы)', en: 'In hiring we just need to see the person, but in an assessment — to strengthen him (and fear and strengthening are incompatible)', pl: 'Przy rekrutacji trzeba tylko zobaczyć człowieka, a przy ocenie — wzmocnić (a strach i wzmacnianie są niezgodne)' },
            { ru: 'При найме страх вообще не влияет', en: 'In hiring fear has no effect at all', pl: 'Przy rekrutacji strach w ogóle nie wpływa' },
            { ru: 'При оценке страх, наоборот, помогает', en: 'In an assessment fear, on the contrary, helps', pl: 'Przy ocenie strach, przeciwnie, pomaga' },
            { ru: 'Разницы нет', en: 'There is no difference', pl: 'Nie ma różnicy' },
          ],
          correct: 0,
        },
      ],
    },
  },
};
