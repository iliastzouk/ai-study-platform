-- Quiz attempts — append-only, one row per submission
-- Write path: authenticated user inserts their own row
-- Read path: authenticated user reads only their own rows
-- No UPDATE or DELETE allowed from client

create table if not exists public.quiz_attempts (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	lesson_id uuid not null references public.lessons(id) on delete cascade,
	-- answers shape: [{ "question_index": 0, "selected": 2 }]
	answers jsonb not null,
	-- score 0.00–100.00, calculated client-side
	score numeric(5, 2),
	completed_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_quiz_attempts_user_id
	on public.quiz_attempts(user_id);

create index if not exists idx_quiz_attempts_lesson_id
	on public.quiz_attempts(lesson_id);

-- RLS
alter table public.quiz_attempts enable row level security;

-- Users can insert their own attempts only
drop policy if exists "Users can insert their own quiz attempts" on public.quiz_attempts;
create policy "Users can insert their own quiz attempts"
	on public.quiz_attempts
	for insert
	to authenticated
	with check (auth.uid() = user_id);

-- Users can read their own attempts only
drop policy if exists "Users can read their own quiz attempts" on public.quiz_attempts;
create policy "Users can read their own quiz attempts"
	on public.quiz_attempts
	for select
	to authenticated
	using (auth.uid() = user_id);

-- No UPDATE policy → clients cannot modify past attempts
-- No DELETE policy → clients cannot remove past attempts
