import type { Env } from "../lib/env";
import type { AuthUser } from "../lib/auth";
import { supabaseServiceClient } from "../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Flashcard = { q: string; a: string };
type QuizItem = {
	question: string;
	choices: [string, string, string, string];
	correct: number; // zero-based index
	explanation: string;
};

export type GeneratedAssets = {
	lesson_id: string;
	summary: string;
	flashcards: Flashcard[];
	quiz: QuizItem[];
	generated_at: string;
	updated_at: string;
};

type LessonRow = { id: string; title: string; content: string | null };

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------
function buildPrompt(lessonContent: string): string {
	return `Είσαι ακαδημαϊκός εξεταστής ψυχολογίας που δημιουργεί δομημένο εκπαιδευτικό υλικό.

ΚΑΝΟΝΕΣ:
- Όλες οι απαντήσεις ΜΟΝΟ σε νέα ελληνική γλώσσα, ακαδημαϊκό ύφος.
- Επέστρεψε ΑΠΟΚΛΕΙΣΤΙΚΑ έγκυρο JSON. Καμία επεξήγηση, κανένα markdown, κανένα κείμενο εκτός JSON.
- Χρησιμοποίησε ΜΟΝΟ πληροφορίες από το παρεχόμενο κείμενο μαθήματος.
- Αν το κείμενο είναι ανεπαρκές, επέστρεψε λιγότερα στοιχεία αλλά ΠΑΝΤΑ έγκυρο JSON.

ΔΟΜΗ ΕΞΟΔΟΥ (ακριβώς αυτές οι κλειδιές):
{
  "summary": "Συνοπτική παρουσίαση το πολύ 250 λέξεων",
  "flashcards": [
    { "q": "Ερώτηση", "a": "Απάντηση" }
  ],
  "quiz": [
    {
      "question": "Ερώτηση πολλαπλής επιλογής",
      "choices": ["Επιλογή Α", "Επιλογή Β", "Επιλογή Γ", "Επιλογή Δ"],
      "correct": 0,
      "explanation": "Εξήγηση γιατί η απάντηση είναι σωστή"
    }
  ]
}

ΠΟΣΟΤΗΤΕΣ:
- summary: ακριβώς 1 κείμενο
- flashcards: ακριβώς 8 ζεύγη
- quiz: ακριβώς 5 ερωτήσεις με ακριβώς 4 επιλογές η καθεμία
- "correct": μηδενική αρίθμηση (0, 1, 2 ή 3)

ΚΕΙΜΕΝΟ ΜΑΘΗΜΑΤΟΣ:
${lessonContent}`;
}

// ---------------------------------------------------------------------------
// OpenAI call
// ---------------------------------------------------------------------------
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			temperature: 0.2,
			response_format: { type: "json_object" },
			messages: [
				{
					role: "system",
					content:
						"Είσαι ακαδημαϊκός εξεταστής. Απαντάς ΜΟΝΟ με έγκυρο JSON στα ελληνικά.",
				},
				{ role: "user", content: prompt },
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
	return data.choices[0]?.message?.content ?? "{}";
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function handleGenerateLessonAssets(
	request: Request,
	env: Env,
	_user: AuthUser
): Promise<GeneratedAssets> {
	const body = (await request.json()) as { lesson_id?: string; force?: boolean };
	const { lesson_id, force = false } = body;

	if (!lesson_id || typeof lesson_id !== "string") {
		throw new Error("lesson_id is required");
	}

	const db = supabaseServiceClient(env);

	// -------------------------------------------------------------------------
	// Return cached assets unless force=true
	// -------------------------------------------------------------------------
	if (!force) {
		const { data: cached } = await db.get<GeneratedAssets>(
			"ai_generated_assets",
			`lesson_id=eq.${lesson_id}&select=*`
		);
		if (cached) return cached;
	}

	// -------------------------------------------------------------------------
	// Fetch lesson content
	// -------------------------------------------------------------------------
	const { data: lesson, error: lessonError } = await db.get<LessonRow>(
		"lessons",
		`id=eq.${lesson_id}&select=id,title,content`
	);

	if (lessonError || !lesson) {
		throw new Error(lessonError ?? "Lesson not found");
	}

	const lessonContent = [lesson.title, lesson.content ?? ""].join("\n\n").trim();

	if (!lessonContent) {
		throw new Error("Lesson has no content to process");
	}

	// -------------------------------------------------------------------------
	// Generate assets via OpenAI
	// -------------------------------------------------------------------------
	const raw = await callOpenAI(buildPrompt(lessonContent), env.OPENAI_API_KEY);

	let parsed: Partial<GeneratedAssets>;
	try {
		parsed = JSON.parse(raw) as Partial<GeneratedAssets>;
	} catch {
		throw new Error("OpenAI returned invalid JSON");
	}

	// -------------------------------------------------------------------------
	// Upsert into Supabase
	// -------------------------------------------------------------------------
	const record = {
		lesson_id,
		summary: parsed.summary ?? null,
		flashcards: parsed.flashcards ?? [],
		quiz: parsed.quiz ?? [],
	};

	const { data: stored, error: storeError } = await db.upsert<GeneratedAssets>(
		"ai_generated_assets",
		record,
		"lesson_id"
	);

	if (storeError || !stored) {
		throw new Error(storeError ?? "Failed to store generated assets");
	}

	return stored;
}
