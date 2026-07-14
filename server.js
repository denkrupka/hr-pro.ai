'use strict';
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const { db, save, uid, shortCode, nowISO } = require('./src/db');
const { hashPassword, verifyPassword } = require('./src/auth');
const oca = require('./src/scoring/oca');
const sales = require('./src/scoring/sales');
const ai = require('./src/ai');
const recruit = require('./src/recruitment');
const air = require('./src/ai-recruit');
const integ = require('./src/integrations');
const { localizeResult } = require('./src/i18n-content');
const RES_LANGS = ['ru', 'pl', 'en'];
const pickLang = req => { const l = (req.query && req.query.lang) || ''; return RES_LANGS.includes(l) ? l : 'ru'; };

const RESULT_TEST = require('./data/result-test.json');
const LOGIC_TEST = require('./data/logic-test.json');
const SALES_TEST = require('./data/sales-test.json');
let OCA_QUESTIONS = [];
try { OCA_QUESTIONS = require('./data/oca-questions.json'); } catch (_) { OCA_QUESTIONS = []; }

const crypto = require('crypto');
const SECRET = process.env.SECRET || 'hraipro-dev-secret-change-me';
const PORT = process.env.PORT || 3000;
const ENV_BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
let BASE_URL = ENV_BASE_URL; // может быть переопределён глобальной настройкой baseUrl (админка)

// ---------- Отписка от писем (unsubscribe) ----------
function unsubToken(email) { return crypto.createHmac('sha256', SECRET).update('unsub:' + String(email || '').toLowerCase()).digest('hex').slice(0, 24); }
function unsubUrlFor(email, lang) {
  const e = Buffer.from(String(email || '').toLowerCase()).toString('base64url');
  return `${BASE_URL}/unsubscribe?e=${e}&t=${unsubToken(email)}&lang=${lang || 'ru'}`;
}
function isUnsubscribed(email) { const s = db().unsubscribes || []; return s.includes(String(email || '').toLowerCase()); }
function addUnsubscribe(email) { const d = db(); if (!Array.isArray(d.unsubscribes)) d.unsubscribes = []; const e = String(email || '').toLowerCase(); if (e && !d.unsubscribes.includes(e)) { d.unsubscribes.push(e); save(); } }

// ---------- ГЛОБАЛЬНЫЕ настройки портала (db.settings; управляются из админки) ----------
const SETTINGS_DEFAULT = {
  portalName: 'HR AI Pro', baseUrl: '', supportEmail: '',
  // Бесплатно при регистрации — по одному тесту каждого вида (Резалт, Тулс, Логис, Сэйлс, Знания)
  registrationOpen: true, signupBonus: 5,
  defaultLinkDays: 3, defaultUiLang: 'ru', defaultTimezone: 'GMT+3 Europe/Moscow',
  passwordMinLength: 6, maintenanceMode: false, maintenanceMessage: '',
  currency: 'eur',
  plans: null,          // мигрируются из PLANS при первом старте
  stripe: { secretKey: '', webhookSecret: '' },
  integrations: {},
  defaultEmailTemplates: null, defaultSmsTemplates: null, defaultMailTemplates: null,
};
function portalSettings() {
  const data = db();
  if (!data.settings || Array.isArray(data.settings)) data.settings = {};
  const s = data.settings;
  for (const k of Object.keys(SETTINGS_DEFAULT)) {
    if (s[k] === undefined) s[k] = JSON.parse(JSON.stringify(SETTINGS_DEFAULT[k]));
  }
  if (!s.stripe || typeof s.stripe !== 'object') s.stripe = { secretKey: '', webhookSecret: '' };
  if (!s.integrations || typeof s.integrations !== 'object') s.integrations = {};
  return s;
}
// Применить настройки, влияющие на окружение (после старта и после сохранения из админки)
function applyPortalEnv() {
  const s = portalSettings();
  BASE_URL = String(s.baseUrl || '').trim() || ENV_BASE_URL;
  initStripe();
}

const app = express();
// Stripe-webhook требует сырое тело для проверки подписи — json-парсер его пропускает
const jsonParser = express.json({ limit: '55mb' });
app.use((req, res, next) => (req.path === '/api/stripe/webhook' ? next() : jsonParser(req, res, next)));
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads', 'cv');
try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (_) {}
// сохранить CV из dataURL, вернуть публичный url
function saveCv(dataUrl, name) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 12 * 1024 * 1024) return null;
  const extMap = { 'application/pdf': 'pdf', 'application/msword': 'doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx', 'image/png': 'png', 'image/jpeg': 'jpg' };
  let ext = extMap[m[1]] || (String(name || '').split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const file = uid(16) + '.' + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
  return '/uploads/cv/' + file;
}
// Общая загрузка медиа (картинки/видео для вопросов проверки знаний)
const MEDIA_DIR = path.join(__dirname, 'public', 'uploads', 'media');
try { fs.mkdirSync(MEDIA_DIR, { recursive: true }); } catch (_) {}
function saveMedia(dataUrl, name) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 40 * 1024 * 1024) return null;
  const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/ogg': 'ogv' };
  const ext = extMap[m[1]] || (String(name || '').split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const file = uid(16) + '.' + ext;
  fs.writeFileSync(path.join(MEDIA_DIR, file), buf);
  return '/uploads/media/' + file;
}
app.use(cookieParser(SECRET));

// ---------- Режим обслуживания (глобальная настройка; админы работают как обычно) ----------
app.use((req, res, next) => {
  const gs = portalSettings();
  if (!gs.maintenanceMode) return next();
  const p = req.path;
  if (p === '/login' || p === '/api/login' || p === '/api/logout' || p === '/api/meta' || p === '/api/stripe/webhook'
    || p.startsWith('/css/') || p.startsWith('/js/') || p.startsWith('/img/') || p.startsWith('/uploads/') || p === '/favicon.ico'
    || p === '/admin' || p.startsWith('/api/admin/')) return next();
  const u = currentUser(req);
  if (u && u.role === 'admin') return next();
  const msg = gs.maintenanceMessage || 'Мы скоро вернёмся.';
  if (p.startsWith('/api/')) return res.status(503).json({ error: 'Портал на обслуживании: ' + msg, maintenance: true });
  return res.status(503).send(`<!doctype html><html lang="ru"><meta charset="utf-8"><title>${gs.portalName || 'HR AI Pro'}</title>
    <body style="font-family:Manrope,system-ui,sans-serif;background:#f4f7fc;display:grid;place-items:center;height:100vh;margin:0">
    <div style="text-align:center;max-width:460px;padding:20px"><h1 style="color:#16203a">Портал на обслуживании</h1>
    <p style="color:#6b768e;line-height:1.6">${String(msg).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</p></div></body></html>`);
});

// ---------- helpers ----------
const TEST_TYPES = {
  tools: { key: 'tools', title: 'Тулс' },
  result: { key: 'result', title: 'Резалт' },
  logic: { key: 'logic', title: 'Логис' },
  sales: { key: 'sales', title: 'Сэйлс' },
};

