import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import Router from 'next/router';
import { useApolloClient, useQuery } from '@apollo/client';
import type { MeQuery as MeQueryResult } from '@/gql/graphql';
import type { AuthErrorMode } from '@/apollo/errorLink';
import { MeQuery } from './graphql';
import { clearToken, getSessionMemberId, getToken, subscribeToSession } from './session';

export type Me = MeQueryResult['getMember'];
export type AuthStatus = 'loading' | 'guest' | 'member';

type AuthContextValue = {
	me: Me | null;
	status: AuthStatus;
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
	const memberId = token ? getSessionMemberId() : null;

	// 'loading' until mounted: the server and the first client render never show guest or member.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const { data, loading } = useQuery(MeQuery, {
		variables: { memberId: memberId ?? '' },
		skip: !token || !memberId,
		context: meContext,
	});

	// A different session (logout, or another member logged in from another tab): drop member data.
	const previousToken = useRef(token);
	useEffect(() => {
		if (previousToken.current && previousToken.current !== token) void client.clearStore();
		previousToken.current = token;
	}, [client, token]);

	const me = token && data?.getMember._id === memberId ? data.getMember : null;

	let status: AuthStatus;
	if (!mounted) status = 'loading';
	else if (!token || !memberId) status = 'guest';
	else if (me) status = 'member';
	else status = loading ? 'loading' : 'guest';

	/** Resolves once the current session's member is in the cache, which the hook above then reads. */
	const refetchMe = useCallback(async () => {
		const sessionMemberId = getSessionMemberId();
		if (!getToken() || !sessionMemberId) return;
		await client
			.query({ query: MeQuery, variables: { memberId: sessionMemberId }, fetchPolicy: 'network-only', context: meContext })
			.catch(() => undefined); // errorLink already cleared a rejected session; status falls back to guest
	}, [client]);

	const logout = useCallback(async () => {
		clearToken();
		await client.clearStore();
		await Router.push('/');
	}, [client]);

	const value = useMemo(() => ({ me, status, refetchMe, logout }), [me, status, refetchMe, logout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
	const value = useContext(AuthContext);
	if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
	return value;
};
