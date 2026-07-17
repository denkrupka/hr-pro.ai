'use strict';
// Контент программы «Личностные качества (Точки A, B, C)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-abc'.

// Врезки-боксы 1-в-1 из программы productivity-winners / module-assessment.
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
  'module-abc': {
    trailer: { ru: 'https://tnemvzaxtgumtvijpfli.supabase.co/storage/v1/object/public/media/learning/prog9-trailer-ru.mp4', pl: '', en: '' },
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: {
          ru: 'Точки A, B, C · Введение',
          en: 'Points A, B, C · Introduction',
          pl: 'Punkty A, B, C · Wprowadzenie',
        },
        desc: {
          ru: 'Зачем идти по точкам одну за другой и что такое «инструкция по эксплуатации» человека.',
          en: 'Why go through the points one by one and what a person\'s "operating manual" is.',
          pl: 'Po co przechodzić przez punkty jeden po drugim i czym jest „instrukcja obsługi" człowieka.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 6 · ТОЧКИ A–C</strong></p>' +
            '<p>Точки A, B, C: внимательность, позитивность, самообладание</p>' +
            '<p>Первая группа точек: что показывает каждая, как говорить о ней с человеком в шаге о плюсах и что советовать его руководителю.</p>' +
            '<h2>Модуль 6. Точки A, B, C</h2>' +
            '<p>В предыдущих модулях мы разобрали, зачем и как предоставлять оценку теста: истину и ложь за точками, наблюдение и конфронт, а затем пошаговую беседу — вступить в контакт, уладить всё, долго говорить о плюсах и лишь потом о минусах. Теперь мы пойдём по точкам одну за другой, чтобы вы могли и читать тест, и говорить о каждой точке — и с положительной, и с отрицательной стороны.</p>' +
            '<p>Начнём с первой группы точек — A, B и C. (Точке D мы посвятили отдельный модуль, поэтому здесь её не повторяем.) По каждой точке мы разберём ключевой концепт, характеристики высокого и низкого уровня, то, как говорить об этой точке в шаге о плюсах, — и ещё одно небольшое применение теста, которое очень полезно на практике.</p>' +
            '<h3>Глава 1. «Инструкция по эксплуатации» и как вести беседу</h3>' +
            '<p>Кроме двух уже знакомых применений теста — изучить его для себя и предоставить оценку, чтобы усилить человека, — есть и третье, маленькое, но ценное. Представьте: вы, скажем, директор по персоналу, у вас есть тест сотрудника, и у этого сотрудника есть начальник, который нашу технологию не знает. Дать такому начальнику пару советов по этому сотруднику — очень полезно. Поэтому по каждой точке мы будем коротко записывать так называемую «инструкцию по эксплуатации» — в кавычках, потому что человек, конечно, не оборудование. Это не описание теста, а буквально два предложения совета необученному руководителю: что делать с этим человеком, исходя из данной точки.</p>' +
            '<p>И сразу — несколько общих правил самой беседы, которые пригодятся на любой точке.</p>' +
            b('ЗАМЕТКА · Как говорить о точках',
              bp('Обращайтесь к человеку напрямую — «ты» или «вы», а не «он»: привыкайте говорить человеку, а не о нём. И привыкайте не читать, а говорить: если нужно, сначала прочтите про себя, а потом скажите нормальным языком.') +
              bp('Не делайте никаких предисловий вроде «сейчас я расскажу тебе о твоих плюсах». Это подразумевает «а ты подожди, потом будет другое», и человек внутренне напрягается. Никаких вступлений: человек пришёл на оценку и ждёт оценку — просто оценивайте. Рассказали, что показывает тест, и переходите: «Теперь поговорим о твоём тесте».') +
              bp('Шпаргалку составить можно и даже нужно — но не прячьте её от человека, пусть всё лежит перед вами. И не спрашивайте у других их «успешные действия», чтобы применить как готовый рецепт: человек с точкой A плюс 96 и человек с точкой A минус 96 делают совершенно разное, поэтому чужие приёмы вам не подойдут.', true)) +
            r('ПРАВИЛО',
              bp('Полезное правило для шага о плюсах: что торчит, то и плюс. Если хоть одна точка «торчит» — уже есть о чём сказать хорошее.', true)),
          en:
            '<p><strong>MODULE 6 · POINTS A–C</strong></p>' +
            '<p>Points A, B, C: attentiveness, positivity, self-possession</p>' +
            '<p>The first group of points: what each one shows, how to speak of it with the person in the pluses step, and what to advise his manager.</p>' +
            '<h2>Module 6. Points A, B, C</h2>' +
            '<p>In the previous modules we examined why and how to deliver a test assessment: the truth and falsehood behind the points, observation and confront, and then the step-by-step conversation — make contact, handle everything, speak at length about the pluses, and only then about the minuses. Now we will go through the points one by one, so that you can both read a test and speak about each point — from both the positive and the negative side.</p>' +
            '<p>Let us begin with the first group of points — A, B, and C. (To point D we devoted a separate module, so we do not repeat it here.) For each point we will examine the key concept, the characteristics of a high and a low level, how to speak about this point in the pluses step — and one more small application of the test that is very useful in practice.</p>' +
            '<h3>Chapter 1. The "operating manual" and how to conduct the conversation</h3>' +
            '<p>Besides the two already familiar applications of the test — to study it for oneself and to deliver an assessment in order to strengthen the person — there is also a third, a small but valuable one. Imagine: you are, say, the HR director, you have an employee\'s test, and this employee has a superior who does not know our technology. To give such a superior a couple of pieces of advice about this employee is very useful. That is why, for each point, we will briefly write down a so-called "operating manual" — in quotation marks, because a person is, of course, not equipment. This is not a description of the test, but literally two sentences of advice to an untrained manager: what to do with this person, proceeding from the given point.</p>' +
            '<p>And right away — several general rules of the conversation itself that will come in handy at any point.</p>' +
            b('NOTE · How to speak about the points',
              bp('Address the person directly — "you," not "he": get used to speaking to the person, not about him. And get used to speaking, not reading: if need be, first read it to yourself, and then say it in normal language.') +
              bp('Do not make any prefaces of the sort "now I\'ll tell you about your pluses." This implies "and you wait, then there\'ll be something else," and the person inwardly tenses up. No introductions: the person came for an assessment and is waiting for an assessment — just assess. You explained what the test shows, and move on: "Now let\'s talk about your test."') +
              bp('You may, and even should, put together a cheat sheet — but do not hide it from the person, let everything lie in front of you. And do not ask others for their "successful actions" in order to apply them as a ready-made recipe: a person with point A at plus 96 and a person with point A at minus 96 do completely different things, so someone else\'s techniques will not suit you.', true)) +
            r('RULE',
              bp('A useful rule for the pluses step: whatever sticks out is a plus. If even one point "sticks out" — there is already something good to say.', true)),
          pl:
            '<p><strong>MODUŁ 6 · PUNKTY A–C</strong></p>' +
            '<p>Punkty A, B, C: uważność, pozytywność, panowanie nad sobą</p>' +
            '<p>Pierwsza grupa punktów: co pokazuje każdy z nich, jak mówić o nim z człowiekiem w kroku o plusach i co doradzać jego kierownikowi.</p>' +
            '<h2>Moduł 6. Punkty A, B, C</h2>' +
            '<p>W poprzednich modułach omówiliśmy, po co i jak przekazywać ocenę testu: prawdę i fałsz za punktami, obserwację i konfront, a następnie rozmowę krok po kroku — nawiązać kontakt, wszystko rozładować, długo mówić o plusach i dopiero potem o minusach. Teraz przejdziemy przez punkty jeden po drugim, żebyście mogli i czytać test, i mówić o każdym punkcie — i z pozytywnej, i z negatywnej strony.</p>' +
            '<p>Zaczniemy od pierwszej grupy punktów — A, B i C. (Punktowi D poświęciliśmy osobny moduł, dlatego tu go nie powtarzamy.) Przy każdym punkcie omówimy kluczowy koncept, charakterystyki wysokiego i niskiego poziomu, to, jak mówić o tym punkcie w kroku o plusach — i jeszcze jedno niewielkie zastosowanie testu, które jest bardzo pożyteczne w praktyce.</p>' +
            '<h3>Rozdział 1. „Instrukcja obsługi" i jak prowadzić rozmowę</h3>' +
            '<p>Oprócz dwóch już znajomych zastosowań testu — przestudiować go dla siebie i przekazać ocenę, żeby wzmocnić człowieka — jest i trzecie, małe, ale cenne. Wyobraźcie sobie: jesteście, powiedzmy, dyrektorem ds. personelu, macie test pracownika, a ten pracownik ma przełożonego, który naszej technologii nie zna. Dać takiemu przełożonemu parę rad co do tego pracownika — jest bardzo pożyteczne. Dlatego przy każdym punkcie będziemy krótko zapisywać tak zwaną „instrukcję obsługi" — w cudzysłowie, bo człowiek oczywiście nie jest sprzętem. To nie opis testu, lecz dosłownie dwa zdania rady dla nieprzeszkolonego kierownika: co robić z tym człowiekiem, wychodząc z danego punktu.</p>' +
            '<p>I od razu — kilka ogólnych zasad samej rozmowy, które przydadzą się przy każdym punkcie.</p>' +
            b('NOTATKA · Jak mówić o punktach',
              bp('Zwracajcie się do człowieka wprost — „ty" albo „wy", a nie „on": przyzwyczajajcie się mówić do człowieka, a nie o nim. I przyzwyczajajcie się nie czytać, lecz mówić: jeśli trzeba, najpierw przeczytajcie w myślach, a potem powiedzcie normalnym językiem.') +
              bp('Nie róbcie żadnych przedmów w rodzaju „teraz opowiem ci o twoich plusach". To zakłada „a ty poczekaj, potem będzie coś innego", i człowiek wewnętrznie się spina. Żadnych wstępów: człowiek przyszedł na ocenę i czeka na ocenę — po prostu oceniajcie. Opowiedzieliście, co pokazuje test, i przechodźcie: „Teraz porozmawiamy o twoim teście".') +
              bp('Ściągę ułożyć można, a nawet trzeba — ale nie chowajcie jej przed człowiekiem, niech wszystko leży przed wami. I nie pytajcie innych o ich „udane działania", żeby zastosować je jak gotową receptę: człowiek z punktem A plus 96 i człowiek z punktem A minus 96 robią zupełnie co innego, dlatego cudze chwyty wam nie pasują.', true)) +
            r('ZASADA',
              bp('Pożyteczna zasada dla kroku o plusach: co sterczy, to i plus. Jeśli choć jeden punkt „sterczy" — już jest o czym powiedzieć coś dobrego.', true)),
        },
      },

      // 2 — ТОЧКА A. ВНИМАТЕЛЬНОСТЬ
      {
        id: 'point-a',
        title: {
          ru: 'Точка A. Внимательность',
          en: 'Point A. Attentiveness',
          pl: 'Punkt A. Uważność',
        },
        desc: {
          ru: 'Свободное внимание: концентрация и планирование при высокой A, рассеянность при низкой.',
          en: 'Free attention: concentration and planning with a high A, scatteredness with a low one.',
          pl: 'Wolna uwaga: koncentracja i planowanie przy wysokim A, rozproszenie przy niskim.',
        },
        html: {
          ru:
            '<h2>Глава 2. Точка A. Внимательность</h2>' +
            '<p>Ключевой концепт точки A — внимание, и не просто внимание, а свободное внимание: то, которое не застряло в реактивном уме, то есть в прошлом (ведь банк — это картинки прошлых болезненных моментов).</p>' +
            '<p>У человека с высокой A много свободного внимания — поэтому он хорошо концентрируется и хорошо планирует. Планировать — значит смотреть с высокой точки: часть внимания оставить в настоящем, часть направить в будущее и распланировать переход от одного к другому; а чем больше свободного внимания, тем легче это делать. У человека с низкой A свободного внимания мало — поэтому ему крайне сложно планировать, он рассеян, нетерпелив, не может ждать и откладывать на потом.</p>' +
            '<p>Как говорить о точке A в шаге о плюсах. Если A высокая — «ты шикарно планируешь, шикарно организовываешь». Если A низкая, то положительно это звучит так: «ты любишь всё делать сразу, недолго раздумываешь перед тем как начать, ты остаёшься самим собой — позволяешь себе роскошь быть самим собой».</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка A',
              bp('Если A низкая, руководителю стоит посоветовать: не давать много задач одновременно, а помочь сотруднику сосредоточиться на чём-то одном — доделал одно, потом другое (у него ведь внимание и так рассеяно). И поменьше требовать от него откладывать, ждать и планировать надолго — этого просто не будет. Если руководитель ждёт от такого человека планирования, он перестанет ему доверять; а зная, что «копать тут нечем», он хотя бы не будет ждать невозможного — и доверие сохранится. Такому человеку подходит работа вроде пожарника: делать сейчас, а не планировать (пожарного ведь не спрашивают, когда он планирует к вам заехать). А вот у самого руководителя низкая A — это большой минус: рядовому сотруднику можно переопределить обязанности, чтобы он поменьше планировал, а начальнику планирования не избежать.') +
              bp('Если A высокая (тем более компульсивная), руководителю стоит посоветовать обязательно согласовать с сотрудником его цели и карьеру: у такого человека внимание направлено в будущее, и если начальник об этом с ним не говорит, он не оправдывает ожиданий сотрудника и теряет его доверие. И ещё: не слишком доверять выражению его лица и его словам — человек с высокой A умеет надевать маску (это не значит, что он обманщик, просто он это умеет). Особенно если у него ещё и B компульсивная — тогда вдвойне: компульсивная B всегда показывает, что «всё хорошо».', true)),
          en:
            '<h2>Chapter 2. Point A. Attentiveness</h2>' +
            '<p>The key concept of point A is attention, and not just attention, but free attention: the kind that has not gotten stuck in the reactive mind, that is, in the past (for the bank is pictures of past painful moments).</p>' +
            '<p>A person with a high A has a lot of free attention — that is why he concentrates well and plans well. To plan means to look from a high vantage point: to leave part of one\'s attention in the present, direct part into the future, and map out the transition from one to the other; and the more free attention there is, the easier this is to do. A person with a low A has little free attention — that is why it is extremely hard for him to plan; he is scattered, impatient, unable to wait or to put off until later.</p>' +
            '<p>How to speak about point A in the pluses step. If A is high — "you plan splendidly, you organize splendidly." If A is low, then positively it sounds like this: "you like to do everything at once, you don\'t deliberate long before starting, you stay yourself — you allow yourself the luxury of being yourself."</p>' +
            t('APPLICATION IN HIRING · Operating manual: point A',
              bp('If A is low, it is worth advising the manager: not to give many tasks at once, but to help the employee concentrate on one thing — finished one, then another (his attention is scattered as it is). And to demand less of him in the way of putting things off, waiting, and planning far ahead — this simply will not happen. If the manager expects planning from such a person, he will stop trusting him; but knowing that "there\'s nothing to dig for here," he will at least not expect the impossible — and the trust will be preserved. Such a person suits work like a firefighter\'s: to do now, not to plan (a firefighter, after all, is not asked when he plans to drop by). But in the manager himself a low A is a big minus: for a rank-and-file employee one can redefine the duties so that he plans less, but a manager cannot avoid planning.') +
              bp('If A is high (all the more so if compulsive), it is worth advising the manager to be sure to align the employee\'s goals and career with him: such a person\'s attention is directed into the future, and if the superior does not talk with him about this, he fails the employee\'s expectations and loses his trust. And one more thing: not to trust too much the expression on his face and his words — a person with a high A knows how to put on a mask (this does not mean he is a deceiver, he simply knows how). Especially if he also has a compulsive B — then doubly so: a compulsive B always shows that "everything is fine."', true)),
          pl:
            '<h2>Rozdział 2. Punkt A. Uważność</h2>' +
            '<p>Kluczowy koncept punktu A to uwaga, i nie po prostu uwaga, lecz wolna uwaga: ta, która nie utknęła w umyśle reaktywnym, czyli w przeszłości (bank to przecież obrazy przeszłych bolesnych momentów).</p>' +
            '<p>Człowiek z wysokim A ma dużo wolnej uwagi — dlatego dobrze się koncentruje i dobrze planuje. Planować — znaczy patrzeć z wysokiego punktu: część uwagi zostawić w teraźniejszości, część skierować w przyszłość i rozplanować przejście od jednego do drugiego; a im więcej wolnej uwagi, tym łatwiej to robić. Człowiek z niskim A ma mało wolnej uwagi — dlatego niezmiernie trudno mu planować, jest rozproszony, niecierpliwy, nie może czekać ani odkładać na potem.</p>' +
            '<p>Jak mówić o punkcie A w kroku o plusach. Jeśli A jest wysokie — „wspaniale planujesz, wspaniale organizujesz". Jeśli A jest niskie, to pozytywnie brzmi to tak: „lubisz wszystko robić od razu, niedługo się namyślasz przed rozpoczęciem, pozostajesz sobą — pozwalasz sobie na luksus bycia sobą".</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt A',
              bp('Jeśli A jest niskie, kierownikowi warto poradzić: nie dawać wielu zadań jednocześnie, lecz pomóc pracownikowi skupić się na czymś jednym — dokończył jedno, potem drugie (uwaga i tak jest u niego rozproszona). I mniej wymagać od niego odkładania, czekania i planowania na długo — tego po prostu nie będzie. Jeśli kierownik oczekuje od takiego człowieka planowania, przestanie mu ufać; a wiedząc, że „nie ma tu czego szukać", przynajmniej nie będzie oczekiwał niemożliwego — i zaufanie się zachowa. Takiemu człowiekowi pasuje praca w rodzaju strażaka: robić teraz, a nie planować (strażaka przecież nie pyta się, kiedy planuje do was wpaść). A oto u samego kierownika niskie A to duży minus: szeregowemu pracownikowi można przedefiniować obowiązki, żeby mniej planował, a kierownik planowania nie uniknie.') +
              bp('Jeśli A jest wysokie (tym bardziej kompulsywne), kierownikowi warto poradzić, żeby obowiązkowo uzgodnił z pracownikiem jego cele i karierę: u takiego człowieka uwaga jest skierowana w przyszłość, i jeśli przełożony o tym z nim nie rozmawia, nie spełnia oczekiwań pracownika i traci jego zaufanie. I jeszcze: nie za bardzo ufać wyrazowi jego twarzy i jego słowom — człowiek z wysokim A umie zakładać maskę (to nie znaczy, że jest oszustem, po prostu to umie). Szczególnie jeśli ma jeszcze i B kompulsywne — wtedy podwójnie: kompulsywne B zawsze pokazuje, że „wszystko dobrze".', true)),
        },
      },

      // 3 — ТОЧКА B. ПОЗИТИВНОСТЬ
      {
        id: 'point-b',
        title: {
          ru: 'Точка B. Позитивность',
          en: 'Point B. Positivity',
          pl: 'Punkt B. Pozytywność',
        },
        desc: {
          ru: 'Точка зрения: высокая B видит решения сверху, низкая — только препятствия.',
          en: 'Point of view: a high B sees solutions from above, a low one — only obstacles.',
          pl: 'Punkt widzenia: wysokie B widzi rozwiązania z góry, niskie — tylko przeszkody.',
        },
        html: {
          ru:
            '<h2>Глава 3. Точка B. Позитивность</h2>' +
            '<p>Ключевой концепт точки B — точка зрения, то есть откуда человек смотрит. Человек с высокой B смотрит как бы сверху, с низкой — снизу или сбоку. Из этого и всё остальное.</p>' +
            '<p>Человек с высокой B видит решения (или способен их видеть), любит простоту, и с ним просто; он позитивен. Человеку с низкой B решения видеть тяжело — он видит только «остановки», препятствия; для него всё сложно, и с ним сложно, и сложностей у него много; он негативен. Хорошая аналогия — горы: если смотреть на них сбоку, видишь только стену; а поднявшись наверх, видишь долины, реки, озёра и ущелья — и понимаешь, как всё пройти. А открыто или скрыто человек негативен, зависит от точки A: если он смотрит снизу и решения не видит, но A у него высокая, он знает, что вы хотите услышать, надевает маску и говорит правильные вещи.</p>' +
            '<p>Как говорить о точке B в шаге о плюсах. Если B высокая — «ты видишь решения, для тебя всё просто». Если B очень низкая — по правилу «что торчит, то и плюс» можно сказать, что человек «не страдает лишним оптимизмом».</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка B',
              bp('Если B низкая, руководителю стоит посоветовать: хвалить сотрудника почаще — когда он этого заслуживает, — чтобы уравновесить поток, потому что сам себя такой человек чаще ругает и обесценивает (особенно если у него ещё и G низкая). И — помогать ему находить решения, направлять его внимание на решение. Можно также посоветовать быть начеку: при низкой B возможна нечестность, так что не забывайте проверять; но говорить руководителю «он может воровать» не стоит.') +
              bp('Если B высокая, руководителю стоит посоветовать прислушиваться к стратегическим идеям сотрудника (если тот компетентен в этой области) и доверять его интуиции: у людей с настоящей высокой B — особенно если она подтверждена точкой H на том же уровне — интуиция обычно хорошо развита.') +
              bp('Если B компульсивная (а истинный уровень при этом низкий), руководителю стоит посоветовать не судить о делах сотрудника по его жизнерадостному лицу. Мы ведь часто определяем, как у человека дела, просто глядя на него: сияет — значит, всё хорошо. А при компульсивной B и низком истинном уровне всё может быть совсем не хорошо, причём давно.', true)),
          en:
            '<h2>Chapter 3. Point B. Positivity</h2>' +
            '<p>The key concept of point B is point of view, that is, where the person looks from. A person with a high B looks, as it were, from above; with a low one — from below or from the side. From this comes all the rest.</p>' +
            '<p>A person with a high B sees solutions (or is capable of seeing them), likes simplicity, and it is simple to be with him; he is positive. A person with a low B finds it hard to see solutions — he sees only "stops," obstacles; for him everything is difficult, and it is difficult to be with him, and he has many difficulties; he is negative. A good analogy is mountains: if you look at them from the side, you see only a wall; but having climbed to the top, you see valleys, rivers, lakes, and gorges — and you understand how to get through it all. And whether a person is openly or covertly negative depends on point A: if he looks from below and does not see solutions, but his A is high, he knows what you want to hear, puts on a mask, and says the right things.</p>' +
            '<p>How to speak about point B in the pluses step. If B is high — "you see solutions, for you everything is simple." If B is very low — by the rule "whatever sticks out is a plus," one can say that the person "does not suffer from excess optimism."</p>' +
            t('APPLICATION IN HIRING · Operating manual: point B',
              bp('If B is low, it is worth advising the manager: to praise the employee more often — when he deserves it — in order to balance the flow, because such a person more often scolds and devalues himself (especially if he also has a low G). And — to help him find solutions, to direct his attention toward the solution. One can also advise being on guard: with a low B, dishonesty is possible, so do not forget to check; but it is not worth telling the manager "he may steal."') +
              bp('If B is high, it is worth advising the manager to heed the employee\'s strategic ideas (if he is competent in that area) and to trust his intuition: in people with a truly high B — especially if it is confirmed by point H at the same level — intuition is usually well developed.') +
              bp('If B is compulsive (while the true level is low), it is worth advising the manager not to judge the employee\'s affairs by his cheerful face. We often, after all, determine how a person is doing simply by looking at him: he\'s beaming — so everything is fine. But with a compulsive B and a low true level, everything may be quite not fine, and that for a long time.', true)),
          pl:
            '<h2>Rozdział 3. Punkt B. Pozytywność</h2>' +
            '<p>Kluczowy koncept punktu B to punkt widzenia, czyli skąd człowiek patrzy. Człowiek z wysokim B patrzy jakby z góry, z niskim — z dołu albo z boku. Z tego i cała reszta.</p>' +
            '<p>Człowiek z wysokim B widzi rozwiązania (albo jest zdolny je widzieć), lubi prostotę, i z nim jest prosto; jest pozytywny. Człowiekowi z niskim B rozwiązania widzieć jest trudno — widzi tylko „zatrzymania", przeszkody; dla niego wszystko jest trudne, i z nim jest trudno, i trudności ma wiele; jest negatywny. Dobra analogia to góry: jeśli patrzeć na nie z boku, widzisz tylko ścianę; a wszedłszy na górę, widzisz doliny, rzeki, jeziora i wąwozy — i rozumiesz, jak wszystko przejść. A czy człowiek jest negatywny otwarcie, czy skrycie, zależy od punktu A: jeśli patrzy z dołu i rozwiązań nie widzi, ale A ma wysokie, wie, co chcecie usłyszeć, zakłada maskę i mówi właściwe rzeczy.</p>' +
            '<p>Jak mówić o punkcie B w kroku o plusach. Jeśli B jest wysokie — „widzisz rozwiązania, dla ciebie wszystko jest proste". Jeśli B jest bardzo niskie — zgodnie z zasadą „co sterczy, to i plus" można powiedzieć, że człowiek „nie cierpi na nadmiar optymizmu".</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt B',
              bp('Jeśli B jest niskie, kierownikowi warto poradzić: chwalić pracownika częściej — gdy na to zasługuje — żeby zrównoważyć przepływ, bo sam siebie taki człowiek częściej gani i obniża sobie wartość (szczególnie jeśli ma jeszcze i G niskie). I — pomagać mu znajdować rozwiązania, kierować jego uwagę na rozwiązanie. Można też poradzić, żeby był czujny: przy niskim B możliwa jest nieuczciwość, więc nie zapominajcie sprawdzać; ale mówić kierownikowi „on może kraść" nie warto.') +
              bp('Jeśli B jest wysokie, kierownikowi warto poradzić, żeby wsłuchiwał się w strategiczne idee pracownika (jeśli ten jest kompetentny w tej dziedzinie) i ufał jego intuicji: u ludzi z prawdziwie wysokim B — szczególnie jeśli jest ono potwierdzone punktem H na tym samym poziomie — intuicja zwykle jest dobrze rozwinięta.') +
              bp('Jeśli B jest kompulsywne (a prawdziwy poziom przy tym niski), kierownikowi warto poradzić, żeby nie sądził o sprawach pracownika po jego pogodnej twarzy. Często przecież określamy, jak u człowieka idą sprawy, po prostu na niego patrząc: promienieje — znaczy, wszystko dobrze. A przy kompulsywnym B i niskim prawdziwym poziomie wszystko może być zupełnie niedobrze, i to od dawna.', true)),
        },
      },

      // 4 — ТОЧКА C. САМООБЛАДАНИЕ
      {
        id: 'point-c',
        title: {
          ru: 'Точка C. Самообладание',
          en: 'Point C. Self-possession',
          pl: 'Punkt C. Panowanie nad sobą',
        },
        desc: {
          ru: 'Контроль эмоций: как говорить о разных уровнях C и что делать с компульсивной C.',
          en: 'Control of emotions: how to speak about the various levels of C and what to do with a compulsive C.',
          pl: 'Kontrola emocji: jak mówić o różnych poziomach C i co robić z kompulsywnym C.',
        },
        html: {
          ru:
            '<h2>Глава 4. Точка C. Самообладание</h2>' +
            '<p>Ключевой концепт точки C — контроль собственных эмоций: насколько хорошо человек может начать, изменить и закончить какие-то эмоции по своему решению (ведь контроль — это и есть способность начать, изменить и закончить).</p>' +
            '<p>Понять её несложно: с низкой C человек нервный, с высокой — спокойный. Как следствие, у человека с высокой C обычно хороший контроль над телом — ему легче быть мастером на все руки; ему легко расслабиться. А человек с низкой C тело контролирует хуже и расслабиться не может: после конфликта он ещё долго нервничает, а спит очень чутко, потому что не может расслабиться даже во сне. В основе низкой C — две противоположные команды из разных картинок реактивного ума: «стой здесь» и «уходи отсюда»; когда они активизированы одновременно, человека будто разрывает на части. По той же причине по-разному ведут себя утром низкая и высокая C: высокая C просыпается не спеша, постепенно набирая обороты, а низкая C открыла глаза — и сразу на полную катушку.</p>' +
            '<p>Как говорить о точке C в шаге о плюсах — здесь важны уровни:</p>' +
            '<ul>' +
            '<li><strong>От минус 90 до минус 100</strong> мы понимающе молчим: для таких людей это огромная проблема, и пытаться сказать об этом что-то положительное не нужно. (Был, например, клиент, который несколько раз в год ездил в Азию в поисках трав и мастеров, способных его успокоить, — иначе он «разносил вокруг всё»; а настойчивость у него была плюс 95.)</li>' +
            '<li><strong>От минус 20 до минус 90</strong> мы говорим только в сочетании с другой точкой, потому что сам факт нервозности в плюс повернуть невозможно. Если при этом высокая активность (E) — «ты не можешь сидеть без дела, не любишь тратить время на лишний разговор, делаешь всё быстро, в том числе когда только проснулся». Если высокое общение (J) — «ты очень любишь общаться» (ведь если он молчит, то нервничает ещё сильнее; высокая точка как бы закрывает низкую). Если высокая настойчивость (F) — «ты действительно можешь дать другим понять, если тебе что-то не нравится» (один клиент с C 95 и F 95 за неделю уволил семьдесят пять сотрудников — в офисе догадались, что ему что-то не нравится).</li>' +
            '<li><strong>От минус 20 до плюс 10–15</strong> — нейтральная зона: здесь мы просто ничего не говорим, и это не потому, что что-то плохо, а потому, что сказать нечего.</li>' +
            '<li><strong>От плюс 10–15 и выше</strong> — это уже высокая C, и главный её плюс: «тебя нелегко вывести из себя, ты спокойный человек».</li>' +
            '</ul>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Три точки «взрываемости»',
              bp('Полезно помнить, что за «взрываемость» отвечают сразу три точки. C показывает, насколько система «влажная», то есть насколько легко человек вспыхивает. A — это длина бикфордова шнура: насколько долго его надо «доставать». А F показывает, насколько сильно он взорвётся. Поэтому при высокой C стоит взглянуть и на A: если A высокая — из себя такого человека вывести практически невозможно; если A низкая — «вывести можно, но только надавив на больную мозоль: по мелочам ты не взрываешься». И в том, и в другом случае это всё равно значит «нелегко».', true)) +
            '<p>Отдельно — компульсивная C. Такой человек не умеет нервничать «по чуть-чуть»: у него по поводу спокойствия только выключатель — либо полностью спокоен, либо, если психует, то полностью. Чтобы не нервничать, он начинает всех контролировать и обо всём знать. Положительно это описывается так: «ты хорошо всё контролируешь, любишь контролировать и знать; многое запоминаешь» (человек с компульсивной C запоминает даже то, что можно было бы и не запоминать, — например, номера телефонов).</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка C',
              bp('Если C низкая, руководителю стоит посоветовать не беспокоить сотрудника и позволять ему компенсировать низкую C за счёт какой-нибудь высокой точки теста. Вспомните, как вы описывали его низкую C положительно: если через высокую активность («ты не можешь сидеть без дела») — значит, позволяйте ему двигаться; если через высокое общение («ты любишь общаться») — значит, позволяйте ему говорить, ведь, разговаривая, он успокаивается, и говорить ему «молчи, прекрати» не надо. А в целом — создавать поменьше поводов ему взорваться (хотя это, уверяю, все и так стараются делать).') +
              bp('Если C компульсивная, у руководителя две задачи. Первая — информировать такого сотрудника как можно больше, если информация не секретна: компульсивная C хочет знать всё, а если чего-то не знает — нервничает, и обход для неё — просто трагедия. Посылайте ему копии, говорите всё напрямую. (Так же это работает и в семье: если у супруги компульсивная C, стоит постоянно её информировать — «выезжаю с работы», «подъезжаю к ресторану», — и она довольна; несколько таких оценок для супругов давали фантастический результат, вплоть до «повторного медового месяца».)') +
              bp('Вторая задача сложнее, но важнее всего для бизнеса — научить компульсивную C контролировать «по чуть-чуть», а ключ здесь в умении расставлять приоритеты, находить ключевые показатели. Дело в том, что компульсивная C и контролировать «по чуть-чуть» не умеет: она либо контролирует всё полностью, либо, если хоть что-то не получается контролировать, разворачивается и перестаёт контролировать вообще. Реальный случай: очень толковый руководитель с компульсивной C сам построил лучший филиал компании — «муха без его ведома не пролетала»; его повысили в центральный офис курировать открытие филиалов по всей стране — и его прежний, лучший филиал за год «сдох»: он не смог контролировать его на расстоянии, ведь издалека всё контролировать невозможно, а как только не получается контролировать всё — он просто перестал контролировать. Всё это было видно на тесте.') +
              bp('Поэтому такого человека надо научить, что именно контролировать удалённо, — то есть найти ключевые показатели. Ключевой показатель — это то, на чём обязательно отразится любая проблема (например, доход на одного сотрудника, количество клиентов; у Джека Уэлча это были вовлечённость, удовлетворённость клиентов и денежный поток). Если контролируешь их — можно быть спокойным. Кстати, ровно то же можно объяснить и матери с компульсивным контролем: не выяснять телефоны и имена всех, с кем гуляет дочь, а научиться отслеживать её положение на шкале тонов — ведь на нём отражается всё; высоко на тоне — можно расслабиться, упала по тону — вот тогда действовать. И, к слову, всё это можно делать не только с подчинёнными, но и с начальниками, — просто чуть корректнее: приказывать им нельзя.', true)),
          en:
            '<h2>Chapter 4. Point C. Self-possession</h2>' +
            '<p>The key concept of point C is control of one\'s own emotions: how well a person can start, change, and stop certain emotions by his own decision (for control is precisely the ability to start, change, and stop).</p>' +
            '<p>It is not hard to understand: with a low C a person is nervous, with a high one — calm. As a consequence, a person with a high C usually has good control over the body — it is easier for him to be a jack of all trades; it is easy for him to relax. And a person with a low C controls the body worse and cannot relax: after a conflict he stays on edge for a long time, and he sleeps very lightly, because he cannot relax even in sleep. At the base of a low C lie two opposite commands from different pictures of the reactive mind: "stay here" and "get away from here"; when they are activated simultaneously, the person is, as it were, torn to pieces. For the same reason a low and a high C behave differently in the morning: a high C wakes up unhurriedly, gradually gathering momentum, while a low C has opened its eyes — and is immediately at full tilt.</p>' +
            '<p>How to speak about point C in the pluses step — here the levels matter:</p>' +
            '<ul>' +
            '<li><strong>From minus 90 to minus 100</strong> we keep an understanding silence: for such people this is an enormous problem, and there is no need to try to say anything positive about it. (There was, for example, a client who several times a year traveled to Asia in search of herbs and masters capable of calming him — otherwise he "smashed up everything around him"; and his persistence was plus 95.)</li>' +
            '<li><strong>From minus 20 to minus 90</strong> we speak only in combination with another point, because the very fact of nervousness cannot be turned into a plus. If together with it there is high activity (E) — "you can\'t sit idle, you don\'t like to waste time on unnecessary talk, you do everything quickly, including when you\'ve only just woken up." If high communication (J) — "you very much like to communicate" (for if he stays silent, he gets even more nervous; a high point, as it were, covers a low one). If high persistence (F) — "you really can let others know if something displeases you" (one client with C 95 and F 95 fired seventy-five employees in a week — in the office they guessed that something displeased him).</li>' +
            '<li><strong>From minus 20 to plus 10–15</strong> — the neutral zone: here we simply say nothing, and this is not because something is bad, but because there is nothing to say.</li>' +
            '<li><strong>From plus 10–15 and up</strong> — this is already a high C, and its main plus: "you\'re not easily thrown off, you\'re a calm person."</li>' +
            '</ul>' +
            k('KEY IDEA · Three points of "explosiveness"',
              bp('It is useful to remember that three points at once are responsible for "explosiveness." C shows how "damp" the system is, that is, how easily a person flares up. A is the length of the fuse: how long he has to be "worked up." And F shows how strongly he will explode. That is why, with a high C, it is worth glancing at A too: if A is high — such a person is practically impossible to throw off; if A is low — "one can throw you off, but only by pressing on a sore spot: over trifles you don\'t explode." In either case it still means "not easily."', true)) +
            '<p>Separately — a compulsive C. Such a person does not know how to be nervous "a little bit": as regards calm he has only an on/off switch — either fully calm or, if he loses his temper, then fully. In order not to be nervous, he begins to control everyone and to know about everything. Positively this is described as: "you control everything well, you like to control and to know; you remember a lot" (a person with a compulsive C remembers even what one might well not remember — for example, phone numbers).</p>' +
            t('APPLICATION IN HIRING · Operating manual: point C',
              bp('If C is low, it is worth advising the manager not to trouble the employee and to allow him to compensate for the low C by means of some high point of the test. Recall how you described his low C positively: if through high activity ("you can\'t sit idle") — then allow him to move; if through high communication ("you like to communicate") — then allow him to talk, for in talking he calms down, and there is no need to tell him "be quiet, stop." And in general — to create fewer occasions for him to explode (though this, I assure you, everyone tries to do anyway).') +
              bp('If C is compulsive, the manager has two tasks. The first — to inform such an employee as much as possible, if the information is not secret: a compulsive C wants to know everything, and if it does not know something — it gets nervous, and a bypass for it is simply a tragedy. Send him copies, tell him everything directly. (It works the same way in the family too: if one\'s spouse has a compulsive C, it is worth informing her constantly — "leaving work," "pulling up to the restaurant" — and she is content; several such assessments for spouses gave a fantastic result, right up to a "second honeymoon.")') +
              bp('The second task is harder, but the most important for business — to teach a compulsive C to control "a little at a time," and the key here is in the ability to set priorities, to find key indicators. The thing is that a compulsive C cannot control "a little at a time" either: it either controls everything fully, or, if it fails to control even one thing, it turns away and stops controlling altogether. A real case: a very sharp manager with a compulsive C built the company\'s best branch himself — "not a fly got through without his knowledge"; he was promoted to the central office to oversee the opening of branches all over the country — and his former, best branch "kicked the bucket" within a year: he could not control it from a distance, for from afar it is impossible to control everything, and as soon as he failed to control everything — he simply stopped controlling. All of this was visible on the test.') +
              bp('That is why such a person must be taught exactly what to control remotely — that is, to find the key indicators. A key indicator is something on which any problem will inevitably be reflected (for example, revenue per employee, the number of clients; for Jack Welch these were engagement, customer satisfaction, and cash flow). If you control them — you can be at ease. Incidentally, exactly the same can be explained to a mother with compulsive control: not to find out the phone numbers and names of everyone her daughter goes out with, but to learn to track her position on the tone scale — for everything is reflected on it; high on tone — one can relax, dropped on tone — that is when to act. And, by the way, all of this can be done not only with subordinates but with superiors too — just a bit more tactfully: one must not give them orders.', true)),
          pl:
            '<h2>Rozdział 4. Punkt C. Panowanie nad sobą</h2>' +
            '<p>Kluczowy koncept punktu C to kontrola własnych emocji: na ile dobrze człowiek potrafi zacząć, zmienić i zakończyć jakieś emocje wedle swojej decyzji (kontrola to przecież właśnie zdolność zaczynania, zmieniania i kończenia).</p>' +
            '<p>Zrozumieć go nietrudno: z niskim C człowiek jest nerwowy, z wysokim — spokojny. W konsekwencji człowiek z wysokim C ma zwykle dobrą kontrolę nad ciałem — łatwiej mu być złotą rączką; łatwo mu się rozluźnić. A człowiek z niskim C ciało kontroluje gorzej i rozluźnić się nie może: po konflikcie jeszcze długo się denerwuje, a śpi bardzo czujnie, bo nie może się rozluźnić nawet we śnie. U podstaw niskiego C leżą dwie przeciwne komendy z różnych obrazów umysłu reaktywnego: „stój tutaj" i „odejdź stąd"; gdy są zaktywizowane jednocześnie, człowieka jakby rozrywa na części. Z tego samego powodu inaczej zachowują się rano niskie i wysokie C: wysokie C budzi się bez pośpiechu, stopniowo nabierając obrotów, a niskie C otworzyło oczy — i od razu na pełnej petardzie.</p>' +
            '<p>Jak mówić o punkcie C w kroku o plusach — tu ważne są poziomy:</p>' +
            '<ul>' +
            '<li><strong>Od minus 90 do minus 100</strong> milczymy ze zrozumieniem: dla takich ludzi to ogromny problem, i próbować powiedzieć o tym coś pozytywnego nie trzeba. (Był, na przykład, klient, który kilka razy w roku jeździł do Azji w poszukiwaniu ziół i mistrzów zdolnych go uspokoić — inaczej „roznosił wszystko wokół"; a stanowczość miał plus 95.)</li>' +
            '<li><strong>Od minus 20 do minus 90</strong> mówimy tylko w połączeniu z innym punktem, bo samego faktu nerwowości w plus obrócić się nie da. Jeśli przy tym jest wysoka aktywność (E) — „nie możesz siedzieć bezczynnie, nie lubisz tracić czasu na zbędną rozmowę, robisz wszystko szybko, w tym gdy dopiero się obudziłeś". Jeśli wysoka komunikacja (J) — „bardzo lubisz się komunikować" (jeśli bowiem milczy, to denerwuje się jeszcze bardziej; wysoki punkt jakby zakrywa niski). Jeśli wysoka wytrwałość (F) — „naprawdę potrafisz dać innym do zrozumienia, jeśli coś ci się nie podoba" (jeden klient z C 95 i F 95 w ciągu tygodnia zwolnił siedemdziesięciu pięciu pracowników — w biurze domyślono się, że coś mu się nie podoba).</li>' +
            '<li><strong>Od minus 20 do plus 10–15</strong> — strefa neutralna: tu po prostu nic nie mówimy, i to nie dlatego, że coś jest złe, lecz dlatego, że nie ma co powiedzieć.</li>' +
            '<li><strong>Od plus 10–15 i wyżej</strong> — to już wysokie C, i jego główny plus: „niełatwo cię wyprowadzić z równowagi, jesteś spokojnym człowiekiem".</li>' +
            '</ul>' +
            k('KLUCZOWA MYŚL · Trzy punkty „wybuchowości"',
              bp('Pożytecznie jest pamiętać, że za „wybuchowość" odpowiadają od razu trzy punkty. C pokazuje, na ile system jest „wilgotny", czyli na ile łatwo człowiek się zapala. A — to długość lontu prochowego: jak długo trzeba go „doprowadzać". A F pokazuje, jak silnie wybuchnie. Dlatego przy wysokim C warto spojrzeć i na A: jeśli A jest wysokie — takiego człowieka wyprowadzić z równowagi jest praktycznie niemożliwe; jeśli A jest niskie — „wyprowadzić można, ale tylko naciskając na bolący odcisk: przy drobiazgach nie wybuchasz". I w jednym, i w drugim przypadku i tak znaczy to „niełatwo".', true)) +
            '<p>Osobno — kompulsywne C. Taki człowiek nie umie denerwować się „po trochu": ma co do spokoju tylko włącznik — albo jest w pełni spokojny, albo, jeśli się wścieka, to w pełni. Żeby się nie denerwować, zaczyna wszystkich kontrolować i o wszystkim wiedzieć. Pozytywnie opisuje się to tak: „dobrze wszystko kontrolujesz, lubisz kontrolować i wiedzieć; wiele zapamiętujesz" (człowiek z kompulsywnym C zapamiętuje nawet to, czego można by i nie zapamiętywać — na przykład numery telefonów).</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt C',
              bp('Jeśli C jest niskie, kierownikowi warto poradzić, żeby nie niepokoił pracownika i pozwalał mu kompensować niskie C za pomocą jakiegoś wysokiego punktu testu. Przypomnijcie sobie, jak opisywaliście jego niskie C pozytywnie: jeśli przez wysoką aktywność („nie możesz siedzieć bezczynnie") — znaczy, pozwalajcie mu się ruszać; jeśli przez wysoką komunikację („lubisz się komunikować") — znaczy, pozwalajcie mu mówić, bo, rozmawiając, on się uspokaja, i mówić mu „milcz, przestań" nie trzeba. A ogólnie — stwarzać mniej powodów, żeby wybuchnął (choć to, zapewniam, wszyscy i tak starają się robić).') +
              bp('Jeśli C jest kompulsywne, kierownik ma dwa zadania. Pierwsze — informować takiego pracownika jak najwięcej, jeśli informacja nie jest tajna: kompulsywne C chce wiedzieć wszystko, a jeśli czegoś nie wie — denerwuje się, a obejście jest dla niego po prostu tragedią. Wysyłajcie mu kopie, mówcie wszystko wprost. (Tak samo działa to i w rodzinie: jeśli małżonka ma kompulsywne C, warto stale ją informować — „wyjeżdżam z pracy", „podjeżdżam pod restaurację" — i jest zadowolona; kilka takich ocen dla małżonków dawało fantastyczny rezultat, aż po „powtórny miesiąc miodowy".)') +
              bp('Drugie zadanie jest trudniejsze, ale najważniejsze dla biznesu — nauczyć kompulsywne C kontrolować „po trochu", a klucz jest tu w umiejętności ustalania priorytetów, znajdowania kluczowych wskaźników. Rzecz w tym, że kompulsywne C i kontrolować „po trochu" nie umie: albo kontroluje wszystko w pełni, albo, jeśli choć czegoś nie udaje się kontrolować, odwraca się i przestaje kontrolować w ogóle. Realny przypadek: bardzo rozgarnięty kierownik z kompulsywnym C sam zbudował najlepszy oddział firmy — „mucha bez jego wiedzy nie przeleciała"; awansowano go do centrali, żeby nadzorował otwieranie oddziałów w całym kraju — a jego poprzedni, najlepszy oddział przez rok „zdechł": nie zdołał kontrolować go na odległość, bo z daleka wszystkiego kontrolować się nie da, a gdy tylko nie udaje się kontrolować wszystkiego — po prostu przestał kontrolować. Wszystko to było widać na teście.') +
              bp('Dlatego takiego człowieka trzeba nauczyć, co dokładnie kontrolować zdalnie — czyli znaleźć kluczowe wskaźniki. Kluczowy wskaźnik to coś, na czym obowiązkowo odbije się każdy problem (na przykład dochód na jednego pracownika, liczba klientów; u Jacka Welcha były to zaangażowanie, zadowolenie klientów i przepływ pieniężny). Jeśli kontrolujesz je — można być spokojnym. Swoją drogą, dokładnie to samo można objaśnić i matce z kompulsywną kontrolą: nie wyjaśniać telefonów i imion wszystkich, z kim spaceruje córka, lecz nauczyć się śledzić jej położenie na skali tonów — na niej przecież odbija się wszystko; wysoko na tonie — można się rozluźnić, spadła po tonie — otóż wtedy działać. I, à propos, to wszystko można robić nie tylko z podwładnymi, ale i z przełożonymi — po prostu trochę bardziej taktownie: rozkazywać im nie wolno.', true)),
        },
      },

      // 5 — ОГОВОРКА О КОМПУЛЬСИВНОСТИ / ИТОГ
      {
        id: 'compulsivity',
        title: {
          ru: 'Оговорка о компульсивности и итог',
          en: 'A caveat about compulsiveness and conclusion',
          pl: 'Zastrzeżenie o kompulsywności i podsumowanie',
        },
        desc: {
          ru: 'Когда точка считается компульсивной, почему при низкой D нельзя быть уверенным, и главное напоминание.',
          en: 'When a point is considered compulsive, why with a low D one cannot be sure, and the main reminder.',
          pl: 'Kiedy punkt uważa się za kompulsywny, dlaczego przy niskim D nie można być pewnym, i najważniejsze przypomnienie.',
        },
        html: {
          ru:
            '<h2>Глава 5. Оговорка о компульсивности</h2>' +
            '<p>И общая оговорка, важная для всех точек. Точка считается компульсивной, если она выше D — но при условии, что сама D не ниже 32. Если же D ниже 32, то тест импульсивный, и на нём всё может меняться, поэтому в компульсивности мы уже не уверены.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('При D ниже 32 сильнее всего колеблются средние точки теста, а самые высокие и самые низкие держатся стабильнее (человек может «взять другую роль» и измениться, но самое сильное и самое слабое обычно остаётся на месте). Поэтому, если D ниже 32, на сто процентов нельзя быть уверенным ни в чём, и чем ниже D, тем меньше уверенность. И в компульсивности самой высокой точки (например, A) мы уверены больше, чем в компульсивности средней (например, C или F): при небольших колебаниях средняя точка легко «уходит» вниз, а самая высокая, даже колеблясь, остаётся высокой.', true)) +
            '<p>Это не слабость, а профессионализм: дилетанты стыдятся признать, что чего-то не знают, и надувают щёки, делая вид, что знают всё; а мы, наоборот, спокойно показываем, где сомневаемся, — потому что именно так не обжигаемся.</p>' +
            '<p>И напоследок — важное напоминание, которое касается любой точки. Даже когда перед вами тест близкого человека, скажем собственного ребёнка, не пытайтесь сразу «решать проблему» и указывать на минусы: вы перешагиваете через важную ступеньку. Чтобы кому-то помочь, надо сначала стать ему другом — то есть как следует сделать шаг 2. А если это ваш ребёнок, это тем более важно.</p>',
          en:
            '<h2>Chapter 5. A caveat about compulsiveness</h2>' +
            '<p>And a general caveat, important for all the points. A point is considered compulsive if it is higher than D — but on condition that D itself is not below 32. If, however, D is below 32, then the test is impulsive, and everything on it may change, so we are no longer sure about compulsiveness.</p>' +
            k('KEY IDEA',
              bp('With D below 32, the middle points of the test fluctuate most strongly, while the highest and the lowest hold more steadily (a person may "take on another role" and change, but the strongest and the weakest usually stay in place). That is why, if D is below 32, one cannot be one hundred percent sure of anything, and the lower the D, the less the certainty. And in the compulsiveness of the highest point (for example, A) we are more sure than in the compulsiveness of a middle one (for example, C or F): with small fluctuations a middle point easily "slips" downward, while the highest, even fluctuating, remains high.', true)) +
            '<p>This is not a weakness but professionalism: dilettantes are ashamed to admit that they do not know something and puff out their cheeks, pretending to know everything; whereas we, on the contrary, calmly show where we have doubts — because it is exactly thus that we do not get burned.</p>' +
            '<p>And finally — an important reminder that concerns any point. Even when in front of you is the test of a close person, say your own child, do not try to "solve the problem" and point out the minuses right away: you are stepping over an important rung. To help someone, one must first become their friend — that is, do step 2 properly. And if it is your child, this is all the more important.</p>',
          pl:
            '<h2>Rozdział 5. Zastrzeżenie o kompulsywności</h2>' +
            '<p>I ogólne zastrzeżenie, ważne dla wszystkich punktów. Punkt uważa się za kompulsywny, jeśli jest wyższy od D — ale pod warunkiem, że samo D nie jest niższe niż 32. Jeśli zaś D jest niższe niż 32, to test jest impulsywny, i na nim wszystko może się zmieniać, dlatego kompulsywności już nie jesteśmy pewni.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Przy D niższym niż 32 najsilniej wahają się średnie punkty testu, a najwyższe i najniższe trzymają się stabilniej (człowiek może „wziąć inną rolę" i zmienić się, ale najsilniejsze i najsłabsze zwykle zostaje na miejscu). Dlatego, jeśli D jest niższe niż 32, na sto procent nie można być pewnym niczego, a im niższe D, tym mniejsza pewność. I co do kompulsywności najwyższego punktu (na przykład A) jesteśmy pewni bardziej niż co do kompulsywności średniego (na przykład C czy F): przy niewielkich wahaniach średni punkt łatwo „schodzi" w dół, a najwyższy, nawet się wahając, pozostaje wysoki.', true)) +
            '<p>To nie słabość, lecz profesjonalizm: dyletanci wstydzą się przyznać, że czegoś nie wiedzą, i nadymają policzki, udając, że wiedzą wszystko; a my, przeciwnie, spokojnie pokazujemy, gdzie wątpimy — bo właśnie tak się nie parzymy.</p>' +
            '<p>I na koniec — ważne przypomnienie, które dotyczy każdego punktu. Nawet gdy przed wami jest test bliskiej osoby, powiedzmy własnego dziecka, nie próbujcie od razu „rozwiązywać problemu" i wskazywać na minusy: przekraczacie ważny szczebel. Żeby komuś pomóc, trzeba najpierw stać się jego przyjacielem — czyli porządnie zrobić krok 2. A jeśli to wasze dziecko, jest to tym bardziej ważne.</p>',
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Ключевой концепт точки A (внимательность) — это:',
            en: 'The key concept of point A (attentiveness) is:',
            pl: 'Kluczowy koncept punktu A (uważność) to:',
          },
          opts: [
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'точка зрения',
              en: 'point of view',
              pl: 'punkt widzenia',
            },
            {
              ru: 'свободное внимание (не застрявшее в реактивном уме)',
              en: 'free attention (not stuck in the reactive mind)',
              pl: 'wolna uwaga (nieutkwiona w umyśle reaktywnym)',
            },
            {
              ru: 'контроль эмоций',
              en: 'control of emotions',
              pl: 'kontrola emocji',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Человек с высокой A:',
            en: 'A person with a high A:',
            pl: 'Człowiek z wysokim A:',
          },
          opts: [
            {
              ru: 'хорошо концентрируется и планирует',
              en: 'concentrates and plans well',
              pl: 'dobrze się koncentruje i planuje',
            },
            {
              ru: 'рассеян и нетерпелив',
              en: 'is scattered and impatient',
              pl: 'jest rozproszony i niecierpliwy',
            },
            {
              ru: 'не умеет надеть маску',
              en: 'does not know how to put on a mask',
              pl: 'nie umie założyć maski',
            },
            {
              ru: 'постоянно нервничает',
              en: 'is constantly nervous',
              pl: 'ciągle się denerwuje',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Человек с низкой A:',
            en: 'A person with a low A:',
            pl: 'Człowiek z niskim A:',
          },
          opts: [
            {
              ru: 'прекрасно планирует надолго',
              en: 'plans splendidly for the long term',
              pl: 'wspaniale planuje na długo',
            },
            {
              ru: 'очень терпелив',
              en: 'is very patient',
              pl: 'jest bardzo cierpliwy',
            },
            {
              ru: 'хорошо концентрируется',
              en: 'concentrates well',
              pl: 'dobrze się koncentruje',
            },
            {
              ru: 'рассеян, нетерпелив, не может ждать и планировать',
              en: 'is scattered, impatient, unable to wait or plan',
              pl: 'jest rozproszony, niecierpliwy, nie może czekać ani planować',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Ключевой концепт точки B (позитивность) — это:',
            en: 'The key concept of point B (positivity) is:',
            pl: 'Kluczowy koncept punktu B (pozytywność) to:',
          },
          opts: [
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'точка зрения — откуда человек смотрит (высокая B смотрит как бы «сверху»)',
              en: 'point of view — where the person looks from (a high B looks, as it were, "from above")',
              pl: 'punkt widzenia — skąd człowiek patrzy (wysokie B patrzy jakby „z góry")',
            },
            {
              ru: 'свободное внимание',
              en: 'free attention',
              pl: 'wolna uwaga',
            },
            {
              ru: 'расстояние до людей',
              en: 'distance to people',
              pl: 'dystans do ludzi',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Человек с высокой B:',
            en: 'A person with a high B:',
            pl: 'Człowiek z wysokim B:',
          },
          opts: [
            {
              ru: 'видит только препятствия',
              en: 'sees only obstacles',
              pl: 'widzi tylko przeszkody',
            },
            {
              ru: 'всегда негативен',
              en: 'is always negative',
              pl: 'jest zawsze negatywny',
            },
            {
              ru: 'видит решения, любит простоту, позитивен',
              en: 'sees solutions, likes simplicity, is positive',
              pl: 'widzi rozwiązania, lubi prostotę, jest pozytywny',
            },
            {
              ru: 'не замечает проблем вовсе',
              en: 'does not notice problems at all',
              pl: 'w ogóle nie zauważa problemów',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Человек с низкой B:',
            en: 'A person with a low B:',
            pl: 'Człowiek z niskim B:',
          },
          opts: [
            {
              ru: 'видит в основном «остановки» и препятствия, негативен',
              en: 'sees mainly "stops" and obstacles, is negative',
              pl: 'widzi głównie „zatrzymania" i przeszkody, jest negatywny',
            },
            {
              ru: 'всегда весел',
              en: 'is always cheerful',
              pl: 'jest zawsze wesoły',
            },
            {
              ru: 'прекрасно видит решения',
              en: 'sees solutions splendidly',
              pl: 'wspaniale widzi rozwiązania',
            },
            {
              ru: 'равнодушен ко всему',
              en: 'is indifferent to everything',
              pl: 'jest obojętny na wszystko',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Ключевой концепт точки C (самообладание) — это:',
            en: 'The key concept of point C (self-possession) is:',
            pl: 'Kluczowy koncept punktu C (panowanie nad sobą) to:',
          },
          opts: [
            {
              ru: 'точка зрения',
              en: 'point of view',
              pl: 'punkt widzenia',
            },
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'свободное внимание',
              en: 'free attention',
              pl: 'wolna uwaga',
            },
            {
              ru: 'контроль собственных эмоций (начать, изменить и закончить их по своему решению)',
              en: 'control of one\'s own emotions (to start, change, and stop them by one\'s own decision)',
              pl: 'kontrola własnych emocji (zacząć, zmienić i zakończyć je wedle swojej decyzji)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Человек с низкой C:',
            en: 'A person with a low C:',
            pl: 'Człowiek z niskim C:',
          },
          opts: [
            {
              ru: 'спокоен и легко расслабляется',
              en: 'is calm and relaxes easily',
              pl: 'jest spokojny i łatwo się rozluźnia',
            },
            {
              ru: 'нервный, ему трудно расслабиться, долго отходит после конфликтов',
              en: 'is nervous, finds it hard to relax, takes long to recover after conflicts',
              pl: 'jest nerwowy, trudno mu się rozluźnić, długo dochodzi do siebie po konfliktach',
            },
            {
              ru: 'хорошо владеет телом',
              en: 'has good control over the body',
              pl: 'dobrze panuje nad ciałem',
            },
            {
              ru: 'равнодушен ко всему',
              en: 'is indifferent to everything',
              pl: 'jest obojętny na wszystko',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое «инструкция по эксплуатации» точки?',
            en: 'What is a point\'s "operating manual"?',
            pl: 'Czym jest „instrukcja obsługi" punktu?',
          },
          opts: [
            {
              ru: 'подробное описание теста',
              en: 'a detailed description of the test',
              pl: 'szczegółowy opis testu',
            },
            {
              ru: 'список всех минусов человека',
              en: 'a list of all the person\'s minuses',
              pl: 'lista wszystkich minusów człowieka',
            },
            {
              ru: 'буквально пара предложений совета необученному руководителю: что делать с этим человеком',
              en: 'literally a couple of sentences of advice to an untrained manager: what to do with this person',
              pl: 'dosłownie parę zdań rady dla nieprzeszkolonego kierownika: co robić z tym człowiekiem',
            },
            {
              ru: 'инструкция к прибору',
              en: 'a manual for a device',
              pl: 'instrukcja do urządzenia',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Полезное правило для шага о плюсах звучит так:',
            en: 'The useful rule for the pluses step goes like this:',
            pl: 'Pożyteczna zasada dla kroku o plusach brzmi tak:',
          },
          opts: [
            {
              ru: '«что торчит, то и плюс» — если хоть одна точка «торчит», уже есть о чём сказать хорошее',
              en: '"whatever sticks out is a plus" — if even one point "sticks out," there is already something good to say',
              pl: '„co sterczy, to i plus" — jeśli choć jeden punkt „sterczy", już jest o czym powiedzieć coś dobrego',
            },
            {
              ru: '«начинай всегда с минусов»',
              en: '"always start with the minuses"',
              pl: '„zaczynaj zawsze od minusów"',
            },
            {
              ru: '«хвали только высокие точки»',
              en: '"praise only the high points"',
              pl: '„chwal tylko wysokie punkty"',
            },
            {
              ru: '«о плюсах лучше молчать»',
              en: '"it is better to keep quiet about the pluses"',
              pl: '„o plusach lepiej milczeć"',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'За «взрываемость» отвечают сразу три точки. Что показывает точка A в этой модели?',
            en: 'Three points are responsible for "explosiveness." What does point A show in this model?',
            pl: 'Za „wybuchowość" odpowiadają od razu trzy punkty. Co pokazuje punkt A w tym modelu?',
          },
          opts: [
            {
              ru: 'силу взрыва',
              en: 'the force of the explosion',
              pl: 'siłę wybuchu',
            },
            {
              ru: '«влажность» системы',
              en: 'the "dampness" of the system',
              pl: '„wilgotność" systemu',
            },
            {
              ru: 'желание всё контролировать',
              en: 'the desire to control everything',
              pl: 'chęć kontrolowania wszystkiego',
            },
            {
              ru: 'длину бикфордова шнура — насколько долго человека надо «доставать»',
              en: 'the length of the fuse — how long the person has to be "worked up"',
              pl: 'długość lontu prochowego — jak długo trzeba człowieka „doprowadzać"',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что в модели «взрываемости» показывает точка C?',
            en: 'What does point C show in the "explosiveness" model?',
            pl: 'Co w modelu „wybuchowości" pokazuje punkt C?',
          },
          opts: [
            {
              ru: 'длину шнура',
              en: 'the length of the fuse',
              pl: 'długość lontu',
            },
            {
              ru: 'насколько система «влажная» — насколько легко человек вспыхивает',
              en: 'how "damp" the system is — how easily a person flares up',
              pl: 'na ile system jest „wilgotny" — na ile łatwo człowiek się zapala',
            },
            {
              ru: 'силу взрыва',
              en: 'the force of the explosion',
              pl: 'siłę wybuchu',
            },
            {
              ru: 'уровень интеллекта',
              en: 'the level of intelligence',
              pl: 'poziom inteligencji',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что показывает точка F в модели «взрываемости»?',
            en: 'What does point F show in the "explosiveness" model?',
            pl: 'Co pokazuje punkt F w modelu „wybuchowości"?',
          },
          opts: [
            {
              ru: 'длину шнура',
              en: 'the length of the fuse',
              pl: 'długość lontu',
            },
            {
              ru: '«влажность» системы',
              en: 'the "dampness" of the system',
              pl: '„wilgotność" systemu',
            },
            {
              ru: 'насколько сильно человек взорвётся',
              en: 'how strongly the person will explode',
              pl: 'jak silnie człowiek wybuchnie',
            },
            {
              ru: 'скорость мышления',
              en: 'the speed of thinking',
              pl: 'szybkość myślenia',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Компульсивная C проявляется так, что человек:',
            en: 'A compulsive C manifests such that the person:',
            pl: 'Kompulsywne C przejawia się tak, że człowiek:',
          },
          opts: [
            {
              ru: 'не умеет нервничать «по чуть-чуть» и, чтобы не нервничать, стремится всё контролировать и обо всём знать',
              en: 'does not know how to be nervous "a little bit" and, in order not to be nervous, strives to control everything and know about everything',
              pl: 'nie umie denerwować się „po trochu" i, żeby się nie denerwować, dąży do kontrolowania wszystkiego i wiedzy o wszystkim',
            },
            {
              ru: 'всегда абсолютно спокоен',
              en: 'is always absolutely calm',
              pl: 'jest zawsze absolutnie spokojny',
            },
            {
              ru: 'вообще не контролирует себя',
              en: 'does not control himself at all',
              pl: 'w ogóle się nie kontroluje',
            },
            {
              ru: 'не запоминает ничего',
              en: 'remembers nothing',
              pl: 'niczego nie zapamiętuje',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Как обращаться к человеку во время беседы о точках?',
            en: 'How should one address the person during the conversation about the points?',
            pl: 'Jak zwracać się do człowieka podczas rozmowy o punktach?',
          },
          opts: [
            {
              ru: 'говорить о нём в третьем лице («он»)',
              en: 'speak of him in the third person ("he")',
              pl: 'mówić o nim w trzeciej osobie („on")',
            },
            {
              ru: 'читать ему вслух описание из методички',
              en: 'read him the description from the manual aloud',
              pl: 'czytać mu na głos opis z podręcznika',
            },
            {
              ru: 'начинать с длинного предисловия',
              en: 'begin with a long preface',
              pl: 'zaczynać od długiej przedmowy',
            },
            {
              ru: 'обращаться напрямую («ты»/«вы») и не читать, а говорить нормальным языком',
              en: 'address directly ("you") and not read, but speak in normal language',
              pl: 'zwracać się wprost („ty"/„wy") i nie czytać, lecz mówić normalnym językiem',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Стоит ли делать предисловие вроде «сейчас расскажу о твоих плюсах»?',
            en: 'Is it worth making a preface like "now I\'ll tell you about your pluses"?',
            pl: 'Czy warto robić przedmowę w rodzaju „teraz opowiem ci o twoich plusach"?',
          },
          opts: [
            {
              ru: 'да, обязательно',
              en: 'yes, definitely',
              pl: 'tak, obowiązkowo',
            },
            {
              ru: 'нет: это подразумевает «потом будет другое», и человек внутренне напрягается',
              en: 'no: it implies "then there\'ll be something else," and the person inwardly tenses up',
              pl: 'nie: to zakłada „potem będzie coś innego", i człowiek wewnętrznie się spina',
            },
            {
              ru: 'да, это его успокаивает',
              en: 'yes, it calms him',
              pl: 'tak, to go uspokaja',
            },
            {
              ru: 'да, для руководителей',
              en: 'yes, for managers',
              pl: 'tak, dla kierowników',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Компульсивная B опасна тем, что:',
            en: 'A compulsive B is dangerous because:',
            pl: 'Kompulsywne B jest niebezpieczne tym, że:',
          },
          opts: [
            {
              ru: 'человек видит только минусы',
              en: 'the person sees only minuses',
              pl: 'człowiek widzi tylko minusy',
            },
            {
              ru: 'человек честен до предела',
              en: 'the person is honest to the extreme',
              pl: 'człowiek jest uczciwy do granic',
            },
            {
              ru: 'человек всегда показывает, что «всё хорошо», хотя дела могут быть плохи давно',
              en: 'the person always shows that "everything is fine," though things may have been bad for a long time',
              pl: 'człowiek zawsze pokazuje, że „wszystko dobrze", choć sprawy mogą być złe od dawna',
            },
            {
              ru: 'человек становится молчаливым',
              en: 'the person becomes silent',
              pl: 'człowiek staje się małomówny',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'При каком сочетании человек с высокой A «надевает маску» и говорит правильные вещи, будучи негативным?',
            en: 'With what combination does a person with a high A "put on a mask" and say the right things while being negative?',
            pl: 'Przy jakim połączeniu człowiek z wysokim A „zakłada maskę" i mówi właściwe rzeczy, będąc negatywnym?',
          },
          opts: [
            {
              ru: 'при высокой A и низкой B (видит снизу, решений не видит, но знает, что вы хотите услышать)',
              en: 'with a high A and a low B (looks from below, sees no solutions, but knows what you want to hear)',
              pl: 'przy wysokim A i niskim B (patrzy z dołu, rozwiązań nie widzi, ale wie, co chcecie usłyszeć)',
            },
            {
              ru: 'при высокой C',
              en: 'with a high C',
              pl: 'przy wysokim C',
            },
            {
              ru: 'при низкой A',
              en: 'with a low A',
              pl: 'przy niskim A',
            },
            {
              ru: 'при высокой E',
              en: 'with a high E',
              pl: 'przy wysokim E',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Когда точка считается компульсивной?',
            en: 'When is a point considered compulsive?',
            pl: 'Kiedy punkt uważa się za kompulsywny?',
          },
          opts: [
            {
              ru: 'когда она ниже нуля',
              en: 'when it is below zero',
              pl: 'gdy jest poniżej zera',
            },
            {
              ru: 'когда она равна D',
              en: 'when it equals D',
              pl: 'gdy jest równy D',
            },
            {
              ru: 'всегда, если она высокая',
              en: 'always, if it is high',
              pl: 'zawsze, jeśli jest wysoki',
            },
            {
              ru: 'когда она выше D — но при условии, что сама D не ниже 32',
              en: 'when it is higher than D — but on condition that D itself is not below 32',
              pl: 'gdy jest wyższy od D — ale pod warunkiem, że samo D nie jest niższe niż 32',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что происходит с уверенностью в компульсивности, если D ниже 32?',
            en: 'What happens to certainty about compulsiveness if D is below 32?',
            pl: 'Co dzieje się z pewnością co do kompulsywności, jeśli D jest niższe niż 32?',
          },
          opts: [
            {
              ru: 'уверенность только растёт',
              en: 'certainty only grows',
              pl: 'pewność tylko rośnie',
            },
            {
              ru: 'тест импульсивный, всё «плавает», и в компульсивности уже нельзя быть уверенным',
              en: 'the test is impulsive, everything "floats," and one can no longer be sure of compulsiveness',
              pl: 'test jest impulsywny, wszystko „pływa", i kompulsywności już nie można być pewnym',
            },
            {
              ru: 'ничего не меняется',
              en: 'nothing changes',
              pl: 'nic się nie zmienia',
            },
            {
              ru: 'точки становятся точнее',
              en: 'the points become more precise',
              pl: 'punkty stają się dokładniejsze',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'В компульсивности какой точки мы увереннее при D ниже 32?',
            en: 'In the compulsiveness of which point are we more confident when D is below 32?',
            pl: 'Co do kompulsywności którego punktu jesteśmy pewniejsi przy D niższym niż 32?',
          },
          opts: [
            {
              ru: 'средней (например, C)',
              en: 'the middle one (for example, C)',
              pl: 'średniego (na przykład C)',
            },
            {
              ru: 'любой одинаково',
              en: 'any of them equally',
              pl: 'każdego jednakowo',
            },
            {
              ru: 'самой высокой (например, A) — она, даже колеблясь, остаётся высокой',
              en: 'the highest one (for example, A) — even fluctuating, it remains high',
              pl: 'najwyższego (na przykład A) — nawet się wahając, pozostaje wysoki',
            },
            {
              ru: 'точки D',
              en: 'point D',
              pl: 'punktu D',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Почему признавать, что чего-то не знаешь по тесту, — это профессионализм?',
            en: 'Why is admitting that you don\'t know something from the test a mark of professionalism?',
            pl: 'Dlaczego przyznanie, że czegoś nie wiadomo z testu, to profesjonalizm?',
          },
          opts: [
            {
              ru: 'дилетанты «надувают щёки», делая вид, что знают всё, а мы спокойно показываем, где сомневаемся, — и не обжигаемся',
              en: 'dilettantes "puff out their cheeks," pretending to know everything, while we calmly show where we doubt — and do not get burned',
              pl: 'dyletanci „nadymają policzki", udając, że wiedzą wszystko, a my spokojnie pokazujemy, gdzie wątpimy — i się nie parzymy',
            },
            {
              ru: 'потому что так быстрее',
              en: 'because it is faster',
              pl: 'ponieważ tak jest szybciej',
            },
            {
              ru: 'потому что это скрывает незнание',
              en: 'because it hides the lack of knowledge',
              pl: 'ponieważ ukrywa to niewiedzę',
            },
            {
              ru: 'потому что клиент всё равно не заметит',
              en: 'because the client won\'t notice anyway',
              pl: 'ponieważ klient i tak nie zauważy',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Даже разбирая тест близкого человека (например, ребёнка), нельзя:',
            en: 'Even when going over the test of a close person (for example, a child), one must not:',
            pl: 'Nawet analizując test bliskiej osoby (na przykład dziecka), nie wolno:',
          },
          opts: [
            {
              ru: 'хвалить его',
              en: 'praise him',
              pl: 'chwalić go',
            },
            {
              ru: 'вступать с ним в контакт',
              en: 'make contact with him',
              pl: 'nawiązywać z nim kontaktu',
            },
            {
              ru: 'говорить о его плюсах',
              en: 'speak about his pluses',
              pl: 'mówić o jego plusach',
            },
            {
              ru: 'сразу «решать проблему» и указывать на минусы, перешагнув важную ступень (сначала надо стать другом)',
              en: 'immediately "solve the problem" and point out the minuses, stepping over an important rung (one must first become a friend)',
              pl: 'od razu „rozwiązywać problemu" i wskazywać na minusy, przekraczając ważny szczebel (najpierw trzeba stać się przyjacielem)',
            },
          ],
          correct: 3,
        },
      ],
    },
  },
};
