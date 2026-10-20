import { useTranslation } from 'next-i18next';
import { Seo } from '@/shared/layout/Seo';
import { useBriefFilters } from '../hooks/useBriefFilters';
import { canonicalBriefsPath } from '../lib/listQuery';

/**
 * Title and description follow the filters: a category gets its own title, the closed tab says so,
 * page 2+ says so. Search results are not indexed (thin, endless variants).
 */
export const BriefsSeo = () => {
	const { t } = useTranslation(['briefs', 'common']);
	const { filters } = useBriefFilters();

	const category = filters.category ? t(`common:enums.AgentCategory.${filters.category}`) : null;
	let base = category ? t('briefs:seo.categoryTitle', { category }) : t('briefs:seo.title');
	if (filters.tab === 'closed') base = t('briefs:seo.closed', { title: base });
	const title = filters.page > 1 ? t('briefs:seo.paged', { title: base, page: filters.page }) : base;
	const description = category ? t('briefs:seo.categoryDescription', { category }) : t('briefs:seo.description');

	return <Seo title={title} description={description} canonicalPath={canonicalBriefsPath(filters)} noindex={Boolean(filters.text)} />;
};
