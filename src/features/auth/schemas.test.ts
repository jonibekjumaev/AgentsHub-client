import { describe, expect, it } from 'vitest';
import { loginSchema, meetsPasswordRule, normalizePhone, signupSchema } from './schemas';

/** The i18n key of the first issue on `path`, or undefined when that field is valid. */
const errorOf = (result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, path: string) =>
	result.error?.issues.find((issue) => issue.path[0] === path)?.message;

const validSignup = {
	memberType: 'USER',
	memberNick: 'dilnoza',
	memberPhone: '+998901234567',
	memberPassword: 'bakery2026',
};

describe('loginSchema', () => {
	it('accepts a nick and any non-empty password, trimming the nick', () => {
		const result = loginSchema.safeParse({ memberNick: '  aria ', memberPassword: 'old12' });
		expect(result.success).toBe(true);
		expect(result.data).toEqual({ memberNick: 'aria', memberPassword: 'old12' });
	});

	it.each([
		['', 'auth:validation.nickRequired'],
		['   ', 'auth:validation.nickRequired'],
		['ab', 'auth:validation.nickLength'],
		['abcdefghijklm', 'auth:validation.nickLength'],
	])('rejects the nick %j with %s', (memberNick, key) => {
		expect(errorOf(loginSchema.safeParse({ memberNick, memberPassword: 'x' }), 'memberNick')).toBe(key);
	});

	it('accepts nicks of exactly 3 and 12 characters', () => {
		expect(loginSchema.safeParse({ memberNick: 'abc', memberPassword: 'x' }).success).toBe(true);
		expect(loginSchema.safeParse({ memberNick: 'abcdefghijkl', memberPassword: 'x' }).success).toBe(true);
	});

	it('requires a password but does not apply the 8-character rule (D-26)', () => {
		expect(errorOf(loginSchema.safeParse({ memberNick: 'aria', memberPassword: '' }), 'memberPassword')).toBe(
			'auth:validation.passwordRequired',
		);
		expect(loginSchema.safeParse({ memberNick: 'aria', memberPassword: '12345' }).success).toBe(true);
	});
});

describe('signupSchema', () => {
	it('accepts a valid USER and CREATOR', () => {
		expect(signupSchema.safeParse(validSignup).success).toBe(true);
		expect(signupSchema.safeParse({ ...validSignup, memberType: 'CREATOR' }).success).toBe(true);
	});

	it.each([[''], ['ADMIN'], [undefined]])('rejects the member type %j (D-14)', (memberType) => {
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberType }), 'memberType')).toBe(
			'auth:validation.roleRequired',
		);
	});

	it('applies the nick length rule', () => {
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberNick: 'ab' }), 'memberNick')).toBe(
			'auth:validation.nickLength',
		);
	});

	it('normalizes the phone to E.164 before sending', () => {
		const result = signupSchema.safeParse({ ...validSignup, memberPhone: '+998 (90) 123-45-67' });
		expect(result.data?.memberPhone).toBe('+998901234567');
	});

	it.each([
		['+9989012', 'auth:validation.phoneFormat'], // 7 digits, at least 8 needed
		['998901234567', 'auth:validation.phoneFormat'], // no "+"
		['+0998901234', 'auth:validation.phoneFormat'], // country code starts with 0
		['+1234567890123456', 'auth:validation.phoneFormat'], // 16 digits
		['010-1234-5678', 'auth:validation.phoneFormat'], // local Nestar format
		['+99890abc4567', 'auth:validation.phoneFormat'],
		['', 'auth:validation.phoneRequired'],
	])('rejects the phone %j', (memberPhone, key) => {
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberPhone }), 'memberPhone')).toBe(key);
	});

	it.each([['+12345678'], ['+123456789012345']])('accepts the boundary phone %s (8 and 15 digits)', (memberPhone) => {
		expect(signupSchema.safeParse({ ...validSignup, memberPhone }).success).toBe(true);
	});

	it('requires at least 8 characters', () => {
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberPassword: '1234567' }), 'memberPassword')).toBe(
			'auth:validation.passwordMin',
		);
		expect(signupSchema.safeParse({ ...validSignup, memberPassword: '12345678' }).success).toBe(true);
	});

	it('allows at most 72 UTF-8 bytes, not 72 characters', () => {
		expect(signupSchema.safeParse({ ...validSignup, memberPassword: 'a'.repeat(72) }).success).toBe(true);
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberPassword: 'a'.repeat(73) }), 'memberPassword')).toBe(
			'auth:validation.passwordMaxBytes',
		);
		// 37 Cyrillic letters = 74 bytes.
		expect(errorOf(signupSchema.safeParse({ ...validSignup, memberPassword: 'ж'.repeat(37) }), 'memberPassword')).toBe(
			'auth:validation.passwordMaxBytes',
		);
	});

	it('has no composition rules', () => {
		expect(signupSchema.safeParse({ ...validSignup, memberPassword: 'aaaaaaaa' }).success).toBe(true);
	});
});

describe('helpers', () => {
	it('normalizePhone strips spaces, dashes, dots and brackets only', () => {
		expect(normalizePhone(' +998 (90) 123-45.67 ')).toBe('+998901234567');
	});

	it('meetsPasswordRule matches the signup rule', () => {
		expect(meetsPasswordRule('1234567')).toBe(false);
		expect(meetsPasswordRule('12345678')).toBe(true);
		expect(meetsPasswordRule('ж'.repeat(37))).toBe(false);
	});
});
