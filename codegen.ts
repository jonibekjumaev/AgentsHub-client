import type { CodegenConfig } from '@graphql-codegen/cli';

// Config files are the only exception to "src/config/env.ts reads process.env" (CLAUDE.md).
const schema = process.env.CODEGEN_SCHEMA_URL ?? 'http://localhost:3005/graphql';

const config: CodegenConfig = {
	overwrite: true,
	schema,
	documents: ['src/**/*.{ts,tsx}', '!src/gql/**/*'],
	ignoreNoDocuments: true,
	generates: {
		'src/gql/': {
			preset: 'client',
			presetConfig: {
				fragmentMasking: false,
			},
			config: {
				useTypeImports: true,
				scalars: {
					DateTime: 'string',
					Upload: 'File',
				},
			},
		},
		// Every schema enum with runtime values (the client preset only emits enums used by documents).
		'src/gql/enums.ts': {
			plugins: ['typescript'],
			config: {
				onlyEnums: true,
				enumsAsConst: true,
			},
		},
	},
};

export default config;
