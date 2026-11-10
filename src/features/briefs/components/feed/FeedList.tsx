import { Box, Skeleton } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { briefFeed, home } from '@/theme/tokens';

/** The one white container of a brief feed: rows are separated by thin dividers, not separate cards. */
export const feedSx = {
	m: 0,
	p: 0,
	listStyle: 'none',
	borderRadius: home.radius.card,
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	overflow: 'hidden',
	'& > li + li': { borderTop: `1px solid ${briefFeed.rowDivider}` },
} as const;

/** Four placeholder rows in the feed container (/briefs, saved briefs). */
export const FeedSkeleton = ({ rows = 4 }: { rows?: number }) => {
	const { t } = useTranslation('briefs');
	return (
		<Box role="status" aria-busy="true" aria-label={t('briefs:list.loading')} sx={{ ...feedSx, display: 'block' }}>
			{Array.from({ length: rows }, (_, index) => (
				<Box
					key={index}
					sx={{
						px: 7,
						py: 6.5,
						display: 'flex',
						flexDirection: 'column',
						gap: 2.5,
						borderTop: index ? `1px solid ${briefFeed.rowDivider}` : 0,
					}}
				>
					<Skeleton variant="rounded" width={220} height={24} />
					<Skeleton variant="rounded" width="55%" height={28} />
					<Skeleton variant="rounded" width="85%" height={48} />
					<Skeleton variant="rounded" width={360} height={20} />
				</Box>
			))}
		</Box>
	);
};
