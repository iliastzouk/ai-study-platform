import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase, type Database } from "../services/supabase";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];

export function CoursePage() {
	const { slug } = useParams();
	const [course, setCourse] = useState<CourseRow | null>(null);
	const [modules, setModules] = useState<ModuleRow[]>([]);
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

			if (controller.signal.aborted) return;
			setCourse(courseData);
			setModules(modulesData ?? []);
			setLoading(false);
		};

		void load();

		return () => {
			controller.abort();
		};
	}, [slug]);

	if (loading) {
		return (
			<section>
				<h1>Course</h1>
				<p>Loading course...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section>
				<h1>Course</h1>
				<p role="alert">{error}</p>
			</section>
		);
	}

	if (!course) {
		return (
			<section>
				<h1>Course</h1>
				<p>Course not found.</p>
			</section>
		);
	}

	return (
		<section>
			<h1>{course.title}</h1>
			{course.description ? <p>{course.description}</p> : null}
			{modules.length === 0 ? (
				<p>No modules published yet.</p>
			) : (
				<ol>
					{modules.map((module) => (
						<li key={module.id}>
							<h2>
								Week {module.week_number}: {module.title}
							</h2>
							{module.description ? <p>{module.description}</p> : null}
						</li>
					))}
				</ol>
			)}
		</section>
	);
}

export default CoursePage;
