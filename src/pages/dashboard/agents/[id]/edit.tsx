import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { EditAgent } from '@/features/agents';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

type EditAgentPageProps = { agentId: string };

// Translations and the id only: the agent is the creator's own data, loaded in the browser after auth (rule 11).
export const getServerSideProps: GetServerSideProps<EditAgentPageProps> = async ({ params, locale }) => ({
	props: {
		agentId: typeof params?.id === 'string' ? params.id : '',
		...(await serverSideTranslations(locale ?? 'en', ['common', 'agents', 'dashboard', 'errors'])),
	},
});

const EditAgentPage: NextPageWithLayout<EditAgentPageProps> = ({ agentId }) => <EditAgent agentId={agentId} />;

EditAgentPage.getLayout = (page) => <DashboardLayout roles={['CREATOR']}>{page}</DashboardLayout>;

export default EditAgentPage;
