'use strict';
// Контент программы «Модуль 3. Продуктивность и состояния» (ru/en/pl). Мёржится в learning.js.

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
  'module-states': {
    trailer: { ru: '/media/module3-trailer-ru.mp4', pl: '', en: '' },
    sections: [
      // 1 — ВВЕДЕНИЕ
      {
        id: 'intro',
        title: {
          ru: 'Модуль 3. Продуктивность, обмен и состояния · Введение',
          en: 'Module 3. Productivity, exchange, and states · Introduction',
          pl: 'Moduł 3. Produktywność, wymiana i stany · Wprowadzenie',
        },
        desc: {
          ru: 'Что делать с сотрудником в первые часы и дни: принципы, а не готовые рецепты.',
          en: 'What to do with an employee in the first hours and days: principles, not ready-made recipes.',
          pl: 'Co robić z pracownikiem w pierwszych godzinach i dniach: zasady, a nie gotowe recepty.',
        },
        html: {
          ru:
            '<p><strong>МОДУЛЬ 3 · ПРОДУКТИВНОСТЬ, ОБМЕН И СОСТОЯНИЯ СОТРУДНИКА</strong></p>' +
            '<p>Что делать с новым сотрудником в первые часы и дни: почему пользу видно сразу, закон обмена в действии и две универсальные формулы состояний — несуществование и опасность.</p>' +
            '<h2>О чём этот модуль</h2>' +
            '<p>В первых двух модулях мы построили рабочую модель разума, вывели закон обмена и подробно разобрали точку D. Теперь мы переходим ко второй большой части — оценке тестов. И начнём с очень практичного вопроса, который стоит на самой границе между наймом и управлением: что делать с сотрудником в первые часы и дни его работы? Причём почти всё это одинаково относится и к тому, кого мы наняли с рынка труда, и к тому, кого мы просто перевели с одной должности на другую внутри компании.</p>' +
            '<p>Сразу оговорюсь про сам подход. Я не буду давать «готовые рецепты» в духе «сделай раз, два, три — получишь результат». В такой сложной области, как люди, готовый рецепт — это, по сути, то, что сработало в какой-то другой компании; если слепо всунуть его в свою, не понимая, на чём он основан, он не сработает, потому что у каждой компании своя специфика. Даже в кулинарии, где всё вроде бы проще, готовый рецепт даёт промашку: у меня по одному и тому же рецепту вдруг начала горчить уха — оказалось, из-за одной рыбы, которую в отличие от остальной выращивали на искусственном корме; убрал её — горечь ушла. Поэтому я буду давать не рецепты, а принципы, основы, на которых всё строится: соединив их с вашим знанием собственной специфики, вы сами родите рецепт, который у вас сработает.</p>' +
            b('НА ЗАМЕТКУ',
              bp('В этом модуле речь идёт о двух опорах правильного введения в должность. Первая — <strong>принцип обмена</strong>: не давать человеку только получать, а с первых дней позволить ему производить полезное. Вторая — <strong>формула несуществования</strong>: помочь новичку пройти состояние, в котором он оказывается в момент входа в компанию. Всё дальнейшее — развитие этих двух идей.', true)),
          en:
            '<p><strong>MODULE 3 · PRODUCTIVITY, EXCHANGE, AND THE EMPLOYEE\'S STATES</strong></p>' +
            '<p>What to do with a new employee in the first hours and days: why benefit is visible at once, the law of exchange in action, and two universal formulas of states — non-existence and danger.</p>' +
            '<h2>What this module is about</h2>' +
            '<p>In the first two modules we built a working model of the mind, derived the law of exchange, and examined point D in detail. Now we move on to the second large part — test assessment. And we will begin with a very practical question that stands on the very border between hiring and management: what to do with an employee in the first hours and days of his work? And almost all of this applies equally both to the one we hired from the labor market and to the one we simply transferred from one position to another within the company.</p>' +
            '<p>Let me note at once about the approach itself. I will not give "ready-made recipes" in the spirit of "do one, two, three — get a result." In an area as complex as people, a ready-made recipe is, in essence, something that worked in some other company; if you blindly stuff it into your own, without understanding what it rests on, it will not work, because every company has its own specifics. Even in cooking, where everything is seemingly simpler, a ready-made recipe misfires: with me, by one and the same recipe, the fish soup suddenly began to taste bitter — it turned out to be because of a single fish that, unlike the rest, had been raised on artificial feed; I removed it, and the bitterness went away. That is why I will give not recipes but principles, the fundamentals on which everything is built: by combining them with your knowledge of your own specifics, you will yourselves give birth to a recipe that will work for you.</p>' +
            b('NOTE',
              bp('This module is about two pillars of a proper induction into a position. The first is the <strong>principle of exchange</strong>: not to let a person only receive, but from the first days to allow him to produce something useful. The second is the <strong>formula of non-existence</strong>: to help the newcomer get through the state in which he finds himself at the moment of entering the company. Everything that follows is a development of these two ideas.', true)),
          pl:
            '<p><strong>MODUŁ 3 · PRODUKTYWNOŚĆ, WYMIANA I STANY PRACOWNIKA</strong></p>' +
            '<p>Co robić z nowym pracownikiem w pierwszych godzinach i dniach: dlaczego pożytek widać od razu, prawo wymiany w działaniu i dwie uniwersalne formuły stanów — nieistnienie i niebezpieczeństwo.</p>' +
            '<h2>O czym jest ten moduł</h2>' +
            '<p>W pierwszych dwóch modułach zbudowaliśmy roboczy model umysłu, wyprowadziliśmy prawo wymiany i szczegółowo omówiliśmy punkt D. Teraz przechodzimy do drugiej dużej części — oceny testów. I zaczniemy od bardzo praktycznego pytania, które stoi na samej granicy między rekrutacją a zarządzaniem: co robić z pracownikiem w pierwszych godzinach i dniach jego pracy? Przy czym prawie wszystko to odnosi się jednakowo i do tego, kogo zatrudniliśmy z rynku pracy, i do tego, kogo po prostu przenieśliśmy z jednego stanowiska na inne wewnątrz firmy.</p>' +
            '<p>Od razu zastrzegę co do samego podejścia. Nie będę dawał „gotowych recept" w duchu „zrób raz, dwa, trzy — dostaniesz wynik". W tak złożonej dziedzinie, jak ludzie, gotowa recepta to w istocie coś, co zadziałało w jakiejś innej firmie; jeśli ślepo wetknąć ją do swojej, nie rozumiejąc, na czym się opiera, nie zadziała, bo każda firma ma swoją specyfikę. Nawet w kuchni, gdzie wszystko niby prostsze, gotowa recepta daje wpadkę: u mnie według jednego i tego samego przepisu nagle zaczęła gorzknieć zupa rybna — okazało się, z powodu jednej ryby, którą w odróżnieniu od reszty hodowano na sztucznej paszy; usunąłem ją — gorycz zniknęła. Dlatego będę dawał nie recepty, lecz zasady, podstawy, na których wszystko się buduje: łącząc je z waszą znajomością własnej specyfiki, sami zrodzicie receptę, która u was zadziała.</p>' +
            b('DO ZAPAMIĘTANIA',
              bp('W tym module mowa jest o dwóch filarach prawidłowego wprowadzenia na stanowisko. Pierwszy — <strong>zasada wymiany</strong>: nie pozwalać człowiekowi tylko otrzymywać, lecz od pierwszych dni pozwolić mu wytwarzać coś pożytecznego. Drugi — <strong>formuła nieistnienia</strong>: pomóc nowicjuszowi przejść stan, w którym znajduje się w momencie wejścia do firmy. Wszystko dalsze to rozwinięcie tych dwóch idei.', true)),
        },
      },

      // 2 — ПРОДУКТИВНОСТЬ И ЛОВУШКА ВХОДЯЩЕГО ПОТОКА
      {
        id: 'productivity',
        title: {
          ru: 'Продуктивность и ловушка входящего потока',
          en: 'Productivity and the trap of the inflow',
          pl: 'Produktywność i pułapka przepływu przychodzącego',
        },
        desc: {
          ru: 'Почему пользу видно сразу и как компания своими руками губит хороших людей.',
          en: 'Why benefit is visible at once and how a company ruins good people with its own hands.',
          pl: 'Dlaczego pożytek widać od razu i jak firma własnymi rękami gubi dobrych ludzi.',
        },
        html: {
          ru:
            '<h2>Продуктивность: почему пользу видно сразу</h2>' +
            '<p>Начнём с цели. Что мы вообще хотим получить, работая с сотрудником в первые часы и дни? Если рассуждать как виннеры, нам нужно несколько вещей: чтобы он как можно быстрее начал приносить пользу, чтобы этой пользы во времени было как можно больше и чтобы он дольше у нас проработал. Одним словом, увеличить шансы на комфортное, успешное и долгосрочное сотрудничество.</p>' +
            '<p>Почему продуктивный человек быстро приносит пользу и стремится начать поскорее? Уточню, кого я называю продуктивным. Это не только виннер, который видит свой продукт, — продуктивные люди это виннеры и дуеры, причём дуеров на порядок больше. Именно о них я в основном и говорю: это люди, от которых мы видим пользу сразу, потому что они приносили её и раньше. А стремятся они начать поскорее вот почему: они привыкли чувствовать себя хорошо — гордо, комфортно, с высоко поднятой головой. А так человек может себя чувствовать, только когда производит исходящий поток, причём кому-то полезный. Посмотрите на себя: когда вам удаётся сделать что-то полезное — детям, клиентам, сотрудникам — это кайф. А когда вы слишком долго отдыхаете или целый день суетитесь без всякого результата, довольно скоро становится не по себе. Продуктивный человек это ощущение знает и не хочет его терять, поэтому стремится побыстрее выбраться из ямы, которая обычно образуется на новом месте.</p>' +
            '<p>Один американский исследователь прошлого века, Рон Хаббард, которого я уже несколько раз цитировал, сформулировал это так: «Производство — основа боевого духа». Основа значит причина, фундамент: от производства зависит боевой дух. Посмотрите, соответствует ли это вашим наблюдениям. Когда в компании много работы — горячий сезон, куча заказов, все перегружены, — жалоб почему-то немного, наоборот, все друг другу помогают. А в спады, когда людям просто нечего делать, начинаются жалобы, склоки, сплетни и «профсоюзные движения». Отсюда, кстати, практический вывод: если человека надо взбодрить — унылого сотрудника или, скажем, уставшую жену, — его нужно загрузить не претензиями, а работой. Мы ведь и без Хаббарда знаем, чем лечимся, когда нам фигово: начинаем впахивать.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Производство — основа боевого духа. Человек чувствует себя хорошо, только когда производит полезный кому-то исходящий поток. Но производство не равно боевому духу: чтобы дух был высоким, нужен ещё и входящий поток — то есть обмен, который, как мы знаем из закона обмена, отодвигает от человека реактивный ум и даёт ему пространство.', true)) +
            '<p>Из этого следуют две «страховки», которые мы получаем, нанимая продуктивного человека. Первая: раз он приносил пользу в прошлом, значит, может принести её и у нас. Вторая: он привык производить и хочет производить. А если вдруг он не может приносить пользу — мы поставили его не на ту должность, ему не хватает знаний или мешают личностные качества, — то это проблема не только наша, но и его: ему самому некомфортно. Видели ли вы людей, которые начинают буквально бунтовать, когда у них не получается работать? «Шеф, я так больше не могу, давай с этим что-то делать!» На наш взгляд, это самые ценные сотрудники — те, кто не может не работать. Сравните с непродуктивным человеком, который привык не приносить пользу: у него такой стиль жизни, и он ещё удивляется, чего это все вокруг напрягаются.</p>' +
            '<h2>Ловушка входящего потока</h2>' +
            '<p>Теперь посмотрим на ту же ситуацию со стороны обмена — и увидим ловушку, в которую попадает почти каждый новый сотрудник в большинстве компаний нашей цивилизации.</p>' +
            '<p>Мы наняли человека. С первого дня мы платим ему зарплату (пусть на испытательном сроке и меньшую) — это для него входящий поток. Дальше: на сколько-нибудь сложной должности он не может сразу начать выполнять свои функции — только дров наломает, — поэтому его надо ввести в курс, показать, объяснить, научить. А обучение — это тоже входящий поток. Вот уже два входящих потока. А где исходящий? Его нет. Особенно ярко это видно с руководителем: мало где человек с первого дня начинает реально руководить. То есть с первого дня мы человека, по сути, начинаем гробить: он получает много входящего и не отдаёт исходящего. Обмен нарушается, реактивный ум наваливается — и человек начинает чувствовать себя плохо.</p>' +
            '<p>А поскольку каждый из нас естественным образом стремится к обмену, у сотрудника, который не может отдавать, остаётся один способ этот обмен восстановить: обесценить то, что он получает. Механизм этот мы уже видели, когда разбирали закон обмена.</p>' +
            b('ПРИМЕР · Как обесценивается то, что нельзя вернуть',
              bp('Представьте, что вы состоятельный человек и подарили бедному родственнику — скажем, племяннику — дорогой пиджак. Он не может сделать вам адекватный ответный подарок: чтобы «сравняться», ему пришлось бы месяцами голодать всей семьёй. Что ему остаётся, чтобы восстановить обмен? Единственный доступный вариант — мысленно снизить цену подарка, то есть раскритиковать его. И вечером, к сожалению, у кого-то из них вполне может родиться мысль: «Хорош братик — раз в полгода заехал и не может подарить что-то новое, старьё своё с плеча снимает». Они делают это не потому, что плохие, а как раз потому, что хорошие: они стремятся к обмену.', true)) +
            '<p>Ровно то же происходит с новым сотрудником. Он получает зарплату и обучение, а отдать ничего не может. И чтобы хоть как-то восстановить обмен, он начинает быть недовольным: зарплата маленькая, обучение бестолковое, офис не тот, корпоративная культура не та, продукция так себе. Через три недели вместо потенциально хорошего сотрудника мы получаем человека, у которого из ушей лезет недовольство, — а ведь он ещё ничего полезного не сделал. Именно так, закармливая входящим без исходящего, мы своими руками губим хороших людей.</p>' +
            '<p>Отсюда — главная, на мой взгляд, ошибка управленцев по отношению к людям. Однажды у меня спросили, какая она, и я чуть не сказал: «терпение и надежда». Терпение отсутствия пользы от сотрудника и надежда, что эта польза когда-нибудь появится. Ошибка это не потому, что терпение и надежда — плохие качества, а потому, что применительно к сотрудникам они обычно не оправдываются. В личной жизни мы можем позволить себе надеяться — это романтично; в бизнесе это просто дорого и бесполезно.</p>' +
            '<p>С этим связан простой критерий. Правильно подобранный на должность сотрудник очень быстро демонстрирует вам, что вы не ошиблись при найме. Поэтому, когда меня спрашивают: «Как понять, правильно я его нанял или нет? Прошло уже два с половиной месяца», — я обычно отвечаю: наняли неправильно. Почему? Да потому что у вас до сих пор есть этот вопрос. Если бы вы наняли правильно, вопроса бы уже не было.</p>' +
            b('ЗАМЕТКА · Две стороны одной медали',
              bp('С новым сотрудником нужно одновременно видеть обе стороны. Первая: от нас зависит очень многое — мы должны много чего сделать, чтобы помочь ему быстрее начать производить и правильно войти в компанию; это не «нанялись — идите курить и ждать». Вторая: если очень быстро вы не видите от него пользы, то с огромной вероятностью все дальнейшие усилия по отношению к этому сотруднику окажутся напрасными. И то, и другое верно одновременно.', true)),
          en:
            '<h2>Productivity: why benefit is visible at once</h2>' +
            '<p>Let us begin with the goal. What do we want to get at all, working with an employee in the first hours and days? If we reason like winners, we need several things: for him to begin bringing benefit as quickly as possible, for there to be as much of this benefit over time as possible, and for him to work with us longer. In a word, to increase the chances of a comfortable, successful, and long-term cooperation.</p>' +
            '<p>Why does a productive person quickly bring benefit and strive to begin as soon as possible? Let me clarify whom I call productive. It is not only the winner who sees his product — productive people are winners and doers, and there are an order of magnitude more doers. It is chiefly of them that I am speaking: they are people from whom we see benefit at once, because they brought it before as well. And they strive to begin as soon as possible for the following reason: they are used to feeling good — proud, comfortable, with their head held high. And a person can feel that way only when he produces an outflow, and one useful to someone at that. Look at yourselves: when you manage to do something useful — for your children, clients, employees — it is a delight. And when you rest too long or bustle about all day with no result at all, before long you begin to feel out of sorts. A productive person knows this feeling and does not want to lose it, and so he strives to climb as quickly as possible out of the pit that usually forms in a new place.</p>' +
            '<p>One American researcher of the last century, Ron Hubbard, whom I have already quoted several times, formulated it thus: "Production is the basis of morale." Basis means cause, foundation: morale depends on production. Look at whether this corresponds to your observations. When there is a lot of work in a company — a hot season, a heap of orders, everyone overloaded — there are somehow few complaints; on the contrary, everyone helps one another. And in the downturns, when people simply have nothing to do, complaints, squabbles, gossip, and "trade-union movements" begin. Hence, incidentally, a practical conclusion: if a person needs cheering up — a dejected employee or, say, a tired wife — he needs to be loaded not with reproaches but with work. For even without Hubbard we know what we cure ourselves with when we feel lousy: we start to graft away.</p>' +
            k('KEY IDEA',
              bp('Production is the basis of morale. A person feels good only when he produces an outflow useful to someone. But production does not equal morale: for morale to be high, an inflow is also needed — that is, exchange, which, as we know from the law of exchange, pushes the reactive mind away from the person and gives him space.', true)) +
            '<p>From this follow two "insurance policies" that we obtain by hiring a productive person. The first: since he brought benefit in the past, it means he can bring it with us as well. The second: he is used to producing and wants to produce. And if he suddenly cannot bring benefit — we put him in the wrong position, he lacks knowledge, or his personality traits get in the way — then this is a problem not only for us but for him too: he himself is uncomfortable. Have you seen people who begin literally to rebel when they are unable to work? "Boss, I can\'t go on like this, let\'s do something about it!" In our view these are the most valuable employees — the ones who cannot not work. Compare this with an unproductive person who is used to bringing no benefit: it is his lifestyle, and he is even surprised at why everyone around is straining themselves.</p>' +
            '<h2>The trap of the inflow</h2>' +
            '<p>Now let us look at the same situation from the side of exchange — and we will see the trap into which almost every new employee falls in most companies of our civilization.</p>' +
            '<p>We have hired a person. From the first day we pay him a salary (a smaller one during the probation period, granted) — this is an inflow for him. Next: in any at all complex position he cannot immediately begin to carry out his functions — he would only make a mess — and so he has to be brought up to speed, shown, explained to, taught. And teaching is also an inflow. There are already two inflows. And where is the outflow? There is none. This is seen especially vividly with a manager: there are few places where a person begins actually to manage from the first day. That is, from the first day we, in essence, begin to ruin the person: he receives much inflow and gives no outflow. Exchange is disrupted, the reactive mind piles up — and the person begins to feel bad.</p>' +
            '<p>And since each of us naturally strives for exchange, an employee who cannot give is left with one way to restore this exchange: to devalue what he receives. We have already seen this mechanism when we examined the law of exchange.</p>' +
            b('EXAMPLE · How that which cannot be repaid is devalued',
              bp('Imagine that you are a well-off person and gave a poor relative — say, a nephew — an expensive jacket. He cannot make you an adequate gift in return: to "even things out," he would have to starve with his whole family for months. What is left for him in order to restore the exchange? The only available option is to mentally lower the price of the gift, that is, to criticize it. And in the evening, unfortunately, a thought may well be born in one of them: "Some brother — drops by once every six months and can\'t give something new, takes his old rag off his own back." They do this not because they are bad, but precisely because they are good: they strive for exchange.', true)) +
            '<p>Exactly the same thing happens with a new employee. He receives a salary and training, and can give nothing. And in order to somehow restore the exchange, he begins to be dissatisfied: the salary is small, the training is useless, the office is not right, the corporate culture is not right, the products are so-so. In three weeks, instead of a potentially good employee, we get a person out of whose ears dissatisfaction is oozing — and yet he has not done anything useful yet. It is exactly thus, by overfeeding with inflow without outflow, that we ruin good people with our own hands.</p>' +
            '<p>Hence — the main mistake, in my view, of managers in relation to people. Once I was asked what it is, and I almost said: "patience and hope." Patience with the absence of benefit from an employee, and the hope that this benefit will someday appear. It is a mistake not because patience and hope are bad qualities, but because, as applied to employees, they usually do not pan out. In one\'s personal life we can allow ourselves to hope — it is romantic; in business it is simply expensive and useless.</p>' +
            '<p>Connected with this is a simple criterion. An employee correctly matched to a position very quickly demonstrates to you that you did not err in the hiring. That is why, when they ask me: "How do I tell whether I hired him rightly or not? It\'s already been two and a half months," — I usually answer: you hired wrongly. Why? Precisely because you still have that question. Had you hired rightly, there would no longer be a question.</p>' +
            b('NOTE · Two sides of the same coin',
              bp('With a new employee one must see both sides at once. The first: a great deal depends on us — we must do many things to help him begin producing sooner and enter the company properly; it is not "you got hired — go smoke and wait." The second: if very quickly you do not see benefit from him, then with enormous probability all further efforts toward this employee will turn out to be in vain. Both of these are true at the same time.', true)),
          pl:
            '<h2>Produktywność: dlaczego pożytek widać od razu</h2>' +
            '<p>Zacznijmy od celu. Co w ogóle chcemy uzyskać, pracując z pracownikiem w pierwszych godzinach i dniach? Jeśli rozumować jak winnerzy, potrzebujemy kilku rzeczy: żeby jak najszybciej zaczął przynosić pożytek, żeby tego pożytku w czasie było jak najwięcej i żeby dłużej u nas przepracował. Jednym słowem — zwiększyć szanse na komfortową, udaną i długoterminową współpracę.</p>' +
            '<p>Dlaczego produktywny człowiek szybko przynosi pożytek i dąży, żeby zacząć jak najprędzej? Wyjaśnię, kogo nazywam produktywnym. To nie tylko winner, który widzi swój produkt — produktywni ludzie to winnerzy i doerzy, przy czym doerów jest o rząd wielkości więcej. Właśnie o nich głównie mówię: to ludzie, od których widzimy pożytek od razu, bo przynosili go i wcześniej. A dążą, żeby zacząć jak najprędzej, oto dlaczego: przywykli czuć się dobrze — dumnie, komfortowo, z wysoko podniesioną głową. A tak człowiek może się czuć tylko wtedy, gdy wytwarza przepływ wychodzący, i to komuś pożyteczny. Popatrzcie na siebie: gdy udaje wam się zrobić coś pożytecznego — dzieciom, klientom, pracownikom — to frajda. A gdy zbyt długo odpoczywacie albo cały dzień się krzątacie bez żadnego wyniku, dość szybko robi się nieswojo. Produktywny człowiek to odczucie zna i nie chce go tracić, dlatego dąży, żeby jak najprędzej wygrzebać się z dołka, który zwykle tworzy się na nowym miejscu.</p>' +
            '<p>Pewien amerykański badacz ubiegłego wieku, Ron Hubbard, którego już kilka razy cytowałem, sformułował to tak: „Produkcja to podstawa morale". Podstawa znaczy przyczyna, fundament: od produkcji zależy morale. Popatrzcie, czy odpowiada to waszym obserwacjom. Gdy w firmie jest dużo pracy — gorący sezon, kupa zamówień, wszyscy przeciążeni — skarg jakoś jest niewiele, przeciwnie, wszyscy sobie nawzajem pomagają. A w spadkach, gdy ludzie po prostu nie mają co robić, zaczynają się skargi, kłótnie, plotki i „ruchy związkowe". Stąd, swoją drogą, praktyczny wniosek: jeśli człowieka trzeba pobudzić — przygnębionego pracownika albo, powiedzmy, zmęczoną żonę — trzeba go załadować nie pretensjami, lecz pracą. Przecież i bez Hubbarda wiemy, czym się leczymy, gdy nam kiepsko: zaczynamy harować.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Produkcja to podstawa morale. Człowiek czuje się dobrze tylko wtedy, gdy wytwarza komuś pożyteczny przepływ wychodzący. Ale produkcja nie równa się morale: żeby morale było wysokie, potrzebny jest jeszcze przepływ przychodzący — czyli wymiana, która, jak wiemy z prawa wymiany, odsuwa od człowieka umysł reaktywny i daje mu przestrzeń.', true)) +
            '<p>Z tego wynikają dwie „polisy", które otrzymujemy, zatrudniając produktywnego człowieka. Pierwsza: skoro przynosił pożytek w przeszłości, znaczy, może przynieść go i u nas. Druga: przywykł produkować i chce produkować. A jeśli nagle nie może przynosić pożytku — postawiliśmy go na niewłaściwym stanowisku, brakuje mu wiedzy albo przeszkadzają cechy osobowości — to problem nie tylko nasz, ale i jego: samemu mu niekomfortowo. Widzieliście ludzi, którzy zaczynają dosłownie się buntować, gdy nie udaje im się pracować? „Szefie, tak dłużej nie mogę, zróbmy z tym coś!" Naszym zdaniem to najcenniejsi pracownicy — ci, którzy nie mogą nie pracować. Porównajcie z nieproduktywnym człowiekiem, który przywykł nie przynosić pożytku: ma taki styl życia, i jeszcze się dziwi, czego to wszyscy dookoła się spinają.</p>' +
            '<h2>Pułapka przepływu przychodzącego</h2>' +
            '<p>Teraz popatrzmy na tę samą sytuację od strony wymiany — i zobaczymy pułapkę, w którą wpada niemal każdy nowy pracownik w większości firm naszej cywilizacji.</p>' +
            '<p>Zatrudniliśmy człowieka. Od pierwszego dnia płacimy mu pensję (niech na okresie próbnym i mniejszą) — to dla niego przepływ przychodzący. Dalej: na choćby trochę złożonym stanowisku nie może od razu zacząć wykonywać swoich funkcji — tylko narobi bałaganu — dlatego trzeba go wprowadzić w temat, pokazać, objaśnić, nauczyć. A uczenie to też przepływ przychodzący. Oto już dwa przepływy przychodzące. A gdzie wychodzący? Nie ma go. Szczególnie wyraźnie widać to z kierownikiem: mało gdzie człowiek od pierwszego dnia zaczyna realnie kierować. Czyli od pierwszego dnia człowieka w istocie zaczynamy zagrzebywać: otrzymuje dużo przychodzącego i nie oddaje wychodzącego. Wymiana się zaburza, umysł reaktywny nawala się — i człowiek zaczyna czuć się źle.</p>' +
            '<p>A ponieważ każdy z nas w naturalny sposób dąży do wymiany, pracownikowi, który nie może oddawać, zostaje jeden sposób, żeby tę wymianę przywrócić: obniżyć wartość tego, co otrzymuje. Ten mechanizm już widzieliśmy, gdy omawialiśmy prawo wymiany.</p>' +
            b('PRZYKŁAD · Jak obniża się wartość tego, czego nie można zwrócić',
              bp('Wyobraźcie sobie, że jesteście zamożnym człowiekiem i podarowaliście biednemu krewnemu — powiedzmy bratankowi — drogą marynarkę. Nie może zrobić wam adekwatnego prezentu w rewanżu: żeby się „zrównać", musiałby całą rodziną miesiącami głodować. Co mu zostaje, żeby przywrócić wymianę? Jedyny dostępny wariant — w myślach obniżyć cenę prezentu, czyli go skrytykować. I wieczorem, niestety, u kogoś z nich całkiem może zrodzić się myśl: „Dobry braciszek — raz na pół roku wpadł i nie może podarować czegoś nowego, ściąga z pleców swoje szmaty". Robią to nie dlatego, że są źli, lecz właśnie dlatego, że są dobrzy: dążą do wymiany.', true)) +
            '<p>Dokładnie to samo dzieje się z nowym pracownikiem. Otrzymuje pensję i szkolenie, a oddać nic nie może. I żeby choć jakoś przywrócić wymianę, zaczyna być niezadowolony: pensja mała, szkolenie bezsensowne, biuro nie takie, kultura firmowa nie taka, produkty takie sobie. Po trzech tygodniach zamiast potencjalnie dobrego pracownika dostajemy człowieka, któremu z uszu wyłazi niezadowolenie — a przecież nie zrobił jeszcze nic pożytecznego. Właśnie tak, zakarmiając przychodzącym bez wychodzącego, własnymi rękami gubimy dobrych ludzi.</p>' +
            '<p>Stąd — główny, moim zdaniem, błąd zarządzających w stosunku do ludzi. Kiedyś zapytano mnie, jaki on jest, i o mało nie powiedziałem: „cierpliwość i nadzieja". Cierpliwość braku pożytku od pracownika i nadzieja, że ten pożytek kiedyś się pojawi. Błąd to nie dlatego, że cierpliwość i nadzieja to złe cechy, lecz dlatego, że w odniesieniu do pracowników zwykle się nie sprawdzają. W życiu osobistym możemy sobie pozwolić na nadzieję — to romantyczne; w biznesie to po prostu drogie i bezużyteczne.</p>' +
            '<p>Z tym wiąże się proste kryterium. Prawidłowo dobrany na stanowisko pracownik bardzo szybko demonstruje wam, że nie pomyliliście się przy rekrutacji. Dlatego, gdy pytają mnie: „Jak zrozumieć, dobrze go zatrudniłem czy nie? Minęły już dwa i pół miesiąca" — zwykle odpowiadam: zatrudniliście niedobrze. Dlaczego? A dlatego, że do tej pory macie to pytanie. Gdybyście zatrudnili dobrze, pytania by już nie było.</p>' +
            b('NOTATKA · Dwie strony jednego medalu',
              bp('Z nowym pracownikiem trzeba jednocześnie widzieć obie strony. Pierwsza: od nas zależy bardzo wiele — musimy dużo zrobić, żeby pomóc mu szybciej zacząć produkować i prawidłowo wejść do firmy; to nie „zatrudniłeś się — idź palić i czekać". Druga: jeśli bardzo szybko nie widzicie od niego pożytku, to z ogromnym prawdopodobieństwem wszystkie dalsze wysiłki wobec tego pracownika okażą się daremne. I jedno, i drugie jest prawdziwe jednocześnie.', true)),
        },
      },

      // 3 — ДАЙТЕ НОВИЧКУ ПРОИЗВОДИТЬ С ПЕРВОГО ДНЯ
      {
        id: 'produce-day-one',
        title: {
          ru: 'Дайте новичку производить с первого дня',
          en: 'Let the newcomer produce from the first day',
          pl: 'Dajcie nowicjuszowi produkować od pierwszego dnia',
        },
        desc: {
          ru: 'Простая работа сразу и обучение не больше чем полдня — как правило компании.',
          en: 'Simple work at once and training no more than half a day — as a company rule.',
          pl: 'Prosta praca od razu i szkolenie nie więcej niż pół dnia — jako zasada firmy.',
        },
        html: {
          ru:
            '<h2>Дайте новичку производить с первого дня</h2>' +
            '<p>Что же со всем этим делать? Не платить зарплату нельзя — и по закону, и потому что большинству семей не прожить пару месяцев без денег. Не обучать тоже нельзя. Остаётся один выход: с первого дня загрузить человека хоть какой-нибудь работой, которую можно делать сразу, и обучать не больше чем полдня.</p>' +
            '<p>Какой может быть эта простая работа? Если должность такая, что сразу приносить пользу на ней нельзя, дайте что-то попроще. Кто-то называет это «тестовой неделей»: человек неделю работает как чернорабочий, помогает курьеру, секретарю, выполняет любые несложные поручения — заодно узнаёт общие правила компании. Или придумайте простой элемент самой будущей роли. Взяли начальника отдела продаж — руководить продавцами с первого дня он не может, но полчаса инструкции, и он вполне может делать холодный обзвон или хотя бы собирать телефоны компаний, которые сейчас нанимают и которым можно предложить нашу помощь. Это не обязательно мыть пол и таскать ящики — хотя, честно говоря, я бы через это проводил всех, и топ-менеджеров в первую очередь. Знаете, почему первое лицо компании может зайти и решить вопрос с любым сотрудником? Не только потому, что у него власть, — а потому, что обычно он сам когда-то перепробовал многие работы: он и с грузчиком поговорит, и с обзвонщиком, и с охранником, потому что сам через это прошёл. Пройти через простую работу полезно: человек нюхает пороху, вникает в дела, зарабатывает авторитет у тех, рядом с кем таскает эти ящики.</p>' +
            '<p>Разумеется, здравый смысл должен присутствовать. Если вы наняли переводчицу с маникюром, не заставляйте её таскать ящики — придумайте что-то другое: помочь секретарю, поработать на кофе-брейке, поделать простую диспетчерскую работу. Минимум полдня в день человек должен приносить хоть какую-то пользу. И это должно быть в компании правилом.</p>' +
            r('ПРАВИЛО',
              bp('Минимум полдня в день новый сотрудник должен приносить хоть какую-то пользу, а обучаться — не больше чем полдня. Это правило компании, а не исключение для отдельных должностей.', true)) +
            '<p>Топ-менеджер вполне может сказать: «Я устраивался к вам не для того, чтобы заниматься работой, которую может делать любой». Эту точку зрения надо уладить, а не отмахнуться от неё. Объясните так: «Мы тоже взяли тебя не для этого — твоя зарплата в несколько раз выше зарплаты того, кто заклеивает конверты, и нас самих не устраивает, что ты пока занят этим. Поэтому, пожалуйста, вникай и учись как можно быстрее, чтобы начать делать то, ради чего мы тебя наняли и за что платим. А пока делай хотя бы это — и спасибо, что мы вообще платим тебе зарплату».</p>',
          en:
            '<h2>Let the newcomer produce from the first day</h2>' +
            '<p>So what is to be done with all of this? Not to pay a salary is impossible — both by law and because most families cannot live a couple of months without money. Not to train is also impossible. One way out remains: from the first day to load the person with at least some work that can be done straight away, and to train for no more than half a day.</p>' +
            '<p>What might this simple work be? If the position is such that one cannot bring benefit on it right away, give something simpler. Some call this a "test week": for a week the person works as an unskilled laborer, helps the courier, the secretary, carries out any uncomplicated errands — and at the same time learns the general rules of the company. Or come up with a simple element of the future role itself. You took on a head of the sales department — he cannot manage salespeople from the first day, but half an hour of instruction, and he can quite well do cold calling or at least gather the phone numbers of companies that are hiring right now and to whom our help can be offered. It is not necessarily mopping the floor and lugging boxes — although, frankly, I would put everyone through that, and top managers first of all. Do you know why the first person of a company can walk in and resolve a matter with any employee? Not only because he has power — but because he himself has usually tried out many jobs at some time: he will talk with the loader, and with the caller, and with the security guard, because he went through it himself. To go through simple work is useful: the person gets a whiff of gunpowder, gets into the swing of things, earns authority with those alongside whom he lugs these boxes.</p>' +
            '<p>Of course, common sense must be present. If you hired a female interpreter with a manicure, do not make her lug boxes — come up with something else: to help the secretary, to work at the coffee break, to do some simple dispatcher work. For a minimum of half a day per day the person must bring at least some benefit. And this should be a rule in the company.</p>' +
            r('RULE',
              bp('For a minimum of half a day per day a new employee must bring at least some benefit, and be trained for no more than half a day. This is a company rule, not an exception for particular positions.', true)) +
            '<p>A top manager may well say: "I took a job with you not in order to do work that anyone can do." This point of view must be handled, not brushed aside. Explain it thus: "We too took you on not for this — your salary is several times higher than the salary of the one who seals envelopes, and we ourselves are not satisfied that for now you are occupied with this. So please, get into it and learn as quickly as possible, in order to begin doing what we hired you for and what we pay for. And for now do at least this — and thank us for even paying you a salary at all."</p>',
          pl:
            '<h2>Dajcie nowicjuszowi produkować od pierwszego dnia</h2>' +
            '<p>Co więc z tym wszystkim robić? Nie płacić pensji nie można — i według prawa, i dlatego, że większość rodzin nie przeżyje paru miesięcy bez pieniędzy. Nie uczyć też nie można. Zostaje jedno wyjście: od pierwszego dnia załadować człowieka jakąkolwiek pracą, którą można robić od razu, i uczyć nie więcej niż pół dnia.</p>' +
            '<p>Jaka może być ta prosta praca? Jeśli stanowisko jest takie, że od razu przynosić na nim pożytku nie można, dajcie coś prostszego. Ktoś nazywa to „tygodniem próbnym": człowiek tydzień pracuje jako robotnik niewykwalifikowany, pomaga kurierowi, sekretarce, wykonuje wszelkie niezłożone zlecenia — przy okazji poznaje ogólne zasady firmy. Albo wymyślcie prosty element samej przyszłej roli. Wzięliście kierownika działu sprzedaży — kierować sprzedawcami od pierwszego dnia nie może, ale pół godziny instrukcji, i całkiem może robić telefony na zimno albo choćby zbierać telefony firm, które teraz zatrudniają i którym można zaproponować naszą pomoc. To niekoniecznie myć podłogę i taszczyć skrzynki — choć, szczerze mówiąc, przeprowadziłbym przez to wszystkich, a top-menedżerów w pierwszej kolejności. Wiecie, dlaczego pierwsza osoba firmy może wejść i załatwić sprawę z dowolnym pracownikiem? Nie tylko dlatego, że ma władzę — lecz dlatego, że zwykle sam kiedyś przymierzył wiele prac: i z ładowaczem porozmawia, i z obzwaniaczem, i z ochroniarzem, bo sam przez to przeszedł. Przejść przez prostą pracę jest pożytecznie: człowiek wącha proch, wnika w sprawy, zarabia autorytet u tych, obok których taszczy te skrzynki.</p>' +
            '<p>Oczywiście zdrowy rozsądek musi być obecny. Jeśli zatrudniliście tłumaczkę z manikiurem, nie każcie jej taszczyć skrzynek — wymyślcie coś innego: pomóc sekretarce, popracować przy przerwie kawowej, porobić prostą pracę dyspozytorską. Minimum pół dnia dziennie człowiek musi przynosić choć jakiś pożytek. I to musi być w firmie zasadą.</p>' +
            r('ZASADA',
              bp('Minimum pół dnia dziennie nowy pracownik musi przynosić choć jakiś pożytek, a uczyć się — nie więcej niż pół dnia. To zasada firmy, a nie wyjątek dla poszczególnych stanowisk.', true)) +
            '<p>Top-menedżer całkiem może powiedzieć: „Zatrudniałem się u was nie po to, żeby zajmować się pracą, którą może robić każdy". Ten punkt widzenia trzeba rozładować, a nie zbyć machnięciem ręki. Objaśnijcie tak: „My też wzięliśmy cię nie po to — twoja pensja jest kilka razy wyższa od pensji tego, kto zakleja koperty, i nas samych nie satysfakcjonuje, że na razie jesteś tym zajęty. Dlatego, proszę, wnikaj i ucz się jak najszybciej, żeby zacząć robić to, dla czego cię zatrudniliśmy i za co płacimy. A na razie rób choćby to — i dziękuj, że w ogóle płacimy ci pensję".</p>',
        },
      },

      // 4 — СОСТОЯНИЯ И ФОРМУЛА НЕСУЩЕСТВОВАНИЯ
      {
        id: 'nonexistence',
        title: {
          ru: 'Состояния и формула несуществования',
          en: 'States and the formula of non-existence',
          pl: 'Stany i formuła nieistnienia',
        },
        desc: {
          ru: 'Почему ноль — не худшее, что такое несуществование и четыре его шага.',
          en: 'Why zero is not the worst, what non-existence is, and its four steps.',
          pl: 'Dlaczego zero to nie najgorsze, czym jest nieistnienie i jego cztery kroki.',
        },
        html: {
          ru:
            '<h2>Состояния: почему ноль — не худшее</h2>' +
            '<p>Теперь перейдём к более глубокой идее, которую сформулировал Хаббард в своих исследованиях. Любая деятельность, любой человек, любая область в каждый момент находится в каком-то состоянии. И в зависимости от того, в каком состоянии находится деятельность, нужно предпринимать те или иные шаги, чтобы её улучшить.</p>' +
            '<p>Прежде всего избавимся от одного опасного заблуждения. Многие подсознательно думают, что самый плохой вариант найма — это когда сотрудник не приносит никакой пользы, то есть даёт ноль. Ноль — это когда его у нас просто нет. Но как только человек появился, удержаться на нуле почти невозможно: либо он приносит пользу и идёт вверх, либо, если пользы нет, можно с уверенностью сказать, что он приносит вред — хотя бы самим фактом своего присутствия. Поэтому самый плохой вариант найма — вовсе не ноль, а, по сути, минус бесконечность. Так же, как самый хороший вариант — плюс бесконечность. Компания Tetrapak стала мировым лидером в упаковке благодаря найму одного инженера, который изобрёл эту упаковку и уговорил её запатентовать. Но и минусы бывают неограниченными: один человек может поссорить партнёров, развести владельца с женой, много своровать или что-нибудь слить. Был случай, когда трейдер в Гонконге, скрывая растущие убытки на отдельном счёте, довёл до краха огромный международный банк. Всё это — результат одного найма.</p>' +
            '<p>Именно поэтому момент входа сотрудника в компанию — это момент истины. И то состояние, в котором оказывается только что появившийся на должности человек, называется несуществованием: совсем недавно его тут ещё не было, он как бы ещё не существует. В точно таком же состоянии находятся молодожёны, только что зарегистрированная компания — и даже наша компания с пятнадцатилетним стажем в тот момент, когда мы впервые вошли в жизнь нового клиента.</p>' +
            k('ОПРЕДЕЛЕНИЕ',
              bp('Состояние — это положение, в котором находится деятельность. Состояние несуществования — это состояние только что поставленного на должность сотрудника, только что открывшейся компании или каждого из молодожёнов: совсем недавно их ещё не было.', true)) +
            '<p>Таких состояний конечное число. Самое низкое — замешательство, самое высокое — могущество. И вот что, на мой взгляд, было самым важным в том, что сделал Хаббард: он не просто перечислил и назвал состояния — для каждого из них он написал шаги, которые нужно сделать, чтобы перейти в состояние повыше. Причём шаги эти универсальны: они годятся и для молодожёнов, и для нового сотрудника, и для новой компании. Шаги, которые нужно делать в несуществовании, — это и есть те шаги, которые должен делать новый сотрудник, чтобы облегчить свой вход и быстрее начать приносить пользу.</p>' +
            '<h2>Формула несуществования</h2>' +
            '<p>Слово «формула» здесь означает не математику. Формула — это общее краткое выражение какого-либо закона, применимое к частным случаям. Прежде чем назвать саму формулу несуществования, покажу её на примере, чтобы вы увидели, насколько она естественна. Возьмём вход нового начальника отдела продаж в компанию, которая торгует французским нижним бельём. Сравним два подхода.</p>' +
            b('ПРИМЕР · Как входить не надо',
              bp('Первая встреча. «Здравствуйте, я ваш новый начальник отдела продаж, Владимир Сидоренко. Четыре года возглавлял представительство Coca-Cola, поднял там продажи в восемнадцать раз. Теперь меня наняли к вам, чтобы поднять продажи на новый уровень. С завтрашнего дня начинаем жить по-новому, готовьтесь. Завтра в девять жду на собрании». И начинается размахивание шашкой: «это всё неправильно, надо так».') +
              bp('Пользы он пока не принёс никакой, а вред уже есть: люди занервничали. «Мало нам импульсивного владельца и сумасшедшего генерального — теперь ещё этот, который каждую неделю будет устраивать новую жизнь. И откуда пришёл? Из Coca-Cola: кроме банки колы ничего в руках не держал, а будет учить нас продавать бельё». А в компании, как обычно, есть лучший продавец — да ещё и старый друг владельца, который обеспечивает процентов сорок дохода. Вечером он звонит владельцу: «Или ты за час определяешься с этим Coca-Cola, который завтра будет меня учить жить, или я утром просто не проснусь на его собрание. Увольняй, трудовую можешь оставить себе». И вот владелец должен либо прогнуться под лучшего продавца (уронив авторитет нового начальника), либо своим авторитетом продавливать этого новичка — то есть конфликтовать с лучшими продавцами, которые его же и кормят. Плохие продавцы, кстати, не бунтуют — смелости не хватает; бунтуют именно хорошие.') +
              bp('Итог: возникает противодействие, кто-то увольняется, кто-то критикует, а сам новичок опускается в состояния ниже несуществования — сначала в помеху (начинает приносить вред), потом в сомнение («туда ли я устроился?»), а там и во врага, который прямо с рабочего места звонит на прежнее место работы и открыто критикует компанию. Чтобы потом вытащить его наверх, придётся делать специальные шаги — и всё это чтобы компенсировать то, что он сам натворил.', true)) +
            b('ПРИМЕР · Как входить надо',
              bp('Та же первая встреча, другой подход. «Здравствуйте, меня зовут Владимир Сидоренко, я ваш новый начальник отдела продаж. Работал в Coca-Cola, за четыре года поднял продажи в восемнадцать раз, поэтому меня наняли поднять продажи и у вас. И сразу скажу честно: в продаже французского белья я не понимаю вообще ничего, да и в самом белье разбираюсь слабо. Поэтому я буду вникать и учиться у вас — и, как все новички, задавать дурацкие вопросы. Обещаю одно: я толковый и вникну быстро. А пока делайте то, что делали. И ещё хотел бы узнать: что вам вообще нужно, чего вы хотите? Я записываю».') +
              bp('И люди отвечают. «Наше бельё едет из Китая, в дороге упаковка превращается неизвестно во что; кусочек материи, который в опте стоит двадцать долларов, в такой упаковке и за три сложно продать, — нужна новая упаковка». Записал. Кто-нибудь попробует продавить на вшивость: «А я хочу больше денег». — «Ваш депутатский запрос принят, записал, посмотрю, что смогу сделать. Ещё что-нибудь? Нет? Приятно познакомиться, продолжайте работать, через пару дней снова соберёмся».') +
              bp('Пользы он тоже пока не принёс — в первую встречу это и сложно. Но, что важно, он не принёс и вреда: никто не занервничал, не напился, не звонит владельцу с ультиматумом, не ищет другую работу. Для начала неплохо. Вторая встреча через несколько дней: «Спасибо за уроки, кое у кого из вас я уже многому научился, кто-то вообще истинный мастер продажи. Я уже начал вникать и даже передал некоторым из вас новых клиентов от знакомых — моя задача не самому продавать, а чтобы рос объём. Теперь по вашим просьбам: вот макет новой упаковки, он уже утверждён дизайнером, маркетингом и генеральным; сутки на дополнения — и через две недели придёт партия уже в ней. По поводу денег: поднять зарплату не в моих полномочиях, и оснований пока нет. Но вот о чём я уже договорился: гарантированная зарплата и ваши проценты остаются как есть, а если мы вместе выйдем на такой-то объём, то каждый из вас сверх этого получит ещё по триста долларов премии».') +
              bp('Похоже, он пошёл вверх. Он сделал то, о чём его попросили. А заодно новой системой премий он немного сплотил отдел: раньше продавцы бодались, чей клиент и кто получит процент, а теперь, если даже продал сосед, при выходе на общий уровень премию получат все — и мне выгодно, чтобы соседи тоже продавали больше.', true)) +
            '<p>В чём разница? В первом случае человек вошёл на ступеньке «думаю, что знаю» — а это, как мы помним из шкалы «знать — не знать — думаю, что знаю», самая низкая ступенька, лишь маскирующаяся под самую высокую. У новичка есть основания на неё встать: раз мы нанимаем продуктивных людей, приносивших пользу, то в своей области они действительно много знают. Поэтому очень важно в этот момент объяснить человеку, что его знания ценны и никто их не принижает — именно за них мы его и наняли, — но, входя на должность, всё, что он знает, нужно сложить в ящик, запереть, а ключ убрать подальше и на время забыть, где он. Потому что сначала надо познакомиться со спецификой: откуда у компании растут ноги, на чём она на самом деле зарабатывает, какие у продукта плюсы и минусы. В этом и есть основа успешного введения в должность. (И, между прочим, основа успешного начала супружества, и основа работы с клиентом: женщины все разные, и клиенты при ближайшем рассмотрении все разные, поэтому, пока не выяснишь, чего хочет именно этот, лучше отложить всё, что знаешь, а потом из своего арсенала достать то, что нужно, — и тем самым оправдать доверие.)</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Профессионалы не опускаются на любимую дилетантами ступеньку «думаю, что знаю». Входя на новую должность, человек должен временно отложить всё, что он знает, честно признать, что специфику этой компании он не знает, — и начать её узнавать. Пока эта идея из него не «вытрясена», правильного введения в должность не получится.', true)) +
            '<p>Теперь сама формула. Вот как сформулировал Хаббард формулу несуществования — четыре шага:</p>' +
            '<ul>' +
            '<li><strong>Найдите коммуникационную линию.</strong> Чтобы с кем-то начать общаться, нужно найти линию: собрать людей, написать письмо, попасть во внутреннюю сеть.</li>' +
            '<li><strong>Добейтесь, чтобы о вас узнали.</strong> «Здравствуйте, я Владимир Сидоренко, ваш новый начальник отдела продаж, работал там-то, поднял продажи во столько-то раз».</li>' +
            '<li><strong>Выясните, что требуется или чего хотят.</strong> Здесь важная поправка: в официальном переводе этот шаг звучит как «выясните, что требуется от вас». Хаббард писал по-английски, и слова «от вас» там нет — его нужно убрать. Ведь если меня ещё час назад не существовало, а я появляюсь и спрашиваю «что вы от меня хотите?», естественный ответ — «ничего, не мешай». Я же выясняю не что нужно от меня, а что нужно и требуется здесь вообще.</li>' +
            '<li><strong>Делайте, производите и/или предоставляйте это.</strong> А это ровно то, что мы выяснили на предыдущем шаге, — именно так и поступил «правильный» начальник отдела продаж.</li>' +
            '</ul>' +
            '<p>У этой формулы есть и второе название — формула для нового поста (или формула для нового сотрудника).</p>',
          en:
            '<h2>States: why zero is not the worst</h2>' +
            '<p>Now let us move on to a deeper idea that Hubbard formulated in his research. Any activity, any person, any area at every moment is in some state. And depending on which state the activity is in, one must undertake this or that step in order to improve it.</p>' +
            '<p>First of all, let us get rid of one dangerous delusion. Many subconsciously think that the worst hiring outcome is when an employee brings no benefit at all, that is, gives zero. Zero is when he is simply not with us. But as soon as a person has appeared, to hold at zero is almost impossible: either he brings benefit and goes up, or, if there is no benefit, one can say with confidence that he is doing harm — if only by the very fact of his presence. That is why the worst hiring outcome is not zero at all, but, in essence, minus infinity. Just as the best outcome is plus infinity. The company Tetra Pak became a world leader in packaging thanks to the hiring of a single engineer who invented that packaging and talked them into patenting it. But the minuses, too, can be unlimited: one person can set partners at odds, divorce the owner from his wife, steal a great deal, or leak something. There was a case when a trader in Hong Kong, concealing growing losses on a separate account, drove a huge international bank to collapse. All of this is the result of a single hiring.</p>' +
            '<p>That is precisely why the moment of an employee\'s entry into a company is a moment of truth. And the state in which a person who has only just appeared in a position finds himself is called non-existence: quite recently he was not yet here, he as it were does not yet exist. In exactly the same state are newlyweds, a company that has only just been registered — and even our company, with its fifteen-year record, at the moment when we first entered the life of a new client.</p>' +
            k('DEFINITION',
              bp('A state is the position an activity is in. The state of non-existence is the state of an employee only just placed in a position, of a company that has only just opened, or of each of the newlyweds: quite recently they did not yet exist.', true)) +
            '<p>There is a finite number of such states. The lowest is confusion, the highest is power. And here is what, in my view, was the most important thing in what Hubbard did: he did not merely list and name the states — for each of them he wrote the steps that need to be taken in order to move into a higher state. And these steps are universal: they are suitable for newlyweds, and for a new employee, and for a new company. The steps that need to be done in non-existence are precisely the steps a new employee should do in order to ease his entry and begin bringing benefit sooner.</p>' +
            '<h2>The formula of non-existence</h2>' +
            '<p>The word "formula" here does not mean mathematics. A formula is a general, brief expression of some law, applicable to particular cases. Before naming the formula of non-existence itself, I will show it by an example, so that you will see how natural it is. Let us take the entry of a new head of the sales department into a company that sells French lingerie. Let us compare two approaches.</p>' +
            b('EXAMPLE · How not to enter',
              bp('The first meeting. "Good day, I am your new head of the sales department, Vladimir Sidorenko. For four years I headed the Coca-Cola representative office, raised sales there eighteenfold. Now I have been hired by you to raise sales to a new level. Starting tomorrow we begin living in a new way, prepare yourselves. Tomorrow at nine I expect you at a meeting." And the saber-rattling begins: "this is all wrong, it should be done like this."') +
              bp('He has brought no benefit yet, but there is already harm: people have gotten anxious. "As if the impulsive owner and the mad CEO weren\'t enough — now there\'s also this one, who will be arranging a new life every week. And where did he come from? From Coca-Cola: held nothing in his hands but a can of cola, and he\'ll be teaching us to sell lingerie." And in the company, as usual, there is a best salesperson — and, on top of that, an old friend of the owner, who provides some forty percent of the revenue. In the evening he calls the owner: "Either within the hour you make up your mind about this Coca-Cola fellow who\'s going to teach me to live tomorrow, or in the morning I simply won\'t wake up for his meeting. Fire me, you can keep the employment record book." And now the owner must either bend under the best salesperson (bringing down the new head\'s authority), or use his authority to push this newcomer through — that is, to conflict with the best salespeople, who are the very ones feeding him. The bad salespeople, by the way, do not rebel — they lack the courage; it is precisely the good ones who rebel.') +
              bp('The upshot: opposition arises, someone quits, someone criticizes, and the newcomer himself sinks into states below non-existence — first into liability (he begins to do harm), then into doubt ("is this the right place I\'ve joined?"), and from there into enemy, who, right from his workplace, calls his former place of work and openly criticizes the company. To pull him up afterward, one will have to take special steps — and all of this in order to make up for what he himself has wrought.', true)) +
            b('EXAMPLE · How to enter',
              bp('The same first meeting, a different approach. "Good day, my name is Vladimir Sidorenko, I am your new head of the sales department. I worked at Coca-Cola, over four years raised sales eighteenfold, which is why I was hired to raise sales at your place too. And I\'ll say honestly right away: in selling French lingerie I understand nothing at all, and in lingerie itself I have only a weak grasp. So I will be getting into it and learning from you — and, like all newcomers, asking silly questions. I promise one thing: I am sharp and will get into it quickly. And for now, do what you were doing. And I would also like to find out: what is it you need at all, what do you want? I\'m writing it down."') +
              bp('And people answer. "Our lingerie comes from China, and on the way the packaging turns into who knows what; a little piece of fabric that costs twenty dollars wholesale is hard to sell for even three in packaging like that — new packaging is needed." Wrote it down. Someone will try to push on the sly: "And I want more money." — "Your parliamentary inquiry is accepted, I\'ve written it down, I\'ll see what I can do. Anything else? No? Pleased to meet you, carry on working, in a couple of days we\'ll gather again."') +
              bp('He has not brought benefit yet either — at a first meeting that is hard. But, importantly, he has not brought harm either: no one got anxious, got drunk, is calling the owner with an ultimatum, or is looking for another job. For a start, not bad. The second meeting a few days later: "Thank you for the lessons, from some of you I have already learned a great deal, and one of you is a true master of selling. I have already begun to get into it and have even handed some of you new clients from acquaintances — my task is not to sell myself, but for the volume to grow. Now, per your requests: here is a mock-up of the new packaging, it has already been approved by the designer, marketing, and the CEO; a day for additions — and in two weeks a batch will come already in it. As for money: raising salaries is not within my authority, and there are no grounds for it yet. But here is what I have already arranged: the guaranteed salary and your percentages stay as they are, and if together we reach such-and-such a volume, then each of you, over and above that, will get another three hundred dollars in bonus."') +
              bp('It looks as if he has gone up. He did what he was asked. And at the same time, with the new bonus system, he has somewhat united the department: previously the salespeople butted heads over whose client it was and who would get the percentage, but now, even if the neighbor made the sale, upon reaching the common level everyone gets the bonus — and it is to my advantage for my neighbors to sell more too.', true)) +
            '<p>What is the difference? In the first case the person entered on the rung "I think I know" — and that, as we recall from the scale "to know — not to know — to think I know," is the lowest rung, merely masquerading as the highest. The newcomer has grounds to step onto it: since we hire productive people who brought benefit, in their own area they really do know a lot. That is why it is very important at that moment to explain to the person that his knowledge is valuable and no one is belittling it — it is precisely for it that we hired him — but that, on entering the position, everything he knows must be put into a box, locked up, and the key hidden far away and, for a time, forgotten where it is. Because first one must get acquainted with the specifics: where the company\'s legs grow from, what it actually earns on, what pluses and minuses the product has. This is the very foundation of a successful induction into a position. (And, by the way, the foundation of a successful start to a marriage, and the foundation of work with a client: women are all different, and clients, on closer inspection, are all different, and so, until you find out what this particular one wants, it is better to set aside everything you know, and then draw from your arsenal what is needed — and thereby justify the trust placed in you.)</p>' +
            k('KEY IDEA',
              bp('Professionals do not descend to the rung "I think I know" so beloved by dilettantes. Entering a new position, a person must temporarily set aside everything he knows, honestly admit that he does not know the specifics of this company — and begin to learn them. Until this idea has been "shaken out" of him, a proper induction into the position will not come about.', true)) +
            '<p>Now the formula itself. Here is how Hubbard formulated the formula of non-existence — four steps:</p>' +
            '<ul>' +
            '<li><strong>Find a communication line.</strong> In order to begin communicating with someone, you need to find a line: gather people, write a letter, get onto the internal network.</li>' +
            '<li><strong>Make yourself known.</strong> "Good day, I am Vladimir Sidorenko, your new head of the sales department, I worked at such-and-such, raised sales so-many-fold."</li>' +
            '<li><strong>Find out what is required or wanted.</strong> Here an important correction: in the official translation this step reads as "find out what is required of you." Hubbard wrote in English, and the words "of you" are not there — they must be removed. For if an hour ago I did not exist, and I appear and ask "what do you want from me?", the natural answer is "nothing, don\'t get in the way." I am finding out not what is needed from me, but what is needed and required here at all.</li>' +
            '<li><strong>Do, produce, and/or present it.</strong> And this is exactly what we found out at the previous step — this is precisely how the "correct" head of the sales department acted.</li>' +
            '</ul>' +
            '<p>This formula also has a second name — the formula for a new post (or the formula for a new employee).</p>',
          pl:
            '<h2>Stany: dlaczego zero to nie najgorsze</h2>' +
            '<p>Teraz przejdźmy do głębszej idei, którą sformułował Hubbard w swoich badaniach. Każda działalność, każdy człowiek, każda dziedzina w każdym momencie znajduje się w jakimś stanie. I w zależności od tego, w jakim stanie znajduje się działalność, trzeba przedsiębrać takie czy inne kroki, żeby ją ulepszyć.</p>' +
            '<p>Przede wszystkim pozbądźmy się jednego niebezpiecznego złudzenia. Wielu podświadomie myśli, że najgorszy wariant rekrutacji to gdy pracownik nie przynosi żadnego pożytku, czyli daje zero. Zero to gdy po prostu go u nas nie ma. Ale gdy tylko człowiek się pojawił, utrzymać się na zerze jest niemal niemożliwe: albo przynosi pożytek i idzie w górę, albo, jeśli pożytku nie ma, można z pewnością powiedzieć, że przynosi szkodę — choćby samym faktem swojej obecności. Dlatego najgorszy wariant rekrutacji to wcale nie zero, lecz w istocie minus nieskończoność. Tak samo jak najlepszy wariant to plus nieskończoność. Firma Tetra Pak stała się światowym liderem w opakowaniach dzięki zatrudnieniu jednego inżyniera, który wynalazł to opakowanie i namówił, żeby je opatentować. Ale i minusy bywają nieograniczone: jeden człowiek może poróżnić wspólników, rozwieść właściciela z żoną, dużo ukraść albo coś przeciec. Był przypadek, gdy trader w Hongkongu, ukrywając rosnące straty na oddzielnym koncie, doprowadził do krachu ogromny międzynarodowy bank. Wszystko to — wynik jednej rekrutacji.</p>' +
            '<p>Właśnie dlatego moment wejścia pracownika do firmy to moment prawdy. I ten stan, w którym znajduje się dopiero co pojawiony na stanowisku człowiek, nazywa się nieistnieniem: całkiem niedawno jeszcze go tu nie było, jakby jeszcze nie istnieje. W dokładnie takim samym stanie znajdują się nowożeńcy, dopiero co zarejestrowana firma — a nawet nasza firma z piętnastoletnim stażem w tym momencie, gdy po raz pierwszy weszliśmy w życie nowego klienta.</p>' +
            k('DEFINICJA',
              bp('Stan to położenie, w którym znajduje się działalność. Stan nieistnienia to stan dopiero co postawionego na stanowisku pracownika, dopiero co otwartej firmy albo każdego z nowożeńców: całkiem niedawno jeszcze ich nie było.', true)) +
            '<p>Takich stanów jest skończona liczba. Najniższy to zamęt, najwyższy to potęga. I oto, co moim zdaniem było najważniejsze w tym, co zrobił Hubbard: nie tylko wyliczył i nazwał stany — dla każdego z nich napisał kroki, które trzeba zrobić, żeby przejść do stanu wyżej. Przy czym kroki te są uniwersalne: nadają się i dla nowożeńców, i dla nowego pracownika, i dla nowej firmy. Kroki, które trzeba robić w nieistnieniu, to właśnie te kroki, które powinien robić nowy pracownik, żeby ułatwić swoje wejście i szybciej zacząć przynosić pożytek.</p>' +
            '<h2>Formuła nieistnienia</h2>' +
            '<p>Słowo „formuła" oznacza tu nie matematykę. Formuła to ogólne, krótkie wyrażenie jakiegoś prawa, mające zastosowanie do przypadków szczególnych. Zanim nazwę samą formułę nieistnienia, pokażę ją na przykładzie, żebyście zobaczyli, na ile jest naturalna. Weźmy wejście nowego kierownika działu sprzedaży do firmy, która handluje francuską bielizną. Porównajmy dwa podejścia.</p>' +
            b('PRZYKŁAD · Jak wchodzić nie należy',
              bp('Pierwsze spotkanie. „Dzień dobry, jestem waszym nowym kierownikiem działu sprzedaży, Władimir Sidorenko. Cztery lata kierowałem przedstawicielstwem Coca-Coli, podniosłem tam sprzedaż osiemnastokrotnie. Teraz zatrudniono mnie u was, żeby podnieść sprzedaż na nowy poziom. Od jutra zaczynamy żyć po nowemu, przygotujcie się. Jutro o dziewiątej czekam na zebraniu". I zaczyna się wymachiwanie szablą: „to wszystko jest źle, trzeba tak".') +
              bp('Pożytku na razie nie przyniósł żadnego, a szkoda już jest: ludzie się zdenerwowali. „Mało nam impulsywnego właściciela i zwariowanego dyrektora generalnego — teraz jeszcze ten, który co tydzień będzie urządzał nowe życie. I skąd przyszedł? Z Coca-Coli: poza puszką coli nic w rękach nie trzymał, a będzie uczył nas sprzedawać bieliznę". A w firmie, jak zwykle, jest najlepszy sprzedawca — do tego jeszcze stary przyjaciel właściciela, który zapewnia jakieś czterdzieści procent dochodu. Wieczorem dzwoni do właściciela: „Albo w ciągu godziny określasz się z tym Coca-Colą, który jutro będzie mnie uczył żyć, albo rano po prostu nie obudzę się na jego zebranie. Zwalniaj, świadectwo pracy możesz zostawić sobie". I oto właściciel musi albo ugiąć się pod najlepszym sprzedawcą (obniżając autorytet nowego kierownika), albo swoim autorytetem przepychać tego nowicjusza — czyli konfliktować z najlepszymi sprzedawcami, którzy go przecież karmią. Źli sprzedawcy, swoją drogą, się nie buntują — odwagi brakuje; buntują się właśnie dobrzy.') +
              bp('Wynik: powstaje przeciwdziałanie, ktoś się zwalnia, ktoś krytykuje, a sam nowicjusz opuszcza się w stany niższe od nieistnienia — najpierw w przeszkodę (zaczyna przynosić szkodę), potem w wątpliwość („czy tam się zatrudniłem?"), a stamtąd i we wroga, który wprost z miejsca pracy dzwoni do poprzedniego miejsca pracy i otwarcie krytykuje firmę. Żeby potem wyciągnąć go w górę, trzeba będzie robić specjalne kroki — i wszystko to, żeby skompensować to, co sam nawyprawiał.', true)) +
            b('PRZYKŁAD · Jak wchodzić należy',
              bp('To samo pierwsze spotkanie, inne podejście. „Dzień dobry, nazywam się Władimir Sidorenko, jestem waszym nowym kierownikiem działu sprzedaży. Pracowałem w Coca-Coli, przez cztery lata podniosłem sprzedaż osiemnastokrotnie, dlatego zatrudniono mnie, żeby podnieść sprzedaż i u was. I od razu powiem szczerze: na sprzedaży francuskiej bielizny nie znam się w ogóle, a i na samej bieliźnie znam się słabo. Dlatego będę wnikał i uczył się u was — i, jak wszyscy nowicjusze, zadawał głupie pytania. Obiecuję jedno: jestem rozgarnięty i wniknę szybko. A na razie róbcie to, co robiliście. I jeszcze chciałbym się dowiedzieć: co wam w ogóle jest potrzebne, czego chcecie? Zapisuję".') +
              bp('I ludzie odpowiadają. „Nasza bielizna jedzie z Chin, w drodze opakowanie zmienia się nie wiadomo w co; kawałek materiału, który w hurcie kosztuje dwadzieścia dolarów, w takim opakowaniu i za trzy trudno sprzedać — potrzebne jest nowe opakowanie". Zapisał. Ktoś spróbuje przepchnąć na wszawość: „A ja chcę więcej pieniędzy". — „Wasza interpelacja poselska przyjęta, zapisałem, zobaczę, co będę mógł zrobić. Jeszcze coś? Nie? Miło poznać, kontynuujcie pracę, za parę dni znów się zbierzemy".') +
              bp('Pożytku też na razie nie przyniósł — na pierwszym spotkaniu to i trudne. Ale, co ważne, nie przyniósł i szkody: nikt się nie zdenerwował, nie upił, nie dzwoni do właściciela z ultimatum, nie szuka innej pracy. Na początek nieźle. Drugie spotkanie za kilka dni: „Dziękuję za lekcje, u niektórych z was już się wielu rzeczy nauczyłem, ktoś jest w ogóle prawdziwym mistrzem sprzedaży. Już zacząłem wnikać i nawet przekazałem niektórym z was nowych klientów od znajomych — moim zadaniem jest nie samemu sprzedawać, lecz żeby rósł wolumen. Teraz według waszych próśb: oto makieta nowego opakowania, jest już zatwierdzona przez projektanta, marketing i dyrektora generalnego; doba na uzupełnienia — i za dwa tygodnie przyjdzie partia już w nim. Co do pieniędzy: podnieść pensję nie leży w moich kompetencjach, i podstaw na razie nie ma. Ale oto o czym już się umówiłem: gwarantowana pensja i wasze procenty zostają jak są, a jeśli razem wyjdziemy na taki a taki wolumen, to każdy z was ponad to dostanie jeszcze po trzysta dolarów premii".') +
              bp('Wygląda na to, że poszedł w górę. Zrobił to, o co go poproszono. A przy okazji nowym systemem premii trochę scementował dział: wcześniej sprzedawcy się bodli, czyj klient i kto dostanie procent, a teraz, jeśli nawet sprzedał sąsiad, przy wyjściu na wspólny poziom premię dostaną wszyscy — i mnie jest na rękę, żeby sąsiedzi też sprzedawali więcej.', true)) +
            '<p>Na czym polega różnica? W pierwszym przypadku człowiek wszedł na szczeblu „myślę, że wiem" — a to, jak pamiętamy ze skali „wiedzieć — nie wiedzieć — myślę, że wiem", najniższy szczebel, jedynie maskujący się pod najwyższy. Nowicjusz ma podstawy, żeby na niego wejść: skoro zatrudniamy produktywnych ludzi, którzy przynosili pożytek, to w swojej dziedzinie naprawdę dużo wiedzą. Dlatego bardzo ważne jest w tym momencie objaśnić człowiekowi, że jego wiedza jest cenna i nikt jej nie pomniejsza — właśnie za nią go zatrudniliśmy — ale, wchodząc na stanowisko, wszystko, co wie, trzeba złożyć do skrzyni, zamknąć, a klucz schować dalej i na czas zapomnieć, gdzie jest. Bo najpierw trzeba poznać specyfikę: skąd firmie rosną nogi, na czym ona naprawdę zarabia, jakie produkt ma plusy i minusy. W tym właśnie jest podstawa udanego wprowadzenia na stanowisko. (I, nawiasem mówiąc, podstawa udanego początku małżeństwa, i podstawa pracy z klientem: kobiety wszystkie są różne, i klienci przy bliższym oglądzie wszyscy są różni, dlatego, dopóki nie wyjaśnisz, czego chce właśnie ten, lepiej odłożyć wszystko, co wiesz, a potem ze swojego arsenału wyjąć to, co potrzebne — i tym samym usprawiedliwić zaufanie.)</p>' +
            k('KLUCZOWA MYŚL',
              bp('Profesjonaliści nie opuszczają się na uwielbiany przez dyletantów szczebel „myślę, że wiem". Wchodząc na nowe stanowisko, człowiek powinien tymczasowo odłożyć wszystko, co wie, szczerze przyznać, że specyfiki tej firmy nie zna — i zacząć ją poznawać. Dopóki ta idea nie zostanie z niego „wytrzęsiona", prawidłowego wprowadzenia na stanowisko nie będzie.', true)) +
            '<p>Teraz sama formuła. Oto jak sformułował Hubbard formułę nieistnienia — cztery kroki:</p>' +
            '<ul>' +
            '<li><strong>Znajdźcie linię komunikacyjną.</strong> Żeby z kimś zacząć się komunikować, trzeba znaleźć linię: zebrać ludzi, napisać list, dostać się do sieci wewnętrznej.</li>' +
            '<li><strong>Doprowadźcie do tego, żeby o was się dowiedziano.</strong> „Dzień dobry, jestem Władimir Sidorenko, wasz nowy kierownik działu sprzedaży, pracowałem tam a tam, podniosłem sprzedaż tyle a tyle razy".</li>' +
            '<li><strong>Wyjaśnijcie, co jest wymagane albo czego chcą.</strong> Tu ważna poprawka: w oficjalnym przekładzie ten krok brzmi jako „wyjaśnijcie, co jest wymagane od was". Hubbard pisał po angielsku, i słów „od was" tam nie ma — trzeba je usunąć. Przecież jeśli godzinę temu jeszcze nie istniałem, a pojawiam się i pytam „czego wy ode mnie chcecie?", naturalna odpowiedź to „niczego, nie przeszkadzaj". Ja zaś wyjaśniam nie co jest potrzebne ode mnie, lecz co jest potrzebne i wymagane tutaj w ogóle.</li>' +
            '<li><strong>Róbcie, wytwarzajcie i/lub dostarczajcie to.</strong> A to dokładnie to, co wyjaśniliśmy na poprzednim kroku — właśnie tak postąpił „prawidłowy" kierownik działu sprzedaży.</li>' +
            '</ul>' +
            '<p>Ta formuła ma i drugą nazwę — formuła dla nowego stanowiska (albo formuła dla nowego pracownika).</p>',
        },
      },

      // 5 — ПРИМЕНЕНИЕ ФОРМУЛЫ НА ПРАКТИКЕ
      {
        id: 'nonexistence-practice',
        title: {
          ru: 'Как применять формулу несуществования на практике',
          en: 'How to apply the formula of non-existence in practice',
          pl: 'Jak stosować formułę nieistnienia w praktyce',
        },
        desc: {
          ru: 'Кто отвечает за ввод новичка, к кому применять формулу и чего она помогает избежать.',
          en: 'Who is responsible for the newcomer\'s induction, to whom to apply the formula, and what it helps to avoid.',
          pl: 'Kto odpowiada za wprowadzenie nowicjusza, do kogo stosować formułę i czego pomaga uniknąć.',
        },
        html: {
          ru:
            '<h2>Как применять формулу несуществования на практике</h2>' +
            '<p>Как обеспечить, чтобы каждый новый сотрудник входил именно так? Присылать его к нам на семинар перед оформлением вы не будете — и правильно. Значит, донести это до новичка должны вы сами: кто-то в компании обязан за это отвечать — непосредственный руководитель, административный директор, менеджер по персоналу. Одной написанной инструкции обычно недостаточно: пока не назначен ответственный за то, чтобы человек её изучил, она так и останется буквами на заборе. И поймите: больше нигде наш сотрудник этого, скорее всего, не узнает — таких институтов, где этому учат, я не знаю. Поэтому наша задача — по сути, перевернуть каждого входящего в компанию вверх ногами и вытрясти из него идею, что он всё знает. Даже если он работал начальником отдела продаж в совершенно аналогичной компании, он всё равно не знает здешней специфики.</p>' +
            b('ПРИМЕР · Курящий водитель, которого спас шеф',
              bp('Возьмём административного директора, который следит за дисциплиной. Есть инструкция: курить только в отведённом месте, иначе — замечание, штраф, выговор, увольнение. Всё правильно и красиво написано. Он подходит к курящему в неположенном месте: «Здесь нельзя, уйдите». Тот молча достаёт из-за уха ещё одну сигарету и продолжает. «Штраф вы уже заработали». — «Большое спасибо», — и курит дальше. А теперь деталь: это водитель грузовика, который десять лет назад был личным водителем шефа и спас его от смерти, сам при этом пострадав. В компании эту историю знают. Разумно ли было новому директору мериться с ним рогами, не выяснив таких вещей? Правила прекрасно выглядят в инструкции, но правда жизни в том, что есть люди, на которых они не работают, — и это, между прочим, справедливо: не все спасали шефа от смерти. Единственный способ добиться, чтобы он там не курил, — понять, кто он такой, договориться, подружиться и попросить его помочь дисциплинировать коллектив, а не разлагать его. Других вариантов нет.', true)) +
            '<p>Формулу несуществования новый сотрудник применяет ко всем, с кем непосредственно пересекается, и чем непосредственнее — тем старательнее. В первую очередь — к своему руководителю: тот в ответ на «что вам нужно?» назовёт, по сути, продукт, который от сотрудника ожидается. Затем — к коллегам: к главному бухгалтеру («что я и мой отдел можем сделать, чтобы облегчить вашу работу?» — «главное, вовремя давайте заявки и чётко оформляйте документы»), к начальнику склада и так далее. Сколько будущих проблем можно снять таким трёхминутным разговором! Кстати, на этом же этапе всплывает и то, чего делать не следует: если кто-то в ответ намекает, что надо брать откаты и делиться, честный человек именно сейчас это узнаёт и может сразу сказать «нет, давайте определяться». И, разумеется, здравый смысл: если начальник говорит «носи мне по утрам чай», можно ответить: «Я рад, что вы этого хотите; поднимите продажи так, чтобы вам наняли личного секретаря, — но чай по утрам я вам носить не буду».</p>' +
            '<p>Отдельно про то, чего этот подход помогает избежать. Представьте маркетолога, которого не ввели в должность как следует. Он ловит первое лицо в коридоре со своей — возможно, действительно гениальной — идеей, но в самый неудачный момент, когда у того голова занята десятком других дел. Любой, кто подходит с предложением в такую минуту, воспринимается почти как помеха, и идею откидывают, даже не выслушав. Виноват тут не маркетолог — его просто никто не учил. Виновата компания, где правила общения с руководством записаны на восемьдесят пятой странице, а не на первой: «Хочешь что-то обсудить — коротко сообщи тему любому из его помощников, и с тобой свяжутся». Пока ты не заслужил авторитет, в коридоре на ходу такие вопросы не решают.</p>' +
            r('ПРАВИЛО',
              bp('Правильное введение в должность держится на двух принципах. Первый — принцип обмена: не позволять человеку только получать зарплату и знания, а с первых дней давать ему делать что-то полезное. Второй — формула несуществования: мягко выбить из него идею, что он всё знает, и помочь узнать то, что нужно для работы.') +
              bp('Идею эту надо вытряхивать бережно — рассказывая шкалу «знать — не знать — думаю, что знаю» на отвлечённых примерах, а не на примере самого человека: на себе такое воспринять тяжело. Инструкцию написать надо обязательно, но её недостаточно; если новых сотрудников много, запишите видеоролик, где вы один раз хорошо всё это рассказываете, и назначьте ответственного.', true)),
          en:
            '<h2>How to apply the formula of non-existence in practice</h2>' +
            '<p>How to ensure that every new employee enters in precisely this way? You are not going to send him to our seminar before he is taken on — and rightly so. That means you yourselves must convey this to the newcomer: someone in the company is obliged to be responsible for it — the immediate manager, the administrative director, the HR manager. A single written instruction is usually not enough: until someone is appointed responsible for the person\'s studying it, it will remain letters on a fence. And understand: nowhere else will our employee most likely learn this — I know of no institutes where this is taught. That is why our task is, in essence, to turn every person entering the company upside down and shake out of him the idea that he knows everything. Even if he worked as a head of the sales department in an absolutely analogous company, he still does not know the local specifics.</p>' +
            b('EXAMPLE · The smoking driver whom the boss saved',
              bp('Let us take an administrative director who watches over discipline. There is an instruction: smoke only in the designated place, otherwise — a remark, a fine, a reprimand, dismissal. All correctly and nicely written. He walks up to a man smoking in a forbidden place: "You can\'t smoke here, please move away." The man silently pulls out another cigarette from behind his ear and continues. "You\'ve already earned yourself a fine." — "Thank you very much" — and he goes on smoking. And now a detail: this is a truck driver who ten years ago was the boss\'s personal driver and saved him from death, suffering injury himself in the process. In the company they know this story. Was it reasonable for the new director to lock horns with him without having found out such things? The rules look splendid in the instruction, but the truth of life is that there are people on whom they do not work — and this, by the way, is just: not everyone has saved the boss from death. The only way to get him not to smoke there is to understand who he is, come to an agreement, make friends, and ask him to help discipline the team rather than corrupt it. There are no other options.', true)) +
            '<p>The formula of non-existence a new employee applies to everyone with whom he directly intersects, and the more directly — the more diligently. First of all — to his manager: the latter, in answer to "what do you need?", will name, in essence, the product that is expected of the employee. Then — to his colleagues: to the chief accountant ("what can I and my department do to make your work easier?" — "the main thing is to submit requests on time and fill out documents clearly"), to the head of the warehouse, and so on. How many future problems can be removed by such a three-minute conversation! Incidentally, at this same stage what should not be done also surfaces: if someone, in reply, hints that one should take kickbacks and share, an honest person finds this out precisely now and can say straight away "no, let\'s get clear on this." And, of course, common sense: if the manager says "bring me tea in the mornings," one can answer: "I\'m glad you want that; raise sales so that a personal secretary is hired for you — but I will not be bringing you tea in the mornings."</p>' +
            '<p>Separately about what this approach helps to avoid. Imagine a marketer who was not properly inducted into the position. He catches the first person in the corridor with his — possibly truly brilliant — idea, but at the most inopportune moment, when the other\'s head is occupied with a dozen other matters. Anyone who approaches with a proposal at such a minute is perceived almost as a hindrance, and the idea is tossed aside without even being heard out. The one at fault here is not the marketer — no one simply taught him. The one at fault is the company, where the rules for communicating with management are written on the eighty-fifth page and not the first: "If you want to discuss something — briefly report the topic to any of his assistants, and you will be contacted." Until you have earned authority, such matters are not resolved on the fly in the corridor.</p>' +
            r('RULE',
              bp('A proper induction into a position rests on two principles. The first is the principle of exchange: not to allow the person only to receive a salary and knowledge, but from the first days to let him do something useful. The second is the formula of non-existence: to gently knock out of him the idea that he knows everything, and to help him learn what is needed for the work.') +
              bp('This idea must be shaken out carefully — by telling the scale "to know — not to know — to think I know" using abstract examples, and not the example of the person himself: it is hard to take in such a thing about oneself. The instruction must certainly be written, but it is not enough; if there are many new employees, record a video in which you tell all of this well once, and appoint someone responsible.', true)),
          pl:
            '<h2>Jak stosować formułę nieistnienia w praktyce</h2>' +
            '<p>Jak zapewnić, żeby każdy nowy pracownik wchodził właśnie tak? Przysyłać go do nas na seminarium przed zatrudnieniem nie będziecie — i słusznie. Znaczy, dotrzeć z tym do nowicjusza musicie sami: ktoś w firmie jest zobowiązany za to odpowiadać — bezpośredni przełożony, dyrektor administracyjny, menedżer ds. personelu. Jednej napisanej instrukcji zwykle nie wystarcza: dopóki nie wyznaczono odpowiedzialnego za to, żeby człowiek ją przestudiował, tak i zostanie ona literami na płocie. I zrozumcie: nigdzie więcej nasz pracownik tego najprawdopodobniej się nie dowie — takich instytutów, gdzie tego uczą, nie znam. Dlatego naszym zadaniem jest w istocie odwrócić każdego wchodzącego do firmy do góry nogami i wytrząsnąć z niego ideę, że wszystko wie. Nawet jeśli pracował jako kierownik działu sprzedaży w zupełnie analogicznej firmie, i tak nie zna tutejszej specyfiki.</p>' +
            b('PRZYKŁAD · Palący kierowca, którego uratował szef',
              bp('Weźmy dyrektora administracyjnego, który pilnuje dyscypliny. Jest instrukcja: palić tylko w wyznaczonym miejscu, inaczej — uwaga, kara, nagana, zwolnienie. Wszystko prawidłowo i pięknie napisane. Podchodzi do palącego w niedozwolonym miejscu: „Tu nie wolno, proszę odejść". Ten w milczeniu wyjmuje zza ucha jeszcze jednego papierosa i pali dalej. „Karę już sobie zarobiliście". — „Bardzo dziękuję" — i pali dalej. A teraz szczegół: to kierowca ciężarówki, który dziesięć lat temu był osobistym kierowcą szefa i uratował go od śmierci, sam przy tym ucierpiawszy. W firmie tę historię znają. Czy rozsądnie było, żeby nowy dyrektor mierzył się z nim na rogi, nie wyjaśniwszy takich rzeczy? Zasady wyglądają wspaniale w instrukcji, ale prawda życia jest taka, że są ludzie, na których one nie działają — i to, nawiasem mówiąc, jest sprawiedliwe: nie wszyscy ratowali szefa od śmierci. Jedyny sposób, żeby doprowadzić do tego, by tam nie palił — zrozumieć, kim jest, umówić się, zaprzyjaźnić i poprosić go, żeby pomógł zdyscyplinować zespół, a nie go rozkładać. Innych wariantów nie ma.', true)) +
            '<p>Formułę nieistnienia nowy pracownik stosuje do wszystkich, z którymi bezpośrednio się styka, a im bardziej bezpośrednio — tym staranniej. W pierwszej kolejności — do swojego przełożonego: ten w odpowiedzi na „co wam jest potrzebne?" nazwie w istocie produkt, którego od pracownika się oczekuje. Następnie — do kolegów: do głównego księgowego („co ja i mój dział możemy zrobić, żeby ułatwić waszą pracę?" — „najważniejsze, w porę składajcie wnioski i wyraźnie sporządzajcie dokumenty"), do kierownika magazynu i tak dalej. Ile przyszłych problemów można zdjąć taką trzyminutową rozmową! Swoją drogą, na tym samym etapie wypływa i to, czego robić nie należy: jeśli ktoś w odpowiedzi napomyka, że trzeba brać łapówki i się dzielić, uczciwy człowiek właśnie teraz się o tym dowiaduje i może od razu powiedzieć „nie, określmy się". I, oczywiście, zdrowy rozsądek: jeśli przełożony mówi „przynoś mi rano herbatę", można odpowiedzieć: „Cieszę się, że pan tego chce; niech pan podniesie sprzedaż tak, żeby panu zatrudniono osobistą sekretarkę — ale herbaty rano panu nosił nie będę".</p>' +
            '<p>Osobno o tym, czego to podejście pomaga uniknąć. Wyobraźcie sobie marketingowca, którego nie wprowadzono na stanowisko jak należy. Łapie pierwszą osobę na korytarzu ze swoim — być może naprawdę genialnym — pomysłem, ale w najbardziej niefortunnym momencie, gdy tamten ma głowę zajętą dziesiątkiem innych spraw. Każdy, kto podchodzi z propozycją w takiej chwili, odbierany jest niemal jak przeszkoda, i pomysł się odrzuca, nawet nie wysłuchawszy. Winny tu jest nie marketingowiec — jego po prostu nikt nie nauczył. Winna jest firma, gdzie zasady komunikacji z kierownictwem zapisano na osiemdziesiątej piątej stronie, a nie na pierwszej: „Chcesz coś omówić — krótko zgłoś temat któremuś z jego asystentów, i skontaktują się z tobą". Dopóki nie zasłużyłeś na autorytet, na korytarzu w biegu takich spraw się nie rozstrzyga.</p>' +
            r('ZASADA',
              bp('Prawidłowe wprowadzenie na stanowisko trzyma się na dwóch zasadach. Pierwsza — zasada wymiany: nie pozwalać człowiekowi tylko otrzymywać pensję i wiedzę, lecz od pierwszych dni dawać mu robić coś pożytecznego. Druga — formuła nieistnienia: łagodnie wybić z niego ideę, że wszystko wie, i pomóc poznać to, co potrzebne do pracy.') +
              bp('Ideę tę trzeba wytrząsać ostrożnie — opowiadając skalę „wiedzieć — nie wiedzieć — myślę, że wiem" na oderwanych przykładach, a nie na przykładzie samego człowieka: na sobie takie odebrać jest ciężko. Instrukcję napisać trzeba obowiązkowo, ale jej nie wystarcza; jeśli nowych pracowników jest wielu, nagrajcie film, gdzie raz dobrze to wszystko opowiadacie, i wyznaczcie odpowiedzialnego.', true)),
        },
      },

      // 6 — СОСТОЯНИЕ ОПАСНОСТИ. ОБХОД И ОПАСНОСТЬ
      {
        id: 'danger',
        title: {
          ru: 'Состояние опасности. Обход и опасность',
          en: 'The state of danger. Bypass and danger',
          pl: 'Stan niebezpieczeństwa. Obejście i niebezpieczeństwo',
        },
        desc: {
          ru: 'Формула опасности, почему обход и опасность — две стороны одной медали, итоги модуля.',
          en: 'The formula of danger, why bypass and danger are two sides of the same coin, and the module\'s conclusions.',
          pl: 'Formuła niebezpieczeństwa, dlaczego obejście i niebezpieczeństwo to dwie strony jednego medalu, i podsumowanie modułu.',
        },
        html: {
          ru:
            '<h2>Состояние опасности</h2>' +
            '<p>Скажу пару слов о следующем состоянии — хотя бы для того, чтобы вы могли объяснить его сотруднику. Ведь если человек правильно сделал шаги несуществования, наградой ему будет переход в состояние повыше. И вот тут есть тонкость: это следующее состояние называется опасность. Поэтому новичку важно заранее объяснить, что это неизбежно, — чтобы, попав в опасность, он не испугался, а понял, что движется в правильном направлении.</p>' +
            '<p>Что такое опасность, проще всего показать на примере. Как-то я выступал на большой конференции, и меня впервые ограничили получасом. Я к такому не привык, слайды подготовил, но не рассчитал — и, взглянув на часы, обнаружил, что говорю уже пятьдесят минут, а за спиной организатор с микрофоном. Это опасность: в зале тысяча человек, среди них две-три сотни потенциальных клиентов, наш пиар-директор с трудом договорился о выступлении, и подводить, позорить или устраивать дебош я совершенно не хочу. Что делать? На этот случай тоже есть формула — формула опасности. Идея её, на мой взгляд, гениальна, и хотя она не моя, а Хаббарда, удержаться и не рассказать её я не могу.</p>' +
            '<p>Вот её шаги:</p>' +
            '<ul>' +
            '<li><strong>Обойдите привычку или установившуюся практику.</strong> Моя привычка — листать слайды до конца и рассказывать всё, что запланировал. Вместо этого я показал один слайд, устно изложил главное и сжал двадцать минут материала в четыре-пять.</li>' +
            '<li><strong>Справьтесь с ситуацией и любой опасностью в ней.</strong> Я убедился, что донёс до людей основное, что организаторы и зал не расстроены — наоборот, потом меня обступили с вопросами, и я ещё полчаса отвечал у пресс-стены.</li>' +
            '<li><strong>Назначьте себе состояние опасности.</strong> Это самый тонкий момент. После того как вы справились с самой ситуацией, если просто выдохнуть и жить дальше, вы идёте навстречу ещё одной такой же опасности — как раз за разом наступаешь на одни и те же грабли. Поэтому вы объявляете себе состояние опасности («я ещё в опасности, потому что иду навстречу той же проблеме») и делаете дальнейшие шаги, направленные на то, чтобы найти и устранить причину.</li>' +
            '<li><strong>Введите в действие вашу собственную этику,</strong> выяснив, что именно вы делаете неэтично, и с помощью самодисциплины исправьте это. В моём случае вывод честный: я недостаточно подготовился, обнаглел и легкомысленно отнёсся к жёсткому лимиту. Одно дело проговорить материал в стенку, другое — перед залом в тысячу человек, где темп падает; этого я не учёл.</li>' +
            '<li><strong>Реорганизуйте свою жизнь так,</strong> чтобы эта опасная ситуация не возникала постоянно. Я даю добро на такие нестандартные короткие выступления только вместе с местом в расписании: за неделю до этого у меня должен быть целый день, чтобы собрать слайды, решить, что говорю, прочитать всё в зал (реальный или воображаемый) с секундомером и, если долго, сократить вдвое. Оказалось, к пятнадцатиминутному выступлению без подготовки я готов, а к получасовому по слайдам — нет.</li>' +
            '<li><strong>Сформулируйте и примите твёрдое правило,</strong> которое позволит впоследствии выявлять подобные ситуации и предотвращать их повторение.</li>' +
            '</ul>' +
            '<p>Заняли у меня эти шаги минут пятнадцать, а не три дня. Дело не в том, чтобы потратить много времени, а в том, чтобы сделать всё как следует и закончить твёрдым правилом.</p>' +
            k('КЛЮЧЕВАЯ ИДЕЯ',
              bp('Самые хорошие и разумные правила в организации — не те, что кто-то высосал из пальца, а те, что рождаются из формул опасности, то есть из реальных жизненных ситуаций.', true)) +
            b('ПРИМЕР · Формула опасности после каждого семинара',
              bp('Мы с моим партнёром и сооснователем HR-PRO.AI Мартином Руновым читаем семинары по найму уже пятнадцать лет; у нас порядка десяти тысяч отзывов, и многие называют эти семинары лучшими в своей жизни. И всё равно после каждого семинара мы по традиции делаем формулу опасности. Например, я замечаю, что одному участнику пару минут не с кем было выполнять упражнение: пришёл опоздавший, число стало нечётным. Никто, кроме меня, этого не заметил — а в результате появится ещё одно правило для ответственного за семинар, и оно ляжет в описание его должности, которое мы называем «шляпой» (от головного убора, по которому часто узнают профессию). За пятнадцать лет из таких формул опасности «шляпа» ответственного за семинар выросла вот такой толщины — потому и клиенты отмечают, что у нас всё организовано так, что другие семинары по сравнению выглядят бардаком. Математика простая: либо продавать чётному числу участников, либо держать наготове одного человека из офиса, чтобы составить пару. (Замечу в скобку: технологию найма я в своё время осваивал целиком на исходящем потоке — Мартин читал, а я тут же переводил залу, — и усвоил её отлично. Ещё одно подтверждение того, что на исходящем потоке всё получается лучше.)', true)) +
            '<h2>Обход и опасность: две стороны одной медали</h2>' +
            '<p>Чтобы понять, откуда опасность берётся, вспомним ещё один треугольник — ЗОК: знание, ответственность, контроль. Это три взаимосвязанных фактора. Если человек отвечает за какую-то область, то он знает, что в ней происходит, является причиной происходящего и контролирует его.</p>' +
            '<p>А теперь смотрите. Нередко кто-то — руководитель, коллега или даже кто-то снизу — залезает в эту область, минуя ответственного. Это называется обход. Как вы себя чувствуете, когда кто-то без вашего ведома что-то делает в вашей области? Простейший пример: вы приходите в кабинет, а довольная секретарша (по лицу видно, что ждёт как минимум премию) «навела порядок» на вашем столе. У вас там был рабочий беспорядок, но вы точно знали, где какая бумажка лежит, — то есть контролировали эту область. А она сложила ваши бумаги как попало и унесла за занавеску. Теперь вы не знаете, где что искать, — и готовы её убить. Почему? Она вас обошла. То есть обход приводит к опасности.</p>' +
            '<p>Но верно и обратное: опасность приводит к обходу. Если человек уже в опасности, его приходится обходить — других вариантов нет. Прихожу я на склад, директора склада нет, а в углу, где стоит наша мебель, в урне дымится тряпка — загорелась от окурка. Директор склада явно в опасности: сейчас всё сгорит. Единственный способ уладить это — обойти директора, залезть в его область и потушить. Не ждать же, пока он придёт, «чтобы его не обходить». Многие этого не понимают: узнав, что обход приводит к опасности, они начинают говорить «меня обходить нельзя». Нельзя обходить человека, который не в опасности, — иначе вы его в неё загоните. Но если он уже в опасности, обойти его необходимо.</p>' +
            '<p>Именно в состояние опасности и попадает новый сотрудник после того, как сделал несуществование. Возьмём личного помощника. Пока его не было, я как-то жил: кто-то давал поручения водителю, кто-то заказывал мне билеты и бронировал гостиницу. И вот помощник появляется, делает несуществование, выясняет, что мне нужно (время, внимание, а также подробные правила: например, при перелёте присылать все рейсы с ценами, авиакомпаниями и возможностью поменять билет), и начинает потихоньку это делать. Но я по инерции — как делал несколько недель до её появления — прошу заказать мне билет другого сотрудника. И когда мой новый помощник это видит, она чувствует то самое «а-а-а»: её обошли. А это и есть признак того, что она вышла из несуществования вверх — в опасность. Вот это и нужно заранее ей объяснить, чтобы она не расстроилась.</p>' +
            '<p>Между опасностью и могуществом есть и другие состояния: чрезвычайное положение, нормальная деятельность, изобилие, иногда — смена власти, и, наконец, могущество. Их подробный разбор — отдельная большая тема. Здесь же важно запомнить одну вещь про порядок действий: в опасности сначала нужно плюнуть на всё, обойти привычку и справиться с самой опасностью, и только потом анализировать причину и принимать правила на будущее. Некоторые перебарщивают и делают наоборот. Довольно странно стоять посреди улицы, когда на тебя несётся машина, и размышлять, где же ты неправильно поступил; сначала надо убежать, а уже потом, отбежав подальше, сесть и подумать, почему такая ерунда случилась.</p>' +
            r('ИТОГ МОДУЛЯ',
              bp('Всё держится на двух простых принципах. Первый: как можно быстрее загружать новичка полезной работой, чтобы у него не было только входящего потока, — но при этом, если быстрой пользы вы не видите, быстрее ставить крест, потому что дальше вы её, скорее всего, не увидите. И главное — организовать так, чтобы он мог эту пользу принести, а не обучать его два месяца впустую.') +
              bp('Второй: помочь ему пройти состояние несуществования по формуле, второе имя которой — формула для нового поста. А дальше мы перейдём от вопроса «что делать с новым сотрудником» к самому тесту: как, глядя на результат Теста Тулс, усиливать сотрудника и превращать оценку теста в практическую «шляпу» — инструкцию по должности.', true)),
          en:
            '<h2>The state of danger</h2>' +
            '<p>I will say a couple of words about the next state — if only so that you can explain it to an employee. For if a person has correctly done the steps of non-existence, his reward will be a move into a higher state. And here there is a subtlety: this next state is called danger. That is why it is important to explain to the newcomer in advance that this is inevitable — so that, on finding himself in danger, he does not take fright, but understands that he is moving in the right direction.</p>' +
            '<p>What danger is, is easiest to show by an example. Once I was speaking at a large conference, and for the first time I was limited to half an hour. I was not used to that, I had prepared slides, but I miscalculated — and, glancing at my watch, discovered that I had already been speaking for fifty minutes, with the organizer standing behind me with a microphone. This is danger: there are a thousand people in the hall, among them two or three hundred potential clients, our PR director had arranged the talk with difficulty, and I absolutely do not want to let anyone down, disgrace anyone, or make a scene. What to do? For this case, too, there is a formula — the formula of danger. Its idea, in my view, is brilliant, and although it is not mine but Hubbard\'s, I cannot restrain myself and not tell it.</p>' +
            '<p>Here are its steps:</p>' +
            '<ul>' +
            '<li><strong>Bypass the habit or established practice.</strong> My habit is to page through the slides to the end and tell everything I planned. Instead, I showed one slide, set out the main points orally, and compressed twenty minutes of material into four or five.</li>' +
            '<li><strong>Handle the situation and any danger in it.</strong> I made sure that I had conveyed the essentials to people, that the organizers and the hall were not upset — on the contrary, afterward I was surrounded with questions, and for another half hour I was answering at the press wall.</li>' +
            '<li><strong>Assign yourself a state of danger.</strong> This is the most subtle point. After you have handled the situation itself, if you simply exhale and go on living, you are heading toward yet another danger just like it — for time and again one steps on the same rake. That is why you declare a state of danger for yourself ("I am still in danger, because I am heading toward the same problem") and take further steps aimed at finding and eliminating the cause.</li>' +
            '<li><strong>Put your own ethics into action,</strong> by finding out what exactly you are doing that is unethical, and correct it by means of self-discipline. In my case the honest conclusion is: I did not prepare sufficiently, got cocky, and treated a strict limit lightly. It is one thing to run through material into a wall, another — before a hall of a thousand people, where the pace drops; this I did not take into account.</li>' +
            '<li><strong>Reorganize your life</strong> so that this dangerous situation does not keep arising. I give the go-ahead for such non-standard short talks only together with a place in the schedule: a week beforehand I must have a whole day to assemble the slides, decide what I am saying, read it all out to the hall (real or imagined) with a stopwatch, and, if it is long, cut it in half. It turned out that for a fifteen-minute talk without preparation I am ready, but for a half-hour one from slides — I am not.</li>' +
            '<li><strong>Formulate and adopt a firm policy</strong> that will subsequently make it possible to identify similar situations and prevent their recurrence.</li>' +
            '</ul>' +
            '<p>These steps took me some fifteen minutes, not three days. The point is not to spend a lot of time, but to do everything properly and finish with a firm policy.</p>' +
            k('KEY IDEA',
              bp('The best and most sensible rules in an organization are not the ones someone sucked out of their thumb, but the ones born of danger formulas, that is, of real-life situations.', true)) +
            b('EXAMPLE · A danger formula after every seminar',
              bp('My partner and co-founder of HR-PRO.AI, Martin Runov, and I have been delivering hiring seminars for fifteen years now; we have on the order of ten thousand reviews, and many call these seminars the best of their lives. And still, after every seminar, we by tradition do a danger formula. For example, I notice that one participant had no one to do an exercise with for a couple of minutes: a latecomer arrived, and the number became odd. No one but me noticed this — and as a result there will appear one more rule for the person responsible for the seminar, and it will go into the description of his post, which we call a "hat" (from the headgear by which a profession is often recognized). Over fifteen years, out of such danger formulas, the "hat" of the person responsible for the seminar has grown this thick — which is why clients, too, note that with us everything is organized so that other seminars look like a shambles by comparison. The mathematics is simple: either sell to an even number of participants, or keep one person from the office at the ready to make up a pair. (I will note in parentheses: I mastered the hiring technology at one time entirely on the outflow — Martin lectured, and I immediately translated for the hall — and absorbed it excellently. One more confirmation that on the outflow everything comes out better.)', true)) +
            '<h2>Bypass and danger: two sides of the same coin</h2>' +
            '<p>To understand where danger comes from, let us recall one more triangle — KRC: knowledge, responsibility, control. These are three interrelated factors. If a person is responsible for some area, then he knows what is happening in it, is the cause of what is happening, and controls it.</p>' +
            '<p>And now watch. Not infrequently someone — a manager, a colleague, or even someone from below — climbs into this area, bypassing the responsible person. This is called a bypass. How do you feel when someone, without your knowledge, does something in your area? The simplest example: you come into your office, and a pleased secretary (you can tell by her face that she is expecting at least a bonus) has "tidied up" your desk. You had a working disorder there, but you knew exactly where each piece of paper lay — that is, you controlled that area. And she stacked your papers any old way and carried them off behind the curtain. Now you do not know where to look for anything — and you are ready to kill her. Why? She bypassed you. That is, a bypass leads to danger.</p>' +
            '<p>But the reverse is also true: danger leads to a bypass. If a person is already in danger, he has to be bypassed — there are no other options. I come to the warehouse, the warehouse manager is not there, and in the corner, where our furniture stands, a rag is smoldering in the bin — it caught fire from a cigarette butt. The warehouse manager is clearly in danger: everything is about to burn down. The only way to handle this is to bypass the manager, climb into his area, and put it out. One is not going to wait for him to come "so as not to bypass him." Many do not understand this: having learned that a bypass leads to danger, they begin to say "I must not be bypassed." One must not bypass a person who is not in danger — otherwise you will drive him into it. But if he is already in danger, to bypass him is necessary.</p>' +
            '<p>It is precisely into the state of danger that a new employee falls after he has done non-existence. Let us take a personal assistant. While she was not there, I somehow lived: someone gave instructions to the driver, someone booked my tickets and reserved a hotel. And now the assistant appears, does non-existence, finds out what I need (time, attention, and also detailed rules: for example, when I fly, to send all the flights with prices, airlines, and the option to change the ticket), and begins little by little to do it. But I, out of inertia — as I had done for several weeks before her appearance — ask another employee to book me a ticket. And when my new assistant sees this, she feels that very "aaargh": she was bypassed. And this is precisely the sign that she has come up out of non-existence — into danger. This is what needs to be explained to her in advance, so that she does not get upset.</p>' +
            '<p>Between danger and power there are also other states: emergency, normal operation, affluence, sometimes — power change, and, finally, power. Their detailed examination is a separate large topic. Here it is important to remember one thing about the order of actions: in danger, one must first drop everything, bypass the habit, and handle the danger itself, and only then analyze the cause and adopt rules for the future. Some overdo it and do the opposite. It is rather strange to stand in the middle of the street while a car is bearing down on you and ponder where it was that you acted wrongly; first one must run away, and only then, having run off to a safe distance, sit down and think about why such nonsense happened.</p>' +
            r('MODULE CONCLUSION',
              bp('Everything rests on two simple principles. The first: to load the newcomer with useful work as quickly as possible, so that he does not have only an inflow — but at the same time, if you do not see quick benefit, to write him off sooner, because further on you most likely will not see it. And the main thing — to organize things so that he can bring this benefit, rather than training him for two months in vain.') +
              bp('The second: to help him get through the state of non-existence by the formula whose second name is the formula for a new post. And next we will move from the question "what to do with a new employee" to the test itself: how, looking at the result of the Tools Test, to strengthen an employee and turn a test assessment into a practical "hat" — a job instruction for the position.', true)),
          pl:
            '<h2>Stan niebezpieczeństwa</h2>' +
            '<p>Powiem parę słów o następnym stanie — choćby po to, żebyście mogli objaśnić go pracownikowi. Przecież jeśli człowiek prawidłowo zrobił kroki nieistnienia, nagrodą będzie mu przejście do stanu wyżej. I oto tu jest subtelność: ten następny stan nazywa się niebezpieczeństwem. Dlatego nowicjuszowi ważne jest zawczasu objaśnić, że to nieuniknione — żeby, trafiwszy w niebezpieczeństwo, nie przestraszył się, lecz zrozumiał, że porusza się w prawidłowym kierunku.</p>' +
            '<p>Czym jest niebezpieczeństwo, najprościej pokazać na przykładzie. Kiedyś występowałem na dużej konferencji, i po raz pierwszy ograniczono mnie do pół godziny. Nie przywykłem do takiego, slajdy przygotowałem, ale nie wyliczyłem — i, spojrzawszy na zegarek, odkryłem, że mówię już pięćdziesiąt minut, a za plecami organizator z mikrofonem. To niebezpieczeństwo: na sali tysiąc osób, wśród nich dwie-trzy setki potencjalnych klientów, nasz dyrektor PR z trudem umówił się na wystąpienie, i zawieść, ośmieszyć czy urządzić awanturę zupełnie nie chcę. Co robić? Na ten przypadek też jest formuła — formuła niebezpieczeństwa. Jej idea jest, moim zdaniem, genialna, i choć nie moja, lecz Hubbarda, powstrzymać się i jej nie opowiedzieć nie mogę.</p>' +
            '<p>Oto jej kroki:</p>' +
            '<ul>' +
            '<li><strong>Obejdźcie nawyk albo ustaloną praktykę.</strong> Mój nawyk to przewracać slajdy do końca i opowiadać wszystko, co zaplanowałem. Zamiast tego pokazałem jeden slajd, ustnie wyłożyłem najważniejsze i sprężyłem dwadzieścia minut materiału w cztery-pięć.</li>' +
            '<li><strong>Uporajcie się z sytuacją i wszelkim niebezpieczeństwem w niej.</strong> Upewniłem się, że doniosłem ludziom to, co podstawowe, że organizatorzy i sala nie są rozstrojeni — przeciwnie, potem obstąpiono mnie z pytaniami, i jeszcze pół godziny odpowiadałem przy ściance prasowej.</li>' +
            '<li><strong>Wyznaczcie sobie stan niebezpieczeństwa.</strong> To najsubtelniejszy moment. Po tym, jak uporaliście się z samą sytuacją, jeśli po prostu odetchnąć i żyć dalej, idziecie na spotkanie jeszcze jednego takiego samego niebezpieczeństwa — bo raz za razem nadeptuje się na te same grabie. Dlatego ogłaszacie sobie stan niebezpieczeństwa („jestem jeszcze w niebezpieczeństwie, bo idę na spotkanie tego samego problemu") i robicie dalsze kroki, nakierowane na to, żeby znaleźć i usunąć przyczynę.</li>' +
            '<li><strong>Wprowadźcie w działanie waszą własną etykę,</strong> wyjaśniwszy, co konkretnie robicie nieetycznie, i za pomocą samodyscypliny to poprawcie. W moim przypadku wniosek jest szczery: niewystarczająco się przygotowałem, zuchwałem i lekkomyślnie potraktowałem twardy limit. Co innego przemówić materiał do ściany, co innego przed salą tysiąca osób, gdzie tempo spada; tego nie uwzględniłem.</li>' +
            '<li><strong>Zreorganizujcie swoje życie tak,</strong> żeby ta niebezpieczna sytuacja nie powstawała stale. Daję zgodę na takie niestandardowe krótkie wystąpienia tylko razem z miejscem w harmonogramie: na tydzień przed tym muszę mieć cały dzień, żeby zebrać slajdy, zdecydować, co mówię, przeczytać wszystko na salę (realną albo wyobrażoną) ze stoperem i, jeśli długo, skrócić o połowę. Okazało się, że do piętnastominutowego wystąpienia bez przygotowania jestem gotów, a do półgodzinnego według slajdów — nie.</li>' +
            '<li><strong>Sformułujcie i przyjmijcie twardą zasadę,</strong> która pozwoli w przyszłości wykrywać podobne sytuacje i zapobiegać ich powtórzeniu.</li>' +
            '</ul>' +
            '<p>Zajęły mi te kroki jakieś piętnaście minut, a nie trzy dni. Rzecz nie w tym, żeby wydać dużo czasu, lecz w tym, żeby zrobić wszystko jak należy i zakończyć twardą zasadą.</p>' +
            k('KLUCZOWA MYŚL',
              bp('Najlepsze i najrozsądniejsze zasady w organizacji to nie te, które ktoś wyssał z palca, lecz te, które rodzą się z formuł niebezpieczeństwa, czyli z realnych sytuacji życiowych.', true)) +
            b('PRZYKŁAD · Formuła niebezpieczeństwa po każdym seminarium',
              bp('Ja z moim partnerem i współzałożycielem HR-PRO.AI Martinem Runowem czytamy seminaria o rekrutacji już piętnaście lat; mamy jakieś dziesięć tysięcy opinii, i wielu nazywa te seminaria najlepszymi w swoim życiu. I mimo to po każdym seminarium tradycyjnie robimy formułę niebezpieczeństwa. Na przykład zauważam, że jeden uczestnik przez parę minut nie miał z kim wykonywać ćwiczenia: przyszedł spóźniony, liczba stała się nieparzysta. Nikt oprócz mnie tego nie zauważył — a w wyniku pojawi się jeszcze jedna zasada dla odpowiedzialnego za seminarium, i wejdzie ona do opisu jego stanowiska, który nazywamy „kapeluszem" (od nakrycia głowy, po którym często rozpoznaje się zawód). Przez piętnaście lat z takich formuł niebezpieczeństwa „kapelusz" odpowiedzialnego za seminarium urósł o takiej grubości — dlatego i klienci zauważają, że u nas wszystko jest zorganizowane tak, że inne seminaria w porównaniu wyglądają jak bałagan. Matematyka prosta: albo sprzedawać parzystej liczbie uczestników, albo trzymać w gotowości jednego człowieka z biura, żeby dobrać do pary. (Zauważę w nawiasie: technologię rekrutacji swego czasu opanowywałem w całości na przepływie wychodzącym — Martin czytał, a ja tu zaraz tłumaczyłem sali — i przyswoiłem ją znakomicie. Jeszcze jedno potwierdzenie tego, że na przepływie wychodzącym wszystko wychodzi lepiej.)', true)) +
            '<h2>Obejście i niebezpieczeństwo: dwie strony jednego medalu</h2>' +
            '<p>Żeby zrozumieć, skąd bierze się niebezpieczeństwo, przypomnijmy jeszcze jeden trójkąt — WOK: wiedza, odpowiedzialność, kontrola. To trzy wzajemnie powiązane czynniki. Jeśli człowiek odpowiada za jakąś dziedzinę, to wie, co się w niej dzieje, jest przyczyną tego, co się dzieje, i to kontroluje.</p>' +
            '<p>A teraz patrzcie. Nierzadko ktoś — kierownik, kolega albo nawet ktoś z dołu — wchodzi w tę dziedzinę, omijając odpowiedzialnego. Nazywa się to obejściem. Jak się czujecie, gdy ktoś bez waszej wiedzy coś robi w waszej dziedzinie? Najprostszy przykład: przychodzicie do gabinetu, a zadowolona sekretarka (po twarzy widać, że czeka co najmniej na premię) „zrobiła porządek" na waszym biurku. Mieliście tam roboczy nieporządek, ale dokładnie wiedzieliście, gdzie jaki papierek leży — czyli kontrolowaliście tę dziedzinę. A ona poukładała wasze papiery byle jak i zaniosła za zasłonę. Teraz nie wiecie, gdzie czego szukać — i gotowi jesteście ją zabić. Dlaczego? Obeszła was. Czyli obejście prowadzi do niebezpieczeństwa.</p>' +
            '<p>Ale prawdziwe jest i odwrotne: niebezpieczeństwo prowadzi do obejścia. Jeśli człowiek już jest w niebezpieczeństwie, trzeba go obchodzić — innych wariantów nie ma. Przychodzę do magazynu, dyrektora magazynu nie ma, a w kącie, gdzie stoją nasze meble, w koszu dymi szmata — zapaliła się od niedopałka. Dyrektor magazynu wyraźnie jest w niebezpieczeństwie: zaraz wszystko spłonie. Jedyny sposób, żeby to rozładować — obejść dyrektora, wejść w jego dziedzinę i ugasić. Nie czekać przecież, aż przyjdzie, „żeby go nie obchodzić". Wielu tego nie rozumie: dowiedziawszy się, że obejście prowadzi do niebezpieczeństwa, zaczynają mówić „mnie obchodzić nie wolno". Nie wolno obchodzić człowieka, który nie jest w niebezpieczeństwie — inaczej go w nie zagonicie. Ale jeśli już jest w niebezpieczeństwie, obejść go jest konieczne.</p>' +
            '<p>Właśnie w stan niebezpieczeństwa trafia nowy pracownik po tym, jak zrobił nieistnienie. Weźmy osobistego asystenta. Póki go nie było, jakoś żyłem: ktoś dawał zlecenia kierowcy, ktoś zamawiał mi bilety i rezerwował hotel. I oto asystentka się pojawia, robi nieistnienie, wyjaśnia, co mi jest potrzebne (czas, uwaga, a także szczegółowe zasady: na przykład przy przelocie przysyłać wszystkie loty z cenami, liniami lotniczymi i możliwością zmiany biletu), i zaczyna po trochu to robić. Ale ja z rozpędu — jak robiłem kilka tygodni przed jej pojawieniem — proszę o zamówienie biletu innego pracownika. I gdy mój nowy asystent to widzi, czuje to samo „a-a-a": obeszli ją. A to właśnie jest oznaka tego, że wyszła z nieistnienia w górę — w niebezpieczeństwo. Otóż to trzeba jej zawczasu objaśnić, żeby się nie rozstroiła.</p>' +
            '<p>Między niebezpieczeństwem a potęgą są i inne stany: sytuacja nadzwyczajna, normalna działalność, obfitość, czasem — zmiana władzy, i wreszcie potęga. Ich szczegółowe omówienie to osobny duży temat. Tu zaś ważne jest zapamiętać jedną rzecz co do kolejności działań: w niebezpieczeństwie najpierw trzeba machnąć na wszystko ręką, obejść nawyk i uporać się z samym niebezpieczeństwem, i dopiero potem analizować przyczynę i przyjmować zasady na przyszłość. Niektórzy przesadzają i robią odwrotnie. Dość dziwnie jest stać na środku ulicy, gdy pędzi na ciebie samochód, i rozmyślać, gdzież to postąpiłeś niewłaściwie; najpierw trzeba uciec, a już potem, odbiegłszy dalej, usiąść i pomyśleć, dlaczego taka bzdura się zdarzyła.</p>' +
            r('PODSUMOWANIE MODUŁU',
              bp('Wszystko trzyma się na dwóch prostych zasadach. Pierwsza: jak najszybciej ładować nowicjusza pożyteczną pracą, żeby nie miał tylko przepływu przychodzącego — ale przy tym, jeśli szybkiego pożytku nie widzicie, szybciej stawiać krzyżyk, bo dalej najprawdopodobniej go nie zobaczycie. I najważniejsze — zorganizować tak, żeby on mógł ten pożytek przynieść, a nie uczyć go dwa miesiące na próżno.') +
              bp('Druga: pomóc mu przejść stan nieistnienia według formuły, której drugie imię to formuła dla nowego stanowiska. A dalej przejdziemy od pytania „co robić z nowym pracownikiem" do samego testu: jak, patrząc na wynik Testu Tools, wzmacniać pracownika i przekształcać ocenę testu w praktyczny „kapelusz" — instrukcję stanowiskową.', true)),
        },
      },
    ],
    quiz: {
      passScore: 70,
      questions: [
        {
          q: {
            ru: 'Почему автор даёт не «готовые рецепты», а принципы?',
            en: 'Why does the author give not "ready-made recipes" but principles?',
            pl: 'Dlaczego autor daje nie „gotowe recepty", lecz zasady?',
          },
          opts: [
            {
              ru: 'рецепты слишком дороги',
              en: 'recipes are too expensive',
              pl: 'recepty są zbyt drogie',
            },
            {
              ru: 'готовый рецепт сработал в одной компании и не обязательно сработает в другой, ведь у каждой своя специфика',
              en: 'a ready-made recipe worked in one company and will not necessarily work in another, since each has its own specifics',
              pl: 'gotowa recepta zadziałała w jednej firmie i niekoniecznie zadziała w innej, bo każda ma swoją specyfikę',
            },
            {
              ru: 'принципы легче заучить',
              en: 'principles are easier to memorize',
              pl: 'zasady łatwiej zapamiętać',
            },
            {
              ru: 'рецептов не существует',
              en: 'recipes do not exist',
              pl: 'recepty nie istnieją',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Как звучит принцип Хаббарда о производстве и боевом духе?',
            en: 'How does Hubbard\'s principle about production and morale sound?',
            pl: 'Jak brzmi zasada Hubbarda o produkcji i morale?',
          },
          opts: [
            {
              ru: '«Боевой дух — основа производства»',
              en: '"Morale is the basis of production"',
              pl: '„Morale jest podstawą produkcji"',
            },
            {
              ru: '«Производство — основа боевого духа»',
              en: '"Production is the basis of morale"',
              pl: '„Produkcja jest podstawą morale"',
            },
            {
              ru: '«Дух и производство не связаны»',
              en: '"Morale and production are not connected"',
              pl: '„Morale i produkcja nie są powiązane"',
            },
            {
              ru: '«Производство важнее людей»',
              en: '"Production is more important than people"',
              pl: '„Produkcja jest ważniejsza niż ludzie"',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Кого автор называет продуктивными людьми?',
            en: 'Whom does the author call productive people?',
            pl: 'Kogo autor nazywa produktywnymi ludźmi?',
          },
          opts: [
            {
              ru: 'только виннеров',
              en: 'only winners',
              pl: 'tylko winnerów',
            },
            {
              ru: 'виннеров и дуеров (причём дуеров намного больше)',
              en: 'winners and doers (and there are far more doers)',
              pl: 'winnerów i doerów (przy czym doerów jest znacznie więcej)',
            },
            {
              ru: 'только руководителей',
              en: 'only managers',
              pl: 'tylko kierowników',
            },
            {
              ru: 'только тех, у кого высокий интеллект',
              en: 'only those with high intelligence',
              pl: 'tylko tych, którzy mają wysoką inteligencję',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Когда человек чувствует себя хорошо (гордо, комфортно)?',
            en: 'When does a person feel good (proud, comfortable)?',
            pl: 'Kiedy człowiek czuje się dobrze (dumnie, komfortowo)?',
          },
          opts: [
            {
              ru: 'когда долго отдыхает',
              en: 'when he rests for a long time',
              pl: 'kiedy długo odpoczywa',
            },
            {
              ru: 'когда производит исходящий поток, полезный кому-то',
              en: 'when he produces an outflow useful to someone',
              pl: 'kiedy wytwarza przepływ wychodzący pożyteczny dla kogoś',
            },
            {
              ru: 'когда только получает',
              en: 'when he only receives',
              pl: 'kiedy tylko otrzymuje',
            },
            {
              ru: 'когда ничего не делает',
              en: 'when he does nothing',
              pl: 'kiedy nic nie robi',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'В чём «ловушка входящего потока» для новичка?',
            en: 'What is the "inflow trap" for a newcomer?',
            pl: 'Na czym polega „pułapka przepływu przychodzącego" dla nowicjusza?',
          },
          opts: [
            {
              ru: 'он получает слишком большую зарплату',
              en: 'he receives too large a salary',
              pl: 'otrzymuje zbyt dużą pensję',
            },
            {
              ru: 'он получает зарплату и обучение (входящий), но не отдаёт исходящего — обмен нарушается, банк наваливается',
              en: 'he receives salary and training (inflow) but gives no outflow — the exchange is disrupted, the bank piles up',
              pl: 'otrzymuje pensję i szkolenie (przepływ przychodzący), ale nie oddaje wychodzącego — wymiana się zaburza, bank się nawarstwia',
            },
            {
              ru: 'ему не платят вовсе',
              en: 'he is not paid at all',
              pl: 'nie płacą mu wcale',
            },
            {
              ru: 'он слишком много работает',
              en: 'he works too much',
              pl: 'pracuje zbyt dużo',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какую главную ошибку управленцев по отношению к людям называет автор?',
            en: 'What main mistake of managers toward people does the author name?',
            pl: 'Jaki główny błąd kierowników wobec ludzi wymienia autor?',
          },
          opts: [
            {
              ru: 'излишнюю строгость',
              en: 'excessive strictness',
              pl: 'nadmierną surowość',
            },
            {
              ru: '«терпение и надежду» (терпение отсутствия пользы и надежду, что она появится)',
              en: '"patience and hope" (patience with the absence of benefit and hope that it will appear)',
              pl: '„cierpliwość i nadzieję" (cierpliwość wobec braku pożytku i nadzieję, że się pojawi)',
            },
            {
              ru: 'слишком высокую зарплату',
              en: 'too high a salary',
              pl: 'zbyt wysoką pensję',
            },
            {
              ru: 'частые увольнения',
              en: 'frequent dismissals',
              pl: 'częste zwolnienia',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что нужно сделать с новичком в первые дни, чтобы не «загубить» его?',
            en: 'What should be done with a newcomer in the first days so as not to "ruin" him?',
            pl: 'Co należy zrobić z nowicjuszem w pierwszych dniach, żeby go nie „zmarnować"?',
          },
          opts: [
            {
              ru: 'только обучать целыми днями',
              en: 'only train him whole days long',
              pl: 'tylko szkolić całymi dniami',
            },
            {
              ru: 'с первого дня дать хоть какую-то полезную работу, обучать не больше полдня',
              en: 'from the first day give at least some useful work, train no more than half a day',
              pl: 'od pierwszego dnia dać choćby jakąś pożyteczną pracę, szkolić nie dłużej niż pół dnia',
            },
            {
              ru: 'отправить в отпуск',
              en: 'send him on vacation',
              pl: 'wysłać na urlop',
            },
            {
              ru: 'сразу поставить руководителем',
              en: 'immediately make him a manager',
              pl: 'od razu ustanowić go kierownikiem',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'В каком состоянии находится только что вышедший на должность сотрудник?',
            en: 'In what state is an employee who has just taken up a position?',
            pl: 'W jakim stanie znajduje się pracownik, który dopiero co objął stanowisko?',
          },
          opts: [
            {
              ru: 'в замешательстве',
              en: 'in confusion',
              pl: 'w zamęcie',
            },
            {
              ru: 'в несуществовании',
              en: 'in non-existence',
              pl: 'w nieistnieniu',
            },
            {
              ru: 'в могуществе',
              en: 'in power',
              pl: 'w potędze',
            },
            {
              ru: 'в опасности',
              en: 'in danger',
              pl: 'w niebezpieczeństwie',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Какое состояние самое низкое, а какое самое высокое?',
            en: 'Which state is the lowest and which is the highest?',
            pl: 'Który stan jest najniższy, a który najwyższy?',
          },
          opts: [
            {
              ru: 'низшее — опасность, высшее — обмен',
              en: 'lowest — danger, highest — exchange',
              pl: 'najniższy — niebezpieczeństwo, najwyższy — wymiana',
            },
            {
              ru: 'низшее — замешательство, высшее — могущество',
              en: 'lowest — confusion, highest — power',
              pl: 'najniższy — zamęt, najwyższy — potęga',
            },
            {
              ru: 'низшее — несуществование, высшее — опасность',
              en: 'lowest — non-existence, highest — danger',
              pl: 'najniższy — nieistnienie, najwyższy — niebezpieczeństwo',
            },
            {
              ru: 'низшее — рутина, высшее — новое',
              en: 'lowest — routine, highest — new',
              pl: 'najniższy — rutyna, najwyższy — nowe',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Почему «ноль» — не худший вариант найма?',
            en: 'Why is "zero" not the worst hiring outcome?',
            pl: 'Dlaczego „zero" to nie najgorszy wariant rekrutacji?',
          },
          opts: [
            {
              ru: 'потому что ноль — это идеал',
              en: 'because zero is the ideal',
              pl: 'ponieważ zero to ideał',
            },
            {
              ru: 'потому что появившийся человек либо приносит пользу, либо вред; худшее — «минус бесконечность»',
              en: 'because a person who has appeared either brings benefit or harm; the worst is "minus infinity"',
              pl: 'ponieważ pojawiony człowiek albo przynosi pożytek, albo szkodę; najgorsze to „minus nieskończoność"',
            },
            {
              ru: 'потому что ноль невозможно измерить',
              en: 'because zero cannot be measured',
              pl: 'ponieważ zera nie da się zmierzyć',
            },
            {
              ru: 'это неверно, ноль как раз худший',
              en: 'this is wrong, zero is precisely the worst',
              pl: 'to nieprawda, zero jest właśnie najgorsze',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Сколько шагов в формуле несуществования?',
            en: 'How many steps are in the formula of non-existence?',
            pl: 'Ile kroków ma formuła nieistnienia?',
          },
          opts: [
            {
              ru: 'два',
              en: 'two',
              pl: 'dwa',
            },
            {
              ru: 'четыре',
              en: 'four',
              pl: 'cztery',
            },
            {
              ru: 'шесть',
              en: 'six',
              pl: 'sześć',
            },
            {
              ru: 'десять',
              en: 'ten',
              pl: 'dziesięć',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Как правильно звучит третий шаг формулы несуществования?',
            en: 'How does the third step of the formula of non-existence correctly sound?',
            pl: 'Jak prawidłowo brzmi trzeci krok formuły nieistnienia?',
          },
          opts: [
            {
              ru: '«выясните, что требуется от вас»',
              en: '"find out what is required of you"',
              pl: '„wyjaśnijcie, czego się od was wymaga"',
            },
            {
              ru: '«выясните, что требуется или чего хотят» (без слов «от вас»)',
              en: '"find out what is required or wanted" (without the words "of you")',
              pl: '„wyjaśnijcie, czego się wymaga albo czego chcą" (bez słów „od was")',
            },
            {
              ru: '«сделайте так, как привыкли»',
              en: '"do it the way you are used to"',
              pl: '„zróbcie tak, jak przywykliście"',
            },
            {
              ru: '«дождитесь указаний»',
              en: '"wait for instructions"',
              pl: '„poczekajcie na wskazówki"',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Второе название формулы несуществования:',
            en: 'The second name of the formula of non-existence:',
            pl: 'Druga nazwa formuły nieistnienia:',
          },
          opts: [
            {
              ru: 'формула опасности',
              en: 'the formula of danger',
              pl: 'formuła niebezpieczeństwa',
            },
            {
              ru: 'формула для нового поста (нового сотрудника)',
              en: 'the formula for a new post (a new employee)',
              pl: 'formuła dla nowego stanowiska (nowego pracownika)',
            },
            {
              ru: 'формула обмена',
              en: 'the formula of exchange',
              pl: 'formuła wymiany',
            },
            {
              ru: 'формула могущества',
              en: 'the formula of power',
              pl: 'formuła potęgi',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'В опасности порядок действий такой:',
            en: 'In danger the order of actions is as follows:',
            pl: 'W niebezpieczeństwie kolejność działań jest taka:',
          },
          opts: [
            {
              ru: 'сначала анализировать причину, потом справляться с ситуацией',
              en: 'first analyze the cause, then handle the situation',
              pl: 'najpierw analizować przyczynę, potem radzić sobie z sytuacją',
            },
            {
              ru: 'сначала обойти привычку и справиться с самой опасностью, потом анализировать причину и принимать правила',
              en: 'first bypass the habit and handle the danger itself, then analyze the cause and adopt rules',
              pl: 'najpierw obejść nawyk i poradzić sobie z samym niebezpieczeństwem, potem analizować przyczynę i przyjmować zasady',
            },
            {
              ru: 'ничего не делать и ждать',
              en: 'do nothing and wait',
              pl: 'nic nie robić i czekać',
            },
            {
              ru: 'сразу вводить новые правила на будущее',
              en: 'immediately introduce new rules for the future',
              pl: 'od razu wprowadzać nowe zasady na przyszłość',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое треугольник ЗОК?',
            en: 'What is the KRC triangle?',
            pl: 'Czym jest trójkąt WOK?',
          },
          opts: [
            {
              ru: 'знание, ответственность, контроль',
              en: 'knowledge, responsibility, control',
              pl: 'wiedza, odpowiedzialność, kontrola',
            },
            {
              ru: 'закон, обмен, качество',
              en: 'law, exchange, quality',
              pl: 'prawo, wymiana, jakość',
            },
            {
              ru: 'знание, обмен, коммуникация',
              en: 'knowledge, exchange, communication',
              pl: 'wiedza, wymiana, komunikacja',
            },
            {
              ru: 'забота, ответственность, качество',
              en: 'care, responsibility, quality',
              pl: 'troska, odpowiedzialność, jakość',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Что такое «обход»?',
            en: 'What is a "bypass"?',
            pl: 'Czym jest „obejście"?',
          },
          opts: [
            {
              ru: 'когда кто-то без ведома ответственного вторгается в область, за которую тот отвечает',
              en: 'when someone, without the responsible person\'s knowledge, intrudes into the area for which that person is responsible',
              pl: 'gdy ktoś bez wiedzy osoby odpowiedzialnej wtargnie w obszar, za który ta odpowiada',
            },
            {
              ru: 'обучение нового сотрудника',
              en: 'the training of a new employee',
              pl: 'szkolenie nowego pracownika',
            },
            {
              ru: 'способ повысить зарплату',
              en: 'a way to raise a salary',
              pl: 'sposób na podwyższenie pensji',
            },
            {
              ru: 'вид рутины',
              en: 'a type of routine',
              pl: 'rodzaj rutyny',
            },
          ],
          correct: 0,
        },
        {
          q: {
            ru: 'Как связаны обход и опасность?',
            en: 'How are bypass and danger connected?',
            pl: 'Jak powiązane są obejście i niebezpieczeństwo?',
          },
          opts: [
            {
              ru: 'никак не связаны',
              en: 'not connected in any way',
              pl: 'w żaden sposób nie powiązane',
            },
            {
              ru: 'обход приводит к опасности, а опасность приводит к обходу',
              en: 'a bypass leads to danger, and danger leads to a bypass',
              pl: 'obejście prowadzi do niebezpieczeństwa, a niebezpieczeństwo prowadzi do obejścia',
            },
            {
              ru: 'обход всегда полезен',
              en: 'a bypass is always beneficial',
              pl: 'obejście zawsze jest pożyteczne',
            },
            {
              ru: 'опасность устраняет обход',
              en: 'danger eliminates the bypass',
              pl: 'niebezpieczeństwo eliminuje obejście',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Можно ли обходить человека?',
            en: 'May one bypass a person?',
            pl: 'Czy można obchodzić człowieka?',
          },
          opts: [
            {
              ru: 'обходить нельзя никого и никогда',
              en: 'one must never bypass anyone',
              pl: 'nikogo i nigdy nie wolno obchodzić',
            },
            {
              ru: 'нельзя обходить того, кто НЕ в опасности; но если он уже в опасности — обойти необходимо',
              en: 'one must not bypass someone who is NOT in danger; but if he is already in danger — a bypass is necessary',
              pl: 'nie wolno obchodzić tego, kto NIE jest w niebezpieczeństwie; ale jeśli już jest w niebezpieczeństwie — obejść trzeba koniecznie',
            },
            {
              ru: 'обходить можно любого в любой момент',
              en: 'one may bypass anyone at any moment',
              pl: 'obchodzić można każdego w dowolnym momencie',
            },
            {
              ru: 'обходить можно только руководителей',
              en: 'one may bypass only managers',
              pl: 'obchodzić można tylko kierowników',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что показывает шкала «знать — не знать — думаю, что знаю»?',
            en: 'What does the scale "to know — not to know — I think I know" show?',
            pl: 'Co pokazuje skala „wiedzieć — nie wiedzieć — myślę, że wiem"?',
          },
          opts: [
            {
              ru: 'что «думаю, что знаю» — самая высокая ступень',
              en: 'that "I think I know" is the highest rung',
              pl: 'że „myślę, że wiem" to najwyższy szczebel',
            },
            {
              ru: 'что «думаю, что знаю» — самая низкая ступень, лишь маскирующаяся под высокую',
              en: 'that "I think I know" is the lowest rung, merely masquerading as a high one',
              pl: 'że „myślę, że wiem" to najniższy szczebel, jedynie udający wysoki',
            },
            {
              ru: 'что все ступени равны',
              en: 'that all rungs are equal',
              pl: 'że wszystkie szczeble są równe',
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
            ru: 'Что должен сделать человек, входя на новую должность (по формуле несуществования)?',
            en: 'What must a person do when entering a new position (according to the formula of non-existence)?',
            pl: 'Co powinien zrobić człowiek, wchodząc na nowe stanowisko (według formuły nieistnienia)?',
          },
          opts: [
            {
              ru: 'сразу навести свои порядки',
              en: 'immediately impose his own order',
              pl: 'od razu zaprowadzić swoje porządki',
            },
            {
              ru: 'временно отложить всё, что он знает, признать, что специфики компании не знает, и начать узнавать',
              en: 'temporarily set aside everything he knows, admit that he does not know the company\'s specifics, and begin to find out',
              pl: 'tymczasowo odłożyć wszystko, co wie, przyznać, że nie zna specyfiki firmy, i zacząć się dowiadywać',
            },
            {
              ru: 'никого ни о чём не спрашивать',
              en: 'ask no one about anything',
              pl: 'nikogo o nic nie pytać',
            },
            {
              ru: 'уволить слабых сотрудников',
              en: 'dismiss the weak employees',
              pl: 'zwolnić słabych pracowników',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Что такое «шляпа» сотрудника?',
            en: 'What is an employee\'s "hat"?',
            pl: 'Czym jest „kapelusz" pracownika?',
          },
          opts: [
            {
              ru: 'элемент дресс-кода',
              en: 'an element of the dress code',
              pl: 'element dress code\'u',
            },
            {
              ru: 'описание должности (инструкция по посту)',
              en: 'a description of the position (a post instruction)',
              pl: 'opis stanowiska (instrukcja stanowiskowa)',
            },
            {
              ru: 'премия',
              en: 'a bonus',
              pl: 'premia',
            },
            {
              ru: 'название теста',
              en: 'the name of a test',
              pl: 'nazwa testu',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Пример «плюс бесконечности» от одного найма в модуле — это:',
            en: 'The example of "plus infinity" from a single hire in the module is:',
            pl: 'Przykład „plus nieskończoności" z jednej rekrutacji w module to:',
          },
          opts: [
            {
              ru: 'трейдер, обанкротивший банк',
              en: 'a trader who bankrupted a bank',
              pl: 'trader, który doprowadził bank do bankructwa',
            },
            {
              ru: 'инженер, придумавший упаковку Tetra Pak и сделавший компанию мировым лидером',
              en: 'an engineer who invented the Tetra Pak package and made the company a world leader',
              pl: 'inżynier, który wymyślił opakowanie Tetra Pak i uczynił firmę światowym liderem',
            },
            {
              ru: 'уволенный бухгалтер',
              en: 'a dismissed accountant',
              pl: 'zwolniony księgowy',
            },
            {
              ru: 'курьер',
              en: 'a courier',
              pl: 'kurier',
            },
          ],
          correct: 1,
        },
        {
          q: {
            ru: 'Чем отличается продуктивный человек от того, на кого «навалился банк»?',
            en: 'How does a productive person differ from one on whom "the bank has piled up"?',
            pl: 'Czym różni się produktywny człowiek od tego, na kogo „nawalił się bank"?',
          },
          opts: [
            {
              ru: 'ничем',
              en: 'in nothing',
              pl: 'niczym',
            },
            {
              ru: 'продуктивный приносит пользу через обмен, а тот, на кого навалился банк, пользы не приносит',
              en: 'a productive person brings benefit through exchange, while the one on whom the bank has piled up brings no benefit',
              pl: 'produktywny przynosi pożytek poprzez wymianę, a ten, na kogo nawalił się bank, pożytku nie przynosi',
            },
            {
              ru: 'продуктивный всегда молчит',
              en: 'a productive person is always silent',
              pl: 'produktywny zawsze milczy',
            },
            {
              ru: 'продуктивный не любит работать',
              en: 'a productive person does not like to work',
              pl: 'produktywny nie lubi pracować',
            },
          ],
          correct: 1,
        },
      ],
    },
  },
};
