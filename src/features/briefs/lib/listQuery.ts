import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { AgentCategory, BriefStatus, Direction } from '@/gql/enums';
import type { BriefsInquiry } from '@/gql/graphql';

/**
 * /briefs filters live in the URL (shareable, back button, SEO), like /agents. This module is the single
 * mapping URL query ⇄ BriefFilters ⇄ getBriefs input, used by getServerSideProps and the page alike.
 *
 * URL shape: ?status=closed&category=sales&q=bakery&sort=budget-desc&page=2
 * Any invalid value falls back to its default on its own.
 */

export const BRIEFS_PATH = '/briefs';
export const BRIEFS_PAGE_SIZE = 10;
/** BISearch.text: brief titles, max 100 (§3.6). */
export const BRIEF_SEARCH_MAX = 100;

/** Display order (Briefs.html), the same as the agents filter panel. */
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

export const BRIEF_TABS = ['open', 'closed'] as const;
export type BriefTab = (typeof BRIEF_TABS)[number];

export const BRIEF_SORTS = ['newest', 'budget-desc', 'budget-asc', 'deadline', 'views'] as const;
export type BriefSort = (typeof BRIEF_SORTS)[number];
export const DEFAULT_BRIEF_SORT: BriefSort = 'newest';

/** FRONTEND_MIGRATION §2.5. Briefs without a budget / deadline are listed last in both directions. */
const SORT_TO_API: Record<BriefSort, { sort: string; direction: Direction }> = {
	newest: { sort: 'createdAt', direction: Direction.Desc },
	'budget-desc': { sort: 'briefBudget', direction: Direction.Desc },
	'budget-asc': { sort: 'briefBudget', direction: Direction.Asc },
	deadline: { sort: 'briefDeadline', direction: Direction.Asc },
	views: { sort: 'briefViews', direction: Direction.Desc },
};

export type BriefFilters = {
	tab: BriefTab;
	/** One category or all (Briefs.html has a single select). */
	category: AgentCategory | null;
	/** Title search, trimmed; '' = none. */
	text: string;
	sort: BriefSort;
	page: number;
};

export const DEFAULT_BRIEF_FILTERS: BriefFilters = {
	tab: 'open',
	category: null,
	text: '',
	sort: DEFAULT_BRIEF_SORT,
	page: 1,
};

/** CUSTOMER_SUPPORT ⇄ customer-support (the same slugs as /agents). */
export const categoryToSlug = (value: AgentCategory): string => value.toLowerCase().replace(/_/g, '-');
const slugToCategory = (slug: string): string => slug.trim().toUpperCase().replace(/-/g, '_');

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};

const tabSchema = z.catch(z.enum(BRIEF_TABS), 'open');
const sortSchema = z.catch(z.enum(BRIEF_SORTS), DEFAULT_BRIEF_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);
const categorySchema = z.catch(z.nullable(z.enum(BRIEF_CATEGORIES as [AgentCategory, ...AgentCategory[]])), null);

export const parseBriefFilters = (query: ParsedUrlQuery): BriefFilters => {
	const category = first(query.category);
	return {
		tab: tabSchema.parse(first(query.status)),
		category: categorySchema.parse(category === undefined ? null : slugToCategory(category)),
		text: (first(query.q) ?? '').trim().slice(0, BRIEF_SEARCH_MAX),
		sort: sortSchema.parse(first(query.sort)),
		page: pageSchema.parse(first(query.page)),
	};
};

export type BriefsUrlQuery = Partial<Record<'status' | 'category' | 'q' | 'sort' | 'page', string>>;

/** Only non-default values, in a fixed key order. */
export const toBriefsUrlQuery = (filters: BriefFilters): BriefsUrlQuery => {
	const query: BriefsUrlQuery = {};
	if (filters.tab !== 'open') query.status = filters.tab;
	if (filters.category) query.category = categoryToSlug(filters.category);
	if (filters.text) query.q = filters.text;
	if (filters.sort !== DEFAULT_BRIEF_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const briefsHref = (filters: BriefFilters): string => {
	const search = new URLSearchParams(toBriefsUrlQuery(filters)).toString();
	return search ? `${BRIEFS_PATH}?${search}` : BRIEFS_PATH;
};

/** Canonical URL: status and category describe a real page and stay; search, sort and page are noise. */
export const canonicalBriefsPath = (filters: BriefFilters): string =>
	briefsHref({ ...DEFAULT_BRIEF_FILTERS, tab: filters.tab, category: filters.category });

/** getBriefs variables. Keys only when set, so equal filters give an equal cache key. */
export const toBriefsInquiry = (filters: BriefFilters): BriefsInquiry => {
	const { sort, direction } = SORT_TO_API[filters.sort];
	const search: BriefsInquiry['search'] = {};
	// OPEN is the API default; CLOSED has to be asked for (§3.6).
	if (filters.tab === 'closed') search.briefStatus = BriefStatus.Closed;
	if (filters.category) search.categoryList = [filters.category];
	if (filters.text) search.text = filters.text;
	return { page: filters.page, limit: BRIEFS_PAGE_SIZE, sort, direction, search };
};

/** Anything that narrows the list (the tab does not: both tabs are a full list). */
export const hasActiveBriefFilters = (filters: BriefFilters): boolean => Boolean(filters.category || filters.text);

export const briefsListVariables = (filters: BriefFilters) => ({ input: toBriefsInquiry(filters) });
