import { useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	ArticleOutlined as ArticleOutlinedIcon,
	AssignmentOutlined as AssignmentOutlinedIcon,
	BlockOutlined as BlockOutlinedIcon,
	HowToRegOutlined as HowToRegOutlinedIcon,
	LockOutlined as LockOutlinedIcon,
	MailOutline as MailOutlineIcon,
	PeopleOutline as PeopleOutlineIcon,
	SmartToyOutlined as SmartToyOutlinedIcon,
	WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { AgentCard, AgentsListQuery } from '@/features/agents';
import { BriefRow, BriefsListQuery } from '@/features/briefs';
import { ArticleCard, ArticlesListQuery } from '@/features/community';
import { FollowButton, FollowList } from '@/features/follows';
import { MemberStatus } from '@/gql/enums';
import type { MemberProfileQuery as MemberProfileData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { MemberProfileQuery, MemberViewerQuery } from '../graphql/creators';
import { CREATORS_PATH } from '../lib/creatorsQuery';
import {
	PROFILE_TABS,
	PROFILE_WORK_PAGE_SIZE,
	isCreator,
	parseProfileTab,
	profileAgentsVariables,
	profileArticlesVariables,
	profileBriefsVariables,
	profileTabHref,
	type ProfileTab,
} from '../lib/profile';

type Member = MemberProfileData['getMember'];

/** Signed-in ACTIVE members load contacts + meFollowed in the browser; guests and SSR never do. */
const useMemberViewer = (memberId: string) => {
	const { status, me } = useAuth();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const query = useQuery(MemberViewerQuery, { variables: { memberId }, skip: !isMember });
	return { ...query, isMember, status };
};

const ContactsBox = ({ viewer }: { viewer: ReturnType<typeof useMemberViewer> }) => {
	const { t } = useTranslation('creators');
	const { asPath } = useRouter();
	const boxSx = { display: 'flex', flexDirection: 'column', gap: 2, p: 4, borderRadius: radiusPx.md, bgcolor: 'ground', minWidth: 0 } as const;

	if (viewer.status === 'loading') return null;
	if (!viewer.isMember) {
		return (
			<Box sx={boxSx}>
				<Stack direction="row" spacing={2} alignItems="center">
					<LockOutlinedIcon aria-hidden="true" sx={{ color: 'primary.main', fontSize: 18 }} />
					<Typography variant="body2" sx={{ color: 'bodySoft' }}>
						{t('creators:profile.contacts.guest')}
					</Typography>
				</Stack>
				<Link component={NextLink} href={`/login?${new URLSearchParams({ next: asPath })}`} sx={{ fontWeight: 700, fontSize: 14 }}>
					{t('creators:profile.contacts.login')}
				</Link>
			</Box>
		);
	}
	if (!viewer.data) {
		if (viewer.error) return <ErrorState error={viewer.error} title={t('creators:profile.contacts.error')} onRetry={() => void viewer.refetch()} />;
		return <Skeleton variant="rounded" height={72} aria-hidden="true" />;
	}
	const { memberEmail: email, memberWhatsapp: whatsapp } = viewer.data.getMember;
	if (!email && !whatsapp) {
		return (
			<Box sx={boxSx}>
				<Typography variant="body2" sx={{ color: 'bodySoft' }}>
					{t('creators:profile.contacts.none')}
				</Typography>
			</Box>
		);
	}
	return (
		<Box sx={boxSx}>
			{email && (
				<Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
					<MailOutlineIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 18 }} />
					<Link href={`mailto:${email}`} sx={{ fontWeight: 700, fontSize: 14, overflowWrap: 'anywhere' }}>
						{email}
					</Link>
				</Stack>
			)}
			{whatsapp && (
				<Stack direction="row" spacing={2} alignItems="center">
					<WhatsAppIcon aria-hidden="true" sx={{ color: 'success.main', fontSize: 18 }} />
					<Link href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} sx={{ fontWeight: 700, fontSize: 14 }}>
						{whatsapp}
					</Link>
				</Stack>
			)}
			<Typography variant="caption" component="p">
				{t('creators:profile.contacts.visible')}
			</Typography>
		</Box>
	);
};

