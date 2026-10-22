import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { Trans, useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { RowSkeleton } from '@/shared/ui/Skeletons';
import { BriefsListQuery } from '../graphql/briefs';
import { useBriefFilters } from '../hooks/useBriefFilters';
import { BRIEFS_PAGE_SIZE, briefsListVariables, hasActiveBriefFilters } from '../lib/listQuery';
import { BriefRow } from './BriefRow';
import { BriefsToolbar } from './BriefsToolbar';

const ListSkeleton = () => {
	const { t } = useTranslation('briefs');
	return (
		<Box role="status" aria-busy="true" aria-label={t('briefs:list.loading')} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
			{Array.from({ length: 4 }, (_, index) => (
				<RowSkeleton key={index} />
			))}
		</Box>
	);
};

/** /briefs (Briefs.html): every state comes from the URL filters and one list query. */
export const BriefsCatalog = () => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const { filters, update, clear, pageHref } = useBriefFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => briefsListVariables(filters), [filters]);
	const { data, loading, error, refetch } = useQuery(BriefsListQuery, { variables });

	const filtered = hasActiveBriefFilters(filters);
	const briefs = data?.getBriefs.list ?? [];
	const total = data?.getBriefs.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / BRIEFS_PAGE_SIZE);
	const sortsByOptional = filters.sort === 'budget-desc' || filters.sort === 'budget-asc' || filters.sort === 'deadline';

	const renderResults = () => {
		if (routeLoading || (loading && !data)) return <ListSkeleton />;
		if (error && !data) {
			return <ErrorState error={error} title={t('briefs:list.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (briefs.length === 0) {
			if (total > 0) {
				return (
					<EmptyState
						title={t('briefs:empty.pageTitle')}
						text={t('briefs:empty.pageText')}
						action={{ label: t('briefs:empty.firstPage'), href: pageHref(1) }}
					/>
				);
			}
			if (filtered) {
				return (
					<EmptyState
						icon={<SearchOffIcon />}
						title={t('briefs:empty.noResultsTitle')}
						text={t('briefs:empty.noResultsText')}
						action={{ label: t('briefs:empty.clearFilters'), onClick: () => void clear() }}
					/>
				);
			}
			return filters.tab === 'closed' ? (
				<EmptyState title={t('briefs:empty.noClosedTitle')} text={t('briefs:empty.noClosedText')} />
			) : (
				<EmptyState title={t('briefs:empty.noOpenTitle')} text={t('briefs:empty.noOpenText')} />
			);
		}

		return (
			<>
				<Box
					component="ul"
					aria-label={t('briefs:list.resultsLabel')}
					sx={{ display: 'flex', flexDirection: 'column', gap: 3, m: 0, p: 0, listStyle: 'none' }}
				>
					{briefs.map((brief) => (
						<li key={brief._id}>
							<BriefRow brief={brief} />
						</li>
					))}
				</Box>
				{sortsByOptional && (
					<Typography variant="caption" component="p">
						{t('briefs:list.optionalLast')}
					</Typography>
				)}
				<Pagination page={filters.page} count={pageCount} getHref={pageHref} />
			</>
		);
	};

	const showCount = Boolean(data) && !routeLoading && !(loading && !data) && total > 0;

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			<BriefsToolbar filters={filters} onChange={update} />
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				{/* Announced politely after every filter change; empty while loading. */}
				<Typography role="status" variant="body2" sx={{ color: 'muted', minHeight: '1.55em', '& strong': { color: 'ink' } }}>
					{showCount && (
						<Trans
							t={t}
							i18nKey={filters.tab === 'closed' ? 'briefs:list.countClosed' : 'briefs:list.countOpen'}
							count={total}
							values={{ formatted: format.number(total) }}
							components={{ strong: <strong /> }}
						/>
					)}
				</Typography>
				{renderResults()}
			</Box>
		</Box>
	);
};
