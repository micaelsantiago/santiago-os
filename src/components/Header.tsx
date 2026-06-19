import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { user, isLoading, signOut } = useAuth();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.invalidate();
	};

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex items-center justify-between py-3 sm:py-4">
				<Link
					to="/"
					className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
				>
					<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
					Santiago OS
				</Link>

				<div className="flex items-center gap-1.5 sm:gap-2">
					{!isLoading && user ? (
						<button
							type="button"
							onClick={handleSignOut}
							className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
						>
							Sair
						</button>
					) : (
						<Link
							to="/login"
							className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
						>
							Entrar
						</Link>
					)}

					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
