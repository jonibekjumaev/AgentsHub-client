import type { GetStaticProps } from 'next';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PublicLayout, Seo, type NextPageWithLayout } from '@/shared/layout';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const Home: NextPageWithLayout = () => {
	const { t } = useTranslation('common');

	return (
		<>
			<Seo />
			<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 10, pb: 16 }}>
				<Typography variant="h1">{t('common:app.rebuilding')}</Typography>
			</Box>
		</>
	);
};

Home.getLayout = (page) => <PublicLayout>{page}</PublicLayout>;

export default Home;
