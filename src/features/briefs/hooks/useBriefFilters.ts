import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { BRIEFS_PATH, briefsHref, parseBriefFilters, toBriefsUrlQuery, type BriefFilters } from '../lib/listQuery';

/** Every filter except the page, which is reset to 1 whenever a filter changes. */
export type BriefFilterPatch = Partial<Omit<BriefFilters, 'page'>>;

/**
 * The /briefs filters, read from and written to the URL (the same model as useAgentFilters):
 * shallow pushes keep the scroll position, the list query refetches in the browser, and the back
 * button walks through earlier filters.
 */
export const useBriefFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseBriefFilters(router.query), [router.query]);

	// The debounced search box may hold an `update` from an earlier render.
	const latest = useRef(filters);
	latest.current = filters;

	const push = useCallback(
		(next: BriefFilters) =>
			router.push({ pathname: BRIEFS_PATH, query: toBriefsUrlQuery(next) }, undefined, { shallow: true, scroll: false }),
		[router],
	);

	const update = useCallback((patch: BriefFilterPatch) => push({ ...latest.current, ...patch, page: 1 }), [push]);

	/** Drops category and search; the tab and sort stay. */
	const clear = useCallback(() => push({ ...latest.current, category: null, text: '', page: 1 }), [push]);

	const pageHref = useCallback((page: number) => briefsHref({ ...filters, page }), [filters]);

	return { filters, update, clear, pageHref };
};
