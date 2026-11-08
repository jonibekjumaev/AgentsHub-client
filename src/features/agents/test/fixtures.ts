import type { AgentCardFragment } from '@/gql/graphql';

/** An AgentCard as the API returns it (with __typename, for Apollo's MockedProvider). */
export const makeAgent = (patch: Partial<AgentCardFragment> = {}, index = 0) => ({
	__typename: 'Product' as const,
	_id: `6ac7992dd87bde19b9216c${String(index).padStart(2, '0')}`,
	productTitle: `SupportPilot ${index}`,
	productCategory: 'CUSTOMER_SUPPORT' as const,
	productPricing: 'SUBSCRIPTION' as const,
	productPrice: 49,
	productImages: ['uploads/product/cover.png'],
	productLikes: 128,
	productViews: 2300,
	memberData: { __typename: 'Member' as const, _id: '6ac7992dd87bde19b9216c99', memberNick: 'nova_labs' },
	...patch,
});

export const AGENT_ID = '6ac7992dd87bde19b9216c8b';
export const CREATOR_ID = '6ac7992dd87bde19b9216c99';

/** AgentDetailQuery's getProduct, as the API returns it to a guest. */
export const makeAgentDetail = (patch: Record<string, unknown> = {}) => ({
	__typename: 'Product' as const,
	_id: AGENT_ID,
	productTitle: 'SupportPilot',
	productDesc: 'Answers customer questions in Telegram.\nHands hard cases to your team.',
	productStatus: 'ACTIVE' as const,
	productCategory: 'CUSTOMER_SUPPORT' as const,
	productPricing: 'SUBSCRIPTION' as const,
	productPrice: 49,
	productDemoUrl: 'https://demo.example.com/supportpilot',
	productTags: ['telegram', 'crm'],
	productImages: ['uploads/product/one.png', 'uploads/product/two.png', 'uploads/product/three.png'],
	productLikes: 128,
	productViews: 2300,
	productComments: 2,
	updatedAt: '2026-10-02T12:00:00.000Z',
	memberData: {
		__typename: 'Member' as const,
		_id: CREATOR_ID,
		memberNick: 'nova_labs',
		memberFullName: 'Nova Labs',
		memberImage: '',
		memberProducts: 4,
		memberFollowers: 312,
	},
	...patch,
});

/** A CatalogAgent (the /agents card) as the API returns it; meLiked is empty for a guest. */
export const makeCatalogAgent = (patch: Record<string, unknown> = {}, index = 0) => ({
	...makeAgent({}, index),
	productImages: [] as string[],
	productLikes: 12,
	productDesc: `Answers customer questions, agent ${index}.`,
	meLiked: [] as { __typename: 'MeLiked'; memberId: string; likeRefId: string; myFavorite: boolean }[],
	...patch,
});

/** getProductFacets: zeros except the given counts, in enum order (as the API sends them). */
export const makeFacets = (categories: Record<string, number> = {}, pricing: Record<string, number> = {}) => ({
	__typename: 'ProductFacets' as const,
	categories: ['CUSTOMER_SUPPORT', 'SALES', 'MARKETING', 'CONTENT', 'DATA_ANALYSIS', 'AUTOMATION', 'EDUCATION', 'OTHER'].map((value) => ({
		__typename: 'CategoryFacet' as const,
		value,
		count: categories[value] ?? 0,
	})),
	pricing: ['FREE', 'ONE_TIME', 'SUBSCRIPTION', 'CUSTOM'].map((value) => ({
		__typename: 'PricingFacet' as const,
		value,
		count: pricing[value] ?? 0,
	})),
});
