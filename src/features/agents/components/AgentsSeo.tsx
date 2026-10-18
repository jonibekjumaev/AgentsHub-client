import { useTranslation } from 'next-i18next';
import { Seo } from '@/shared/layout/Seo';
import { useAgentFilters } from '../hooks/useAgentFilters';
import { canonicalAgentsPath } from '../lib/listQuery';

/**
 * Title and description follow the filters: one category gets its own landing title,
 * page 2+ says so. The canonical URL keeps only category and pricing (see canonicalAgentsPath).
 */
export const AgentsSeo = () => {
	const { t } = useTranslation(['agents', 'common']);
	const { filters } = useAgentFilters();

	const [category] = filters.categories;
	const single = filters.categories.length === 1 ? t(`common:enums.AgentCategory.${category}`) : null;
	const base = single ? t('agents:seo.categoryTitle', { category: single }) : t('agents:seo.title');
	const title = filters.page > 1 ? t('agents:seo.paged', { title: base, page: filters.page }) : base;
	const description = single ? t('agents:seo.categoryDescription', { category: single }) : t('agents:seo.description');

	return <Seo title={title} description={description} canonicalPath={canonicalAgentsPath(filters)} />;
};
