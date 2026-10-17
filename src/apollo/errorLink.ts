import Router from 'next/router';
import type { GraphQLFormattedError } from 'graphql';
import { onError } from '@apollo/client/link/error';
import { clearToken } from '@/auth/session';
import { ErrorCode, errorCodeOf } from '@/shared/lib/errors';

/**
 * How errorLink treats session errors, set per operation with `context: { authErrors }`:
 * - 'redirect' (default): clear the token and send the member to /login.
 * - 'silent': clear the token, no redirect for UNAUTHENTICATED (session restore on page load).
 * - 'ignore': do nothing — the caller handles it (login/signup, where UNAUTHENTICATED = wrong credentials).
 */
export type AuthErrorMode = 'redirect' | 'silent' | 'ignore';

/** On these pages UNAUTHENTICATED means "wrong credentials", not "session expired" (FRONTEND_MIGRATION §1.2). */
const AUTH_PAGES = ['/login', '/signup'];
const BLOCKED_MESSAGE = 'You have been blocked!';

/** TODO(backend Step 13): replace with extensions.reason === 'MEMBER_BLOCKED'. */
const isBlockedMemberError = (error: GraphQLFormattedError): boolean =>
	errorCodeOf(error) === ErrorCode.Forbidden && error.message === BLOCKED_MESSAGE;

let redirecting = false;

const redirectToLogin = (query: Record<string, string>) => {
	if (redirecting || AUTH_PAGES.includes(Router.pathname)) return;
	redirecting = true;
	Router.push({ pathname: '/login', query }).finally(() => {
		redirecting = false;
	});
};

/**
 * Browser only. Session errors log the member out; everything else is left to the caller,
 * which shows it through toErrorKey(). Never logs operations, variables or messages.
 */
export const errorLink = onError(({ graphQLErrors, operation }) => {
	const mode: AuthErrorMode = operation.getContext().authErrors ?? 'redirect';
	if (mode === 'ignore' || !graphQLErrors?.length) return;

	if (graphQLErrors.some(isBlockedMemberError)) {
		clearToken();
		redirectToLogin({ reason: 'blocked' });
		return;
	}
	if (graphQLErrors.some((error) => errorCodeOf(error) === ErrorCode.Unauthenticated)) {
		clearToken();
		if (mode === 'redirect') redirectToLogin({ next: Router.asPath });
	}
});
