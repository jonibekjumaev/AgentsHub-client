import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, ButtonBase, Link, Typography } from '@mui/material';
import { DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { useFormat } from '@/shared/lib/format';
import { useRefetchForMember } from '@/shared/lib/useRefetchForMember';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { AppliedChips, LoadMore, focusVisibleSx, outlineButtonSx, type AppliedChip } from '@/shared/ui/catalog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { briefFeed, fonts, home } from '@/theme/tokens';
import { BriefFacetsQuery, BriefsListQuery, OpenBriefStatsQuery } from '../graphql/briefs';
import { useBriefFilters } from '../hooks/useBriefFilters';
import {
	BRIEFS_FIRST_SHOWN,
	BRIEFS_PAGE_SIZE,
	briefFacetsVariables,
	briefFacetsWithPastVariables,
	briefsListVariables,
	hasActiveBriefFilters,
} from '../lib/listQuery';
import { NEW_BRIEF_PATH, canPostBrief, newBriefHref } from '../lib/myBriefs';
import { BriefFeedRow } from './feed/BriefFeedRow';
import { BriefFilterBar, type BriefFacetCounts } from './feed/BriefFilterBar';
import { FeedSkeleton, feedSx } from './feed/FeedList';
import { BriefsHero } from './feed/BriefsHero';

/** The last row of the feed: briefs are how a business gets an agent built. */
const PostBriefRow = () => {
	const { t } = useTranslation('briefs');
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 6, rowGap: 3.5, px: 7, py: 5.5, bgcolor: briefFeed.rowHover }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
				<Typography variant="h2" sx={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>
					{t('briefs:feed.cta.title')}
				</Typography>
				<Typography sx={{ fontSize: 15, color: 'bodySoft' }}>{t('briefs:feed.cta.text')}</Typography>
			</Box>
			<Button component={NextLink} href={NEW_BRIEF_PATH} sx={{ minHeight: 44, px: 5, borderRadius: home.radius.button }}>
				{t('briefs:list.post')}
			</Button>
		</Box>
	);
};

/**
 * /briefs (agentshub-briefs design): the dark search band with the live badge, the sticky filter bar with live
 * counts (D-44), the result summary with removable chips, then an Upwork-style feed of 20 per page. The first 9
 * show at once, "Show more" opens the rest of the page, then numbered pages follow. Filters live in the URL.
 */
