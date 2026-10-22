import { describe, expect, it } from 'vitest';
import { IMAGE_MAX_BYTES, checkImageFiles } from './imageFiles';

/** A File of a given size without allocating it. */
const file = (name: string, type: string, size = 1000) => {
	const created = new File(['x'], name, { type });
	Object.defineProperty(created, 'size', { value: size });
	return created;
};

describe('checkImageFiles', () => {
	it('accepts JPG and PNG', () => {
		const { accepted, rejected } = checkImageFiles([file('a.png', 'image/png'), file('b.jpg', 'image/jpeg')], 10);
		expect(accepted.map((item) => item.name)).toEqual(['a.png', 'b.jpg']);
		expect(rejected).toEqual([]);
	});

	it.each([
		['c.gif', 'image/gif'],
		['d.webp', 'image/webp'],
		['e.png', ''], // unknown type: the browser would send application/octet-stream, which the API refuses
	])('refuses %s (%s)', (name, type) => {
		expect(checkImageFiles([file(name, type)], 10).rejected).toEqual([{ name, reason: 'type' }]);
	});

	it('takes exactly 10 000 000 bytes, the API limit (D-41), and refuses one byte more', () => {
		expect(checkImageFiles([file('ok.png', 'image/png', IMAGE_MAX_BYTES)], 10).accepted).toHaveLength(1);
		expect(checkImageFiles([file('big.png', 'image/png', IMAGE_MAX_BYTES + 1)], 10).rejected).toEqual([{ name: 'big.png', reason: 'size' }]);
	});

	it('fills the free slots and refuses the rest', () => {
		const files = ['1', '2', '3'].map((name) => file(`${name}.png`, 'image/png'));
		const { accepted, rejected } = checkImageFiles(files, 2);
		expect(accepted.map((item) => item.name)).toEqual(['1.png', '2.png']);
		expect(rejected).toEqual([{ name: '3.png', reason: 'count' }]);
	});

	it('counts only accepted files against the slots', () => {
		const { accepted } = checkImageFiles([file('x.gif', 'image/gif'), file('y.png', 'image/png')], 1);
		expect(accepted.map((item) => item.name)).toEqual(['y.png']);
	});
});
