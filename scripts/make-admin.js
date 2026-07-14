'use strict';
// Назначает пользователя администратором портала: node scripts/make-admin.js <email>
// Снять роль: node scripts/make-admin.js <email> --revoke
const path = require('path');
const fs = require('fs');

const email = process.argv[2];
const revoke = process.argv.includes('--revoke');
if (!email) { console.error('Использование: node scripts/make-admin.js <email> [--revoke]'); process.exit(1); }

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');
if (!fs.existsSync(DB_FILE)) { console.error('База не найдена: ' + DB_FILE); process.exit(1); }
const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const user = (data.users || []).find(u => String(u.email).toLowerCase() === String(email).toLowerCase());
if (!user) { console.error('Пользователь не найден: ' + email); process.exit(1); }

if (revoke) {
  const admins = (data.users || []).filter(u => u.role === 'admin');
  if (user.role === 'admin' && admins.length <= 1) { console.error('Нельзя снять роль у последнего администратора'); process.exit(1); }
  user.role = 'user';
} else {
  user.role = 'admin';
  user.blocked = false;
}
const tmp = DB_FILE + '.tmp';
fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
fs.renameSync(tmp, DB_FILE);
console.log(`${user.email}: role = ${user.role}. Перезапустите сервер, если он был запущен.`);
