import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
	AGENTS_PATH,
	DEFAULT_FILTERS,
	agentsHref,
	normalizeFilters,
	parseAgentFilters,
	toUrlQuery,
	type AgentFilters,
} from '../lib/listQuery';

/** Every filter except the page, which is reset to 1 whenever a filter changes. */
export type FilterPatch = Partial<Omit<AgentFilters, 'page'>>;

/**
 * The /agents filters, read from and written to the URL.
 * Changes are shallow pushes with the scroll position kept: getServerSideProps does not re-run,
 * the list query refetches in the browser, and the back button walks through earlier filters.
 */
export const useAgentFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseAgentFilters(router.query), [router.query]);

	// A debounced caller (the search box) may hold an `update` from an earlier render; patching the
	// latest filters keeps a category picked in the meantime.
	const latest = useRef(filters);
	latest.current = filters;

	const push = useCallback(
		(next: AgentFilters) =>
			router.push({ pathname: AGENTS_PATH, query: toUrlQuery(next) }, undefined, { shallow: true, scroll: false }),
		[router],
	);

	const update = useCallback(
		(patch: FilterPatch) => push(normalizeFilters({ ...latest.current, ...patch, page: 1 })),
		[push],
	);

	/** Drops every filter; the chosen sort stays. */
	const clear = useCallback(() => push({ ...DEFAULT_FILTERS, sort: latest.current.sort }), [push]);

	const pageHref = useCallback((page: number) => agentsHref({ ...filters, page }), [filters]);

	return { filters, update, clear, pageHref };
};
