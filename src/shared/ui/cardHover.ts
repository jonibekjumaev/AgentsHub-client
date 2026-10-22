/**
 * Hover state of a clickable card (agent and creator cards): the card lifts a little and gets a soft shadow and an
 * accent border. Only on devices that really hover (no sticky hover on touch), and without movement for people who
 * ask for reduced motion. No image zoom: scaling a large cover image made the hover lag on /agents.
 */
export const cardHoverSx = {
	transition: 'border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
	'@media (hover: hover)': {
		'&:hover': {
			borderColor: 'accentBorder',
			boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
			transform: 'translateY(-2px)',
		},
	},
	'@media (prefers-reduced-motion: reduce)': {
		transition: 'border-color 150ms ease, box-shadow 150ms ease',
		'&:hover': { transform: 'none' },
	},
} as const;
