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

// ---------- Дизайн-обёртка письма (единый шаблон HR PRO AI) ----------
const EMAIL_I18N = {
  ru: { eyebrow: 'Приглашение на оценку', tagline: 'Технология, которая чувствует людей', help: 'Помощь', privacy: 'Конфиденциальность', terms: 'Условия', unsub: 'Отписаться', cta: 'Начать оценку',
    legal: 'Вы получили это письмо, потому что участвуете в подборе через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  pl: { eyebrow: 'Zaproszenie do oceny', tagline: 'Technologia, która czuje ludzi', help: 'Pomoc', privacy: 'Prywatność', terms: 'Regulamin', unsub: 'Wypisz się', cta: 'Rozpocznij ocenę',
    legal: 'Otrzymujesz tę wiadomość, ponieważ bierzesz udział w rekrutacji przez platformę HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  en: { eyebrow: 'Assessment invitation', tagline: 'Technology that reads people', help: 'Help', privacy: 'Privacy', terms: 'Terms', unsub: 'Unsubscribe', cta: 'Start assessment',
    legal: 'You received this email because you are part of a hiring process on the HR PRO AI platform. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warsaw, Poland.' },
  uk: { eyebrow: 'Запрошення на оцінювання', tagline: 'Технологія, що відчуває людей', help: 'Допомога', privacy: 'Конфіденційність', terms: 'Умови', unsub: 'Відписатися', cta: 'Почати оцінювання',
    legal: 'Ви отримали цей лист, тому що берете участь у доборі через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
};
// Лого для писем — белый PNG (email-клиенты вырезают inline-SVG; белый гексагон виден на тёмной шапке).
const ELOGO_IMG = (base, size) => `<img src="${base}/email/logo-white.png" width="${size}" height="${size}" alt="HR PRO AI" style="display:inline-block;vertical-align:middle;border:0">`;
export async function unsubToken(secret, email) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'hraipro-dev-secret-change-me'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('unsub:' + String(email || '').toLowerCase()));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
export function wrapEmailEdge(o) {
  const L = EMAIL_I18N[o.lang] || EMAIL_I18N.ru; const base = (o.baseUrl || '').replace(/\/+$/, ''); const lang = o.lang || 'ru';
  const steps = Array.isArray(o.steps) && o.steps.length ? o.steps.map((s, i) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px"><tr>
      <td style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:15px 18px">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td valign="top" style="width:30px"><div style="width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#8b6cff,#6f97ff);color:#fff;font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:13px;text-align:center;line-height:26px">${s.n || (i + 1)}</div></td>
          <td style="padding-left:12px"><div style="font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:15px;color:#eef1fb;margin:0 0 3px">${s.title || ''}</div>
            <div style="font-size:13px;line-height:1.5;color:#9aa3bf">${s.sub || ''}</div></td>
        </tr></table></td></tr></table>`).join('') : '';
  const cta = o.ctaUrl ? `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:20px auto 6px"><tr>
      <td style="border-radius:13px;background:linear-gradient(135deg,#8b6cff,#6f97ff)"><a href="${o.ctaUrl}" style="display:inline-block;font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:15px;color:#ffffff;padding:15px 42px;text-decoration:none;border-radius:13px">${o.ctaLabel || L.cta}</a></td>
    </tr></table>${o.ctaNote ? `<div style="text-align:center;font-size:12.5px;color:#7b8299;margin:2px 0 4px">${o.ctaNote}</div>` : ''}` : '';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#05060d;font-family:Inter,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#05060d;padding:28px 12px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px;width:100%;background:#0d1024;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden">
<tr><td bgcolor="#141634" style="padding:32px 38px 28px;background:linear-gradient(160deg,#171a3a,#0b0c1e)">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td>${ELOGO_IMG(base, 30)}</td><td style="padding-left:10px;font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:16px;color:#ffffff">HR&nbsp;PRO&nbsp;AI</td></tr></table>
  <div style="font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b7a8ff;margin:22px 0 0">${o.eyebrow || L.eyebrow}</div>
  <div style="font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:25px;line-height:1.24;letter-spacing:-.02em;color:#ffffff;margin:10px 0 0;max-width:460px">${o.headline || o.subject || ''}</div>
</td></tr>
<tr><td style="padding:28px 38px 8px;font-size:14.5px;line-height:1.62;color:#c3cbe4">${o.bodyHtml || ''}${steps}${cta}</td></tr>
<tr><td style="padding:22px 38px 30px;background:rgba(0,0,0,.22);border-top:1px solid rgba(255,255,255,.06)">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:12px"><tr><td>${ELOGO_IMG(base, 20)}</td><td style="padding-left:9px;font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:13px;color:#c3cbe4">HR PRO AI</td><td style="padding-left:8px;font-size:12px;color:#6b7492">· ${L.tagline}</td></tr></table>
  <p style="font-size:11.5px;line-height:1.6;color:#6b7492;margin:0 0 10px;max-width:470px">${L.legal}</p>
  <div style="font-size:11.5px"><a href="mailto:help@hr-pro.ai" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.help}</a><a href="${base}/privacy?lang=${lang}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.privacy}</a><a href="${base}/terms?lang=${lang}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.terms}</a><a href="${o.unsubUrl || (base + '/unsubscribe')}" style="color:#8b93ad;text-decoration:none">${L.unsub}</a></div>
</td></tr>
</table></td></tr></table></body></html>`;
}

export async function notifyCandidate(env, user, p, test, vac, link, title) {
  const lang = (vac && vac.lang) || 'ru';
  const name = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || p.tel || '';
  const s = user.settings || {};
  const fill = str => String(str || '')
    .replace(/\{candidate\}/g, name).replace(/\{company\}/g, user.company || '')
    .replace(/\{vacancy\}/g, vac ? vac.name : '').replace(/\{test\}/g, title).replace(/\{link\}/g, link);

  const out = { email: null, sms: null };
  const resendKey = env.RESEND_API_KEY;
  const unsubbed = Array.isArray(env.__unsub) && env.__unsub.includes(String(p.email || '').toLowerCase());
  if (p.email && resendKey && !unsubbed) {
    const tpls = s.emailTemplates && Object.keys(s.emailTemplates).length ? s.emailTemplates : DEFAULT_EMAIL;
    const tpl = tpls[lang] || tpls.ru || DEFAULT_EMAIL.ru;
    const base = (env.BASE_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
    try {
      const tok = await unsubToken(env.SECRET, p.email);
      const unsubUrl = `${base}/unsubscribe?e=${btoa(String(p.email).toLowerCase())}&t=${tok}&lang=${lang}`;
      const html = wrapEmailEdge({ lang, baseUrl: base, unsubUrl, subject: fill(tpl.subject) || 'Приглашение на тестирование',
        ctaUrl: link, bodyHtml: fill(tpl.body).replace(/\n/g, '<br>') });
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: env.RESEND_FROM || 'onboarding@resend.dev', to: [p.email],
          subject: fill(tpl.subject) || 'Приглашение на тестирование', html }),
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
