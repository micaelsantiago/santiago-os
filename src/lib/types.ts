export interface RecurringTransaction {
	id: string;
	user_id: string;
	name: string;
	amount: number;
	category_id: string | null;
	day_of_month: number;
	active: boolean;
	created_at: string;
	categories?: {
		name: string;
		icon: string;
		color: string;
	} | null;
}

export interface DayData {
	totalIncome: number;
	totalExpense: number;
	transactions: DayTransaction[];
}

export interface DayTransaction {
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

export interface DayRowData {
	day: number;
	dateKey: string;
	hasIncome: boolean;
	hasExpense: boolean;
	totalIncome: number;
	totalExpense: number;
	accumulatedBalance: number;
	transactions: DayTransaction[];
	isToday: boolean;
	isFuture: boolean;
	isCurrentMonth: boolean;
}
