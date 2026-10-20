import * as z from 'zod/mini';
import { E164_PHONE, NICK_MAX, NICK_MIN, PASSWORD_MAX_BYTES, PASSWORD_MIN, normalizePhone } from '@/features/auth';
import type { AccountQuery, MemberUpdate } from '@/gql/graphql';

/** §3.1 limits. memberDesc has no documented limit; 500 keeps the profile header readable (UNVERIFIED.md). */
export const FULL_NAME_MIN = 3;
export const FULL_NAME_MAX = 100;
export const EMAIL_MAX = 254;
export const DESC_MAX = 500;

/** Business messages the forms tell apart (matched, never shown). */
export const AccountErrorMessage = {
	Taken: 'Already used member nick or phone',
	WrongPassword: 'Wrong password, try again!',
	SamePassword: 'New password must be different from the current password!',
} as const;

/** The start of the format messages ("Phone number must be in international format, …"). */
export const PHONE_FORMAT_PREFIX = 'Phone number must be in international format';
export const WHATSAPP_FORMAT_PREFIX = 'WhatsApp number must be in international format';
export const EMAIL_INVALID_PREFIX = 'Please provide a valid email';

export type AccountFormValues = {
	memberNick: string;
	memberFullName: string;
	memberPhone: string;
	memberEmail: string;
	memberWhatsapp: string;
	memberDesc: string;
	/** Stored path, '' = no picture (D-15). */
	memberImage: string;
};

const key = (name: string) => `account:errors.${name}`;
/** A simple shape check; the API has the final word (≤254, valid). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phone = (required: boolean, message: string) =>
	z.pipe(
		z.pipe(z.string(), z.transform(normalizePhone)),
		z.string().check(
			z.refine((value) => !required || value !== '', key('phoneRequired')),
			z.refine((value) => value === '' || E164_PHONE.test(value), message),
		),
	);

export const accountFormSchema = z.object({
	memberNick: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, 'auth:validation.nickRequired'),
			z.minLength(NICK_MIN, 'auth:validation.nickLength'),
			z.maxLength(NICK_MAX, 'auth:validation.nickLength'),
		),
	memberFullName: z
		.string()
		.check(z.trim(), z.refine((value) => value === '' || (value.length >= FULL_NAME_MIN && value.length <= FULL_NAME_MAX), key('fullNameLength'))),
	memberPhone: phone(true, 'auth:validation.phoneFormat'),
	memberEmail: z
		.string()
		.check(z.trim(), z.refine((value) => value === '' || (value.length <= EMAIL_MAX && EMAIL.test(value)), key('email'))),
	memberWhatsapp: phone(false, key('whatsappFormat')),
	memberDesc: z.string().check(z.trim(), z.maxLength(DESC_MAX, key('descLength'))),
	memberImage: z.string(),
});

export type ValidAccountForm = z.output<typeof accountFormSchema>;

export const fromAccount = (member: AccountQuery['getMe']): AccountFormValues => ({
	memberNick: member.memberNick,
	memberFullName: member.memberFullName ?? '',
	memberPhone: member.memberPhone ?? '',
	memberEmail: member.memberEmail ?? '',
	memberWhatsapp: member.memberWhatsapp ?? '',
	memberDesc: member.memberDesc ?? '',
	memberImage: member.memberImage ?? '',
});

/**
 * Only what changed (§1.4). Optional text cleared → null; the picture removed → '' (D-15, null is
 * rejected for memberImage). Returns null when nothing changed.
 */
export const toMemberUpdate = (initial: AccountFormValues, form: ValidAccountForm): MemberUpdate | null => {
	// No _id: updateMember changes the signed-in member.
	const update: MemberUpdate = {};
	const optional = (value: string) => (value === '' ? null : value);
	if (form.memberNick !== initial.memberNick) update.memberNick = form.memberNick;
	if (form.memberFullName !== initial.memberFullName) update.memberFullName = optional(form.memberFullName);
	if (form.memberPhone !== initial.memberPhone) update.memberPhone = form.memberPhone;
	if (form.memberEmail !== initial.memberEmail) update.memberEmail = optional(form.memberEmail);
	if (form.memberWhatsapp !== initial.memberWhatsapp) update.memberWhatsapp = optional(form.memberWhatsapp);
	if (form.memberDesc !== initial.memberDesc) update.memberDesc = optional(form.memberDesc);
	if (form.memberImage !== initial.memberImage) update.memberImage = form.memberImage;
	return Object.keys(update).length > 0 ? update : null;
};

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

/** Change password (D-24, D-26): current only non-empty; new ≥ 8 chars, ≤ 72 bytes, not the current; confirm matches. */
export const passwordFormSchema = z
	.object({
		currentPassword: z.string().check(z.minLength(1, key('currentRequired'))),
		newPassword: z
			.string()
			.check(
				z.minLength(PASSWORD_MIN, 'auth:validation.passwordMin'),
				z.refine((value) => utf8Bytes(value) <= PASSWORD_MAX_BYTES, 'auth:validation.passwordMaxBytes'),
			),
		confirmPassword: z.string(),
	})
	.check(
		z.superRefine(
			(value, ctx) => {
				if (value.newPassword && value.newPassword === value.currentPassword) {
					ctx.addIssue({ code: 'custom', path: ['newPassword'], message: key('samePassword'), input: value.newPassword });
				}
				if (value.confirmPassword !== value.newPassword) {
					ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: key('confirmMismatch'), input: value.confirmPassword });
				}
			},
			{ when: () => true },
		),
	);

export type PasswordFormValues = z.input<typeof passwordFormSchema>;
export const EMPTY_PASSWORD_FORM: PasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };
