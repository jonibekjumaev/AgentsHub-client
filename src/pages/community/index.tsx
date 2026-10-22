import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { ArticlesListQuery, CommunityBoard, CommunitySeo, articlesListVariables, parseArticleFilters } from '@/features/community';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

export const getServerSideProps: GetServerSideProps = async ({ locale, query }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12). The chat is browser-only.
	const client = initializeApollo();
	try {
		await client.query({ query: ArticlesListQuery, variables: articlesListVariables(parseArticleFilters(query)) });
	} catch {
		// The browser runs the query again and shows the error state if it still fails.
	}
	return addApolloState(client, {
		props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'community', 'errors'])) },
	});
};

const CommunityPage: NextPageWithLayout = () => (
	<>
		<CommunitySeo />
		<CommunityBoard />
	</>
);

CommunityPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default CommunityPage;
