import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, type Database } from "../services/supabase";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type LessonRow = Database["public"]["Tables"]["lessons"]["Row"];

export function CoursePage() {
	const { slug } = useParams();
	const [course, setCourse] = useState<CourseRow | null>(null);
	const [modules, setModules] = useState<ModuleRow[]>([]);
	const [lessons, setLessons] = useState<LessonRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const load = async () => {
			if (!slug) {
				setError("Course not found.");
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			const { data: courseData, error: courseError } = await supabase
				.from("courses")
				.select("id, slug, title, description, is_published, created_at, updated_at")
				.eq("slug", slug)
				.eq("is_published", true)
				.single();

			if (courseError) {
				if (controller.signal.aborted) return;
				setError(courseError.message);
				setLoading(false);
				return;
			}

			const { data: modulesData, error: modulesError } = await supabase
				.from("modules")
				.select("id, course_id, week_number, title, description, created_at, updated_at")
				.eq("course_id", courseData.id)
				.order("week_number", { ascending: true });

			if (modulesError) {
				if (controller.signal.aborted) return;
				setError(modulesError.message);
				setLoading(false);
				return;
			}

			const moduleIds = (modulesData ?? []).map((m) => m.id);
			let lessonRows: LessonRow[] = [];

			if (moduleIds.length > 0) {
				const { data: lessonsData, error: lessonsError } = await supabase
					.from("lessons")
					.select("id, module_id, lesson_number, lesson_type, title, content, created_at, updated_at")
					.in("module_id", moduleIds)
					.order("lesson_number", { ascending: true });

				if (lessonsError) {
					if (controller.signal.aborted) return;
					// Non-fatal: show course without lessons
				} else {
					lessonRows = lessonsData ?? [];
				}
			}

			if (controller.signal.aborted) return;
			setCourse(courseData);
			setModules(modulesData ?? []);
			setLessons(lessonRows);
			setLoading(false);
		};

		void load();
		return () => { controller.abort(); };
	}, [slug]);

	// Group lessons by module_id
	const lessonsByModule = useMemo(() => {
		const map = new Map<string, LessonRow[]>();
		for (const lesson of lessons) {
			const arr = map.get(lesson.module_id) ?? [];
			arr.push(lesson);
			map.set(lesson.module_id, arr);
		}
		return map;
	}, [lessons]);

	if (loading) {
		return (
			<section>
				<p>Φόρτωση μαθήματος…</p>
			</section>
		);
	}

	if (error) {
		return (
			<section>
				<p className="alert alertError" role="alert">{error}</p>
			</section>
		);
	}

	if (!course) {
		return (
			<section>
				<p>Το μάθημα δεν βρέθηκε.</p>
			</section>
		);
	}

	return (
		<section>
			<nav className="breadcrumb">
				<Link to="/courses">← Όλα τα μαθήματα</Link>
			</nav>

			<h1 className="h1" style={{ marginTop: 12, marginBottom: 8 }}>
				{course.title}
			</h1>
			{course.description ? (
				<p className="subtle" style={{ marginBottom: 28 }}>
					{course.description}
				</p>
			) : null}

			{modules.length === 0 ? (
				<p className="kicker">Δεν υπάρχουν ενότητες ακόμα.</p>
			) : (
				<div className="gridCards">
					{modules.map((mod) => {
						const modLessons = lessonsByModule.get(mod.id) ?? [];
						return (
							<div key={mod.id} className="card cardPad">
								<h2 className="courseTitle">
									Εβδομάδα {mod.week_number}: {mod.title}
								</h2>
								{mod.description && (
									<p className="courseDesc">{mod.description}</p>
								)}
								{modLessons.length > 0 ? (
									<ul className="lessonList">
										{modLessons.map((lesson) => (
											<li key={lesson.id}>
												<Link
													to={`/courses/${slug}/lessons/${lesson.id}`}
													className="lessonLink"
												>
													{lesson.lesson_number}. {lesson.title}
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="kicker" style={{ marginTop: 12 }}>
										Δεν υπάρχουν μαθήματα σε αυτή την ενότητα ακόμα.
									</p>
								)}
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}

export default CoursePage;
