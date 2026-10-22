import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { MyBriefs } from '@/features/briefs';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

// Translations only: the user's briefs are fetched in the browser after auth (CLAUDE.md rule 11).
export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'briefs', 'dashboard', 'errors'])),
	},
});

const MyBriefsPage: NextPageWithLayout = () => {
	const { t } = useTranslation('briefs');

	return (
		<>
			<Seo title={t('briefs:mine.title')} noindex />
			<MyBriefs />
		</>
	);
};

MyBriefsPage.getLayout = (page) => <DashboardLayout roles={['USER']}>{page}</DashboardLayout>;

export default MyBriefsPage;
