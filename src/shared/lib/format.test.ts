import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, formatPrice, formatRelative } from './format';

// Intl uses non-breaking/narrow spaces in some locales (e.g. "190 US$" in uz); compare with plain spaces.
const plain = (text: string) => text.replace(/[  ]/g, ' ');

const NOON_OCT_10 = new Date(2026, 9, 10, 12, 0, 0); // local time, so the date never shifts by time zone
const NOW = new Date(2026, 9, 17, 12, 0, 0);

describe('formatPrice (USD)', () => {
	it.each([
		['en', 190, '$190'],
		['en', 19.99, '$19.99'],
		['ko', 190, 'US$190'],
		['uz', 190, '190 US$'],
		['uz', 19.99, '19,99 US$'],
	])('%s %d → %s', (locale, amount, expected) => {
		expect(plain(formatPrice(amount, locale))).toBe(expected);
	});
});

describe('formatNumber', () => {
	it.each([
		['en', '12,480', '48.2K'],
		['ko', '12,480', '4.8만'],
		['uz', '12 480', '48,2 ming'],
	])('%s: full %s, compact %s', (locale, full, compact) => {
		expect(plain(formatNumber(12480, locale))).toBe(full);
		expect(plain(formatNumber(48200, locale, { compact: true }))).toBe(compact);
	});
});

describe('formatDate', () => {
	it.each([
		['en', 'Oct 10, 2026'],
		['ko', '2026. 10. 10.'],
		['uz', '10-okt, 2026'],
	])('%s → %s', (locale, expected) => {
		expect(plain(formatDate(NOON_OCT_10, locale))).toBe(expected);
	});

	it('accepts the API ISO string', () => {
		expect(formatDate('2026-10-10T12:00:00.000Z', 'en')).toMatch(/^Oct (9|10|11), 2026$/);
	});
});

describe('formatRelative', () => {
	const twoHoursAgo = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);
	const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
	const inThreeDays = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000);

	it.each([
		['en', '2 hours ago', 'yesterday', 'in 3 days'],
		['ko', '2시간 전', '어제', '3일 후'],
		['uz', '2 soat oldin', 'kecha', '3 kundan keyin'],
	])('%s', (locale, hours, day, future) => {
		expect(formatRelative(twoHoursAgo, locale, NOW)).toBe(hours);
		expect(formatRelative(yesterday, locale, NOW)).toBe(day);
		expect(formatRelative(inThreeDays, locale, NOW)).toBe(future);
	});
});
