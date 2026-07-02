/** Pure helpers for the locally tracked reading activity. */

export function dateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Consecutive days with activity, ending today (or yesterday if today is empty). */
export function computeStreak(activity: Record<string, string[]>): number {
	const day = new Date();
	if (!activity[dateKey(day)]?.length) day.setDate(day.getDate() - 1);
	let streak = 0;
	while (activity[dateKey(day)]?.length) {
		streak++;
		day.setDate(day.getDate() - 1);
	}
	return streak;
}

export function lastNDays(n: number): { key: string; date: Date }[] {
	const days: { key: string; date: Date }[] = [];
	for (let i = n - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		days.push({ key: dateKey(date), date });
	}
	return days;
}
