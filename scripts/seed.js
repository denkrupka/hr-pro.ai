'use strict';
// Пересоздаёт data/db.json с чистыми демо-данными (корректный UTF-8).
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../src/auth');
const crypto = require('crypto');
const uid = (n = 12) => crypto.randomBytes(16).toString('base64url').slice(0, n);
const code = (n = 10) => crypto.randomBytes(12).toString('base64url').replace(/[-_]/g, '').slice(0, n);
const iso = (daysAgo = 0, h = 12, m = 0) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(h, m, 0, 0); return d.toISOString(); };

const OCA_Q = require('../data/oca-questions.json');

const user = {
  id: uid(), email: 'demo@hraipro.io', password: hashPassword('demo1234'),
  name: 'Денис', company: 'HR PRO AI', balanceTotal: 200, balancePending: 0, createdAt: iso(30),
};

const sections = [
  { id: uid(10), userId: user.id, name: 'Продажи', order: 0, createdAt: iso(30) },
  { id: uid(10), userId: user.id, name: 'Офис', order: 1, createdAt: iso(30) },
];
const vacNames = ['Менеджер по продажам', 'HR-специалист', 'Kierownik robót', 'Handlowiec B2B', 'ДЕМО'];
const vacLang = ['ru', 'ru', 'pl', 'en', 'ru'];
const vacSec = [0, 1, 0, 0, null];
const vacancies = vacNames.map((n, i) => ({ id: uid(10), userId: user.id,
  sectionId: vacSec[i] != null ? sections[vacSec[i]].id : null, name: n, lang: vacLang[i] || 'ru', order: i, createdAt: iso(30) }));

// генератор осмысленных ответов OCA под заданный «профиль» (склонность к +)
function ocaAnswers(bias) {
  const a = {};
  for (let i = 1; i <= 200; i++) {
    const r = Math.random();
    if (r < bias) a[i] = '+'; else if (r < bias + 0.22) a[i] = 'M'; else a[i] = '-';
  }
  return a;
}

const resultAnswersWinner = {
  1: 'Да, полностью', 2: 'Любая работа создаёт ценность, а оплата — это оплата за произведённый продукт.',
  3: 'Руководитель отдела продаж', 4: '3 года', 5: 'Мой продукт — закрытые сделки и выручка компании.',
  6: 'Да', 7: 'В среднем 25 сделок в месяц, что выше нормы отдела в 18.',
  8: 'Мои результаты стабильно в топ-3 по компании.', 9: 'Рос — мне доверяли всё больше направлений.',
  10: 'Рос постоянно, вместе с зоной ответственности.', 11: 'Да', 12: 'Выше',
  13: 'Анна Ковальская, коммерческий директор', 14: 'Результат и рост дохода команды.',
  15: 'Возможность влиять на результат и развиваться.', 16: 'Я приношу выручку, компания даёт рост и доход.',
  17: 'С нуля построил отдел продаж из 8 человек и вывел его на план за полгода.', 18: 'Нет',
};
const resultAnswersWaiter = {
  1: 'Скорее да', 2: 'Наверное, у каждого есть какие-то обязанности.',
  3: 'Оператор', 4: '1 год', 5: 'Выполнял задачи, которые давали.',
  6: 'Нет', 7: 'Точно не считал.', 8: 'Не сравнивал.', 9: 'Особо не менялся.',
  10: 'Примерно одинаково.', 11: 'Нет', 12: 'На уровне плана',
  13: 'Не помню точно', 14: 'Зарплата.', 15: 'Стабильность.', 16: 'Я работаю — мне платят.',
  17: 'Ничего особенного не выделю.', 18: 'Нет',
};

const LOGIC = require('../data/logic-test.json');
const SALES = require('../data/sales-test.json');
function logicAnswers(correctRatio) {
  const a = {};
  for (const q of LOGIC.questions) {
    a[q.id] = Math.random() < correctRatio ? q.answer : (q.answer + 1) % q.options.length;
  }
  return a;
}
function salesAnswers(positivity) {
  const a = {};
  for (const q of SALES.questions) {
    const r = Math.random();
    a[q.id] = r < positivity ? 0 : (r < positivity + 0.25 ? 1 : 2); // Да / Иногда / Нет
  }
  return a;
}

