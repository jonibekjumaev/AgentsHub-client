import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Stack, Typography } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, History as HistoryIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { CardSkeleton } from '@/shared/ui/Skeletons';
import { FavoriteAgentsQuery, VisitedAgentsQuery } from '../../graphql/saved';
import { DEFAULT_FILTERS, agentsHref } from '../../lib/listQuery';
import { AgentCard } from '../AgentCard';

export const SAVED_PAGE_SIZE = 9;
const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 5 } as const;

/**
 * /dashboard/favorites and /dashboard/visited (§3.9): the member's liked or recently opened agents.
 * Paused or deleted agents drop out on the server, and metaCounter matches.
 */
export const SavedAgents = ({ kind }: { kind: 'favorites' | 'visited' }) => {
	const { t } = useTranslation('saved');
	const [page, setPage] = useState(1);
	const variables = { input: { page, limit: SAVED_PAGE_SIZE } };
	// Liking elsewhere changes this list: always ask the server when the page opens.
	const favorites = useQuery(FavoriteAgentsQuery, { variables, skip: kind !== 'favorites', fetchPolicy: 'cache-and-network' });
	const visited = useQuery(VisitedAgentsQuery, { variables, skip: kind !== 'visited', fetchPolicy: 'cache-and-network' });
	const query = kind === 'favorites' ? favorites : visited;
	const result = kind === 'favorites' ? favorites.data?.getFavorities : visited.data?.getVisited;
	const agents = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;

	const body = () => {
		if (query.loading && !result) {
			return (
				<Box role="status" aria-busy="true" aria-label={t('saved:loading')} sx={gridSx}>
					{Array.from({ length: 3 }, (_, index) => (
						<CardSkeleton key={index} />
					))}
				</Box>
			);
		}
		if (query.error && !result) return <ErrorState error={query.error} title={t('saved:errorTitle')} onRetry={() => void query.refetch()} />;
		if (agents.length === 0) {
			return (
				<EmptyState
					icon={kind === 'favorites' ? <FavoriteBorderIcon /> : <HistoryIcon />}
					title={t(`saved:${kind}.emptyTitle`)}
					text={t(`saved:${kind}.emptyText`)}
					action={{ label: t('saved:browse'), href: agentsHref(DEFAULT_FILTERS) }}
				/>
			);
		}
		return (
			<>
				<Box component="ul" aria-label={t(`saved:${kind}.title`)} sx={{ ...gridSx, m: 0, p: 0, listStyle: 'none' }}>
					{agents.map((agent) => (
						<li key={agent._id}>
							<AgentCard agent={agent} />
						</li>
					))}
				</Box>
				<Pagination page={page} count={Math.ceil(total / SAVED_PAGE_SIZE)} onChange={setPage} />
			</>
		);
	};

	return (
		<Stack spacing={6}>
			<div>
				<Typography variant="h1">{t(`saved:${kind}.title`)}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{t(`saved:${kind}.subtitle`)}</Typography>
			</div>
			{body()}
		</Stack>
	);
};
