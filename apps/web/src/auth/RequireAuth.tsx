import { useEffect, type ReactNode } from "react";
import { useAuthContext } from "./useAuthContext";

type RequireAuthProps = {
	children: ReactNode;
	loadingFallback?: ReactNode;
	unauthenticatedFallback?: ReactNode;
	redirectTo?: string;
};

export function RequireAuth({
	children,
	loadingFallback = null,
	unauthenticatedFallback = null,
	redirectTo = "/login",
}: RequireAuthProps) {
	const { session, loading } = useAuthContext();

	useEffect(() => {
		if (!loading && !session) {
			window.location.assign(redirectTo);
		}
	}, [loading, session, redirectTo]);

	if (loading) {
		return <>{loadingFallback}</>;
	}

	if (!session) {
		return <>{unauthenticatedFallback}</>;
	}

	return <>{children}</>;
}
