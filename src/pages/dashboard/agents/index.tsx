import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MyAgents } from '@/features/agents';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the creator's agents are fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors'])),
	},
});

const MyAgentsPage: NextPageWithLayout = () => {
	const { t } = useTranslation('dashboard');

	return (
		<>
			<Seo title={t('dashboard:myAgents.title')} noindex />
			<MyAgents />
		</>
	);
};

MyAgentsPage.getLayout = (page) => <DashboardLayout roles={['CREATOR']}>{page}</DashboardLayout>;

export default MyAgentsPage;
