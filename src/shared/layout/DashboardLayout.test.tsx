import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { DashboardLayout } from './DashboardLayout';
import { DashboardNavCountsQuery } from './graphql';
import { followsTab, isDashboardItemActive } from './navigation';

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

const countsMock: MockedResponse = {
	request: { query: DashboardNavCountsQuery },
	result: {
		data: {
			getMe: {
				__typename: 'Member',
				_id: '6ac7992dd87bde19b9216c8b',
				memberProducts: 4,
				memberBriefs: 2,
				memberArticles: 3,
				memberFollowers: 312,
				memberFollowings: 9,
			},
		},
	},
};

const renderAt = (url: string, memberType: Me['memberType'], mocks: MockedResponse[] = []) => {
	mockRouter.setCurrentUrl(url);
	renderWithProviders(
		<DashboardLayout roles={['CREATOR', 'USER', 'ADMIN']}>
			<p>Page content</p>
		</DashboardLayout>,
		{ auth: { status: 'member', me: member(memberType) }, mocks },
	);
	const sidebar = screen.getByRole('navigation', { name: 'Dashboard' });
	return { sidebar, links: within(sidebar).getAllByRole('link') };
};

describe('DashboardLayout', () => {
	it.each([
		[
			'CREATOR',
			[
				'Overview',
				'My agents',
				'Articles',
				'Followers',
				'Following',
				'Profile visitors',
				'Favorites',
				'Saved briefs',
				'Recently visited',
				'Profile settings',
				'View public profile',
			],
		],
		[
			'USER',
			[
				'My briefs',
				'Articles',
				'Following',
				'Followers',
				'Profile visitors',
				'Favorites',
				'Saved briefs',
				'Recently visited',
				'Profile settings',
				'View public profile',
			],
		],
		['ADMIN', ['Members', 'Agents', 'Briefs', 'Articles', 'Profile settings']],
	] as const)('shows the %s sidebar items', (memberType, labels) => {
		const { links } = renderAt('/dashboard', memberType);
		expect(links.map((link) => link.textContent)).toEqual(labels);
		expect(screen.getByRole('main')).toHaveTextContent('Page content');
	});

	it('groups the creator items under Workspace, Library and Account', () => {
		const { sidebar } = renderAt('/dashboard', 'CREATOR');
		const workspace = within(sidebar).getByRole('list', { name: 'Workspace' });
		expect(within(workspace).getByRole('link', { name: 'Profile visitors' })).toHaveAttribute('href', '/dashboard/visitors');
		const library = within(sidebar).getByRole('list', { name: 'Library' });
		expect(within(library).getByRole('link', { name: 'Recently visited' })).toHaveAttribute('href', '/dashboard/visited');
		expect(within(library).getByRole('link', { name: 'Saved briefs' })).toHaveAttribute('href', '/dashboard/saved-briefs');
		expect(within(sidebar).getByRole('list', { name: 'Account' })).toBeInTheDocument();
		expect(within(sidebar).getByRole('link', { name: 'View public profile' })).toHaveAttribute('href', '/members/6ac7992dd87bde19b9216c8b');
	});

	it('shows the member counters next to the items once they load', async () => {
		const { sidebar } = renderAt('/dashboard', 'CREATOR', [countsMock]);
		expect(await within(sidebar).findByRole('link', { name: 'My agents 4' })).toHaveAttribute('href', '/dashboard/agents');
		expect(within(sidebar).getByRole('link', { name: 'Articles 3' })).toBeInTheDocument();
		expect(within(sidebar).getByRole('link', { name: 'Followers 312' })).toBeInTheDocument();
		expect(within(sidebar).getByRole('link', { name: 'Following 9' })).toBeInTheDocument();
		// No counter on items the API keeps none for.
		expect(within(sidebar).getByRole('link', { name: 'Profile visitors' })).toBeInTheDocument();
	});

	it('gives no admin a public profile link', () => {
		const { sidebar } = renderAt('/admin/members', 'ADMIN');
		expect(within(sidebar).queryByRole('link', { name: 'View public profile' })).not.toBeInTheDocument();
		expect(within(sidebar).getByRole('link', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
	});

	it.each([
		['/dashboard/follows?tab=following', 'CREATOR', 'Following'],
		['/dashboard/follows?tab=followers', 'USER', 'Followers'],
		// No (or a wrong) ?tab=: the role's own list is open.
		['/dashboard/follows', 'CREATOR', 'Followers'],
		['/dashboard/follows?tab=x', 'USER', 'Following'],
	] as const)('on %s (%s) marks only %s active', (url, memberType, label) => {
		const { sidebar, links } = renderAt(url, memberType);
		expect(within(sidebar).getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
		expect(links.filter((link) => link.hasAttribute('aria-current'))).toHaveLength(1);
	});

	it('marks only the exact root item active on /dashboard', () => {
		const { sidebar } = renderAt('/dashboard', 'CREATOR');
		expect(within(sidebar).getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
		expect(within(sidebar).getAllByRole('link').filter((link) => link.hasAttribute('aria-current'))).toHaveLength(1);
	});

	it('marks the section of a nested route active, not Overview', () => {
		const { sidebar } = renderAt('/dashboard/agents/[id]/edit', 'CREATOR');
		expect(within(sidebar).getByRole('link', { name: 'My agents' })).toHaveAttribute('aria-current', 'page');
		expect(within(sidebar).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
	});

	it('links USER items to their routes', () => {
		const { sidebar } = renderAt('/dashboard/briefs', 'USER');
		const myBriefs = within(sidebar).getByRole('link', { name: 'My briefs' });
		expect(myBriefs).toHaveAttribute('href', '/dashboard/briefs');
		expect(myBriefs).toHaveAttribute('aria-current', 'page');
		expect(within(sidebar).getByRole('link', { name: 'Recently visited' })).toHaveAttribute('href', '/dashboard/visited');
	});

	it('shows no sidebar or content while the session is loading', () => {
		mockRouter.setCurrentUrl('/dashboard');
		renderWithProviders(
			<DashboardLayout roles={['CREATOR']}>
				<p>Page content</p>
			</DashboardLayout>,
			{ auth: { status: 'loading' } },
		);
		expect(screen.queryByRole('navigation', { name: 'Dashboard' })).not.toBeInTheDocument();
		expect(screen.queryByText('Page content')).not.toBeInTheDocument();
	});
});

describe('dashboard navigation helpers', () => {
	it('picks the follows tab from the URL, else by role', () => {
		expect(followsTab('following', 'CREATOR')).toBe('following');
		expect(followsTab(undefined, 'CREATOR')).toBe('followers');
		expect(followsTab(['followers'], 'USER')).toBe('following');
		expect(followsTab('nope', 'USER')).toBe('following');
	});

	it('matches an item with a tab only on that tab', () => {
		const item = { href: '/dashboard/follows?tab=followers', labelKey: 'x', icon: 'followers', tab: 'followers' } as const;
		expect(isDashboardItemActive('/dashboard/follows', 'followers', item)).toBe(true);
		expect(isDashboardItemActive('/dashboard/follows', 'following', item)).toBe(false);
		expect(isDashboardItemActive('/dashboard/agents', 'followers', item)).toBe(false);
	});
});
