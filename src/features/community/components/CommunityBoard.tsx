import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Chip, InputAdornment, OutlinedInput, Skeleton, Stack, Typography } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { radiusPx } from '@/theme/tokens';
import { ArticlesListQuery } from '../graphql/articles';
import { useArticleFilters } from '../hooks/useArticleFilters';
import { ARTICLES_PAGE_SIZE, ARTICLE_CATEGORIES, ARTICLE_SEARCH_MAX, NEW_ARTICLE_PATH, articlesListVariables } from '../lib/articles';
import { ArticleList } from './ArticleCard';

// The socket only ever runs in the browser; its UI isn't needed for the first paint.
const CommunityChat = dynamic(() => import('./chat/CommunityChat').then((mod) => mod.CommunityChat), {
	ssr: false,
	loading: () => <Skeleton variant="rounded" height={460} aria-hidden="true" />,
});

const SEARCH_DEBOUNCE_MS = 400;

const SearchBox = ({ value, onApply }: { value: string; onApply: (text: string) => void }) => {
	const { t } = useTranslation('community');
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
			sx={{ width: { xs: '100%', sm: 280 } }}
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
				placeholder={t('community:list.searchPlaceholder')}
				fullWidth
				startAdornment={
					<InputAdornment position="start">
						<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
					</InputAdornment>
				}
				inputProps={{ 'aria-label': t('community:list.searchLabel'), maxLength: ARTICLE_SEARCH_MAX, enterKeyHint: 'search' }}
				sx={{ height: 42, borderRadius: radiusPx.md, bgcolor: 'surface', fontSize: 14 }}
			/>
		</Box>
	);
};

/** /community: articles with category + search filters on the left, the public chat on the right. */
export const CommunityBoard = () => {
	const { t } = useTranslation('community');
	const { status } = useAuth();
	const { filters, update, pageHref } = useArticleFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => articlesListVariables(filters), [filters]);
	const { data, loading, error, refetch } = useQuery(ArticlesListQuery, { variables });
	const articles = data?.getBoardArticles.list ?? [];
	const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;

	const chip = (label: string, selected: boolean, onClick: () => void) => (
		<Chip
			component="button"
			label={label}
			onClick={onClick}
			aria-pressed={selected}
			sx={{
				bgcolor: selected ? 'primary.main' : 'accentSoft',
				color: selected ? 'primary.contrastText' : 'primary.main',
				fontWeight: 700,
				fontSize: 12,
				border: 0,
				'&:hover': { bgcolor: selected ? 'accentHover' : 'accentBorder' },
			}}
		/>
	);

	const results = () => {
		if (routeLoading || (loading && !data)) {
			return (
				<Stack spacing={3} role="status" aria-busy="true" aria-label={t('community:list.loading')}>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} variant="rounded" height={120} aria-hidden="true" />
					))}
				</Stack>
			);
		}
		if (error && !data) return <ErrorState error={error} title={t('community:list.errorTitle')} onRetry={() => void refetch()} />;
		if (articles.length === 0) {
			if (total > 0) return <EmptyState title={t('community:empty.pageTitle')} action={{ label: t('community:empty.firstPage'), href: pageHref(1) }} />;
			if (filters.category || filters.text) {
				return (
					<EmptyState
						icon={<SearchOffIcon />}
						title={t('community:empty.noResultsTitle')}
						action={{ label: t('community:empty.clear'), onClick: () => void update({ category: null, text: '' }) }}
					/>
				);
			}
			return (
				<EmptyState
					title={t('community:empty.noneTitle')}
					text={t('community:empty.noneText')}
					action={status === 'member' ? { label: t('community:list.write'), href: NEW_ARTICLE_PATH } : undefined}
				/>
			);
		}
		return (
			<>
				<ArticleList articles={articles} label={t('community:list.resultsLabel')} />
				<Pagination page={filters.page} count={Math.ceil(total / ARTICLES_PAGE_SIZE)} getHref={pageHref} />
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
				<Box>
					<Typography variant="h1">{t('community:list.title')}</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('community:list.subtitle')}</Typography>
				</Box>
				{status !== 'loading' && (
					<Button component={NextLink} href={NEW_ARTICLE_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
						{t('community:list.write')}
					</Button>
				)}
			</Box>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
				<Box sx={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
						<Box component="ul" aria-label={t('community:list.categoriesLabel')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}>
							<li>{chip(t('community:list.all'), filters.category === null, () => void update({ category: null }))}</li>
							{ARTICLE_CATEGORIES.map((category) => (
								<li key={category}>{chip(t(`community:categories.${category}`), filters.category === category, () => void update({ category }))}</li>
							))}
						</Box>
						<SearchBox value={filters.text} onApply={(text) => void update({ text })} />
					</Box>
					{results()}
				</Box>
				<Box component="aside" sx={{ flex: '1 1 320px', minWidth: 0, position: { md: 'sticky' }, top: { md: 88 } }}>
					<CommunityChat />
				</Box>
			</Box>
		</Box>
	);
};
