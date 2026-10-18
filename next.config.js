/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
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
