import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json';

/**
 * package.json "sideEffects" lets webpack drop modules whose exports are unused (CLAUDE.md rule 20).
 * A module that does something just by being imported — here: holds a bare `import '…'` — must be
 * listed, or a production build may silently leave it out.
 */

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'src');

const files = (dir: string): string[] =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? files(path) : [path];
	});

/** "./src/test/**" → /^src\/test\/.*$/, "*.css" → any .css file. */
const toRegExp = (glob: string) => {
	const pattern = glob
		.replace(/^\.\//, '')
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*\*/g, '\u0000')
		.replace(/\*/g, '[^/]*')
		.replace(/\u0000/g, '.*');
	return new RegExp(glob.includes('/') ? `^${pattern}$` : `(^|/)${pattern}$`);
};

const listed = (pkg.sideEffects as string[]).map(toRegExp);
const isListed = (path: string) => listed.some((pattern) => pattern.test(path));

describe('package.json sideEffects', () => {
	it('lists every module with a bare import (type declarations aside)', () => {
		const offenders = files(SRC)
			.filter((path) => /\.(ts|tsx)$/.test(path) && !path.endsWith('.d.ts'))
			.map((path) => relative(ROOT, path).split(sep).join('/'))
			.filter((path) => /^\s*import\s+['"][^'"]+['"]/m.test(readFileSync(join(ROOT, path), 'utf8')))
			.filter((path) => !isListed(path));

		expect(offenders).toEqual([]);
	});

	it('keeps the modules that act on import: env validation and next/font', () => {
		expect(isListed('src/config/env.ts')).toBe(true);
		expect(isListed('src/theme/fonts.ts')).toBe(true);
		expect(isListed('src/features/agents/index.ts')).toBe(false);
	});
});
