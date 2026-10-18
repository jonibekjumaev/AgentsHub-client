/**
 * next/image may optimize only uploads from our API (FRONTEND_MIGRATION §1.6: `uploads/<target>/<file>`).
 * Next loads .env* before this file. Config files are the only exception to "src/config/env.ts reads process.env".
 */
const uploadsPattern = () => {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL;
	if (!apiUrl) throw new Error('[next.config] Missing NEXT_PUBLIC_API_URL. See .env.example.');
	const { protocol, hostname, port } = new URL(apiUrl);
	return { protocol: protocol.replace(':', ''), hostname, port, pathname: '/uploads/**' };
};

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [uploadsPattern()],
	},
	webpack(config, { dev, webpack }) {
		// Apollo Client ships dev-only checks and messages behind `globalThis.__DEV__`, which is true unless
		// the bundler says otherwise ("Reducing bundle size" in the Apollo docs). Dev builds keep them.
		if (!dev) config.plugins.push(new webpack.DefinePlugin({ 'globalThis.__DEV__': false }));
		return config;
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

// `yarn analyze` writes treemaps to .next/analyze/ (client.html is the one that matters for First Load JS).
// Config files are the only exception to "src/config/env.ts reads process.env" (CLAUDE.md).
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	// `yarn analyze` sets npm_lifecycle_event, so no cross-platform env tooling is needed (Windows cmd has no VAR=x).
	enabled: process.env.ANALYZE === 'true' || process.env.npm_lifecycle_event === 'analyze',
	openAnalyzer: false,
});

module.exports = withBundleAnalyzer(nextConfig);
