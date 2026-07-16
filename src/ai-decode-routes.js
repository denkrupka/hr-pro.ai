'use strict';
// Роуты и оркестрация AI-расшифровок. Подключается из server.js: register(app, deps).
// deps = { db, save, nowISO, requireAuth, integ, computeResult, resultHint, getBaseUrl }
const fs = require('fs');
const path = require('path');
const aid = require('./ai-decode');

const DECODE_DIR = path.join(__dirname, '..', 'data', 'decodes');
try { fs.mkdirSync(DECODE_DIR, { recursive: true }); } catch (_) {}

// Три «документные» кнопки теста «Тулс» + продуктивность. Тексты «обвязки» — по языкам портала.
const tri = (ru, pl, en) => ({ ru, pl, en });
const pick = (o, lang) => (o && (o[lang] || o.ru)) || '';
const KINDS = {
  full: {
    prompt: 'full',
    title: tri('HR PRO AI · Полная расшифровка', 'HR PRO AI · Pełna interpretacja', 'HR PRO AI · Full interpretation'),
    eyebrow: tri('Полная расшифровка · отчёт', 'Pełna interpretacja · raport', 'Full interpretation · report'),
    heroTitle: tri('Расшифровка теста личностных качеств', 'Interpretacja testu cech osobowości', 'Personality traits test interpretation'),
    heroSub: tri('Разбор каждой из 10 точек, проверка компульсивности и синдромов, целостный психологический портрет и вердикт по должности.',
      'Analiza każdego z 10 punktów, sprawdzenie kompulsywności i syndromów, całościowy portret psychologiczny i werdykt względem stanowiska.',
      'A breakdown of all 10 points, a compulsivity and syndrome check, a holistic psychological portrait and a verdict for the role.'),
  },
  manual: {
    prompt: 'manual',
    title: tri('HR PRO AI · Инструкция по эксплуатации', 'HR PRO AI · Instrukcja obsługi', 'HR PRO AI · Operating manual'),
    eyebrow: tri('Инструкция по эксплуатации', 'Instrukcja obsługi', 'Operating manual'),
    heroTitle: tri('Как работать с этим человеком', 'Jak pracować z tą osobą', 'How to work with this person'),
    heroSub: tri('Практическое руководство для руководителя: стиль управления, мотивация, контроль, обратная связь, конфликты и типичные ошибки — выведены из профиля теста.',
      'Praktyczny przewodnik dla menedżera: styl zarządzania, motywacja, kontrola, informacja zwrotna, konflikty i typowe błędy — wyprowadzone z profilu testu.',
      'A practical guide for the manager: management style, motivation, control, feedback, conflicts and common mistakes — derived from the test profile.'),
  },
  presentation: {
    prompt: 'presentation',
    title: tri('HR PRO AI · Сценарий предоставления оценки', 'HR PRO AI · Scenariusz przekazania oceny', 'HR PRO AI · Assessment delivery script'),
    eyebrow: tri('Сценарий предоставления оценки', 'Scenariusz przekazania oceny', 'Assessment delivery script'),
    heroTitle: tri('Как подать сотруднику результат теста', 'Jak przekazać pracownikowi wynik testu', 'How to present the test result to the employee'),
    heroSub: tri('Пошаговый сценарий встречи: как открыть разговор, разобрать сильные стороны и зоны развития, поговорить о синдромах и завершить — по демонстрации лектора.',
      'Scenariusz spotkania krok po kroku: jak otworzyć rozmowę, omówić mocne strony i obszary rozwoju, poruszyć syndromy i zakończyć — według demonstracji wykładowcy.',
      'A step-by-step meeting script: how to open the conversation, cover strengths and development areas, address syndromes and close — per the lecturer’s demonstration.'),
  },
};
const PROD = {
  title: tri('HR PRO AI · Анализ продуктивности', 'HR PRO AI · Analiza produktywności', 'HR PRO AI · Productivity analysis'),
  eyebrow: tri('Анализ теста на продуктивность', 'Analiza testu produktywności', 'Productivity test analysis'),
  heroTitle: tri('Анализ продуктивности кандидата', 'Analiza produktywności kandydata', 'Candidate productivity analysis'),
  heroSub: tri('Тип сотрудника (Виннер/Дуер/Вейтер), уровень продуктивности и мотивации, драйверы и соответствие должности — по методике и ответам теста «Резалт».',
    'Typ pracownika (Winner/Doer/Waiter), poziom produktywności i motywacji, motywatory i dopasowanie do stanowiska — według metodyki i odpowiedzi testu „Result”.',
    'Employee type (Winner/Doer/Waiter), productivity and motivation level, drivers and role fit — per the methodology and the “Result” test answers.'),
};
const TRUNC = tri(
  '<div class="callout warn"><div class="co-title">Ответ был ограничен по объёму</div><div class="co-body">Расшифровка получилась длиннее лимита и могла оборваться. Перегенерируйте при необходимости.</div></div>',
  '<div class="callout warn"><div class="co-title">Odpowiedź została ograniczona objętościowo</div><div class="co-body">Interpretacja przekroczyła limit i mogła zostać ucięta. W razie potrzeby wygeneruj ponownie.</div></div>',
  '<div class="callout warn"><div class="co-title">The response was length-limited</div><div class="co-body">The interpretation exceeded the limit and may be truncated. Regenerate if needed.</div></div>');

