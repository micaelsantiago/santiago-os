import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
	BarChart3,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	Settings,
	ShoppingCart,
	Users,
	Wallet,
	X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth";

interface NavLink {
	label: string;
	icon: React.ComponentType<{ size?: number }>;
	to: string;
}

interface NavPlaceholder {
	label: string;
	icon: React.ComponentType<{ size?: number }>;
}

const primaryNav: NavLink[] = [
	{ to: "/", label: "Início", icon: LayoutDashboard },
	{ to: "/financas", label: "Financeiro", icon: Wallet },
];

const secondaryNav: NavPlaceholder[] = [
	{ label: "Clientes", icon: Users },
	{ label: "Produtos", icon: Package },
	{ label: "Pedidos", icon: ShoppingCart },
	{ label: "Relatórios", icon: BarChart3 },
	{ label: "Configurações", icon: Settings },
];

export default function Sidebar() {
	const { user, signOut } = useAuth();
	const location = useLocation();
	const router = useRouter();
	const [mobileOpen, setMobileOpen] = useState(false);

	const isActive = (path: string) => location.pathname === path;

	const handleSignOut = async () => {
		await signOut();
		router.invalidate();
	};

	const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

	return (
		<>
			<button
				type="button"
				onClick={() => setMobileOpen(true)}
				className="fixed left-4 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] shadow-sm lg:hidden"
				aria-label="Abrir menu"
			>
				<Menu size={18} />
			</button>

			{mobileOpen && (
				<button
					type="button"
					tabIndex={-1}
					aria-label="Fechar menu lateral"
					className="fixed inset-0 z-30 w-full bg-black/50 lg:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			<aside
				className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[var(--line)] bg-[var(--bg)] transition-transform duration-300 ${
					mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				}`}
			>
				<div className="flex h-14 items-center justify-between border-b border-[var(--line)] px-4">
					<Link
						to="/"
						onClick={() => setMobileOpen(false)}
						className="flex items-center gap-2 no-underline"
					>
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-[var(--bg)]">
							S
						</span>
						<span className="text-sm font-semibold text-[var(--text)]">
							Santiago OS
						</span>
					</Link>
					<button
						type="button"
						onClick={() => setMobileOpen(false)}
						className="flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-soft)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)] lg:hidden"
						aria-label="Fechar menu"
					>
						<X size={18} />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-3 py-4">
					<div className="space-y-1">
						{primaryNav.map((item) => (
							<Link
								key={item.label}
								to={item.to}
								onClick={() => setMobileOpen(false)}
								className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
									isActive(item.to)
										? "bg-[var(--bg-muted)] text-[var(--text)]"
										: "text-[var(--text-soft)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
								}`}
							>
								<item.icon size={20} />
								<span>{item.label}</span>
							</Link>
						))}
					</div>

					<div className="my-4 border-t border-[var(--line)]" />

					<div className="space-y-1">
						{secondaryNav.map((item) => (
							<div
								key={item.label}
								className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-soft)] opacity-50"
							>
								<item.icon size={20} />
								<span>{item.label}</span>
								<span className="ml-auto text-[10px] text-[var(--text-soft)]">
									Em breve
								</span>
							</div>
						))}
					</div>
				</nav>

				<div className="border-t border-[var(--line)] p-3">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-xs font-semibold text-[var(--text-soft)]">
							{userInitial}
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-xs font-medium text-[var(--text)]">
								{user?.email || "Usuário"}
							</p>
						</div>
						<button
							type="button"
							onClick={handleSignOut}
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--text-soft)] transition hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
							title="Sair"
						>
							<LogOut size={16} />
						</button>
					</div>
				</div>


			</aside>
		</>
	);
}
