'use strict';
// Справочник «должность → приоритетные качества» — ТОЧНО из документа обучения
// (Тулс → «Правила», раздел «03 Ключевые способности по должностям»).
// ИИ сопоставляет введённую должность с эталонной (по синонимам RU/PL/EN),
// показывает рекомендованные качества (точки A–J методики) и отмечает совпадающие
// в списке 12 качеств формы подбора.
(function (g) {
  const L = (ru, pl, en) => ({ ru, pl, en });
  const Q = { // качество методики → {локализация, точка A–J теста «Тулс» в списке качеств формы}
    attn: { l: L('внимательность', 'uważność', 'attentiveness'), trait: 'A' },
    conf: { l: L('уверенность', 'pewność siebie', 'self-confidence'), trait: 'D' },
    act: { l: L('активность', 'aktywność', 'activity'), trait: 'E' },
    pers: { l: L('настойчивость', 'wytrwałość', 'persistence'), trait: 'F' },
    soc: { l: L('общительность', 'towarzyskość', 'sociability'), trait: 'J' },
    obj: { l: L('объективность', 'obiektywność', 'objectivity'), trait: 'H' },
    resp: { l: L('ответственность', 'odpowiedzialność', 'responsibility'), trait: 'G' },
    calm: { l: L('самообладание', 'samokontrola', 'self-control'), trait: 'C' },
  };
  // points — как в документе; q — коды качеств (см. Q); kw — синонимы для сопоставления.
  const REF = [
    { name: L('Руководитель направления', 'Kierownik działu', 'Department head'), points: 'A · D · E · F',
      q: ['attn', 'conf', 'act', 'pers'],
      kw: ['руководитель', 'директор', 'начальник', 'глава', 'заведующий', 'director', 'dyrektor', 'kierownik', 'head of', 'team lead', 'руковод'] },
    { name: L('Менеджер по продажам', 'Menedżer sprzedaży', 'Sales manager'), points: 'E · D · F · J',
      q: ['act', 'conf', 'pers', 'soc'],
      kw: ['менеджер по продажам', 'sales manager', 'продажник', 'продаж', 'продавец', 'sales', 'sale', 'sprzedaż', 'sprzedawca', 'handlowiec', 'торговый', 'seller', 'консультант', 'konsultant'] },
    { name: L('HR-менеджер', 'Menedżer HR', 'HR manager'), points: 'A · D · H · J',
      q: ['attn', 'conf', 'obj', 'soc'],
      kw: ['hr', 'hr manager', 'рекрутер', 'кадров', 'recruiter', 'kadrow', 'персонал', 'human resources', 'эйчар'] },
    { name: L('Маркетолог', 'Marketingowiec', 'Marketer'), points: 'A · H · G',
      q: ['attn', 'obj', 'resp'],
      kw: ['маркетолог', 'маркетинг', 'marketing', 'marketer', 'smm', 'бренд'] },
    { name: L('Бухгалтер', 'Księgowy', 'Accountant'), points: 'A · D · G',
      q: ['attn', 'conf', 'resp'],
      kw: ['бухгалтер', 'бухучет', 'бухучёт', 'accountant', 'księgow', 'финанс', 'finans', 'экономист'] },
    { name: L('Программист', 'Programista', 'Developer'), points: 'A · F · G',
      q: ['attn', 'pers', 'resp'],
      kw: ['программист', 'разработчик', 'developer', 'programmer', 'programista', 'backend', 'frontend', 'инженер', 'engineer', 'it', 'devops', 'тестировщик'] },
    { name: L('Офис-менеджер', 'Menedżer biura', 'Office manager'), points: 'A · D · F · J',
      q: ['attn', 'conf', 'pers', 'soc'],
      kw: ['офис-менеджер', 'офис менеджер', 'администратор', 'секретарь', 'ассистент', 'помощник', 'assistant', 'secretary', 'asystent', 'sekretar', 'office manager', 'ресепшн'] },
    { name: L('Архитектор', 'Architekt', 'Architect'), points: 'A · H · F · D',
      q: ['attn', 'obj', 'pers', 'conf'],
      kw: ['архитектор', 'architekt', 'architect', 'проектировщик', 'конструктор', 'дизайнер', 'designer', 'projektant'] },
    { name: L('PR-менеджер', 'Menedżer PR', 'PR manager'), points: 'C · F · J',
      q: ['calm', 'pers', 'soc'],
      kw: ['pr', 'пиар', 'связи с общественностью', 'public relations', 'коммуникац', 'пресс-секретарь'] },
  ];
  function matchPosition(input) {
    const s = String(input || '').toLowerCase().trim();
    if (s.length < 2) return null;
    let best = null, bestScore = 0;
    for (const pos of REF) for (const kw of pos.kw) {
      let score = 0;
      if (s === kw) score = 100;
      else if (s.includes(kw)) score = kw.length + 10;       // ключевое слово внутри ввода
      else if (kw.startsWith(s) && s.length >= 4) score = s.length; // ввод — начало ключевого слова
      if (score > bestScore) { bestScore = score; best = pos; }
    }
    return best;
  }
  // Рекомендованные качества с учётом уровня должности.
  // level: 'staff' (рядовой) — качества конкретной должности;
  //        'lead' (руководитель) — ТОЛЬКО качества руководителя направления (A·D·E·F),
  //        независимо от направления (даже РОПу нужны качества руководителя, а не продажника).
  function recommendedQualities(pos, level, lang) {
    const codes = level === 'lead' ? REF[0].q : (pos ? pos.q : []); // REF[0] = Руководитель направления
    return codes.map(code => ({ label: (Q[code].l[lang] || Q[code].l.ru), trait: Q[code].trait }));
  }
  g.POSITION_REF = REF;
  g.POSITION_Q = Q;
  g.matchPosition = matchPosition;
  g.recommendedQualities = recommendedQualities;
})(typeof window !== 'undefined' ? window : globalThis);
