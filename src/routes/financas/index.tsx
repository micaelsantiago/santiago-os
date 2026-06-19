import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import BalanceSummary from "../../components/BalanceSummary";
import FilterBar from "../../components/FilterBar";
import MonthlyOverview from "../../components/MonthlyOverview";
import TransactionForm from "../../components/TransactionForm";
import TransactionList from "../../components/TransactionList";
import { getCurrentMonth, getCurrentYear, getMonthDateRange, formatMonthYear } from "../../lib/format";
import { supabase } from "../../lib/supabase";

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

interface CategoryTotal {
	id: string;
	name: string;
	icon: string;
	color: string;
	total: number;
	percentage: number;
}

const PAGE_SIZE = 20;

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
	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(0);
	const [showModal, setShowModal] = useState(false);

	const periodLabel = formatMonthYear(month, year);

	const totalIncome = transactions
		.filter((tx) => tx.type === "income")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const totalExpense = transactions
		.filter((tx) => tx.type === "expense")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const saldo = totalIncome - totalExpense;

	const expenseCategories = buildCategoryTotals(
		transactions.filter((tx) => tx.type === "expense"),
		totalExpense
	);

	function buildCategoryTotals(txs: Transaction[], total: number): CategoryTotal[] {
		const map = new Map<string, CategoryTotal>();

		for (const tx of txs) {
			const key = tx.categories?.name ?? "sem-categoria";
			const existing = map.get(key);
			if (existing) {
				existing.total += tx.amount;
			} else {
				map.set(key, {
					id: key,
					name: tx.categories?.name ?? "Sem categoria",
					icon: tx.categories?.icon ?? "📁",
					color: tx.categories?.color ?? "#6b7280",
					total: tx.amount,
					percentage: 0,
				});
			}
		}

		const result = Array.from(map.values()).sort((a, b) => b.total - a.total);
		for (const cat of result) {
			cat.percentage = total > 0 ? Math.round((cat.total / total) * 100) : 0;
		}

		return result;
	}

	const pageRef = useRef(0);

	const loadTransactions = useCallback(async (reset: boolean) => {
		setLoading(true);

		const { startDate, endDate } = getMonthDateRange(month, year);

		let query = supabase
			.from("transactions")
			.select("id, type, amount, date, description, categories(name, icon, color)")
			.gte("date", startDate)
			.lte("date", endDate)
			.order("date", { ascending: false })
			.order("created_at", { ascending: false });

		if (categoryIds.length > 0) {
			query = query.in("category_id", categoryIds);
		}

		const currentPage = reset ? 0 : pageRef.current;
		const from = currentPage * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;

		const response = await query.range(from, to);
		const data = response.data as Transaction[] | null;

		if (!response.error && data) {
			if (reset) {
				setTransactions(data);
			} else {
				setTransactions((prev) => [...prev, ...data]);
			}
			setHasMore(data.length === PAGE_SIZE);
		}

		setLoading(false);
	}, [month, year, categoryIds]);

	useEffect(() => {
		setPage(0);
		pageRef.current = 0;
		loadTransactions(true);
	}, [loadTransactions]);

	function handleFilterChange(filters: { month: number; year: number; categoryIds: string[] }) {
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

	function handleLoadMore() {
		setPage((p) => {
			pageRef.current = p + 1;
			return p + 1;
		});
	}

	useEffect(() => {
		if (page > 0) loadTransactions(false);
	}, [loadTransactions, page]);

	function handleDelete() {
		setPage(0);
		pageRef.current = 0;
		loadTransactions(true);
	}

	function handleModalSuccess() {
		setShowModal(false);
		setPage(0);
		pageRef.current = 0;
		loadTransactions(true);
	}

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

			<MonthlyOverview
				categories={expenseCategories}
			/>

			<div className="border-t border-[var(--line)] pt-4">
				<h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Transações</h2>
				<TransactionList
					transactions={transactions}
					loading={loading}
					hasMore={hasMore}
					onLoadMore={handleLoadMore}
					onDelete={handleDelete}
				/>
			</div>

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
