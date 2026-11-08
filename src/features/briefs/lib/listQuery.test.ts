import { describe, expect, it } from 'vitest';
import {
	BRIEFS_PAGE_SIZE,
	DEFAULT_BRIEF_FILTERS,
	briefFacetsVariables,
	briefFacetsWithPastVariables,
	briefsHref,
	canonicalBriefsPath,
	hasActiveBriefFilters,
	parseBriefFilters,
	toBriefsInquiry,
	toBriefsUrlQuery,
	type BriefFilters,
} from './listQuery';

const filters = (patch: Partial<BriefFilters>): BriefFilters => ({ ...DEFAULT_BRIEF_FILTERS, ...patch });

describe('parseBriefFilters', () => {
	it('gives the defaults for an empty query: open tab, past deadlines hidden, newest first', () => {
		expect(parseBriefFilters({})).toEqual(DEFAULT_BRIEF_FILTERS);
		expect(DEFAULT_BRIEF_FILTERS).toMatchObject({ tab: 'open', hidePast: true, sort: 'newest' });
	});

	it('reads every filter from the URL', () => {
		expect(
			parseBriefFilters({
				status: 'closed',
				category: 'sales,customer-support',
				budget: 'offers',
				q: ' bakery ',
				past: 'show',
				sort: 'discussed',
				page: '3',
			}),
		).toEqual({
			tab: 'closed',
			// Rail order, not URL order.
			categories: ['CUSTOMER_SUPPORT', 'SALES'],
			budgetTypes: ['OPEN_TO_OFFERS'],
			text: 'bakery',
			hidePast: false,
			sort: 'discussed',
			page: 3,
		});
	});

	it('accepts repeated keys and drops unknown or duplicate values', () => {
		const result = parseBriefFilters({ category: ['content', 'cooking', 'CONTENT'], budget: ['fixed', 'hourly', 'fixed'] });
		expect(result.categories).toEqual(['CONTENT']);
		expect(result.budgetTypes).toEqual(['FIXED']);
	});

	it.each([
		['an unknown status', { status: 'deleted' }, { tab: 'open' }],
		['an old or unknown sort', { sort: 'budget-desc' }, { sort: 'newest' }],
		['a bad page', { page: '-2' }, { page: 1 }],
		['any past value but "show"', { past: 'yes' }, { hidePast: true }],
	])('falls back to the default for %s', (_label, query, expected) => {
		expect(parseBriefFilters(query)).toEqual({ ...DEFAULT_BRIEF_FILTERS, ...expected });
	});

	it('cuts the search to 100 characters', () => {
		expect(parseBriefFilters({ q: 'a'.repeat(150) }).text).toHaveLength(100);
	});
});

describe('toBriefsUrlQuery / briefsHref', () => {
	it('writes only non-default values and reads them back', () => {
		expect(briefsHref(DEFAULT_BRIEF_FILTERS)).toBe('/briefs');
		const all = filters({
			tab: 'closed',
			categories: ['SALES', 'DATA_ANALYSIS'],
			budgetTypes: ['FIXED', 'OPEN_TO_OFFERS'],
			text: 'crm',
			hidePast: false,
			sort: 'deadline',
			page: 2,
		});

		expect(briefsHref(all)).toBe(
			'/briefs?status=closed&category=sales%2Cdata-analysis&budget=fixed%2Coffers&q=crm&past=show&sort=deadline&page=2',
		);
		expect(parseBriefFilters(toBriefsUrlQuery(all))).toEqual(all);
	});

	it('keeps the status and a single category in the canonical path, nothing else', () => {
		expect(canonicalBriefsPath(filters({ tab: 'closed', categories: ['SALES'], text: 'x', sort: 'budget', page: 4 }))).toBe(
			'/briefs?status=closed&category=sales',
		);
		expect(canonicalBriefsPath(filters({ categories: ['SALES', 'CONTENT'] }))).toBe('/briefs');
	});
});

describe('toBriefsInquiry', () => {
	it('asks for 20 open briefs, newest first, without past deadlines', () => {
		expect(toBriefsInquiry(DEFAULT_BRIEF_FILTERS)).toEqual({
			page: 1,
			limit: BRIEFS_PAGE_SIZE,
			sort: 'createdAt',
			direction: 'DESC',
			search: { hidePastDeadline: true },
		});
		expect(BRIEFS_PAGE_SIZE).toBe(20);
	});

	it.each([
		['budget', 'briefBudget', 'DESC'],
		['deadline', 'briefDeadline', 'ASC'],
		['discussed', 'briefComments', 'DESC'],
	] as const)('maps sort %s to %s %s (D-44)', (sort, apiSort, direction) => {
		expect(toBriefsInquiry(filters({ sort }))).toMatchObject({ sort: apiSort, direction });
	});

	it('maps every filter to the search input', () => {
		expect(
			toBriefsInquiry(filters({ categories: ['SALES'], budgetTypes: ['OPEN_TO_OFFERS'], text: 'bot', page: 2 })).search,
		).toEqual({ categoryList: ['SALES'], budgetTypeList: ['OPEN_TO_OFFERS'], text: 'bot', hidePastDeadline: true });
	});

	it('sends hidePastDeadline only with the open tab and the switch on', () => {
		expect(toBriefsInquiry(filters({ hidePast: false })).search).toEqual({});
		expect(toBriefsInquiry(filters({ tab: 'closed' })).search).toEqual({ briefStatus: 'CLOSED' });
	});
});

describe('count variables (D-44)', () => {
	it('send the same search as the list, without page or sort', () => {
		const current = filters({ categories: ['SALES'], sort: 'budget', page: 3 });
		expect(briefFacetsVariables(current)).toEqual({ input: toBriefsInquiry(current).search });
	});

	it('ask once more with past deadlines kept, only when the switch hides some', () => {
		expect(briefFacetsWithPastVariables(filters({ text: 'bot' }))).toEqual({ input: { text: 'bot' } });
		expect(briefFacetsWithPastVariables(filters({ hidePast: false }))).toBeNull();
		expect(briefFacetsWithPastVariables(filters({ tab: 'closed' }))).toBeNull();
	});
});

it('hasActiveBriefFilters ignores the tab, sort, page and past-deadline switch', () => {
	expect(hasActiveBriefFilters(filters({ tab: 'closed', sort: 'budget', page: 3, hidePast: false }))).toBe(false);
	expect(hasActiveBriefFilters(filters({ budgetTypes: ['FIXED'] }))).toBe(true);
	expect(hasActiveBriefFilters(filters({ categories: ['SALES'] }))).toBe(true);
	expect(hasActiveBriefFilters(filters({ text: 'x' }))).toBe(true);
});
