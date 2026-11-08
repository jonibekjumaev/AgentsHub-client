import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ProductStatus } from '@/gql/enums';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreatorAgentsQuery, TopCreatorAgentsQuery, UpdateAgentStatusMutation } from '../../graphql/creatorAgents';
import { myAgentsVariables, topAgentsVariables, viewsShare } from '../../lib/myAgents';
import { RecentAgents } from './RecentAgents';
import { TopAgents } from './TopAgents';

type Row = ReturnType<typeof row>;

const row = (index: number, patch: Record<string, unknown> = {}) => ({
	__typename: 'Product' as const,
	_id: `6ac7992dd87bde19b9216d${String(index).padStart(2, '0')}`,
	productTitle: `Agent ${index}`,
	productCategory: 'SALES' as const,
	productStatus: 'ACTIVE' as ProductStatus,
	productPricing: 'ONE_TIME' as const,
	productPrice: 29,
	productImages: [],
	productViews: 640,
	productLikes: 1,
	productComments: 0,
	updatedAt: '2026-10-10T12:00:00.000Z',
	...patch,
});

const counter = (total: number) => (total ? [{ __typename: 'TotalCounter', total }] : []);

const listMock = (rows: Row[], counts: { active: number; paused: number }): MockedResponse => ({
	request: { query: CreatorAgentsQuery, variables: myAgentsVariables({ tab: 'all', page: 1 }) },
	result: {
		data: {
			list: { __typename: 'Products', list: rows, metaCounter: counter(counts.active + counts.paused) },
			active: { __typename: 'Products', metaCounter: counter(counts.active) },
			paused: { __typename: 'Products', metaCounter: counter(counts.paused) },
		},
	},
});

const statusMock = (item: Row, productStatus: string): MockedResponse => ({
	request: { query: UpdateAgentStatusMutation, variables: { input: { _id: item._id, productStatus } } },
	result: { data: { updateProduct: { __typename: 'Product', _id: item._id, productStatus, updatedAt: '2026-10-18T12:00:00.000Z' } } },
});

const live = row(1, { productTitle: 'SupportPilot' });
const hidden = row(2, { productTitle: 'ReviewReply', productStatus: 'PAUSED' });

