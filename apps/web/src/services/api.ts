import { apiBaseUrl } from "./supabase";
import type { AiFlashcard, AiQuizItem } from "./supabase";

export type GeneratedAssets = {
	lesson_id: string;
	summary: string | null;
	flashcards: AiFlashcard[];
	quiz: AiQuizItem[];
	generated_at: string;
	updated_at: string;
};

export type ChatReply = { reply: string };

/**
 * Calls a Worker endpoint with the user's Supabase JWT.
 * Throws on non-2xx responses.
 */
async function callWorker<T>(
	path: string,
	accessToken: string,
	body: Record<string, unknown>
): Promise<T> {
	const res = await fetch(`${apiBaseUrl}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(body),
	});

	const data = (await res.json()) as T & { error?: string };

	if (!res.ok) {
		throw new Error((data as { error?: string }).error ?? "Worker error");
	}

	return data;
}

export async function generateLessonAssets(
	lessonId: string,
	accessToken: string,
	force = false
): Promise<GeneratedAssets> {
	return callWorker<GeneratedAssets>(
		"/api/ai/generate-lesson-assets",
		accessToken,
		{ lesson_id: lessonId, force }
	);
}

export async function askLesson(
	lessonId: string,
	message: string,
	accessToken: string
): Promise<ChatReply> {
	return callWorker<ChatReply>("/api/ai/lesson-chat", accessToken, {
		lesson_id: lessonId,
		message,
	});
}
