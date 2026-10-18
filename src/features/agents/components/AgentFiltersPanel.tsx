import { useEffect, useId, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Box, Checkbox, Divider, FormControlLabel, FormHelperText, OutlinedInput, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';
import type { FilterPatch } from '../hooks/useAgentFilters';
import {
	AGENT_CATEGORIES,
	AGENT_PRICINGS,
	PRICE_MAX,
	TAGS_MAX,
	TAG_MAX_LENGTH,
	isPriceFilterApplicable,
	normalizeTag,
	type AgentFilters,
} from '../lib/listQuery';

type AgentFiltersPanelProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
};

type PanelVariant = {
	/** "aside": the md+ sidebar (hidden below md). "drawer": bare content for FiltersDrawer. */
	variant?: 'aside' | 'drawer';
};

const legendSx: SxProps<Theme> = {
	p: 0,
	mb: 2.5,
	fontSize: 13,
	fontWeight: 800,
	letterSpacing: '0.06em',
	textTransform: 'uppercase',
	color: 'body',
};

const smallInputSx: SxProps<Theme> = { height: 38, borderRadius: radiusPx.sm, fontSize: 14 };

const Group = ({ legend, children }: { legend: string; children: ReactNode }) => (
	<Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
		<Typography component="legend" sx={legendSx}>
			{legend}
		</Typography>
		{children}
	</Box>
);

const toggle = <T,>(list: readonly T[], value: T): T[] =>
	list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const toInput = (value: number | null) => (value === null ? '' : String(value));

/** '' → null; anything that is not a price (NaN, negative, too large) → undefined. */
const toPrice = (input: string): number | null | undefined => {
	if (input.trim() === '') return null;
	const value = Number(input);
	return Number.isFinite(value) && value >= 0 && value <= PRICE_MAX ? value : undefined;
};

/** Min / max price. Applied on blur or Enter, never while typing; min > max is shown and not applied. */
const PriceRange = ({ filters, onChange }: AgentFiltersPanelProps) => {
	const { t } = useTranslation('agents');
	const id = useId();
	const [min, setMin] = useState(toInput(filters.minPrice));
	const [max, setMax] = useState(toInput(filters.maxPrice));

	// The URL changed elsewhere (chip removed, Clear all, back button): show its values.
	useEffect(() => {
		setMin(toInput(filters.minPrice));
		setMax(toInput(filters.maxPrice));
	}, [filters.minPrice, filters.maxPrice]);

	const enabled = isPriceFilterApplicable(filters.pricing);
	const minPrice = toPrice(min);
	const maxPrice = toPrice(max);
	const rangeError = minPrice != null && maxPrice != null && minPrice > maxPrice;
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;

	const apply = () => {
		if (rangeError) return;
		const next = { minPrice: minPrice === undefined ? null : minPrice, maxPrice: maxPrice === undefined ? null : maxPrice };
		if (next.minPrice === filters.minPrice && next.maxPrice === filters.maxPrice) {
			// Nothing changes; still tidy an unusable entry such as "-5".
			setMin(toInput(filters.minPrice));
			setMax(toInput(filters.maxPrice));
			return;
		}
		onChange(next);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') apply();
	};

	const field = (label: string, value: string, setValue: (value: string) => void) => (
		<Box component="label" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1, fontSize: 12, color: 'muted' }}>
			{label}
			<OutlinedInput
				type="number"
				value={value}
				disabled={!enabled}
				onChange={(event) => setValue(event.target.value)}
				onBlur={apply}
				onKeyDown={onKeyDown}
				inputProps={{
					min: 0,
					max: PRICE_MAX,
					step: 'any',
					inputMode: 'decimal',
					'aria-describedby': rangeError ? `${errorId} ${hintId}` : hintId,
					'aria-invalid': rangeError || undefined,
				}}
				error={rangeError}
				sx={smallInputSx}
			/>
		</Box>
	);

	return (
		<Group legend={t('agents:filters.price')}>
			<Box sx={{ display: 'flex', gap: 2 }}>
				{field(t('agents:filters.priceMin'), min, setMin)}
				{field(t('agents:filters.priceMax'), max, setMax)}
			</Box>
			{rangeError && (
				<FormHelperText id={errorId} error role="alert" sx={{ m: 0 }}>
					{t('agents:filters.priceRangeError')}
				</FormHelperText>
			)}
			<Typography id={hintId} variant="caption" component="p" sx={{ lineHeight: 1.5 }}>
				{enabled ? t('agents:filters.priceHint') : t('agents:filters.priceDisabledHint')}
			</Typography>
		</Group>
	);
};

