import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { AgentCategory, BriefBudgetType, BriefStatus, Direction } from '@/gql/enums';
import type { BiSearch, BriefsInquiry } from '@/gql/graphql';

/**
 * /briefs filters live in the URL (shareable, back button, SEO), like /agents. This module is the single
 * mapping URL query ⇄ BriefFilters ⇄ getBriefs / getBriefFacets input, used by getServerSideProps and the page.
 *
 * URL shape: ?status=closed&category=sales,content&budget=fixed&q=bakery&past=show&sort=budget&page=2
 * Any invalid value falls back to its default on its own.
 */

export const BRIEFS_PATH = '/briefs';
/** One page of the feed; the first BRIEFS_FIRST_SHOWN show at once, "Show more" opens the rest (as /agents). */
export const BRIEFS_PAGE_SIZE = 20;
export const BRIEFS_FIRST_SHOWN = 9;
/** BISearch.text: brief titles, max 100 (§3.6). */
export const BRIEF_SEARCH_MAX = 100;

/** Display order (the briefs design), the same as the agents rail. */
export const BRIEF_CATEGORIES: readonly AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

export const BRIEF_BUDGET_TYPES: readonly BriefBudgetType[] = [BriefBudgetType.Fixed, BriefBudgetType.OpenToOffers];

export const BRIEF_TABS = ['open', 'closed'] as const;
export type BriefTab = (typeof BRIEF_TABS)[number];

/** The design's sort menu, default first. */
export const BRIEF_SORTS = ['newest', 'budget', 'deadline', 'discussed'] as const;
export type BriefSort = (typeof BRIEF_SORTS)[number];
export const DEFAULT_BRIEF_SORT: BriefSort = 'newest';

/**
 * FRONTEND_MIGRATION §2.5, D-44. Briefs without a budget / deadline are listed last; "deadline" lists upcoming,
 * then passed, then none; "discussed" is comments, then views.
 */
const SORT_TO_API: Record<BriefSort, { sort: string; direction: Direction }> = {
	newest: { sort: 'createdAt', direction: Direction.Desc },
	budget: { sort: 'briefBudget', direction: Direction.Desc },
	deadline: { sort: 'briefDeadline', direction: Direction.Asc },
	discussed: { sort: 'briefComments', direction: Direction.Desc },
};

export type BriefFilters = {
	tab: BriefTab;
	/** Multi-select; [] = all. Rail order, not URL order. */
	categories: AgentCategory[];
	/** Multi-select; [] (or both) = all. */
	budgetTypes: BriefBudgetType[];
	/** Title search, trimmed; '' = none. */
	text: string;
	/** Open tab only: leave out briefs past their deadline (on by default, D-44). */
	hidePast: boolean;
	sort: BriefSort;
	page: number;
};

export const DEFAULT_BRIEF_FILTERS: BriefFilters = {
	tab: 'open',
	categories: [],
	budgetTypes: [],
	text: '',
	hidePast: true,
	sort: DEFAULT_BRIEF_SORT,
	page: 1,
};

/** CUSTOMER_SUPPORT ⇄ customer-support (the same slugs as /agents); OPEN_TO_OFFERS ⇄ offers. */
export const categoryToSlug = (value: AgentCategory): string => value.toLowerCase().replace(/_/g, '-');
const slugToEnum = (slug: string): string => slug.trim().toUpperCase().replace(/-/g, '_');
const BUDGET_SLUGS: Record<BriefBudgetType, string> = { [BriefBudgetType.Fixed]: 'fixed', [BriefBudgetType.OpenToOffers]: 'offers' };

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};

/** `a,b` or repeated keys → the known values, once each, in `order`. */
const listOf = <T extends string>(value: string | string[] | undefined, toValue: (slug: string) => string | undefined, order: readonly T[]): T[] => {
	const slugs = (Array.isArray(value) ? value : value === undefined ? [] : [value]).flatMap((item) => item.split(','));
	const picked = new Set(slugs.map((slug) => toValue(slug)));
	return order.filter((item) => picked.has(item));
};

