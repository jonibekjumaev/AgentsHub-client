import { describe, expect, it, vi } from 'vitest';
import { TOKEN_KEY, clearToken, getToken, setToken, subscribeToSession } from './session';

describe('session', () => {
	it('stores, reads and clears the token', () => {
		expect(getToken()).toBeNull();
		setToken('abc');
		expect(getToken()).toBe('abc');
		expect(window.localStorage.getItem(TOKEN_KEY)).toBe('abc');
		clearToken();
		expect(getToken()).toBeNull();
	});

	it('notifies subscribers on set and clear in this tab', () => {
		const listener = vi.fn();
		const unsubscribe = subscribeToSession(listener);

		setToken('abc');
		clearToken();
		expect(listener).toHaveBeenCalledTimes(2);

		unsubscribe();
		setToken('def');
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('notifies on a storage event for the token key from another tab', () => {
		const listener = vi.fn();
		const unsubscribe = subscribeToSession(listener);

		window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY }));
		window.dispatchEvent(new StorageEvent('storage', { key: null })); // localStorage.clear() elsewhere
		expect(listener).toHaveBeenCalledTimes(2);

		window.dispatchEvent(new StorageEvent('storage', { key: 'something.else' }));
		expect(listener).toHaveBeenCalledTimes(2);

		unsubscribe();
		window.dispatchEvent(new StorageEvent('storage', { key: TOKEN_KEY }));
		expect(listener).toHaveBeenCalledTimes(2);
	});
});
