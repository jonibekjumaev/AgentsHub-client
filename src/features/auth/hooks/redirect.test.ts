import { describe, expect, it } from 'vitest';
import { safeNextPath } from './redirect';

describe('safeNextPath', () => {
	it.each(['/', '/agents?x=1', '/members/abc#tab'])('allows the internal path %s', (path) => {
		expect(safeNextPath(path)).toBe(path);
	});

	it.each([
		['protocol-relative', '//evil.com'],
		['absolute URL', 'https://evil.com'],
		['bare host', 'evil.com'],
		['backslash trick', '/\\evil.com'],
		['empty string', ''],
		['undefined', undefined],
		['array query param', ['/a', '/b']],
		['the login page', '/login?next=/agents'],
		['the signup page', '/signup'],
	])('falls back to "/" for %s', (_label, value) => {
		expect(safeNextPath(value)).toBe('/');
	});
});
