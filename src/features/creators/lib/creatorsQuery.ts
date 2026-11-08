import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { AgentCategory, Direction } from '@/gql/enums';
import type { CreatorsInquiry, CriSearch } from '@/gql/graphql';

/**
 * /creators filters live in the URL, like /agents and /briefs (D-45):
 * ?q=nova&category=sales,education&agents=any&following=1&sort=followers&page=2
 * Any invalid value falls back to its default on its own.
 */

export const CREATORS_PATH = '/creators';
/** One page; the first CREATORS_FIRST_SHOWN show at once, "Show more" opens the rest (as /agents and /briefs). */
export const CREATORS_PAGE_SIZE = 20;
export const CREATORS_FIRST_SHOWN = 9;
export const CREATOR_SEARCH_MAX = 100;

export const memberHref = (memberId: string) => `/members/${memberId}`;

/** The rail order (the same as /agents and /briefs). */
export const CREATOR_CATEGORIES: readonly AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

/** The design's sort menu, default first. */
export const CREATOR_SORTS = ['rank', 'followers', 'agents', 'name'] as const;
export type CreatorSort = typeof CREATOR_SORTS[number];
export const DEFAULT_CREATOR_SORT: CreatorSort = 'rank';

/**
 * §2.5, D-45. memberRank is the nightly score (higher is better); "agents" counts ACTIVE agents only
 * (creatorProducts, the number on the cards), not memberProducts (which includes paused ones, D-16).
 */
const SORT_TO_API: Record<CreatorSort, { sort: string; direction: Direction }> = {
	rank: { sort: 'memberRank', direction: Direction.Desc },
	followers: { sort: 'memberFollowers', direction: Direction.Desc },
	agents: { sort: 'creatorProducts', direction: Direction.Desc },
	name: { sort: 'creatorName', direction: Direction.Asc },
};

export type CreatorFilters = {
	text: string;
	/** Multi-select; [] = all. Rail order. */
	categories: AgentCategory[];
	/** "Only creators with agents": on by default. */
	withAgentsOnly: boolean;
	/** "Following": only creators I follow (signed in). */
	followingOnly: boolean;
	sort: CreatorSort;
	page: number;
};

export const DEFAULT_CREATOR_FILTERS: CreatorFilters = {
	text: '',
	categories: [],
	withAgentsOnly: true,
	followingOnly: false,
	sort: DEFAULT_CREATOR_SORT,
	page: 1,
};

const categoryToSlug = (value: AgentCategory): string => value.toLowerCase().replace(/_/g, '-');
const slugToEnum = (slug: string): string => slug.trim().toUpperCase().replace(/-/g, '_');

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};

const sortSchema = z.catch(z.enum(CREATOR_SORTS), DEFAULT_CREATOR_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

const categoriesOf = (value: string | string[] | undefined): AgentCategory[] => {
	const slugs = (Array.isArray(value) ? value : value === undefined ? [] : [value]).flatMap((item) => item.split(','));
	const picked = new Set(slugs.map(slugToEnum));
	return CREATOR_CATEGORIES.filter((category) => picked.has(category));
};

export const parseCreatorFilters = (query: ParsedUrlQuery): CreatorFilters => ({
	text: (first(query.q) ?? '').trim().slice(0, CREATOR_SEARCH_MAX),
	categories: categoriesOf(query.category),
	withAgentsOnly: first(query.agents) !== 'any',
	followingOnly: first(query.following) === '1',
	sort: sortSchema.parse(first(query.sort)),
	page: pageSchema.parse(first(query.page)),
});

export type CreatorsUrlQuery = Partial<Record<'q' | 'category' | 'agents' | 'following' | 'sort' | 'page', string>>;

/** Only non-default values, in a fixed key order. */
export const toCreatorsUrlQuery = (filters: CreatorFilters): CreatorsUrlQuery => {
	const query: CreatorsUrlQuery = {};
	if (filters.text) query.q = filters.text;
	if (filters.categories.length) query.category = filters.categories.map(categoryToSlug).join(',');
	if (!filters.withAgentsOnly) query.agents = 'any';
	if (filters.followingOnly) query.following = '1';
	if (filters.sort !== DEFAULT_CREATOR_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const creatorsHref = (filters: CreatorFilters): string => {
	const search = new URLSearchParams(toCreatorsUrlQuery(filters)).toString();
	return search ? `${CREATORS_PATH}?${search}` : CREATORS_PATH;
};

/** CRISearch for the list and the counts. Keys only when set, so equal filters give an equal cache key. */
export const toCreatorSearch = (filters: CreatorFilters): CriSearch => {
	const search: CriSearch = {};
	if (filters.text) search.text = filters.text;
	if (filters.categories.length) search.categoryList = filters.categories;
	if (filters.withAgentsOnly) search.withAgentsOnly = true;
	if (filters.followingOnly) search.followingOnly = true;
	return search;
};

export const toCreatorsInquiry = (filters: CreatorFilters): CreatorsInquiry => {
	const { sort, direction } = SORT_TO_API[filters.sort];
	return { page: filters.page, limit: CREATORS_PAGE_SIZE, sort, direction, search: toCreatorSearch(filters) };
};

export const creatorsListVariables = (filters: CreatorFilters) => ({ input: toCreatorsInquiry(filters) });

/** getCreatorFacets variables (D-45): the same search as the list, without page and sort. */
export const creatorFacetsVariables = (filters: CreatorFilters) => ({ input: toCreatorSearch(filters) });

/** Anything that narrows the list besides the default switch (the sort and page do not). */
export const hasActiveCreatorFilters = (filters: CreatorFilters): boolean =>
	Boolean(filters.text || filters.categories.length || filters.followingOnly);