// Языки отправляемых кандидату писем/ссылок
const LANGS = [
  { code: 'ru', name: 'Русский' },
  { code: 'uk', name: 'Украи́нский' },
  { code: 'pl', name: 'Польский' },
  { code: 'en', name: 'Английский' },
];
// Шаблоны писем кандидату по языкам. Плейсхолдеры: {candidate} {company} {vacancy} {test} {link}
const DEFAULT_TEMPLATES = {
  ru: { subject: 'Приглашение на тестирование — {company}', body: 'Здравствуйте!\n\nКомпания «{company}» приглашает вас пройти онлайн-тест «{test}» по вакансии «{vacancy}».\nПройдите тест по ссылке: {link}\n\nЭто займёт немного времени. Заранее спасибо!' },
  uk: { subject: 'Запрошення на тестування — {company}', body: 'Вітаємо!\n\nКомпанія «{company}» запрошує вас пройти онлайн-тест «{test}» за вакансією «{vacancy}».\nПройдіть тест за посиланням: {link}\n\nЦе займе небагато часу. Заздалегідь дякуємо!' },
  pl: { subject: 'Zaproszenie na test — {company}', body: 'Dzień dobry!\n\nFirma „{company}” zaprasza do wykonania testu online „{test}” na stanowisko „{vacancy}”.\nWypełnij test pod linkiem: {link}\n\nZajmie to tylko chwilę. Z góry dziękujemy!' },
  en: { subject: 'Assessment invitation — {company}', body: 'Hello!\n\n{company} invites you to take the online test "{test}" for the "{vacancy}" position.\nComplete the test at: {link}\n\nIt won\'t take long. Thank you!' },
};
const DEFAULT_SMS = {
  ru: '{company}: пройдите онлайн-тест «{test}» по вакансии «{vacancy}» — {link}',
  uk: '{company}: пройдіть онлайн-тест «{test}» за вакансією «{vacancy}» — {link}',
  pl: '{company}: wykonaj test online „{test}” na stanowisko „{vacancy}” — {link}',
  en: '{company}: take the "{test}" online test for "{vacancy}" — {link}',
};
// ===== Шаблоны писем под каждое событие (тест / статус) × язык (как в HR-сканере) =====
const MAIL_SEND_ITEMS = ['result', 'result_emp', 'tools', 'logic', 'sales', 'video', 'regard'];
const MAIL_STATUS_ITEMS = ['rejected', 'interview', 'reserve', 'accepted'];
const MAIL_LANGS = ['ru', 'uk', 'pl', 'en'];
const TEST_NAMES = {
  ru: { result: 'Резалт', result_emp: 'Резалт (Сотрудники)', tools: 'Тулс', logic: 'Логис', sales: 'Сэйлс', video: 'Видеоинтервью', regard: 'Регард' },
  uk: { result: 'Резалт', result_emp: 'Резалт (Співробітники)', tools: 'Тулс', logic: 'Логіс', sales: 'Сейлс', video: 'Відеоінтерв’ю', regard: 'Регард' },
  pl: { result: 'Result', result_emp: 'Result (Pracownicy)', tools: 'Tools', logic: 'Logic', sales: 'Sales', video: 'Wideorozmowa', regard: 'Regard' },
  en: { result: 'Result', result_emp: 'Result (Employees)', tools: 'Tools', logic: 'Logic', sales: 'Sales', video: 'Video interview', regard: 'Regard' },
};
// Тема письма-приглашения (одна на все тесты, как в HR-сканере)
const MAIL_SEND_SUBJECT = {
  ru: 'Тест для кандидата на вакансию $vac$ от компании «$company$».',
  uk: 'Тест для кандидата на вакансію $vac$ від компанії «$company$».',
  pl: 'Test dla kandydata na stanowisko $vac$ od firmy „$company$”.',
  en: 'Assessment for a candidate: “$vac$” — $company$.',
};
// Каркас письма (в {DESC} подставляется описание конкретного теста)
const MAIL_SEND_SKELETON = {
  ru: 'Добрый день!\n\nМы получили и уже передали руководителю вашу анкету на вакансию «$vac$». Хотим выразить уважение к достигнутым вами результатам на предыдущем месте работы.\n\nЧтобы познакомиться с вами поближе и понять, за счёт каких личных качеств вы добились таких хороших результатов, приглашаем вас пройти заключительный этап перед собеседованием. Пройти тест можно как с компьютера, так и с мобильного устройства. В вашем распоряжении 24 часа с момента получения данного письма.\n\n{DESC}\n\nДля перехода к тесту, откройте эту ссылку на компьютере или мобильном:\n\n$button_link$',
  uk: 'Доброго дня!\n\nМи отримали та вже передали керівнику вашу анкету на вакансію «$vac$». Хочемо висловити повагу до досягнутих вами результатів на попередньому місці роботи.\n\nЩоб краще познайомитися з вами та зрозуміти, за рахунок яких особистих якостей ви досягли таких хороших результатів, запрошуємо вас пройти завершальний етап перед співбесідою. Пройти тест можна як з комп’ютера, так і з мобільного пристрою. У вашому розпорядженні 24 години з моменту отримання цього листа.\n\n{DESC}\n\nДля переходу до тесту, відкрийте це посилання на комп’ютері або мобільному:\n\n$button_link$',
  pl: 'Dzień dobry!\n\nOtrzymaliśmy i przekazaliśmy już przełożonemu Twoją aplikację na stanowisko „$vac$”. Chcemy wyrazić uznanie dla wyników, które osiągnąłeś(-aś) w poprzednim miejscu pracy.\n\nAby lepiej Cię poznać i zrozumieć, dzięki jakim cechom osiągnąłeś(-aś) tak dobre wyniki, zapraszamy do ostatniego etapu przed rozmową. Test możesz wykonać zarówno na komputerze, jak i na urządzeniu mobilnym. Masz na to 24 godziny od otrzymania tej wiadomości.\n\n{DESC}\n\nAby przejść do testu, otwórz ten link na komputerze lub telefonie:\n\n$button_link$',
  en: 'Hello!\n\nWe have received your application for the “$vac$” position and already forwarded it to the manager. We would like to acknowledge the results you achieved at your previous job.\n\nTo get to know you better and understand which personal qualities helped you achieve such results, we invite you to the final step before the interview. You can take the test on a computer or a mobile device. You have 24 hours from the moment you receive this email.\n\n{DESC}\n\nTo start the test, open this link on your computer or phone:\n\n$button_link$',
};
// Описание под конкретный тест (по языкам)
const MAIL_SEND_DESC = {
  ru: {
    result: 'Тест «Резалт» займёт от 20 до 40 минут. Он содержит простые жизненные ситуации и ваше отношение к ним — по каждому вопросу вы выберете один из трёх вариантов ответа. Правильных или неправильных ответов нет, поэтому отвечайте максимально честно и откровенно.',
    tools: 'Тест «Тулс» займёт около 30–40 минут и состоит из 200 вопросов о ваших привычках, взглядах и реакциях. По каждому вопросу выберите «да», «может быть» или «нет». Правильных или неправильных ответов нет — отвечайте честно, тогда результат точнее опишет ваши сильные стороны.',
    logic: 'Тест «Логис» займёт около 15–20 минут и проверяет скорость мышления и умение решать задачи. Он состоит из логических вопросов, часть из которых сложнее других. Отвечайте спокойно и сосредоточенно.',
    sales: 'Тест «Сэйлс» займёт около 20–30 минут и оценивает ваш подход к продажам и работе с клиентами. По каждому утверждению выберите «да», «иногда» или «нет». Правильных или неправильных ответов нет — отвечайте так, как поступаете обычно.',
  },
  uk: {
    result: 'Тест «Резалт» триватиме від 20 до 40 хвилин. Він містить прості життєві ситуації та ваше ставлення до них — на кожне запитання ви оберете один із трьох варіантів відповіді. Правильних чи неправильних відповідей немає, тож відповідайте максимально чесно та відверто.',
    tools: 'Тест «Тулс» триватиме близько 30–40 хвилин і складається з 200 запитань про ваші звички, погляди та реакції. На кожне запитання оберіть «так», «можливо» або «ні». Правильних чи неправильних відповідей немає — відповідайте чесно, тоді результат точніше опише ваші сильні сторони.',
    logic: 'Тест «Логіс» триватиме близько 15–20 хвилин і перевіряє швидкість мислення та вміння розв’язувати задачі. Він складається з логічних запитань, частина з яких складніша за інші. Відповідайте спокійно та зосереджено.',
    sales: 'Тест «Сейлс» триватиме близько 20–30 хвилин і оцінює ваш підхід до продажів і роботи з клієнтами. На кожне твердження оберіть «так», «іноді» або «ні». Правильних чи неправильних відповідей немає — відповідайте так, як робите зазвичай.',
  },
  pl: {
    result: 'Test „Result” zajmie od 20 do 40 minut. Zawiera proste sytuacje z życia i Twój stosunek do nich — przy każdym pytaniu wybierzesz jedną z trzech odpowiedzi. Nie ma odpowiedzi dobrych ani złych, dlatego odpowiadaj jak najbardziej szczerze.',
    tools: 'Test „Tools” zajmie około 30–40 minut i składa się z 200 pytań o Twoje nawyki, poglądy i reakcje. Przy każdym pytaniu wybierz „tak”, „może” lub „nie”. Nie ma odpowiedzi dobrych ani złych — odpowiadaj szczerze, a wynik dokładniej opisze Twoje mocne strony.',
    logic: 'Test „Logic” zajmie około 15–20 minut i sprawdza szybkość myślenia oraz umiejętność rozwiązywania zadań. Składa się z pytań logicznych, z których część jest trudniejsza. Odpowiadaj spokojnie i w skupieniu.',
    sales: 'Test „Sales” zajmie około 20–30 minut i ocenia Twoje podejście do sprzedaży i pracy z klientem. Przy każdym stwierdzeniu wybierz „tak”, „czasami” lub „nie”. Nie ma odpowiedzi dobrych ani złych — odpowiadaj tak, jak zwykle postępujesz.',
  },
  en: {
    result: 'The “Result” test takes 20 to 40 minutes. It presents simple everyday situations and your attitude to them — for each question you choose one of three answers. There are no right or wrong answers, so please answer as honestly and openly as possible.',
    tools: 'The “Tools” test takes about 30–40 minutes and consists of 200 questions about your habits, views and reactions. For each question choose “yes”, “maybe” or “no”. There are no right or wrong answers — answer honestly and the result will describe your strengths more accurately.',
    logic: 'The “Logic” test takes about 15–20 minutes and measures your thinking speed and problem-solving. It consists of logic questions, some harder than others. Stay calm and focused as you answer.',
    sales: 'The “Sales” test takes about 20–30 minutes and assesses your approach to sales and working with clients. For each statement choose “yes”, “sometimes” or “no”. There are no right or wrong answers — answer the way you usually act.',
  },
};
const MAIL_STATUS_BASE = {
  rejected: {
    ru: { subject: 'Результат рассмотрения — $company$', body: 'Здравствуйте, $name$!\n\nБлагодарим за интерес к вакансии «$vac$» в компании «$company$». К сожалению, в этот раз мы приняли решение не продолжать процесс отбора. Желаем вам успехов в поиске!' },
    uk: { subject: 'Результат розгляду — $company$', body: 'Вітаємо, $name$!\n\nДякуємо за інтерес до вакансії «$vac$» у компанії «$company$». На жаль, цього разу ми вирішили не продовжувати відбір. Бажаємо вам успіхів!' },
    pl: { subject: 'Wynik rekrutacji — $company$', body: 'Dzień dobry, $name$!\n\nDziękujemy za zainteresowanie stanowiskiem „$vac$” w firmie „$company$”. Niestety tym razem zdecydowaliśmy nie kontynuować procesu rekrutacji. Życzymy powodzenia!' },
    en: { subject: 'Application update — $company$', body: 'Hello $name$!\n\nThank you for your interest in the “$vac$” position at $company$. Unfortunately, we have decided not to move forward this time. We wish you the best of luck!' },
  },
  interview: {
    ru: { subject: 'Приглашение на собеседование — $company$', body: 'Здравствуйте, $name$!\n\nМы рады пригласить вас на собеседование по вакансии «$vac$» в компании «$company$».\nДата: $date_interview$.\n\nЕсли у вас есть вопросы — просто ответьте на это письмо.' },
    uk: { subject: 'Запрошення на співбесіду — $company$', body: 'Вітаємо, $name$!\n\nРаді запросити вас на співбесіду за вакансією «$vac$» у компанії «$company$».\nДата: $date_interview$.\n\nЯкщо у вас є запитання — просто дайте відповідь на цей лист.' },
    pl: { subject: 'Zaproszenie na rozmowę — $company$', body: 'Dzień dobry, $name$!\n\nZ przyjemnością zapraszamy na rozmowę kwalifikacyjną na stanowisko „$vac$” w firmie „$company$”.\nData: $date_interview$.\n\nW razie pytań prosimy o odpowiedź na tę wiadomość.' },
    en: { subject: 'Interview invitation — $company$', body: 'Hello $name$!\n\nWe are glad to invite you to an interview for the “$vac$” position at $company$.\nDate: $date_interview$.\n\nIf you have any questions, just reply to this email.' },
  },
  reserve: {
    ru: { subject: 'Ваша кандидатура — $company$', body: 'Здравствуйте, $name$!\n\nСпасибо за участие в отборе на вакансию «$vac$». На данный момент мы включили вашу кандидатуру в кадровый резерв и обязательно вернёмся к вам при появлении подходящей позиции.' },
    uk: { subject: 'Ваша кандидатура — $company$', body: 'Вітаємо, $name$!\n\nДякуємо за участь у відборі на вакансію «$vac$». Наразі ми включили вашу кандидатуру до кадрового резерву і повернемося до вас за появи відповідної позиції.' },
    pl: { subject: 'Twoja kandydatura — $company$', body: 'Dzień dobry, $name$!\n\nDziękujemy za udział w rekrutacji na stanowisko „$vac$”. Obecnie umieściliśmy Twoją kandydaturę w rezerwie i wrócimy do Ciebie, gdy pojawi się odpowiednie stanowisko.' },
    en: { subject: 'Your application — $company$', body: 'Hello $name$!\n\nThank you for taking part in the selection for the “$vac$” position. For now we have added you to our talent pool and will get back to you when a suitable role opens up.' },
  },
  accepted: {
    ru: { subject: 'Поздравляем! — $company$', body: 'Здравствуйте, $name$!\n\nРады сообщить, что по итогам отбора на вакансию «$vac$» мы готовы сделать вам предложение. В ближайшее время с вами свяжется наш HR-менеджер компании «$company$».' },
    uk: { subject: 'Вітаємо! — $company$', body: 'Вітаємо, $name$!\n\nРаді повідомити, що за підсумками відбору на вакансію «$vac$» ми готові зробити вам пропозицію. Найближчим часом з вами зв’яжеться наш HR-менеджер компанії «$company$».' },
    pl: { subject: 'Gratulacje! — $company$', body: 'Dzień dobry, $name$!\n\nMiło nam poinformować, że po rekrutacji na stanowisko „$vac$” jesteśmy gotowi złożyć Ci ofertę. Wkrótce skontaktuje się z Tobą nasz menedżer HR firmy „$company$”.' },
    en: { subject: 'Congratulations! — $company$', body: 'Hello $name$!\n\nWe are happy to let you know that after the selection for the “$vac$” position we are ready to make you an offer. Our HR manager at $company$ will contact you shortly.' },
  },
};
function DEFAULT_MAIL() {
  const send = {};
  MAIL_SEND_ITEMS.forEach(item => {
    send[item] = {};
    MAIL_LANGS.forEach(l => {
      const desc = MAIL_SEND_DESC[l][item] || MAIL_SEND_DESC[l].result;
      send[item][l] = { subject: MAIL_SEND_SUBJECT[l], body: MAIL_SEND_SKELETON[l].replace('{DESC}', desc) };
    });
  });
  const status = {};
  MAIL_STATUS_ITEMS.forEach(item => {
    status[item] = {};
    MAIL_LANGS.forEach(l => { status[item][l] = { subject: MAIL_STATUS_BASE[item][l].subject, body: MAIL_STATUS_BASE[item][l].body }; });
  });
  return { send, status };
}
function cleanMailTemplates(input, base) {
  const out = base || DEFAULT_MAIL();
  if (!input || typeof input !== 'object') return out;
  ['send', 'status'].forEach(cat => {
    const items = cat === 'send' ? MAIL_SEND_ITEMS : MAIL_STATUS_ITEMS;
    if (!input[cat]) return;
    items.forEach(item => {
      if (!input[cat][item]) return;
      MAIL_LANGS.forEach(l => {
        const t = input[cat][item][l];
        if (t && typeof t === 'object') {
          if (!out[cat][item][l]) out[cat][item][l] = { subject: '', body: '' };
          if (t.subject != null) out[cat][item][l].subject = String(t.subject).slice(0, 4000);
          if (t.body != null) out[cat][item][l].body = String(t.body).slice(0, 20000);
        }
      });
    });
  });
  return out;
}
// Язык и часовой пояс новых клиентов определяются автоматически (браузер/локаль),
// overrides приходят из формы регистрации; фолбэк — ru / Warszawa
function defaultSettings(overrides) {
  const gs = portalSettings();
  const o = overrides || {};
  let timezone = 'GMT+1 Europe/Warsaw';
  if (o.timezone && /^[\w/+-]{3,60}$/.test(o.timezone)) {
    try {
      const off = new Intl.DateTimeFormat('en', { timeZone: o.timezone, timeZoneName: 'shortOffset' })
        .formatToParts(new Date()).find(p => p.type === 'timeZoneName');
      timezone = ((off && off.value) || 'GMT+1') + ' ' + o.timezone;
    } catch (_) {}
  }
  return {
    surname: '', employees: '', phone: '',
    timezone,
    linkDays: 3, // фактический срок жизни ссылки настраивается в процессе каждой вакансии
    uiLang: ['ru', 'pl', 'en'].includes(o.uiLang) ? o.uiLang : 'ru', logo: '', linkPrefix: '',
    notifySms: false, notifyComment: true, searchAllAccounts: true, askPersonalData: true,
    emailTemplates: JSON.parse(JSON.stringify(gs.defaultEmailTemplates || DEFAULT_TEMPLATES)),
    smsTemplates: JSON.parse(JSON.stringify(gs.defaultSmsTemplates || DEFAULT_SMS)),
    anketaFields: [], testOrder: ['result', 'tools', 'logic', 'sales'],
  };
}
const FIELD_TYPES = ['text', 'number', 'tel', 'date', 'select'];
function cleanAnketaFields(arr) {
  if (!Array.isArray(arr)) return null;
  return arr.slice(0, 30).map(f => {
    const type = FIELD_TYPES.includes(f && f.type) ? f.type : 'text';
    const o = { id: String((f && f.id) || uid(6)).slice(0, 24), label: String((f && f.label) || 'Поле').slice(0, 80),
      type, required: !!(f && f.required) };
    if (type === 'select') o.options = (Array.isArray(f.options) ? f.options : []).map(x => String(x).slice(0, 60)).filter(Boolean).slice(0, 20);
    return o;
  }).filter(f => f.label);
}
// Дефолтные письма по событиям: глобальные (админка) или заводские константы
function globalDefaultMail() {
  const gs = portalSettings();
  return gs.defaultMailTemplates && gs.defaultMailTemplates.send
    ? JSON.parse(JSON.stringify(gs.defaultMailTemplates)) : DEFAULT_MAIL();
}
function ensureSettings(u) {
  if (!u.settings) u.settings = defaultSettings();
  if (!u.settings.smsTemplates) u.settings.smsTemplates = JSON.parse(JSON.stringify(portalSettings().defaultSmsTemplates || DEFAULT_SMS));
  if (!Array.isArray(u.settings.anketaFields)) u.settings.anketaFields = [];
  if (!Array.isArray(u.settings.testOrder)) u.settings.testOrder = ['result', 'tools', 'logic', 'sales'];
  if (!u.settings.mailTemplates || !u.settings.mailTemplates.send) u.settings.mailTemplates = globalDefaultMail();
  if (!u.settings.reqShareCode) u.settings.reqShareCode = shortCode(10);
  return u.settings;
}
// упорядочить типы тестов: очерёдность процесса вакансии, иначе — настройка пользователя
function orderTypes(types, u, vac) {
  const ord = vac ? processOf(vac).order
    : ((u && u.settings && Array.isArray(u.settings.testOrder)) ? u.settings.testOrder : ['result', 'tools', 'logic', 'sales']);
  return types.slice().sort((a, b) => {
    const ia = ord.indexOf(a), ib = ord.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

function currentUser(req) {
  const id = req.signedCookies && req.signedCookies.uid;
  if (!id) return null;
  return db().users.find(u => u.id === id) || null;
}
// Журнал операций с балансом (виден в админке; клиенту — только его записи)
function logBalance(userId, delta, kind, extra) {
  const data = db();
  const u = data.users.find(x => x.id === userId);
  data.balanceLog.push(Object.assign({ id: uid(12), userId, delta, kind,
    comment: '', adminId: null, purchaseId: null, testId: null,
    balanceAfter: u ? u.balanceTotal : null, createdAt: nowISO() }, extra || {}));
}

// ---------- Срок действия тестов: ровно 1 год с момента пополнения ----------
// Каждое пополнение (бонус/покупка/начисление админом) создаёт «лот» с датой сгорания.
// Списание идёт FIFO — с самого старого действующего лота. Просроченные лоты сгорают.
const BALANCE_TTL_DAYS = 365;
function _ensureLots(u) {
  if (Array.isArray(u.balanceLots)) return; // уже отслеживается лотами
  u.balanceLots = [];
  // миграция старых аккаунтов (поля лотов ещё не было): весь текущий баланс — один лот со свежим годом
  if ((u.balanceTotal || 0) > 0) {
    u.balanceLots.push({ id: uid(10), qty: u.balanceTotal, remaining: u.balanceTotal, source: 'legacy',
      createdAt: u.createdAt || nowISO(), expiresAt: new Date(Date.now() + BALANCE_TTL_DAYS * 864e5).toISOString() });
  }
}
function addBalanceLot(u, qty, source) {
  if (!(qty > 0)) return;
  _ensureLots(u);
  u.balanceLots.push({ id: uid(10), qty, remaining: qty, source: source || 'credit',
    createdAt: nowISO(), expiresAt: new Date(Date.now() + BALANCE_TTL_DAYS * 864e5).toISOString() });
}
function spendLots(u, n) { // списываем n тестов с самых старых действующих лотов
  _ensureLots(u);
  let need = n; const now = Date.now();
  u.balanceLots.slice().sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
    .forEach(l => { if (need <= 0) return; if (new Date(l.expiresAt).getTime() < now) return;
      const take = Math.min(l.remaining || 0, need); l.remaining = (l.remaining || 0) - take; need -= take; });
}
function expireBalance(u) { // сжигаем просроченные лоты, синхронизируем balanceTotal
  _ensureLots(u);
  const now = Date.now(); let expired = 0;
  u.balanceLots.forEach(l => { if ((l.remaining || 0) > 0 && new Date(l.expiresAt).getTime() < now) { expired += l.remaining; l.remaining = 0; } });
  if (expired > 0) {
    u.balanceTotal = Math.max(0, (u.balanceTotal || 0) - expired);
    if ((u.balancePending || 0) > u.balanceTotal) u.balancePending = u.balanceTotal;
    logBalance(u.id, -expired, 'balance_expired', { comment: 'Истёк срок действия тестов (1 год с пополнения)' });
  }
  return expired;
}
function balanceExpiresAt(u) { // ближайшая дата сгорания действующих тестов — для кабинета
  if (!Array.isArray(u.balanceLots)) return null;
  const act = u.balanceLots.filter(l => (l.remaining || 0) > 0).map(l => l.expiresAt).filter(Boolean).sort();
  return act[0] || null;
}
function sweepExpiries() { const d = db(); let any = false; d.users.forEach(u => { if (expireBalance(u) > 0) any = true; }); if (any) save(); }
// Журнал действий администраторов — пишется при каждой мутации из админки
function logAdmin(req, action, targetType, targetId, details) {
  db().adminLog.push({ id: uid(12), adminId: (req.adminUser || req.user).id, action,
    targetType: targetType || null, targetId: targetId || null, details: details || {}, createdAt: nowISO() });
}
function requireAuth(req, res, next) {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ error: 'Не авторизован' });
  if (u.blocked === true) { res.clearCookie('uid'); res.clearCookie('impersonate_uid'); return res.status(401).json({ error: 'Аккаунт заблокирован. Свяжитесь с поддержкой.' }); }
  // Имперсонация: админ с cookie impersonate_uid видит кабинет клиента
  const impId = req.signedCookies && req.signedCookies.impersonate_uid;
  if (impId && u.role === 'admin') {
    const client = db().users.find(x => x.id === impId && x.role !== 'admin');
    if (client && client.blocked !== true) {
      req.adminUser = u; req.user = client;
      // каждая мутация в чужом кабинете фиксируется в журнале действий
      if (req.method !== 'GET' && !req.path.startsWith('/api/admin/'))
        db().adminLog.push({ id: uid(12), adminId: u.id, action: 'impersonated_change', targetType: 'user',
          targetId: client.id, details: { method: req.method, path: req.path }, createdAt: nowISO() });
      return next();
    }
  }
  req.user = u;
  next();
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    // в режиме имперсонации админ остаётся в req.adminUser — админка работает от его имени
    const admin = req.adminUser || req.user;
    if (admin.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
    req.user = admin; req.adminUser = admin;
    next();
  });
}
function publicUser(u) {
  ensureSettings(u);
  return { id: u.id, email: u.email, name: u.name, surname: u.settings.surname || '', company: u.company,
    role: u.role === 'admin' ? 'admin' : 'user',
    balanceTotal: u.balanceTotal, balancePending: u.balancePending,
    balanceAvailable: u.balanceTotal - u.balancePending, balanceExpiresAt: balanceExpiresAt(u), settings: u.settings };
}
function demoFor(p) {
  if (!p) return 'women';
  const age = parseInt(p.age, 10);
  const male = /^(м|m|муж|male)/i.test(String(p.sex || ''));
  const teen = age && age >= 14 && age <= 18;
  if (male) return teen ? 'boys' : 'men';
  return teen ? 'girls' : 'women';
}
const QBANK_RU = {
  result: RESULT_TEST, logic: LOGIC_TEST, sales: SALES_TEST,
  tools: { type: 'tools', title: 'Тулс', questions: OCA_QUESTIONS },
};
const QBANK_FILE = { result: 'result-test', logic: 'logic-test', sales: 'sales-test', tools: 'oca-questions' };
const TOOLS_TITLE = { ru: 'Тулс', pl: 'Tools', en: 'Tools' };
const _qbankCache = {};
// Банк вопросов в языке теста (файлы data/<base>.<lang>.json; фолбэк на русский).
function testQuestionsFor(type, lang) {
  if (!QBANK_RU[type]) type = 'tools';
  if (lang !== 'pl' && lang !== 'en') return QBANK_RU[type];
  const key = type + '_' + lang;
  if (_qbankCache[key] !== undefined) return _qbankCache[key];
  let bank;
  try {
    const raw = require('./data/' + QBANK_FILE[type] + '.' + lang + '.json');
    bank = type === 'tools' ? { type: 'tools', title: TOOLS_TITLE[lang], questions: raw } : raw;
  } catch (_) { bank = QBANK_RU[type]; }
  _qbankCache[key] = bank;
  return bank;
}

// ---------- AUTH ----------
app.post('/api/register', (req, res) => {
  const gs = portalSettings();
  if (gs.registrationOpen === false) return res.status(403).json({ error: 'Регистрация временно закрыта' });
  const { email, password, name, company } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Укажите email и пароль' });
  const minLen = gs.passwordMinLength || 6;
  if (String(password).length < minLen) return res.status(400).json({ error: `Пароль — минимум ${minLen} символов` });
  const data = db();
  if (data.users.find(u => u.email.toLowerCase() === String(email).toLowerCase()))
    return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
  const bonus = Math.max(0, parseInt(gs.signupBonus, 10) || 0);
  // язык и часовой пояс — автоматически из браузера клиента (Accept-Language как фолбэк)
  const accLang = String(req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  const auto = { uiLang: (req.body && req.body.uiLang) || (['ru', 'pl', 'en'].includes(accLang) ? accLang : ''),
    timezone: (req.body && req.body.timezone) || '' };
  const user = { id: uid(12), email, password: hashPassword(password), name: name || email.split('@')[0],
    company: company || '', balanceTotal: bonus, balancePending: 0, balanceLots: [], settings: defaultSettings(auto),
    role: 'user', blocked: false, adminNote: '', lastLoginAt: nowISO(), createdAt: nowISO() };
  data.users.push(user);
  if (bonus > 0) { logBalance(user.id, bonus, 'signup_bonus', { comment: 'Бонус при регистрации' }); addBalanceLot(user, bonus, 'signup_bonus'); }
  // стартовые вакансии
  ['HR', 'ДЕМО'].forEach((n, i) => {
    data.vacancies.push({ id: uid(10), userId: user.id, sectionId: null, name: n, lang: 'ru', order: i, createdAt: nowISO() });
  });
  save();
  res.cookie('uid', user.id, { signed: true, httpOnly: true, sameSite: 'lax', maxAge: 30 * 864e5 });
  res.json({ user: publicUser(user) });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db().users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !verifyPassword(password || '', user.password))
    return res.status(401).json({ error: 'Неверный email или пароль' });
  if (user.blocked === true) return res.status(403).json({ error: 'Аккаунт заблокирован. Свяжитесь с поддержкой.' + (portalSettings().supportEmail ? ' ' + portalSettings().supportEmail : '') });
  user.lastLoginAt = nowISO(); save();
  res.cookie('uid', user.id, { signed: true, httpOnly: true, sameSite: 'lax', maxAge: 30 * 864e5 });
  res.json({ user: publicUser(user) });
});

