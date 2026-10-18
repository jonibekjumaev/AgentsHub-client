import { z } from 'zod';
import { MemberType } from '@/gql/enums';

/**
 * Mirrors the backend DTOs (agentshub-api libs/dto/member/member.input.ts, libs/config.ts).
 * Messages are i18n keys in auth.json; the form translates them.
 */
export const NICK_MIN = 3;
export const NICK_MAX = 12;
export const PASSWORD_MIN = 8; // characters (D-26)
export const PASSWORD_MAX_BYTES = 72; // UTF-8 bytes: bcrypt ignores the rest (D-26)
/** E.164: "+", country code without a leading 0, 8–15 digits in total (D-25). */
export const E164_PHONE = /^\+[1-9]\d{7,14}$/;

const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

/** The API doesn't reformat (D-25): strip spaces, dashes, dots and brackets people type. */
export const normalizePhone = (value: string) => value.replace(/[\s\-().]/g, '');

/** @Length(3, 12) counts UTF-16 units, the same as String.length. */
const nick = z
	.string()
	.trim()
	.min(1, 'auth:validation.nickRequired')
	.min(NICK_MIN, 'auth:validation.nickLength')
	.max(NICK_MAX, 'auth:validation.nickLength');

/** LoginInput: nick 3–12, password only non-empty — old 5–7 character passwords still log in (D-26). */
export const loginSchema = z.object({
	memberNick: nick,
	memberPassword: z.string().min(1, 'auth:validation.passwordRequired'),
});

/** MemberInput: memberType USER or CREATOR only (D-14), E.164 phone (D-25), new-password rule (D-26). */
export const signupSchema = z.object({
	memberType: z.enum([MemberType.User, MemberType.Creator], { error: 'auth:validation.roleRequired' }),
	memberNick: nick,
	memberPhone: z
		.string()
		.transform(normalizePhone)
		.pipe(z.string().min(1, 'auth:validation.phoneRequired').regex(E164_PHONE, 'auth:validation.phoneFormat')),
	memberPassword: z
		.string()
		.min(PASSWORD_MIN, 'auth:validation.passwordMin')
		.refine((value) => utf8Bytes(value) <= PASSWORD_MAX_BYTES, 'auth:validation.passwordMaxBytes'),
});

/** The new-password rule alone, for the live hint under the field. */
export const meetsPasswordRule = (password: string) =>
	password.length >= PASSWORD_MIN && utf8Bytes(password) <= PASSWORD_MAX_BYTES;

export type LoginValues = z.input<typeof loginSchema>;
export type LoginData = z.output<typeof loginSchema>;
export type SignupValues = z.input<typeof signupSchema>;
export type SignupData = z.output<typeof signupSchema>;
