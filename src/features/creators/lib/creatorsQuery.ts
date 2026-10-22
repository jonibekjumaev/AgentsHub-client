import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { Direction } from '@/gql/enums';
import type { CreatorsInquiry } from '@/gql/graphql';

/** /creators?q=nova&sort=products&page=2 — the same URL model as /agents and /briefs. */

export const CREATORS_PATH = '/creators';
export const CREATORS_PAGE_SIZE = 9;
export const CREATOR_SEARCH_MAX = 100;

export const memberHref = (memberId: string) => `/members/${memberId}`;

export const CREATOR_SORTS = ['rank', 'products', 'likes', 'views', 'newest'] as const;
export type CreatorSort = (typeof CREATOR_SORTS)[number];
export const DEFAULT_CREATOR_SORT: CreatorSort = 'rank';

/**
 * §2.5. memberRank is a score computed nightly from likes and views (D-22): higher is better, the same
 * as productRank on /agents. The "#n" on cards is the position in this sorted list, not the score.
 */
const SORT_TO_API: Record<CreatorSort, { sort: string; direction: Direction }> = {
	rank: { sort: 'memberRank', direction: Direction.Desc },
	products: { sort: 'memberProducts', direction: Direction.Desc },
	likes: { sort: 'memberLikes', direction: Direction.Desc },
	views: { sort: 'memberViews', direction: Direction.Desc },
	newest: { sort: 'createdAt', direction: Direction.Desc },
};

export type CreatorFilters = { text: string; sort: CreatorSort; page: number };
export const DEFAULT_CREATOR_FILTERS: CreatorFilters = { text: '', sort: DEFAULT_CREATOR_SORT, page: 1 };

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};

const sortSchema = z.catch(z.enum(CREATOR_SORTS), DEFAULT_CREATOR_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

export const parseCreatorFilters = (query: ParsedUrlQuery): CreatorFilters => ({
	text: (first(query.q) ?? '').trim().slice(0, CREATOR_SEARCH_MAX),
	sort: sortSchema.parse(first(query.sort)),
	page: pageSchema.parse(first(query.page)),
});

export const toCreatorsUrlQuery = (filters: CreatorFilters): Partial<Record<'q' | 'sort' | 'page', string>> => {
	const query: Partial<Record<'q' | 'sort' | 'page', string>> = {};
	if (filters.text) query.q = filters.text;
	if (filters.sort !== DEFAULT_CREATOR_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const creatorsHref = (filters: CreatorFilters): string => {
	const search = new URLSearchParams(toCreatorsUrlQuery(filters)).toString();
	return search ? `${CREATORS_PATH}?${search}` : CREATORS_PATH;
};

export const toCreatorsInquiry = (filters: CreatorFilters): CreatorsInquiry => {
	const { sort, direction } = SORT_TO_API[filters.sort];
	return {
		page: filters.page,
		limit: CREATORS_PAGE_SIZE,
		sort,
		direction,
		search: filters.text ? { text: filters.text } : {},
	};
};

export const creatorsListVariables = (filters: CreatorFilters) => ({ input: toCreatorsInquiry(filters) });
