import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { CalendarTile, CreatorCtaTile, InvoicesTile, LeadScoresTile, SocialQueueTile, SupportChatTile } from './bento/tiles';
import { SectionTitle, frameSx } from './kit';

/**
 * "Watch agents do the work": a bento grid of small looping demos (illustrative, and the intro says so).
 * 4 columns from md (900px), one column below.
 */
export const AgentsAtWork = () => {
	const { t } = useTranslation('home');
	return (
		<Box
			component="section"
			aria-labelledby="home-work"
			sx={{ ...frameSx, pt: { xs: 14, md: 18 }, pb: { xs: 16, md: 24 }, display: 'flex', flexDirection: 'column', gap: 10 }}
		>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5 }}>
				<SectionTitle id="home-work" size="lg" sx={{ maxWidth: 640, lineHeight: 1 }}>
					{t('home:work.title')}
				</SectionTitle>
				<Typography sx={{ maxWidth: 400, fontSize: 17, lineHeight: 1.55, color: 'bodySoft' }}>{t('home:work.text')}</Typography>
			</Box>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(4, minmax(0, 1fr))' },
					gridAutoRows: 'minmax(250px, auto)',
					gap: 4,
				}}
			>
				<SupportChatTile />
				<LeadScoresTile />
				<CalendarTile />
				<InvoicesTile />
				<SocialQueueTile />
				<CreatorCtaTile />
			</Box>
		</Box>
	);
};
