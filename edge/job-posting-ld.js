// Генерация schema.org JobPosting (JSON-LD) для Google for Jobs и полей XML-фида.
// Из данных вакансии + заявки (form) + владельца. Все поля опциональны, дефолты безопасные (PL, FULL_TIME).

function esc(s) { return String(s == null ? '' : s); }

// Характер работы → employmentType по schema.org.
function employmentType(form) {
  const t = (esc(form && (form.workType || form.otherReq || '')) + ' ' + esc(form && form.position)).toLowerCase();
  if (/b2b|kontrakt|contract|контракт|подряд/.test(t)) return 'CONTRACTOR';
  if (/część|czesc|part[\s-]?time|частичн|неполн|pół/.test(t)) return 'PART_TIME';
  if (/staż|staz|intern|praktyk|стаж|практик/.test(t)) return 'INTERN';
  if (/tymczasow|temporary|времен/.test(t)) return 'TEMPORARY';
  return 'FULL_TIME';
}

// Признак удалённой работы.
function isRemote(form) {
  const t = (esc(form && form.workType) + ' ' + esc(form && form.otherReq) + ' ' + esc(form && form.position)).toLowerCase();
  return /zdaln|remote|zdalna|удал[её]н|hybrid|hybryd|home\s*office/.test(t);
}

// Разобрать зарплату: число/диапазон + валюта + период. Возвращает baseSalary или null.
function baseSalary(form) {
  const raw = esc(form && (form.salary || form.probationSalary || '')).trim();
  if (!raw) return null;
  const nums = (raw.match(/\d[\d\s.,]*/g) || []).map(x => parseInt(x.replace(/[^\d]/g, ''), 10)).filter(n => n > 0 && n < 100000000);
  if (!nums.length) return null;
  const low = raw.toLowerCase();
  let currency = 'PLN';
  if (/zł|zl|pln|злот/.test(low)) currency = 'PLN';
  else if (/€|eur|евро/.test(low)) currency = 'EUR';
  else if (/\$|usd|доллар/.test(low)) currency = 'USD';
  else if (/грн|uah|гривн/.test(low)) currency = 'UAH';
  else if (/£|gbp|фунт/.test(low)) currency = 'GBP';
  let unitText = 'MONTH';
  if (/godzin|\/h|hour|час|\bh\b/.test(low)) unitText = 'HOUR';
  else if (/rok|year|год|annual/.test(low)) unitText = 'YEAR';
  else if (/dzień|dzien|day|день/.test(low)) unitText = 'DAY';
  const value = nums.length >= 2 ? { '@type': 'QuantitativeValue', minValue: Math.min(...nums), maxValue: Math.max(...nums), unitText }
    : { '@type': 'QuantitativeValue', value: nums[0], unitText };
  return { '@type': 'MonetaryAmount', currency, value };
}

// Город/локация из заявки, если клиент указал (поле city/location/otherReq).
function localityOf(form) {
  const c = esc(form && (form.city || form.location || form.miasto || '')).trim();
  return c.slice(0, 80);
}

// Собрать объект JobPosting.
// opts: { vac, form, company, logo, url, datePosted, validThrough, description }
function buildJobPosting(opts) {
  const { vac, form, company, logo, url, description } = opts;
  const now = opts.datePosted || (vac && vac.createdAt) || new Date().toISOString();
  const valid = opts.validThrough || null;
  const remote = isRemote(form);
  const locality = localityOf(form);
  const jp = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: esc(vac && vac.name).slice(0, 200),
    description: esc(description || (vac && (vac.adText || vac.name)) || '').slice(0, 20000) || esc(vac && vac.name),
    datePosted: String(now).slice(0, 10),
    employmentType: employmentType(form),
    hiringOrganization: { '@type': 'Organization', name: esc(company) || 'HR PRO AI', sameAs: '', logo: esc(logo) || undefined },
    directApply: true,
    identifier: { '@type': 'PropertyValue', name: esc(company) || 'HR PRO AI', value: esc(vac && vac.id) },
  };
  if (valid) jp.validThrough = String(valid).slice(0, 10);
  if (url) jp.url = url;
  if (remote) {
    jp.jobLocationType = 'TELECOMMUTE';
    jp.applicantLocationRequirements = { '@type': 'Country', name: 'PL' };
  }
  // jobLocation всегда (Google требует для неудалённых; для удалённых допускает вместе с TELECOMMUTE)
  jp.jobLocation = { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'PL', ...(locality ? { addressLocality: locality } : {}) } };
  const sal = baseSalary(form);
  if (sal) jp.baseSalary = sal;
  if (!jp.hiringOrganization.logo) delete jp.hiringOrganization.logo;
  delete jp.hiringOrganization.sameAs;
  return jp;
}

export { buildJobPosting, employmentType, isRemote, baseSalary, localityOf };
