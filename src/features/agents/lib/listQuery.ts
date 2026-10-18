import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { AgentCategory, Direction, ProductPricing } from '@/gql/enums';
import type { ProductsInquiry } from '@/gql/graphql';

/**
 * /agents filters live in the URL (shareable, back button, SEO). This module is the single mapping
 * URL query ⇄ AgentFilters ⇄ getProducts input, used by getServerSideProps and the page alike,
 * so the SSR cache entry and the browser query always have identical variables.
 *
 * URL shape: ?q=support&category=customer-support&pricing=subscription&min=10&max=100&tag=telegram&sort=rank&page=2
 * Lists repeat the key (category=sales&category=marketing); a comma list is accepted too.
 * Any invalid value falls back to its default on its own — one bad param never resets the others.
 */

export const AGENTS_PAGE_SIZE = 12;
/** search.text max length (FRONTEND_MIGRATION §1.5). */
export const SEARCH_TEXT_MAX = 100;
/** Backend libs/config.ts: productTagsMaxCount, productTagMaxLength. */
export const TAGS_MAX = 10;
export const TAG_MAX_LENGTH = 30;
/** Upper bound for a price filter value (the API takes any Float ≥ 0; this keeps URLs sane). */
export const PRICE_MAX = 1_000_000;

/** Display order of the filter panel (Agents.html), not the alphabetical schema order. */
export const AGENT_CATEGORIES: readonly AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

export const AGENT_PRICINGS: readonly ProductPricing[] = [
	ProductPricing.Free,
	ProductPricing.OneTime,
	ProductPricing.Subscription,
	ProductPricing.Custom,
];

/** Pricings that have a price; the price range matches only these (D-03). */
const PRICED: readonly ProductPricing[] = [ProductPricing.OneTime, ProductPricing.Subscription];

export const AGENT_SORTS = ['newest', 'rank', 'likes', 'views', 'price-asc', 'price-desc'] as const;
export type AgentSort = (typeof AGENT_SORTS)[number];
export const DEFAULT_SORT: AgentSort = 'newest';

/** FRONTEND_MIGRATION §2.5 sort values. `productPrice` puts unpriced products last in both directions. */
const SORT_TO_API: Record<AgentSort, { sort: string; direction: Direction }> = {
	newest: { sort: 'createdAt', direction: Direction.Desc },
	rank: { sort: 'productRank', direction: Direction.Desc },
	likes: { sort: 'productLikes', direction: Direction.Desc },
	views: { sort: 'productViews', direction: Direction.Desc },
	'price-asc': { sort: 'productPrice', direction: Direction.Asc },
	'price-desc': { sort: 'productPrice', direction: Direction.Desc },
};

export type AgentFilters = {
	/** Title search; '' = none. */
	text: string;
	categories: AgentCategory[];
	pricing: ProductPricing[];
	minPrice: number | null;
	maxPrice: number | null;
	/** Trimmed, lowercased (the API compares tags that way). */
	tags: string[];
	sort: AgentSort;
	page: number;
};

export const DEFAULT_FILTERS: AgentFilters = {
	text: '',
	categories: [],
	pricing: [],
	minPrice: null,
	maxPrice: null,
	tags: [],
	sort: DEFAULT_SORT,
	page: 1,
};

/** CUSTOMER_SUPPORT ⇄ customer-support: readable URLs, enum values in the API. */
export const enumToSlug = (value: string): string => value.toLowerCase().replace(/_/g, '-');
const slugToEnum = (slug: string): string => slug.trim().toUpperCase().replace(/-/g, '_');

/** The price range applies when no pricing is picked, or a priced one is among them (D-03). */
export const isPriceFilterApplicable = (pricing: readonly ProductPricing[]): boolean =>
	pricing.length === 0 || pricing.some((value) => PRICED.includes(value));

/** Search, category, pricing, price or tags — sort and page are not filters. */
export const hasActiveFilters = (filters: AgentFilters): boolean =>
	filters.text !== '' ||
	filters.categories.length > 0 ||
	filters.pricing.length > 0 ||
	filters.minPrice !== null ||
	filters.maxPrice !== null ||
	filters.tags.length > 0;

