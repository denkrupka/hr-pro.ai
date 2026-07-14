-- HR PRO AI — начальная схема Supabase (Postgres 17)
-- Документный дизайн: полный объект в data JSONB, индексируемые поля — генерируемые колонки.
-- Весь доступ идёт через edge-функции с service_role (обходит RLS); RLS включён deny-all,
-- чтобы anon/publishable-ключ не читал таблицы напрямую.

-- ── users ─────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id         text primary key,
  data       jsonb not null,
  email      text        generated always as (lower(data->>'email')) stored,
  role       text        generated always as (coalesce(data->>'role','user')) stored,
  blocked    boolean     generated always as (coalesce((data->>'blocked')::boolean,false)) stored,
  created_at text        generated always as (data->>'createdAt') stored
);
create unique index if not exists users_email_idx on public.users(email);

-- ── sections ──────────────────────────────────────────────────────────────────
create table if not exists public.sections (
  id      text primary key,
  data    jsonb not null,
  user_id text generated always as (data->>'userId') stored
);
create index if not exists sections_user_idx on public.sections(user_id);

-- ── vacancies ─────────────────────────────────────────────────────────────────
create table if not exists public.vacancies (
  id             text primary key,
  data           jsonb not null,
  user_id        text generated always as (data->>'userId') stored,
  section_id     text generated always as (data->>'sectionId') stored,
  requisition_id text generated always as (data->>'requisitionId') stored
);
create index if not exists vacancies_user_idx on public.vacancies(user_id);

-- ── anketas ───────────────────────────────────────────────────────────────────
create table if not exists public.anketas (
  id         text primary key,
  data       jsonb not null,
  user_id    text generated always as (data->>'userId') stored,
  slug       text generated always as (data->>'slug') stored,
  vacancy_id text generated always as (data->>'vacancyId') stored
);
create unique index if not exists anketas_slug_idx on public.anketas(slug);
create index if not exists anketas_user_idx on public.anketas(user_id);

-- ── participants ──────────────────────────────────────────────────────────────
create table if not exists public.participants (
  id         text primary key,
  data       jsonb not null,
  user_id    text generated always as (data->>'userId') stored,
  vacancy_id text generated always as (data->>'vacancyId') stored,
  email      text generated always as (lower(data->>'email')) stored,
  tel        text generated always as (data->>'tel') stored,
  created_at text        generated always as (data->>'createdAt') stored
);
create index if not exists participants_user_idx on public.participants(user_id);
create index if not exists participants_vacancy_idx on public.participants(vacancy_id);

-- ── tests ─────────────────────────────────────────────────────────────────────
create table if not exists public.tests (
  id             text primary key,
  data           jsonb not null,
  participant_id text generated always as (data->>'participantId') stored,
  user_id        text generated always as (data->>'userId') stored,
  code           text generated always as (data->>'code') stored,
  type           text generated always as (data->>'type') stored,
  status         text generated always as (data->>'status') stored,
  sent_at        text        generated always as (data->>'sentAt') stored
);
create unique index if not exists tests_code_idx on public.tests(code);
create index if not exists tests_participant_idx on public.tests(participant_id);
create index if not exists tests_user_idx on public.tests(user_id);

-- ── requisitions ──────────────────────────────────────────────────────────────
create table if not exists public.requisitions (
  id         text primary key,
  data       jsonb not null,
  user_id    text generated always as (data->>'userId') stored,
  code       text generated always as (data->>'code') stored,
  vacancy_id text generated always as (data->>'vacancyId') stored
);
create unique index if not exists requisitions_code_idx on public.requisitions(code);
create index if not exists requisitions_user_idx on public.requisitions(user_id);

-- ── purchases ─────────────────────────────────────────────────────────────────
create table if not exists public.purchases (
  id         text primary key,
  data       jsonb not null,
  user_id    text generated always as (data->>'userId') stored,
  session_id text generated always as (data->>'sessionId') stored,
  created_at text        generated always as (data->>'createdAt') stored
);
create index if not exists purchases_user_idx on public.purchases(user_id);
create index if not exists purchases_session_idx on public.purchases(session_id);

-- ── balance_log ───────────────────────────────────────────────────────────────
create table if not exists public.balance_log (
  id         text primary key,
  data       jsonb not null,
  user_id    text generated always as (data->>'userId') stored,
  kind       text generated always as (data->>'kind') stored,
  created_at text        generated always as (data->>'createdAt') stored
);
create index if not exists balance_log_user_idx on public.balance_log(user_id);

-- ── admin_log ─────────────────────────────────────────────────────────────────
create table if not exists public.admin_log (
  id         text primary key,
  data       jsonb not null,
  admin_id   text generated always as (data->>'adminId') stored,
  action     text generated always as (data->>'action') stored,
  created_at text        generated always as (data->>'createdAt') stored
);
create index if not exists admin_log_admin_idx on public.admin_log(admin_id);

-- ── settings (глобальные настройки портала — единственная строка kv) ───────────
create table if not exists public.settings (
  id   text primary key default 'portal',
  data jsonb not null default '{}'
);

-- ── RLS: включаем на всех, без политик (доступ только через service_role) ──────
do $$
declare t text;
begin
  foreach t in array array['users','sections','vacancies','anketas','participants',
    'tests','requisitions','purchases','balance_log','admin_log','settings']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;
