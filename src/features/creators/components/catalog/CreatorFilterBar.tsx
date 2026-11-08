import { Box, ButtonBase } from '@mui/material';
import { HowToRegOutlined as HowToRegOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import {
	CategoryRail,
	FilterBarRow,
	FilterSwitch,
	SortSelect,
	StickyFilterBar,
	focusVisibleSx,
} from '@/shared/ui/catalog';
import { colors } from '@/theme/tokens';
import type { CreatorFilterPatch } from '../../hooks/useCreatorFilters';
import { CREATOR_SORTS, type CreatorFilters } from '../../lib/creatorsQuery';

/** null = counts not loaded yet (or failed): every option stays enabled, no number shown. */
export type CreatorFacetCounts = { categories: Partial<Record<AgentCategory, number>>; all: number; following: number } | null;

type CreatorFilterBarProps = {
	filters: CreatorFilters;
	onChange: (patch: CreatorFilterPatch) => void;
	counts: CreatorFacetCounts;
	/** "Following" needs a signed-in member: hidden from guests. */
	canFollow: boolean;
};

/**
 * The sticky /creators filter bar: "Builds agents for" category rail, the "Only creators with agents" switch,
 * the "Following" chip and the sort. Counts come from getCreatorFacets (D-45).
 */
export const CreatorFilterBar = ({ filters, onChange, counts, canFollow }: CreatorFilterBarProps) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const following = filters.followingOnly;

	return (
		<StickyFilterBar>
			<CategoryRail
				selected={filters.categories}
				counts={counts?.categories}
				// A creator who builds in two categories is one creator: "All" comes from the API, not the sum.
				allCount={counts?.all}
				onChange={(categories) => onChange({ categories })}
				labels={{ group: t('creators:filters.buildsFor'), all: t('creators:filters.all') }}
			/>
			<FilterBarRow
				start={
					<>
						<FilterSwitch
							label={t('creators:filters.withAgents')}
							checked={filters.withAgentsOnly}
							onChange={(withAgentsOnly) => onChange({ withAgentsOnly })}
						/>
						{canFollow && (
							<ButtonBase
								aria-pressed={following}
								onClick={() => onChange({ followingOnly: !following })}
								sx={{
									minHeight: 38,
									gap: 2,
									px: 3,
									borderRadius: '10px',
									border: 1,
									borderColor: following ? 'primary.main' : 'border',
									bgcolor: following ? 'primary.main' : 'surface',
									color: following ? colors.white : 'body',
									fontSize: 14,
									fontWeight: 600,
									transition: 'background-color 200ms, color 200ms',
									...focusVisibleSx,
								}}
							>
								<HowToRegOutlinedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
								{t('creators:filters.following')}
								{counts && ' '}
								{counts && (
									<Box component="span" sx={{ fontWeight: 500, opacity: 0.75 }}>
										{format.number(counts.following)}
									</Box>
								)}
							</ButtonBase>
						)}
					</>
				}
				end={
					<SortSelect
						label={t('creators:list.sortLabel')}
						value={filters.sort}
						options={CREATOR_SORTS.map((sort) => ({ value: sort, label: t(`creators:list.sort.${sort}`) }))}
						onChange={(sort) => onChange({ sort })}
					/>
				}
			/>
		</StickyFilterBar>
	);
};
