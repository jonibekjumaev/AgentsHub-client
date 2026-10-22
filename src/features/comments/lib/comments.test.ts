import { describe, expect, it } from 'vitest';
import { COMMENT_MAX, briefCommentTarget, commentsVariables, isValidComment, productCommentTarget } from './comments';

const BRIEF_ID = '6ac7992dd87bde19b9216c11';

describe('commentsVariables', () => {
	it('always sends commentGroup next to commentRefId, oldest first', () => {
		expect(commentsVariables(briefCommentTarget(BRIEF_ID))).toEqual({
			input: {
				page: 1,
				limit: 20,
				sort: 'createdAt',
				direction: 'ASC',
				search: { commentRefId: BRIEF_ID, commentGroup: 'BRIEF' },
			},
		});
	});

	it('uses PRODUCT (never PROPERTY) for agents and takes a larger limit', () => {
		expect(commentsVariables(productCommentTarget(BRIEF_ID), 40).input).toMatchObject({
			limit: 40,
			search: { commentGroup: 'PRODUCT' },
		});
	});
});

describe('isValidComment', () => {
	it('accepts 1–1000 characters after trimming (D-35)', () => {
		expect(isValidComment('  ok ')).toBe(true);
		expect(isValidComment('a'.repeat(COMMENT_MAX))).toBe(true);
	});

	it('rejects blank and too long text', () => {
		expect(isValidComment('   ')).toBe(false);
		expect(isValidComment('a'.repeat(COMMENT_MAX + 1))).toBe(false);
	});
});
