-- Course enrollments and basic access control

create table if not exists public.enrollments (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	course_id uuid not null references public.courses(id) on delete cascade,
	status text not null default 'active',
	enrolled_at timestamptz not null default now(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, course_id)
);

create index if not exists idx_enrollments_user_id on public.enrollments(user_id);
create index if not exists idx_enrollments_course_id on public.enrollments(course_id);

-- updated_at trigger
drop trigger if exists trg_enrollments_updated_at on public.enrollments;
create trigger trg_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

-- Basic access control (RLS)
alter table public.enrollments enable row level security;

drop policy if exists "Enrollments are viewable by owner" on public.enrollments;
create policy "Enrollments are viewable by owner"
	on public.enrollments
	for select
	using (auth.uid() = user_id);

drop policy if exists "Users can enroll themselves" on public.enrollments;
create policy "Users can enroll themselves"
	on public.enrollments
	for insert
	with check (auth.uid() = user_id);

drop policy if exists "Users can update their enrollments" on public.enrollments;
create policy "Users can update their enrollments"
	on public.enrollments
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "Users can delete their enrollments" on public.enrollments;
create policy "Users can delete their enrollments"
	on public.enrollments
	for delete
	using (auth.uid() = user_id);
