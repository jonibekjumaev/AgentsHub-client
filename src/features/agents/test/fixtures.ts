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
