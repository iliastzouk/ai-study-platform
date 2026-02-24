import { createContext } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export type AuthContextValue = {
	session: Session | null;
	user: User | null;
	loading: boolean;
	error: AuthError | null;
	signInWithMagicLink: (email: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
