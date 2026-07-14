#!/usr/bin/env bash
# Сборка Cloudflare Pages: статика (public без media) + edge-worker (_worker.js).
set -e
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
# статика: копируем public/, исключая крупные видео (media/ → Supabase Storage)
cp -r public/* dist/ 2>/dev/null || true
rm -rf dist/media dist/uploads
# бандлим edge-worker в один файл dist/_worker.js
npx esbuild edge/worker-main.js --bundle --format=esm --outfile=dist/_worker.js --platform=browser --log-level=warning
echo "build ok: $(du -sh dist | cut -f1), _worker.js $(du -h dist/_worker.js | cut -f1)"
