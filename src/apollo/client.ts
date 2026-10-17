import { useMemo } from 'react';
import { ApolloClient, HttpLink, from, type NormalizedCacheObject } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { env } from '@/config/env';
import { authLink } from './authLink';
import { createCache } from './cache';
import { errorLink } from './errorLink';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__';

type Client = ApolloClient<NormalizedCacheObject>;

const isServer = () => typeof window === 'undefined';

/** The one browser client. Never created on the server, so no cache is shared between users. */
let browserClient: Client | undefined;

const createServerClient = (): Client =>
	new ApolloClient({
		ssrMode: true,
		// No auth header: SSR fetches public data only (CLAUDE.md rule 11).
		link: new HttpLink({ uri: env.graphqlUrl }),
		cache: createCache(),
	});

const createBrowserClient = (): Client => {
	const uploadLink = createUploadLink({
		uri: env.graphqlUrl,
		// The API runs Apollo Server 4 with CSRF prevention on: multipart uploads are rejected without this header.
		headers: { 'Apollo-Require-Preflight': 'true' },
	});

	return new ApolloClient({
		link: from([errorLink, authLink, uploadLink]),
		cache: createCache(),
	});
};

/** Server: a new client per call (one per request). Browser: the singleton. */
export const createApolloClient = (): Client => (isServer() ? createServerClient() : createBrowserClient());

/** Two-level merge: keeps entities and root fields already in the browser cache, SSR data wins per field. */
const mergeCacheState = (existing: NormalizedCacheObject, incoming: NormalizedCacheObject): NormalizedCacheObject => {
	const merged: NormalizedCacheObject = { ...existing };
	for (const [id, entity] of Object.entries(incoming)) {
		merged[id] = { ...existing[id], ...entity };
	}
	return merged;
};

export const initializeApollo = (initialState?: NormalizedCacheObject | null): Client => {
	const client = isServer() ? createServerClient() : (browserClient ??= createBrowserClient());

	if (initialState) {
		client.cache.restore(mergeCacheState(client.extract(), initialState));
	}
	return client;
};

type PagePropsWithApollo = { [APOLLO_STATE_PROP_NAME]?: NormalizedCacheObject };

/** For getServerSideProps / getStaticProps: puts the server cache into page props for hydration. */
export const addApolloState = <P extends { props: Record<string, unknown> }>(client: Client, result: P): P => {
	result.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
	return result;
};

export const useApollo = (pageProps: PagePropsWithApollo | undefined): Client => {
	const state = pageProps?.[APOLLO_STATE_PROP_NAME];
	return useMemo(() => initializeApollo(state), [state]);
};
