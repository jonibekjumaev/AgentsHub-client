import { Box, ButtonBase } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory, BriefBudgetType, BriefStatus } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { CategoryRail, FilterBarRow, FilterDivider, SortSelect, StickyFilterBar, ToggleChip, focusVisibleSx } from '@/shared/ui/catalog';
import { catalog, colors, home } from '@/theme/tokens';
import type { BriefFilterPatch } from '../../hooks/useBriefFilters';
import { BRIEF_BUDGET_TYPES, BRIEF_SORTS, BRIEF_TABS, type BriefFilters, type BriefTab } from '../../lib/listQuery';

/** null = counts not loaded yet (or failed): every option stays enabled, no number shown. */
export type BriefFacetCounts = {
	categories: Partial<Record<AgentCategory, number>>;
	budgetTypes: Partial<Record<BriefBudgetType, number>>;
	statuses: Partial<Record<BriefStatus, number>>;
} | null;

const TAB_STATUS: Record<BriefTab, BriefStatus> = { open: 'OPEN', closed: 'CLOSED' };

/** Open / Closed: a segmented, single-choice control with counts. */
const StatusTabs = ({ tab, counts, onChange }: { tab: BriefTab; counts: BriefFacetCounts; onChange: (tab: BriefTab) => void }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	return (
		<Box
			role="group"
			aria-label={t('briefs:list.tabsLabel')}
			sx={{ display: 'flex', p: '3px', borderRadius: '10px', bgcolor: 'surface', border: 1, borderColor: 'border' }}
		>
			{BRIEF_TABS.map((item) => {
				const active = item === tab;
				const count = counts?.statuses[TAB_STATUS[item]];
				return (
					<ButtonBase
						key={item}
						aria-pressed={active}
						onClick={() => onChange(item)}
						sx={{
							minHeight: 32,
							px: 3,
							gap: 1,
							borderRadius: '7px',
							bgcolor: active ? home.footer : 'transparent',
							color: active ? colors.white : 'body',
							fontSize: 14,
							fontWeight: 700,
							transition: 'background-color 200ms, color 200ms',
							...focusVisibleSx,
						}}
					>
						{t(`briefs:list.tabs.${item}`)}
						{count !== undefined && ' '}
						{count !== undefined && (
							<Box component="span" sx={{ fontWeight: 500, opacity: 0.75 }}>
								{format.number(count)}
							</Box>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
};

/** "Hide past deadline": a real switch (`role="switch"`, `aria-checked`). Only the open tab has passed deadlines to hide. */
const PastDeadlineSwitch = ({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: (checked: boolean) => void }) => {
	const { t } = useTranslation('briefs');
	return (
		<ButtonBase
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			sx={{
				minHeight: 38,
				gap: 2.5,
				px: 3,
				border: 1,
				borderColor: 'border',
				borderRadius: '10px',
				bgcolor: 'surface',
				color: 'body',
				fontSize: 14,
				fontWeight: 600,
				'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'body' },
				...focusVisibleSx,
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					position: 'relative',
					width: 34,
					height: 20,
					borderRadius: '999px',
					bgcolor: checked ? 'primary.main' : catalog.divider,
					transition: 'background-color 200ms',
				}}
			>
				<Box
					component="span"
					sx={{
						position: 'absolute',
						top: 2,
						left: checked ? 16 : 2,
						width: 16,
						height: 16,
						borderRadius: '50%',
						bgcolor: colors.white,
						transition: 'left 200ms',
						'@media (prefers-reduced-motion: reduce)': { transition: 'none' },
					}}
				/>
			</Box>
			{t('briefs:feed.filters.hidePast')}
		</ButtonBase>
	);
};

type BriefFilterBarProps = {
	filters: BriefFilters;
	onChange: (patch: BriefFilterPatch) => void;
	counts: BriefFacetCounts;
};

/**
 * The sticky /briefs filter bar: the category rail, then Open / Closed, budget type chips, the past-deadline
 * switch and the sort. Counts come from getBriefFacets (D-44); an option with 0 results is disabled.
 */
export const BriefFilterBar = ({ filters, onChange, counts }: BriefFilterBarProps) => {
	const { t } = useTranslation('briefs');
	const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

	return (
		<StickyFilterBar>
			<CategoryRail
				selected={filters.categories}
				counts={counts?.categories}
				onChange={(categories) => onChange({ categories })}
				labels={{ group: t('briefs:list.categoriesLabel'), all: t('briefs:feed.filters.all') }}
			/>
			<FilterBarRow
				start={
					<>
						<StatusTabs tab={filters.tab} counts={counts} onChange={(tab) => onChange({ tab })} />
						<FilterDivider />
						<Box role="group" aria-label={t('briefs:feed.filters.budget')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
							{BRIEF_BUDGET_TYPES.map((type) => (
								<ToggleChip
									key={type}
									label={t(`briefs:feed.budgetType.${type}`)}
									count={counts?.budgetTypes[type]}
									selected={filters.budgetTypes.includes(type)}
									onClick={() => onChange({ budgetTypes: toggle(filters.budgetTypes, type) })}
								/>
							))}
						</Box>
						<PastDeadlineSwitch
							checked={filters.hidePast}
							disabled={filters.tab !== 'open'}
							onChange={(hidePast) => onChange({ hidePast })}
						/>
					</>
				}
				end={
					<SortSelect
						label={t('briefs:list.sortLabel')}
						value={filters.sort}
						options={BRIEF_SORTS.map((sort) => ({ value: sort, label: t(`briefs:feed.sort.${sort}`) }))}
						onChange={(sort) => onChange({ sort })}
					/>
				}
			/>
		</StickyFilterBar>
	);
};
