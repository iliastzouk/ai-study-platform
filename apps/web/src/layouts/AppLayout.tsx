import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth/AuthProvider";

export function AppLayout() {
	const { user, signOut, loading } = useAuthContext();
	const location = useLocation();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	useEffect(() => {
		// Close mobile nav on route change.
		setMobileNavOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (!mobileNavOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMobileNavOpen(false);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [mobileNavOpen]);

	const userEmail = user?.email ?? null;
	const initials = useMemo(() => {
		if (!userEmail) return "U";
		const left = userEmail.split("@")[0] ?? "u";
		const parts = left.split(/[._-]+/).filter(Boolean);
		const first = (parts[0]?.[0] ?? left[0] ?? "u").toUpperCase();
		const second = (parts[1]?.[0] ?? left[1] ?? "").toUpperCase();
		return `${first}${second}`.slice(0, 2);
	}, [userEmail]);

	const navLinkClass = ({ isActive }: { isActive: boolean }) =>
		`navLink${isActive ? " navLinkActive" : ""}`;

	return (
		<div className="appShell">
			<a className="srOnly" href="#main">
				Skip to content
			</a>

			<header className="topbar">
				<div className="topbarInner">
					<div className="brand">
						<button
							type="button"
							className="iconBtn"
							aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
							aria-expanded={mobileNavOpen}
							onClick={() => setMobileNavOpen((v) => !v)}
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="navIcon"
								aria-hidden="true"
							>
								<path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>

						<div className="brandMark" aria-hidden="true" />
						<div className="brandTitle">AI Study Platform</div>
					</div>

					<div className="topbarActions">
						{userEmail ? (
							<div className="userChip" title={userEmail}>
								<div className="avatar" aria-hidden="true">
									{initials}
								</div>
								<div className="userEmail">{userEmail}</div>
							</div>
						) : null}

						{userEmail ? (
							<button
								type="button"
								className="btn btnDanger"
								onClick={() => void signOut()}
								disabled={loading}
							>
								Sign out
							</button>
						) : null}
					</div>
				</div>
			</header>

			<div className="layoutBody">
				<aside className="sidebar" aria-label="Primary">
					<div className="sidebarInner">
						<div className="navGroupTitle">Menu</div>
						<ul className="navList">
							<li>
								<NavLink to="/" end className={navLinkClass}>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="navIcon"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"
										/>
									</svg>
									Dashboard
								</NavLink>
							</li>
							<li>
								<NavLink to="/courses" className={navLinkClass}>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="navIcon"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12Zm4-8h8M8 15h6"
										/>
									</svg>
									Courses
								</NavLink>
							</li>
						</ul>

						<div className="card cardPad">
							<div style={{ fontWeight: 650, letterSpacing: "-0.01em" }}>
								Tip
							</div>
							<p className="kicker" style={{ margin: "10px 0 0" }}>
								Pick a course to start learning. Your progress view will live on the
								dashboard.
							</p>
						</div>
					</div>
				</aside>

				<main id="main" className="content">
					<div className="contentInner">
						<Outlet />
					</div>
				</main>
			</div>

			{/* Mobile drawer */}
			<div
				className={`drawerOverlay${mobileNavOpen ? " drawerOverlayOpen" : ""}`}
				role="presentation"
				onClick={() => setMobileNavOpen(false)}
			/>
			<aside
				className={`drawer${mobileNavOpen ? " drawerOpen" : ""}`}
				aria-label="Mobile menu"
			>
				<div className="drawerHeader">
					<div className="brand">
						<div className="brandMark" aria-hidden="true" />
						<div className="brandTitle">Menu</div>
					</div>
					<button
						type="button"
						className="iconBtn"
						aria-label="Close menu"
						onClick={() => setMobileNavOpen(false)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="navIcon"
							aria-hidden="true"
						>
							<path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
						</svg>
					</button>
				</div>
				<div className="drawerBody">
					<div className="navGroupTitle">Navigate</div>
					<ul className="navList">
						<li>
							<NavLink to="/" end className={navLinkClass}>
								Dashboard
							</NavLink>
						</li>
						<li>
							<NavLink to="/courses" className={navLinkClass}>
								Courses
							</NavLink>
						</li>
					</ul>
				</div>
				<div className="drawerFooter">
					{userEmail ? (
						<div style={{ display: "grid", gap: 10 }}>
							<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
								<div className="avatar" aria-hidden="true">
									{initials}
								</div>
								<div style={{ minWidth: 0 }}>
									<div style={{ fontWeight: 650 }}>Signed in</div>
									<div className="userEmail">{userEmail}</div>
								</div>
							</div>
							<button
								type="button"
								className="btn btnDanger"
								onClick={() => void signOut()}
								disabled={loading}
							>
								Sign out
							</button>
						</div>
					) : (
						<div className="kicker">Sign in to enroll in courses.</div>
					)}
				</div>
			</aside>
		</div>
	);
}

export default AppLayout;
