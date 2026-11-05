import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import type { ParsedUrlQuery } from 'querystring';
import { agentSortToApi, type AgentSort } from '@/features/agents';
import { Direction, MemberType, type AgentCategory } from '@/gql/enums';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { MemberProfileQuery } from '../graphql/creators';

/** Every id is a 24-character hex ObjectId (§1.3). */
export const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

/**
 * Profile tabs (MemberProfile.html). "work": creators list agents, users their open briefs.
 * Content first, then the social lists.
 */
export const PROFILE_TABS = ['work', 'articles', 'followers', 'following'] as const;
export type ProfileTab = (typeof PROFILE_TABS)[number];

export const parseProfileTab = (query: ParsedUrlQuery): ProfileTab => {
	const value = Array.isArray(query.tab) ? query.tab[0] : query.tab;
	return (PROFILE_TABS as readonly string[]).includes(value ?? '') ? (value as ProfileTab) : 'work';
};

export const profileTabHref = (memberId: string, tab: ProfileTab) => (tab === 'work' ? `/members/${memberId}` : `/members/${memberId}?tab=${tab}`);

export const PROFILE_WORK_PAGE_SIZE = 6;

/** The profile's agent list: local state, not in the URL (the tab is). */
export type ProfileAgentFilters = {
	text: string;
	category: AgentCategory | null;
	sort: AgentSort;
	page: number;
};

export const DEFAULT_PROFILE_AGENT_FILTERS: ProfileAgentFilters = { text: '', category: null, sort: 'newest', page: 1 };

/** Sorts that make sense inside one creator's list ("Top ranked" is for the whole catalog). */
export const PROFILE_AGENT_SORTS: readonly AgentSort[] = ['newest', 'likes', 'views', 'price-asc', 'price-desc'];

/**
 * Search, category, sort and grid/list appear as soon as the creator has an agent, so the page looks the
 * same on every profile. With no agents there is nothing to filter: only the empty state.
 */
export const PROFILE_AGENT_TOOLBAR_MIN = 0;

export const hasProfileAgentFilters = (filters: ProfileAgentFilters) => Boolean(filters.text || filters.category);

/**
 * A creator's ACTIVE agents (the public list never returns PAUSED ones, D-16), paged. Search keys are
 * only present when set, so the default list keeps one cache key.
 */
export const profileAgentsVariables = (memberId: string, filters: ProfileAgentFilters = DEFAULT_PROFILE_AGENT_FILTERS) => {
	const { sort, direction } = agentSortToApi(filters.sort);
	return {
		input: {
			page: filters.page,
			limit: PROFILE_WORK_PAGE_SIZE,
			sort,
			direction,
			search: {
				memberId,
				...(filters.text && { text: filters.text }),
				...(filters.category && { categoryList: [filters.category] }),
			},
		},
	};
};

/** A user's OPEN briefs (getBriefs default status). */
export const profileBriefsVariables = (memberId: string, limit = PROFILE_WORK_PAGE_SIZE) => ({
	input: { page: 1, limit, sort: 'createdAt', direction: Direction.Desc, search: { memberId } },
});

/** A member's ACTIVE articles (getBoardArticles returns only ACTIVE ones). */
export const profileArticlesVariables = (memberId: string, limit = PROFILE_WORK_PAGE_SIZE) => ({
	input: { page: 1, limit, sort: 'createdAt', direction: Direction.Desc, search: { memberId } },
});

export const isCreator = (memberType: string) => memberType === MemberType.Creator;

export type MemberProfilePrefetch = { found: true; memberId: string } | { found: false };

/**
 * getServerSideProps data for /members/[id] (no token). A deleted or missing member, a malformed id or
 * an ADMIN profile → { found: false } → 404. Other failures are thrown (a 500, not a fake 404).
 */
export const prefetchMemberProfile = async (
	client: Pick<ApolloClient<NormalizedCacheObject>, 'query'>,
	memberId: unknown,
): Promise<MemberProfilePrefetch> => {
	if (!isObjectId(memberId)) return { found: false };
	let member;
	try {
		({ data: { getMember: member } } = await client.query({ query: MemberProfileQuery, variables: { memberId } }));
	} catch (error) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return { found: false };
		throw error;
	}
	if (member.memberStatus === 'DELETE' || member.memberType === MemberType.Admin) return { found: false };
	return { found: true, memberId };
};
