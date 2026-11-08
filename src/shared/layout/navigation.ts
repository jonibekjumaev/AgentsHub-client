import type { Me } from '@/auth';
import type { MemberType } from '@/gql/graphql';

export type NavItem = {
	href: string;
	/** i18n key of the label. */
	labelKey: string;
	/** Active only on this exact route (section roots like /dashboard), not on its sub-routes. */
	exact?: boolean;
};

export const MAIN_NAV: NavItem[] = [
	{ href: '/agents', labelKey: 'common:nav.agents' },
	{ href: '/briefs', labelKey: 'common:nav.briefs' },
	{ href: '/creators', labelKey: 'common:nav.creators' },
	{ href: '/community', labelKey: 'common:nav.community' },
];

/** Member counters a dashboard item can show next to its label (DashboardNavCountsQuery). */
export type NavCount = 'memberProducts' | 'memberBriefs' | 'memberArticles' | 'memberFollowers' | 'memberFollowings';

/** Icon names; DashboardLayout maps them to @mui/icons-material components. */
export type NavIcon =
	| 'overview'
	| 'agents'
	| 'briefs'
	| 'articles'
	| 'followers'
	| 'following'
	| 'visitors'
	| 'favorites'
	| 'visited'
	| 'settings'
	| 'members';

export type DashboardItem = NavItem & {
	icon: NavIcon;
	count?: NavCount;
	/** Active only while the URL has this ?tab= value (two items share /dashboard/follows). */
	tab?: string;
};

export type DashboardGroup = { key: string; titleKey: string; items: DashboardItem[] };

const FOLLOWS_PATH = '/dashboard/follows';
export const VISITORS_PATH = '/dashboard/visitors';

const followers: DashboardItem = {
	href: `${FOLLOWS_PATH}?tab=followers`,
	labelKey: 'common:dashboardNav.followers',
	icon: 'followers',
	count: 'memberFollowers',
	tab: 'followers',
};
const following: DashboardItem = {
	href: `${FOLLOWS_PATH}?tab=following`,
	labelKey: 'common:dashboardNav.following',
	icon: 'following',
	count: 'memberFollowings',
	tab: 'following',
};
const visitors: DashboardItem = { href: VISITORS_PATH, labelKey: 'common:dashboardNav.visitors', icon: 'visitors' };
const articles: DashboardItem = {
	href: '/dashboard/articles',
	labelKey: 'common:dashboardNav.articles',
	icon: 'articles',
	count: 'memberArticles',
};
const library: DashboardGroup = {
	key: 'library',
	titleKey: 'common:dashboardNav.groups.library',
	items: [
		{ href: '/dashboard/favorites', labelKey: 'common:dashboardNav.favorites', icon: 'favorites' },
		{ href: '/dashboard/visited', labelKey: 'common:dashboardNav.visited', icon: 'visited' },
	],
};
const account: DashboardGroup = {
	key: 'account',
	titleKey: 'common:dashboardNav.groups.account',
	items: [{ href: '/dashboard/settings', labelKey: 'common:dashboardNav.settings', icon: 'settings' }],
};

/**
 * Sidebar groups per role (dashboard redesign). Followers / Following are two items on one page
 * (/dashboard/follows?tab=…). ADMIN items follow FRONTEND_MIGRATION §3.12 until the admin mockups exist.
 */
export const DASHBOARD_NAV: Record<MemberType, DashboardGroup[]> = {
	CREATOR: [
		{
			key: 'workspace',
			titleKey: 'common:dashboardNav.groups.workspace',
			items: [
				{ href: '/dashboard', labelKey: 'common:dashboardNav.overview', exact: true, icon: 'overview' },
				{ href: '/dashboard/agents', labelKey: 'common:dashboardNav.myAgents', icon: 'agents', count: 'memberProducts' },
				articles,
				followers,
				following,
				visitors,
			],
		},
		library,
		account,
	],
	USER: [
		{
			key: 'workspace',
			titleKey: 'common:dashboardNav.groups.workspace',
			items: [
				{ href: '/dashboard/briefs', labelKey: 'common:dashboardNav.myBriefs', icon: 'briefs', count: 'memberBriefs' },
				articles,
				following,
				followers,
				visitors,
			],
		},
		library,
		account,
	],
	ADMIN: [
		{
			key: 'admin',
			titleKey: 'common:dashboardNav.titles.ADMIN',
			items: [
				{ href: '/admin/members', labelKey: 'common:dashboardNav.members', icon: 'members' },
				{ href: '/admin/agents', labelKey: 'common:dashboardNav.agents', icon: 'agents' },
				{ href: '/admin/briefs', labelKey: 'common:dashboardNav.briefs', icon: 'briefs' },
				{ href: '/admin/articles', labelKey: 'common:dashboardNav.articles', icon: 'articles' },
			],
		},
		account,
	],
};

export const FOLLOWS_TABS = ['followers', 'following'] as const;
export type FollowsTab = (typeof FOLLOWS_TABS)[number];

/**
 * The open list on /dashboard/follows: ?tab= when valid, else the role's own list first
 * (a creator cares about followers, a user about who they follow).
 */
export const followsTab = (value: unknown, memberType: MemberType): FollowsTab =>
	FOLLOWS_TABS.find((tab) => tab === value) ?? (memberType === 'CREATOR' ? 'followers' : 'following');

export const followsHref = (tab: FollowsTab): string => `${FOLLOWS_PATH}?tab=${tab}`;

/** The path part of an item's href (/dashboard/follows?tab=x → /dashboard/follows). */
const pathOf = (href: string) => href.split('?')[0];

/** Like isActive, plus the ?tab= of the items that share a page. `tab` is router.query.tab. */
export const isDashboardItemActive = (pathname: string, tab: string | undefined, item: DashboardItem): boolean => {
	if (!isActive(pathname, { ...item, href: pathOf(item.href) })) return false;
	return item.tab === undefined || item.tab === tab;
};

/** Where the header "Dashboard" button leads (DESIGN §5: /dashboard is for CREATOR and USER). */
export const dashboardHref = (memberType: MemberType): string =>
	memberType === 'ADMIN' ? DASHBOARD_NAV.ADMIN[0].items[0].href : '/dashboard';

export const SETTINGS_HREF = '/dashboard/settings';

export const profileHref = (me: Pick<Me, '_id'>): string => `/members/${me._id}`;
/** Admins have no public profile: /members/[id] answers 404 for them (prefetchMemberProfile), so no "My profile" link. */
export const hasPublicProfile = (memberType: MemberType): boolean => memberType !== 'ADMIN';
export const memberDisplayName = (me: Pick<Me, 'memberFullName' | 'memberNick'>): string =>
	me.memberFullName || me.memberNick;

/** `pathname` is the route pattern (router.pathname), e.g. /agents/[id] → Agents is active. */
export const isActive = (pathname: string, item: NavItem): boolean =>
	pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
