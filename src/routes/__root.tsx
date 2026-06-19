import {
	createRootRoute,
	HeadContent,
	Scripts,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";
import Sidebar from "../components/Sidebar";
import { AuthProvider, useAuth } from "../lib/auth";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Santiago OS",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<AuthProvider>
					<Shell>{children}</Shell>
				</AuthProvider>
				<Toaster position="bottom-right" richColors closeButton />
				<Scripts />
			</body>
		</html>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	const location = useLocation();
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	const isPublicRoute =
		location.pathname === "/login" || location.pathname === "/reset-password";

	useEffect(() => {
		if (!isLoading && !user && !isPublicRoute) {
			navigate({ to: "/login" });
		}
	}, [isLoading, user, isPublicRoute, navigate]);

	if (!isPublicRoute && (isLoading || !user)) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
				<p className="text-sm text-[var(--text-soft)]">Carregando...</p>
			</div>
		);
	}

	if (isPublicRoute) {
		return <>{children}</>;
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex min-h-screen flex-1 flex-col lg:pl-60">
				{children}
			</div>
		</div>
	);
}
