import type { GetStaticProps } from 'next';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';
import { StatusPage } from '@/shared/ui';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const ServerErrorPage: NextPageWithLayout = () => {
	const { t } = useTranslation('common');

	return (
		<>
			<Seo title={t('common:errorPages.serverError.title')} noindex />
			<StatusPage
				code="500"
				icon={<ErrorOutlineIcon />}
				title={t('common:errorPages.serverError.title')}
				text={t('common:errorPages.serverError.text')}
				action={{ label: t('common:errorPages.home'), href: '/' }}
			/>
		</>
	);
};

ServerErrorPage.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default ServerErrorPage;
