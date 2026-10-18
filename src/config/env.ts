/**
 * The only module that reads `process.env`.
 * Each NEXT_PUBLIC_* variable is referenced literally so Next can inline it at build time.
 */

const required = (name: string, value: string | undefined): string => {
	if (!value) {
		throw new Error(`[env] Missing required environment variable ${name}. See .env.example.`);
	}
	return value;
};

/** An absolute http(s) origin without the trailing slash, so paths can be appended as they are. */
const requiredUrl = (name: string, value: string | undefined): string => {
	const url = required(name, value).replace(/\/+$/, '');
	if (!/^https?:\/\/[^/]+/.test(url)) {
		throw new Error(`[env] ${name} must be an absolute http(s) URL. See .env.example.`);
	}
	return url;
};

export const env = {
	apiUrl: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
	graphqlUrl: required('NEXT_PUBLIC_API_GRAPHQL_URL', process.env.NEXT_PUBLIC_API_GRAPHQL_URL),
	wsUrl: required('NEXT_PUBLIC_API_WS', process.env.NEXT_PUBLIC_API_WS),
	/** Public origin of this site: canonical and hreflang URLs (shared/layout/Seo). */
	siteUrl: requiredUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL),
	isProduction: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
