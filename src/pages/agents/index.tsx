import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { AgentsCatalog, AgentsListQuery, AgentsSeo, agentsListVariables, parseAgentFilters } from '@/features/agents';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	try {
		await client.query({ query: AgentsListQuery, variables: agentsListVariables(parseAgentFilters(query)) });
	} catch {
		// Leave the cache empty: the browser runs the query again and shows the error state if it still fails.
	}

	return addApolloState(client, {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'agents', 'errors'])),
		},
	});
};

const AgentsPage: NextPageWithLayout = () => (
	<>
		<AgentsSeo />
		<AgentsCatalog />
	</>
);

AgentsPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default AgentsPage;
