import { useState, type FormEvent } from "react";
import { useAuthContext } from "../auth/AuthProvider";

export function LoginPage() {
	const { signInWithMagicLink, loading, error, session } = useAuthContext();
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const cleanEmail = email.trim();
		if (!cleanEmail) return;

		setSubmitted(false);
		await signInWithMagicLink(cleanEmail);
		setSubmitted(true);
	};

	if (session) {
		return (
			<section>
				<h1>You’re signed in</h1>
				<p>You can close this page or continue to the app.</p>
			</section>
		);
	}

	return (
		<section>
			<h1>Sign in</h1>
			<p>Use your email to receive a magic link.</p>

			<form onSubmit={handleSubmit}>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					disabled={loading || submitted}
				/>

				<button
					type="submit"
					disabled={loading || submitted || !email.trim()}
				>
					{loading ? "Sending..." : "Send magic link"}
				</button>
			</form>

			{submitted && !error ? (
				<p>Check your inbox for the sign-in link.</p>
			) : null}

			{error ? <p role="alert">{error.message}</p> : null}
		</section>
	);
}

export default LoginPage;
