import { Bricolage_Grotesque, JetBrains_Mono, Manrope, Noto_Sans_KR } from 'next/font/google';

/*
 * Manrope and Noto Sans KR are variable fonts: with no `weight`, next/font emits one @font-face per
 * unicode-range slice instead of one per slice per weight (the global CSS was ~99 kB of @font-face rules).
 * Same files, same rendering; every weight 400–800 is still available.
 */
export const manrope = Manrope({
	subsets: ['latin', 'latin-ext', 'cyrillic'],
	display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['500'],
	display: 'swap',
});

/**
 * Korean fallback. Google serves Hangul as unicode-range slices, so with preload off the
 * browser downloads only the slices a page actually uses (nothing for en/uz pages).
 */
export const notoSansKr = Noto_Sans_KR({
	display: 'swap',
	preload: false,
});

/**
 * Headings (h1–h3 and display text): Bricolage Grotesque, variable 500–800. It has no Cyrillic or Hangul,
 * so those glyphs fall through to Manrope / Noto Sans KR in the font stack (tokens.fonts.display).
 */
export const bricolage = Bricolage_Grotesque({
	subsets: ['latin', 'latin-ext'],
	display: 'swap',
});
