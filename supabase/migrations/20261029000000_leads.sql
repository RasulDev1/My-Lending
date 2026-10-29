-- Заявки с сайта-анкеты. Таблицу пишет только функция `lead` (service role),
-- политик нет, поэтому через публичный ключ сайта её нельзя ни прочитать, ни изменить.
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  sphere      text not null,
  instagram   text not null,
  channels    text not null,
  entry_point text not null,
  dropoff     text not null,
  messenger   text not null,
  contact     text not null
);

alter table public.leads enable row level security;