/** "Add a tag and press Enter". Chips for the added tags are in ActiveFilters. */
const TagInput = ({ filters, onChange }: AgentFiltersPanelProps) => {
	const { t } = useTranslation('agents');
	const id = useId();
	const [value, setValue] = useState('');
	const full = filters.tags.length >= TAGS_MAX;

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		const tag = normalizeTag(value);
		if (!tag) return;
		if (!filters.tags.includes(tag)) onChange({ tags: [...filters.tags, tag] });
		setValue('');
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Typography component="label" htmlFor={id} sx={{ ...legendSx, mb: 0 }}>
				{t('agents:filters.tags')}
			</Typography>
			<OutlinedInput
				id={id}
				value={value}
				disabled={full}
				placeholder={t('agents:filters.tagPlaceholder')}
				onChange={(event) => setValue(event.target.value)}
				onKeyDown={onKeyDown}
				inputProps={{ maxLength: TAG_MAX_LENGTH, 'aria-describedby': `${id}-hint`, enterKeyHint: 'done' }}
				sx={smallInputSx}
			/>
			<Typography id={`${id}-hint`} variant="caption" component="p">
				{full ? t('agents:filters.tagLimit', { max: TAGS_MAX }) : t('agents:filters.tagHint')}
			</Typography>
		</Box>
	);
};

/** Agents.html filter panel: category, pricing, price range, tags. */
export const AgentFiltersPanel = ({ filters, onChange, variant = 'aside' }: AgentFiltersPanelProps & PanelVariant) => {
	const { t } = useTranslation(['agents', 'common']);

	const checkbox = (key: string, label: string, checked: boolean, onToggle: () => void) => (
		<FormControlLabel
			key={key}
			label={label}
			control={<Checkbox size="small" checked={checked} onChange={onToggle} sx={{ py: 1 }} />}
			sx={{ m: 0, gap: 1, '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 500 } }}
		/>
	);

	const frame =
		variant === 'aside'
			? ({
					component: 'aside',
					'aria-label': t('agents:filters.label'),
					sx: {
						flex: '1 1 240px',
						maxWidth: 280,
						minWidth: 0,
						// Below md the same panel opens in FiltersDrawer, so results come first.
						display: { xs: 'none', md: 'flex' },
						flexDirection: 'column',
						gap: 5,
						p: 5,
						bgcolor: 'surface',
						border: 1,
						borderColor: 'border',
						borderRadius: radiusPx.lg,
					},
				} as const)
			: ({ component: 'div', sx: { display: 'flex', flexDirection: 'column', gap: 5 } } as const);

	return (
		<Box {...frame}>
			<Group legend={t('agents:filters.category')}>
				{AGENT_CATEGORIES.map((category) =>
					checkbox(category, t(`common:enums.AgentCategory.${category}`), filters.categories.includes(category), () =>
						onChange({ categories: toggle(filters.categories, category) }),
					),
				)}
			</Group>
			<Divider />
			<Group legend={t('agents:filters.pricing')}>
				{AGENT_PRICINGS.map((pricing) =>
					checkbox(pricing, t(`common:enums.ProductPricing.${pricing}`), filters.pricing.includes(pricing), () =>
						onChange({ pricing: toggle(filters.pricing, pricing) }),
					),
				)}
			</Group>
			<Divider />
			<PriceRange filters={filters} onChange={onChange} />
			<Divider />
			<TagInput filters={filters} onChange={onChange} />
		</Box>
	);
};
