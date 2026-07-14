'use strict';
// Локализация вычисленного результата теста (тексты интерпретаций/синдромов/зон/IQ) на pl/en.
// RU — базовый (данные считаются на русском), для pl/en подменяем текстовые поля.
const ocaI18n = require('./scoring/oca-i18n');
const salesI18n = require('./scoring/sales-i18n');

const ZONE_BAND = { // мужской род (band) + уровни IQ
  pl: { 'Очень низкий': 'Bardzo niski', 'Низкий': 'Niski', 'Средний': 'Średni', 'Высокий': 'Wysoki', 'Очень высокий': 'Bardzo wysoki' },
  en: { 'Очень низкий': 'Very low', 'Низкий': 'Low', 'Средний': 'Medium', 'Высокий': 'High', 'Очень высокий': 'Very high' },
};
const ZONE_LABEL = { // женский род (label / зон-пилюля)
  pl: { 'Очень низкая': 'Bardzo niska', 'Низкая': 'Niska', 'Средняя': 'Średnia', 'Высокая': 'Wysoka', 'Очень высокая': 'Bardzo wysoka' },
  en: { 'Очень низкая': 'Very low', 'Низкая': 'Low', 'Средняя': 'Medium', 'Высокая': 'High', 'Очень высокая': 'Very high' },
};
const MANIC = {
  pl: { E: 'Manik aktywności (E): poziom aktywności jest niestabilny — okresy aktywności przeplatają się z biernością.', B: 'Manik nastroju (B): poziom nastroju jest niestabilny — okresy wzlotów przeplatają się z przygnębieniem.' },
  en: { E: 'Activity mania (E): the activity level is unstable — periods of activity alternate with passivity.', B: 'Mood mania (B): the mood level is unstable — periods of elation alternate with depression.' },
};
const IQ_BANDS = {
  pl: [
    { range: 'Do 80 punktów', text: 'Bardzo niski poziom inteligencji. Nie nadaje się na stanowiska kierownicze ani wymagające zdolności umysłowych.' },
    { range: '80–100 punktów', text: 'Niski poziom inteligencji. Osoba o takiej inteligencji z trudem ocenia sytuację i podejmuje rozsądne decyzje. Nie nadaje się na stanowiska kierownicze ani do zadań wymagających zdolności analitycznych.' },
    { range: '100–120 punktów', text: 'Przeciętny poziom inteligencji. Osoba o takiej inteligencji zasadniczo potrafi oceniać sytuacje. Ten poziom wystarcza do podejmowania niezbyt złożonych decyzji, ale taki pracownik nie jest rekomendowany na stanowiska kierownicze.' },
    { range: '120–140 punktów', text: 'Wysoki poziom inteligencji. Osoba o takiej inteligencji dobrze ocenia sytuacje i podejmuje decyzje wymagające logicznego i analitycznego myślenia. Nadaje się na stanowiska kierownicze i liniowe.' },
    { range: 'Od 140 punktów', text: 'Bardzo wysoki poziom inteligencji. Osoba o takiej inteligencji potrafi oceniać sytuacje i podejmować decyzje wymagające logicznego i analitycznego myślenia. Rekomendowana na stanowiska kierownicze i wszelkie inne.' },
  ],
  en: [
    { range: 'Up to 80 points', text: 'Very low intelligence level. Not suitable for managerial roles or roles requiring mental abilities.' },
    { range: '80–100 points', text: 'Low intelligence level. A person with this intelligence struggles to assess situations and make sound decisions. Not suitable for managerial roles or tasks requiring analytical abilities.' },
    { range: '100–120 points', text: 'Average intelligence level. A person with this intelligence can generally assess situations. This level is enough for fairly simple decisions, but such an employee is not recommended for managerial roles.' },
    { range: '120–140 points', text: 'High intelligence level. A person with this intelligence assesses situations well and makes decisions requiring logical and analytical thinking. Suitable for managerial and line roles.' },
    { range: 'From 140 points', text: 'Very high intelligence level. A person with this intelligence can assess situations and make decisions requiring logical and analytical thinking. Recommended for managerial and any other roles.' },
  ],
};
function pick(map, lang, key) { return (map[lang] && map[lang][key] != null) ? map[lang][key] : key; }

function localizeResult(result, type, lang) {
  if (!result || (lang !== 'pl' && lang !== 'en')) return result;
  if (type === 'tools') {
    const d = ocaI18n[lang]; if (!d) return result;
    for (const k of (result.order || [])) {
      const p = result.points[k]; if (!p) continue;
      const pd = d.points[k]; if (pd) { p.name = pd.name; p.low = pd.low; p.high = pd.high; }
      if (d.interp[k] && d.interp[k][p.level] != null) p.interpretation = d.interp[k][p.level];
      p.band = pick(ZONE_BAND, lang, p.band); p.label = pick(ZONE_LABEL, lang, p.label);
    }
    (result.manics || []).forEach(m => { if (MANIC[lang] && MANIC[lang][m.key]) m.text = MANIC[lang][m.key]; });
    (result.syndromes || []).forEach(s => { const sd = d.syndromes[s.id]; if (sd) { s.title = sd.title; s.text = sd.text; } });
  } else if (type === 'sales') {
    const d = salesI18n[lang]; if (!d) return result;
    for (const k of (result.order || [])) {
      const p = result.points[k]; if (!p) continue;
      const id = d.indicators[k]; if (id) { p.name = id.name; p.desc = id.desc; }
      const lvl = p.value < 40 ? 'low' : p.value < 60 ? 'mid' : 'high';
      if (d.interp[k] && d.interp[k][lvl] != null) p.interpretation = d.interp[k][lvl];
      p.band = pick(ZONE_BAND, lang, p.band); p.label = pick(ZONE_LABEL, lang, p.label);
    }
  } else if (type === 'logic') {
    result.level = pick(ZONE_BAND, lang, result.level);
    if (IQ_BANDS[lang]) result.bands = IQ_BANDS[lang];
  }
  return result;
}
module.exports = { localizeResult };
