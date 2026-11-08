import { useTranslation } from 'next-i18next';
import { Seo } from '@/shared/layout/Seo';
import { useCreatorFilters } from '../hooks/useCreatorFilters';
import { CREATORS_PATH, hasActiveCreatorFilters } from '../lib/creatorsQuery';

/** One canonical /creators; filtered views (search, categories, following, all creators) are not indexed. */
export const CreatorsSeo = () => {
	const { t } = useTranslation('creators');
	const { filters } = useCreatorFilters();
	const base = t('creators:seo.title');
	const title = filters.page > 1 ? t('creators:seo.paged', { title: base, page: filters.page }) : base;
	return (
		<Seo
			title={title}
			description={t('creators:seo.description')}
			canonicalPath={CREATORS_PATH}
			noindex={hasActiveCreatorFilters(filters) || !filters.withAgentsOnly}
		/>
	);
};
