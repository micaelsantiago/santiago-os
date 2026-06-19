import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<p className="text-sm text-[var(--text-soft)]">Carregando...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
			<div className="text-center">
				<h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
					Bem vindo
				</h1>
				{user && (
					<p className="mt-2 text-sm text-[var(--text-soft)]">{user.email}</p>
				)}
			</div>
		</div>
	);
}
