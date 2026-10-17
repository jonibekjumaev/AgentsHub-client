import { JetBrains_Mono, Manrope, Noto_Sans_KR } from 'next/font/google';

export const manrope = Manrope({
	subsets: ['latin', 'latin-ext', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800'],
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
	weight: ['400', '500', '700', '800'],
	display: 'swap',
	preload: false,
});
