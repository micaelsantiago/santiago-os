export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}

export function formatDate(date: string): string {
	return new Intl.DateTimeFormat("pt-BR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(`${date}T00:00:00`));
}

export function formatMonthYear(month: number, year: number): string {
	const date = new Date(year, month - 1, 1);
	return new Intl.DateTimeFormat("pt-BR", {
		month: "long",
		year: "numeric",
	}).format(date);
}

export function getMonthName(month: number): string {
	const date = new Date(2024, month - 1, 1);
	return new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
}

export function getCurrentMonth(): number {
	return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
	return new Date().getFullYear();
}

export function getMonthDateRange(month: number, year: number) {
	const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
	return { startDate, endDate };
}
