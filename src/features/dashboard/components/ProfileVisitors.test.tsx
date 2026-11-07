import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ProfileVisitorsQuery } from '../graphql/visitors';
import { profileVisitorsVariables } from '../lib/overview';
import { ProfileVisitors } from './ProfileVisitors';

const visit = (index: number) => ({
	__typename: 'ProfileVisit',
	_id: `6ac7992dd87bde19b9217a${String(index).padStart(2, '0')}`,
	visitedAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
	visitor: {
		__typename: 'Member',
		_id: `6ac7992dd87bde19b9217b${String(index).padStart(2, '0')}`,
		memberType: 'USER',
		memberNick: `buyer${index}`,
		memberFullName: index === 1 ? 'Aziz Karimov' : null,
		memberImage: '',
		memberFollowers: 2,
	},
});

const visitorsMock = (page: number, list: ReturnType<typeof visit>[], total: number, privateCount: number): MockedResponse => ({
	request: { query: ProfileVisitorsQuery, variables: profileVisitorsVariables(page) },
	result: {
		data: {
			getProfileVisitors: {
				__typename: 'ProfileVisitors',
				list,
				metaCounter: total ? [{ __typename: 'TotalCounter', total }] : [],
				privateCount,
			},
		},
	},
});

const renderVisitors = (mocks: MockedResponse[]) => renderWithProviders(<ProfileVisitors />, { mocks, auth: { status: 'member' } });

describe('ProfileVisitors (/dashboard/visitors)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/visitors');
	});

	it('shows a skeleton, then the visitors newest first with links to their profiles', async () => {
		renderVisitors([visitorsMock(1, [visit(1), visit(2)], 2, 0)]);

		expect(screen.getByRole('status', { name: 'Loading your visitors…' })).toBeInTheDocument();
		const list = await screen.findByRole('list', { name: 'Profile visitors' });
		const rows = within(list).getAllByRole('listitem');
		expect(within(rows[0]).getByRole('link', { name: 'Aziz Karimov' })).toHaveAttribute('href', '/members/6ac7992dd87bde19b9217b01');
		expect(within(rows[0]).getByText('1 hour ago')).toBeInTheDocument();
		expect(within(rows[1]).getByRole('link', { name: 'buyer2' })).toBeInTheDocument();
		expect(screen.queryByRole('note')).not.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Browse privately yourself' })).toHaveAttribute('href', '/dashboard/settings');
	});

	it('only counts private visitors, never names them', async () => {
		renderVisitors([visitorsMock(1, [visit(1)], 1, 3)]);
		expect(await screen.findByRole('note')).toHaveTextContent('3 members visited privately, so their names are hidden.');
		expect(screen.getAllByRole('listitem')).toHaveLength(1);
	});

	it('shows the private note alone when every visitor was private', async () => {
		renderVisitors([visitorsMock(1, [], 0, 1)]);
		expect(await screen.findByRole('note')).toHaveTextContent('1 member visited privately, so their name is hidden.');
		expect(screen.queryByRole('list', { name: 'Profile visitors' })).not.toBeInTheDocument();
		expect(screen.queryByText('No visitors yet')).not.toBeInTheDocument();
	});

	it('shows the empty state without any visit', async () => {
		renderVisitors([visitorsMock(1, [], 0, 0)]);
		expect(await screen.findByRole('heading', { name: 'No visitors yet' })).toBeInTheDocument();
	});

	it('pages with buttons', async () => {
		const user = userEvent.setup();
		const firstPage = Array.from({ length: 10 }, (_, index) => visit(index + 1));
		renderVisitors([visitorsMock(1, firstPage, 11, 0), visitorsMock(2, [visit(11)], 11, 0)]);

		await screen.findByRole('list', { name: 'Profile visitors' });
		await user.click(screen.getByRole('button', { name: /2/ }));
		expect(await screen.findByRole('link', { name: 'buyer11' })).toBeInTheDocument();
	});

	it('shows an error with retry', async () => {
		renderVisitors([{ request: { query: ProfileVisitorsQuery, variables: profileVisitorsVariables(1) }, error: new Error('down') }]);
		expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't load your visitors");
	});
});
