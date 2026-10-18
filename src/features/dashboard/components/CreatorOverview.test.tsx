import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
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

	it('keeps the placeholder for other roles', () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: { ...creator, memberType: 'USER' } } });
		expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
		expect(screen.queryByRole('list', { name: 'Your numbers' })).not.toBeInTheDocument();
	});
});
