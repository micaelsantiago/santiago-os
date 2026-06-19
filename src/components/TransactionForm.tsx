import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { type Category, ensureCategories } from "../lib/categories";

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function TransactionForm({ onSuccess, onCancel }: Props) {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loadingCategories, setLoadingCategories] = useState(true);
	const [type, setType] = useState<"income" | "expense">("expense");
	const [amount, setAmount] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		ensureCategories().then((cats) => {
			setCategories(cats);
			setLoadingCategories(false);
		});
	}, []);

	function validate(): boolean {
		const next: Record<string, string> = {};

		const parsed = Number(amount.replace(",", "."));
		if (!amount || Number.isNaN(parsed) || parsed <= 0) {
			next.amount = "Valor deve ser maior que zero";
		}
		if (!categoryId) {
			next.categoryId = "Selecione uma categoria";
		}
		if (!date) {
			next.date = "Selecione uma data";
		}

		setErrors(next);
		return Object.keys(next).length === 0;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!validate()) return;

		setSaving(true);

		const { data: userData } = await supabase.auth.getUser();
		const userId = userData.user?.id;
		if (!userId) return;

		const parsedAmount = Number(Number(amount.replace(",", ".")).toFixed(2));

		const { error } = await supabase.from("transactions").insert({
			user_id: userId,
			type,
			amount: parsedAmount,
			category_id: categoryId || null,
			date,
			description: description.trim() || null,
		});

		if (error) {
			toast.error("Erro ao salvar transação");
		} else {
			toast.success("Transação registrada");
			onSuccess?.();
		}

		setSaving(false);
	}

	function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
		let value = e.target.value.replace(/[^\d,]/g, "");
		const parts = value.split(",");
		if (parts.length > 2) value = `${parts[0]},${parts.slice(1).join("")}`;
		if (parts.length === 2 && parts[1].length > 2) {
			value = `${parts[0]},${parts[1].slice(0, 2)}`;
		}
		setAmount(value);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="flex rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] p-1">
				<button
					type="button"
					onClick={() => setType("expense")}
					className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
						type === "expense"
							? "bg-red-500 text-white"
							: "text-[var(--text-soft)] hover:text-[var(--text)]"
					}`}
				>
					Saída
				</button>
				<button
					type="button"
					onClick={() => setType("income")}
					className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
						type === "income"
							? "bg-green-500 text-white"
							: "text-[var(--text-soft)] hover:text-[var(--text)]"
					}`}
				>
					Entrada
				</button>
			</div>

			<div>
				<label htmlFor="tx-amount" className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
					Valor (R$)
				</label>
				<input
					id="tx-amount"
					type="text"
					inputMode="decimal"
					value={amount}
					onChange={handleAmountChange}
					placeholder="0,00"
					className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:outline-none"
				/>
				{errors.amount && (
					<p className="mt-1 text-xs text-red-500">{errors.amount}</p>
				)}
			</div>

			<div>
				<label htmlFor="tx-category" className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
					Categoria
				</label>
				{loadingCategories ? (
					<p className="text-sm text-[var(--text-soft)]">Carregando categorias...</p>
				) : (
					<select
						id="tx-category"
						value={categoryId}
						onChange={(e) => setCategoryId(e.target.value)}
						className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
					>
						<option value="">Selecionar categoria...</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.icon} {cat.name}
							</option>
						))}
					</select>
				)}
				{errors.categoryId && (
					<p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
				)}
			</div>

			<div>
				<label htmlFor="tx-date" className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
					Data
				</label>
				<input
					id="tx-date"
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
				/>
				{errors.date && (
					<p className="mt-1 text-xs text-red-500">{errors.date}</p>
				)}
			</div>

			<div>
				<label htmlFor="tx-desc" className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
					Descrição{" "}
					<span className="text-[var(--text-soft)]">(opcional)</span>
				</label>
				<textarea
					id="tx-desc"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Ex: Conta de luz"
					rows={2}
					className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:outline-none"
				/>
			</div>

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={saving}
					className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--bg)] transition hover:opacity-90 disabled:opacity-50"
				>
					{saving ? "Salvando..." : "Registrar transação"}
				</button>
				<button
					type="button"
					onClick={() => onCancel?.()}
					className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--text-soft)] transition hover:bg-[var(--bg-muted)]"
				>
					Cancelar
				</button>
			</div>
		</form>
	);
}
