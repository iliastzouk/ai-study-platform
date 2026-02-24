import { type PropsWithChildren } from "react";
import { useAuth } from "./useAuth";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: PropsWithChildren) {
	const auth = useAuth();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
