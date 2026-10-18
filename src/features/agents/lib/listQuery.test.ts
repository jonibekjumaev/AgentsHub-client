import { describe, expect, it } from 'vitest';
import {
	AGENTS_PAGE_SIZE,
	DEFAULT_FILTERS,
	PRICE_MAX,
	agentsHref,
	canonicalAgentsPath,
	hasActiveFilters,
	isPriceFilterApplicable,
	normalizeTag,
	parseAgentFilters,
	toProductsInquiry,
	toUrlQuery,
	type AgentFilters,
} from './listQuery';

const filters = (patch: Partial<AgentFilters>): AgentFilters => ({ ...DEFAULT_FILTERS, ...patch });

describe('parseAgentFilters', () => {
	it('gives the defaults for an empty query', () => {
		expect(parseAgentFilters({})).toEqual(DEFAULT_FILTERS);
	});

	it('reads every filter from the URL', () => {
		expect(
			parseAgentFilters({
				q: '  support bot ',
				category: ['sales', 'customer-support'],
				pricing: 'subscription',
				min: '10',
				max: '99.5',
				tag: ['Telegram', 'crm'],
				sort: 'price-asc',
				page: '3',
			}),
		).toEqual({
			text: 'support bot',
			// Panel order, not URL order.
			categories: ['CUSTOMER_SUPPORT', 'SALES'],
			pricing: ['SUBSCRIPTION'],
			minPrice: 10,
			maxPrice: 99.5,
			tags: ['telegram', 'crm'],
			sort: 'price-asc',
			page: 3,
		});
	});

	it('accepts comma lists and upper-case enum values, and drops duplicates', () => {
		const result = parseAgentFilters({ category: 'SALES,marketing,sales', pricing: 'one-time,ONE_TIME' });
		expect(result.categories).toEqual(['SALES', 'MARKETING']);
		expect(result.pricing).toEqual(['ONE_TIME']);
	});

	it.each([
		['page', { page: 'abc' }, { page: 1 }],
		['page 0', { page: '0' }, { page: 1 }],
		['negative page', { page: '-2' }, { page: 1 }],
		['fractional page', { page: '2.5' }, { page: 1 }],
		['unknown sort', { sort: 'propertyPrice' }, { sort: 'newest' }],
		['text over 100 characters', { q: 'x'.repeat(101) }, { text: '' }],
		['negative price', { min: '-5' }, { minPrice: null }],
		['non-numeric price', { max: 'cheap' }, { maxPrice: null }],
		['empty price', { min: '' }, { minPrice: null }],
		['price above the cap', { max: String(PRICE_MAX + 1) }, { maxPrice: null }],
	])('falls back to the default for an invalid %s', (_label, query, expected) => {
		expect(parseAgentFilters(query)).toEqual({ ...DEFAULT_FILTERS, ...expected });
	});

	it('keeps the valid values of a list and drops the rest', () => {
		expect(parseAgentFilters({ category: ['sales', 'real-estate', ''] }).categories).toEqual(['SALES']);
		expect(parseAgentFilters({ pricing: 'free,barter' }).pricing).toEqual(['FREE']);
	});

	it('one invalid param does not reset the others', () => {
		const result = parseAgentFilters({ category: 'sales', page: 'nope', sort: 'rank' });
		expect(result).toEqual(filters({ categories: ['SALES'], sort: 'rank' }));
	});

	it('drops a min > max range (the API rejects it)', () => {
		expect(parseAgentFilters({ min: '100', max: '10' })).toMatchObject({ minPrice: null, maxPrice: null });
	});

	it('drops the price range when only FREE / CUSTOM is picked (D-03)', () => {
		expect(parseAgentFilters({ pricing: ['free', 'custom'], min: '5' })).toMatchObject({
			pricing: ['FREE', 'CUSTOM'],
			minPrice: null,
		});
		expect(parseAgentFilters({ pricing: ['free', 'one-time'], min: '5' })).toMatchObject({ minPrice: 5 });
	});

	it('normalizes tags, drops invalid ones and keeps at most 10', () => {
		const many = Array.from({ length: 12 }, (_, index) => `tag${index}`);
		expect(parseAgentFilters({ tag: many }).tags).toHaveLength(10);
		expect(parseAgentFilters({ tag: [' CRM ', 'crm', '   ', 'x'.repeat(31)] }).tags).toEqual(['crm']);
	});
});

