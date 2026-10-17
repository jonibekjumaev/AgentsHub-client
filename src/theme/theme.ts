import { createTheme } from '@mui/material/styles';
import { colors, controlHeights, fonts, fontWeights, radius, spacingUnit, typeScale } from './tokens';

const px = (value: number) => `${value}px`;

export const theme = createTheme({
	spacing: spacingUnit,
	shape: { borderRadius: radius.md },
	palette: {
		mode: 'light',
		primary: {
			main: colors.accent,
			dark: colors.accentHover,
			light: colors.accentSoft,
			contrastText: colors.white,
		},
		error: { main: colors.danger, light: colors.dangerSoft, dark: colors.dangerInk, contrastText: colors.white },
		success: { main: colors.success, light: colors.successSoft, contrastText: colors.white },
		warning: { main: colors.warning, light: colors.warningSoft, contrastText: colors.white },
		background: { default: colors.ground, paper: colors.surface },
		text: { primary: colors.ink, secondary: colors.body, muted: colors.muted },
		divider: colors.border,

		ground: colors.ground,
		surface: colors.surface,
		surfaceMuted: colors.surfaceMuted,
		ink: colors.ink,
		body: colors.body,
		bodySoft: colors.bodySoft,
		muted: colors.muted,
		border: colors.border,
		borderSoft: colors.borderSoft,
		inputBorder: colors.inputBorder,
		accentHover: colors.accentHover,
		accentSoft: colors.accentSoft,
		accentBorder: colors.accentBorder,
		successSoft: colors.successSoft,
		warningSoft: colors.warningSoft,
		dangerBorder: colors.dangerBorder,
		dangerSoft: colors.dangerSoft,
		dangerSoftBorder: colors.dangerSoftBorder,
		dangerInk: colors.dangerInk,
		neutralSoft: colors.neutralSoft,
	},
	typography: {
		fontFamily: fonts.sans,
		fontFamilyMono: fonts.mono,
		fontWeightRegular: fontWeights.regular,
		fontWeightMedium: fontWeights.medium,
		fontWeightBold: fontWeights.extrabold,
		h1: { ...typeScale.h1, fontSize: px(typeScale.h1.fontSize), color: colors.ink },
		h2: { ...typeScale.h2, fontSize: px(typeScale.h2.fontSize), color: colors.ink },
		h3: { ...typeScale.h3, fontSize: px(typeScale.h3.fontSize), color: colors.ink },
		body1: { ...typeScale.body, fontSize: px(typeScale.body.fontSize) },
		body2: { ...typeScale.bodySmall, fontSize: px(typeScale.bodySmall.fontSize) },
		meta: { ...typeScale.meta, fontSize: px(typeScale.meta.fontSize), color: colors.muted },
		caption: { ...typeScale.caption, fontSize: px(typeScale.caption.fontSize), color: colors.muted },
		overline: {
			...typeScale.overline,
			fontSize: px(typeScale.overline.fontSize),
			textTransform: 'uppercase',
			color: colors.muted,
		},
		mono: { ...typeScale.monoInline, fontSize: px(typeScale.monoInline.fontSize), fontFamily: fonts.mono },
		monoStat: { ...typeScale.monoStat, fontSize: px(typeScale.monoStat.fontSize), fontFamily: fonts.mono },
		button: { fontWeight: fontWeights.extrabold, textTransform: 'none', letterSpacing: 0 },
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { backgroundColor: colors.ground, color: colors.body },
			},
		},
		MuiTypography: {
			defaultProps: {
				variantMapping: { meta: 'p', mono: 'span', monoStat: 'span' },
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true, variant: 'contained' },
			styleOverrides: {
				root: {
					borderRadius: radius.md,
					textTransform: 'none',
					fontWeight: fontWeights.extrabold,
					fontSize: px(typeScale.bodySmall.fontSize),
					whiteSpace: 'nowrap',
				},
				sizeSmall: {
					height: controlHeights.buttonSmall,
					borderRadius: radius.sm,
					fontSize: px(typeScale.meta.fontSize),
					padding: '0 14px',
				},
				sizeMedium: { height: controlHeights.buttonMedium, padding: '0 18px' },
				sizeLarge: {
					height: controlHeights.buttonLarge,
					padding: '0 24px',
					fontSize: px(typeScale.body.fontSize),
				},
				containedPrimary: {
					'&:hover': { backgroundColor: colors.accentHover },
				},
				outlined: {
					backgroundColor: colors.surface,
					borderColor: colors.border,
					color: colors.ink,
					fontWeight: fontWeights.bold,
					'&:hover': { backgroundColor: colors.surfaceMuted, borderColor: colors.inputBorder },
				},
				outlinedError: {
					color: colors.danger,
					borderColor: colors.border,
					'&:hover': { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoftBorder },
				},
				text: { fontWeight: fontWeights.bold },
			},
			variants: [
				{
					props: { variant: 'soft' },
					style: {
						backgroundColor: colors.accentSoft,
						border: `1px solid ${colors.accentBorder}`,
						color: colors.accent,
						fontWeight: fontWeights.bold,
						'&:hover': { backgroundColor: colors.accentBorder },
					},
				},
			],
		},
		// Label sits above the field (§3 Form controls) and keeps its color on focus/error.
		MuiFormLabel: {
			styleOverrides: {
				root: {
					display: 'block',
					marginBottom: 6,
					fontSize: px(typeScale.bodySmall.fontSize),
					fontWeight: fontWeights.bold,
					color: colors.ink,
					'&.Mui-focused, &.Mui-error': { color: colors.ink },
				},
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					backgroundColor: colors.surface,
					borderRadius: radius.md,
					fontSize: px(typeScale.body.fontSize),
					fontWeight: fontWeights.medium,
					'& .MuiOutlinedInput-notchedOutline': { borderColor: colors.inputBorder },
					'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.bodySoft },
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.accent, borderWidth: 2 },
					'&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: colors.dangerBorder },
				},
				input: {
					height: controlHeights.input,
					padding: '0 14px',
					boxSizing: 'border-box',
				},
				multiline: { padding: '12px 14px' },
				inputMultiline: { height: 'auto', padding: 0 },
			},
		},
		MuiFormHelperText: {
			styleOverrides: {
				root: {
					marginLeft: 0,
					marginRight: 0,
					fontSize: px(typeScale.caption.fontSize),
					fontWeight: fontWeights.medium,
					color: colors.muted,
					'&.Mui-error': { color: colors.danger, fontWeight: fontWeights.semibold },
				},
			},
		},
		MuiPaper: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: { backgroundImage: 'none' },
				// Flat surfaces get a border; menus/dialogs keep their elevation shadow (DESIGN §2.3).
				elevation0: { border: `1px solid ${colors.border}` },
				outlined: { borderColor: colors.border },
				rounded: { borderRadius: radius.lg },
			},
		},
		MuiCard: {
			defaultProps: { variant: 'outlined' },
			styleOverrides: {
				root: { borderRadius: radius.lg, borderColor: colors.border, boxShadow: 'none' },
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { borderRadius: radius.pill, fontWeight: fontWeights.bold, fontSize: px(typeScale.caption.fontSize) },
				sizeSmall: { height: 24 },
				label: { paddingLeft: 10, paddingRight: 10 },
			},
		},
		MuiDivider: {
			styleOverrides: { root: { borderColor: colors.borderSoft } },
		},
		MuiLink: {
			defaultProps: { underline: 'hover' },
			styleOverrides: { root: { color: colors.accent, fontWeight: fontWeights.semibold } },
		},
	},
});
