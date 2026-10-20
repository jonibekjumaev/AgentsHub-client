import { useTranslation } from 'next-i18next';
import { Seo } from '@/shared/layout/Seo';
import { useArticleFilters } from '../hooks/useArticleFilters';
import { articlesHref, DEFAULT_ARTICLE_FILTERS } from '../lib/articles';

/** A category keeps its own canonical page; search is not indexed. */
export const CommunitySeo = () => {
	const { t } = useTranslation('community');
	const { filters } = useArticleFilters();
	const category = filters.category ? t(`community:categories.${filters.category}`) : null;
	const base = category ? t('community:seo.categoryTitle', { category }) : t('community:seo.title');
	const title = filters.page > 1 ? t('community:seo.paged', { title: base, page: filters.page }) : base;
	return (
		<Seo
			title={title}
			description={t('community:seo.description')}
			canonicalPath={articlesHref({ ...DEFAULT_ARTICLE_FILTERS, category: filters.category })}
			noindex={Boolean(filters.text)}
		/>
	);
};
