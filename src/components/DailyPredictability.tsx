import { formatCurrency } from "../lib/format";
import type { RecurringTransaction } from "../lib/types";

interface Props {
	saldoHistorico: number;
	recurringTransactions: RecurringTransaction[];
	diasRestantes: number;
}

export default function DailyPredictability({
	saldoHistorico,
	recurringTransactions,
	diasRestantes,
}: Props) {
	const totalGastosFixos = recurringTransactions.reduce(
		(sum, rt) => sum + rt.amount,
		0,
	);

	const margemDiaria =
		diasRestantes > 0 ? (saldoHistorico - totalGastosFixos) / diasRestantes : 0;

	const isMargemNegativa = margemDiaria < 0;

	const visibleItems = recurringTransactions.slice(0, 3);
	const hiddenCount = recurringTransactions.length - visibleItems.length;

	return (
		<div className="grid gap-3 md:grid-cols-2">
			<div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
				<p className="text-xs font-medium text-[var(--text-soft)]">
					Disponível por dia
				</p>
				<p
					className={`mt-1 text-xl font-bold ${
						isMargemNegativa
							? "text-red-500"
							: margemDiaria > 0
								? "text-green-500"
								: "text-[var(--text)]"
					}`}
				>
					{formatCurrency(margemDiaria)}
				</p>
				<p className="mt-1 text-xs text-[var(--text-soft)]">
					{diasRestantes}{" "}
					{diasRestantes === 1 ? "dia restante" : "dias restantes"} no mês
				</p>
				{isMargemNegativa && (
					<div className="mt-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500">
						Gastos fixos excedem o saldo disponível
					</div>
				)}
			</div>

			<div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
				<p className="text-xs font-medium text-[var(--text-soft)]">
					Gastos fixos restantes
				</p>
				<p className="mt-1 text-xl font-bold text-red-500">
					− {formatCurrency(totalGastosFixos)}
				</p>
				{recurringTransactions.length > 0 ? (
					<p className="mt-1 text-xs text-[var(--text-soft)]">
						{visibleItems.map((rt) => (
							<span key={rt.id}>
								{rt.name} (dia {rt.day_of_month})
								{rt !== visibleItems[visibleItems.length - 1] && " · "}
							</span>
						))}
						{hiddenCount > 0 && (
							<span>
								{" "}
								+ {hiddenCount} {hiddenCount === 1 ? "outro" : "outros"}
							</span>
						)}
					</p>
				) : (
					<p className="mt-1 text-xs text-[var(--text-soft)]">
						Nenhum gasto fixo restante
					</p>
				)}
			</div>
		</div>
	);
}
