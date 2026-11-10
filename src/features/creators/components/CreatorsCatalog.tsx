import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, ButtonBase, Link, Skeleton, Typography } from '@mui/material';
import { PeopleOutline as PeopleOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { canPostBrief, newBriefHref } from '@/features/briefs';
import { useFormat } from '@/shared/lib/format';
import { useRefetchForMember } from '@/shared/lib/useRefetchForMember';
import { useRouteLoading } from '@/shared/lib/useRouteLoading';
import { AppliedChips, LoadMore, focusVisibleSx, outlineButtonSx, type AppliedChip } from '@/shared/ui/catalog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { fonts, home } from '@/theme/tokens';
import { CreatorFacetsQuery, CreatorsCatalogQuery, CreatorsHeroStatsQuery } from '../graphql/creators';
import { useCreatorFilters } from '../hooks/useCreatorFilters';
import {
	CREATORS_FIRST_SHOWN,
	CREATORS_PAGE_SIZE,
	creatorFacetsVariables,
	creatorsListVariables,
	hasActiveCreatorFilters,
} from '../lib/creatorsQuery';
import { CreatorCard } from './CreatorCard';
import { CreatorFilterBar, type CreatorFacetCounts } from './catalog/CreatorFilterBar';
import { BECOME_CREATOR_HREF, CreatorsHero } from './catalog/CreatorsHero';

/** 3 columns → 2 under 1024px → 1 under 640px; each item stretches so cards in a row line up. */
const gridSx = {
	m: 0,
	p: 0,
	listStyle: 'none',
	display: 'grid',
	gap: 5,
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	'@media (max-width: 1024px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	'@media (max-width: 640px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
	'& > li': { minWidth: 0, display: 'flex' },
} as const;

/** The last grid tile: how a creator joins. */
const BecomeCreatorTile = () => {
	const { t } = useTranslation('creators');
	return (
		<Box
			sx={{
				flex: '1 1 auto',
				minHeight: 220,
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
			<Typography
				variant="h2"
				sx={{ fontFamily: fonts.display, fontSize: 24, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' }}
			>
				{t('creators:become.title')}
			</Typography>
			<Typography sx={{ fontSize: 15, lineHeight: 1.5, color: 'bodySoft' }}>{t('creators:become.text')}</Typography>
			<Button
				component={NextLink}
				href={BECOME_CREATOR_HREF}
				sx={{ alignSelf: 'flex-start', minHeight: 44, px: 4.5, borderRadius: '11px' }}
			>
				{t('creators:become.action')}
			</Button>
		</Box>
	);
};

/**
 * /creators (agentshub-creators design, D-45): the light search band with faces, the sticky filter bar with
 * live counts, the result summary with removable chips, then profile cards, 20 per page. The first 9 show at
 * once, "Show more" opens the rest of the page, then numbered pages follow. Filters live in the URL.
 */
export const CreatorsCatalog = () => {
	const { t } = useTranslation(['creators', 'common']);
	const format = useFormat();
	const { status, me } = useAuth();
	const { filters, update, clear, pageHref } = useCreatorFilters();
	const routeLoading = useRouteLoading();
	const variables = useMemo(() => creatorsListVariables(filters), [filters]);
	const facetVariables = useMemo(() => creatorFacetsVariables(filters), [filters]);

	const { data, loading, error, refetch } = useQuery(CreatorsCatalogQuery, { variables });
	const facets = useQuery(CreatorFacetsQuery, { variables: facetVariables });
	// The server render has no token: meFollowed and the "Following" count are asked once more with it.
	const member = status === 'member';
	useRefetchForMember(member, refetch);
	useRefetchForMember(member, facets.refetch);
	const stats = useQuery(CreatorsHeroStatsQuery);

	// "Show more" opens the rest of this page; any new result set starts collapsed again.
	const resultKey = JSON.stringify(variables);
	const [expandedFor, setExpandedFor] = useState<string | null>(null);
	const expanded = expandedFor === resultKey;

	const counts: CreatorFacetCounts = facets.data
		? {
				categories: Object.fromEntries(
					facets.data.getCreatorFacets.categories.map(({ value, count }) => [value, count]),
				),
				all: facets.data.getCreatorFacets.all,
				following: facets.data.getCreatorFacets.following,
		  }
		: null;
	const hiddenEmpty = facets.data?.getCreatorFacets.withoutAgents ?? 0;

	const canFollow = member && me?.memberType !== 'ADMIN';
	const showBecome = status === 'guest' || (member && me?.memberType === 'USER');
	const canPost = canPostBrief(status, me?.memberType);
	const creators = data?.getCreators.list ?? [];
	const total = data?.getCreators.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / CREATORS_PAGE_SIZE);
	const visible = expanded ? creators : creators.slice(0, CREATORS_FIRST_SHOWN);
	const hidden = creators.length - visible.length;
	const shownUpTo = (filters.page - 1) * CREATORS_PAGE_SIZE + visible.length;
	const showSkeleton = routeLoading || (loading && !data);

	const chips: AppliedChip[] = [
		...(filters.text ? [{ key: 'text', label: `“${filters.text}”`, onRemove: () => void update({ text: '' }) }] : []),
		...filters.categories.map((category) => ({
			key: `category-${category}`,
			label: t(`common:enums.AgentCategory.${category}`),
			onRemove: () => void update({ categories: filters.categories.filter((item) => item !== category) }),
		})),
		...(filters.followingOnly
			? [
					{
						key: 'following',
						label: t('creators:filters.following'),
						onRemove: () => void update({ followingOnly: false }),
					},
			  ]
			: []),
	];

	const renderResults = () => {
		if (showSkeleton) {
			return (
				<Box role="status" aria-busy="true" aria-label={t('creators:list.loading')} sx={gridSx}>
					{Array.from({ length: 6 }, (_, index) => (
						<Skeleton
							key={index}
							variant="rounded"
							height={460}
							aria-hidden="true"
							sx={{ borderRadius: home.radius.card }}
						/>
					))}
				</Box>
			);
		}
		if (error && !data) {
			return <ErrorState error={error} title={t('creators:list.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (creators.length === 0 && total > 0) {
			// A page number past the end (an old link): back to page 1.
			return (
				<Box sx={{ textAlign: 'center', py: 10 }}>
					<Typography variant="h2" sx={{ fontSize: 26 }}>
						{t('creators:empty.pageTitle')}
					</Typography>
					<Button component={NextLink} href={pageHref(1)} sx={{ mt: 4 }}>
						{t('creators:empty.firstPage')}
					</Button>
				</Box>
			);
		}
		if (creators.length === 0) {
			// "Following" alone, and I follow nobody: a different message, and nothing to clear but that.
			const noFollows =
				filters.followingOnly && counts?.following === 0 && !filters.text && filters.categories.length === 0;
			const key = noFollows ? 'noFollows' : 'noMatch';
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
					<Box
						aria-hidden="true"
						sx={{
							width: 60,
							height: 60,
							display: 'grid',
							placeItems: 'center',
							borderRadius: '18px',
							bgcolor: 'accentSoft',
							color: 'primary.main',
						}}
					>
						<PeopleOutlineIcon sx={{ fontSize: 28 }} />
					</Box>
					<Typography
						variant="h2"
						sx={{
							fontFamily: fonts.display,
							fontSize: 30,
							lineHeight: 1.1,
							fontWeight: 700,
							letterSpacing: '-0.025em',
						}}
					>
						{t(`creators:empty.${key}.title`)}
					</Typography>
					<Typography sx={{ maxWidth: 460, fontSize: 16, lineHeight: 1.55, color: 'bodySoft' }}>
						{t(`creators:empty.${key}.text`)}
					</Typography>
					<Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2.5 }}>
						{!noFollows && canPost && (
							<Button
								component={NextLink}
								href={newBriefHref('')}
								sx={{ minHeight: 48, px: 5.5, borderRadius: home.radius.button }}
							>
								{t('creators:empty.postBrief')}
							</Button>
						)}
						{hasActiveCreatorFilters(filters) && (
							<ButtonBase onClick={() => void clear()} sx={outlineButtonSx}>
								{t('creators:empty.clearAll')}
							</ButtonBase>
						)}
					</Box>
				</Box>
			);
		}

		return (
			<>
				{/* A new key per result set replays the entrance animation. */}
				<Box key={resultKey} component="ol" aria-label={t('creators:list.resultsLabel')} sx={gridSx}>
					{visible.map((creator, index) => (
						<li key={creator._id}>
							<CreatorCard creator={creator} index={index} />
						</li>
					))}
					{hidden === 0 && showBecome && (
						<li>
							<BecomeCreatorTile />
						</li>
					)}
				</Box>
				<LoadMore
					showingLabel={t('creators:list.showing', { shown: format.number(shownUpTo), total: format.number(total) })}
					shown={shownUpTo}
					total={total}
					hidden={hidden}
					showMoreLabel={t('creators:list.showMore', { count: hidden })}
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
			<CreatorsHero filters={filters} onChange={update} stats={stats.data?.getCreatorStats} showBecome={showBecome} />
			<CreatorFilterBar filters={filters} onChange={update} counts={counts} canFollow={canFollow} />
			<Box
				sx={{
					maxWidth: 1240,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					pt: 7,
					pb: 24,
					display: 'flex',
					flexDirection: 'column',
					gap: 5.5,
				}}
			>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 3.5, rowGap: 2.5 }}>
					{/* Announced politely after every change; empty while loading. */}
					<Typography role="status" aria-live="polite" sx={{ fontSize: 16, color: 'bodySoft', minHeight: '1.5em' }}>
						{!showSkeleton && data && (
							<>
								<Box
									component="b"
									sx={{ fontFamily: fonts.display, fontSize: 22, letterSpacing: '-0.02em', color: 'ink' }}
								>
									{format.number(total)}
								</Box>{' '}
								{t('creators:list.results', { count: total })}
								{filters.text && ` ${t('creators:list.resultsFor', { text: filters.text })}`}
							</>
						)}
					</Typography>
					<AppliedChips
						chips={chips}
						onClear={() => void clear()}
						labels={{
							remove: (label) => t('creators:filters.remove', { label }),
							clearAll: t('creators:filters.clearAll'),
						}}
					/>
					{filters.withAgentsOnly && hiddenEmpty > 0 && (
						<Link
							component="button"
							type="button"
							onClick={() => void update({ withAgentsOnly: false })}
							underline="always"
							sx={{ minHeight: 34, px: 1, fontSize: 13, fontWeight: 600, color: 'muted', ...focusVisibleSx }}
						>
							{t('creators:list.hiddenEmpty', { count: hiddenEmpty })}
						</Link>
					)}
				</Box>
				{renderResults()}
			</Box>
		</>
	);
};