/** Likes and views have no list of their own, so they sit as plain numbers under the section nav. */
const ProfileCounters = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const items: [string, string][] = [
		[t('creators:profile.stats.likes'), format.number(member.memberLikes ?? 0)],
		[t('creators:profile.stats.views'), format.compact(member.memberViews ?? 0)],
	];
	return (
		<Box component="dl" sx={{ m: 0, display: 'flex', gap: 5, pt: 4, borderTop: 1, borderColor: 'border' }}>
			{items.map(([label, value]) => (
				<Box key={label} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
					<Typography component="dt" variant="caption">
						{label}
					</Typography>
					<Typography component="dd" variant="meta" sx={{ m: 0, color: 'ink', fontWeight: 700 }}>
						{value}
					</Typography>
				</Box>
			))}
		</Box>
	);
};

/** A creator's ACTIVE agents, "Show more" in steps (MemberProfile.html). */
const ProfileAgents = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const [limit, setLimit] = useState(PROFILE_WORK_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(AgentsListQuery, { variables: profileAgentsVariables(member._id, limit) });
	const shown = data ?? previousData;
	const agents = shown?.getProducts.list ?? [];
	const total = shown?.getProducts.metaCounter?.[0]?.total ?? 0;

	if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
	if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
	if (agents.length === 0) return <EmptyState title={t('creators:profile.noAgents')} headingLevel="h3" />;
	return (
		<Stack spacing={5}>
			<Box
				component="ul"
				aria-label={t('creators:profile.tabs.agents')}
				sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 5 }}
			>
				{agents.map((agent) => (
					<li key={agent._id}>
						<AgentCard agent={agent} headingLevel="h3" />
					</li>
				))}
			</Box>
			{agents.length < total && (
				<Button variant="outlined" disabled={loading} onClick={() => setLimit((value) => value + PROFILE_WORK_PAGE_SIZE)} sx={{ alignSelf: 'center' }}>
					{t('creators:profile.showMoreAgents', { count: total - agents.length })}
				</Button>
			)}
		</Stack>
	);
};

/** A user's OPEN briefs. */
const ProfileBriefs = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const [limit, setLimit] = useState(PROFILE_WORK_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(BriefsListQuery, { variables: profileBriefsVariables(member._id, limit) });
	const shown = data ?? previousData;
	const briefs = shown?.getBriefs.list ?? [];
	const total = shown?.getBriefs.metaCounter?.[0]?.total ?? 0;

	if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
	if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
	if (briefs.length === 0) return <EmptyState title={t('creators:profile.noBriefs')} headingLevel="h3" />;
	return (
		<Stack spacing={4}>
			<Box component="ul" aria-label={t('creators:profile.tabs.briefs')} sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
				{briefs.map((brief) => (
					<li key={brief._id}>
						<BriefRow brief={brief} />
					</li>
				))}
			</Box>
			{briefs.length < total && (
				<Button variant="outlined" disabled={loading} onClick={() => setLimit((value) => value + PROFILE_WORK_PAGE_SIZE)} sx={{ alignSelf: 'center' }}>
					{t('creators:profile.showMoreBriefs', { count: total - briefs.length })}
				</Button>
			)}
		</Stack>
	);
};

/** A member's ACTIVE articles (creators and users both write them). */
const ProfileArticles = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const [limit, setLimit] = useState(PROFILE_WORK_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(ArticlesListQuery, { variables: profileArticlesVariables(member._id, limit) });
	const shown = data ?? previousData;
	const articles = shown?.getBoardArticles.list ?? [];
	const total = shown?.getBoardArticles.metaCounter?.[0]?.total ?? 0;

	if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
	if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
	if (articles.length === 0) return <EmptyState title={t('creators:profile.noArticles')} headingLevel="h3" />;
	return (
		<Stack spacing={4}>
			<Box component="ul" aria-label={t('creators:profile.tabs.articles')} sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
				{articles.map((article) => (
					<li key={article._id}>
						<ArticleCard article={article} headingLevel="h3" />
					</li>
				))}
			</Box>
			{articles.length < total && (
				<Button variant="outlined" disabled={loading} onClick={() => setLimit((value) => value + PROFILE_WORK_PAGE_SIZE)} sx={{ alignSelf: 'center' }}>
					{t('creators:profile.showMoreArticles', { count: total - articles.length })}
				</Button>
			)}
		</Stack>
	);
};

const NAV_GROUPS: { key: 'work' | 'community'; items: ProfileTab[] }[] = [
	{ key: 'work', items: ['work'] },
	{ key: 'community', items: ['articles', 'followers', 'following'] },
];

/**
 * Section nav (MemberProfile design): a grouped vertical list in the sidebar on md+, a row of chips
 * on phones. One element for both, so the URL tab (?tab=…) and the tests see a single nav.
 */
