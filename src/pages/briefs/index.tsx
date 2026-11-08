import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import {
	BriefFacetsQuery,
	BriefsCatalog,
	BriefsListQuery,
	BriefsSeo,
	OpenBriefStatsQuery,
	briefFacetsVariables,
	briefsListVariables,
	parseBriefFilters,
} from '@/features/briefs';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const filters = parseBriefFilters(query);
	// In parallel; a failure leaves that part of the cache empty, and the browser asks again (and shows the error).
	await Promise.all([
		client.query({ query: BriefsListQuery, variables: briefsListVariables(filters) }).catch(() => undefined),
		client.query({ query: BriefFacetsQuery, variables: briefFacetsVariables(filters) }).catch(() => undefined),
		client.query({ query: OpenBriefStatsQuery }).catch(() => undefined),
	]);

	return addApolloState(client, {
		props: {
			...(await serverSideTranslations(locale ?? 'en', ['common', 'briefs', 'errors'])),
		},
	});
};

const BriefsPage: NextPageWithLayout = () => (
	<>
		<BriefsSeo />
		<BriefsCatalog />
	</>
);

BriefsPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default BriefsPage;
