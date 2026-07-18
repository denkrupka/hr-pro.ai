// Входящий ИИ-звонок: кандидат сам звонит на наш номер. Vapi (assistant-request) дёргает наш эндпоинт,
// передаёт номер звонящего → мы находим кандидата по номеру, собираем контекст (вакансии/статусы/история/данные вакансии)
// с СТРОГОЙ приватностью и возвращаем Vapi готового ассистента. Решения (утв. владельцем):
//  • идентификация только по номеру (Caller ID);
//  • раскрываем общий статус этапов, БЕЗ баллов; отказ/финальное решение НЕ озвучиваем;
//  • ИИ информирует + договаривается о перезвоне (сам процесс не двигает);
//  • приём круглосуточно.
import { buildWorkflow } from './workflow-edge.js';
import * as aiCallPrompts from '../src/ai-call-prompts.js';

const VOICE_BY_LANG = { ru: 'YjESejviApN7SHrbfnA2', pl: 'd4Z5Fvjohw3zxGpV8XUV', en: 'EST9Ui6982FZPSi7gCHi' };

// Локализация имени под язык разговора: латиница в русском разговоре читается по-английски (неверное ударение),
// поэтому транслитерируем имя в алфавит языка (Denys→Денис). Обратно (кириллица→латиница) для pl/en.
function latinToCyr(s) {
  let r = String(s || '').toLowerCase();
  [['shch', 'щ'], ['sch', 'щ'], ['zh', 'ж'], ['kh', 'х'], ['ch', 'ч'], ['sh', 'ш'], ['ts', 'ц'], ['ay', 'ай'], ['ey', 'ей'], ['oy', 'ой'], ['iy', 'ий'], ['uy', 'уй'], ['ya', 'я'], ['yu', 'ю'], ['yo', 'ё'], ['ye', 'е'], ['ph', 'ф'], ['ck', 'к']].forEach(([a, b]) => { r = r.split(a).join(b); });
  const m = { a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'кс', y: 'и', z: 'з' };
  return r.replace(/[a-z]/g, c => m[c] || c);
}
function cyrToLatin(s) {
  const m = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  return String(s || '').toLowerCase().replace(/[а-яё]/g, c => (c in m ? m[c] : c));
}
const cap = w => w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
export function localizeName(name, lang) {
  const s = String(name || '').trim();
  if (!s) return s;
  const hasLat = /[a-z]/i.test(s), hasCyr = /[а-яё]/i.test(s);
  const toCyr = (lang === 'ru' || lang === 'uk');
  const conv = w => toCyr ? (hasLat ? latinToCyr(w) : w) : (hasCyr ? cyrToLatin(w) : w);
  if ((toCyr && !hasLat) || (!toCyr && !hasCyr)) return s;
  return s.split(/\s+/).map(w => cap(conv(w))).join(' ');
}

// Нормализация телефона до «национального хвоста» (последние 9 цифр) — терпимо к +48 / 0048 / локальному формату.
export function phoneKey(s) {
  const d = String(s || '').replace(/\D/g, '').replace(/^00/, '');
  return d.slice(-9);
}

// Найти ВСЕ записи кандидата (по всем аккаунтам/вакансиям) с этим номером. Возвращает участников (data).
export async function findByPhone(S, number) {
  const key = phoneKey(number);
  if (!key || key.length < 7) return [];
  // Эффективнее — фильтр на стороне БД по хвосту номера (у tel могут быть пробелы/дефисы, поэтому like по подстроке цифр не годится);
  // берём всех участников и фильтруем по нормализованному ключу. При росте базы заменить на индекс/RPC по нормализованному телефону.
  const rows = await S.select('participants', 'select=data');
  return (rows || []).map(r => r.data).filter(p => p && p.tel && phoneKey(p.tel) === key);
}

// Человекочитаемый ОБЩИЙ статус этапа (без баллов). Отказ не раскрываем на уровне сборки контекста (см. buildStatusBlock).
function stageStatusText(st, wf, lang) {
  if (st.skipped) return null; // пропущенный этап не упоминаем
  const title = st.title || st.key;
  if (st.key === 'references') {
    if (Array.isArray(st.refs) && st.refs.length) {
      const total = st.refs.length, done = st.refs.filter(r => r.done).length;
      if (done >= total) return `${title}: получены все рекомендации (${total} из ${total})`;
      return `${title}: получено ${done} из ${total} рекомендаций, ждём остальных`;
    }
    return `${title}: пока не собирали`;
  }
  if (st.key === 'motivation') return st.done ? `${title}: проведена` : `${title}: предстоит`;
  // тесты (result/tools/knowledge) — говорим ВЫПОЛНЕН/ПРЕДСТОИТ, без «сдал/не сдал» и без баллов
  if (st.status === 'done') return `${title}: тест выполнен`;
  if (st.status === 'sent') return `${title}: тест отправлен, ждём прохождения`;
  return `${title}: ещё предстоит`;
}

