import { ApolloError } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { parseProfileTab, prefetchMemberProfile, profileTabHref } from './profile';

const ID = '6ac7992dd87bde19b9216c99';
const gqlError = (code: string) => new ApolloError({ graphQLErrors: [{ message: 'x', extensions: { code } }] });
const member = (patch: Record<string, unknown> = {}) => ({ data: { getMember: { _id: ID, memberType: 'CREATOR', memberStatus: 'ACTIVE', ...patch } } });

describe('profile tabs', () => {
	it('reads the tab from the URL, "work" by default', () => {
		expect(parseProfileTab({})).toBe('work');
		expect(parseProfileTab({ tab: 'followers' })).toBe('followers');
		expect(parseProfileTab({ tab: 'nope' })).toBe('work');
		expect(profileTabHref(ID, 'work')).toBe(`/members/${ID}`);
		expect(profileTabHref(ID, 'following')).toBe(`/members/${ID}?tab=following`);
	});
});

describe('prefetchMemberProfile', () => {
	it('finds an active or blocked member', async () => {
		const query = vi.fn(async () => member({ memberStatus: 'BLOCK' }));
		await expect(prefetchMemberProfile({ query } as never, ID)).resolves.toEqual({ found: true, memberId: ID });
	});

	it('is not found for a bad id (no request), NOT_FOUND, or an admin', async () => {
		const query = vi.fn();
		await expect(prefetchMemberProfile({ query } as never, 'x')).resolves.toEqual({ found: false });
		expect(query).not.toHaveBeenCalled();
		await expect(prefetchMemberProfile({ query: async () => Promise.reject(gqlError('NOT_FOUND')) } as never, ID)).resolves.toEqual({ found: false });
		await expect(prefetchMemberProfile({ query: async () => member({ memberType: 'ADMIN' }) } as never, ID)).resolves.toEqual({ found: false });
	});

	it('throws other failures', async () => {
		const error = gqlError('INTERNAL_SERVER_ERROR');
		await expect(prefetchMemberProfile({ query: async () => Promise.reject(error) } as never, ID)).rejects.toBe(error);
	});
});
