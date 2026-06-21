import { useEffect, useState } from "react";
import { type Category, ensureCategories } from "../lib/categories";

export default function FilterBar({
	month,
	year,
	categoryIds,
	onChange,
}: {
	month: number;
	year: number;
	categoryIds: string[];
	onChange: (filters: {
		month: number;
		year: number;
		categoryIds: string[];
	}) => void;
}) {
	const [categories, setCategories] = useState<Category[]>([]);

	const months = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro",
	];

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

	useEffect(() => {
		ensureCategories().then((cats) => setCategories(cats));
	}, []);

	function toggleCategory(id: string) {
		const next = categoryIds.includes(id)
			? categoryIds.filter((c) => c !== id)
			: [...categoryIds, id];
		onChange({ month, year, categoryIds: next });
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			<select
				value={month}
				onChange={(e) =>
					onChange({ month: Number(e.target.value), year, categoryIds })
				}
				className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
			>
				{months.map((name, i) => (
					<option key={name} value={i + 1}>
						{name}
					</option>
				))}
			</select>

			<select
				value={year}
				onChange={(e) =>
					onChange({ month, year: Number(e.target.value), categoryIds })
				}
				className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
			>
				{years.map((y) => (
					<option key={y} value={y}>
						{y}
					</option>
				))}
			</select>

			<div className="flex flex-wrap gap-1.5">
				<button
					type="button"
					onClick={() => onChange({ month, year, categoryIds: [] })}
					className={`rounded-full px-3 py-1 text-xs font-medium transition ${
						categoryIds.length === 0
							? "bg-[var(--accent)] text-[var(--bg)]"
							: "border border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--bg-muted)]"
					}`}
				>
					Todas
				</button>
				{categories.map((cat) => (
					<button
						key={cat.id}
						type="button"
						onClick={() => toggleCategory(cat.id)}
						className={`rounded-full px-3 py-1 text-xs font-medium transition ${
							categoryIds.includes(cat.id)
								? "text-[var(--bg)]"
								: "border border-[var(--line)] text-[var(--text-soft)] hover:bg-[var(--bg-muted)]"
						}`}
						style={
							categoryIds.includes(cat.id)
								? { backgroundColor: cat.color }
								: undefined
						}
					>
						{cat.icon} {cat.name}
					</button>
				))}
			</div>
		</div>
	);
}
