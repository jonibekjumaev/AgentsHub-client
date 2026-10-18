import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { env } from '@/config/env';
import { DEFAULT_LOCALE, LOCALES, localePath } from '@/shared/lib/locale';

type SeoProps = {
	/** Page title; rendered as "<title> · AgentsHub". Leave out on the home page for just "AgentsHub". */
	title?: string;
	/** Falls back to the site description. Plain text. */
	description?: string;
	/** og:image: an absolute URL or a path on this site. */
	image?: string;
	/** Error and private pages: robots noindex, and no canonical / hreflang links. */
	noindex?: boolean;
	/**
	 * Locale-free path, optionally with the query that defines the page (e.g. "/agents?category=sales"),
	 * for the canonical and hreflang URLs. Default: the current path without its query.
	 */
	canonicalPath?: string;
};

const absoluteUrl = (pathOrUrl: string) =>
	/^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${env.siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

/** Title, description, Open Graph, canonical URL and en/ko/uz hreflang alternates for the current page. */
export const Seo = ({ title, description, image, noindex = false, canonicalPath }: SeoProps) => {
	const { asPath, locale = DEFAULT_LOCALE } = useRouter();
	const { t } = useTranslation('common');

	const siteName = t('common:app.name');
	const fullTitle = title ? `${title} · ${siteName}` : siteName;
	const text = description ?? t('common:seo.description');
	// The query and hash belong in canonical or alternate URLs only when the page says so.
	const path = canonicalPath ?? (asPath.split(/[?#]/)[0] || '/');
	const urlIn = (target: string) => `${env.siteUrl}${localePath(path, target)}`;
	const canonical = urlIn(locale);

	return (
		<Head>
			<title>{fullTitle}</title>
			<meta key="description" name="description" content={text} />
			<meta key="og:site_name" property="og:site_name" content={siteName} />
			<meta key="og:type" property="og:type" content="website" />
			<meta key="og:title" property="og:title" content={fullTitle} />
			<meta key="og:description" property="og:description" content={text} />
			{image && <meta key="og:image" property="og:image" content={absoluteUrl(image)} />}
			{noindex && <meta key="robots" name="robots" content="noindex, nofollow" />}
			{!noindex && <meta key="og:url" property="og:url" content={canonical} />}
			{!noindex && <link key="canonical" rel="canonical" href={canonical} />}
			{!noindex &&
				LOCALES.map((target) => (
					<link key={`alternate-${target}`} rel="alternate" hrefLang={target} href={urlIn(target)} />
				))}
			{!noindex && <link key="alternate-x-default" rel="alternate" hrefLang="x-default" href={urlIn(DEFAULT_LOCALE)} />}
		</Head>
	);
};
