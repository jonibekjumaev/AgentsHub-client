import type { GetStaticProps } from 'next';
import { Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { DashboardLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common', 'dashboard'])),
	},
});

/** Placeholder until the dashboard slice; ADMIN is allowed for now so every sidebar can be checked. */
const DashboardPage: NextPageWithLayout = () => {
	const { t } = useTranslation('dashboard');

	return (
		<>
			<Seo title={t('dashboard:placeholder.title')} noindex />
			<Typography variant="h1">{t('dashboard:placeholder.title')}</Typography>
			<Typography sx={{ mt: 2, color: 'muted' }}>{t('dashboard:placeholder.text')}</Typography>
		</>
	);
};

DashboardPage.getLayout = (page) => <DashboardLayout roles={['CREATOR', 'USER', 'ADMIN']}>{page}</DashboardLayout>;

export default DashboardPage;
