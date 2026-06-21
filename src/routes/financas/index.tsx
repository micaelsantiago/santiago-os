import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import BalanceSummary from "../../components/BalanceSummary";
import DailyPredictability from "../../components/DailyPredictability";
import DailyView from "../../components/DailyView";
import FilterBar from "../../components/FilterBar";
import TransactionForm from "../../components/TransactionForm";
import {
	formatMonthYear,
	getCurrentMonth,
	getCurrentYear,
	getMonthDateRange,
	getMonthState,
} from "../../lib/format";
import { supabase } from "../../lib/supabase";
import type { DayTransaction, RecurringTransaction } from "../../lib/types";

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

function parseSearchParams(search: Record<string, string>) {
	return {
		mes: Number(search.mes) || getCurrentMonth(),
		ano: Number(search.ano) || getCurrentYear(),
		categoria: (search.categoria || "").split(",").filter(Boolean),
	};
}

export const Route = createFileRoute("/financas/")({
	validateSearch: (search: Record<string, string>) => search,
	component: FinancasPage,
});

function FinancasPage() {
	const search = useSearch({ strict: false });
	const navigate = useNavigate();
	const params = parseSearchParams(search as Record<string, string>);

	const [month, setMonth] = useState(params.mes);
	const [year, setYear] = useState(params.ano);
	const [categoryIds, setCategoryIds] = useState<string[]>(params.categoria);

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [saldoInicial, setSaldoInicial] = useState(0);
	const [recurringTransactions, setRecurringTransactions] = useState<
		RecurringTransaction[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);

	const periodLabel = formatMonthYear(month, year);
	const monthState = getMonthState(month, year);
	const today = new Date();
	const todayDay = today.getDate();

	const totalIncome = transactions
		.filter((tx) => tx.type === "income")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const totalExpense = transactions
		.filter((tx) => tx.type === "expense")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const saldo = totalIncome - totalExpense;

	const diasRestantes =
		monthState === "current"
			? new Date(year, month, 0).getDate() - todayDay
			: 0;

	const loadData = useCallback(async () => {
		setLoading(true);

		const { startDate, endDate } = getMonthDateRange(month, year);

		const txQuery = supabase
			.from("transactions")
			.select(
				"id, type, amount, date, description, categories(name, icon, color)",
			)
			.gte("date", startDate)
			.lte("date", endDate)
			.order("date", { ascending: true });

		const finalTxQuery =
			categoryIds.length > 0 ? txQuery.in("category_id", categoryIds) : txQuery;

		const [txResult, histResult, recResult] = await Promise.all([
			finalTxQuery,
			supabase
				.from("transactions")
				.select("type, amount")
				.lt("date", startDate),
			supabase
				.from("recurring_transactions")
				.select("id, name, amount, day_of_month, categories(name, icon, color)")
				.eq("active", true)
				.order("day_of_month", { ascending: true }),
		]);

		if (!txResult.error && txResult.data) {
			setTransactions(txResult.data as unknown as Transaction[]);
		}

		if (!histResult.error && histResult.data) {
			const histData = histResult.data as { type: string; amount: number }[];
			const initial = histData.reduce((acc, t) => {
				return t.type === "income" ? acc + t.amount : acc - t.amount;
			}, 0) as unknown as number;
			setSaldoInicial(initial);
		}

		if (!recResult.error && recResult.data) {
			const recs = recResult.data as unknown as RecurringTransaction[];
			const futureRecs = recs.filter(
				(r) =>
					r.day_of_month > todayDay &&
					r.day_of_month <= new Date(year, month, 0).getDate(),
			);
			setRecurringTransactions(futureRecs);
		}

		setLoading(false);
	}, [month, year, categoryIds, todayDay]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	function handleFilterChange(filters: {
		month: number;
		year: number;
		categoryIds: string[];
	}) {
		setMonth(filters.month);
		setYear(filters.year);
		setCategoryIds(filters.categoryIds);

		navigate({
			to: "/financas",
			search: {
				mes: String(filters.month),
				ano: String(filters.year),
				categoria: filters.categoryIds.join(","),
			},
			replace: true,
		});
	}

	function handleModalSuccess() {
		setShowModal(false);
		loadData();
	}

	const dayTransactions: DayTransaction[] = transactions.map((tx) => ({
		id: tx.id,
		type: tx.type,
		amount: tx.amount,
		date: tx.date,
		description: tx.description,
		categories: tx.categories,
	}));

	const showPredictability = monthState === "current";

	return (
		<div className="w-full space-y-6 px-4 py-6 lg:px-8">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-[var(--text)]">Finanças</h1>
				<button
					type="button"
					onClick={() => setShowModal(true)}
					className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--bg)] transition hover:opacity-90"
				>
					Nova transação
				</button>
			</div>

			<FilterBar
				month={month}
				year={year}
				categoryIds={categoryIds}
				onChange={handleFilterChange}
			/>

			<BalanceSummary
				saldo={saldo}
				totalIncome={totalIncome}
				totalExpense={totalExpense}
				periodLabel={periodLabel}
			/>

			{showPredictability && (
				<DailyPredictability
					saldoHistorico={saldoInicial + saldo}
					recurringTransactions={recurringTransactions}
					diasRestantes={diasRestantes}
				/>
			)}

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
				</div>
			) : (
				<DailyView
					transactions={dayTransactions}
					saldoInicial={saldoInicial}
					month={month}
					year={year}
				/>
			)}

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-[10vh]">
					<button
						type="button"
						className="fixed inset-0 w-full bg-black/50"
						aria-label="Fechar modal"
						onClick={() => setShowModal(false)}
					/>
					<div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-[var(--line)] bg-[var(--bg)] p-6 shadow-xl">
						<h2 className="mb-4 text-lg font-semibold text-[var(--text)]">
							Nova transação
						</h2>
						<TransactionForm
							onSuccess={handleModalSuccess}
							onCancel={() => setShowModal(false)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