describe('RecentAgents (overview "Your agents")', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard');
	});

	it('shows at most five rows, newest change first, with the total', async () => {
		const rows = Array.from({ length: 7 }, (_, index) => row(index + 1));
		renderWithProviders(<RecentAgents />, { mocks: [listMock(rows, { active: 7, paused: 0 })], auth: { status: 'member' } });

		const panel = await screen.findByRole('region', { name: 'Your agents' });
		expect(within(panel).getAllByRole('listitem')).toHaveLength(5);
		expect(within(panel).getByText('5 of 7, most recently changed first')).toBeInTheDocument();
		expect(within(panel).getByRole('link', { name: 'Manage all agents' })).toHaveAttribute('href', '/dashboard/agents');
		expect(within(panel).getAllByText('640 views')).toHaveLength(5);
		expect(within(panel).getAllByText('1 like')).toHaveLength(5);
	});

	it('offers edit, pause and the public page for a live agent', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RecentAgents />, { mocks: [listMock([live], { active: 1, paused: 0 })], auth: { status: 'member' } });

		await user.click(await screen.findByRole('button', { name: 'Actions for SupportPilot' }));
		const menu = screen.getByRole('menu');
		expect(within(menu).getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('href', `/dashboard/agents/${live._id}/edit`);
		expect(within(menu).getByRole('menuitem', { name: 'View public page' })).toHaveAttribute('href', `/agents/${live._id}`);
		expect(within(menu).getByRole('menuitem', { name: 'Pause' })).toBeInTheDocument();
		expect(within(menu).queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
	});

	it('offers activate and the owner preview for a paused agent (it has no public page)', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RecentAgents />, { mocks: [listMock([hidden], { active: 0, paused: 1 })], auth: { status: 'member' } });

		await user.click(await screen.findByRole('button', { name: 'Actions for ReviewReply' }));
		const menu = screen.getByRole('menu');
		expect(within(menu).getByRole('menuitem', { name: 'Preview' })).toHaveAttribute('href', `/dashboard/agents/${hidden._id}`);
		expect(within(menu).queryByRole('menuitem', { name: 'View public page' })).not.toBeInTheDocument();
		expect(within(menu).getByRole('menuitem', { name: 'Activate' })).toBeInTheDocument();
	});

	it('pauses only after the confirm dialog, then shows the server state', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RecentAgents />, {
			mocks: [
				listMock([live], { active: 1, paused: 0 }),
				statusMock(live, 'PAUSED'),
				listMock([{ ...live, productStatus: 'PAUSED' }], { active: 0, paused: 1 }),
			],
			auth: { status: 'member' },
		});

		await user.click(await screen.findByRole('button', { name: 'Actions for SupportPilot' }));
		await user.click(screen.getByRole('menuitem', { name: 'Pause' }));
		const dialog = screen.getByRole('dialog', { name: 'Pause “SupportPilot”?' });
		await user.click(within(dialog).getByRole('button', { name: 'Pause agent' }));

		expect(await screen.findByText('“SupportPilot” is paused.')).toBeInTheDocument();
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		expect(within(screen.getByRole('region', { name: 'Your agents' })).getByText('Paused')).toBeInTheDocument();
	});

	it('activates a paused agent without a dialog', async () => {
		const user = userEvent.setup();
		renderWithProviders(<RecentAgents />, {
			mocks: [
				listMock([hidden], { active: 0, paused: 1 }),
				statusMock(hidden, 'ACTIVE'),
				listMock([{ ...hidden, productStatus: 'ACTIVE' }], { active: 1, paused: 0 }),
			],
			auth: { status: 'member' },
		});

		await user.click(await screen.findByRole('button', { name: 'Actions for ReviewReply' }));
		await user.click(screen.getByRole('menuitem', { name: 'Activate' }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(await screen.findByText('“ReviewReply” is active again.')).toBeInTheDocument();
	});

	it('renders nothing when the creator has no agents', async () => {
		const { container } = renderWithProviders(<RecentAgents />, {
			mocks: [listMock([], { active: 0, paused: 0 })],
			auth: { status: 'member' },
		});
		await waitFor(() => expect(screen.queryByLabelText('Loading your agents…')).not.toBeInTheDocument());
		expect(container).toBeEmptyDOMElement();
	});
});

const topMock = (rows: { title: string; views: number; status?: string }[]): MockedResponse => ({
	request: { query: TopCreatorAgentsQuery, variables: topAgentsVariables() },
	result: {
		data: {
			getCreatorProducts: {
				__typename: 'Products',
				list: rows.map((item, index) => ({
					__typename: 'Product',
					_id: `6ac7992dd87bde19b9216e${String(index).padStart(2, '0')}`,
					productTitle: item.title,
					productStatus: item.status ?? 'ACTIVE',
					productViews: item.views,
				})),
			},
		},
	},
});

describe('TopAgents (overview "Top agents by views")', () => {
	it('asks for the five most viewed agents', () => {
		expect(topAgentsVariables()).toEqual({
			input: { page: 1, limit: 5, sort: 'productViews', direction: 'DESC', search: {} },
		});
	});

	it('sizes each bar relative to the most viewed agent', () => {
		expect(viewsShare(640, 640)).toBe(100);
		expect(viewsShare(160, 640)).toBe(25);
		expect(viewsShare(0, 0)).toBe(0);
	});

	it('lists the agents in rank order with their views and a paused note', async () => {
		renderWithProviders(<TopAgents />, {
			mocks: [topMock([{ title: 'SupportPilot', views: 1200 }, { title: 'ReviewReply', views: 300, status: 'PAUSED' }])],
			auth: { status: 'member' },
		});

		const card = await screen.findByRole('region', { name: 'Top agents by views' });
		const items = within(card).getAllByRole('listitem');
		expect(items.map((item) => within(item).getByRole('link').textContent)).toEqual(['SupportPilot', 'ReviewReply']);
		expect(within(items[0]).getByText('1.2K views')).toBeInTheDocument();
		expect(within(items[1]).getByText('Paused')).toBeInTheDocument();
	});

	it('renders nothing without agents', async () => {
		const { container } = renderWithProviders(<TopAgents />, { mocks: [topMock([])], auth: { status: 'member' } });
		await waitFor(() => expect(screen.queryByLabelText('Loading your top agents…')).not.toBeInTheDocument());
		expect(container).toBeEmptyDOMElement();
	});
});
