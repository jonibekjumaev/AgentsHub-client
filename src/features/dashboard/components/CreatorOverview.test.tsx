import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Me } from '@/auth';
import { CreatorAgentsQuery, myAgentsVariables } from '@/features/agents';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreatorStatsQuery } from '../graphql/creatorStats';
import { DashboardHome } from './DashboardHome';

const creator = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

const statsMock = (memberProducts: number): MockedResponse => ({
	request: { query: CreatorStatsQuery },
	result: {
		data: {
			getMe: {
				__typename: 'Member',
				_id: creator._id,
				memberProducts,
				memberViews: 1284,
				memberLikes: 96,
				memberFollowers: 312,
			},
		},
	},
});

const recentMock: MockedResponse = {
	request: { query: CreatorAgentsQuery, variables: myAgentsVariables({ tab: 'all', page: 1 }) },
	result: {
		data: {
			list: {
				__typename: 'Products',
				list: [
					{
						__typename: 'Product',
						_id: '6ac7992dd87bde19b9216d01',
						productTitle: 'SupportPilot',
						productCategory: 'CUSTOMER_SUPPORT',
						productStatus: 'PAUSED',
						productPricing: 'FREE',
						productPrice: null,
						productImages: [],
						productViews: 1,
						productLikes: 1,
						productComments: 0,
						updatedAt: '2026-10-10T12:00:00.000Z',
					},
				],
				metaCounter: [{ __typename: 'TotalCounter', total: 1 }],
			},
			active: { __typename: 'Products', metaCounter: [] },
			paused: { __typename: 'Products', metaCounter: [{ __typename: 'TotalCounter', total: 1 }] },
		},
	},
};

describe('Creator overview (/dashboard)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('shows only counters the API keeps, with honest labels, and no rank tile', async () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: creator }, mocks: [statsMock(4), recentMock] });

		const stats = await screen.findByRole('list', { name: 'Your numbers' });
		const tiles = within(stats).getAllByRole('listitem').map((tile) => tile.textContent);
		expect(tiles).toEqual(['Agents4Active and paused', 'Profile views1,284', 'Profile likes96', 'Followers312']);
		expect(screen.queryByText(/rank/i)).not.toBeInTheDocument();

		const recent = await screen.findByRole('region', { name: 'Recently updated agents' });
		expect(within(recent).getByRole('link', { name: 'SupportPilot' })).toHaveAttribute(
			'href',
			'/dashboard/agents/6ac7992dd87bde19b9216d01',
		);
		expect(within(recent).getByText('Paused')).toBeInTheDocument();
	});

	it('invites a creator without agents to list the first one', async () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: creator }, mocks: [statsMock(0)] });
		expect(await screen.findByRole('link', { name: 'List your first agent' })).toHaveAttribute('href', '/dashboard/agents/new');
	});

	it('sends a USER to My briefs once, with replace', async () => {
		const replace = vi.spyOn(mockRouter, 'replace');
		const push = vi.spyOn(mockRouter, 'push');
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: { ...creator, memberType: 'USER' } } });

		await waitFor(() => expect(mockRouter.asPath).toBe('/dashboard/briefs'));
		// The route change gives a new router object; that must not trigger a second redirect.
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(replace).toHaveBeenCalledTimes(1);
		expect(push).not.toHaveBeenCalled();
		expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
	});

	it('keeps the placeholder for an ADMIN', () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: { ...creator, memberType: 'ADMIN' } } });
		expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
		expect(screen.queryByRole('list', { name: 'Your numbers' })).not.toBeInTheDocument();
		expect(mockRouter.asPath).toBe('/dashboard');
	});
});
