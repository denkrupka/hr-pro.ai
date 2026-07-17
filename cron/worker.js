// Отдельный Cloudflare Worker с cron-триггером: периодически дёргает планировщик звонков
// на Pages-проекте hr-pro.ai (на самих Pages нет cron/setInterval).
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil((async () => {
      try {
        const r = await fetch('https://hr-pro.ai/api/cron/tick', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + (env.CRON_SECRET || ''), 'Content-Type': 'application/json' },
          body: '{}',
        });
        const t = await r.text();
        console.log('cron tick', r.status, t.slice(0, 200));
      } catch (e) { console.error('cron tick error', e.message); }
    })());
  },
  // ручной вызов для проверки: GET возвращает статус тика
  async fetch(req, env) {
    const r = await fetch('https://hr-pro.ai/api/cron/tick', {
      method: 'POST', headers: { Authorization: 'Bearer ' + (env.CRON_SECRET || ''), 'Content-Type': 'application/json' }, body: '{}',
    });
    return new Response(await r.text(), { status: r.status, headers: { 'content-type': 'application/json' } });
  },
};
