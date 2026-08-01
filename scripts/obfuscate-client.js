#!/usr/bin/env node
// Обфускация клиентского JS в dist/js (вызывается из build-edge.sh после копирования public → dist).
// Обфусцируем ТОЛЬКО app.js и admin.js (вся логика портала). Data-файлы (faq-i18n/req-schema/
// position-ref) и qrcode.js оставляем читаемыми: скрывать в них нечего, а app.js читает их глобали.
//
// Ключевой риск: app.js генерирует HTML с inline-хендлерами (onclick="openReport('${id}')") и
// экспортирует API в window.* — эти ИМЕНА обфускатор не должен переименовывать. Поэтому собираем
// reservedNames ДИНАМИЧЕСКИ из исходников (все on*-вызовы, все window.X, все top-level имена
// data-файлов, на которые app.js ссылается) — список всегда актуален, не хрупкий.
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC_JS = path.join(__dirname, '..', 'public', 'js');
const DIST_JS = path.join(__dirname, '..', 'dist', 'js');
const OBFUSCATE = ['app.js', 'admin.js'];               // только эти файлы обфусцируем
const DATA_FILES = ['faq-i18n.js', 'req-schema.js', 'position-ref.js', 'qrcode.js'];

// DOM-методы/свойства — это property access, не глобальные функции; их защищать не нужно и вредно.
const DROP = new Set(['stopPropagation', 'preventDefault', 'select', 'open', 'print', 'focus', 'blur',
  'reload', 'remove', 'click', 'submit', 'reset', 'play', 'pause', 'close', 'addEventListener',
  'removeEventListener', 'getSelection', 'matchMedia', 'innerWidth', 'innerHeight', 'outerWidth',
  'outerHeight', 'devicePixelRatio', 'clipboardData', 'location', 'href', 'value', 'checked',
  'length', 'forEach', 'map', 'filter', 'assign', 'reload', 'replace']);

function collectReserved() {
  const names = new Set();
  const files = fs.existsSync(SRC_JS) ? fs.readdirSync(SRC_JS).filter(f => f.endsWith('.js')) : [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(SRC_JS, f), 'utf8');
    // имена, вызываемые из inline-хендлеров on*="...name(" / on*='...name('
    for (const m of src.matchAll(/on\w+=["'][^"']*/g))
      for (const id of m[0].matchAll(/[A-Za-z_$][A-Za-z0-9_$]*(?=\()/g)) names.add(id[0]);
    // экспорты в глобальный объект: window.name
    for (const m of src.matchAll(/window\.([A-Za-z_$][A-Za-z0-9_$]*)/g)) names.add(m[1]);
    // top-level имена data-файлов (app.js/admin.js ссылаются на них как на внешние глобали)
    if (DATA_FILES.includes(f))
      for (const m of src.matchAll(/^(?:const|let|var|function|async function)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm)) names.add(m[1]);
  }
  return [...names].filter(n => n && !DROP.has(n));
}

const RESERVED = collectReserved();
console.log(`[obfuscate] защищаемых имён (reservedNames): ${RESERVED.length}`);

const OPTIONS = {
  compact: true,
  simplify: true,
  target: 'browser',
  renameGlobals: false,
  reservedNames: RESERVED.map(n => '^' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'),
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  stringArrayThreshold: 0.75,
  stringArrayEncoding: ['base64'],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'variable',
  splitStrings: false,
  numbersToExpressions: true,
  transformObjectKeys: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  unicodeEscapeSequence: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false,
  sourceMap: false,
};

if (!fs.existsSync(DIST_JS)) { console.error('[obfuscate] dist/js не найден — пропуск'); process.exit(0); }

let done = 0, failed = 0;
for (const file of OBFUSCATE) {
  const full = path.join(DIST_JS, file);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  try {
    const out = JavaScriptObfuscator.obfuscate(src, OPTIONS).getObfuscatedCode();
    fs.writeFileSync(full, out, 'utf8');
    done++;
    console.log(`[obfuscate] ${file} → ${(Buffer.byteLength(out, 'utf8') / 1024).toFixed(0)}K`);
  } catch (e) { failed++; console.error(`[obfuscate] FAIL ${file}: ${e.message} — оставлен оригинал`); }
}
console.log(`[obfuscate] готово: ${done} обфусцировано, ${failed} ошибок`);
if (failed) process.exit(1);
