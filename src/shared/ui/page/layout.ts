import { home } from '@/theme/tokens';

/** A white card of the catalog design: 22px corners, thin border (the /briefs feed container, the detail asides). */
export const pageCardSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	p: { xs: 5, sm: 6 },
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	borderRadius: home.radius.card,
} as const;

/** The content under a NightBand: the same 1200px column as the catalog pages. */
export const pageFrameSx = {
	maxWidth: 1200,
	mx: 'auto',
	px: { xs: 4, sm: 6 },
	pt: 6,
	pb: 16,
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
} as const;

/** Detail pages: the main column and a 340px aside from md; the aside spans every row. */
export const detailGridSx = {
	display: 'grid',
	gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
	columnGap: 8,
	rowGap: 6,
	alignItems: 'start',
} as const;

export const detailAsideSx = {
	gridColumn: { md: 2 },
	gridRow: { md: '1 / -1' },
	minWidth: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
} as const;

/** A card's small heading ("Budget", "Creator", "Posted by"). */
export const cardLabelSx = { fontSize: 13, fontWeight: 600, color: 'muted', letterSpacing: 0 } as const;
