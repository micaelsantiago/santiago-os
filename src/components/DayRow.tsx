import { formatCurrency, getDayName } from "../lib/format";
import type { DayRowData } from "../lib/types";

interface Props {
	data: DayRowData;
	maxDayAmount: number;
	isExpanded: boolean;
	onToggle: () => void;
}

export default function DayRow({
	data,
	maxDayAmount,
	isExpanded,
	onToggle,
}: Props) {
	const {
		day,
		hasIncome,
		hasExpense,
		totalIncome,
		totalExpense,
		accumulatedBalance,
		transactions,
		isToday,
		isFuture,
	} = data;

	const dayTotal = Math.abs(totalIncome) + Math.abs(totalExpense);
	const barWidth = maxDayAmount > 0 ? (dayTotal / maxDayAmount) * 100 : 0;
	const hasActivity = hasIncome || hasExpense;

	let indicatorClass = "";
	if (isFuture) {
		indicatorClass = "border-2 border-[var(--text-soft)] bg-transparent";
	} else if (hasIncome) {
		indicatorClass = "bg-green-500";
	} else if (hasExpense) {
		indicatorClass = "bg-red-500";
	} else {
		indicatorClass = "bg-[var(--text-soft)] opacity-40";
	}

	const month = isToday ? new Date().getMonth() + 1 : new Date().getMonth() + 1;
	const year = new Date().getFullYear();
	const dayName = getDayName(day, month, year);

	return (
		<>
			<button
				type="button"
				onClick={hasActivity ? onToggle : undefined}
				className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition ${
					isFuture ? "opacity-45" : ""
				} ${isToday ? "bg-[var(--accent)]/10" : ""} ${
					hasActivity
						? "cursor-pointer hover:bg-[var(--bg-muted)]"
						: "cursor-default"
				}`}
			>
				<div className="flex w-20 items-center gap-2 shrink-0">
					<div className={`h-2 w-2 rounded-full shrink-0 ${indicatorClass}`} />
					<div className="flex flex-col">
						<span className="text-xs font-medium text-[var(--text)]">
							{dayName} {day}
						</span>
						{isToday && (
							<span className="text-[10px] font-semibold text-[var(--accent)]">
								hoje
							</span>
						)}
					</div>
				</div>

				<div className="flex-1 px-2">
					<div className="h-1 rounded-full bg-[var(--bg-muted)]">
						{!isFuture && barWidth > 0 && (
							<div
								className="h-1 rounded-full bg-[var(--accent)]/40"
								style={{ width: `${barWidth}%` }}
							/>
						)}
					</div>
				</div>

				<div className="w-24 text-right shrink-0">
					{hasIncome ? (
						<span className="text-green-500 font-medium">
							{formatCurrency(totalIncome)}
						</span>
					) : (
						<span className="text-[var(--text-soft)]">—</span>
					)}
				</div>

				<div className="w-24 text-right shrink-0">
					{hasExpense ? (
						<span className="text-red-500 font-medium">
							− {formatCurrency(totalExpense)}
						</span>
					) : (
						<span className="text-[var(--text-soft)]">—</span>
					)}
				</div>

				<div className="w-28 text-right shrink-0">
					<span
						className={`font-medium ${
							accumulatedBalance > 0
								? "text-green-500"
								: accumulatedBalance < 0
									? "text-red-500"
									: "text-[var(--text)]"
						}`}
					>
						{formatCurrency(accumulatedBalance)}
					</span>
				</div>
			</button>

			{isExpanded && hasActivity && (
				<div className="border-t border-[var(--line)] bg-[var(--bg-muted)]/50 px-3 py-2">
					{transactions.map((tx) => (
						<div key={tx.id} className="flex items-center gap-3 py-1.5 text-sm">
							<span className="shrink-0">{tx.categories?.icon ?? "📁"}</span>
							<span className="flex-1 truncate text-[var(--text)]">
								{tx.description || "Sem descrição"}
							</span>
							<span className="text-xs text-[var(--text-soft)] shrink-0">
								{tx.categories?.name ?? "Sem categoria"}
							</span>
							<span
								className={`shrink-0 text-right font-medium ${
									tx.type === "income" ? "text-green-500" : "text-red-500"
								}`}
							>
								{tx.type === "income" ? "+ " : "− "}
								{formatCurrency(tx.amount)}
							</span>
						</div>
					))}
				</div>
			)}
		</>
	);
}
