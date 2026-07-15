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
  ru: { eyebrow: 'Приглашение на оценку', tagline: 'Технология, которая чувствует людей', mission: 'Мы раскрываем личность, чтобы вы создавали сильные команды.', help: 'Помощь', privacy: 'Конфиденциальность', terms: 'Условия', unsub: 'Отписаться', cta: 'Начать оценку', rights: 'Все права защищены.',
    legal: 'Вы получили это письмо, потому что участвуете в подборе через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  pl: { eyebrow: 'Zaproszenie do oceny', tagline: 'Technologia, która czuje ludzi', mission: 'Odkrywamy osobowość, abyś budował silne zespoły.', help: 'Pomoc', privacy: 'Prywatność', terms: 'Regulamin', unsub: 'Wypisz się', cta: 'Rozpocznij ocenę', rights: 'Wszelkie prawa zastrzeżone.',
    legal: 'Otrzymujesz tę wiadomość, ponieważ bierzesz udział w rekrutacji przez platformę HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
  en: { eyebrow: 'Assessment invitation', tagline: 'Technology that reads people', mission: 'We reveal personality so you can build strong teams.', help: 'Help', privacy: 'Privacy', terms: 'Terms', unsub: 'Unsubscribe', cta: 'Start assessment', rights: 'All rights reserved.',
    legal: 'You received this email because you are part of a hiring process on the HR PRO AI platform. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warsaw, Poland.' },
  uk: { eyebrow: 'Запрошення на оцінювання', tagline: 'Технологія, що відчуває людей', mission: 'Ми розкриваємо особистість, щоб ви створювали сильні команди.', help: 'Допомога', privacy: 'Конфіденційність', terms: 'Умови', unsub: 'Відписатися', cta: 'Почати оцінювання', rights: 'Усі права захищені.',
    legal: 'Ви отримали цей лист, тому що берете участь у доборі через платформу HR PRO AI. HR PRO AI sp. z o.o., ul. Prosta 51, 00-838 Warszawa.' },
};
// Лого для писем — белый PNG (email-клиенты вырезают inline-SVG; белый гексагон виден на тёмной шапке).
const ELOGO_IMG = (base, size) => `<img src="${base}/email/logo-white.png" width="${size}" height="${size}" alt="HR PRO AI" style="display:inline-block;vertical-align:middle;border:0">`;
// Лого шапки — гексагон с нейро-узлами (по макету); футер использует простой ELOGO_IMG.
const ELOGO_MARK = (base, size) => `<img src="${base}/email/logo-mark-white.png" width="${size}" height="${size}" alt="HR PRO AI" style="display:inline-block;vertical-align:middle;border:0">`;
export async function unsubToken(secret, email) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'hraipro-dev-secret-change-me'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('unsub:' + String(email || '').toLowerCase()));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 24);
}
// Универсальный email-шаблон HR PRO AI (по макету дизайнера): table-верстка, VML-кнопка (Outlook),
// PNG-лого/сеть-графика (Gmail режет SVG), подвал и chrome — по языку получателя (o.lang).
export function wrapEmailEdge(o) {
  const L = EMAIL_I18N[o.lang] || EMAIL_I18N.ru; const base = (o.baseUrl || '').replace(/\/+$/, ''); const lang = o.lang || 'ru';
  const year = new Date().getFullYear();
  const subject = o.subject || o.headline || 'HR PRO AI';
  const preheader = o.preheader || o.headline || subject;
  const unsubUrl = o.unsubUrl || (base + '/unsubscribe');
  const greeting = o.greeting ? `<p style="margin:0 0 14px;font-family:'Inter',Arial,sans-serif;font-size:15px;line-height:1.5;color:#c3cbe4;">${o.greeting}</p>` : '';
  const bodyPara = o.bodyHtml ? `<p style="margin:0 0 18px;font-family:'Inter',Arial,sans-serif;font-size:14.5px;line-height:1.62;color:#9aa3bf;">${o.bodyHtml}</p>` : '';
  // шаги (welcome-письмо) — карточки между текстом и кнопкой
  const steps = Array.isArray(o.steps) && o.steps.length ? o.steps.map((s, i) => `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;"><tr>
                <td style="background:#14162e;border:1px solid #23264a;border-radius:14px;padding:14px 18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td valign="top" style="width:30px;"><div style="width:26px;height:26px;border-radius:8px;background:#7b6bff;background-image:linear-gradient(135deg,#8b6cff,#6f97ff);color:#ffffff;font-family:'Manrope',Arial,sans-serif;font-weight:800;font-size:13px;text-align:center;line-height:26px;">${s.n || (i + 1)}</div></td>
                    <td style="padding-left:12px;"><div style="font-family:'Manrope',Arial,sans-serif;font-weight:700;font-size:15px;color:#eef1fb;margin:0 0 3px;">${s.title || ''}</div>
                      <div style="font-family:'Inter',Arial,sans-serif;font-size:13px;line-height:1.5;color:#9aa3bf;">${s.sub || ''}</div></td>
                  </tr></table></td></tr></table>`).join('') : '';
  const ctaLabel = o.ctaLabel || L.cta;
  const ctaBlock = o.ctaUrl ? `
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="btn" style="margin:8px 0 20px;">
                <tr><td align="center">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${o.ctaUrl}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="26%" fillcolor="#7b6bff" strokecolor="#7b6bff"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${ctaLabel}</center></v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-- -->
                  <a href="${o.ctaUrl}" style="display:inline-block;font-family:'Manrope',Arial,sans-serif;font-weight:700;font-size:15px;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:13px;background:#7b6bff;background-image:linear-gradient(135deg,#8b6cff,#6f97ff);">${ctaLabel}</a>
                  <!--<![endif]-->
                </td></tr>
              </table>
              ${o.ctaNote ? `<p style="margin:0 0 24px;text-align:center;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#6b7492;">${o.ctaNote}</p>` : ''}` : '';
  const reassure = o.reassure ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #23264a;font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>
              <p style="margin:20px 0 8px;font-family:'Inter',Arial,sans-serif;font-size:13px;line-height:1.6;color:#8b93ad;">${o.reassure}</p>` : '';
  return `<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    table{border-collapse:collapse!important}
    body{margin:0!important;padding:0!important;width:100%!important;background:#05060d}
    a{color:#8b6cff;text-decoration:none}
    @media only screen and (max-width:620px){.container{width:100%!important}.px{padding-left:24px!important;padding-right:24px!important}.h1{font-size:24px!important;line-height:1.22!important}.btn a{display:block!important}}
    @media (prefers-color-scheme:dark){body,.bg{background:#05060d!important}}
  </style>
</head>
<body style="margin:0;padding:0;background:#05060d;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#05060d;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#05060d;background-image:radial-gradient(ellipse 90% 55% at 50% 0%,#12132b,#05060d 62%);">
    <tr><td align="center" bgcolor="#05060d" style="padding:32px 16px 56px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="container" bgcolor="#0d1024" style="width:600px;max-width:600px;background-color:#0d1024;border:1px solid #23264a;border-radius:18px;overflow:hidden;">
        <tr>
          <td class="px" bgcolor="#141634" style="padding:0;background-color:#141634;background-image:linear-gradient(160deg,#181a3d,#0c0d22);border-bottom:1px solid #23264a;">
            <div style="padding:26px 40px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
                <td valign="middle">
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="width:38px;vertical-align:middle;">${ELOGO_MARK(base, 34)}</td>
                    <td style="padding-left:11px;vertical-align:middle;">
                      <div style="font-family:'Manrope',Arial,sans-serif;font-weight:800;font-size:16px;letter-spacing:.5px;color:#ffffff;line-height:1.1;">HR&nbsp;PRO&nbsp;AI</div>
                      <div style="font-family:'Inter',Arial,sans-serif;font-size:11px;color:#8b93ad;margin-top:3px;">${L.tagline}</div>
                    </td>
                  </tr></table>
                </td>
                <td valign="middle" align="right"><img src="${base}/email/header-graph.png" width="232" height="109" alt="" style="display:block;border:0;opacity:.9;"></td>
              </tr></table>
              <p style="margin:22px 0 10px;font-family:'Inter',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#b7a8ff;">${o.eyebrow || L.eyebrow}</p>
              <h1 class="h1" style="margin:0;font-family:'Manrope',Arial,sans-serif;font-weight:800;font-size:26px;line-height:1.2;letter-spacing:-.5px;color:#ffffff;">${o.headline || subject}</h1>
            </div>
          </td>
        </tr>
        <tr>
          <td class="px" bgcolor="#0d1024" style="padding:32px 40px 8px;background-color:#0d1024;font-family:'Inter',Arial,sans-serif;">
              ${greeting}${bodyPara}${steps}${ctaBlock}${reassure}
          </td>
        </tr>
        <tr>
          <td class="px" bgcolor="#0a0b1c" style="padding:24px 40px 28px;background-color:#0a0b1c;border-top:1px solid #23264a;font-family:'Inter',Arial,sans-serif;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 10px;"><tr>
              <td style="vertical-align:middle;">${ELOGO_IMG(base, 22)}</td>
              <td style="padding-left:8px;vertical-align:middle;font-family:'Manrope',Arial,sans-serif;font-size:13px;font-weight:700;color:#c3cbe4;">HR PRO AI</td>
            </tr></table>
            <p style="margin:0 0 12px;font-family:'Inter',Arial,sans-serif;font-size:12.5px;line-height:1.5;color:#8b93ad;">${L.mission}</p>
            <p style="margin:0 0 12px;font-size:11.5px;line-height:1.6;color:#6b7492;">${L.legal}</p>
            <p style="margin:0;font-size:11.5px;color:#8b93ad;">
              <a href="${o.helpUrl || 'mailto:help@hr-pro.ai'}" style="color:#8b93ad;text-decoration:underline;">${L.help}</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="${base}/privacy?lang=${lang}" style="color:#8b93ad;text-decoration:underline;">${L.privacy}</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="${unsubUrl}" style="color:#8b93ad;text-decoration:underline;">${L.unsub}</a>
            </p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="container" style="width:600px;max-width:600px;">
        <tr><td style="padding:18px 40px 0;text-align:center;font-family:'Inter',Arial,sans-serif;font-size:11px;color:#4b5170;">© ${year} HR PRO AI. ${L.rights}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