app.post('/api/logout', (req, res) => { res.clearCookie('uid'); res.clearCookie('impersonate_uid'); res.json({ ok: true }); });
app.get('/api/me', requireAuth, (req, res) => { if (expireBalance(req.user) > 0) save(); res.json({ user: publicUser(req.user),
  impersonatedBy: req.adminUser ? req.adminUser.email : undefined }); });

// справочники (языки + публичные флаги портала)
app.get('/api/meta', (req, res) => {
  const gs = portalSettings();
  res.json({ langs: LANGS, registrationOpen: gs.registrationOpen !== false, portalName: gs.portalName || 'HR AI Pro' });
});

// ---------- SECTIONS (уровень над вакансиями) ----------
app.get('/api/sections', requireAuth, (req, res) => {
  const list = db().sections.filter(s => s.userId === req.user.id).sort((a, b) => a.order - b.order);
  res.json({ sections: list });
});
app.post('/api/sections', requireAuth, (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Укажите название раздела' });
  const data = db();
  const order = data.sections.filter(s => s.userId === req.user.id).length;
  const s = { id: uid(10), userId: req.user.id, name, order, createdAt: nowISO() };
  data.sections.push(s); save();
  res.json({ section: s });
});
app.put('/api/sections/:id', requireAuth, (req, res) => {
  const s = db().sections.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!s) return res.status(404).json({ error: 'Не найдено' });
  if (req.body.name != null) s.name = req.body.name;
  if (req.body.order != null) s.order = req.body.order;
  save(); res.json({ section: s });
});
app.delete('/api/sections/:id', requireAuth, (req, res) => {
  const data = db();
  data.vacancies.forEach(v => { if (v.sectionId === req.params.id && v.userId === req.user.id) v.sectionId = null; });
  data.sections = data.sections.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  save(); res.json({ ok: true });
});

// ---------- VACANCIES ----------
app.get('/api/vacancies', requireAuth, (req, res) => {
  let list = db().vacancies.filter(v => v.userId === req.user.id);
  if (req.query.sectionId && req.query.sectionId !== 'all')
    list = list.filter(v => (v.sectionId || '') === req.query.sectionId);
  list = list.sort((a, b) => a.order - b.order);
  res.json({ vacancies: list });
});
app.post('/api/vacancies', requireAuth, (req, res) => {
  const { name, sectionId, lang } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Укажите название вакансии' });
  const data = db();
  const order = data.vacancies.filter(v => v.userId === req.user.id).length;
  const v = { id: uid(10), userId: req.user.id, sectionId: sectionId || null, name,
    lang: LANGS.some(l => l.code === lang) ? lang : 'ru', order, createdAt: nowISO() };
  data.vacancies.push(v); save();
  res.json({ vacancy: v });
});
app.put('/api/vacancies/:id', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  if (req.body.name != null) v.name = req.body.name;
  if (req.body.order != null) v.order = req.body.order;
  if (req.body.sectionId !== undefined) v.sectionId = req.body.sectionId || null;
  if (req.body.lang && LANGS.some(l => l.code === req.body.lang)) v.lang = req.body.lang;
  save(); res.json({ vacancy: v });
});
app.delete('/api/vacancies/:id', requireAuth, (req, res) => {
  const data = db();
  data.vacancies = data.vacancies.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  save(); res.json({ ok: true });
});

// ---------- PARTICIPANTS ----------
function participantView(p) {
  const data = db();
  const tests = data.tests.filter(t => t.participantId === p.id)
    .map(t => ({ id: t.id, type: t.type, title: testTitleOf(t.type), status: t.status,
      code: t.code, sentAt: t.sentAt, startedAt: t.startedAt, finishedAt: t.finishedAt,
      durationSec: t.durationSec, link: `${BASE_URL}/t/${t.code}`,
      rate: t.overallRate || null }));
  const vac = data.vacancies.find(v => v.id === p.vacancyId);
  return { ...p, vacancyName: vac ? vac.name : '', tests };
}
app.get('/api/participants', requireAuth, (req, res) => {
  let list = db().participants.filter(p => p.userId === req.user.id);
  if (req.query.vacancyId && req.query.vacancyId !== 'all')
    list = list.filter(p => p.vacancyId === req.query.vacancyId);
  list = list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ participants: list.map(participantView) });
});
app.get('/api/participants/:id', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  res.json({ participant: participantView(p) });
});
// Ручное создание кандидата (кнопка «Добавить кандидата»): пустая карточка,
// данные заполняет рекрутёр, дальше — полный цикл найма или отдельный тест
app.post('/api/participants', requireAuth, (req, res) => {
  const b = req.body || {};
  const data = db();
  const vac = b.vacancyId ? data.vacancies.find(v => v.id === b.vacancyId && v.userId === req.user.id) : null;
  const p = { id: uid(12), userId: req.user.id, vacancyId: vac ? vac.id : null,
    name: String(b.name || ''), surname: String(b.surname || ''), email: String(b.email || ''), sex: '', age: null,
    tel: String(b.tel || ''), city: String(b.city || ''), stage: 'Без этапа',
    comment: String(b.comment || ''), color: '#FFFFFF', starred: false, createdAt: nowISO() };
  data.participants.push(p);
  save(); res.json({ participant: participantView(p) });
});
app.put('/api/participants/:id', requireAuth, (req, res) => {
  const data = db();
  const p = data.participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  const hadContact = !!(p.email || p.tel);
  const hadTests = data.tests.some(t => t.participantId === p.id);
  ['name', 'surname', 'email', 'sex', 'age', 'tel', 'city', 'stage', 'comment', 'color', 'vacancyId', 'starred']
    .forEach(f => { if (req.body[f] !== undefined) p[f] = req.body[f]; });
  // кандидат добавлен вручную и получил контакт — автоворонка (если включена) запускает процесс
  try {
    const vac = data.vacancies.find(v => v.id === p.vacancyId && v.userId === req.user.id);
    if (vac && !hadTests && (p.email || p.tel)) {
      if (!hadContact && processOf(vac).auto) aiCallFor(req.user, p, vac, 'first');
      advanceFunnel(p);
    }
  } catch (e) { console.error('[funnel:save]', e.message); }
  save(); res.json({ participant: participantView(p) });
});
app.delete('/api/participants/:id', requireAuth, (req, res) => {
  const data = db();
  const owns = data.participants.some(x => x.id === req.params.id && x.userId === req.user.id);
  if (!owns) return res.status(404).json({ error: 'Не найдено' });
  // вернуть бронь баланса за непройденные тесты кандидата
  data.tests.filter(t => t.participantId === req.params.id && t.userId === req.user.id)
    .forEach(t => { if (t.status !== 'done' && t.balancePending !== true) req.user.balancePending = Math.max(0, req.user.balancePending - 1); });
  data.participants = data.participants.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  data.tests = data.tests.filter(t => t.participantId !== req.params.id);
  save(); res.json({ ok: true, balance: publicUser(req.user) });
});

// ---------- Реальная отправка приглашения кандидату (если настроены Resend/SMSAPI) ----------
// Портал работает и без интеграций: тогда ссылку копируют вручную, как раньше.
function notifyCandidate(user, p, test, vac, link) {
  try {
    const lang = (vac && vac.lang) || 'ru';
    const name = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email || p.tel || '';
    const title = (TEST_TYPES[test.type] && TEST_TYPES[test.type].title) || (test.type === 'knowledge' ? 'Проверка знаний' : test.type);
    const fill = s => String(s || '')
      .replace(/\{candidate\}/g, name).replace(/\{company\}/g, user.company || '')
      .replace(/\{vacancy\}/g, vac ? vac.name : '').replace(/\{test\}/g, title).replace(/\{link\}/g, link);
    // шаблоны клиента; если не заданы — глобальные дефолты портала, затем заводские
    const gs = portalSettings();
    const tpls = user.settings.emailTemplates || gs.defaultEmailTemplates || DEFAULT_TEMPLATES;
    const tpl = tpls[lang] || tpls.ru || {};
    if (p.email && integ.isConfigured(user.settings, 'resend') && !isUnsubscribed(p.email)) {
      const ctaLabel = { ru: 'Начать оценку', pl: 'Rozpocznij ocenę', en: 'Start assessment' }[lang] || 'Начать оценку';
      const eyebrow = { ru: 'Приглашение на оценку', pl: 'Zaproszenie do oceny', en: 'Assessment invitation' }[lang] || 'Приглашение на оценку';
      integ.sendEmail(user.settings, { to: p.email, subject: fill(tpl.subject) || 'Приглашение на тестирование',
        lang, baseUrl: BASE_URL, unsubUrl: unsubUrlFor(p.email, lang), eyebrow, ctaLabel, ctaUrl: link,
        bodyHtml: fill(tpl.body).replace(/\n/g, '<br>') })
        .catch(e => console.error('[resend]', e.message));
    }
    const smsTpls = user.settings.smsTemplates || gs.defaultSmsTemplates || DEFAULT_SMS;
    const smsTpl = smsTpls[lang] || smsTpls.ru || '';
    if (p.tel && integ.isConfigured(user.settings, 'smsapi'))
      integ.sendSms(user.settings, { to: p.tel, message: fill(smsTpl) || (title + ': ' + link) })
        .catch(e => console.error('[smsapi]', e.message));
  } catch (e) { console.error('[notifyCandidate]', e.message); }
}

// ---------- АВТОВОРОНКА (настраивается во вкладке «Процесс найма» вакансии) ----------
// Отправить тест кандидату без участия рекрутёра (бронирует баланс, шлёт письмо/SMS)
function autoSendTest(owner, p, vac, type, kt) {
  const data = db();
  if (owner.balanceTotal - owner.balancePending < 1) return null; // нет баланса — воронка ждёт
  const code = shortCode(10);
  const test = { id: uid(12), participantId: p.id, userId: owner.id, type, status: 'sent', code,
    lang: vac ? (vac.lang || 'ru') : 'ru', sentAt: nowISO(), startedAt: null, finishedAt: null,
    durationSec: null, answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
  if (type === 'knowledge' && kt) test.knowledge = { ktId: kt.id, name: kt.name, questions: kt.questions, passScore: kt.passScore };
  data.tests.push(test);
  owner.balancePending += 1;
  notifyCandidate(owner, p, test, vac, `${BASE_URL}/t/${code}`);
  return test;
}
// Звонок ИИ кандидату на настроенном шаге (Vapi; тихо пропускается без интеграции/телефона)
function aiCallFor(owner, p, vac, kind) {
  try {
    const proc = processOf(vac);
    if (!proc.aiCalls[kind] || !p.tel) return;
    const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || 'кандидат';
    const TASKS = {
      first: `Первый контакт с кандидатом по имени ${nm} на вакансию «${vac.name}». Поприветствуй, коротко расскажи о вакансии, уточни, интересна ли она, и предупреди, что придёт ссылка на первый тест.`,
      afterResult: `Кандидат ${nm} прошёл тест продуктивности по вакансии «${vac.name}». Поблагодари за прохождение, скажи, что отбор продолжается, и сообщи о следующем шаге.`,
      afterTools: `Кандидат ${nm} прошёл тест личности по вакансии «${vac.name}». Поблагодари и сообщи, что дальше будет разговор о мотивации и проверка знаний.`,
      motivation: `Оцени мотивацию кандидата ${nm} на вакансию «${vac.name}». Спроси: что для него важно при выборе новой работы; почему откликнулся; было ли в прошлом что-то, что он делал не только ради денег. Слушай, о чём говорит кандидат — о деле, продукте и клиентах или только о деньгах и выгоде — и зафиксируй вывод.`,
    };
    integ.startCall(owner.settings, { to: p.tel, task: TASKS[kind], language: (vac.lang || 'ru') })
      .then(r => { if (r && r.skipped) return; console.log('[vapi:auto]', kind, p.id); })
      .catch(e => console.error('[vapi:auto]', kind, e.message));
  } catch (e) { console.error('[vapi:auto]', e.message); }
}
// Продвинуть кандидата по автоворонке: отправить следующий тест процесса,
// если предыдущие тестовые шаги пройдены (ручные этапы автоотправку не блокируют)
function advanceFunnel(p) {
  const data = db();
  const owner = data.users.find(u => u.id === p.userId);
  const vac = data.vacancies.find(v => v.id === p.vacancyId && v.userId === p.userId);
  if (!owner || !vac) return;
  if (!p.email && !p.tel) return; // некому отправлять — воронка ждёт контакта
  const proc = processOf(vac);
  if (!proc.auto) return;
  const wf = p.workflow || {};
  // решение принято (ручное или авто-отказ по критичному критерию отбора) — воронка стоит
  if (buildWorkflow(p, 'ru').decision) return;
  const skipped = wf.skipped || {};
  const tests = data.tests.filter(t => t.participantId === p.id);
  // последовательность тестовых шагов процесса — в настроенной очерёдности вакансии
  const seq = [];
  (proc.order || ['result', 'tools', 'logic', 'sales', 'knowledge']).forEach(key => {
    if (key === 'result' || key === 'tools') { if (proc.stages[key] !== false) seq.push({ type: key }); }
    else if (key === 'logic' || key === 'sales') { if (proc.optional[key]) seq.push({ type: key, opt: true }); }
    else if (key === 'knowledge' && proc.stages.knowledge !== false)
      knowledgeTestsOf(vac).filter(k => k.questions.length).forEach(kt => seq.push({ type: 'knowledge', kt }));
  });
  for (const step of seq) {
    if (skipped[step.type] || (step.opt && skipped['opt:' + step.type])) continue;
    if (step.type === 'knowledge') {
      if (skipped.knowledge) continue;
      const t = tests.find(x => x.type === 'knowledge' && ((x.knowledge && x.knowledge.ktId) === step.kt.id || !x.knowledge));
      if (t) { if (t.status !== 'done') return; continue; }
      autoSendTest(owner, p, vac, 'knowledge', step.kt); return;
    }
    const pending = tests.some(t => t.type === step.type && t.status !== 'done');
    if (pending) return;                                        // ждём прохождения
    if (tests.some(t => t.type === step.type && t.status === 'done')) continue; // пройден — дальше
    autoSendTest(owner, p, vac, step.type); return;
  }
}

// ---------- SEND TEST ----------
app.post('/api/tests/send', requireAuth, (req, res) => {
  const { emails, vacancyId } = req.body || {};
  // язык теста: явный выбор рекрутёра приоритетнее языка вакансии из заявки
  const reqLang = ['ru', 'pl', 'en'].includes(req.body && req.body.lang) ? req.body.lang : null;
  // поддержка нескольких типов сразу (как в HR-сканере) + обратная совместимость с одиночным type
  let types = Array.isArray(req.body.types) ? req.body.types : (req.body.type ? [req.body.type] : []);
  types = types.filter(t => TEST_TYPES[t]);
  if (!types.length) return res.status(400).json({ error: 'Выберите хотя бы один тип теста' });
  const list = String(emails || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  if (!list.length) return res.status(400).json({ error: 'Укажите email или телефон кандидата' });
  const isPhone = s => !/@/.test(s) && /^[+]?[\d][\d\s()\-]{5,}$/.test(s);
  const data = db();
  const available = req.user.balanceTotal - req.user.balancePending;
  const needed = list.length * types.length;
  if (needed > available) return res.status(400).json({ error: `Недостаточно тестов на балансе (нужно ${needed}, доступно ${available})` });
  const vac = data.vacancies.find(v => v.id === vacancyId && v.userId === req.user.id);
  types = orderTypes(types, req.user, vac); // очерёдность — из процесса вакансии
  const created = [];
  const normMail = s => String(s || '').toLowerCase().trim();
  const normTel = s => String(s || '').replace(/\D/g, '');
  for (const rcpt of list) {
    const phone = isPhone(rcpt);
    // Кандидат ищется по email/телефону: быстрый тест не создаёт дублей, а попадает в карточку существующего
    let p = data.participants.find(x => x.userId === req.user.id && (phone
      ? (x.tel && normTel(x.tel) === normTel(rcpt))
      : (x.email && normMail(x.email) === normMail(rcpt))));
    if (!p) {
      p = { id: uid(12), userId: req.user.id, vacancyId: vac ? vac.id : (vacancyId || null),
        name: '', surname: '', email: phone ? '' : rcpt, sex: '', age: null, tel: phone ? rcpt : '', city: '', stage: 'Без этапа',
        comment: '', color: '#FFFFFF', starred: false, createdAt: nowISO() };
      data.participants.push(p);
    } else if (vac && !p.vacancyId) p.vacancyId = vac.id; // привязка к вакансии, если её ещё не было
    for (const type of types) {
      const code = shortCode(10);
      const test = { id: uid(12), participantId: p.id, userId: req.user.id, type, status: 'sent',
        code, lang: reqLang || (vac ? (vac.lang || 'ru') : 'ru'), sentAt: nowISO(), startedAt: null, finishedAt: null, durationSec: null,
        answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
      data.tests.push(test);
      req.user.balancePending += 1;
      created.push({ email: rcpt, channel: phone ? 'sms' : 'email', type, title: TEST_TYPES[type].title, testId: test.id, participantId: p.id, link: `${BASE_URL}/t/${code}` });
      notifyCandidate(req.user, p, test, vac, `${BASE_URL}/t/${code}`);
    }
  }
  save();
  res.json({ created, balance: publicUser(req.user) });
});

// Отправить ещё один тест существующему кандидату (HR-scanner: несколько тестов на кандидата)
app.post('/api/participants/:id/send-test', requireAuth, (req, res) => {
  const data = db();
  const p = data.participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Кандидат не найден' });
  const type = req.body && req.body.type;
  if (!type || !TEST_TYPES[type]) return res.status(400).json({ error: 'Неверный тип теста' });
  const available = req.user.balanceTotal - req.user.balancePending;
  if (available < 1) return res.status(400).json({ error: 'Недостаточно тестов на балансе' });
  const code = shortCode(10);
  const pvac = data.vacancies.find(v => v.id === p.vacancyId && v.userId === req.user.id);
  const test = { id: uid(12), participantId: p.id, userId: req.user.id, type, status: 'sent',
    code, lang: pvac ? (pvac.lang || 'ru') : 'ru', sentAt: nowISO(), startedAt: null, finishedAt: null, durationSec: null,
    answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
  data.tests.push(test);
  req.user.balancePending += 1;
  save();
  notifyCandidate(req.user, p, test, pvac, `${BASE_URL}/t/${code}`);
  res.json({ test: { id: test.id, type, title: TEST_TYPES[type].title, status: 'sent', code },
    link: `${BASE_URL}/t/${code}`, balance: publicUser(req.user) });
});

// Повторно отправить кандидату сообщение со ссылкой на тест (пока тест не начат)
app.post('/api/tests/:id/resend', requireAuth, (req, res) => {
  const test = db().tests.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!test) return res.status(404).json({ error: 'Не найдено' });
  if (test.startedAt || test.status === 'done') return res.status(400).json({ error: 'Тест уже начат — повторная отправка не нужна' });
  test.sentAt = nowISO();
  save();
  const rp = db().participants.find(x => x.id === test.participantId);
  const rvac = rp && db().vacancies.find(v => v.id === rp.vacancyId);
  if (rp) notifyCandidate(req.user, rp, test, rvac, `${BASE_URL}/t/${test.code}`);
  res.json({ ok: true, link: `${BASE_URL}/t/${test.code}` });
});

// Отменить/удалить отправленный тест (возврат брони баланса, если ещё не пройден)
app.delete('/api/tests/:id', requireAuth, (req, res) => {
  const data = db();
  const test = data.tests.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!test) return res.status(404).json({ error: 'Не найдено' });
  if (test.status !== 'done' && test.balancePending !== true)
    req.user.balancePending = Math.max(0, req.user.balancePending - 1); // освободить бронь
  data.tests = data.tests.filter(t => t.id !== test.id);
  save();
  res.json({ ok: true, balance: publicUser(req.user) });
});

// ---------- BALANCE ----------
app.get('/api/balance', requireAuth, (req, res) => { if (expireBalance(req.user) > 0) save(); res.json({ balance: publicUser(req.user), ttlDays: BALANCE_TTL_DAYS }); });
// POST /api/balance/add удалён: баланс начисляет только администратор (/api/admin/users/:id/balance)

// ---------- SETTINGS ----------
app.get('/api/settings', requireAuth, (req, res) => {
  if (!req.user.settings) req.user.settings = defaultSettings();
  res.json({ user: publicUser(req.user), langs: LANGS });
});
app.put('/api/settings', requireAuth, (req, res) => {
  const u = req.user; if (!u.settings) u.settings = defaultSettings();
  const b = req.body || {};
  if (b.name != null) u.name = String(b.name);
  if (b.company != null) u.company = String(b.company);
  const s = u.settings;
  ['surname', 'employees', 'phone', 'timezone', 'uiLang', 'logo'].forEach(f => { if (b[f] != null) s[f] = b[f]; });
  if (b.linkDays != null) s.linkDays = Math.max(1, parseInt(b.linkDays, 10) || 3);
  ['notifySms', 'notifyComment', 'searchAllAccounts', 'askPersonalData'].forEach(f => { if (b[f] != null) s[f] = !!b[f]; });
  if (Array.isArray(b.testOrder)) { const ord = b.testOrder.filter(t => TEST_TYPES[t]); ['result', 'tools', 'logic', 'sales'].forEach(t => { if (!ord.includes(t)) ord.push(t); }); s.testOrder = ord; }
  if (b.mailTemplates && typeof b.mailTemplates === 'object') { s.mailTemplates = cleanMailTemplates(b.mailTemplates, s.mailTemplates && s.mailTemplates.send ? s.mailTemplates : DEFAULT_MAIL()); }
  if (b.emailTemplates && typeof b.emailTemplates === 'object') {
    LANGS.forEach(l => { const t = b.emailTemplates[l.code]; if (t) { s.emailTemplates[l.code] = { subject: String(t.subject || ''), body: String(t.body || '') }; } });
  }
  if (b.smsTemplates && typeof b.smsTemplates === 'object') {
    if (!s.smsTemplates) s.smsTemplates = {};
    LANGS.forEach(l => { if (b.smsTemplates[l.code] != null) s.smsTemplates[l.code] = String(b.smsTemplates[l.code]); });
  }
  save();
  res.json({ user: publicUser(u) });
});
app.post('/api/settings/password', requireAuth, (req, res) => {
  const { current, next } = req.body || {};
  if (!verifyPassword(current || '', req.user.password)) return res.status(400).json({ error: 'Текущий пароль неверный' });
  const minLen = portalSettings().passwordMinLength || 6;
  if (!next || String(next).length < minLen) return res.status(400).json({ error: `Новый пароль — минимум ${minLen} символов` });
  req.user.password = hashPassword(next); save();
  res.json({ ok: true });
});

// ---------- VACANCY STATS ----------
app.get('/api/stats/vacancies', requireAuth, (req, res) => {
  const data = db();
  const vacs = data.vacancies.filter(v => v.userId === req.user.id);
  const parts = data.participants.filter(p => p.userId === req.user.id);
  const tests = data.tests.filter(t => t.userId === req.user.id);
  const row = (vId) => {
    const ps = parts.filter(p => (vId === null ? !p.vacancyId : p.vacancyId === vId));
    const pids = new Set(ps.map(p => p.id));
    const ts = tests.filter(t => pids.has(t.participantId));
    const byStage = {};
    ps.forEach(p => { const st = p.stage || 'Без этапа'; byStage[st] = (byStage[st] || 0) + 1; });
    return { candidates: ps.length, testsSent: ts.length, testsDone: ts.filter(t => t.status === 'done').length,
      testsPending: ts.filter(t => t.status !== 'done').length, byStage };
  };
  const rows = vacs.map(v => ({ id: v.id, name: v.name, lang: v.lang || 'ru', ...row(v.id) }));
  res.json({ vacancies: rows, noVacancy: row(null) });
});

// ---------- DASHBOARD (aggregated metrics) ----------
app.get('/api/dashboard', requireAuth, (req, res) => {
  if (expireBalance(req.user) > 0) save();
  const data = db();
  const parts = data.participants.filter(p => p.userId === req.user.id);
  const tests = data.tests.filter(t => t.userId === req.user.id);
  const vacs = data.vacancies.filter(v => v.userId === req.user.id);
  const anketas = data.anketas.filter(a => a.userId === req.user.id);
  const done = tests.filter(t => t.status === 'done');
  const byStage = {}; parts.forEach(p => { const s = p.stage || 'Без этапа'; byStage[s] = (byStage[s] || 0) + 1; });
  const byType = { tools: 0, result: 0, logic: 0, sales: 0 }; tests.forEach(t => { if (byType[t.type] != null) byType[t.type]++; });
  const doneByType = { tools: 0, result: 0, logic: 0, sales: 0 }; done.forEach(t => { if (doneByType[t.type] != null) doneByType[t.type]++; });
  // воронка найма
  const applied = parts.length;
  const tested = new Set(done.map(t => t.participantId)).size;
  const funnel = [
    { key: 'applied', label: 'Кандидаты', value: applied },
    { key: 'tested', label: 'Прошли тест', value: tested },
    { key: 'interview', label: 'Собеседование', value: byStage['Собеседование'] || 0 },
    { key: 'reserve', label: 'Резерв', value: byStage['Резерв'] || 0 },
    { key: 'hired', label: 'Приняты', value: byStage['Принят'] || 0 },
  ];
  // кандидаты за 14 дней
  const days = []; const now = new Date();
  for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); days.push({ date: d.toISOString().slice(0, 10), count: 0 }); }
  parts.forEach(p => { const k = (p.createdAt || '').slice(0, 10); const day = days.find(d => d.date === k); if (day) day.count++; });
  const vacCounts = vacs.map(v => ({ name: v.name, count: parts.filter(p => p.vacancyId === v.id).length })).sort((a, b) => b.count - a.count).slice(0, 5);
  const recent = parts.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 6).map(p => {
    const vac = vacs.find(v => v.id === p.vacancyId);
    return { id: p.id, name: ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email, email: p.email, stage: p.stage || 'Без этапа', createdAt: p.createdAt, vacancyName: vac ? vac.name : '' };
  });
  res.json({
    totals: { candidates: parts.length, testsSent: tests.length, testsDone: done.length, testsPending: tests.length - done.length,
      balance: req.user.balanceTotal - req.user.balancePending, vacancies: vacs.length, anketas: anketas.length,
      applications: parts.filter(p => p.anketaId).length,
      conversion: applied ? Math.round(100 * (byStage['Принят'] || 0) / applied) : 0 },
    byStage, byType, doneByType, funnel, days, vacCounts, recent,
  });
});

