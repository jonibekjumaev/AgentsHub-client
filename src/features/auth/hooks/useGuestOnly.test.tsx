import { render, screen, waitFor } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthStatus, Me } from '@/auth';
import { AuthContext } from '@/auth/AuthProvider';
import { mockAuth } from '@/test/renderWithProviders';
import { useGuestOnly } from './useGuestOnly';

const member: Me = {
	_id: '6ac7992dd87bde19b9216c8b',
	memberType: 'USER',
	memberStatus: 'ACTIVE',
	memberNick: 'aria',
	memberFullName: null,
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
};

const Probe = () => <p>{useGuestOnly() ? 'form' : 'skeleton'}</p>;

const Harness = ({ status }: { status: AuthStatus }) => (
	<AuthContext.Provider value={mockAuth({ status, me: status === 'member' ? member : null })}>
		<Probe />
	</AuthContext.Provider>
);

describe('useGuestOnly', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/login?next=/dashboard/briefs');
	});

	it('shows the form to a guest and does not redirect', () => {
		render(<Harness status="guest" />);
		expect(screen.getByText('form')).toBeInTheDocument();
		expect(mockRouter.pathname).toBe('/login');
	});

	it('keeps the form hidden while the session is loading', () => {
		render(<Harness status="loading" />);
		expect(screen.getByText('skeleton')).toBeInTheDocument();
		expect(mockRouter.pathname).toBe('/login');
	});

	it('sends a signed-in member to the safe next path', async () => {
		render(<Harness status="member" />);
		expect(screen.getByText('skeleton')).toBeInTheDocument();
		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard/briefs'));
	});

	it('sends a member to "/" when next is unsafe or missing', async () => {
		mockRouter.setCurrentUrl('/signup?next=//evil.com');
		render(<Harness status="member" />);
		await waitFor(() => expect(mockRouter.asPath).toBe('/'));
	});

	it('also redirects a member whose session was still loading on arrival', async () => {
		const { rerender } = render(<Harness status="loading" />);
		rerender(<Harness status="member" />);
		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard/briefs'));
	});

	it('leaves the redirect to the form when a guest signs in on the page', async () => {
		const { rerender } = render(<Harness status="guest" />);
		rerender(<Harness status="member" />);

		// The form stays visible (in its loading state) until useLogin/useSignup navigates.
		expect(screen.getByText('form')).toBeInTheDocument();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(mockRouter.pathname).toBe('/login');
	});
});
