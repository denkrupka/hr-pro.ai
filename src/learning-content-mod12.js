'use strict';
// Контент программы «Личностные качества (Синдромы «Тест Тулс»)» (ru/en/pl; ru — рабочий перевод с EN).
// Мёржится в learning.js по ключу 'module-syndromes'.

// Врезки-боксы 1-в-1 из mod10 / mod8 / productivity-winners / module-abc.
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
  'module-syndromes': {
    sections: [
      // 1 — ВВЕДЕНИЕ + ТРИ ЗОНЫ ТЕСТА (БЫТЬ / ДЕЛАТЬ / ИМЕТЬ)
      {
        id: 'intro',
        title: {
          ru: 'Синдромы «Тест Тулс» · Введение и три зоны теста',
          en: 'Syndromes of the "Tools Test" · Introduction and the three zones',
          pl: 'Syndromy „Test Tools” · Wprowadzenie i trzy strefy testu',
        },
        desc: {
          ru: 'Что такое синдром и зачем он нужен; три зоны теста — быть, делать, иметь — как рамка для быстрого чтения.',
          en: 'What a syndrome is and why it is needed; the three zones of the test — being, doing, having — as a framework for quick reading.',
          pl: 'Czym jest syndrom i po co jest potrzebny; trzy strefy testu — być, robić, mieć — jako rama do szybkiego czytania.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 12 · СИНДРОМЫ</strong></p>' +
            '<p>Синдромы «Тест Тулс»</p>' +
            '<p>Каталог характерных сочетаний точек: три зоны теста, синдромы соотношений и плавающих точек, а также сочетания, особенно важные для прогноза и найма.</p>' +
            '<h2>Модуль 12. Синдромы «Тест Тулс»</h2>' +
            '<p>Это заключительный модуль. Синдромы — это ярко выраженные эффекты, характерные сочетания точек, особенно важные для прогноза и анализа; многие из них платформа подсвечивает автоматически. Сначала мы разберём полезную рамку — три зоны теста — а затем пройдём по самому каталогу синдромов.</p>' +
            '<h3>Глава 1. Три зоны теста: быть, делать, иметь</h3>' +
            '<p>Если охватить тест общим взглядом, десять точек делятся на три зоны, и это очень помогает читать синдромы.</p>' +
            '<p>Первая зона — «быть»: это первые три точки — внимательность (A), позитивность (B) и самообладание (C). Это внутренние качества, которые зависят только от самого человека: он может быть спокойным, в хорошем настроении и внимательным независимо от того, есть рядом люди или нет. По сути эти точки показывают, каким человек себя ощущает как личность.</p>' +
            '<p>Вторая зона — «делать»: это четыре точки — уверенность (D), активность (E), настойчивость (F) и ответственность (G). Это показатели эффективности: насколько уверенно и предсказуемо человек действует, сколько у него энергии (то есть скорость и сила) и насколько он готов отвечать перед другими за то, что сделал. Проще говоря, отвечает ли человек за то, что делает, доводит ли до конца, любит ли начинать и надёжен ли он.</p>' +
            '<p>Третья зона — «иметь»: это последние три точки — объективность (H), чуткость (I) и общительность (J). Это отношения с другими людьми: чуткость связана со способностью видеть точку зрения другого, объективность — со справедливой оценкой чужих поступков, общительность — с общением.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Зачем нужна эта рамка',
              bp('Три зоны помогают быстро понять человека и увидеть синдром. Например, иногда встречается кандидат, у которого сильна зона «делать» (хорошие показатели эффективности, тем он и зарабатывает), но при этом он плохо себя чувствует в зоне «быть» (запустил себя, не управляет настроением и вниманием) и напряжён в зоне «иметь» (проблемы с людьми). Это типичный «карьерист, нацеленный на результат»: он весь за результат, а всё остальное — потом.', true)),
          en:
            '<p><strong>MODULE 12 · SYNDROMES</strong></p>' +
            '<p>Syndromes of the "Tools Test"</p>' +
            '<p>A catalog of characteristic combinations of points: the three zones of the test, syndromes of relations and of floating points, and combinations especially important for prediction and hiring.</p>' +
            '<h2>Module 12. Syndromes of the "Tools Test"</h2>' +
            '<p>This is the concluding module. Syndromes are vividly pronounced effects, characteristic combinations of points that are especially important for prediction and analysis; the platform highlights many of them automatically. First we will examine a useful framework — the three zones of the test — and then we will go through the catalog of syndromes itself.</p>' +
            '<h3>Chapter 1. The three zones of the test: being, doing, having</h3>' +
            '<p>If one takes in the test at a glance, the ten points divide into three zones, and this helps a great deal in reading the syndromes.</p>' +
            '<p>The first zone is "being": these are the first three points — attentiveness (A), positivity (B), and self-possession (C). These are inner qualities that depend only on the person himself: he can be calm, in a good mood, and attentive regardless of whether people are around or not. In essence, these points show how a person feels as a personality.</p>' +
            '<p>The second zone is "doing": these are four points — certainty (D), activity (E), persistence (F), and responsibility (G). These are indicators of effectiveness: how confidently and predictably a person acts, how much energy he has (that is, speed and strength), and how ready he is to answer to others for what he has done. Put more simply, whether a person answers for what he does, sees things through, likes to begin, and is reliable.</p>' +
            '<p>The third zone is "having": these are the last three points — objectivity (H), sensitivity (I), and sociability (J). These are relations with other people: sensitivity is connected with the ability to see another\'s point of view, objectivity — with a fair assessment of others\' actions, sociability — with communication.</p>' +
            k('KEY IDEA · Why this framework is needed',
              bp('The three zones help you quickly understand a person and see a syndrome. For example, there is sometimes a candidate whose "doing" zone is strong (good indicators of effectiveness, which is what he earns by), but who at the same time feels bad in the "being" zone (has let himself go, does not manage his mood and attention) and is tense in the "having" zone (problems with people). This is the typical "results-oriented careerist": he is all about the result, and everything else comes later.', true)),
          pl:
            '<p><strong>MODUŁ 12 · SYNDROMY</strong></p>' +
            '<p>Syndromy „Test Tools”</p>' +
            '<p>Katalog charakterystycznych połączeń punktów: trzy strefy testu, syndromy relacji i punktów pływających, a także połączenia szczególnie ważne dla prognozy i rekrutacji.</p>' +
            '<h2>Moduł 12. Syndromy „Test Tools”</h2>' +
            '<p>To końcowy moduł. Syndromy to wyraźnie zaznaczone efekty, charakterystyczne połączenia punktów, które są szczególnie ważne dla prognozy i analizy; wiele z nich platforma podświetla automatycznie. Najpierw omówimy pożyteczną ramę — trzy strefy testu — a następnie przejdziemy przez sam katalog syndromów.</p>' +
            '<h3>Rozdział 1. Trzy strefy testu: być, robić, mieć</h3>' +
            '<p>Jeśli ogarnąć test ogólnym spojrzeniem, dziesięć punktów dzieli się na trzy strefy, i to bardzo pomaga czytać syndromy.</p>' +
            '<p>Pierwsza strefa — „być”: to pierwsze trzy punkty — uważność (A), pozytywność (B) i panowanie nad sobą (C). To wewnętrzne cechy, które zależą tylko od samego człowieka: może być spokojny, w dobrym nastroju i uważny niezależnie od tego, czy obok są ludzie, czy nie. W istocie te punkty pokazują, jakim człowiek się czuje jako osobowość.</p>' +
            '<p>Druga strefa — „robić”: to cztery punkty — pewność (D), aktywność (E), wytrwałość (F) i odpowiedzialność (G). To wskaźniki efektywności: na ile pewnie i przewidywalnie człowiek działa, ile ma energii (czyli szybkość i siła) i na ile jest gotów odpowiadać przed innymi za to, co zrobił. Prościej mówiąc, czy człowiek odpowiada za to, co robi, czy doprowadza do końca, czy lubi zaczynać i czy jest niezawodny.</p>' +
            '<p>Trzecia strefa — „mieć”: to ostatnie trzy punkty — obiektywność (H), wrażliwość (I) i towarzyskość (J). To relacje z innymi ludźmi: wrażliwość jest związana z umiejętnością widzenia punktu widzenia drugiego, obiektywność — ze sprawiedliwą oceną cudzych czynów, towarzyskość — z komunikacją.</p>' +
            k('KLUCZOWA MYŚL · Po co ta rama',
              bp('Trzy strefy pomagają szybko zrozumieć człowieka i zobaczyć syndrom. Na przykład bywa kandydat, u którego silna jest strefa „robić” (dobre wskaźniki efektywności, tym właśnie zarabia), ale przy tym źle się czuje w strefie „być” (zaniedbał się, nie zarządza nastrojem i uwagą) i jest napięty w strefie „mieć” (problemy z ludźmi). To typowy „karierowicz nastawiony na wynik”: jest cały za wynikiem, a cała reszta — potem.', true)),
        },
      },

      // 2 — СИНДРОМЫ СООТНОШЕНИЯ ТОЧЕК
      {
        id: 'point-ratios',
        title: {
          ru: 'Синдромы соотношения точек: рутина или новое, «бросает дела» или «ленивый»',
          en: 'Syndromes of the relation between points: routine or the new, "abandons things" or "lazy"',
          pl: 'Syndromy relacji punktów: rutyna albo nowe, „porzuca sprawy” albo „leniwy”',
        },
        desc: {
          ru: 'Два соотношения — D и E, E и F — которые платформа считает сама, и как это использовать в подборе.',
          en: 'Two ratios — D and E, E and F — that the platform calculates itself, and how to use this in placement.',
          pl: 'Dwa stosunki — D i E, E i F — które platforma liczy sama, i jak to wykorzystać przy doborze.',
        },
        html: {
          ru:
            '<h2>Глава 2. Синдромы соотношения точек: рутина или новое, «бросает дела» или «ленивый»</h2>' +
            '<p>Некоторые синдромы читаются не по одной точке, а по соотношению двух — платформа считает это сама.</p>' +
            '<p>Первое соотношение — уверенность (D) и активность (E). Если D больше E, человек скорее консервативен, чем склонен к новому: он предпочитает рутину и любит уверенно действовать там, где хорошо разбирается. А вот если E выше D (значимо, не меньше чем на 20 пунктов), система выведет, что человек «новый»: он любит делать новое, и начинать у него выходит гораздо лучше, чем работать в рутине.</p>' +
            '<p>Второе соотношение — активность (E) и настойчивость (F). Если активность выше настойчивости, человек может бросать дела: он много начинает, но не доводит до конца. А если, наоборот, настойчивость выше активности, человек ленивый: доводить до конца он умеет, но энергии у него мало, поэтому и начинает мало — то есть способности и возможности есть, а применять их ему лень.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Как использовать это при подборе',
              bp('Эти соотношения напрямую влияют на расстановку людей. Если вы ищете продавца на рутинную работу, где каждый день одно и то же, берите человека, у которого D выше E — его не будет тянуть на новое, и он будет уверенно работать в знакомом. А если работа связана с постоянными новыми задачами и развитием (например, руководитель отдела развития), лучше, чтобы E было выше D. Неправильная расстановка дорого стоит: посадите «любителя нового» на рутину — он заскучает и уйдёт, и наоборот.', true)),
          en:
            '<h2>Chapter 2. Syndromes of the relation between points: routine or the new, "abandons things" or "lazy"</h2>' +
            '<p>Some syndromes are read not by a single point, but by the ratio of two — the platform calculates this itself.</p>' +
            '<p>The first ratio is certainty (D) and activity (E). If D is greater than E, the person is more conservative than inclined toward the new: he prefers routine and likes to act confidently where he is well versed. But if E is higher than D (significantly, by no less than 20 points), the system will output that the person is "new": he likes to do new things, and beginning comes to him far better than working in routine.</p>' +
            '<p>The second ratio is activity (E) and persistence (F). If activity is higher than persistence, the person may abandon things: he begins much but does not see it through to the end. But if, on the contrary, persistence is higher than activity, the person is lazy: he can see things through, but has little energy, so he begins little too — that is, the abilities and possibilities are there, but he is too lazy to apply them.</p>' +
            t('APPLICATION IN HIRING · How to use this in recruitment',
              bp('These ratios directly affect the placement of people. If you are looking for a salesperson for routine work where it\'s the same thing every day, take a person whose D is higher than E — he will not pull toward the new and will work confidently in the familiar. But if the work involves constant new tasks and development (for example, a head of a development department), it is better for E to be higher than D. Incorrect placement is costly: put a "lover of the new" on routine — he will get bored and leave, and vice versa.', true)),
          pl:
            '<h2>Rozdział 2. Syndromy relacji punktów: rutyna albo nowe, „porzuca sprawy” albo „leniwy”</h2>' +
            '<p>Część syndromów czyta się nie po jednym punkcie, lecz po stosunku dwóch — platforma liczy to sama.</p>' +
            '<p>Pierwszy stosunek — pewność (D) i aktywność (E). Jeśli D jest większe od E, człowiek jest bardziej konserwatywny, niż skłonny do nowego: woli rutynę i lubi pewnie działać tam, gdzie dobrze się orientuje. Jeśli zaś E jest wyższe od D (znacząco, nie mniej niż o 20 punktów), system wyprowadzi, że człowiek jest „nowy”: lubi robić nowe rzeczy, i zaczynać wychodzi mu znacznie lepiej niż pracować w rutynie.</p>' +
            '<p>Drugi stosunek — aktywność (E) i wytrwałość (F). Jeśli aktywność jest wyższa od wytrwałości, człowiek może porzucać sprawy: wiele zaczyna, ale nie doprowadza do końca. Jeśli zaś, przeciwnie, wytrwałość jest wyższa od aktywności, człowiek jest leniwy: doprowadzić do końca potrafi, ale energii ma mało, dlatego i mało zaczyna — czyli zdolności i możliwości są, a jemu leni się je zastosować.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Jak wykorzystać to przy doborze',
              bp('Te stosunki wprost wpływają na rozstawienie ludzi. Jeśli szukacie sprzedawcy do rutynowej pracy, gdzie codziennie jest to samo, bierzcie człowieka, u którego D jest wyższe od E — nie będzie ciągnął w nowe i będzie pewnie pracował w znanym. A jeśli praca jest związana ze stałymi nowymi zadaniami i rozwojem (na przykład kierownik działu rozwoju), lepiej, żeby E było wyższe od D. Nieprawidłowe rozstawienie drogo kosztuje: posadźcie „amatora nowego” na rutynę — znudzi się i odejdzie, i odwrotnie.', true)),
        },
      },

      // 3 — ПЛАВАЮЩИЕ ТОЧКИ: ПОДАВЛЕНИЕ И ПИН
      {
        id: 'floating-pts',
        title: {
          ru: 'Синдромы плавающих точек: подавление и ПИН',
          en: 'Syndromes of floating points: suppression and PTS',
          pl: 'Syndromy punktów pływających: tłumienie i PŹK',
        },
        desc: {
          ru: '«Молния» и плавающая точка, подавление окружением, самый серьёзный синдром — ПИН (потенциальный источник неприятностей).',
          en: 'The "lightning bolt" and the floating point, suppression by the environment, and the most serious syndrome — PTS (a potential trouble source).',
          pl: '„Błyskawica” i punkt pływający, tłumienie przez otoczenie i najpoważniejszy syndrom — PŹK (potencjalne źródło kłopotów).',
        },
        html: {
          ru:
            '<h2>Глава 3. Синдромы плавающих точек: подавление и ПИН</h2>' +
            '<p>Особняком стоят синдромы, связанные с «молнией» — так на тесте отмечается плавающая точка. Плавать могут две точки — настроение (B) и энергия (E): их уровень способен меняться, как американские горки. Обычно это происходит под подавлением: рядом с человеком есть подавляющие личности, которые снижают его уверенность и «придавливают» его развитие, и, сближаясь с ними, человек теряет эффективность и желание что-либо делать.</p>' +
            '<p>Самый серьёзный из этих синдромов — ПИН (потенциальный источник неприятностей): это когда на тесте появляются сразу две молнии — плавают и настроение, и энергия. Тогда «волны складываются», и колебания становятся особенно сильными. Такой человек испытывает выраженные американские горки и словно притягивает к себе неприятности, а вызвано это, как правило, подавлением в его окружении. Особенно опасно «дно» — момент, когда у человека нет ни настроения, ни энергии. ПИН — это сигнал, что с кандидатом, скорее всего, не стоит работать (или что это придётся особо учесть). К плавающей позитивности примыкают и родственные синдромы — «подавлен окружением» и «внутренняя пустота».</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ · Плавающая точка — это про окружение, а не про «характер»',
              bp('Плавающая точка (молния) почти всегда говорит не о врождённом свойстве человека, а о подавлении в его окружении: настроение и энергия проваливаются рядом с подавляющими личностями. Поэтому две молнии сразу (ПИН) — серьёзный сигнал: колебания складываются, человек оказывается на «американских горках» и притягивает неприятности, а особенно опасно «дно» — когда нет ни настроения, ни энергии. С таким кандидатом, скорее всего, работать не стоит либо надо это специально учитывать.', true)),
          en:
            '<h2>Chapter 3. Syndromes of floating points: suppression and PTS</h2>' +
            '<p>Standing apart are the syndromes connected with the "lightning bolt" — this is how a floating point is marked on the test. Two points can float — mood (B) and energy (E): their level is capable of changing like a roller coaster. Usually this happens under suppression: near the person there are suppressive personalities who lower his confidence and "push down" his development, and, in drawing close to them, the person loses effectiveness and the desire to do anything.</p>' +
            '<p>The most serious of these syndromes is PTS (a potential trouble source): this is when two lightning bolts appear on the test at once — both mood and energy are floating. Then "the waves add up," and the fluctuations become especially strong. Such a person experiences a pronounced roller coaster and seems to attract troubles to himself, and this is, as a rule, caused by suppression in his environment. Especially dangerous is "the bottom" — the moment when the person has neither mood nor energy. PTS is a signal that it is most likely not worth working with the candidate (or that this will have to be taken into special account). Adjacent to floating positivity are related syndromes too — "suppressed by the environment" and "inner emptiness."</p>' +
            k('KEY IDEA · A floating point is about the environment, not "character"',
              bp('A floating point (the lightning bolt) almost always speaks not of an innate quality of the person, but of suppression in his environment: mood and energy collapse near suppressive personalities. That is why two lightning bolts at once (PTS) are a serious signal: the fluctuations add up, the person finds himself on a "roller coaster" and attracts troubles, and especially dangerous is "the bottom" — when there is neither mood nor energy. With such a candidate it is most likely not worth working, or this must be taken into special account.', true)),
          pl:
            '<h2>Rozdział 3. Syndromy punktów pływających: tłumienie i PŹK</h2>' +
            '<p>Osobno stoją syndromy związane z „błyskawicą” — tak na teście oznacza się punkt pływający. Pływać mogą dwa punkty — nastrój (B) i energia (E): ich poziom potrafi się zmieniać jak kolejka górska. Zwykle dzieje się to pod tłumieniem: obok człowieka są osobowości tłumiące, które obniżają jego pewność i „przyduszają” jego rozwój, i, zbliżając się z nimi, człowiek traci efektywność i chęć do czegokolwiek.</p>' +
            '<p>Najpoważniejszy z tych syndromów to PŹK (potencjalne źródło kłopotów): to gdy na teście pojawiają się od razu dwie błyskawice — pływają i nastrój, i energia. Wtedy „fale się składają”, i wahania stają się szczególnie silne. Taki człowiek doświadcza wyraźnej kolejki górskiej i jakby przyciąga do siebie nieprzyjemności, a wywołane jest to z reguły tłumieniem w jego otoczeniu. Szczególnie niebezpieczne jest „dno” — moment, gdy człowiek nie ma ani nastroju, ani energii. PŹK to sygnał, że z kandydatem najprawdopodobniej nie warto pracować (albo trzeba to będzie szczególnie uwzględnić). Do pływającej pozytywności przylegają i pokrewne syndromy — „stłumiony przez otoczenie” i „wewnętrzna pustka”.</p>' +
            k('KLUCZOWA MYŚL · Punkt pływający to o otoczeniu, a nie o „charakterze”',
              bp('Punkt pływający (błyskawica) prawie zawsze mówi nie o wrodzonej cesze człowieka, lecz o tłumieniu w jego otoczeniu: nastrój i energia zapadają się obok osobowości tłumiących. Dlatego dwie błyskawice od razu (PŹK) to poważny sygnał: wahania się składają, człowiek trafia na „kolejkę górską” i przyciąga nieprzyjemności, a szczególnie niebezpieczne jest „dno” — gdy nie ma ani nastroju, ani energii. Z takim kandydatem najprawdopodobniej nie warto pracować albo trzeba to specjalnie uwzględnić.', true)),
        },
      },

      // 4 — СИНДРОМЫ ВЫДЕЛЯЮЩЕЙСЯ ТОЧКИ
      {
        id: 'standout-pt',
        title: {
          ru: 'Синдромы выделяющейся точки: «обязан быть прав» и карьерист',
          en: 'Syndromes of a standout point: "obliged to be right" and the careerist',
          pl: 'Syndromy wyróżniającego się punktu: „musi mieć rację” i karierowicz',
        },
        desc: {
          ru: 'Синдромы, возникающие, когда одна точка резко выделяется на фоне остальных.',
          en: 'Syndromes that arise when one point stands out sharply against the background of the rest.',
          pl: 'Syndromy powstające, gdy jeden punkt ostro wyróżnia się na tle pozostałych.',
        },
        html: {
          ru:
            '<h2>Глава 4. Синдромы выделяющейся точки: «обязан быть прав» и карьерист</h2>' +
            '<p>Некоторые синдромы возникают, когда одна точка резко выделяется на фоне остальных.</p>' +
            '<p>«Обязан быть прав» загорается, когда уверенность (D) — самая высокая точка, находится в высокой зоне и выше всех остальных. Такой человек убеждён, что должен любой ценой нести правоту: приняв точку зрения, он стоит на ней до конца, уверен, что во всём разобрался и всё знает, и переубедить его крайне трудно.</p>' +
            '<p>Карьерист — это восходящий график, где сильны показатели эффективности (зона «делать»), но человек прежде всего думает о себе и о работе, а лишь потом о других. Для него важен статус и карьера — важно «быть, а не иметь»; отношения он не ценит и особо не тянется к людям. Самое важное для такого человека — кто он и чем занимается.</p>' +
            b('ЗАМЕТКА · Термин «быть / делать / иметь» в этих синдромах',
              bp('Обратите внимание: «карьерист, нацеленный на результат» и здесь читается через три зоны. У него сильна зона «делать», но для него важно «быть» (статус, кто он) больше, чем «иметь» (отношения). Это тот же язык быть / делать / иметь, что и в рамке трёх зон, — просто применённый к конкретному сочетанию точек.', true)),
          en:
            '<h2>Chapter 4. Syndromes of a standout point: "obliged to be right" and the careerist</h2>' +
            '<p>Some syndromes arise when one point stands out sharply against the background of the rest.</p>' +
            '<p>"Obliged to be right" lights up when certainty (D) is the highest point, is in the high zone, and is higher than all the others. Such a person is convinced that he must at all costs carry the rightness: having adopted a point of view, he stands by it to the end, is sure he has gotten to the bottom of everything and knows it all, and it is extremely hard to talk him round.</p>' +
            '<p>The careerist — this is a rising graph where the indicators of effectiveness are strong (the "doing" zone), but the person thinks first of all about himself and about the work, and only then about others. Status and career matter to him — it matters "to be, not to have"; he does not value relations and does not especially seek out people. What matters most for such a person is who he is and what he does.</p>' +
            b('NOTE · The "being / doing / having" term in these syndromes',
              bp('Note that the "results-oriented careerist" is read here too through the three zones. His "doing" zone is strong, but for him "being" (status, who he is) matters more than "having" (relations). This is the same being / doing / having language as in the framework of the three zones — simply applied to a concrete combination of points.', true)),
          pl:
            '<h2>Rozdział 4. Syndromy wyróżniającego się punktu: „musi mieć rację” i karierowicz</h2>' +
            '<p>Niektóre syndromy powstają, gdy jeden punkt ostro wyróżnia się na tle pozostałych.</p>' +
            '<p>„Musi mieć rację” zapala się, gdy pewność (D) jest najwyższym punktem, znajduje się w wysokiej strefie i jest wyższa od wszystkich pozostałych. Taki człowiek jest przekonany, że musi za wszelką cenę nieść rację: przyjąwszy punkt widzenia, stoi na nim do końca, jest pewny, że we wszystkim się rozeznał i wie wszystko, i niezmiernie trudno go przekonać.</p>' +
            '<p>Karierowicz — to wznoszący się wykres, gdzie silne są wskaźniki efektywności (strefa „robić”), ale człowiek przede wszystkim myśli o sobie i o pracy, a dopiero potem o innych. Dla niego ważny jest status i kariera — ważne jest „być, a nie mieć”; relacji nie ceni i specjalnie nie ciągnie do ludzi. Najważniejsze dla takiego człowieka to kim jest i czym się zajmuje.</p>' +
            b('NOTATKA · Termin „być / robić / mieć” w tych syndromach',
              bp('Zwróćcie uwagę: „karierowicz nastawiony na wynik” i tu czyta się przez trzy strefy. Silna jest u niego strefa „robić”, ale dla niego „być” (status, kim jest) jest ważniejsze niż „mieć” (relacje). To ten sam język być / robić / mieć, co w ramie trzech stref — po prostu zastosowany do konkretnego połączenia punktów.', true)),
        },
      },

      // 5 — СИНДРОМЫ СОЧЕТАНИЙ ТОЧЕК (КАТАЛОГ)
      {
        id: 'combinations',
        title: {
          ru: 'Синдромы сочетаний точек: каталог',
          en: 'Syndromes of point combinations: the catalog',
          pl: 'Syndromy połączeń punktów: katalog',
        },
        desc: {
          ru: 'Обвиняющий, плюшевый мишка, динамит, лояльный и другие готовые сочетания нескольких точек.',
          en: 'The accuser, the teddy bear, dynamite, the loyal one, and other ready-made combinations of several points.',
          pl: 'Oskarżający, pluszowy miś, dynamit, lojalny i inne gotowe połączenia kilku punktów.',
        },
        html: {
          ru:
            '<h2>Глава 5. Синдромы сочетаний точек</h2>' +
            '<p>Большинство синдромов — это устойчивые сочетания нескольких точек. Разберём основные.</p>' +
            '<ul>' +
            '<li><strong>Обвиняющий.</strong> Сочетание низкой объективности (человек критичен), низкой ответственности (не любит отвечать перед другими) и очень высокой настойчивости. Такой человек видит в основном минусы, категоричен, не промолчит — и никто его не свернёт: он будет «резать правду-матку в глаза», критикуя и обвиняя других, не чувствуя, что этим их обижает. Работать с ним тяжело.</li>' +
            '<li><strong>Приятный и милый.</strong> Высокая позитивность, высокая чуткость, высокая общительность — и при этом низкая настойчивость. Это очень добрый, общительный и мягкий человек, с которым приятно, но который совершенно не умеет настоять на своём.</li>' +
            '<li><strong>Плюшевый мишка.</strong> Очень высокая чуткость при очень низкой общительности. Такой человек искренне хочет помогать, но не умеет общаться и противостоять чужим аргументам, сильно зависит от чужого мнения и не умеет твёрдо отказать — поэтому им нередко пользуются и «вытирают о него ноги». По сути он становится игрушкой в чужих руках и не может себя защитить.</li>' +
            '<li><strong>Рассеянный.</strong> Высокая активность при очень низкой внимательности. Человек совершает множество действий, но не осознаёт, что не всё получается: путается, забывает и теряет нить.</li>' +
            '<li><strong>Педант.</strong> Высокая объективность вместе с высокой внимательностью. Такой человек строгий и придирчиво дотошный, уделяет много внимания деталям и при этом критичен — он видит все негативные мелочи; пока не разберёт все детали до последней, не может действовать эффективно.</li>' +
            '<li><strong>Динамит (взрывчатость).</strong> Опасное сочетание: низкая внимательность, низкое самообладание, нежелание отвечать (человек закрывается под давлением) и высокая настойчивость. Такой человек легко «взрывается», бурно выражая недовольство. Механику удобно представить как настоящий динамит: длина фитиля — это внимательность (насколько далеко человек просчитывает последствия: чем выше A, тем длиннее фитиль); самообладание (C) — это сколько нужно «искр», чтобы фитиль загорелся (при высоком самообладании чиркать можно долго, человек держится); настойчивость (F) задаёт силу взрыва; а ответственность (G) — это как бы «сухость системы», то есть сама вероятность, что рванёт.</li>' +
            '<li><strong>Лучший.</strong> Очень высокая настойчивость при очень низкой ответственности. Такой человек умеет доводить дела до конца и «бьёт в одну точку», но не любит, когда его призывают к ответу — и потому стремится сделать всё идеально и безупречно, чтобы не подставиться под критику, которой боится и которая снижает его эффективность.</li>' +
            '<li><strong>Лояльный.</strong> Человек хорошо держит удар (высокая ответственность), очень уверен (высокая D) и позитивен. Он настроен на согласие, склонен соблюдать установленные правила, ценности и нормы поведения.</li>' +
            '<li><strong>Очень эффективный.</strong> Все показатели находятся в высокой зоне и примерно на одном уровне (могут колебаться в пределах десяти пунктов). Это люди, которые умеют уверенно начинать и доводить дела до конца — на них можно ставить.</li>' +
            '<li><strong>Инициативный.</strong> Высокая активность вместе с высокой ответственностью: человек любит брать на себя ответственность и отвечать за свои дела перед другими — и при этом сам начинает действовать.</li>' +
            '<li><strong>Недостаточно инициативный.</strong> Высокая активность, но при этом человек не любит отвечать и не выносит давления. Энергия у него есть, но самостоятельно, без влияния извне, действовать он не начнёт.</li>' +
            '</ul>' +
            r('ПРАВИЛО · Одна логика чтения всех синдромов',
              bp('Стоит помнить, что часть синдромов мы уже разбирали в предыдущих модулях, в контексте оценки — например, «розовые очки» и «вытирачку для ног» (плюшевого мишку), а также синдромы, по сути совпадающие с рассмотренными здесь соотношениями точек (синдром неэффективности — это когда активность выше настойчивости, а синдром лени — наоборот). Все они читаются по одной и той же логике: мы находим выделяющиеся точки и их сочетания и понимаем, как они проявятся в работе и в отношениях.', true)),
          en:
            '<h2>Chapter 5. Syndromes of point combinations</h2>' +
            '<p>Most syndromes are stable combinations of several points. Let us examine the main ones.</p>' +
            '<ul>' +
            '<li><strong>The Accuser.</strong> A combination of low objectivity (the person is critical), low responsibility (does not like to answer to others), and very high persistence. Such a person sees mainly the minuses, is categorical, will not keep silent — and no one will turn him aside: he will "cut the plain truth to your face," criticizing and accusing others without sensing that he thereby offends them. It is hard to work with him.</li>' +
            '<li><strong>The pleasant and nice one.</strong> High positivity, high sensitivity, high sociability — and, at that, low persistence. This is a very good, sociable, and gentle person, pleasant to be with, but who is utterly unable to stand his ground.</li>' +
            '<li><strong>The teddy bear.</strong> Very high sensitivity with very low sociability. Such a person sincerely wants to help, but cannot communicate or withstand others\' arguments, is strongly dependent on the opinion of others, and does not know how to firmly refuse — that is why he is often taken advantage of and people "wipe their feet on him." In essence, he becomes a toy in others\' hands and cannot defend himself.</li>' +
            '<li><strong>The scattered one.</strong> High activity with very low attentiveness. The person performs a multitude of actions but does not realize that not everything is working out: he gets confused, forgets, and loses the thread.</li>' +
            '<li><strong>The pedant.</strong> High objectivity together with high attentiveness. Such a person is strict and finickily meticulous, devotes a great deal of attention to details, and at that is critical — he sees all the negative trifles; until he has taken apart all the details down to the last, he cannot act effectively.</li>' +
            '<li><strong>Dynamite (explosiveness).</strong> A dangerous combination: low attentiveness, low self-possession, unwillingness to answer (the person closes up under pressure), and high persistence. Such a person easily "explodes," expressing his displeasure stormily. The mechanics are conveniently pictured as real dynamite: the length of the fuse is attentiveness (how far ahead the person calculates the consequences: the higher the A, the longer the fuse); self-possession (C) is how many "sparks" are needed for the fuse to catch (with high self-possession one can keep striking for a long time, the person holds on); persistence (F) sets the force of the explosion; and responsibility (G) is, as it were, the "dryness of the system," that is, the very probability that it will go off.</li>' +
            '<li><strong>The best.</strong> Very high persistence with very low responsibility. Such a person knows how to see things through and "strikes at one point," but does not like being held to account — and so he strives to do everything perfectly and flawlessly, so as not to be exposed to the criticism that he fears and that lowers his effectiveness.</li>' +
            '<li><strong>The loyal one.</strong> The person takes a blow well (high responsibility), is very certain (high D), and positive. He is set toward agreement, inclined to observe the established rules, values, and norms of behavior.</li>' +
            '<li><strong>Very effective.</strong> All the indicators are in the high zone and at roughly the same level (they may fluctuate within ten points). These are people who are able to begin confidently and see things through — one can bet on them.</li>' +
            '<li><strong>Initiative-taking.</strong> High activity together with high responsibility: the person likes to take on responsibility and answer for his affairs before others — and at the same time begins to act on his own.</li>' +
            '<li><strong>Insufficiently initiative-taking.</strong> High activity, but at that the person does not like to answer and cannot stand pressure. He has energy, but on his own, without an outside influence, he will not begin to act.</li>' +
            '</ul>' +
            r('RULE · One logic for reading all syndromes',
              bp('It is worth remembering that some syndromes we already examined in previous modules, in the context of assessment — for example, "rose-colored glasses" and the "doormat" (the teddy bear), as well as syndromes that in essence coincide with the ratios of points considered here (the syndrome of ineffectiveness is when activity is higher than persistence, and the syndrome of laziness is the reverse). All of them are read by one and the same logic: we find the standout points and their combinations and understand how they will manifest in work and in relationships.', true)),
          pl:
            '<h2>Rozdział 5. Syndromy połączeń punktów</h2>' +
            '<p>Większość syndromów to trwałe połączenia kilku punktów. Omówmy podstawowe.</p>' +
            '<ul>' +
            '<li><strong>Oskarżający.</strong> Połączenie niskiej obiektywności (człowiek jest krytyczny), niskiej odpowiedzialności (nie lubi odpowiadać przed innymi) i bardzo wysokiej wytrwałości. Taki człowiek widzi głównie minusy, jest kategoryczny, nie przemilczy — i nikt go nie skręci: będzie „walił prawdę prosto w oczy”, krytykował i oskarżał innych, nie czując, że ich tym obraża. Ciężko z nim pracować.</li>' +
            '<li><strong>Przyjemny i miły.</strong> Wysoka pozytywność, wysoka wrażliwość, wysoka towarzyskość — i przy tym niska wytrwałość. To bardzo dobry, towarzyski i miękki człowiek, z którym jest przyjemnie, ale który zupełnie nie umie postawić na swoim.</li>' +
            '<li><strong>Pluszowy miś.</strong> Bardzo wysoka wrażliwość przy bardzo niskiej towarzyskości. Taki człowiek szczerze chce pomagać, ale nie umie się komunikować i przeciwstawiać cudzym argumentom, silnie zależy od zdania innych i nie umie stanowczo odmówić — dlatego nierzadko się go wykorzystuje i „wyciera o niego nogi”. W istocie staje się zabawką w cudzych rękach i nie może się obronić.</li>' +
            '<li><strong>Roztargniony.</strong> Wysoka aktywność przy bardzo niskiej uważności. Człowiek wykonuje mnóstwo działań, ale nie zdaje sobie sprawy, że nie wszystko się udaje: gubi się, zapomina i traci wątek.</li>' +
            '<li><strong>Pedant.</strong> Wysoka obiektywność wraz z wysoką uważnością. Taki człowiek jest surowy i drobiazgowo dociekliwy, poświęca dużo uwagi szczegółom i przy tym jest krytyczny — widzi wszystkie negatywne drobiazgi; dopóki nie rozbierze wszystkich detali do ostatniego, nie może działać efektywnie.</li>' +
            '<li><strong>Dynamit (wybuchowość).</strong> Niebezpieczne połączenie: niska uważność, niskie panowanie nad sobą, niechęć do odpowiadania (człowiek zamyka się pod naciskiem) i wysoka wytrwałość. Taki człowiek łatwo „wybucha”, burzliwie wyrażając niezadowolenie. Mechanikę wygodnie jest przedstawić jak prawdziwy dynamit: długość lontu — to uważność (na ile daleko człowiek oblicza następstwa: im wyższe A, tym dłuższy lont); panowanie nad sobą (C) — to ile trzeba „iskier”, żeby lont się zapalił (przy wysokim panowaniu nad sobą krzesać można długo, człowiek się trzyma); wytrwałość (F) zadaje siłę wybuchu; a odpowiedzialność (G) — to jakby „suchość systemu”, czyli samo prawdopodobieństwo, że rąbnie.</li>' +
            '<li><strong>Najlepszy.</strong> Bardzo wysoka wytrwałość przy bardzo niskiej odpowiedzialności. Taki człowiek umie doprowadzać sprawy do końca i „uderza w jeden punkt”, ale nie lubi, gdy się go rozlicza — i dlatego dąży, żeby zrobić wszystko idealnie i nienagannie, żeby nie narazić się na krytykę, której się boi i która obniża jego efektywność.</li>' +
            '<li><strong>Lojalny.</strong> Człowiek dobrze trzyma cios (wysoka odpowiedzialność), jest bardzo pewny (wysokie D) i pozytywny. Jest nastawiony na zgodę, skłonny przestrzegać ustalonych zasad, wartości i norm zachowania.</li>' +
            '<li><strong>Bardzo efektywny.</strong> Wszystkie wskaźniki znajdują się w wysokiej strefie i mniej więcej na jednym poziomie (mogą się wahać w granicach dziesięciu punktów). To ludzie, którzy potrafią pewnie zaczynać i doprowadzać sprawy do końca — na nich można stawiać.</li>' +
            '<li><strong>Inicjatywny.</strong> Wysoka aktywność wraz z wysoką odpowiedzialnością: człowiek lubi brać na siebie odpowiedzialność i odpowiadać za swoje sprawy przed innymi — i przy tym sam zaczyna działać.</li>' +
            '<li><strong>Niedostatecznie inicjatywny.</strong> Wysoka aktywność, ale przy tym człowiek nie lubi odpowiadać i nie znosi nacisku. Energię ma, ale samodzielnie, bez wpływu z zewnątrz, działać nie zacznie.</li>' +
            '</ul>' +
            r('ZASADA · Jedna logika czytania wszystkich syndromów',
              bp('Warto pamiętać, że część syndromów omawialiśmy już w poprzednich modułach, w kontekście oceny — na przykład „różowe okulary” i „wycieraczkę do butów” (pluszowego misia), a także syndromy w istocie pokrywające się z rozpatrzonymi tu stosunkami punktów (syndrom nieefektywności to gdy aktywność jest wyższa od wytrwałości, a syndrom lenistwa — odwrotnie). Wszystkie czyta się według tej samej logiki: znajdujemy wyróżniające się punkty i ich połączenia i rozumiemy, jak przejawią się w pracy i w relacjach.', true)),
        },
      },

      // 6 — ИТОГ: ЗАВЕРШЕНИЕ ПРОГРАММЫ
      {
        id: 'summary',
        title: {
          ru: 'Итог: завершение программы',
          en: 'Summary: the conclusion of the program',
          pl: 'Podsumowanie: zakończenie programu',
        },
        desc: {
          ru: 'Чем завершается программа и какая целостная картина технологии найма у вас теперь есть.',
          en: 'What concludes the program and what whole picture of the hiring technology you now have.',
          pl: 'Czym kończy się program i jaki całościowy obraz technologii rekrutacji teraz macie.',
        },
        html: {
          ru:
            '<h2>Итог: завершение программы</h2>' +
            '<p>На этом наша программа завершается. Мы прошли путь от основ и модели разума через продуктивность и состояния к полной методике оценки тестов, а затем — к самому «Тест Тулс» и его синдромам. Теперь у вас есть целостная картина технологии найма HR-PRO.AI: от того, как устроена личность, до того, как читать тест и говорить о нём с человеком.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Синдром — это не отдельная «магия», а всё та же логика чтения, применённая к сочетаниям точек. Держите в голове три зоны (быть / делать / иметь), смотрите на соотношения точек и плавающие точки, узнавайте готовые сочетания — обвиняющий, плюшевый мишка, динамит, лояльный, карьерист и другие — и вы сможете читать тест как единую картину: быстро понимать человека, прогнозировать его поведение в работе и отношениях и точнее принимать решения о найме и расстановке.', true)),
          en:
            '<h2>Summary: the conclusion of the program</h2>' +
            '<p>With this our program concludes. We have traveled the path from the fundamentals and the model of the mind, through productivity and states, to the full methodology of assessing tests, and then — to the "Tools Test" itself and its syndromes. Now you have a whole picture of the HR-PRO.AI hiring technology: from how the personality is built to how to read a test and talk about it with a person.</p>' +
            k('KEY IDEA',
              bp('A syndrome is not a separate "magic," but the very same logic of reading applied to combinations of points. Keep the three zones in mind (being / doing / having), look at the ratios of points and the floating points, recognize the ready-made combinations — the accuser, the teddy bear, dynamite, the loyal one, the careerist, and others — and you will be able to read the test as a single picture: to quickly understand a person, to predict his behavior at work and in relationships, and to make sharper decisions about hiring and placement.', true)),
          pl:
            '<h2>Podsumowanie: zakończenie programu</h2>' +
            '<p>Na tym nasz program się kończy. Przeszliśmy drogę od podstaw i modelu umysłu przez produktywność i stany do pełnej metodyki oceny testów, a następnie — do samego „Test Tools” i jego syndromów. Teraz macie cały obraz technologii rekrutacji HR-PRO.AI: od tego, jak zbudowana jest osobowość, po to, jak czytać test i mówić o nim z człowiekiem.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Syndrom to nie osobna „magia”, lecz ta sama logika czytania zastosowana do połączeń punktów. Trzymajcie w głowie trzy strefy (być / robić / mieć), patrzcie na stosunki punktów i punkty pływające, rozpoznawajcie gotowe kombinacje — oskarżający, pluszowy miś, dynamit, lojalny, karierowicz i inne — a będziecie mogli czytać test jako jeden obraz: szybko rozumieć człowieka, prognozować jego zachowanie w pracy i relacjach oraz trafniej decydować o rekrutacji i rozstawieniu.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'На какие три зоны делятся десять точек теста?',
            en: 'Into which three zones are the ten points of the test divided?',
            pl: 'Na jakie trzy strefy dzieli się dziesięć punktów testu?',
          },
          opts: [
            {
              ru: 'плохие, средние, хорошие',
              en: 'bad, medium, good',
              pl: 'złe, średnie, dobre',
            },
            {
              ru: 'низкие, средние, высокие',
              en: 'low, medium, high',
              pl: 'niskie, średnie, wysokie',
            },
            {
              ru: 'A, B, C',
              en: 'A, B, C',
              pl: 'A, B, C',
            },
            {
              ru: '«быть», «делать», «иметь»',
              en: '"being," "doing," "having"',
              pl: '„być”, „robić”, „mieć”',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Какие точки образуют зону «быть»?',
            en: 'Which points make up the "being" zone?',
            pl: 'Które punkty tworzą strefę „być”?',
          },
          opts: [
            {
              ru: 'первые три — A, B, C (внутренние качества, зависят только от самого человека)',
              en: 'the first three — A, B, C (inner qualities that depend only on the person himself)',
              pl: 'pierwsze trzy — A, B, C (cechy wewnętrzne, zależą tylko od samego człowieka)',
            },
            {
              ru: 'D, E, F, G',
              en: 'D, E, F, G',
              pl: 'D, E, F, G',
            },
            {
              ru: 'H, I, J',
              en: 'H, I, J',
              pl: 'H, I, J',
            },
            {
              ru: 'все десять',
              en: 'all ten',
              pl: 'wszystkie dziesięć',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Зона «делать» — это:',
            en: 'The "doing" zone is:',
            pl: 'Strefa „robić” to:',
          },
          opts: [
            {
              ru: 'A, B, C',
              en: 'A, B, C',
              pl: 'A, B, C',
            },
            {
              ru: 'H, I, J',
              en: 'H, I, J',
              pl: 'H, I, J',
            },
            {
              ru: 'D, E, F, G — показатели эффективности',
              en: 'D, E, F, G — indicators of effectiveness',
              pl: 'D, E, F, G — wskaźniki efektywności',
            },
            {
              ru: 'только точка D',
              en: 'point D only',
              pl: 'tylko punkt D',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Зона «иметь» (отношения с другими людьми) — это:',
            en: 'The "having" zone (relationships with other people) is:',
            pl: 'Strefa „mieć” (relacje z innymi ludźmi) to:',
          },
          opts: [
            {
              ru: 'A, B, C',
              en: 'A, B, C',
              pl: 'A, B, C',
            },
            {
              ru: 'H, I, J',
              en: 'H, I, J',
              pl: 'H, I, J',
            },
            {
              ru: 'D, E, F',
              en: 'D, E, F',
              pl: 'D, E, F',
            },
            {
              ru: 'только точка G',
              en: 'point G only',
              pl: 'tylko punkt G',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кто такой «результатник-карьерист» в терминах зон?',
            en: 'Who is the "result-driven careerist" in terms of the zones?',
            pl: 'Kim jest „karierowicz nastawiony na wynik” w kategoriach stref?',
          },
          opts: [
            {
              ru: 'человек со слабой зоной «делать»',
              en: 'a person with a weak "doing" zone',
              pl: 'człowiek ze słabą strefą „robić”',
            },
            {
              ru: 'человек с очень сильной зоной «быть»',
              en: 'a person with a very strong "being" zone',
              pl: 'człowiek z bardzo silną strefą „być”',
            },
            {
              ru: 'человек без всякой зоны «иметь»',
              en: 'a person without any "having" zone at all',
              pl: 'człowiek bez żadnej strefy „mieć”',
            },
            {
              ru: 'сильная зона «делать», но плохо в «быть» и напряжённо в «иметь» — «весь за результат, а остальное потом»',
              en: 'a strong "doing" zone, but poor in "being" and tense in "having" — "all about the result, and everything else later"',
              pl: 'silna strefa „robić”, ale słabo w „być” i napięcie w „mieć” — „cały nastawiony na wynik, a reszta później”',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что означает соотношение «активность (E) выше уверенности (D) не меньше чем на 20 пунктов»?',
            en: 'What does the ratio "activity (E) higher than certainty (D) by at least 20 points" mean?',
            pl: 'Co oznacza stosunek „aktywność (E) wyższa od pewności (D) o co najmniej 20 punktów”?',
          },
          opts: [
            {
              ru: 'система выведет, что человек «новый»: любит новое, начинать получается лучше, чем работать в рутине',
              en: 'the system concludes that the person is "new": he likes novelty, and starting works out better for him than working in routine',
              pl: 'system uzna, że człowiek jest „nowy”: lubi nowość, zaczynanie wychodzi mu lepiej niż praca w rutynie',
            },
            {
              ru: 'человек консервативен',
              en: 'the person is conservative',
              pl: 'człowiek jest konserwatywny',
            },
            {
              ru: 'человек ленив',
              en: 'the person is lazy',
              pl: 'człowiek jest leniwy',
            },
            {
              ru: 'тест недействителен',
              en: 'the test is invalid',
              pl: 'test jest nieważny',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что означает «активность выше настойчивости» (E > F)?',
            en: 'What does "activity higher than persistence" (E > F) mean?',
            pl: 'Co oznacza „aktywność wyższa od wytrwałości” (E > F)?',
          },
          opts: [
            {
              ru: 'человек ленивый',
              en: 'the person is lazy',
              pl: 'człowiek jest leniwy',
            },
            {
              ru: 'человек очень эффективен',
              en: 'the person is very effective',
              pl: 'człowiek jest bardzo efektywny',
            },
            {
              ru: 'человек может «бросать дела»: многое начинает, но не доводит до конца',
              en: 'the person may "abandon things": he starts a lot but does not see it through',
              pl: 'człowiek może „porzucać sprawy”: wiele zaczyna, ale nie doprowadza do końca',
            },
            {
              ru: 'человек консервативен',
              en: 'the person is conservative',
              pl: 'człowiek jest konserwatywny',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что означает «настойчивость выше активности» (F > E)?',
            en: 'What does "persistence higher than activity" (F > E) mean?',
            pl: 'Co oznacza „wytrwałość wyższa od aktywności” (F > E)?',
          },
          opts: [
            {
              ru: 'человек «бросает дела»',
              en: 'the person "abandons things"',
              pl: 'człowiek „porzuca sprawy”',
            },
            {
              ru: 'человек «ленивый»: довести до конца может, но энергии мало, поэтому мало начинает',
              en: 'the person is "lazy": he can see things through, but has little energy, so he begins little',
              pl: 'człowiek jest „leniwy”: doprowadzić do końca potrafi, ale energii ma mało, więc mało zaczyna',
            },
            {
              ru: 'человек тянется к новому',
              en: 'the person is drawn to the new',
              pl: 'człowiek ciągnie do nowego',
            },
            {
              ru: 'человек нервный',
              en: 'the person is nervous',
              pl: 'człowiek jest nerwowy',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какие две точки могут «плавать» (отмечаются «молнией»)?',
            en: 'Which two points can "float" (are marked with a "lightning bolt")?',
            pl: 'Które dwa punkty mogą „pływać” (oznaczane „błyskawicą”)?',
          },
          opts: [
            {
              ru: 'A и B',
              en: 'A and B',
              pl: 'A i B',
            },
            {
              ru: 'D и G',
              en: 'D and G',
              pl: 'D i G',
            },
            {
              ru: 'H и J',
              en: 'H and J',
              pl: 'H i J',
            },
            {
              ru: 'настроение (B) и энергия (E)',
              en: 'mood (B) and energy (E)',
              pl: 'nastrój (B) i energia (E)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что такое ПИН?',
            en: 'What is a PTS?',
            pl: 'Czym jest PŹK?',
          },
          opts: [
            {
              ru: 'когда на тесте сразу две «молнии» (плавают и настроение, и энергия) — «волны складываются», человек будто притягивает неприятности',
              en: 'when the test has two "lightning bolts" at once (both mood and energy float) — the "waves add up," and the person seems to attract trouble',
              pl: 'gdy na teście od razu są dwie „błyskawice” (pływają i nastrój, i energia) — „fale się składają”, człowiek jakby przyciąga kłopoty',
            },
            {
              ru: 'очень высокая точка',
              en: 'a very high point',
              pl: 'bardzo wysoki punkt',
            },
            {
              ru: 'синоним компульсивности',
              en: 'a synonym for compulsiveness',
              pl: 'synonim kompulsywności',
            },
            {
              ru: 'название зоны теста',
              en: 'the name of a test zone',
              pl: 'nazwa strefy testu',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что особенно опасно при ПИН?',
            en: 'What is especially dangerous in a PTS?',
            pl: 'Co jest szczególnie niebezpieczne przy PŹK?',
          },
          opts: [
            {
              ru: 'высокая энергия',
              en: 'high energy',
              pl: 'wysoka energia',
            },
            {
              ru: 'хорошее настроение',
              en: 'a good mood',
              pl: 'dobry nastrój',
            },
            {
              ru: '«дно» — момент, когда у человека нет ни настроения, ни энергии',
              en: 'the "bottom" — the moment when the person has neither mood nor energy',
              pl: '„dno” — moment, gdy człowiek nie ma ani nastroju, ani energii',
            },
            {
              ru: 'высокая D',
              en: 'a high D',
              pl: 'wysokie D',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Синдром «обязан быть правым» загорается, когда:',
            en: 'The "obliged to be right" syndrome lights up when:',
            pl: 'Syndrom „musi mieć rację” zapala się, gdy:',
          },
          opts: [
            {
              ru: 'точка D самая низкая',
              en: 'point D is the lowest',
              pl: 'punkt D jest najniższy',
            },
            {
              ru: 'уверенность (D) — самая высокая точка, в высокой зоне и выше всех остальных',
              en: 'certainty (D) is the highest point, in the high zone and above all the rest',
              pl: 'pewność (D) jest najwyższym punktem, w wysokiej strefie i powyżej wszystkich pozostałych',
            },
            {
              ru: 'высокая активность',
              en: 'high activity',
              pl: 'wysoka aktywność',
            },
            {
              ru: 'низкая ответственность',
              en: 'low responsibility',
              pl: 'niska odpowiedzialność',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кто такой «карьерист» по тесту?',
            en: 'Who is the "careerist" according to the test?',
            pl: 'Kim jest „karierowicz” według testu?',
          },
          opts: [
            {
              ru: 'человек с сильной зоной «иметь»',
              en: 'a person with a strong "having" zone',
              pl: 'człowiek z silną strefą „mieć”',
            },
            {
              ru: 'человек, который ценит отношения',
              en: 'a person who values relationships',
              pl: 'człowiek, który ceni relacje',
            },
            {
              ru: 'человек с плавающими точками',
              en: 'a person with floating points',
              pl: 'człowiek z pływającymi punktami',
            },
            {
              ru: 'восходящий график с сильной зоной «делать», кто думает прежде всего о себе и работе («быть, а не иметь»)',
              en: 'an ascending graph with a strong "doing" zone, who thinks above all about himself and work ("being, not having")',
              pl: 'rosnący wykres z silną strefą „robić”, kto myśli przede wszystkim o sobie i pracy („być, a nie mieć”)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Синдром «Обвиняющий» — это сочетание:',
            en: 'The "Accuser" syndrome is a combination of:',
            pl: 'Syndrom „Oskarżający” to połączenie:',
          },
          opts: [
            {
              ru: 'низкой объективности, низкой ответственности и очень высокой настойчивости',
              en: 'low objectivity, low responsibility, and very high persistence',
              pl: 'niskiej obiektywności, niskiej odpowiedzialności i bardzo wysokiej wytrwałości',
            },
            {
              ru: 'высокой чуткости и низкой общительности',
              en: 'high sensitivity and low sociability',
              pl: 'wysokiej wrażliwości i niskiej towarzyskości',
            },
            {
              ru: 'высокой активности и низкой внимательности',
              en: 'high activity and low attentiveness',
              pl: 'wysokiej aktywności i niskiej uważności',
            },
            {
              ru: 'высокой ответственности и высокой D',
              en: 'high responsibility and high D',
              pl: 'wysokiej odpowiedzialności i wysokiego D',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Синдром «Плюшевый мишка» — это:',
            en: 'The "Teddy Bear" syndrome is:',
            pl: 'Syndrom „Pluszowy miś” to:',
          },
          opts: [
            {
              ru: 'низкая объективность + высокая настойчивость',
              en: 'low objectivity + high persistence',
              pl: 'niska obiektywność + wysoka wytrwałość',
            },
            {
              ru: 'высокая активность + низкая внимательность',
              en: 'high activity + low attentiveness',
              pl: 'wysoka aktywność + niska uważność',
            },
            {
              ru: 'очень высокая чуткость при очень низкой общительности (человека «используют», «вытирают о него ноги»)',
              en: 'very high sensitivity with very low sociability (the person is "used," people "wipe their feet on him")',
              pl: 'bardzo wysoka wrażliwość przy bardzo niskiej towarzyskości (człowiek jest „wykorzystywany”, „wyciera się o niego nogi”)',
            },
            {
              ru: 'все показатели на одном высоком уровне',
              en: 'all indicators at the same high level',
              pl: 'wszystkie wskaźniki na jednym wysokim poziomie',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Синдром «Рассеянный» — это:',
            en: 'The "Absent-minded" syndrome is:',
            pl: 'Syndrom „Roztargniony” to:',
          },
          opts: [
            {
              ru: 'высокая объективность + высокая внимательность',
              en: 'high objectivity + high attentiveness',
              pl: 'wysoka obiektywność + wysoka uważność',
            },
            {
              ru: 'высокая активность при очень низкой внимательности (много действий, но человек путается, забывает, теряет нить)',
              en: 'high activity with very low attentiveness (a lot of action, but the person gets confused, forgets, loses the thread)',
              pl: 'wysoka aktywność przy bardzo niskiej uważności (dużo działań, ale człowiek się gubi, zapomina, traci wątek)',
            },
            {
              ru: 'высокая настойчивость при низкой ответственности',
              en: 'high persistence with low responsibility',
              pl: 'wysoka wytrwałość przy niskiej odpowiedzialności',
            },
            {
              ru: 'высокая ответственность + высокая D',
              en: 'high responsibility + high D',
              pl: 'wysoka odpowiedzialność + wysokie D',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Синдром «Педант» — это сочетание:',
            en: 'The "Pedant" syndrome is a combination of:',
            pl: 'Syndrom „Pedant” to połączenie:',
          },
          opts: [
            {
              ru: 'низкой объективности и низкой ответственности',
              en: 'low objectivity and low responsibility',
              pl: 'niskiej obiektywności i niskiej odpowiedzialności',
            },
            {
              ru: 'высокой активности и низкой внимательности',
              en: 'high activity and low attentiveness',
              pl: 'wysokiej aktywności i niskiej uważności',
            },
            {
              ru: 'очень высокой чуткости и низкой общительности',
              en: 'very high sensitivity and low sociability',
              pl: 'bardzo wysokiej wrażliwości i niskiej towarzyskości',
            },
            {
              ru: 'высокой объективности вместе с высокой внимательностью (строг, дотошен, критичен к деталям)',
              en: 'high objectivity together with high attentiveness (strict, meticulous, critical of details)',
              pl: 'wysokiej obiektywności wraz z wysoką uważnością (surowy, drobiazgowy, krytyczny wobec detali)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'В синдроме «Динамит» что задаёт длину «шнура»?',
            en: 'In the "Dynamite" syndrome, what sets the length of the "fuse"?',
            pl: 'W syndromie „Dynamit” co wyznacza długość „lontu”?',
          },
          opts: [
            {
              ru: 'внимательность (A) — насколько далеко человек просчитывает последствия',
              en: 'attentiveness (A) — how far ahead the person calculates the consequences',
              pl: 'uważność (A) — jak daleko człowiek przewiduje konsekwencje',
            },
            {
              ru: 'настойчивость (F)',
              en: 'persistence (F)',
              pl: 'wytrwałość (F)',
            },
            {
              ru: 'ответственность (G)',
              en: 'responsibility (G)',
              pl: 'odpowiedzialność (G)',
            },
            {
              ru: 'самообладание (C)',
              en: 'self-possession (C)',
              pl: 'panowanie nad sobą (C)',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'В синдроме «Динамит» что показывает ответственность (G)?',
            en: 'In the "Dynamite" syndrome, what does responsibility (G) show?',
            pl: 'W syndromie „Dynamit” co pokazuje odpowiedzialność (G)?',
          },
          opts: [
            {
              ru: 'длину шнура',
              en: 'the length of the fuse',
              pl: 'długość lontu',
            },
            {
              ru: 'силу взрыва',
              en: 'the force of the explosion',
              pl: 'siłę wybuchu',
            },
            {
              ru: '«сухость системы» — саму вероятность того, что «рванёт»',
              en: 'the "dryness of the system" — the very probability that it will "go off"',
              pl: '„suchość systemu” — samo prawdopodobieństwo tego, że „wybuchnie”',
            },
            {
              ru: 'число «искр»',
              en: 'the number of "sparks"',
              pl: 'liczbę „iskier”',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Синдром «Лучшего» — это:',
            en: 'The "Best" syndrome is:',
            pl: 'Syndrom „Najlepszego” to:',
          },
          opts: [
            {
              ru: 'все показатели высокие',
              en: 'all indicators are high',
              pl: 'wszystkie wskaźniki są wysokie',
            },
            {
              ru: 'очень высокая настойчивость при очень низкой ответственности: доводит дела до конца, но стремится сделать всё идеально, чтобы не подвергнуться критике',
              en: 'very high persistence with very low responsibility: he sees things through, but strives to do everything perfectly so as not to be exposed to criticism',
              pl: 'bardzo wysoka wytrwałość przy bardzo niskiej odpowiedzialności: doprowadza sprawy do końca, ale dąży do zrobienia wszystkiego idealnie, aby nie narazić się na krytykę',
            },
            {
              ru: 'высокая чуткость + низкая общительность',
              en: 'high sensitivity + low sociability',
              pl: 'wysoka wrażliwość + niska towarzyskość',
            },
            {
              ru: 'высокая активность + высокая ответственность',
              en: 'high activity + high responsibility',
              pl: 'wysoka aktywność + wysoka odpowiedzialność',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Синдром «Очень эффективен» — это:',
            en: 'The "Very Effective" syndrome is:',
            pl: 'Syndrom „Bardzo efektywny” to:',
          },
          opts: [
            {
              ru: 'одна точка резко выделяется',
              en: 'one point stands out sharply',
              pl: 'jeden punkt wyraźnie się wyróżnia',
            },
            {
              ru: 'две плавающие точки',
              en: 'two floating points',
              pl: 'dwa pływające punkty',
            },
            {
              ru: 'низкая объективность + высокая настойчивость',
              en: 'low objectivity + high persistence',
              pl: 'niska obiektywność + wysoka wytrwałość',
            },
            {
              ru: 'все показатели в высокой зоне и примерно на одном уровне (колебания в пределах 10 пунктов) — на таких людей можно делать ставку',
              en: 'all indicators in the high zone and roughly at the same level (fluctuations within 10 points) — such people can be bet on',
              pl: 'wszystkie wskaźniki w wysokiej strefie i mniej więcej na jednym poziomie (wahania w granicach 10 punktów) — na takich ludzi można postawić',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Синдром «Инициативный» — это сочетание:',
            en: 'The "Initiative-taking" syndrome is a combination of:',
            pl: 'Syndrom „Inicjatywny” to połączenie:',
          },
          opts: [
            {
              ru: 'высокой активности с высокой ответственностью (любит отвечать за свои дела и при этом сам начинает действовать)',
              en: 'high activity with high responsibility (he likes to answer for his own affairs and at the same time starts acting on his own)',
              pl: 'wysokiej aktywności z wysoką odpowiedzialnością (lubi odpowiadać za swoje sprawy i przy tym sam zaczyna działać)',
            },
            {
              ru: 'высокой активности с нежеланием отвечать',
              en: 'high activity with an unwillingness to answer',
              pl: 'wysokiej aktywności z niechęcią do odpowiadania',
            },
            {
              ru: 'низкой активности с высокой ответственностью',
              en: 'low activity with high responsibility',
              pl: 'niskiej aktywności z wysoką odpowiedzialnością',
            },
            {
              ru: 'высокой чуткости с низкой общительностью',
              en: 'high sensitivity with low sociability',
              pl: 'wysokiej wrażliwości z niską towarzyskością',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Синдром «Недостаточно инициативный» — это:',
            en: 'The "Insufficiently proactive" syndrome is:',
            pl: 'Syndrom „Niewystarczająco inicjatywny” to:',
          },
          opts: [
            {
              ru: 'все показатели низкие',
              en: 'all indicators are low',
              pl: 'wszystkie wskaźniki są niskie',
            },
            {
              ru: 'высокая ответственность при низкой активности',
              en: 'high responsibility with low activity',
              pl: 'wysoka odpowiedzialność przy niskiej aktywności',
            },
            {
              ru: 'высокая активность, но человек не любит отвечать и не выносит давления — сам, без влияния извне, действовать не станет',
              en: 'high activity, but the person does not like to answer and cannot bear pressure — he will not act on his own, without outside influence',
              pl: 'wysoka aktywność, ale człowiek nie lubi odpowiadać i nie znosi presji — sam, bez wpływu z zewnątrz, nie zacznie działać',
            },
            {
              ru: 'очень высокая настойчивость',
              en: 'very high persistence',
              pl: 'bardzo wysoka wytrwałość',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Какому соотношению точек соответствует синдром неэффективности, а какому — синдром лени?',
            en: 'Which ratio of points corresponds to the syndrome of ineffectiveness, and which to the syndrome of laziness?',
            pl: 'Któremu stosunkowi punktów odpowiada syndrom nieefektywności, a któremu — syndrom lenistwa?',
          },
          opts: [
            {
              ru: 'неэффективность: F>E; лень: E>F',
              en: 'ineffectiveness: F>E; laziness: E>F',
              pl: 'nieefektywność: F>E; lenistwo: E>F',
            },
            {
              ru: 'неэффективность: активность выше настойчивости (E>F); лень: наоборот (F>E)',
              en: 'ineffectiveness: activity higher than persistence (E>F); laziness: the opposite (F>E)',
              pl: 'nieefektywność: aktywność wyższa od wytrwałości (E>F); lenistwo: odwrotnie (F>E)',
            },
            {
              ru: 'оба — это E>F',
              en: 'both are E>F',
              pl: 'oba to E>F',
            },
            {
              ru: 'они не связаны с соотношением точек',
              en: 'they are not related to the ratio of points',
              pl: 'nie są związane ze stosunkiem punktów',
            },
          ],
          correct: 1,
        },
      ],
    },
  },
};
