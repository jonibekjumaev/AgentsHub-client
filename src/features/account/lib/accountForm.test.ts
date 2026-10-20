import { describe, expect, it } from 'vitest';
import { accountFormSchema, passwordFormSchema, toMemberUpdate, type AccountFormValues } from './accountForm';

const initial: AccountFormValues = {
	memberNick: 'nova_labs',
	memberFullName: 'Nova Labs',
	memberPhone: '+998901234567',
	memberEmail: 'hello@nova.test',
	memberWhatsapp: '',
	memberDesc: '',
	memberImage: 'uploads/member/a.png',
};

const issues = (schema: { safeParse: (value: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } } }, value: unknown) => {
	const result = schema.safeParse(value);
	return result.success ? {} : Object.fromEntries((result.error?.issues ?? []).map((issue) => [issue.path[0], issue.message]));
};

describe('accountFormSchema', () => {
	it('normalizes phone numbers people type (D-25)', () => {
		expect(accountFormSchema.parse({ ...initial, memberPhone: '+998 90 123-45-67', memberWhatsapp: ' +998 (93) 555 12 34' })).toMatchObject({
			memberPhone: '+998901234567',
			memberWhatsapp: '+998935551234',
		});
	});

	it('checks every field with its key', () => {
		expect(
			issues(accountFormSchema, { ...initial, memberNick: 'ab', memberFullName: 'Al', memberPhone: '010123', memberEmail: 'nope', memberWhatsapp: '123' }),
		).toEqual({
			memberNick: 'auth:validation.nickLength',
			memberFullName: 'account:errors.fullNameLength',
			memberPhone: 'auth:validation.phoneFormat',
			memberEmail: 'account:errors.email',
			memberWhatsapp: 'account:errors.whatsappFormat',
		});
	});
});

describe('toMemberUpdate', () => {
	it('sends only changes, null to clear optional text and "" to remove the picture', () => {
		const form = accountFormSchema.parse({ ...initial, memberEmail: '', memberImage: '' });
		expect(toMemberUpdate('id', initial, form)).toEqual({ _id: 'id', memberEmail: null, memberImage: '' });
		expect(toMemberUpdate('id', initial, accountFormSchema.parse(initial))).toBeNull();
	});
});

describe('passwordFormSchema', () => {
	it('lets an old short current password through but checks the new one (D-26)', () => {
		expect(issues(passwordFormSchema, { currentPassword: 'abc12', newPassword: 'new-password', confirmPassword: 'new-password' })).toEqual({});
		expect(issues(passwordFormSchema, { currentPassword: 'same-password', newPassword: 'same-password', confirmPassword: 'other' })).toEqual({
			newPassword: 'account:errors.samePassword',
			confirmPassword: 'account:errors.confirmMismatch',
		});
		expect(issues(passwordFormSchema, { currentPassword: '', newPassword: 'short', confirmPassword: 'short' })).toEqual({
			currentPassword: 'account:errors.currentRequired',
			newPassword: 'auth:validation.passwordMin',
		});
	});
});