// ---------- ИНТЕГРАЦИИ (Resend / SMSAPI / Vapi / ElevenLabs / Zadarma) ----------
app.get('/api/integrations', requireAuth, (req, res) => {
  const s = req.user.settings; s.integrations = s.integrations || {};
  const out = {};
  Object.keys(integ.PROVIDERS).forEach(pKey => {
    const meta = integ.PROVIDERS[pKey]; const cfg = s.integrations[pKey] || {};
    out[pKey] = {
      title: meta.title, purpose: meta.purpose_ru, configured: integ.isConfigured(s, pKey),
      fields: meta.fields.map(f => ({ key: f.key, label: f.label, secret: !!f.secret, hint: f.hint,
        value: f.secret ? (cfg[f.key] ? '••••' + String(cfg[f.key]).slice(-4) : '') : (cfg[f.key] || '') })),
    };
  });
  res.json({ providers: out });
});
app.put('/api/integrations', requireAuth, (req, res) => {
  const { provider, values } = req.body || {};
  if (!integ.PROVIDERS[provider]) return res.status(400).json({ error: 'Неизвестный сервис' });
  const s = req.user.settings; s.integrations = s.integrations || {};
  const cfg = s.integrations[provider] = s.integrations[provider] || {};
  integ.PROVIDERS[provider].fields.forEach(f => {
    if (!values || values[f.key] == null) return;
    const v = String(values[f.key]).trim();
    if (v.startsWith('••••')) return; // маскированный секрет не менялся
    if (v === '') delete cfg[f.key]; else cfg[f.key] = v;
  });
  save();
  res.json({ ok: true, configured: integ.isConfigured(s, provider) });
});
// Проверка связки: письмо/SMS/звонок/список голосов/баланс номера
app.post('/api/integrations/test/:provider', requireAuth, async (req, res) => {
  const pKey = req.params.provider;
  const to = req.body && String(req.body.to || '').trim();
  try {
    let r;
    if (pKey === 'resend') r = await integ.sendEmail(req.user.settings, { to: to || req.user.email, subject: 'HR PRO AI — тест интеграции Resend', text: 'Интеграция Resend работает. Это тестовое письмо из портала.' });
    else if (pKey === 'smsapi') { if (!to) return res.status(400).json({ error: 'Укажите номер телефона для теста' }); r = await integ.sendSms(req.user.settings, { to, message: 'HR PRO AI: интеграция SMSAPI работает.' }); }
    else if (pKey === 'vapi') r = to ? await integ.startCall(req.user.settings, { to, task: 'Тестовый звонок портала HR PRO AI: поздоровайся, скажи, что интеграция ИИ-звонков работает, и попрощайся.' }) : await integ.vapiPing(req.user.settings);
    else if (pKey === 'elevenlabs') r = await integ.listVoices(req.user.settings);
    else if (pKey === 'zadarma') r = await integ.zadarmaBalance(req.user.settings);
    else return res.status(400).json({ error: 'Неизвестный сервис' });
    if (r && r.skipped) return res.status(400).json({ error: r.reason });
    res.json({ ok: true, result: r });
  } catch (e) { res.status(502).json({ error: String(e.message || e).slice(0, 400) }); }
});

// ---------- Джоб-порталы (каталог + подключение по логину/API/фиду) ----------
const jobPortals = require('./src/job-portals');
// Стабильный публичный токен фида вакансий компании
function feedToken(user) { if (!user.feedToken) { user.feedToken = shortCode(16).toLowerCase(); save(); } return user.feedToken; }
app.get('/api/job-portals', requireAuth, (req, res) => {
  const conns = jobPortals.connectionsOf(req.user.settings);
  const feedUrl = `${BASE_URL}/feed/${feedToken(req.user)}/jobs.xml`;
  res.json({ feedUrl, portals: jobPortals.PORTALS.map(p => {
    const c = conns[p.id] || {};
    return { ...p, connected: jobPortals.isConnected(req.user.settings, p.id),
      login: c.login || '', hasPassword: !!c.password,
      apiKey: c.apiKey ? '••••' + String(c.apiKey).slice(-4) : '',
      feedUrl: p.method === 'feed' ? feedUrl : '' };
  }) });
});
app.post('/api/job-portals/:pid/test', requireAuth, async (req, res) => {
  try {
    const r = await jobPortals.testConnection(req.user.settings, req.params.pid);
    if (r && r.skipped) return res.status(400).json({ error: r.reason });
    res.json({ ok: true, result: r });
  } catch (e) { res.status(502).json({ error: String(e.message || e).slice(0, 300) }); }
});
app.post('/api/job-portals/:pid/connect', requireAuth, (req, res) => {
  const portal = jobPortals.PORTALS.find(p => p.id === req.params.pid);
  if (!portal) return res.status(404).json({ error: 'Портал не найден' });
  const b = req.body || {};
  const conns = jobPortals.connectionsOf(req.user.settings);
  const c = conns[portal.id] = conns[portal.id] || {};
  if (b.login != null) c.login = String(b.login).trim().slice(0, 200);
  if (b.password) c.password = String(b.password).slice(0, 200);
  if (b.apiKey != null && !String(b.apiKey).startsWith('••••')) c.apiKey = String(b.apiKey).trim().slice(0, 400);
  if (!c.login && !c.apiKey) return res.status(400).json({ error: 'Укажите логин/пароль или API-ключ' });
  c.connectedAt = nowISO();
  save(); res.json({ ok: true });
});
app.delete('/api/job-portals/:pid', requireAuth, (req, res) => {
  const conns = jobPortals.connectionsOf(req.user.settings);
  delete conns[req.params.pid];
  save(); res.json({ ok: true });
});

// ---------- ANKETAS (public application forms) ----------
// Транслитерация кириллицы → латиница, чтобы ссылки были короткими и работали везде
const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'g', д: 'd', е: 'e', ё: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'i', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'iu', я: 'ia' };
function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[а-яёіїєґ]/g, ch => TRANSLIT[ch] != null ? TRANSLIT[ch] : ch)
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}
function anketaView(a) {
  const data = db(); const vac = data.vacancies.find(v => v.id === a.vacancyId);
  const applied = data.participants.filter(p => p.anketaId === a.id).length;
  return { ...a, vacancyName: vac ? vac.name : '', url: `${BASE_URL}/a/${a.slug}`, applied };
}
function uniqueSlug(base, exceptId) {
  const data = db(); let slug = slugify(base) || ('anketa-' + shortCode(5).toLowerCase()); let s = slug, i = 1;
  while (data.anketas.find(a => a.slug === s && a.id !== exceptId)) s = slug + '-' + (++i);
  return s;
}
// Префикс коротких ссылок — автоматически из первого слова названия компании
function companyPrefix(user) {
  const first = String((user && user.company) || '').trim().split(/\s+/)[0] || '';
  return slugify(first).slice(0, 20);
}
function prefixedSlug(user, base, exceptId) {
  const pfx = companyPrefix(user);
  let raw = slugify(base) || 'anketa';
  if (pfx && raw !== pfx && !raw.startsWith(pfx + '-')) raw = pfx + '-' + raw;
  return uniqueSlug(raw, exceptId);
}
app.get('/api/anketas', requireAuth, (req, res) => {
  const list = db().anketas.filter(a => a.userId === req.user.id).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ anketas: list.map(anketaView), prefix: companyPrefix(req.user) });
});
app.get('/api/anketas/:id', requireAuth, (req, res) => {
  const a = db().anketas.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!a) return res.status(404).json({ error: 'Не найдено' });
  res.json({ anketa: anketaView(a) });
});
function applyAnketaFields(a, b) {
  if (b.title != null) a.title = String(b.title);
  if (b.vacancyId !== undefined) a.vacancyId = b.vacancyId || null;
  if (Array.isArray(b.tests)) a.tests = b.tests.filter(t => TEST_TYPES[t]);
  ['btnText', 'pageTitle', 'msgApply', 'msgDone', 'description'].forEach(f => { if (b[f] != null) a[f] = String(b[f]); });
  ['noCaptcha', 'sendEmail'].forEach(f => { if (b[f] != null) a[f] = !!b[f]; });
}
app.post('/api/anketas', requireAuth, (req, res) => {
  const b = req.body || {}; const data = db();
  // Идемпотентная публикация: анкета для вакансии уже есть — обновляем её, а не создаём новую
  if (b.vacancyId) {
    const ex = data.anketas.find(x => x.userId === req.user.id && x.vacancyId === b.vacancyId);
    if (ex) { applyAnketaFields(ex, b); save(); return res.json({ anketa: anketaView(ex) }); }
  }
  const slug = prefixedSlug(req.user, b.slug || b.title || 'anketa');
  const a = { id: uid(12), userId: req.user.id, slug, title: b.title || 'Новая анкета', vacancyId: null,
    tests: [], btnText: 'Откликнуться', pageTitle: '', msgApply: 'Спасибо! Ваш отклик получен.',
    msgDone: 'Отлично! Вы ответили на все вопросы. HR-менеджер свяжется с вами после рассмотрения результатов.',
    noCaptcha: false, sendEmail: true, description: '', createdAt: nowISO() };
  applyAnketaFields(a, b);
  data.anketas.push(a); save();
  res.json({ anketa: anketaView(a) });
});
app.put('/api/anketas/:id', requireAuth, (req, res) => {
  const a = db().anketas.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!a) return res.status(404).json({ error: 'Не найдено' });
  const b = req.body || {};
  if (b.slug != null && slugify(b.slug) && prefixedSlug(req.user, b.slug, a.id) !== a.slug) a.slug = prefixedSlug(req.user, b.slug, a.id);
  applyAnketaFields(a, b); save();
  res.json({ anketa: anketaView(a) });
});
app.delete('/api/anketas/:id', requireAuth, (req, res) => {
  const data = db();
  data.anketas = data.anketas.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  save(); res.json({ ok: true });
});

