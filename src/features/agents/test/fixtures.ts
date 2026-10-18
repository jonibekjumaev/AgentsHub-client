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