// Собирает блок статуса по одной заявке (кандидат в конкретной вакансии/компании). Приватно и обобщённо.
function buildStatusBlock(part, vac, owner, lang) {
  const tests = part.__tests || [];
  const wf = buildWorkflow(part, lang, vac, tests);
  const company = (owner && owner.company) || '';
  const position = (vac && vac.name) || (part.__vacName) || '';
  const finalDecided = wf.column === 'rejected' || wf.column === 'hired' || wf.decision === 'rejected' || wf.decision === 'hired';
  const lines = [];
  lines.push(`Компания: ${company || '—'}; вакансия: ${position || '—'}.`);
  if (finalDecided) {
    // Отказ/финальное решение НЕ раскрываем. Нейтрально.
    lines.push('Финальное решение по заявке принимает рекрутёр — сообщи, что по итогам с кандидатом свяжется рекрутёр, НЕ называй решение (принят/отказ).');
  } else {
    const parts = (wf.stages || []).map(s => stageStatusText(s, wf, lang)).filter(Boolean);
    if (parts.length) lines.push('Статус этапов (говори ОБЩО, без баллов): ' + parts.join('; ') + '.');
    // Следующий шаг — первый незавершённый включённый этап.
    const next = (wf.stages || []).find(s => !s.skipped && s.passed !== true && s.status !== 'done' && !s.done);
    if (next) lines.push(`Ближайший ожидаемый шаг: ${next.title}.`);
  }
  // Контекст последнего звонка (чтобы продолжить прерванный разговор).
  const log = (part.workflow && part.workflow.aiCallLog) || [];
  const last = log[log.length - 1];
  if (last) {
    const att = (last.attempts || [])[ (last.attempts || []).length - 1 ] || {};
    const lastSummary = last.summary || att.summary || '';
    if (lastSummary) lines.push(`Итог последнего разговора с кандидатом: ${String(lastSummary).slice(0, 400)}`);
    const cb = last.answers && (last.answers.callback_time || last.answers.callback_when);
    if (cb) lines.push(`В прошлый раз договаривались перезвонить: ${cb}.`);
  }
  return { block: lines.join('\n'), company, position, lang: (vac && vac.lang) || lang };
}

// Данные вакансии для ответов на вопросы о найме (объявление/описание/заявка).
function vacancyInfo(vac, rq) {
  if (!vac) return '';
  const bits = [];
  if (vac.name) bits.push(`Должность: ${vac.name}.`);
  if (vac.description) bits.push(`Описание: ${String(vac.description).slice(0, 800)}`);
  else if (vac.announcement) bits.push(`Объявление: ${String(vac.announcement).slice(0, 800)}`);
  if (vac.duties) bits.push(`Обязанности: ${String(vac.duties).slice(0, 500)}`);
  if (rq && rq.data) { try { bits.push(`Заявка: ${JSON.stringify(rq.data).slice(0, 500)}`); } catch (_) {} }
  return bits.join('\n');
}

