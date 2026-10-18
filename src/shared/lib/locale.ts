/** Same list as next-i18next.config.js (a test keeps them in sync). `en` has no URL prefix. */
export const LOCALES = ['en', 'ko', 'uz'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * The URL path of `path` in `locale`, the way Next i18n routing serves it.
 * `path` is a locale-free router.asPath and may carry a query or hash:
 * ('/agents?page=2', 'ko') → '/ko/agents?page=2', ('/', 'uz') → '/uz', ('/briefs', 'en') → '/briefs'.
 */
export const localePath = (path: string, locale: string): string => {
	if (locale === DEFAULT_LOCALE) return path;
	// The root has no trailing slash once prefixed: '/' → '/ko', '/?q=1' → '/ko?q=1'.
	const rest = path.replace(/^\/(?=[?#]|$)/, '');
	return `/${locale}${rest}`;
};
