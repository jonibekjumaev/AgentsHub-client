import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { NightBand } from '@/shared/ui/page/NightBand';
import { colors, fonts, home, radiusPx } from '@/theme/tokens';

type StatusPageProps = {
	/** "404", "500" — shown in mono above the title. */
	code: string;
	title: string;
	text: string;
	icon: ReactNode;
	action: { label: string; href: string };
	/**
	 * card (default): a centered card, for pages inside a layout with its own chrome (the dashboard's 404s).
	 * band: the night band of the catalog pages, for the standalone /404 and /500.
	 */
	variant?: 'card' | 'band';
};

/** Full-page error (404/500) in the EmptyState style: icon square, h1, one line, one primary action. */
export const StatusPage = ({ code, title, text, icon, action, variant = 'card' }: StatusPageProps) =>
	variant === 'band' ? (
		<NightBand
			maxWidth={760}
			align="center"
			top={
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2.5,
						color: home.nightText,
						fontFamily: fonts.mono,
						fontSize: 14,
						fontWeight: 600,
					}}
				>
					<Box
						aria-hidden="true"
						sx={{
							display: 'grid',
							placeItems: 'center',
							width: 40,
							height: 40,
							borderRadius: home.radius.button,
							bgcolor: 'rgba(199, 210, 254, 0.14)',
							color: colors.white,
							'& svg': { fontSize: 22 },
						}}
					>
						{icon}
					</Box>
					<span>{code}</span>
				</Box>
			}
			title={title}
			meta={text}
		>
			<Box sx={{ pb: { xs: 2, md: 6 } }}>
				<Button component={NextLink} href={action.href} sx={{ mt: 2, height: 46, px: 6 }}>
					{action.label}
				</Button>
			</Box>
		</NightBand>
	) : (
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
					borderRadius: home.radius.card,
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
				<Typography variant="h1" sx={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' }}>
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
