-- ============================================================
-- Migration: Add folders + delete_user function
-- Run ONLY this file in Supabase SQL Editor (after schema.sql)
-- ============================================================

-- 1. Folders table
create table if not exists public.folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_folders_user on public.folders(user_id);
alter table public.folders enable row level security;

create policy "folders_select" on public.folders for select using (auth.uid() = user_id);
create policy "folders_insert" on public.folders for insert with check (auth.uid() = user_id);
create policy "folders_update" on public.folders for update using (auth.uid() = user_id);
create policy "folders_delete" on public.folders for delete using (auth.uid() = user_id);

-- 2. Add folder_id to videos
alter table public.videos
  add column if not exists folder_id uuid references public.folders(id) on delete set null;

-- 3. Delete-account helper function (called via supabase.rpc)
create or replace function public.delete_user()
returns void language plpgsql security definer set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
