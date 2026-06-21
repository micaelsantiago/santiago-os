import { useMemo, useState } from "react";
import { getDaysInMonth, isFutureDay, isToday } from "../lib/format";
import type { DayRowData, DayTransaction } from "../lib/types";
import DayRow from "./DayRow";

interface Props {
	transactions: DayTransaction[];
	saldoInicial: number;
	month: number;
	year: number;
}

export default function DailyView({
	transactions,
	saldoInicial,
	month,
	year,
}: Props) {
	const [expandedDate, setExpandedDate] = useState<string | null>(null);

	const days = useMemo(() => {
		const totalDays = getDaysInMonth(month, year);
		const txsByDay = new Map<string, DayTransaction[]>();

		for (const tx of transactions) {
			const dateKey = tx.date ?? "";
			if (!txsByDay.has(dateKey)) {
				txsByDay.set(dateKey, []);
			}
			txsByDay.get(dateKey)?.push(tx);
		}

		const dayRows: DayRowData[] = [];
		let runningBalance = saldoInicial;
		let maxDayAmount = 0;

		for (let d = 1; d <= totalDays; d++) {
			const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
			const dayTxs = txsByDay.get(dateKey) || [];
			const totalIncome = dayTxs
				.filter((tx) => tx.type === "income")
				.reduce((sum, tx) => sum + tx.amount, 0);
			const totalExpense = dayTxs
				.filter((tx) => tx.type === "expense")
				.reduce((sum, tx) => sum + tx.amount, 0);

			const dayFuture = isFutureDay(d, month, year);
			const dayIsToday = isToday(d, month, year);

			if (!dayFuture) {
				runningBalance += totalIncome - totalExpense;
			}

			const dayTotal = Math.abs(totalIncome) + Math.abs(totalExpense);
			if (dayTotal > maxDayAmount) {
				maxDayAmount = dayTotal;
			}

			dayRows.push({
				day: d,
				dateKey,
				hasIncome: totalIncome > 0,
				hasExpense: totalExpense > 0,
				totalIncome,
				totalExpense,
				accumulatedBalance: runningBalance,
				transactions: dayTxs,
				isToday: dayIsToday,
				isFuture: dayFuture,
				isCurrentMonth:
					month === new Date().getMonth() + 1 &&
					year === new Date().getFullYear(),
			});
		}

		return { dayRows, maxDayAmount };
	}, [transactions, saldoInicial, month, year]);

	function toggleDay(dateKey: string) {
		setExpandedDate((prev) => (prev === dateKey ? null : dateKey));
	}

	return (
		<div className="rounded-xl border border-[var(--line)] bg-[var(--bg)]">
			<div className="flex items-center gap-2 border-b border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--text-soft)]">
				<div className="w-20 shrink-0">Data</div>
				<div className="flex-1 px-2" />
				<div className="w-24 shrink-0 text-right">Entrada</div>
				<div className="w-24 shrink-0 text-right">Saída</div>
				<div className="w-28 shrink-0 text-right">Acumulado</div>
			</div>

			<div className="divide-y divide-[var(--line)]/50">
				{days.dayRows.map((row) => (
					<DayRow
						key={row.dateKey}
						data={row}
						maxDayAmount={days.maxDayAmount}
						isExpanded={expandedDate === row.dateKey}
						onToggle={() => toggleDay(row.dateKey)}
					/>
				))}
			</div>
		</div>
	);
}
