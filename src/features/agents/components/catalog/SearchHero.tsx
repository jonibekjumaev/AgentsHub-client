import { useTranslation } from 'next-i18next';
import { AgentCategory, ProductPricing } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { SearchBand } from '@/shared/ui/catalog';
import type { FilterPatch } from '../../hooks/useAgentFilters';
import { SEARCH_TEXT_MAX, type AgentFilters } from '../../lib/listQuery';

export { PLACEHOLDER_INTERVAL_MS, SEARCH_DEBOUNCE_MS } from '@/shared/ui/catalog';
export const PLACEHOLDER_COUNT = 5;

/** "Try:" pills: one click applies a search or a filter. */
const SUGGESTIONS: { key: string; patch: FilterPatch }[] = [
	{ key: 'support', patch: { categories: [AgentCategory.CustomerSupport] } },
	{ key: 'invoices', patch: { text: 'invoice' } },
	{ key: 'blog', patch: { text: 'blog' } },
	{ key: 'free', patch: { pricing: [ProductPricing.Free] } },
];

type SearchHeroProps = {
	filters: AgentFilters;
	onChange: (patch: FilterPatch) => void;
	/** All ACTIVE agents (the sum of the category counts); null while unknown. */
	total: number | null;
};

/** The /agents search band: headline, the agent count, the debounced search field and "Try:" suggestions. */
export const SearchHero = ({ filters, onChange, total }: SearchHeroProps) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	return (
		<SearchBand
			titleId="agents-title"
			inputId="agents-search"
			title={t('agents:hero.title')}
			// Text search covers names only today; descriptions come with semantic search (embeddings).
			text={total === null ? t('agents:hero.textNoCount') : t('agents:hero.text', { count: total, formatted: format.number(total) })}
			value={filters.text}
			onSearch={(text) => onChange({ text })}
			maxLength={SEARCH_TEXT_MAX}
			examples={Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => t(`agents:hero.examples.${index}`))}
			suggestions={SUGGESTIONS.map(({ key, patch }) => ({ key, label: t(`agents:hero.suggestions.${key}`), onPick: () => onChange(patch) }))}
			labels={{
				search: t('agents:list.searchLabel'),
				clear: t('agents:hero.clear'),
				submit: t('agents:hero.submit'),
				try: t('agents:hero.try'),
			}}
		/>
	);
};
