import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
	CREATORS_PATH,
	creatorsHref,
	parseCreatorFilters,
	toCreatorsUrlQuery,
	type CreatorFilters,
} from '../lib/creatorsQuery';

export type CreatorFilterPatch = Partial<Omit<CreatorFilters, 'page'>>;

/** /creators filters in the URL: shallow pushes, scroll kept, back button works (same as /agents and /briefs). */
export const useCreatorFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseCreatorFilters(router.query), [router.query]);
	// The debounced search box may hold an `update` from an earlier render.
	const latest = useRef(filters);
	latest.current = filters;

	const push = useCallback(
		(next: CreatorFilters) =>
			router.push({ pathname: CREATORS_PATH, query: toCreatorsUrlQuery(next) }, undefined, {
				shallow: true,
				scroll: false,
			}),
		[router],
	);

	const update = useCallback((patch: CreatorFilterPatch) => push({ ...latest.current, ...patch, page: 1 }), [push]);

	/** Drops the search, categories and "Following"; the "with agents" switch and the sort stay. */
	const clear = useCallback(
		() => push({ ...latest.current, text: '', categories: [], followingOnly: false, page: 1 }),
		[push],
	);

	const pageHref = useCallback((page: number) => creatorsHref({ ...filters, page }), [filters]);

	return { filters, update, clear, pageHref };
};
