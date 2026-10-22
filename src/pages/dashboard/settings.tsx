import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AccountSettings } from '@/features/account';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the member's own data is fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors', 'account', 'auth'])),
	},
});

const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('account');

	return (
		<>
			<Seo title={t('account:title')} noindex />
			<AccountSettings />
		</>
	);
};

// ADMIN too: an admin must be able to change their own password and nick (the backend allows it: AuthGuard only).
Page.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER', 'ADMIN']}>{page}</DashboardLayout>;

export default Page;
