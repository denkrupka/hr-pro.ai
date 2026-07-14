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
  ru: { eyebrow: 'Приглашение на оценку', tagline: 'чувствует людей', help: 'Помощь', privacy: 'Конфиденциальность', terms: 'Условия', unsub: 'Отписаться', cta: 'Начать оценку',
    legal: 'Вы получили это письмо, потому что участвуете в подборе через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  pl: { eyebrow: 'Zaproszenie do oceny', tagline: 'czuje ludzi', help: 'Pomoc', privacy: 'Prywatność', terms: 'Regulamin', unsub: 'Wypisz się', cta: 'Rozpocznij ocenę',
    legal: 'Otrzymujesz tę wiadomość, ponieważ bierzesz udział w rekrutacji przez platformę HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  en: { eyebrow: 'Assessment invitation', tagline: 'reads people', help: 'Help', privacy: 'Privacy', terms: 'Terms', unsub: 'Unsubscribe', cta: 'Start assessment',
    legal: 'You received this email because you are part of a hiring process on the HR PRO AI platform. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warsaw, Poland.' },
};
const ELOGO = (c) => `<svg viewBox="0 0 64 64" fill="none" style="width:30px;height:30px;vertical-align:middle"><path d="M32 4 56 18 56 46 32 60 8 46 8 18Z" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" opacity=".92"/><line x1="33" y1="31" x2="22" y2="25" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="41" y2="21" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="46" y2="35" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><line x1="33" y1="31" x2="29" y2="45" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="33" cy="31" r="4.2" fill="#FF7A5C"/></svg>`;
export async function unsubToken(secret, email) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'hraipro-dev-secret-change-me'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('unsub:' + String(email || '').toLowerCase()));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
export function wrapEmailEdge(o) {
  const L = EMAIL_I18N[o.lang] || EMAIL_I18N.ru; const base = (o.baseUrl || '').replace(/\/+$/, '');
  const neural = `<svg viewBox="0 0 320 120" preserveAspectRatio="none" style="position:absolute;right:0;top:0;height:100%;width:60%;opacity:.5"><g stroke="rgba(150,140,255,.5)" stroke-width="1" fill="none"><line x1="60" y1="30" x2="150" y2="60"/><line x1="150" y1="60" x2="240" y2="28"/><line x1="150" y1="60" x2="210" y2="100"/><line x1="150" y1="60" x2="90" y2="98"/><line x1="240" y1="28" x2="300" y2="66"/></g><g fill="rgba(180,170,255,.75)"><circle cx="60" cy="30" r="3"/><circle cx="240" cy="28" r="3.4"/><circle cx="210" cy="100" r="2.8"/><circle cx="90" cy="98" r="2.6"/><circle cx="300" cy="66" r="3"/></g><circle cx="150" cy="60" r="5" fill="#FF7A5C"/></svg>`;
  const cta = o.ctaUrl ? `<div style="text-align:center;margin:6px 0 26px"><a href="${o.ctaUrl}" style="display:inline-block;font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:15px;color:#fff;padding:15px 40px;border-radius:13px;background:linear-gradient(135deg,#8b6cff,#6f97ff);text-decoration:none">${o.ctaLabel || L.cta}</a></div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="dark"></head><body style="margin:0;background:#05060d;font-family:Inter,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#05060d;padding:28px 12px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:660px;width:100%;border-collapse:collapse;background:#0d1024;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden">
<tr><td style="position:relative;overflow:hidden;padding:34px 40px 30px;background:radial-gradient(ellipse 80% 130% at 78% 0%,rgba(139,108,255,.28),transparent 62%),linear-gradient(160deg,#141634,#0a0b1c)">${neural}
<div style="position:relative;display:inline-block">${ELOGO('#fff')} <span style="font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:16px;color:#fff;vertical-align:middle">HR&nbsp;PRO&nbsp;AI</span></div>
<div style="position:relative;margin-top:22px"><span style="font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#b7a8ff">${o.eyebrow || L.eyebrow}</span>
<div style="font-family:Manrope,Arial,sans-serif;font-weight:800;font-size:24px;line-height:1.25;letter-spacing:-.02em;color:#fff;margin:10px 0 0;max-width:440px">${o.headline || o.subject || ''}</div></div></td></tr>
<tr><td style="padding:30px 40px 6px;font-size:14.5px;line-height:1.62;color:#c3cbe4">${o.bodyHtml || ''}${cta}</td></tr>
<tr><td style="padding:22px 40px 30px;background:rgba(0,0,0,.22);border-top:1px solid rgba(255,255,255,.06)">
<div style="margin-bottom:12px">${ELOGO('#8b93ad').replace('30px;height:30px','20px;height:20px')} <span style="font-family:Manrope,Arial,sans-serif;font-weight:700;font-size:13px;color:#c3cbe4;vertical-align:middle">HR PRO AI</span> <span style="font-size:12px;color:#6b7492">· ${L.tagline}</span></div>
<p style="font-size:11.5px;line-height:1.6;color:#6b7492;margin:0 0 10px;max-width:460px">${L.legal}</p>
<div style="font-size:11.5px"><a href="mailto:help@hr-pro.ai" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.help}</a><a href="${base}/privacy?lang=${o.lang || 'ru'}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.privacy}</a><a href="${base}/terms?lang=${o.lang || 'ru'}" style="color:#8b93ad;text-decoration:none;margin-right:16px">${L.terms}</a><a href="${o.unsubUrl || (base + '/unsubscribe')}" style="color:#8b93ad;text-decoration:none">${L.unsub}</a></div></td></tr>
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
