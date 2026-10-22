import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NewArticle } from '@/features/community';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'community', 'errors'])) },
});

const NewArticlePage: NextPageWithLayout = () => <NewArticle />;

NewArticlePage.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default NewArticlePage;
