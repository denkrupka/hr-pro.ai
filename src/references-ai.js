'use strict';
// ИИ-референсы: сборка референс-звонка бывшему руководителю (официальный промт 3, 17 вопросов)
// и разбор результата звонка Vapi в структурированные ответы.
const prompts = require('./ai-call-prompts');

// Сборка сценария референс-интервью + JSON-схемы для структурированного сбора ответов Vapi.
// ctx: { candidateName, vacancyName, contact, lang, company, recruiter }
function buildRefInterview(ctx) {
  const contact = ctx.contact || {};
  const supervisor = (((contact.name || '') + ' ' + (contact.surname || '')).trim()) || 'руководитель';
  return prompts.referenceCall({
    candidate: ctx.candidateName || '—',
    position: ctx.vacancyName || 'не указана',
    company: ctx.company || '',
    recruiter: ctx.recruiter || '',
    supervisor,
    previous_company: contact.company || '',
    language: ctx.lang || 'ru',
  });
}

// Разбор результата звонка Vapi → answers (структурированные поля q1..q17) + summary + transcript.
function parseCall(vapiCall) {
  const answers = {};
  const sd = vapiCall && vapiCall.structuredData;
  if (sd && typeof sd === 'object') {
    for (const k of Object.keys(sd)) {
      const v = sd[k];
      if (v != null && v !== '') answers[k] = typeof v === 'string' ? v : String(v);
    }
  }
  return {
    answers,
    summary: (vapiCall && vapiCall.summary) || '',
    transcript: (vapiCall && vapiCall.transcript) || '',
    filled: Object.keys(answers).length,
    labels: prompts.REF_LABELS,
  };
}

module.exports = { buildRefInterview, parseCall, REF_LABELS: prompts.REF_LABELS };