// Главная: собрать ассистента для входящего звонка по номеру звонящего.
export async function buildInboundAssistant(env, S, caller) {
  const matches = await findByPhone(S, caller);
  const agent = aiCallPrompts.agentName('ru');
  const voice = env.ELEVENLABS_API_KEY ? { provider: '11labs', voiceId: VOICE_BY_LANG.ru, model: 'eleven_multilingual_v2' } : { provider: 'azure', voiceId: 'ru-RU-SvetlanaNeural' };
  const base = {
    firstMessageMode: 'assistant-speaks-first',
    endCallFunctionEnabled: true,
    transcriber: { provider: 'deepgram', model: 'nova-2', language: 'ru' },
    voice,
    artifactPlan: { recordingEnabled: true, recordingFormat: 'mp3' },
    maxDurationSeconds: 600,
    voicemailDetection: { provider: 'vapi', backoffPlan: { maxRetries: 10, startAtSeconds: 2, frequencySeconds: 2.5 } },
  };

  // ── Неизвестный номер: общее приветствие, НИКАКИХ данных о ком-либо ──
  if (!matches.length) {
    const sys = `Ты — ${agent}, виртуальный ассистент отдела подбора персонала. Тебе звонит человек, чей номер НЕ найден в нашей базе кандидатов. `
      + 'Поздоровайся, представься виртуальным ассистентом и мягко уточни, по какому вопросу звонок: по конкретной вакансии/объявлению или общий вопрос. Ответь на общие вопросы о процессе найма. '
      + 'СТРОГО ЗАПРЕЩЕНО: раскрывать любую информацию о каких-либо кандидатах, их статусах, других людях, других компаниях или их данных — этого номера нет в базе, значит по конкретным кандидатам ты НЕ разговариваешь ни при каких условиях. '
      + 'Если спрашивают про конкретного человека («как дела у Ивана») — вежливо откажи: такую информацию по телефону мы не предоставляем. '
      + 'Если человек говорит, что он кандидат, но номер не совпал — предложи, что рекрутёр перезвонит, и запиши, по какой вакансии вопрос. Не придумывай данные. Разговор веди на русском (или на языке собеседника, если он явно на другом).';
    return { assistant: { ...base, firstMessage: 'Здравствуйте! Вы позвонили в отдел подбора персонала. Меня зовут ' + agent + '. Подскажите, пожалуйста, по какому вопросу вы звоните?', model: { provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'system', content: sys }] } }, meta: { matched: false } };
  }

  // ── Известный номер: собрать заявки этого кандидата (по всем компаниям/вакансиям) ──
  // Подгружаем тесты, вакансии, владельцев — ВСЁ параллельно (входящий SIP чувствителен к задержке ответа).
  await Promise.all(matches.map(async (p) => {
    const [tests, vac, owner] = await Promise.all([
      S.select('tests', `participant_id=eq.${p.id}&select=data`).then(r => (r || []).map(x => x.data)),
      p.vacancyId ? S.one('vacancies', p.vacancyId) : Promise.resolve(null),
      p.userId ? S.one('users', p.userId) : Promise.resolve(null),
    ]);
    p.__tests = tests; p.__vac = vac; p.__owner = owner;
    p.__rq = (vac && vac.requisitionId) ? await S.one('requisitions', vac.requisitionId) : null;
    if (vac) p.__vacName = vac.name;
  }));
  // Приоритетная запись — с непустым именем (для приветствия и языка), иначе первая.
  const primaryIdx = Math.max(0, matches.findIndex(p => ((p.name || '') + (p.surname || '')).trim()));
  const primary = matches[primaryIdx];
  const name = ((primary.name || '') + ' ' + (primary.surname || '')).trim() || 'кандидат';
  const apps = matches.map(p => {
    const sb = buildStatusBlock(p, p.__vac, p.__owner, (p.__vac && p.__vac.lang) || 'ru');
    return { company: sb.company, position: sb.position, lang: sb.lang, block: sb.block, vacInfo: vacancyInfo(p.__vac, p.__rq) };
  });
  const lang = apps[primaryIdx].lang || 'ru';
  const dispName = localizeName(name, lang); // имя в алфавите языка разговора (Denys→Денис)
  const companies = [...new Set(apps.map(a => a.company).filter(Boolean))];
  const positions = [...new Set(apps.map(a => a.position).filter(Boolean))];
  const multi = apps.length > 1 && (companies.length > 1 || positions.length > 1);

  let sys = `Ты — ${agent}, виртуальный HR-ассистент. Тебе ЗВОНИТ САМ кандидат: ${dispName} (звонок входящий, кандидат набрал нас). Ты уже знаешь его по номеру телефона. Говори тепло, по-человечески, кратко.\n`;
  sys += `ИМЯ КАНДИДАТА: обращайся к нему «${dispName}». Произноси имя на языке разговора с естественным ударением; НЕ читай его по-английски, даже если в системе оно записано латиницей.\n\n`;
  sys += 'СТРОГИЕ ПРАВИЛА ПРИВАТНОСТИ (нарушать нельзя):\n'
    + `- Ты разговариваешь ТОЛЬКО об этом кандидате (${dispName}) и ТОЛЬКО о его собственных заявках, перечисленных ниже. Никого другого не обсуждаешь.\n`
    + '- Если просят рассказать про другого человека/кандидата — вежливо откажи (такую информацию не предоставляем).\n'
    + '- Не раскрывай баллы тестов и НЕ называй финальное решение (принят/отказ) — если решение принято, скажи, что по итогам свяжется рекрутёр.\n'
    + '- Не раскрывай данные других компаний, кроме тех, что связаны с этим кандидатом ниже.\n\n';
  if (multi) {
    sys += 'Кандидат откликался на НЕСКОЛЬКО вакансий' + (companies.length > 1 ? ' в разных компаниях' : '') + '. В начале ОБЯЗАТЕЛЬНО уточни, по какой ' + (companies.length > 1 ? 'компании и ' : '') + 'вакансии вопрос, и отвечай именно по ней. Информацию по всем вакансиям ты знаешь, но озвучиваешь только по той, что назвал кандидат.\n\n';
  }
  sys += 'ВАКАНСИИ КАНДИДАТА (для тебя; в речи называй их ВАКАНСИЯМИ, не «заявками»):\n';
  apps.forEach((a, i) => { sys += `\n[Вакансия ${i + 1}] ${a.block}\n` + (a.vacInfo ? 'Данные вакансии для ответов на вопросы о найме:\n' + a.vacInfo + '\n' : ''); });
  sys += '\nЧТО ДЕЛАТЬ:\n'
    + '- Представляйся ВИРТУАЛЬНЫМ HR-менеджером (не выдавай себя за живого человека).\n'
    + '- СЛОВА (важно): позицию называй «ВАКАНСИЯ»/«должность» — НЕ «заявка» (заявка — это то, что подал сам кандидат; ему говори про вакансию). Говори чисто на языке разговора, без иностранных слов: по-русски — «рекрутёр» (никогда не «recruiter»).\n'
    + '- НАЗВАНИЯ ДОЛЖНОСТЕЙ и КОМПАНИЙ произноси естественно на языке разговора: если название на другом языке (например польское «Kierownik robót» в русском разговоре) — переведи или произнеси корректно («руководитель работ»), НЕ читай по буквам и не по-английски.\n'
    + '- Если кандидат перезвонил и не помнит/не понимает причину — НЕ повторяй одну и ту же фразу. Коротко и по-человечески напомни: ты виртуальный HR-менеджер, вы связывались по вакансии (назови её), и сразу скажи, что сейчас по ней происходит.\n'
    + '- Отвечай о статусе процесса ОБЩО (какой этап пройден, чего ждём — напр. «тест выполнен, сейчас собираем рекомендации»), без баллов; о вакансии/условиях — по данным выше.\n'
    + '- Можешь ИНФОРМИРОВАТЬ и договориться о перезвоне (рекрутёр или ты перезвонишь), но сам процесс не двигай (тесты не шлёшь, этапы не меняешь).\n'
    + '- Веди разговор на языке заявки; приём круглосуточный.\n'
    + '- ЗАВЕРШЕНИЕ: как только попрощались С ОБЕИХ СТОРОН (кандидат сказал «до свидания»/«пока» и ты ответила прощанием) — СРАЗУ заверши звонок функцией завершения, НЕ держи линию и не добавляй лишних фраз.';

  const b2 = { ...base };
  b2.transcriber = { provider: 'deepgram', model: 'nova-2', language: lang };
  b2.voice = env.ELEVENLABS_API_KEY ? { provider: '11labs', voiceId: VOICE_BY_LANG[lang] || VOICE_BY_LANG.ru, model: 'eleven_multilingual_v2' } : b2.voice;
  const fn = localizeName(primary.name || '', lang);
  const first = lang === 'pl' ? `Dzień dobry${fn ? ', ' + fn : ''}! Nazywam się ${agent}, jestem wirtualnym menedżerem HR. Miło, że Pan/Pani dzwoni. W czym mogę pomóc?`
    : lang === 'en' ? `Hello${fn ? ', ' + fn : ''}! My name is ${agent}, I'm a virtual HR manager. Glad you called. How can I help you?`
    : `Здравствуйте${fn ? ', ' + fn : ''}! Меня зовут ${agent}, я виртуальный HR-менеджер. Рада, что вы позвонили. Чем могу помочь?`;
  return { assistant: { ...b2, firstMessage: first, model: { provider: 'openai', model: 'gpt-4o-mini', messages: [{ role: 'system', content: sys }] } }, meta: { matched: true, apps: apps.length, name } };
}
