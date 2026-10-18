import type { GetStaticProps } from 'next';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';
import { StatusPage } from '@/shared/ui';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const NotFoundPage: NextPageWithLayout = () => {
	const { t } = useTranslation('common');

	return (
		<>
			<Seo title={t('common:errorPages.notFound.title')} noindex />
			<StatusPage
				code="404"
				icon={<SearchOffIcon />}
				title={t('common:errorPages.notFound.title')}
				text={t('common:errorPages.notFound.text')}
				action={{ label: t('common:errorPages.home'), href: '/' }}
			/>
		</>
	);
};

NotFoundPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default NotFoundPage;
