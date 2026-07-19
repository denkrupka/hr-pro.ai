'use strict';
// Интеграции видеосвязи (Node). Модель — OAuth «Подключить аккаунт»: владелец портала
// один раз регистрирует по одному приложению на каждой платформе (client_id/secret хранятся
// на уровне портала), а клиент просто проходит авторизацию своим аккаунтом. Токены клиента
// (access/refresh) лежат в settings.videoIntegrations[platform].oauth и обновляются автоматически.
// Логика идентична edge-версии (edge/video-integrations-edge.js).
const crypto = require('crypto');

// ── Метаданные платформ ─────────────────────────────────────────────────────
const P = {
  zoom: {
    name: 'Zoom',
    authUrl: 'https://zoom.us/oauth/authorize',
    tokenUrl: 'https://zoom.us/oauth/token',
    scope: '',                    // scope настраивается в самом приложении Zoom (meeting:write)
    basicAuth: true,              // обмен кода — Basic client_id:client_secret
  },
  google: {
    name: 'Google Meet',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email https://www.googleapis.com/auth/calendar.events',
    extraAuth: { access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true' },
  },
  teams: {
    name: 'Microsoft Teams',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'offline_access openid email User.Read OnlineMeetings.ReadWrite',
    extraAuth: { response_mode: 'query' },
  },
};

// ── Подпись state (CSRF + восстановление клиента в callback) ─────────────────
function b64u(buf) { return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function makeVState(secret, userId, platform) {
  const rnd = b64u(crypto.randomBytes(12));
  const payload = [rnd, userId, platform].join('~');
  const mac = b64u(crypto.createHmac('sha256', secret || 'dev').update(payload).digest());
  return payload + '~' + mac;
}
function readVState(secret, state) {
  if (!state) return null;
  const parts = String(state).split('~');
  if (parts.length !== 4) return null;
  const payload = parts.slice(0, 3).join('~');
  const mac = b64u(crypto.createHmac('sha256', secret || 'dev').update(payload).digest());
  if (mac !== parts[3]) return null;
  return { userId: parts[1], platform: parts[2] };
}

// ── OAuth: URL авторизации / обмен кода / обновление токена ──────────────────
function authorizeUrl(platform, app, redirectUri, state) {
  const meta = P[platform]; if (!meta) throw new Error('Платформа не поддерживается');
  const q = new URLSearchParams({ client_id: app.clientId, redirect_uri: redirectUri, response_type: 'code', state });
  if (meta.scope) q.set('scope', meta.scope);
  Object.entries(meta.extraAuth || {}).forEach(([k, v]) => q.set(k, v));
  return meta.authUrl + '?' + q.toString();
}
async function exchangeCode(platform, app, redirectUri, code) {
  const meta = P[platform]; if (!meta) throw new Error('Платформа не поддерживается');
  const body = new URLSearchParams({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (meta.basicAuth) headers.Authorization = 'Basic ' + Buffer.from(app.clientId + ':' + app.clientSecret).toString('base64');
  else { body.set('client_id', app.clientId); body.set('client_secret', app.clientSecret); }
  const r = await fetch(meta.tokenUrl, { method: 'POST', headers, body });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(meta.name + ': авторизация не удалась (' + (d.error_description || d.error || d.reason || r.status) + ')');
  const oauth = { accessToken: d.access_token, refreshToken: d.refresh_token || '', expiresAt: Date.now() + ((d.expires_in || 3600) * 1000), scope: d.scope || meta.scope };
  let account = {};
  try { account = await fetchIdentity(platform, d.access_token); } catch (_) {}
  return { oauth, account };
}
async function fetchIdentity(platform, token) {
  const auth = { Authorization: 'Bearer ' + token };
  if (platform === 'zoom') { const r = await fetch('https://api.zoom.us/v2/users/me', { headers: auth }); const d = await r.json().catch(() => ({})); return { email: d.email || '', name: [d.first_name, d.last_name].filter(Boolean).join(' ') }; }
  if (platform === 'google') { const r = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: auth }); const d = await r.json().catch(() => ({})); return { email: d.email || '', name: d.name || '' }; }
  if (platform === 'teams') { const r = await fetch('https://graph.microsoft.com/v1.0/me', { headers: auth }); const d = await r.json().catch(() => ({})); return { email: d.mail || d.userPrincipalName || '', name: d.displayName || '' }; }
  return {};
}
async function ensureToken(platform, app, vi) {
  const meta = P[platform]; const o = vi.oauth;
  if (!o || !o.refreshToken) throw new Error(meta.name + ' не подключён');
  if (o.accessToken && o.expiresAt && (o.expiresAt - Date.now() > 60000)) return o.accessToken;
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: o.refreshToken });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (meta.basicAuth) headers.Authorization = 'Basic ' + Buffer.from(app.clientId + ':' + app.clientSecret).toString('base64');
  else { body.set('client_id', app.clientId); body.set('client_secret', app.clientSecret); if (meta.scope) body.set('scope', meta.scope); }
  const r = await fetch(meta.tokenUrl, { method: 'POST', headers, body });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(meta.name + ': сессия истекла, переподключите аккаунт');
  o.accessToken = d.access_token; o.expiresAt = Date.now() + ((d.expires_in || 3600) * 1000);
  if (d.refresh_token) o.refreshToken = d.refresh_token;   // Zoom/Teams ротируют refresh_token
  return o.accessToken;
}

