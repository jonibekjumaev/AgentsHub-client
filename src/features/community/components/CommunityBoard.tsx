import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, ButtonBase, Skeleton, Typography } from '@mui/material';
import { EditOutlined as EditOutlinedIcon, ForumOutlined as ForumOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { useFormat } from '@/shared/lib/format';
import { useRefetchForMember } from '@/shared/lib/useRefetchForMember';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { AppliedChips, LoadMore, outlineButtonSx, type AppliedChip } from '@/shared/ui/catalog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { briefFeed, fonts, home } from '@/theme/tokens';
import { ArticleFacetsQuery, CommunityArticlesQuery, CommunityStatsQuery } from '../graphql/articles';
import { useArticleFilters } from '../hooks/useArticleFilters';
import { useCommunityChat } from '../hooks/useCommunityChat';
import {
	COMMUNITY_FIRST_SHOWN,
	COMMUNITY_PAGE_SIZE,
	NEW_ARTICLE_PATH,
	articleFacetsVariables,
	articlesListVariables,
	hasActiveArticleFilters,
} from '../lib/articles';
import { ActiveWriters } from './feed/ActiveWriters';
import { ArticleFeedRow } from './feed/ArticleFeedRow';
import { CommunityFilterBar, type ArticleFacetCounts } from './feed/CommunityFilterBar';
import { CommunityHero } from './feed/CommunityHero';

// The chat's UI isn't needed for the first paint; the socket itself lives in the page (useCommunityChat).
const CommunityChat = dynamic(() => import('./chat/CommunityChat').then((mod) => mod.CommunityChat), {
	ssr: false,
	loading: () => <Skeleton variant="rounded" height={460} aria-hidden="true" />,
});

/** The one white container of the feed: rows separated by thin dividers (as /briefs). */
const feedSx = {
	m: 0,
	p: 0,
	listStyle: 'none',
	borderRadius: home.radius.card,
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	overflow: 'hidden',
	'& > li + li': { borderTop: `1px solid ${briefFeed.rowDivider}` },
} as const;

const FeedSkeleton = () => {
	const { t } = useTranslation('community');
	return (
		<Box role="status" aria-busy="true" aria-label={t('community:list.loading')} sx={{ ...feedSx, display: 'block' }}>
			{Array.from({ length: 4 }, (_, index) => (
				<Box key={index} sx={{ px: 7, py: 6, display: 'flex', gap: 6, borderTop: index ? `1px solid ${briefFeed.rowDivider}` : 0 }}>
					<Skeleton variant="rounded" width={148} height={111} sx={{ flex: 'none', display: { xs: 'none', sm: 'block' } }} />
					<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						<Skeleton variant="rounded" width={180} height={24} />
						<Skeleton variant="rounded" width="60%" height={28} />
						<Skeleton variant="rounded" width="90%" height={44} />
					</Box>
				</Box>
			))}
		</Box>
	);
};

/** The sidebar's last card: writing is how the board grows. */
const WriteCard = () => {
	const { t } = useTranslation('community');
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 5, borderRadius: home.radius.card, bgcolor: 'accentSoft', border: 1, borderColor: 'accentBorder' }}>
			<Typography variant="h2" sx={{ fontSize: 17 }}>
				{t('community:feed.cta.title')}
			</Typography>
			<Typography sx={{ fontSize: 14, color: 'bodySoft' }}>{t('community:feed.cta.text')}</Typography>
			<Button component={NextLink} href={NEW_ARTICLE_PATH} startIcon={<EditOutlinedIcon />} sx={{ alignSelf: 'flex-start', minHeight: 42, borderRadius: home.radius.button }}>
				{t('community:list.write')}
			</Button>
		</Box>
	);
};

/**
 * /community: the dark search band (as /agents, /briefs, /creators) with the live chat badge, the sticky
 * topic bar with live counts (D-46), then the feed (20 per page, the first 9 at once, "Show more", then
 * pages) next to a sticky sidebar: the chat, "Active writers" and "Write an article". Filters live in the URL.
 */
