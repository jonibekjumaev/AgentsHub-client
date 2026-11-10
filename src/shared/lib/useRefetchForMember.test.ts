import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRefetchForMember } from './useRefetchForMember';

describe('useRefetchForMember', () => {
	it('asks once, when the visitor turns out to be a member; never for a guest', () => {
		const refetch = vi.fn(async () => undefined);
		const { rerender } = renderHook(({ member }) => useRefetchForMember(member, refetch), { initialProps: { member: false } });
		expect(refetch).not.toHaveBeenCalled();

		rerender({ member: true });
		rerender({ member: true });
		expect(refetch).toHaveBeenCalledTimes(1);

		// signed out and in again: the store is cleared and refetched by the auth provider, not here
		rerender({ member: false });
		rerender({ member: true });
		expect(refetch).toHaveBeenCalledTimes(1);
	});
});
