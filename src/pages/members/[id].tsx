import type { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { addApolloState, initializeApollo } from '@/apollo/client';
import { MemberProfile, MemberProfileSeo, prefetchMemberProfile } from '@/features/creators';
import { PublicLayout, type NextPageWithLayout } from '@/shared/layout';

type MemberPageProps = { memberId: string };

export const getServerSideProps: GetServerSideProps<MemberPageProps> = async ({ params, locale }) => {
	// One client per request, no auth header: public data only (CLAUDE.md rules 11–12).
	const client = initializeApollo();
	const result = await prefetchMemberProfile(client, params?.id);
	if (!result.found) return { notFound: true };
	return addApolloState(client, {
		props: {
			memberId: result.memberId,
			...(await serverSideTranslations(locale ?? 'en', ['common', 'creators', 'follows', 'agents', 'briefs', 'errors'])),
		},
	});
};

const MemberPage: NextPageWithLayout<MemberPageProps> = ({ memberId }) => (
	<>
		<MemberProfileSeo memberId={memberId} />
		<MemberProfile memberId={memberId} />
	</>
);

MemberPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default MemberPage;
