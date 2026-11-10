import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SavedBriefs } from '@/features/briefs';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the member's own data is fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard', 'errors', 'saved', 'briefs'])),
	},
});

const Page: NextPageWithLayout = () => {
	const { t } = useTranslation('saved');

	return (
		<>
			<Seo title={t('saved:briefs.title')} noindex />
			<SavedBriefs />
		</>
	);
};

// D-47: USER and CREATOR members save briefs; an admin has no library.
Page.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER']}>{page}</DashboardLayout>;

export default Page;
