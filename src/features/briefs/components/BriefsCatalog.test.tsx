import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BriefsListQuery } from '../graphql/briefs';
import { DEFAULT_BRIEF_FILTERS, briefsListVariables, type BriefFilters } from '../lib/listQuery';
import { makeBrief } from '../test/fixtures';
import { BriefsCatalog } from './BriefsCatalog';

const listMock = (filters: BriefFilters, briefs: ReturnType<typeof makeBrief>[], total = briefs.length): MockedResponse => ({
	request: { query: BriefsListQuery, variables: briefsListVariables(filters) },
	result: {
		data: { getBriefs: { __typename: 'Briefs', list: briefs, metaCounter: [{ __typename: 'TotalCounter', total }] } },
	},
});

const creator = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

describe('BriefsCatalog (S4)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/briefs');
	});

	it('lists open briefs per Briefs.html', async () => {
		const briefs = [makeBrief({}, 0), makeBrief({ briefBudget: null, briefDeadline: null, briefComments: 1 }, 1)];
		renderWithProviders(<BriefsCatalog />, { mocks: [listMock(DEFAULT_BRIEF_FILTERS, briefs)], auth: { status: 'guest' } });

		const results = await screen.findByRole('list', { name: 'Briefs' });
		const rows = within(results).getAllByRole('listitem');
		expect(rows).toHaveLength(2);

		expect(within(rows[0]).getByRole('link', { name: 'WhatsApp orders for a bakery 0' })).toHaveAttribute(
			'href',
			`/briefs/${briefs[0]._id}`,
		);
		expect(within(rows[0]).getByText('$500')).toBeInTheDocument();
		expect(within(rows[0]).getByText(/3 comments · 41 views/)).toBeInTheDocument();
		expect(within(rows[1]).getByText('Open to offers')).toBeInTheDocument();
		expect(within(rows[1]).getByText('No deadline')).toBeInTheDocument();
		expect(within(rows[1]).getByText(/1 comment ·/)).toBeInTheDocument();

		expect(screen.getByText('2 open briefs')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Closed' })).toHaveAttribute('href', '/briefs?status=closed');
	});

	it('picks a category through the URL and resets the page', async () => {
		const user = userEvent.setup();
		mockRouter.setCurrentUrl('/briefs?page=2');
		const page2 = { ...DEFAULT_BRIEF_FILTERS, page: 2 };
		const sales = { ...DEFAULT_BRIEF_FILTERS, category: 'SALES' as const };
		renderWithProviders(<BriefsCatalog />, {
			mocks: [listMock(page2, [makeBrief()], 11), listMock(sales, [makeBrief()])],
			auth: { status: 'guest' },
		});

		await user.click(await screen.findByRole('button', { name: 'Sales' }));
		await waitFor(() => expect(mockRouter.asPath).toBe('/briefs?category=sales'));
		expect(await screen.findByRole('button', { name: 'Sales' })).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('button', { name: 'All categories' })).toHaveAttribute('aria-pressed', 'false');
	});

	it('explains an empty search and clears it', async () => {
		const user = userEvent.setup();
		mockRouter.setCurrentUrl('/briefs?q=zzz');
		const search = { ...DEFAULT_BRIEF_FILTERS, text: 'zzz' };
		renderWithProviders(<BriefsCatalog />, {
			mocks: [listMock(search, []), listMock(DEFAULT_BRIEF_FILTERS, [makeBrief()])],
			auth: { status: 'guest' },
		});

		expect(await screen.findByRole('heading', { name: 'No briefs match' })).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Clear filters' }));
		await waitFor(() => expect(mockRouter.asPath).toBe('/briefs'));
	});

	it('notes that briefs without a budget come last when sorting by budget', async () => {
		mockRouter.setCurrentUrl('/briefs?sort=budget-desc');
		renderWithProviders(<BriefsCatalog />, {
			mocks: [listMock({ ...DEFAULT_BRIEF_FILTERS, sort: 'budget-desc' }, [makeBrief()])],
			auth: { status: 'guest' },
		});

		expect(await screen.findByText('When sorting by budget or deadline, briefs without one are listed last.')).toBeInTheDocument();
	});

	it('shows "Post a brief" to guests and users, not to creators', async () => {
		const { unmount } = renderWithProviders(<BriefsCatalog />, {
			mocks: [listMock(DEFAULT_BRIEF_FILTERS, [makeBrief()])],
			auth: { status: 'guest' },
		});
		expect(await screen.findByRole('link', { name: 'Post a brief' })).toHaveAttribute('href', '/dashboard/briefs/new');
		unmount();

		renderWithProviders(<BriefsCatalog />, {
			mocks: [listMock(DEFAULT_BRIEF_FILTERS, [makeBrief()])],
			auth: { status: 'member', me: creator },
		});
		expect(await screen.findByRole('list', { name: 'Briefs' })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Post a brief' })).not.toBeInTheDocument();
	});
});
