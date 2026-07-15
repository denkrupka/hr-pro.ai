// ИИ-проверка чек-листа «продукт должности» на лендинге /guide.
// Публичный эндпоинт: браузер → edge → Anthropic (ключ в Cloudflare secret ANTHROPIC_API_KEY).
// Поля 1..7 — валидация ответа по критерию (ok + пояснение-наводка, БЕЗ готового ответа).
// Поле 8 — авто-сборка формулы продукта из 7 подтверждённых ответов.

const MODEL = 'claude-haiku-4-5-20251001';

// Контекст гайда: вопрос + критерий правильности для каждого поля.
export const FIELDS = {
  1: { q: 'Должность', crit: 'Указана конкретная должность или роль (например «менеджер по продажам», «токарь»). Не общие слова вроде «специалист», «сотрудник».' },
  2: { q: 'Один законченный результат должности', crit: 'Продукт выражен существительным (результат), а не процессом/глаголом. Хорошо: «оплаченные счета от новых клиентов». Плохо: «работа с клиентами», «занимался продажами», «ведение переговоров».' },
  3: { q: 'Кто «покупает» этот продукт внутри компании? Кому он передаётся из рук в руки?', crit: 'Назван конкретный получатель продукта (клиент, руководитель, соседний отдел), которому результат передаётся из рук в руки. Если получателя нет — это занятость, а не продукт.' },
  4: { q: 'По каким 2–3 цифрам вы поймёте, что продукт есть?', crit: 'Приведены 2-3 конкретные измеримые метрики или цифры (штуки, деньги, сроки, проценты), по которым видно наличие продукта. Общие слова без чисел не подходят.' },
  5: { q: 'Как выглядит продукт через 3 месяца?', crit: 'Описан конкретный измеримый результат к концу испытательного срока (первая поставка продукта), а не «адаптация», «вхождение в должность» или «знакомство с командой».' },
  6: { q: 'Что НЕ является продуктом этой должности?', crit: 'Перечислены 3-5 процессов-ловушек, которые НЕ являются продуктом (отчёты, совещания, активность в CRM, присутствие на объекте, звонки без результата).' },
  7: { q: 'Если завтра человек не выйдет — чего в компании не будет?', crit: 'Назван конкретный результат, который исчезнет без этого человека. Если честный ответ «ничего не изменится» — должность не нужна, это надо признать (но тогда критерий не выполнен).' },
};

function parseJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const i = t.indexOf('{'), k = t.lastIndexOf('}');
  if (i >= 0 && k > i) t = t.slice(i, k + 1);
  try { return JSON.parse(t); } catch (e) { return null; }
}

async function anthropic(env, { system, user, maxTokens }) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return { error: 'no_key' };
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens || 400, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!r.ok) return { error: 'api_' + r.status };
  const data = await r.json().catch(() => null);
  const text = data && data.content && data.content[0] && data.content[0].text;
  return { text };
}

// Валидация одного поля (1..7)
async function validate(env, field, answer, ctx) {
  const F = FIELDS[field];
  if (!F) return { ok: false, hint: 'Неизвестное поле.' };
  const ans = String(answer || '').trim();
  if (ans.length < 2) return { ok: false, verdict: 'Пусто', hint: 'Впишите ваш вариант — проверю и подскажу.' };

  const role = (ctx && ctx['1'] && String(ctx['1']).trim()) || '';
  const roleLine = (field > 1 && role) ? `\nРассматриваемая должность: «${role}».` : '';

  const system = [
    'Ты — строгий, но доброжелательный наставник по методике «продукт должности» (типология Виннер/Дуер/Вейтер).',
    'Пользователь заполняет чек-лист, чтобы самостоятельно сформулировать продукт должности.',
    'Твоя задача — оценить ОДИН ответ по заданному критерию.',
    'ГЛАВНОЕ ПРАВИЛО: никогда не давай готовый правильный ответ и не приводи пример-образец для ЭТОГО ответа. Только наталкивай наводящим вопросом или указанием, что именно не так, чтобы человек сам пришёл к формулировке.',
    'Отвечай СТРОГО одним JSON-объектом без пояснений вокруг: {"ok": true|false, "verdict": "1-3 слова оценки", "hint": "1-2 предложения"}.',
    'Если ok=true — hint это короткое подтверждение, чем ответ хорош. Если ok=false — hint мягко объясняет, чего не хватает, и задаёт наводящий вопрос. Язык — русский, обращение на «вы».',
  ].join(' ');

  const user = `Вопрос чек-листа: ${F.q}\nКритерий правильности: ${F.crit}${roleLine}\n\nОтвет пользователя: «${ans}»\n\nОцени ответ по критерию и верни JSON.`;

  const res = await anthropic(env, { system, user, maxTokens: 300 });
  if (res.error) return { error: res.error };
  const parsed = parseJson(res.text);
  if (!parsed || typeof parsed.ok !== 'boolean') return { ok: false, verdict: 'Не удалось проверить', hint: 'Попробуйте ещё раз через пару секунд.' };
  return { ok: parsed.ok, verdict: String(parsed.verdict || (parsed.ok ? 'Верно' : 'Неточно')).slice(0, 60), hint: String(parsed.hint || '').slice(0, 400) };
}

// Сборка формулы (поле 8) из 7 подтверждённых ответов
async function assemble(env, ctx) {
  const g = k => String((ctx && ctx[k]) || '').trim();
  const system = [
    'Ты собираешь «продукт должности» в одну строку по методике Виннер/Дуер.',
    'На вход — 7 подтверждённых ответов пользователя.',
    'Собери строку СТРОГО по шаблону: «Продукт должности [должность] — это [продукт-существительное], который принимает [получатель], и мы измеряем его в [метрика].»',
    'Используй данные пользователя, сделай формулировку гладкой, конкретной и краткой. Все четыре части заполни.',
    'Ответь СТРОГО одним JSON-объектом: {"formula": "..."}. Язык — русский.',
  ].join(' ');
  const user = `Данные пользователя:\n1) Должность: ${g('1')}\n2) Законченный результат (продукт): ${g('2')}\n3) Получатель продукта: ${g('3')}\n4) Метрики (2-3 цифры): ${g('4')}\n5) Продукт через 3 месяца: ${g('5')}\n6) Что НЕ продукт: ${g('6')}\n7) Что исчезнет без человека: ${g('7')}\n\nСобери формулу.`;
  const res = await anthropic(env, { system, user, maxTokens: 300 });
  if (res.error) return { error: res.error };
  const parsed = parseJson(res.text);
  const formula = parsed && parsed.formula ? String(parsed.formula).slice(0, 500) : '';
  if (!formula) return { error: 'parse' };
  return { formula };
}

export async function guideCheck(env, body) {
  const field = Number(body && body.field);
  const ctx = (body && body.context) || {};
  if (field === 8) return assemble(env, ctx);
  if (field >= 1 && field <= 7) return validate(env, field, body.answer, ctx);
  return { error: 'bad_field' };
}
