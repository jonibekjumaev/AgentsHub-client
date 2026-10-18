import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { Header } from './Header';

const creator: Me = {
	_id: '6ac7992dd87bde19b9216c8b',
	memberType: 'CREATOR',
	memberStatus: 'ACTIVE',
	memberNick: 'nova_labs',
	memberFullName: 'Nova Labs',
	memberImage: '',
	memberPhone: '+998901234567',
	memberEmail: null,
	memberWhatsapp: null,
};

/** The desktop bar: CSS hides it below md, and jsdom only applies the mobile-first base styles. */
const desktop = () => screen.getByRole('banner');
const getDesktop = (role: string, name: string) => within(desktop()).getByRole(role, { name, hidden: true });
const queryDesktop = (role: string, name: string) => within(desktop()).queryByRole(role, { name, hidden: true });

describe('Header', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/agents/abc');
	});

	it('marks the current section with aria-current', () => {
		renderWithProviders(<Header />, { auth: { status: 'guest' } });

		expect(getDesktop('link', 'Agents')).toHaveAttribute('aria-current', 'page');
		expect(getDesktop('link', 'Briefs')).not.toHaveAttribute('aria-current');
	});

	it('shows Log in and Sign up to a guest', () => {
		renderWithProviders(<Header />, { auth: { status: 'guest' } });

		expect(getDesktop('link', 'Log in')).toHaveAttribute('href', '/login');
		expect(getDesktop('link', 'Sign up')).toHaveAttribute('href', '/signup');
		expect(queryDesktop('link', 'Dashboard')).not.toBeInTheDocument();
	});

	it('shows neither guest nor member actions while the session is loading', () => {
		renderWithProviders(<Header />, { auth: { status: 'loading' } });

		expect(queryDesktop('link', 'Log in')).not.toBeInTheDocument();
		expect(queryDesktop('link', 'Sign up')).not.toBeInTheDocument();
		expect(queryDesktop('link', 'Dashboard')).not.toBeInTheDocument();
		expect(queryDesktop('button', 'Account menu for @nova_labs')).not.toBeInTheDocument();
	});

	it('shows Dashboard and the account menu to a member; Log out calls logout', async () => {
		const user = userEvent.setup();
		const logout = vi.fn(async () => undefined);
		renderWithProviders(<Header />, { auth: { status: 'member', me: creator, logout } });

		expect(getDesktop('link', 'Dashboard')).toHaveAttribute('href', '/dashboard');
		expect(queryDesktop('link', 'Log in')).not.toBeInTheDocument();

		await user.click(getDesktop('button', 'Account menu for @nova_labs'));
		const menu = await screen.findByRole('menu');
		expect(within(menu).getByText('@nova_labs · Creator')).toBeInTheDocument();
		expect(within(menu).getByRole('menuitem', { name: 'My profile' })).toHaveAttribute(
			'href',
			`/members/${creator._id}`,
		);
		expect(within(menu).getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/dashboard/settings');

		await user.click(within(menu).getByRole('menuitem', { name: 'Log out' }));
		expect(logout).toHaveBeenCalledTimes(1);
	});

	it('sends an admin to the admin area from Dashboard', () => {
		renderWithProviders(<Header />, { auth: { status: 'member', me: { ...creator, memberType: 'ADMIN' } } });
		expect(getDesktop('link', 'Dashboard')).toHaveAttribute('href', '/admin/members');
	});
});

describe('Header mobile drawer', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/briefs');
	});

	it('opens with the same items and closes with the close button', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Header />, { auth: { status: 'guest' } });

		const toggle = screen.getByRole('button', { name: 'Open menu' });
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await user.click(toggle);

		const drawer = await screen.findByRole('dialog');
		expect(toggle).toHaveAttribute('aria-expanded', 'true');
		const nav = within(drawer).getByRole('navigation', { name: 'Main' });
		expect(within(nav).getByRole('link', { name: 'Briefs' })).toHaveAttribute('aria-current', 'page');
		expect(within(nav).getAllByRole('link')).toHaveLength(4);
		expect(within(drawer).getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
		expect(within(drawer).getByRole('button', { name: 'Language: English' })).toBeInTheDocument();

		await user.click(within(drawer).getByRole('button', { name: 'Close menu' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(toggle).toHaveAttribute('aria-expanded', 'false');
	});

	it('closes after a link is followed', async () => {
		const user = userEvent.setup();
		renderWithProviders(<Header />, { auth: { status: 'guest' } });

		await user.click(screen.getByRole('button', { name: 'Open menu' }));
		const drawer = await screen.findByRole('dialog');
		await user.click(within(drawer).getByRole('link', { name: 'Agents' }));

		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('logs a member out from the drawer', async () => {
		const user = userEvent.setup();
		const logout = vi.fn(async () => undefined);
		renderWithProviders(<Header />, { auth: { status: 'member', me: creator, logout } });

		await user.click(screen.getByRole('button', { name: 'Open menu' }));
		const drawer = await screen.findByRole('dialog');
		expect(within(drawer).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
		expect(within(drawer).queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();

		await user.click(within(drawer).getByRole('button', { name: 'Log out' }));
		expect(logout).toHaveBeenCalledTimes(1);
	});
});
