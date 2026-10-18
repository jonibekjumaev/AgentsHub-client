import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LOCALES } from './locale';

const pathOf = (url: string): string => url.split(/[?#]/)[0] || '/';

/** "/ko/agents?page=2" → "/agents"; "/uz" → "/". Next puts the locale prefix in routeChangeStart URLs. */
export const stripLocalePrefix = (path: string): string => {
	const locale = LOCALES.find((code) => path === `/${code}` || path.startsWith(`/${code}/`));
	return locale ? path.slice(locale.length + 1) || '/' : path;
};

/** Whether `url` (a routeChangeStart URL) is the same page as `asPath`, only with another query. */
export const isSamePage = (url: string, asPath: string): boolean =>
	stripLocalePrefix(pathOf(url)) === stripLocalePrefix(pathOf(asPath));

/**
 * True while a non-shallow navigation to the current page is running (e.g. a pagination link,
 * which re-runs getServerSideProps). Shallow pushes and navigations to other pages are ignored —
 * the page shows its own loading state for those, or is about to be replaced.
 */
export const useRouteLoading = (): boolean => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const { events, asPath } = router;

	useEffect(() => {
		const start = (url: string, { shallow }: { shallow: boolean }) => {
			if (!shallow && isSamePage(url, asPath)) setLoading(true);
		};
		const done = () => setLoading(false);
		events.on('routeChangeStart', start);
		events.on('routeChangeComplete', done);
		events.on('routeChangeError', done);
		return () => {
			events.off('routeChangeStart', start);
			events.off('routeChangeComplete', done);
			events.off('routeChangeError', done);
		};
	}, [events, asPath]);

	return loading;
};
