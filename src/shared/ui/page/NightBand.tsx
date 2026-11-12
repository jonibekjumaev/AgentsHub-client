import { Fragment, type ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import { focusVisibleSx } from '@/shared/ui/catalog';
import { catalog, colors, fonts, home } from '@/theme/tokens';

export type Crumb = { label: string; href?: string };

/** Breadcrumb on the night ground: links in nightText, the current page (no href) in white. */
export const NightBreadcrumbs = ({ label, items }: { label: string; items: Crumb[] }) => (
	<Box component="nav" aria-label={label}>
		<Box
			component="ol"
			sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none', fontSize: 13, color: home.nightText }}
		>
			{items.map((item, index) => (
				<Fragment key={`${index}-${item.label}`}>
					{index > 0 && <li aria-hidden="true">/</li>}
					{item.href ? (
						<li>
							<Link
								component={NextLink}
								href={item.href}
								sx={{ color: home.nightText, fontWeight: 500, '&:hover': { color: colors.white }, ...focusVisibleSx }}
							>
								{item.label}
							</Link>
						</li>
					) : (
						<Box component="li" aria-current="page" sx={{ color: colors.white, fontWeight: 600, overflowWrap: 'anywhere' }}>
							{item.label}
						</Box>
					)}
				</Fragment>
			))}
		</Box>
	</Box>
);

type NightBandProps = {
	/** The breadcrumb (or anything else above the pills). */
	top?: ReactNode;
	/** Pills under the breadcrumb (status, category, topic). */
	pills?: ReactNode;
	title: ReactNode;
	titleId?: string;
	/** One line under the title: dates, views, counts. */
	meta?: ReactNode;
	/** Right side of the band from md (an avatar, an action). */
	aside?: ReactNode;
	/** Narrower content (info and status pages). */
	maxWidth?: number;
	align?: 'left' | 'center';
	children?: ReactNode;
};

/**
 * The top of a page in the AgentsHub catalog language (agentshub-briefs design): the night ground of the /agents,
 * /briefs, /creators and /community bands with the faint dots, white display title, nightText meta.
 * Used by the detail pages, the member profile, the info and status pages.
 */
export const NightBand = ({ top, pills, title, titleId, meta, aside, maxWidth = 1200, align = 'left', children }: NightBandProps) => (
	<Box component="header" sx={{ position: 'relative', overflow: 'hidden', bgcolor: home.night, color: colors.white }}>
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
			sx={{
				position: 'relative',
				maxWidth,
				mx: 'auto',
				px: { xs: 4, sm: 6 },
				pt: { xs: 8, md: 10 },
				pb: { xs: 9, md: 11 },
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'flex-end',
				justifyContent: align === 'center' ? 'center' : 'space-between',
				gap: 6,
				textAlign: align,
			}}
		>
			<Box
				sx={{
					flex: '1 1 520px',
					minWidth: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: align === 'center' ? 'center' : 'stretch',
					gap: 4.5,
				}}
			>
				{top}
				{pills && <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 2 }}>{pills}</Box>}
				<Typography
					id={titleId}
					variant="h1"
					sx={{
						maxWidth: 900,
						fontFamily: fonts.display,
						fontSize: 'clamp(28px, 4vw, 44px)',
						lineHeight: 1.08,
						fontWeight: 700,
						letterSpacing: '-0.03em',
						color: colors.white,
						overflowWrap: 'anywhere',
					}}
				>
					{title}
				</Typography>
				{meta && <Typography sx={{ fontSize: 14, color: home.nightText }}>{meta}</Typography>}
				{children}
			</Box>
			{aside && <Box sx={{ flex: 'none' }}>{aside}</Box>}
		</Box>
	</Box>
);
