export const CREATOR_ID = '6ac7992dd87bde19b9216c99';
export const VIEWER_ID = '6ac7992dd87bde19b9216c11';

export const makeCreator = (patch: Record<string, unknown> = {}, index = 0) => ({
	__typename: 'Member' as const,
	_id: index === 0 ? CREATOR_ID : `6ac7992dd87bde19b9216c${String(index + 40).padStart(2, '0')}`,
	memberNick: index === 0 ? 'nova_labs' : `creator_${index}`,
	memberFullName: index === 0 ? 'Nova Labs' : `Creator ${index}`,
	memberImage: '',
	memberDesc: 'Practical agents for small businesses.',
	memberRank: index + 1,
	memberProducts: 8,
	memberFollowers: 1204,
	memberLikes: 3410,
	...patch,
});

export const makeProfile = (patch: Record<string, unknown> = {}) => ({
	__typename: 'Member' as const,
	_id: CREATOR_ID,
	memberType: 'CREATOR' as const,
	memberStatus: 'ACTIVE' as const,
	memberNick: 'nova_labs',
	memberFullName: 'Nova Labs',
	memberImage: '',
	memberDesc: 'Two engineers building practical agents.',
	memberRank: 3,
	memberProducts: 8,
	memberBriefs: 0,
	memberArticles: 5,
	memberFollowers: 1204,
	memberFollowings: 36,
	memberLikes: 3410,
	memberViews: 48200,
	createdAt: '2026-03-10T10:00:00.000Z',
	...patch,
});

/** A CatalogCreator (the /creators card, D-45) as the API returns it to a guest. */
export const makeCatalogCreator = (patch: Record<string, unknown> = {}, index = 0) => ({
	__typename: 'Member' as const,
	_id: index === 0 ? CREATOR_ID : `6ac7992dd87bde19b9216c${String(index + 40).padStart(2, '0')}`,
	memberNick: index === 0 ? 'nova_labs' : `creator_${index}`,
	memberFullName: index === 0 ? 'Nova Labs' : `Creator ${index}`,
	memberImage: '',
	memberDesc: 'We build support and sales agents for small online shops.',
	memberRankPosition: index + 1,
	memberActiveProducts: 3,
	memberFollowers: 3,
	memberLikes: 1,
	memberCategories: ['CUSTOMER_SUPPORT', 'SALES'],
	memberTopProducts: [
		{
			__typename: 'CreatorProduct' as const,
			_id: `6ac7992dd87bde19b9216e${String(index * 2 + 10).padStart(2, '0')}`,
			productTitle: 'HelpDesk Copilot',
			productCategory: 'CUSTOMER_SUPPORT',
			productPricing: 'SUBSCRIPTION',
			productPrice: 49,
		},
		{
			__typename: 'CreatorProduct' as const,
			_id: `6ac7992dd87bde19b9216e${String(index * 2 + 11).padStart(2, '0')}`,
			productTitle: 'FAQ Bot Starter',
			productCategory: 'CUSTOMER_SUPPORT',
			productPricing: 'FREE',
			productPrice: null,
		},
	],
	meFollowed: [] as { __typename: 'MeFollowed'; followerId: string; followingId: string; myFollowing: boolean }[],
	...patch,
});
