import type { Env } from "./env";

/**
 * Thin service-role wrapper around the Supabase REST API.
 * All calls from the Worker use the service role key, which bypasses RLS.
 * Never expose this key to the client.
 */
export function supabaseServiceClient(env: Env) {
	const baseUrl = `${env.SUPABASE_URL}/rest/v1`;
	const headers = {
		apikey: env.SUPABASE_SERVICE_ROLE_KEY,
		Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
		"Content-Type": "application/json; charset=utf-8",
		Prefer: "return=representation",
	};

	async function get<T>(
		table: string,
		query: string
	): Promise<{ data: T | null; error: string | null }> {
		const res = await fetch(`${baseUrl}/${table}?${query}`, { headers });
		if (!res.ok) {
			const body = (await res.json()) as { message?: string };
			return { data: null, error: body.message ?? "Supabase error" };
		}
		const rows = (await res.json()) as T[];
		return { data: (rows[0] as T) ?? null, error: null };
	}

	async function upsert<T>(
		table: string,
		body: Record<string, unknown>,
		conflictColumn: string
	): Promise<{ data: T | null; error: string | null }> {
		const res = await fetch(`${baseUrl}/${table}?on_conflict=${conflictColumn}`, {
			method: "POST",
			headers: {
				...headers,
				Prefer: `resolution=merge-duplicates,return=representation`,
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			const err = (await res.json()) as { message?: string };
			return { data: null, error: err.message ?? "Supabase upsert error" };
		}
		const rows = (await res.json()) as T[];
		return { data: (rows[0] as T) ?? null, error: null };
	}

	return { get, upsert };
}
