import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { formatCurrency, formatDate } from "../lib/format";

interface Transaction {
	id: string;
	type: "income" | "expense";
	amount: number;
	date: string;
	description: string | null;
	categories: {
		name: string;
		icon: string;
		color: string;
	} | null;
}

interface Props {
	transactions: Transaction[];
	loading: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	onDelete: () => void;
}

export default function TransactionList({
	transactions,
	loading,
	hasMore,
	onLoadMore,
	onDelete,
}: Props) {
	const [deleting, setDeleting] = useState<Transaction | null>(null);

	async function handleDelete(tx: Transaction) {
		const { error } = await supabase
			.from("transactions")
			.delete()
			.eq("id", tx.id);

		if (error) {
			toast.error("Erro ao excluir transação");
		} else {
			toast.success("Transação excluída");
			setDeleting(null);
			onDelete();
		}
	}

	if (loading && transactions.length === 0) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-[var(--text-soft)]">Carregando transações...</p>
			</div>
		);
	}

	if (!loading && transactions.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-[var(--line)] py-12 text-center">
				<p className="text-sm text-[var(--text-soft)]">
					Nenhuma transação encontrada
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{transactions.map((tx) => (
				<div
					key={tx.id}
					className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 transition hover:bg-[var(--bg-muted)]"
				>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<span
								className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
									tx.type === "income"
										? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
										: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
								}`}
							>
								{tx.type === "income" ? "Entrada" : "Saída"}
							</span>
							{tx.categories && (
								<span className="flex items-center gap-1 text-xs text-[var(--text-soft)]">
									{tx.categories.icon} {tx.categories.name}
								</span>
							)}
						</div>
						{tx.description && (
							<p className="mt-0.5 truncate text-xs text-[var(--text-soft)]">
								{tx.description}
							</p>
						)}
						<p className="mt-0.5 text-[11px] text-[var(--text-soft)]">
							{formatDate(tx.date)}
						</p>
					</div>

					<span
						className={`shrink-0 text-sm font-semibold ${
							tx.type === "income" ? "text-green-500" : "text-red-500"
						}`}
					>
						{tx.type === "income" ? "+" : "-"}
						{formatCurrency(tx.amount)}
					</span>

					<button
						type="button"
						onClick={() => setDeleting(tx)}
						className="shrink-0 rounded-lg p-1 text-[var(--text-soft)] transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
						title="Excluir"
					>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-label="Excluir transação"
					>
						<title>Excluir transação</title>
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						</svg>
					</button>
				</div>
			))}

			{hasMore && (
				<button
					type="button"
					onClick={onLoadMore}
					disabled={loading}
					className="w-full rounded-lg border border-[var(--line)] py-2 text-sm font-medium text-[var(--text-soft)] transition hover:bg-[var(--bg-muted)] disabled:opacity-50"
				>
					{loading ? "Carregando..." : "Carregar mais"}
				</button>
			)}

			{deleting && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] p-6 shadow-xl">
						<h3 className="text-sm font-semibold text-[var(--text)]">
							Excluir transação
						</h3>
						<p className="mt-1 text-sm text-[var(--text-soft)]">
							Tem certeza que deseja excluir esta transação? Esta ação não
							pode ser desfeita.
						</p>
						<div className="mt-4 flex gap-2">
							<button
								type="button"
								onClick={() => handleDelete(deleting)}
								className="rounded-lg bg-red-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-600"
							>
								Excluir
							</button>
							<button
								type="button"
								onClick={() => setDeleting(null)}
								className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-medium text-[var(--text-soft)] transition hover:bg-[var(--bg-muted)]"
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
