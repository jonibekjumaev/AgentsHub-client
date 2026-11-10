import NextLink from 'next/link';
import { Box, ButtonBase, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentCategory } from '@/gql/enums';
import type { CreatorsHeroStatsQuery } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { initialsOf } from '@/shared/ui/Avatar';
import { categoryTint } from '@/shared/ui/CategoryIcon';
import { SearchBand, focusVisibleSx } from '@/shared/ui/catalog';
import { colors, home, radiusPx } from '@/theme/tokens';
import type { CreatorFilterPatch } from '../../hooks/useCreatorFilters';
import { CREATOR_SEARCH_MAX, type CreatorFilters } from '../../lib/creatorsQuery';

export const CREATOR_EXAMPLE_COUNT = 3;
/** Where "Become a creator" goes: the signup form, where the creator role is picked (§1.1). */
export const BECOME_CREATOR_HREF = '/signup';

/** "Try:" pills set the category filter (the creators design). */
const SUGGESTIONS: AgentCategory[] = [
	AgentCategory.CustomerSupport,
	AgentCategory.Education,
	AgentCategory.Automation,
	AgentCategory.Content,
];

type Stats = CreatorsHeroStatsQuery['getCreatorStats'];

/** 5 overlapping faces, then "8 creators, 13 agents listed" (D-45). Nothing until the numbers are known. */
const FaceRow = ({ stats }: { stats: Stats | undefined }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	if (!stats || stats.creators === 0) return null;
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', rowGap: 2 }}>
			<Box aria-hidden="true" sx={{ display: 'flex', pl: 2.5 }}>
				{stats.faces.map((face) => {
					const name = face.memberFullName || face.memberNick;
					const [tint, ink] = categoryTint(face.memberCategories?.[0] ?? AgentCategory.Other);
					const image = mediaUrl(face.memberImage);
					return (
						<Box
							key={face._id}
							component="span"
							sx={{
								width: 40,
								height: 40,
								ml: -2.5,
								display: 'grid',
								placeItems: 'center',
								boxSizing: 'border-box',
								borderRadius: '50%',
								border: `3px solid ${home.night}`,
								bgcolor: tint,
								color: ink,
								fontSize: 13,
								fontWeight: 800,
								...(image && {
									backgroundImage: `url(${image})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}),
							}}
						>
							{!image && initialsOf(name)}
						</Box>
					);
				})}
			</Box>
			<Typography component="p" sx={{ ml: 3, fontSize: 14, fontWeight: 600, color: home.nightText }}>
				{t('creators:hero.stats', {
					creators: t('creators:hero.creators', { count: stats.creators, formatted: format.number(stats.creators) }),
					agents: t('creators:hero.agents', { count: stats.agents, formatted: format.number(stats.agents) }),
				})}
			</Typography>
		</Box>
	);
};

type CreatorsHeroProps = {
	filters: CreatorFilters;
	onChange: (patch: CreatorFilterPatch) => void;
	stats: Stats | undefined;
	/** Guests and USERs; creators already are one, admins can't be. */
	showBecome: boolean;
};

/** The /creators search band (the same dark band as /agents and /briefs): faces, headline, search, "Try:" and "+ Become a creator". */
export const CreatorsHero = ({ filters, onChange, stats, showBecome }: CreatorsHeroProps) => {
	const { t } = useTranslation(['creators', 'common']);
	return (
		<SearchBand
			titleId="creators-title"
			inputId="creators-search"
			badge={<FaceRow stats={stats} />}
			title={t('creators:hero.title')}
			text={t('creators:hero.text')}
			value={filters.text}
			onSearch={(text) => onChange({ text })}
			maxLength={CREATOR_SEARCH_MAX}
			examples={Array.from({ length: CREATOR_EXAMPLE_COUNT }, (_, index) => t(`creators:hero.examples.${index}`))}
			suggestions={SUGGESTIONS.map((category) => ({
				key: category,
				label: t(`common:enums.AgentCategory.${category}`),
				onPick: () => onChange({ categories: [category] }),
			}))}
			trailing={
				showBecome ? (
					<ButtonBase
						component={NextLink}
						href={BECOME_CREATOR_HREF}
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
						{t('creators:become.action')}
					</ButtonBase>
				) : undefined
			}
			labels={{
				search: t('creators:list.searchLabel'),
				clear: t('creators:hero.clear'),
				submit: t('creators:hero.submit'),
				try: t('creators:hero.try'),
			}}
		/>
	);
};
