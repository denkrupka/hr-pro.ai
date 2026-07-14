'use strict';
// Edge-адаптер БД: заменяет файловый src/db.js.
// Стратегия — предзагрузка всех коллекций из Supabase в память на время запроса,
// синхронный db() как раньше, а flush() в конце запроса upsert-ит изменённое.
// Так весь server.js/admin.js работает без переписывания каждого маршрута.

let SUPA_URL = '';
let SUPA_KEY = '';
let cache = null;                 // { users:[...], ... , settings:{...} }
const dirty = new Set();          // какие коллекции менялись → флашим

const COLL_TABLE = {
  users: 'users', sections: 'sections', vacancies: 'vacancies', anketas: 'anketas',
  participants: 'participants', tests: 'tests', purchases: 'purchases',
  requisitions: 'requisitions', balanceLog: 'balance_log', adminLog: 'admin_log',
};
const ARRAY_COLLS = Object.keys(COLL_TABLE);

function crypto_() { return globalThis.crypto; }
function uid(n = 10) {
  const b = new Uint8Array(16); crypto_().getRandomValues(b);
  return b64url(b).slice(0, n);
}
function shortCode(n = 8) {
  const b = new Uint8Array(12); crypto_().getRandomValues(b);
  return b64url(b).replace(/[-_]/g, '').slice(0, n);
}
function b64url(bytes) {
  let s = ''; for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function nowISO() { return new Date().toISOString(); }

async function sreq(pathAndQuery, opts = {}) {
  const r = await fetch(`${SUPA_URL}/rest/v1/${pathAndQuery}`, {
    ...opts,
    headers: {
      apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY,
      'Content-Type': 'application/json', 'User-Agent': 'hrpro-edge', ...(opts.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`supabase ${pathAndQuery}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r;
}

// Загрузить всю БД в память (один раз на запрос)
async function loadAll(env) {
  SUPA_URL = env.SUPABASE_URL.replace(/\/$/, '');
  SUPA_KEY = env.SUPABASE_SECRET_KEY;
  cache = {};
  await Promise.all(ARRAY_COLLS.map(async coll => {
    const rows = await (await sreq(`${COLL_TABLE[coll]}?select=data`)).json();
    cache[coll] = rows.map(r => r.data);
  }));
  const st = await (await sreq(`settings?select=data&id=eq.portal`)).json();
  cache.settings = (st[0] && st[0].data) || {};
  dirty.clear();
  return cache;
}

function db() { return cache; }

// Пометить коллекции как изменённые. server.js вызывает save() без аргументов —
// поэтому по умолчанию флашим ВСЁ (безопасно, объём небольшой). Для точечности
// можно markDirty(coll).
function markDirty(coll) { dirty.add(coll); }
function save() { for (const c of Object.keys(COLL_TABLE)) dirty.add(c); dirty.add('settings'); }

// Записать изменённые коллекции обратно в Supabase (upsert по id).
async function flush() {
  if (!cache) return;
  const jobs = [];
  for (const coll of dirty) {
    if (coll === 'settings') {
      jobs.push(sreq('settings', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{ id: 'portal', data: cache.settings || {} }]),
      }));
      continue;
    }
    const table = COLL_TABLE[coll];
    if (!table) continue;
    const rows = (cache[coll] || []).filter(x => x && x.id).map(x => ({ id: x.id, data: x }));
    // upsert существующих/новых
    for (let i = 0; i < rows.length; i += 100) {
      jobs.push(sreq(table, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows.slice(i, i + 100)),
      }));
    }
  }
  await Promise.all(jobs);
  dirty.clear();
}

// Удаление строк (server.js фильтрует массивы; нам нужно физически удалить из БД).
// Собираем id, которые были в БД, но исчезли из cache, и DELETE их.
let snapshotIds = {};
function snapshot() {
  snapshotIds = {};
  for (const coll of ARRAY_COLLS) snapshotIds[coll] = new Set((cache[coll] || []).map(x => x.id));
}
async function flushDeletes() {
  const jobs = [];
  for (const coll of ARRAY_COLLS) {
    const now = new Set((cache[coll] || []).map(x => x.id));
    const removed = [...(snapshotIds[coll] || [])].filter(id => !now.has(id));
    if (removed.length) {
      const inList = removed.map(id => `"${id.replace(/"/g, '')}"`).join(',');
      jobs.push(sreq(`${COLL_TABLE[coll]}?id=in.(${inList})`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }));
    }
  }
  if (jobs.length) await Promise.all(jobs);
}

module.exports = { loadAll, db, save, markDirty, flush, flushDeletes, snapshot, uid, shortCode, nowISO };
