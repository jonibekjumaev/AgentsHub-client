import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { AgentsListQuery } from '@/features/agents';
import { BriefsListQuery } from '@/features/briefs';
import { CreatorsListQuery } from '@/features/creators';
import {
	HOME_AGENT_TABS,
	HOME_CATEGORIES,
	HomePage,
	categoryAgentsVariables,
	homeAgentsVariables,
	latestBriefsVariables,
	topCreatorsVariables,
} from '@/features/home';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

/** Regenerated at most every 5 minutes (ISR): the home lists change slowly and the page stays fast. */
const REVALIDATE_SECONDS = 300;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
	// No auth header: public data only (CLAUDE.md rules 11–12). A failed section is left out.
	const client = initializeApollo();
	// In parallel: the three agent tabs, a few names per category, open briefs and top creators (14 small queries).
	await Promise.all([
		...HOME_AGENT_TABS.map((tab) => client.query({ query: AgentsListQuery, variables: homeAgentsVariables(tab) }).catch(() => undefined)),
		...HOME_CATEGORIES.map((category) =>
			client.query({ query: AgentsListQuery, variables: categoryAgentsVariables(category) }).catch(() => undefined),
		),
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
