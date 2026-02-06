import {
	createContext,
	useContext,
	type ReactNode,
	type PropsWithChildren,
} from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { useAuth } from "./useAuth";

type AuthContextValue = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	error: AuthError | null;
	signInWithMagicLink: (email: string) => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
	const auth = useAuth();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}

	return context;
}