// публичная анкета (мини-сайт)
app.get('/api/a/:slug', (req, res) => {
  const a = db().anketas.find(x => x.slug === req.params.slug);
  if (!a) return res.status(404).json({ error: 'Анкета не найдена' });
  if (ownerBlocked(a.userId)) return res.status(404).json({ error: 'Ссылка недоступна' });
  const u = db().users.find(x => x.id === a.userId);
  const avac = db().vacancies.find(v => v.id === a.vacancyId);
  const alang = avac && ['ru', 'pl', 'en'].includes(avac.lang) ? avac.lang : 'ru';
  res.json({ anketa: { slug: a.slug, title: a.title, pageTitle: a.pageTitle || a.title, btnText: a.btnText || 'Откликнуться',
    description: a.description || '', noCaptcha: a.noCaptcha, hasTests: (a.tests || []).length > 0, lang: alang,
    company: u ? u.company : '', logo: u && u.settings ? u.settings.logo : '' } });
});
// отклик кандидата → создаём кандидата в вакансии + назначаем тесты
app.post('/api/a/:slug/apply', (req, res) => {
  const data = db();
  const a = data.anketas.find(x => x.slug === req.params.slug);
  if (!a) return res.status(404).json({ error: 'Анкета не найдена' });
  if (ownerBlocked(a.userId)) return res.status(404).json({ error: 'Ссылка недоступна' });
  const b = req.body || {};
  const email = String(b.email || '').trim();
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: 'Укажите корректный email' });
  const owner = data.users.find(u => u.id === a.userId);
  let cv = null;
  if (b.cvData) { const url = saveCv(b.cvData, b.cvName); if (url) cv = { name: String(b.cvName || 'resume').slice(0, 120), url }; }
  const p = { id: uid(12), userId: a.userId, vacancyId: a.vacancyId || null, anketaId: a.id,
    src: String(b.src || '').slice(0, 60), // метка размещения объявления (портал)
    name: String(b.name || '').trim(), surname: String(b.surname || '').trim(), email,
    sex: b.sex || '', age: b.age ? parseInt(b.age, 10) : null, tel: String(b.tel || '').trim(), city: String(b.city || '').trim(),
    stage: 'Новый', comment: 'Отклик через анкету «' + a.title + '»', color: '#FFFFFF', starred: false, cv, createdAt: nowISO() };
  data.participants.push(p);
  const links = [];
  const avac = data.vacancies.find(v => v.id === a.vacancyId);
  const alang = avac ? (avac.lang || 'ru') : 'ru';
  orderTypes((a.tests || []).filter(t => TEST_TYPES[t]), owner, avac).forEach(type => {
    if (!TEST_TYPES[type]) return;
    const available = owner ? owner.balanceTotal - owner.balancePending : 0;
    if (owner && available < 1) return; // не хватает баланса — пропускаем тест
    const code = shortCode(10);
    const test = { id: uid(12), participantId: p.id, userId: a.userId, type, status: 'sent', code, lang: alang,
      sentAt: nowISO(), startedAt: null, finishedAt: null, durationSec: null, answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false };
    data.tests.push(test); if (owner) owner.balancePending += 1;
    links.push({ type, title: TEST_TYPES[type].title, link: `${BASE_URL}/t/${code}` });
  });
  // кандидат попал в воронку: звонок ИИ «первый контакт» и автоотправка первого теста процесса
  try { if (owner && avac) { aiCallFor(owner, p, avac, 'first'); advanceFunnel(p); } }
  catch (e) { console.error('[funnel:apply]', e.message); }
  save();
  res.json({ ok: true, links, msgApply: a.msgApply, msgDone: a.msgDone });
});

// ---------- PLANS / STRIPE PURCHASE ----------
// Заводские пакеты — используются как миграция в db.settings.plans при первом старте
const PLANS_FACTORY = [
  { id: 'starter', qty: 50, price: 4900, save: 0, popular: false, active: true, order: 1 },
  { id: 'standard', qty: 200, price: 14900, save: 24, popular: true, active: true, order: 2 },
  { id: 'pro', qty: 500, price: 29900, save: 39, popular: false, active: true, order: 3 },
  { id: 'business', qty: 1000, price: 49900, save: 49, popular: false, active: true, order: 4 },
];
function portalPlans() {
  const gs = portalSettings();
  if (!Array.isArray(gs.plans) || !gs.plans.length) { gs.plans = JSON.parse(JSON.stringify(PLANS_FACTORY)); save(); }
  return gs.plans;
}
function activePlans() { return portalPlans().filter(p => p.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)); }
let stripe = null;
function stripeKey() { return (portalSettings().stripe.secretKey || '').trim() || process.env.STRIPE_SECRET_KEY || ''; }
function initStripe() {
  const key = stripeKey();
  if (!key) { stripe = null; return; }
  try { stripe = require('stripe')(key); } catch (_) { stripe = null; }
}
initStripe();
app.get('/api/plans', (req, res) => res.json({ plans: activePlans(), currency: portalSettings().currency || 'eur', stripe: !!stripe }));
app.get('/api/purchases', requireAuth, (req, res) => {
  const list = db().purchases.filter(p => p.userId === req.user.id).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ purchases: list });
});

function creditPurchase(user, plan, method, sessionId) {
  const data = db();
  if (sessionId && data.purchases.find(p => p.sessionId === sessionId)) return null; // idempotent
  _ensureLots(user); // зафиксировать прежний баланс как лот (для старых аккаунтов) до пополнения
  user.balanceTotal += plan.qty;
  addBalanceLot(user, plan.qty, 'purchase');
  const purchase = { id: uid(12), userId: user.id, planId: plan.id, qty: plan.qty, amount: plan.price,
    method, status: 'paid', sessionId: sessionId || null, createdAt: nowISO() };
  data.purchases.push(purchase);
  logBalance(user.id, plan.qty, 'purchase', { purchaseId: purchase.id, comment: `Покупка пакета «${plan.id}» (${method})` });
  save();
  return purchase;
}

// Создать оплату. Со Stripe — Checkout Session; без ключа — мгновенная демо-оплата (тест-режим).
app.post('/api/checkout', requireAuth, async (req, res) => {
  const gs = portalSettings();
  const plan = activePlans().find(p => p.id === (req.body && req.body.planId));
  if (!plan) return res.status(400).json({ error: 'Неизвестный пакет' });
  if (!stripe) {
    const purchase = creditPurchase(req.user, plan, 'demo');
    return res.json({ simulated: true, balance: publicUser(req.user), purchase });
  }
  try {
    // payment_method_types НЕ указываем — Checkout сам подберёт методы по валюте/стране
    // из включённых в Dashboard (для PLN — BLIK, Przelewy24; для EUR — карты, SEPA и т.д.)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: gs.currency || 'eur',
        product_data: { name: `${gs.portalName || 'HR AI Pro'} — ${plan.qty} тестов` }, unit_amount: plan.price * 100 }, quantity: 1 }],
      customer_email: req.user.email,                 // привязка платежа к клиенту + чек на почту
      client_reference_id: req.user.id,
      success_url: `${BASE_URL}/app?checkout={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/app?checkout=cancel`,
      metadata: { userId: req.user.id, planId: plan.id, qty: String(plan.qty) },
      payment_intent_data: { description: `${plan.qty} тестов · пакет «${plan.id}»`, metadata: { userId: req.user.id, planId: plan.id } },
    }, {
      // защита от двойного клика: одна сессия на клиента+пакет в пределах минуты
      idempotencyKey: `co_${req.user.id}_${plan.id}_${Math.floor(Date.now() / 60000)}`,
    });
    res.json({ url: session.url });
  } catch (e) { res.status(500).json({ error: 'Stripe: ' + e.message }); }
});
// Подтверждение после возврата со Stripe.
app.post('/api/checkout/confirm', requireAuth, async (req, res) => {
  const sessionId = req.body && req.body.sessionId;
  if (!stripe || !sessionId) return res.status(400).json({ error: 'Нет сессии' });
  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== 'paid') return res.status(400).json({ error: 'Оплата не завершена' });
    const plan = portalPlans().find(p => p.id === s.metadata.planId);
    if (plan) creditPurchase(req.user, plan, 'stripe', sessionId);
    res.json({ balance: publicUser(req.user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Зачислить пакет по завершённой Checkout-сессии (идемпотентно по session.id)
function creditFromSession(s) {
  if (!s || !s.metadata || !s.metadata.userId) return;
  const user = db().users.find(u => u.id === s.metadata.userId);
  const plan = portalPlans().find(p => p.id === s.metadata.planId);
  if (user && plan) creditPurchase(user, plan, 'stripe', s.id);
}
// Stripe webhook: источник истины по оплатам (зачисление даже если клиент закрыл вкладку).
// Сырое тело (json-парсер пропускает этот путь) + проверка подписи.
// Обрабатываем и мгновенные (карты/BLIK/P24), и отложенные методы (SEPA, банк-переводы).
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe) return res.status(400).json({ error: 'Stripe не настроен' });
  const whSecret = (portalSettings().stripe.webhookSecret || '').trim() || process.env.STRIPE_WEBHOOK_SECRET || '';
  let event;
  try {
    if (whSecret) event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], whSecret);
    else return res.status(400).json({ error: 'Webhook secret не настроен' });
  } catch (e) { return res.status(400).json({ error: 'Подпись не прошла проверку' }); }
  const s = event.data && event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
      // мгновенные методы: payment_status уже 'paid'. Отложенные (SEPA) — ждём async-событие ниже.
      if (s && s.payment_status === 'paid') creditFromSession(s);
      break;
    case 'checkout.session.async_payment_succeeded':
      // отложенный метод дошёл до успеха — зачисляем (creditPurchase идемпотентен, дубля с completed не будет)
      creditFromSession(s);
      break;
    case 'checkout.session.async_payment_failed':
      console.warn('[stripe] async payment failed for session', s && s.id);
      break;
    case 'checkout.session.expired':
      break; // клиент не оплатил за 24ч — ничего не зачисляем
  }
  res.json({ received: true });
});

// ---------- RESULT / REPORT (recruiter) ----------
function testTitleOf(type) { return (TEST_TYPES[type] && TEST_TYPES[type].title) || (type === 'knowledge' ? 'Проверка знаний' : type); }
// Оценка проверки знаний против правильных вариантов (single/multi)
function gradeKnowledge(test) {
  const qs = (test.knowledge && test.knowledge.questions) || [];
  let correct = 0;
  const details = qs.map(q => {
    const given = test.answers ? test.answers[q.id] : undefined;
    const correctIdx = q.options.map((o, i) => (o.correct ? i : -1)).filter(i => i >= 0).sort((a, b) => a - b);
    let ok;
    if (q.type === 'multi') {
      const gset = Array.isArray(given) ? given.map(Number).sort((a, b) => a - b) : [];
      ok = gset.length === correctIdx.length && gset.every((v, i) => v === correctIdx[i]);
    } else {
      ok = correctIdx.includes(Number(given));
    }
    if (ok) correct++;
    return { id: q.id, text: q.text, image: q.image || null, ok, given, correctIdx, options: q.options.map(o => o.text) };
  });
  const total = qs.length;
  return { correct, total, percent: total ? Math.round(100 * correct / total) : 0, details };
}
function computeResult(test) {
  if (test.type === 'knowledge') return gradeKnowledge(test);
  if (test.type === 'tools') {
    const p = db().participants.find(x => x.id === test.participantId);
    const demo = demoFor(p);
    return oca.evaluate(test.answers, { demo });
  }
  if (test.type === 'logic') {
    const lb = testQuestionsFor('logic', test.lang);
    let correct = 0; const total = lb.questions.filter(q => !q.unscored).length;
    const details = lb.questions.map(q => {
      const given = test.answers[q.id];
      const ok = !q.unscored && q.answer != null && Number(given) === q.answer;
      if (ok) correct++;
      return { id: q.id, text: q.text, options: q.options, image: q.image || null,
        optionImages: q.optionImages || null, unscored: !!q.unscored,
        given: given != null ? Number(given) : null, answer: q.answer, correct: ok };
    });
    const percent = Math.round(100 * correct / total);
    // IQ-балл как на портале: база 75 при 0 верных, шкала до ~155 (нормируем на 80-вопросный масштаб).
    const iq = Math.round(75 + correct * (80 / total));
    const level = iq < 80 ? 'Очень низкий' : iq < 100 ? 'Низкий' : iq < 120 ? 'Средний' : iq < 140 ? 'Высокий' : 'Очень высокий';
    const bands = [
      { range: 'До 80 баллов', text: 'Очень низкий уровень интеллекта. Не подходит для руководящих должностей и должностей, требующих применения умственных способностей.' },
      { range: '80–100 баллов', text: 'Низкий уровень интеллекта. Человек с таким интеллектом с трудом оценивает ситуацию и принимает разумные решения. Не подходит для руководящих должностей и решения задач, требующих применения аналитических способностей.' },
      { range: '100–120 баллов', text: 'Средний уровень интеллекта. Человек с таким интеллектом в целом может оценивать ситуации. Этого уровня интеллекта хватит для принятия не очень сложных решений, но такой сотрудник не рекомендован для руководящих должностей.' },
      { range: '120–140 баллов', text: 'Высокий уровень интеллекта. Человек с таким интеллектом способен хорошо оценивать ситуации, принимать решения, которые требуют логического и аналитического мышления. Подходит для руководящих и линейных должностей.' },
      { range: 'от 140 баллов', text: 'Очень высокий уровень интеллекта. Человек с таким интеллектом способен оценивать ситуацию, принимать решения, которые требуют логического и аналитического мышления. Рекомендован на руководящие и любые другие должности.' },
    ];
    return { correct, total, percent, iq, level, bands, details };
  }
  if (test.type === 'sales') {
    // Граф из 12 показателей (0–100), методика реверс-инжинирингом портала.
    return sales.evaluate(test.answers);
  }
  // result — открытые ответы (тексты вопросов на языке теста)
  const items = testQuestionsFor('result', test.lang).questions.map(q => ({ id: q.id, text: q.text, type: q.type,
    options: q.options || null, answer: test.answers[q.id] != null ? test.answers[q.id] : '',
    timeSec: test.times[q.id] || 0, stars: (test.ratings || {})[q.id] || 0 }));
  return { items };
}

app.get('/api/tests/:id/result', requireAuth, (req, res) => {
  const test = db().tests.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!test) return res.status(404).json({ error: 'Не найдено' });
  const p = db().participants.find(x => x.id === test.participantId);
  const lang = pickLang(req);
  const result = localizeResult(computeResult(test), test.type, lang);
  let hint = null;
  if (test.type === 'result') hint = ai.resultHint(test, lang);
  if (test.type === 'tools') hint = ai.toolsHint(result, lang);
  if (test.type === 'sales') hint = ai.salesHint(result, lang);
  if (test.type === 'knowledge') hint = air.knowledgeAnalysis(result.correct, result.total, (test.knowledge && test.knowledge.passScore) || 60, lang);
  res.json({ test: { id: test.id, type: test.type, title: testTitleOf(test.type), status: test.status,
      knName: (test.knowledge && test.knowledge.name) || null, passScore: (test.knowledge && test.knowledge.passScore) || null,
      startedAt: test.startedAt, finishedAt: test.finishedAt, durationSec: test.durationSec,
      publicShare: test.publicShare, code: test.code },
    participant: p ? participantView(p) : null, result, hint });
});

// Оценка ответа Резалт звёздами
app.post('/api/tests/:id/rate', requireAuth, (req, res) => {
  const test = db().tests.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!test) return res.status(404).json({ error: 'Не найдено' });
  const { questionId, stars, overall } = req.body || {};
  if (overall != null) test.overallRate = overall;
  if (questionId != null) { test.ratings = test.ratings || {}; test.ratings[questionId] = stars; }
  save(); res.json({ ok: true, ratings: test.ratings, overallRate: test.overallRate });
});

// Публичная ссылка на результат
app.post('/api/tests/:id/share', requireAuth, (req, res) => {
  const test = db().tests.find(t => t.id === req.params.id && t.userId === req.user.id);
  if (!test) return res.status(404).json({ error: 'Не найдено' });
  test.publicShare = !!(req.body && req.body.enabled);
  save();
  res.json({ publicShare: test.publicShare, url: `${BASE_URL}/r/${test.id}` });
});

// ---------- CANDIDATE (public, by code) ----------
function findByCode(code) { return db().tests.find(t => t.code === code); }
// Публичные ссылки заблокированного клиента (тесты/анкеты/отчёты) недоступны
function ownerBlocked(userId) { const u = db().users.find(x => x.id === userId); return !!(u && u.blocked === true); }

// Срок жизни ссылки на тест: из настроек процесса вакансии кандидата (дефолт 3 дня).
// Начатый или завершённый тест не истекает.
function testLinkExpired(test) {
  if (test.status !== 'sent' || !test.sentAt) return false;
  const data = db();
  const p = data.participants.find(x => x.id === test.participantId);
  const vac = p && data.vacancies.find(v => v.id === p.vacancyId && v.userId === test.userId);
  const days = vac ? processOf(vac).linkDays : 3;
  return (Date.now() - new Date(test.sentAt).getTime()) > days * 864e5;
}
app.get('/api/take/:code', (req, res) => {
  const test = findByCode(req.params.code);
  if (!test) return res.status(404).json({ error: 'Тест не найден' });
  if (ownerBlocked(test.userId)) return res.status(404).json({ error: 'Ссылка недоступна' });
  if (testLinkExpired(test)) return res.status(410).json({ error: 'Срок действия ссылки истёк. Попросите рекрутёра отправить тест повторно.' });
  const p = db().participants.find(x => x.id === test.participantId);
  const tlang = ['ru', 'pl', 'en'].includes(test.lang) ? test.lang : 'ru';
  // Брендинг компании-отправителя + блокировка канала отправки (email/телефон менять нельзя)
  const owner = db().users.find(u => u.id === test.userId);
  const extra = {
    brand: { company: (owner && owner.company) || '', logo: (owner && owner.settings && owner.settings.logo) || '' },
    lockEmail: !!(p && p.email), lockTel: !!(p && p.tel),
  };
  if (test.type === 'knowledge') {
    const kq = ((test.knowledge && test.knowledge.questions) || []).map(q => ({
      id: q.id, text: q.text, image: q.image || null, video: q.video || null, type: q.type,
      options: q.options.map(o => o.text) }));
    return res.json({ type: 'knowledge', lang: tlang, title: (test.knowledge && test.knowledge.name) || testTitleOf('knowledge'), intro: '',
      status: test.status, timeLimitSec: null, scaleOptions: null,
      needProfile: !(p && p.name), questions: kq, ...extra,
      participant: p ? { name: p.name, surname: p.surname, email: p.email, sex: p.sex, age: p.age, tel: p.tel, city: p.city } : null });
  }
  const content = testQuestionsFor(test.type, tlang);
  // не отдаём правильные ответы логического теста
  let questions = content.questions;
  if (test.type === 'logic') questions = questions.map(q => ({ id: q.id, text: q.text, options: q.options, image: q.image || null, optionImages: q.optionImages || null }));
  res.json({
    type: test.type, lang: tlang, title: content.title || TEST_TYPES[test.type].title, intro: content.intro || '',
    status: test.status, timeLimitSec: content.timeLimitSec || null,
    scaleOptions: content.options || null,
    needProfile: !(p && p.name), questions, ...extra,
    participant: p ? { name: p.name, surname: p.surname, email: p.email, sex: p.sex, age: p.age, tel: p.tel, city: p.city } : null,
  });
});

