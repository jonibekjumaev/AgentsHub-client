import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, ButtonBase, Skeleton, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { newBriefHref } from '@/features/briefs';
import { useFormat } from '@/shared/lib/format';
import { useRefetchForMember } from '@/shared/lib/useRefetchForMember';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { ErrorState } from '@/shared/ui/ErrorState';
import { LoadMore, outlineButtonSx } from '@/shared/ui/catalog';
import { fonts, home } from '@/theme/tokens';
import { AgentsCatalogQuery, ProductFacetsQuery } from '../graphql/agents';
import { useAgentFilters } from '../hooks/useAgentFilters';
import { AGENTS_FIRST_SHOWN, AGENTS_PAGE_SIZE, agentFacetsVariables, agentsListVariables } from '../lib/listQuery';
import { ActiveFilters } from './ActiveFilters';
import { CatalogCard, CatalogRow } from './catalog/CatalogCards';
import { FilterToolbar, type FacetCounts } from './catalog/FilterToolbar';
import { SearchHero } from './catalog/SearchHero';

/** One rounded block the size of a result, so the layout does not jump when the results arrive. */
const SkeletonCard = ({ list }: { list: boolean }) => (
	<Skeleton variant="rounded" height={list ? 96 : 400} aria-hidden="true" sx={{ borderRadius: list ? '18px' : home.radius.card }} />
);

