import { Fragment, type ReactNode, type Ref } from 'react';
import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import { focusVisibleSx } from '@/shared/ui/catalog';
import type { Crumb } from './NightBand';

type DashboardHeaderProps = {
	title: ReactNode;
	subtitle?: ReactNode;
	/** The page's main action ("New agent", "Write an article"), right of the title from sm. */
	action?: ReactNode;
	/** A light breadcrumb above the title (the form pages). */
	crumbs?: { label: string; items: Crumb[] };
	/** Pages that move focus to their title after a tab or page change. */
	headingRef?: Ref<HTMLHeadingElement>;
};

/** The dashboard title weight of the catalog design: display font, tight tracking. */
export const dashboardTitleSx = {
	fontSize: { xs: 28, md: 34 },
	lineHeight: 1.1,
	fontWeight: 700,
	letterSpacing: '-0.02em',
	overflowWrap: 'anywhere',
	outline: 'none',
} as const;

/**
 * The top of every dashboard page (Phase 1.4): an optional breadcrumb, the h1 in the display font, one muted
 * line under it, and the page's action on the right. One component, so the subpages line up with the overview.
 */
export const DashboardHeader = ({ title, subtitle, action, crumbs, headingRef }: DashboardHeaderProps) => (
	<Box
		component="header"
		sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}
	>
		<Box sx={{ minWidth: 0, flex: '1 1 320px' }}>
			{crumbs && (
				<Box component="nav" aria-label={crumbs.label} sx={{ mb: 3 }}>
					<Box
						component="ol"
						sx={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: 2,
							m: 0,
							p: 0,
							listStyle: 'none',
							fontSize: 13,
							color: 'muted',
						}}
					>
						{crumbs.items.map((item, index) => (
							<Fragment key={`${index}-${item.label}`}>
								{index > 0 && <li aria-hidden="true">/</li>}
								{item.href ? (
									<li>
										<Link
											component={NextLink}
											href={item.href}
											sx={{ color: 'muted', fontWeight: 500, ...focusVisibleSx }}
										>
											{item.label}
										</Link>
									</li>
								) : (
									<Box
										component="li"
										aria-current="page"
										sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}
									>
										{item.label}
									</Box>
								)}
							</Fragment>
						))}
					</Box>
				</Box>
			)}
			<Typography ref={headingRef} tabIndex={headingRef ? -1 : undefined} variant="h1" sx={dashboardTitleSx}>
				{title}
			</Typography>
			{subtitle && (
				<Typography component="div" sx={{ mt: 2, color: 'muted', fontSize: 15, maxWidth: 640 }}>
					{subtitle}
				</Typography>
			)}
		</Box>
		{action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
	</Box>
);
