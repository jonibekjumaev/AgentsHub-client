import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { SignupMutation } from '../graphql/auth';
import { SignupForm } from './SignupForm';

const input = {
	memberType: 'CREATOR',
	memberNick: 'nova_labs',
	memberPhone: '+998901234567',
	memberPassword: 'bakery2026',
};

const success: MockedResponse = {
	request: { query: SignupMutation, variables: { input } },
	result: {
		data: { signup: { __typename: 'Member', _id: '6ac7992dd87bde19b9216c8b', memberType: 'CREATOR', accessToken: 'token-2' } },
	},
};

const fill = async ({ role = true, phone = '+998 90 123-45-67' } = {}) => {
	const user = userEvent.setup({ delay: null });
	if (role) await user.click(screen.getByRole('radio', { name: /Sell agents I build/ }));
	await user.click(screen.getByRole('textbox', { name: 'Nickname' }));
	await user.paste('nova_labs');
	await user.click(screen.getByRole('textbox', { name: 'Phone number' }));
	await user.paste(phone);
	await user.click(screen.getByLabelText('Password', { selector: 'input' }));
	await user.paste('bakery2026');
	return user;
};

const submit = (user: ReturnType<typeof userEvent.setup>) =>
	user.click(screen.getByRole('button', { name: 'Create account' }));

// The first test pays for loading MUI, react-hook-form and zod in this file (~4–5 s on a busy machine).
describe('SignupForm', { timeout: 15_000 }, () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/signup');
	});

	it('requires choosing an account type and sends nothing without it', async () => {
		renderWithProviders(<SignupForm />, { auth: { status: 'guest' } });
		const user = await fill({ role: false });
		await submit(user);

		expect(await screen.findByText('Choose what you want to do on AgentsHub.')).toBeInTheDocument();
		expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
		// No mocks: a request would surface as an "unknown" form error.
		expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
		expect(screen.getByText("You can't switch account type later. To do both, use two accounts.")).toBeInTheDocument();
	});

	it('shows the international-format error under the phone', async () => {
		renderWithProviders(<SignupForm />, { auth: { status: 'guest' } });
		const user = await fill({ phone: '901234567' });
		await submit(user);

		const phone = screen.getByRole('textbox', { name: 'Phone number' });
		await waitFor(() => expect(phone).toHaveAttribute('aria-invalid', 'true'));
		expect(phone).toHaveAccessibleDescription('Use the international format with country code, e.g. +998901234567.');
	});

	it('shows a form-level error when the nick or phone is taken', async () => {
		renderWithProviders(<SignupForm />, {
			mocks: [
				{
					request: { query: SignupMutation, variables: { input } },
					result: { errors: [{ message: 'Already used member nick or phone', extensions: { code: 'CONFLICT' } }] },
				},
			],
			auth: { status: 'guest' },
		});
		const user = await fill();
		await submit(user);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('This nickname or phone number is already used.');
		expect(alert).not.toHaveTextContent('Already used member nick or phone');
	});

	it('sends the normalized phone, starts the session and goes to next', async () => {
		mockRouter.setCurrentUrl('/signup?next=%2Fdashboard');
		const startSession = vi.fn(async () => undefined);
		renderWithProviders(<SignupForm />, { mocks: [success], auth: { status: 'guest', startSession } });
		const user = await fill();
		await submit(user);

		await waitFor(() => expect(startSession).toHaveBeenCalledWith('token-2'));
		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard'));
	});

	it('goes to "/" after signup without next', async () => {
		renderWithProviders(<SignupForm />, { mocks: [success], auth: { status: 'guest' } });
		const user = await fill();
		await submit(user);
		await waitFor(() => expect(mockRouter.asPath).toBe('/'));
	});

	it('turns the password hint green once the rule is met', async () => {
		renderWithProviders(<SignupForm />, { auth: { status: 'guest' } });
		const user = userEvent.setup({ delay: null });
		const password = screen.getByLabelText('Password', { selector: 'input' });

		expect(password).toHaveAttribute('autocomplete', 'new-password');
		await user.type(password, '1234567');
		expect(screen.queryByTestId('CheckIcon')).not.toBeInTheDocument();
		await user.type(password, '8');
		expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
		expect(password).toHaveAccessibleDescription('At least 8 characters');
	});

	it('shows the "Why AgentsHub" panel', () => {
		renderWithProviders(<SignupForm />, { auth: { status: 'guest' } });
		expect(screen.getByRole('complementary', { name: 'Why AgentsHub', hidden: true })).toBeInTheDocument();
	});
});
