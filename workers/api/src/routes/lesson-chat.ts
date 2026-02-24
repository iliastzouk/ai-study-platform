import type { Env } from "../lib/env";
import { supabaseServiceClient } from "../lib/supabase";

type LessonRow = { id: string; title: string; content: string | null };

// ---------------------------------------------------------------------------
// System prompt — stateless Examiner mode
// ---------------------------------------------------------------------------
function buildSystemPrompt(lessonContent: string): string {
	return `Είσαι καθηγητής ψυχολογίας πανεπιστημίου που βοηθά φοιτητή να κατανοήσει ένα συγκεκριμένο μάθημα.

ΚΑΝΟΝΕΣ:
- Απάντα ΜΟΝΟ στα νέα ελληνικά, ακαδημαϊκό ύφος.
- Χρησιμοποίησε ΜΟΝΟ το παρεχόμενο κείμενο μαθήματος.
- Αν η ερώτηση ΔΕΝ καλύπτεται από το μάθημα, απάντα ακριβώς:
  "Αυτό δεν καλύπτεται στο συγκεκριμένο μάθημα."
- ΜΗΝ εφεύρεις πληροφορίες που δεν υπάρχουν στο κείμενο.
- Οι απαντήσεις να είναι σαφείς, συνοπτικές και ακριβείς.

ΚΕΙΜΕΝΟ ΜΑΘΗΜΑΤΟΣ:
${lessonContent}`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function handleLessonChat(
	request: Request,
	env: Env
): Promise<{ reply: string }> {
	const body = (await request.json()) as {
		lesson_id?: string;
		message?: string;
	};

	const { lesson_id, message } = body;

	if (!lesson_id || typeof lesson_id !== "string") {
		throw new Error("lesson_id is required");
	}
	if (!message || typeof message !== "string" || !message.trim()) {
		throw new Error("message is required");
	}

	const db = supabaseServiceClient(env);

	// Fetch lesson content
	const { data: lesson, error: lessonError } = await db.get<LessonRow>(
		"lessons",
		`id=eq.${lesson_id}&select=id,title,content`
	);

	if (lessonError || !lesson) {
		throw new Error(lessonError ?? "Lesson not found");
	}

	const lessonContent = [lesson.title, lesson.content ?? ""].join("\n\n").trim();

	// Call OpenAI
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			temperature: 0.4, // slightly higher than generation — allows natural replies
			messages: [
				{ role: "system", content: buildSystemPrompt(lessonContent) },
				{ role: "user", content: message.trim() },
			],
		}),
	});

	if (!response.ok) {
		const err = (await response.json()) as { error?: { message?: string } };
		throw new Error(err.error?.message ?? "OpenAI error");
	}

	const data = (await response.json()) as {
		choices: { message: { content: string } }[];
	};

	const reply = data.choices[0]?.message?.content?.trim() ?? "";
	return { reply };
}
