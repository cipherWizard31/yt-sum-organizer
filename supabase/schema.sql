-- Supabase Database Schema for YT Summary Organizer
-- Run this script in your Supabase SQL Editor

-- 1. Create Videos Table
create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  video_url   text not null,
  created_at  timestamptz not null default now()
);

-- 2. Create Timestamps Table
create table if not exists public.timestamps (
  id              uuid primary key default gen_random_uuid(),
  video_id        uuid not null references public.videos(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  time_in_seconds numeric not null,
  note_text       text not null,
  created_at      timestamptz not null default now()
);

-- 3. Create Summaries Table
create table if not exists public.summaries (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.videos(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  summary_text text not null,
  created_at   timestamptz not null default now()
);

-- 4. Performance Indexes
create index if not exists idx_videos_user_id   on public.videos(user_id);
create index if not exists idx_videos_created   on public.videos(created_at desc);
create index if not exists idx_timestamps_video on public.timestamps(video_id);
create index if not exists idx_timestamps_time  on public.timestamps(time_in_seconds asc);
create index if not exists idx_summaries_video  on public.summaries(video_id);

-- 5. Enable Row-Level Security
alter table public.videos     enable row level security;
alter table public.timestamps enable row level security;
alter table public.summaries  enable row level security;

-- 6. RLS Policies — Videos
create policy "videos_select" on public.videos for select using (auth.uid() = user_id);
create policy "videos_insert" on public.videos for insert with check (auth.uid() = user_id);
create policy "videos_update" on public.videos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "videos_delete" on public.videos for delete using (auth.uid() = user_id);

-- 7. RLS Policies — Timestamps
create policy "ts_select" on public.timestamps for select using (auth.uid() = user_id);
create policy "ts_insert" on public.timestamps for insert with check (auth.uid() = user_id);
create policy "ts_update" on public.timestamps for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ts_delete" on public.timestamps for delete using (auth.uid() = user_id);

-- 8. RLS Policies — Summaries
create policy "sum_select" on public.summaries for select using (auth.uid() = user_id);
create policy "sum_insert" on public.summaries for insert with check (auth.uid() = user_id);
create policy "sum_delete" on public.summaries for delete using (auth.uid() = user_id);
