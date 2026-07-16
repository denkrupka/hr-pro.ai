'use strict';
// Контент программы «Личностные качества (Тест Тулс)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-tools'.

// Врезки-боксы 1-в-1 из программы productivity-winners / module-abc / ... / module-hij.
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
  'module-tools': {
    sections: [
      // 1 — ВВЕДЕНИЕ · ЧТО ИЗМЕРЯЕТ ТЕСТ И КАК ОН УСТРОЕН
      {
        id: 'intro',
        title: {
          ru: '«Тест Тулс» · Введение: что измеряет тест и как он устроен',
          en: 'The "Tools Test" · Introduction: what the test measures and how it is built',
          pl: '„Test Tools" · Wprowadzenie: co mierzy test i jak jest zbudowany',
        },
        desc: {
          ru: 'Десять инструментов эффективности, пять диапазонов и компульсивная точка — и главное правило: только в связке с тестом продуктивности.',
          en: 'Ten tools of effectiveness, five ranges and the compulsive point — and the main rule: only in tandem with the productivity test.',
          pl: 'Dziesięć narzędzi efektywności, pięć zakresów i punkt kompulsywny — i najważniejsza zasada: tylko w parze z testem produktywności.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 11 · ТЕСТ ТУЛС</strong></p>' +
            '<p>«Тест Тулс»: как устроен тест и как читать точки</p>' +
            '<p>Что измеряет тест и как применять его в найме: пять диапазонов и компульсивная точка, а также практическое чтение всех десяти точек с примерами вопросов.</p>' +
            '<h2>Модуль 11. «Тест Тулс»: как устроен тест и как читать точки</h2>' +
            '<p>Мы разобрали методику оценки. Теперь перейдём к самому инструменту — тесту «Тест Тулс» — и посмотрим на него глазами того, кто читает тесты и принимает решения о найме. Концепты каждой точки мы уже разбирали подробно; здесь наша задача — научиться быстро и практично читать тест: понимать диапазоны, видеть компульсивные точки и делать по каждой точке выводы, полезные для подбора.</p>' +
            '<h3>Глава 1. Что измеряет тест и как он устроен</h3>' +
            '<p>У каждого человека, который приходит к нам, есть свои инструменты для достижения результата: один продаёт за счёт настойчивости, другой — за счёт общительности, третий — за счёт внимательности. Таких инструментов всего десять, и «Тест Тулс» их измеряет — это оценка личной эффективности по десяти показателям. Образно говоря, тест, как рентген, просвечивает те инструменты, которыми сотрудник пользуется, чтобы добиваться результата. На каждую точку задаётся 20 вопросов (всего 200), и по ним строится график из десяти точек с конкретными числовыми значениями.</p>' +
            r('ПРАВИЛО',
              bp('Самое важное правило: «Тест Тулс» работает только в связке с тестом продуктивности («Тест Резалт»). Делать вывод, подходит кандидат или нет, на основании одного лишь «Тест Тулс» — грубейшая ошибка. Ведь человек может быть очень милым, позитивным и внимательным, но не давать результата; а результат — то есть способность видеть, производить и измерять продукт — для нас первичен. Нельзя брать человека только потому, что у него «высокая внимательность» или «он способный», в отрыве от его реальных результатов.', true)) +
            '<p>Ещё один важный момент: «Тест Тулс» — это фотография личности на момент времени. Если результаты в прошлом либо есть, либо их нет, то показатели «Тест Тулс» могут меняться — в зависимости от настроения, жизненных обстоятельств и так далее. Мы говорим: в тот день, когда человек заполнял тест, инструменты у него были вот такими. Поэтому в тесте обязательно указываются достоверные пол и возраст (есть возрастные группы — младше 14, от 14 до 30, от 30 и старше): от них зависит, какие нормативные показатели берутся для расчёта, и графики получаются разными. Готовый результат можно скачать в PDF.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Задачи теста',
              bp('Тест решает три задачи. Первая — определить сильные и слабые стороны личности, то есть её инструменты эффективности. Вторая — выбрать лучшего кандидата из нескольких: когда у вас есть, скажем, четыре-пять продуктивных человек с результатами, тест помогает взять того, кто создаст наименьшее трение и лучше справится с работой. Это как выбирать мандарины из мешка: тест позволяет откладывать «подпорченные» варианты и брать наиболее качественные. Третья — работать с уже нанятыми: можно протестировать текущих сотрудников (и даже близких), увидеть их сильные и слабые стороны и принимать более взвешенные управленческие решения.', true)) +
            '<h3>Пять диапазонов и компульсивная точка</h3>' +
            '<p>Каждая точка бывает в пяти диапазонах: очень низком, низком, среднем, высоком и очень высоком. У каждой есть допустимые (нормальные) значения. И здесь важно ввести понятие компульсивной точки. Компульсивный (от английского слова, означающего «навязчивый», «принудительный») — это когда поведение ощущается как вынужденное, а невыполнение действия повышает тревожность. Если точка очень высокая (близко к максимуму), это значит, что человек на все 20 вопросов ответил «только так, обязательно» — то есть без этого он не может, иначе испытывает стресс. Иными словами, даже очень сильное качество в компульсивном виде имеет свои минусы: человек не может «не».</p>',
          en:
            '<p><strong>MODULE 11 · THE TOOLS TEST</strong></p>' +
            '<p>The "Tools Test": how the test is built and how to read the points</p>' +
            '<p>What the test measures and how to apply it in hiring: the five ranges and the compulsive point, plus a practical reading of all ten points with sample questions.</p>' +
            '<h2>Module 11. The "Tools Test": how the test is built and how to read the points</h2>' +
            '<p>We have examined the methodology of assessment. Now let us move on to the tool itself — the "Tools Test" — and look at it through the eyes of the one who reads tests and makes hiring decisions. The concepts of each point we have already examined in detail; here our task is to learn to read a test quickly and practically: to understand the ranges, to see the compulsive points, and to draw, for each point, conclusions useful for recruitment.</p>' +
            '<h3>Chapter 1. What the test measures and how it is built</h3>' +
            '<p>Every person who comes to us has his own tools for achieving a result: one sells by dint of persistence, another by dint of sociability, a third by dint of attentiveness. There are ten such tools in all, and the "Tools Test" measures them — it is an assessment of personal effectiveness across ten indicators. Figuratively speaking, the test, like an X-ray, shows through those tools that an employee uses to achieve a result. Twenty questions are asked for each point (two hundred in all), and from them a graph of ten points with concrete numerical values is built.</p>' +
            r('RULE',
              bp('The most important rule: the "Tools Test" works only in tandem with the productivity test (the "Result Test"). To draw a conclusion about whether a candidate is suitable or not on the basis of the "Tools Test" alone is the crudest of mistakes. For a person may be very nice, positive, and attentive, but not produce a result; and the result — that is, the ability to see, produce, and measure a product — is primary for us. One must not take a person merely because he has "high attentiveness" or "is able," in isolation from his real results.', true)) +
            '<p>One more important matter: the "Tools Test" is a photograph of the personality at a moment in time. Whereas results in the past either exist or do not, the indicators of the "Tools Test" may change — depending on mood, life circumstances, and so on. We say: on the day when the person filled out the test, his tools were like this. That is why in the test one must indicate a reliable sex and age (there are age groups — under 14, from 14 to 30, from 30 and older): on them depends which normative indicators are taken for the calculation, and the graphs come out different. The finished result can be downloaded as a PDF.</p>' +
            k('KEY IDEA · The tasks of the test',
              bp('The test solves three tasks. The first — to determine the strong and weak sides of a personality, that is, its tools of effectiveness. The second — to choose the best candidate out of several: when you have, say, four or five productive people with results, the test helps you take the one who will create the least friction and cope better with the work. It is like choosing tangerines from a sack: the test lets you set aside the "blemished" options and take the highest-quality ones. The third — to work with those already hired: you can test current employees (and even those close to you), see their strong and weak sides, and make more balanced managerial decisions.', true)) +
            '<h3>The five ranges and the compulsive point</h3>' +
            '<p>Each point comes in five ranges: very low, low, medium, high, and very high. Each has permissible (normal) values. And here it is important to introduce the concept of a compulsive point. Compulsive (from the English word meaning "obsessive," "coercive") — is when behavior is felt as forced, and not performing the action raises anxiety. If a point is very high (close to the maximum), it means the person answered all 20 questions "only this way, without fail" — that is, he cannot do without it, otherwise he experiences stress. In other words, even a very strong quality in compulsive form has its minuses: the person cannot "not."</p>',
          pl:
            '<p><strong>MODUŁ 11 · TEST TOOLS</strong></p>' +
            '<p>„Test Tools": jak zbudowany jest test i jak czytać punkty</p>' +
            '<p>Co mierzy test i jak stosować go w rekrutacji: pięć zakresów i punkt kompulsywny, a także praktyczne czytanie wszystkich dziesięciu punktów z przykładami pytań.</p>' +
            '<h2>Moduł 11. „Test Tools": jak zbudowany jest test i jak czytać punkty</h2>' +
            '<p>Omówiliśmy metodykę oceny. Teraz przejdźmy do samego narzędzia — testu „Test Tools" — i spójrzmy na niego oczami tego, kto czyta testy i podejmuje decyzje o rekrutacji. Koncepty każdego punktu omawialiśmy już szczegółowo; tu naszym zadaniem jest nauczyć się szybko i praktycznie czytać test: rozumieć zakresy, widzieć punkty kompulsywne i wyciągać co do każdego punktu wnioski przydatne dla doboru.</p>' +
            '<h3>Rozdział 1. Co mierzy test i jak jest zbudowany</h3>' +
            '<p>Każdy człowiek, który do nas przychodzi, ma własne narzędzia do osiągania rezultatu: jeden sprzedaje dzięki wytrwałości, drugi — dzięki towarzyskości, trzeci — dzięki uważności. Takich narzędzi jest w sumie dziesięć, i „Test Tools" je mierzy — to ocena efektywności osobistej według dziesięciu wskaźników. Obrazowo mówiąc, test niczym rentgen prześwietla te narzędzia, którymi pracownik się posługuje, żeby osiągać rezultat. Na każdy punkt zadaje się 20 pytań (w sumie 200), i na ich podstawie buduje się wykres z dziesięciu punktów z konkretnymi wartościami liczbowymi.</p>' +
            r('ZASADA',
              bp('Najważniejsza zasada: „Test Tools" działa tylko w parze z testem produktywności („Test Result"). Wyciągać wniosek, czy kandydat pasuje, czy nie, na podstawie samego „Test Tools" — to najgrubszy błąd. Człowiek bowiem może być bardzo miły, pozytywny i uważny, ale nie dawać rezultatu; a rezultat — czyli zdolność widzenia, wytwarzania i mierzenia produktu — jest dla nas pierwszorzędny. Nie wolno brać człowieka tylko dlatego, że ma „wysoką uważność" albo „jest zdolny", w oderwaniu od jego realnych rezultatów.', true)) +
            '<p>Jeszcze jeden ważny moment: „Test Tools" to fotografia osobowości w danym momencie. O ile rezultaty w przeszłości albo są, albo ich nie ma, o tyle wskaźniki „Test Tools" mogą się zmieniać — w zależności od nastroju, okoliczności życiowych i tak dalej. Mówimy: w tym dniu, gdy człowiek wypełniał test, narzędzia miał właśnie takie. Dlatego w teście obowiązkowo podaje się wiarygodne płeć i wiek (są grupy wiekowe — poniżej 14, od 14 do 30, od 30 wzwyż): od nich zależy, jakie wskaźniki normatywne bierze się do obliczeń, i wykresy wychodzą różne. Gotowy wynik można pobrać w PDF.</p>' +
            k('KLUCZOWA MYŚL · Zadania testu',
              bp('Test rozwiązuje trzy zadania. Pierwsze — określić mocne i słabe strony osobowości, czyli jej narzędzia efektywności. Drugie — wybrać najlepszego kandydata z kilku: gdy macie, powiedzmy, czterech-pięciu produktywnych ludzi z rezultatami, test pomaga wziąć tego, kto stworzy najmniejsze tarcie i lepiej poradzi sobie z pracą. To jak wybieranie mandarynek z worka: test pozwala odkładać „nadpsute" warianty i brać najbardziej jakościowe. Trzecie — pracować z już zatrudnionymi: można przetestować obecnych pracowników (a nawet bliskich), zobaczyć ich mocne i słabe strony i podejmować bardziej wyważone decyzje kierownicze.', true)) +
            '<h3>Pięć zakresów i punkt kompulsywny</h3>' +
            '<p>Każdy punkt bywa w pięciu zakresach: bardzo niskim, niskim, średnim, wysokim i bardzo wysokim. Każdy ma dopuszczalne (normalne) wartości. I tu ważne jest wprowadzić pojęcie punktu kompulsywnego. Kompulsywny (od angielskiego słowa oznaczającego „natrętny", „przymusowy") — to gdy zachowanie odczuwane jest jako wymuszone, a niewykonanie działania podnosi lęk. Jeśli punkt jest bardzo wysoki (blisko maksimum), to znaczy, że człowiek na wszystkie 20 pytań odpowiedział „tylko tak, koniecznie" — czyli bez tego nie może, inaczej odczuwa stres. Innymi słowy, nawet bardzo silna cecha w postaci kompulsywnej ma swoje minusy: człowiek nie może „nie".</p>',
        },
      },

      // 2 — ТОЧКИ A И B: ВНИМАТЕЛЬНОСТЬ И ПОЗИТИВНОСТЬ
      {
        id: 'points-ab',
        title: {
          ru: 'Точки A и B: внимательность и позитивность',
          en: 'Points A and B: attentiveness and positivity',
          pl: 'Punkty A i B: uważność i pozytywność',
        },
        desc: {
          ru: 'Внимательность — способность концентрироваться и планировать; позитивность — хронический уровень настроения и «плавающая» точка под подавлением.',
          en: 'Attentiveness — the ability to concentrate and plan; positivity — the chronic level of mood and a "floating" point under suppression.',
          pl: 'Uważność — zdolność koncentracji i planowania; pozytywność — chroniczny poziom nastroju i punkt „pływający" pod tłumieniem.',
        },
        html: {
          ru:
            '<h2>Глава 2. Точки A и B: внимательность и позитивность</h2>' +
            '<h3>Точка A — внимательность</h3>' +
            '<p>Точка A — внимательность. Показывает, способен ли человек концентрироваться и планировать или он в целом рассеян и неорганизован. При низкой внимательности человек рассеян, плохо концентрируется, не любит планировать и избегает этого, слабый организатор, не может ждать, меньше следит за собой в одежде и хуже угадывает ожидания (не считывает детали и мимику). При высокой — хорошо концентрируется, планирует и систематизирует, соблюдает порядок, угадывает ожидания и «предугадывает», что от него хотят (замечает, что чайник почти пуст, — и возвращается с полным). Компульсивная внимательность (педантичность) означает, что человек не может не планировать — планирует даже тогда, когда не нужно, ему трудно расслабиться и вести себя естественно, он руководствуется фиксированными идеями. Внимательность критична для руководителя, бухгалтера, юриста, сторожа; а для грузчика, дизайнера или музыканта она может быть не так важна — у них другие инструменты.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка A',
              bp('«Делаете ли вы необдуманные высказывания, о которых потом жалеете?», «часто ли откладываете дела и обнаруживаете, что уже слишком поздно?», «планируете ли дела заранее и затем реализуете планы?», «можете ли стабилизировать ситуацию, когда другие паникуют?».', true)) +
            '<h3>Точка B — позитивность</h3>' +
            '<p>Точка B — позитивность. Это хронический уровень настроения: ориентирован ли человек на решение и доволен жизнью или подавлен и видит кругом минусы. По этой точке отчасти судят и о честности: довольные жизнью люди реже совершают нечестные поступки. При низкой позитивности человек негативен, видит проблемы и препятствия, легко искажает факты и доносит плохие новости («у нас постоянно всё ломается»), часто «проигрывает» (не верит в победу), слаб в стратегии и малотворческий. При высокой — видит решения, открыт, любит простоту, честен, часто выигрывает, силён в стратегии (видит всю картину), творчески приятен.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · «Молния» — плавающая точка',
              bp('Важная деталь: если на точке видна «молния», это плавающая точка — настроение может меняться, как американские горки. Обычно это происходит под подавлением — рядом есть подавляющие личности (примерно 3% людей), которые стремятся снизить чужую уверенность и «притопить» того, кто начинает расти. Проверочные вопросы это выявляют: «бывают ли у вас периоды грусти и печали, которые сменяются хорошим настроением?». Само по себе это ещё не стоп-фактор, но индикатор важный.', true)) +
            '<p>Компульсивная позитивность — когда человек не может не радоваться: он склонен не решать проблемы, а откладывать их («всё будет хорошо») даже там, где это неуместно.</p>',
          en:
            '<h2>Chapter 2. Points A and B: attentiveness and positivity</h2>' +
            '<h3>Point A — attentiveness</h3>' +
            '<p>Point A — attentiveness. Shows whether a person is capable of concentrating and planning, or whether he is on the whole scattered and disorganized. With low attentiveness a person is scattered, concentrates poorly, does not like to plan and avoids it, is a weak organizer, cannot wait, takes less care of himself in dress, and is worse at guessing expectations (does not read details and facial expressions). With high attentiveness he concentrates well, plans and systematizes, keeps order, guesses expectations and "anticipates" what is wanted of him (notices that the kettle is almost empty — and comes back with a full one). Compulsive attentiveness (pedantry) means that a person cannot not plan — he plans even when it is not needed, finds it hard to relax and behave naturally, and is guided by fixed ideas. Attentiveness is critical for a manager, an accountant, a lawyer, a watchman; but for a loader, a designer, or a musician it may be not so important — they have other tools.</p>' +
            b('SAMPLE QUESTIONS · Point A',
              bp('"Do you make ill-considered remarks that you later regret?", "do you often put things off and find that it is already too late?", "do you plan things in advance and then carry out the plans?", "can you stabilize a situation when others panic?".', true)) +
            '<h3>Point B — positivity</h3>' +
            '<p>Point B — positivity. This is the chronic level of mood: whether a person is oriented toward a solution and content with life, or is depressed and sees minuses all around. By this point one partly judges honesty too: people content with life more rarely commit dishonest acts. With low positivity a person is negative, sees problems and obstacles, easily distorts facts and reports bad news ("everything\'s always breaking down with us"), often "loses" (does not believe in victory), is weak in strategy and not very creative. With high positivity he sees solutions, is open, likes simplicity, is honest, often wins, is strong in strategy (sees the whole picture), and is creatively pleasant.</p>' +
            k('KEY IDEA · The "lightning bolt" — a floating point',
              bp('An important detail: if a "lightning bolt" is visible on the point, it is a floating point — the mood may change like a roller coaster. Usually this happens under suppression — nearby there are suppressive personalities (roughly 3% of people) who strive to lower others\' confidence and "push under" the one who is beginning to grow. Verification questions reveal this: "do you have periods of sadness and gloom that give way to a good mood?". In itself this is not yet a stop-factor, but it is an important indicator.', true)) +
            '<p>Compulsive positivity — when a person cannot not rejoice: he is inclined not to solve problems but to postpone them ("everything will be fine") even where this is inappropriate.</p>',
          pl:
            '<h2>Rozdział 2. Punkty A i B: uważność i pozytywność</h2>' +
            '<h3>Punkt A — uważność</h3>' +
            '<p>Punkt A — uważność. Pokazuje, czy człowiek jest zdolny się koncentrować i planować, czy też jest ogólnie rozproszony i niezorganizowany. Przy niskiej uważności człowiek jest rozproszony, słabo się koncentruje, nie lubi planować i tego unika, jest słabym organizatorem, nie może czekać, mniej dba o siebie w ubiorze i gorzej odgaduje oczekiwania (nie odczytuje szczegółów i mimiki). Przy wysokiej — dobrze się koncentruje, planuje i systematyzuje, przestrzega porządku, odgaduje oczekiwania i „przewiduje", czego się od niego chce (zauważa, że czajnik jest prawie pusty — i wraca z pełnym). Kompulsywna uważność (pedanteria) oznacza, że człowiek nie może nie planować — planuje nawet wtedy, gdy nie trzeba, trudno mu się rozluźnić i zachowywać naturalnie, kieruje się utrwalonymi ideami. Uważność jest krytyczna dla kierownika, księgowego, prawnika, stróża; a dla ładowacza, projektanta czy muzyka może być nie tak ważna — oni mają inne narzędzia.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt A',
              bp('„Czy robisz nieprzemyślane wypowiedzi, których potem żałujesz?", „czy często odkładasz sprawy i odkrywasz, że jest już za późno?", „czy planujesz sprawy z wyprzedzeniem, a następnie realizujesz plany?", „czy potrafisz ustabilizować sytuację, gdy inni panikują?".', true)) +
            '<h3>Punkt B — pozytywność</h3>' +
            '<p>Punkt B — pozytywność. To chroniczny poziom nastroju: czy człowiek jest nastawiony na rozwiązanie i zadowolony z życia, czy przygnębiony i widzi wszędzie minusy. Po tym punkcie po części sądzi się i o uczciwości: zadowoleni z życia ludzie rzadziej popełniają nieuczciwe czyny. Przy niskiej pozytywności człowiek jest negatywny, widzi problemy i przeszkody, łatwo zniekształca fakty i donosi złe nowiny („u nas ciągle wszystko się psuje"), często „przegrywa" (nie wierzy w zwycięstwo), jest słaby w strategii i mało twórczy. Przy wysokiej — widzi rozwiązania, jest otwarty, lubi prostotę, uczciwy, często wygrywa, silny w strategii (widzi cały obraz), twórczo przyjemny.</p>' +
            k('KLUCZOWA MYŚL · „Błyskawica" — punkt pływający',
              bp('Ważny szczegół: jeśli na punkcie widać „błyskawicę", to punkt pływający — nastrój może się zmieniać jak kolejka górska. Zwykle dzieje się to pod tłumieniem — obok są osobowości tłumiące (mniej więcej 3% ludzi), które dążą do obniżenia cudzej pewności i „przyduszenia" tego, kto zaczyna rosnąć. Pytania sprawdzające to wykrywają: „czy zdarzają ci się okresy smutku i przygnębienia, które zmieniają się w dobry nastrój?". Samo w sobie nie jest to jeszcze czynnik stopu, ale wskaźnik ważny.', true)) +
            '<p>Kompulsywna pozytywność — gdy człowiek nie może się nie cieszyć: skłonny jest nie rozwiązywać problemów, lecz je odkładać („wszystko będzie dobrze") nawet tam, gdzie jest to nie na miejscu.</p>',
        },
      },

      // 3 — ТОЧКИ C И D: САМООБЛАДАНИЕ И УВЕРЕННОСТЬ
      {
        id: 'points-cd',
        title: {
          ru: 'Точки C и D: самообладание и уверенность',
          en: 'Points C and D: self-possession and certainty',
          pl: 'Punkty C i D: panowanie nad sobą i pewność',
        },
        desc: {
          ru: 'Самообладание — контроль эмоций; уверенность — надёжность и предсказуемость, с ключевым порогом 32, во многом задающим достоверность всего теста.',
          en: 'Self-possession — control of emotions; certainty — reliability and predictability, with the key threshold of 32 that largely sets the reliability of the whole test.',
          pl: 'Panowanie nad sobą — kontrola emocji; pewność — niezawodność i przewidywalność, z kluczowym progiem 32, który w dużej mierze zadaje wiarygodność całego testu.',
        },
        html: {
          ru:
            '<h2>Глава 3. Точки C и D: самообладание и уверенность</h2>' +
            '<h3>Точка C — самообладание</h3>' +
            '<p>Точка C — самообладание. Показывает, насколько человек контролирует свои эмоции: спокоен он или нервозен, легко ли выходит из себя. При низком самообладании человек нервный, ему трудно расслабиться, он дольше отходит после конфликтов. При высоком — спокоен, хорошо владеет собой, легко расслабляется. Компульсивное самообладание означает, что человек не умеет нервничать «по чуть-чуть»: либо полностью спокоен, либо, если срывается, то сразу целиком; чтобы этого избежать, он стремится всё контролировать и обо всём знать. (Подробно логику самообладания и «взрываемости» мы разбирали в модуле про точки A–C.)</p>' +
            '<h3>Точка D — уверенность</h3>' +
            '<p>Точка D — уверенность. Показывает, уверен ли человек в себе и насколько он надёжен и предсказуем. При низкой уверенности человек импульсивный и ненадёжный: любит перемены, не выносит рутину, действует «без карты» («вух и погнали»), может «переобуваться» — сегодня решил так, завтра иначе. Важный порог здесь — значение 32: ниже него точка считается низкой, и тесту такого человека не стоит сильно доверять, ведь завтра он может думать по-другому. При высокой уверенности (выше 32) человек надёжен, последователен («человек-слово»), предсказуем, не делает резких изменений, любит знать прежде чем делать и нуждается в «карте» — плане или стратегии; он хорошо справляется с рутиной.</p>' +
            '<p>Компульсивная уверенность означает, что человек не может действовать, когда в чём-то не уверен, его очень трудно переубедить — здесь загорается синдром «обязан быть правым»: приняв точку зрения, человек стоит на ней до конца, уверен, что знает всё, и может строить выводы даже на ложных данных. Такой человек хорош как исполнительный директор (действует надёжно, системно, разбирается во всех деталях перед началом), а вот коммерческому директору с такой точкой будет тяжело. В целом предпочтение отдают кандидатам с уверенностью выше среднего.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка D',
              bp('«Неуютно ли вам, если вокруг беспорядок?», «храните ли вещи, которые могут впоследствии пригодиться?», «отменяете ли запланированное, считаясь с желаниями других?» (это про уровень консерватизма).', true)) +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Эта точка во многом задаёт достоверность всего теста: если уверенность ниже порога 32, человек сегодня думает одно, а завтра другое — и всему остальному тесту тоже не стоит сильно доверять.', true)),
          en:
            '<h2>Chapter 3. Points C and D: self-possession and certainty</h2>' +
            '<h3>Point C — self-possession</h3>' +
            '<p>Point C — self-possession. Shows how well a person controls his emotions: whether he is calm or nervous, whether he easily loses his temper. With low self-possession a person is nervous, finds it hard to relax, takes longer to recover after conflicts. With high self-possession he is calm, has good command of himself, relaxes easily. Compulsive self-possession means that a person does not know how to be nervous "a little at a time": either fully calm or, if he snaps, then all at once; to avoid this, he strives to control everything and to know about everything. (We examined the logic of self-possession and "explosiveness" in detail in the module on points A–C.)</p>' +
            '<h3>Point D — certainty</h3>' +
            '<p>Point D — certainty. Shows whether a person is self-assured and how reliable and predictable he is. With low certainty a person is impulsive and unreliable: he likes changes, cannot stand routine, acts "without a map" ("whoosh and off we go"), may "change his shoes" — today he decided one way, tomorrow another. An important threshold here is the value 32: below it the point is considered low, and one should not trust such a person\'s test too much, for tomorrow he may think differently. With high certainty (above 32) a person is reliable, consistent ("a man of his word"), predictable, does not make sharp changes, likes to know before doing, and needs a "map" — a plan or strategy; he copes well with routine.</p>' +
            '<p>Compulsive certainty means that a person cannot act when he is unsure of something, and is very hard to talk round — here the "must be right" syndrome lights up: having adopted a point of view, the person stands by it to the end, is sure he knows everything, and may build conclusions even on false data. Such a person is good as an executive director (acts reliably, systematically, gets to grips with all the details before starting), but for a commercial director such a point will be hard. On the whole, preference is given to candidates with above-average certainty.</p>' +
            b('SAMPLE QUESTIONS · Point D',
              bp('"Are you uncomfortable if there is disorder around you?", "do you keep things that may come in handy later?", "do you cancel what you had planned, taking others\' wishes into account?" (this is about the level of conservatism).', true)) +
            k('KEY IDEA',
              bp('This point largely sets the reliability of the whole test: if certainty is below the threshold of 32, the person thinks one thing today and another tomorrow — and the rest of the test should not be trusted too much either.', true)),
          pl:
            '<h2>Rozdział 3. Punkty C i D: panowanie nad sobą i pewność</h2>' +
            '<h3>Punkt C — panowanie nad sobą</h3>' +
            '<p>Punkt C — panowanie nad sobą. Pokazuje, na ile człowiek kontroluje swoje emocje: czy jest spokojny, czy nerwowy, czy łatwo wychodzi z równowagi. Przy niskim panowaniu nad sobą człowiek jest nerwowy, trudno mu się rozluźnić, dłużej dochodzi do siebie po konfliktach. Przy wysokim — jest spokojny, dobrze nad sobą panuje, łatwo się rozluźnia. Kompulsywne panowanie nad sobą oznacza, że człowiek nie umie denerwować się „po trochu": albo jest w pełni spokojny, albo, jeśli mu puszczą nerwy, to od razu w całości; żeby tego uniknąć, dąży, żeby wszystko kontrolować i o wszystkim wiedzieć. (Szczegółowo logikę panowania nad sobą i „wybuchowości" omawialiśmy w module o punktach A–C.)</p>' +
            '<h3>Punkt D — pewność</h3>' +
            '<p>Punkt D — pewność. Pokazuje, czy człowiek jest pewny siebie i na ile jest niezawodny i przewidywalny. Przy niskiej pewności człowiek jest impulsywny i zawodny: lubi zmiany, nie znosi rutyny, działa „bez mapy" („wżju i ruszamy"), może być „chorągiewką na wietrze" — dziś zdecydował tak, jutro inaczej. Ważny próg tu to wartość 32: poniżej niego punkt uważa się za niski, i testowi takiego człowieka nie warto zbytnio ufać, bo jutro może myśleć inaczej. Przy wysokiej pewności (powyżej 32) człowiek jest niezawodny, konsekwentny („człowiek słowo"), przewidywalny, nie robi gwałtownych zmian, lubi wiedzieć, zanim zrobi, i potrzebuje „mapy" — planu albo strategii; dobrze radzi sobie z rutyną.</p>' +
            '<p>Kompulsywna pewność oznacza, że człowiek nie może działać, gdy w czymś nie jest pewny, bardzo trudno go przekonać — tu zapala się syndrom „musi mieć rację": przyjąwszy punkt widzenia, człowiek stoi na nim do końca, jest pewny, że wie wszystko, i może budować wnioski nawet na fałszywych danych. Taki człowiek jest dobry jako dyrektor wykonawczy (działa niezawodnie, systemowo, rozpoznaje wszystkie szczegóły przed rozpoczęciem), a oto dyrektorowi handlowemu z takim punktem będzie ciężko. Ogólnie preferencję daje się kandydatom z pewnością powyżej średniej.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt D',
              bp('„Czy jest ci nieswojo, gdy wokół jest nieporządek?", „czy przechowujesz rzeczy, które mogą się później przydać?", „czy odwołujesz zaplanowane, licząc się z pragnieniami innych?" (to o poziomie konserwatyzmu).', true)) +
            k('KLUCZOWA MYŚL',
              bp('Ten punkt w dużej mierze zadaje wiarygodność całego testu: jeśli pewność jest poniżej progu 32, człowiek dziś myśli jedno, a jutro drugie — i całej reszcie testu też nie warto zbytnio ufać.', true)),
        },
      },

      // 4 — ТОЧКИ E И F: АКТИВНОСТЬ И НАСТОЙЧИВОСТЬ
      {
        id: 'points-ef',
        title: {
          ru: 'Точки E и F: активность и настойчивость',
          en: 'Points E and F: activity and persistence',
          pl: 'Punkty E i F: aktywność i wytrwałość',
        },
        desc: {
          ru: 'Активность — уровень энергии (тоже «плавающая» точка); настойчивость — напор и ориентация на результат, основной инструмент продажника.',
          en: 'Activity — the level of energy (also a "floating" point); persistence — force and orientation toward the result, the main tool of a salesperson.',
          pl: 'Aktywność — poziom energii (też punkt „pływający"); wytrwałość — napór i nastawienie na rezultat, podstawowe narzędzie sprzedawcy.',
        },
        html: {
          ru:
            '<h2>Глава 4. Точки E и F: активность и настойчивость</h2>' +
            '<h3>Точка E — активность</h3>' +
            '<p>Точка E — активность. Это уровень энергии и жизненных сил: легко ли человек берётся за много дел и тянется ли к новому. При низкой активности человек пассивен, у него мало энергии, он не любит движение и новое, мало инициативен, действует в известных областях, у него меньше выносливости (юристы, сидящие с документами, часто такие — будто из них «выкачали энергию»). При высокой — энергичен, любит движение и деятельность, начинает, инициативен, интересуется новым, берётся за много дел. Компульсивная активность (энерджайзер) означает, что человек не может не действовать: не усидит на месте, постоянно тянется к новому и — что важно — может менять даже то, что уже работает, потому что не может не менять; в колл-центре на однообразных звонках он не удержится. Как и настроение, энергия бывает переменной (тоже «молния»): её могут «выкачивать» под подавлением.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка E',
              bp('«Предпочитаете наблюдать за спортом с трибуны, а не участвовать?», «пытаетесь ли организовать дома что-то новое, сделать ремонт?», «можете быть заводилой на вечеринке?», «предпочли бы ехать на машине, чем идти пешком, даже если недалеко?». (Реальный случай: кандидат на должность юриста опоздал на собеседование, поехав на такси там, где пять минут пешком, — и его тест как раз показал низкую энергию.)', true)) +
            '<h3>Точка F — настойчивость</h3>' +
            '<p>Точка F — настойчивость. Показывает, насколько человек напорист и способен доводить дела до конца: отступит ли при трудностях или его почти невозможно сбить с пути. При низкой настойчивости человек осторожен, действует неэффективно и «из-за угла», не очень прям, слабее ориентирован на результат (больше заботится о том, чтобы никого не потревожить), медленно учится, мягко общается. При высокой — напорист, действует прямо, ориентирован на результат, доводит дела до конца, быстро учится. Для продажников настойчивость — основной инструмент: без неё продавать зачастую просто не получается. Компульсивная настойчивость означает, что человек применяет больше силы, чем нужно: может что-то сломать («выбить дверь» вместо того, чтобы подождать), «пережечь» клиентов, идти к цели, даже когда она уже неактуальна, и ранить окружающих излишней прямотой.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка F',
              bp('«Легко ли откажетесь от задуманного, столкнувшись со сложностями?», «отказываетесь ли браться за дело, если сомневаетесь, что справитесь?», «предпочитаете отдавать приказы, а не исполнять их?», «озвучиваете ли своё мнение даже там, где не являетесь специалистом?».', true)),
          en:
            '<h2>Chapter 4. Points E and F: activity and persistence</h2>' +
            '<h3>Point E — activity</h3>' +
            '<p>Point E — activity. This is the level of energy and vital force: whether a person easily takes on many matters and is drawn to the new. With low activity a person is passive, has little energy, does not like movement and the new, is not very initiative-taking, acts in known areas, has less endurance (lawyers sitting over documents are often like this — as if the energy has been "pumped out" of them). With high activity he is energetic, likes movement and activity, begins things, takes initiative, is interested in the new, takes on many matters. Compulsive activity (an "Energizer") means that a person cannot not act: he cannot sit still, is constantly drawn to the new, and — importantly — may change even what already works, because he cannot not change; in a call center on monotonous calls he will not last. Like mood, energy can be variable (also a "lightning bolt"): it can be "pumped out" under suppression.</p>' +
            b('SAMPLE QUESTIONS · Point E',
              bp('"Do you prefer to watch sports from the stands rather than take part?", "do you try to organize something new at home, do a renovation?", "can you be the life of the party?", "would you rather go by car than walk, even if it\'s not far?". (A real case: a candidate for a lawyer\'s position was late to the interview, having taken a taxi where it was a five-minute walk — and his test showed precisely low energy.)', true)) +
            '<h3>Point F — persistence</h3>' +
            '<p>Point F — persistence. Shows how forceful a person is and how capable of seeing things through: whether he will retreat at difficulties or is almost impossible to knock off course. With low persistence a person is cautious, acts ineffectively and "from around the corner," is not very direct, is less oriented toward the result (cares more about not disturbing anyone), learns slowly, communicates softly. With high persistence he is forceful, acts directly, is oriented toward the result, sees things through, learns quickly. For salespeople, persistence is the main tool: without it, selling often simply does not work out. Compulsive persistence means that a person applies more force than is needed: he may break something ("knock the door down" instead of waiting), "burn out" clients, head toward a goal even when it is no longer relevant, and wound those around him with excessive directness.</p>' +
            b('SAMPLE QUESTIONS · Point F',
              bp('"Will you easily give up on what you intended, having run into difficulties?", "do you refuse to take on a matter if you doubt you\'ll manage it?", "do you prefer to give orders rather than carry them out?", "do you voice your opinion even where you are not a specialist?".', true)),
          pl:
            '<h2>Rozdział 4. Punkty E i F: aktywność i wytrwałość</h2>' +
            '<h3>Punkt E — aktywność</h3>' +
            '<p>Punkt E — aktywność. To poziom energii i sił witalnych: czy człowiek łatwo bierze się za wiele spraw i czy ciągnie go do nowego. Przy niskiej aktywności człowiek jest pasywny, ma mało energii, nie lubi ruchu i nowego, jest mało inicjatywny, działa w znanych obszarach, ma mniej wytrzymałości (prawnicy siedzący z dokumentami często są tacy — jakby „wypompowano z nich energię"). Przy wysokiej — jest energiczny, lubi ruch i działalność, zaczyna, jest inicjatywny, interesuje się nowym, bierze się za wiele spraw. Kompulsywna aktywność (energizer) oznacza, że człowiek nie może nie działać: nie usiedzi na miejscu, nieustannie ciągnie go do nowego i — co ważne — może zmieniać nawet to, co już działa, bo nie może nie zmieniać; w call center przy jednostajnych telefonach się nie utrzyma. Jak i nastrój, energia bywa zmienna (też „błyskawica"): można ją „wypompowywać" pod tłumieniem.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt E',
              bp('„Czy wolisz obserwować sport z trybuny, a nie uczestniczyć?", „czy próbujesz zorganizować w domu coś nowego, zrobić remont?", „czy potrafisz być duszą towarzystwa na imprezie?", „czy wolałbyś jechać samochodem niż iść pieszo, nawet jeśli niedaleko?". (Realny przypadek: kandydat na stanowisko prawnika spóźnił się na rozmowę, pojechawszy taksówką tam, gdzie pięć minut pieszo — i jego test właśnie pokazał niską energię.)', true)) +
            '<h3>Punkt F — wytrwałość</h3>' +
            '<p>Punkt F — wytrwałość. Pokazuje, na ile człowiek jest napastliwy i zdolny doprowadzać sprawy do końca: czy odstąpi przy trudnościach, czy prawie niemożliwe jest zbić go z drogi. Przy niskiej wytrwałości człowiek jest ostrożny, działa nieefektywnie i „zza rogu", nie jest zbyt bezpośredni, słabiej nastawiony na rezultat (bardziej dba o to, żeby nikogo nie zaniepokoić), uczy się wolno, komunikuje się miękko. Przy wysokiej — jest napastliwy, działa wprost, nastawiony na rezultat, doprowadza sprawy do końca, szybko się uczy. Dla sprzedawców wytrwałość to podstawowe narzędzie: bez niej sprzedawać często po prostu się nie udaje. Kompulsywna wytrwałość oznacza, że człowiek stosuje więcej siły, niż trzeba: może coś złamać („wyważyć drzwi" zamiast poczekać), „przepalić" klientów, iść do celu, nawet gdy jest on już nieaktualny, i ranić otoczenie zbędną bezpośredniością.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt F',
              bp('„Czy łatwo zrezygnujesz z zamierzonego, natknąwszy się na trudności?", „czy odmawiasz brania się za sprawę, jeśli wątpisz, że sobie poradzisz?", „czy wolisz wydawać rozkazy, a nie je wykonywać?", „czy wygłaszasz swoje zdanie nawet tam, gdzie nie jesteś specjalistą?".', true)),
        },
      },

      // 5 — ТОЧКИ G И H: ОТВЕТСТВЕННОСТЬ И ОБЪЕКТИВНОСТЬ
      {
        id: 'points-gh',
        title: {
          ru: 'Точки G и H: ответственность и объективность',
          en: 'Points G and H: responsibility and objectivity',
          pl: 'Punkty G i H: odpowiedzialność i obiektywność',
        },
        desc: {
          ru: 'Ответственность — не про «ответственный/безответственный», а про держание давления и критики; объективность — справедливость и дипломатичность.',
          en: 'Responsibility — not about "responsible/irresponsible," but about withstanding pressure and criticism; objectivity — fairness and diplomacy.',
          pl: 'Odpowiedzialność — nie o „odpowiedzialny/nieodpowiedzialny", lecz o trzymaniu nacisku i krytyki; obiektywność — sprawiedliwość i dyplomacja.',
        },
        html: {
          ru:
            '<h2>Глава 5. Точки G и H: ответственность и объективность</h2>' +
            '<h3>Точка G — ответственность</h3>' +
            '<p>Точка G — ответственность. Это непростая точка, и она вовсе не про «ответственный или безответственный». Она показывает, любит ли человек, когда с него спрашивают за взятые обязательства, и способен ли он принять и уладить критику или избегает давления (интровертируется — «уходит внутрь»). При низкой ответственности человек очень раним к критике: не любит, когда с него спрашивают («ну что, сделал?»), обижается, избегает давления, из-за критики закрывается и медленно даёт отклик. Это коммуникативная точка, поэтому вывод «он безответственный» — ложный: такой человек может делать своё дело прекрасно, он просто не любит отвечать перед другими, когда кто-то «лезет» и спрашивает. При высокой ответственности человек легко держит давление, спокойно принимает и улаживает критику, видит последствия своих действий, быстро даёт обратную связь («спасибо за критику, всё исправим») — ему больше доверяют. Компульсивная ответственность — это «шахматист»: он просчитывает, что сказать и сделать, чтобы получить нужное, относится к людям как к фигурам на доске, почти никогда не смущается и любит производить впечатление.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка G',
              bp('«Есть ли темы, затрагивание которых вызывает у вас болезненную реакцию?», «снисходительны ли вы к друзьям там, где к другим отнеслись бы строже?», «трудно ли вам понять, почему другой не может взглянуть на ситуацию вашими глазами?».', true)) +
            '<h3>Точка H — объективность</h3>' +
            '<p>Точка H — объективность. Показывает, насколько человек справедлив и дипломатичен: ориентирован ли он на согласие и решение проблем или постоянно спорит, фокусируется на ошибках и слаб в тактике с людьми. При низкой объективности человек критичен, концентрируется на несогласии, показывает в основном ошибки, с ним сложнее сотрудничать («не душка»), он мало дипломатичен и хуже расставляет приоритеты. При высокой — справедлив, ориентирован на согласие и решение («давайте не копаться, кто виноват, а подумаем, как решить»), с ним легко сотрудничать, он строит крепкие долгосрочные отношения и хорошо расставляет приоритеты в тактике с людьми. Компульсивная объективность означает, что человек любит всё объяснять и аргументировать (вплоть до непродуктивных дискуссий), стремится понять и объяснить даже то, что объяснению не поддаётся, — и этим может «грузить». Высокая объективность особенно ценна для судьи или адвоката, дипломата, переговорщика, пиар- или бренд-менеджера, а также HR-директора (силён в тактике, дипломатичен, со всеми в хороших отношениях).</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка H',
              bp('«Удерживаетесь ли от недовольства, если кто-то опоздал?», «может ли расхождение во мнениях испортить ваши отношения с человеком?», «если теряете вещь, приходит ли мысль, что её кто-то украл?», «трудно ли вам признать свою вину?».', true)),
          en:
            '<h2>Chapter 5. Points G and H: responsibility and objectivity</h2>' +
            '<h3>Point G — responsibility</h3>' +
            '<p>Point G — responsibility. This is a tricky point, and it is not at all about "responsible or irresponsible." It shows whether a person likes being held to account for undertaken obligations, and whether he is able to accept and handle criticism or avoids pressure (introverts — "goes inward"). With low responsibility a person is very vulnerable to criticism: he does not like being held to account ("well, did you do it?"), takes offense, avoids pressure, closes up because of criticism, and is slow to give a response. This is a communicative point, so the conclusion "he\'s irresponsible" is false: such a person may do his job splendidly, he simply does not like to answer to others when someone "butts in" and asks. With high responsibility a person easily withstands pressure, calmly accepts and handles criticism, sees the consequences of his actions, quickly gives feedback ("thanks for the criticism, we\'ll fix everything") — he is trusted more. Compulsive responsibility is a "chess player": he calculates what to say and do in order to get what he needs, treats people like pieces on a board, almost never gets flustered, and likes to make an impression.</p>' +
            b('SAMPLE QUESTIONS · Point G',
              bp('"Are there topics whose broaching provokes a painful reaction in you?", "are you lenient with friends where you would treat others more strictly?", "is it hard for you to understand why another cannot look at a situation through your eyes?".', true)) +
            '<h3>Point H — objectivity</h3>' +
            '<p>Point H — objectivity. Shows how fair and diplomatic a person is: whether he is oriented toward agreement and solving problems, or constantly argues, focuses on mistakes, and is weak in tactics with people. With low objectivity a person is critical, concentrates on disagreement, shows mainly mistakes, is harder to cooperate with ("not a sweetheart"), is not very diplomatic, and is worse at setting priorities. With high objectivity he is fair, oriented toward agreement and a solution ("let\'s not dig into who\'s to blame, but think about how to solve it"), is easy to cooperate with, builds strong long-term relations, and sets priorities well in tactics with people. Compulsive objectivity means that a person likes to explain and argue everything (up to unproductive discussions), strives to understand and explain even what does not lend itself to explanation — and by this may "weigh people down." High objectivity is especially valuable for a judge or lawyer, a diplomat, a negotiator, a PR or brand manager, and also an HR director (strong in tactics, diplomatic, on good terms with everyone).</p>' +
            b('SAMPLE QUESTIONS · Point H',
              bp('"Do you refrain from displeasure if someone was late?", "can a difference of opinion spoil your relations with a person?", "if you lose something, does the thought come that someone stole it?", "is it hard for you to admit your own fault?".', true)),
          pl:
            '<h2>Rozdział 5. Punkty G i H: odpowiedzialność i obiektywność</h2>' +
            '<h3>Punkt G — odpowiedzialność</h3>' +
            '<p>Punkt G — odpowiedzialność. To niełatwy punkt, i wcale nie o „odpowiedzialny czy nieodpowiedzialny". Pokazuje, czy człowiek lubi, gdy się go rozlicza z podjętych zobowiązań, i czy jest zdolny przyjąć i rozładować krytykę, czy unika nacisku (introwertuje się — „ucieka do wewnątrz"). Przy niskiej odpowiedzialności człowiek jest bardzo wrażliwy na krytykę: nie lubi, gdy się go rozlicza („no i co, zrobiłeś?"), obraża się, unika nacisku, z powodu krytyki się zamyka i wolno daje odzew. To punkt komunikacyjny, dlatego wniosek „jest nieodpowiedzialny" jest fałszywy: taki człowiek może robić swoją sprawę wspaniale, po prostu nie lubi odpowiadać przed innymi, gdy ktoś „się wtrąca" i pyta. Przy wysokiej odpowiedzialności człowiek łatwo trzyma nacisk, spokojnie przyjmuje i rozładowuje krytykę, widzi następstwa swoich działań, szybko daje informację zwrotną („dziękuję za krytykę, wszystko naprawimy") — bardziej mu się ufa. Kompulsywna odpowiedzialność to „szachista": oblicza, co powiedzieć i zrobić, żeby dostać potrzebne, traktuje ludzi jak figury na szachownicy, prawie nigdy się nie peszy i lubi robić wrażenie.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt G',
              bp('„Czy są tematy, których poruszanie wywołuje u ciebie bolesną reakcję?", „czy jesteś pobłażliwy wobec przyjaciół tam, gdzie do innych odniósłbyś się surowiej?", „czy trudno ci zrozumieć, dlaczego ktoś inny nie może spojrzeć na sytuację twoimi oczami?".', true)) +
            '<h3>Punkt H — obiektywność</h3>' +
            '<p>Punkt H — obiektywność. Pokazuje, na ile człowiek jest sprawiedliwy i dyplomatyczny: czy jest nastawiony na zgodę i rozwiązywanie problemów, czy nieustannie się spiera, skupia się na błędach i jest słaby w taktyce z ludźmi. Przy niskiej obiektywności człowiek jest krytyczny, koncentruje się na niezgodzie, pokazuje głównie błędy, trudniej z nim współpracować („nie jest duszką"), jest mało dyplomatyczny i gorzej ustala priorytety. Przy wysokiej — jest sprawiedliwy, nastawiony na zgodę i rozwiązanie („nie grzebmy, kto winny, lecz pomyślmy, jak rozwiązać"), łatwo z nim współpracować, buduje mocne, długoterminowe relacje i dobrze ustala priorytety w taktyce z ludźmi. Kompulsywna obiektywność oznacza, że człowiek lubi wszystko objaśniać i argumentować (aż po nieproduktywne dyskusje), dąży do zrozumienia i objaśnienia nawet tego, co objaśnieniu się nie poddaje — i tym może „obciążać". Wysoka obiektywność jest szczególnie cenna dla sędziego czy adwokata, dyplomaty, negocjatora, PR- lub brand-menedżera, a także dyrektora HR (silny w taktyce, dyplomatyczny, ze wszystkimi w dobrych relacjach).</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt H',
              bp('„Czy powstrzymujesz się od niezadowolenia, jeśli ktoś się spóźnił?", „czy rozbieżność zdań może popsuć twoje relacje z człowiekiem?", „jeśli tracisz rzecz, czy przychodzi ci myśl, że ktoś ją ukradł?", „czy trudno ci przyznać się do winy?".', true)),
        },
      },

      // 6 — ТОЧКИ I И J: ЧУТКОСТЬ И ОБЩИТЕЛЬНОСТЬ
      {
        id: 'points-ij',
        title: {
          ru: 'Точки I и J: чуткость и общительность',
          en: 'Points I and J: sensitivity and sociability',
          pl: 'Punkty I i J: wrażliwość i towarzyskość',
        },
        desc: {
          ru: 'Чуткость — уровень теплоты и ориентации на других; общительность — «яркость» контакта, при этом низкая точка не означает, что человек плохо общается.',
          en: 'Sensitivity — the level of warmth and orientation toward others; sociability — the "vividness" of contact, while a low point does not mean the person communicates badly.',
          pl: 'Wrażliwość — poziom ciepła i nastawienia na innych; towarzyskość — „barwność" kontaktu, przy czym niski punkt nie oznacza, że człowiek źle się komunikuje.',
        },
        html: {
          ru:
            '<h2>Глава 6. Точки I и J: чуткость и общительность</h2>' +
            '<h3>Точка I — чуткость</h3>' +
            '<p>Точка I — чуткость. Определяет уровень теплоты человека: эгоистичен ли он и опирается только на своё мнение или для него важны чувства и комфорт других. При низкой чуткости человек закрыт и холоден, не ориентирован на помощь, держит чувства при себе, редко благодарит, держит дистанцию и видит в основном свою точку зрения. При высокой — душевен, любит помогать, легко проявляет чувства, выражает сердечную благодарность, создаёт близкие отношения и замечает чувства других. Здесь важно понимать, кого ищешь: няне чуткость необходима, а вот очень чуткий продажник — не всегда хорошо, потому что им могут манипулировать (может давать скидки там, где не нужно); у полицейских и военных чуткость обычно снижена — иначе им было бы трудно выполнять работу. Компульсивная чуткость означает, что человек, когда его просят помочь, скажет «да», даже отложив собственную работу: он так хорошо видит чужую точку зрения, что забывает свою и ни во что себя не ставит (такого человека опасно ставить на ресепшен — он не сможет отказать); а иногда его сочувствие может резко выключиться в холод.</p>' +
            b('ПРИМЕРЫ ВОПРОСОВ · Точка I',
              bp('«Стали бы вы покупать товар, на котором по ошибке указана более низкая цена?» (чуткий откажется — «это кому-то навредит», холодный увидит «крутую возможность»), «остановитесь ли узнать, нужна ли человеку помощь, если он не просил?», «раздражают ли вас маленькие странности других людей?».', true)) +
            '<h3>Точка J — общительность</h3>' +
            '<p>Точка J — общительность. Это последняя точка. Показывает, насколько человек любит общение и стремится к нему: тянется ли он быть в центре внимания и вступать в новые контакты или предпочитает оставаться в тени и с трудом доносит мысли. При низкой общительности человек замкнут, редко начинает общение первым, долго и с трудом устанавливает контакт (для него новые знакомства — стресс), не любит продвигать себя; такие люди чаще выбирают работу с машинами и предметами (программист, токарь). При высокой — это яркие люди, которые сами начинают общение, быстро устанавливают контакт, любят быть в центре и продвигаются; их легко понять, и они идут в менеджеры по персоналу, рекрутеры, ведущие. Для sales-менеджеров общительность важна.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Имя точки обманчиво',
              bp('И здесь снова вспомним, что имя точки обманчиво: низкая общительность не означает, что человек плохо общается. Например, у одного сотрудника-программиста общительность была на уровне минус девяносто — ему тяжело даётся разговор, — но при высокой внимательности и стрессоустойчивости он оказался идеальным программистом: не отвлекается и не бросает дела при сложностях.', true)) +
            '<p>На этом мы разобрали все десять точек в их практическом чтении. В следующем, заключительном модуле мы пройдём по синдромам «Тест Тулс» — характерным сочетаниям точек, которые особенно важны для прогноза и анализа.</p>',
          en:
            '<h2>Chapter 6. Points I and J: sensitivity and sociability</h2>' +
            '<h3>Point I — sensitivity</h3>' +
            '<p>Point I — sensitivity. Determines the level of a person\'s warmth: whether he is selfish and relies only on his own opinion, or whether the feelings and comfort of others matter to him. With low sensitivity a person is closed off and cold, not oriented toward helping, keeps his feelings to himself, rarely gives thanks, keeps his distance, and sees mainly his own point of view. With high sensitivity he is warm-hearted, likes to help, easily displays feelings, expresses heartfelt gratitude, creates close relations, and notices others\' feelings. Here it is important to understand whom you are looking for: for a nanny sensitivity is essential, but a very sensitive salesperson is not always good, because he can be manipulated (may give discounts where they are not needed); in police officers and military personnel sensitivity is usually reduced — otherwise it would be hard for them to do the work. Compulsive sensitivity means that a person, when asked to help, will say "yes," even setting aside his own work: he sees the other\'s point of view so well that he forgets his own and puts himself at nothing (it is dangerous to put such a person at reception — he will not be able to refuse); and sometimes his compassion may abruptly switch off into coldness.</p>' +
            b('SAMPLE QUESTIONS · Point I',
              bp('"Would you buy an item on which a lower price is shown by mistake?" (a sensitive one will decline — "it will harm someone," a cold one will see "a great opportunity"), "will you stop to find out whether a person needs help, if he didn\'t ask?", "do other people\'s small quirks irritate you?".', true)) +
            '<h3>Point J — sociability</h3>' +
            '<p>Point J — sociability. This is the last point. It shows how much a person likes communication and strives for it: whether he is drawn to being the center of attention and entering into new contacts, or prefers to remain in the shadows and conveys thoughts with difficulty. With low sociability a person is withdrawn, rarely starts communication first, establishes contact long and with difficulty (for him new acquaintances are stressful), and does not like to promote himself; such people more often choose work with machines and objects (a programmer, a lathe operator). With high sociability these are vivid people who themselves start communication, quickly establish contact, like to be the center, and promote themselves; they are easy to understand, and they go into HR management, recruiting, hosting. For sales managers, sociability is important.</p>' +
            k('KEY IDEA · The point\'s name is deceptive',
              bp('And here let us again recall that the point\'s name is deceptive: low sociability does not mean that a person communicates badly. For example, one programmer employee had sociability at the level of minus ninety — conversation comes hard to him — but with high attentiveness and stress resistance he turned out to be an ideal programmer: he does not get distracted and does not abandon matters at difficulties.', true)) +
            '<p>With this we have examined all ten points in their practical reading. In the next, concluding module we will go through the syndromes of the "Tools Test" — characteristic combinations of points that are especially important for prediction and analysis.</p>',
          pl:
            '<h2>Rozdział 6. Punkty I i J: wrażliwość i towarzyskość</h2>' +
            '<h3>Punkt I — wrażliwość</h3>' +
            '<p>Punkt I — wrażliwość. Określa poziom ciepła człowieka: czy jest egoistyczny i opiera się tylko na własnym zdaniu, czy ważne są dla niego uczucia i komfort innych. Przy niskiej wrażliwości człowiek jest zamknięty i chłodny, nie jest nastawiony na pomoc, trzyma uczucia przy sobie, rzadko dziękuje, trzyma dystans i widzi głównie swój punkt widzenia. Przy wysokiej — jest serdeczny, lubi pomagać, łatwo okazuje uczucia, wyraża szczerą wdzięczność, tworzy bliskie relacje i zauważa uczucia innych. Tu ważne jest rozumieć, kogo się szuka: niani wrażliwość jest niezbędna, a oto bardzo wrażliwy sprzedawca — nie zawsze dobrze, bo można nim manipulować (może dawać rabaty tam, gdzie nie trzeba); u policjantów i wojskowych wrażliwość jest zwykle obniżona — inaczej trudno byłoby im wykonywać pracę. Kompulsywna wrażliwość oznacza, że człowiek, gdy się go prosi o pomoc, powie „tak", nawet odkładając własną pracę: tak dobrze widzi cudzy punkt widzenia, że zapomina swój i w ogóle się nie ceni (takiego człowieka niebezpiecznie stawiać na recepcji — nie będzie umiał odmówić); a czasem jego współczucie może gwałtownie wyłączyć się w chłód.</p>' +
            b('PRZYKŁADY PYTAŃ · Punkt I',
              bp('„Czy kupiłbyś towar, na którym przez pomyłkę wskazano niższą cenę?" (wrażliwy odmówi — „to komuś zaszkodzi", chłodny zobaczy „świetną okazję"), „czy zatrzymasz się, żeby zapytać, czy człowiek potrzebuje pomocy, jeśli nie prosił?", „czy irytują cię małe dziwactwa innych ludzi?".', true)) +
            '<h3>Punkt J — towarzyskość</h3>' +
            '<p>Punkt J — towarzyskość. To ostatni punkt. Pokazuje, na ile człowiek lubi komunikację i do niej dąży: czy ciągnie go, żeby być w centrum uwagi i wchodzić w nowe kontakty, czy woli pozostawać w cieniu i z trudem przekazuje myśli. Przy niskiej towarzyskości człowiek jest zamknięty, rzadko zaczyna komunikację jako pierwszy, długo i z trudem nawiązuje kontakt (dla niego nowe znajomości to stres), nie lubi promować siebie; tacy ludzie częściej wybierają pracę z maszynami i przedmiotami (programista, tokarz). Przy wysokiej — to barwni ludzie, którzy sami zaczynają komunikację, szybko nawiązują kontakt, lubią być w centrum i się promują; łatwo ich zrozumieć, i idą na menedżerów ds. personelu, rekruterów, prowadzących. Dla menedżerów sprzedaży towarzyskość jest ważna.</p>' +
            k('KLUCZOWA MYŚL · Nazwa punktu jest myląca',
              bp('I tu znów przypomnijmy, że nazwa punktu jest myląca: niska towarzyskość nie oznacza, że człowiek źle się komunikuje. Na przykład u jednego pracownika-programisty towarzyskość była na poziomie minus dziewięćdziesiąt — rozmowa przychodzi mu z trudem — ale przy wysokiej uważności i odporności na stres okazał się idealnym programistą: nie rozprasza się i nie rzuca spraw przy trudnościach.', true)) +
            '<p>Na tym omówiliśmy wszystkie dziesięć punktów w ich praktycznym czytaniu. W następnym, końcowym module przejdziemy przez syndromy „Test Tools" — charakterystyczne połączenia punktów, które są szczególnie ważne dla prognozy i analizy.</p>',
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Что измеряет «Тест Тулс»?',
            en: 'What does the "Tools Test" measure?',
            pl: 'Co mierzy „Test Tools"?',
          },
          opts: [
            { ru: 'Уровень интеллекта', en: 'The level of intelligence', pl: 'Poziom inteligencji' },
            { ru: 'Личную эффективность по десяти показателям («инструментам»)', en: 'Personal effectiveness across ten indicators ("tools")', pl: 'Efektywność osobistą według dziesięciu wskaźników („narzędzi")' },
            { ru: 'Продуктивность в прошлом', en: 'Productivity in the past', pl: 'Produktywność w przeszłości' },
            { ru: 'Уровень образования', en: 'The level of education', pl: 'Poziom wykształcenia' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Из скольких вопросов состоит тест и как они распределены?',
            en: 'How many questions does the test consist of and how are they distributed?',
            pl: 'Z ilu pytań składa się test i jak są rozłożone?',
          },
          opts: [
            { ru: '100 вопросов, по 10 на точку', en: '100 questions, 10 per point', pl: '100 pytań, po 10 na punkt' },
            { ru: '50 вопросов на весь тест', en: '50 questions for the whole test', pl: '50 pytań na cały test' },
            { ru: '20 вопросов на весь тест', en: '20 questions for the whole test', pl: '20 pytań na cały test' },
            { ru: '200 вопросов — по 20 на каждую из 10 точек', en: '200 questions — 20 for each of the 10 points', pl: '200 pytań — po 20 na każdy z 10 punktów' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'С чем «Тест Тулс» работает только в связке?',
            en: 'With what does the "Tools Test" work only in tandem?',
            pl: 'Z czym „Test Tools" działa tylko w parze?',
          },
          opts: [
            { ru: 'С тестом продуктивности («Тест Резалт») — решать по одному «Тест Тулс» нельзя', en: 'With the productivity test ("Result Test") — one cannot decide on the "Tools Test" alone', pl: 'Z testem produktywności („Test Result") — nie można decydować na podstawie samego „Test Tools"' },
            { ru: 'С тестом на интеллект', en: 'With an intelligence test', pl: 'Z testem na inteligencję' },
            { ru: 'Ни с чем', en: 'With nothing', pl: 'Z niczym' },
            { ru: 'С тестом на лидерство', en: 'With a leadership test', pl: 'Z testem na przywództwo' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: '«Тест Тулс» — это:',
            en: 'The "Tools Test" is:',
            pl: '„Test Tools" to:',
          },
          opts: [
            { ru: 'Постоянная, неизменная характеристика человека', en: 'A constant, unchanging characteristic of a person', pl: 'Stała, niezmienna charakterystyka człowieka' },
            { ru: 'Прогноз будущего', en: 'A forecast of the future', pl: 'Prognoza przyszłości' },
            { ru: '«Фотография личности на момент времени» — показатели могут меняться от настроения и обстоятельств', en: 'A "snapshot of the personality at a point in time" — the indicators can change with mood and circumstances', pl: '„Fotografia osobowości w danym momencie" — wskaźniki mogą się zmieniać w zależności od nastroju i okoliczności' },
            { ru: 'Медицинский диагноз', en: 'A medical diagnosis', pl: 'Diagnoza medyczna' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что обязательно указывают в тесте и почему?',
            en: 'What must be indicated in the test and why?',
            pl: 'Co koniecznie podaje się w teście i dlaczego?',
          },
          opts: [
            { ru: 'Только имя кандидата', en: 'Only the candidate\'s name', pl: 'Tylko imię kandydata' },
            { ru: 'Достоверные пол и возраст — от них зависит, какие нормативные показатели берутся для расчёта', en: 'Accurate sex and age — the normative indicators used for calculation depend on them', pl: 'Prawdziwą płeć i wiek — od nich zależy, jakie wskaźniki normatywne bierze się do obliczeń' },
            { ru: 'Только должность', en: 'Only the position', pl: 'Tylko stanowisko' },
            { ru: 'Ничего указывать не нужно', en: 'Nothing needs to be indicated', pl: 'Niczego nie trzeba podawać' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какие три задачи решает тест?',
            en: 'What three tasks does the test solve?',
            pl: 'Jakie trzy zadania rozwiązuje test?',
          },
          opts: [
            { ru: 'Только выбор кандидата', en: 'Only the selection of a candidate', pl: 'Tylko wybór kandydata' },
            { ru: 'Только увольнение', en: 'Only dismissal', pl: 'Tylko zwolnienie' },
            { ru: 'Диагностику болезней', en: 'The diagnosis of illnesses', pl: 'Diagnostykę chorób' },
            { ru: 'Определить сильные/слабые стороны; выбрать лучшего из нескольких; работать с уже нанятыми', en: 'To determine strengths/weaknesses; to choose the best of several; to work with those already hired', pl: 'Określić mocne/słabe strony; wybrać najlepszego z kilku; pracować z już zatrudnionymi' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что означает компульсивная (очень высокая) точка?',
            en: 'What does a compulsive (very high) point mean?',
            pl: 'Co oznacza punkt kompulsywny (bardzo wysoki)?',
          },
          opts: [
            { ru: 'Человек на все 20 вопросов ответил «только так, обязательно» — без этого он не может, иначе стресс', en: 'The person answered all 20 questions "only this way, without fail" — he cannot do without it, otherwise stress', pl: 'Człowiek na wszystkie 20 pytań odpowiedział „tylko tak, koniecznie" — bez tego nie może, inaczej stres' },
            { ru: 'Человек ответил случайно', en: 'The person answered at random', pl: 'Człowiek odpowiedział przypadkowo' },
            { ru: 'Точка недействительна', en: 'The point is invalid', pl: 'Punkt jest nieważny' },
            { ru: 'Человек не понял вопросов', en: 'The person did not understand the questions', pl: 'Człowiek nie zrozumiał pytań' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Точка A (внимательность) при высоком значении означает, что человек:',
            en: 'Point A (attentiveness) at a high value means that the person:',
            pl: 'Punkt A (uważność) przy wysokiej wartości oznacza, że człowiek:',
          },
          opts: [
            { ru: 'Рассеян и неорганизован', en: 'Is scattered and disorganized', pl: 'Jest rozproszony i niezorganizowany' },
            { ru: 'Не умеет планировать', en: 'Cannot plan', pl: 'Nie umie planować' },
            { ru: 'Хорошо концентрируется, планирует, «предугадывает» ожидания', en: 'Concentrates well, plans, "anticipates" expectations', pl: 'Dobrze się koncentruje, planuje, „przewiduje" oczekiwania' },
            { ru: 'Не следит за собой', en: 'Does not take care of himself', pl: 'Nie dba o siebie' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что означает «молния» на точке B (или E)?',
            en: 'What does a "lightning bolt" on point B (or E) mean?',
            pl: 'Co oznacza „błyskawica" na punkcie B (lub E)?',
          },
          opts: [
            { ru: 'Очень высокое значение', en: 'A very high value', pl: 'Bardzo wysoką wartość' },
            { ru: 'Плавающую точку — настроение (или энергия) может меняться «как американские горки», обычно под подавлением', en: 'A floating point — mood (or energy) can change "like a roller coaster," usually under suppression', pl: 'Punkt pływający — nastrój (lub energia) może się zmieniać „jak kolejka górska", zwykle pod tłumieniem' },
            { ru: 'Ошибку заполнения', en: 'A filling-in error', pl: 'Błąd wypełnienia' },
            { ru: 'Компульсивность', en: 'Compulsiveness', pl: 'Kompulsywność' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кто такие «подавляющие личности»?',
            en: 'Who are "suppressive personalities"?',
            pl: 'Kim są „osobowości tłumiące"?',
          },
          opts: [
            { ru: 'Большинство людей', en: 'The majority of people', pl: 'Większość ludzi' },
            { ru: 'Все руководители', en: 'All managers', pl: 'Wszyscy kierownicy' },
            { ru: 'Продуктивные сотрудники', en: 'Productive employees', pl: 'Produktywni pracownicy' },
            { ru: 'Примерно 3% людей, которые снижают чужую уверенность и «притапливают» того, кто начинает расти', en: 'About 3% of people who lower others\' confidence and "push down" the one who starts to grow', pl: 'Około 3% ludzi, którzy obniżają cudzą pewność siebie i „przytapiają" tego, kto zaczyna rosnąć' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Точка D (уверенность): какое значение — важный порог?',
            en: 'Point D (confidence): what value is an important threshold?',
            pl: 'Punkt D (pewność siebie): jaka wartość jest ważnym progiem?',
          },
          opts: [
            { ru: '32 (ниже — точка низкая, и тесту такого человека не стоит сильно доверять)', en: '32 (below it the point is low, and one should not trust the test of such a person much)', pl: '32 (poniżej punkt jest niski i testowi takiego człowieka nie warto zbytnio ufać)' },
            { ru: '0', en: '0', pl: '0' },
            { ru: '50', en: '50', pl: '50' },
            { ru: '100', en: '100', pl: '100' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Компульсивная D включает синдром:',
            en: 'A compulsive D includes the syndrome of:',
            pl: 'Kompulsywne D obejmuje syndrom:',
          },
          opts: [
            { ru: '«Плюшевого мишки»', en: 'The "teddy bear"', pl: '„Pluszowego misia"' },
            { ru: '«Карьериста»', en: 'The "careerist"', pl: '„Karierowicza"' },
            { ru: '«Обязан быть правым» — человек стоит на своём до конца и может строить выводы даже на ложных данных', en: '"Must be right" — the person stands his ground to the end and may build conclusions even on false data', pl: '„Musi mieć rację" — człowiek stoi przy swoim do końca i może budować wnioski nawet na fałszywych danych' },
            { ru: '«Динамита»', en: 'The "dynamite"', pl: '„Dynamitu"' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Точка E (активность) при низком значении: человек:',
            en: 'Point E (activity) at a low value: the person:',
            pl: 'Punkt E (aktywność) przy niskiej wartości: człowiek:',
          },
          opts: [
            { ru: 'Энергичен и инициативен', en: 'Is energetic and proactive', pl: 'Jest energiczny i inicjatywny' },
            { ru: 'Пассивен, мало энергии, не любит движение и новое (энергию будто «выкачали»)', en: 'Is passive, low on energy, dislikes movement and the new (as if the energy was "pumped out")', pl: 'Jest pasywny, ma mało energii, nie lubi ruchu i nowości (energię jakby „wypompowano")' },
            { ru: 'Постоянно тянется к новому', en: 'Is constantly drawn to the new', pl: 'Stale ciągnie do nowości' },
            { ru: 'Не может усидеть на месте', en: 'Cannot sit still', pl: 'Nie może usiedzieć w miejscu' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Компульсивная активность («энерджайзер») означает, что человек:',
            en: 'Compulsive activity (the "energizer") means that the person:',
            pl: 'Kompulsywna aktywność („energizer") oznacza, że człowiek:',
          },
          opts: [
            { ru: 'Любит рутину', en: 'Likes routine', pl: 'Lubi rutynę' },
            { ru: 'Не берётся ни за что', en: 'Does not take on anything', pl: 'Nie bierze się za nic' },
            { ru: 'Экономит энергию', en: 'Conserves energy', pl: 'Oszczędza energię' },
            { ru: 'Не может не действовать, тянется к новому и может менять даже то, что уже работает; в колл-центре не удержится', en: 'Cannot not act, is drawn to the new and may change even what already works; will not last in a call center', pl: 'Nie może nie działać, ciągnie do nowości i może zmieniać nawet to, co już działa; w call center się nie utrzyma' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Точка F (настойчивость) при высоком значении: человек:',
            en: 'Point F (persistence) at a high value: the person:',
            pl: 'Punkt F (wytrwałość) przy wysokiej wartości: człowiek:',
          },
          opts: [
            { ru: 'Напорист, действует прямо, ориентирован на результат, доводит дела до конца', en: 'Is assertive, acts directly, is result-oriented, sees things through to the end', pl: 'Jest napastliwy, działa wprost, nastawiony na rezultat, doprowadza sprawy do końca' },
            { ru: 'Осторожен и неэффективен', en: 'Is cautious and ineffective', pl: 'Jest ostrożny i nieskuteczny' },
            { ru: 'Действует «из-за угла»', en: 'Acts "from around the corner"', pl: 'Działa „zza rogu"' },
            { ru: 'Медленно учится', en: 'Learns slowly', pl: 'Uczy się wolno' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Компульсивная настойчивость означает, что человек:',
            en: 'Compulsive persistence means that the person:',
            pl: 'Kompulsywna wytrwałość oznacza, że człowiek:',
          },
          opts: [
            { ru: 'Слишком осторожен', en: 'Is too cautious', pl: 'Jest zbyt ostrożny' },
            { ru: 'Не ориентирован на результат', en: 'Is not result-oriented', pl: 'Nie jest nastawiony na rezultat' },
            { ru: 'Применяет больше силы, чем нужно («выбивает дверь» вместо того чтобы подождать, «пережигает» клиентов)', en: 'Applies more force than needed (kicks the door in instead of waiting, "burns out" clients)', pl: 'Stosuje więcej siły niż trzeba („wyważa drzwi" zamiast poczekać, „przepala" klientów)' },
            { ru: 'Вообще не действует', en: 'Does not act at all', pl: 'W ogóle nie działa' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Точка G (ответственность) — о чём она НЕ говорит?',
            en: 'Point G (responsibility) — what does it NOT tell about?',
            pl: 'Punkt G (odpowiedzialność) — o czym NIE mówi?',
          },
          opts: [
            { ru: 'Любит ли человек, когда с него спрашивают', en: 'Whether the person likes being held to account', pl: 'Czy człowiek lubi, gdy się go rozlicza' },
            { ru: 'О том, «ответственный человек или безответственный» (вывод «безответственный» — ложный)', en: 'Whether a "person is responsible or irresponsible" (the conclusion "irresponsible" is false)', pl: 'O tym, „czy człowiek jest odpowiedzialny czy nieodpowiedzialny" (wniosek „nieodpowiedzialny" jest fałszywy)' },
            { ru: 'Способен ли принять и уладить критику', en: 'Whether he is able to accept and resolve criticism', pl: 'Czy jest w stanie przyjąć i załagodzić krytykę' },
            { ru: 'Избегает ли давления', en: 'Whether he avoids pressure', pl: 'Czy unika nacisku' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Компульсивная ответственность — это:',
            en: 'Compulsive responsibility is:',
            pl: 'Kompulsywna odpowiedzialność to:',
          },
          opts: [
            { ru: '«Плюшевый мишка»', en: 'The "teddy bear"', pl: '„Pluszowy miś"' },
            { ru: '«Динамит»', en: 'The "dynamite"', pl: '„Dynamit"' },
            { ru: '«Энерджайзер»', en: 'The "energizer"', pl: '„Energizer"' },
            { ru: '«Шахматист» — просчитывает, что сказать и сделать, относится к людям как к фигурам на доске', en: 'The "chess player" — calculates what to say and do, treats people like pieces on a board', pl: '„Szachista" — kalkuluje, co powiedzieć i zrobić, traktuje ludzi jak figury na szachownicy' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Точка H (объективность) при высоком значении: человек:',
            en: 'Point H (objectivity) at a high value: the person:',
            pl: 'Punkt H (obiektywność) przy wysokiej wartości: człowiek:',
          },
          opts: [
            { ru: 'Справедлив, ориентирован на согласие и решение, легко сотрудничает, хорошо расставляет приоритеты в тактике с людьми', en: 'Is fair, oriented toward agreement and solutions, cooperates easily, prioritizes well in tactics with people', pl: 'Jest sprawiedliwy, nastawiony na zgodę i rozwiązanie, łatwo współpracuje, dobrze ustala priorytety w taktyce z ludźmi' },
            { ru: 'Постоянно спорит', en: 'Constantly argues', pl: 'Ciągle się kłóci' },
            { ru: 'Фокусируется на ошибках', en: 'Focuses on mistakes', pl: 'Skupia się na błędach' },
            { ru: '«Не душка»', en: 'Is "not a sweetheart"', pl: 'Jest „nie do lubienia"' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Для каких ролей особенно ценна высокая объективность (H)?',
            en: 'For which roles is high objectivity (H) especially valuable?',
            pl: 'Dla jakich ról szczególnie cenna jest wysoka obiektywność (H)?',
          },
          opts: [
            { ru: 'Для грузчика и токаря', en: 'For a loader and a turner', pl: 'Dla ładowacza i tokarza' },
            { ru: 'Для программиста', en: 'For a programmer', pl: 'Dla programisty' },
            { ru: 'Для судьи, адвоката, дипломата, переговорщика, PR- или HR-менеджера', en: 'For a judge, lawyer, diplomat, negotiator, PR or HR manager', pl: 'Dla sędziego, adwokata, dyplomaty, negocjatora, menedżera PR lub HR' },
            { ru: 'Она нигде не нужна', en: 'It is needed nowhere', pl: 'Nigdzie nie jest potrzebna' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Точка I (чуткость) при низком значении: человек:',
            en: 'Point I (sensitivity) at a low value: the person:',
            pl: 'Punkt I (wrażliwość) przy niskiej wartości: człowiek:',
          },
          opts: [
            { ru: 'Душевен и любит помогать', en: 'Is warm-hearted and likes to help', pl: 'Jest serdeczny i lubi pomagać' },
            { ru: 'Закрыт и холоден, держит дистанцию, редко благодарит, видит в основном свою точку зрения', en: 'Is closed and cold, keeps distance, rarely thanks, sees mainly his own point of view', pl: 'Jest zamknięty i chłodny, trzyma dystans, rzadko dziękuje, widzi głównie swój punkt widzenia' },
            { ru: 'Легко проявляет чувства', en: 'Easily shows feelings', pl: 'Łatwo okazuje uczucia' },
            { ru: 'Создаёт близкие отношения', en: 'Builds close relationships', pl: 'Tworzy bliskie relacje' },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Компульсивная чуткость опасна тем, что:',
            en: 'Compulsive sensitivity is dangerous in that:',
            pl: 'Kompulsywna wrażliwość jest niebezpieczna tym, że:',
          },
          opts: [
            { ru: 'Человек всем подряд отказывает', en: 'The person refuses everyone indiscriminately', pl: 'Człowiek odmawia wszystkim po kolei' },
            { ru: 'Человек холоден', en: 'The person is cold', pl: 'Człowiek jest chłodny' },
            { ru: 'Человек не замечает чужих чувств', en: 'The person does not notice others\' feelings', pl: 'Człowiek nie zauważa cudzych uczuć' },
            { ru: 'Человек не может отказать (говорит «да», отложив своё) — такого опасно ставить на ресепшен', en: 'The person cannot refuse (says "yes," setting aside his own) — it is risky to place such a person at reception', pl: 'Człowiek nie potrafi odmówić (mówi „tak", odkładając swoje) — takiego niebezpiecznie stawiać na recepcji' },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что важно помнить про точку J (общительность)?',
            en: 'What is important to remember about point J (sociability)?',
            pl: 'Co ważne jest pamiętać o punkcie J (towarzyskość)?',
          },
          opts: [
            { ru: 'Её имя обманчиво: низкая общительность не означает, что человек плохо общается', en: 'Its name is deceptive: low sociability does not mean the person communicates badly', pl: 'Jej nazwa jest myląca: niska towarzyskość nie oznacza, że człowiek źle się komunikuje' },
            { ru: 'Низкое J всегда значит плохое общение', en: 'A low J always means poor communication', pl: 'Niskie J zawsze oznacza słabą komunikację' },
            { ru: 'Высокое J всегда значит хорошее общение', en: 'A high J always means good communication', pl: 'Wysokie J zawsze oznacza dobrą komunikację' },
            { ru: 'J — самая важная точка теста', en: 'J is the most important point of the test', pl: 'J to najważniejszy punkt testu' },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Куда чаще идут люди с низкой общительностью (J)?',
            en: 'Where do people with low sociability (J) more often go?',
            pl: 'Dokąd częściej trafiają ludzie z niską towarzyskością (J)?',
          },
          opts: [
            { ru: 'В ведущие и рекрутеры', en: 'Into hosting and recruiting', pl: 'Na prowadzących i rekruterów' },
            { ru: 'В менеджеры по продажам', en: 'Into sales management', pl: 'Na menedżerów sprzedaży' },
            { ru: 'В работу с машинами и предметами (программист, токарь)', en: 'Into work with machines and objects (programmer, turner)', pl: 'Do pracy z maszynami i przedmiotami (programista, tokarz)' },
            { ru: 'В публичные профессии', en: 'Into public-facing professions', pl: 'Do zawodów publicznych' },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Пример из модуля: программист с общительностью около −90 оказался:',
            en: 'Example from the module: a programmer with sociability around −90 turned out to be:',
            pl: 'Przykład z modułu: programista z towarzyskością około −90 okazał się:',
          },
          opts: [
            { ru: 'Плохим работником', en: 'A bad employee', pl: 'Złym pracownikiem' },
            { ru: 'Идеальным программистом — при высокой внимательности и стрессоустойчивости он не отвлекается и не бросает дела', en: 'An ideal programmer — with high attentiveness and stress resistance he does not get distracted and does not abandon tasks', pl: 'Idealnym programistą — przy wysokiej uważności i odporności na stres nie rozprasza się i nie porzuca spraw' },
            { ru: 'Уволен за некомпетентность', en: 'Fired for incompetence', pl: 'Zwolniony za niekompetencję' },
            { ru: 'Переведён в отдел продаж', en: 'Transferred to the sales department', pl: 'Przeniesiony do działu sprzedaży' },
          ],
          correct: 1,
        },
      ],
    },
  },
};
