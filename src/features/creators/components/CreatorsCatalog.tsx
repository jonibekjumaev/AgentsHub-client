import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@apollo/client';
import { Box, InputAdornment, NativeSelect, OutlinedInput, Typography } from '@mui/material';
import { Search as SearchIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { Trans, useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { CardSkeleton } from '@/shared/ui/Skeletons';
import { radiusPx } from '@/theme/tokens';
import { CreatorsListQuery } from '../graphql/creators';
import { useCreatorFilters } from '../hooks/useCreatorFilters';
import { CREATORS_PAGE_SIZE, CREATOR_SEARCH_MAX, CREATOR_SORTS, creatorsListVariables, type CreatorSort } from '../lib/creatorsQuery';
import { CreatorCard } from './CreatorCard';

const SEARCH_DEBOUNCE_MS = 400;
const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 5 } as const;
const controlSx = { height: 42, borderRadius: radiusPx.md, bgcolor: 'surface', fontSize: 14 } as const;

const SearchBox = ({ value, onApply }: { value: string; onApply: (text: string) => void }) => {
	const { t } = useTranslation('creators');
	const [text, setText] = useState(value);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	const applied = useRef(value);

	useEffect(() => {
		if (value === applied.current) return;
		applied.current = value;
		clearTimeout(timer.current);
		setText(value);
	}, [value]);
	useEffect(() => () => clearTimeout(timer.current), []);

	const apply = (next: string) => {
		clearTimeout(timer.current);
		const trimmed = next.trim();
		if (trimmed === value) return;
		applied.current = trimmed;
		onApply(trimmed);
	};

	return (
		<Box
			component="form"
			role="search"
			onSubmit={(event: FormEvent) => {
				event.preventDefault();
				apply(text);
			}}
			sx={{ width: { xs: '100%', sm: 300 } }}
		>
			<OutlinedInput
				type="search"
				value={text}
				onChange={(event) => {
					const next = event.target.value;
					setText(next);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => apply(next), SEARCH_DEBOUNCE_MS);
				}}
				placeholder={t('creators:list.searchPlaceholder')}
				fullWidth
				startAdornment={
					<InputAdornment position="start">
						<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
					</InputAdornment>
				}
				inputProps={{ 'aria-label': t('creators:list.searchLabel'), maxLength: CREATOR_SEARCH_MAX, enterKeyHint: 'search' }}
				sx={controlSx}
			/>
		</Box>
	);
};

/** /creators (Creators.html): search, sort, cards, pagination. */
export const CreatorsCatalog = () => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const sortId = useId();
	const { filters, update, pageHref } = useCreatorFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => creatorsListVariables(filters), [filters]);
	const { data, loading, error, refetch } = useQuery(CreatorsListQuery, { variables });

	const creators = data?.getCreators.list ?? [];
	const total = data?.getCreators.metaCounter?.[0]?.total ?? 0;
	const busy = routeLoading || (loading && !data);

	const results = () => {
		if (busy) {
			return (
				<Box role="status" aria-busy="true" aria-label={t('creators:list.loading')} sx={gridSx}>
					{Array.from({ length: 6 }, (_, index) => (
						<CardSkeleton key={index} />
					))}
				</Box>
			);
		}
		if (error && !data) return <ErrorState error={error} title={t('creators:list.errorTitle')} onRetry={() => void refetch()} />;
		if (creators.length === 0) {
			if (total > 0) {
				return <EmptyState title={t('creators:empty.pageTitle')} action={{ label: t('creators:empty.firstPage'), href: pageHref(1) }} />;
			}
			if (filters.text) {
				return (
					<EmptyState
						icon={<SearchOffIcon />}
						title={t('creators:empty.noResultsTitle')}
						text={t('creators:empty.noResultsText')}
						action={{ label: t('creators:empty.clear'), onClick: () => void update({ text: '' }) }}
					/>
				);
			}
			return <EmptyState title={t('creators:empty.noneTitle')} text={t('creators:empty.noneText')} />;
		}
		return (
			<>
				<Box component="ul" aria-label={t('creators:list.resultsLabel')} sx={{ ...gridSx, m: 0, p: 0, listStyle: 'none' }}>
					{creators.map((creator, index) => (
						<li key={creator._id}>
							<CreatorCard
								creator={creator}
								// Positions only make sense in rank order, and without a search narrowing the list.
								position={filters.sort === 'rank' && !filters.text ? (filters.page - 1) * CREATORS_PAGE_SIZE + index + 1 : undefined}
							/>
						</li>
					))}
				</Box>
				<Pagination page={filters.page} count={Math.ceil(total / CREATORS_PAGE_SIZE)} getHref={pageHref} />
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
				<Box>
					<Typography variant="h1">{t('creators:list.title')}</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('creators:list.subtitle')}</Typography>
				</Box>
				<Typography role="status" variant="body2" sx={{ color: 'muted', minHeight: '1.55em', '& strong': { color: 'ink' } }}>
					{!busy && total > 0 && (
						<Trans t={t} i18nKey="creators:list.count" count={total} values={{ formatted: format.number(total) }} components={{ strong: <strong /> }} />
					)}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
				<SearchBox value={filters.text} onApply={(text) => void update({ text })} />
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography component="label" htmlFor={sortId} variant="body2" sx={{ color: 'muted' }}>
						{t('creators:list.sortLabel')}
					</Typography>
					<NativeSelect
						id={sortId}
						value={filters.sort}
						onChange={(event) => void update({ sort: event.target.value as CreatorSort })}
						input={<OutlinedInput sx={{ ...controlSx, fontWeight: 600 }} />}
					>
						{CREATOR_SORTS.map((sort) => (
							<option key={sort} value={sort}>
								{t(`creators:list.sort.${sort}`)}
							</option>
						))}
					</NativeSelect>
				</Box>
			</Box>
			{results()}
		</Box>
	);
};
