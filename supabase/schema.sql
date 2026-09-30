-- Supabase Database Schema for YT Summary Organizer
-- Run this script in your Supabase SQL Editor

-- 1. Create Videos Table
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  video_url text not null,
  created_at timestamp with time zone not null default now()
);

-- 2. Create Timestamps Table
create table if not exists public.timestamps (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  time_in_seconds numeric not null,
  note_text text not null,
  created_at timestamp with time zone not null default now()
);

-- Indexes for performance
create index if not exists idx_videos_user_id on public.videos(user_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);
create index if not exists idx_timestamps_video_id on public.timestamps(video_id);
create index if not exists idx_timestamps_time on public.timestamps(time_in_seconds asc);

-- 3. Enable Row-Level Security (RLS)
alter table public.videos enable row level security;
alter table public.timestamps enable row level security;

-- 4. RLS Policies for Videos
-- SELECT Policy
create policy "Users can select own videos"
  on public.videos
  for select
  using (auth.uid() = user_id);

-- INSERT Policy
create policy "Users can insert own videos"
  on public.videos
  for insert
  with check (auth.uid() = user_id);

-- UPDATE Policy
create policy "Users can update own videos"
  on public.videos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE Policy
create policy "Users can delete own videos"
  on public.videos
  for delete
  using (auth.uid() = user_id);

-- 5. RLS Policies for Timestamps
-- SELECT Policy
create policy "Users can select own timestamps"
  on public.timestamps
  for select
  using (auth.uid() = user_id);

-- INSERT Policy
create policy "Users can insert own timestamps"
  on public.timestamps
  for insert
  with check (auth.uid() = user_id);

-- UPDATE Policy
create policy "Users can update own timestamps"
  on public.timestamps
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE Policy
create policy "Users can delete own timestamps"
  on public.timestamps
  for delete
  using (auth.uid() = user_id);
