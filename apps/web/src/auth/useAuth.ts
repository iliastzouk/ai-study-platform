import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

type UseAuthResult = {
	session: Session | null;
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
		let isMounted = true;

		supabase.auth
			.getSession()
			.then(({ data, error: sessionError }) => {
				if (!isMounted) return;
				if (sessionError) {
					setError(sessionError);
				}
				setSession(data.session ?? null);
				setLoading(false);
			});

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, currentSession) => {
				if (!isMounted) return;
				setSession(currentSession ?? null);
				setLoading(false);
			}
		);

		return () => {
			isMounted = false;
			authListener.subscription.unsubscribe();
		};
	}, []);

	const signInWithMagicLink = useCallback(async (email: string) => {
		setLoading(true);
		setError(null);
		const { error: signInError } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
			},
		});
		if (signInError) {
			setError(signInError);
		}
		setLoading(false);
	}, []);

	const signOut = useCallback(async () => {
		setLoading(true);
		setError(null);
		const { error: signOutError } = await supabase.auth.signOut();
		if (signOutError) {
			setError(signOutError);
		}
		setLoading(false);
	}, []);

	return useMemo(
		() => ({
			session,
			loading,
			error,
			signInWithMagicLink,
			signOut,
		}),
		[session, loading, error, signInWithMagicLink, signOut]
	);
}
