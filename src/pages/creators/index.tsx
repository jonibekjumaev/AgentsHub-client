import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { CreatorsCatalog, CreatorsListQuery, CreatorsSeo, creatorsListVariables, parseCreatorFilters } from '@/features/creators';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	try {
		await client.query({ query: CreatorsListQuery, variables: creatorsListVariables(parseCreatorFilters(query)) });
	} catch {
		// The browser runs the query again and shows the error state if it still fails.
	}
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
