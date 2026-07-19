// Переносит активные (Development) OAuth-ключи видеосервисов из integrations.config.json
// в настройки портала Supabase (строка settings id=portal → data.videoOAuth[platform]),
// чтобы edge/прод-воркер видел их. Секреты в git не попадают (конфиг gitignored).
// Запуск: node scripts/set-portal-video-oauth.js
const fs = require('fs');
const path = require('path');
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'integrations.config.json'), 'utf8'));
const BASE = cfg.supabase.url.replace(/\/$/, '');
const KEY = cfg.supabase.secretKey;
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'User-Agent': 'curl/8.0' };

(async () => {
  const vo = cfg.videoOAuth || {};
  const clean = {};
  for (const plat of ['zoom', 'google', 'teams']) {
    const v = vo[plat];
    if (v && v.clientId && v.clientSecret) clean[plat] = { clientId: v.clientId, clientSecret: v.clientSecret };
  }
  if (!Object.keys(clean).length) { console.log('Нет активных ключей в videoOAuth — нечего заливать.'); return; }

  const r = await fetch(`${BASE}/rest/v1/settings?id=eq.portal&select=data`, { headers: H });
  const rows = await r.json();
  const data = (rows[0] && rows[0].data) || {};
  data.videoOAuth = Object.assign({}, data.videoOAuth || {}, clean);

  const up = await fetch(`${BASE}/rest/v1/settings`, {
    method: 'POST',
    headers: Object.assign({}, H, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify([{ id: 'portal', data }]),
  });
  if (!up.ok) throw new Error(up.status + ' ' + (await up.text()).slice(0, 300));
  console.log('Залито в портал:', Object.keys(clean).join(', '));
})().catch(e => { console.error('Ошибка:', e.message); process.exit(1); });
