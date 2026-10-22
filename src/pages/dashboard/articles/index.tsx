import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MyArticles } from '@/features/community';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'community', 'errors'])) },
});

const MyArticlesPage: NextPageWithLayout = () => {
	const { t } = useTranslation('community');
	return (
		<>
			<Seo title={t('community:mine.title')} noindex />
			<MyArticles />
		</>
	);
};

MyArticlesPage.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default MyArticlesPage;
