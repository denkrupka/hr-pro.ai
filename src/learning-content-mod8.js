'use strict';
// Контент программы «Личностные качества (Точка G)» (ru/en/pl).
// Мёржится в learning.js через Object.assign по ключу 'module-g'.

// Врезки-боксы 1-в-1 из программы productivity-winners / module-abc / module-def.
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
  'module-g': {
    sections: [
      // 1 — ВВЕДЕНИЕ + КЛЮЧЕВОЙ КОНЦЕПТ
      {
        id: 'intro',
        title: {
          ru: 'Точка G. Ответственность · Введение',
          en: 'Point G. Responsibility · Introduction',
          pl: 'Punkt G. Odpowiedzialność · Wprowadzenie',
        },
        desc: {
          ru: 'О чём этот модуль и ключевой концепт точки G — устойчивость экстраверсии и модель «пушки».',
          en: 'What this module is about and the key concept of point G — the stability of extroversion and the "cannon" model.',
          pl: 'O czym jest ten moduł i kluczowy koncept punktu G — stabilność ekstrawersji i model „armaty”.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 8 · ТОЧКА G</strong></p>' +
            '<p>Точка G. Ответственность</p>' +
            '<p>Устойчивость экстраверсии: модель «пушки», почему низкая ответственность — это ранимость, а не безответственность, компульсивная ответственность и манипуляция, и как говорить об этой точке.</p>' +
            '<h2>Модуль 8. Точка G. Ответственность</h2>' +
            '<p>Ответственность — одна из самых непонятых в обществе точек: вокруг неё больше всего ложных представлений. И одновременно одна из самых важных для оценки. В этом модуле мы разберём, что она показывает, как читать её вместе с точками A и B, почему низкая ответственность — это ранимость, а вовсе не «безответственность», что такое компульсивная ответственность и связанное с ней манипулирование, и как говорить об этой точке — и с положительной стороны, и в «инструкции по эксплуатации» для руководителя.</p>' +
            '<h3>Глава 1. Ключевой концепт: устойчивость экстраверсии</h3>' +
            '<p>Ключевой концепт точки G — устойчивость экстраверсии. Экстраверсия — это когда мы смотрим наружу. А устойчивость экстраверсии — это насколько устойчиво мы смотрим наружу, то есть какой силой на нас надо надавить, чтобы мы начали смотреть внутрь себя.</p>' +
            '<p>Вспомним модель «пушки». У каждого человека есть как бы пушка, направленная наружу, — это и есть экстраверсия. Когда появляется встречная энергия (нас критикуют, на нас давят), вопрос в том, насколько человек готов иметь с ней дело. Если готов — он продолжает смотреть наружу. А в той степени, в какой он не готов её конфронтировать, пушка разворачивается внутрь. Ответственность — это, образно говоря, крепость «гаечки»: насколько крепко она закручена, чтобы пушка не развернулась вовнутрь. Хаббард сформулировал это так: суть ответственности — это готовность иметь дело с энергией. А в основе всего этого лежит конфронт: встречную энергию надо просто конфронтировать.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Ответственность — это устойчивость экстраверсии: насколько устойчиво человек смотрит наружу и какой силой надо на него надавить, чтобы он начал смотреть внутрь себя. Ещё короче Хаббард определил её так: «ответственность — это способность удерживать». Удерживать в первую очередь свой реактивный ум — как глупую злобную собачку, которая дремлет и вдруг на кого-то прыгает, и которую надо уметь удержать командой «сидеть». А также удерживать импульсы, которые толкают нас на то, чего лучше не делать, — иначе мы теряем свободу.', true)),
          en:
            '<p><strong>MODULE 8 · POINT G</strong></p>' +
            '<p>Point G. Responsibility</p>' +
            '<p>The stability of extroversion: the "cannon" model, why low responsibility is vulnerability rather than irresponsibility, compulsive responsibility and manipulation, and how to speak about this point.</p>' +
            '<h2>Module 8. Point G. Responsibility</h2>' +
            '<p>Responsibility is one of the points most misunderstood in society: around it there are the most false notions. And at the same time one of the most important for an assessment. In this module we will examine what it shows, how to read it together with points A and B, why low responsibility is vulnerability and not at all "irresponsibility," what compulsive responsibility is and the manipulation associated with it, and how to speak about this point — both from the positive side and in the "operating manual" for the manager.</p>' +
            '<h3>Chapter 1. The key concept: the stability of extroversion</h3>' +
            '<p>The key concept of point G is the stability of extroversion. Extroversion is when we look outward. And the stability of extroversion is how steadily we look outward, that is, with what force one has to press on us for us to begin looking inside ourselves.</p>' +
            '<p>Let us recall the "cannon" model. Every person has, as it were, a cannon pointed outward — this is extroversion. When an incoming energy appears (we are criticized, we are pressured), the question is how ready the person is to deal with it. If he is ready — he goes on looking outward. But to the degree that he is not ready to confront it, the cannon turns inward. Responsibility is, figuratively speaking, the tightness of the "little nut": how tightly it is screwed on, so that the cannon does not turn inward. Hubbard formulated it thus: the essence of responsibility is a willingness to deal with energy. And at the base of all this lies confront: the incoming energy must simply be confronted.</p>' +
            k('DEFINITION',
              bp('Responsibility is the stability of extroversion: how steadily a person looks outward and with what force one has to press on him for him to begin looking inside himself. More briefly still, Hubbard defined it thus: "responsibility is the ability to hold." To hold, first of all, one\'s reactive mind — like a stupid, vicious little dog that dozes and suddenly jumps at someone, and which one must be able to hold back with the command "sit." And also to hold the impulses that push us toward what it is better not to do — otherwise we lose our freedom.', true)),
          pl:
            '<p><strong>MODUŁ 8 · PUNKT G</strong></p>' +
            '<p>Punkt G. Odpowiedzialność</p>' +
            '<p>Stabilność ekstrawersji: model „armaty”, dlaczego niska odpowiedzialność to wrażliwość, a nie nieodpowiedzialność, kompulsywna odpowiedzialność i manipulacja, oraz jak mówić o tym punkcie.</p>' +
            '<h2>Moduł 8. Punkt G. Odpowiedzialność</h2>' +
            '<p>Odpowiedzialność to jeden z najbardziej niezrozumianych w społeczeństwie punktów: wokół niego jest najwięcej fałszywych wyobrażeń. I jednocześnie jeden z najważniejszych dla oceny. W tym module omówimy, co pokazuje, jak czytać ją razem z punktami A i B, dlaczego niska odpowiedzialność to wrażliwość, a wcale nie „nieodpowiedzialność”, czym jest kompulsywna odpowiedzialność i związane z nią manipulowanie, oraz jak mówić o tym punkcie — i z pozytywnej strony, i w „instrukcji obsługi” dla kierownika.</p>' +
            '<h3>Rozdział 1. Kluczowy koncept: stabilność ekstrawersji</h3>' +
            '<p>Kluczowy koncept punktu G to stabilność ekstrawersji. Ekstrawersja to gdy patrzymy na zewnątrz. A stabilność ekstrawersji to na ile stabilnie patrzymy na zewnątrz, czyli jaką siłą trzeba na nas nacisnąć, żebyśmy zaczęli patrzeć w głąb siebie.</p>' +
            '<p>Przypomnijmy model „armaty”. Każdy człowiek ma jakby armatę skierowaną na zewnątrz — to i jest ekstrawersja. Gdy pojawia się energia napływająca (krytykują nas, naciskają na nas), pytanie jest w tym, na ile człowiek gotów jest mieć z nią do czynienia. Jeśli gotów — dalej patrzy na zewnątrz. A w tym stopniu, w jakim nie jest gotów jej konfrontować, armata odwraca się do wewnątrz. Odpowiedzialność to, obrazowo mówiąc, siła dokręcenia „nakrętki”: na ile mocno jest zakręcona, żeby armata nie odwróciła się do wewnątrz. Hubbard sformułował to tak: istotą odpowiedzialności jest gotowość do radzenia sobie z energią. A u podstaw tego wszystkiego leży konfront: napływającą energię trzeba po prostu konfrontować.</p>' +
            k('DEFINICJA',
              bp('Odpowiedzialność to stabilność ekstrawersji: na ile stabilnie człowiek patrzy na zewnątrz i jaką siłą trzeba na niego nacisnąć, żeby zaczął patrzeć w głąb siebie. Jeszcze krócej Hubbard zdefiniował ją tak: „odpowiedzialność to zdolność utrzymywania”. Utrzymywania w pierwszej kolejności swojego umysłu reaktywnego — jak głupiego, złego pieska, który drzemie i nagle na kogoś skacze, i którego trzeba umieć utrzymać komendą „siedź”. A także utrzymywania impulsów, które popychają nas do tego, czego lepiej nie robić — inaczej tracimy wolność.', true)),
        },
      },

      // 2 — КАК ЧИТАТЬ G ВМЕСТЕ С A И B
      {
        id: 'read-with-ab',
        title: {
          ru: 'Как читать G вместе с A и B',
          en: 'How to read G together with A and B',
          pl: 'Jak czytać G razem z A i B',
        },
        desc: {
          ru: 'Точка A показывает, насколько человеку больно при низкой ответственности, а точка B — как долго это длится.',
          en: 'Point A shows how painful low responsibility is for a person, and point B — how long it lasts.',
          pl: 'Punkt A pokazuje, jak boleśnie jest człowiekowi przy niskiej odpowiedzialności, a punkt B — jak długo to trwa.',
        },
        html: {
          ru:
            '<h2>Глава 2. Как читать G вместе с A и B</h2>' +
            '<p>Точка G почти всегда читается в паре с двумя другими точками.</p>' +
            '<p>Количество «макарон» в этой пушке показывает точка A (внимание). Отсюда важный вывод: если ответственность низкая (гаечка откручена, и пушка время от времени разворачивается внутрь), то человек, когда его критикуют или давят, сам себя прожигает этими «макаронами» — ведь, по большому счёту, никто не может сделать нам больно, кроме нас самих. А значит, чем выше у человека A, тем больнее он себе делает при низкой ответственности: было бы у него «три макаронины» — почесался бы и забыл, а при очень высокой A, когда пушка разворачивается, все эти тысячи «макарон» начинают прожигать его самого. Это очень больно.</p>' +
            '<p>А как долго это длится, показывает точка B (позитивность). Когда пушка разворачивается внутрь, человек в этот момент падает по шкале тонов вниз (наверху шкалы мы экстравертированы, внизу — интровертированы) и там же себя самообесценивает. Сколько он там пробудет, зависит от B: при хорошей B он восстанавливается быстро, а при низкой B (да ещё и высокой A) — надолго.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Точка G редко читается в одиночку. Точка A показывает, насколько человеку больно при низкой ответственности (сколько «макарон» прожигают его изнутри), а точка B — как долго это длится. Идеальное сочетание, чтобы низкая ответственность была не так болезненна, — это низкая A и высокая B.', true)),
          en:
            '<h2>Chapter 2. How to read G together with A and B</h2>' +
            '<p>Point G is almost always read in a pair with two other points.</p>' +
            '<p>The amount of "macaroni" in this cannon is shown by point A (attention). Hence an important conclusion: if responsibility is low (the nut is unscrewed, and the cannon from time to time turns inward), then the person, when he is criticized or pressured, burns himself with this "macaroni" — for, by and large, no one can hurt us except ourselves. And that means the higher a person\'s A, the more painfully he hurts himself when responsibility is low: had he "three noodles" of macaroni, he would scratch himself and forget it, but with a very high A, when the cannon turns, all those thousands of "noodles" begin to burn him. This is very painful.</p>' +
            '<p>And how long it lasts is shown by point B (positivity). When the cannon turns inward, the person at that moment drops down the tone scale (at the top of the scale we are extroverted, at the bottom — introverted), and there he also devalues himself. How long he stays there depends on B: with a good B he recovers quickly, and with a low B (and, on top of that, a high A) — for a long time.</p>' +
            k('KEY IDEA',
              bp('Point G is rarely read on its own. Point A shows how painful it is for a person when responsibility is low (how many "noodles" of macaroni burn him from within), and point B — how long it lasts. The ideal combination for low responsibility to be not so painful is a low A and a high B.', true)),
          pl:
            '<h2>Rozdział 2. Jak czytać G razem z A i B</h2>' +
            '<p>Punkt G prawie zawsze czyta się w parze z dwoma innymi punktami.</p>' +
            '<p>Ilość „makaronu” w tej armacie pokazuje punkt A (uwaga). Stąd ważny wniosek: jeśli odpowiedzialność jest niska (nakrętka odkręcona, i armata od czasu do czasu odwraca się do wewnątrz), to człowiek, gdy się go krytykuje albo naciska, sam siebie przepala tym „makaronem” — bo, ogólnie rzecz biorąc, nikt nie może sprawić nam bólu poza nami samymi. A znaczy, im wyższe u człowieka A, tym bardziej boleśnie sam sobie robi przy niskiej odpowiedzialności: miałby „trzy makarony” — podrapałby się i zapomniał, a przy bardzo wysokim A, gdy armata się odwraca, wszystkie te tysiące „makaronów” zaczynają przepalać jego samego. To bardzo boli.</p>' +
            '<p>A jak długo to trwa, pokazuje punkt B (pozytywność). Gdy armata odwraca się do wewnątrz, człowiek w tym momencie spada po skali tonów w dół (na górze skali jesteśmy ekstrawertowani, na dole — introwertowani) i tam też siebie obniża wartość. Ile tam pobędzie, zależy od B: przy dobrym B odbudowuje się szybko, a przy niskim B (a jeszcze i wysokim A) — na długo.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Punkt G rzadko czyta się w pojedynkę. Punkt A pokazuje, na ile człowiekowi jest boleśnie przy niskiej odpowiedzialności (ile „makaronów” przepala go od środka), a punkt B — jak długo to trwa. Idealne połączenie, żeby niska odpowiedzialność była nie tak bolesna, to niskie A i wysokie B.', true)),
        },
      },

      // 3 — ОТВЕТ ПРОТИВ РЕАКЦИИ; ВИНА ПРОТИВ ПРИЗНАНИЯ ПРИЧИНЫ
      {
        id: 'response-vs-reaction',
        title: {
          ru: 'Ответ против реакции; вина против признания причины',
          en: 'Response versus reaction; guilt versus acknowledging the cause',
          pl: 'Odpowiedź kontra reakcja; wina kontra uznanie przyczyny',
        },
        desc: {
          ru: 'Почему ответственность — это не вина, а признание того, что являешься причиной.',
          en: 'Why responsibility is not guilt but acknowledging that one is cause.',
          pl: 'Dlaczego odpowiedzialność to nie wina, lecz uznanie, że jest się przyczyną.',
        },
        html: {
          ru:
            '<h2>Глава 3. Ответ против реакции; вина против признания причины</h2>' +
            '<p>Из этого вытекает разница между ответом и реакцией. Когда что-то задевает реактивный ум человека, у него есть выбор. Чем выше ответственность, тем легче ему удержать банк в стороне и дать на ситуацию адекватный, более или менее рациональный ответ. А если удержать не получается, банк воздействует на человека, и его отклик идёт уже как бы через банк — искажённо и неадекватно; это называется реакция. Слова похожи, но разница принципиальна: ответ рационален, реакция — нет. Ответственность помогает нам в большем числе случаев отвечать, а не реагировать. При этом жизнь постоянно бьёт нас в слабое место: кто не может спокойно смотреть на голые коленки — у того они повсюду; кто боится хулиганов — у того постоянно кто-то просит закурить. Мы сами притягиваем это, потому что наши слабые места сидят в банке. И, как говорит одна из лучших цитат Хаббарда, «путь из — это путь через»: единственный способ через что-то выйти — развернуться к этому лицом, сконфронтировать и пройти сквозь.</p>' +
            '<p>Теперь о главном заблуждении. В обществе (и даже в некоторых словарях) ответственность путают с виной: мол, кто взял на себя вину, тот и ответственный. Доля истины тут есть, но небольшая. Вспомните пример: замдиректора по технике безопасности видит сотрудника со сломанной ногой, а коммерческий директор кричит на него «идиот!». Если ответственность — это вина, то ответственность выглядела бы так: «Это я, это из-за меня!» — и человек рвёт на себе волосы. Но куда он при этом смотрит? Внутрь. А это как раз противоположность ответственности. Хаббард написал:</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('«Полная ответственность — это не вина, это признание того, что являешься причиной». Когда человек винит и корит себя, он смотрит внутрь. А признавая себя причиной, он смотрит наружу — на последствия и на то, как всё исправить. Ответственность уменьшается от плохих поступков, причиной которых мы не захотели себя считать; а поднять её — значит правильнее жить и исправлять то, что сделал в прошлом. Признать «это из-за меня» — и есть истинная крутость, ведь по большому счёту всё вокруг нас в каком-то смысле из-за нас.', true)) +
            '<p>Здесь помогает образ «размера корыта»: что человек считает «из-за меня», а что «не из-за меня», он определяет сам — кто-то живёт «в тазике», а кто-то «в океане». Человек с высокой ответственностью видит последствия лучше — он не боится увидеть, что от его действий по воде пошли волны и в них кто-то может захлебнуться, поэтому и не огораживает себя маленьким «корытцем».</p>' +
            b('ПРИМЕР · Насколько трудно признать себя причиной',
              bp('Эту мысль хорошо иллюстрирует полушуточная история, которую рассказывает сооснователь HR-PRO.AI Мартин Рунов. Скучающий человек в ресторане от нечего делать подбрасывает зажигалку — и роняет её под ноги официантке, которая несёт большую кастрюлю горячего супа. Та спотыкается, кастрюля падает на соседний стол, где сидит большая семья; всё оборачивается бедой. Вызывают скорую — кареты так торопятся, что попадают в аварию на перекрёстке; машины горят. А это единственная улица к стадиону, где идёт важный матч; болельщики не могут пройти, начинается давка и беспорядки, и мэру приходится вводить в город войска. Смысл прост: чтобы сказать «это всё сделал я», нужна определённая крутость. Вот что на самом деле значит признавать себя причиной.', true)),
          en:
            '<h2>Chapter 3. Response versus reaction; guilt versus acknowledging the cause</h2>' +
            '<p>From this follows the difference between a response and a reaction. When something touches a person\'s reactive mind, he has a choice. The higher the responsibility, the easier it is for him to hold the bank aside and give an adequate, more or less rational response to the situation. But if he fails to hold it, the bank acts on the person, and his reply then comes, as it were, through the bank — distorted and inadequate; this is called a reaction. The words are similar, but the difference is fundamental: a response is rational, a reaction is not. Responsibility helps us in a greater number of cases to respond rather than to react. Meanwhile life constantly strikes us in our weak spot: he who cannot calmly look at bare knees — has them everywhere; he who fears hooligans — has someone constantly asking him for a light. We ourselves attract this, because our weak spots sit in the bank. And, as one of Hubbard\'s best quotes says, "the way out is the way through": the only way to get out through something is to turn to face it, confront it, and pass through it.</p>' +
            '<p>Now about the main misconception. In society (and even in some dictionaries) responsibility is confused with guilt: supposedly whoever took the blame is the responsible one. There is a grain of truth here, but a small one. Recall the example: the deputy director for occupational safety sees an employee with a broken leg, while the commercial director shouts at him "idiot!" If responsibility is guilt, then responsibility would look like this: "It\'s me, it\'s because of me!" — and the person tears his hair out. But where is he looking while he does this? Inward. And this is precisely the opposite of responsibility. Hubbard wrote:</p>' +
            k('KEY IDEA',
              bp('"Full responsibility is not guilt, it is acknowledging that one is cause." When a person blames and reproaches himself, he looks inward. But acknowledging himself as cause, he looks outward — at the consequences and at how to put everything right. Responsibility decreases from bad deeds of which we did not want to consider ourselves the cause; and to raise it means to live more rightly and to correct what one did in the past. To acknowledge "it\'s because of me" is the true mark of strength, for by and large everything around us is, in a sense, because of us.', true)) +
            '<p>Here the image of the "size of the trough" helps: what a person considers "because of me" and what "not because of me" he determines himself — one lives "in a washtub," another "in the ocean." A person with high responsibility sees consequences better — he is not afraid to see that from his actions ripples went across the water and that someone may choke in them, and so he does not fence himself off with a little "trough."</p>' +
            b('EXAMPLE · How hard it is to acknowledge oneself as cause',
              bp('This thought is well illustrated by a half-joking story told by HR-PRO.AI co-founder Martin Runov. A bored man in a restaurant, for want of anything better to do, tosses a lighter up and down — and drops it under the feet of a waitress carrying a large pot of hot soup. She stumbles, the pot falls onto the neighboring table, where a large family is sitting; the whole thing turns into a disaster. They call an ambulance — the ambulances are in such a hurry that they crash at the intersection; the cars catch fire. And this is the only street to the stadium where an important match is under way; the fans cannot get through, a crush and disorder begin, and the mayor has to bring troops into the city. The point is simple: to say "I did all of this" takes a certain strength. This is what acknowledging oneself as cause really means.', true)),
          pl:
            '<h2>Rozdział 3. Odpowiedź kontra reakcja; wina kontra uznanie przyczyny</h2>' +
            '<p>Z tego wynika różnica między odpowiedzią a reakcją. Gdy coś zahacza o umysł reaktywny człowieka, ma on wybór. Im wyższa odpowiedzialność, tym łatwiej mu utrzymać bank z boku i dać na sytuację adekwatną, mniej lub bardziej racjonalną odpowiedź. A jeśli utrzymać się nie udaje, bank oddziałuje na człowieka, i jego odzew idzie już jakby przez bank — zniekształcony i nieadekwatny; to nazywa się reakcja. Słowa są podobne, ale różnica jest zasadnicza: odpowiedź jest racjonalna, reakcja — nie. Odpowiedzialność pomaga nam w większej liczbie przypadków odpowiadać, a nie reagować. Przy tym życie nieustannie bije nas w słabe miejsce: kto nie może spokojnie patrzeć na gołe kolana — ma je wszędzie; kto boi się chuliganów — u tego ciągle ktoś prosi o ogień. Sami to przyciągamy, bo nasze słabe miejsca siedzą w banku. I, jak mówi jeden z najlepszych cytatów Hubbarda, „droga na zewnątrz to droga przez”: jedyny sposób, żeby przez coś wyjść — odwrócić się do tego twarzą, skonfrontować i przejść na wskroś.</p>' +
            '<p>Teraz o głównym błędnym przekonaniu. W społeczeństwie (a nawet w niektórych słownikach) odpowiedzialność myli się z winą: niby kto wziął na siebie winę, ten jest odpowiedzialny. Ziarno prawdy tu jest, ale niewielkie. Przypomnijcie sobie przykład: zastępca dyrektora ds. BHP widzi pracownika ze złamaną nogą, a dyrektor handlowy krzyczy na niego „idiota!”. Jeśli odpowiedzialność to wina, to odpowiedzialność wyglądałaby tak: „To ja, to przeze mnie!” — i człowiek rwie na sobie włosy. Ale gdzie przy tym patrzy? Do wewnątrz. A to właśnie przeciwieństwo odpowiedzialności. Hubbard napisał:</p>' +
            k('KLUCZOWA MYŚL',
              bp('„Pełna odpowiedzialność to nie wina, to uznanie, że jest się przyczyną”. Gdy człowiek wini i gani siebie, patrzy do wewnątrz. A uznając siebie za przyczynę, patrzy na zewnątrz — na następstwa i na to, jak wszystko naprawić. Odpowiedzialność zmniejsza się od złych czynów, których przyczyną nie zechcieliśmy siebie uznać; a podnieść ją — znaczy żyć bardziej właściwie i naprawiać to, co zrobiło się w przeszłości. Uznać „to przeze mnie” — i jest prawdziwą klasą, bo ogólnie rzecz biorąc wszystko wokół nas w pewnym sensie jest przez nas.', true)) +
            '<p>Tu pomaga obraz „rozmiaru koryta”: co człowiek uważa za „przeze mnie”, a co za „nie przeze mnie”, określa sam — ktoś żyje „w miednicy”, a ktoś „w oceanie”. Człowiek z wysoką odpowiedzialnością lepiej widzi następstwa — nie boi się zobaczyć, że od jego działań po wodzie poszły fale i że ktoś może się w nich zachłysnąć, dlatego i nie odgradza się małym „koryteckiem”.</p>' +
            b('PRZYKŁAD · Jak trudno jest uznać siebie za przyczynę',
              bp('Tę myśl dobrze ilustruje półżartobliwa historia, którą opowiada współzałożyciel HR-PRO.AI Martin Runow. Znudzony człowiek w restauracji z nudów podrzuca zapalniczkę — i upuszcza ją pod nogi kelnerce, która niesie duży garnek gorącej zupy. Ta się potyka, garnek spada na sąsiedni stół, gdzie siedzi duża rodzina; wszystko obraca się w nieszczęście. Wzywają pogotowie — karetki tak się śpieszą, że wpadają w wypadek na skrzyżowaniu; samochody płoną. A to jedyna ulica do stadionu, gdzie trwa ważny mecz; kibice nie mogą przejść, zaczyna się tłok i zamieszki, i burmistrz musi wprowadzić do miasta wojsko. Sens jest prosty: żeby powiedzieć „to wszystko zrobiłem ja”, potrzebna jest pewna klasa. Oto co naprawdę znaczy uznawać siebie za przyczynę.', true)),
        },
      },

      // 4 — НИЗКАЯ G — ЭТО РАНИМОСТЬ, А НЕ БЕЗОТВЕТСТВЕННОСТЬ
      {
        id: 'low-g-vulnerability',
        title: {
          ru: 'Низкая G — это ранимость, а не безответственность',
          en: 'A low G is vulnerability, not irresponsibility',
          pl: 'Niskie G to wrażliwość, a nie nieodpowiedzialność',
        },
        desc: {
          ru: 'Штамп, от которого надо избавиться: низкая ответственность — это ранимость, а не «человек, которому нельзя доверять».',
          en: 'A cliché to get rid of: low responsibility is vulnerability, not "a person who cannot be trusted."',
          pl: 'Schemat, którego trzeba się pozbyć: niska odpowiedzialność to wrażliwość, a nie „człowiek, któremu nie można ufać”.',
        },
        html: {
          ru:
            '<h2>Глава 4. Низкая G — это ранимость, а не безответственность</h2>' +
            '<p>А теперь — важнейший для оценки штамп, от которого надо избавиться. В обществе рассуждают так: «низкая ответственность» — значит, человек безответственный, а раз безответственный, значит, ему ничего нельзя поручить. Если вы будете смотреть на низкую точку G с этой позиции, вы постоянно будете видеть несоответствие между тестом и реальными людьми, потому что этот вывод неверен.</p>' +
            '<p>На самом деле всё наоборот: человек с низкой ответственностью старается сделать всё безупречно — как раз чтобы его не критиковали, не давили, чтобы ему не было больно. Его правильно называть не «безответственным», а ранимым: у него просто «макарончики жиденькие». Если на него не давить, он старается сделать всё изумительно хорошо, и поручить ему можно очень многое. На всех должностях, от самой высокой до самой низкой, полно прекрасных сотрудников с низкой ответственностью; их проблема — внутри них: им просто больно.</p>' +
            '<p>Здесь помогает образ: низкая ответственность — это дорогой фужер из тонкого стекла (брать и чокаться надо аккуратно), а высокая — толстая пивная кружка (ею можно чокаться). Проблема, когда они оказываются рядом: человеку с высокой ответственностью даже невдомёк, как больно человеку с низкой, — ведь тот часто держит всё под маской, и лишь иногда его выдают красные пятнышки над воротничком или капельки пота непонятно с чего.</p>' +
            '<p>Для бизнеса вывод такой: низкая ответственность тяжела там, где на человека давят и критикуют, — а это работа с людьми (люди критикуют куда больше, чем документы или мебель). Поэтому отвергать, скажем, бухгалтера из-за низкой ответственности — нелепость: в работе с документами ответственность почти не важна. А больше всего давят и критикуют, между прочим, на руководителя — им недовольны и клиенты (по-настоящему недовольный клиент рвётся сразу к первому лицу), и сотрудники, и проверяющие. Поэтому руководителю с низкой ответственностью тяжелее всего: он начинает избегать увольнений (ведь в ответ будут слёзы и упрёки вроде «а как же я теперь буду семью кормить?»), а в итоге держит массу людей, которых давно пора уволить, и вдобавок работает за них сам — потому что заставить людей работать помогает как раз давление, а его-то он и не может себе позволить.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Низкая ответственность — это не безответственность, а ранимость. Такой человек старается сделать всё безупречно, и поручить ему можно многое; ему просто больно, когда на него давят или критикуют. Никогда не смотрите на низкую G как на «человека, которому нельзя доверять».', true)),
          en:
            '<h2>Chapter 4. A low G is vulnerability, not irresponsibility</h2>' +
            '<p>And now — a cliché most important for an assessment, which one must get rid of. In society people reason thus: "low responsibility" means the person is irresponsible, and since he is irresponsible, he cannot be entrusted with anything. If you look at a low point G from this position, you will constantly see a discrepancy between the test and real people, because this conclusion is wrong.</p>' +
            '<p>In reality it is the other way round: a person with low responsibility tries to do everything flawlessly — precisely so that he will not be criticized or pressured, so that it will not hurt him. He is rightly called not "irresponsible" but vulnerable: his "macaroni" is simply thin and watery. If he is not pressured, he tries to do everything marvelously well, and a great deal can be entrusted to him. In all positions, from the highest to the lowest, there are plenty of splendid employees with low responsibility; their problem is inside them: it simply hurts them.</p>' +
            '<p>Here an image helps: low responsibility is an expensive goblet of thin glass (one must take it and clink it carefully), and high responsibility is a thick beer mug (you can clink it). The trouble is when they end up side by side: a person with high responsibility does not even conceive how painful it is for a person with a low one — for the latter often keeps everything under a mask, and only sometimes is he given away by red blotches above the collar or droplets of sweat from who knows what.</p>' +
            '<p>For business the conclusion is this: low responsibility is hard where a person is pressured and criticized — and that is work with people (people criticize far more than documents or furniture do). That is why to reject, say, an accountant because of low responsibility is absurd: in working with documents responsibility is almost unimportant. And it is the manager, by the way, who is most pressured and criticized — clients are dissatisfied with him (a truly dissatisfied client rushes straight to the top person), and so are employees and inspectors. That is why it is hardest of all for a manager with low responsibility: he begins to avoid dismissals (for in response there will be tears and reproaches of the sort "and how am I to feed my family now?"), and as a result he keeps a mass of people who should long since have been fired, and on top of that does their work himself — because it is precisely pressure that helps make people work, and this is the very thing he cannot allow himself.</p>' +
            k('KEY IDEA',
              bp('Low responsibility is not irresponsibility, but vulnerability. Such a person tries to do everything flawlessly, and much can be entrusted to him; it simply hurts him when he is pressured or criticized. Never look at a low G as at "a person who cannot be trusted."', true)),
          pl:
            '<h2>Rozdział 4. Niskie G to wrażliwość, a nie nieodpowiedzialność</h2>' +
            '<p>A teraz — najważniejszy dla oceny schemat, którego trzeba się pozbyć. W społeczeństwie rozumuje się tak: „niska odpowiedzialność” — znaczy, człowiek jest nieodpowiedzialny, a skoro nieodpowiedzialny, to nic nie można mu powierzyć. Jeśli będziecie patrzeć na niski punkt G z tej pozycji, będziecie nieustannie widzieć niezgodność między testem a realnymi ludźmi, bo ten wniosek jest błędny.</p>' +
            '<p>W rzeczywistości jest odwrotnie: człowiek z niską odpowiedzialnością stara się zrobić wszystko nienagannie — właśnie po to, żeby go nie krytykowano, nie naciskano, żeby nie było mu boleśnie. Właściwie nazywać go należy nie „nieodpowiedzialnym”, lecz wrażliwym: ma po prostu „rzadki makaronik”. Jeśli na niego nie naciskać, stara się zrobić wszystko zachwycająco dobrze, i powierzyć mu można bardzo wiele. Na wszystkich stanowiskach, od najwyższego do najniższego, pełno jest wspaniałych pracowników z niską odpowiedzialnością; ich problem jest wewnątrz nich: im po prostu jest boleśnie.</p>' +
            '<p>Tu pomaga obraz: niska odpowiedzialność to drogi kieliszek z cienkiego szkła (brać i stukać się trzeba ostrożnie), a wysoka to gruby kufel do piwa (nim można się stukać). Problem, gdy znajdą się obok: człowiekowi z wysoką odpowiedzialnością nawet w głowie się nie mieści, jak boleśnie jest człowiekowi z niską — ten bowiem często trzyma wszystko pod maską, i tylko czasem zdradzają go czerwone plamki nad kołnierzykiem albo kropelki potu nie wiadomo z czego.</p>' +
            '<p>Dla biznesu wniosek jest taki: niska odpowiedzialność jest ciężka tam, gdzie na człowieka naciskają i go krytykują — a to praca z ludźmi (ludzie krytykują o wiele bardziej niż dokumenty czy meble). Dlatego odrzucać, powiedzmy, księgowego z powodu niskiej odpowiedzialności to niedorzeczność: w pracy z dokumentami odpowiedzialność jest prawie nieważna. A najbardziej naciskają i krytykują, nawiasem mówiąc, kierownika — niezadowoleni z niego są i klienci (naprawdę niezadowolony klient rwie się od razu do pierwszej osoby), i pracownicy, i kontrolerzy. Dlatego kierownikowi z niską odpowiedzialnością jest najciężej: zaczyna unikać zwolnień (bo w odpowiedzi będą łzy i wyrzuty w rodzaju „a jak ja teraz będę rodzinę utrzymywał?”), a w efekcie trzyma masę ludzi, których dawno pora zwolnić, i w dodatku pracuje za nich sam — bo zmusić ludzi do pracy pomaga właśnie nacisk, a tego on sobie pozwolić nie może.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Niska odpowiedzialność to nie nieodpowiedzialność, lecz wrażliwość. Taki człowiek stara się zrobić wszystko nienagannie, i powierzyć mu można wiele; po prostu jest mu boleśnie, gdy się na niego naciska albo krytykuje. Nigdy nie patrzcie na niskie G jak na „człowieka, któremu nie można ufać”.', true)),
        },
      },

      // 5 — КОМПУЛЬСИВНАЯ ОТВЕТСТВЕННОСТЬ И МАНИПУЛЯЦИЯ
      {
        id: 'compulsive-g',
        title: {
          ru: 'Компульсивная ответственность и манипуляция',
          en: 'Compulsive responsibility and manipulation',
          pl: 'Kompulsywna odpowiedzialność i manipulacja',
        },
        desc: {
          ru: 'Выключатель вместо регулятора, расчёт последствий и почему сила «дёргать за ниточки» оборачивается слабостью.',
          en: 'An on/off switch instead of a regulator, calculating consequences, and why the strength of "pulling the strings" turns into weakness.',
          pl: 'Włącznik zamiast regulatora, obliczanie następstw i dlaczego siła „pociągania za sznurki” obraca się słabością.',
        },
        html: {
          ru:
            '<h2>Глава 5. Компульсивная ответственность и манипуляция</h2>' +
            '<p>Компульсивная ответственность — особая вещь. Обычная (некомпульсивная) высокая ответственность имеет «регулятор мощности»: под слабым давлением человек почти не интровертируется, под сильным — начинает потихоньку, и это естественно. А компульсивная ответственность интровертироваться «по чуть-чуть» не умеет: человек всё время смотрит только наружу и вообще не может заглянуть внутрь себя (потому что там «растут не только розы»). Но регулятора у него нет, только выключатель, — и если давление окажется таким сильным, что «гаечку» всё-таки сорвёт, он не интровертируется постепенно, а отключается полностью: «делайте что хотите, я ничего не знаю». Такое действительно случается.</p>' +
            '<p>Кроме того, человек с компульсивной ответственностью должен видеть последствия — не может их не видеть, всё время их рассчитывает. А рассчитывая последствия, он начинает манипулировать: он редко может прямо сказать, чего хочет, и вместо этого неявно подводит вас к нужному ему, «дёргая за ниточки». Способность дёргать за ниточки сама по себе сильная, но у компульсивной ответственности она превратилась в слабость — потому что человек не может иначе и этим злит окружающих. Он ещё и должен быть причиной, создавать следствие, — отсюда любовь шокировать и поражать людей (зелёные волосы, тёмные очки, которые он не снимает целыми днями, важные отлучки «на встречи»).</p>' +
            b('ПРИМЕР · Манипулятор в тёмных очках',
              bp('На одном длинном семинаре был участник, который ни разу не снял тёмные очки, хотя прожекторы ему в глаза не светили, и перед каждым перерывом с важным видом куда-то уходил. Он попытался манипулировать и мной. В перерыве подошёл: «Интересная у вас технология… И тесты хорошие… Вот я вчера с консультантом пообщался». И замолкает — вынуждая меня спросить «ну и как?». «Консультант симпатичный». Снова пауза. «Хотя, думаю, консультанты могли бы быть и поподготовленнее». И так далее — как в шахматах: ты ходишь, ожидая ответного хода. Но шахматные фигуры отличаются от людей тем, что люди думают и чувствуют; когда нас дёргают за ниточки, нам это не нравится — и мне не понравилось. Про его тест я ему так ничего и не рассказал. В этом и проблема компульсивной ответственности: человеку не хватает конфронта, чтобы сказать прямо, — и его огромная «ответственность» оборачивается слабостью.', true)) +
            '<p>Небольшая оговорка об уровне: компульсивной мы считаем точку, которая выше D. Но у ответственности компульсивность можно подозревать уже начиная примерно с 25–30 — не потому, что истинной ответственности в 50–60 не бывает, а потому, что при истинно высокой ответственности человек настолько осознаёт себя причиной, что активно и с результатом действует во многих областях жизни (не только бизнес, но и помощь людям, животным, забота об экологии) — и в интервью на продуктивность это было бы видно. У большинства сотрудников этого нет, поэтому, увидев ответственность от 30 и выше, обычно можно считать её компульсивной.</p>',
          en:
            '<h2>Chapter 5. Compulsive responsibility and manipulation</h2>' +
            '<p>Compulsive responsibility is a special thing. Ordinary (non-compulsive) high responsibility has a "power regulator": under weak pressure the person hardly introverts at all, under strong pressure he begins little by little, and this is natural. But compulsive responsibility cannot introvert "a little at a time": the person looks only outward all the time and cannot look inside himself at all (because in there "not only roses grow"). But he has no regulator, only an on/off switch — and if the pressure turns out to be so strong that it does tear off the "nut," he does not introvert gradually but switches off completely: "do what you like, I know nothing." This really does happen.</p>' +
            '<p>Besides, a person with compulsive responsibility must see the consequences — cannot help seeing them, calculates them all the time. And calculating the consequences, he begins to manipulate: he can rarely say directly what he wants, and instead covertly leads you toward what he needs, "pulling the strings." The ability to pull the strings is in itself strong, but with compulsive responsibility it has turned into a weakness — because the person cannot do otherwise and by this angers those around him. He also must be a cause, must create an effect — hence the love of shocking and astonishing people (green hair, dark glasses that he does not take off for days on end, important departures "for meetings").</p>' +
            b('EXAMPLE · The manipulator in dark glasses',
              bp('At one long seminar there was a participant who never once took off his dark glasses, though the spotlights were not shining in his eyes, and before every break, with an important air, he went off somewhere. He tried to manipulate me too. During a break he came up: "Interesting technology you have… And good tests… I talked with a consultant yesterday, you know." And he falls silent — forcing me to ask "well, and how was it?" "The consultant is likeable." Another pause. "Although, I think, the consultants could be better prepared." And so on — as in chess: you make a move, expecting a move in reply. But chess pieces differ from people in that people think and feel; when we are pulled by the strings, we do not like it — and I did not like it. About his test I ended up telling him nothing at all. Herein lies the very problem of compulsive responsibility: the person lacks the confront to speak directly — and his enormous "responsibility" turns into a weakness.', true)) +
            '<p>A small caveat about the level: we consider compulsive a point that is higher than D. But in the case of responsibility, compulsiveness can be suspected already from about 25–30 — not because true responsibility of 50–60 does not occur, but because with truly high responsibility a person is so aware of himself as cause that he acts actively and with results in many areas of life (not only business, but also helping people, animals, care for the environment) — and in a productivity interview this would be visible. Most employees do not have this, so, having seen responsibility of 30 and up, one can usually consider it compulsive.</p>',
          pl:
            '<h2>Rozdział 5. Kompulsywna odpowiedzialność i manipulacja</h2>' +
            '<p>Kompulsywna odpowiedzialność to rzecz szczególna. Zwykła (niekompulsywna) wysoka odpowiedzialność ma „regulator mocy”: pod słabym naciskiem człowiek prawie się nie introwertuje, pod silnym — zaczyna po trochu, i to naturalne. A kompulsywna odpowiedzialność introwertować się „po trochu” nie umie: człowiek cały czas patrzy tylko na zewnątrz i w ogóle nie może zajrzeć w głąb siebie (bo tam „rosną nie tylko róże”). Ale regulatora nie ma, tylko włącznik — i jeśli nacisk okaże się tak silny, że „nakrętkę” jednak zerwie, on nie introwertuje się stopniowo, lecz odłącza się całkowicie: „róbcie, co chcecie, ja nic nie wiem”. Tak rzeczywiście się zdarza.</p>' +
            '<p>Poza tym człowiek z kompulsywną odpowiedzialnością musi widzieć następstwa — nie może ich nie widzieć, cały czas je oblicza. A obliczając następstwa, zaczyna manipulować: rzadko potrafi wprost powiedzieć, czego chce, i zamiast tego niejawnie podprowadza was do potrzebnego mu, „pociągając za sznurki”. Zdolność pociągania za sznurki sama w sobie jest silna, ale u kompulsywnej odpowiedzialności zamieniła się w słabość — bo człowiek nie umie inaczej i tym złości otoczenie. Musi też być przyczyną, tworzyć skutek — stąd zamiłowanie do szokowania i zadziwiania ludzi (zielone włosy, ciemne okulary, których nie zdejmuje całymi dniami, ważne wyjścia „na spotkania”).</p>' +
            b('PRZYKŁAD · Manipulator w ciemnych okularach',
              bp('Na jednym długim seminarium był uczestnik, który ani razu nie zdjął ciemnych okularów, choć reflektory nie świeciły mu w oczy, i przed każdą przerwą z ważną miną gdzieś wychodził. Spróbował manipulować i mną. W przerwie podszedł: „Ciekawa u was technologia… I testy dobre… O, wczoraj z konsultantem porozmawiałem”. I milknie — zmuszając mnie do zapytania „no i jak?”. „Konsultant sympatyczny”. Znów pauza. „Choć, myślę, konsultanci mogliby być i lepiej przygotowani”. I tak dalej — jak w szachach: ty robisz ruch, oczekując odpowiedniego ruchu. Ale figury szachowe różnią się od ludzi tym, że ludzie myślą i czują; gdy pociąga się nas za sznurki, nam się to nie podoba — i mnie się nie spodobało. O jego teście tak mu nic i nie opowiedziałem. W tym właśnie jest problem kompulsywnej odpowiedzialności: człowiekowi brakuje konfrontu, żeby powiedzieć wprost — i jego ogromna „odpowiedzialność” obraca się słabością.', true)) +
            '<p>Niewielkie zastrzeżenie co do poziomu: za kompulsywny uważamy punkt, który jest wyższy od D. Ale u odpowiedzialności kompulsywność można podejrzewać już mniej więcej od 25–30 — nie dlatego, że prawdziwej odpowiedzialności w 50–60 nie bywa, lecz dlatego, że przy prawdziwie wysokiej odpowiedzialności człowiek na tyle uświadamia sobie siebie jako przyczynę, że aktywnie i z wynikiem działa w wielu dziedzinach życia (nie tylko biznes, ale i pomoc ludziom, zwierzętom, troska o ekologię) — i w wywiadzie na produktywność byłoby to widać. U większości pracowników tego nie ma, dlatego, zobaczywszy odpowiedzialność od 30 wzwyż, zwykle można uważać ją za kompulsywną.</p>',
        },
      },

      // 6 — КАК ГОВОРИТЬ О ТОЧКЕ G И ЧТО СОВЕТОВАТЬ РУКОВОДИТЕЛЮ
      {
        id: 'how-to-talk-g',
        title: {
          ru: 'Как говорить о точке G и что советовать руководителю',
          en: 'How to speak about point G and what to advise the manager',
          pl: 'Jak mówić o punkcie G i co doradzać kierownikowi',
        },
        desc: {
          ru: 'Правила разговора о плюсах при низкой, высокой и компульсивной G и «инструкция по эксплуатации» для руководителя.',
          en: 'Rules for speaking about the pluses with low, high and compulsive G, and the "operating manual" for the manager.',
          pl: 'Zasady mówienia o plusach przy niskim, wysokim i kompulsywnym G oraz „instrukcja obsługi” dla kierownika.',
        },
        html: {
          ru:
            '<h2>Глава 6. Как говорить о точке G и что советовать руководителю</h2>' +
            '<p>Первое и главное правило: человеку с низкой ответственностью никогда нельзя говорить, что у него низкая ответственность. Он поймёт это так, как принято в обществе, — что он безответственный и ему нельзя ничего поручить, — а это ещё и неправда, поэтому он справедливо с этим не согласится. (А вот человеку с высокой ответственностью сказать это можно: он пофигист, для него это лишь повод согласиться «конечно, я мог бы брать и больше».) Как же тогда говорить о плюсах?</p>' +
            '<p>Если ответственность низкая (ниже минус тридцати пяти), скажите: «ты не любишь несправедливую критику» (а ему, в сущности, любая критика кажется несправедливой — он же «ни при чём»); «ты берёшь на себя максимум ответственности» (в его понимании это так — он изо всех сил старается всё сделать хорошо); «тебе приходится отвечать за всех и работать за всех»; «ты стараешься быть безупречным». Можно добавить «ты эмоционален» (если чуткость не очень низкая) — но не объясняя почему. А если при этом высокая B — «ты иногда расстраиваешься из-за критики, но быстро восстанавливаешься». Эти фразы попадают не в бровь, а в глаз: человек видит, что вы понимаете его насквозь, — и это сильно укрепляет доверие. (В зоне примерно от минус двадцати до минус тридцати пяти особо сказать нечего, а от минус двадцати и выше ответственность уже считается высокой.)</p>' +
            '<p>Если ответственность высокая, говорите прямо: «у тебя внутри стальной стержень, в обороне ты монстр»; «мало кто видел твою спину, когда ты убегаешь» (даже отступая, такой человек продолжает смотреть наружу, а не бежит зажмурившись). Если настойчивость при этом низкая — «снаружи ты осторожный, похож на сдутый мячик, но внутри у тебя камни: кто примет твою мягкость за слабость, тот отобьёт об тебя руку». Можно и раскрыть: «если надо, ты выдержишь давление, сможешь уволить, сможешь быть лицом к лицу с неприятным и не зажмуриться — ведь кто-то же должен иметь дело с неприятным, и ты это можешь».</p>' +
            '<p>Если ответственность компульсивная, скажите «ты очень крутой» и «ты видишь и рассчитываешь последствия» (но не «ты манипулируешь людьми» — это уже не плюс). Можно добавить «ты знаешь, как добиться, чтобы люди делали то, что ты хочешь», — но осторожно: если тон у человека низкий, он воспримет это как разоблачение, поэтому при низком тоне такую фразу не произносите.</p>' +
            t('ПРИМЕНЕНИЕ В НАЙМЕ · Инструкция по эксплуатации: точка G',
              bp('Если ответственность низкая, руководителю стоит посоветовать быть очень осторожным с критикой: «у тебя в руках тонкий фужер, ранимый человек». Если сам руководитель толстокожий (с высокой ответственностью), объясните ему: «все люди разные — тебе критика по барабану, а для неё это как нож, да ещё с солью; не дави, не ругай и не подставляй её под критику — не поручай ей улаживать разъярённого клиента, иначе потом придётся улаживать ещё и её». И полезный житейский совет: в напряжённой ситуации не садитесь напротив такого человека (человек напротив напоминает ему тех, кто давил на него в прошлом), а садитесь рядом и обсуждайте не «кто прав, кто виноват», а «давай решать, что с этим делать», — тем самым как бы разглаживая его «макароны».') +
              bp('Если ответственность высокая, тут всё просто: «её ответственность — повод для гордости; и с ней можешь не церемониться» (иначе, если сказать «церемонься», руководитель начнёт церемониться со всеми).') +
              bp('Если ответственность компульсивная, объясните руководителю: «под тобой манипулятор». Насколько он опасен, зависит от тона: при низком тоне надо прямо предупредить об опасности, а при нормальном — он манипулирует, скорее всего, в хорошую сторону, но всё равно этим достаёт. Лучший приём — прямой разговор (это уже шаг о минусах): «ты классно манипулируешь людьми, критика тебя не задевает — так вот, манипулируй кем угодно, только не мной; я вижу тебя насквозь, и за каждую попытку мной манипулировать твоя премия будет уменьшаться». Такой человек, кстати, на это не обижается — ему, наоборот, интересно, что его «раскусили».', true)),
          en:
            '<h2>Chapter 6. How to speak about point G and what to advise the manager</h2>' +
            '<p>The first and main rule: a person with low responsibility must never be told that he has low responsibility. He will understand it as it is customary to in society — that he is irresponsible and cannot be entrusted with anything — and this is also untrue, so he will justifiably not agree with it. (But a person with high responsibility can be told this: he is easygoing, and for him it is merely an occasion to agree "of course, I could take on even more.") So how, then, is one to speak about the pluses?</p>' +
            '<p>If responsibility is low (below minus thirty-five), say: "you don\'t like unfair criticism" (and to him, in essence, any criticism seems unfair — he is, after all, "not to blame"); "you take on the maximum of responsibility" (in his understanding this is so — he tries with all his might to do everything well); "you have to answer for everyone and work for everyone"; "you try to be flawless." One can add "you\'re emotional" (if sensitivity is not very low) — but without explaining why. And if together with this there is a high B — "you sometimes get upset over criticism, but recover quickly." These phrases hit not the eyebrow but the eye: the person sees that you understand him through and through — and this greatly strengthens trust. (In the zone of roughly minus twenty to minus thirty-five there is not much to say in particular, and from minus twenty and up responsibility is already considered high.)</p>' +
            '<p>If responsibility is high, speak directly: "you have a steel core inside, on the defensive you\'re a monster"; "few have seen your back as you run away" (even in retreat, such a person goes on looking outward, rather than running with his eyes shut). If persistence is low at that — "on the outside you\'re cautious, you look like a deflated ball, but inside you have stones: whoever mistakes your softness for weakness will hurt their hand on you." One can also spell it out: "if need be, you\'ll withstand pressure, you\'ll be able to fire someone, you\'ll be able to be face to face with the unpleasant and not flinch — for someone, after all, has to deal with the unpleasant, and you can."</p>' +
            '<p>If responsibility is compulsive, say "you\'re very strong" and "you see and calculate consequences" (but not "you manipulate people" — that is no longer a plus). One can add "you know how to get people to do what you want" — but carefully: if the person\'s tone is low, he will take it as an exposure, so with a low tone do not utter such a phrase.</p>' +
            t('APPLICATION IN HIRING · Operating manual: point G',
              bp('If responsibility is low, it is worth advising the manager to be very careful with criticism: "you have in your hands a thin goblet, a vulnerable person." If the manager himself is thick-skinned (with high responsibility), explain to him: "all people are different — to you criticism means nothing, but to her it is like a knife, and with salt on it too; don\'t pressure, don\'t scold, and don\'t expose her to criticism — don\'t assign her to handle an enraged client, or afterward you\'ll have to handle her as well." And a useful everyday piece of advice: in a tense situation, do not sit across from such a person (a person opposite reminds him of those who pressured him in the past), but sit beside him and discuss not "who\'s right and who\'s to blame," but "let\'s decide what to do about this" — thereby, as it were, smoothing out his "macaroni."') +
              bp('If responsibility is high, here everything is simple: "her responsibility is a source of pride; and you needn\'t stand on ceremony with her" (otherwise, if you say "stand on ceremony," the manager will begin to stand on ceremony with everyone).') +
              bp('If responsibility is compulsive, explain to the manager: "you\'ve got a manipulator under you." How dangerous he is depends on the tone: with a low tone one must directly warn of the danger, and with a normal one — he most likely manipulates in a good direction, but is a nuisance with it all the same. The best technique is a direct conversation (this is already the minuses step): "you manipulate people wonderfully, criticism doesn\'t touch you — so, manipulate anyone you like, only not me; I see through you, and for every attempt to manipulate me your bonus will be reduced." Such a person, by the way, does not take offense at this — on the contrary, he finds it interesting that he has been "seen through."', true)),
          pl:
            '<h2>Rozdział 6. Jak mówić o punkcie G i co doradzać kierownikowi</h2>' +
            '<p>Pierwsza i główna zasada: człowiekowi z niską odpowiedzialnością nigdy nie wolno mówić, że ma niską odpowiedzialność. Zrozumie to tak, jak przyjęto w społeczeństwie — że jest nieodpowiedzialny i nic nie można mu powierzyć — a to w dodatku nieprawda, dlatego słusznie się z tym nie zgodzi. (A oto człowiekowi z wysoką odpowiedzialnością powiedzieć to można: jest luzakiem, dla niego to jedynie powód, żeby się zgodzić „oczywiście, mógłbym brać i więcej”.) Jak więc mówić o plusach?</p>' +
            '<p>Jeśli odpowiedzialność jest niska (poniżej minus trzydzieści pięć), powiedzcie: „nie lubisz niesprawiedliwej krytyki” (a jemu w gruncie rzeczy każda krytyka wydaje się niesprawiedliwa — jest przecież „nie przy tym”); „bierzesz na siebie maksimum odpowiedzialności” (w jego rozumieniu tak jest — ze wszystkich sił stara się wszystko zrobić dobrze); „musisz odpowiadać za wszystkich i pracować za wszystkich”; „starasz się być nienaganny”. Można dodać „jesteś emocjonalny” (jeśli wrażliwość nie jest bardzo niska) — ale nie objaśniając dlaczego. A jeśli przy tym jest wysokie B — „czasem rozstrajasz się z powodu krytyki, ale szybko się odbudowujesz”. Te zdania trafiają nie w brew, lecz w oko: człowiek widzi, że rozumiecie go na wskroś — i to mocno wzmacnia zaufanie. (W strefie mniej więcej od minus dwudziestu do minus trzydziestu pięciu specjalnie nie ma co powiedzieć, a od minus dwudziestu wzwyż odpowiedzialność uważa się już za wysoką.)</p>' +
            '<p>Jeśli odpowiedzialność jest wysoka, mówcie wprost: „masz w środku stalowy rdzeń, w obronie jesteś potworem”; „mało kto widział twoje plecy, gdy uciekasz” (nawet cofając się, taki człowiek dalej patrzy na zewnątrz, a nie ucieka z zaciśniętymi oczami). Jeśli wytrwałość przy tym jest niska — „na zewnątrz jesteś ostrożny, przypominasz zdmuchniętą piłeczkę, ale w środku masz kamienie: kto weźmie twoją miękkość za słabość, ten odbije sobie o ciebie rękę”. Można i rozwinąć: „jeśli trzeba, wytrzymasz nacisk, będziesz mógł zwolnić, będziesz mógł być twarzą w twarz z nieprzyjemnym i się nie skulić — ktoś przecież musi mieć do czynienia z nieprzyjemnym, a ty to potrafisz”.</p>' +
            '<p>Jeśli odpowiedzialność jest kompulsywna, powiedzcie „jesteś bardzo klasowy” i „widzisz i obliczasz następstwa” (ale nie „manipulujesz ludźmi” — to już nie plus). Można dodać „wiesz, jak doprowadzić do tego, żeby ludzie robili to, co chcesz” — ale ostrożnie: jeśli ton u człowieka jest niski, odbierze to jak zdemaskowanie, dlatego przy niskim tonie takiego zdania nie wypowiadajcie.</p>' +
            t('ZASTOSOWANIE W REKRUTACJI · Instrukcja obsługi: punkt G',
              bp('Jeśli odpowiedzialność jest niska, kierownikowi warto poradzić, żeby był bardzo ostrożny z krytyką: „masz w rękach cienki kieliszek, wrażliwego człowieka”. Jeśli sam kierownik jest gruboskórny (z wysoką odpowiedzialnością), objaśnijcie mu: „wszyscy ludzie są różni — tobie krytyka jest obojętna, a dla niej to jak nóż, i to jeszcze z solą; nie naciskaj, nie łaj i nie podstawiaj jej pod krytykę — nie zlecaj jej rozładowywania rozwścieczonego klienta, inaczej potem trzeba będzie rozładowywać jeszcze i ją”. I pożyteczna życiowa rada: w napiętej sytuacji nie siadajcie naprzeciwko takiego człowieka (człowiek naprzeciwko przypomina mu tych, którzy naciskali na niego w przeszłości), lecz siadajcie obok i omawiajcie nie „kto ma rację, kto winny”, lecz „ustalmy, co z tym zrobić” — tym samym jakby wygładzając jego „makaron”.') +
              bp('Jeśli odpowiedzialność jest wysoka, tu wszystko proste: „jej odpowiedzialność to powód do dumy; i z nią możesz się nie cackać” (inaczej, jeśli powiedzieć „cackaj się”, kierownik zacznie się cackać ze wszystkimi).') +
              bp('Jeśli odpowiedzialność jest kompulsywna, objaśnijcie kierownikowi: „pod tobą jest manipulator”. Na ile jest niebezpieczny, zależy od tonu: przy niskim tonie trzeba wprost ostrzec o niebezpieczeństwie, a przy normalnym — manipuluje najprawdopodobniej w dobrą stronę, ale i tak tym dokucza. Najlepszy chwyt to rozmowa wprost (to już krok o minusach): „świetnie manipulujesz ludźmi, krytyka cię nie rusza — otóż manipuluj kimkolwiek, tylko nie mną; widzę cię na wskroś, i za każdą próbę manipulowania mną twoja premia będzie się zmniejszać”. Taki człowiek, à propos, nie obraża się o to — przeciwnie, jest mu ciekawie, że go „rozgryziono”.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Ключевой концепт точки G (ответственность) — это:',
            en: 'The key concept of point G (responsibility) is:',
            pl: 'Kluczowy koncept punktu G (odpowiedzialność) to:',
          },
          opts: [
            {
              ru: 'энергия',
              en: 'energy',
              pl: 'energia',
            },
            {
              ru: 'точка зрения',
              en: 'a point of view',
              pl: 'punkt widzenia',
            },
            {
              ru: 'прямота',
              en: 'directness',
              pl: 'bezpośredniość',
            },
            {
              ru: 'устойчивость экстраверсии — насколько устойчиво человек смотрит наружу',
              en: 'the stability of extroversion — how steadily a person looks outward',
              pl: 'stabilność ekstrawersji — na ile stabilnie człowiek patrzy na zewnątrz',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'В модели «пушки» экстраверсия — это:',
            en: 'In the "cannon" model, extroversion is:',
            pl: 'W modelu „armaty” ekstrawersja to:',
          },
          opts: [
            {
              ru: 'взгляд внутрь себя',
              en: 'a look inside oneself',
              pl: 'spojrzenie w głąb siebie',
            },
            {
              ru: 'отсутствие энергии',
              en: 'an absence of energy',
              pl: 'brak energii',
            },
            {
              ru: '«пушка», направленная наружу',
              en: 'a "cannon" pointed outward',
              pl: '„armata” skierowana na zewnątrz',
            },
            {
              ru: 'страх',
              en: 'fear',
              pl: 'strach',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что происходит с «пушкой», когда человек не готов конфронтировать встречную энергию (критику, давление)?',
            en: 'What happens to the "cannon" when a person is not ready to confront incoming energy (criticism, pressure)?',
            pl: 'Co dzieje się z „armatą”, gdy człowiek nie jest gotów konfrontować napływającej energii (krytyki, nacisku)?',
          },
          opts: [
            {
              ru: 'пушка стреляет ещё дальше',
              en: 'the cannon shoots even farther',
              pl: 'armata strzela jeszcze dalej',
            },
            {
              ru: 'пушка разворачивается внутрь (человек интровертируется)',
              en: 'the cannon turns inward (the person introverts)',
              pl: 'armata odwraca się do wewnątrz (człowiek się introwertuje)',
            },
            {
              ru: 'пушка исчезает',
              en: 'the cannon disappears',
              pl: 'armata znika',
            },
            {
              ru: 'ничего не происходит',
              en: 'nothing happens',
              pl: 'nic się nie dzieje',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Как Хаббард определил суть ответственности?',
            en: 'How did Hubbard define the essence of responsibility?',
            pl: 'Jak Hubbard określił istotę odpowiedzialności?',
          },
          opts: [
            {
              ru: 'готовность иметь дело с энергией; ещё короче — «способность удерживать»',
              en: 'a willingness to deal with energy; more briefly — "the ability to hold"',
              pl: 'gotowość do radzenia sobie z energią; jeszcze krócej — „zdolność utrzymywania”',
            },
            {
              ru: 'способность обвинять себя',
              en: 'the ability to blame oneself',
              pl: 'zdolność obwiniania siebie',
            },
            {
              ru: 'умение избегать давления',
              en: 'the skill of avoiding pressure',
              pl: 'umiejętność unikania nacisku',
            },
            {
              ru: 'количество взятых обязательств',
              en: 'the number of commitments taken on',
              pl: 'liczba wziętych zobowiązań',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что показывает точка A применительно к низкой ответственности (модель «макарон»)?',
            en: 'What does point A show in relation to low responsibility (the "macaroni" model)?',
            pl: 'Co pokazuje punkt A w odniesieniu do niskiej odpowiedzialności (model „makaronu”)?',
          },
          opts: [
            {
              ru: 'как долго длится боль',
              en: 'how long the pain lasts',
              pl: 'jak długo trwa ból',
            },
            {
              ru: 'уровень энергии',
              en: 'the level of energy',
              pl: 'poziom energii',
            },
            {
              ru: 'силу «взрыва»',
              en: 'the force of the "explosion"',
              pl: 'siłę „wybuchu”',
            },
            {
              ru: 'сколько «макарон» в пушке — то есть насколько человеку больно, когда пушка разворачивается внутрь',
              en: 'how much "macaroni" is in the cannon — that is, how painful it is for the person when the cannon turns inward',
              pl: 'ile „makaronu” jest w armacie — czyli na ile boleśnie jest człowiekowi, gdy armata odwraca się do wewnątrz',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Что показывает точка B в этой же модели?',
            en: 'What does point B show in this same model?',
            pl: 'Co pokazuje punkt B w tym samym modelu?',
          },
          opts: [
            {
              ru: 'силу боли',
              en: 'the intensity of the pain',
              pl: 'siłę bólu',
            },
            {
              ru: 'количество «макарон»',
              en: 'the amount of "macaroni"',
              pl: 'ilość „makaronu”',
            },
            {
              ru: 'как долго длится состояние (при хорошей B человек восстанавливается быстро)',
              en: 'how long the state lasts (with a good B the person recovers quickly)',
              pl: 'jak długo trwa stan (przy dobrym B człowiek odbudowuje się szybko)',
            },
            {
              ru: 'уровень интеллекта',
              en: 'the level of intelligence',
              pl: 'poziom inteligencji',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'В чём разница между «ответом» и «реакцией»?',
            en: 'What is the difference between a "response" and a "reaction"?',
            pl: 'Na czym polega różnica między „odpowiedzią” a „reakcją”?',
          },
          opts: [
            {
              ru: 'это одно и то же',
              en: 'they are one and the same',
              pl: 'to jedno i to samo',
            },
            {
              ru: 'ответ рационален (банк удержан в стороне), реакция идёт «через банк» — искажённо и неадекватно',
              en: 'a response is rational (the bank is held aside), a reaction goes "through the bank" — distorted and inadequate',
              pl: 'odpowiedź jest racjonalna (bank utrzymany z boku), reakcja idzie „przez bank” — zniekształcona i nieadekwatna',
            },
            {
              ru: 'реакция всегда лучше ответа',
              en: 'a reaction is always better than a response',
              pl: 'reakcja jest zawsze lepsza od odpowiedzi',
            },
            {
              ru: 'ответ всегда неадекватен',
              en: 'a response is always inadequate',
              pl: 'odpowiedź jest zawsze nieadekwatna',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Как Хаббард определяет полную ответственность?',
            en: 'How does Hubbard define full responsibility?',
            pl: 'Jak Hubbard definiuje pełną odpowiedzialność?',
          },
          opts: [
            {
              ru: '«это не вина, это признание того, что являешься причиной»',
              en: '"it is not guilt, it is acknowledging that one is cause"',
              pl: '„to nie wina, to uznanie, że jest się przyczyną”',
            },
            {
              ru: 'это способность винить себя сильнее всех',
              en: 'it is the ability to blame oneself more than anyone',
              pl: 'to zdolność obwiniania siebie bardziej niż wszyscy',
            },
            {
              ru: 'это готовность рвать на себе волосы',
              en: 'it is a readiness to tear one\'s hair out',
              pl: 'to gotowość, żeby rwać na sobie włosy',
            },
            {
              ru: 'это количество взятых обязательств',
              en: 'it is the number of commitments taken on',
              pl: 'to liczba wziętych zobowiązań',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Почему человек, который винит и корит себя, НЕ проявляет ответственность?',
            en: 'Why does a person who blames and reproaches himself NOT show responsibility?',
            pl: 'Dlaczego człowiek, który wini i gani siebie, NIE przejawia odpowiedzialności?',
          },
          opts: [
            {
              ru: 'потому что он слишком спокоен',
              en: 'because he is too calm',
              pl: 'ponieważ jest zbyt spokojny',
            },
            {
              ru: 'потому что он смотрит наружу',
              en: 'because he looks outward',
              pl: 'ponieważ patrzy na zewnątrz',
            },
            {
              ru: 'потому что он не чувствует вины',
              en: 'because he feels no guilt',
              pl: 'ponieważ nie czuje winy',
            },
            {
              ru: 'потому что он смотрит внутрь, а ответственность — это смотреть наружу (на последствия и как исправить)',
              en: 'because he looks inward, and responsibility means looking outward (at the consequences and at how to put things right)',
              pl: 'ponieważ patrzy do wewnątrz, a odpowiedzialność to patrzeć na zewnątrz (na następstwa i jak naprawić)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Как звучит одна из лучших цитат Хаббарда о выходе из трудностей?',
            en: 'How does one of Hubbard\'s best quotes about getting out of difficulties go?',
            pl: 'Jak brzmi jeden z najlepszych cytatów Hubbarda o wychodzeniu z trudności?',
          },
          opts: [
            {
              ru: '«сначала обойди проблему»',
              en: '"first go around the problem"',
              pl: '„najpierw obejdź problem”',
            },
            {
              ru: '«жди, и всё пройдёт само»',
              en: '"wait, and everything will pass on its own"',
              pl: '„czekaj, a wszystko samo przejdzie”',
            },
            {
              ru: '«путь из — это путь через» (развернуться лицом, сконфронтировать и пройти сквозь)',
              en: '"the way out is the way through" (turn to face it, confront it, and pass through)',
              pl: '„droga na zewnątrz to droga przez” (odwrócić się twarzą, skonfrontować i przejść na wskroś)',
            },
            {
              ru: '«избегай неприятного»',
              en: '"avoid the unpleasant"',
              pl: '„unikaj nieprzyjemnego”',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Низкая G — это:',
            en: 'A low G is:',
            pl: 'Niskie G to:',
          },
          opts: [
            {
              ru: 'безответственность',
              en: 'irresponsibility',
              pl: 'nieodpowiedzialność',
            },
            {
              ru: 'ранимость, а не безответственность: человек старается сделать всё безупречно, чтобы его не критиковали',
              en: 'vulnerability, not irresponsibility: the person tries to do everything flawlessly so that he will not be criticized',
              pl: 'wrażliwość, a nie nieodpowiedzialność: człowiek stara się zrobić wszystko nienagannie, żeby go nie krytykowano',
            },
            {
              ru: 'лень',
              en: 'laziness',
              pl: 'lenistwo',
            },
            {
              ru: 'глупость',
              en: 'stupidity',
              pl: 'głupota',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Где низкая ответственность тяжелее всего?',
            en: 'Where is low responsibility hardest of all?',
            pl: 'Gdzie niska odpowiedzialność jest najcięższa?',
          },
          opts: [
            {
              ru: 'в работе с людьми (люди критикуют куда больше, чем документы или мебель)',
              en: 'in working with people (people criticize far more than documents or furniture do)',
              pl: 'w pracy z ludźmi (ludzie krytykują o wiele bardziej niż dokumenty czy meble)',
            },
            {
              ru: 'в работе с документами',
              en: 'in working with documents',
              pl: 'w pracy z dokumentami',
            },
            {
              ru: 'в работе с техникой',
              en: 'in working with machinery',
              pl: 'w pracy z techniką',
            },
            {
              ru: 'она везде одинаково тяжела',
              en: 'it is equally hard everywhere',
              pl: 'jest wszędzie jednakowo ciężka',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Почему нелепо отвергать бухгалтера из-за низкой ответственности?',
            en: 'Why is it absurd to reject an accountant because of low responsibility?',
            pl: 'Dlaczego niedorzeczne jest odrzucać księgowego z powodu niskiej odpowiedzialności?',
          },
          opts: [
            {
              ru: 'бухгалтеры всегда безответственны',
              en: 'accountants are always irresponsible',
              pl: 'księgowi są zawsze nieodpowiedzialni',
            },
            {
              ru: 'ответственность бухгалтеру важнее всего',
              en: 'responsibility is most important of all for an accountant',
              pl: 'odpowiedzialność jest dla księgowego najważniejsza',
            },
            {
              ru: 'её у бухгалтера нельзя измерить',
              en: 'it cannot be measured in an accountant',
              pl: 'u księgowego nie można jej zmierzyć',
            },
            {
              ru: 'в работе с документами ответственность почти не важна — там на человека не давят и не критикуют, как в работе с людьми',
              en: 'in working with documents responsibility is almost unimportant — there a person is not pressured or criticized as in working with people',
              pl: 'w pracy z dokumentami odpowiedzialność jest prawie nieważna — tam na człowieka nie naciska się i nie krytykuje jak w pracy z ludźmi',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Компульсивная ответственность проявляется так, что человек:',
            en: 'Compulsive responsibility manifests such that the person:',
            pl: 'Kompulsywna odpowiedzialność przejawia się tak, że człowiek:',
          },
          opts: [
            {
              ru: 'полностью отключается при слабом давлении',
              en: 'switches off completely under weak pressure',
              pl: 'całkowicie się wyłącza przy słabym nacisku',
            },
            {
              ru: 'вообще не видит последствий',
              en: 'does not see consequences at all',
              pl: 'w ogóle nie widzi następstw',
            },
            {
              ru: 'должен видеть последствия, всё их рассчитывает — и начинает манипулировать, «дёргая за ниточки»',
              en: 'must see the consequences, calculates them all — and begins to manipulate, "pulling the strings"',
              pl: 'musi widzieć następstwa, wszystkie je oblicza — i zaczyna manipulować, „pociągając za sznurki”',
            },
            {
              ru: 'никогда не производит впечатление',
              en: 'never makes an impression',
              pl: 'nigdy nie robi wrażenia',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Что происходит с компульсивной ответственностью при очень сильном давлении?',
            en: 'What happens to compulsive responsibility under very strong pressure?',
            pl: 'Co dzieje się z kompulsywną odpowiedzialnością przy bardzo silnym nacisku?',
          },
          opts: [
            {
              ru: 'она плавно интровертируется «по чуть-чуть»',
              en: 'it introverts smoothly, "little by little"',
              pl: 'płynnie się introwertuje „po trochu”',
            },
            {
              ru: 'регулятора нет, только выключатель: человек не интровертируется постепенно, а отключается полностью («делайте что хотите, я ничего не знаю»)',
              en: 'there is no regulator, only an on/off switch: the person does not introvert gradually but switches off completely ("do what you want, I know nothing")',
              pl: 'nie ma regulatora, tylko włącznik: człowiek nie introwertuje się stopniowo, lecz wyłącza się całkowicie („róbcie co chcecie, ja nic nie wiem”)',
            },
            {
              ru: 'она только усиливается',
              en: 'it only intensifies',
              pl: 'tylko się wzmacnia',
            },
            {
              ru: 'ничего не происходит',
              en: 'nothing happens',
              pl: 'nic się nie dzieje',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Чего человеку с компульсивной ответственностью не хватает, чтобы сказать прямо?',
            en: 'What does a person with compulsive responsibility lack in order to speak directly?',
            pl: 'Czego brakuje człowiekowi z kompulsywną odpowiedzialnością, żeby powiedzieć wprost?',
          },
          opts: [
            {
              ru: 'конфронта — поэтому его огромная «ответственность» оборачивается слабостью (он манипулирует)',
              en: 'confront — that is why his enormous "responsibility" turns into weakness (he manipulates)',
              pl: 'konfrontu — dlatego jego ogromna „odpowiedzialność” obraca się słabością (manipuluje)',
            },
            {
              ru: 'интеллекта',
              en: 'intelligence',
              pl: 'inteligencji',
            },
            {
              ru: 'энергии',
              en: 'energy',
              pl: 'energii',
            },
            {
              ru: 'времени',
              en: 'time',
              pl: 'czasu',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Первое и главное правило: человеку с низкой ответственностью нельзя:',
            en: 'The first and main rule: a person with low responsibility must not be:',
            pl: 'Pierwsza i główna zasada: człowiekowi z niską odpowiedzialnością nie wolno:',
          },
          opts: [
            {
              ru: 'давать никаких заданий',
              en: 'given any tasks at all',
              pl: 'dawać żadnych zadań',
            },
            {
              ru: 'говорить о плюсах',
              en: 'told about his strengths',
              pl: 'mówić o plusach',
            },
            {
              ru: 'вообще доверять',
              en: 'trusted at all',
              pl: 'w ogóle ufać',
            },
            {
              ru: 'говорить, что у него низкая ответственность (он поймёт это как «безответственный», а это ещё и неправда)',
              en: 'told that he has low responsibility (he will understand it as "irresponsible," and it is untrue besides)',
              pl: 'mówić, że ma niską odpowiedzialność (zrozumie to jako „nieodpowiedzialny”, a do tego to nieprawda)',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Как положительно подать низкую ответственность на шаге о плюсах?',
            en: 'How should low responsibility be presented positively at the step about strengths?',
            pl: 'Jak pozytywnie przedstawić niską odpowiedzialność na kroku o plusach?',
          },
          opts: [
            {
              ru: '«ты безответственный»',
              en: '"you are irresponsible"',
              pl: '„jesteś nieodpowiedzialny”',
            },
            {
              ru: '«тебе нельзя доверять»',
              en: '"you cannot be trusted"',
              pl: '„nie można ci ufać”',
            },
            {
              ru: '«ты не любишь несправедливую критику; берёшь на себя максимум ответственности; стараешься быть безупречным»',
              en: '"you dislike unfair criticism; you take on the maximum of responsibility; you strive to be flawless"',
              pl: '„nie lubisz niesprawiedliwej krytyki; bierzesz na siebie maksimum odpowiedzialności; starasz się być nienaganny”',
            },
            {
              ru: 'лучше промолчать навсегда',
              en: 'better to stay silent forever',
              pl: 'lepiej zamilczeć na zawsze',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Как говорят о высокой ответственности?',
            en: 'How is high responsibility spoken of?',
            pl: 'Jak mówi się o wysokiej odpowiedzialności?',
          },
          opts: [
            {
              ru: '«тебе нельзя ничего поручить»',
              en: '"you cannot be entrusted with anything"',
              pl: '„nic nie można ci powierzyć”',
            },
            {
              ru: '«у тебя внутри стальной стержень, в обороне ты монстр; мало кто видел твою спину, когда ты убегаешь»',
              en: '"you have a steel core inside, in defense you are a monster; few have seen your back as you run away"',
              pl: '„masz w środku stalowy rdzeń, w obronie jesteś potworem; mało kto widział twoje plecy, gdy uciekasz”',
            },
            {
              ru: '«ты слишком раним»',
              en: '"you are too vulnerable"',
              pl: '„jesteś zbyt wrażliwy”',
            },
            {
              ru: '«ты манипулятор»',
              en: '"you are a manipulator"',
              pl: '„jesteś manipulatorem”',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какой практический совет даёт модуль по посадке в напряжённой ситуации с ранимым человеком (низкая G)?',
            en: 'What practical advice does the module give on seating in a tense situation with a vulnerable person (low G)?',
            pl: 'Jaką praktyczną radę daje moduł co do posadzenia w napiętej sytuacji z wrażliwym człowiekiem (niskie G)?',
          },
          opts: [
            {
              ru: 'не садиться напротив (это напоминает тех, кто давил), а сесть рядом и обсуждать «что с этим делать», а не «кто виноват»',
              en: 'not to sit opposite (it reminds him of those who pressured him), but to sit beside him and discuss "what to do about it" rather than "who is to blame"',
              pl: 'nie siadać naprzeciwko (to przypomina tych, którzy naciskali), lecz usiąść obok i omawiać „co z tym zrobić”, a nie „kto winny”',
            },
            {
              ru: 'сесть строго напротив',
              en: 'to sit strictly opposite',
              pl: 'usiąść dokładnie naprzeciwko',
            },
            {
              ru: 'вести разговор только стоя',
              en: 'to conduct the conversation only while standing',
              pl: 'prowadzić rozmowę tylko na stojąco',
            },
            {
              ru: 'не разговаривать с ним вовсе',
              en: 'not to talk to him at all',
              pl: 'w ogóle z nim nie rozmawiać',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что стоит объяснить толстокожему руководителю ранимого сотрудника (низкая G)?',
            en: 'What is worth explaining to the thick-skinned manager of a vulnerable employee (low G)?',
            pl: 'Co warto wyjaśnić gruboskórnemu kierownikowi wrażliwego pracownika (niskie G)?',
          },
          opts: [
            {
              ru: '«поручай ей самых злых клиентов»',
              en: '"assign her the angriest clients"',
              pl: '„powierzaj jej najbardziej wściekłych klientów”',
            },
            {
              ru: '«дави на неё посильнее»',
              en: '"pressure her harder"',
              pl: '„naciskaj na nią mocniej”',
            },
            {
              ru: '«критикуй её почаще»',
              en: '"criticize her more often"',
              pl: '„krytykuj ją częściej”',
            },
            {
              ru: '«все люди разные: тебе критика по барабану, а для неё это как нож; не дави, не ругай и не подставляй под критику»',
              en: '"people are all different: criticism means nothing to you, but for her it is like a knife; don\'t pressure, don\'t scold, and don\'t expose her to criticism"',
              pl: '„wszyscy ludzie są różni: tobie krytyka jest obojętna, a dla niej to jak nóż; nie naciskaj, nie strofuj i nie wystawiaj na krytykę”',
            },
          ],
          correct: 3,
        },
        {
          q: {
            ru: 'Обижается ли манипулятор (компульсивная G), когда его прямо «раскусывают»?',
            en: 'Does a manipulator (compulsive G) take offense when he is "seen through" directly?',
            pl: 'Czy manipulator (kompulsywne G) obraża się, gdy zostaje wprost „rozgryziony”?',
          },
          opts: [
            {
              ru: 'да, сильно обижается и увольняется',
              en: 'yes, he takes great offense and quits',
              pl: 'tak, bardzo się obraża i odchodzi',
            },
            {
              ru: 'да, подаёт в суд',
              en: 'yes, he takes it to court',
              pl: 'tak, podaje do sądu',
            },
            {
              ru: 'нет — наоборот, ему интересно, что его «раскусили»',
              en: 'no — on the contrary, he is intrigued that he was "seen through"',
              pl: 'nie — przeciwnie, jest mu ciekawie, że go „rozgryziono”',
            },
            {
              ru: 'он этого просто не замечает',
              en: 'he simply does not notice it',
              pl: 'po prostu tego nie zauważa',
            },
          ],
          correct: 2,
        },
        {
          q: {
            ru: 'Если суммировать: что показывает точка A вместе с G, а что — точка B?',
            en: 'To sum up: what does point A show together with G, and what does point B show?',
            pl: 'Podsumowując: co pokazuje punkt A razem z G, a co — punkt B?',
          },
          opts: [
            {
              ru: 'A — длительность, B — силу',
              en: 'A — duration, B — intensity',
              pl: 'A — czas trwania, B — siłę',
            },
            {
              ru: 'A — насколько человеку больно при низкой ответственности, B — как долго это длится (идеально: низкая A и высокая B)',
              en: 'A — how painful it is for the person when responsibility is low, B — how long it lasts (ideally: a low A and a high B)',
              pl: 'A — na ile boleśnie jest człowiekowi przy niskiej odpowiedzialności, B — jak długo to trwa (idealnie: niskie A i wysokie B)',
            },
            {
              ru: 'обе показывают энергию',
              en: 'both show energy',
              pl: 'obie pokazują energię',
            },
            {
              ru: 'они вообще не связаны с G',
              en: 'they have nothing to do with G at all',
              pl: 'w ogóle nie są związane z G',
            },
          ],
          correct: 1,
        },
      ],
    },
  },
};
