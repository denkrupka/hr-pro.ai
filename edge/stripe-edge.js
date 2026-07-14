'use strict';
// Минимальный Stripe-клиент на fetch (edge-совместимый) — покрывает методы,
// которые использует портал: checkout.sessions.create/retrieve, balance.retrieve,
// webhooks.constructEventAsync (проверка подписи через WebCrypto HMAC-SHA256).

const API = 'https://api.stripe.com/v1';

// Сериализация вложенных объектов/массивов в form-urlencoded (формат Stripe API)
function encode(obj, prefix, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => {
      if (item && typeof item === 'object') encode(item, `${key}[${i}]`, out);
      else out.push([`${key}[${i}]`, String(item)]);
    });
    else if (typeof v === 'object') encode(v, key, out);
    else out.push([key, String(v)]);
  }
  return out;
}

function makeStripe(secretKey) {
  async function call(method, path, params, extraHeaders = {}) {
    const headers = { Authorization: 'Bearer ' + secretKey, 'User-Agent': 'hrpro-edge', ...extraHeaders };
    let url = API + path, body;
    if (method === 'GET') {
      const qs = params ? encode(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
      if (qs) url += '?' + qs;
    } else {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = encode(params || {}).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
    const r = await fetch(url, { method, headers, body });
    const d = await r.json();
    if (!r.ok) { const e = new Error((d.error && d.error.message) || ('Stripe ' + r.status)); e.raw = d; throw e; }
    return d;
  }
  return {
    checkout: {
      sessions: {
        create: (params, opts = {}) => call('POST', '/checkout/sessions', params, opts.idempotencyKey ? { 'Idempotency-Key': opts.idempotencyKey } : {}),
        retrieve: (id) => call('GET', `/checkout/sessions/${id}`, null),
      },
    },
    balance: { retrieve: () => call('GET', '/balance', null) },
    webhooks: {
      // async-верификация подписи Stripe (t=…,v1=…) через HMAC-SHA256
      async constructEventAsync(payload, sigHeader, secret) {
        const parts = Object.fromEntries(String(sigHeader || '').split(',').map(p => p.split('=')));
        const t = parts.t, v1 = parts.v1;
        if (!t || !v1) throw new Error('Нет подписи');
        const raw = typeof payload === 'string' ? payload : new TextDecoder().decode(payload);
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
          { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${raw}`));
        const hex = [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, '0')).join('');
        if (hex !== v1) throw new Error('Подпись не совпадает');
        return JSON.parse(raw);
      },
      // синхронная версия недоступна на edge — прокидываем ошибку, чтобы поймать при разработке
      constructEvent() { throw new Error('используйте constructEventAsync на edge'); },
    },
  };
}
module.exports = makeStripe;
module.exports.default = makeStripe;
