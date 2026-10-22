import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { Add as AddIcon, SmartToyOutlined as SmartToyOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { NEW_AGENT_PATH, RecentAgents } from '@/features/agents';
import { useFormat } from '@/shared/lib/format';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { CreatorStatsQuery } from '../graphql/creatorStats';

type Tile = { key: string; label: string; value: number; hint?: string };

const StatTile = ({ label, value, hint }: Omit<Tile, 'key'>) => {
	const format = useFormat();
	return (
		<Box component="li" sx={{ p: 4, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
			{/* Label first in the DOM, so "Profile views 1,284" reads in that order. */}
			<Typography variant="caption" component="div" sx={{ fontWeight: 700 }}>
				{label}
			</Typography>
			<Typography variant="monoStat" component="div" sx={{ mt: 1, color: 'ink' }}>
				{format.number(value)}
			</Typography>
			{hint && (
				<Typography variant="caption" component="div">
					{hint}
				</Typography>
			)}
		</Box>
	);
};

/**
 * /dashboard for a CREATOR. Every number is a counter the API keeps (CreatorStatsQuery); nothing is
 * summed or estimated here. memberRank is a nightly score, not a position, so no "#3" tile (Dashboard.html).
 */
export const CreatorOverview = () => {
	const { t } = useTranslation('dashboard');
	// Refreshed on every visit: deleting an agent elsewhere changes memberProducts.
	const { data, loading, error, refetch } = useQuery(CreatorStatsQuery, { fetchPolicy: 'cache-and-network' });
	const me = data?.getMe;

	const tiles: Tile[] = me
		? [
				{ key: 'agents', label: t('dashboard:overview.stats.agents'), value: me.memberProducts, hint: t('dashboard:overview.stats.agentsHint') },
				{ key: 'views', label: t('dashboard:overview.stats.profileViews'), value: me.memberViews },
				{ key: 'likes', label: t('dashboard:overview.stats.profileLikes'), value: me.memberLikes },
				{ key: 'followers', label: t('dashboard:overview.stats.followers'), value: me.memberFollowers },
			]
		: [];

	return (
		<Stack spacing={6}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
				<Box>
					<Typography variant="h1">{t('dashboard:overview.title')}</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('dashboard:overview.subtitle')}</Typography>
				</Box>
				<Button component={NextLink} href={NEW_AGENT_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
					{t('dashboard:myAgents.new')}
				</Button>
			</Box>

			{loading && !me ? (
				<Box role="status" aria-busy="true" aria-label={t('dashboard:overview.loading')}>
					<Skeleton variant="rounded" height={88} aria-hidden="true" />
				</Box>
			) : error && !me ? (
				<ErrorState error={error} title={t('dashboard:overview.errorTitle')} onRetry={() => void refetch()} />
			) : (
				<Box
					component="ul"
					aria-label={t('dashboard:overview.stats.label')}
					sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 4, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
				>
					{tiles.map(({ key, ...tile }) => (
						<StatTile key={key} {...tile} />
					))}
				</Box>
			)}

			{me?.memberProducts === 0 ? (
				<EmptyState
					icon={<SmartToyOutlinedIcon />}
					title={t('dashboard:myAgents.empty.title')}
					text={t('dashboard:myAgents.empty.text')}
					action={{ label: t('dashboard:myAgents.empty.action'), href: NEW_AGENT_PATH }}
				/>
			) : (
				<RecentAgents />
			)}
		</Stack>
	);
};
