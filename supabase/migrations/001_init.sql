-- Core tables for AI learning platform

-- Enable extensions
create extension if not exists "pgcrypto";

-- Courses
create table if not exists public.courses (
	id uuid primary key default gen_random_uuid(),
	slug text unique not null,
	title text not null,
	description text,
	is_published boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- Modules (weeks) within a course
create table if not exists public.modules (
	id uuid primary key default gen_random_uuid(),
	course_id uuid not null references public.courses(id) on delete cascade,
	week_number integer not null,
	title text not null,
	description text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (course_id, week_number)
);

-- Lessons within a module
create table if not exists public.lessons (
	id uuid primary key default gen_random_uuid(),
	module_id uuid not null references public.modules(id) on delete cascade,
	lesson_number integer not null,
    lesson_type text not null default 'theory',
	title text not null,
	content text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (module_id, lesson_number)
);

-- Questions attached to lessons
create table if not exists public.questions (
	id uuid primary key default gen_random_uuid(),
	lesson_id uuid not null references public.lessons(id) on delete cascade,
	prompt text not null,
	question_type text not null default 'open_ended',
	choices jsonb,
	answer jsonb,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- User progress for lessons and questions
create table if not exists public.user_progress (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	course_id uuid not null references public.courses(id) on delete cascade,
	module_id uuid references public.modules(id) on delete set null,
	lesson_id uuid references public.lessons(id) on delete set null,
	question_id uuid references public.questions(id) on delete set null,
	status text not null default 'not_started',
	score numeric(5,2),
	last_interaction_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, lesson_id, question_id)
);

-- Indexes
create index if not exists idx_modules_course_id on public.modules(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_questions_lesson_id on public.questions(lesson_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_course_id on public.user_progress(course_id);

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

-- Attach updated_at triggers
drop trigger if exists trg_courses_updated_at on public.courses;
create trigger trg_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists trg_modules_updated_at on public.modules;
create trigger trg_modules_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_progress_updated_at on public.user_progress;
create trigger trg_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();
