-- Migration: Create progress tracking tables
-- Tables: lesson_progress, user_stats, xp_events, activity_dates

-- Lesson-level progress tracking
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  attempts integer not null default 0,
  best_score integer,
  time_spent integer not null default 0,
  xp_earned integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),

  unique (user_id, course_slug, lesson_slug)
);

-- User aggregate stats (one row per user)
create table if not exists user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  xp integer not null default 0,
  streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  total_time_spent integer not null default 0,
  lessons_completed integer not null default 0,
  courses_completed integer not null default 0,
  modules_completed integer not null default 0
);

-- XP event log
create table if not exists xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  timestamp timestamptz not null default now(),
  category text not null check (category in ('lesson', 'challenge', 'streak', 'quiz', 'course'))
);

-- Daily activity tracking for streaks
create table if not exists activity_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,

  unique (user_id, date)
);

-- Indexes for common query patterns
create index if not exists idx_lesson_progress_user on lesson_progress(user_id);
create index if not exists idx_lesson_progress_course on lesson_progress(user_id, course_slug);
create index if not exists idx_xp_events_user on xp_events(user_id);
create index if not exists idx_xp_events_timestamp on xp_events(user_id, timestamp desc);
create index if not exists idx_activity_dates_user on activity_dates(user_id);
create index if not exists idx_activity_dates_date on activity_dates(user_id, date desc);

-- RLS policies
alter table lesson_progress enable row level security;
alter table user_stats enable row level security;
alter table xp_events enable row level security;
alter table activity_dates enable row level security;

create policy "Users can read own lesson progress"
  on lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
  on lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lesson progress"
  on lesson_progress for update
  using (auth.uid() = user_id);

create policy "Users can read own stats"
  on user_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on user_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on user_stats for update
  using (auth.uid() = user_id);

create policy "Users can read own xp events"
  on xp_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own xp events"
  on xp_events for insert
  with check (auth.uid() = user_id);

create policy "Users can read own activity dates"
  on activity_dates for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity dates"
  on activity_dates for insert
  with check (auth.uid() = user_id);
