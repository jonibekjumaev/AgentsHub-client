import { useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { AppliedChips } from '@/shared/ui/catalog';
import type { FilterPatch } from '../hooks/useAgentFilters';
import { hasActiveFilters, type AgentFilters } from '../lib/listQuery';

type ActiveFiltersProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	onClear: () => void;
};

type ActiveChip = { key: string; label: string; remove: FilterPatch };

/** The applied filters: one removable chip per value (the search text first), then "Clear all". */
export const ActiveFilters = ({ filters, onChange, onClear }: ActiveFiltersProps) => {
	const { t } = useTranslation(['agents', 'common']);
	const format = useFormat();
	if (!hasActiveFilters(filters)) return null;

	const { minPrice, maxPrice } = filters;
	const chips: ActiveChip[] = [
		...(filters.text ? [{ key: 'text', label: `“${filters.text}”`, remove: { text: '' } }] : []),
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
	];

	return (
		<AppliedChips
			chips={chips.map(({ key, label, remove }) => ({ key, label, onRemove: () => onChange(remove) }))}
			onClear={onClear}
			labels={{ remove: (label) => t('agents:filters.remove', { label }), clearAll: t('agents:filters.clearAll') }}
		/>
	);
};
