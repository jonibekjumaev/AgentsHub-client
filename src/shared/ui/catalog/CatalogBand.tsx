import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { catalog, colors, home } from '@/theme/tokens';

type CatalogBandProps = {
	/** id of the h1, also the section's accessible name */
	titleId: string;
	title: string;
	text: ReactNode;
	/** Above the headline (the /briefs live badge, the /creators faces). */
	badge?: ReactNode;
	/** Under the text: the search field and the "Try:" row (SearchBand). */
	children?: ReactNode;
};

/**
 * The dark band at the top of the catalog pages (/agents, /briefs, /creators, /community): the night ground
 * with dots and a glow, an optional badge, the headline and the text. SearchBand adds the search under it;
 * /community uses it on its own.
 */
export const CatalogBand = ({ titleId, title, text: subtitle, badge, children }: CatalogBandProps) => (
	<Box
		component="section"
		aria-labelledby={titleId}
		sx={{
			position: 'relative',
			overflow: 'hidden',
			bgcolor: home.night,
			color: colors.white,
		}}
	>
		<Box
			aria-hidden="true"
			sx={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				backgroundImage: catalog.heroDots,
				backgroundSize: '24px 24px',
				WebkitMaskImage: catalog.heroDotsMask,
				maskImage: catalog.heroDotsMask,
			}}
		/>
		<Box
			aria-hidden="true"
			sx={{
				position: 'absolute',
				left: '50%',
				bottom: -260,
				width: 900,
				height: 420,
				ml: '-450px',
				borderRadius: '50%',
				bgcolor: catalog.heroGlow,
				filter: 'blur(100px)',
				pointerEvents: 'none',
			}}
		/>
		<Box
			sx={{
				position: 'relative',
				maxWidth: 960,
				mx: 'auto',
				px: { xs: 4, sm: 6 },
				pt: { xs: 12, md: badge ? 14 : 16 },
				pb: { xs: 11, md: 13 },
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 5,
				textAlign: 'center',
			}}
		>
			{badge}
			<Typography
				id={titleId}
				variant="h1"
				sx={{
					fontSize: 'clamp(38px, 5vw, 64px)',
					lineHeight: 1,
					fontWeight: 700,
					letterSpacing: '-0.04em',
					color: colors.white,
					// a "\n" in the title is a chosen line break
					whiteSpace: 'pre-line',
				}}
			>
				{title}
			</Typography>
			<Typography
				sx={{
					maxWidth: 560,
					fontSize: { xs: 16, sm: 18 },
					lineHeight: 1.5,
					color: home.nightText,
				}}
			>
				{subtitle}
			</Typography>
			{children}
		</Box>
	</Box>
);
