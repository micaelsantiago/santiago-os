import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface Category {
	id: string;
	name: string;
	icon: string;
	color: string;
}

const COLORS = [
	"#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a",
	"#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

const EMOJIS = ["💰", "💼", "🏠", "🍔", "🚗", "🏥", "📚", "🎮", "📺", "📁", "🎁", "✈️", "🐾", "👕", "💊"];

export default function CategoryManager() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState<Category | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [deleting, setDeleting] = useState<Category | null>(null);

	const [name, setName] = useState("");
	const [icon, setIcon] = useState("📁");
	const [color, setColor] = useState("#6b7280");
	const [saving, setSaving] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only runs on mount
	useEffect(() => {
		loadCategories();
	}, []);

	async function loadCategories() {
		setLoading(true);
		const { data, error } = await supabase
			.from("categories")
			.select("*")
			.order("name");
		if (!error && data) setCategories(data);
		setLoading(false);
	}

	function openCreate() {
		setEditing(null);
		setName("");
		setIcon("📁");
		setColor("#6b7280");
		setShowForm(true);
	}

	function openEdit(cat: Category) {
		setEditing(cat);
		setName(cat.name);
		setIcon(cat.icon);
		setColor(cat.color);
		setShowForm(true);
	}

	async function handleSave() {
		if (!name.trim()) {
			toast.error("Nome da categoria é obrigatório");
			return;
		}

		setSaving(true);

		if (editing) {
			const { error } = await supabase
				.from("categories")
				.update({ name: name.trim(), icon, color })
				.eq("id", editing.id);
			if (error) {
				toast.error("Erro ao atualizar categoria");
			} else {
				toast.success("Categoria atualizada");
				setShowForm(false);
				loadCategories();
			}
		} else {
			const { data: userData } = await supabase.auth.getUser();
			const userId = userData.user?.id;
			if (!userId) return;

			const { error } = await supabase.from("categories").insert({
				user_id: userId,
				name: name.trim(),
				icon,
				color,
			});
			if (error) {
				if (error.code === "23505") {
					toast.error("Já existe uma categoria com este nome");
				} else {
					toast.error("Erro ao criar categoria");
				}
			} else {
				toast.success("Categoria criada");
				setShowForm(false);
				loadCategories();
			}
		}

		setSaving(false);
	}

	async function handleDelete(cat: Category) {
		const { error } = await supabase
			.from("categories")
			.delete()
			.eq("id", cat.id);
		if (error) {
			toast.error("Erro ao excluir categoria");
		} else {
			toast.success("Categoria excluída");
			setDeleting(null);
			loadCategories();
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-[var(--text-soft)]">Carregando categorias...</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-[var(--text)]">Categorias</h2>
				<button
					type="button"
					onClick={openCreate}
					className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--bg)] transition hover:opacity-90"
				>
					Nova categoria
				</button>
			</div>

			{showForm && (
				<div className="rounded-xl border border-[var(--line)] bg-[var(--bg-muted)] p-4">
					<div className="space-y-3">
						<div>
							<label htmlFor="cat-name" className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
								Nome
							</label>
							<input
								id="cat-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Ex: Investimentos"
								className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:outline-none"
							/>
						</div>

						<div>
							<span className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
								Ícone
							</span>
							<div className="flex flex-wrap gap-1">
								{EMOJIS.map((em) => (
									<button
										key={em}
										type="button"
										onClick={() => setIcon(em)}
										className={`flex h-8 w-8 items-center justify-center rounded-lg text-base transition ${
											icon === em
												? "bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]"
												: "hover:bg-[var(--bg)]"
										}`}
									>
										{em}
									</button>
								))}
							</div>
						</div>

						<div>
							<span className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
								Cor
							</span>
							<div className="flex flex-wrap gap-1.5">
								{COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setColor(c)}
										className={`h-6 w-6 rounded-full transition ${
											color === c ? "ring-2 ring-offset-1 ring-offset-[var(--bg-muted)]" : ""
										}`}
									/>
								))}
							</div>
						</div>

						<div className="flex gap-2 pt-2">
							<button
								type="button"
								onClick={handleSave}
								disabled={saving}
								className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-[var(--bg)] transition hover:opacity-90 disabled:opacity-50"
							>
								{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar categoria"}
							</button>
							<button
								type="button"
								onClick={() => setShowForm(false)}
								className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-medium text-[var(--text-soft)] transition hover:bg-[var(--bg)]"
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}

			{categories.length === 0 ? (
				<div className="rounded-xl border border-dashed border-[var(--line)] py-12 text-center">
					<p className="text-sm text-[var(--text-soft)]">Nenhuma categoria encontrada</p>
					<button
						type="button"
						onClick={openCreate}
						className="mt-2 text-sm font-medium text-[var(--accent)] hover:underline"
					>
						Criar primeira categoria
					</button>
				</div>
			) : (
				<div className="overflow-hidden rounded-xl border border-[var(--line)]">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-[var(--line)] bg-[var(--bg-muted)]">
							<tr>
								<th className="px-4 py-2.5 text-xs font-medium text-[var(--text-soft)]">
									Categoria
								</th>
								<th className="hidden px-4 py-2.5 text-xs font-medium text-[var(--text-soft)] sm:table-cell">
									Ícone
								</th>
								<th className="hidden px-4 py-2.5 text-xs font-medium text-[var(--text-soft)] md:table-cell">
									Cor
								</th>
								<th className="px-4 py-2.5 text-right text-xs font-medium text-[var(--text-soft)]">
									Ações
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--line)]">
							{categories.map((cat) => (
								<tr key={cat.id} className="transition hover:bg-[var(--bg-muted)]">
									<td className="px-4 py-2.5">
										<span className="font-medium text-[var(--text)]">
											{cat.name}
										</span>
									</td>
									<td className="hidden px-4 py-2.5 sm:table-cell">
										<span className="text-lg">{cat.icon}</span>
									</td>
									<td className="hidden px-4 py-2.5 md:table-cell">
										<div
											className="h-4 w-4 rounded-full"
											style={{ backgroundColor: cat.color }}
										/>
									</td>
									<td className="px-4 py-2.5 text-right">
										<button
											type="button"
											onClick={() => openEdit(cat)}
											className="mr-2 text-xs text-[var(--accent)] hover:underline"
										>
											Editar
										</button>
										<button
											type="button"
											onClick={() => setDeleting(cat)}
											className="text-xs text-red-500 hover:underline"
										>
											Excluir
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{deleting && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="mx-4 w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--bg)] p-6 shadow-xl">
						<h3 className="text-sm font-semibold text-[var(--text)]">
							Excluir categoria
						</h3>
						<p className="mt-1 text-sm text-[var(--text-soft)]">
							Tem certeza que deseja excluir "{deleting.name}"? Transações
							com esta categoria ficarão sem categoria.
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
