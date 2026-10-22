import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AgentPreview } from '@/features/agents';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

type AgentPreviewPageProps = { agentId: string };

// Translations and the id only: a PAUSED agent is the owner's data, loaded in the browser after auth (rule 11).
export const getServerSideProps: GetServerSideProps<AgentPreviewPageProps> = async ({ params, locale }) => ({
	props: {
		agentId: typeof params?.id === 'string' ? params.id : '',
		...(await serverSideTranslations(locale ?? 'en', ['common', 'agents', 'dashboard', 'comments', 'errors'])),
	},
});

const AgentPreviewPage: NextPageWithLayout<AgentPreviewPageProps> = ({ agentId }) => <AgentPreview agentId={agentId} />;

AgentPreviewPage.getLayout = (page) => <DashboardLayout roles={['CREATOR']}>{page}</DashboardLayout>;

export default AgentPreviewPage;
