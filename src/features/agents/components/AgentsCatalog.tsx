import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon, Tune as TuneIcon } from '@mui/icons-material';
import { Trans, useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { useFormat } from '@/shared/lib/format';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { CardSkeleton } from '@/shared/ui/Skeletons';
import { radiusPx } from '@/theme/tokens';
import { AgentsListQuery } from '../graphql/agents';
import { useAgentFilters } from '../hooks/useAgentFilters';
import { AGENTS_PAGE_SIZE, activeFilterCount, agentsListVariables, hasActiveFilters } from '../lib/listQuery';
import { ActiveFilters } from './ActiveFilters';
import { AgentCard } from './AgentCard';
import { AgentFiltersPanel } from './AgentFiltersPanel';
import { AgentsToolbar } from './AgentsToolbar';

// Below md only, after a click: Drawer + Modal stay out of the page chunk.
const FiltersDrawer = dynamic(() => import('./FiltersDrawer').then((mod) => mod.FiltersDrawer), { ssr: false });

const POST_BRIEF_HREF = '/dashboard/briefs/new';

const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 5 } as const;

const ListSkeleton = () => {
	const { t } = useTranslation('agents');
	return (
		<Box role="status" aria-busy="true" aria-label={t('agents:list.loading')} sx={gridSx}>
			{Array.from({ length: 6 }, (_, index) => (
				<CardSkeleton key={index} />
			))}
		</Box>
	);
};

/** Briefs are posted by USERs: guests see it too (login first), creators and admins don't (DESIGN §3). */
const BriefCta = () => {
	const { t } = useTranslation('agents');
	const { status, me } = useAuth();
	const visible = status === 'guest' || (status === 'member' && me?.memberType === 'USER');
	if (!visible) return null;

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 2.5,
				py: 8,
				px: 5,
				textAlign: 'center',
				bgcolor: 'surface',
				border: '1px dashed',
				borderColor: 'inputBorder',
				borderRadius: radiusPx.lg,
			}}
		>
			<Typography component="h2" sx={{ fontWeight: 800 }}>
				{t('agents:briefCta.title')}
			</Typography>
			<Typography variant="body2" sx={{ color: 'muted' }}>
				{t('agents:briefCta.text')}
			</Typography>
			<Button component={NextLink} href={POST_BRIEF_HREF} sx={{ height: 40 }}>
				{t('agents:briefCta.action')}
			</Button>
		</Box>
	);
};

/** /agents: toolbar, filters, results. Every state comes from the URL filters and one list query. */
export const AgentsCatalog = () => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const { filters, update, clear, pageHref } = useAgentFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => agentsListVariables(filters), [filters]);
	const { data, loading, error, refetch } = useQuery(AgentsListQuery, { variables });
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerLoaded, setDrawerLoaded] = useState(false);
	const filterCount = activeFilterCount(filters);

	const filtered = hasActiveFilters(filters);
	const agents = data?.getProducts.list ?? [];
	const total = data?.getProducts.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / AGENTS_PAGE_SIZE);

	const renderResults = () => {
		if (routeLoading || (loading && !data)) return <ListSkeleton />;
		if (error && !data) {
			return <ErrorState error={error} title={t('agents:list.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (agents.length === 0) {
			if (total > 0) {
				return (
					<EmptyState
						title={t('agents:empty.pageTitle')}
						text={t('agents:empty.pageText')}
						action={{ label: t('agents:empty.firstPage'), href: pageHref(1) }}
					/>
				);
			}
			if (filtered) {
				return (
					<EmptyState
						icon={<SearchOffIcon />}
						title={t('agents:empty.noResultsTitle')}
						text={t('agents:empty.noResultsText')}
						action={{ label: t('agents:empty.clearFilters'), onClick: () => void clear() }}
					/>
				);
			}
			return <EmptyState title={t('agents:empty.noAgentsTitle')} text={t('agents:empty.noAgentsText')} />;
		}

		return (
			<>
				<Box component="ul" aria-label={t('agents:list.resultsLabel')} sx={{ ...gridSx, m: 0, p: 0, listStyle: 'none' }}>
					{agents.map((agent) => (
						<li key={agent._id}>
							<AgentCard agent={agent} />
						</li>
					))}
				</Box>
				<BriefCta />
				<Pagination page={filters.page} count={pageCount} getHref={pageHref} />
			</>
		);
	};

	const showCount = Boolean(data) && !routeLoading && !(loading && !data) && total > 0;

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			<AgentsToolbar filters={filters} onChange={update} />
			<ActiveFilters filters={filters} onChange={update} onClear={() => void clear()} />
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 6 }}>
				<AgentFiltersPanel filters={filters} onChange={update} />
				<Box sx={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
						{/* Announced politely after every filter change; empty while loading. */}
						<Typography role="status" variant="body2" sx={{ color: 'muted', minHeight: '1.55em', '& strong': { color: 'ink' } }}>
							{showCount && (
								<Trans
									t={t}
									i18nKey={filtered ? 'agents:list.countFiltered' : 'agents:list.count'}
									count={total}
									values={{ formatted: format.number(total) }}
									components={{ strong: <strong /> }}
								/>
							)}
						</Typography>
						<Button
							variant="outlined"
							size="small"
							startIcon={<TuneIcon />}
							aria-haspopup="dialog"
							aria-expanded={drawerOpen}
							onClick={() => {
								setDrawerOpen(true);
								setDrawerLoaded(true);
							}}
							sx={{ display: { xs: 'inline-flex', md: 'none' } }}
						>
							{filterCount ? t('agents:filters.openWithCount', { count: filterCount }) : t('agents:filters.open')}
						</Button>
					</Box>
					{renderResults()}
				</Box>
			</Box>
			{drawerLoaded && (
				<FiltersDrawer
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					filters={filters}
					onChange={update}
					onClear={() => void clear()}
				/>
			)}
		</Box>
	);
};
