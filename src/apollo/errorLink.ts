import Router from 'next/router';
import { onError } from '@apollo/client/link/error';
import { clearToken } from '@/auth/session';
import { ErrorCode, errorCodeOf, isBlockedError } from '@/shared/lib/errors';

/** On these pages UNAUTHENTICATED means "wrong credentials", not "session expired" (FRONTEND_MIGRATION §1.2). */
const AUTH_PAGES = ['/login', '/signup'];

let redirecting = false;

const redirectToLogin = (query: Record<string, string>) => {
	if (redirecting || AUTH_PAGES.includes(Router.pathname)) return;
	redirecting = true;
	clearToken();
	Router.push({ pathname: '/login', query }).finally(() => {
		redirecting = false;
	});
};

/**
 * Browser only. Session errors log the member out; everything else is left to the caller,
 * which shows it through toErrorKey(). Never logs operations, variables or messages.
 */
export const errorLink = onError(({ graphQLErrors }) => {
	if (!graphQLErrors?.length) return;

	if (graphQLErrors.some(isBlockedError)) {
		redirectToLogin({ reason: 'blocked' });
		return;
	}
	if (graphQLErrors.some((error) => errorCodeOf(error) === ErrorCode.Unauthenticated)) {
		redirectToLogin({ next: Router.asPath });
	}
});
