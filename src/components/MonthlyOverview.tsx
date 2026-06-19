import { formatCurrency } from "../lib/format";

interface CategoryTotal {
	id: string;
	name: string;
	icon: string;
	color: string;
	total: number;
	percentage: number;
}

interface Props {
	categories: CategoryTotal[];
}

export default function MonthlyOverview({ categories }: Props) {
	if (categories.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-[var(--line)] py-10 text-center">
				<p className="text-sm text-[var(--text-soft)]">Nenhuma movimentação neste mês</p>
			</div>
		);
	}

	return (
		<div>
			<h3 className="mb-3 text-sm font-semibold text-[var(--text)]">
				Resumo por categoria
			</h3>
			<div className="space-y-3">
				{categories.map((cat) => (
					<div key={cat.id}>
						<div className="mb-1 flex items-center justify-between text-sm">
							<span className="flex items-center gap-1.5 text-[var(--text)]">
								<span>{cat.icon}</span>
								<span>{cat.name}</span>
							</span>
							<span className="text-xs text-[var(--text-soft)]">
								{formatCurrency(cat.total)} ({cat.percentage}%)
							</span>
						</div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-muted)]">
							<div
								className="h-full rounded-full transition-all duration-300"
								style={{
									width: `${Math.max(cat.percentage, 2)}%`,
									backgroundColor: cat.color,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
