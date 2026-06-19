import { createFileRoute } from "@tanstack/react-router";
import CategoryManager from "../../components/CategoryManager";

export const Route = createFileRoute("/financas/categorias")({
	component: CategoriasPage,
});

function CategoriasPage() {
	return (
		<div className="w-full max-w-2xl px-4 py-6 lg:px-8">
			<h1 className="mb-6 text-xl font-bold text-[var(--text)]">Categorias</h1>
			<CategoryManager />
		</div>
	);
}
