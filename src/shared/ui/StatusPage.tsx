import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { radiusPx } from '@/theme/tokens';

type StatusPageProps = {
	/** "404", "500" — shown in mono above the title. */
	code: string;
	title: string;
	text: string;
	icon: ReactNode;
	action: { label: string; href: string };
};

/** Full-page error (404/500) in the EmptyState style: icon square, h1, one line, one primary action. */
export const StatusPage = ({ code, title, text, icon, action }: StatusPageProps) => (
	<Box sx={{ maxWidth: 560, mx: 'auto', px: { xs: 4, sm: 6 }, pt: { xs: 10, sm: 16 }, pb: 16 }}>
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				py: 12,
				px: 6,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
			}}
		>
			<Box
				aria-hidden="true"
				sx={{
					display: 'grid',
					placeItems: 'center',
					width: 56,
					height: 56,
					borderRadius: radiusPx.lg,
					bgcolor: 'accentSoft',
					color: 'primary.main',
					mb: 4,
				}}
			>
				{icon}
			</Box>
			<Typography variant="monoStat" component="p" sx={{ color: 'muted', mb: 1 }}>
				{code}
			</Typography>
			<Typography variant="h1" sx={{ fontSize: 30 }}>
				{title}
			</Typography>
			<Typography variant="body1" sx={{ mt: 2, color: 'bodySoft', maxWidth: 420 }}>
				{text}
			</Typography>
			<Button component={NextLink} href={action.href} sx={{ mt: 6 }}>
				{action.label}
			</Button>
		</Box>
	</Box>
);
