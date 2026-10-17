/**
 * Session storage: access token + the member `_id` returned by login/signup (server data, not decoded
 * from the token — CLAUDE.md security rules). SSR-safe: on the server there is no session.
 */

export const TOKEN_KEY = 'agentshub.accessToken';
const MEMBER_ID_KEY = 'agentshub.memberId';

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

const read = (key: string): string | null => {
	try {
		return storage()?.getItem(key) ?? null;
	} catch {
		return null;
	}
};

const notify = () => listeners.forEach((listener) => listener());

export const getToken = (): string | null => read(TOKEN_KEY);

export const getSessionMemberId = (): string | null => read(MEMBER_ID_KEY);

/** The member id is written first, so other tabs reacting to the token key already see it. */
export const setToken = (token: string, memberId: string): void => {
	try {
		storage()?.setItem(MEMBER_ID_KEY, memberId);
		storage()?.setItem(TOKEN_KEY, token);
	} catch {
		// Quota or access errors: the session simply won't persist across reloads.
	}
	notify();
};

export const clearToken = (): void => {
	try {
		storage()?.removeItem(TOKEN_KEY);
		storage()?.removeItem(MEMBER_ID_KEY);
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
