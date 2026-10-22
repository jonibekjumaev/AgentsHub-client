/**
 * sitemap.xml and robots.txt builders (S10). Pure functions: the pages fetch the ids and pass them in.
 * Every URL is listed once in the default locale with hreflang alternates for ko and uz (the same
 * scheme as shared/layout/Seo: en has no prefix).
 */
export const SITEMAP_LOCALES = ['en', 'ko', 'uz'] as const;
export const DEFAULT_LOCALE = 'en';

export const STATIC_PATHS = ['/', '/agents', '/briefs', '/creators', '/community', '/faq', '/about'] as const;

/** Never indexed: private, per-member or utility pages. */
export const DISALLOWED_PATHS = ['/dashboard', '/admin', '/login', '/signup', '/dev'] as const;

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const localizedUrl = (siteUrl: string, path: string, locale: string) => {
	const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
	const suffix = path === '/' ? (prefix ? '' : '/') : path;
	return `${siteUrl.replace(/\/+$/, '')}${prefix}${suffix}`;
};

export type SitemapEntry = { path: string; lastmod?: string | null };

export const buildSitemap = (siteUrl: string, entries: SitemapEntry[]): string => {
	const urls = entries.map(({ path, lastmod }) => {
		const alternates = SITEMAP_LOCALES.map(
			(locale) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(localizedUrl(siteUrl, path, locale))}"/>`,
		).join('');
		const defaultAlternate = `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localizedUrl(siteUrl, path, DEFAULT_LOCALE))}"/>`;
		const date = lastmod ? `<lastmod>${escapeXml(new Date(lastmod).toISOString())}</lastmod>` : '';
		return `<url><loc>${escapeXml(localizedUrl(siteUrl, path, DEFAULT_LOCALE))}</loc>${date}${alternates}${defaultAlternate}</url>`;
	});
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
};

export const buildRobots = (siteUrl: string, allowIndexing: boolean): string => {
	if (!allowIndexing) return 'User-agent: *\nDisallow: /\n';
	const disallow = DISALLOWED_PATHS.flatMap((path) => [path, ...SITEMAP_LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => `/${l}${path}`)]);
	return `User-agent: *\n${disallow.map((path) => `Disallow: ${path}`).join('\n')}\n\nSitemap: ${siteUrl.replace(/\/+$/, '')}/sitemap.xml\n`;
};
