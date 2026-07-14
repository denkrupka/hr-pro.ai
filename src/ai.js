'use strict';
// Простой эвристический «ИИ-ассистент» для подсказок по результатам тестов.
// Работает офлайн (без внешних API): формирует вердикт и рекомендации по данным теста.
// Многоязычно: функции принимают lang ('ru'|'pl'|'en'), тексты — из таблицы фраз L.

const L = {
  // категории продуктивности (отображение)
  cat_winner: { ru: 'Виннер', pl: 'Winner', en: 'Winner' },
  cat_doer: { ru: 'Дуэр', pl: 'Doer', en: 'Doer' },
  cat_waiter: { ru: 'Вейтер', pl: 'Waiter', en: 'Waiter' },
  // resultHint вердикты
  v_waiter: { ru: 'Ожидающий (Waiter) — высокий риск, вероятен отказ', pl: 'Oczekujący (Waiter) — wysokie ryzyko, prawdopodobna odmowa', en: 'Waiter — high risk, likely a no' },
  v_winner: { ru: 'И у нас есть виннер', pl: 'A oto nasz Winner', en: 'And we have a Winner' },
  v_doer: { ru: 'Дуэр (Doer) — полезный исполнитель под руководством', pl: 'Doer — przydatny pod kierownictwem', en: 'Doer — a useful performer under guidance' },
  // resultHint заметки
  n_q5_waiter: { ru: 'Вопрос о продукте: не может назвать продукт должности — характерный ответ «вейтера».', pl: 'Pytanie o produkt: nie potrafi nazwać produktu stanowiska — typowa odpowiedź „waitera”.', en: 'Product question: cannot name the product of the role — a typical “waiter” answer.' },
  n_q5_winner: { ru: 'Формулирует конечный продукт должности — ключевой признак «виннера».', pl: 'Formułuje produkt końcowy stanowiska — kluczowa cecha „winnera”.', en: 'Clearly names the end product of the role — a key “winner” trait.' },
  n_q5_doer: { ru: 'Описывает обязанности/действия, а не конечный продукт — характерно для «дуэра».', pl: 'Opisuje obowiązki/działania zamiast produktu końcowego — typowe dla „doera”.', en: 'Describes duties/actions rather than the end product — typical of a “doer”.' },
  n_q1: { ru: 'Не согласен, что у любой должности есть продукт — первый сигнал неадекватности.', pl: 'Nie zgadza się, że każde stanowisko ma produkt — pierwszy sygnał braku adekwatności.', en: 'Disagrees that every role has a product — a first sign of poor judgment.' },
  n_q6: { ru: 'Не измеряет объём своего продукта.', pl: 'Nie mierzy wielkości swojego produktu.', en: 'Does not measure the volume of their product.' },
  n_q9: { ru: 'Объём ответственности со временем не рос — признак «вейтера».', pl: 'Zakres odpowiedzialności z czasem nie rósł — cecha „waitera”.', en: 'Their level of responsibility did not grow over time — a “waiter” sign.' },
  n_q12: { ru: 'Резко отзывается о планировании компании — сигнал неадекватности.', pl: 'Ostro wypowiada się o planowaniu firmy — sygnał braku adekwatności.', en: 'Speaks harshly about company planning — a red flag.' },
  n_money: { ru: 'Мотивация сводится к деньгам — самая слабая мотивация.', pl: 'Motywacja sprowadza się do pieniędzy — najsłabsza motywacja.', en: 'Motivation comes down to money — the weakest motivation.' },
  n_spheres: { ru: 'Есть достижения в нескольких сферах — профиль «виннера-универсала».', pl: 'Ma osiągnięcia w kilku dziedzinach — profil „winnera-uniwersalnego”.', en: 'Has achievements in several areas — an all-round “winner” profile.' },
  n_type: { ru: 'Тип по продуктивности: {cat} (индикаторы: +{plus} / −{minus}).', pl: 'Typ wg produktywności: {cat} (wskaźniki: +{plus} / −{minus}).', en: 'Productivity type: {cat} (indicators: +{plus} / −{minus}).' },
  n_winner_desc: { ru: 'Видит продукт, измеряет и сравнивает результаты, растут работа и ответственность.', pl: 'Widzi produkt, mierzy i porównuje wyniki, rosną praca i odpowiedzialność.', en: 'Sees the product, measures and compares results; work and responsibility grow.' },
  n_doer_desc: { ru: 'Хороший исполнитель с желанием работать; продукт производит, но не формулирует. Эффективен под руководством виннера.', pl: 'Dobry wykonawca chętny do pracy; wytwarza produkt, ale go nie formułuje. Skuteczny pod kierownictwem winnera.', en: 'A good performer willing to work; produces the product but does not formulate it. Effective under a winner’s guidance.' },
  n_waiter_desc: { ru: 'Не любит дополнительную работу и ответственность, «затирает» вместо конкретики.', pl: 'Nie lubi dodatkowej pracy i odpowiedzialności, „lawiruje” zamiast konkretów.', en: 'Dislikes extra work and responsibility, deflects instead of being specific.' },
  n_final: { ru: 'Это предварительный отсев по методике — окончательное решение принимает рекрутёр по 3 ключевым вопросам и наведению справок.', pl: 'To wstępna selekcja wg metodyki — ostateczną decyzję podejmuje rekruter na podstawie 3 kluczowych pytań i referencji.', en: 'This is a preliminary screening per the methodology — the recruiter makes the final decision based on 3 key questions and reference checks.' },
  // toolsHint
  t_cheat: { ru: '⚠️ Замечены признаки недостоверного заполнения — интерпретируйте с осторожностью.', pl: '⚠️ Wykryto oznaki niewiarygodnego wypełnienia — interpretuj ostrożnie.', en: '⚠️ Signs of unreliable completion detected — interpret with caution.' },
  t_strong: { ru: 'Сильные стороны: ', pl: 'Mocne strony: ', en: 'Strengths: ' },
  t_weak: { ru: 'Зоны риска: ', pl: 'Strefy ryzyka: ', en: 'Risk areas: ' },
  t_synd: { ru: 'Ключевые синдромы: ', pl: 'Kluczowe syndromy: ', en: 'Key syndromes: ' },
  tv_recheck: { ru: 'Нужна перепроверка', pl: 'Wymaga ponownej weryfikacji', en: 'Needs re-checking' },
  tv_excellent: { ru: 'Отличный профиль', pl: 'Doskonały profil', en: 'Excellent profile' },
  tv_good: { ru: 'Хороший потенциал', pl: 'Dobry potencjał', en: 'Good potential' },
  tv_mid: { ru: 'Средний профиль', pl: 'Przeciętny profil', en: 'Average profile' },
  tv_risk: { ru: 'Профиль с рисками', pl: 'Profil z ryzykiem', en: 'Profile with risks' },
  // salesHint
  s_strong: { ru: 'Сильные стороны в продажах: ', pl: 'Mocne strony w sprzedaży: ', en: 'Sales strengths: ' },
  s_weak: { ru: 'Зоны развития: ', pl: 'Obszary do rozwoju: ', en: 'Areas to develop: ' },
  sv_strong: { ru: 'Сильный продавец', pl: 'Silny sprzedawca', en: 'Strong salesperson' },
  sv_good: { ru: 'Хороший потенциал в продажах', pl: 'Dobry potencjał sprzedażowy', en: 'Good sales potential' },
  sv_mid: { ru: 'Средний потенциал — нужна проверка на практике', pl: 'Przeciętny potencjał — wymaga sprawdzenia w praktyce', en: 'Average potential — needs a practical check' },
  sv_low: { ru: 'Слабый профиль для продаж', pl: 'Słaby profil sprzedażowy', en: 'Weak sales profile' },
  s_persist: { ru: 'Настойчивость (закрытие сделок): {g}. Результативность: {f}.', pl: 'Wytrwałość (zamykanie transakcji): {g}. Skuteczność: {f}.', en: 'Persistence (closing deals): {g}. Effectiveness: {f}.' },
  s_improve: { ru: 'Показатели можно улучшать обучением и практикой, кроме врождённых черт.', pl: 'Wskaźniki można poprawiać szkoleniem i praktyką, poza cechami wrodzonymi.', en: 'Indicators can be improved through training and practice, except innate traits.' },
};
function T(key, lang, vars) {
  let s = (L[key] && (L[key][lang] || L[key].ru)) || '';
  if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

function resultHint(test, lang) {
  lang = lang || 'ru';
  const a = test.answers || {};
  const g = id => String(a[id] != null ? a[id] : (a[String(id)] != null ? a[String(id)] : '')).toLowerCase();
  const ratings = test.ratings || {};
  const stars = Object.values(ratings).filter(v => typeof v === 'number');
  const avgStars = stars.length ? stars.reduce((x, y) => x + y, 0) / stars.length : null;

  let plus = 0, minus = 0;
  const notes = [];

  const q5 = g(5);
  const listsDuties = /обязанност|я делал|проводил|занимал|ходил|носил|звонк|встреч|процесс|выполнял задач/.test(q5);
  const cantName = /невозможно|нельзя назвать|трудно (назвать|описать)|нет продукт|только обязанност/.test(q5);
  const formulatesProduct = /мой продукт|продукт[а]? (должности|это|—|-)|конечн|результат работы|в результате/.test(q5);
  let q5role = 'unknown';
  if (cantName) { q5role = 'waiter'; minus += 2; notes.push(T('n_q5_waiter', lang)); }
  else if (formulatesProduct && !listsDuties) { q5role = 'winner'; plus += 2; notes.push(T('n_q5_winner', lang)); }
  else if (listsDuties || q5.length > 0) { q5role = 'doer'; notes.push(T('n_q5_doer', lang)); }

  if (/^да|полностью|скорее да|согласен/.test(g(1))) plus += 1;
  else if (/^нет|не согласен/.test(g(1))) { minus += 1; notes.push(T('n_q1', lang)); }

  if (/^да/.test(g(6))) plus += 1;
  else if (/^нет/.test(g(6))) { minus += 1; notes.push(T('n_q6', lang)); }

  const q7 = g(7);
  if (/\d/.test(q7) && !/примерн|около/.test(q7)) plus += 1;
  else if (/невозможно|нельзя измер|трудно/.test(q7)) { minus += 1; }

  if (/выше|больше|лучше|топ|значительно/.test(g(8))) plus += 1;
  else if (/трудно сравн|не сравн|не могу сравн/.test(g(8))) minus += 1;

  if (/рос|рост|увелич|больше/.test(g(9))) plus += 1;
  else if (/не мен|одинаков|сниж|уменьш/.test(g(9))) { minus += 1; notes.push(T('n_q9', lang)); }

  if (/рос|рост|увелич|больше/.test(g(10))) plus += 1;
  else if (/не мен|одинаков|сниж|уменьш/.test(g(10))) minus += 1;

  if (/выше/.test(g(12))) plus += 1;
  else if (/идиот|дурак|глуп/.test(g(12))) { minus += 1; notes.push(T('n_q12', lang)); }

  const money = tx => /деньг|зарплат|оплат|денежн/.test(tx) && !/развит|рост|призна|атмосфер|цели|вклад|опыт|команд/.test(tx);
  if (money(g(14)) && money(g(15))) { minus += 1; notes.push(T('n_money', lang)); }
  if (/деньг.{0,15}(за|на).{0,10}деньг/.test(g(16))) minus += 1;

  const q17 = g(17);
  const spheres = ['работ', 'бизнес', 'спорт', 'сем', 'учёб', 'учеб', 'проект', 'created', 'построил', 'создал'].filter(s => q17.includes(s)).length;
  if (spheres >= 2) { plus += 1; notes.push(T('n_spheres', lang)); }
  else if (q17.length < 10) { minus += 1; }

  if (avgStars != null) { if (avgStars >= 4) plus += 1; else if (avgStars <= 2) minus += 1; }

  let category, verdict, tone, catKey;
  if (q5role === 'waiter' || minus >= 4) {
    category = 'Вейтер'; catKey = 'cat_waiter'; verdict = T('v_waiter', lang); tone = 'low';
  } else if (q5role === 'winner' && plus >= 5 && minus <= 2) {
    category = 'Виннер'; catKey = 'cat_winner'; verdict = T('v_winner', lang); tone = 'win';
  } else {
    category = 'Дуэр'; catKey = 'cat_doer'; verdict = T('v_doer', lang); tone = 'good';
  }

  notes.unshift(T('n_type', lang, { cat: T(catKey, lang), plus, minus }));
  if (category === 'Виннер') notes.push(T('n_winner_desc', lang));
  if (category === 'Дуэр') notes.push(T('n_doer_desc', lang));
  if (category === 'Вейтер') notes.push(T('n_waiter_desc', lang));
  notes.push(T('n_final', lang));

  return { verdict, tone, category, notes };
}

function toolsHint(result, lang) {
  lang = lang || 'ru';
  const notes = [];
  if (result.cheating) notes.push(T('t_cheat', lang));
  const strong = result.order.filter(k => result.points[k].value >= 32).map(k => result.points[k].name);
  const weak = result.order.filter(k => result.points[k].value <= -32).map(k => result.points[k].name);
  if (strong.length) notes.push(T('t_strong', lang) + strong.join(', ') + '.');
  if (weak.length) notes.push(T('t_weak', lang) + weak.join(', ') + '.');
  if (result.syndromes.length) notes.push(T('t_synd', lang) + result.syndromes.map(s => s.title).join(', ') + '.');
  const avg = result.order.reduce((s, k) => s + result.points[k].value, 0) / result.order.length;
  let verdict;
  if (result.cheating) verdict = T('tv_recheck', lang);
  else if (avg >= 45) verdict = T('tv_excellent', lang);
  else if (avg >= 15) verdict = T('tv_good', lang);
  else if (avg >= -15) verdict = T('tv_mid', lang);
  else verdict = T('tv_risk', lang);
  return { verdict, notes };
}

function salesHint(result, lang) {
  lang = lang || 'ru';
  const notes = [];
  const strong = result.order.filter(k => result.points[k].value >= 60).map(k => result.points[k].name);
  const weak = result.order.filter(k => result.points[k].value < 40).map(k => result.points[k].name);
  if (strong.length) notes.push(T('s_strong', lang) + strong.join(', ') + '.');
  if (weak.length) notes.push(T('s_weak', lang) + weak.join(', ') + '.');
  const avg = result.order.reduce((s, k) => s + result.points[k].value, 0) / result.order.length;
  const g = result.points.G.value, f = result.points.F.value;
  let verdict;
  if (avg >= 60 && g >= 50) verdict = T('sv_strong', lang);
  else if (avg >= 48) verdict = T('sv_good', lang);
  else if (avg >= 38) verdict = T('sv_mid', lang);
  else verdict = T('sv_low', lang);
  notes.push(T('s_persist', lang, { g, f }));
  notes.push(T('s_improve', lang));
  return { verdict, tone: avg >= 55 ? 'good' : avg >= 40 ? 'mid' : 'low', notes };
}

module.exports = { resultHint, toolsHint, salesHint };
