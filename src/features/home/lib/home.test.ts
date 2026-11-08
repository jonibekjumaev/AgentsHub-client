import { describe, expect, it } from 'vitest';
import { categoryAgentsVariables, homeAgentsVariables, latestBriefsVariables, topCreatorsVariables } from './home';

describe('home list variables', () => {
	it('asks for six agents per tab: ranked, newest, free', () => {
		expect(homeAgentsVariables('top')).toEqual({ input: { page: 1, limit: 6, sort: 'productRank', direction: 'DESC', search: {} } });
		expect(homeAgentsVariables('newest').input.sort).toBe('createdAt');
		expect(homeAgentsVariables('free').input).toMatchObject({ sort: 'productRank', search: { pricingList: ['FREE'] } });
	});

	it('shows open briefs only, newest first', () => {
		expect(latestBriefsVariables()).toEqual({
			input: { page: 1, limit: 6, sort: 'createdAt', direction: 'DESC', search: { briefStatus: 'OPEN' } },
		});
	});

	it('asks for the six top creators and three names per category', () => {
		expect(topCreatorsVariables().input).toMatchObject({ limit: 6, sort: 'memberRank' });
		expect(categoryAgentsVariables('SALES')).toEqual({
			input: { page: 1, limit: 3, sort: 'productRank', direction: 'DESC', search: { categoryList: ['SALES'] } },
		});
	});
});
