import { Box, ButtonBase, Link, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { radiusPx } from '@/theme/tokens';
import type { FilterPatch } from '../hooks/useAgentFilters';
import { hasActiveFilters, type AgentFilters } from '../lib/listQuery';

type ActiveFiltersProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	onClear: () => void;
};

type ActiveChip = { key: string; label: string; remove: FilterPatch };

/** Agents.html "Active filters": one removable chip per filter value, then "Clear all". */
export const ActiveFilters = ({ filters, onChange, onClear }: ActiveFiltersProps) => {
	const { t } = useTranslation(['agents', 'common']);
	const format = useFormat();
	if (!hasActiveFilters(filters)) return null;

	const { minPrice, maxPrice } = filters;
	const chips: ActiveChip[] = [
		...filters.categories.map((category) => ({
			key: `category-${category}`,
			label: t(`common:enums.AgentCategory.${category}`),
			remove: { categories: filters.categories.filter((item) => item !== category) },
		})),
		...filters.pricing.map((pricing) => ({
			key: `pricing-${pricing}`,
			label: t(`common:enums.ProductPricing.${pricing}`),
			remove: { pricing: filters.pricing.filter((item) => item !== pricing) },
		})),
		...(minPrice !== null || maxPrice !== null
			? [
					{
						key: 'price',
						label:
							minPrice !== null && maxPrice !== null
								? t('agents:filters.priceBetween', { min: format.price(minPrice), max: format.price(maxPrice) })
								: minPrice !== null
									? t('agents:filters.priceFrom', { min: format.price(minPrice) })
									: t('agents:filters.priceUpTo', { max: format.price(maxPrice ?? 0) }),
						remove: { minPrice: null, maxPrice: null },
					},
				]
			: []),
		...filters.tags.map((tag) => ({
			key: `tag-${tag}`,
			label: t('agents:filters.tagChip', { tag }),
			remove: { tags: filters.tags.filter((item) => item !== tag) },
		})),
		...(filters.text ? [{ key: 'text', label: `“${filters.text}”`, remove: { text: '' } }] : []),
	];

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
			<Typography variant="meta" component="span">
				{t('agents:filters.active')}
			</Typography>
			<Box component="ul" sx={{ display: 'contents', listStyle: 'none' }}>
				{chips.map((chip) => (
					<li key={chip.key}>
						<ButtonBase
							onClick={() => onChange(chip.remove)}
							aria-label={t('agents:filters.remove', { label: chip.label })}
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1.5,
								height: 30,
								px: 2.5,
								borderRadius: radiusPx.pill,
								border: 1,
								borderColor: 'accentBorder',
								bgcolor: 'accentSoft',
								color: 'primary.main',
								fontSize: 12,
								fontWeight: 700,
								maxWidth: '100%',
								'&:hover': { borderColor: 'primary.main' },
								'&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
							}}
						>
							<Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{chip.label}
							</Box>
							<CloseIcon aria-hidden="true" sx={{ fontSize: 14 }} />
						</ButtonBase>
					</li>
				))}
			</Box>
			<Link component="button" type="button" onClick={onClear} sx={{ fontSize: 13, fontWeight: 700 }}>
				{t('agents:filters.clearAll')}
			</Link>
		</Box>
	);
};
