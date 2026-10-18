import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Read by screen readers, invisible on screen. Sizes are px strings on purpose: in sx a bare `1`
 * means 100% for width/height and one spacing unit (4px) for margin.
 */
export const visuallyHidden: SxProps<Theme> = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	padding: 0,
	margin: '-1px',
	overflow: 'hidden',
	clip: 'rect(0 0 0 0)',
	whiteSpace: 'nowrap',
	border: 0,
};