export const CommunityBoard = () => {
	const { t } = useTranslation('community');
	const format = useFormat();
	const { status } = useAuth();
	const { filters, update, clear, pageHref } = useArticleFilters();
	const routeLoading = useRouteLoading();
	const chat = useCommunityChat();
	const variables = useMemo(() => articlesListVariables(filters), [filters]);
	const facetVariables = useMemo(() => articleFacetsVariables(filters), [filters]);

	const { data, loading, error, refetch } = useQuery(CommunityArticlesQuery, { variables });
	// The server render has no token: a member asks once more for meLiked.
	useRefetchForMember(status === 'member', refetch);
	const facets = useQuery(ArticleFacetsQuery, { variables: facetVariables });
	const stats = useQuery(CommunityStatsQuery);

	// "Show more" opens the rest of this page; any new result set starts collapsed again.
	const resultKey = JSON.stringify(variables);
	const [expandedFor, setExpandedFor] = useState<string | null>(null);
	const expanded = expandedFor === resultKey;

	const counts: ArticleFacetCounts = facets.data
		? {
				categories: Object.fromEntries(facets.data.getArticleFacets.categories.map(({ value, count }) => [value, count])),
				all: facets.data.getArticleFacets.all,
			}
		: null;

	const articles = data?.getBoardArticles.list ?? [];
	const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / COMMUNITY_PAGE_SIZE);
	const visible = expanded ? articles : articles.slice(0, COMMUNITY_FIRST_SHOWN);
	const hidden = articles.length - visible.length;
	const shownUpTo = (filters.page - 1) * COMMUNITY_PAGE_SIZE + visible.length;
	const showSkeleton = routeLoading || (loading && !data);
	const filtered = hasActiveArticleFilters(filters);

	const chips: AppliedChip[] = [
		...(filters.text ? [{ key: 'text', label: `“${filters.text}”`, onRemove: () => void update({ text: '' }) }] : []),
		...(filters.category
			? [{ key: 'category', label: t(`community:categories.${filters.category}`), onRemove: () => void update({ category: null }) }]
			: []),
	];

	const renderResults = () => {
		if (showSkeleton) return <FeedSkeleton />;
		if (error && !data) return <ErrorState error={error} title={t('community:list.errorTitle')} onRetry={() => void refetch()} />;
		if (articles.length === 0 && total > 0) {
			// A page number past the end (an old link): back to page 1.
			return (
				<Box sx={{ textAlign: 'center', py: 10 }}>
					<Typography variant="h2" sx={{ fontSize: 26 }}>
						{t('community:empty.pageTitle')}
					</Typography>
					<Button component={NextLink} href={pageHref(1)} sx={{ mt: 4 }}>
						{t('community:empty.firstPage')}
					</Button>
				</Box>
			);
		}
		if (articles.length === 0) {
			const key = filtered ? 'noMatch' : 'none';
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
						<ForumOutlinedIcon sx={{ fontSize: 28 }} />
					</Box>
					<Typography variant="h2" sx={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.025em' }}>
						{t(`community:feed.empty.${key}.title`)}
					</Typography>
					<Typography sx={{ maxWidth: 460, fontSize: 16, lineHeight: 1.55, color: 'bodySoft' }}>
						{filters.text ? t('community:feed.empty.noMatch.textFor', { text: filters.text }) : t(`community:feed.empty.${key}.text`)}
					</Typography>
					<Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}>
						{status !== 'loading' && (
							<Button component={NextLink} href={NEW_ARTICLE_PATH} sx={{ minHeight: 48, px: 5.5, borderRadius: home.radius.button }}>
								{t('community:list.write')}
							</Button>
						)}
						{filtered && (
							<ButtonBase onClick={() => void clear()} sx={outlineButtonSx}>
								{t('community:feed.clearAll')}
							</ButtonBase>
						)}
					</Box>
				</Box>
			);
		}
		return (
			<>
				{/* A new key per result set replays the entrance animation. */}
				<Box key={resultKey} component="ol" aria-label={t('community:list.resultsLabel')} sx={feedSx}>
					{visible.map((article, index) => (
						<li key={article._id}>
							<ArticleFeedRow article={article} index={index} />
						</li>
					))}
				</Box>
				<LoadMore
					showingLabel={t('community:feed.showing', { shown: format.number(shownUpTo), total: format.number(total) })}
					shown={shownUpTo}
					total={total}
					hidden={hidden}
					showMoreLabel={t('community:feed.showMore', { count: hidden })}
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
			<CommunityHero stats={stats.data?.getCommunityStats} chat={chat} />
			<CommunityFilterBar filters={filters} onChange={update} counts={counts} />
			<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 7, pb: 24, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 8, rowGap: 10 }}>
				<Box sx={{ flex: '999 1 560px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5.5 }}>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 3.5, rowGap: 2.5 }}>
						{/* Announced politely after every change; empty while loading. */}
						<Typography role="status" aria-live="polite" sx={{ fontSize: 16, color: 'bodySoft', minHeight: '1.5em' }}>
							{!showSkeleton && data && (
								<>
									<Box component="b" sx={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: '-0.02em', color: 'ink' }}>
										{format.number(total)}
									</Box>{' '}
									{t('community:feed.results', { count: total })}
									{filters.text && ` ${t('community:feed.resultsFor', { text: filters.text })}`}
								</>
							)}
						</Typography>
						<AppliedChips
							chips={chips}
							onClear={() => void clear()}
							labels={{ remove: (label) => t('community:feed.remove', { label }), clearAll: t('community:feed.clearAll') }}
						/>
					</Box>
					{renderResults()}
				</Box>
				<Box
					component="aside"
					aria-label={t('community:feed.sidebarLabel')}
					// Not sticky: the chat, the writers and the card are taller than a laptop screen, so the bottom would never show.
					sx={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}
				>
					<CommunityChat chat={chat} />
					<ActiveWriters writers={stats.data?.getCommunityStats.topWriters} loading={stats.loading} />
					{status !== 'loading' && <WriteCard />}
				</Box>
			</Box>
		</>
	);
};
