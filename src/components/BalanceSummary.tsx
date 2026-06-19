import { formatCurrency } from "../lib/format";

interface Props {
	saldo: number;
	totalIncome: number;
	totalExpense: number;
	periodLabel: string;
}

export default function BalanceSummary({
	saldo,
	totalIncome,
	totalExpense,
	periodLabel,
}: Props) {
	const cards = [
		{
			label: "Saldo",
			value: saldo,
			color: saldo > 0 ? "text-green-500" : saldo < 0 ? "text-red-500" : "text-[var(--text-soft)]",
		},
		{
			label: "Entradas",
			value: totalIncome,
			color: "text-green-500",
		},
		{
			label: "Saídas",
			value: totalExpense,
			color: "text-red-500",
		},
	];

	return (
		<div>
			<p className="mb-3 text-xs font-medium text-[var(--text-soft)]">{periodLabel}</p>
			<div className="grid gap-3 sm:grid-cols-3">
				{cards.map((card) => (
					<div
						key={card.label}
						className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4"
					>
						<p className="text-xs font-medium text-[var(--text-soft)]">{card.label}</p>
						<p className={`mt-1 text-xl font-bold ${card.color}`}>
							{formatCurrency(card.value)}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
