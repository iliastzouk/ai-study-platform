-- AI-generated study assets per lesson
-- Write path: service role only (bypasses RLS by design)
-- Read path: authenticated users via SELECT policy

create table if not exists public.ai_generated_assets (
	id uuid primary key default gen_random_uuid(),
	lesson_id uuid unique not null references public.lessons(id) on delete cascade,
	summary text,
	flashcards jsonb,
	-- quiz shape: [{ "question": "", "choices": ["","","",""], "correct": 0, "explanation": "" }]
	quiz jsonb,
	generated_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

-- updated_at trigger
drop trigger if exists trg_ai_generated_assets_updated_at on public.ai_generated_assets;
create trigger trg_ai_generated_assets_updated_at
before update on public.ai_generated_assets
for each row execute function public.set_updated_at();

-- Index for fast lookup by lesson
create index if not exists idx_ai_generated_assets_lesson_id
	on public.ai_generated_assets(lesson_id);

-- RLS
-- Note: service role bypasses RLS entirely — no INSERT/UPDATE policies needed.
-- Authenticated users can only SELECT.
alter table public.ai_generated_assets enable row level security;

drop policy if exists "Authenticated users can read ai assets" on public.ai_generated_assets;
create policy "Authenticated users can read ai assets"
	on public.ai_generated_assets
	for select
	to authenticated
	using (true);