// ── Создание встречи под токеном клиента ────────────────────────────────────
async function createMeeting(platform, token, opts) {
  const auth = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  if (platform === 'zoom') {
    const r = await fetch('https://api.zoom.us/v2/users/me/meetings', { method: 'POST', headers: auth,
      body: JSON.stringify({ topic: opts.topic || 'Собеседование', type: 2, start_time: opts.startTime, duration: opts.durationMin || 40, timezone: 'UTC', settings: { join_before_host: true, waiting_room: false, approval_type: 2 } }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.join_url) throw new Error('Zoom: не удалось создать встречу (' + (d.message || r.status) + ')');
    return d.join_url;
  }
  if (platform === 'google') {
    const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', { method: 'POST', headers: auth,
      body: JSON.stringify({ summary: opts.topic || 'Собеседование', start: { dateTime: opts.startTime }, end: { dateTime: opts.endTime }, conferenceData: { createRequest: { requestId: 'hrpro-' + Date.now(), conferenceSolutionKey: { type: 'hangoutsMeet' } } } }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Google: ' + ((d.error && d.error.message) || r.status));
    const link = d.hangoutLink || (d.conferenceData && d.conferenceData.entryPoints && (d.conferenceData.entryPoints.find(e => e.entryPointType === 'video') || {}).uri);
    if (!link) throw new Error('Google: ссылка Meet не создана');
    return link;
  }
  if (platform === 'teams') {
    const r = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', { method: 'POST', headers: auth,
      body: JSON.stringify({ subject: opts.topic || 'Собеседование', startDateTime: opts.startTime, endDateTime: opts.endTime }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.joinWebUrl) throw new Error('Teams: ' + ((d.error && d.error.message) || r.status));
    return d.joinWebUrl;
  }
  throw new Error('Платформа не поддерживается');
}

// ── Публичное API ───────────────────────────────────────────────────────────
// app = { clientId, clientSecret } приложения владельца портала; при обновлении токена
// мутируется vi.oauth — вызывающий обязан сохранить settings после.
async function generateVideoLink(settings, platform, opts, app) {
  const vi = (settings && settings.videoIntegrations && settings.videoIntegrations[platform]) || null;
  if (!vi || !(vi.oauth && vi.oauth.refreshToken)) throw new Error((P[platform] ? P[platform].name : 'Сервис') + ' не подключён');
  if (!app || !app.clientId || !app.clientSecret) throw new Error((P[platform] ? P[platform].name : 'Сервис') + ': OAuth-приложение не настроено на портале');
  const token = await ensureToken(platform, app, vi);
  return createMeeting(platform, token, opts);
}
function videoIntegrationStatus(settings) {
  const v = (settings && settings.videoIntegrations) || {};
  const conn = k => !!(v[k] && v[k].oauth && v[k].oauth.refreshToken);
  const acc = k => (v[k] && v[k].account && v[k].account.email) || '';
  return { zoom: conn('zoom'), google: conn('google'), teams: conn('teams'),
    accounts: { zoom: acc('zoom'), google: acc('google'), teams: acc('teams') } };
}

module.exports = { generateVideoLink, videoIntegrationStatus, authorizeUrl, exchangeCode, makeVState, readVState, PLATFORMS: Object.keys(P) };
