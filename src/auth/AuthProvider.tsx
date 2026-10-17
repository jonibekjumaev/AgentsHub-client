import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import Router from 'next/router';
import { useApolloClient, useQuery } from '@apollo/client';
import type { MeQuery as MeQueryResult } from '@/gql/graphql';
import type { AuthErrorMode } from '@/apollo/errorLink';
import { MeQuery } from './graphql';
import { clearToken, getToken, setToken, subscribeToSession } from './session';

export type Me = MeQueryResult['getMe'];
export type AuthStatus = 'loading' | 'guest' | 'member';

type AuthContextValue = {
	me: Me | null;
	status: AuthStatus;
	/** Stores the token from login/signup and reloads every active query as the new member. */
	startSession: (token: string) => Promise<void>;
	refetchMe: () => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const meContext: { authErrors: AuthErrorMode } = { authErrors: 'silent' };

/** No session on the server, so SSR and the hydration render agree. */
const getServerToken = () => null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const client = useApolloClient();
	const token = useSyncExternalStore(subscribeToSession, getToken, getServerToken);

	// 'loading' until mounted: the server and the first client render never show guest or member.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const { data, loading } = useQuery(MeQuery, { skip: !token, context: meContext });

	// The token was removed or replaced (logout here or in another tab): drop the old member's data.
	const previousToken = useRef(token);
	useEffect(() => {
		if (previousToken.current && previousToken.current !== token) void client.clearStore();
		previousToken.current = token;
	}, [client, token]);

	const me = token ? data?.getMe ?? null : null;

	let status: AuthStatus;
	if (!mounted) status = 'loading';
	else if (!token) status = 'guest';
	else if (me) status = 'member';
	else status = loading ? 'loading' : 'guest';

	/** Resolves once the current member is in the cache, which the hook above then reads. */
	const refetchMe = useCallback(async () => {
		if (!getToken()) return;
		await client
			.query({ query: MeQuery, fetchPolicy: 'network-only', context: meContext })
			.catch(() => undefined); // errorLink already cleared a rejected session; status falls back to guest
	}, [client]);

	/**
	 * Same effect as client.resetStore(), ordered so no query is in flight while the store is cleared:
	 * clearing first (as a guest, getMe is still skipped) avoids the "Store reset while query was in
	 * flight" error that would briefly turn the status into 'guest' and trip RequireRole.
	 */
	const startSession = useCallback(
		async (nextToken: string) => {
			await client.clearStore();
			setToken(nextToken);
			await Promise.all([client.reFetchObservableQueries(), refetchMe()]);
		},
		[client, refetchMe],
	);

	const logout = useCallback(async () => {
		clearToken();
		await client.clearStore();
		await Router.push('/');
	}, [client]);

	const value = useMemo(
		() => ({ me, status, startSession, refetchMe, logout }),
		[me, status, startSession, refetchMe, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
	const value = useContext(AuthContext);
	if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
	return value;
};
