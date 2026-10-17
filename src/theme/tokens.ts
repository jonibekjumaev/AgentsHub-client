/**
 * Design tokens — docs/DESIGN.md §2. The MUI theme reads only from here.
 */

export const colors = {
	ground: '#F6F7F9',
	surface: '#FFFFFF',
	surfaceMuted: '#FAFBFC',
	ink: '#0F172A',
	body: '#334155',
	bodySoft: '#475569',
	muted: '#5B6475',
	border: '#E3E7EE',
	borderSoft: '#EEF1F5',
	inputBorder: '#CBD2DC',
	accent: '#4338CA',
	accentHover: '#312E81',
	accentSoft: '#EEF0FF',
	accentBorder: '#C7CCFF',
	success: '#0F766E',
	successSoft: '#E6F4F2',
	warning: '#92400E',
	warningSoft: '#FEF3C7',
	danger: '#B91C1C',
	dangerBorder: '#DC2626',
	dangerSoft: '#FEF2F2',
	dangerSoftBorder: '#FECACA',
	dangerInk: '#991B1B',
	neutralSoft: '#F1F3F6',
	white: '#FFFFFF',
} as const;

/** CSS variables are set in _app from next/font (see theme/fonts.ts). */
export const fontVars = {
	sans: '--font-sans',
	mono: '--font-mono',
	korean: '--font-korean',
} as const;

const systemSans = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const systemMono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const fonts = {
	/** Manrope has no Hangul — Noto Sans KR comes next in the stack. */
	sans: `var(${fontVars.sans}), var(${fontVars.korean}), ${systemSans}`,
	mono: `var(${fontVars.mono}), ${systemMono}`,
} as const;

export const fontWeights = {
	regular: 400,
	medium: 500,
	semibold: 600,
	bold: 700,
	extrabold: 800,
} as const;

/** Type scale — §2.2. Sizes in px. */
export const typeScale = {
	h1: { fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 },
	h2: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 },
	h3: { fontSize: 17, fontWeight: 800, letterSpacing: '0', lineHeight: 1.4 },
	body: { fontSize: 15, fontWeight: 500, lineHeight: 1.65 },
	bodySmall: { fontSize: 14, fontWeight: 500, lineHeight: 1.55 },
	meta: { fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
	caption: { fontSize: 12, fontWeight: 500, lineHeight: 1.5 },
	overline: { fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', lineHeight: 1.5 },
	monoStat: { fontSize: 20, fontWeight: 500, lineHeight: 1.3 },
	monoInline: { fontSize: 15, fontWeight: 500, lineHeight: 1.5 },
} as const;

/** Spacing scale (px) — §2.3. MUI spacing unit is 4px. */
export const spacingScale = [4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 64] as const;
export const spacingUnit = 4;

export const radius = {
	sm: 8,
	md: 10,
	lg: 12,
	xl: 16,
	pill: 999,
} as const;

export const layout = {
	containerMaxWidth: 1200,
	formMaxWidth: 1100,
	containerPadding: 24,
	containerPaddingMobile: 16,
	headerHeight: 64,
	pageTop: 40,
	pageBottom: 64,
} as const;

export const controlHeights = {
	buttonSmall: 36,
	buttonMedium: 44,
	buttonLarge: 50,
	input: 46,
} as const;