const ProfileNav = ({ member, tab }: { member: Member; tab: ProfileTab }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const creator = isCreator(member.memberType);
	const iconSx = { fontSize: 18 } as const;
	const item: Record<ProfileTab, { label: string; count: number; icon: ReactNode }> = {
		work: creator
			? { label: t('creators:profile.tabs.agents'), count: member.memberProducts, icon: <SmartToyOutlinedIcon aria-hidden="true" sx={iconSx} /> }
			: { label: t('creators:profile.tabs.briefs'), count: member.memberBriefs, icon: <AssignmentOutlinedIcon aria-hidden="true" sx={iconSx} /> },
		articles: { label: t('creators:profile.tabs.articles'), count: member.memberArticles, icon: <ArticleOutlinedIcon aria-hidden="true" sx={iconSx} /> },
		followers: { label: t('creators:profile.tabs.followers'), count: member.memberFollowers, icon: <PeopleOutlineIcon aria-hidden="true" sx={iconSx} /> },
		following: { label: t('creators:profile.tabs.following'), count: member.memberFollowings, icon: <HowToRegOutlinedIcon aria-hidden="true" sx={iconSx} /> },
	};

	return (
		<Box
			component="nav"
			aria-label={t('creators:profile.tabs.label')}
			sx={{
				display: 'flex',
				flexDirection: { xs: 'row', md: 'column' },
				gap: { xs: 2, md: 0.5 },
				overflowX: { xs: 'auto', md: 'visible' },
				pb: { xs: 1, md: 0 },
			}}
		>
			{NAV_GROUPS.map((group) => (
				<Box key={group.key} sx={{ display: 'contents' }}>
					<Typography variant="overline" component="p" sx={{ display: { xs: 'none', md: 'block' }, color: 'muted', mt: 4, mb: 1, ml: 3 }}>
						{t(`creators:profile.groups.${group.key}`)}
					</Typography>
					{group.items.map((key) => {
						const current = key === tab;
						const { label, count, icon } = item[key];
						return (
							<Link
								key={key}
								component={NextLink}
								href={profileTabHref(member._id, key)}
								shallow
								scroll={false}
								underline="none"
								aria-current={current ? 'page' : undefined}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 3,
									flex: 'none',
									whiteSpace: 'nowrap',
									px: { xs: 3.5, md: 3 },
									py: { xs: 1.5, md: 2.5 },
									borderRadius: { xs: radiusPx.pill, md: radiusPx.md },
									border: { xs: 1, md: 0 },
									borderColor: current ? 'primary.main' : 'border',
									bgcolor: current ? 'primary.main' : { xs: 'surface', md: 'transparent' },
									color: current ? 'primary.contrastText' : 'body',
									fontSize: 14,
									fontWeight: current ? 700 : 600,
									'&:hover': current ? undefined : { bgcolor: 'ground' },
								}}
							>
								{icon}
								<span>{label}</span>{' '}
								<Box component="span" sx={{ ml: { xs: 0, md: 'auto' }, color: current ? 'inherit' : 'muted', fontVariantNumeric: 'tabular-nums' }}>
									{format.number(count ?? 0)}
								</Box>
							</Link>
						);
					})}
				</Box>
			))}
		</Box>
	);
};

const ProfileSkeleton = () => {
	const { t } = useTranslation('common');
	return (
		<Stack spacing={5} role="status" aria-busy="true" aria-label={t('common:status.loading')}>
			<Skeleton variant="rounded" height={180} aria-hidden="true" />
			<Skeleton variant="rounded" height={84} aria-hidden="true" />
			<Skeleton variant="rounded" height={240} aria-hidden="true" />
		</Stack>
	);
};

/**
 * /members/[id] (MemberProfile.html). Public data from the SSR cache; contacts, Follow state and the
 * view come after auth. Tabs live in the URL (?tab=followers) with shallow routing.
 */
