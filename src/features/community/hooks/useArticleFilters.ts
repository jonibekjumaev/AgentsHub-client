import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { COMMUNITY_PATH, articlesHref, parseArticleFilters, toArticlesUrlQuery, type ArticleFilters } from '../lib/articles';

/** Every filter except the page, which is reset to 1 whenever a filter changes. */
export type ArticleFilterPatch = Partial<Omit<ArticleFilters, 'page'>>;

/** /community filters in the URL: shallow pushes, scroll kept, back button works. */
export const useArticleFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseArticleFilters(router.query), [router.query]);
	// The debounced search box may hold an `update` from an earlier render.
	const latest = useRef(filters);
	latest.current = filters;

	const push = useCallback(
		(next: ArticleFilters) =>
			router.push({ pathname: COMMUNITY_PATH, query: toArticlesUrlQuery(next) }, undefined, { shallow: true, scroll: false }),
		[router],
	);
	const update = useCallback((patch: ArticleFilterPatch) => push({ ...latest.current, ...patch, page: 1 }), [push]);
	/** Drops the topic and the search; the sort stays. */
	const clear = useCallback(() => push({ ...latest.current, category: null, text: '', page: 1 }), [push]);
	const pageHref = useCallback((page: number) => articlesHref({ ...filters, page }), [filters]);
	return { filters, update, clear, pageHref };
};