const people = [
  { name: 'Агнешка', surname: 'Ковальская', sex: 'Женский', age: 47, tel: '+48 602 785 588', city: 'Oborniki', vac: 0, tests: ['tools', 'result'], bias: 0.5, res: 'winner', dur: 1532, stage: 'Собеседование' },
  { name: 'Наталья', surname: 'Штефан', sex: 'Женский', age: 44, tel: '+48 570 724 986', city: 'Swarzędz', vac: 1, tests: ['result', 'tools'], bias: 0.42, res: 'winner', dur: 936, stage: 'Принят', star: true },
  { name: 'Bartosz', surname: 'Michalak', sex: 'Мужской', age: 48, tel: '+48 853 079 922', city: 'Poznań', vac: 3, tests: ['tools', 'logic'], bias: 0.33, res: 'waiter', dur: 1120, stage: 'Резерв' },
  { name: 'Tetiana', surname: 'Kriierenko', sex: 'Женский', age: 19, tel: '+48 873 029 657', city: 'Poznań', vac: 2, tests: ['logic', 'result'], bias: 0.4, res: 'waiter', dur: 640, stage: 'Отказ' },
  { name: 'Алёна', surname: 'Шарапова', sex: 'Женский', age: 41, tel: '+48 794 119 256', city: 'Poznań', vac: 1, tests: ['tools', 'result', 'logic', 'sales'], bias: 0.47, res: 'winner', dur: 1420, stage: 'Собеседование' },
  { name: 'Oleksandr', surname: 'Lavreniuk', sex: 'Мужской', age: 19, tel: '+48 866 432 937', city: 'Poznań', vac: 3, tests: ['tools', 'sales'], bias: 0.3, res: 'waiter', dur: 980, stage: 'Новый' },
];

const participants = [], tests = [];
people.forEach((pr, i) => {
  const pid = uid();
  participants.push({
    id: pid, userId: user.id, vacancyId: vacancies[pr.vac].id, name: pr.name, surname: pr.surname,
    email: `${pr.surname.toLowerCase()}@example.com`, sex: pr.sex, age: pr.age, tel: pr.tel, city: pr.city,
    stage: pr.stage || 'Без этапа', comment: '', color: '#FFFFFF', starred: !!pr.star, createdAt: iso(20 - i, 12, i * 7),
  });
  pr.tests.forEach((tp, j) => {
    let answers = {}, times = {}, ratings = {}, overallRate = null;
    if (tp === 'tools') answers = ocaAnswers(pr.bias);
    else if (tp === 'result') {
      answers = pr.res === 'winner' ? { ...resultAnswersWinner } : { ...resultAnswersWaiter };
      Object.keys(answers).forEach(q => { times[q] = 10 + Math.floor(Math.random() * 90); });
      const base = pr.res === 'winner' ? 4 : 2;
      [1, 2, 3, 5, 7, 12, 17].forEach(q => ratings[q] = Math.min(5, base + (Math.random() < 0.5 ? 1 : 0)));
      overallRate = pr.res === 'winner' ? 5 : 3;
    } else if (tp === 'logic') answers = logicAnswers(pr.res === 'winner' ? 0.85 : 0.55);
    else if (tp === 'sales') answers = salesAnswers(pr.res === 'winner' ? 0.7 : 0.4);
    const started = iso(20 - i, 12, i * 7 + 1);
    const finished = new Date(new Date(started).getTime() + pr.dur * 1000).toISOString();
    tests.push({
      id: uid(), participantId: pid, userId: user.id, type: tp, status: 'done', code: code(10),
      sentAt: iso(20 - i, 11, i * 7), startedAt: started, finishedAt: finished, durationSec: pr.dur,
      answers, times, result: null, ratings, overallRate, publicShare: false, balancePending: true,
    });
  });
});

const db = { users: [user], sections, vacancies, participants, tests };
const out = path.join(__dirname, '..', 'data', 'db.json');
fs.writeFileSync(out, JSON.stringify(db, null, 2));
console.log('Seed готов:', out);
console.log('Логин: demo@hraipro.io / demo1234');
console.log('Кандидатов:', participants.length, '| Тестов:', tests.length, '| Вопросов OCA:', OCA_Q.length);
