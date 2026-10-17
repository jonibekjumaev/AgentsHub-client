/**
 * Access token storage — the only stored session value. Who the member is comes from `getMe`,
 * never from decoding the token (CLAUDE.md security rules). SSR-safe: on the server there is no session.
 */

export const TOKEN_KEY = 'agentshub.accessToken';

type Listener = () => void;
const listeners = new Set<Listener>();

const storage = (): Storage | null => {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage;
	} catch {
		// Blocked storage (private mode, disabled cookies): behave as a guest.
		return null;
	}
};

const notify = () => listeners.forEach((listener) => listener());

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
	notify();
};

export const clearToken = (): void => {
	try {
		storage()?.removeItem(TOKEN_KEY);
	} catch {
		// Nothing to clear.
	}
	notify();
};

/**
 * Calls `listener` when the session changes in this tab (set/clear) or in another tab
 * (`storage` event for the token key; `key === null` means storage was cleared).
 */
export const subscribeToSession = (listener: Listener): (() => void) => {
	listeners.add(listener);
	const onStorage = (event: StorageEvent) => {
		if (event.key === TOKEN_KEY || event.key === null) listener();
	};
	window.addEventListener('storage', onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('storage', onStorage);
	};
};
