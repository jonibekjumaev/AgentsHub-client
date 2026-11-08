const DAY_MS = 24 * 60 * 60 * 1000;
/** A deadline this close (or closer) is "soon": amber instead of green (briefs design). */
export const DEADLINE_SOON_DAYS = 7;

export type DeadlineState =
	| { kind: 'none' }
	| { kind: 'passed'; date: Date }
	| { kind: 'soon' | 'future'; date: Date; daysLeft: number };

/**
 * One brief deadline → its state for the feed. The same rule as the API (D-44): passed once it is not later
 * than now. Stored deadlines are the end of the chosen day (briefForm.deadlineToIso), so a deadline "today"
 * stays open until that day is over. `now` is injectable for tests.
 */
export const deadlineState = (deadline: string | null | undefined, now: Date = new Date()): DeadlineState => {
	if (!deadline) return { kind: 'none' };
	const date = new Date(deadline);
	if (Number.isNaN(date.getTime())) return { kind: 'none' };
	const left = date.getTime() - now.getTime();
	if (left <= 0) return { kind: 'passed', date };
	const daysLeft = Math.ceil(left / DAY_MS);
	return { kind: daysLeft <= DEADLINE_SOON_DAYS ? 'soon' : 'future', date, daysLeft };
};
