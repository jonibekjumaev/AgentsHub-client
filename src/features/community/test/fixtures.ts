import type { Me } from '@/auth';

export const WRITER_ID = '6ac7992dd87bde19b9216c10';

export const member: Me = {
	_id: '6ac7992dd87bde19b9216c11',
	memberType: 'USER',
	memberStatus: 'ACTIVE',
	memberNick: 'dilnoza',
	memberFullName: null,
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
};

/** A CommunityArticle (the /community feed row, D-46) as the API returns it to a guest. */
export const makeArticle = (patch: Record<string, unknown> = {}, index = 0) => ({
	__typename: 'BoardArticle' as const,
	_id: `6ac7992dd87bde19b9216f${String(index).padStart(2, '0')}`,
	articleCategory: 'FREE' as const,
	articleStatus: 'ACTIVE' as const,
	articleTitle: `Prompt tips ${index + 1}`,
	articleContent: 'Short prompts work better.\n\nStart with the goal.',
	articleImage: null,
	articleLikes: 3,
	articleViews: 40,
	articleComments: 2,
	createdAt: '2026-11-01T10:00:00.000Z',
	meLiked: [],
	memberData: { __typename: 'Member' as const, _id: WRITER_ID, memberNick: 'nova', memberFullName: 'Nova Labs', memberImage: '' },
	...patch,
});
