import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import {
	AgentsCatalog,
	AgentsCatalogQuery,
	AgentsSeo,
	ProductFacetsQuery,
	agentFacetsVariables,
	agentsListVariables,
	parseAgentFilters,
} from '@/features/agents';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const filters = parseAgentFilters(query);
	// The results, the counts for these filters, and the counts of everything (the hero's total).
	// A failed one leaves its cache entry empty: the browser asks again and shows the error state if it still fails.
	await Promise.all([
		client.query({ query: AgentsCatalogQuery, variables: agentsListVariables(filters) }).catch(() => undefined),
		client.query({ query: ProductFacetsQuery, variables: agentFacetsVariables(filters) }).catch(() => undefined),
		client.query({ query: ProductFacetsQuery, variables: { input: {} } }).catch(() => undefined),
	]);

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
