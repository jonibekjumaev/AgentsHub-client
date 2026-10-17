import type { CSSProperties } from 'react';
import '@mui/material/styles';
import '@mui/material/Typography';
import '@mui/material/Button';

/** Custom palette keys from docs/DESIGN.md §2.1 that MUI has no slot for. */
interface AppPaletteTokens {
	ground: string;
	surface: string;
	surfaceMuted: string;
	ink: string;
	body: string;
	bodySoft: string;
	muted: string;
	border: string;
	borderSoft: string;
	inputBorder: string;
	accentHover: string;
	accentSoft: string;
	accentBorder: string;
	successSoft: string;
	warningSoft: string;
	dangerBorder: string;
	dangerSoft: string;
	dangerSoftBorder: string;
	dangerInk: string;
	neutralSoft: string;
}

declare module '@mui/material/styles' {
	interface Palette extends AppPaletteTokens {}
	interface PaletteOptions extends Partial<AppPaletteTokens> {}

	interface TypeText {
		muted: string;
	}

	interface TypographyVariants {
		fontFamilyMono: string;
		meta: CSSProperties;
		mono: CSSProperties;
		monoStat: CSSProperties;
	}
	interface TypographyVariantsOptions {
		fontFamilyMono?: string;
		meta?: CSSProperties;
		mono?: CSSProperties;
		monoStat?: CSSProperties;
	}
}

declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		meta: true;
		mono: true;
		monoStat: true;
	}
}

declare module '@mui/material/Button' {
	interface ButtonPropsVariantOverrides {
		/** accentSoft bg + accentBorder border (Follow, Reopen) — §3 Buttons. */
		soft: true;
	}
}
