import type { MockedResponse } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ChangePasswordMutation } from '../graphql/account';
import { PasswordForm } from './PasswordForm';

const me = { _id: '6ac7992dd87bde19b9216c99', memberType: 'USER', memberStatus: 'ACTIVE', memberNick: 'dilnoza' } as Me;

const changeMock = (result: MockedResponse['result']): MockedResponse => ({
	request: { query: ChangePasswordMutation, variables: { input: { currentPassword: 'old-pass', newPassword: 'brand-new-pass' } } },
	result,
});

const fill = async () => {
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/Current password/), 'old-pass');
	await user.type(screen.getByLabelText(/^New password/), 'brand-new-pass');
	await user.type(screen.getByLabelText(/Repeat the new password/), 'brand-new-pass');
	await user.click(screen.getByRole('button', { name: 'Change password' }));
};

describe('PasswordForm (S7, D-24/D-26)', () => {
	it('changes the password and clears the form', async () => {
		renderWithProviders(<PasswordForm />, { auth: { status: 'member', me }, mocks: [changeMock({ data: { changePassword: true } })] });
		await fill();
		expect(await screen.findByText('Your password is changed.')).toBeInTheDocument();
		expect(screen.getByLabelText(/Current password/)).toHaveValue('');
	});

	it('puts "wrong password" under the current password', async () => {
		renderWithProviders(<PasswordForm />, {
			auth: { status: 'member', me },
			mocks: [changeMock({ errors: [{ message: 'Wrong password, try again!', extensions: { code: 'BAD_REQUEST' } }] })],
		});
		await fill();
		expect(await screen.findByText('The current password is wrong.')).toBeInTheDocument();
	});
});
