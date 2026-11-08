import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ProfileVisitors } from '@/features/dashboard';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the member's own data is fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors', 'follows'])),
	},
});

/** D-42: who viewed my profile. ADMIN has no public profile, so no visitors either. */
const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('dashboard');

	return (
		<>
			<Seo title={t('dashboard:visitors.title')} noindex />
			<ProfileVisitors />
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default Page;
