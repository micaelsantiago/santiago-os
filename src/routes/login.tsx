import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	const { user, isLoading, signIn } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [user, isLoading, navigate]);

	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
				<p className="text-sm text-[var(--text-soft)]">Carregando...</p>
			</main>
		);
	}

	if (user) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		const { error } = await signIn(email, password);

		if (error) {
			toast.error(error || "Erro ao entrar. Tente novamente.");
			setSubmitting(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
						Entrar
					</h1>
					<p className="mt-1.5 text-sm text-[var(--text-soft)]">
						Acesse sua conta para continuar.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					<div>
						<label
							htmlFor="email"
							className="mb-1.5 block text-sm font-medium text-[var(--text)]"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							required
							autoComplete="email"
							className="w-full rounded-lg border border-[var(--line)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
							placeholder="seu@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="mb-1.5 block text-sm font-medium text-[var(--text)]"
						>
							Senha
						</label>
						<input
							id="password"
							type="password"
							required
							autoComplete="current-password"
							className="w-full rounded-lg border border-[var(--line)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
							placeholder="Sua senha"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					<button
						type="submit"
						disabled={submitting}
						className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{submitting ? "Entrando..." : "Entrar"}
					</button>
				</form>

				<p className="mt-6 text-center text-sm text-[var(--text-soft)]">
					<Link
						to="/reset-password"
						className="font-medium text-[var(--text)] no-underline transition hover:text-[var(--text-soft)]"
					>
						Esqueceu a senha?
					</Link>
				</p>
			</div>
		</main>
	);
}
