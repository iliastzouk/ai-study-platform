import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function Dashboard() {
	return (
		<section>
			<h1>Welcome back</h1>
			<p>Your learning dashboard will appear here.</p>
		</section>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route
						path="/"
						element={
							<RequireAuth>
								<Dashboard />
							</RequireAuth>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
