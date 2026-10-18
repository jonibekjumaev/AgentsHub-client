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

export const FOOTER_NAV: NavItem[] = [
	...MAIN_NAV,
	{ href: '/faq', labelKey: 'common:footer.faq' },
	{ href: '/about', labelKey: 'common:footer.about' },
];

type DashboardSection = { titleKey: string; items: NavItem[] };

/** DESIGN §5 sidebar items per role. ADMIN items follow FRONTEND_MIGRATION §3.12 until the admin mockups exist. */
export const DASHBOARD_NAV: Record<MemberType, DashboardSection> = {
	CREATOR: {
		titleKey: 'common:dashboardNav.titles.CREATOR',
		items: [
			{ href: '/dashboard', labelKey: 'common:dashboardNav.overview', exact: true },
			{ href: '/dashboard/agents', labelKey: 'common:dashboardNav.myAgents' },
			{ href: '/dashboard/articles', labelKey: 'common:dashboardNav.articles' },
			{ href: '/dashboard/favorites', labelKey: 'common:dashboardNav.favorites' },
			{ href: '/dashboard/follows', labelKey: 'common:dashboardNav.followers' },
			{ href: '/dashboard/settings', labelKey: 'common:dashboardNav.settings' },
		],
	},
	USER: {
		titleKey: 'common:dashboardNav.titles.USER',
		items: [
			{ href: '/dashboard/briefs', labelKey: 'common:dashboardNav.myBriefs' },
			{ href: '/dashboard/favorites', labelKey: 'common:dashboardNav.favorites' },
			{ href: '/dashboard/visited', labelKey: 'common:dashboardNav.visited' },
			{ href: '/dashboard/articles', labelKey: 'common:dashboardNav.articles' },
			{ href: '/dashboard/follows', labelKey: 'common:dashboardNav.following' },
			{ href: '/dashboard/settings', labelKey: 'common:dashboardNav.settings' },
		],
	},
	ADMIN: {
		titleKey: 'common:dashboardNav.titles.ADMIN',
		items: [
			{ href: '/admin/members', labelKey: 'common:dashboardNav.members' },
			{ href: '/admin/agents', labelKey: 'common:dashboardNav.agents' },
			{ href: '/admin/briefs', labelKey: 'common:dashboardNav.briefs' },
			{ href: '/admin/articles', labelKey: 'common:dashboardNav.articles' },
		],
	},
};

/** Where the header "Dashboard" button leads (DESIGN §5: /dashboard is for CREATOR and USER). */
export const dashboardHref = (memberType: MemberType): string =>
	memberType === 'ADMIN' ? DASHBOARD_NAV.ADMIN.items[0].href : '/dashboard';

export const SETTINGS_HREF = '/dashboard/settings';

/** `pathname` is the route pattern (router.pathname), e.g. /agents/[id] → Agents is active. */
export const isActive = (pathname: string, item: NavItem): boolean =>
	pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
