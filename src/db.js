'use strict';
// Простое JSON-файловое хранилище (без нативных зависимостей).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function nowISO() { return new Date().toISOString(); }
function uid(n = 10) { return crypto.randomBytes(16).toString('base64url').slice(0, n); }
function shortCode(n = 8) { return crypto.randomBytes(12).toString('base64url').replace(/[-_]/g, '').slice(0, n); }

const DEFAULT = {
  users: [],        // { id, email, password, name, surname, company, balanceTotal, balancePending, settings, role, blocked, adminNote, lastLoginAt }
  sections: [],     // { id, userId, name, order, createdAt }
  vacancies: [],    // { id, userId, sectionId, name, lang, order, createdAt }
  anketas: [],      // { id, userId, slug, title, vacancyId, tests[], btnText, pageTitle, msgApply, msgDone, noCaptcha, sendEmail, description, createdAt }
  participants: [], // { id, userId, vacancyId, name, surname, email, sex, age, tel, city, stage, comment, color, starred, createdAt }
  tests: [],        // { id, participantId, userId, type, status, code, sentAt, startedAt, finishedAt, durationSec, answers, result, ratings, aiHint }
  purchases: [],    // { id, userId, planId, qty, amount, method, status, sessionId, createdAt }
  requisitions: [], // { id, userId, code, status, lang, form{...}, vacancyId, createdBy, createdAt, submittedAt, approvedAt }
  settings: {},     // ГЛОБАЛЬНЫЕ настройки портала (объект, не массив) — тарифы, интеграции, шаблоны, режимы
  balanceLog: [],   // { id, userId, delta, kind, comment, adminId, purchaseId, testId, balanceAfter, createdAt }
  adminLog: [],     // { id, adminId, action, targetType, targetId, details, createdAt }
};

let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    try { cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
    catch (_) { cache = JSON.parse(JSON.stringify(DEFAULT)); }
  } else {
    cache = JSON.parse(JSON.stringify(DEFAULT));
  }
  // мягкая миграция: отсутствующие коллекции создаются с типом из DEFAULT (массив или объект)
  for (const k of Object.keys(DEFAULT)) if (!cache[k]) cache[k] = Array.isArray(DEFAULT[k]) ? [] : {};
  return cache;
}

let saveTimer = null;
function save() {
  if (!cache) return;
  if (saveTimer) clearTimeout(saveTimer);
  // атомарная запись
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function db() { return load(); }

module.exports = { db, save, uid, shortCode, nowISO, DATA_DIR };
