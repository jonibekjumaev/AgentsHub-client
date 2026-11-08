import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import {
	Add as AddIcon,
	EditNoteOutlined as EditNoteOutlinedIcon,
	FavoriteBorder as FavoriteBorderIcon,
	PeopleOutline as PeopleOutlineIcon,
	SmartToyOutlined as SmartToyOutlinedIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { CreatorAgentsQuery, NEW_AGENT_PATH, RecentAgents, TopAgents, myAgentsVariables } from '@/features/agents';
import { NEW_ARTICLE_PATH } from '@/features/community';
import { useFormat } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { CreatorStatsQuery } from '../graphql/creatorStats';
import { greetingName, profileChecklist } from '../lib/overview';
import { NextSteps } from './NextSteps';

type Tile = { key: string; label: string; value: number; hint: string; icon: ReactNode };

const iconSx = { fontSize: 20 } as const;

const StatTile = ({ label, value, hint, icon }: Omit<Tile, 'key'>) => {
	const format = useFormat();
	return (
		<Box
			component="li"
			sx={{ p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.xl, minWidth: 0 }}
		>
			{/* Label first in the DOM, so "Profile views 1,284" reads in that order. */}
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
				<Typography variant="caption" component="div" sx={{ fontWeight: 700, color: 'muted' }}>
					{label}
				</Typography>
				<Box
					aria-hidden="true"
					sx={{
						display: 'grid',
						placeItems: 'center',
						width: 36,
						height: 36,
						borderRadius: radiusPx.md,
						bgcolor: 'accentSoft',
						color: 'primary.main',
					}}
				>
					{icon}
				</Box>
			</Box>
			<Typography variant="monoStat" component="div" sx={{ mt: 1, fontSize: 28, color: 'ink' }}>
				{format.number(value)}
			</Typography>
			<Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
				{hint}
			</Typography>
		</Box>
	);
};

/**
 * /dashboard for a CREATOR (dashboard redesign). Every number is a counter the API keeps
 * (CreatorStatsQuery, the agent tab counts); nothing is summed or estimated here. memberRank is a
 * nightly score, not a position, so there is no "#3" tile.
 */
export const CreatorOverview = () => {
	const { t } = useTranslation('dashboard');
	const format = useFormat();
	// Refreshed on every visit: deleting an agent elsewhere changes memberProducts.
	const { data, loading, error, refetch } = useQuery(CreatorStatsQuery, { fetchPolicy: 'cache-and-network' });
	// Same document and variables as RecentAgents: Apollo sends one request for both.
	const agentsQuery = useQuery(CreatorAgentsQuery, {
		variables: myAgentsVariables({ tab: 'all', page: 1 }),
		fetchPolicy: 'cache-and-network',
	});
	const me = data?.getMe;
	const split = agentsQuery.data
		? {
				active: agentsQuery.data.active.metaCounter?.[0]?.total ?? 0,
				paused: agentsQuery.data.paused.metaCounter?.[0]?.total ?? 0,
			}
		: null;

	const tiles: Tile[] = me
		? [
				{
					key: 'agents',
					label: t('dashboard:overview.stats.agents'),
					value: me.memberProducts,
					hint: split ? t('dashboard:overview.stats.agentsSplit', split) : t('dashboard:overview.stats.agentsHint'),
					icon: <SmartToyOutlinedIcon sx={iconSx} />,
				},
				{
					key: 'views',
					label: t('dashboard:overview.stats.profileViews'),
					value: me.memberViews,
					hint: t('dashboard:overview.stats.since', { date: format.date(me.createdAt) }),
					icon: <VisibilityOutlinedIcon sx={iconSx} />,
				},
				{
					key: 'likes',
					label: t('dashboard:overview.stats.profileLikes'),
					value: me.memberLikes,
					hint: t('dashboard:overview.stats.likesHint'),
					icon: <FavoriteBorderIcon sx={iconSx} />,
				},
				{
					key: 'followers',
					label: t('dashboard:overview.stats.followers'),
					value: me.memberFollowers,
					hint: t('dashboard:overview.stats.youFollow', {
						count: me.memberFollowings,
						formatted: format.number(me.memberFollowings),
					}),
					icon: <PeopleOutlineIcon sx={iconSx} />,
				},
			]
		: [];

	const steps = me ? profileChecklist(me, { newAgent: NEW_AGENT_PATH, newArticle: NEW_ARTICLE_PATH }) : [];
	const hasAgents = (me?.memberProducts ?? 0) > 0;

	return (
		<Stack spacing={6}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="overline" component="p" sx={{ color: 'primary.main' }}>
						{t('dashboard:overview.eyebrow')}
					</Typography>
					<Typography variant="h1" sx={{ overflowWrap: 'anywhere' }}>
						{me ? t('dashboard:overview.welcome', { name: greetingName(me) }) : t('dashboard:overview.title')}
					</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('dashboard:overview.subtitle')}</Typography>
				</Box>
				<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
					<Button
						component={NextLink}
						href={NEW_ARTICLE_PATH}
						variant="outlined"
						startIcon={<EditNoteOutlinedIcon />}
						sx={{ height: 42 }}
					>
						{t('dashboard:overview.writeArticle')}
					</Button>
					<Button component={NextLink} href={NEW_AGENT_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
						{t('dashboard:myAgents.new')}
					</Button>
				</Stack>
			</Box>

			{loading && !me ? (
				<Box role="status" aria-busy="true" aria-label={t('dashboard:overview.loading')}>
					<Skeleton variant="rounded" height={128} aria-hidden="true" />
				</Box>
			) : error && !me ? (
				<ErrorState error={error} title={t('dashboard:overview.errorTitle')} onRetry={() => void refetch()} />
			) : (
				<Box
					component="ul"
					aria-label={t('dashboard:overview.stats.label')}
					sx={{
						m: 0,
						p: 0,
						listStyle: 'none',
						display: 'grid',
						gap: 4,
						gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
					}}
				>
					{tiles.map(({ key, ...tile }) => (
						<StatTile key={key} {...tile} />
					))}
				</Box>
			)}

			{me && !hasAgents ? (
				<Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 340px' } }}>
					<EmptyState
						icon={<SmartToyOutlinedIcon />}
						title={t('dashboard:myAgents.empty.title')}
						text={t('dashboard:myAgents.empty.text')}
						action={{ label: t('dashboard:myAgents.empty.action'), href: NEW_AGENT_PATH }}
					/>
					<NextSteps items={steps} />
				</Box>
			) : me ? (
				<Box
					sx={{
						display: 'grid',
						gap: 5,
						alignItems: 'start',
						gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 340px' },
					}}
				>
					<RecentAgents />
					<Stack spacing={5}>
						<TopAgents />
						<NextSteps items={steps} />
					</Stack>
				</Box>
			) : null}
		</Stack>
	);
};
