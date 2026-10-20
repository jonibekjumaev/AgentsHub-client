import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { BriefDetail, BriefDetailSeo, prefetchBriefDetail } from '@/features/briefs';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

type BriefPageProps = { briefId: string };

export const getServerSideProps: GetServerSideProps<BriefPageProps> = async ({ params, locale }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const result = await prefetchBriefDetail(client, params?.id);
	// Deleted, missing or a malformed id: a real 404, not a soft one. CLOSED briefs stay readable (D-30).
	if (!result.found) return { notFound: true };

	return addApolloState(client, {
		props: {
			briefId: result.briefId,
			...(await serverSideTranslations(locale ?? 'en', ['common', 'briefs', 'comments', 'errors'])),
		},
	});
};

const BriefPage: NextPageWithLayout<BriefPageProps> = ({ briefId }) => (
	<>
		<BriefDetailSeo briefId={briefId} />
		<BriefDetail briefId={briefId} />
	</>
);

BriefPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default BriefPage;
