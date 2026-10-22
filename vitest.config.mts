import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * What Next's optimizePackageImports does for the app: `import { SearchOff as Icon } from '@mui/icons-material'`
 * → `import Icon from '@mui/icons-material/SearchOff'`. Without it every test file loads all ~2000 icons.
 */
const muiIconImports = () => ({
	name: 'mui-icon-imports',
	enforce: 'pre' as const,
	transform(code: string, id: string) {
		if (!id.includes('/src/') || !code.includes("'@mui/icons-material'")) return null;
		return code.replace(/import\s*\{([^}]+)\}\s*from\s*'@mui\/icons-material';?/g, (_match: string, names: string) =>
			names
				.split(',')
				.map((name) => name.trim())
				.filter(Boolean)
				.map((name) => {
					const [icon, local = icon] = name.split(/\s+as\s+/);
					return `import ${local} from '@mui/icons-material/${icon}';`;
				})
				.join('\n'),
		);
	},
});

export default defineConfig({
	plugins: [muiIconImports()],
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
		// The first test of a file also pays for cold MUI / next/image imports; under a full parallel run that
		// passed 5 s once (AgentsCatalog). Real hangs still fail.
		testTimeout: 15_000,
		// Same public example values as .env.example, so src/config/env.ts validates in tests.
		env: {
			NEXT_PUBLIC_API_URL: 'http://localhost:3005',
			NEXT_PUBLIC_API_GRAPHQL_URL: 'http://localhost:3005/graphql',
			NEXT_PUBLIC_API_WS: 'ws://localhost:3005',
			NEXT_PUBLIC_SITE_URL: 'https://agentshub.test',
		},
		server: {
			deps: {
				// Transform the aliased ESM build (extensionless imports) so it shares our react-i18next instance.
				inline: ['next-i18next'],
			},
		},
	},
});
