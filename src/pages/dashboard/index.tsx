import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DashboardHome } from '@/features/dashboard';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the dashboard is member data, fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors'])),
	},
});

/** ADMIN is still allowed so every sidebar can be checked; its header button leads to /admin. */
const DashboardPage: NextPageWithLayout = () => {
	const { t } = useTranslation('dashboard');

	return (
		<>
			<Seo title={t('dashboard:overview.title')} noindex />
			<DashboardHome />
		</>
	);
};

DashboardPage.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER', 'ADMIN']}>{page}</DashboardLayout>;

export default DashboardPage;
