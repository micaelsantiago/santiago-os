import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
				<p className="text-sm text-[var(--text-soft)]">Carregando...</p>
			</main>
		);
	}

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4">
			<div className="text-center">
				<h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
					Bem vindo
				</h1>
				{user && (
					<p className="mt-2 text-sm text-[var(--text-soft)]">
						{user.email}
					</p>
				)}
			</div>
		</main>
	);
}
