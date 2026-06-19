import type { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { supabase } from "./supabase";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
	signIn: (
		email: string,
		password: string,
	) => Promise<{ error: string | null }>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<{ error: string | null }>;
	updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function translateAuthError(message: string | null | undefined): string | null {
	if (!message) return null;

	const map: Record<string, string> = {
		"Invalid login credentials": "Email ou senha inválidos.",
		"Email not confirmed": "Email não confirmado.",
		"User already registered": "Usuário já cadastrado.",
		"Password should be at least 6 characters":
			"Senha deve ter no mínimo 6 caracteres.",
		"Email link is invalid or has expired":
			"Link inválido ou expirado. Solicite um novo.",
		"Invalid email": "Email inválido.",
	};

	return map[message] ?? message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		return { error: translateAuthError(error?.message) };
	};

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	const resetPassword = async (email: string) => {
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
		return { error: translateAuthError(error?.message) };
	};

	const updatePassword = async (password: string) => {
		const { error } = await supabase.auth.updateUser({ password });
		return { error: translateAuthError(error?.message) };
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
				isLoading,
				signIn,
				signOut,
				resetPassword,
				updatePassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
