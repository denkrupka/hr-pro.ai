'use strict';
// Разовая миграция data/db.json → Supabase Postgres (таблицы id + data JSONB).
// Запуск: node scripts/migrate-to-supabase.js
const fs = require('fs');
const path = require('path');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integrations.config.json'), 'utf8')).supabase;
const BASE = cfg.url.replace(/\/$/, '');
const KEY = cfg.secretKey;
const db = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8'));

// коллекция JSON → таблица Postgres
const MAP = {
  users: 'users', sections: 'sections', vacancies: 'vacancies', anketas: 'anketas',
  participants: 'participants', tests: 'tests', purchases: 'purchases',
  requisitions: 'requisitions', balanceLog: 'balance_log', adminLog: 'admin_log',
};

async function upsert(table, rows) {
  if (!rows.length) return { table, count: 0 };
  const CHUNK = 50;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const r = await fetch(`${BASE}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: KEY, Authorization: 'Bearer ' + KEY,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
        'User-Agent': 'curl/8.0',
      },
      body: JSON.stringify(batch),
    });
    if (!r.ok) throw new Error(`${table} [${i}]: ${r.status} ${(await r.text()).slice(0, 300)}`);
    done += batch.length;
  }
  return { table, count: done };
}

(async () => {
  // коллекции-массивы → {id, data:<весь объект>}
  for (const [coll, table] of Object.entries(MAP)) {
    const arr = Array.isArray(db[coll]) ? db[coll] : [];
    const rows = arr.filter(x => x && x.id).map(x => ({ id: x.id, data: x }));
    const res = await upsert(table, rows);
    console.log(`  ${res.table.padEnd(14)} ${res.count}`);
  }
  // settings — единственный объект
  if (db.settings && typeof db.settings === 'object') {
    await upsert('settings', [{ id: 'portal', data: db.settings }]);
    console.log(`  settings       1`);
  }
  console.log('Миграция завершена.');
})().catch(e => { console.error('ОШИБКА:', e.message); process.exit(1); });
