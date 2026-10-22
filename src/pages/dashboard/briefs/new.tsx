import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NewBrief } from '@/features/briefs';
import { DashboardLayout, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the form talks to the API from the browser, with the user's token.
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'briefs', 'dashboard', 'errors'])),
	},
});

const NewBriefPage: NextPageWithLayout = () => <NewBrief />;

NewBriefPage.getLayout = (page) => <DashboardLayout roles={['USER']}>{page}</DashboardLayout>;

export default NewBriefPage;
