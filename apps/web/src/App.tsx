import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";

import LoginPage from "./pages/LoginPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePage from "./pages/CoursePage";
import AppLayout from "./layouts/AppLayout";

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
					{/* Public */}
					<Route path="/login" element={<LoginPage />} />

					{/* Protected layout */}
					<Route
						element={
							<RequireAuth>
								<AppLayout />
							</RequireAuth>
						}
					>
						<Route index element={<Dashboard />} />
						<Route path="courses" element={<CoursesPage />} />
						<Route path="courses/:slug" element={<CoursePage />} />
					</Route>

					{/* Fallback */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
