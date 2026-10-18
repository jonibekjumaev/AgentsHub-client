import { Box, Card, CardContent, Divider, Skeleton, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

/** Mirrors AgentCard: 16:10 image, category chip, title, "by @nick", divider, price + meta. */
export const CardSkeleton = () => (
	<Card aria-hidden="true">
		<Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 10', height: 'auto' }} />
		<CardContent sx={{ p: 4 }}>
			<Skeleton variant="rounded" width={96} height={22} sx={{ borderRadius: 999 }} />
			<Skeleton variant="text" width="80%" sx={{ mt: 2, fontSize: 17 }} />
			<Skeleton variant="text" width="40%" sx={{ fontSize: 13 }} />
			<Divider sx={{ my: 3 }} />
			<Stack direction="row" justifyContent="space-between">
				<Skeleton variant="text" width={56} sx={{ fontSize: 15 }} />
				<Skeleton variant="text" width={88} sx={{ fontSize: 13 }} />
			</Stack>
		</CardContent>
	</Card>
);

/** Mirrors a brief row: status + category chips, title, meta line, actions on the right. */
export const RowSkeleton = () => (
	<Card aria-hidden="true">
		<CardContent sx={{ p: 4, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
			<Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
				<Stack direction="row" spacing={2}>
					<Skeleton variant="rounded" width={56} height={20} sx={{ borderRadius: 999 }} />
					<Skeleton variant="rounded" width={96} height={20} sx={{ borderRadius: 999 }} />
				</Stack>
				<Skeleton variant="text" width="70%" sx={{ mt: 2, fontSize: 17 }} />
				<Skeleton variant="text" width="45%" sx={{ fontSize: 13 }} />
			</Box>
			<Stack direction="row" spacing={2}>
				<Skeleton variant="rounded" width={72} height={36} />
				<Skeleton variant="rounded" width={72} height={36} />
			</Stack>
		</CardContent>
	</Card>
);

type PageSkeletonProps = {
	variant?: 'cards' | 'rows';
	count?: number;
};

/** A page title + a card grid or a row list. One busy region for assistive tech; the shapes are hidden. */
export const PageSkeleton = ({ variant = 'cards', count = 6 }: PageSkeletonProps) => {
	const { t } = useTranslation('common');
	const items = Array.from({ length: count }, (_, index) => index);

	return (
		<Box role="status" aria-busy="true" aria-label={t('common:status.loading')}>
			<Skeleton variant="text" width={280} sx={{ fontSize: 32, maxWidth: '70%' }} aria-hidden="true" />
			<Skeleton variant="text" width={200} sx={{ fontSize: 13, mb: 6, maxWidth: '50%' }} aria-hidden="true" />
			{variant === 'cards' ? (
				<Box sx={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
					{items.map((index) => (
						<CardSkeleton key={index} />
					))}
				</Box>
			) : (
				<Stack spacing={3}>
					{items.map((index) => (
						<RowSkeleton key={index} />
					))}
				</Stack>
			)}
		</Box>
	);
};
