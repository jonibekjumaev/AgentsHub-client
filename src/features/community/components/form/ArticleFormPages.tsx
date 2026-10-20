import { useQuery } from '@apollo/client';
import { Skeleton, Stack, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { Seo } from '@/shared/layout/Seo';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusPage } from '@/shared/ui/StatusPage';
import { OwnerArticleQuery } from '../../graphql/articles';
import { EMPTY_ARTICLE_FORM, MY_ARTICLES_PATH, fromArticle, isObjectId } from '../../lib/articles';
import { ArticleForm } from './ArticleForm';

const ArticleNotFound = () => {
	const { t } = useTranslation(['common', 'community']);
	return (
		<>
			<Seo title={t('common:errorPages.notFound.title')} noindex />
			<StatusPage
				code="404"
				icon={<SearchOffIcon />}
				title={t('common:errorPages.notFound.title')}
				text={t('common:errorPages.notFound.text')}
				action={{ label: t('community:mine.title'), href: MY_ARTICLES_PATH }}
			/>
		</>
	);
};

/** /dashboard/articles/new */
export const NewArticle = () => {
	const { t } = useTranslation('community');
	return (
		<Stack spacing={6}>
			<Seo title={t('community:form.newTitle')} noindex />
			<Typography variant="h1">{t('community:form.newTitle')}</Typography>
			<ArticleForm mode="create" initialValues={EMPTY_ARTICLE_FORM} />
		</Stack>
	);
};

/** /dashboard/articles/[id]/edit — own ACTIVE articles only, else 404. */
export const EditArticle = ({ articleId }: { articleId: string }) => {
	const { t } = useTranslation('community');
	const { me } = useAuth();
	const validId = isObjectId(articleId);
	const { data, loading, error, refetch } = useQuery(OwnerArticleQuery, { variables: { articleId }, skip: !validId, fetchPolicy: 'network-only' });

	if (!validId) return <ArticleNotFound />;
	if (loading && !data) return <Skeleton variant="rounded" height={420} aria-label={t('community:form.loading')} />;
	if (error && !data) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return <ArticleNotFound />;
		return <ErrorState error={error} title={t('community:form.errors.loadFailed')} onRetry={() => void refetch()} />;
	}
	const article = data?.getBoardArticle;
	if (!article || !me || article.memberId !== me._id || article.articleStatus !== 'ACTIVE') return <ArticleNotFound />;

	return (
		<Stack spacing={6}>
			<Seo title={t('community:form.editTitle')} noindex />
			<Typography variant="h1">{t('community:form.editTitle')}</Typography>
			<ArticleForm key={`${article._id}-${article.updatedAt}`} mode="edit" articleId={article._id} initialValues={fromArticle(article)} />
		</Stack>
	);
};
