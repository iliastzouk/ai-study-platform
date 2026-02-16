import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

type UseAuthResult = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	error: AuthError | null;
	signInWithMagicLink: (email: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<AuthError | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data, error }) => {
			if (error) setError(error);
			setSession(data.session ?? null);
			setLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, currentSession) => {
			setSession(currentSession ?? null);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const signInWithMagicLink = useCallback(async (email: string) => {
		if (!email) return;
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				emailRedirectTo: window.location.origin,
			},
		});

		if (error) setError(error);
		setLoading(false);
	}, []);

	const signOut = useCallback(async () => {
		setLoading(true);
		setError(null);

		const { error } = await supabase.auth.signOut();
		if (error) setError(error);

		setLoading(false);
	}, []);

	const user = session?.user ?? null;

	return useMemo(
		() => ({
			session,
			user,
			loading,
			error,
			signInWithMagicLink,
			signOut,
		}),
		[session, user, loading, error, signInWithMagicLink, signOut]
	);
}
