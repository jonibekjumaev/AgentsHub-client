import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { MyBriefsQuery, UpdateBriefStatusMutation } from '../../graphql/myBriefs';
import { myBriefsVariables } from '../../lib/myBriefs';
import { MyBriefs } from './MyBriefs';

const user = { _id: '6ac7992dd87bde19b9216d99', memberType: 'USER', memberStatus: 'ACTIVE', memberNick: 'dilnoza_bakes' } as Me;

const row = (index: number, patch: Record<string, unknown> = {}) => ({
	__typename: 'Brief' as const,
	_id: `6ac7992dd87bde19b9216d${String(index + 20).padStart(2, '0')}`,
	briefTitle: `Brief ${index}`,
	briefCategory: 'SALES' as const,
	briefStatus: 'OPEN' as const,
	briefBudget: 500,
	briefDeadline: '2099-11-30T12:00:00.000Z',
	briefViews: 41,
	briefComments: 3,
	createdAt: '2026-10-10T10:00:00.000Z',
	updatedAt: '2026-10-10T10:00:00.000Z',
	closedAt: null as string | null,
	...patch,
});

const counter = (total: number) => ({ __typename: 'Briefs', metaCounter: [{ __typename: 'TotalCounter', total }] });

const listMock = (rows: ReturnType<typeof row>[], open: number, closed: number): MockedResponse => ({
	request: { query: MyBriefsQuery, variables: myBriefsVariables({ tab: 'all', page: 1 }) },
	result: {
		data: {
			list: { __typename: 'Briefs', list: rows, metaCounter: [{ __typename: 'TotalCounter', total: rows.length }] },
			open: counter(open),
			closed: counter(closed),
		},
	},
});

const statusMock = (briefId: string, briefStatus: string, extra: Record<string, unknown> = {}): MockedResponse => ({
	request: { query: UpdateBriefStatusMutation, variables: { input: { _id: briefId, briefStatus, ...extra } } },
	result: {
		data: {
			updateBrief: {
				__typename: 'Brief',
				_id: briefId,
				briefStatus,
				briefDeadline: null,
				closedAt: null,
				updatedAt: '2026-10-20T10:00:00.000Z',
			},
		},
	},
});

const renderMine = (mocks: MockedResponse[]) => renderWithProviders(<MyBriefs />, { auth: { status: 'member', me: user }, mocks });

describe('MyBriefs (S5)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/dashboard/briefs');
	});

	it('lists the briefs with tab counts and D-30 actions', async () => {
		const open = row(0);
		const closed = row(1, { briefStatus: 'CLOSED', closedAt: '2026-10-15T10:00:00.000Z' });
		renderMine([listMock([open, closed], 1, 1)]);

		const list = await screen.findByRole('list', { name: 'Your briefs' });
		const [first, second] = within(list).getAllByRole('listitem');
		expect(within(first).getByRole('link', { name: 'Brief 0' })).toHaveAttribute('href', `/briefs/${open._id}`);
		expect(within(first).getByRole('button', { name: 'Close Brief 0' })).toBeInTheDocument();
		expect(within(first).queryByRole('button', { name: 'Reopen Brief 0' })).not.toBeInTheDocument();
		expect(within(second).getByRole('button', { name: 'Reopen Brief 1' })).toBeInTheDocument();
		expect(within(second).getByRole('link', { name: 'Edit Brief 1' })).toHaveAttribute('href', `/dashboard/briefs/${closed._id}/edit`);

		const tabs = screen.getByRole('navigation', { name: 'Brief status' });
		expect(within(tabs).getByRole('link', { name: /All · 2/ })).toHaveAttribute('aria-current', 'page');
	});

	it('closes without a dialog', async () => {
		const ui = userEvent.setup();
		const open = row(0);
		renderMine([listMock([open], 1, 0), statusMock(open._id, 'CLOSED'), listMock([{ ...open, briefStatus: 'CLOSED' } as never], 0, 1)]);

		await ui.click(await screen.findByRole('button', { name: 'Close Brief 0' }));
		expect(await screen.findByText('“Brief 0” is closed.')).toBeInTheDocument();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('asks for a new deadline before reopening a brief whose deadline has passed (D-31)', async () => {
		const ui = userEvent.setup();
		const expired = row(2, { briefStatus: 'CLOSED', briefDeadline: '2020-01-10T12:00:00.000Z', closedAt: '2020-01-05T10:00:00.000Z' });
		renderMine([listMock([expired], 0, 1), statusMock(expired._id, 'OPEN', { briefDeadline: null }), listMock([expired], 0, 1)]);

		expect(await screen.findByText('The deadline has passed. Set a new date to reopen.')).toBeInTheDocument();
		await ui.click(screen.getByRole('button', { name: 'Reopen Brief 2' }));
		const dialog = await screen.findByRole('dialog', { name: 'Reopen “Brief 2”' });
		await ui.click(within(dialog).getByRole('button', { name: 'Reopen without a deadline' }));

		expect(await screen.findByText('“Brief 2” is open again.')).toBeInTheDocument();
	});

	it('deletes only after confirming', async () => {
		const ui = userEvent.setup();
		const open = row(0);
		renderMine([listMock([open], 1, 0), statusMock(open._id, 'DELETE'), listMock([], 0, 0)]);

		await ui.click(await screen.findByRole('button', { name: 'Delete Brief 0' }));
		const dialog = await screen.findByRole('dialog');
		await ui.click(within(dialog).getByRole('button', { name: 'Delete brief' }));

		expect(await screen.findByText('“Brief 0” was deleted.')).toBeInTheDocument();
		expect(await screen.findByRole('heading', { name: 'Post your first brief' })).toBeInTheDocument();
	});
});
