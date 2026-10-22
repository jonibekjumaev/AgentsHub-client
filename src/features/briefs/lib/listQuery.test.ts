import { describe, expect, it } from 'vitest';
import {
	DEFAULT_BRIEF_FILTERS,
	briefsHref,
	canonicalBriefsPath,
	hasActiveBriefFilters,
	parseBriefFilters,
	toBriefsInquiry,
	toBriefsUrlQuery,
	type BriefFilters,
} from './listQuery';

describe('parseBriefFilters', () => {
	it('gives the defaults for an empty query', () => {
		expect(parseBriefFilters({})).toEqual(DEFAULT_BRIEF_FILTERS);
	});

	it('reads every filter from the URL', () => {
		expect(
			parseBriefFilters({ status: 'closed', category: 'customer-support', q: ' bakery ', sort: 'budget-desc', page: '3' }),
		).toEqual({ tab: 'closed', category: 'CUSTOMER_SUPPORT', text: 'bakery', sort: 'budget-desc', page: 3 });
	});

	it('one invalid value falls back on its own', () => {
		expect(parseBriefFilters({ status: 'deleted', category: 'cooking', sort: 'random', page: '-2', q: 'crm' })).toEqual({
			...DEFAULT_BRIEF_FILTERS,
			text: 'crm',
		});
	});

	it('takes the first of repeated keys and cuts the search to 100 characters', () => {
		const filters = parseBriefFilters({ category: ['sales', 'content'], q: 'a'.repeat(150) });
		expect(filters.category).toBe('SALES');
		expect(filters.text).toHaveLength(100);
	});
});

describe('toBriefsUrlQuery / briefsHref', () => {
	it('is the bare path for the defaults', () => {
		expect(toBriefsUrlQuery(DEFAULT_BRIEF_FILTERS)).toEqual({});
		expect(briefsHref(DEFAULT_BRIEF_FILTERS)).toBe('/briefs');
	});

	it('writes only non-default values and round-trips', () => {
		const filters: BriefFilters = { tab: 'closed', category: 'DATA_ANALYSIS', text: 'crm', sort: 'deadline', page: 2 };
		expect(briefsHref(filters)).toBe('/briefs?status=closed&category=data-analysis&q=crm&sort=deadline&page=2');
		expect(parseBriefFilters(toBriefsUrlQuery(filters))).toEqual(filters);
	});

	it('keeps only status and category in the canonical URL', () => {
		expect(canonicalBriefsPath({ tab: 'closed', category: 'SALES', text: 'x', sort: 'views', page: 4 })).toBe(
			'/briefs?status=closed&category=sales',
		);
	});
});

describe('toBriefsInquiry', () => {
	it('asks for OPEN briefs (the API default), newest first', () => {
		expect(toBriefsInquiry(DEFAULT_BRIEF_FILTERS)).toEqual({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });
	});

	it('maps the closed tab, category, search and sorts', () => {
		expect(toBriefsInquiry({ tab: 'closed', category: 'SALES', text: 'crm', sort: 'budget-asc', page: 2 })).toEqual({
			page: 2,
			limit: 10,
			sort: 'briefBudget',
			direction: 'ASC',
			search: { briefStatus: 'CLOSED', categoryList: ['SALES'], text: 'crm' },
		});
		expect(toBriefsInquiry({ ...DEFAULT_BRIEF_FILTERS, sort: 'deadline' })).toMatchObject({ sort: 'briefDeadline', direction: 'ASC' });
		expect(toBriefsInquiry({ ...DEFAULT_BRIEF_FILTERS, sort: 'views' })).toMatchObject({ sort: 'briefViews', direction: 'DESC' });
	});
});

describe('hasActiveBriefFilters', () => {
	it('is about category and search, not the tab or sort', () => {
		expect(hasActiveBriefFilters({ ...DEFAULT_BRIEF_FILTERS, tab: 'closed', sort: 'views' })).toBe(false);
		expect(hasActiveBriefFilters({ ...DEFAULT_BRIEF_FILTERS, text: 'crm' })).toBe(true);
	});
});
