import { ApolloError } from '@apollo/client';
import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ProductStatus } from '@/gql/enums';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreatorAgentsQuery, UpdateAgentStatusMutation } from '../../graphql/creatorAgents';
import { myAgentsVariables, type MyAgentsView } from '../../lib/myAgents';
import { MyAgents } from './MyAgents';

type Row = ReturnType<typeof row>;

const row = (index: number, patch: Record<string, unknown> = {}) => ({
	__typename: 'Product' as const,
	_id: `6ac7992dd87bde19b9216d${String(index).padStart(2, '0')}`,
	productTitle: `Agent ${index}`,
	productCategory: 'SALES' as const,
	productStatus: 'ACTIVE' as ProductStatus,
	productPricing: 'ONE_TIME' as const,
	productPrice: 29,
	productImages: ['uploads/product/a.png'],
	productViews: 640,
	productLikes: 31,
	productComments: 0,
	updatedAt: '2026-10-10T12:00:00.000Z',
	...patch,
});

const counter = (total: number) => (total ? [{ __typename: 'TotalCounter', total }] : []);

const listMock = (view: MyAgentsView, rows: Row[], counts: { active: number; paused: number }): MockedResponse => ({
	request: { query: CreatorAgentsQuery, variables: myAgentsVariables(view) },
	result: {
		data: {
			list: { __typename: 'Products', list: rows, metaCounter: counter(rows.length) },
			active: { __typename: 'Products', metaCounter: counter(counts.active) },
			paused: { __typename: 'Products', metaCounter: counter(counts.paused) },
		},
	},
});

const statusMock = (rowItem: Row, productStatus: string, extra: Partial<MockedResponse> = {}): MockedResponse => ({
	request: { query: UpdateAgentStatusMutation, variables: { input: { _id: rowItem._id, productStatus } } },
	result: { data: { updateProduct: { __typename: 'Product', _id: rowItem._id, productStatus, updatedAt: '2026-10-18T12:00:00.000Z' } } },
	...extra,
});

const ALL: MyAgentsView = { tab: 'all', page: 1 };
const active = row(1, { productTitle: 'SupportPilot' });
const paused = row(2, { productTitle: 'ReviewReply', productStatus: 'PAUSED', productPricing: 'CUSTOM', productPrice: null });

const renderMyAgents = (mocks: MockedResponse[]) =>
	renderWithProviders(<MyAgents />, { mocks, auth: { status: 'member' } });

// hidden: true — while a dialog is open MUI marks the rest of the page aria-hidden.
const rowOf = (title: string) =>
	screen.getByRole('rowheader', { name: new RegExp(title), hidden: true }).closest('tr') as HTMLElement;
const dialogGone = () => waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

