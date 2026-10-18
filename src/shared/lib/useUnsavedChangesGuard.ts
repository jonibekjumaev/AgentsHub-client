import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

/** Thrown to stop a Next route change; Next treats the throw as "cancelled" (routeChangeError). */
const ROUTE_CHANGE_CANCELLED = 'Route change cancelled: unsaved changes.';

/**
 * Asks before leaving a page with unsaved changes:
 * - in-app navigation (links, router.push): a confirm dialog; "Cancel" keeps the page. Back/forward ask too
 *   and keep the page on "Cancel", but the browser has already changed the address bar (Pages Router limit);
 * - reload, closing the tab, typing another URL: the browser's own "Leave site?" prompt (beforeunload).
 * Shallow pushes (query-only changes on the same page) are not navigations away and pass.
 * Call `allowNavigation()` right before navigating away on purpose (e.g. after saving).
 */
export const useUnsavedChangesGuard = (dirty: boolean, message: string) => {
	const router = useRouter();
	const bypass = useRef(false);

	useEffect(() => {
		if (!dirty) return;

		const onBeforeUnload = (event: BeforeUnloadEvent) => {
			if (bypass.current) return;
			event.preventDefault();
			// Legacy browsers need returnValue set; the text itself is never shown.
			event.returnValue = '';
		};

		const onRouteChangeStart = (_url: string, { shallow }: { shallow: boolean }) => {
			if (bypass.current || shallow) return;
			if (window.confirm(message)) return;
			router.events.emit('routeChangeError', new Error(ROUTE_CHANGE_CANCELLED), _url, { shallow });
			// Next's documented way to abort: throw from routeChangeStart. A string keeps the dev overlay quiet.
			throw ROUTE_CHANGE_CANCELLED;
		};

		window.addEventListener('beforeunload', onBeforeUnload);
		router.events.on('routeChangeStart', onRouteChangeStart);
		return () => {
			window.removeEventListener('beforeunload', onBeforeUnload);
			router.events.off('routeChangeStart', onRouteChangeStart);
		};
	}, [dirty, message, router.events]);

	const allowNavigation = useCallback(() => {
		bypass.current = true;
	}, []);

	return { allowNavigation };
};
