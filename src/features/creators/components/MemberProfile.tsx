import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { ArticleOutlined as ArticleOutlinedIcon, AssignmentOutlined as AssignmentOutlinedIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { BriefFeedRow, BriefsListQuery, feedSx } from '@/features/briefs';
import { ArticleCard, ArticlesListQuery } from '@/features/community';
import { FollowList } from '@/features/follows';
import type { MemberProfileQuery as MemberProfileData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { fonts, radiusPx } from '@/theme/tokens';
import { MemberProfileQuery } from '../graphql/creators';
import { CREATORS_PATH } from '../lib/creatorsQuery';
import { PROFILE_WORK_PAGE_SIZE, isCreator, parseProfileTab, profileArticlesVariables, profileBriefsVariables, type ProfileTab } from '../lib/profile';
import { ProfileAgents } from './ProfileAgents';
import { ProfileCard } from './ProfileCard';
import { ProfileNav, navGroupOf, useProfileSections } from './ProfileNav';

type Member = MemberProfileData['getMember'];

/** A user's OPEN briefs, "Show more" in steps. */
const ProfileBriefs = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const { status } = useAuth();
	const [now] = useState(() => new Date());
	const [limit, setLimit] = useState(PROFILE_WORK_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(BriefsListQuery, { variables: profileBriefsVariables(member._id, limit) });
	const shown = data ?? previousData;
	const briefs = shown?.getBriefs.list ?? [];
	const total = shown?.getBriefs.metaCounter?.[0]?.total ?? 0;

	if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
	if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
	if (briefs.length === 0) {
		return (
			<EmptyState
				icon={<AssignmentOutlinedIcon />}
				title={t('creators:profile.noBriefs')}
				text={t('creators:profile.noBriefsText', { nick: member.memberNick })}
				headingLevel="h3"
			/>
		);
	}
	return (
		<Stack spacing={4}>
			<Box component="ul" aria-label={t('creators:profile.tabs.briefs')} sx={feedSx}>
				{briefs.map((brief, index) => (
					<li key={brief._id}>
						<BriefFeedRow brief={brief} index={index} guest={status === 'guest'} now={now} headingLevel="h3" />
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

/** A member's ACTIVE articles (creators and users both write them), "Show more" in steps. */
const ProfileArticles = ({ member }: { member: Member }) => {
	const { t } = useTranslation('creators');
	const [limit, setLimit] = useState(PROFILE_WORK_PAGE_SIZE);
	const { data, previousData, loading, error, refetch } = useQuery(ArticlesListQuery, { variables: profileArticlesVariables(member._id, limit) });
	const shown = data ?? previousData;
	const articles = shown?.getBoardArticles.list ?? [];
	const total = shown?.getBoardArticles.metaCounter?.[0]?.total ?? 0;

	if (loading && !shown) return <Skeleton variant="rounded" height={240} aria-label={t('creators:profile.loading')} />;
	if (error && !shown) return <ErrorState error={error} title={t('creators:profile.workError')} onRetry={() => void refetch()} />;
	if (articles.length === 0) {
		return (
			<EmptyState
				icon={<ArticleOutlinedIcon />}
				title={t('creators:profile.noArticles')}
				text={t('creators:profile.noArticlesText', { nick: member.memberNick })}
				headingLevel="h3"
			/>
		);
	}
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

/** Eyebrow (the nav group), section title with its count, one line on what the list is. */
const SectionHeader = ({ member, tab }: { member: Member; tab: ProfileTab }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const sections = useProfileSections(member);
	const { label, count } = sections[tab];
	const subKey = tab === 'work' ? (isCreator(member.memberType) ? 'agents' : 'briefs') : tab;

	return (
		<Box component="header">
			<Typography variant="overline" component="p" sx={{ color: 'primary.main' }}>
				{t(`creators:profile.groups.${navGroupOf(tab)}`)}
			</Typography>
			<Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
				<Typography id="profile-section-title" variant="h2" sx={{ fontFamily: fonts.display, fontSize: { xs: 24, md: 30 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
					{label}
				</Typography>
				<Box
					component="span"
					sx={{
						display: 'grid',
						placeItems: 'center',
						minWidth: 32,
						height: 28,
						px: 2.5,
						borderRadius: radiusPx.pill,
						bgcolor: 'neutralSoft',
						color: 'body',
						fontSize: 14,
						fontWeight: 700,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{format.number(count ?? 0)}
				</Box>
			</Stack>
			<Typography variant="body2" sx={{ mt: 1.5, color: 'bodySoft' }}>
				{t(`creators:profile.sections.${subKey}`, { nick: member.memberNick })}
			</Typography>
		</Box>
	);
};

const ProfileSkeleton = () => {
	const { t } = useTranslation('common');
	return (
		<Box
			role="status"
			aria-busy="true"
			aria-label={t('common:status.loading')}
			sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)', lg: '304px minmax(0, 1fr)' }, gap: { xs: 4, md: 8 } }}
		>
			<Stack spacing={4}>
				<Skeleton variant="rounded" height={420} aria-hidden="true" />
				<Skeleton variant="rounded" height={200} aria-hidden="true" />
			</Stack>
			<Stack spacing={4}>
				<Skeleton variant="rounded" height={84} aria-hidden="true" />
				<Skeleton variant="rounded" height={320} aria-hidden="true" />
			</Stack>
		</Box>
	);
};

/**
 * /members/[id] (member-profile design). Sidebar: profile card and section nav. Content: the
 * section picked in the nav. Public data comes from the SSR cache; contacts, Follow state and the view
 * come after auth (ProfileCard). The section lives in the URL (?tab=articles) with shallow routing.
 * Below md the sidebar dissolves (display: contents): card, sticky nav, then the section.
 */
export const MemberProfile = ({ memberId }: { memberId: string }) => {
	const { t } = useTranslation(['creators', 'common']);
	const router = useRouter();
	const tab = parseProfileTab(router.query);
	const { data, loading, error, refetch } = useQuery(MemberProfileQuery, { variables: { memberId } });
	const member = data?.getMember;

	const body = () => {
		if (loading && !member) return <ProfileSkeleton />;
		if (!member) return <ErrorState error={error} title={t('creators:profile.errorTitle')} onRetry={() => void refetch()} />;
		const creator = isCreator(member.memberType);

		return (
			<>
				{creator && (
					<Box component="nav" aria-label={t('creators:profile.breadcrumb')}>
						<Box component="ol" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none', fontSize: 14, color: 'muted' }}>
							<li>
								<Link component={NextLink} href={CREATORS_PATH} underline="hover" sx={{ color: 'muted', fontWeight: 500 }}>
									{t('common:nav.creators')}
								</Link>
							</li>
							<Box component="li" aria-hidden="true" sx={{ display: 'flex' }}>
								<ChevronRightIcon sx={{ fontSize: 16 }} />
							</Box>
							<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600 }}>
								@{member.memberNick}
							</Box>
						</Box>
					</Box>
				)}

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)', lg: '304px minmax(0, 1fr)' },
						gap: { xs: 4, md: 8 },
						alignItems: 'start',
					}}
				>
					<Box
						sx={{
							display: { xs: 'contents', md: 'flex' },
							flexDirection: 'column',
							gap: 4,
							minWidth: 0,
							// Tall screens only: a sidebar longer than the viewport must scroll with the page.
							'@media (min-width: 900px) and (min-height: 860px)': { position: 'sticky', top: 24 },
						}}
					>
						<ProfileCard member={member} />
						<ProfileNav member={member} tab={tab} />
					</Box>

					<Box component="section" aria-labelledby="profile-section-title" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
						<SectionHeader member={member} tab={tab} />
						{tab === 'work' && (creator ? <ProfileAgents member={member} /> : <ProfileBriefs member={member} />)}
						{tab === 'articles' && <ProfileArticles member={member} />}
						{tab === 'followers' && <FollowList memberId={member._id} kind="followers" layout="list" />}
						{tab === 'following' && <FollowList memberId={member._id} kind="following" layout="list" />}
					</Box>
				</Box>
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 5 }}>
			{body()}
		</Box>
	);
};
