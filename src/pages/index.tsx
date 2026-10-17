import type { GetStaticProps } from 'next';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const Home = () => {
	const { t } = useTranslation('common');

	return (
		<Box component="main" sx={{ p: 4 }}>
			<Typography component="h1" variant="h4">
				{t('common:app.rebuilding')}
			</Typography>
		</Box>
	);
};

export default Home;
