import { describe, expect, it } from 'vitest';
import { briefHref, isDeadlinePassed, isObjectId, summarize, whatsappHref } from './detail';

describe('brief detail helpers', () => {
	it('checks ids and builds links', () => {
		expect(isObjectId('6ac7992dd87bde19b9216d01')).toBe(true);
		expect(isObjectId('nope')).toBe(false);
		expect(briefHref('6ac7992dd87bde19b9216d01')).toBe('/briefs/6ac7992dd87bde19b9216d01');
		expect(whatsappHref('+998 90 123-45-67')).toBe('https://wa.me/998901234567');
	});

	it('summarizes to one line at a word', () => {
		expect(summarize('Line one.\nLine   two.')).toBe('Line one. Line two.');
		expect(summarize('word '.repeat(60), 20).endsWith('…')).toBe(true);
	});

	it('treats a deadline as passed only after its day is over (D-05)', () => {
		const deadline = new Date(2026, 10, 30, 0, 0, 0).toISOString();
		expect(isDeadlinePassed(deadline, new Date(2026, 10, 30, 18, 0, 0))).toBe(false);
		expect(isDeadlinePassed(deadline, new Date(2026, 11, 1, 0, 0, 1))).toBe(true);
		expect(isDeadlinePassed(null)).toBe(false);
	});
});
