'use strict';
// Контент программы «Личностные качества (Точки H, I, J)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-hij'.

// Врезки-боксы 1-в-1 из программы productivity-winners / module-abc / module-def / module-g.
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
  'module-hij': {
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: {
          ru: 'Точки H, I, J · Введение',
          en: 'Points H, I, J · Introduction',
          pl: 'Punkty H, I, J · Wprowadzenie',
        },
        desc: {
          ru: 'О чём этот модуль: последняя группа точек — объективность, чуткость и общительность — плюс два полезных навыка.',
          en: 'What this module is about: the last group of points — objectivity, sensitivity and sociability — plus two useful skills.',
          pl: 'O czym jest ten moduł: ostatnia grupa punktów — obiektywność, wrażliwość i towarzyskość — plus dwie pożyteczne umiejętności.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 9 · ТОЧКИ H–J</strong></p>' +
            '<p>Точки H, I, J: объективность, чуткость, общительность</p>' +
            '<p>Последняя группа точек: согласие и правильность оценки, тёплость и «колпак», «яркость» вместо общения — и ключевой навык подтверждения, снимающий половину конфликтов.</p>' +
            '<h2>Модуль 9. Точки H, I, J</h2>' +
            '<p>Этим модулем мы завершаем разбор точек по отдельности. Мы пройдём три оставшиеся: H (объективность, она же правильность оценки), I (чуткость) и J (общительность). Попутно разберём два очень полезных навыка — «ассист» (как вытащить внимание человека наружу, когда оно ушло внутрь) и подтверждение (сигнал понимания, который снимает едва ли не половину всех конфликтов).</p>',
          en:
            '<p><strong>MODULE 9 · POINTS H–J</strong></p>' +
            '<p>Points H, I, J: objectivity, sensitivity, sociability</p>' +
            '<p>The last group of points: agreement and correctness of evaluation, warmth and the "cap," "vividness" instead of communication — and the key skill of acknowledgment that removes half of conflicts.</p>' +
            '<h2>Module 9. Points H, I, J</h2>' +
            '<p>With this module we complete the examination of the points one by one. We will go through the three remaining ones: H (objectivity, also known as correctness of evaluation), I (sensitivity), and J (sociability). Along the way we will examine two very useful skills — the "assist" (how to pull a person\'s attention outward when it has gone inward) and acknowledgment (the signal of understanding that removes well-nigh half of all conflicts).</p>',
          pl:
            '<p><strong>MODUŁ 9 · PUNKTY H–J</strong></p>' +
            '<p>Punkty H, I, J: obiektywność, wrażliwość, towarzyskość</p>' +
            '<p>Ostatnia grupa punktów: zgoda i poprawność oceny, ciepło i „klosz", „barwność" zamiast komunikacji — oraz kluczowa umiejętność potwierdzania, która usuwa połowę konfliktów.</p>' +
            '<h2>Moduł 9. Punkty H, I, J</h2>' +
            '<p>Tym modułem kończymy omawianie punktów po kolei. Przejdziemy przez trzy pozostałe: H (obiektywność, czyli poprawność oceny), I (wrażliwość) i J (towarzyskość). Po drodze omówimy dwie bardzo pożyteczne umiejętności — „asystę" (jak wyciągnąć uwagę człowieka na zewnątrz, gdy poszła do wewnątrz) i potwierdzenie (sygnał zrozumienia, który usuwa bodaj połowę wszystkich konfliktów).</p>',
        },
      },

      // 2 — ТОЧКА H. ОБЪЕКТИВНОСТЬ
      {
        id: 'point-h',
        title: {
          ru: 'Точка H. Объективность (правильность оценки)',
          en: 'Point H. Objectivity (correctness of evaluation)',
          pl: 'Punkt H. Obiektywność (poprawność oceny)',
        },
        desc: {
          ru: 'Ключевой концепт — согласие: высокая H награждает вниманием плюсы и получает больше плюсов.',
          en: 'The key concept is agreement: a high H rewards the pluses with attention and gets more pluses.',
          pl: 'Kluczowy koncept to zgoda: wysokie H nagradza uwagą plusy i dostaje więcej plusów.',
        },
        html: {
          ru:
            '<h2>Глава 1. Точка H. Объективность (правильность оценки)</h2>' +
            '<p>Ключевой концепт точки H — согласие: человек стремится найти что-то правильное, с чем он согласен. Человек с высокой правильностью оценки смотрит на плюсы — концентрирует внимание на положительном (это не значит, что он не видит минусов, просто больше внимания уделяет плюсам). И это правильно: если направлять внимание на плюсы человека, тот принимает тебя за друга и поворачивается к тебе плюсами — а значит, ты видишь ещё больше плюсов и строишь долгие добрые отношения. Человек с низкой правильностью оценки смотрит на минусы и больше критикует — а значит, люди принимают его за врага, поворачиваются к нему минусами, и отношения начинают портиться.</p>' +
            r('ПРАВИЛО',
              bp('Есть хороший закон, который это подтверждает: «вы получаете то, что продолжительно награждаете». Высокая правильность оценки награждает вниманием плюсы — и получает больше плюсов; низкая награждает вниманием минусы — и получает больше минусов.', true)) +
            '<p>Где же лучше работать человеку с низкой правильностью оценки? С техникой и документами, а не с людьми. Ведь техника от нахождения в ней минусов улучшается, а люди — портятся. В этом и беда низкой правильности оценки: человек не различает людей и технику. «В документах нашёл ошибку — стало лучше; в компьютере нашёл — починил; и к жене прихожу, у неё раз за разом ошибки нахожу — а компьютер улучшается, жена же портится, и разницы я не понимаю». Поэтому не отвергайте, скажем, бухгалтера из-за низкой правильности оценки: в работе с документами как раз надо искать минусы.</p>' +
            '<p>А вот человек с высокой правильностью оценки — вовсе не наивный: он прекрасно понимает, что с людьми надо искать плюсы, а с техникой и документами — минусы. Принимая ремонт зала, он быстро находит все недочёты (тут фломастера нет, там доска плохая) — это не низкая правильность оценки, это то, что и надо делать; а вот разговаривая со строителем, он проявит и правильность оценки, и дипломатичность: «спасибо, вот это ты сделал отлично, и в срок уложился; помоги, пожалуйста, уладить пару незначительных минусов за два дня». А кого поблагодарили и назвали молодцом — тот уже друг, и другу помочь приятно.</p>' +
            b('ПРИМЕР · Высокая правильность оценки гасит конфликт',
              bp('Директор склада хочет быстрее отгрузить товар (чтобы не подвести клиента), а директор по качеству грудью встал: «ни одной коробки не выпущу, пока не проверим качество» (чтобы к клиенту не попал брак). Они уже почти дерутся — пока рядом не появляется человек с высокой правильностью оценки. Он говорит: «Ты хочешь быстрее — чтобы не подвести клиента, ты абсолютно прав. И ты не отпускаешь без проверки — чтобы к клиенту не попал брак, ты тоже абсолютно прав. Вы оба хотите одного и того же — не расстроить клиента, и оба ни в чём не виноваты: мы попали в эту ситуацию из-за закупщиков, с ними разберёмся отдельно. А сейчас давайте решать».') +
              bp('И тут же — тактика (высокая правильность оценки сильна именно в тактике, тогда как в стратегии силён B): «собираем контролёров, даём им грузчиков, быстро проверяем качество у одной фуры и сегодня же отправляем её клиенту; а коммерческий директор договорится с ним о поставке остальных фур в течение недели». Всё это построено на понимании людей.', true)) +
            '<h3>Как говорить о точке H в шаге о плюсах</h3>' +
            '<p>Если правильность оценки низкая (ниже минус пятидесяти) — «ты великолепен в нахождении минусов и недочётов», «ты хорош в работе с техникой» (а для бухгалтера — «с документами»). В зоне от минус двадцати до минус пятидесяти ничего не говорим, а выше минус двадцати — плюсы высокой H: «у тебя всё в порядке со здравым смыслом, тебе легко что-то объяснить», «ты хорошо понимаешь и улаживаешь людей». Кстати, если на тесте высокая правильность оценки, то и оценку предоставлять будет легко: человек всё понимает. А при низкой правильности оценки он будет цепляться за каждую неточность и стремиться не согласиться — тут просто спокойно объясняйте (а прямо назвать это «твоей низкой правильностью оценки» можно только позже, на шаге о минусах, когда вы уже стали другом).</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка H',
              bp('Если правильность оценки низкая, руководителю стоит помнить, что такому сотруднику лучше работать с техникой и документами, а не там, где его критичность будет портить отношения с людьми; а если он всё же работает с людьми — не принимать его критику в их адрес за чистую монету. Если правильность оценки высокая, на такого человека можно опереться, чтобы гасить конфликты и устанавливать согласие в коллективе, — он это делает естественно.', true)),
          en:
            '<h2>Chapter 1. Point H. Objectivity (correctness of evaluation)</h2>' +
            '<p>The key concept of point H is agreement: a person strives to find something right, with which he agrees. A person with a high correctness of evaluation looks at the pluses — he concentrates his attention on the positive (this does not mean that he does not see the minuses, he simply devotes more attention to the pluses). And this is right: if you direct your attention to a person\'s pluses, he takes you for a friend and turns his pluses toward you — and that means you see even more pluses and build long, good relations. A person with a low correctness of evaluation looks at the minuses and criticizes more — and that means people take him for an enemy, turn their minuses toward him, and relations begin to spoil.</p>' +
            r('RULE',
              bp('There is a good law that confirms this: "you get what you reward over time." A high correctness of evaluation rewards the pluses with attention — and gets more pluses; a low one rewards the minuses with attention — and gets more minuses.', true)) +
            '<p>Where, then, is it better for a person with a low correctness of evaluation to work? With machinery and documents, not with people. For machinery is improved by finding minuses in it, whereas people are spoiled. Herein lies the trouble with a low correctness of evaluation: the person does not distinguish between people and machinery. "In documents I found a mistake — it got better; in the computer I found one — I fixed it; and I come home to my wife, and I keep finding mistakes in her — but the computer improves, while the wife spoils, and I don\'t understand the difference." That is why you should not reject, say, an accountant because of a low correctness of evaluation: in working with documents it is precisely minuses that one must look for.</p>' +
            '<p>But a person with a high correctness of evaluation is not at all naive: he understands perfectly well that with people one must look for pluses, and with machinery and documents — for minuses. Accepting the renovation of a hall, he quickly finds all the defects (a marker is missing here, the board is bad there) — this is not a low correctness of evaluation, this is exactly what one should do; but talking with the builder, he will display both correctness of evaluation and diplomacy: "thank you, this you did splendidly, and you met the deadline; please help me handle a couple of insignificant minuses within two days." And whoever has been thanked and called a good fellow is already a friend, and it is pleasant to help a friend.</p>' +
            b('EXAMPLE · A high correctness of evaluation quells a conflict',
              bp('The warehouse manager wants to ship the goods faster (so as not to let the client down), while the quality director has planted himself firmly: "I won\'t release a single box until we check the quality" (so that no defective goods reach the client). They are already almost coming to blows — until a person with a high correctness of evaluation appears nearby. He says: "You want it faster — so as not to let the client down; you\'re absolutely right. And you don\'t release without a check — so that no defective goods reach the client; you\'re absolutely right too. You both want the same thing — not to upset the client, and neither of you is to blame for anything: we got into this situation because of the purchasers, and we\'ll deal with them separately. And now let\'s decide."') +
              bp('And at once — tactics (a high correctness of evaluation is strong precisely in tactics, whereas in strategy B is strong): "we gather the inspectors, give them loaders, quickly check the quality of one truck, and send it to the client this very day; and the commercial director will arrange with him for the delivery of the remaining trucks within a week." All of this is built on an understanding of people.', true)) +
            '<h3>How to speak about point H in the pluses step</h3>' +
            '<p>If the correctness of evaluation is low (below minus fifty) — "you\'re magnificent at finding minuses and defects," "you\'re good at working with machinery" (and for an accountant — "with documents"). In the zone from minus twenty to minus fifty we say nothing, and above minus twenty — the pluses of a high H: "your common sense is all in order, it\'s easy to explain something to you," "you understand and handle people well." Incidentally, if there is a high correctness of evaluation on the test, then delivering the assessment will be easy too: the person understands everything. And with a low correctness of evaluation he will cling to every inaccuracy and strive not to agree — here simply explain calmly (and one can call it "your low correctness of evaluation" directly only later, in the minuses step, when you have already become a friend).</p>' +
            t('APPLICATION IN HIRING · Operating manual: point H',
              bp('If the correctness of evaluation is low, the manager should bear in mind that it is better for such an employee to work with machinery and documents, rather than where his criticality will spoil relations with people; and if he does work with people — not to take his criticism directed at them at face value. If the correctness of evaluation is high, one can lean on such a person to quell conflicts and establish agreement in the team — he does this naturally.', true)),
          pl:
            '<h2>Rozdział 1. Punkt H. Obiektywność (poprawność oceny)</h2>' +
            '<p>Kluczowy koncept punktu H to zgoda: człowiek dąży, żeby znaleźć coś właściwego, z czym się zgadza. Człowiek z wysoką poprawnością oceny patrzy na plusy — koncentruje uwagę na pozytywnym (to nie znaczy, że nie widzi minusów, po prostu więcej uwagi poświęca plusom). I to jest właściwe: jeśli kierować uwagę na plusy człowieka, ten bierze cię za przyjaciela i odwraca się do ciebie plusami — a znaczy, widzisz jeszcze więcej plusów i budujesz długie, dobre relacje. Człowiek z niską poprawnością oceny patrzy na minusy i bardziej krytykuje — a znaczy, ludzie biorą go za wroga, odwracają się do niego minusami, i relacje zaczynają się psuć.</p>' +
            r('ZASADA',
              bp('Jest dobre prawo, które to potwierdza: „dostajesz to, co długotrwale nagradzasz". Wysoka poprawność oceny nagradza uwagą plusy — i dostaje więcej plusów; niska nagradza uwagą minusy — i dostaje więcej minusów.', true)) +
            '<p>Gdzie zaś lepiej pracować człowiekowi z niską poprawnością oceny? Z techniką i dokumentami, a nie z ludźmi. Technika bowiem od znajdowania w niej minusów się poprawia, a ludzie — psują. W tym właśnie jest bieda niskiej poprawności oceny: człowiek nie rozróżnia ludzi i techniki. „W dokumentach znalazłem błąd — zrobiło się lepiej; w komputerze znalazłem — naprawiłem; i do żony przychodzę, u niej raz za razem błędy znajduję — a komputer się poprawia, żona zaś się psuje, i różnicy nie rozumiem". Dlatego nie odrzucajcie, powiedzmy, księgowego z powodu niskiej poprawności oceny: w pracy z dokumentami właśnie trzeba szukać minusów.</p>' +
            '<p>A oto człowiek z wysoką poprawnością oceny wcale nie jest naiwny: doskonale rozumie, że z ludźmi trzeba szukać plusów, a z techniką i dokumentami — minusów. Odbierając remont sali, szybko znajduje wszystkie niedoróbki (tu flamastra nie ma, tam tablica jest zła) — to nie niska poprawność oceny, to właśnie to, co trzeba robić; a oto rozmawiając z budowlańcem, okaże i poprawność oceny, i dyplomację: „dziękuję, o to zrobiłeś znakomicie, i w terminie się zmieściłeś; pomóż, proszę, rozładować parę nieznacznych minusów w dwa dni". A kogo podziękowano i nazwano zuchem — ten już jest przyjacielem, a przyjacielowi pomóc jest przyjemnie.</p>' +
            b('PRZYKŁAD · Wysoka poprawność oceny gasi konflikt',
              bp('Dyrektor magazynu chce szybciej wysłać towar (żeby nie zawieść klienta), a dyrektor ds. jakości stanął murem: „ani jednego kartonu nie wypuszczę, dopóki nie sprawdzimy jakości" (żeby do klienta nie trafił brak). Już się prawie biją — dopóki obok nie pojawi się człowiek z wysoką poprawnością oceny. Mówi: „Ty chcesz szybciej — żeby nie zawieść klienta, masz absolutną rację. I ty nie wypuszczasz bez sprawdzenia — żeby do klienta nie trafił brak, ty też masz absolutną rację. Obaj chcecie tego samego — nie rozstroić klienta, i obaj w niczym nie zawiniliście: wpadliśmy w tę sytuację przez zaopatrzeniowców, z nimi rozprawimy się osobno. A teraz ustalajmy".') +
              bp('I od razu — taktyka (wysoka poprawność oceny jest silna właśnie w taktyce, podczas gdy w strategii silne jest B): „zbieramy kontrolerów, dajemy im ładowaczy, szybko sprawdzamy jakość jednej ciężarówki i jeszcze dziś wysyłamy ją klientowi; a dyrektor handlowy umówi się z nim co do dostawy pozostałych ciężarówek w ciągu tygodnia". Wszystko to zbudowane na rozumieniu ludzi.', true)) +
            '<h3>Jak mówić o punkcie H w kroku o plusach</h3>' +
            '<p>Jeśli poprawność oceny jest niska (poniżej minus pięćdziesięciu) — „jesteś wspaniały w znajdowaniu minusów i niedoróbek", „jesteś dobry w pracy z techniką" (a dla księgowego — „z dokumentami"). W strefie od minus dwudziestu do minus pięćdziesięciu nic nie mówimy, a powyżej minus dwudziestu — plusy wysokiego H: „masz wszystko w porządku ze zdrowym rozsądkiem, łatwo ci coś objaśnić", „dobrze rozumiesz i rozładowujesz ludzi". Swoją drogą, jeśli na teście jest wysoka poprawność oceny, to i ocenę przekazywać będzie łatwo: człowiek wszystko rozumie. A przy niskiej poprawności oceny będzie czepiał się każdej nieścisłości i dążył, żeby się nie zgodzić — tu po prostu spokojnie objaśniajcie (a wprost nazwać to „twoją niską poprawnością oceny" można dopiero później, w kroku o minusach, gdy już zostaliście przyjacielem).</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt H',
              bp('Jeśli poprawność oceny jest niska, kierownikowi warto pamiętać, że takiemu pracownikowi lepiej pracować z techniką i dokumentami, a nie tam, gdzie jego krytyczność będzie psuła relacje z ludźmi; a jeśli jednak pracuje z ludźmi — nie brać jego krytyki pod ich adresem za dobrą monetę. Jeśli poprawność oceny jest wysoka, na takim człowieku można się oprzeć, żeby gasić konflikty i ustanawiać zgodę w zespole — robi to naturalnie.', true)),
        },
      },

      // 3 — ПРИЁМ «АССИСТ» И УДЕРЖАНИЕ СОБСТВЕННОГО БАНКА
      {
        id: 'assist-and-own-bank',
        title: {
          ru: 'Приём «ассист» и удержание собственного банка',
          en: 'The "assist" technique and holding one\'s own bank',
          pl: 'Chwyt „asysta" i utrzymanie własnego banku',
        },
        desc: {
          ru: 'Как вытащить внимание человека наружу — и почему важно вовремя остановиться, удержав свой банк.',
          en: 'How to pull a person\'s attention outward — and why it is important to stop in time, holding your own bank.',
          pl: 'Jak wyciągnąć uwagę człowieka na zewnątrz — i dlaczego ważne jest zatrzymać się w porę, utrzymując swój bank.',
        },
        html: {
          ru:
            '<h2>Глава 2. Приём «ассист» и удержание собственного банка</h2>' +
            '<p>Раз уж речь зашла о том, как помогать людям, — два слова о простом и полезном приёме. Когда человеку плохо, его внимание ушло внутрь (он «загрузился»), и лучший способ помочь — вытащить это внимание наружу, то есть поднять его вверх по шкале тонов. Обычно мы делаем это работой (недаром существует трудотерапия): когда впахиваешь, внимание волей-неволей выходит наружу. Но есть и специальная короткая процедура — «ассист», то есть ориентация человека в окружении.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Ассист: как вытащить внимание наружу',
              bp('Спокойно и по одному давайте человеку простые задания, направляющие его внимание вовне: «посмотри на потолок… на эту стену… на лампу»; «поздоровайся с соседом так тихо, как только можешь… а теперь с другим — так громко, как можешь»; «убедись, что под ногами твёрдый пол… что под тобой есть стул»; «дотронься до двух ушей… до трёх локтей». Делать это стоит до результата — пока человек не почувствует, что внимание вышло наружу и ему стало легче. Приём простой, но по-настоящему помогает человеку, у которого внимание застряло внутри.', true)) +
            '<p>И тут же — важное предостережение о себе самом. Когда я вижу, что на кого-то навалился банк, и решаю оказать давление, надо помнить: давить нужно ровно до тех пор, пока его банк чуть-чуть не отодвинется, и на этом остановиться. Но проблема в том, что банк есть и у меня. И часто, впрягшись, я не могу вовремя остановиться: его банк уже отодвинулся, а я всё продолжаю «воспитывать», потом перехожу к следующему, потом на всякий случай к помощникам, а прихожу в себя дай бог через сутки. Это уже не ответ, а реакция: чужой навалившийся банк вызвал мою собственную реакцию, и свой банк я не удержал.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Есть известная байка о том, как один из сотрудников поражался, что Хаббард умел кричать на людей. Стоя на палубе, Хаббард отчитывал группу, в очередной раз завалившую дело, — и в этот момент подошёл помощник с докладом о срочно выполненном поручении. Хаббард на полуслове обернулся к нему: «Отлично, молодец, теперь сделай вот это, спасибо», — и тут же продолжил отчитывать первых. Это и есть полный контроль над собственным банком: человек кричит тогда, когда это адекватно и нужно, и не кричит на тех, на кого не надо. Мало кто на такое способен, — и именно к этому стоит стремиться, когда мы работаем с людьми.', true)),
          en:
            '<h2>Chapter 2. The "assist" technique and holding one\'s own bank</h2>' +
            '<p>Since the talk has turned to how to help people — a couple of words about a simple and useful technique. When a person feels bad, his attention has gone inward (he has "loaded up"), and the best way to help is to pull this attention outward, that is, to raise it up the tone scale. Usually we do this with work (not for nothing does occupational therapy exist): when you graft away, your attention willy-nilly comes outward. But there is also a special short procedure — the "assist," that is, orienting the person in his surroundings.</p>' +
            t('APPLICATION IN HIRING · The assist: how to pull attention outward',
              bp('Calmly and one at a time, give the person simple instructions that direct his attention outward: "look at the ceiling… at this wall… at the lamp"; "greet your neighbor as quietly as you possibly can… and now another one — as loudly as you can"; "make sure there\'s a solid floor underfoot… that there\'s a chair beneath you"; "touch two ears… three elbows." It is worth doing this to a result — until the person feels that his attention has come outward and it has become easier for him. The technique is simple, but it really helps a person whose attention is stuck inside.', true)) +
            '<p>And right away — an important warning about oneself. When I see that the bank has piled onto someone and I decide to apply pressure, I must remember: one should press exactly until his bank pushes away a little, and stop at that. But the problem is that I have a bank too. And often, having thrown myself into it, I cannot stop in time: his bank has already pushed away, but I keep on "educating," then move on to the next person, then, just in case, to the assistants, and come to my senses a good day later at best. This is no longer a response but a reaction: someone else\'s piled-up bank triggered my own reaction, and I failed to hold back my own bank.</p>' +
            k('KEY IDEA',
              bp('There is a well-known anecdote about how one of the employees was amazed that Hubbard was able to shout at people. Standing on the deck, Hubbard was reprimanding a group that had once again botched a job — and at that moment an assistant came up with a report about an urgently completed assignment. Hubbard turned to him mid-word: "Excellent, well done, now do this, thank you" — and immediately went back to reprimanding the first ones. This is precisely full control over one\'s own bank: a person shouts when it is adequate and necessary, and does not shout at those he shouldn\'t. Few are capable of this — and it is precisely this that is worth striving for when we work with people.', true)),
          pl:
            '<h2>Rozdział 2. Chwyt „asysta" i utrzymanie własnego banku</h2>' +
            '<p>Skoro już mowa o tym, jak pomagać ludziom — dwa słowa o prostym i pożytecznym chwycie. Gdy człowiekowi jest źle, jego uwaga poszła do wewnątrz (on „się załadował"), a najlepszy sposób, żeby pomóc — wyciągnąć tę uwagę na zewnątrz, czyli podnieść ją w górę po skali tonów. Zwykle robimy to pracą (nie bez powodu istnieje terapia pracą): gdy harujesz, uwaga chcąc nie chcąc wychodzi na zewnątrz. Ale jest i specjalna krótka procedura — „asysta", czyli orientacja człowieka w otoczeniu.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Asysta: jak wyciągnąć uwagę na zewnątrz',
              bp('Spokojnie i po jednym dawajcie człowiekowi proste polecenia kierujące jego uwagę na zewnątrz: „spójrz na sufit… na tę ścianę… na lampę"; „przywitaj się z sąsiadem tak cicho, jak tylko potrafisz… a teraz z innym — tak głośno, jak potrafisz"; „upewnij się, że pod nogami jest twarda podłoga… że pod tobą jest krzesło"; „dotknij dwóch uszu… trzech łokci". Robić to warto do rezultatu — dopóki człowiek nie poczuje, że uwaga wyszła na zewnątrz i zrobiło mu się lżej. Chwyt prosty, ale naprawdę pomaga człowiekowi, u którego uwaga utknęła w środku.', true)) +
            '<p>I od razu — ważne ostrzeżenie o sobie samym. Gdy widzę, że na kogoś zwalił się bank, i postanawiam wywrzeć nacisk, trzeba pamiętać: naciskać należy dokładnie dopóty, dopóki jego bank trochę się nie odsunie, i na tym się zatrzymać. Ale problem w tym, że bank mam i ja. I często, zaprzągłszy się, nie mogę się w porę zatrzymać: jego bank już się odsunął, a ja wciąż dalej „wychowuję", potem przechodzę do następnego, potem na wszelki wypadek do asystentów, a przychodzę do siebie w najlepszym razie po dobie. To już nie odpowiedź, lecz reakcja: cudzy zwalony bank wywołał moją własną reakcję, i swojego banku nie utrzymałem.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Jest znana anegdota o tym, jak jeden z pracowników dziwił się, że Hubbard umiał krzyczeć na ludzi. Stojąc na pokładzie, Hubbard beształ grupę, która po raz kolejny zawaliła sprawę — i w tym momencie podszedł asystent z meldunkiem o pilnie wykonanym poleceniu. Hubbard w pół słowa odwrócił się do niego: „Świetnie, zuch, teraz zrób o to, dziękuję" — i od razu wrócił do besztania pierwszych. To i jest pełna kontrola nad własnym bankiem: człowiek krzyczy wtedy, gdy jest to adekwatne i potrzebne, i nie krzyczy na tych, na których nie trzeba. Mało kto jest do tego zdolny — i właśnie do tego warto dążyć, gdy pracujemy z ludźmi.', true)),
        },
      },

      // 4 — ТОЧКА I. ЧУТКОСТЬ
      {
        id: 'point-i',
        title: {
          ru: 'Точка I. Чуткость',
          en: 'Point I. Sensitivity',
          pl: 'Punkt I. Wrażliwość',
        },
        desc: {
          ru: 'Ключевой концепт — расстояние: «колпак» низкой чуткости и зачем тёплость нужна в бизнесе.',
          en: 'The key concept is distance: the "cap" of low sensitivity and why warmth is needed in business.',
          pl: 'Kluczowy koncept to odległość: „klosz" niskiej wrażliwości i po co ciepło jest potrzebne w biznesie.',
        },
        html: {
          ru:
            '<h2>Глава 3. Точка I. Чуткость</h2>' +
            '<p>Ключевой концепт точки I — расстояние: насколько близко человек пускает к себе другого, а насколько держит его на расстоянии. Человек с низкой чуткостью держит других на расстоянии; тёплый человек открывает душу и пускает близко. Помогает образ «колпака»: у человека с низкой чуткостью как бы есть колпак — его эмоции доходят только до колпака, и эмоции окружающих до него тоже не доходят, отражаются от колпака. Он не чувствует чужих эмоций, а другие не чувствуют его — поэтому его считают холодным. (Это не обязательно высокомерие; и начальник может держать на расстоянии подчинённого, и подчинённый — начальника.)</p>' +
            '<p>Есть идея, что личные дела надо оставлять дома. Отчасти она верна — незачем нагружать всех своими проблемами, — но на самом деле не очень реалистична. Если у вашего менеджера на работе мокрые глаза, спросить, в чём дело, стоит: человеку станет легче, ему будет приятно, что вы интересуетесь, а может, вы и поможете. А главное — вот зачем чуткость нужна в бизнесе. Представьте нового сотрудника: от него исходит эмоция страха и нерешительности, но он ничего не говорит (скромный, привык справляться сам). Если руководитель эту эмоцию почувствует (высокая чуткость), он спросит, в чём дело, поможет — объяснит, к кому обращаться, назначит наставника, — и карьера сотрудника пойдёт вверх. А если руководитель под «колпаком» и не почувствует, сотрудник будет пытаться справиться сам, наломает дров, ошибётся, кто-то на него наедет — и карьера пойдёт вниз. Мы ведь не компьютеры, в которые раз в неделю вставил штекер — и проверил, всё ли в порядке.</p>' +
            '<p>Человек с высокой чуткостью видит точки зрения других (он чувствует их эмоции), замечает чужие чувства и проявляет свои, естественно ориентирован на помощь и чувствует, когда вам нужна помощь. (Как-то поздно вечером я засиделся на работе и подумал, что хорошо бы выпить чаю, — и тут звонит мой секретарь: «Вам чай принести?» Через стену почувствовала. Приятно.) Такой человек ещё и тепло благодарит, даёт искренние подтверждения. Зачем это в бизнесе? Затем, что сотрудник проводит на работе большую часть жизни, и если тёплый по натуре человек не получает от начальника никакого отклика, у него возникает вопрос: «а нужен ли я здесь, благодарны ли мне?» — и он может уйти в другую компанию не за пятнадцать процентов прибавки, а за теплоту (ровно как жена может уйти от мужа или муж от жены). Денег людям недостаточно — нужно ещё и человеческое отношение; человек с высокой чуткостью даёт его естественно, а с низкой — просто не даёт.</p>' +
            '<h3>Компульсивная чуткость</h3>' +
            '<p>Отдельно — компульсивная чуткость. Очень высокая чуткость почти всегда сочетается с чем-то ещё: либо с низкой правильностью оценки («коврик для вытирания ног»), либо с низким общением («розовые очки») — и это огромная для человека проблема. Поэтому, едва вы на шаге о плюсах скажете такому человеку «ты очень любишь людей и любишь им помогать», у него станут мокрыми глаза, и он ответит: «да, но я от этого так страдаю» — и вы окажетесь уже на шаге о минусах. Удержаться на пике очень высокой чуткости не выйдет, человек сам вас туда стянет. Поэтому о компульсивной чуткости обычно говорят в самую последнюю очередь — это оптимальный переход к разговору о минусах.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка I',
              bp('Если чуткость низкая, руководителю стоит посоветовать: если вам нужна от сотрудника помощь — прямо скажите ему об этом, не ждите, что он сам догадается (он просто может не почувствовать, что помощь нужна, — и это не значит, что он плохой). И учтите, что о своих проблемах он может сам не рассказать: если сотрудник вдруг стал плохо работать и на вопрос отвечает «всё нормально», при низкой чуткости это ещё не значит, что всё нормально, — выясняйте как следует. Если же чуткость компульсивная, сотруднику повезло — он очень любит помогать, но, возможно, придётся прямо обозначить, что его собственные обязанности первичны, чтобы он не помогал всем подряд в ущерб своей работе.', true)),
          en:
            '<h2>Chapter 3. Point I. Sensitivity</h2>' +
            '<p>The key concept of point I is distance: how close a person lets another come to him, and how far he keeps him at a distance. A person with low sensitivity keeps others at a distance; a warm person opens his soul and lets people close. The image of the "cap" helps: a person with low sensitivity has, as it were, a cap — his emotions reach only as far as the cap, and the emotions of those around do not reach him either, but bounce off the cap. He does not feel others\' emotions, and others do not feel his — that is why he is considered cold. (This is not necessarily arrogance; a superior may keep a subordinate at a distance, and a subordinate — a superior.)</p>' +
            '<p>There is an idea that personal affairs should be left at home. In part it is right — there is no need to burden everyone with one\'s problems — but in reality it is not very realistic. If your manager has moist eyes at work, it is worth asking what the matter is: the person will feel better, he will be pleased that you take an interest, and perhaps you will even help. And the main thing — here is why sensitivity is needed in business. Imagine a new employee: an emotion of fear and indecision emanates from him, but he says nothing (modest, used to coping on his own). If the manager senses this emotion (high sensitivity), he will ask what the matter is, will help — explain whom to turn to, appoint a mentor — and the employee\'s career will go up. But if the manager is under a "cap" and does not sense it, the employee will try to cope on his own, will make a mess, will err, someone will come down on him — and his career will go down. We are not, after all, computers into which once a week you insert a plug — and check whether everything is in order.</p>' +
            '<p>A person with high sensitivity sees others\' points of view (he feels their emotions), notices others\' feelings and displays his own, is naturally oriented toward helping, and senses when you need help. (Once, late in the evening, I stayed on at work and thought it would be good to have some tea — and just then my secretary calls: "Shall I bring you tea?" She sensed it through the wall. Pleasant.) Such a person also thanks warmly, gives sincere acknowledgments. Why is this needed in business? Because an employee spends the greater part of his life at work, and if a person warm by nature receives no response from his superior, a question arises in him: "am I needed here, are they grateful to me?" — and he may leave for another company not for a fifteen-percent raise, but for warmth (exactly as a wife may leave her husband or a husband his wife). Money is not enough for people — a human attitude is needed too; a person with high sensitivity gives it naturally, while one with low sensitivity simply does not give it.</p>' +
            '<h3>Compulsive sensitivity</h3>' +
            '<p>Separately — compulsive sensitivity. A very high sensitivity is almost always combined with something else: either with a low correctness of evaluation (a "doormat") or with low communication ("rose-colored glasses") — and this is an enormous problem for the person. That is why, as soon as, in the pluses step, you tell such a person "you love people very much and love to help them," his eyes will grow moist, and he will answer: "yes, but I suffer so from it" — and you will find yourself already in the minuses step. To hold at the peak of very high sensitivity will not work, the person will drag you there himself. That is why compulsive sensitivity is usually spoken of last of all — it is the optimal transition to the conversation about minuses.</p>' +
            t('APPLICATION IN HIRING · Operating manual: point I',
              bp('If sensitivity is low, it is worth advising the manager: if you need help from the employee — tell him so directly, do not expect him to guess on his own (he may simply not sense that help is needed — and this does not mean he is bad). And bear in mind that he may not tell you about his problems himself: if an employee has suddenly begun to work badly and answers the question with "everything\'s fine," with low sensitivity this does not yet mean that everything is fine — find out properly. But if sensitivity is compulsive, the employee is fortunate — he very much loves to help, but it may be necessary to state directly that his own duties come first, so that he does not help everyone in a row to the detriment of his own work.', true)),
          pl:
            '<h2>Rozdział 3. Punkt I. Wrażliwość</h2>' +
            '<p>Kluczowy koncept punktu I to odległość: na ile blisko człowiek dopuszcza do siebie drugiego, a na ile trzyma go na dystans. Człowiek z niską wrażliwością trzyma innych na dystans; ciepły człowiek otwiera duszę i dopuszcza blisko. Pomaga obraz „klosza": człowiek z niską wrażliwością ma jakby klosz — jego emocje dochodzą tylko do klosza, i emocje otoczenia do niego też nie docierają, odbijają się od klosza. Nie czuje cudzych emocji, a inni nie czują jego — dlatego uważa się go za chłodnego. (To niekoniecznie wyniosłość; i przełożony może trzymać na dystans podwładnego, i podwładny — przełożonego.)</p>' +
            '<p>Jest idea, że sprawy osobiste trzeba zostawiać w domu. Po części jest słuszna — nie ma po co obarczać wszystkich swoimi problemami — ale w rzeczywistości nie jest zbyt realistyczna. Jeśli u waszego menedżera w pracy są mokre oczy, zapytać, o co chodzi, warto: człowiekowi zrobi się lżej, będzie mu przyjemnie, że się interesujecie, a może i pomożecie. A najważniejsze — oto po co wrażliwość jest potrzebna w biznesie. Wyobraźcie sobie nowego pracownika: emanuje z niego emocja strachu i niezdecydowania, ale nic nie mówi (skromny, przywykł radzić sobie sam). Jeśli kierownik tę emocję poczuje (wysoka wrażliwość), zapyta, o co chodzi, pomoże — objaśni, do kogo się zwracać, wyznaczy opiekuna — i kariera pracownika pójdzie w górę. A jeśli kierownik jest pod „kloszem" i nie poczuje, pracownik będzie próbował poradzić sobie sam, narobi bałaganu, pomyli się, ktoś na niego najedzie — i kariera pójdzie w dół. Nie jesteśmy przecież komputerami, w które raz w tygodniu wsadziłeś wtyczkę — i sprawdziłeś, czy wszystko w porządku.</p>' +
            '<p>Człowiek z wysoką wrażliwością widzi punkty widzenia innych (czuje ich emocje), zauważa cudze uczucia i okazuje swoje, jest naturalnie nastawiony na pomoc i czuje, kiedy potrzebujecie pomocy. (Kiedyś późnym wieczorem zasiedziałem się w pracy i pomyślałem, że dobrze byłoby wypić herbaty — i tu dzwoni mój sekretarz: „Przynieść panu herbatę?" Przez ścianę poczuła. Przyjemnie.) Taki człowiek jeszcze i ciepło dziękuje, daje szczere potwierdzenia. Po co to w biznesie? Po to, że pracownik spędza w pracy większą część życia, i jeśli ciepły z natury człowiek nie otrzymuje od przełożonego żadnego odzewu, pojawia się u niego pytanie: „a czy jestem tu potrzebny, czy są mi wdzięczni?" — i może odejść do innej firmy nie za piętnaście procent podwyżki, lecz za ciepło (dokładnie tak, jak żona może odejść od męża albo mąż od żony). Pieniędzy ludziom nie wystarcza — potrzebny jest jeszcze i ludzki stosunek; człowiek z wysoką wrażliwością daje go naturalnie, a z niską — po prostu nie daje.</p>' +
            '<h3>Kompulsywna wrażliwość</h3>' +
            '<p>Osobno — kompulsywna wrażliwość. Bardzo wysoka wrażliwość niemal zawsze łączy się z czymś jeszcze: albo z niską poprawnością oceny („wycieraczka do butów"), albo z niską komunikacją („różowe okulary") — i to jest dla człowieka ogromny problem. Dlatego ledwie w kroku o plusach powiecie takiemu człowiekowi „bardzo lubisz ludzi i lubisz im pomagać", staną mu się mokre oczy, i odpowie: „tak, ale ja od tego tak cierpię" — i znajdziecie się już w kroku o minusach. Utrzymać się na szczycie bardzo wysokiej wrażliwości się nie uda, człowiek sam was tam ściągnie. Dlatego o kompulsywnej wrażliwości zwykle mówi się na samym końcu — to optymalne przejście do rozmowy o minusach.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt I',
              bp('Jeśli wrażliwość jest niska, kierownikowi warto poradzić: jeśli potrzebujecie od pracownika pomocy — wprost mu o tym powiedzcie, nie oczekujcie, że sam się domyśli (może po prostu nie poczuć, że pomoc jest potrzebna — i to nie znaczy, że jest zły). I uwzględnijcie, że o swoich problemach może sam nie opowiedzieć: jeśli pracownik nagle zaczął źle pracować, a na pytanie odpowiada „wszystko w porządku", przy niskiej wrażliwości to jeszcze nie znaczy, że wszystko w porządku — wyjaśniajcie jak należy. Jeśli zaś wrażliwość jest kompulsywna, pracownikowi się poszczęściło — bardzo lubi pomagać, ale być może trzeba będzie wprost zaznaczyć, że jego własne obowiązki są pierwszorzędne, żeby nie pomagał wszystkim po kolei ze szkodą dla swojej pracy.', true)),
        },
      },

      // 5 — ТОЧКА J. ОБЩИТЕЛЬНОСТЬ
      {
        id: 'point-j',
        title: {
          ru: 'Точка J. Общительность (осторожно: название обманчиво)',
          en: 'Point J. Sociability (careful: the name is deceptive)',
          pl: 'Punkt J. Towarzyskość (uwaga: nazwa jest myląca)',
        },
        desc: {
          ru: 'Точка J показывает лишь «яркость» — насколько человеку легко начать поток, а не качество общения.',
          en: 'Point J shows only "vividness" — how easily a person can start a flow, not the quality of communication.',
          pl: 'Punkt J pokazuje jedynie „barwność" — na ile człowiekowi jest łatwo zacząć przepływ, a nie jakość komunikacji.',
        },
        html: {
          ru:
            '<h2>Глава 4. Точка J. Общительность (осторожно: название обманчиво)</h2>' +
            '<p>С точкой J связан очень важный момент: в отличие от всех остальных точек, её название не отражает того, что она показывает. Запомните это, чтобы не попасть впросак: низкая точка общения не означает, что человек плохо общается, а высокая не означает, что он общается хорошо. Назвать её «общением» было, пожалуй, ошибкой, но так уж сложилось исторически.</p>' +
            '<p>Ведь что такое настоящее общение? Это обмен идеями (или частицами) через пространство, продукт которого — понимание. И у общения множество составляющих: насколько хорошо человек доносит мысль, с каким намерением говорит, вкладывает ли в слова эмоции, умеет ли слушать, понимать, конфронтировать, хватает ли у него внимания. Всё это показывают самые разные точки: как человек понимает — правильность оценки; о чём он общается — точка D; с какой настойчивостью говорит — F; насколько внимательно — A; может ли вынести неприятное — ответственность. А точка J показывает лишь маленький и наименее важный элемент — «яркость»: насколько человеку легко и естественно начать поток, заговорить. Речь у одних яркая, у других серая и формальная — вот это и есть точка общения. Такой человек «бросается в глаза» и легко вступает в контакт. И ничего больше эта точка не показывает — иначе мы опустимся на дилетантскую ступеньку «думаю, что знаю».</p>' +
            '<p>С этим связано умение продвигать себя, что важно, например, для пиарщиков. И тут развеем миф: будто продвигать себя нескромно, а потому надо молчать. Это ложь. Продвигать себя и свою компанию можно скромно — на исходящем потоке, искренне интересуясь и своим продуктом, и человеком, которому продвигаешь. А молчаливость и застенчивость продуктивного человека выгодна лишь одним — тем, кто производит такой же продукт, только хуже.</p>' +
            '<h3>Как говорить о точке J в шаге о плюсах</h3>' +
            '<p>Если общение ниже минус пятидесяти — понимающе молчим: это больная область (обычно человека когда-то подавили, сделали ему больно, когда он говорил), и трогать её на этом шаге не нужно, иначе сразу окажетесь на разговоре о минусах. Около нуля можно сказать «ты скромный, не пиаришь» (в нашем обществе это считается плюсом). Особый и очень сильный случай — низкое общение при высокой правильности оценки: такой человек понимает быстро, а окружающие думают, что он ещё не понял, и повторяют ему одно и то же (просто его никто не научил давать подтверждение) — сказав ему это, вы его поразите. Если общение высокое (от тридцати) — говорите о плюсах: «у тебя естественное общение, ты легко вступаешь в контакт»; а пока оно не компульсивное, можно добавить «ты можешь и не продвигать себя, если не захочешь» и, если правильность оценки хорошая, «ты можешь и говорить, и слушать». Компульсивное общение — это когда «сломался регулятор мощности»: человек слишком много говорит и не умеет гармонично чередовать речь и слушание (либо говорит без остановки, либо выключается и молчит); на шаге о плюсах здесь просто перечисляют плюсы высокого общения.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка J',
              bp('Если общение низкое, руководителю стоит учесть, что сотрудник сам, скорее всего, не расскажет ни о своих достижениях (скромный), ни о своих проблемах (заговорить неловко), — поэтому спрашивайте. А если у него при этом хорошая правильность оценки, то, прежде чем что-то ему повторять, спросите, понял ли он, — иначе будете повторять тому, кто давно понял. Новому сотруднику с низким общением больше подойдёт работа, где нужно поддерживать уже существующие отношения, а не вступать в контакт первым. Но ни в коем случае не делайте вывод, будто при низком общении человек «двух слов связать не может»: он вполне может быть отличным продавцом — ему просто легче поддерживать связи, чем знакомиться первым.', true)),
          en:
            '<h2>Chapter 4. Point J. Sociability (careful: the name is deceptive)</h2>' +
            '<p>Connected with point J is a very important matter: unlike all the other points, its name does not reflect what it shows. Remember this so as not to come a cropper: a low communication point does not mean that a person communicates badly, and a high one does not mean that he communicates well. To call it "communication" was, perhaps, a mistake, but that is how it came about historically.</p>' +
            '<p>For what is real communication? It is an exchange of ideas (or particles) across space, the product of which is understanding. And communication has a multitude of components: how well a person conveys a thought, with what intention he speaks, whether he puts emotion into his words, whether he can listen, understand, confront, whether he has enough attention. All of this is shown by the most varied points: how a person understands — correctness of evaluation; what he communicates about — point D; with what persistence he speaks — F; how attentively — A; whether he can bear the unpleasant — responsibility. But point J shows only a small and least important element — "vividness": how easy and natural it is for a person to start a flow, to strike up a conversation. Some people\'s speech is vivid, others\' is grey and formal — this is what the communication point is. Such a person "catches the eye" and easily makes contact. And this point shows nothing more — otherwise we will descend to the dilettante\'s rung "I think I know."</p>' +
            '<p>Connected with this is the ability to promote oneself, which is important, for example, for PR people. And here let us dispel a myth: as if promoting oneself is immodest, and therefore one should keep silent. This is false. One can promote oneself and one\'s company modestly — on the outflow, sincerely interested both in one\'s product and in the person to whom one is promoting. And the silence and shyness of a productive person are advantageous to only one sort of people — those who produce the same product, only worse.</p>' +
            '<h3>How to speak about point J in the pluses step</h3>' +
            '<p>If communication is below minus fifty — we keep an understanding silence: this is a sore area (usually the person was at some point suppressed, was hurt when he spoke), and there is no need to touch it in this step, or you will at once find yourself in the conversation about minuses. Around zero one can say "you\'re modest, you don\'t self-promote" (in our society this is considered a plus). A special and very strong case is low communication with a high correctness of evaluation: such a person understands quickly, while those around think he has not yet understood and repeat the same thing to him (it is simply that no one taught him to give acknowledgment) — by telling him this, you will amaze him. If communication is high (from thirty) — speak of the pluses: "you have natural communication, you make contact easily"; and as long as it is not compulsive, one can add "you can also not promote yourself, if you don\'t want to," and, if the correctness of evaluation is good, "you can both speak and listen." Compulsive communication is when "the power regulator has broken": the person talks too much and cannot harmoniously alternate speaking and listening (either he talks nonstop, or he switches off and stays silent); in the pluses step one simply lists here the pluses of high communication.</p>' +
            t('APPLICATION IN HIRING · Operating manual: point J',
              bp('If communication is low, the manager should take into account that the employee himself most likely will not tell you either about his achievements (modest) or about his problems (awkward to speak up) — so ask. And if he has a good correctness of evaluation at that, then before repeating something to him, ask whether he has understood — otherwise you will be repeating to someone who understood long ago. For a new employee with low communication, work is more suitable where one needs to maintain already-existing relations, rather than to make contact first. But under no circumstances conclude that with low communication a person "can\'t string two words together": he may well be an excellent salesperson — it is simply easier for him to maintain connections than to be the first to get acquainted.', true)),
          pl:
            '<h2>Rozdział 4. Punkt J. Towarzyskość (uwaga: nazwa jest myląca)</h2>' +
            '<p>Z punktem J związany jest bardzo ważny moment: w odróżnieniu od wszystkich pozostałych punktów jego nazwa nie odzwierciedla tego, co pokazuje. Zapamiętajcie to, żeby nie dać się nabrać: niski punkt komunikacji nie oznacza, że człowiek źle się komunikuje, a wysoki nie oznacza, że komunikuje się dobrze. Nazwać go „komunikacją" było, bodaj, błędem, ale tak już ułożyło się historycznie.</p>' +
            '<p>Bo czym jest prawdziwa komunikacja? To wymiana idei (albo cząstek) przez przestrzeń, której produktem jest zrozumienie. A komunikacja ma mnóstwo składowych: na ile dobrze człowiek przekazuje myśl, z jakim zamiarem mówi, czy wkłada w słowa emocje, czy umie słuchać, rozumieć, konfrontować, czy starcza mu uwagi. Wszystko to pokazują najróżniejsze punkty: jak człowiek rozumie — poprawność oceny; o czym się komunikuje — punkt D; z jaką wytrwałością mówi — F; na ile uważnie — A; czy potrafi znieść nieprzyjemne — odpowiedzialność. A punkt J pokazuje jedynie mały i najmniej ważny element — „barwność": na ile człowiekowi jest łatwo i naturalnie zacząć przepływ, zagadać. Mowa u jednych jest barwna, u innych szara i formalna — otóż to i jest punkt komunikacji. Taki człowiek „rzuca się w oczy" i łatwo wchodzi w kontakt. I niczego więcej ten punkt nie pokazuje — inaczej opuścimy się na dyletancki szczebel „myślę, że wiem".</p>' +
            '<p>Z tym związana jest umiejętność promowania siebie, co jest ważne na przykład dla piarowców. I tu rozwiejmy mit: jakoby promować siebie jest nieskromnie, a przez to trzeba milczeć. To fałsz. Promować siebie i swoją firmę można skromnie — na przepływie wychodzącym, szczerze interesując się i swoim produktem, i człowiekiem, któremu się promuje. A milkliwość i nieśmiałość produktywnego człowieka jest na rękę tylko jednym — tym, którzy wytwarzają taki sam produkt, tylko gorszy.</p>' +
            '<h3>Jak mówić o punkcie J w kroku o plusach</h3>' +
            '<p>Jeśli komunikacja jest poniżej minus pięćdziesięciu — milczymy ze zrozumieniem: to bolesny obszar (zwykle człowieka kiedyś stłumiono, sprawiono mu ból, gdy mówił), i ruszać go w tym kroku nie trzeba, inaczej od razu znajdziecie się w rozmowie o minusach. Około zera można powiedzieć „jesteś skromny, nie robisz sobie PR-u" (w naszym społeczeństwie uważa się to za plus). Szczególny i bardzo silny przypadek to niska komunikacja przy wysokiej poprawności oceny: taki człowiek rozumie szybko, a otoczenie myśli, że jeszcze nie zrozumiał, i powtarza mu jedno i to samo (po prostu nikt go nie nauczył dawać potwierdzenia) — mówiąc mu to, poruszycie go. Jeśli komunikacja jest wysoka (od trzydziestu) — mówcie o plusach: „masz naturalną komunikację, łatwo wchodzisz w kontakt"; a póki nie jest kompulsywna, można dodać „możesz i nie promować siebie, jeśli nie zechcesz" i, jeśli poprawność oceny jest dobra, „możesz i mówić, i słuchać". Kompulsywna komunikacja to gdy „zepsuł się regulator mocy": człowiek za dużo mówi i nie umie harmonijnie przeplatać mówienia i słuchania (albo mówi bez zatrzymania, albo wyłącza się i milczy); w kroku o plusach po prostu wylicza się tu plusy wysokiej komunikacji.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt J',
              bp('Jeśli komunikacja jest niska, kierownikowi warto uwzględnić, że pracownik sam najprawdopodobniej nie opowie ani o swoich osiągnięciach (skromny), ani o swoich problemach (zagadać niezręcznie) — dlatego pytajcie. A jeśli ma przy tym dobrą poprawność oceny, to zanim coś mu powtórzycie, zapytajcie, czy zrozumiał — inaczej będziecie powtarzać temu, kto dawno zrozumiał. Nowemu pracownikowi z niską komunikacją bardziej pasuje praca, gdzie trzeba podtrzymywać już istniejące relacje, a nie wchodzić w kontakt jako pierwszy. Ale w żadnym razie nie wyciągajcie wniosku, jakoby przy niskiej komunikacji człowiek „dwóch słów nie potrafi sklecić": może być doskonałym sprzedawcą — po prostu łatwiej mu podtrzymywać kontakty niż poznawać się jako pierwszy.', true)),
        },
      },

      // 6 — ПОДТВЕРЖДЕНИЕ
      {
        id: 'acknowledgement',
        title: {
          ru: 'Подтверждение — навык, снимающий половину конфликтов',
          en: 'Acknowledgment — the skill that removes half of conflicts',
          pl: 'Potwierdzenie — umiejętność, która usuwa połowę konfliktów',
        },
        desc: {
          ru: 'Продукт общения — понимание; подтверждение показывает, что мысль дошла, и снимает половину конфликтов.',
          en: 'The product of communication is understanding; acknowledgment shows that the thought got through and removes half of conflicts.',
          pl: 'Produktem komunikacji jest zrozumienie; potwierdzenie pokazuje, że myśl dotarła, i usuwa połowę konfliktów.',
        },
        html: {
          ru:
            '<h2>Глава 5. Подтверждение — навык, снимающий половину конфликтов</h2>' +
            '<p>Раз продукт общения — это понимание, то у собеседника должен быть способ показать, что он понял. Этот сигнал называется подтверждением: «я понял», «хорошо», «окей». Вещь эта безумно важная. Когда человек даёт подтверждение, для говорящего это знак, что цель достигнута, — он удовлетворённо замолкает и готов теперь слушать в ответ. А если подтверждения нет, у говорящего по-прежнему есть намерение донести свою мысль, и он продолжает её «пихать», а собеседник в это время пихает свою — возникает конфликт. По моей оценке, процентов пятьдесят конфликтов не было бы, если бы люди умели давать друг другу подтверждение.</p>' +
            '<p>Но есть тонкость: если ты на самом деле не понял, подтверждение давать нельзя — это обман, и так теряется доверие. Вместо этого надо спросить: «что ты имеешь в виду?» Представьте, что коллега бросает вам что-то провокационное, с чем вы категорически не согласны. Первый порыв — резко ответить. Но поняли ли вы вообще идею, которую он пытался передать? Слова — это лишь форма, а идею вы, возможно, не уловили. Спросите «что ты имеешь в виду?», выслушайте — и, когда действительно поймёте (а «понял» вовсе не значит «согласен»), дайте подтверждение: «я тебя понял». В этот момент собеседник успокаивается и становится готов выслушать уже вас — и вместо ссоры получается разговор. Так же и дома: на «я устал(а)» лучше не отвечать претензией, а спросить «что случилось?» — и напряжение начинает рассасываться. Это и есть подтверждение.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Подтверждение — это ещё и способ мягко остановить поток в свою сторону, не обидев человека. Когда вы научитесь правильно предоставлять оценки, вы поразитесь, какой поток польётся на вас: человек наконец увидит перед собой друга, который его понимает, и начнёт изливать душу. Сказать «замолчи» нельзя — это всё равно что плюнуть в открытую душу; но и слушать часами вы не можете. Поэтому, дождавшись, когда мысль действительно закончена, скажите «я полностью тебя понял» — и вы мягко, не обижая, вернёте себе управление беседой.', true)) +
            '<p>На этом мы завершаем разбор всех десяти точек. Дальше нас ждёт демонстрация полной оценки от начала до конца, а затем — шаги о минусах и о том, что с ними делать (шаги 3 и 4).</p>',
          en:
            '<h2>Chapter 5. Acknowledgment — the skill that removes half of conflicts</h2>' +
            '<p>Since the product of communication is understanding, the interlocutor must have a way to show that he has understood. This signal is called acknowledgment: "I understand," "good," "okay." This thing is insanely important. When a person gives acknowledgment, for the speaker this is a sign that the goal has been achieved — he falls silent, satisfied, and is now ready to listen in turn. But if there is no acknowledgment, the speaker still has the intention of conveying his thought, and he keeps "pushing" it, while the interlocutor at the same time is pushing his own — a conflict arises. By my estimate, some fifty percent of conflicts would not occur if people knew how to give one another acknowledgment.</p>' +
            '<p>But there is a subtlety: if you actually did not understand, you must not give acknowledgment — it is a deception, and thus trust is lost. Instead, one must ask: "what do you mean?" Imagine that a colleague throws something provocative at you, with which you categorically disagree. The first impulse is to answer sharply. But did you even understand the idea he was trying to convey? Words are merely the form, and the idea you may not have caught. Ask "what do you mean?", hear it out — and when you really understand (and "I understand" does not at all mean "I agree"), give acknowledgment: "I understand you." At that moment the interlocutor calms down and becomes ready to hear you out — and instead of a quarrel you get a conversation. It is the same at home too: to "I\'m tired" it is better not to respond with a grievance, but to ask "what happened?" — and the tension begins to dissolve. This is what acknowledgment is.</p>' +
            k('KEY IDEA',
              bp('Acknowledgment is also a way to gently stop the flow in your direction without offending the person. When you learn to deliver assessments correctly, you will be amazed at what a flow will pour onto you: the person will finally see before him a friend who understands him, and will begin to pour out his soul. To say "be quiet" is not allowed — it is like spitting into an open soul; but you cannot listen for hours either. That is why, having waited until the thought is really finished, say "I\'ve understood you fully" — and gently, without offending, you will regain control of the conversation.', true)) +
            '<p>With this we conclude the examination of all ten points. Next awaits us a demonstration of a full assessment from beginning to end, and then — the steps about minuses and about what to do with them (steps 3 and 4).</p>',
          pl:
            '<h2>Rozdział 5. Potwierdzenie — umiejętność, która usuwa połowę konfliktów</h2>' +
            '<p>Skoro produktem komunikacji jest zrozumienie, to rozmówca musi mieć sposób, żeby pokazać, że zrozumiał. Ten sygnał nazywa się potwierdzeniem: „zrozumiałem", „dobrze", „okej". Rzecz to szalenie ważna. Gdy człowiek daje potwierdzenie, dla mówiącego jest to znak, że cel został osiągnięty — z zadowoleniem milknie i jest gotów teraz słuchać w odpowiedzi. A jeśli potwierdzenia nie ma, mówiący nadal ma zamiar przekazać swoją myśl i dalej ją „wpycha", a rozmówca w tym czasie wpycha swoją — powstaje konflikt. Według mojej oceny jakichś pięćdziesiąt procent konfliktów by nie było, gdyby ludzie umieli dawać sobie nawzajem potwierdzenie.</p>' +
            '<p>Ale jest subtelność: jeśli naprawdę nie zrozumiałeś, potwierdzenia dawać nie wolno — to oszustwo, i tak traci się zaufanie. Zamiast tego trzeba zapytać: „co masz na myśli?" Wyobraźcie sobie, że kolega rzuca wam coś prowokacyjnego, z czym kategorycznie się nie zgadzacie. Pierwszy odruch — ostro odpowiedzieć. Ale czy w ogóle zrozumieliście ideę, którą próbował przekazać? Słowa to jedynie forma, a idei może nie uchwyciliście. Zapytajcie „co masz na myśli?", wysłuchajcie — i gdy naprawdę zrozumiecie (a „zrozumiałem" wcale nie znaczy „zgadzam się"), dajcie potwierdzenie: „zrozumiałem cię". W tym momencie rozmówca się uspokaja i staje się gotów wysłuchać już was — i zamiast kłótni wychodzi rozmowa. Tak samo i w domu: na „jestem zmęczony(a)" lepiej nie odpowiadać pretensją, lecz zapytać „co się stało?" — i napięcie zaczyna się rozładowywać. To i jest potwierdzenie.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Potwierdzenie to jeszcze i sposób, żeby łagodnie zatrzymać przepływ w swoją stronę, nie urażając człowieka. Gdy nauczycie się prawidłowo przekazywać oceny, zdumiejecie się, jaki przepływ na was popłynie: człowiek nareszcie zobaczy przed sobą przyjaciela, który go rozumie, i zacznie wylewać duszę. Powiedzieć „zamilcz" nie wolno — to tak, jakby napluć w otwartą duszę; ale i słuchać godzinami nie możecie. Dlatego, doczekawszy, aż myśl naprawdę zostanie zakończona, powiedzcie „w pełni cię zrozumiałem" — i łagodnie, nie urażając, odzyskacie kontrolę nad rozmową.', true)) +
            '<p>Na tym kończymy omawianie wszystkich dziesięciu punktów. Dalej czeka nas demonstracja pełnej oceny od początku do końca, a następnie — kroki o minusach i o tym, co z nimi robić (kroki 3 i 4).</p>',
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Ключевой концепт точки H (объективность / правильность оценки) — это:',
            en: 'The key concept of point H (objectivity / correctness of evaluation) is:',
            pl: 'Kluczowy koncept punktu H (obiektywność / poprawność oceny) to:',
          },
          opts: [
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'расстояние до людей',
              en: 'distance to people',
              pl: 'dystans do ludzi',
            },
            {
              ru: 'согласие — стремление найти что-то правильное, с чем человек согласен',
              en: 'agreement — the drive to find something correct that the person agrees with',
              pl: 'zgoda — dążenie do znalezienia czegoś słusznego, z czym człowiek się zgadza',
            },
            {
              ru: 'прямота',
              en: 'directness',
              pl: 'bezpośredniość',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Человек с высокой правильностью оценки:',
            en: 'A person with high correctness of evaluation:',
            pl: 'Człowiek z wysoką poprawnością oceny:',
          },
          opts: [
            {
              ru: 'смотрит в основном на минусы',
              en: 'looks mainly at the minuses',
              pl: 'patrzy głównie na minusy',
            },
            {
              ru: 'концентрирует внимание на плюсах, стремится к согласию — и его принимают за друга',
              en: 'concentrates attention on the pluses, strives for agreement — and is taken for a friend',
              pl: 'koncentruje uwagę na plusach, dąży do zgody — i bierze się go za przyjaciela',
            },
            {
              ru: 'всегда наивен',
              en: 'is always naive',
              pl: 'jest zawsze naiwny',
            },
            {
              ru: 'плохо ладит с людьми',
              en: 'gets along badly with people',
              pl: 'źle dogaduje się z ludźmi',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Где лучше работать человеку с низкой правильностью оценки?',
            en: 'Where is it better for a person with low correctness of evaluation to work?',
            pl: 'Gdzie lepiej pracować człowiekowi z niską poprawnością oceny?',
          },
          opts: [
            {
              ru: 'только с людьми',
              en: 'only with people',
              pl: 'tylko z ludźmi',
            },
            {
              ru: 'руководителем большого коллектива',
              en: 'as head of a large team',
              pl: 'jako kierownik dużego zespołu',
            },
            {
              ru: 'переговорщиком',
              en: 'as a negotiator',
              pl: 'jako negocjator',
            },
            {
              ru: 'с техникой и документами (техника от нахождения минусов улучшается, а люди — портятся)',
              en: 'with technology and documents (technology improves from finding minuses, whereas people deteriorate)',
              pl: 'z techniką i dokumentami (technika od znajdowania minusów się poprawia, a ludzie — psują)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Какой закон подтверждает поведение точки H?',
            en: 'Which law confirms the behavior of point H?',
            pl: 'Które prawo potwierdza zachowanie punktu H?',
          },
          opts: [
            {
              ru: '«вы получаете то, что продолжительно награждаете» (внимание к плюсам даёт плюсы, к минусам — минусы)',
              en: '"you get what you reward over time" (attention to pluses gives pluses, to minuses — minuses)',
              pl: '„dostajesz to, co długotrwale nagradzasz" (uwaga na plusy daje plusy, na minusy — minusy)',
            },
            {
              ru: '«производство — основа боевого духа»',
              en: '"production is the basis of morale"',
              pl: '„produkcja jest podstawą morale"',
            },
            {
              ru: '«путь из — это путь через»',
              en: '"the way out is the way through"',
              pl: '„droga wyjścia to droga przez"',
            },
            {
              ru: '«обмен создаёт пространство»',
              en: '"exchange creates space"',
              pl: '„wymiana tworzy przestrzeń"',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'В чём человек с высокой правильностью оценки НЕ наивен?',
            en: 'In what is a person with high correctness of evaluation NOT naive?',
            pl: 'W czym człowiek z wysoką poprawnością oceny NIE jest naiwny?',
          },
          opts: [
            {
              ru: 'он вообще не видит минусов',
              en: 'he does not see minuses at all',
              pl: 'w ogóle nie widzi minusów',
            },
            {
              ru: 'он всем подряд доверяет',
              en: 'he trusts everyone indiscriminately',
              pl: 'ufa wszystkim bez wyjątku',
            },
            {
              ru: 'он понимает: с людьми надо искать плюсы, а с техникой и документами — минусы',
              en: 'he understands: with people you must look for pluses, and with technology and documents — minuses',
              pl: 'rozumie: z ludźmi trzeba szukać plusów, a z techniką i dokumentami — minusów',
            },
            {
              ru: 'он не умеет благодарить',
              en: 'he is unable to give thanks',
              pl: 'nie umie dziękować',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'В чём силён человек с высокой H, а в чём — с высокой B?',
            en: 'In what is a person with high H strong, and in what — with high B?',
            pl: 'W czym jest silny człowiek z wysokim H, a w czym — z wysokim B?',
          },
          opts: [
            {
              ru: 'H — в стратегии, B — в тактике',
              en: 'H — in strategy, B — in tactics',
              pl: 'H — w strategii, B — w taktyce',
            },
            {
              ru: 'H силён в тактике с людьми, B — в стратегии (видит всю картину)',
              en: 'H is strong in tactics with people, B — in strategy (sees the whole picture)',
              pl: 'H jest silny w taktyce z ludźmi, B — w strategii (widzi cały obraz)',
            },
            {
              ru: 'оба сильны только в стратегии',
              en: 'both are strong only in strategy',
              pl: 'oba są silne tylko w strategii',
            },
            {
              ru: 'это никак не связано с точками',
              en: 'this is not connected with the points at all',
              pl: 'to nie ma nic wspólnego z punktami',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое приём «ассист»?',
            en: 'What is the technique of the "assist"?',
            pl: 'Czym jest technika „asysty"?',
          },
          opts: [
            {
              ru: 'способ надавить на человека',
              en: 'a way to press on a person',
              pl: 'sposób na naciśnięcie człowieka',
            },
            {
              ru: 'финансовая помощь сотруднику',
              en: 'financial help to an employee',
              pl: 'pomoc finansowa dla pracownika',
            },
            {
              ru: 'список его минусов',
              en: 'a list of his minuses',
              pl: 'lista jego minusów',
            },
            {
              ru: 'ориентация человека в окружении — простые задания, вытаскивающие внимание наружу (вверх по шкале тонов)',
              en: 'orienting a person in his surroundings — simple tasks that draw attention outward (up the tone scale)',
              pl: 'zorientowanie człowieka w otoczeniu — proste zadania wyciągające uwagę na zewnątrz (w górę skali tonów)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Правило удержания собственного банка при давлении на другого:',
            en: 'The rule for holding your own bank while pressing on another:',
            pl: 'Reguła utrzymania własnego banku przy naciskaniu na drugiego:',
          },
          opts: [
            {
              ru: 'давить нужно ровно до тех пор, пока его банк чуть-чуть не отодвинется, и на этом остановиться',
              en: 'you must press exactly until his bank moves back a little, and stop at that',
              pl: 'naciskać należy dokładnie dopóki jego bank trochę się nie cofnie, i na tym się zatrzymać',
            },
            {
              ru: 'давить как можно дольше',
              en: 'press as long as possible',
              pl: 'naciskać jak najdłużej',
            },
            {
              ru: 'никогда не останавливаться',
              en: 'never stop',
              pl: 'nigdy się nie zatrzymywać',
            },
            {
              ru: 'вообще не давить',
              en: 'not press at all',
              pl: 'wcale nie naciskać',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Чему учит байка о Хаббарде на палубе?',
            en: 'What does the anecdote about Hubbard on deck teach?',
            pl: 'Czego uczy anegdota o Hubbardzie na pokładzie?',
          },
          opts: [
            {
              ru: 'что нельзя кричать на людей',
              en: 'that you must not shout at people',
              pl: 'że nie wolno krzyczeć na ludzi',
            },
            {
              ru: 'что надо всегда молчать',
              en: 'that you should always keep silent',
              pl: 'że trzeba zawsze milczeć',
            },
            {
              ru: 'полному контролю над собственным банком: кричать тогда, когда это адекватно, и не кричать на тех, на кого не надо',
              en: 'full control over your own bank: to shout when it is appropriate, and not to shout at those you should not',
              pl: 'pełnej kontroli nad własnym bankiem: krzyczeć wtedy, gdy jest to adekwatne, i nie krzyczeć na tych, na których nie trzeba',
            },
            {
              ru: 'что критика бесполезна',
              en: 'that criticism is useless',
              pl: 'że krytyka jest bezużyteczna',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Ключевой концепт точки I (чуткость) — это:',
            en: 'The key concept of point I (sensitivity) is:',
            pl: 'Kluczowy koncept punktu I (wrażliwość) to:',
          },
          opts: [
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'расстояние — насколько близко человек пускает к себе другого',
              en: 'distance — how close a person lets another come to him',
              pl: 'dystans — jak blisko człowiek dopuszcza do siebie drugiego',
            },
            {
              ru: 'согласие',
              en: 'agreement',
              pl: 'zgoda',
            },
            {
              ru: 'прямота',
              en: 'directness',
              pl: 'bezpośredniość',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Образ «колпака» описывает человека с:',
            en: 'The image of the "cap" describes a person with:',
            pl: 'Obraz „klosza" opisuje człowieka z:',
          },
          opts: [
            {
              ru: 'высокой чуткостью',
              en: 'high sensitivity',
              pl: 'wysoką wrażliwością',
            },
            {
              ru: 'высокой активностью',
              en: 'high activity',
              pl: 'wysoką aktywnością',
            },
            {
              ru: 'высокой D',
              en: 'high D',
              pl: 'wysokim D',
            },
            {
              ru: 'низкой чуткостью — эмоции доходят только до «колпака», чужие от него отражаются, поэтому его считают холодным',
              en: 'low sensitivity — emotions reach only as far as the "cap", others\' emotions bounce off it, so he is considered cold',
              pl: 'niską wrażliwością — emocje docierają tylko do „klosza", cudze się od niego odbijają, dlatego uważa się go za chłodnego',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Зачем чуткость нужна в бизнесе?',
            en: 'Why is sensitivity needed in business?',
            pl: 'Po co wrażliwość jest potrzebna w biznesie?',
          },
          opts: [
            {
              ru: 'сотрудник проводит на работе бóльшую часть жизни; без человеческого отношения тёплый человек уходит не за 15% прибавки, а за теплоту',
              en: 'an employee spends most of his life at work; without a human attitude a warm person leaves not for a 15% raise, but for warmth',
              pl: 'pracownik spędza w pracy większość życia; bez ludzkiego stosunku ciepły człowiek odchodzi nie za 15% podwyżki, lecz za ciepło',
            },
            {
              ru: 'чтобы давать больше скидок',
              en: 'to give more discounts',
              pl: 'żeby dawać więcej rabatów',
            },
            {
              ru: 'чтобы никого не нанимать',
              en: 'so as not to hire anyone',
              pl: 'żeby nikogo nie zatrudniać',
            },
            {
              ru: 'чуткость в бизнесе не нужна вовсе',
              en: 'sensitivity is not needed in business at all',
              pl: 'wrażliwość w biznesie w ogóle nie jest potrzebna',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Компульсивная чуткость проявляется так, что человек:',
            en: 'Compulsive sensitivity manifests such that the person:',
            pl: 'Kompulsywna wrażliwość przejawia się tak, że człowiek:',
          },
          opts: [
            {
              ru: 'всегда отказывает в помощи',
              en: 'always refuses help',
              pl: 'zawsze odmawia pomocy',
            },
            {
              ru: 'не замечает чужих эмоций',
              en: 'does not notice others\' emotions',
              pl: 'nie zauważa cudzych emocji',
            },
            {
              ru: 'на просьбу о помощи говорит «да», даже отложив собственную работу; такого опасно ставить на ресепшен',
              en: 'says "yes" to a request for help, even setting aside his own work; it is dangerous to put such a person at reception',
              pl: 'na prośbę o pomoc mówi „tak", nawet odkładając własną pracę; takiego niebezpiecznie stawiać na recepcji',
            },
            {
              ru: 'холоден и закрыт',
              en: 'is cold and closed',
              pl: 'jest chłodny i zamknięty',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Почему о компульсивной чуткости говорят в самую последнюю очередь?',
            en: 'Why is compulsive sensitivity spoken of at the very last?',
            pl: 'Dlaczego o kompulsywnej wrażliwości mówi się na samym końcu?',
          },
          opts: [
            {
              ru: 'потому что это неважно',
              en: 'because it is unimportant',
              pl: 'ponieważ to nieważne',
            },
            {
              ru: 'потому что удержаться на её «пике» не выйдет — человек сам стянет вас в разговор о минусах (это оптимальный переход к минусам)',
              en: 'because you cannot hold at its "peak" — the person himself will pull you into a conversation about minuses (this is the optimal transition to minuses)',
              pl: 'ponieważ nie da się utrzymać na jej „szczycie" — człowiek sam wciągnie was w rozmowę o minusach (to optymalne przejście do minusów)',
            },
            {
              ru: 'потому что её нельзя измерить',
              en: 'because it cannot be measured',
              pl: 'ponieważ nie da się jej zmierzyć',
            },
            {
              ru: 'потому что это чистый плюс',
              en: 'because it is a pure plus',
              pl: 'ponieważ to czysty plus',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что важно помнить про название точки J (общительность)?',
            en: 'What is important to remember about the name of point J (sociability)?',
            pl: 'Co ważne pamiętać o nazwie punktu J (towarzyskość)?',
          },
          opts: [
            {
              ru: 'оно точно отражает суть',
              en: 'it accurately reflects the essence',
              pl: 'dokładnie odzwierciedla istotę',
            },
            {
              ru: 'низкое J означает, что человек плохо общается',
              en: 'a low J means the person communicates badly',
              pl: 'niskie J oznacza, że człowiek źle się komunikuje',
            },
            {
              ru: 'высокое J означает, что человек общается хорошо',
              en: 'a high J means the person communicates well',
              pl: 'wysokie J oznacza, że człowiek dobrze się komunikuje',
            },
            {
              ru: 'название обманчиво: низкое J НЕ означает, что человек плохо общается',
              en: 'the name is deceptive: a low J does NOT mean the person communicates badly',
              pl: 'nazwa jest myląca: niskie J NIE oznacza, że człowiek źle się komunikuje',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что на самом деле показывает точка J?',
            en: 'What does point J actually show?',
            pl: 'Co tak naprawdę pokazuje punkt J?',
          },
          opts: [
            {
              ru: '«яркость» — насколько человеку легко и естественно начать поток, заговорить, «броситься в глаза»',
              en: '"vividness" — how easily and naturally a person can start a flow, speak up, "catch the eye"',
              pl: '„barwność" — jak łatwo i naturalnie człowiek może zacząć przepływ, odezwać się, „rzucić się w oczy"',
            },
            {
              ru: 'насколько хорошо человек понимает',
              en: 'how well a person understands',
              pl: 'jak dobrze człowiek rozumie',
            },
            {
              ru: 'с какой настойчивостью он говорит',
              en: 'with what persistence he speaks',
              pl: 'z jaką wytrwałością mówi',
            },
            {
              ru: 'насколько внимательно он слушает',
              en: 'how attentively he listens',
              pl: 'jak uważnie słucha',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Настоящее общение состоит из многих составляющих. Что из них показывает именно точка J?',
            en: 'Real communication consists of many components. Which of them does point J specifically show?',
            pl: 'Prawdziwa komunikacja składa się z wielu elementów. Który z nich pokazuje właśnie punkt J?',
          },
          opts: [
            {
              ru: 'как человек понимает (это H)',
              en: 'how a person understands (that is H)',
              pl: 'jak człowiek rozumie (to H)',
            },
            {
              ru: 'может ли вынести неприятное (это G)',
              en: 'whether he can bear the unpleasant (that is G)',
              pl: 'czy potrafi znieść nieprzyjemne (to G)',
            },
            {
              ru: 'лишь маленький и наименее важный элемент — «яркость» начала общения',
              en: 'only a small and least important element — the "vividness" of the start of communication',
              pl: 'jedynie mały i najmniej ważny element — „barwność" początku komunikacji',
            },
            {
              ru: 'о чём человек общается (это D)',
              en: 'what a person communicates about (that is D)',
              pl: 'o czym człowiek się komunikuje (to D)',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Правда ли, что продвигать себя нескромно и потому надо молчать?',
            en: 'Is it true that promoting yourself is immodest and therefore one should keep silent?',
            pl: 'Czy to prawda, że promowanie siebie jest nieskromne i dlatego trzeba milczeć?',
          },
          opts: [
            {
              ru: 'да, это всегда нескромно',
              en: 'yes, it is always immodest',
              pl: 'tak, to zawsze nieskromne',
            },
            {
              ru: 'нет: продвигать себя и компанию можно скромно — на исходящем потоке, искренне интересуясь продуктом и человеком',
              en: 'no: you can promote yourself and the company modestly — on the outgoing flow, sincerely interested in the product and the person',
              pl: 'nie: siebie i firmę można promować skromnie — na przepływie wychodzącym, szczerze interesując się produktem i człowiekiem',
            },
            {
              ru: 'да, молчание всегда выгодно',
              en: 'yes, silence is always advantageous',
              pl: 'tak, milczenie jest zawsze korzystne',
            },
            {
              ru: 'да, для продуктивных людей',
              en: 'yes, for productive people',
              pl: 'tak, dla produktywnych ludzi',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кому выгодны молчаливость и застенчивость продуктивного человека?',
            en: 'Who benefits from the silence and shyness of a productive person?',
            pl: 'Komu na rękę milczenie i nieśmiałość produktywnego człowieka?',
          },
          opts: [
            {
              ru: 'ему самому',
              en: 'to himself',
              pl: 'jemu samemu',
            },
            {
              ru: 'его клиентам',
              en: 'to his clients',
              pl: 'jego klientom',
            },
            {
              ru: 'его компании',
              en: 'to his company',
              pl: 'jego firmie',
            },
            {
              ru: 'тем, кто производит такой же продукт, только хуже',
              en: 'to those who produce the same product, only worse',
              pl: 'tym, którzy produkują ten sam produkt, tylko gorszy',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что такое подтверждение?',
            en: 'What is acknowledgment?',
            pl: 'Czym jest potwierdzenie?',
          },
          opts: [
            {
              ru: 'сигнал понимания («я понял», «хорошо», «окей»), который показывает говорящему, что цель достигнута',
              en: 'a signal of understanding ("I understand", "good", "okay") that shows the speaker the goal is reached',
              pl: 'sygnał zrozumienia („zrozumiałem", „dobrze", „okej"), który pokazuje mówiącemu, że cel został osiągnięty',
            },
            {
              ru: 'согласие с собеседником',
              en: 'agreement with the interlocutor',
              pl: 'zgoda z rozmówcą',
            },
            {
              ru: 'похвала',
              en: 'praise',
              pl: 'pochwała',
            },
            {
              ru: 'вопрос «что ты имеешь в виду?»',
              en: 'the question "what do you mean?"',
              pl: 'pytanie „co masz na myśli?"',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Сколько примерно конфликтов не было бы, умей люди давать подтверждение?',
            en: 'Approximately how many conflicts would not exist if people knew how to give acknowledgment?',
            pl: 'Ilu mniej więcej konfliktów by nie było, gdyby ludzie umieli dawać potwierdzenie?',
          },
          opts: [
            {
              ru: 'около 5%',
              en: 'about 5%',
              pl: 'około 5%',
            },
            {
              ru: 'около 20%',
              en: 'about 20%',
              pl: 'około 20%',
            },
            {
              ru: 'около 50%',
              en: 'about 50%',
              pl: 'około 50%',
            },
            {
              ru: 'около 90%',
              en: 'about 90%',
              pl: 'około 90%',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что делать, если ты на самом деле НЕ понял собеседника?',
            en: 'What should you do if you actually did NOT understand the interlocutor?',
            pl: 'Co robić, jeśli naprawdę NIE zrozumiałeś rozmówcy?',
          },
          opts: [
            {
              ru: 'всё равно дать подтверждение',
              en: 'give acknowledgment anyway',
              pl: 'mimo wszystko dać potwierdzenie',
            },
            {
              ru: 'не давать подтверждения (это обман) — спросить «что ты имеешь в виду?»',
              en: 'do not give acknowledgment (that is deception) — ask "what do you mean?"',
              pl: 'nie dawać potwierdzenia (to oszustwo) — zapytać „co masz na myśli?"',
            },
            {
              ru: 'сразу резко ответить',
              en: 'answer sharply at once',
              pl: 'od razu odpowiedzieć ostro',
            },
            {
              ru: 'промолчать и уйти',
              en: 'stay silent and leave',
              pl: 'zamilczeć i odejść',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: '«Я тебя понял» — означает ли это «я согласен»?',
            en: '"I understood you" — does this mean "I agree"?',
            pl: '„Zrozumiałem cię" — czy oznacza to „zgadzam się"?',
          },
          opts: [
            {
              ru: 'да, это одно и то же',
              en: 'yes, it is one and the same',
              pl: 'tak, to jedno i to samo',
            },
            {
              ru: 'да, всегда',
              en: 'yes, always',
              pl: 'tak, zawsze',
            },
            {
              ru: 'да, если сказать дважды',
              en: 'yes, if said twice',
              pl: 'tak, jeśli powiedzieć dwa razy',
            },
            {
              ru: 'нет: «понял» вовсе не значит «согласен»',
              en: 'no: "understood" does not at all mean "agree"',
              pl: 'nie: „zrozumiałem" wcale nie znaczy „zgadzam się"',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Ещё одна функция подтверждения:',
            en: 'Another function of acknowledgment:',
            pl: 'Jeszcze jedna funkcja potwierdzenia:',
          },
          opts: [
            {
              ru: 'мягко остановить поток в свою сторону, не обидев человека («я полностью тебя понял»)',
              en: 'to gently stop the flow toward yourself without offending the person ("I understood you completely")',
              pl: 'łagodnie zatrzymać przepływ w swoją stronę, nie urażając człowieka („w pełni cię zrozumiałem")',
            },
            {
              ru: 'начать спор',
              en: 'to start an argument',
              pl: 'zacząć spór',
            },
            {
              ru: 'прекратить общение навсегда',
              en: 'to stop communication forever',
              pl: 'przerwać komunikację na zawsze',
            },
            {
              ru: 'грубо заставить человека замолчать',
              en: 'to rudely make the person shut up',
              pl: 'brutalnie zmusić człowieka do milczenia',
            },
          ],
          correct: 0,
        },
      ],
    },
  },
};
