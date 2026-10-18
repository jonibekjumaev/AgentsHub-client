import { describe, expect, it } from 'vitest';
import { isExternalHttpUrl, isObjectId, summarize, whatsappHref } from './detail';

describe('isObjectId', () => {
	it.each([
		['6ac7992dd87bde19b9216c8b', true],
		['6AC7992DD87BDE19B9216C8B', true],
		['abc', false],
		['6ac7992dd87bde19b9216c8z', false],
		[undefined, false],
		[['6ac7992dd87bde19b9216c8b'], false],
	])('%j → %s', (value, expected) => {
		expect(isObjectId(value)).toBe(expected);
	});
});

describe('summarize', () => {
	it('keeps short text, collapsing whitespace and newlines', () => {
		expect(summarize('  Answers questions.\n\nHands off   hard cases. ')).toBe('Answers questions. Hands off hard cases.');
	});

	it('cuts long text at a word boundary with an ellipsis, within the limit', () => {
		const text = 'word '.repeat(60);
		const result = summarize(text, 40);
		expect(result.length).toBeLessThanOrEqual(40);
		expect(result).toMatch(/^word( word)*…$/);
	});

	it('cuts a single long word hard', () => {
		expect(summarize('x'.repeat(200), 20)).toBe(`${'x'.repeat(19)}…`);
	});
});

describe('isExternalHttpUrl', () => {
	it.each([
		['https://demo.example.com', true],
		['http://demo.example.com/a?b=1', true],
		['javascript:alert(1)', false],
		['data:text/html,hi', false],
		['/relative', false],
		['', false],
		[null, false],
	])('%j → %s', (value, expected) => {
		expect(isExternalHttpUrl(value)).toBe(expected);
	});
});

describe('whatsappHref', () => {
	it('keeps the digits only', () => {
		expect(whatsappHref('+998 90 123-45-67')).toBe('https://wa.me/998901234567');
	});
});
