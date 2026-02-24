import type { Env } from "./env";

export type AuthUser = {
	id: string;
	email: string;
};

/**
 * Verifies the Supabase JWT by calling /auth/v1/user with the user's
 * access token. Uses the service role key as the api key — this is safe
 * because the call is server-side only inside the Worker.
 *
 * Returns the authenticated user or null if the token is missing/invalid.
 */
export async function verifyJWT(
	request: Request,
	env: Env
): Promise<AuthUser | null> {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader?.startsWith("Bearer ")) return null;

	const token = authHeader.slice(7);

	const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
		headers: {
			Authorization: `Bearer ${token}`,
			apikey: env.SUPABASE_SERVICE_ROLE_KEY,
		},
	});

	if (!response.ok) return null;

	const user = (await response.json()) as { id?: string; email?: string };
	if (!user.id || !user.email) return null;

	return { id: user.id, email: user.email };
}
