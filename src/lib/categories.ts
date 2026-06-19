import { supabase } from "./supabase";

const DEFAULT_CATEGORIES = [
	{ name: "Salário", icon: "💰", color: "#22c55e" },
	{ name: "Freela", icon: "💼", color: "#16a34a" },
	{ name: "Moradia", icon: "🏠", color: "#ef4444" },
	{ name: "Alimentação", icon: "🍔", color: "#f97316" },
	{ name: "Transporte", icon: "🚗", color: "#3b82f6" },
	{ name: "Saúde", icon: "🏥", color: "#ec4899" },
	{ name: "Educação", icon: "📚", color: "#8b5cf6" },
	{ name: "Lazer", icon: "🎮", color: "#eab308" },
	{ name: "Assinaturas", icon: "📺", color: "#06b6d4" },
	{ name: "Outros", icon: "📁", color: "#6b7280" },
];

export interface Category {
	id: string;
	name: string;
	icon: string;
	color: string;
}

export async function ensureCategories(): Promise<Category[]> {
	const { data: existing } = await supabase
		.from("categories")
		.select("id, name, icon, color")
		.order("name");

	if (existing && existing.length > 0) {
		return existing as Category[];
	}

	const { data: userData } = await supabase.auth.getUser();
	const userId = userData.user?.id;
	if (!userId) return [];

	const { data: inserted } = await supabase
		.from("categories")
		.insert(
			DEFAULT_CATEGORIES.map((cat) => ({
				user_id: userId,
				...cat,
			}))
		)
		.select("id, name, icon, color")
		.order("name");

	return (inserted as Category[]) ?? [];
}
