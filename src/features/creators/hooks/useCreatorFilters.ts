import { useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { CREATORS_PATH, creatorsHref, parseCreatorFilters, toCreatorsUrlQuery, type CreatorFilters } from '../lib/creatorsQuery';

export type CreatorFilterPatch = Partial<Omit<CreatorFilters, 'page'>>;

/** /creators filters in the URL: shallow pushes, scroll kept, back button works (same as /agents). */
export const useCreatorFilters = () => {
	const router = useRouter();
	const filters = useMemo(() => parseCreatorFilters(router.query), [router.query]);
	const latest = useRef(filters);
	latest.current = filters;

	const update = useCallback(
		(patch: CreatorFilterPatch) =>
			router.push({ pathname: CREATORS_PATH, query: toCreatorsUrlQuery({ ...latest.current, ...patch, page: 1 }) }, undefined, {
				shallow: true,
				scroll: false,
			}),
		[router],
	);

	const pageHref = useCallback((page: number) => creatorsHref({ ...filters, page }), [filters]);

	return { filters, update, pageHref };
};
