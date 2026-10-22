import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { AgentDetail, AgentDetailSeo, prefetchAgentDetail } from '@/features/agents';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

type AgentPageProps = { agentId: string };

export const getServerSideProps: GetServerSideProps<AgentPageProps> = async ({ params, locale }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const result = await prefetchAgentDetail(client, params?.id);
	// Not public (missing, deleted, PAUSED, malformed id): a real 404, not a soft one.
	if (!result.found) return { notFound: true };

	return addApolloState(client, {
		props: {
			agentId: result.agentId,
			...(await serverSideTranslations(locale ?? 'en', ['common', 'agents', 'comments', 'follows', 'errors'])),
		},
	});
};

const AgentPage: NextPageWithLayout<AgentPageProps> = ({ agentId }) => (
	<>
		<AgentDetailSeo agentId={agentId} />
		<AgentDetail agentId={agentId} />
	</>
);

AgentPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default AgentPage;
