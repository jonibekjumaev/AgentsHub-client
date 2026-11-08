import { describe, expect, it } from 'vitest';
import { DEADLINE_SOON_DAYS, deadlineState } from './deadline';

const NOW = new Date('2026-11-08T12:00:00.000Z');
const inDays = (days: number) => new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

describe('deadlineState (briefs feed colors, D-44)', () => {
	it('no deadline, or an unreadable one → none', () => {
		expect(deadlineState(null, NOW)).toEqual({ kind: 'none' });
		expect(deadlineState('not a date', NOW)).toEqual({ kind: 'none' });
	});

	it('a deadline not later than now has passed (the API rule)', () => {
		expect(deadlineState(NOW.toISOString(), NOW).kind).toBe('passed');
		expect(deadlineState(inDays(-10), NOW).kind).toBe('passed');
	});

	it(`${DEADLINE_SOON_DAYS} days or fewer left is soon; the day count rounds up`, () => {
		expect(deadlineState(inDays(0.2), NOW)).toMatchObject({ kind: 'soon', daysLeft: 1 });
		expect(deadlineState(inDays(DEADLINE_SOON_DAYS), NOW)).toMatchObject({ kind: 'soon', daysLeft: DEADLINE_SOON_DAYS });
		expect(deadlineState(inDays(DEADLINE_SOON_DAYS + 0.5), NOW)).toMatchObject({ kind: 'future', daysLeft: DEADLINE_SOON_DAYS + 1 });
		expect(deadlineState(inDays(84), NOW)).toMatchObject({ kind: 'future', daysLeft: 84 });
	});
});
