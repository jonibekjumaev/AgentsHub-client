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

export type ErrorKey =
	| 'errors:login.invalid'
	| 'errors:login.blocked'
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

/** A 4xx/5xx response (e.g. GRAPHQL_VALIDATION_FAILED) arrives as a network error that still carries `result.errors`. */
const errorsFromNetworkError = (networkError: unknown): readonly GraphQLFormattedError[] => {
	if (typeof networkError !== 'object' || networkError === null || !('result' in networkError)) return [];
	const result = (networkError as { result?: unknown }).result;
	if (typeof result !== 'object' || result === null || !('errors' in result)) return [];
	const errors = (result as { errors?: unknown }).errors;
	return Array.isArray(errors) ? (errors as GraphQLFormattedError[]) : [];
};

/** The first backend error code, 'NETWORK' when the server could not be reached, else undefined. */
export const getErrorCode = (error: unknown): string | undefined => {
	if (!(error instanceof ApolloError)) return undefined;

	const graphQLErrors = error.graphQLErrors.length
		? error.graphQLErrors
		: errorsFromNetworkError(error.networkError);
	const code = graphQLErrors.map(errorCodeOf).find(Boolean);

	if (code) return code;
	return error.networkError ? 'NETWORK' : undefined;
};

/** Maps any error to an i18n key in public/locales/{lng}/errors.json. Never returns backend text. */
export const toErrorKey = (error: unknown): ErrorKey => {
	const code = getErrorCode(error);
	if (code === 'NETWORK') return 'errors:network';
	return (code && keyByCode[code]) || 'errors:unknown';
};
