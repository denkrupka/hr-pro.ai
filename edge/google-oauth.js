// Google OAuth (server-side, Authorization Code flow) для edge-воркера.
// Секреты — из Cloudflare env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
// Чистые функции; создание/поиск пользователя и куки — в worker-main.js (там есть доступ к БД).

const AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';

function b64u(bytes) {
  let s = ''; for (const x of new Uint8Array(bytes)) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// state = случайное значение (CSRF) + куда вернуть пользователя (next), защищённое HMAC.
export async function makeState(secret, next) {
  const rnd = b64u(crypto.getRandomValues(new Uint8Array(16)));
  const payload = rnd + '|' + (next || '/app');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'dev'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return payload + '|' + b64u(mac);
}
export async function readState(secret, state) {
  if (!state) return null;
  const i = state.lastIndexOf('|');
  if (i < 0) return null;
  const payload = state.slice(0, i), sig = state.slice(i + 1);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret || 'dev'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  if (b64u(mac) !== sig) return null;
  const parts = payload.split('|');
  return { rnd: parts[0], next: parts[1] || '/app' };
}

export function consentUrl({ clientId, redirectUri, state }) {
  const q = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: 'openid email profile', state, access_type: 'online',
    prompt: 'select_account', include_granted_scopes: 'true',
  });
  return AUTH + '?' + q.toString();
}

export async function exchangeCode({ clientId, clientSecret, code, redirectUri }) {
  const r = await fetch(TOKEN, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString(),
  });
  if (!r.ok) return { error: 'token_' + r.status };
  return { token: await r.json() };
}

export async function fetchProfile(accessToken) {
  const r = await fetch(USERINFO, { headers: { Authorization: 'Bearer ' + accessToken } });
  if (!r.ok) return { error: 'userinfo_' + r.status };
  const p = await r.json(); // { sub, email, email_verified, name, given_name, family_name, picture }
  return { profile: p };
}
