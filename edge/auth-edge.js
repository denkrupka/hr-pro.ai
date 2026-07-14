'use strict';
// Хеширование паролей на edge через WebCrypto PBKDF2 (scrypt недоступен на Workers).
// Формат: pbkdf2$<iter>$<saltB64url>$<hashB64url>. Функции async — вызовы в server.js
// адаптированы под await.
const ITER = 100000;

function b64u(bytes) {
  let s = ''; for (const x of new Uint8Array(bytes)) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64u(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function pbkdf2(password, salt, iter) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}
async function hashPassword(password) {
  const salt = new Uint8Array(16); crypto.getRandomValues(salt);
  const hash = await pbkdf2(password, salt, ITER);
  return `pbkdf2$${ITER}$${b64u(salt)}$${b64u(hash)}`;
}
async function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts[0] !== 'pbkdf2' || parts.length !== 4) return false; // легаси scrypt перехешируется миграцией
  const iter = parseInt(parts[1], 10) || ITER;
  const salt = fromB64u(parts[2]);
  const expect = fromB64u(parts[3]);
  const got = await pbkdf2(password, salt, iter);
  if (got.length !== expect.length) return false;
  let diff = 0; for (let i = 0; i < got.length; i++) diff |= got[i] ^ expect[i];
  return diff === 0;
}
module.exports = { hashPassword, verifyPassword };