function register(app, deps) {
  const { db, save, nowISO, requireAuth, integ, computeResult, resultHint, getBaseUrl } = deps;
  const langOf = req => { const l = (req.query && req.query.lang) || (req.body && req.body.lang) || ''; return ['ru', 'pl', 'en'].includes(l) ? l : 'ru'; };

  const ownTest = (id, userId) => db().tests.find(t => t.id === id && t.userId === userId);
  const decFile = (testId, kind) => path.join(DECODE_DIR, `${testId}_${kind}.html`);

  // Обязанности из заявки на найм (динамическая форма): берём поле, похожее на «обязанности», иначе — длинные текстовые.
  function reqDuties(rq) {
    if (!rq || !rq.form) return '';
    const entries = Object.entries(rq.form).filter(([, v]) => typeof v === 'string' && v.trim());
    const dutyKey = entries.find(([k]) => /обязан|дут|dut|responsib|zadan|obowi/i.test(k));
    if (dutyKey) return dutyKey[1].trim();
    return entries.filter(([, v]) => v.trim().length > 25).map(([, v]) => v.trim()).join('; ');
  }
  // Контекст вакансии кандидата: приоритет — ручной ввод (test.decodeContext), затем вакансия, затем заявка на найм.
  function vacCtx(test) {
    const data = db();
    const p = data.participants.find(x => x.id === test.participantId);
    const vac = p && data.vacancies.find(v => v.id === p.vacancyId && v.userId === test.userId);
    const rq = vac && data.requisitions.find(r => r.vacancyId === vac.id);
    const candidate = p ? (((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || '') : '';
    const dc = test.decodeContext || {};
    return {
      p, vac, rq, candidate,
      vacName: (dc.vacName || (vac && vac.name) || (rq && rq.form && rq.form.position) || '').trim(),
      roleType: dc.roleType || (vac && vac.roleType) || '',
      duties: (dc.duties || (vac && vac.duties) || reqDuties(rq) || '').trim(),
    };
  }
  function jobContextText(ctx) {
    const rt = ctx.roleType === 'lead' ? 'руководящая' : ctx.roleType === 'rank' ? 'рядовая' : 'не указан';
    return `КОНТЕКСТ ВАКАНСИИ:\nВакансия: ${ctx.vacName || '—'}\nТип должности: ${rt}\nОсновные обязанности: ${ctx.duties || '—'}`;
  }
  function candidateCtxBlock(test, ctx) {
    // Стабильный блок для чата: контекст кандидата (результат теста + вакансия).
    const result = computeResult(test);
    return 'КОНТЕКСТ КАНДИДАТА (не меняется в течение беседы):\n\n' +
      jobContextText(ctx) + '\n\n' + aid.toolsResultText(result);
  }

  // ── письмо «расшифровка готова» владельцу (HR) ──
  const MAIL = {
    subj: tri('Расшифровка готова', 'Interpretacja gotowa', 'Interpretation ready'),
    head: tri('Расшифровка готова', 'Interpretacja gotowa', 'Interpretation ready'),
    eyebrow: tri('AI-расшифровка', 'Interpretacja AI', 'AI interpretation'),
    body: tri('сгенерирована и сохранена в портале. Откройте страницу результата теста, чтобы посмотреть и скачать PDF.',
      'została wygenerowana i zapisana w portalu. Otwórz stronę wyniku testu, aby zobaczyć i pobrać PDF.',
      'has been generated and saved in the portal. Open the test result page to view it and download the PDF.'),
    cta: tri('Открыть в портале', 'Otwórz w portalu', 'Open in the portal'),
  };
  function notifyReady(test, label, lang) {
    try {
      const owner = db().users.find(u => u.id === test.userId);
      if (!owner || !owner.email || !integ.isConfigured(owner.settings, 'resend')) return;
      const ctx = vacCtx(test);
      const link = `${getBaseUrl()}/result/${test.id}`;
      integ.sendEmail(owner.settings, {
        to: owner.email, lang, baseUrl: getBaseUrl(),
        subject: `${pick(MAIL.subj, lang)}: ${label}${ctx.candidate ? ' — ' + ctx.candidate : ''}`,
        eyebrow: pick(MAIL.eyebrow, lang), headline: pick(MAIL.head, lang),
        bodyHtml: `«${label}»${ctx.candidate ? ` — <b>${ctx.candidate}</b>` : ''} ${pick(MAIL.body, lang)}`,
        ctaLabel: pick(MAIL.cta, lang), ctaUrl: link,
      }).catch(e => console.error('[decode-mail]', e.message));
    } catch (e) { console.error('[decode-mail]', e.message); }
  }

  // ── фоновая генерация «Тулс» ──
  async function runTools(test, kind, lang) {
    const cfg = KINDS[kind];
    const result = computeResult(test);
    const ctx = vacCtx(test);
    const promptBlock = aid.PROMPTS[cfg.prompt] + '\n\n' + aid.GUARD_TOOLS + aid.langLine(lang) + '\n\n' + aid.HTML_CONTRACT;
    const userContent = jobContextText(ctx) + '\n\n' + aid.toolsResultText(result) +
      '\n\nВыполни задачу строго по методике из базы знаний и в заданном HTML-формате. Разбери ВСЕ 10 точек A–J.';
    const out = await aid.callClaude({
      kbBlock: aid.TOOLS_KB_BLOCK, promptBlock,
      messages: [{ role: 'user', content: userContent }], maxTokens: aid.MAX_TOKENS_DECODE,
    });
    return { contentHtml: aid.toContentHtml(out.text), stopReason: out.stopReason };
  }

  // ── фоновая генерация «Резалт» (продуктивность) ──
  async function runProductivity(test, lang) {
    const ctx = vacCtx(test);
    const result = computeResult(test); // { items:[{id,text,answer,...}] }
    const answersText = (result.items || []).map(it => `${it.id}. ${it.text}\nОтвет: ${it.answer || '—'}`).join('\n\n');
    let plashka = '';
    try {
      const h = resultHint(test, lang);
      if (h) plashka = `Вердикт: ${h.verdict}\n` + (h.notes || []).map(n => '• ' + n).join('\n');
    } catch (_) {}
    const promptBlock = aid.PROMPTS.productivity + '\n\n' + aid.GUARD_PROD + aid.langLine(lang) + '\n\n' + aid.HTML_CONTRACT;
    const userContent = jobContextText(ctx) +
      '\n\nОТВЕТЫ КАНДИДАТА (тест «Резалт»):\n' + (answersText || '—') +
      '\n\nГОТОВЫЙ AI-АНАЛИЗ ПОРТАЛА (плашка):\n' + (plashka || '—') +
      '\n\nВыполни анализ продуктивности строго по методике и в заданном HTML-формате.';
    const out = await aid.callClaude({
      kbBlock: aid.PROD_KB_BLOCK, promptBlock,
      messages: [{ role: 'user', content: userContent }], maxTokens: aid.MAX_TOKENS_DECODE,
    });
    return { contentHtml: aid.toContentHtml(out.text), stopReason: out.stopReason };
  }

  function startBackground(test, kind, runner, label, lang) {
    test.decodes = test.decodes || {};
    test.decodes[kind] = { status: 'pending', startedAt: nowISO(), lang };
    save();
    (async () => {
      try {
        const out = await runner(test, kind, lang);
        try { fs.writeFileSync(decFile(test.id, kind), out.contentHtml, 'utf8'); } catch (e) { throw new Error('Запись файла: ' + e.message); }
        test.decodes[kind] = { status: 'done', doneAt: nowISO(), lang, stopReason: out.stopReason, truncated: out.stopReason === 'max_tokens' };
        save();
        notifyReady(test, label, lang);
      } catch (e) {
        test.decodes[kind] = { status: 'error', error: String(e.message || e).slice(0, 300), doneAt: nowISO(), lang };
        save();
        console.error('[decode]', kind, e.message);
      }
    })();
  }

  // Допустимые kind для типа теста
  function kindsForType(type) {
    if (type === 'tools') return ['full', 'manual', 'presentation'];
    if (type === 'result') return ['productivity'];
    return [];
  }

  // ── СТАТУС всех расшифровок теста + префилл контекста вакансии ──
  app.get('/api/decode/:testId', requireAuth, (req, res) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Не найдено' });
    const ctx = vacCtx(test);
    const kinds = kindsForType(test.type);
    const states = {};
    for (const k of kinds) states[k] = (test.decodes && test.decodes[k]) || { status: 'none' };
    res.json({
      type: test.type, kinds, states,
      hasChat: test.type === 'tools',
      chatCount: (test.aiChat || []).length,
      apiConfigured: aid.hasApiKey(),
      context: { candidate: ctx.candidate, vacancy: ctx.vacName, roleType: ctx.roleType, duties: ctx.duties },
    });
  });

  // ── Сохранить контекст вакансии (вакансия/тип должности/обязанности) ──
  // Пишем на тест (работает и без вакансии — ручной ввод). Если вакансия есть — зеркалим для переиспользования.
  app.post('/api/decode/:testId/context', requireAuth, (req, res) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Не найдено' });
    const { vacName, roleType, duties } = req.body || {};
    test.decodeContext = test.decodeContext || {};
    if (typeof vacName === 'string') test.decodeContext.vacName = vacName.slice(0, 300);
    if (roleType === 'lead' || roleType === 'rank' || roleType === '') test.decodeContext.roleType = roleType;
    if (typeof duties === 'string') test.decodeContext.duties = duties.slice(0, 4000);
    const data = db();
    const p = data.participants.find(x => x.id === test.participantId);
    const vac = p && data.vacancies.find(v => v.id === p.vacancyId && v.userId === test.userId);
    if (vac) { // переиспользование для других кандидатов на ту же вакансию
      if (roleType === 'lead' || roleType === 'rank') vac.roleType = roleType;
      if (typeof duties === 'string' && duties.trim()) vac.duties = duties.slice(0, 4000);
    }
    save();
    const c = test.decodeContext;
    res.json({ ok: true, context: { vacancy: c.vacName || '', roleType: c.roleType || '', duties: c.duties || '' } });
  });

  // ── ЗАПУСК генерации (kind: full|manual|presentation|productivity) ──
  app.post('/api/decode/:testId/:kind', requireAuth, (req, res, next) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Не найдено' });
    const kind = req.params.kind;
    if (kind === 'chat' || kind === 'context') return next();   // зарезервированные пути — свои роуты
    if (!kindsForType(test.type).includes(kind)) return res.status(400).json({ error: 'Недопустимый тип расшифровки' });
    if (!aid.hasApiKey()) return res.status(503).json({ error: 'AI не настроен: задайте ANTHROPIC_API_KEY на сервере' });
    // Контекст вакансии обязателен — не отправляем в ИИ пустой запрос по этим данным.
    const vc = vacCtx(test);
    if (!vc.roleType || !vc.vacName || !vc.duties) return res.status(422).json({ error: 'Заполните контекст вакансии (вакансия, тип должности, обязанности)' });
    const cur = test.decodes && test.decodes[kind];
    if (cur && cur.status === 'pending') return res.json({ status: 'pending' });
    if (cur && cur.status === 'done' && !(req.body && req.body.regenerate)) return res.json({ status: 'done' });
    const lang = langOf(req);
    const label = kind === 'productivity' ? pick(PROD.eyebrow, lang) : pick(KINDS[kind].eyebrow, lang);
    const runner = kind === 'productivity' ? (t, k, l) => runProductivity(t, l) : runTools;
    startBackground(test, kind, runner, label, lang);
    res.json({ status: 'pending' });
  });

  // ── СТРАНИЦА результата (стилизованная, с PDF-печатью) ──
  app.get('/decode/:testId/:kind', requireAuth, (req, res) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).send('Не найдено');
    const kind = req.params.kind;
    if (!kindsForType(test.type).includes(kind)) return res.status(404).send('Не найдено');
    const st = test.decodes && test.decodes[kind];
    if (!st || st.status !== 'done') return res.status(409).send('Расшифровка ещё не готова');
    let content = '';
    try { content = fs.readFileSync(decFile(test.id, kind), 'utf8'); } catch (_) { return res.status(410).send('Файл расшифровки не найден'); }
    const lang = (st.lang && ['ru', 'pl', 'en'].includes(st.lang)) ? st.lang : langOf(req);
    const ctx = vacCtx(test);
    const backUrl = `${getBaseUrl()}/result/${test.id}`;
    const trunc = st.truncated ? pick(TRUNC, lang) : '';

    let html;
    if (test.type === 'tools') {
      const result = computeResult(test);
      const cfg = KINDS[kind];
      html = aid.tpl.page({
        lang, title: pick(cfg.title, lang), eyebrow: pick(cfg.eyebrow, lang), heroTitle: pick(cfg.heroTitle, lang), heroSub: pick(cfg.heroSub, lang),
        candidate: ctx.candidate, vacancy: ctx.vacName, roleWordKey: kind === 'manual' ? 'employee' : 'candidate',
        spectrumHtml: aid.tpl.spectrum(result.points, result.order),
        bodyHtml: trunc + content, backUrl,
      });
    } else {
      html = aid.tpl.page({
        lang, title: pick(PROD.title, lang), eyebrow: pick(PROD.eyebrow, lang), heroTitle: pick(PROD.heroTitle, lang), heroSub: pick(PROD.heroSub, lang),
        candidate: ctx.candidate, vacancy: ctx.vacName,
        spectrumHtml: '', bodyHtml: trunc + content, backUrl,
      });
    }
    res.set('Content-Type', 'text/html; charset=utf-8').send(html);
  });

  // ── ЧАТ «Уточнить» (только «Тулс», синхронный) ──
  app.get('/api/decode/:testId/chat', requireAuth, (req, res) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Не найдено' });
    res.json({ history: test.aiChat || [], apiConfigured: aid.hasApiKey() });
  });
  app.post('/api/decode/:testId/chat', requireAuth, async (req, res) => {
    const test = ownTest(req.params.testId, req.user.id);
    if (!test) return res.status(404).json({ error: 'Не найдено' });
    if (test.type !== 'tools') return res.status(400).json({ error: 'Чат доступен для теста «Тулс»' });
    if (!aid.hasApiKey()) return res.status(503).json({ error: 'AI не настроен: задайте ANTHROPIC_API_KEY на сервере' });
    const message = String((req.body && req.body.message) || '').trim();
    if (!message) return res.status(400).json({ error: 'Пустой вопрос' });
    const lang = langOf(req);
    const ctx = vacCtx(test);
    test.aiChat = test.aiChat || [];
    const history = test.aiChat.map(m => ({ role: m.role, content: m.content }));
    // Промт чата + guardrails + стабильный контекст кандидата — второй (не кэшируемый) system-блок.
    const promptBlock = aid.PROMPTS.chat + '\n\n' + aid.GUARD_TOOLS + aid.langLine(lang) + '\n\n' + candidateCtxBlock(test, ctx) +
      '\n\nОтвечай на вопросы пользователя по этому кандидату строго по методике из базы знаний. Кратко и по делу, но полно. Обычный текст/markdown (без больших HTML-документов).';
    try {
      const out = await aid.callClaude({
        kbBlock: aid.TOOLS_KB_BLOCK, promptBlock,
        messages: [...history, { role: 'user', content: message }], maxTokens: aid.MAX_TOKENS_CHAT,
      });
      const answer = (out.text || '').trim();
      const at = nowISO();
      test.aiChat.push({ role: 'user', content: message, at });
      test.aiChat.push({ role: 'assistant', content: answer, at: nowISO() });
      if (test.aiChat.length > 60) test.aiChat = test.aiChat.slice(-60);
      save();
      res.json({ answer });
    } catch (e) {
      res.status(502).json({ error: 'AI: ' + (e.message || 'ошибка') });
    }
  });
}

module.exports = { register };
