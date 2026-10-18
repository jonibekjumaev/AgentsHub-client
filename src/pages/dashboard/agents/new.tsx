import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NewAgent } from '@/features/agents';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the form talks to the API from the browser, with the creator's token.
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'agents', 'dashboard', 'errors'])),
	},
});

const NewAgentPage: NextPageWithLayout = () => <NewAgent />;

NewAgentPage.getLayout = (page) => <DashboardLayout roles={['CREATOR']}>{page}</DashboardLayout>;

export default NewAgentPage;
