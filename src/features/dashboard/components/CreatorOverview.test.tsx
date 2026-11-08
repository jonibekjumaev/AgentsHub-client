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

type Stats = {
	memberProducts: number;
	memberFullName: string | null;
	memberImage: string;
	memberDesc: string | null;
	memberWhatsapp: string | null;
	memberEmail: string | null;
	memberArticles: number;
};

const statsMock = (patch: Partial<Stats> = {}): MockedResponse => ({
	request: { query: CreatorStatsQuery },
	result: {
		data: {
			getMe: {
				__typename: 'Member',
				_id: creator._id,
				memberNick: 'nova_labs',
				memberFullName: 'Nova Labs',
				memberImage: 'uploads/member/a.png',
				memberDesc: 'We build support agents.',
				memberWhatsapp: null,
				memberEmail: 'hi@nova.dev',
				memberProducts: 4,
				memberArticles: 2,
				memberViews: 1284,
				memberLikes: 96,
				memberFollowers: 312,
				memberFollowings: 1,
				createdAt: '2026-03-01T12:00:00.000Z',
				...patch,
			},
		},
	},
});

const agentsMock = (active: number, paused: number): MockedResponse => ({
	request: { query: CreatorAgentsQuery, variables: myAgentsVariables({ tab: 'all', page: 1 }) },
	result: {
		data: {
			list: {
				__typename: 'Products',
				list:
					active + paused === 0
						? []
						: [
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
				metaCounter: active + paused ? [{ __typename: 'TotalCounter', total: active + paused }] : [],
			},
			active: { __typename: 'Products', metaCounter: active ? [{ __typename: 'TotalCounter', total: active }] : [] },
			paused: { __typename: 'Products', metaCounter: paused ? [{ __typename: 'TotalCounter', total: paused }] : [] },
		},
	},
});

describe('Creator overview (/dashboard)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard');
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('greets the creator and links the two main actions', async () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: creator }, mocks: [statsMock(), agentsMock(3, 1)] });

		expect(await screen.findByRole('heading', { level: 1, name: 'Welcome back, Nova Labs' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'New agent' })).toHaveAttribute('href', '/dashboard/agents/new');
		expect(screen.getByRole('link', { name: 'Write article' })).toHaveAttribute('href', '/dashboard/articles/new');
	});

	it('shows only counters the API keeps, with honest hints, and no rank tile', async () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: creator }, mocks: [statsMock(), agentsMock(3, 1)] });

		const stats = await screen.findByRole('list', { name: 'Your numbers' });
		await waitFor(() => expect(within(stats).getByText('3 active · 1 paused')).toBeInTheDocument());
		const tiles = within(stats).getAllByRole('listitem').map((tile) => tile.textContent);
		expect(tiles).toEqual([
			'Agents43 active · 1 paused',
			'Profile views1,284Since Mar 1, 2026',
			'Profile likes96Likes on your profile',
			'Followers312You follow 1 member',
		]);
		expect(screen.queryByText(/rank/i)).not.toBeInTheDocument();

		const recent = await screen.findByRole('region', { name: 'Your agents' });
		expect(within(recent).getByRole('link', { name: 'SupportPilot' })).toHaveAttribute('href', '/dashboard/agents/6ac7992dd87bde19b9216d01');
	});

	it('lists the missing profile steps with where to fix them', async () => {
		renderWithProviders(<DashboardHome />, {
			auth: { status: 'member', me: creator },
			mocks: [statsMock({ memberImage: '', memberEmail: null, memberWhatsapp: null, memberArticles: 0 }), agentsMock(3, 1)],
		});

		const steps = await screen.findByRole('region', { name: 'Next steps' });
		expect(within(steps).getByText('2 of 5 done')).toBeInTheDocument();
		expect(within(steps).getByRole('link', { name: 'Add a profile photo' })).toHaveAttribute('href', '/dashboard/settings');
		expect(within(steps).getByRole('link', { name: 'Add WhatsApp or e-mail' })).toHaveAttribute('href', '/dashboard/settings');
		expect(within(steps).getByRole('link', { name: 'Write your first article' })).toHaveAttribute('href', '/dashboard/articles/new');
		// Done steps are text, not links.
		expect(within(steps).queryByRole('link', { name: 'Write a short bio' })).not.toBeInTheDocument();
		expect(within(steps).getByText('Write a short bio')).toBeInTheDocument();
	});

	it('hides the checklist once every step is done', async () => {
		renderWithProviders(<DashboardHome />, { auth: { status: 'member', me: creator }, mocks: [statsMock(), agentsMock(3, 1)] });
		await screen.findByRole('list', { name: 'Your numbers' });
		expect(screen.queryByRole('region', { name: 'Next steps' })).not.toBeInTheDocument();
	});

	it('invites a creator without agents to list the first one', async () => {
		renderWithProviders(<DashboardHome />, {
			auth: { status: 'member', me: creator },
			mocks: [statsMock({ memberProducts: 0 }), agentsMock(0, 0)],
		});
		expect(await screen.findByRole('link', { name: 'List your first agent' })).toHaveAttribute('href', '/dashboard/agents/new');
		expect(screen.queryByRole('region', { name: 'Your agents' })).not.toBeInTheDocument();
		const steps = screen.getByRole('region', { name: 'Next steps' });
		expect(within(steps).getByRole('link', { name: 'Add your first agent' })).toHaveAttribute('href', '/dashboard/agents/new');
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
