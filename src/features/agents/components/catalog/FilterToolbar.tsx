import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Box, ButtonBase, NativeSelect } from '@mui/material';
import { GridViewOutlined as GridViewOutlinedIcon, ViewAgendaOutlined as ViewAgendaOutlinedIcon, Apps as AppsIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory, ProductPricing } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { catalog, colors, home, radiusPx } from '@/theme/tokens';
import type { FilterPatch } from '../../hooks/useAgentFilters';
import {
	AGENT_CATEGORIES,
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

const focusRing = { '&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' } } as const;

/** A count of 0 disables the option, unless it is selected (it must stay removable). */
const isDead = (count: number | undefined, selected: boolean) => count === 0 && !selected;

type CategoryPillProps = {
	label: string;
	count: number | undefined;
	selected: boolean;
	onClick: () => void;
	icon: ReactNode;
	tint: string;
	ink: string;
};

const CategoryPill = ({ label, count, selected, onClick, icon, tint, ink }: CategoryPillProps) => {
	const format = useFormat();
	const dead = isDead(count, selected);
	return (
		<ButtonBase
			aria-pressed={selected}
			disabled={dead}
			onClick={onClick}
			sx={{
				flex: 'none',
				minHeight: 42,
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				pl: 2,
				pr: 3.5,
				borderRadius: radiusPx.pill,
				border: 1,
				borderColor: selected ? home.footer : 'border',
				bgcolor: selected ? home.footer : 'surface',
				color: selected ? colors.white : 'ink',
				fontSize: 14,
				fontWeight: 600,
				whiteSpace: 'nowrap',
				transition: 'background-color 200ms, border-color 200ms, color 200ms',
				'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'ink' },
				...focusRing,
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: selected ? colors.white : tint, color: ink }}
			>
				{icon}
			</Box>
			{label}
			{/* The space keeps "Sales 2" apart for screen readers; the gap does the visual spacing. */}
			{count !== undefined && ' '}
			{count !== undefined && (
				<Box
					component="span"
					sx={{
						minWidth: 22,
						px: 1.75,
						py: 0.5,
						boxSizing: 'border-box',
						borderRadius: radiusPx.pill,
						bgcolor: selected ? catalog.selectedCountBg : 'neutralSoft',
						color: selected ? colors.white : 'bodySoft',
						fontSize: 12,
						fontWeight: 700,
					}}
				>
					{format.number(count)}
				</Box>
			)}
		</ButtonBase>
	);
};

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
				sx={{ width: { xs: 110, sm: 150 }, accentColor: (theme) => theme.palette.primary.main, ...focusRing }}
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
	const format = useFormat();
	const sortId = useId();
	const allCount = counts ? Object.values(counts.categories).reduce((sum, count) => sum + (count ?? 0), 0) : undefined;

	const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

	return (
		<Box
			sx={{
				position: 'sticky',
				top: 0,
				zIndex: 5,
				bgcolor: catalog.toolbarBg,
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)',
				borderBottom: 1,
				borderColor: 'border',
			}}
		>
			<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, py: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box
					role="group"
					aria-label={t('agents:filters.category')}
					sx={{
						display: 'flex',
						gap: 2,
						overflowX: 'auto',
						p: '2px',
						m: '-2px',
						scrollbarWidth: 'none',
						'&::-webkit-scrollbar': { display: 'none' },
					}}
				>
					<CategoryPill
						label={t('agents:toolbar.all')}
						count={allCount}
						selected={filters.categories.length === 0}
						onClick={() => onChange({ categories: [] })}
						icon={<AppsIcon sx={{ fontSize: 15 }} />}
						tint="accentSoft"
						ink="primary.main"
					/>
					{AGENT_CATEGORIES.map((category) => {
						const [tint, ink] = categoryTint(category);
						return (
							<CategoryPill
								key={category}
								label={t(`common:enums.AgentCategory.${category}`)}
								count={counts?.categories[category]}
								selected={filters.categories.includes(category)}
								onClick={() => onChange({ categories: toggle(filters.categories, category) })}
								icon={<CategoryIcon category={category} size={15} />}
								tint={tint}
								ink={ink}
							/>
						);
					})}
				</Box>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
						<Box role="group" aria-label={t('agents:filters.pricing')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
							{AGENT_PRICINGS.map((pricing) => {
								const selected = filters.pricing.includes(pricing);
								const count = counts?.pricing[pricing];
								return (
									<ButtonBase
										key={pricing}
										aria-pressed={selected}
										disabled={isDead(count, selected)}
										onClick={() => onChange({ pricing: toggle(filters.pricing, pricing) })}
										sx={{
											minHeight: 38,
											px: 3,
											gap: 1,
											borderRadius: '10px',
											border: 1,
											borderColor: selected ? 'primary.main' : 'border',
											bgcolor: selected ? 'primary.main' : 'surface',
											color: selected ? colors.white : 'body',
											fontSize: 14,
											fontWeight: 600,
											transition: 'background-color 200ms, color 200ms',
											'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'body' },
											...focusRing,
										}}
									>
										{t(`agents:toolbar.pricing.${pricing}`)}
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
						<Box aria-hidden="true" sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: 26, mx: 1.5, bgcolor: catalog.divider }} />
						<MaxPriceSlider
							value={filters.maxPrice}
							disabled={!isPriceFilterApplicable(filters.pricing)}
							onChange={(maxPrice) => onChange({ maxPrice })}
						/>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
						<Box component="label" htmlFor={sortId} sx={{ fontSize: 14, color: 'bodySoft' }}>
							{t('agents:list.sortLabel')}
						</Box>
						<NativeSelect
							id={sortId}
							value={filters.sort}
							onChange={(event) => onChange({ sort: event.target.value as AgentSort })}
							disableUnderline
							sx={{
								minHeight: 38,
								px: 3,
								border: 1,
								borderColor: 'border',
								borderRadius: '10px',
								bgcolor: 'surface',
								fontSize: 14,
								fontWeight: 600,
								color: 'ink',
								'&:focus-within': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
								'& select:focus': { bgcolor: 'transparent' },
							}}
						>
							{SORT_MENU.map((sort) => (
								<option key={sort} value={sort}>
									{t(`agents:list.sort.${sort}`)}
								</option>
							))}
						</NativeSelect>
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
											...focusRing,
										}}
									>
										{item === 'grid' ? <GridViewOutlinedIcon sx={{ fontSize: 17 }} /> : <ViewAgendaOutlinedIcon sx={{ fontSize: 17 }} />}
									</ButtonBase>
								);
							})}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
