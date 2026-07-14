#!/usr/bin/env bash
# Сборка Cloudflare Pages: статика (public без media) + edge-worker (_worker.js).
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
# статика: копируем public/, исключая крупные видео (media/ → Supabase Storage)
cp -r public/* dist/ 2>/dev/null || true
rm -rf dist/media dist/uploads
# кэш-бастинг: версия к локальным css/js в HTML, чтобы браузеры не держали старое
STAMP=$(date +%s)
python - "$STAMP" <<'PY'
import sys, glob, re
stamp = sys.argv[1]
for f in glob.glob('dist/*.html'):
    d = open(f, encoding='utf-8').read()
    d = re.sub(r'((?:src|href)=")(/?(?:css|js)/[^"?]+\.(?:js|css))(")',
               lambda m: m.group(1) + m.group(2) + '?v=' + stamp + m.group(3), d)
    open(f, 'w', encoding='utf-8').write(d)
print('cache-bust v=' + stamp)
PY
# бандлим edge-worker в один файл dist/_worker.js
npx esbuild edge/worker-main.js --bundle --format=esm --outfile=dist/_worker.js --platform=browser --log-level=warning
echo "build ok: $(du -sh dist | cut -f1), _worker.js $(du -h dist/_worker.js | cut -f1)"
