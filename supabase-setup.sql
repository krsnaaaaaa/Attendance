-- Run once in Supabase SQL Editor.
create table if not exists attendance (
  day      date primary key,   -- AD date YYYY-MM-DD
  status   text,               -- present | holiday | leave | offday
  pay      text,               -- paid | unpaid
  in_time  text,               -- 'HH:MM'
  out_time text,               -- 'HH:MM'
  descr    text,
  updated_at timestamptz default now()
);
alter table attendance enable row level security;
create policy "anon full access" on attendance
  for all to anon using (true) with check (true);
