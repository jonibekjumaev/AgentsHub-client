import { screen, waitFor } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockAuth, renderWithProviders } from '@/test/renderWithProviders';
import type { Me } from './AuthProvider';
import { RequireRole } from './RequireRole';

const member = (memberType: Me['memberType']): Me => ({
	_id: '6ac7992dd87bde19b9216c8b',
	memberType,
	memberStatus: 'ACTIVE',
	memberNick: 'aria',
	memberFullName: null,
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
});

const renderGuarded = (auth: Parameters<typeof mockAuth>[0]) =>
	renderWithProviders(
		<RequireRole roles={['CREATOR']}>
			<p>Creator content</p>
		</RequireRole>,
		{ auth },
	);

describe('RequireRole', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/agents?tab=paused');
	});

	it('shows a skeleton while the session is loading', () => {
		renderGuarded({ status: 'loading' });

		expect(screen.getByLabelText('Loading…')).toHaveAttribute('aria-busy', 'true');
		expect(screen.queryByText('Creator content')).not.toBeInTheDocument();
		expect(mockRouter.asPath).toBe('/dashboard/agents?tab=paused');
	});

	it('sends a guest to /login with the current path as next', async () => {
		renderGuarded({ status: 'guest' });

		await waitFor(() => expect(mockRouter.pathname).toBe('/login'));
		expect(mockRouter.query).toEqual({ next: '/dashboard/agents?tab=paused' });
		expect(screen.queryByText('Creator content')).not.toBeInTheDocument();
	});

	it('shows 404 for a member with the wrong role', () => {
		renderGuarded({ status: 'member', me: member('USER') });

		expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
		expect(screen.getByText('404')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
		expect(screen.queryByText('Creator content')).not.toBeInTheDocument();
	});

	it('renders the children for a member with the right role', () => {
		renderGuarded({ status: 'member', me: member('CREATOR') });

		expect(screen.getByText('Creator content')).toBeInTheDocument();
		expect(mockRouter.pathname).toBe('/dashboard/agents');
	});
});