app.post('/api/take/:code/start', (req, res) => {
  const test = findByCode(req.params.code);
  if (!test) return res.status(404).json({ error: 'Тест не найден' });
  const p = db().participants.find(x => x.id === test.participantId);
  const b = req.body || {};
  if (p) {
    ['name', 'surname', 'sex', 'age', 'city'].forEach(f => { if (b[f] != null && b[f] !== '') p[f] = b[f]; });
    // Канал отправки фиксирован: email/телефон меняются только если раньше были пустыми
    if (b.tel && !p.tel) p.tel = String(b.tel).trim();
    if (b.email && !p.email && /.+@.+\..+/.test(String(b.email))) p.email = String(b.email).trim();
    // Резюме, загруженное в анкете перед тестом (Резалт — первый тест в цепочке)
    if (b.cvData) { const url = saveCv(b.cvData, b.cvName); if (url) p.cv = { name: String(b.cvName || 'resume').slice(0, 120), url }; }
  }
  if (!test.startedAt) { test.startedAt = nowISO(); test.status = 'in_progress'; }
  save();
  res.json({ ok: true });
});

app.post('/api/take/:code/submit', (req, res) => {
  const test = findByCode(req.params.code);
  if (!test) return res.status(404).json({ error: 'Тест не найден' });
  if (test.status === 'done') return res.json({ ok: true, already: true });
  const { answers, times } = req.body || {};
  test.answers = answers || {};
  test.times = times || {};
  test.finishedAt = nowISO();
  if (test.startedAt) test.durationSec = Math.round((new Date(test.finishedAt) - new Date(test.startedAt)) / 1000);
  test.status = 'done';
  // перевести баланс из pending в списанный
  const u = db().users.find(x => x.id === test.userId);
  if (u && test.balancePending !== true) {
    _ensureLots(u); u.balancePending = Math.max(0, u.balancePending - 1); u.balanceTotal = Math.max(0, u.balanceTotal - 1); spendLots(u, 1); test.balancePending = true;
    logBalance(u.id, -1, 'test_spend', { testId: test.id, comment: `Пройден тест «${testTitleOf(test.type)}»` });
  }
  // автоворонка: звонки ИИ на настроенных шагах + отправка следующего теста процесса
  try {
    const p = db().participants.find(x => x.id === test.participantId);
    const vac = p && db().vacancies.find(v => v.id === p.vacancyId && v.userId === test.userId);
    if (p && u && vac) {
      if (test.type === 'result') aiCallFor(u, p, vac, 'afterResult');
      if (test.type === 'tools') { aiCallFor(u, p, vac, 'afterTools'); aiCallFor(u, p, vac, 'motivation'); }
      advanceFunnel(p);
    }
  } catch (e) { console.error('[funnel]', e.message); }
  save();
  res.json({ ok: true });
});

// ---------- PUBLIC REPORT (share) ----------
app.get('/api/r/:id', (req, res) => {
  const test = db().tests.find(t => t.id === req.params.id);
  if (!test || !test.publicShare) return res.status(404).json({ error: 'Недоступно' });
  if (ownerBlocked(test.userId)) return res.status(404).json({ error: 'Ссылка недоступна' });
  const p = db().participants.find(x => x.id === test.participantId);
  const lang = pickLang(req);
  const result = localizeResult(computeResult(test), test.type, lang);
  let hint = null;
  if (test.type === 'result') hint = ai.resultHint(test, lang);
  if (test.type === 'tools') hint = ai.toolsHint(result, lang);
  if (test.type === 'sales') hint = ai.salesHint(result, lang);
  res.json({ test: { type: test.type, title: testTitleOf(test.type), durationSec: test.durationSec },
    participant: p ? { name: p.name, surname: p.surname, age: p.age } : null, result, hint });
});

// ---------- EDUCATION ----------
const EDU_DIR = path.join(__dirname, 'data', 'education');
const EDU_TOPICS = [
  { slug: 'rules', title: 'Правила работы с системой', title_pl: 'Zasady pracy z systemem', title_en: 'System rules' },
  { slug: 'instruct', title: 'Инструкция по работе с системой', title_pl: 'Instrukcja obsługi systemu', title_en: 'System user guide' },
  { slug: 'productivity', title: 'Тест на продуктивность (Резалт)', title_pl: 'Test produktywności (Result)', title_en: 'Productivity test (Result)' },
  { slug: 'personality', title: 'Тест на личностные качества (Тулс)', title_pl: 'Test osobowości (Tools)', title_en: 'Personality test (Tools)' },
  { slug: 'logic', title: 'Тест на логику (Логис)', title_pl: 'Test logiki (Logic)', title_en: 'Logic test (Logic)' },
  { slug: 'sales', title: 'Тест на продажи (Sales)', title_pl: 'Test sprzedaży (Sales)', title_en: 'Sales test (Sales)' },
];
function eduTopicView(t, lang) { return { slug: t.slug, title: (lang === 'pl' && t.title_pl) || (lang === 'en' && t.title_en) || t.title }; }
// файл статьи по языку: <slug>.<lang>.md с фолбэком на <slug>.md
function eduFile(slug, lang) {
  if (lang === 'pl' || lang === 'en') { const f = path.join(EDU_DIR, slug + '.' + lang + '.md'); if (fs.existsSync(f)) return f; }
  return path.join(EDU_DIR, slug + '.md');
}
app.get('/api/education', requireAuth, (req, res) => {
  const lang = pickLang(req);
  const topics = EDU_TOPICS.filter(t => fs.existsSync(path.join(EDU_DIR, t.slug + '.md'))).map(t => eduTopicView(t, lang));
  res.json({ topics });
});
app.get('/api/education/:slug', requireAuth, (req, res) => {
  const lang = pickLang(req);
  const t = EDU_TOPICS.find(x => x.slug === req.params.slug);
  const file = t && eduFile(t.slug, lang);
  if (!t || !fs.existsSync(file)) return res.status(404).json({ error: 'Материал не найден' });
  res.json({ topic: eduTopicView(t, lang), markdown: fs.readFileSync(file, 'utf8') });
});

// ========== RECRUITMENT WORKFLOW ==========
// Справочники для клиента (качества, уровни мотивации, вопросы мотивации/референсов, этапы, поля заявки)
app.get('/api/recruit/meta', (req, res) => {
  const lang = pickLang(req);
  res.json({
    stages: recruit.WORKFLOW_STAGES.map(s => ({ key: s.key, kind: s.kind, title: recruit.stageTitle(s.key, lang) })),
    traits: recruit.traitsFor(lang),
    motivationLevels: recruit.motivationLevelsFor(lang),
    motivationQuestions: recruit.motivationQuestionsFor(lang),
    referenceQuestions: recruit.referenceQuestionsFor(lang),
    fields: recruit.REQUISITION_FIELDS,
  });
});

// Загрузка медиа (картинка/видео) для вопросов проверки знаний
app.post('/api/upload', requireAuth, (req, res) => {
  const url = saveMedia(req.body && req.body.dataUrl, req.body && req.body.name);
  if (!url) return res.status(400).json({ error: 'Не удалось сохранить файл (проверьте формат/размер ≤ 40 МБ)' });
  res.json({ url });
});

// ---------- Универсальная ссылка компании (любой руководитель создаёт заявку) ----------
app.get('/api/company/req-link', requireAuth, (req, res) => {
  const s = ensureSettings(req.user); save();
  res.json({ code: s.reqShareCode, link: `${BASE_URL}/new-req/${s.reqShareCode}` });
});
app.get('/api/company/:code/meta', (req, res) => {
  const u = db().users.find(x => x.settings && x.settings.reqShareCode === req.params.code);
  if (!u) return res.status(404).json({ error: 'Ссылка недействительна' });
  res.json({ company: u.company || '', logo: (u.settings && u.settings.logo) || '' });
});
app.post('/api/company/:code/requisition', (req, res) => {
  const data = db();
  const u = data.users.find(x => x.settings && x.settings.reqShareCode === req.params.code);
  if (!u) return res.status(404).json({ error: 'Ссылка недействительна' });
  const lang = ['ru', 'pl', 'en'].includes(req.body && req.body.lang) ? req.body.lang : 'ru';
  const r = { id: uid(10), userId: u.id, code: shortCode(10), status: 'submitted', lang,
    form: (req.body && typeof req.body.form === 'object') ? req.body.form : {}, vacancyId: null,
    createdBy: 'manager', createdAt: nowISO(), submittedAt: nowISO(), approvedAt: null };
  data.requisitions.push(r); save();
  res.json({ ok: true });
});

// ---------- Заявки на подбор ----------
function reqView(r) {
  const vac = db().vacancies.find(v => v.id === r.vacancyId);
  return { id: r.id, code: r.code, status: r.status, lang: r.lang, form: r.form || {},
    createdBy: r.createdBy, vacancyId: r.vacancyId || null, vacancyName: vac ? vac.name : null,
    position: (r.form && r.form.position) || '', createdAt: r.createdAt, submittedAt: r.submittedAt, approvedAt: r.approvedAt };
}
app.get('/api/requisitions', requireAuth, (req, res) => {
  const list = db().requisitions.filter(r => r.userId === req.user.id)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.json({ requisitions: list.map(reqView) });
});
app.post('/api/requisitions', requireAuth, (req, res) => {
  const data = db();
  const lang = ['ru', 'pl', 'en'].includes(req.body && req.body.lang) ? req.body.lang : 'ru';
  const r = { id: uid(10), userId: req.user.id, code: shortCode(10), status: 'draft', lang,
    form: (req.body && typeof req.body.form === 'object') ? req.body.form : {}, vacancyId: null,
    createdBy: 'hr', createdAt: nowISO(), submittedAt: null, approvedAt: null };
  data.requisitions.push(r); save();
  res.json({ requisition: reqView(r), link: `${BASE_URL}/req/${r.code}` });
});
app.get('/api/requisitions/:id', requireAuth, (req, res) => {
  const r = db().requisitions.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!r) return res.status(404).json({ error: 'Не найдено' });
  res.json({ requisition: reqView(r), link: `${BASE_URL}/req/${r.code}`,
    analysis: air.requisitionAnalysis(r.form, pickLang(req)) });
});
app.put('/api/requisitions/:id', requireAuth, (req, res) => {
  const r = db().requisitions.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!r) return res.status(404).json({ error: 'Не найдено' });
  if (req.body.form && typeof req.body.form === 'object') r.form = req.body.form;
  if (req.body.lang && ['ru', 'pl', 'en'].includes(req.body.lang)) r.lang = req.body.lang;
  if (req.body.status && ['draft', 'submitted', 'approved', 'rejected'].includes(req.body.status)) {
    r.status = req.body.status;
    if (r.status === 'approved') r.approvedAt = nowISO();
  }
  save(); res.json({ requisition: reqView(r) });
});
app.delete('/api/requisitions/:id', requireAuth, (req, res) => {
  const data = db();
  data.requisitions = data.requisitions.filter(x => !(x.id === req.params.id && x.userId === req.user.id));
  save(); res.json({ ok: true });
});
// Утвердить заявку → создать вакансию (если ещё нет) с настроенным workflow
app.post('/api/requisitions/:id/approve', requireAuth, (req, res) => {
  const data = db();
  const r = data.requisitions.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!r) return res.status(404).json({ error: 'Не найдено' });
  r.status = 'approved'; r.approvedAt = nowISO();
  // Раздел (направление) из заявки: найти существующий по имени или создать новый
  let sectionId = null;
  const secName = String((r.form && r.form.section) || '').trim();
  if (secName) {
    let sec = data.sections.find(s => s.userId === req.user.id && s.name.toLowerCase() === secName.toLowerCase());
    if (!sec) {
      sec = { id: uid(10), userId: req.user.id, name: secName, order: data.sections.filter(s => s.userId === req.user.id).length, createdAt: nowISO() };
      data.sections.push(sec);
    }
    sectionId = sec.id;
  }
  let vac = data.vacancies.find(v => v.id === r.vacancyId && v.userId === req.user.id);
  if (!vac) {
    const order = data.vacancies.filter(v => v.userId === req.user.id).length;
    vac = { id: uid(10), userId: req.user.id, sectionId,
      name: (r.form && r.form.position) || 'Вакансия', lang: r.lang, order, createdAt: nowISO(),
      requisitionId: r.id, adText: '', adMode: 'manual', published: false,
      workflow: recruit.STAGE_KEYS.slice(), knowledge: { questions: [], passScore: 60 }, motivationQuestions: [] };
    data.vacancies.push(vac); r.vacancyId = vac.id;
  } else if (sectionId) vac.sectionId = sectionId;
  save(); res.json({ requisition: reqView(r), vacancyId: vac.id });
});
// Публичная заявка (заполняет руководитель по ссылке)
app.get('/api/req/:code', (req, res) => {
  const r = db().requisitions.find(x => x.code === req.params.code);
  if (!r) return res.status(404).json({ error: 'Заявка не найдена' });
  const u = db().users.find(x => x.id === r.userId);
  res.json({ requisition: { code: r.code, status: r.status, lang: r.lang, form: r.form || {},
    company: u ? u.company : '', logo: u && u.settings ? u.settings.logo : '' } });
});
app.post('/api/req/:code', (req, res) => {
  const data = db();
  const r = data.requisitions.find(x => x.code === req.params.code);
  if (!r) return res.status(404).json({ error: 'Заявка не найдена' });
  // Утверждённую заявку руководитель по публичной ссылке менять не может — только эйчар в портале
  if (r.status === 'approved') return res.status(403).json({ error: 'Заявка утверждена — изменения вносит HR' });
  if (req.body && typeof req.body.form === 'object') r.form = req.body.form;
  r.status = 'submitted'; r.submittedAt = nowISO(); r.createdBy = 'manager';
  save(); res.json({ ok: true });
});
// Генерация объявления по заявке
app.post('/api/requisitions/:id/generate-ad', requireAuth, (req, res) => {
  const r = db().requisitions.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!r) return res.status(404).json({ error: 'Не найдено' });
  const lang = (req.body && ['ru', 'pl', 'en'].includes(req.body.lang)) ? req.body.lang : r.lang;
  res.json({ ad: air.generateAd(r.form, lang, { company: req.user.company, target: req.body && req.body.target }) });
});

// ---------- Расширения вакансии (объявление + конфигурация workflow) ----------
// Несколько тестов проверки знаний на вакансию (+ миграция старого одиночного v.knowledge)
function knowledgeTestsOf(v) {
  if (!Array.isArray(v.knowledgeTests)) v.knowledgeTests = [];
  if (!v.knowledgeTests.length && v.knowledge && Array.isArray(v.knowledge.questions) && v.knowledge.questions.length) {
    v.knowledgeTests.push({ id: uid(8), name: 'Тест 1', questions: v.knowledge.questions, passScore: v.knowledge.passScore || 60 });
  }
  return v.knowledgeTests;
}
// Настройки процесса найма вакансии (вкладка «Процесс найма»):
// вкл/выкл обязательных этапов, доп. тесты, автоворонка и звонки ИИ на шагах
function processOf(v) {
  const def = { auto: false,
    linkDays: 3, // срок жизни ссылки на тест — настраивается на каждую вакансию
    order: ['result', 'tools', 'logic', 'sales', 'knowledge'], // очерёдность тестов процесса
    stages: { result: true, references: true, tools: true, motivation: true, knowledge: true },
    optional: { logic: false, sales: false },
    aiCalls: { first: false, afterResult: false, afterTools: false, motivation: false },
    // Критерии отбора: критичный этап не пройден → кандидат дальше не идёт.
    // Продуктивность, качества и референсы не изменить; мотивацию можно поднять, знаниям — обучить
    critical: { result: true, references: true, tools: true, motivation: false, knowledge: false } };
  if (!v.process || typeof v.process !== 'object') v.process = {};
  v.process.stages = Object.assign({}, def.stages, v.process.stages || {});
  v.process.optional = Object.assign({}, def.optional, v.process.optional || {});
  v.process.aiCalls = Object.assign({}, def.aiCalls, v.process.aiCalls || {});
  v.process.critical = Object.assign({}, def.critical, v.process.critical || {});
  if (typeof v.process.auto !== 'boolean') v.process.auto = false;
  if (!Number.isFinite(v.process.linkDays)) v.process.linkDays = def.linkDays;
  // порядок — валидная перестановка всех тестовых шагов
  if (!Array.isArray(v.process.order) || v.process.order.slice().sort().join() !== def.order.slice().sort().join())
    v.process.order = def.order.slice();
  return v.process;
}
function vacFull(v) {
  return { id: v.id, name: v.name, lang: v.lang, sectionId: v.sectionId || null,
    requisitionId: v.requisitionId || null, adText: v.adText || '', adMode: v.adMode || 'manual',
    published: !!v.published, workflow: Array.isArray(v.workflow) ? v.workflow : recruit.STAGE_KEYS.slice(),
    knowledge: v.knowledge || { questions: [], passScore: 60 },
    knowledgeTests: knowledgeTestsOf(v),
    process: processOf(v),
    motivationQuestions: Array.isArray(v.motivationQuestions) ? v.motivationQuestions : [] };
}
// Сохранить настройки процесса найма (частичное обновление групп тумблеров)
app.put('/api/vacancies/:id/process', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const proc = processOf(v);
  const b = req.body || {};
  if (typeof b.auto === 'boolean') proc.auto = b.auto;
  if (b.target === 'performer' || b.target === 'executor') proc.target = b.target;
  if (b.linkDays !== undefined) proc.linkDays = Math.max(1, Math.min(365, parseInt(b.linkDays, 10) || 3));
  if (Array.isArray(b.order)) {
    const def = ['result', 'tools', 'logic', 'sales', 'knowledge'];
    const clean = b.order.filter(k => def.includes(k));
    if (clean.length === def.length && new Set(clean).size === def.length) proc.order = clean;
  }
  ['stages', 'optional', 'aiCalls', 'critical'].forEach(g => {
    if (b[g] && typeof b[g] === 'object')
      Object.keys(proc[g]).forEach(k => { if (typeof b[g][k] === 'boolean') proc[g][k] = b[g][k]; });
  });
  // подчинённые звонки ИИ гаснут вместе с родительским этапом
  if (proc.stages.result === false) proc.aiCalls.afterResult = false;
  if (proc.stages.tools === false) proc.aiCalls.afterTools = false;
  if (proc.stages.motivation === false) proc.aiCalls.motivation = false;
  save(); res.json({ process: proc });
});
app.get('/api/vacancies/:id/full', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  res.json({ vacancy: vacFull(v) });
});

