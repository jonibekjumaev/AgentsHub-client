import type { ReactNode } from 'react';
import { Typography } from '@mui/material';
import { keyframes, type SxProps, type Theme } from '@mui/material/styles';
import { colors, fonts, home } from '@/theme/tokens';

/** Small shared pieces of the home sections (agentshub-home design). */

/** Content column of every section. */
export const frameSx = { maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 } } as const;

/** Freeze an animation for prefers-reduced-motion. Spread into the animated element's sx. */
export const noMotionSx = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

/** Display type (Bricolage) for text that is not an h1–h3 (numbers, category names). */
export const displaySx = { fontFamily: fonts.display, fontWeight: 700, letterSpacing: '-0.02em' } as const;

/** White outlined button of the design (secondary actions such as "All briefs"). */
export const outlineButtonSx: SxProps<Theme> = {
	minHeight: 44,
	px: 4,
	border: 1,
	borderColor: 'inputBorder',
	borderRadius: home.radius.button,
	bgcolor: 'surface',
	color: 'ink',
	fontSize: 15,
	fontWeight: 700,
	'&:hover': { bgcolor: 'ground', borderColor: 'inputBorder' },
};

/** Visible focus ring for controls on the home page (3px, as in the design). */
export const focusRingSx = { '&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' } } as const;

type SectionTitleProps = {
	id?: string;
	children: ReactNode;
	size?: 'lg' | 'md';
	tone?: 'light' | 'dark';
	sx?: SxProps<Theme>;
};

/** A section's h2: large, tight Bricolage (the theme's h2 font), scaled with the viewport. */
export const SectionTitle = ({ id, children, size = 'md', tone = 'light', sx }: SectionTitleProps) => (
	<Typography
		id={id}
		variant="h2"
		sx={[
			{
				fontSize: size === 'lg' ? 'clamp(36px, 4.4vw, 60px)' : 'clamp(30px, 3.6vw, 48px)',
				lineHeight: 1.02,
				fontWeight: 700,
				letterSpacing: '-0.03em',
				color: tone === 'dark' ? colors.white : 'ink',
			},
			...(Array.isArray(sx) ? sx : [sx]),
		]}
	>
		{children}
	</Typography>
);

export { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';

const pop = keyframes`
	from { opacity: 0; transform: translateY(24px) scale(0.98); }
	to { opacity: 1; transform: none; }
`;

/**
 * Entrance of the cards in a grid: hidden until the grid is in view, then each card rises in with a
 * 0.12s step. Reduced motion: shown at once, no movement.
 */
export const revealSx = (inView: boolean, index: number) =>
	({
		...(inView
			? { animation: `${pop} 0.6s cubic-bezier(.2,.7,.2,1) ${index * 0.12}s both` }
			: { opacity: 0, transform: 'translateY(24px) scale(0.98)' }),
		'@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 1, transform: 'none' },
	}) as const;

/** 3 columns → 2 under 1024px → 1 under 640px. */
export const grid3Sx = {
	m: 0,
	p: 0,
	listStyle: 'none',
	display: 'grid',
	gap: 5,
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	'@media (max-width: 1024px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
	'@media (max-width: 640px)': { gridTemplateColumns: 'minmax(0, 1fr)' },
	'& > *': { minWidth: 0 },
} as const;
