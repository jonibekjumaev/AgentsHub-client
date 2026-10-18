import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { InboxOutlined as InboxOutlinedIcon } from '@mui/icons-material';

type EmptyAction = { label: string } & ({ onClick: () => void; href?: never } | { href: string; onClick?: never });

type EmptyStateProps = {
	title: string;
	text?: string;
	icon?: ReactNode;
	/** At most one primary action (DESIGN §3 Feedback). */
	action?: EmptyAction;
	/** Heading level for the title, to fit the page outline. */
	headingLevel?: 'h2' | 'h3';
};

/** DESIGN §3: icon in an accentSoft square, title 800, one line of text, one primary action. */
export const EmptyState = ({ title, text, icon, action, headingLevel = 'h2' }: EmptyStateProps) => (
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
			borderRadius: 3,
		}}
	>
		<Box
			aria-hidden="true"
			sx={{
				display: 'grid',
				placeItems: 'center',
				width: 56,
				height: 56,
				borderRadius: 3,
				bgcolor: 'accentSoft',
				color: 'primary.main',
				mb: 4,
			}}
		>
			{icon ?? <InboxOutlinedIcon />}
		</Box>
		<Typography variant="h3" component={headingLevel}>
			{title}
		</Typography>
		{text && (
			<Typography variant="body2" sx={{ mt: 1.5, color: 'bodySoft', maxWidth: 420 }}>
				{text}
			</Typography>
		)}
		{action && (
			<Box sx={{ mt: 5 }}>
				{action.href ? (
					<Button component={NextLink} href={action.href}>
						{action.label}
					</Button>
				) : (
					<Button onClick={action.onClick}>{action.label}</Button>
				)}
			</Box>
		)}
	</Box>
);
