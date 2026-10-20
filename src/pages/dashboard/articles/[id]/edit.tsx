import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { EditArticle } from '@/features/community';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

type EditArticlePageProps = { articleId: string };

export const getServerSideProps: GetServerSideProps<EditArticlePageProps> = async ({ params, locale }) => ({
	props: {
		articleId: typeof params?.id === 'string' ? params.id : '',
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'community', 'errors'])),
	},
});

const EditArticlePage: NextPageWithLayout<EditArticlePageProps> = ({ articleId }) => <EditArticle articleId={articleId} />;

EditArticlePage.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default EditArticlePage;
