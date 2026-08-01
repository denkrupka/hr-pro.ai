// Фоновый cron-воркер HR PRO AI: раз в минуту добивает зависшие AI-расшифровки,
// дёргая защищённый эндпоинт основного сайта (/api/internal/decode-drive).
// Это даёт «кликнул — ушёл — доделается в фоне» на бесплатном плане Cloudflare
// (Pages сам делает генерацию; воркер только инициирует и держит запрос).
export default {
  async scheduled(event, env, ctx) {
    const base = (env.PAGES_URL || 'https://hr-pro.ai').replace(/\/+$/, '');
    const drive = async () => {
      const r = await fetch(base + '/api/internal/decode-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.DRIVE_SECRET }),
      });
      return r.ok ? await r.json().catch(() => ({})) : {};
    };
    ctx.waitUntil((async () => {
      // до 3 расшифровок за тик — каждый вызов добивает одну зависшую
      for (let i = 0; i < 3; i++) {
        try { const d = await drive(); if (!d || !d.driven) break; } catch (_) { break; }
      }
    })());
  },
};
