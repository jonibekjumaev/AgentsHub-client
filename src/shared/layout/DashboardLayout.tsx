import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Link, Typography } from '@mui/material';
import {
	ArticleOutlined as ArticleOutlinedIcon,
	AssignmentOutlined as AssignmentOutlinedIcon,
	BookmarkBorder as BookmarkBorderIcon,
	FavoriteBorder as FavoriteBorderIcon,
	GroupsOutlined as GroupsOutlinedIcon,
	History as HistoryIcon,
	HowToRegOutlined as HowToRegOutlinedIcon,
	OpenInNew as OpenInNewIcon,
	PeopleOutline as PeopleOutlineIcon,
	SettingsOutlined as SettingsOutlinedIcon,
	SmartToyOutlined as SmartToyOutlinedIcon,
	SpaceDashboardOutlined as SpaceDashboardOutlinedIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { RequireRole, useAuth } from '@/auth';
import type { MemberType } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { radiusPx, shadows } from '@/theme/tokens';
import { DashboardNavCountsQuery } from './graphql';
import { Header } from './Header';
import { Seo } from './Seo';
import { MAIN_CONTENT_ID } from './SkipLink';
import {
	DASHBOARD_NAV,
	followsTab,
	hasPublicProfile,
	isDashboardItemActive,
	profileHref,
	type NavIcon,
} from './navigation';

const iconSx = { fontSize: 18 } as const;

const NAV_ICONS: Record<NavIcon, ReactNode> = {
	overview: <SpaceDashboardOutlinedIcon aria-hidden="true" sx={iconSx} />,
	agents: <SmartToyOutlinedIcon aria-hidden="true" sx={iconSx} />,
	briefs: <AssignmentOutlinedIcon aria-hidden="true" sx={iconSx} />,
	articles: <ArticleOutlinedIcon aria-hidden="true" sx={iconSx} />,
	followers: <PeopleOutlineIcon aria-hidden="true" sx={iconSx} />,
	following: <HowToRegOutlinedIcon aria-hidden="true" sx={iconSx} />,
	visitors: <VisibilityOutlinedIcon aria-hidden="true" sx={iconSx} />,
	favorites: <FavoriteBorderIcon aria-hidden="true" sx={iconSx} />,
	savedBriefs: <BookmarkBorderIcon aria-hidden="true" sx={iconSx} />,
	visited: <HistoryIcon aria-hidden="true" sx={iconSx} />,
	settings: <SettingsOutlinedIcon aria-hidden="true" sx={iconSx} />,
	members: <GroupsOutlinedIcon aria-hidden="true" sx={iconSx} />,
};

const itemSx = (current: boolean) =>
	({
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		gap: { xs: 2, md: 3 },
		height: 40,
		px: 3,
		whiteSpace: 'nowrap',
		borderRadius: radiusPx.sm,
		fontSize: 14,
		fontWeight: current ? 700 : 600,
		color: current ? 'primary.main' : 'body',
		bgcolor: current ? 'accentSoft' : 'transparent',
		transition: 'background-color 150ms ease, color 150ms ease',
		'&:hover': current ? undefined : { bgcolor: 'ground', color: 'ink' },
		'& svg': { color: current ? 'primary.main' : 'muted' },
		// md+: accent bar on the card's inner edge (same as the profile nav).
		'&::before': {
			content: '""',
			display: { xs: 'none', md: 'block' },
			position: 'absolute',
			left: -8,
			top: 10,
			bottom: 10,
			width: 3,
			borderRadius: '0 3px 3px 0',
			bgcolor: 'primary.main',
			transform: current ? 'scaleY(1)' : 'scaleY(0)',
			transition: 'transform 150ms ease',
		},
	}) as const;

const CountPill = ({ value, current }: { value: number; current: boolean }) => {
	const format = useFormat();
	return (
		<Box
			component="span"
			sx={{
				display: 'grid',
				placeItems: 'center',
				minWidth: 24,
				height: 20,
				px: 1.5,
				borderRadius: radiusPx.pill,
				bgcolor: current ? 'primary.main' : 'ground',
				color: current ? 'primary.contrastText' : 'body',
				fontSize: 12,
				fontWeight: 700,
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			{format.number(value)}
		</Box>
	);
};

/**
 * Sidebar for the signed-in member's role (rendered inside RequireRole, so `me` is set).
 * md+: a card with grouped rows (icon, label, count), the current one tinted with an accent bar —
 * the same pattern as the public profile nav. < md: one sticky row that scrolls sideways.
 */
export const DashboardNav = () => {
	const { t } = useTranslation('common');
	const { pathname, query } = useRouter();
	const { me } = useAuth();
	const isAdmin = me?.memberType === 'ADMIN';
	// Counters are a nice-to-have: while loading or on error the items simply show no pill.
	const { data } = useQuery(DashboardNavCountsQuery, { skip: !me || isAdmin, fetchPolicy: 'cache-and-network' });
	if (!me) return null;

	const groups = DASHBOARD_NAV[me.memberType];
	const counts = data?.getMe;
	const tab = pathname === '/dashboard/follows' ? followsTab(query.tab, me.memberType) : undefined;

	return (
		<Box
			component="nav"
			aria-label={t('common:dashboardNav.label')}
			sx={{
				flex: { md: '0 0 248px' },
				width: { md: 248 },
				// Phones: the row stays reachable while scrolling. md+: sticky only when the whole card fits.
				position: { xs: 'sticky', md: 'static' },
				top: 8,
				'@media (min-width: 900px) and (min-height: 760px)': { position: 'sticky', top: 24 },
				zIndex: 10,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: { xs: radiusPx.md, md: radiusPx.xl },
				boxShadow: { xs: shadows.soft, md: 'none' },
				p: { xs: 1, md: 2 },
			}}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'row', md: 'column' },
					overflowX: { xs: 'auto', md: 'visible' },
					scrollbarWidth: 'none',
					'&::-webkit-scrollbar': { display: 'none' },
				}}
			>
				{groups.map((group, index) => (
					<Box
						key={group.key}
						sx={{
							display: { xs: 'flex', md: 'block' },
							flex: 'none',
							...(index > 0 && {
								ml: { xs: 1, md: 0 },
								pl: { xs: 1, md: 0 },
								borderLeft: { xs: 1, md: 0 },
								borderColor: 'border',
								mt: { md: 2 },
							}),
						}}
					>
						<Typography
							id={`dashboard-nav-${group.key}`}
							variant="overline"
							component="p"
							sx={{ display: { xs: 'none', md: 'block' }, color: 'muted', px: 3, pt: 2, pb: 1 }}
						>
							{t(group.titleKey)}
						</Typography>
						<Box
							component="ul"
							aria-labelledby={`dashboard-nav-${group.key}`}
							sx={{ m: 0, p: 0, listStyle: 'none', display: { xs: 'flex', md: 'grid' }, gap: 0.5 }}
						>
							{group.items.map((item) => {
								const current = isDashboardItemActive(pathname, tab, item);
								const count = item.count && counts ? counts[item.count] : undefined;
								return (
									<li key={item.href}>
										<Link
											component={NextLink}
											href={item.href}
											underline="none"
											aria-current={current ? 'page' : undefined}
											sx={itemSx(current)}
										>
											{NAV_ICONS[item.icon]}
											<Box component="span" sx={{ flex: { md: 1 } }}>
												{t(item.labelKey)}
											</Box>
											{count !== undefined && (
												<>
													{' '}
													<CountPill value={count} current={current} />
												</>
											)}
										</Link>
									</li>
								);
							})}
						</Box>
					</Box>
				))}
				{hasPublicProfile(me.memberType) && (
					<Box
						sx={{
							flex: 'none',
							ml: { xs: 1, md: 0 },
							pl: { xs: 1, md: 0 },
							borderLeft: { xs: 1, md: 0 },
							borderTop: { md: 1 },
							borderColor: 'border',
							mt: { md: 2 },
							pt: { md: 2 },
						}}
					>
						<Link component={NextLink} href={profileHref(me)} underline="none" sx={itemSx(false)}>
							<OpenInNewIcon aria-hidden="true" sx={iconSx} />
							<Box component="span" sx={{ flex: { md: 1 } }}>
								{t('common:dashboardNav.publicProfile')}
							</Box>
						</Link>
					</Box>
				)}
			</Box>
		</Box>
	);
};

type DashboardLayoutProps = {
	/** Who may open the page; others get /login (guest) or 404 (wrong role). */
	roles: MemberType[];
	children: ReactNode;
};

export const DashboardLayout = ({ roles, children }: DashboardLayoutProps) => (
	<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
		{/* Private pages: noindex is in the static HTML too, before RequireRole lets the page (and its own Seo) render. */}
		<Seo noindex />
		<Header />
		<Box sx={{ flex: 1, width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16 }}>
			<RequireRole roles={roles}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						alignItems: { md: 'flex-start' },
						gap: { xs: 6, md: 8 },
					}}
				>
					<DashboardNav />
					<Box component="main" id={MAIN_CONTENT_ID} tabIndex={-1} sx={{ flex: 1, minWidth: 0, outline: 'none' }}>
						{children}
					</Box>
				</Box>
			</RequireRole>
		</Box>
	</Box>
);
