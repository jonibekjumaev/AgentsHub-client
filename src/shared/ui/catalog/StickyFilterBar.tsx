import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { catalog } from '@/theme/tokens';

/** The sticky, blurred filter bar under the catalog search band: a category rail row, then a controls row. */
export const StickyFilterBar = ({ children }: { children: ReactNode }) => (
	<Box
		sx={{
			position: 'sticky',
			top: 0,
			zIndex: 5,
			bgcolor: catalog.toolbarBg,
			backdropFilter: 'blur(10px)',
			WebkitBackdropFilter: 'blur(10px)',
			borderBottom: 1,
			borderColor: 'border',
		}}
	>
		<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, py: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</Box>
	</Box>
);

/** The second row: filters on the left, sort and layout on the right; wraps on narrow screens. */
export const FilterBarRow = ({ start, end }: { start: ReactNode; end: ReactNode }) => (
	<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, minWidth: 0, maxWidth: '100%' }}>{start}</Box>
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>{end}</Box>
	</Box>
);

/** A thin vertical divider between filter groups (hidden on phones, where the row wraps). */
export const FilterDivider = () => (
	<Box aria-hidden="true" sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', height: 26, mx: 1.5, bgcolor: catalog.divider }} />
);
