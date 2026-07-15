// Парсинг резюме (CV) через Claude с vision: PDF/фото → структурированные поля кандидата.
// Ключ — из секрета Cloudflare ANTHROPIC_API_KEY. Модель с поддержкой изображений и PDF.
const MODEL = 'claude-sonnet-4-6';

function parseJson(text) {
  if (!text) return null;
  let t = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const i = t.indexOf('{'), k = t.lastIndexOf('}');
  if (i >= 0 && k > i) t = t.slice(i, k + 1);
  try { return JSON.parse(t); } catch (e) { return null; }
}

const SYSTEM = [
  'Ты — парсер резюме (CV). На вход даётся документ или изображение резюме.',
  'Извлеки данные кандидата и верни СТРОГО один JSON-объект без пояснений и без markdown-обёртки:',
  '{"name":"имя","surname":"фамилия","email":"","phone":"","city":"","position":"желаемая/последняя должность","age":число или null,"summary":"1-2 предложения кто это и ключевой опыт","skills":["навык"],"experience":["Компания — должность, годы"],"education":["учебное заведение, специальность, год"],"languages":["язык — уровень"]}',
  'Правила: если поля нет в резюме — пустая строка, пустой массив или null. Не выдумывай данные. Телефон — с кодом страны, если он есть. Email — как в документе.',
  'Значения (summary, position, skills и т.п.) оставляй на языке резюме. Массивы — максимум 8 элементов, самое важное.',
].join(' ');

// block: {type:'document'|'image', source:{...}} — готовый content-блок Anthropic
export async function parseCV(env, block) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return { error: 'no_key' };
  let r;
  try {
    r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'pdfs-2024-09-25', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: SYSTEM,
        messages: [{ role: 'user', content: [block, { type: 'text', text: 'Извлеки данные кандидата из этого резюме в JSON по схеме.' }] }] }),
    });
  } catch (e) { return { error: 'fetch' }; }
  if (!r.ok) return { error: 'api_' + r.status };
  const data = await r.json().catch(() => null);
  const text = data && data.content && data.content[0] && data.content[0].text;
  const parsed = parseJson(text);
  if (!parsed || typeof parsed !== 'object') return { error: 'parse' };
  return { data: parsed };
}

// Человекочитаемая сводка для поля «комментарий» карточки кандидата.
export function cvSummary(d, lang = 'ru') {
  const L = {
    ru: { imported: 'Импортировано из CV', pos: 'Должность', skills: 'Навыки', exp: 'Опыт', edu: 'Образование', langs: 'Языки' },
    pl: { imported: 'Zaimportowano z CV', pos: 'Stanowisko', skills: 'Umiejętności', exp: 'Doświadczenie', edu: 'Wykształcenie', langs: 'Języki' },
    en: { imported: 'Imported from CV', pos: 'Position', skills: 'Skills', exp: 'Experience', edu: 'Education', langs: 'Languages' },
  }[lang] || null;
  const T = L || { imported: 'Импортировано из CV', pos: 'Должность', skills: 'Навыки', exp: 'Опыт', edu: 'Образование', langs: 'Языки' };
  const arr = v => Array.isArray(v) ? v.filter(Boolean) : [];
  const lines = [];
  lines.push('📄 ' + T.imported);
  if (d.summary) lines.push(String(d.summary).trim());
  if (d.position) lines.push(`${T.pos}: ${d.position}`);
  if (arr(d.skills).length) lines.push(`${T.skills}: ${arr(d.skills).slice(0, 12).join(', ')}`);
  if (arr(d.experience).length) lines.push(`${T.exp}:\n· ` + arr(d.experience).slice(0, 6).join('\n· '));
  if (arr(d.education).length) lines.push(`${T.edu}:\n· ` + arr(d.education).slice(0, 4).join('\n· '));
  if (arr(d.languages).length) lines.push(`${T.langs}: ${arr(d.languages).join(', ')}`);
  return lines.join('\n').slice(0, 2000);
}
