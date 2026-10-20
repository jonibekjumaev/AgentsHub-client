import { describe, expect, it } from 'vitest';
import { DEFAULT_CREATOR_FILTERS, creatorsHref, parseCreatorFilters, toCreatorsInquiry, toCreatorsUrlQuery } from './creatorsQuery';

describe('creators URL filters', () => {
	it('gives the defaults and falls back on bad values', () => {
		expect(parseCreatorFilters({})).toEqual(DEFAULT_CREATOR_FILTERS);
		expect(parseCreatorFilters({ sort: 'random', page: '0' })).toEqual(DEFAULT_CREATOR_FILTERS);
	});

	it('round-trips through the URL', () => {
		const filters = { text: 'nova', sort: 'products' as const, page: 2 };
		expect(creatorsHref(filters)).toBe('/creators?q=nova&sort=products&page=2');
		expect(parseCreatorFilters(toCreatorsUrlQuery(filters))).toEqual(filters);
	});

	it('maps to getCreators: text only in search, the allowed sorts (§2.5)', () => {
		expect(toCreatorsInquiry(DEFAULT_CREATOR_FILTERS)).toEqual({ page: 1, limit: 9, sort: 'memberRank', direction: 'DESC', search: {} });
		expect(toCreatorsInquiry({ text: 'ai', sort: 'likes', page: 1 })).toMatchObject({
			sort: 'memberLikes',
			direction: 'DESC',
			search: { text: 'ai' },
		});
	});
});