const tabSchema = z.catch(z.enum(BRIEF_TABS), 'open');
const sortSchema = z.catch(z.enum(BRIEF_SORTS), DEFAULT_BRIEF_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

export const parseBriefFilters = (query: ParsedUrlQuery): BriefFilters => ({
	tab: tabSchema.parse(first(query.status)),
	categories: listOf(query.category, slugToEnum, BRIEF_CATEGORIES),
	budgetTypes: listOf(
		query.budget,
		(slug) => BRIEF_BUDGET_TYPES.find((type) => BUDGET_SLUGS[type] === slug.trim().toLowerCase()),
		BRIEF_BUDGET_TYPES,
	),
	text: (first(query.q) ?? '').trim().slice(0, BRIEF_SEARCH_MAX),
	hidePast: first(query.past) !== 'show',
	sort: sortSchema.parse(first(query.sort)),
	page: pageSchema.parse(first(query.page)),
});

export type BriefsUrlQuery = Partial<Record<'status' | 'category' | 'budget' | 'q' | 'past' | 'sort' | 'page', string>>;

/** Only non-default values, in a fixed key order. */
export const toBriefsUrlQuery = (filters: BriefFilters): BriefsUrlQuery => {
	const query: BriefsUrlQuery = {};
	if (filters.tab !== 'open') query.status = filters.tab;
	if (filters.categories.length) query.category = filters.categories.map(categoryToSlug).join(',');
	if (filters.budgetTypes.length) query.budget = filters.budgetTypes.map((type) => BUDGET_SLUGS[type]).join(',');
	if (filters.text) query.q = filters.text;
	if (!filters.hidePast) query.past = 'show';
	if (filters.sort !== DEFAULT_BRIEF_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const briefsHref = (filters: BriefFilters): string => {
	const search = new URLSearchParams(toBriefsUrlQuery(filters)).toString();
	return search ? `${BRIEFS_PATH}?${search}` : BRIEFS_PATH;
};

/** Canonical URL: the status and a single category describe a real page and stay; the rest is noise. */
export const canonicalBriefsPath = (filters: BriefFilters): string =>
	briefsHref({ ...DEFAULT_BRIEF_FILTERS, tab: filters.tab, categories: filters.categories.length === 1 ? filters.categories : [] });

/** Whether the past-deadline rule applies: only to the open tab (CLOSED briefs are listed as they are). */
export const hidesPastDeadline = (filters: BriefFilters): boolean => filters.tab === 'open' && filters.hidePast;

/** BISearch for the list and the counts. Keys only when set, so equal filters give an equal cache key. */
export const toBriefSearch = (filters: BriefFilters): BiSearch => {
	const search: BiSearch = {};
	// OPEN is the API default; CLOSED has to be asked for (§3.6).
	if (filters.tab === 'closed') search.briefStatus = BriefStatus.Closed;
	if (filters.categories.length) search.categoryList = filters.categories;
	if (filters.budgetTypes.length) search.budgetTypeList = filters.budgetTypes;
	if (filters.text) search.text = filters.text;
	if (hidesPastDeadline(filters)) search.hidePastDeadline = true;
	return search;
};

/** getBriefs variables. */
export const toBriefsInquiry = (filters: BriefFilters): BriefsInquiry => {
	const { sort, direction } = SORT_TO_API[filters.sort];
	return { page: filters.page, limit: BRIEFS_PAGE_SIZE, sort, direction, search: toBriefSearch(filters) };
};

export const briefsListVariables = (filters: BriefFilters) => ({ input: toBriefsInquiry(filters) });

/** getBriefFacets variables (D-44): the same search as the list, without page and sort. */
export const briefFacetsVariables = (filters: BriefFilters) => ({ input: toBriefSearch(filters) });

/**
 * The same counts with the past-deadline briefs kept, to say how many the switch hides ("3 briefs are past
 * deadline. Show them"). null when the switch hides nothing (closed tab, or switched off).
 */
export const briefFacetsWithPastVariables = (filters: BriefFilters) =>
	hidesPastDeadline(filters) ? briefFacetsVariables({ ...filters, hidePast: false }) : null;

/** Anything that narrows the list (the tab, sort and past-deadline switch do not). */
export const hasActiveBriefFilters = (filters: BriefFilters): boolean =>
	Boolean(filters.categories.length || filters.budgetTypes.length || filters.text);
