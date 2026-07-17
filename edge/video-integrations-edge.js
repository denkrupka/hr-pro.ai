// Генерация ссылок на видеовстречу через подключённый аккаунт клиента.
// Zoom — Server-to-Server OAuth (ключи). Google Meet — сервис-аккаунт (JWT) + Calendar API.
// Teams — Microsoft Graph (client credentials). Конфиг хранится в settings.videoIntegrations[platform].

// ── Zoom (Server-to-Server OAuth) ──
export async function zoomLink(cfg, opts) {
  if (!cfg || !cfg.accountId || !cfg.clientId || !cfg.clientSecret) throw new Error('Zoom не подключён');
  const tr = await fetch('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' + encodeURIComponent(cfg.accountId), {
    method: 'POST', headers: { Authorization: 'Basic ' + btoa(cfg.clientId + ':' + cfg.clientSecret) } });
  const tk = await tr.json().catch(() => ({}));
  if (!tr.ok || !tk.access_token) throw new Error('Zoom: авторизация не удалась (' + (tk.reason || tk.error || tr.status) + ')');
  const r = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST', headers: { Authorization: 'Bearer ' + tk.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic: opts.topic || 'Собеседование', type: 2, start_time: opts.startTime, duration: opts.durationMin || 40, timezone: 'UTC', settings: { join_before_host: true, waiting_room: false, approval_type: 2 } }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.join_url) throw new Error('Zoom: не удалось создать встречу (' + (d.message || r.status) + ')');
  return d.join_url;
}

// ── Google Meet (сервис-аккаунт → JWT → Calendar API createRequest) ──
function b64url(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/-----BEGIN [^-]+-----/, '').replace(/-----END [^-]+-----/, '').replace(/\s+/g, '');
  const bin = atob(b64); const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
async function googleSaToken(sa, scope, subject) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claim = { iss: sa.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 };
  if (subject) claim.sub = subject;
  const payload = b64url(new TextEncoder().encode(JSON.stringify(claim)));
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(header + '.' + payload));
  const jwt = header + '.' + payload + '.' + b64url(sig);
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error('Google: авторизация сервис-аккаунта (' + (d.error_description || d.error || r.status) + ')');
  return d.access_token;
}
export async function googleMeetLink(cfg, opts) {
  if (!cfg || !cfg.serviceAccountJson) throw new Error('Google Meet не подключён');
  let sa; try { sa = JSON.parse(cfg.serviceAccountJson); } catch (e) { throw new Error('Google: неверный JSON сервис-аккаунта'); }
  const impersonate = cfg.calendarEmail || cfg.impersonate || '';
  const token = await googleSaToken(sa, 'https://www.googleapis.com/auth/calendar.events', impersonate || undefined);
  const calId = cfg.calendarEmail || cfg.calendarId || 'primary';
  const start = opts.startTime, end = opts.endTime;
  const r = await fetch('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calId) + '/events?conferenceDataVersion=1', {
    method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: opts.topic || 'Собеседование', start: { dateTime: start }, end: { dateTime: end }, conferenceData: { createRequest: { requestId: 'hrpro-' + Date.now(), conferenceSolutionKey: { type: 'hangoutsMeet' } } } }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('Google: ' + ((d.error && d.error.message) || r.status));
  const link = d.hangoutLink || (d.conferenceData && d.conferenceData.entryPoints && (d.conferenceData.entryPoints.find(e => e.entryPointType === 'video') || {}).uri);
  if (!link) throw new Error('Google: ссылка Meet не создана (проверьте доступ сервис-аккаунта к календарю)');
  return link;
}

// ── Microsoft Teams (Graph, client credentials) ──
export async function teamsLink(cfg, opts) {
  if (!cfg || !cfg.tenantId || !cfg.clientId || !cfg.clientSecret || !cfg.userId) throw new Error('Teams не подключён');
  const tr = await fetch('https://login.microsoftonline.com/' + encodeURIComponent(cfg.tenantId) + '/oauth2/v2.0/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }) });
  const tk = await tr.json().catch(() => ({}));
  if (!tk.access_token) throw new Error('Teams: авторизация (' + (tk.error_description || tr.status) + ')');
  const r = await fetch('https://graph.microsoft.com/v1.0/users/' + encodeURIComponent(cfg.userId) + '/onlineMeetings', {
    method: 'POST', headers: { Authorization: 'Bearer ' + tk.access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: opts.topic || 'Собеседование', startDateTime: opts.startTime, endDateTime: opts.endTime }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.joinWebUrl) throw new Error('Teams: ' + ((d.error && d.error.message) || r.status));
  return d.joinWebUrl;
}

// Диспетчер: platform → генерация. settings.videoIntegrations[platform].
export async function generateVideoLink(settings, platform, opts) {
  const cfg = (settings && settings.videoIntegrations && settings.videoIntegrations[platform]) || null;
  if (platform === 'zoom') return zoomLink(cfg, opts);
  if (platform === 'google') return googleMeetLink(cfg, opts);
  if (platform === 'teams') return teamsLink(cfg, opts);
  throw new Error('Платформа не поддерживается');
}
// Статус подключения (без секретов) для UI.
export function videoIntegrationStatus(settings) {
  const v = (settings && settings.videoIntegrations) || {};
  return {
    zoom: !!(v.zoom && v.zoom.accountId && v.zoom.clientId && v.zoom.clientSecret),
    google: !!(v.google && v.google.serviceAccountJson),
    teams: !!(v.teams && v.teams.tenantId && v.teams.clientId && v.teams.clientSecret && v.teams.userId),
  };
}