/** How many removable filter values are set (one per ActiveFilters chip). */
export const activeFilterCount = (filters: AgentFilters): number =>
	(filters.text ? 1 : 0) +
	filters.categories.length +
	filters.pricing.length +
	(filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
	filters.tags.length;

// ---------- parsing ----------

const textSchema = z.catch(z.string().check(z.trim(), z.maxLength(SEARCH_TEXT_MAX)), '');
const sortSchema = z.catch(z.enum(AGENT_SORTS), DEFAULT_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);
const priceSchema = z.catch(z.nullable(z.coerce.number().check(z.minimum(0), z.maximum(PRICE_MAX))), null);
const categorySchema = z.enum(AGENT_CATEGORIES as [AgentCategory, ...AgentCategory[]]);
const pricingSchema = z.enum(AGENT_PRICINGS as [ProductPricing, ...ProductPricing[]]);
const tagSchema = z.string().check(z.trim(), z.toLowerCase(), z.minLength(1), z.maxLength(TAG_MAX_LENGTH));

/** A tag as the API compares it (trimmed, lowercased), or null when it can't be one. */
export const normalizeTag = (raw: string): string | null => {
	const result = tagSchema.safeParse(raw);
	return result.success ? result.data : null;
};

/** The first value of a param; '' counts as absent (`?min=` must not become 0). */
const single = (value: string | string[] | undefined): string | undefined => {
	const first = Array.isArray(value) ? value[0] : value;
	return first === undefined || first.trim() === '' ? undefined : first;
};

/** Repeated keys and comma lists, flattened. */
const many = (value: string | string[] | undefined): string[] =>
	(Array.isArray(value) ? value : value === undefined ? [] : [value]).flatMap((item) => item.split(','));

/** Valid items only, deduplicated, at most `max`. */
const validItems = <T>(raw: string[], schema: z.ZodMiniType<T>, max = Infinity): T[] => {
	const items: T[] = [];
	for (const item of raw) {
		const result = schema.safeParse(item);
		if (result.success && !items.includes(result.data)) items.push(result.data);
		if (items.length === max) break;
	}
	return items;
};

/** Keeps the panel order so equal filter sets always serialize to the same URL. */
const inOrder = <T>(items: T[], order: readonly T[]): T[] => order.filter((item) => items.includes(item));

/**
 * The fixed point of the filter rules: ordered lists, no impossible price range.
 * Every filters value that reaches the URL or the API goes through here.
 */
export const normalizeFilters = (filters: AgentFilters): AgentFilters => {
	const pricing = inOrder(filters.pricing, AGENT_PRICINGS);
	let { minPrice, maxPrice } = filters;
	// FREE / CUSTOM only: no product can match a range, so it is dropped (the panel disables it too).
	// start > end is rejected by the API: an invalid pair falls back to no range.
	if (!isPriceFilterApplicable(pricing) || (minPrice !== null && maxPrice !== null && minPrice > maxPrice)) {
		minPrice = null;
		maxPrice = null;
	}
	return {
		...filters,
		categories: inOrder(filters.categories, AGENT_CATEGORIES),
		pricing,
		minPrice,
		maxPrice,
	};
};

export const parseAgentFilters = (query: ParsedUrlQuery): AgentFilters =>
	normalizeFilters({
		text: textSchema.parse(single(query.q) ?? ''),
		categories: validItems(many(query.category).map(slugToEnum), categorySchema),
		pricing: validItems(many(query.pricing).map(slugToEnum), pricingSchema),
		minPrice: priceSchema.parse(single(query.min) ?? null),
		maxPrice: priceSchema.parse(single(query.max) ?? null),
		tags: validItems(many(query.tag), tagSchema, TAGS_MAX),
		sort: sortSchema.parse(single(query.sort)),
		page: pageSchema.parse(single(query.page)),
	});

// ---------- serializing ----------

export type AgentsUrlQuery = Partial<Record<'q' | 'category' | 'pricing' | 'min' | 'max' | 'tag' | 'sort' | 'page', string | string[]>>;

/** Only non-default values, in a fixed key order. */
export const toUrlQuery = (input: AgentFilters): AgentsUrlQuery => {
	const filters = normalizeFilters(input);
	const query: AgentsUrlQuery = {};
	if (filters.text) query.q = filters.text;
	if (filters.categories.length) query.category = filters.categories.map(enumToSlug);
	if (filters.pricing.length) query.pricing = filters.pricing.map(enumToSlug);
	if (filters.minPrice !== null) query.min = String(filters.minPrice);
	if (filters.maxPrice !== null) query.max = String(filters.maxPrice);
	if (filters.tags.length) query.tag = filters.tags;
	if (filters.sort !== DEFAULT_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

/** "a=1&b=2&b=3" (no leading "?"); '' when empty. */
export const toSearchString = (query: AgentsUrlQuery): string => {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		(Array.isArray(value) ? value : [value]).forEach((item) => item !== undefined && params.append(key, item));
	}
	return params.toString();
};

export const AGENTS_PATH = '/agents';

/** A link to the list with these filters, e.g. for pagination. */
export const agentsHref = (filters: AgentFilters): string => {
	const search = toSearchString(toUrlQuery(filters));
	return search ? `${AGENTS_PATH}?${search}` : AGENTS_PATH;
};

/**
 * Canonical URL: category and pricing describe a real landing page and stay; search text, price,
 * tags, sort and page are noise and are dropped (so /agents?sort=rank&page=3 → /agents).
 */
export const canonicalAgentsPath = (filters: AgentFilters): string =>
	agentsHref({ ...DEFAULT_FILTERS, categories: filters.categories, pricing: filters.pricing });

/** getProducts variables. Keys are only present when set, so equal filters give an equal cache key. */
export const toProductsInquiry = (input: AgentFilters): ProductsInquiry => {
	const filters = normalizeFilters(input);
	const { sort, direction } = SORT_TO_API[filters.sort];
	const search: ProductsInquiry['search'] = {};
	if (filters.text) search.text = filters.text;
	if (filters.categories.length) search.categoryList = filters.categories;
	if (filters.pricing.length) search.pricingList = filters.pricing;
	if (filters.minPrice !== null || filters.maxPrice !== null) {
		search.pricesRange = { start: filters.minPrice ?? 0, end: filters.maxPrice ?? PRICE_MAX };
	}
	if (filters.tags.length) search.tagList = filters.tags;
	return { page: filters.page, limit: AGENTS_PAGE_SIZE, sort, direction, search };
};

export const agentsListVariables = (filters: AgentFilters) => ({ input: toProductsInquiry(filters) });
