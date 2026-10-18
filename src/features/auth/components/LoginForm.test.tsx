import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LoginMutation } from '../graphql/auth';
import { LoginForm } from './LoginForm';

const input = { memberNick: 'aria', memberPassword: 'old12' };

const success: MockedResponse = {
	request: { query: LoginMutation, variables: { input } },
	result: {
		data: { login: { __typename: 'Member', _id: '6ac7992dd87bde19b9216c8b', memberType: 'USER', accessToken: 'token-1' } },
	},
};

const failure = (message: string, extensions: Record<string, string>): MockedResponse => ({
	request: { query: LoginMutation, variables: { input } },
	result: { errors: [{ message, extensions }] },
});

const fillAndSubmit = async (nick = '  aria ', password = 'old12') => {
	const user = userEvent.setup({ delay: null });
	await user.click(screen.getByRole('textbox', { name: 'Nickname' }));
	await user.paste(nick);
	await user.click(screen.getByLabelText('Password', { selector: 'input' }));
	await user.paste(password);
	await user.click(screen.getByRole('button', { name: 'Log in' }));
	return user;
};

// The first test pays for loading MUI, react-hook-form and zod in this file (~3–4 s on a busy machine).
describe('LoginForm', { timeout: 15_000 }, () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/login');
	});

	it('sends the trimmed nick and password, starts the session and goes to next', async () => {
		mockRouter.setCurrentUrl('/login?next=%2Fagents%3Fpage%3D2');
		const startSession = vi.fn(async () => undefined);
		renderWithProviders(<LoginForm />, { mocks: [success], auth: { status: 'guest', startSession } });

		await fillAndSubmit();

		await waitFor(() => expect(startSession).toHaveBeenCalledWith('token-1'));
		await waitFor(() => expect(mockRouter.asPath).toBe('/agents?page=2'));
	});

	it('goes to "/" after login when next is unsafe', async () => {
		mockRouter.setCurrentUrl('/login?next=https%3A%2F%2Fevil.com');
		renderWithProviders(<LoginForm />, { mocks: [success], auth: { status: 'guest' } });

		await fillAndSubmit();
		await waitFor(() => expect(mockRouter.asPath).toBe('/'));
	});

	it('shows the one D-27 message for a wrong nick or password, never the backend text', async () => {
		renderWithProviders(<LoginForm />, {
			mocks: [failure('Wrong member nick or password!', { code: 'UNAUTHENTICATED' })],
			auth: { status: 'guest' },
		});

		await fillAndSubmit();

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Wrong member nick or password.');
		expect(alert).not.toHaveTextContent('Wrong member nick or password!');
		expect(mockRouter.pathname).toBe('/login');
	});

	it('shows the blocked message for a blocked member', async () => {
		renderWithProviders(<LoginForm />, {
			mocks: [failure('You have been blocked!', { code: 'FORBIDDEN', reason: 'MEMBER_BLOCKED' })],
			auth: { status: 'guest' },
		});

		await fillAndSubmit();
		expect(await screen.findByRole('alert')).toHaveTextContent('Your account has been blocked.');
	});

	it('shows the network message when the server is unreachable', async () => {
		renderWithProviders(<LoginForm />, {
			mocks: [{ request: { query: LoginMutation, variables: { input } }, error: new TypeError('Failed to fetch') }],
			auth: { status: 'guest' },
		});

		await fillAndSubmit();
		expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the server.");
	});

	it('validates before sending: nick length and a non-empty password, no 8-character rule', async () => {
		renderWithProviders(<LoginForm />, { auth: { status: 'guest' } });
		const user = userEvent.setup({ delay: null });

		await user.type(screen.getByRole('textbox', { name: 'Nickname' }), 'ab');
		await user.click(screen.getByRole('button', { name: 'Log in' }));

		expect(await screen.findByText('Nickname must be 3 to 12 characters.')).toBeInTheDocument();
		expect(screen.getByText('Enter your password.')).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Nickname' })).toHaveAttribute('aria-invalid', 'true');
	});

	it('shows an info notice on ?reason=blocked, replaced by a later error', async () => {
		mockRouter.setCurrentUrl('/login?reason=blocked');
		renderWithProviders(<LoginForm />, {
			mocks: [failure('Wrong member nick or password!', { code: 'UNAUTHENTICATED' })],
			auth: { status: 'guest' },
		});

		expect(screen.getByRole('status')).toHaveTextContent('Your account has been blocked, so you were signed out.');

		await fillAndSubmit();
		await screen.findByRole('alert');
		expect(screen.queryByText(/so you were signed out/)).not.toBeInTheDocument();
	});

	it('toggles the password visibility', async () => {
		renderWithProviders(<LoginForm />, { auth: { status: 'guest' } });
		const user = userEvent.setup({ delay: null });
		const password = screen.getByLabelText('Password', { selector: 'input' });

		expect(password).toHaveAttribute('type', 'password');
		expect(password).toHaveAttribute('autocomplete', 'current-password');
		await user.click(screen.getByRole('button', { name: 'Show password' }));
		expect(password).toHaveAttribute('type', 'text');
		await user.click(screen.getByRole('button', { name: 'Hide password' }));
		expect(password).toHaveAttribute('type', 'password');
	});

	it('links to signup, keeping a safe next', () => {
		mockRouter.setCurrentUrl('/login?next=%2Fbriefs');
		renderWithProviders(<LoginForm />, { auth: { status: 'guest' } });
		expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup?next=%2Fbriefs');
	});

	it('does not show the form to a signed-in member', () => {
		renderWithProviders(<LoginForm />, {
			auth: {
				status: 'member',
				me: {
					_id: '6ac7992dd87bde19b9216c8b',
					memberType: 'USER',
					memberStatus: 'ACTIVE',
					memberNick: 'aria',
					memberFullName: null,
					memberImage: '',
					memberPhone: '+998901234567',
					memberEmail: null,
					memberWhatsapp: null,
				},
			},
		});
		expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument();
		expect(screen.getByRole('status', { name: 'Loading…' })).toBeInTheDocument();
	});
});
