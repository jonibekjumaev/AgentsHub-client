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
	display: '--font-display',
} as const;

const systemSans = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const systemMono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const fonts = {
	/** Manrope has no Hangul — Noto Sans KR comes next in the stack. */
	sans: `var(${fontVars.sans}), var(${fontVars.korean}), ${systemSans}`,
	mono: `var(${fontVars.mono}), ${systemMono}`,
	/** Headings. Glyphs Bricolage lacks (Cyrillic, Hangul) come from Manrope / Noto Sans KR. */
	display: `var(${fontVars.display}), var(${fontVars.sans}), var(${fontVars.korean}), ${systemSans}`,
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

/**
 * Radii for `sx` / `styled`. A bare number in sx `borderRadius` is multiplied by shape.borderRadius
 * (10px), so components always use these strings (an ESLint rule rejects numbers there).
 */
export const radiusPx = {
	sm: `${radius.sm}px`,
	md: `${radius.md}px`,
	lg: `${radius.lg}px`,
	xl: `${radius.xl}px`,
	pill: `${radius.pill}px`,
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

/** Decorative fills that have no flat-color equivalent (profile cover, DESIGN member-profile). */
export const gradients = {
	profileCover: `linear-gradient(120deg, ${colors.accent} 0%, #7C3AED 55%, #22D3EE 120%)`,
	/** Dot grid laid over the cover, faded in from the left by a mask. */
	profileCoverDots: 'radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)',
} as const;

/** Elevations for raised elements on flat surfaces (the profile avatar, the sticky mobile nav). */
export const shadows = {
	soft: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
	raised: '0 12px 28px -8px rgba(16, 24, 40, 0.14), 0 2px 6px rgba(16, 24, 40, 0.05)',
} as const;

/**
 * Home hero (agentshub-hero design): decorative layers, orbit rings and the example agent cards.
 * Only the hero uses these; everything else in the hero reads the regular colors above.
 */
export const hero = {
	glow: 'radial-gradient(ellipse 1100px 560px at 50% 92%, rgba(79, 70, 229, 0.16), rgba(79, 70, 229, 0) 72%)',
	dots: 'radial-gradient(rgba(67, 56, 202, 0.2) 1px, transparent 1.4px)',
	dotsMask: 'radial-gradient(ellipse 62% 55% at 50% 32%, #000 0%, rgba(0, 0, 0, 0.55) 45%, transparent 78%)',
	auroraIndigo: 'rgba(99, 102, 241, 0.2)',
	auroraSky: 'rgba(56, 189, 248, 0.16)',
	/** Fades the carousel out at the left and right edges. */
	edgeMask: 'linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
	ringDashed: 'rgba(67, 56, 202, 0.22)',
	ringSolid: 'rgba(67, 56, 202, 0.16)',
	/** Signal dots travelling on the outer ring: [dot, glow / trail]. */
	signals: {
		indigo: ['#4F46E5', 'rgba(79, 70, 229, 0.45)', 'rgba(79, 70, 229, 0.55)', 'rgba(79, 70, 229, 0)'],
		green: ['#12B76A', 'rgba(18, 183, 106, 0.45)', 'rgba(18, 183, 106, 0.55)', 'rgba(18, 183, 106, 0)'],
		amber: ['#F79009', 'rgba(247, 144, 9, 0.45)', 'rgba(247, 144, 9, 0.55)', 'rgba(247, 144, 9, 0)'],
	},
	liveDot: '#12B76A',
	livePulse: 'rgba(18, 183, 106, 0.45)',
	livePulseEnd: 'rgba(18, 183, 106, 0)',
	badgeBorder: '#DCDDFB',
	cardRadius: '18px',
	cardShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 14px 34px rgba(55, 48, 163, 0.12)',
	cardOutput: '#F8F9FC',
	cardOutputBorder: '#EEF0F6',
	/** Icon tile per example card: [background, icon color]. */
	tints: {
		indigo: ['#EEF0FF', '#4338CA'],
		orange: ['#FFF1E6', '#B54708'],
		green: ['#E8F7EF', '#067647'],
		rose: ['#FDECEF', '#C01048'],
		blue: ['#E6F4FF', '#175CD3'],
		violet: ['#F4EEFF', '#6927DA'],
		teal: ['#E6F6F4', '#0E7066'],
		amber: ['#FEF7E6', '#93370D'],
		iris: ['#EEF0FF', '#3538CD'],
		slate: ['#F0F2F5', '#344054'],
	},
} as const;

export type HeroTint = keyof typeof hero.tints;
export type HeroSignal = keyof typeof hero.signals;

/**
 * Home page sections (agentshub-home design): the dark "night" sections, the footer, category tints and
 * the bigger radii of the marketing layout. Category tints are keyed by the AgentCategory enum value.
 */
export const home = {
	night: '#1E1B4B',
	nightText: '#C7D2FE',
	nightTextSoft: '#E0E7FF',
	nightLine: 'rgba(199, 210, 254, 0.18)',
	nightLineStrong: 'rgba(199, 210, 254, 0.55)',
	nightFill: 'rgba(255, 255, 255, 0.06)',
	nightFillStrong: 'rgba(255, 255, 255, 0.12)',
	nightDots: 'radial-gradient(rgba(199, 210, 254, 0.14) 1px, transparent 1.4px)',
	nightGlow: 'rgba(129, 140, 248, 0.28)',
	nightShadow: '0 30px 60px rgba(8, 6, 40, 0.45)',
	chatAgent: '#4F46E5',
	footer: '#101828',
	footerText: '#CBD5E1',
	footerMuted: '#98A2B3',
	footerLine: '#1F2A3D',
	footerButtonBorder: '#344054',
	dashedBorder: '#A5ACF0',
	topBorder: '#C7CBF5',
	topShadow: '0 18px 40px rgba(55, 48, 163, 0.14)',
	cardShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
	topCreatorBg: '#F5F6FF',
	rankChip: 'rgba(255, 255, 255, 0.9)',
	/** Fades a vertically scrolling list in and out at the top and bottom edges. */
	fadeY: 'linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)',
	fadeYFeed: 'linear-gradient(180deg, transparent, #000 10%, #000 88%, transparent)',
	softLine: 'rgba(16, 24, 40, 0.1)',
	invoiceBg: '#E8F7EF',
	invoiceBorder: '#C9EED9',
	invoiceInk: '#054F31',
	invoiceNumber: '#067647',
	invoiceText: '#085D3A',
	postChip: '#FFF1E6',
	postChipText: '#93370D',
	slotEmpty: '#F2F4F7',
	heart: '#C01048',
	/** Lead score bars: [bar, number]. */
	scoreHot: ['#C01048', '#C01048'],
	scoreWarm: ['#F79009', '#B54708'],
	scoreMid: ['#4338CA', '#3730A3'],
	scoreCold: ['#98A2B3', '#475467'],
	/** Creator rank badges: [background, text]. */
	medals: [
		['#4338CA', '#FFFFFF'],
		['#475467', '#FFFFFF'],
		['#B54708', '#FFFFFF'],
	],
	medalOther: ['#EAECF0', '#344054'],
	ctaText: '#E0E7FF',
	ctaOrbit: 'rgba(255, 255, 255, 0.35)',
	ctaRing: 'rgba(255, 255, 255, 0.22)',
	ctaGlow: '0 0 18px 4px rgba(255, 255, 255, 0.55)',
	ctaOutline: 'rgba(255, 255, 255, 0.75)',
	focusRing: '#818CF8',
	radius: { panel: '26px', band: '32px', card: '22px', step: '20px', tile: '16px', button: '12px' },
	/** [tint, icon color] per agent category. */
	categories: {
		CUSTOMER_SUPPORT: ['#EEF0FF', '#4338CA'],
		SALES: ['#FDECEF', '#C01048'],
		MARKETING: ['#FFF1E6', '#B54708'],
		CONTENT: ['#F4EEFF', '#6927DA'],
		DATA_ANALYSIS: ['#E6F4FF', '#175CD3'],
		AUTOMATION: ['#E6F6F4', '#0E7066'],
		EDUCATION: ['#FEF7E6', '#93370D'],
		OTHER: ['#F0F2F5', '#344054'],
	},
} as const;

/** The /agents catalog (agentshub-agents design): dark search band and the sticky filter toolbar. */
export const catalog = {
	heroDots: 'radial-gradient(rgba(199, 210, 254, 0.16) 1px, transparent 1.4px)',
	heroDotsMask: 'radial-gradient(ellipse 70% 90% at 50% 0%, #000 20%, transparent 80%)',
	heroGlow: 'rgba(99, 102, 241, 0.35)',
	searchShadow: '0 24px 60px rgba(8, 6, 40, 0.35)',
	searchFocus: '0 0 0 4px rgba(129, 140, 248, 0.45), 0 24px 60px rgba(8, 6, 40, 0.35)',
	placeholder: '#98A2B3',
	suggestionBorder: 'rgba(199, 210, 254, 0.35)',
	suggestionBg: 'rgba(255, 255, 255, 0.08)',
	toolbarBg: 'rgba(246, 247, 249, 0.92)',
	selectedCountBg: 'rgba(255, 255, 255, 0.18)',
	divider: '#D0D5DD',
	/** Faded, disabled filter option (0 results). */
	disabledOpacity: 0.45,
	heart: '#C01048',
} as const;

/**
 * /briefs feed (agentshub-briefs design): deadline and status colors (text / dot / soft background), the live
 * badge in the dark hero, and the list container's row divider and hover.
 */
export const briefFeed = {
	deadline: {
		future: { text: '#067647', dot: '#12B76A' },
		soon: { text: '#B54708', dot: '#F79009' },
		passed: { text: '#B42318', dot: '#F04438' },
		none: { text: '#344054', dot: '#98A2B3' },
	},
	openPill: { bg: '#E8F7EF', text: '#067647', dot: '#12B76A' },
	pastPill: { bg: '#FEF3F2', text: '#B42318', dot: '#F04438' },
	liveBadge: { bg: 'rgba(18, 183, 106, 0.16)', border: 'rgba(110, 231, 183, 0.35)', text: '#D1FADF', dot: '#32D583' },
	rowDivider: '#EEF0F4',
	rowHover: '#FAFAFF',
	/** Past-deadline rows, when shown. */
	pastOpacity: 0.8,
} as const;
