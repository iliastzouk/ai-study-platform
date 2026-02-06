-- Row Level Security for core tables

-- Courses: public read for published courses
alter table public.courses enable row level security;

drop policy if exists "Published courses are publicly readable" on public.courses;
create policy "Published courses are publicly readable"
	on public.courses
	for select
	using (is_published = true);

-- Modules: public read when parent course is published
alter table public.modules enable row level security;

drop policy if exists "Modules for published courses are publicly readable" on public.modules;
create policy "Modules for published courses are publicly readable"
	on public.modules
	for select
	using (
		exists (
			select 1
			from public.courses c
			where c.id = modules.course_id
				and c.is_published = true
		)
	);

-- Lessons: public read when parent course is published
alter table public.lessons enable row level security;

drop policy if exists "Lessons for published courses are publicly readable" on public.lessons;
create policy "Lessons for published courses are publicly readable"
	on public.lessons
	for select
	using (
		exists (
			select 1
			from public.modules m
			join public.courses c on c.id = m.course_id
			where m.id = lessons.module_id
				and c.is_published = true
		)
	);

-- Questions: public read when parent course is published
alter table public.questions enable row level security;

drop policy if exists "Questions for published courses are publicly readable" on public.questions;
create policy "Questions for published courses are publicly readable"
	on public.questions
	for select
	using (
		exists (
			select 1
			from public.lessons l
			join public.modules m on m.id = l.module_id
			join public.courses c on c.id = m.course_id
			where l.id = questions.lesson_id
				and c.is_published = true
		)
	);

-- User progress: users can only access their own data
alter table public.user_progress enable row level security;

drop policy if exists "Users can view their own progress" on public.user_progress;
create policy "Users can view their own progress"
	on public.user_progress
	for select
	using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.user_progress;
create policy "Users can insert their own progress"
	on public.user_progress
	for insert
	with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.user_progress;
create policy "Users can update their own progress"
	on public.user_progress
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own progress" on public.user_progress;
create policy "Users can delete their own progress"
	on public.user_progress
	for delete
	using (auth.uid() = user_id);