describe('MyAgents', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/agents');
	});

	it('shows a skeleton, then the table with tab counts', async () => {
		renderMyAgents([listMock(ALL, [active, paused], { active: 1, paused: 1 })]);

		expect(screen.getByRole('status', { name: 'Loading your agents…' })).toBeInTheDocument();
		expect(await screen.findByRole('table', { name: 'Your agents' })).toBeInTheDocument();

		const tabs = screen.getByRole('navigation', { name: 'Agent status' });
		expect(within(tabs).getByRole('link', { name: 'All · 2' })).toHaveAttribute('aria-current', 'page');
		expect(within(tabs).getByRole('link', { name: 'Paused · 1' })).toHaveAttribute('href', '/dashboard/agents?status=paused');
		expect(within(rowOf('SupportPilot')).getByRole('link', { name: 'Edit SupportPilot' })).toHaveAttribute(
			'href',
			`/dashboard/agents/${active._id}/edit`,
		);
		expect(within(rowOf('SupportPilot')).getByRole('link', { name: 'Preview SupportPilot' })).toHaveAttribute(
			'href',
			`/dashboard/agents/${active._id}`,
		);
	});

	it('offers only the D-29 transitions for each status', async () => {
		renderMyAgents([listMock(ALL, [active, paused], { active: 1, paused: 1 })]);
		await screen.findByRole('table');

		const activeRow = within(rowOf('SupportPilot'));
		expect(activeRow.getByRole('button', { name: 'Pause SupportPilot' })).toBeInTheDocument();
		expect(activeRow.getByRole('button', { name: 'Delete SupportPilot' })).toBeInTheDocument();
		expect(activeRow.queryByRole('button', { name: 'Activate SupportPilot' })).not.toBeInTheDocument();

		const pausedRow = within(rowOf('ReviewReply'));
		expect(pausedRow.getByRole('button', { name: 'Activate ReviewReply' })).toBeInTheDocument();
		expect(pausedRow.getByRole('button', { name: 'Delete ReviewReply' })).toBeInTheDocument();
		expect(pausedRow.queryByRole('button', { name: 'Pause ReviewReply' })).not.toBeInTheDocument();
	});

	it('pauses after confirming, then reloads the list (not optimistic)', async () => {
		const user = userEvent.setup();
		renderMyAgents([
			listMock(ALL, [active, paused], { active: 1, paused: 1 }),
			statusMock(active, 'PAUSED', { delay: 400 }),
			listMock(ALL, [{ ...active, productStatus: 'PAUSED' as ProductStatus }, paused], { active: 0, paused: 2 }),
		]);
		await screen.findByRole('table');

		await user.click(screen.getByRole('button', { name: 'Pause SupportPilot' }));
		const dialog = screen.getByRole('dialog', { name: 'Pause “SupportPilot”?' });
		expect(dialog).toHaveTextContent(/disappears from the marketplace/);

		await user.click(within(dialog).getByRole('button', { name: 'Pause agent' }));
		// Nothing changes before the server answers.
		expect(within(rowOf('SupportPilot')).getByText('Active')).toBeInTheDocument();
		expect(within(dialog).getByRole('button', { name: 'Pause agent' })).toBeDisabled();

		expect(await screen.findByText('“SupportPilot” is paused.')).toBeInTheDocument();
		await dialogGone();
		await waitFor(() => expect(screen.getByRole('link', { name: 'Paused · 2' })).toBeInTheDocument());
		expect(within(rowOf('SupportPilot')).getByRole('button', { name: 'Activate SupportPilot' })).toBeInTheDocument();
	});

	it('activates a paused agent without a dialog', async () => {
		const user = userEvent.setup();
		renderMyAgents([
			listMock(ALL, [active, paused], { active: 1, paused: 1 }),
			statusMock(paused, 'ACTIVE'),
			listMock(ALL, [active, { ...paused, productStatus: 'ACTIVE' as ProductStatus }], { active: 2, paused: 0 }),
		]);
		await screen.findByRole('table');

		await user.click(screen.getByRole('button', { name: 'Activate ReviewReply' }));
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(await screen.findByText('“ReviewReply” is active again.')).toBeInTheDocument();
	});

	it('deletes after a destructive confirm, removes the row and moves focus to the heading', async () => {
		const user = userEvent.setup();
		renderMyAgents([
			listMock(ALL, [active, paused], { active: 1, paused: 1 }),
			statusMock(active, 'DELETE'),
			listMock(ALL, [paused], { active: 0, paused: 1 }),
		]);
		await screen.findByRole('table');

		await user.click(screen.getByRole('button', { name: 'Delete SupportPilot' }));
		const dialog = screen.getByRole('dialog', { name: 'Delete “SupportPilot”?' });
		expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();
		await user.click(within(dialog).getByRole('button', { name: 'Delete agent' }));

		await dialogGone();
		expect(screen.queryByRole('rowheader', { name: /SupportPilot/ })).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 1, name: 'My agents' })).toHaveFocus();
		expect(screen.getByText('“SupportPilot” was deleted.')).toBeInTheDocument();
	});

	it('sends nothing when the dialog is cancelled', async () => {
		const user = userEvent.setup();
		// No mutation mock: a request would fail and show an error toast.
		renderMyAgents([listMock(ALL, [active], { active: 1, paused: 0 })]);
		await screen.findByRole('table');

		await user.click(screen.getByRole('button', { name: 'Delete SupportPilot' }));
		await user.click(screen.getByRole('button', { name: 'Cancel' }));
		await dialogGone();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('explains a NOT_FOUND (changed meanwhile) and reloads the list', async () => {
		const user = userEvent.setup();
		renderMyAgents([
			listMock(ALL, [active, paused], { active: 1, paused: 1 }),
			{
				request: { query: UpdateAgentStatusMutation, variables: { input: { _id: active._id, productStatus: 'PAUSED' } } },
				error: new ApolloError({ graphQLErrors: [{ message: 'Update failed!', extensions: { code: 'NOT_FOUND' } }] }),
			},
			listMock(ALL, [paused], { active: 0, paused: 1 }),
		]);
		await screen.findByRole('table');

		await user.click(screen.getByRole('button', { name: 'Pause SupportPilot' }));
		await user.click(screen.getByRole('button', { name: 'Pause agent' }));

		expect(await screen.findByText(/changed or removed in the meantime/)).toBeInTheDocument();
		expect(screen.queryByText('Update failed!')).not.toBeInTheDocument();
		await waitFor(() => expect(screen.queryByRole('rowheader', { name: /SupportPilot/ })).not.toBeInTheDocument());
	});

	it('invites a creator without agents to list the first one', async () => {
		renderMyAgents([listMock(ALL, [], { active: 0, paused: 0 })]);
		expect(await screen.findByRole('link', { name: 'List your first agent' })).toHaveAttribute('href', '/dashboard/agents/new');
	});

	it('reads the tab from the URL and says when it is empty', async () => {
		mockRouter.setCurrentUrl('/dashboard/agents?status=paused');
		renderMyAgents([listMock({ tab: 'paused', page: 1 }, [], { active: 2, paused: 0 })]);

		expect(await screen.findByRole('heading', { name: 'No paused agents' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Show all agents' })).toHaveAttribute('href', '/dashboard/agents');
		expect(screen.getByRole('link', { name: 'Paused · 0' })).toHaveAttribute('aria-current', 'page');
	});

	it('shows the error state with retry', async () => {
		const user = userEvent.setup();
		renderMyAgents([
			{ request: { query: CreatorAgentsQuery, variables: myAgentsVariables(ALL) }, error: new TypeError('Failed to fetch') },
			listMock(ALL, [active], { active: 1, paused: 0 }),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("We couldn't load your agents");
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await screen.findByRole('table')).toBeInTheDocument();
	});
});
