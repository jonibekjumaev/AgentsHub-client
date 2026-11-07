import type { MockedResponse } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AccountQuery, UpdateBrowsePrivatelyMutation } from '../graphql/account';
import { AccountSettings } from './AccountSettings';

const ID = '6ac7992dd87bde19b9216c8b';

const accountMock = (memberType: string, memberBrowsePrivately: boolean | null): MockedResponse => ({
	request: { query: AccountQuery },
	result: {
		data: {
			getMe: {
				__typename: 'Member',
				_id: ID,
				memberType,
				memberNick: 'aria',
				memberFullName: null,
				memberImage: '',
				memberPhone: '+998901234567',
				memberEmail: null,
				memberWhatsapp: null,
				memberDesc: null,
				memberBrowsePrivately,
			},
		},
	},
});

const updateMock = (value: boolean, extra: Partial<MockedResponse> = {}): MockedResponse => ({
	request: { query: UpdateBrowsePrivatelyMutation, variables: { input: { memberBrowsePrivately: value } } },
	result: { data: { updateMember: { __typename: 'Member', _id: ID, memberBrowsePrivately: value } } },
	...extra,
});

describe('Browse privately (settings, D-42)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/settings');
	});

	it('saves the switch right away and shows the stored value', async () => {
		const user = userEvent.setup();
		renderWithProviders(<AccountSettings />, { mocks: [accountMock('USER', false), updateMock(true)], auth: { status: 'member' } });

		const toggle = await screen.findByRole('switch', { name: /Browse privately/ });
		expect(toggle).not.toBeChecked();
		expect(toggle).toHaveAccessibleDescription(/they see that someone visited, but not your name/);

		await user.click(toggle);
		expect(await screen.findByText('You now browse privately.')).toBeInTheDocument();
		expect(screen.getByRole('switch', { name: /Browse privately/ })).toBeChecked();
	});

	it('keeps the stored value when saving fails', async () => {
		const user = userEvent.setup();
		renderWithProviders(<AccountSettings />, {
			mocks: [accountMock('CREATOR', true), updateMock(false, { result: undefined, error: new Error('down') })],
			auth: { status: 'member' },
		});

		const toggle = await screen.findByRole('switch', { name: /Browse privately/ });
		expect(toggle).toBeChecked();
		await user.click(toggle);
		expect(await screen.findByRole('alert')).toBeInTheDocument();
		expect(screen.getByRole('switch', { name: /Browse privately/ })).toBeChecked();
	});

	it('is not offered to an admin (admin visits are never recorded)', async () => {
		renderWithProviders(<AccountSettings />, { mocks: [accountMock('ADMIN', null)], auth: { status: 'member' } });
		expect(await screen.findByRole('heading', { name: 'Password' })).toBeInTheDocument();
		expect(screen.queryByRole('switch')).not.toBeInTheDocument();
	});
});
