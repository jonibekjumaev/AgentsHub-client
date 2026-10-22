import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { AgentsListQuery } from '@/features/agents';
import { BriefsListQuery } from '@/features/briefs';
import { CreatorsListQuery } from '@/features/creators';
import { HomePage, latestBriefsVariables, topAgentsVariables, topCreatorsVariables } from '@/features/home';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

/** Regenerated at most every 5 minutes (ISR): the home lists change slowly and the page stays fast. */
const REVALIDATE_SECONDS = 300;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	// No auth header: public data only (CLAUDE.md rules 11–12). A failed section is left out.
	const client = initializeApollo();
	await Promise.all([
		client.query({ query: AgentsListQuery, variables: topAgentsVariables() }).catch(() => undefined),
		client.query({ query: BriefsListQuery, variables: latestBriefsVariables() }).catch(() => undefined),
		client.query({ query: CreatorsListQuery, variables: topCreatorsVariables() }).catch(() => undefined),
	]);
	return addApolloState(client, {
		props: { ...(await serverSideTranslations(locale ?? 'en', ['common', 'home', 'agents', 'briefs', 'creators', 'follows', 'errors'])) },
		revalidate: REVALIDATE_SECONDS,
	});
};

const Home: NextPageWithLayout = () => {
	const { t } = useTranslation('home');
	return (
		<>
			<Seo title={t('home:seo.title')} description={t('home:seo.description')} />
			<HomePage />
		</>
	);
};

Home.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default Home;
