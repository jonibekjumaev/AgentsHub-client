import { describe, expect, it } from 'vitest';
import {
	CREATORS_PAGE_SIZE,
	DEFAULT_CREATOR_FILTERS,
	creatorFacetsVariables,
	creatorsHref,
	hasActiveCreatorFilters,
	parseCreatorFilters,
	toCreatorsInquiry,
	toCreatorsUrlQuery,
	type CreatorFilters,
} from './creatorsQuery';

const filters = (patch: Partial<CreatorFilters>): CreatorFilters => ({ ...DEFAULT_CREATOR_FILTERS, ...patch });

describe('parseCreatorFilters (D-45)', () => {
	it('defaults: top ranked, only creators with agents, everyone (not only followed)', () => {
		expect(parseCreatorFilters({})).toEqual(DEFAULT_CREATOR_FILTERS);
		expect(DEFAULT_CREATOR_FILTERS).toMatchObject({ sort: 'rank', withAgentsOnly: true, followingOnly: false });
	});

	it('reads every filter from the URL; categories in rail order, unknown ones dropped', () => {
		expect(
			parseCreatorFilters({
				q: ' nova ',
				category: 'education,customer-support,cooking',
				agents: 'any',
				following: '1',
				sort: 'name',
				page: '2',
			}),
		).toEqual({
			text: 'nova',
			categories: ['CUSTOMER_SUPPORT', 'EDUCATION'],
			withAgentsOnly: false,
			followingOnly: true,
			sort: 'name',
			page: 2,
		});
	});

	it.each([
		['an old sort', { sort: 'products' }, { sort: 'rank' }],
		['a bad page', { page: '0' }, { page: 1 }],
		['any "agents" value but "any"', { agents: 'all' }, { withAgentsOnly: true }],
		['any "following" value but "1"', { following: 'yes' }, { followingOnly: false }],
	])('falls back to the default for %s', (_label, query, expected) => {
		expect(parseCreatorFilters(query)).toEqual({ ...DEFAULT_CREATOR_FILTERS, ...expected });
	});
});

describe('URL and API input', () => {
	it('writes only non-default values and reads them back', () => {
		expect(creatorsHref(DEFAULT_CREATOR_FILTERS)).toBe('/creators');
		const all = filters({
			text: 'nova',
			categories: ['SALES', 'EDUCATION'],
			withAgentsOnly: false,
			followingOnly: true,
			sort: 'followers',
			page: 3,
		});
		expect(creatorsHref(all)).toBe(
			'/creators?q=nova&category=sales%2Ceducation&agents=any&following=1&sort=followers&page=3',
		);
		expect(parseCreatorFilters(toCreatorsUrlQuery(all))).toEqual(all);
	});

	it('asks for 20 top-ranked creators with agents by default', () => {
		expect(toCreatorsInquiry(DEFAULT_CREATOR_FILTERS)).toEqual({
			page: 1,
			limit: CREATORS_PAGE_SIZE,
			sort: 'memberRank',
			direction: 'DESC',
			search: { withAgentsOnly: true },
		});
	});

	it.each([
		['followers', 'memberFollowers', 'DESC'],
		['agents', 'creatorProducts', 'DESC'],
		['name', 'creatorName', 'ASC'],
	] as const)('maps sort %s to %s %s (D-45)', (sort, apiSort, direction) => {
		expect(toCreatorsInquiry(filters({ sort }))).toMatchObject({ sort: apiSort, direction });
	});

	it('maps every filter to CRISearch; the counts get the same search', () => {
		const current = filters({
			text: 'x',
			categories: ['SALES'],
			withAgentsOnly: false,
			followingOnly: true,
			sort: 'name',
			page: 2,
		});
		expect(toCreatorsInquiry(current).search).toEqual({ text: 'x', categoryList: ['SALES'], followingOnly: true });
		expect(creatorFacetsVariables(current)).toEqual({ input: toCreatorsInquiry(current).search });
	});

	it('hasActiveCreatorFilters ignores the sort, page and the "with agents" switch', () => {
		expect(hasActiveCreatorFilters(filters({ sort: 'name', page: 2, withAgentsOnly: false }))).toBe(false);
		expect(hasActiveCreatorFilters(filters({ followingOnly: true }))).toBe(true);
		expect(hasActiveCreatorFilters(filters({ categories: ['SALES'] }))).toBe(true);
	});
});
