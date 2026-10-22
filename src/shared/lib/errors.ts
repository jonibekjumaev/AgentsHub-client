import { ApolloError } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';

/**
 * Backend error codes (FRONTEND_MIGRATION §1.2) and messages the client must recognise.
 * Messages are matched, never shown — the UI always renders a translated key.
 */
export const ErrorCode = {
	BadRequest: 'BAD_REQUEST',
	GraphqlValidationFailed: 'GRAPHQL_VALIDATION_FAILED',
	NotFound: 'NOT_FOUND',
	Conflict: 'CONFLICT',
	Unauthenticated: 'UNAUTHENTICATED',
	Forbidden: 'FORBIDDEN',
	InternalServerError: 'INTERNAL_SERVER_ERROR',
} as const;

/** Machine-readable `extensions.reason` values (D-33). Unknown reasons are treated like none. */
/**
 * Business messages the UI tells apart (FRONTEND_MIGRATION appendix). Matched, never shown.
 * Many errors share BAD_REQUEST, so the message is the only way to know which field to mark.
 */
export const ErrorMessage = {
	PriceRequired: 'Price greater than 0 is required for ONE_TIME and SUBSCRIPTION pricing!',
	PriceNotAllowed: 'Price is not allowed for FREE and CUSTOM pricing!',
} as const;

export const ErrorReason = {
	MemberBlocked: 'MEMBER_BLOCKED',
} as const;

export type ErrorKey =
	| 'errors:login.invalid'
	| 'errors:login.blocked'
	| 'errors:signup.conflict'
	| 'errors:network'
	| 'errors:unauthenticated'
	| 'errors:forbidden'
	| 'errors:notFound'
	| 'errors:conflict'
	| 'errors:validation'
	| 'errors:unknown';

const keyByCode: Record<string, ErrorKey> = {
	[ErrorCode.Unauthenticated]: 'errors:unauthenticated',
	[ErrorCode.Forbidden]: 'errors:forbidden',
	[ErrorCode.NotFound]: 'errors:notFound',
	[ErrorCode.Conflict]: 'errors:conflict',
	[ErrorCode.BadRequest]: 'errors:validation',
};

export const errorCodeOf = (error: Pick<GraphQLFormattedError, 'extensions'>): string | undefined => {
	const code = error.extensions?.code;
	return typeof code === 'string' ? code : undefined;
};

export const errorReasonOf = (error: Pick<GraphQLFormattedError, 'extensions'>): string | undefined => {
	const reason = error.extensions?.reason;
	return typeof reason === 'string' ? reason : undefined;
};

/** A 4xx/5xx response (e.g. GRAPHQL_VALIDATION_FAILED) arrives as a network error that still carries `result.errors`. */
const errorsFromNetworkError = (networkError: unknown): readonly GraphQLFormattedError[] => {
	if (typeof networkError !== 'object' || networkError === null || !('result' in networkError)) return [];
	const result = (networkError as { result?: unknown }).result;
	if (typeof result !== 'object' || result === null || !('errors' in result)) return [];
	const errors = (result as { errors?: unknown }).errors;
	return Array.isArray(errors) ? (errors as GraphQLFormattedError[]) : [];
};

const graphQLErrorsOf = (error: ApolloError): readonly GraphQLFormattedError[] =>
	error.graphQLErrors.length ? error.graphQLErrors : errorsFromNetworkError(error.networkError);

/** The backend messages of an Apollo error (to match against ErrorMessage; never to display). */
export const getErrorMessages = (error: unknown): string[] =>
	error instanceof ApolloError ? graphQLErrorsOf(error).map((item) => item.message) : [];

/**
 * `extensions.validationErrors` (§1.2): one message per failed DTO rule. Built-in rules start with the
 * field name ("productTitle must be…"), so `field` is that first word.
 */
export const getValidationErrors = (error: unknown): { field: string; message: string }[] => {
	if (!(error instanceof ApolloError)) return [];
	return graphQLErrorsOf(error).flatMap((item) => {
		const list = item.extensions?.validationErrors;
		return Array.isArray(list)
			? list.filter((message): message is string => typeof message === 'string').map((message) => ({ field: message.split(/[s.]/)[0], message }))
			: [];
	});
};

/** The first `extensions.reason` of an Apollo error, if any. */
export const getErrorReason = (error: unknown): string | undefined =>
	error instanceof ApolloError ? graphQLErrorsOf(error).map(errorReasonOf).find(Boolean) : undefined;

/** The first backend error code, 'NETWORK' when the server could not be reached, else undefined. */
export const getErrorCode = (error: unknown): string | undefined => {
	if (!(error instanceof ApolloError)) return undefined;

	const code = graphQLErrorsOf(error).map(errorCodeOf).find(Boolean);

	if (code) return code;
	return error.networkError ? 'NETWORK' : undefined;
};

/** Maps any error to an i18n key in public/locales/{lng}/errors.json. Never returns backend text. */
export const toErrorKey = (error: unknown): ErrorKey => {
	const code = getErrorCode(error);
	if (code === 'NETWORK') return 'errors:network';
	return (code && keyByCode[code]) || 'errors:unknown';
};
