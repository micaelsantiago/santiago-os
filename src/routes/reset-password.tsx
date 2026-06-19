import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/reset-password")({
	component: ResetPasswordPage,
});

function ResetPasswordPage() {
	const { isLoading, resetPassword, updatePassword } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	useEffect(() => {
		const hash = window.location.hash;
		if (hash && hash.includes("type=recovery")) {
			setShowNewPassword(true);
		}
	}, []);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "PASSWORD_RECOVERY") {
				setShowNewPassword(true);
			}
		});
		return () => subscription.unsubscribe();
	}, []);

	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
				<p className="text-sm text-[var(--text-soft)]">Carregando...</p>
			</main>
		);
	}

	const handleSendReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		const { error } = await resetPassword(email);

		setSubmitting(false);

		if (error) {
			toast.error(error);
		} else {
			toast.success(
				"Se este email estiver cadastrado, você receberá um link de redefinição.",
			);
		}
	};

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		if (password !== confirmPassword) {
			toast.error("As senhas não conferem.");
			setSubmitting(false);
			return;
		}

		if (password.length < 6) {
			toast.error("A senha deve ter no mínimo 6 caracteres.");
			setSubmitting(false);
			return;
		}

		const { error } = await updatePassword(password);

		setSubmitting(false);

		if (error) {
			toast.error(error);
		} else {
			toast.success("Senha redefinida com sucesso!");
			setTimeout(() => {
				window.location.href = "/login";
			}, 2000);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
			<div className="w-full max-w-sm">
				{showNewPassword ? (
					<>
						<div className="mb-8 text-center">
							<h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
								Redefinir senha
							</h1>
							<p className="mt-1.5 text-sm text-[var(--text-soft)]">
								Escolha uma nova senha para sua conta.
							</p>
						</div>

						<form
							onSubmit={handleUpdatePassword}
							className="flex flex-col gap-5"
						>
							<div>
								<label
									htmlFor="new-password"
									className="mb-1.5 block text-sm font-medium text-[var(--text)]"
								>
									Nova senha
								</label>
								<input
									id="new-password"
									type="password"
									required
									autoComplete="new-password"
									className="w-full rounded-lg border border-[var(--line)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
									placeholder="Nova senha"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>

							<div>
								<label
									htmlFor="confirm-password"
									className="mb-1.5 block text-sm font-medium text-[var(--text)]"
								>
									Confirmar senha
								</label>
								<input
									id="confirm-password"
									type="password"
									required
									autoComplete="new-password"
									className="w-full rounded-lg border border-[var(--line)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
									placeholder="Confirme a nova senha"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{submitting ? "Redefinindo..." : "Redefinir senha"}
							</button>
						</form>
					</>
				) : (
					<>
						<div className="mb-8 text-center">
							<h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
								Esqueceu a senha?
							</h1>
							<p className="mt-1.5 text-sm text-[var(--text-soft)]">
								Digite seu email para receber um link de redefinição.
							</p>
						</div>

						<form onSubmit={handleSendReset} className="flex flex-col gap-5">
							<div>
								<label
									htmlFor="reset-email"
									className="mb-1.5 block text-sm font-medium text-[var(--text)]"
								>
									Email
								</label>
								<input
									id="reset-email"
									type="email"
									required
									autoComplete="email"
									className="w-full rounded-lg border border-[var(--line)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
									placeholder="seu@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
							>
								{submitting ? "Enviando..." : "Enviar link de redefinição"}
							</button>
						</form>

						<p className="mt-6 text-center text-sm text-[var(--text-soft)]">
							<Link
								to="/login"
								className="font-medium text-[var(--text)] no-underline transition hover:text-[var(--text-soft)]"
							>
								Voltar para o login
							</Link>
						</p>
					</>
				)}
			</div>
		</main>
	);
}
