import { useMemo } from 'react';
import { useRouter } from 'next/router';

/**
 * Locale-aware formatting through Intl (DESIGN §6). Pure functions take the locale explicitly;
 * components use useFormat(), which binds the active Next locale.
 * All money is USD (FRONTEND_MIGRATION §1.6).
 */

export const DEFAULT_LOCALE = 'en';

type DateInput = Date | string | number;

const toDate = (value: DateInput): Date => (value instanceof Date ? value : new Date(value));

/** $190, $19.99 — cents only when the amount has them. */
export const formatPrice = (amount: number, locale: string = DEFAULT_LOCALE): string =>
	new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(amount);

/** 12,480 — or compact (48.2K) for stat tiles and counters. */
export const formatNumber = (
	value: number,
	locale: string = DEFAULT_LOCALE,
	{ compact = false }: { compact?: boolean } = {},
): string =>
	new Intl.NumberFormat(locale, compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}).format(value);

/** Oct 10, 2026 in en; each locale's own medium date style otherwise. Shown in the viewer's time zone. */
export const formatDate = (value: DateInput, locale: string = DEFAULT_LOCALE): string =>
	new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(toDate(value));

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 60 * 60],
	['month', 30 * 24 * 60 * 60],
	['week', 7 * 24 * 60 * 60],
	['day', 24 * 60 * 60],
	['hour', 60 * 60],
	['minute', 60],
	['second', 1],
];

/** "2 hours ago", "in 3 days", "yesterday". `now` is injectable for tests. */
export const formatRelative = (value: DateInput, locale: string = DEFAULT_LOCALE, now: DateInput = Date.now()): string => {
	const seconds = Math.round((toDate(value).getTime() - toDate(now).getTime()) / 1000);
	const [unit, size] = RELATIVE_UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ['second', 1];
	return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(Math.round(seconds / size), unit);
};

/** The formatters above, bound to the active locale. */
export const useFormat = () => {
	const locale = useRouter().locale ?? DEFAULT_LOCALE;
	return useMemo(
		() => ({
			locale,
			price: (amount: number) => formatPrice(amount, locale),
			number: (value: number) => formatNumber(value, locale),
			compact: (value: number) => formatNumber(value, locale, { compact: true }),
			date: (value: DateInput) => formatDate(value, locale),
			relative: (value: DateInput) => formatRelative(value, locale),
		}),
		[locale],
	);
};
