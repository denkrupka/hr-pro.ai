// Отправка приглашений кандидату на edge: Resend (email) + SMSAPI (SMS).
// Ключи — из секретов Cloudflare (env), а не из настроек клиента: это ключи портала.
const DEFAULT_EMAIL = {
  ru: { subject: 'Приглашение на тестирование — {company}', body: 'Здравствуйте, {candidate}!\n\nВас пригласили пройти тест «{test}» для вакансии «{vacancy}».\nПерейдите по ссылке: {link}\n\nС уважением, {company}' },
  pl: { subject: 'Zaproszenie na test — {company}', body: 'Dzień dobry, {candidate}!\n\nZapraszamy do wykonania testu «{test}» na stanowisko «{vacancy}».\nLink: {link}\n\nPozdrawiamy, {company}' },
  en: { subject: 'Assessment invitation — {company}', body: 'Hello, {candidate}!\n\nYou are invited to take the «{test}» assessment for the «{vacancy}» position.\nOpen the link: {link}\n\nBest regards, {company}' },
};
const DEFAULT_SMS = {
  ru: '{company}: пройдите тест «{test}» — {link}',
  pl: '{company}: wykonaj test «{test}» — {link}',
  en: '{company}: take the «{test}» test — {link}',
};

export async function notifyCandidate(env, user, p, test, vac, link, title) {
  const lang = (vac && vac.lang) || 'ru';
  const name = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || p.tel || '';
  const s = user.settings || {};
  const fill = str => String(str || '')
    .replace(/\{candidate\}/g, name).replace(/\{company\}/g, user.company || '')
    .replace(/\{vacancy\}/g, vac ? vac.name : '').replace(/\{test\}/g, title).replace(/\{link\}/g, link);

  const out = { email: null, sms: null };
  const resendKey = env.RESEND_API_KEY;
  if (p.email && resendKey) {
    const tpls = s.emailTemplates && Object.keys(s.emailTemplates).length ? s.emailTemplates : DEFAULT_EMAIL;
    const tpl = tpls[lang] || tpls.ru || DEFAULT_EMAIL.ru;
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [p.email],
          subject: fill(tpl.subject) || 'Приглашение на тестирование', html: fill(tpl.body).replace(/\n/g, '<br>') }),
      });
      out.email = r.ok ? 'sent' : ('err ' + r.status);
    } catch (e) { out.email = 'err'; }
  }

  const smsToken = env.SMSAPI_TOKEN;
  if (p.tel && smsToken) {
    const tpls = s.smsTemplates && Object.keys(s.smsTemplates).length ? s.smsTemplates : DEFAULT_SMS;
    const tpl = tpls[lang] || tpls.ru || DEFAULT_SMS.ru;
    const base = (env.SMSAPI_ENDPOINT || 'https://api.smsapi.pl').replace(/\/+$/, '');
    const params = new URLSearchParams({ to: String(p.tel).replace(/[^\d+]/g, ''),
      message: (fill(tpl) || (title + ': ' + link)).slice(0, 800), format: 'json', encoding: 'utf-8' });
    if (env.SMSAPI_FROM) params.set('from', env.SMSAPI_FROM);
    try {
      const r = await fetch(base + '/sms.do', { method: 'POST',
        headers: { Authorization: 'Bearer ' + smsToken, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
      out.sms = r.ok ? 'sent' : ('err ' + r.status);
    } catch (e) { out.sms = 'err'; }
  }
  return out;
}