describe('toUrlQuery', () => {
	it('is empty for the defaults', () => {
		expect(toUrlQuery(DEFAULT_FILTERS)).toEqual({});
	});

	it('writes only non-default values, with slugs and repeated keys', () => {
		expect(
			toUrlQuery(
				filters({
					text: 'bot',
					categories: ['SALES', 'CUSTOMER_SUPPORT'],
					pricing: ['ONE_TIME'],
					minPrice: 0,
					tags: ['crm'],
					sort: 'rank',
					page: 2,
				}),
			),
		).toEqual({
			q: 'bot',
			category: ['customer-support', 'sales'],
			pricing: ['one-time'],
			min: '0',
			tag: ['crm'],
			sort: 'rank',
			page: '2',
		});
	});

	it('round-trips through parseAgentFilters', () => {
		const original = filters({
			text: 'bot',
			categories: ['MARKETING'],
			pricing: ['SUBSCRIPTION'],
			minPrice: 5,
			maxPrice: 50,
			tags: ['seo', 'blog'],
			sort: 'price-desc',
			page: 4,
		});
		expect(parseAgentFilters(toUrlQuery(original))).toEqual(original);
	});
});

describe('agentsHref and canonicalAgentsPath', () => {
	it('builds list links', () => {
		expect(agentsHref(DEFAULT_FILTERS)).toBe('/agents');
		expect(agentsHref(filters({ categories: ['SALES'], page: 2 }))).toBe('/agents?category=sales&page=2');
	});

	it('keeps only category and pricing in the canonical URL', () => {
		expect(
			canonicalAgentsPath(
				filters({ text: 'bot', categories: ['SALES'], pricing: ['FREE'], tags: ['crm'], sort: 'rank', page: 3 }),
			),
		).toBe('/agents?category=sales&pricing=free');
		expect(canonicalAgentsPath(filters({ sort: 'views', page: 2 }))).toBe('/agents');
	});
});

describe('toProductsInquiry', () => {
	it('sends the default sort and an empty search for no filters', () => {
		expect(toProductsInquiry(DEFAULT_FILTERS)).toEqual({
			page: 1,
			limit: AGENTS_PAGE_SIZE,
			sort: 'createdAt',
			direction: 'DESC',
			search: {},
		});
	});

	it.each([
		['rank', 'productRank', 'DESC'],
		['likes', 'productLikes', 'DESC'],
		['views', 'productViews', 'DESC'],
		['price-asc', 'productPrice', 'ASC'],
		['price-desc', 'productPrice', 'DESC'],
	] as const)('maps sort %s to %s %s', (sort, apiSort, direction) => {
		expect(toProductsInquiry(filters({ sort }))).toMatchObject({ sort: apiSort, direction });
	});

	it('maps every filter to the search input', () => {
		expect(
			toProductsInquiry(
				filters({ text: 'bot', categories: ['SALES'], pricing: ['ONE_TIME'], minPrice: 5, maxPrice: 50, tags: ['crm'], page: 2 }),
			),
		).toMatchObject({
			page: 2,
			search: {
				text: 'bot',
				categoryList: ['SALES'],
				pricingList: ['ONE_TIME'],
				pricesRange: { start: 5, end: 50 },
				tagList: ['crm'],
			},
		});
	});

	it('completes a one-sided price range', () => {
		expect(toProductsInquiry(filters({ minPrice: 20 })).search.pricesRange).toEqual({ start: 20, end: PRICE_MAX });
		expect(toProductsInquiry(filters({ maxPrice: 20 })).search.pricesRange).toEqual({ start: 0, end: 20 });
	});
});

describe('helpers', () => {
	it('isPriceFilterApplicable', () => {
		expect(isPriceFilterApplicable([])).toBe(true);
		expect(isPriceFilterApplicable(['FREE', 'CUSTOM'])).toBe(false);
		expect(isPriceFilterApplicable(['FREE', 'SUBSCRIPTION'])).toBe(true);
	});

	it('hasActiveFilters ignores sort and page', () => {
		expect(hasActiveFilters(filters({ sort: 'rank', page: 3 }))).toBe(false);
		expect(hasActiveFilters(filters({ tags: ['crm'] }))).toBe(true);
		expect(hasActiveFilters(filters({ maxPrice: 0 }))).toBe(true);
	});

	it('normalizeTag', () => {
		expect(normalizeTag('  Telegram ')).toBe('telegram');
		expect(normalizeTag('   ')).toBeNull();
		expect(normalizeTag('x'.repeat(31))).toBeNull();
	});
});
