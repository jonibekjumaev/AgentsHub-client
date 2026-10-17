import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			// The ESM build (the package has no "exports" map, so Node would pick its CJS main).
			'next-i18next': fileURLToPath(new URL('./node_modules/next-i18next/dist/esm/index.js', import.meta.url)),
		},
	},
	// tsconfig has `jsx: preserve` for Next; tests need JSX compiled (React 17+ automatic runtime).
	oxc: {
		jsx: { runtime: 'automatic', importSource: 'react' },
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		include: ['src/**/*.test.{ts,tsx}'],
		restoreMocks: true,
		server: {
			deps: {
				// Transform the aliased ESM build (extensionless imports) so it shares our react-i18next instance.
				inline: ['next-i18next'],
			},
		},
	},
});
