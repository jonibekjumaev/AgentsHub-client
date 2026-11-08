import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import {
	CreatorFacetsQuery,
	CreatorsCatalog,
	CreatorsCatalogQuery,
	CreatorsHeroStatsQuery,
	CreatorsSeo,
	creatorFacetsVariables,
	creatorsListVariables,
	parseCreatorFilters,
} from '@/features/creators';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const filters = parseCreatorFilters(query);
	// In parallel; a failure leaves that part of the cache empty, and the browser asks again (and shows the error).
	await Promise.all([
		client.query({ query: CreatorsCatalogQuery, variables: creatorsListVariables(filters) }).catch(() => undefined),
		client.query({ query: CreatorFacetsQuery, variables: creatorFacetsVariables(filters) }).catch(() => undefined),
		client.query({ query: CreatorsHeroStatsQuery }).catch(() => undefined),
	]);
	return addApolloState(client, {
		props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'creators', 'follows', 'errors'])) },
	});
};

const CreatorsPage: NextPageWithLayout = () => (
	<>
		<CreatorsSeo />
		<CreatorsCatalog />
	</>
);

CreatorsPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default CreatorsPage;
