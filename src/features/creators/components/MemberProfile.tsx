import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	BlockOutlined as BlockOutlinedIcon,
	LockOutlined as LockOutlinedIcon,
	MailOutline as MailOutlineIcon,
	WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { AgentCard, AgentsListQuery } from '@/features/agents';
import { BriefRow, BriefsListQuery } from '@/features/briefs';
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
	profileBriefsVariables,
	profileTabHref,
	type ProfileTab,
} from '../lib/profile';

type Member = MemberProfileData['getMember'];

const cardSx = { p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg } as const;

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

const Stats = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const creator = isCreator(member.memberType);
	const items: [string, number, boolean][] = [
		creator ? [t('creators:profile.stats.agents'), member.memberProducts, false] : [t('creators:profile.stats.briefs'), member.memberBriefs, false],
		[t('creators:profile.stats.followers'), member.memberFollowers, false],
		[t('creators:profile.stats.following'), member.memberFollowings, false],
		[t('creators:profile.stats.likes'), member.memberLikes, false],
		[t('creators:profile.stats.views'), member.memberViews, true],
		[t('creators:profile.stats.articles'), member.memberArticles, false],
	];
	return (
		<Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 3 }}>
			{items.map(([label, value, compact]) => (
				<Box key={label} sx={{ p: 4, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
					<Typography component="dt" variant="caption">
						{label}
					</Typography>
					<Typography component="dd" variant="monoStat" sx={{ m: 0, color: 'ink' }}>
						{compact ? format.compact(value ?? 0) : format.number(value ?? 0)}
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

const Tabs = ({ member, tab }: { member: Member; tab: ProfileTab }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const creator = isCreator(member.memberType);
	const label = (item: ProfileTab) => {
		if (item === 'work') return creator ? t('creators:profile.tabs.agents') : t('creators:profile.tabs.briefs');
		return t(`creators:profile.tabs.${item}`);
	};
	const count = (item: ProfileTab) => {
		if (item === 'work') return creator ? member.memberProducts : member.memberBriefs;
		return item === 'followers' ? member.memberFollowers : member.memberFollowings;
	};

	return (
		<Box component="nav" aria-label={t('creators:profile.tabs.label')} sx={{ display: 'flex', gap: 6, borderBottom: 1, borderColor: 'border', overflowX: 'auto' }}>
			{PROFILE_TABS.map((item) => {
				const current = item === tab;
				return (
					<Link
						key={item}
						component={NextLink}
						href={profileTabHref(member._id, item)}
						shallow
						scroll={false}
						underline="none"
						aria-current={current ? 'page' : undefined}
						sx={{
							py: 3,
							mb: '-1px',
							whiteSpace: 'nowrap',
							fontSize: 14,
							fontWeight: current ? 800 : 600,
							color: current ? 'ink' : 'body',
							borderBottom: 2,
							borderColor: current ? 'primary.main' : 'transparent',
						}}
					>
						{label(item)}{' '}
						<Box component="span" sx={{ color: 'muted', fontWeight: 600 }}>
							{`· ${format.number(count(item) ?? 0)}`}
						</Box>
					</Link>
				);
			})}
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

				<Box sx={{ ...cardSx, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-start' }}>
					<Avatar memberId={member._id} name={name} image={member.memberImage} size={96} radius={24} />
					<Box sx={{ flex: '999 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
							<Typography variant="h1" sx={{ overflowWrap: 'anywhere' }}>
								{name}
							</Typography>
							<Box
								component="span"
								sx={{ px: 2.5, py: 0.5, borderRadius: radiusPx.pill, bgcolor: 'accentSoft', color: 'primary.main', fontSize: 12, fontWeight: 800 }}
							>
								{t(`common:enums.MemberType.${member.memberType}`)}
							</Box>
						</Stack>
						<Typography variant="meta">
							@{member.memberNick} · {t('creators:profile.since', { date: since })}
						</Typography>
						{member.memberDesc && (
							<Typography sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.7 }}>{member.memberDesc}</Typography>
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
					<Box sx={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
						{member.memberStatus === MemberStatus.Active && (
							<FollowButton memberId={member._id} nick={member.memberNick} following={following} fullWidth />
						)}
						<ContactsBox viewer={viewer} />
					</Box>
				</Box>

				<Stats member={member} />
				<Tabs member={member} tab={tab} />
				{tab === 'work' && (creator ? <ProfileAgents member={member} /> : <ProfileBriefs member={member} />)}
				{tab === 'followers' && <FollowList memberId={member._id} kind="followers" />}
				{tab === 'following' && <FollowList memberId={member._id} kind="following" />}
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			{body()}
		</Box>
	);
};
