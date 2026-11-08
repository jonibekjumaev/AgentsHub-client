import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase } from '@mui/material';
import { GridViewOutlined as GridViewOutlinedIcon, ViewAgendaOutlined as ViewAgendaOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory, ProductPricing } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { CategoryRail, FilterBarRow, FilterDivider, SortSelect, StickyFilterBar, ToggleChip, focusVisibleSx } from '@/shared/ui/catalog';
import { catalog, colors, home } from '@/theme/tokens';
import type { FilterPatch } from '../../hooks/useAgentFilters';
import {
	AGENT_PRICINGS,
	PRICE_SLIDER_MAX,
	PRICE_SLIDER_STEP,
	isPriceFilterApplicable,
	type AgentFilters,
	type AgentSort,
	type AgentView,
} from '../../lib/listQuery';

/** Order of the sort menu (design): the default first. */
export const SORT_MENU: AgentSort[] = ['likes', 'newest', 'views', 'rank', 'price-asc', 'price-desc'];

/** null = counts not loaded yet (or failed): every option stays enabled, no number shown. */
export type FacetCounts = {
	categories: Partial<Record<AgentCategory, number>>;
	pricing: Partial<Record<ProductPricing, number>>;
} | null;

/**
 * Max price: a 0–1000 slider; the far end is "any price". The URL follows when the thumb is let go (not on
 * every step). A max above 1000 from a link shows the thumb at the end and the real amount as the label.
 * Disabled when only Free / Custom are picked: they have no price (D-03).
 */
const MaxPriceSlider = ({ value, disabled, onChange }: { value: number | null; disabled: boolean; onChange: (max: number | null) => void }) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const [draft, setDraft] = useState(value ?? PRICE_SLIDER_MAX);
	const dirty = useRef(false);
	useEffect(() => {
		dirty.current = false;
		setDraft(value ?? PRICE_SLIDER_MAX);
	}, [value]);

	const label =
		draft < PRICE_SLIDER_MAX
			? format.price(draft)
			: value !== null && value >= PRICE_SLIDER_MAX && !dirty.current
				? format.price(value)
				: t('agents:toolbar.anyPrice');
	const commit = () => {
		if (!dirty.current) return;
		dirty.current = false;
		onChange(draft >= PRICE_SLIDER_MAX ? null : draft);
	};

	return (
		<Box
			component="label"
			sx={{
				minHeight: 38,
				display: 'flex',
				alignItems: 'center',
				gap: 2.5,
				px: 3,
				border: 1,
				borderColor: 'border',
				borderRadius: '10px',
				bgcolor: 'surface',
				fontSize: 14,
				fontWeight: 600,
				color: 'body',
				...(disabled && { opacity: catalog.disabledOpacity }),
			}}
		>
			{t('agents:toolbar.maxPrice')}
			<Box
				component="input"
				type="range"
				min={0}
				max={PRICE_SLIDER_MAX}
				step={PRICE_SLIDER_STEP}
				disabled={disabled}
				value={Math.min(draft, PRICE_SLIDER_MAX)}
				aria-valuetext={label}
				onChange={(event) => {
					dirty.current = true;
					setDraft(Number((event.target as HTMLInputElement).value));
				}}
				onPointerUp={commit}
				onKeyUp={commit}
				onBlur={commit}
				sx={{ width: { xs: 110, sm: 150 }, accentColor: (theme) => theme.palette.primary.main, ...focusVisibleSx }}
			/>
			<Box component="span" sx={{ minWidth: 48, fontWeight: 700, color: 'ink' }}>
				{label}
			</Box>
		</Box>
	);
};

type FilterToolbarProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	counts: FacetCounts;
	view: AgentView;
	onView: (view: AgentView) => void;
};

/**
 * Sticky toolbar: the category rail (multi-select, live counts), pricing chips, max price, sort and the
 * grid / list switch. An option with 0 results is disabled (a real `disabled`, not only faded).
 */
export const FilterToolbar = ({ filters, onChange, counts, view, onView }: FilterToolbarProps) => {
	const { t } = useTranslation(['agents', 'common']);
	const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

	return (
		<StickyFilterBar>
			<CategoryRail
				selected={filters.categories}
				counts={counts?.categories}
				onChange={(categories) => onChange({ categories })}
				labels={{ group: t('agents:filters.category'), all: t('agents:toolbar.all') }}
			/>
			<FilterBarRow
				start={
					<>
						<Box role="group" aria-label={t('agents:filters.pricing')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
							{AGENT_PRICINGS.map((pricing) => (
								<ToggleChip
									key={pricing}
									label={t(`agents:toolbar.pricing.${pricing}`)}
									count={counts?.pricing[pricing]}
									selected={filters.pricing.includes(pricing)}
									onClick={() => onChange({ pricing: toggle(filters.pricing, pricing) })}
								/>
							))}
						</Box>
						<FilterDivider />
						<MaxPriceSlider
							value={filters.maxPrice}
							disabled={!isPriceFilterApplicable(filters.pricing)}
							onChange={(maxPrice) => onChange({ maxPrice })}
						/>
					</>
				}
				end={
					<>
						<SortSelect
							label={t('agents:list.sortLabel')}
							value={filters.sort}
							options={SORT_MENU.map((sort) => ({ value: sort, label: t(`agents:list.sort.${sort}`) }))}
							onChange={(sort) => onChange({ sort })}
						/>
						<Box
							role="group"
							aria-label={t('agents:toolbar.layout')}
							sx={{ display: 'flex', p: '3px', borderRadius: '10px', bgcolor: 'surface', border: 1, borderColor: 'border' }}
						>
							{(['grid', 'list'] as const).map((item) => {
								const active = item === view;
								return (
									<ButtonBase
										key={item}
										aria-label={t(`agents:toolbar.${item}`)}
										aria-pressed={active}
										onClick={() => onView(item)}
										sx={{
											width: 40,
											height: 34,
											borderRadius: '7px',
											bgcolor: active ? home.footer : 'transparent',
											color: active ? colors.white : 'bodySoft',
											...focusVisibleSx,
										}}
									>
										{item === 'grid' ? <GridViewOutlinedIcon sx={{ fontSize: 17 }} /> : <ViewAgendaOutlinedIcon sx={{ fontSize: 17 }} />}
									</ButtonBase>
								);
							})}
						</Box>
					</>
				}
			/>
		</StickyFilterBar>
	);
};
