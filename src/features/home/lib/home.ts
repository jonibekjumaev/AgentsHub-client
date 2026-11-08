import { AgentCategory, BriefStatus, Direction, ProductPricing } from '@/gql/enums';

/**
 * Home sections: a few items each, the same documents as the full lists (one cache, no new types).
 * Every list is fetched at build / ISR time without a token (public data only).
 */
export const HOME_AGENTS = 6;
export const HOME_BRIEFS = 6;
export const HOME_CREATORS = 6;
/** Agent names shown on a category card. */
export const CATEGORY_AGENT_NAMES = 3;

/** The tabs above the home agents grid. */
export const HOME_AGENT_TABS = ['top', 'newest', 'free'] as const;
export type HomeAgentTab = (typeof HOME_AGENT_TABS)[number];

/** Order of the category slider (the same eight the catalog filters by). */
export const HOME_CATEGORIES: AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Sales,
	AgentCategory.Marketing,
	AgentCategory.Content,
	AgentCategory.DataAnalysis,
	AgentCategory.Automation,
	AgentCategory.Education,
	AgentCategory.Other,
];

/** Top-ranked: the nightly productRank. Newest: createdAt. Free: the FREE pricing, ranked. */
export const homeAgentsVariables = (tab: HomeAgentTab) => ({
	input: {
		page: 1,
		limit: HOME_AGENTS,
		sort: tab === 'newest' ? 'createdAt' : 'productRank',
		direction: Direction.Desc,
		search: tab === 'free' ? { pricingList: [ProductPricing.Free] } : {},
	},
});

/** Open briefs only, newest first (the feed shows them as they are; no deadline filter). */
export const latestBriefsVariables = () => ({
	input: { page: 1, limit: HOME_BRIEFS, sort: 'createdAt', direction: Direction.Desc, search: { briefStatus: BriefStatus.Open } },
});

export const topCreatorsVariables = () => ({
	input: { page: 1, limit: HOME_CREATORS, sort: 'memberRank', direction: Direction.Desc, search: {} },
});

/** A few top-ranked agent names for one category card. */
export const categoryAgentsVariables = (category: AgentCategory) => ({
	input: {
		page: 1,
		limit: CATEGORY_AGENT_NAMES,
		sort: 'productRank',
		direction: Direction.Desc,
		search: { categoryList: [category] },
	},
});
