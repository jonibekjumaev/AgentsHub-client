import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { ArticleDetail, ArticleDetailSeo, prefetchArticleDetail } from '@/features/community';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

type ArticlePageProps = { articleId: string };

export const getServerSideProps: GetServerSideProps<ArticlePageProps> = async ({ params, locale }) => {
	const client = initializeApollo();
	const result = await prefetchArticleDetail(client, params?.id);
	if (!result.found) return { notFound: true };
	return addApolloState(client, {
		props: {
			articleId: result.articleId,
			...(await serverSideTranslations(locale ?? 'en', ['common', 'community', 'comments', 'errors'])),
		},
	});
};

const ArticlePage: NextPageWithLayout<ArticlePageProps> = ({ articleId }) => (
	<>
		<ArticleDetailSeo articleId={articleId} />
		<ArticleDetail articleId={articleId} />
	</>
);

ArticlePage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default ArticlePage;
