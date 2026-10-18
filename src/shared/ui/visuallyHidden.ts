import type { SxProps, Theme } from '@mui/material/styles';

/** Read by screen readers, invisible on screen. */
export const visuallyHidden: SxProps<Theme> = {
	position: 'absolute',
	width: 1,
	height: 1,
	p: 0,
	m: -1,
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
	whiteSpace: 'nowrap',
	border: 0,
};
