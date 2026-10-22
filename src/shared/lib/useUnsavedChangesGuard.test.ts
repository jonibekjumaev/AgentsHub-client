import { act, renderHook } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard';

const MESSAGE = 'You have unsaved changes.';

/** Navigates like a link click; resolves whether the route actually changed. */
const navigate = async (url: string, shallow = false) => {
	await act(async () => {
		await mockRouter.push(url, undefined, { shallow }).catch(() => undefined);
	});
	return mockRouter.asPath === url;
};

describe('useUnsavedChangesGuard', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/agents/new');
	});

	it('lets navigation through when nothing changed', async () => {
		const confirm = vi.spyOn(window, 'confirm');
		renderHook(() => useUnsavedChangesGuard(false, MESSAGE));

		expect(await navigate('/dashboard/agents')).toBe(true);
		expect(confirm).not.toHaveBeenCalled();
	});

	it('asks before leaving with changes, and stays on Cancel', async () => {
		const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
		renderHook(() => useUnsavedChangesGuard(true, MESSAGE));

		expect(await navigate('/dashboard/agents')).toBe(false);
		expect(confirm).toHaveBeenCalledWith(MESSAGE);
		expect(mockRouter.asPath).toBe('/dashboard/agents/new');
	});

	it('leaves on OK', async () => {
		vi.spyOn(window, 'confirm').mockReturnValue(true);
		renderHook(() => useUnsavedChangesGuard(true, MESSAGE));
		expect(await navigate('/dashboard/agents')).toBe(true);
	});

	it('does not ask for shallow, same-page URL changes', async () => {
		const confirm = vi.spyOn(window, 'confirm');
		renderHook(() => useUnsavedChangesGuard(true, MESSAGE));
		expect(await navigate('/dashboard/agents/new?step=2', true)).toBe(true);
		expect(confirm).not.toHaveBeenCalled();
	});

	it('does not ask after allowNavigation() (e.g. right after saving)', async () => {
		const confirm = vi.spyOn(window, 'confirm');
		const { result } = renderHook(() => useUnsavedChangesGuard(true, MESSAGE));
		result.current.allowNavigation();
		expect(await navigate('/dashboard/agents')).toBe(true);
		expect(confirm).not.toHaveBeenCalled();
	});

	it('asks the browser before unload only while there are changes', () => {
		const { rerender } = renderHook(({ dirty }) => useUnsavedChangesGuard(dirty, MESSAGE), { initialProps: { dirty: true } });

		const dirtyEvent = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(dirtyEvent);
		expect(dirtyEvent.defaultPrevented).toBe(true);

		rerender({ dirty: false });
		const cleanEvent = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(cleanEvent);
		expect(cleanEvent.defaultPrevented).toBe(false);
	});
});
