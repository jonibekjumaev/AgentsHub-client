import { act, screen, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MeQuery } from './graphql';
import { useAuth, type AuthContextValue, type Me } from './AuthProvider';
import { clearToken, setToken } from './session';

const member = (_id: string, memberType: Me['memberType'], memberNick: string): Me => ({
	_id,
	memberType,
	memberStatus: 'ACTIVE',
	memberNick,
	memberFullName: null,
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
});

const meMock = (me: Me, maxUsageCount: number): MockedResponse => ({
	request: { query: MeQuery },
	result: { data: { getMe: { __typename: 'Member', ...me } } },
	maxUsageCount,
});

let auth: AuthContextValue;
const Probe = () => {
	auth = useAuth();
	return <p data-testid="me">{auth.me ? `${auth.me.memberNick}:${auth.me.memberType}` : auth.status}</p>;
};

describe('AuthProvider', () => {
	afterEach(() => clearToken());

	// B23: the header kept the admin after "logout admin -> login user1".
	it('shows the new member after logging out and logging in as someone else', async () => {
		const admin = member('6ac7992dd87bde19b9216c8b', 'ADMIN', 'admin');
		const user1 = member('6ada06a914ae2b87cf159b84', 'CREATOR', 'user1');
		setToken('admin-token');

		renderWithProviders(<Probe />, { mocks: [meMock(admin, 1), meMock(user1, 5)] });
		await waitFor(() => expect(screen.getByTestId('me')).toHaveTextContent('admin:ADMIN'));

		await act(() => auth.logout());
		await waitFor(() => expect(screen.getByTestId('me')).toHaveTextContent('guest'));

		await act(() => auth.startSession('user1-token'));
		await waitFor(() => expect(screen.getByTestId('me')).toHaveTextContent('user1:CREATOR'));
		expect(screen.getByTestId('me')).not.toHaveTextContent('admin');
	});
});
