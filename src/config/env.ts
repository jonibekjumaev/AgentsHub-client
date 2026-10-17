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

export const env = {
	apiUrl: required('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
	graphqlUrl: required('NEXT_PUBLIC_API_GRAPHQL_URL', process.env.NEXT_PUBLIC_API_GRAPHQL_URL),
	wsUrl: required('NEXT_PUBLIC_API_WS', process.env.NEXT_PUBLIC_API_WS),
	isProduction: process.env.NODE_ENV === 'production',
} as const;

export type Env = typeof env;