// ---------- Размещения объявления (порталы) со статистикой по метке src ----------
function placementsOf(v) { if (!Array.isArray(v.placements)) v.placements = []; return v.placements; }
app.get('/api/vacancies/:id/placements', requireAuth, (req, res) => {
  const data = db(); const lang = pickLang(req);
  const v = data.vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const parts = data.participants.filter(p => p.userId === req.user.id && p.vacancyId === v.id);
  const ank = data.anketas.find(a => a.userId === req.user.id && a.vacancyId === v.id);
  const statsFor = src => {
    const list = parts.filter(p => (p.src || '') === src);
    const st = { responses: list.length, result: 0, tools: 0, motivation: 0, knowledge: 0, hired: 0 };
    list.forEach(p => {
      const wf = buildWorkflow(p, lang);
      const done = k => { const s = wf.stages.find(x => x.key === k); return !!(s && (s.status === 'done' || s.done)); };
      if (done('result')) st.result++; if (done('tools')) st.tools++;
      if (done('motivation')) st.motivation++; if (done('knowledge')) st.knowledge++;
      if (wf.decision === 'hired' || wf.column === 'hired') st.hired++;
    });
    st.conversion = st.responses ? Math.round(100 * st.hired / st.responses) : 0;
    return st;
  };
  res.json({ placements: placementsOf(v).map(pl => ({ ...pl,
    link: ank ? `${BASE_URL}/a/${ank.slug}?src=${encodeURIComponent(pl.src)}` : (pl.url || ''),
    stats: statsFor(pl.src) })) });
});
app.post('/api/vacancies/:id/placements', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const b = req.body || {};
  const portal = String(b.portal || '').slice(0, 120).trim();
  if (!portal) return res.status(400).json({ error: 'Укажите портал (где размещено)' });
  const pl = { id: uid(8), portal, title: String(b.title || '').slice(0, 200), url: String(b.url || '').slice(0, 1000),
    src: (slugify(portal) || 'src') + '-' + shortCode(4).toLowerCase(), createdAt: nowISO() };
  placementsOf(v).push(pl); save();
  res.json({ placement: pl });
});
app.delete('/api/vacancies/:id/placements/:pid', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  v.placements = placementsOf(v).filter(p => p.id !== req.params.pid);
  save(); res.json({ ok: true });
});
app.put('/api/vacancies/:id/config', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const b = req.body || {};
  if (b.adText != null) v.adText = String(b.adText).slice(0, 40000);
  if (b.adMode && ['ai', 'manual'].includes(b.adMode)) v.adMode = b.adMode;
  if (typeof b.published === 'boolean') v.published = b.published;
  if (Array.isArray(b.workflow)) v.workflow = b.workflow.filter(k => recruit.STAGE_KEYS.includes(k));
  save(); res.json({ vacancy: vacFull(v) });
});
// Проверка знаний: конструктор вопросов
function cleanKnowledge(input) {
  const passScore = Math.max(0, Math.min(100, parseInt(input && input.passScore, 10) || 60));
  const questions = (Array.isArray(input && input.questions) ? input.questions : []).slice(0, 100).map(q => {
    const type = q && q.type === 'multi' ? 'multi' : 'single';
    const options = (Array.isArray(q && q.options) ? q.options : []).slice(0, 12).map(o => ({
      text: String((o && o.text) || '').slice(0, 500), correct: !!(o && o.correct) }));
    return { id: String((q && q.id) || uid(6)).slice(0, 24), text: String((q && q.text) || '').slice(0, 2000),
      image: String((q && q.image) || '').slice(0, 100000), video: String((q && q.video) || '').slice(0, 2000),
      type, options };
  }).filter(q => q.text && q.options.length);
  return { questions, passScore };
}
// Создать/обновить тест знаний (ktId — какой тест; без ktId — создаётся новый)
app.put('/api/vacancies/:id/knowledge', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const kts = knowledgeTestsOf(v);
  const clean = cleanKnowledge(req.body);
  const name = String((req.body && req.body.name) || '').slice(0, 120);
  const ktId = req.body && req.body.ktId;
  let kt = ktId ? kts.find(k => k.id === ktId) : null;
  if (!kt) { kt = { id: uid(8), name: name || ('Тест ' + (kts.length + 1)), questions: [], passScore: 60 }; kts.push(kt); }
  if (name) kt.name = name;
  kt.questions = clean.questions; kt.passScore = clean.passScore;
  // Совместимость: первый тест дублируем в старое поле
  v.knowledge = kts[0] ? { questions: kts[0].questions, passScore: kts[0].passScore } : { questions: [], passScore: 60 };
  save(); res.json({ knowledgeTests: kts, ktId: kt.id });
});
// Сгенерировать тест знаний ИИ по всем материалам вакансии (заявка + объявление)
app.post('/api/vacancies/:id/knowledge-ai', requireAuth, (req, res) => {
  const data = db();
  const v = data.vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const r = data.requisitions.find(x => x.id === v.requisitionId && x.userId === req.user.id);
  const questions = air.generateKnowledgeTest((r && r.form) || { position: v.name }, v.adText || '', v.lang || 'ru');
  if (!questions.length) return res.status(400).json({ error: 'Недостаточно данных в заявке — заполните продукт, обязанности и компетенции' });
  const kts = knowledgeTestsOf(v);
  const ktId = req.body && req.body.ktId;
  let kt = ktId ? kts.find(k => k.id === ktId) : null;
  if (!kt) { kt = { id: uid(8), name: 'Тест по вакансии (ИИ)', questions: [], passScore: 60 }; kts.push(kt); }
  kt.questions = questions;
  v.knowledge = kts[0] ? { questions: kts[0].questions, passScore: kts[0].passScore } : v.knowledge;
  save(); res.json({ knowledgeTests: kts, ktId: kt.id });
});
app.delete('/api/vacancies/:id/knowledge/:ktId', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  v.knowledgeTests = knowledgeTestsOf(v).filter(k => k.id !== req.params.ktId);
  v.knowledge = v.knowledgeTests[0] ? { questions: v.knowledgeTests[0].questions, passScore: v.knowledgeTests[0].passScore } : { questions: [], passScore: 60 };
  save(); res.json({ knowledgeTests: v.knowledgeTests });
});
// Мотивационные вопросы (кастомные для вакансии; по умолчанию — из методики)
app.put('/api/vacancies/:id/motivation', requireAuth, (req, res) => {
  const v = db().vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  v.motivationQuestions = (Array.isArray(req.body && req.body.questions) ? req.body.questions : [])
    .slice(0, 20).map(q => ({ id: String((q && q.id) || uid(6)).slice(0, 24), text: String((q && q.text) || '').slice(0, 1000) }))
    .filter(q => q.text);
  save(); res.json({ motivationQuestions: v.motivationQuestions });
});

// ---------- Отправка проверки знаний кандидату ----------
app.post('/api/participants/:id/send-knowledge', requireAuth, (req, res) => {
  const data = db();
  const p = data.participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Кандидат не найден' });
  const vac = data.vacancies.find(v => v.id === p.vacancyId && v.userId === req.user.id);
  const kts = vac ? knowledgeTestsOf(vac).filter(k => k.questions.length) : [];
  if (!kts.length) return res.status(400).json({ error: 'Для вакансии не настроена проверка знаний' });
  const kt = kts.find(k => k.id === (req.body && req.body.ktId)) || kts[0];
  const code = shortCode(10);
  const test = { id: uid(12), participantId: p.id, userId: req.user.id, type: 'knowledge', status: 'sent',
    code, lang: vac ? (vac.lang || 'ru') : 'ru', sentAt: nowISO(), startedAt: null, finishedAt: null, durationSec: null,
    answers: {}, times: {}, result: null, ratings: {}, overallRate: null, publicShare: false,
    knowledge: { ktId: kt.id, name: kt.name, questions: kt.questions, passScore: kt.passScore }, balancePending: true };
  data.tests.push(test); save();
  notifyCandidate(req.user, p, test, vac, `${BASE_URL}/t/${code}`);
  res.json({ test: { id: test.id, type: 'knowledge', status: 'sent', code }, link: `${BASE_URL}/t/${code}` });
});

// ---------- Мотивация и референсы (заполняет рекрутёр) ----------
app.post('/api/participants/:id/motivation', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  p.workflow = p.workflow || {};
  const level = req.body && req.body.level;
  p.workflow.motivation = { level: recruit.MOTIVATION_LEVELS.some(m => m.key === level) ? level : null,
    answers: (req.body && req.body.answers) || {}, notes: String((req.body && req.body.notes) || '').slice(0, 4000), at: nowISO() };
  save(); res.json({ ok: true, motivation: p.workflow.motivation });
});
app.post('/api/participants/:id/references', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  p.workflow = p.workflow || {};
  p.workflow.references = p.workflow.references || {};
  const idx = req.body && req.body.refIndex;
  if (idx != null && idx !== '') {
    // Референс по конкретному контакту руководителя (несколько форм)
    p.workflow.references.multi = p.workflow.references.multi || {};
    p.workflow.references.multi[idx] = { answers: (req.body && req.body.answers) || {}, at: nowISO() };
  } else {
    p.workflow.references.answers = (req.body && req.body.answers) || {};
    p.workflow.references.at = nowISO();
  }
  save(); res.json({ ok: true, references: p.workflow.references });
});
// ---------- Собеседования (несколько карточек на кандидата) ----------
app.post('/api/participants/:id/interviews', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  p.workflow = p.workflow || {};
  p.workflow.interviews = p.workflow.interviews || [];
  const iv = { id: uid(8), createdAt: nowISO(), date: '', participants: '', impressions: '', scores: '', questions: '', notes: '' };
  p.workflow.interviews.push(iv);
  p.stage = 'Собеседование';
  save(); res.json({ interview: iv });
});
app.put('/api/participants/:id/interviews/:iid', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  const iv = (p.workflow && p.workflow.interviews || []).find(i => i.id === req.params.iid);
  if (!iv) return res.status(404).json({ error: 'Собеседование не найдено' });
  ['date', 'participants', 'impressions', 'scores', 'questions', 'notes'].forEach(f => {
    if (req.body && req.body[f] != null) iv[f] = String(req.body[f]).slice(0, 4000);
  });
  save(); res.json({ interview: iv });
});
// Установить исход этапа (pass/fail) вручную и/или итоговое решение
app.post('/api/participants/:id/gate', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  p.workflow = p.workflow || {};
  p.workflow.gates = p.workflow.gates || {};
  p.workflow.skipped = p.workflow.skipped || {};
  const { stage, passed, skip, decision } = req.body || {};
  // пропускать можно и обязательные этапы, и необязательные тесты (opt:logic / opt:sales)
  if (stage && (recruit.STAGE_KEYS.includes(stage) || /^opt:(logic|sales)$/.test(stage))) {
    // skip=true — рекрутёр пропускает этап (не стопорит процесс); skip=false — вернуть этап
    if (skip === true) { p.workflow.skipped[stage] = true; delete p.workflow.gates[stage]; }
    else if (skip === false) delete p.workflow.skipped[stage];
    else if (recruit.STAGE_KEYS.includes(stage)) {
      if (passed === null) { delete p.workflow.gates[stage]; delete p.workflow.skipped[stage]; }
      else p.workflow.gates[stage] = !!passed;
    }
  }
  if (decision !== undefined) p.workflow.decision = ['hired', 'rejected'].includes(decision) ? decision : null;
  save(); res.json({ ok: true, workflow: p.workflow });
});

// Названия необязательных тестов (этап после Tools и динамические колонки канбана)
const OPT_TITLE = { logic: { ru: 'Тест на логику (Логис)', pl: 'Test logiki (Logic)', en: 'Logic test (Logic)' },
  sales: { ru: 'Тест на продажи (Sales)', pl: 'Test sprzedaży (Sales)', en: 'Sales test (Sales)' } };
