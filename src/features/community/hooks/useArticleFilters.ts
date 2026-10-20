import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { COMMUNITY_PATH, articlesHref, parseArticleFilters, toArticlesUrlQuery, type ArticleFilters } from '../lib/articles';

/** /community filters in the URL: shallow pushes, scroll kept, back button works. */
export const useArticleFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseArticleFilters(router.query), [router.query]);
	const latest = useRef(filters);
	latest.current = filters;

	const update = useCallback(
		(patch: Partial<Omit<ArticleFilters, 'page'>>) =>
			router.push({ pathname: COMMUNITY_PATH, query: toArticlesUrlQuery({ ...latest.current, ...patch, page: 1 }) }, undefined, {
				shallow: true,
				scroll: false,
			}),
		[router],
	);
	const pageHref = useCallback((page: number) => articlesHref({ ...filters, page }), [filters]);
	return { filters, update, pageHref };
};
