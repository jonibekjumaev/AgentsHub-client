import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
	AGENTS_PATH,
	DEFAULT_FILTERS,
	agentsHref,
	normalizeFilters,
	parseAgentFilters,
	parseAgentView,
	toUrlQuery,
	type AgentFilters,
	type AgentView,
} from '../lib/listQuery';

/** Every filter except the page, which is reset to 1 whenever a filter changes. */
export type FilterPatch = Partial<Omit<AgentFilters, 'page'>>;

/** The grid is the default; only `view=list` is written to the URL. */
const viewQuery = (view: AgentView) => (view === 'list' ? { view } : {});

/**
 * The /agents filters and layout, read from and written to the URL.
 * Changes are shallow pushes with the scroll position kept: getServerSideProps does not re-run,
 * the list query refetches in the browser, and the back button walks through earlier filters.
 */
export const useAgentFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseAgentFilters(router.query), [router.query]);
	const view = parseAgentView(router.query);

	// A debounced caller (the search box) may hold an `update` from an earlier render; patching the
	// latest filters keeps a category picked in the meantime.
	const latest = useRef({ filters, view });
	latest.current = { filters, view };

	const push = useCallback(
		(next: AgentFilters, nextView: AgentView = latest.current.view) =>
			router.push({ pathname: AGENTS_PATH, query: { ...toUrlQuery(next), ...viewQuery(nextView) } }, undefined, {
				shallow: true,
				scroll: false,
			}),
		[router],
	);

	const update = useCallback(
		(patch: FilterPatch) => push(normalizeFilters({ ...latest.current.filters, ...patch, page: 1 })),
		[push],
	);

	/** Drops every filter; the chosen sort and layout stay. */
	const clear = useCallback(() => push({ ...DEFAULT_FILTERS, sort: latest.current.filters.sort }), [push]);

	/** Grid or list; the page and filters stay. */
	const setView = useCallback((next: AgentView) => push(latest.current.filters, next), [push]);

	const pageHref = useCallback(
		(page: number) => {
			const href = agentsHref({ ...filters, page });
			if (view !== 'list') return href;
			return `${href}${href.includes('?') ? '&' : '?'}view=list`;
		},
		[filters, view],
	);

	return { filters, view, update, clear, setView, pageHref };
};