/** 3 columns → 2 under 1024px → 1 under 640px. */
const gridSx = {
	m: 0,
	p: 0,
	listStyle: 'none',
	display: 'grid',
	gap: 5,
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	'@media (max-width: 1024px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	'@media (max-width: 640px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
	'& > li': { minWidth: 0 },
} as const;

const listSx = { m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2.5 } as const;

/** The last grid tile: briefs are the way to get an agent that doesn't exist yet. */
const BriefTile = ({ text }: { text: string }) => {
	const { t } = useTranslation('agents');
	return (
		<Box
			sx={{
				height: '100%',
				minHeight: 220,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				gap: 3,
				p: 7,
				borderRadius: home.radius.card,
				border: `1.5px dashed ${home.dashedBorder}`,
				bgcolor: 'surface',
			}}
		>
			<Typography variant="h2" sx={{ fontSize: 24, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' }}>
				{t('agents:briefCta.title')}
			</Typography>
			<Typography sx={{ fontSize: 15, lineHeight: 1.5, color: 'bodySoft' }}>{t('agents:briefCta.text')}</Typography>
			<Button component={NextLink} href={newBriefHref(text)} sx={{ alignSelf: 'flex-start', minHeight: 44, px: 4.5, borderRadius: '11px' }}>
				{t('agents:briefCta.action')}
			</Button>
		</Box>
	);
};

/**
 * /agents (agentshub-agents design): dark search band, sticky filter toolbar with live counts (D-43),
 * the result summary with removable chips, then a grid or list of 20 per page. The first 9 show at once,
 * "Show more" opens the rest of the page, then numbered pages follow. Filters and layout live in the URL.
 */
export const AgentsCatalog = () => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const { status } = useAuth();
	const { filters, view, update, clear, setView, pageHref } = useAgentFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => agentsListVariables(filters), [filters]);
	const facetVariables = useMemo(() => agentFacetsVariables(filters), [filters]);

	const { data, loading, error, refetch } = useQuery(AgentsCatalogQuery, { variables });
	// The server render has no token, so its meLiked is empty: a member asks once more with the token.
	const member = status === 'member';
	useRefetchForMember(member, refetch);
	const facets = useQuery(ProductFacetsQuery, { variables: facetVariables });
	const everything = useQuery(ProductFacetsQuery, { variables: { input: {} } });

	// "Show more" opens the rest of this page; any new result set starts collapsed again.
	const resultKey = JSON.stringify(variables);
	const [expandedFor, setExpandedFor] = useState<string | null>(null);
	const expanded = expandedFor === resultKey;

	const counts: FacetCounts = facets.data
		? {
				categories: Object.fromEntries(facets.data.getProductFacets.categories.map(({ value, count }) => [value, count])),
				pricing: Object.fromEntries(facets.data.getProductFacets.pricing.map(({ value, count }) => [value, count])),
			}
		: null;
	const allAgents = everything.data ? everything.data.getProductFacets.categories.reduce((sum, { count }) => sum + count, 0) : null;

	const agents = data?.getProducts.list ?? [];
	const total = data?.getProducts.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / AGENTS_PAGE_SIZE);
	const visible = expanded ? agents : agents.slice(0, AGENTS_FIRST_SHOWN);
	const hidden = agents.length - visible.length;
	const shownUpTo = (filters.page - 1) * AGENTS_PAGE_SIZE + visible.length;
	const showSkeleton = routeLoading || (loading && !data);
	const likesReady = !(member && loading);

	const renderResults = () => {
		if (showSkeleton) {
			return (
				<Box role="status" aria-busy="true" aria-label={t('agents:list.loading')} sx={view === 'list' ? listSx : gridSx}>
					{Array.from({ length: view === 'list' ? 4 : 6 }, (_, index) => (
						<SkeletonCard key={index} list={view === 'list'} />
					))}
				</Box>
			);
		}
		if (error && !data) {
			return <ErrorState error={error} title={t('agents:list.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (agents.length === 0 && total > 0) {
			// A page number past the end (an old link): back to page 1.
			return (
				<Box sx={{ textAlign: 'center', py: 10 }}>
					<Typography variant="h2" sx={{ fontSize: 26 }}>
						{t('agents:empty.pageTitle')}
					</Typography>
					<Button component={NextLink} href={pageHref(1)} sx={{ mt: 4 }}>
						{t('agents:empty.firstPage')}
					</Button>
				</Box>
			);
		}
		if (agents.length === 0) {
			return (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 3.5,
						px: 6,
						py: 18,
						textAlign: 'center',
						borderRadius: home.radius.panel,
						bgcolor: 'surface',
						border: `1.5px dashed ${home.dashedBorder}`,
					}}
				>
					<Box aria-hidden="true" sx={{ width: 60, height: 60, display: 'grid', placeItems: 'center', borderRadius: '18px', bgcolor: 'accentSoft', color: 'primary.main' }}>
						<SearchOffIcon sx={{ fontSize: 28 }} />
					</Box>
					<Typography variant="h2" sx={{ fontSize: 30, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.025em' }}>
						{t('agents:empty.title')}
					</Typography>
					<Typography sx={{ maxWidth: 460, fontSize: 16, lineHeight: 1.55, color: 'bodySoft' }}>{t('agents:empty.text')}</Typography>
					<Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}>
						<Button component={NextLink} href={newBriefHref(filters.text)} sx={{ minHeight: 48, px: 5.5, borderRadius: home.radius.button }}>
							{filters.text ? t('agents:empty.briefFor', { text: filters.text }) : t('agents:briefCta.action')}
						</Button>
						<ButtonBase onClick={() => void clear()} sx={outlineButtonSx}>
							{t('agents:empty.clearAll')}
						</ButtonBase>
					</Box>
				</Box>
			);
		}

		const Item = view === 'list' ? CatalogRow : CatalogCard;
		return (
			<>
				{/* A new key per result set replays the entrance animation. */}
				<Box key={`${resultKey}-${view}`} component="ul" aria-label={t('agents:list.resultsLabel')} sx={view === 'list' ? listSx : gridSx}>
					{visible.map((agent, index) => (
						<li key={agent._id}>
							<Item agent={agent} index={index} likesReady={likesReady} />
						</li>
					))}
					{hidden === 0 && view === 'grid' && (
						<li>
							<BriefTile text={filters.text} />
						</li>
					)}
				</Box>
				{hidden === 0 && view === 'list' && <BriefTile text={filters.text} />}

				<LoadMore
					showingLabel={t('agents:catalog.showing', { shown: format.number(shownUpTo), total: format.number(total) })}
					shown={shownUpTo}
					total={total}
					hidden={hidden}
					showMoreLabel={t('agents:catalog.showMore', { count: hidden })}
					onShowMore={() => setExpandedFor(resultKey)}
					page={filters.page}
					pageCount={pageCount}
					getHref={pageHref}
				/>
			</>
		);
	};

	return (
		<>
			<SearchHero filters={filters} onChange={update} total={allAgents} />
			<FilterToolbar filters={filters} onChange={update} counts={counts} view={view} onView={(next) => void setView(next)} />
			<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 7, pb: 24, display: 'flex', flexDirection: 'column', gap: 5.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 3.5, rowGap: 2.5 }}>
					{/* Announced politely after every change; empty while loading. */}
					<Typography role="status" aria-live="polite" sx={{ fontSize: 16, color: 'bodySoft', minHeight: '1.5em' }}>
						{!showSkeleton && data && (
							<>
								<Box component="b" sx={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: '-0.02em', color: 'ink' }}>
									{format.number(total)}
								</Box>{' '}
								{filters.text
									? t('agents:catalog.resultsFor', { count: total, text: filters.text })
									: t('agents:catalog.results', { count: total })}
							</>
						)}
					</Typography>
					<ActiveFilters filters={filters} onChange={update} onClear={() => void clear()} />
				</Box>
				{renderResults()}
			</Box>
		</>
	);
};
