import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { MY_BRIEFS_PATH } from '@/features/briefs';
import { PageSkeleton } from '@/shared/ui/Skeletons';
import { CreatorOverview } from './CreatorOverview';

/**
 * /dashboard: the creator overview (S3a). A USER has no overview (DESIGN §5 sidebar starts at My briefs),
 * so they are sent there with replace (the back button skips /dashboard). ADMIN keeps the placeholder.
 */
export const DashboardHome = () => {
	const { t } = useTranslation('dashboard');
	const { me } = useAuth();
	const router = useRouter();
	// The router object changes after every navigation; a ref keeps the redirect to once per member.
	const routerRef = useRef(router);
	routerRef.current = router;
	const isUser = me?.memberType === 'USER';

	useEffect(() => {
		if (isUser) void routerRef.current.replace(MY_BRIEFS_PATH);
	}, [isUser]);

	if (me?.memberType === 'CREATOR') return <CreatorOverview />;
	if (isUser) return <PageSkeleton variant="rows" count={3} />;
	return (
		<>
			<Typography variant="h1">{t('dashboard:placeholder.title')}</Typography>
			<Typography sx={{ mt: 2, color: 'muted' }}>{t('dashboard:placeholder.text')}</Typography>
		</>
	);
};
