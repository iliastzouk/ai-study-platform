export interface Env {
	OPENAI_API_KEY: string;
	SUPABASE_URL: string;
	SUPABASE_SERVICE_ROLE_KEY: string;
	/** Comma-separated list of allowed origins, e.g. http://localhost:5173,https://yourdomain.com */
	CORS_ALLOWED_ORIGINS: string;
}