import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Shared AI types used in the Database schema and across the app
// ---------------------------------------------------------------------------
export type AiFlashcard = { q: string; a: string };
export type AiQuizItem = {
	question: string;
	choices: [string, string, string, string];
	correct: number;
	explanation: string;
};
export type QuizAnswer = { question_index: number; selected: number };

export type Database = {
	public: {
		Tables: {
			courses: {
				Row: {
					id: string;
					slug: string;
					title: string;
					description: string | null;
					is_published: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					slug: string;
					title: string;
					description?: string | null;
					is_published?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					slug?: string;
					title?: string;
					description?: string | null;
					is_published?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			modules: {
				Row: {
					id: string;
					course_id: string;
					week_number: number;
					title: string;
					description: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					course_id: string;
					week_number: number;
					title: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					course_id?: string;
					week_number?: number;
					title?: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			lessons: {
				Row: {
					id: string;
					module_id: string;
					lesson_number: number;
					lesson_type: string;
					title: string;
					content: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					module_id: string;
					lesson_number: number;
					lesson_type?: string;
					title: string;
					content?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					module_id?: string;
					lesson_number?: number;
					lesson_type?: string;
					title?: string;
					content?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			questions: {
				Row: {
					id: string;
					lesson_id: string;
					prompt: string;
					question_type: string;
					choices: Record<string, unknown> | null;
					answer: Record<string, unknown> | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					lesson_id: string;
					prompt: string;
					question_type?: string;
					choices?: Record<string, unknown> | null;
					answer?: Record<string, unknown> | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					lesson_id?: string;
					prompt?: string;
					question_type?: string;
					choices?: Record<string, unknown> | null;
					answer?: Record<string, unknown> | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			user_progress: {
				Row: {
					id: string;
					user_id: string;
					course_id: string;
					module_id: string | null;
					lesson_id: string | null;
					question_id: string | null;
					status: string;
					score: number | null;
					last_interaction_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					course_id: string;
					module_id?: string | null;
					lesson_id?: string | null;
					question_id?: string | null;
					status?: string;
					score?: number | null;
					last_interaction_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					course_id?: string;
					module_id?: string | null;
					lesson_id?: string | null;
					question_id?: string | null;
					status?: string;
					score?: number | null;
					last_interaction_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			enrollments: {
				Row: {
					id: string;
					user_id: string;
					course_id: string;
					status: string;
					enrolled_at: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					course_id: string;
					status?: string;
					enrolled_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					course_id?: string;
					status?: string;
					enrolled_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			ai_generated_assets: {
				Row: {
					id: string;
					lesson_id: string;
					summary: string | null;
					flashcards: AiFlashcard[] | null;
					quiz: AiQuizItem[] | null;
					generated_at: string;
					updated_at: string;
				};
				Insert: never; // write via service role only
				Update: never;
				Relationships: [];
			};
			quiz_attempts: {
				Row: {
					id: string;
					user_id: string;
					lesson_id: string;
					answers: QuizAnswer[];
					score: number | null;
					completed_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					lesson_id: string;
					answers: QuizAnswer[];
					score?: number | null;
					completed_at?: string;
				};
				Update: never; // append-only
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables.");
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
	supabaseUrl,
	supabaseAnonKey
);

export default supabase;

// ---------------------------------------------------------------------------
// Worker API base URL
// ---------------------------------------------------------------------------
export const apiBaseUrl = (
	import.meta.env.VITE_API_BASE_URL as string | undefined ?? ""
).replace(/\/$/, "");
