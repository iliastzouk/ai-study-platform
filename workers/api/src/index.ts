import { verifyJWT } from "./lib/auth";
import type { Env } from "./lib/env";
import { handleGenerateLessonAssets } from "./routes/generate-lesson-assets";
import { handleLessonChat } from "./routes/lesson-chat";

// ---------------------------------------------------------------------------
// CORS helpers
// ---------------------------------------------------------------------------
function getAllowedOrigins(env: Env): string[] {
	return env.CORS_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? [];
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
	const origin = request.headers.get("Origin") ?? "";
	const allowed = getAllowedOrigins(env);
	const allowOrigin = allowed.includes(origin) ? origin : allowed[0] ?? "*";

	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};
}

function json(
	body: unknown,
	status = 200,
	extraHeaders: Record<string, string> = {}
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			...extraHeaders,
		},
	});
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const cors = corsHeaders(request, env);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: cors });
		}

		const url = new URL(request.url);
		const path = url.pathname;

		// Only POST allowed on API routes
		if (request.method !== "POST") {
			return json({ error: "Method not allowed" }, 405, cors);
		}

		// -----------------------------------------------------------------------
		// Auth — every route requires a valid Supabase JWT
		// -----------------------------------------------------------------------
		const user = await verifyJWT(request, env);
		if (!user) {
			return json({ error: "Unauthorized" }, 401, cors);
		}

		// -----------------------------------------------------------------------
		// Routing
		// -----------------------------------------------------------------------
		try {
			if (path === "/api/ai/generate-lesson-assets") {
				const result = await handleGenerateLessonAssets(request, env, user);
				return json(result, 200, cors);
			}

			if (path === "/api/ai/lesson-chat") {
				const result = await handleLessonChat(request, env);
				return json(result, 200, cors);
			}

			return json({ error: "Not found" }, 404, cors);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Internal error";
			console.error("[Worker error]", message);
			return json({ error: message }, 500, cors);
		}
	},
} satisfies ExportedHandler<Env>;
