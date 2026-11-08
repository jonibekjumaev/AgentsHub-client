import { keyframes } from '@mui/material/styles';
import { home } from '@/theme/tokens';

const pop = keyframes`
	from { opacity: 0; transform: translateY(18px) scale(0.98); }
	to { opacity: 1; transform: none; }
`;

/** Catalog results rise in when they change; 0.05s apart, at most 8 steps. Off under reduced motion. */
export const enterSx = (index: number) =>
	({
		animation: `${pop} 0.5s cubic-bezier(.2,.7,.2,1) ${Math.min(index, 8) * 0.05}s both`,
		'@media (prefers-reduced-motion: reduce)': { animation: 'none' },
	}) as const;

/** The 3px indigo focus ring of the catalog pages (agentshub designs). */
export const focusRingSx = { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' } as const;

/** `focusRingSx` on keyboard focus only. */
export const focusVisibleSx = { '&:focus-visible': focusRingSx } as const;
