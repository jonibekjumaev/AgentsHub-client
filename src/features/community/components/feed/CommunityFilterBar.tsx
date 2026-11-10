import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { BoardArticleCategory } from '@/gql/enums';
import { FilterBarRow, SortSelect, StickyFilterBar, ToggleChip } from '@/shared/ui/catalog';
import type { ArticleFilterPatch } from '../../hooks/useArticleFilters';
import { ARTICLE_CATEGORIES, ARTICLE_SORTS, type ArticleFilters } from '../../lib/articles';

/** null = counts not loaded yet (or failed): every topic stays enabled, no number shown. */
export type ArticleFacetCounts = { categories: Partial<Record<BoardArticleCategory, number>>; all: number } | null;

type CommunityFilterBarProps = {
	filters: ArticleFilters;
	onChange: (patch: ArticleFilterPatch) => void;
	counts: ArticleFacetCounts;
};

/**
 * The sticky /community bar: the topics (one at a time, with live counts, D-46; filter buttons with
 * aria-pressed, not tabs: there are no tab panels), then the sort. The search is in the band above.
 */
export const CommunityFilterBar = ({ filters, onChange, counts }: CommunityFilterBarProps) => {
	const { t } = useTranslation('community');
	return (
		<StickyFilterBar>
			<FilterBarRow
				start={
					<Box
						role="group"
						aria-label={t('community:list.categoriesLabel')}
						// One scrolling row on phones (as the category rail), so the sticky bar stays short.
						sx={{
							display: 'flex',
							flexWrap: { xs: 'nowrap', sm: 'wrap' },
							overflowX: { xs: 'auto', sm: 'visible' },
							maxWidth: '100%',
							gap: 1.5,
							py: 0.5,
							scrollbarWidth: 'none',
							'& > *': { flex: 'none' },
						}}
					>
						<ToggleChip
							label={t('community:list.all')}
							count={counts?.all}
							selected={filters.category === null}
							onClick={() => onChange({ category: null })}
							tone="dark"
						/>
						{ARTICLE_CATEGORIES.map((category) => (
							<ToggleChip
								key={category}
								label={t(`community:categories.${category}`)}
								count={counts?.categories[category]}
								selected={filters.category === category}
								// A second click on the chosen topic goes back to all topics.
								onClick={() => onChange({ category: filters.category === category ? null : category })}
								tone="dark"
							/>
						))}
					</Box>
				}
				end={
					<SortSelect
							label={t('community:feed.sortLabel')}
							value={filters.sort}
							options={ARTICLE_SORTS.map((sort) => ({ value: sort, label: t(`community:feed.sort.${sort}`) }))}
						onChange={(sort) => onChange({ sort })}
					/>
				}
			/>
		</StickyFilterBar>
	);
};
