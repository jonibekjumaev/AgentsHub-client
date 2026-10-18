import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { DashboardLayout } from './DashboardLayout';

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

const renderAt = (url: string, memberType: Me['memberType']) => {
	mockRouter.setCurrentUrl(url);
	renderWithProviders(
		<DashboardLayout roles={['CREATOR', 'USER', 'ADMIN']}>
			<p>Page content</p>
		</DashboardLayout>,
		{ auth: { status: 'member', me: member(memberType) } },
	);
	const sidebar = screen.getByRole('navigation', { name: 'Dashboard' });
	return { sidebar, links: within(sidebar).getAllByRole('link') };
};

describe('DashboardLayout', () => {
	it.each([
		['CREATOR', ['Overview', 'My agents', 'Articles', 'Favorites', 'Followers', 'Profile settings']],
		['USER', ['My briefs', 'Favorites', 'Recently visited', 'Articles', 'Following', 'Profile settings']],
		['ADMIN', ['Members', 'Agents', 'Briefs', 'Articles']],
	] as const)('shows the %s sidebar items', (memberType, labels) => {
		const { links } = renderAt('/dashboard', memberType);
		expect(links.map((link) => link.textContent)).toEqual(labels);
		expect(screen.getByRole('main')).toHaveTextContent('Page content');
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
