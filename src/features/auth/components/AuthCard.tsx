import type { FormEventHandler, ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';

type AuthCardProps = {
	title: string;
	subtitle: string;
	onSubmit: FormEventHandler<HTMLFormElement>;
	children: ReactNode;
};

const cardSx = {
	width: '100%',
	display: 'flex',
	flexDirection: 'column',
	gap: 5,
	p: { xs: 6, sm: 9 },
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	borderRadius: radiusPx.xl,
} as const;

/** The form shell of Login.html / Signup.html: h1 + subtitle, then the fields. */
export const AuthCard = ({ title, subtitle, onSubmit, children }: AuthCardProps) => (
	<Box component="form" noValidate onSubmit={onSubmit} sx={cardSx}>
		<Box>
			<Typography variant="h1" sx={{ fontSize: 28 }}>
				{title}
			</Typography>
			<Typography sx={{ mt: 2, color: 'muted' }}>{subtitle}</Typography>
		</Box>
		{children}
	</Box>
);

/** While the session is unknown or a member is being redirected away. */
export const AuthCardSkeleton = ({ fields = 2 }: { fields?: number }) => {
	const { t } = useTranslation('common');

	return (
		<Box role="status" aria-busy="true" aria-label={t('common:status.loading')} sx={cardSx}>
			<Skeleton variant="text" width="60%" sx={{ fontSize: 28 }} aria-hidden="true" />
			{Array.from({ length: fields }, (_, i) => (
				<Skeleton key={i} variant="rounded" height={70} aria-hidden="true" />
			))}
			<Skeleton variant="rounded" height={50} aria-hidden="true" />
		</Box>
	);
};
