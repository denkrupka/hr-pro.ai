'use strict';
// Минимальный Express-совместимый слой для edge: собирает маршруты server.js/admin.js,
// а worker вызывает их с адаптированными req/res. Поддерживает :params, '*', middleware,
// express.json/raw/static (парсинг делает worker), app.listen = no-op.

function pathToRegex(p) {
  if (p instanceof RegExp) return { re: p, keys: [] };
  const keys = [];
  let src = p.replace(/\/+$/, '') || '/';
  src = src.replace(/[.+?^${}()|[\]\\]/g, '\\$&'); // экранируем спецсимволы (кроме : и *)
  src = src.replace(/\\\*/g, '.*');
  src = src.replace(/:([A-Za-z0-9_]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
  return { re: new RegExp('^' + src + '/?$'), keys };
}

function createApp() {
  const routes = []; // { method, re, keys, handlers }
  const middlewares = []; // глобальные use(handler)

  function add(method, path, handlers) {
    // use(path?, fn...) без метода — глобальная/по префиксу
    const { re, keys } = pathToRegex(path);
    routes.push({ method, re, keys, handlers: handlers.flat().filter(h => typeof h === 'function') });
  }
  const app = function () {}; // не используется как handler напрямую
  ['get', 'post', 'put', 'delete', 'patch', 'options', 'all'].forEach(m => {
    app[m] = (path, ...handlers) => { add(m.toUpperCase(), path, handlers); return app; };
  });
  app.use = (a, ...rest) => {
    if (typeof a === 'function') { middlewares.push({ prefix: null, fn: a }); }
    else if (typeof a === 'string') { rest.flat().forEach(fn => { if (typeof fn === 'function') middlewares.push({ prefix: a, fn }); }); }
    return app;
  };
  app.listen = (_p, cb) => { if (typeof cb === 'function') cb(); return { close() {} }; };
  app.set = () => app;

  // Выполнить цепочку под конкретный запрос. req.method, req.path заданы worker'ом.
  app.handle = async (req, res) => {
    const method = req.method.toUpperCase();
    const url = req.path;
    // сначала глобальные middleware (json/raw парсинг worker уже сделал; тут — пользовательские)
    for (const mw of middlewares) {
      if (mw.prefix && !url.startsWith(mw.prefix)) continue;
      let nexted = false;
      await new Promise((resolve) => {
        try { mw.fn(req, res, (e) => { nexted = true; if (e) { res.status(500).json({ error: String(e.message || e) }); } resolve(); }); }
        catch (e) { res.status(500).json({ error: String(e.message || e) }); resolve(); }
        if (res._ended) resolve();
      });
      if (res._ended) return;
      if (!nexted && !res._ended) return; // middleware не позвал next и не ответил
    }
    for (const r of routes) {
      if (r.method !== method && r.method !== 'ALL') continue;
      const m = r.re.exec(url);
      if (!m) continue;
      req.params = {};
      r.keys.forEach((k, i) => { req.params[k] = decodeURIComponent(m[i + 1]); });
      // цепочка handlers с next
      let idx = 0;
      const run = async () => {
        if (idx >= r.handlers.length || res._ended) return;
        const h = r.handlers[idx++];
        await new Promise((resolve) => {
          let done = false;
          const next = (e) => { done = true; if (e) res.status(500).json({ error: String(e.message || e) }); resolve(); };
          try { const p = h(req, res, next); if (p && p.then) p.then(() => { if (!done) resolve(); }).catch(er => { res.status(500).json({ error: String(er.message || er) }); resolve(); }); else if (!done && res._ended) resolve(); else if (!done) { /* sync handler без next и без ответа */ resolve(); } }
          catch (e) { res.status(500).json({ error: String(e.message || e) }); resolve(); }
        });
        if (!res._ended) await run();
      };
      await run();
      return;
    }
    // не найдено
    if (!res._ended) res.status(404).json({ error: 'Not found' });
  };
  return app;
}

// express() и статические методы
function express() { return createApp(); }
express.json = () => (req, _res, next) => next && next();      // тело парсит worker
express.raw = () => (req, _res, next) => next && next();       // сырое тело даёт worker (webhook)
express.urlencoded = () => (req, _res, next) => next && next();
express.static = () => (_req, _res, next) => next && next();   // статику отдаёт Cloudflare ASSETS

module.exports = express;
module.exports.default = express;