export const MemberProfile = ({ memberId }: { memberId: string }) => {
	const { t } = useTranslation(['creators', 'common']);
	const format = useFormat();
	const router = useRouter();
	const tab = parseProfileTab(router.query);
	const { data, loading, error, refetch } = useQuery(MemberProfileQuery, { variables: { memberId } });
	const viewer = useMemberViewer(memberId);
	const member = data?.getMember;

	const body = () => {
		if (loading && !member) return <ProfileSkeleton />;
		if (!member) return <ErrorState error={error} title={t('creators:profile.errorTitle')} onRetry={() => void refetch()} />;
		const creator = isCreator(member.memberType);
		const name = member.memberFullName || member.memberNick;
		const since = new Intl.DateTimeFormat(format.locale, { month: 'long', year: 'numeric' }).format(new Date(member.createdAt));
		const meFollowed = viewer.data?.getMember.meFollowed;
		const following = meFollowed ? meFollowed.some((item) => item.myFollowing) : null;
		const sections: Record<ProfileTab, [string, number]> = {
			work: creator ? [t('creators:profile.tabs.agents'), member.memberProducts] : [t('creators:profile.tabs.briefs'), member.memberBriefs],
			articles: [t('creators:profile.tabs.articles'), member.memberArticles],
			followers: [t('creators:profile.tabs.followers'), member.memberFollowers],
			following: [t('creators:profile.tabs.following'), member.memberFollowings],
		};
		const [sectionTitle, sectionCount] = sections[tab];

		return (
			<>
				{creator && (
					<Box component="nav" aria-label={t('creators:profile.breadcrumb')}>
						<Box component="ol" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none', fontSize: 13, color: 'muted' }}>
							<li>
								<Link component={NextLink} href={CREATORS_PATH} sx={{ color: 'muted', fontWeight: 500 }}>
									{t('common:nav.creators')}
								</Link>
							</li>
							<li aria-hidden="true">/</li>
							<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600 }}>
								@{member.memberNick}
							</Box>
						</Box>
					</Box>
				)}

				<Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '300px minmax(0, 1fr)' }, gap: { xs: 5, md: 7 }, alignItems: 'start' }}>
					{/* One card on md+; on phones the identity block is the card and the nav turns into chips. */}
					<Box
						component="aside"
						sx={{
							minWidth: 0,
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
							p: { md: 6 },
							bgcolor: { md: 'surface' },
							border: { xs: 0, md: 1 },
							borderColor: 'border',
							borderRadius: { md: radiusPx.lg },
						}}
					>
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								gap: 3,
								p: { xs: 4, md: 0 },
								bgcolor: { xs: 'surface', md: 'transparent' },
								border: { xs: 1, md: 0 },
								borderColor: 'border',
								borderRadius: radiusPx.lg,
							}}
						>
							<Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: { xs: 4, md: 3 } }}>
								<Avatar memberId={member._id} name={name} image={member.memberImage} size={80} radius={20} />
								<Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
									<Typography variant="h1" sx={{ fontSize: { xs: 20, md: 24 }, overflowWrap: 'anywhere' }}>
										{name}
									</Typography>
									<Typography variant="meta">
										@{member.memberNick} · {t('creators:profile.since', { date: since })}
									</Typography>
									<Box
										component="span"
										sx={{ px: 2.5, py: 0.5, borderRadius: radiusPx.pill, bgcolor: 'accentSoft', color: 'primary.main', fontSize: 12, fontWeight: 800 }}
									>
										{t(`common:enums.MemberType.${member.memberType}`)}
									</Box>
								</Box>
							</Box>
							{member.memberDesc && (
								<Typography variant="body2" sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.6 }}>
									{member.memberDesc}
								</Typography>
							)}
							{member.memberStatus === MemberStatus.Block && (
								<Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'dangerInk' }}>
									<BlockOutlinedIcon aria-hidden="true" fontSize="small" />
									<Typography variant="body2" sx={{ color: 'inherit', fontWeight: 600 }}>
										{t('creators:profile.blocked')}
									</Typography>
								</Stack>
							)}
						</Box>

						{member.memberStatus === MemberStatus.Active && (
							<FollowButton memberId={member._id} nick={member.memberNick} following={following} fullWidth />
						)}
						<ContactsBox viewer={viewer} />
						<ProfileNav member={member} tab={tab} />
						<Box sx={{ display: { xs: 'none', md: 'block' } }}>
							<ProfileCounters member={member} />
						</Box>
					</Box>

					<Box component="section" aria-labelledby="profile-section-title" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
						<Stack direction="row" spacing={2} alignItems="baseline">
							<Typography id="profile-section-title" variant="h2">
								{sectionTitle}
							</Typography>
							<Typography component="span" sx={{ color: 'muted', fontWeight: 700 }}>
								{format.number(sectionCount ?? 0)}
							</Typography>
						</Stack>
						{tab === 'work' && (creator ? <ProfileAgents member={member} /> : <ProfileBriefs member={member} />)}
						{tab === 'articles' && <ProfileArticles member={member} />}
						{tab === 'followers' && <FollowList memberId={member._id} kind="followers" />}
						{tab === 'following' && <FollowList memberId={member._id} kind="following" />}
					</Box>
				</Box>
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			{body()}
		</Box>
	);
};
