import { Direction } from '@/gql/enums';

/** Home sections: a few items each, the same documents as the full lists (one cache, no new types). */
export const HOME_AGENTS = 4;
export const HOME_BRIEFS = 3;
export const HOME_CREATORS = 3;

export const topAgentsVariables = () => ({
	input: { page: 1, limit: HOME_AGENTS, sort: 'productRank', direction: Direction.Desc, search: {} },
});

export const latestBriefsVariables = () => ({
	input: { page: 1, limit: HOME_BRIEFS, sort: 'createdAt', direction: Direction.Desc, search: {} },
});

export const topCreatorsVariables = () => ({
	input: { page: 1, limit: HOME_CREATORS, sort: 'memberRank', direction: Direction.Desc, search: {} },
});
