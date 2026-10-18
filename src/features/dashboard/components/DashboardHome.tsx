import { Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { CreatorOverview } from './CreatorOverview';

/** /dashboard: the creator overview (S3a). Other roles keep the placeholder until their slices. */
export const DashboardHome = () => {
	const { t } = useTranslation('dashboard');
	const { me } = useAuth();

	if (me?.memberType === 'CREATOR') return <CreatorOverview />;
	return (
		<>
			<Typography variant="h1">{t('dashboard:placeholder.title')}</Typography>
			<Typography sx={{ mt: 2, color: 'muted' }}>{t('dashboard:placeholder.text')}</Typography>
		</>
	);
};
