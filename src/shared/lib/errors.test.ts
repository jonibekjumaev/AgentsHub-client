import { ApolloError } from '@apollo/client';
import type { GraphQLFormattedError } from 'graphql';
import { describe, expect, it } from 'vitest';
import { ErrorReason, getErrorCode, getErrorReason, toErrorKey } from './errors';

const gqlError = (extensions: Record<string, unknown>, message = 'backend text'): GraphQLFormattedError => ({
	message,
	extensions,
});

const withErrors = (...graphQLErrors: GraphQLFormattedError[]) => new ApolloError({ graphQLErrors });

describe('toErrorKey', () => {
	it('maps an unreachable server to errors:network', () => {
		expect(toErrorKey(new ApolloError({ networkError: new TypeError('Failed to fetch') }))).toBe('errors:network');
	});

	it('maps UNAUTHENTICATED to errors:unauthenticated', () => {
		expect(toErrorKey(withErrors(gqlError({ code: 'UNAUTHENTICATED' })))).toBe('errors:unauthenticated');
	});

	it('maps a blocked member to errors:forbidden and exposes the reason', () => {
		const error = withErrors(gqlError({ code: 'FORBIDDEN', reason: 'MEMBER_BLOCKED' }, 'You have been blocked!'));
		expect(toErrorKey(error)).toBe('errors:forbidden');
		expect(getErrorReason(error)).toBe(ErrorReason.MemberBlocked);
	});

	it('maps BAD_REQUEST (our validation code) to errors:validation', () => {
		expect(toErrorKey(withErrors(gqlError({ code: 'BAD_REQUEST' })))).toBe('errors:validation');
	});

	it('treats codes the API never sends, like BAD_USER_INPUT, as errors:unknown', () => {
		expect(toErrorKey(withErrors(gqlError({ code: 'BAD_USER_INPUT' })))).toBe('errors:unknown');
	});

	it('reads the code from a 4xx response that arrives as a network error', () => {
		const networkError = Object.assign(new Error('Response not successful'), {
			result: { errors: [gqlError({ code: 'GRAPHQL_VALIDATION_FAILED' })] },
		});
		const error = new ApolloError({ networkError });
		expect(getErrorCode(error)).toBe('GRAPHQL_VALIDATION_FAILED');
		expect(toErrorKey(error)).toBe('errors:unknown');
	});

	it('returns errors:unknown for anything that is not an ApolloError', () => {
		expect(toErrorKey(new Error('boom'))).toBe('errors:unknown');
		expect(toErrorKey(undefined)).toBe('errors:unknown');
	});

	it('never returns backend text', () => {
		const key = toErrorKey(withErrors(gqlError({ code: 'CONFLICT' }, 'Already used member nick or phone')));
		expect(key).toBe('errors:conflict');
	});
});

describe('getErrorReason', () => {
	it('is undefined without a reason, and ignores unknown error types', () => {
		expect(getErrorReason(withErrors(gqlError({ code: 'FORBIDDEN' })))).toBeUndefined();
		expect(getErrorReason(new Error('x'))).toBeUndefined();
	});
});
