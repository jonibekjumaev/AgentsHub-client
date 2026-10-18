import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/auth';
import { safeNextPath } from './redirect';

/**
 * For /login and /signup. A member who opens the page is sent to the safe `next` (or "/").
 * A guest who signs in here is redirected by useLogin/useSignup instead, so this only acts when the
 * session was already a member's before the page ever saw a guest — never two redirects at once.
 *
 * Returns true while the form should be shown: for a guest, and still after that guest signs in here
 * (the form stays put, in its loading state, until the redirect lands).
 */
export const useGuestOnly = (): boolean => {
	const { status } = useAuth();
	const router = useRouter();
	const sawGuest = useRef(false);
	const redirected = useRef(false);

	if (status === 'guest') sawGuest.current = true;

	useEffect(() => {
		if (status !== 'member' || sawGuest.current || redirected.current) return;
		redirected.current = true;
		void router.replace(safeNextPath(router.query.next));
	}, [status, router]);

	return sawGuest.current;
};
