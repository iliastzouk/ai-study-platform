import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, type Database } from "../services/supabase";
import { useAuthContext } from "../auth/useAuthContext";

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
	const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		const load = async () => {
			setLoading(true);
			setError(null);

			const { data: coursesData, error: coursesError } = await supabase
				.from("courses")
				.select("id, slug, title, description, is_published, created_at, updated_at")
				.eq("is_published", true)
				.order("created_at", { ascending: false });

			if (coursesError) {
				if (controller.signal.aborted) return;
				setError(coursesError.message);
				setLoading(false);
				return;
			}

			let enrollmentRows: EnrollmentRow[] = [];
			if (session?.user?.id) {
				const { data: enrollmentData, error: enrollmentError } = await supabase
					.from("enrollments")
					.select("id, user_id, course_id, status, enrolled_at, created_at, updated_at")
					.eq("user_id", session.user.id);

				if (enrollmentError) {
					if (controller.signal.aborted) return;
					setError(enrollmentError.message);
					setLoading(false);
					return;
				}
				enrollmentRows = enrollmentData ?? [];
			}

			if (controller.signal.aborted) return;
			setCourses(coursesData ?? []);
			setEnrollments(enrollmentRows);
			setLoading(false);
		};

		void load();

		return () => {
			controller.abort();
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

	const handleEnroll = async (courseId: string) => {
		if (!session?.user?.id) {
			setError("You must be signed in to enroll.");
			return;
		}
		setError(null);
		setEnrollingCourseId(courseId);
		const { data: enrollmentData, error: enrollmentError } = await supabase
			.from("enrollments")
			.insert({
				course_id: courseId,
				user_id: session.user.id,
				status: "active",
			})
			.select("id, user_id, course_id, status, enrolled_at, created_at, updated_at")
			.single();

		if (enrollmentError) {
			setError(enrollmentError.message);
			setEnrollingCourseId(null);
			return;
		}

		setEnrollments((prev) =>
			prev.some((row) => row.course_id === courseId) || !enrollmentData
				? prev
				: [...prev, enrollmentData]
		);
		setEnrollingCourseId(null);
	};

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
							<h2>
								<Link to={`/courses/${course.slug}`}>{course.title}</Link>
							</h2>
							{course.description ? <p>{course.description}</p> : null}
							{course.enrolled ? (
								<p>Enrolled ({course.enrollmentStatus ?? "active"})</p>
							) : (
								<div>
									<p>Not enrolled</p>
									<button
										type="button"
										onClick={() => void handleEnroll(course.id)}
										disabled={
											!session?.user?.id || enrollingCourseId === course.id
										}
									>
										{enrollingCourseId === course.id
											? "Enrolling..."
											: "Enroll"}
									</button>
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

export default CoursesPage;
