/**
 * Access token storage. SSR-safe: on the server there is no token (SSR fetches public data only).
 * Do not decode the token to decide who the user is — use the member query (CLAUDE.md security rules).
 */

const TOKEN_KEY = 'agentshub.accessToken';

const storage = (): Storage | null => {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage;
	} catch {
		// Blocked storage (private mode, disabled cookies): behave as a guest.
		return null;
	}
};

export const getToken = (): string | null => {
	try {
		return storage()?.getItem(TOKEN_KEY) ?? null;
	} catch {
		return null;
	}
};

export const setToken = (token: string): void => {
	try {
		storage()?.setItem(TOKEN_KEY, token);
	} catch {
		// Quota or access errors: the session simply won't persist across reloads.
	}
};

export const clearToken = (): void => {
	try {
		storage()?.removeItem(TOKEN_KEY);
	} catch {
		// Nothing to clear.
	}
};
