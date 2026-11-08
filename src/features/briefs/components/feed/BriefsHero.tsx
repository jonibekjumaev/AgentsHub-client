import NextLink from 'next/link';
import { Box, ButtonBase } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { BriefBudgetType } from '@/gql/enums';
import type { OpenBriefStatsQuery } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { SearchBand, focusVisibleSx } from '@/shared/ui/catalog';
import { briefFeed, colors, home, radiusPx } from '@/theme/tokens';
import type { BriefFilterPatch } from '../../hooks/useBriefFilters';
import { BRIEF_SEARCH_MAX, type BriefFilters } from '../../lib/listQuery';
import { NEW_BRIEF_PATH } from '../../lib/myBriefs';

export const BRIEF_EXAMPLE_COUNT = 5;

/** "Try:" pills: three searches and one budget filter (the briefs design). */
const SUGGESTIONS: { key: string; patch: BriefFilterPatch }[] = [
	{ key: 'telegram', patch: { text: 'Telegram' } },
	{ key: 'shopify', patch: { text: 'Shopify' } },
	{ key: 'slack', patch: { text: 'Slack' } },
	{ key: 'offers', patch: { budgetTypes: [BriefBudgetType.OpenToOffers] } },
];

type Stats = OpenBriefStatsQuery['getOpenBriefStats'];

/**
 * "● 3 briefs open now, $2,450.50 in posted budgets" (D-44). Hidden with no open brief; the budget part is
 * left out when no open brief has a fixed budget. The dot pulses, except under reduced motion.
 */
export const LiveBadge = ({ stats }: { stats: Stats | undefined }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	if (!stats || stats.openNow === 0) return null;
	const count = { count: stats.openNow, formatted: format.number(stats.openNow) };
	return (
		<Box
			component="p"
			sx={{
				m: 0,
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				px: 3.5,
				py: 1.5,
				borderRadius: radiusPx.pill,
				bgcolor: briefFeed.liveBadge.bg,
				border: `1px solid ${briefFeed.liveBadge.border}`,
				fontSize: 14,
				fontWeight: 600,
				color: briefFeed.liveBadge.text,
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					flex: 'none',
					width: 8,
					height: 8,
					borderRadius: '50%',
					bgcolor: briefFeed.liveBadge.dot,
					'@keyframes briefsLive': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
					animation: 'briefsLive 1.6s ease-in-out infinite',
					'@media (prefers-reduced-motion: reduce)': { animation: 'none' },
				}}
			/>
			{stats.budgetTotal > 0
				? t('briefs:feed.live.withBudget', { ...count, budget: format.price(stats.budgetTotal) })
				: t('briefs:feed.live.openOnly', count)}
		</Box>
	);
};

type BriefsHeroProps = {
	filters: BriefFilters;
	onChange: (patch: BriefFilterPatch) => void;
	stats: Stats | undefined;
	/** USERs and guests (ER rule 2). */
	canPost: boolean;
};

/** The /briefs search band: live badge, headline, the debounced search, "Try:" pills and "+ Post a brief". */
export const BriefsHero = ({ filters, onChange, stats, canPost }: BriefsHeroProps) => {
	const { t } = useTranslation('briefs');
	return (
		<SearchBand
			titleId="briefs-title"
			inputId="briefs-search"
			badge={<LiveBadge stats={stats} />}
			title={t('briefs:feed.hero.title')}
			text={t('briefs:feed.hero.text')}
			value={filters.text}
			onSearch={(text) => onChange({ text })}
			maxLength={BRIEF_SEARCH_MAX}
			examples={Array.from({ length: BRIEF_EXAMPLE_COUNT }, (_, index) => t(`briefs:feed.hero.examples.${index}`))}
			suggestions={SUGGESTIONS.map(({ key, patch }) => ({ key, label: t(`briefs:feed.hero.suggestions.${key}`), onPick: () => onChange(patch) }))}
			trailing={
				canPost ? (
					<ButtonBase
						component={NextLink}
						href={NEW_BRIEF_PATH}
						sx={{
							minHeight: 36,
							display: 'inline-flex',
							alignItems: 'center',
							gap: 1.5,
							px: 4,
							borderRadius: radiusPx.pill,
							bgcolor: colors.white,
							color: home.night,
							fontSize: 14,
							fontWeight: 700,
							'&:hover': { bgcolor: 'accentSoft' },
							...focusVisibleSx,
						}}
					>
						<AddIcon aria-hidden="true" sx={{ fontSize: 16 }} />
						{t('briefs:list.post')}
					</ButtonBase>
				) : undefined
			}
			labels={{
				search: t('briefs:list.searchLabel'),
				clear: t('briefs:feed.hero.clear'),
				submit: t('briefs:feed.hero.submit'),
				try: t('briefs:feed.hero.try'),
			}}
		/>
	);
};

