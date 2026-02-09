import { useEffect, useMemo, useState } from "react";
import { supabase, type Database } from "../services/supabase";
import { useAuthContext } from "../auth/AuthProvider";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"];

type CourseWithEnrollment = CourseRow & {
	enrolled: boolean;
	enrollmentStatus: string | null;
};

export function CoursesPage() {
	const { session } = useAuthContext();
	const [courses, setCourses] = useState<CourseRow[]>([]);
	const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const load = async () => {
			setLoading(true);
			setError(null);

			const { data: coursesData, error: coursesError } = await supabase
				.from("courses")
				.select("id, slug, title, description, is_published, created_at, updated_at")
				.eq("is_published", true)
				.order("created_at", { ascending: false });

			if (coursesError) {
				if (isMounted) {
					setError(coursesError.message);
					setLoading(false);
				}
				return;
			}

			let enrollmentRows: EnrollmentRow[] = [];
			if (session?.user?.id) {
				const { data: enrollmentData, error: enrollmentError } = await supabase
					.from("enrollments")
					.select("id, user_id, course_id, status, enrolled_at, created_at, updated_at")
					.eq("user_id", session.user.id);

				if (enrollmentError) {
					if (isMounted) {
						setError(enrollmentError.message);
						setLoading(false);
					}
					return;
				}
				enrollmentRows = enrollmentData ?? [];
			}

			if (isMounted) {
				setCourses(coursesData ?? []);
				setEnrollments(enrollmentRows);
				setLoading(false);
			}
		};

		void load();

		return () => {
			isMounted = false;
		};
	}, [session?.user?.id]);

	const coursesWithEnrollment = useMemo<CourseWithEnrollment[]>(() => {
		const enrollmentMap = new Map<string, EnrollmentRow>();
		for (const enrollment of enrollments) {
			enrollmentMap.set(enrollment.course_id, enrollment);
		}

		return courses.map((course) => {
			const enrollment = enrollmentMap.get(course.id);
			return {
				...course,
				enrolled: Boolean(enrollment),
				enrollmentStatus: enrollment?.status ?? null,
			};
		});
	}, [courses, enrollments]);

	if (loading) {
		return (
			<section>
				<h1>Courses</h1>
				<p>Loading courses...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section>
				<h1>Courses</h1>
				<p role="alert">{error}</p>
			</section>
		);
	}

	return (
		<section>
			<h1>Courses</h1>
			{coursesWithEnrollment.length === 0 ? (
				<p>No published courses yet.</p>
			) : (
				<ul>
					{coursesWithEnrollment.map((course) => (
						<li key={course.id}>
							<h2>{course.title}</h2>
							{course.description ? <p>{course.description}</p> : null}
							{course.enrolled ? (
								<p>Enrolled ({course.enrollmentStatus ?? "active"})</p>
							) : (
								<p>Not enrolled</p>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default CoursesPage;