// Построить состояние workflow кандидата (этапы + ИИ + решение + канбан-колонка)
function buildWorkflow(p, lang) {
  const data = db();
  const vac = data.vacancies.find(v => v.id === p.vacancyId);
  const proc = vac ? processOf(vac) : null;
  // Этапы методики минус выключенные в настройках процесса вакансии
  const cfgStages = recruit.STAGE_KEYS.filter(k => !proc || proc.stages[k] !== false);
  const wf = p.workflow || {};
  const gates = wf.gates || {};
  const skipped = wf.skipped || {};
  const tests = data.tests.filter(t => t.participantId === p.id);
  const stages = cfgStages.map(key => {
    const st = { key, title: recruit.stageTitle(key, lang), kind: (recruit.WORKFLOW_STAGES.find(s => s.key === key) || {}).kind, skipped: !!skipped[key] };
    if (key === 'knowledge' && vac && knowledgeTestsOf(vac).length > 1) {
      // Несколько тестов знаний на вакансию: показываем все, этап пройден когда пройдены все
      const kts = knowledgeTestsOf(vac);
      const kTests = tests.filter(x => x.type === 'knowledge').sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
      st.items = kts.map((kt, i) => {
        const t = kTests.find(x => (x.knowledge && x.knowledge.ktId) === kt.id) || (i === 0 ? kTests.find(x => !(x.knowledge && x.knowledge.ktId)) : null);
        const item = { ktId: kt.id, name: kt.name, status: t ? t.status : 'none', testId: t ? t.id : null, testCode: t ? t.code : null };
        if (t && t.status === 'done') { const gr = gradeKnowledge(t); item.percent = gr.percent; item.pass = gr.percent >= (kt.passScore || 60); }
        return item;
      });
      st.status = st.items.every(i => i.status === 'done') ? 'done' : st.items.some(i => i.status !== 'none') ? 'sent' : 'none';
      if (st.status === 'done') {
        st.suggested = st.items.every(i => i.pass === true);
        st.analysis = { verdict: st.suggested ? 'Знания подтверждены' : 'Знаний недостаточно',
          tone: st.suggested ? 'good' : 'low',
          notes: st.items.map(i => `${i.name}: ${i.percent}% — ${i.pass ? 'сдан' : 'не сдан'}`) };
      }
      st.passed = gates[key] !== undefined ? gates[key] : (st.status === 'done' ? st.suggested : null);
      return st;
    }
    if (key === 'result' || key === 'tools' || key === 'knowledge') {
      const t = tests.filter(x => x.type === key).sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
      st.testId = t ? t.id : null;
      st.testCode = t ? t.code : null;
      st.status = t ? t.status : 'none';
      if (t && t.status === 'done') {
        if (key === 'knowledge') {
          const gr = gradeKnowledge(t);
          st.analysis = air.knowledgeAnalysis(gr.correct, gr.total, (t.knowledge && t.knowledge.passScore) || 60, lang);
          st.suggested = gr.percent >= ((t.knowledge && t.knowledge.passScore) || 60);
        } else if (key === 'result') {
          const h = ai.resultHint(t, lang); st.analysis = { verdict: h.verdict, notes: h.notes, tone: h.tone };
          st.suggested = h.category !== 'Вейтер';
        } else {
          const r = localizeResult(computeResult(t), 'tools', lang); const h = ai.toolsHint(r, lang);
          st.analysis = { verdict: h.verdict, notes: h.notes }; st.suggested = true;
        }
      }
      st.passed = gates[key] !== undefined ? gates[key] : (st.status === 'done' ? st.suggested : null);
    } else if (key === 'motivation') {
      const m = wf.motivation;
      st.done = !!(m && m.level);
      st.level = m ? m.level : null;
      if (m && m.level) { st.analysis = air.motivationAnalysis(m.level, lang); st.suggested = (recruit.MOTIVATION_LEVELS.find(x => x.key === m.level) || {}).score >= 2; }
      st.passed = gates[key] !== undefined ? gates[key] : (st.done ? st.suggested : null);
    } else if (key === 'references') {
      const rf = wf.references || {};
      // Контакты руководителей из пройденного «Резалта» (вопрос 13) — референс на каждого
      const doneResult = tests.filter(x => x.type === 'result' && x.status === 'done')
        .sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
      let contacts = [];
      const raw = doneResult && doneResult.answers && (doneResult.answers['13'] != null ? doneResult.answers['13'] : doneResult.answers[13]);
      if (Array.isArray(raw)) contacts = raw.filter(c => c && (c.name || c.surname || c.phone));
      const multi = rf.multi || {};
      if (contacts.length) {
        st.refs = contacts.map((c, i) => {
          const filled = !!(multi[i] && multi[i].answers && Object.keys(multi[i].answers).length);
          const r = { i, contact: c, done: filled };
          if (filled) { const an = air.referencesAnalysis(multi[i].answers, lang); r.verdict = an.verdict; r.tone = an.tone; }
          return r;
        });
        st.done = st.refs.every(r => r.done);
        const filled = st.refs.filter(r => r.done);
        if (filled.length) {
          st.suggested = !filled.some(r => r.tone === 'low');
          st.analysis = { verdict: filled.map(r => r.verdict).join(' · '),
            tone: st.suggested ? 'good' : 'low',
            notes: st.refs.map(r => `${((r.contact.name || '') + ' ' + (r.contact.surname || '')).trim()}${r.contact.position ? ' (' + r.contact.position + ')' : ''}: ${r.done ? r.verdict : '—'}`) };
        }
        st.passed = gates[key] !== undefined ? gates[key] : (st.done ? (st.suggested !== false) : null);
      } else {
        st.done = !!(rf.answers && Object.keys(rf.answers).length);
        if (st.done) st.analysis = air.referencesAnalysis(rf.answers, lang);
        st.passed = gates[key] !== undefined ? gates[key] : (st.done ? (st.analysis && st.analysis.tone !== 'low') : null);
      }
    }
    return st;
  });
  let decision = wf.decision || null;
  const gateState = {}; stages.forEach(s => { gateState[s.key] = { passed: s.passed, status: s.status || (s.done ? 'done' : 'none') }; });
  // Критерии отбора вакансии: некритичный провал не даёт отказ и не стопорит процесс
  const critical = proc ? proc.critical : null;
  const isCrit = k => !critical || critical[k] !== false;
  // Пропущенные рекрутёром этапы не участвуют в авторешении и не стопорят процесс
  const auto = air.workflowDecision(gateState, cfgStages.filter(k => !skipped[k]), lang, critical);
  if (!decision && auto.decision === 'rejected') decision = 'rejected';
  // Необязательные оценки после Tools: IQ (Логис) и Продажи (Sales) —
  // показываем включённые в процессе вакансии и те, что уже отправляли по факту
  const optional = ['logic', 'sales'].filter(key =>
    (proc && proc.optional[key]) || tests.some(t => t.type === key) || !vac).map(key => {
    const t = tests.filter(x => x.type === key).sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''))[0];
    const o = { key, title: OPT_TITLE[key][lang] || OPT_TITLE[key].ru, status: t ? t.status : 'none', testId: t ? t.id : null, testCode: t ? t.code : null, skipped: !!skipped['opt:' + key] };
    if (t && t.status === 'done') {
      const r = localizeResult(computeResult(t), key, lang);
      if (key === 'logic') o.analysis = { verdict: 'IQ ' + r.iq + ' · ' + r.level, notes: [] };
      else { const h = ai.salesHint(r, lang); o.analysis = { verdict: h.verdict, notes: h.notes }; }
    }
    return o;
  });
  // Канбан-колонка: ручной оверрайд или авто по прохождению этапов
  let column;
  if (wf.column) column = wf.column;
  else if (decision === 'hired') column = 'hired';
  else if (decision === 'rejected' || stages.some(s => s.passed === false && !s.skipped && isCrit(s.key))) column = 'rejected';
  else {
    // некритично проваленный этап не держит кандидата — идём к следующему шагу
    const firstUndone = stages.find(s => !s.skipped && s.passed !== true && !(s.passed === false && !isCrit(s.key)));
    const anyActivity = stages.some(s => (s.status && s.status !== 'none') || s.done);
    column = !firstUndone ? 'hired' : (!anyActivity ? 'new' : firstUndone.key);
  }
  return { stages, decision, autoDecision: auto, column, optional };
}
app.get('/api/participants/:id/workflow', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  const lang = pickLang(req);
  const wf = buildWorkflow(p, lang);
  res.json({ participant: participantView(p), stages: wf.stages, decision: wf.decision,
    autoDecision: wf.autoDecision, column: wf.column, columnTitle: kanbanColTitle(wf.column, lang), optional: wf.optional,
    interviews: (p.workflow && p.workflow.interviews) || [] });
});
// Глобальный список кандидатов (страница «Кандидаты») — куда попадают отклики с объявлений
app.get('/api/candidates', requireAuth, (req, res) => {
  const data = db(); const lang = pickLang(req);
  const parts = data.participants.filter(p => p.userId === req.user.id)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const list = parts.map(p => {
    const wf = buildWorkflow(p, lang);
    const vac = data.vacancies.find(v => v.id === p.vacancyId);
    const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email;
    return { id: p.id, name: nm, email: p.email, tel: p.tel || '', city: p.city || '',
      vacancyId: p.vacancyId || null, vacancyName: vac ? vac.name : '', column: wf.column,
      columnTitle: kanbanColTitle(wf.column, lang), decision: wf.decision, createdAt: p.createdAt,
      testsDone: data.tests.filter(t => t.participantId === p.id && t.status === 'done').length, cv: p.cv || null };
  });
  res.json({ candidates: list });
});
// Установить канбан-колонку вручную
const KANBAN_COLS = ['new', ...recruit.STAGE_KEYS, 'hired', 'rejected'];
app.post('/api/participants/:id/column', requireAuth, (req, res) => {
  const p = db().participants.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!p) return res.status(404).json({ error: 'Не найдено' });
  p.workflow = p.workflow || {};
  const col = req.body && req.body.column;
  // Разрешены базовые колонки + динамические: opt:logic / opt:sales и knowledge:<id теста>
  const validCol = c => KANBAN_COLS.includes(c) || /^opt:(logic|sales)$/.test(c) || /^knowledge:[\w-]+$/.test(c);
  if (col === null || col === 'auto') { delete p.workflow.column; }
  else if (typeof col === 'string' && validCol(col)) {
    p.workflow.column = col;
    if (col === 'hired') p.workflow.decision = 'hired';
    else if (col === 'rejected') p.workflow.decision = 'rejected';
    else if (p.workflow.decision) p.workflow.decision = null; // вернули в работу
  } else return res.status(400).json({ error: 'Неверная колонка' });
  save(); res.json({ ok: true });
});
// Доска/дашборд вакансии: воронка + канбан-кандидаты
app.get('/api/vacancies/:id/board', requireAuth, (req, res) => {
  const data = db();
  const v = data.vacancies.find(x => x.id === req.params.id && x.userId === req.user.id);
  if (!v) return res.status(404).json({ error: 'Не найдено' });
  const lang = pickLang(req);
  const parts = data.participants.filter(p => p.vacancyId === v.id && p.userId === req.user.id);
  // Динамические колонки: несколько тестов знаний → колонка на каждый тест;
  // Логис/Сэйлс появляются в ряду, только если такой тест хоть раз отправляли по этой вакансии
  const kts = knowledgeTestsOf(v);
  const multiKn = kts.length > 1;
  const proc = processOf(v);
  const partIds = new Set(parts.map(p => p.id));
  const hasOpt = key => proc.optional[key] || data.tests.some(t => partIds.has(t.participantId) && t.type === key);
  let colKeys = KANBAN_COLS.filter(k => !recruit.STAGE_KEYS.includes(k) || proc.stages[k] !== false);
  if (multiKn) colKeys = colKeys.flatMap(k => k === 'knowledge' ? kts.map(kt => 'knowledge:' + kt.id) : [k]);
  const optCols = ['logic', 'sales'].filter(hasOpt).map(k => 'opt:' + k);
  if (optCols.length && colKeys.includes('tools')) colKeys.splice(colKeys.indexOf('tools') + 1, 0, ...optCols);
  const cards = parts.map(p => {
    const wf = buildWorkflow(p, lang);
    const nm = ((p.name || '') + ' ' + (p.surname || '')).trim() || p.email;
    let column = wf.column;
    // уточняем колонку «Проверка знаний» до конкретного теста: первый несданный
    if (multiKn && column === 'knowledge') {
      const st = wf.stages.find(s => s.key === 'knowledge');
      const items = (st && st.items) || [];
      const it = items.find(x => !(x.status === 'done' && x.pass)) || items[items.length - 1];
      if (it) column = 'knowledge:' + it.ktId;
    }
    // все обязательные этапы пройдены, но идёт необязательный тест — показываем его колонку
    if (column === 'hired' && !wf.decision) {
      const pend = (wf.optional || []).find(o => !o.skipped && o.status !== 'none' && o.status !== 'done' && colKeys.includes('opt:' + o.key));
      if (pend) column = 'opt:' + pend.key;
    }
    // ручной оверрайд мог остаться от удалённого теста — возвращаем в ближайшую базовую колонку
    if (!colKeys.includes(column)) column = column.startsWith('knowledge') ? (multiKn ? 'knowledge:' + kts[0].id : 'knowledge') : column.startsWith('opt:') ? 'tools' : 'new';
    return { id: p.id, name: nm, email: p.email, tel: p.tel || '', city: p.city || '', cv: p.cv || null,
      column, decision: wf.decision,
      stages: wf.stages.map(s => ({ key: s.key, title: s.title, status: s.status || (s.done ? 'done' : 'none'), passed: s.passed })) };
  });
  // Воронка: найдено → прошли Result → Tools → знания → мотивация → референсы → найм
  const passedCount = key => cards.filter(c => (c.stages.find(s => s.key === key) || {}).passed === true).length;
  const FOUND_LBL = { ru: 'Найдено', pl: 'Znalezieni', en: 'Found' };
  const funnel = [
    { key: 'found', label: FOUND_LBL[lang] || FOUND_LBL.ru, count: cards.length },
    ...recruit.STAGE_KEYS.filter(k => proc.stages[k] !== false).map(k => ({ key: k, label: recruit.stageTitle(k, lang), count: passedCount(k) })),
    { key: 'hired', label: kanbanColTitle('hired', lang), count: cards.filter(c => c.column === 'hired').length },
  ];
  const columns = colKeys.map(key => ({ key,
    title: key.startsWith('knowledge:') ? ((kts.find(kt => 'knowledge:' + kt.id === key) || {}).name || kanbanColTitle('knowledge', lang)) : kanbanColTitle(key, lang) }));
  res.json({ vacancy: vacFull(v), cards, funnel, columns });
});
function kanbanColTitle(key, lang) {
  const M = {
    new: { ru: 'Новые', pl: 'Nowi', en: 'New' },
    hired: { ru: 'Найм', pl: 'Zatrudnienie', en: 'Hired' },
    rejected: { ru: 'Отказ', pl: 'Odmowa', en: 'Rejected' },
  };
  key = String(key || '');
  if (M[key]) return M[key][lang] || M[key].ru;
  if (key.startsWith('opt:')) { const o = OPT_TITLE[key.slice(4)]; if (o) return o[lang] || o.ru; }
  if (key.startsWith('knowledge:')) return recruit.stageTitle('knowledge', lang);
  return recruit.stageTitle(key, lang);
}

// ---------- STATIC / PAGES ----------
const PUB = path.join(__dirname, 'public');
app.use(express.static(PUB, { index: false, etag: false, setHeaders: (res, p) => { if (/\.(js|css|html)$/.test(p)) res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); } }));

app.get('/t/:code', (req, res) => res.sendFile(path.join(PUB, 'take.html')));
app.get('/r/:id', (req, res) => res.sendFile(path.join(PUB, 'report-public.html')));
app.get('/a/:slug', (req, res) => res.sendFile(path.join(PUB, 'anketa.html')));

// ---------- Публичный фид вакансий (стандарт JobPosting) для агрегаторов ----------
function xmlEsc(s) { return String(s == null ? '' : s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])); }
// Вакансии компании, опубликованные (есть анкета) — с текстом объявления и ссылкой на отклик
function feedJobsOf(user) {
  const data = db();
  return data.vacancies.filter(v => v.userId === user.id && v.published).map(v => {
    const ank = data.anketas.find(a => a.userId === user.id && a.vacancyId === v.id);
    return { v, url: ank ? `${BASE_URL}/a/${ank.slug}` : `${BASE_URL}/a/`, desc: v.adText || v.name };
  }).filter(j => j.url);
}
// Indeed-совместимый XML-фид
app.get('/feed/:token/jobs.xml', (req, res) => {
  const user = db().users.find(u => u.feedToken === req.params.token);
  if (!user) return res.status(404).send('Not found');
  const jobs = feedJobsOf(user);
  const items = jobs.map(j => `  <job>
    <title><![CDATA[${j.v.name}]]></title>
    <date><![CDATA[${j.v.createdAt || nowISO()}]]></date>
    <referencenumber><![CDATA[${j.v.id}]]></referencenumber>
    <url><![CDATA[${j.url}]]></url>
    <company><![CDATA[${user.company || ''}]]></company>
    <city><![CDATA[]]></city>
    <country><![CDATA[PL]]></country>
    <description><![CDATA[${j.desc}]]></description>
  </job>`).join('\n');
  res.set('Content-Type', 'application/xml; charset=utf-8').send(`<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher><![CDATA[${user.company || 'HR PRO AI'}]]></publisher>
  <publisherurl><![CDATA[${BASE_URL}]]></publisherurl>
  <lastBuildDate><![CDATA[${nowISO()}]]></lastBuildDate>
${items}
</source>`);
});
// JSON-LD JobPosting одной вакансии (для Google for Jobs — встраивается на странице анкеты)
app.get('/api/a/:slug/jsonld', (req, res) => {
  const a = db().anketas.find(x => x.slug === req.params.slug);
  if (!a) return res.status(404).json({});
  const data = db();
  const v = data.vacancies.find(x => x.id === a.vacancyId);
  const u = data.users.find(x => x.id === a.userId);
  if (!v) return res.json({});
  res.json({
    '@context': 'https://schema.org/', '@type': 'JobPosting',
    title: v.name, description: v.adText || v.name,
    datePosted: (v.createdAt || nowISO()).slice(0, 10),
    hiringOrganization: { '@type': 'Organization', name: (u && u.company) || 'HR PRO AI', logo: (u && u.settings && u.settings.logo) || undefined },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'PL' } },
    directApply: true, url: `${BASE_URL}/a/${a.slug}`,
  });
});
app.get('/req/:code', (req, res) => res.sendFile(path.join(PUB, 'req.html')));
app.get('/new-req/:code', (req, res) => res.sendFile(path.join(PUB, 'req.html')));
app.get('/login', (req, res) => res.sendFile(path.join(PUB, 'login.html')));
app.get(['/guide', '/guide/:slug'], (req, res) => res.sendFile(path.join(PUB, 'guide.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUB, 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(PUB, 'terms.html')));
// Одно-кликовая отписка от писем
app.get('/unsubscribe', (req, res) => {
  const lang = ['ru', 'pl', 'en'].includes(req.query.lang) ? req.query.lang : 'ru';
  const T = {
    ru: { ok: 'Вы отписаны', okSub: 'Вы больше не будете получать письма о подборе на этот адрес.', bad: 'Ссылка недействительна', badSub: 'Не удалось подтвердить отписку. Возможно, ссылка устарела.', home: 'На главную' },
    pl: { ok: 'Wypisano', okSub: 'Nie będziesz już otrzymywać wiadomości rekrutacyjnych na ten adres.', bad: 'Nieprawidłowy link', badSub: 'Nie udało się potwierdzić wypisania. Link mógł wygasnąć.', home: 'Strona główna' },
    en: { ok: 'You are unsubscribed', okSub: 'You will no longer receive hiring emails at this address.', bad: 'Invalid link', badSub: 'We could not confirm the unsubscribe. The link may have expired.', home: 'Home' },
  }[lang];
  let email = '';
  try { email = Buffer.from(String(req.query.e || ''), 'base64url').toString('utf8'); } catch (_) {}
  const valid = email && req.query.t && req.query.t === unsubToken(email);
  if (valid) addUnsubscribe(email);
  const t = valid ? T : T;
  const title = valid ? T.ok : T.bad, sub = valid ? T.okSub : T.badSub, icon = valid ? '#43e0a0' : '#e0555b';
  res.set('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — HR PRO AI</title>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><meta name="theme-color" content="#070813"></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(ellipse 90% 60% at 50% -10%,#12132b,#070813 60%);font-family:Inter,system-ui,sans-serif;color:#9aa3bf">
<div style="max-width:440px;text-align:center;padding:40px 28px">
  <div style="width:60px;height:60px;margin:0 auto 22px;border-radius:16px;display:grid;place-items:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="${icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${valid ? '<path d="M5 12l4 4 10-11"/>' : '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>'}</svg></div>
  <h1 style="font-family:Manrope,sans-serif;font-weight:800;font-size:24px;color:#fff;margin:0 0 10px">${title}</h1>
  <p style="font-size:14.5px;line-height:1.6;margin:0 0 26px">${sub}</p>
  <a href="${BASE_URL}/" style="display:inline-block;font-family:Manrope,sans-serif;font-weight:700;font-size:14px;color:#fff;padding:12px 26px;border-radius:12px;background:linear-gradient(135deg,#8b6cff,#6f97ff);text-decoration:none">${T.home}</a>
</div></body></html>`);
});
// Админ-панель: только для role=admin (не-админ → в кабинет, гость → на логин)
app.get('/admin', (req, res) => {
  const u = currentUser(req);
  if (!u) return res.redirect('/login?next=/admin');
  if (u.role !== 'admin') return res.redirect('/app');
  res.sendFile(path.join(PUB, 'admin.html'));
});
app.get('/', (req, res) => res.sendFile(path.join(PUB, 'landing.html')));
app.get(['/app', '/app/*', '/dashboard', '/home', '/vacancies', '/balance', '/search', '/education', '/anketas', '/anketas/*', '/settings', '/faq', '/instruct', '/result/:id'], (req, res) =>
  res.sendFile(path.join(PUB, 'index.html')));

// ---------- АДМИН-API (src/admin.js) ----------
require('./src/admin')(app, {
  db, save, uid, nowISO, requireAuth, requireAdmin, publicUser, ensureSettings, defaultSettings,
  portalSettings, applyPortalEnv, portalPlans, activePlans, initStripe, getStripe: () => stripe, stripeKey,
  logAdmin, logBalance, _ensureLots, addBalanceLot, spendLots, expireBalance, hashPassword, integ, recruit,
  DEFAULT_TEMPLATES, DEFAULT_SMS, DEFAULT_MAIL, cleanMailTemplates,
  MAIL_SEND_ITEMS, MAIL_STATUS_ITEMS, MAIL_LANGS, TEST_NAMES, LANGS, TEST_TYPES, testTitleOf,
  getBaseUrl: () => BASE_URL, SECRET, PORT, ENV_BASE_URL,
});

// Стартовая инициализация: применить глобальные настройки и назначить первого админа из env
applyPortalEnv();
if (process.env.ADMIN_EMAIL) {
  const au = db().users.find(u => u.email.toLowerCase() === String(process.env.ADMIN_EMAIL).toLowerCase());
  if (au && au.role !== 'admin') { au.role = 'admin'; save(); console.log(`  ADMIN_EMAIL: ${au.email} назначен администратором`); }
}

app.listen(PORT, () => {
  console.log(`\n  HR AI Pro запущен: ${BASE_URL}`);
  console.log(`  Вопросов Тулс загружено: ${OCA_QUESTIONS.length}/200\n`);
  try { sweepExpiries(); } catch (_) {}
});
// ежедневно сжигаем просроченные тесты (срок 1 год с пополнения)
setInterval(() => { try { sweepExpiries(); } catch (_) {} }, 24 * 3600e3);
