import { describe, expect, it } from 'vitest';
import i18nConfig from '../../../next-i18next.config.js';
import { DEFAULT_LOCALE, LOCALES, localePath } from './locale';

describe('LOCALES', () => {
	it('matches next-i18next.config.js', () => {
		expect([...LOCALES]).toEqual(i18nConfig.i18n.locales);
		expect(DEFAULT_LOCALE).toBe(i18nConfig.i18n.defaultLocale);
	});
});

describe('localePath', () => {
	it.each([
		['/agents?page=2', 'en', '/agents?page=2'],
		['/agents?page=2', 'ko', '/ko/agents?page=2'],
		['/agents/abc#comments', 'uz', '/uz/agents/abc#comments'],
		['/', 'en', '/'],
		['/', 'ko', '/ko'],
		['/?q=bot', 'uz', '/uz?q=bot'],
	])('%s in %s → %s', (path, locale, expected) => {
		expect(localePath(path, locale)).toBe(expected);
	});
});
