import type { BriefCardFragment } from '@/gql/graphql';

export const BRIEF_ID = '6ac7992dd87bde19b9216d01';
export const AUTHOR_ID = '6ac7992dd87bde19b9216d99';

/** A BriefCard as the API returns it (with __typename, for Apollo's MockedProvider). */
export const makeBrief = (patch: Partial<BriefCardFragment> = {}, index = 0) => ({
	__typename: 'Brief' as const,
	_id: `6ac7992dd87bde19b9216d${String(index + 10).padStart(2, '0')}`,
	briefTitle: `WhatsApp orders for a bakery ${index}`,
	briefContent: 'Customers order by WhatsApp. I need an agent that takes the order and sends it to our sheet.',
	briefCategory: 'SALES' as const,
	briefStatus: 'OPEN' as const,
	briefBudget: 500 as number | null,
	briefDeadline: '2026-11-30T00:00:00.000Z' as string | null,
	briefViews: 41,
	briefComments: 3,
	createdAt: '2026-10-19T10:00:00.000Z',
	closedAt: null as string | null,
	memberData: { __typename: 'Member' as const, _id: AUTHOR_ID, memberNick: 'dilnoza_bakes' },
	...patch,
});

/** BriefDetailQuery's getBrief, as the API returns it to a guest. */
export const makeBriefDetail = (patch: Record<string, unknown> = {}) => ({
	__typename: 'Brief' as const,
	_id: BRIEF_ID,
	briefTitle: 'AI agent to take WhatsApp orders for a bakery',
	briefContent: 'We are a small bakery.\nI need an agent that confirms orders and adds a row to our sheet.',
	briefCategory: 'SALES' as const,
	briefStatus: 'OPEN' as const,
	briefBudget: 500,
	briefDeadline: '2026-11-30T00:00:00.000Z',
	briefViews: 41,
	briefComments: 0,
	createdAt: '2026-10-10T10:00:00.000Z',
	updatedAt: '2026-10-10T10:00:00.000Z',
	closedAt: null,
	memberData: {
		__typename: 'Member' as const,
		_id: AUTHOR_ID,
		memberNick: 'dilnoza_bakes',
		memberFullName: 'Dilnoza Bakes',
		memberImage: '',
		memberBriefs: 2,
	},
	...patch,
});
