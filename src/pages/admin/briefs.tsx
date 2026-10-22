import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AdminBriefs } from '@/features/admin';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: admin data needs the ADMIN token and is fetched in the browser (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'admin', 'community', 'errors'])) },
});

const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('admin');
	return (
		<>
			<Seo title={t('admin:briefs.title')} noindex />
			<AdminBriefs />
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout roles={['ADMIN']}>{page}</DashboardLayout>;

export default Page;