export const BriefsCatalog = () => {
	const { t } = useTranslation(['briefs', 'common']);
	const format = useFormat();
	const { status, me } = useAuth();
	const { filters, update, clear, pageHref } = useBriefFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => briefsListVariables(filters), [filters]);
	const facetVariables = useMemo(() => briefFacetsVariables(filters), [filters]);
	const withPastVariables = useMemo(() => briefFacetsWithPastVariables(filters), [filters]);
	// One clock for every row of a render: the deadline labels agree with each other.
	const [now] = useState(() => new Date());

	const { data, loading, error, refetch } = useQuery(BriefsListQuery, { variables });
	// The server render has no token, so its meSaved is null (D-47): a member asks once more with the token.
	useRefetchForMember(status === 'member', refetch);
	const facets = useQuery(BriefFacetsQuery, { variables: facetVariables });
	const withPast = useQuery(BriefFacetsQuery, { variables: withPastVariables ?? facetVariables, skip: !withPastVariables });
	const stats = useQuery(OpenBriefStatsQuery);

	// "Show more" opens the rest of this page; any new result set starts collapsed again.
	const resultKey = JSON.stringify(variables);
	const [expandedFor, setExpandedFor] = useState<string | null>(null);
	const expanded = expandedFor === resultKey;

	const counts: BriefFacetCounts = facets.data
		? {
				categories: Object.fromEntries(facets.data.getBriefFacets.categories.map(({ value, count }) => [value, count])),
				budgetTypes: Object.fromEntries(facets.data.getBriefFacets.budgetTypes.map(({ value, count }) => [value, count])),
				statuses: Object.fromEntries(facets.data.getBriefFacets.statuses.map(({ value, count }) => [value, count])),
			}
		: null;
	const openCount = (result: typeof facets.data) => result?.getBriefFacets.statuses.find((facet) => facet.value === 'OPEN')?.count;
	const shownOpen = openCount(facets.data);
	const allOpen = openCount(withPast.data);
	const hiddenPast = withPastVariables && shownOpen !== undefined && allOpen !== undefined ? Math.max(0, allOpen - shownOpen) : 0;

	const canPost = canPostBrief(status, me?.memberType);
	const guest = status === 'guest';
	const filtered = hasActiveBriefFilters(filters);
	const briefs = data?.getBriefs.list ?? [];
	const total = data?.getBriefs.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / BRIEFS_PAGE_SIZE);
	const visible = expanded ? briefs : briefs.slice(0, BRIEFS_FIRST_SHOWN);
	const hidden = briefs.length - visible.length;
	const shownUpTo = (filters.page - 1) * BRIEFS_PAGE_SIZE + visible.length;
	const showSkeleton = routeLoading || (loading && !data);

	const chips: AppliedChip[] = [
		...(filters.text ? [{ key: 'text', label: `“${filters.text}”`, onRemove: () => void update({ text: '' }) }] : []),
		...filters.categories.map((category) => ({
			key: `category-${category}`,
			label: t(`common:enums.AgentCategory.${category}`),
			onRemove: () => void update({ categories: filters.categories.filter((item) => item !== category) }),
		})),
		...filters.budgetTypes.map((type) => ({
			key: `budget-${type}`,
			label: t(`briefs:feed.budgetType.${type}`),
			onRemove: () => void update({ budgetTypes: filters.budgetTypes.filter((item) => item !== type) }),
		})),
	];

	const renderResults = () => {
		if (showSkeleton) return <FeedSkeleton />;
		if (error && !data) {
			return <ErrorState error={error} title={t('briefs:list.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (briefs.length === 0 && total > 0) {
			// A page number past the end (an old link): back to page 1.
			return (
				<Box sx={{ textAlign: 'center', py: 10 }}>
					<Typography variant="h2" sx={{ fontSize: 26 }}>
						{t('briefs:empty.pageTitle')}
					</Typography>
					<Button component={NextLink} href={pageHref(1)} sx={{ mt: 4 }}>
						{t('briefs:empty.firstPage')}
					</Button>
				</Box>
			);
		}
		if (briefs.length === 0) {
			const closedTab = filters.tab === 'closed' && !filtered;
			const openTab = filters.tab === 'open' && !filtered;
			const key = closedTab ? 'closed' : openTab ? 'open' : 'noMatch';
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
						<DescriptionOutlinedIcon sx={{ fontSize: 28 }} />
					</Box>
					<Typography variant="h2" sx={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.025em' }}>
						{t(`briefs:feed.empty.${key}.title`)}
					</Typography>
					<Typography sx={{ maxWidth: 460, fontSize: 16, lineHeight: 1.55, color: 'bodySoft' }}>{t(`briefs:feed.empty.${key}.text`)}</Typography>
					{!closedTab && (canPost || filtered) && (
						<Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}>
							{canPost && (
								<Button component={NextLink} href={newBriefHref(filters.text)} sx={{ minHeight: 48, px: 5.5, borderRadius: home.radius.button }}>
									{filters.text ? t('briefs:feed.empty.briefFor', { text: filters.text }) : t('briefs:list.post')}
								</Button>
							)}
							{filtered && (
								<ButtonBase onClick={() => void clear()} sx={outlineButtonSx}>
									{t('briefs:feed.empty.clearAll')}
								</ButtonBase>
							)}
						</Box>
					)}
				</Box>
			);
		}

		return (
			<>
				{/* A new key per result set replays the entrance animation. */}
				<Box key={resultKey} component="ol" aria-label={t('briefs:list.resultsLabel')} sx={feedSx}>
					{visible.map((brief, index) => (
						<li key={brief._id}>
							<BriefFeedRow brief={brief} index={index} guest={guest} now={now} />
						</li>
					))}
					{hidden === 0 && canPost && (
						<li>
							<PostBriefRow />
						</li>
					)}
				</Box>
				<LoadMore
					showingLabel={t('briefs:feed.showing', { shown: format.number(shownUpTo), total: format.number(total) })}
					shown={shownUpTo}
					total={total}
					hidden={hidden}
					showMoreLabel={t('briefs:feed.showMore', { count: hidden })}
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
			<BriefsHero filters={filters} onChange={update} stats={stats.data?.getOpenBriefStats} canPost={canPost} />
			<BriefFilterBar filters={filters} onChange={update} counts={counts} />
			<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 7, pb: 24, display: 'flex', flexDirection: 'column', gap: 5.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 3.5, rowGap: 2.5 }}>
					{/* Announced politely after every change; empty while loading. */}
					<Typography role="status" aria-live="polite" sx={{ fontSize: 16, color: 'bodySoft', minHeight: '1.5em' }}>
						{!showSkeleton && data && (
							<>
								<Box component="b" sx={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: '-0.02em', color: 'ink' }}>
									{format.number(total)}
								</Box>{' '}
								{t(`briefs:feed.results.${filters.tab}`, { count: total })}
								{filters.text && ` ${t('briefs:feed.results.for', { text: filters.text })}`}
							</>
						)}
					</Typography>
					<AppliedChips
						chips={chips}
						onClear={() => void clear()}
						labels={{ remove: (label) => t('briefs:feed.filters.remove', { label }), clearAll: t('briefs:feed.filters.clearAll') }}
					/>
					{hiddenPast > 0 && (
						<Link
							component="button"
							type="button"
							onClick={() => void update({ hidePast: false })}
							underline="always"
							sx={{ minHeight: 34, px: 1, fontSize: 13, fontWeight: 600, color: 'muted', ...focusVisibleSx }}
						>
							{t('briefs:feed.hiddenPast', { count: hiddenPast })}
						</Link>
					)}
				</Box>
				{renderResults()}
			</Box>
		</>
	);
};
