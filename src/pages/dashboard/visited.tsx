import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SavedAgents } from '@/features/agents';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the member's own data is fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors', 'saved', 'agents'])),
	},
});

const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('saved');

	return (
		<>
			<Seo title={t('saved:visited.title')} noindex />
			<SavedAgents kind="visited" />
		</>
	);
};

Page.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default Page;
