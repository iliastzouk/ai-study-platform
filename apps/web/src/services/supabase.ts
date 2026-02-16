import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
					title: string;
					content: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					module_id: string;
					lesson_number: number;
					title: string;
					content?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					module_id?: string;
					lesson_number?: number;
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
