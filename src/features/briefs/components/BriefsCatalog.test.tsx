import type { MockedResponse } from '@apollo/client/testing';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { SEARCH_DEBOUNCE_MS } from '@/shared/ui/catalog';
import { renderWithProviders } from '@/test/renderWithProviders';
import { BriefFacetsQuery, BriefsListQuery, OpenBriefStatsQuery } from '../graphql/briefs';
import { DEFAULT_BRIEF_FILTERS, briefsListVariables, parseBriefFilters, type BriefFilters } from '../lib/listQuery';
import { makeBrief } from '../test/fixtures';
import { BriefsCatalog } from './BriefsCatalog';

const DAY = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString();

const briefsOf = (count: number, start = 0) => Array.from({ length: count }, (_, index) => makeBrief({}, start + index));

const listMock = (
	filters: BriefFilters,
	briefs: ReturnType<typeof makeBrief>[],
	total = briefs.length,
	extra: Partial<MockedResponse> = {},
): MockedResponse => ({
	request: { query: BriefsListQuery, variables: briefsListVariables(filters) },
	result: {
		data: {
			getBriefs: { __typename: 'Briefs', list: briefs, metaCounter: total ? [{ __typename: 'TotalCounter', total }] : [] },
		},
	},
	...extra,
});

type Counts = { categories?: Record<string, number>; budgetTypes?: Record<string, number>; statuses?: Record<string, number> };
const facetList = (typename: string, values: string[], counts: Record<string, number> = {}) =>
	values.map((value) => ({ __typename: typename, value, count: counts[value] ?? 0 }));
const facets = ({ categories, budgetTypes, statuses }: Counts) => ({
	__typename: 'BriefFacets',
	categories: facetList(
		'CategoryFacet',
		['AUTOMATION', 'CONTENT', 'CUSTOMER_SUPPORT', 'DATA_ANALYSIS', 'EDUCATION', 'MARKETING', 'OTHER', 'SALES'],
		categories,
	),
	budgetTypes: facetList('BudgetTypeFacet', ['FIXED', 'OPEN_TO_OFFERS'], budgetTypes),
	statuses: facetList('BriefStatusFacet', ['OPEN', 'CLOSED'], statuses),
});

/** The filtered counts: past deadlines hidden (the default), unless the variables keep them. */
const facetsMock = (shown: Counts, withPast: Counts = shown): MockedResponse => ({
	request: { query: BriefFacetsQuery },
	variableMatcher: () => true,
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: (variables) => ({ data: { getBriefFacets: facets(variables.input?.hidePastDeadline ? shown : withPast) } }),
});

const statsMock = (openNow: number, budgetTotal: number): MockedResponse => ({
	request: { query: OpenBriefStatsQuery },
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: { data: { getOpenBriefStats: { __typename: 'OpenBriefStats', openNow, budgetTotal } } },
});

const defaultCounts: Counts = {
	categories: { SALES: 3, CONTENT: 1 },
	budgetTypes: { FIXED: 3, OPEN_TO_OFFERS: 1 },
	statuses: { OPEN: 4, CLOSED: 2 },
};

const at = (url: string) => {
	mockRouter.setCurrentUrl(url);
	return parseBriefFilters(mockRouter.query);
};

const creator = { _id: '6ac7992dd87bde19b9216c99', memberType: 'CREATOR', memberStatus: 'ACTIVE', memberNick: 'nova_labs' } as Me;

const renderCatalog = (mocks: MockedResponse[], options: { auth?: Record<string, unknown>; facets?: MockedResponse; stats?: MockedResponse } = {}) =>
	renderWithProviders(<BriefsCatalog />, {
		mocks: [...mocks, options.facets ?? facetsMock(defaultCounts), options.stats ?? statsMock(3, 2450.5)],
		auth: (options.auth ?? { status: 'guest' }) as never,
	});

const feed = () => screen.findByRole('list', { name: 'Briefs' });
const summary = () => screen.getAllByRole('status').find((element) => element.getAttribute('aria-live') === 'polite');

describe('BriefsCatalog (agentshub-briefs design, D-44)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/briefs');
	});

	it('shows the live badge from getOpenBriefStats, without the budget part when it is 0, and not at all with no open brief', async () => {
		const { unmount } = renderCatalog([listMock(at('/briefs'), briefsOf(1))]);
		expect(await screen.findByText('3 briefs open now, $2,450.50 in posted budgets')).toBeInTheDocument();
		unmount();

		const second = renderCatalog([listMock(at('/briefs'), briefsOf(1))], { stats: statsMock(1, 0) });
		expect(await screen.findByText('1 brief open now')).toBeInTheDocument();
		second.unmount();

		renderCatalog([listMock(at('/briefs'), [])], { stats: statsMock(0, 0) });
		await screen.findByRole('heading', { name: 'No open briefs yet' });
		expect(screen.queryByText(/open now/)).not.toBeInTheDocument();
	});

	it('shows skeleton rows while loading, then the first 9 of a page and "Show 11 more" without a new request', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs'), briefsOf(20), 26, { delay: 30 })]);

		expect(screen.getByRole('status', { name: 'Loading briefs…' })).toHaveAttribute('aria-busy', 'true');
		expect(within(await feed()).getAllByRole('article')).toHaveLength(9);
		expect(summary()).toHaveTextContent('26 briefs open');
		expect(screen.getByText('Showing 9 of 26')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Show 11 more' }));
		expect(within(await feed()).getAllByRole('article')).toHaveLength(20);
		const pagination = screen.getByRole('navigation', { name: 'Pagination' });
		expect(within(pagination).getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '/briefs?page=2');
		// The page is fully shown: the "Need an agent built?" row closes the feed.
		expect(screen.getByRole('heading', { name: 'Need an agent built?' })).toBeInTheDocument();
	});

	it('renders one brief as the design: pills, title link, description, facts, author and budget', async () => {
		const briefs = [
			makeBrief({ briefDeadline: inDays(84), briefComments: 2, briefViews: 1 }, 0),
			makeBrief({ briefBudget: 250.5, briefDeadline: inDays(3), briefComments: 1, briefViews: 3 }, 1),
			makeBrief({ briefBudget: null, briefDeadline: null, briefComments: 0, briefViews: 0 }, 2),
		];
		renderCatalog([listMock(at('/briefs'), briefs)]);

		const [first, second, third] = within(await feed()).getAllByRole('article');
		expect(within(first).getByRole('heading', { level: 2 })).toHaveTextContent(briefs[0].briefTitle);
		expect(within(first).getByRole('link', { name: briefs[0].briefTitle })).toHaveAttribute('href', `/briefs/${briefs[0]._id}`);
		expect(within(first).getByText('Open')).toBeInTheDocument();
		expect(within(first).getByText('Sales')).toBeInTheDocument();
		expect(within(first).getByText(briefs[0].briefContent)).toBeInTheDocument();
		expect(within(first).getByText('Fixed budget')).toBeInTheDocument();
		expect(within(first).getByText(/, 84 days left$/)).toBeInTheDocument();
		expect(within(first).getByText('2 questions')).toBeInTheDocument();
		expect(within(first).getByText('1 view')).toBeInTheDocument();
		expect(within(first).getByText('@dilnoza_bakes')).toBeInTheDocument();
		expect(within(first).getByText('Contact after sign-in')).toBeInTheDocument();
		expect(within(first).getByText('$500')).toBeInTheDocument();
		// "View brief" repeats the title link for the mouse only: one tab stop per brief.
		expect(within(first).getAllByRole('link')).toHaveLength(1);

		expect(within(second).getByText(/, 3 days left$/)).toBeInTheDocument();
		expect(within(second).getByText('$250.50')).toBeInTheDocument();
		expect(within(second).getByText('1 question')).toBeInTheDocument();

		expect(within(third).getAllByText('Open to offers')).toHaveLength(2);
		expect(within(third).getByText('No deadline')).toBeInTheDocument();
		expect(within(third).getByText('No questions yet')).toBeInTheDocument();
	});

	it('marks a past-deadline brief when the switch is off', async () => {
		renderCatalog([listMock(at('/briefs?past=show'), [makeBrief({ briefDeadline: inDays(-10) })])]);

		const [row] = within(await feed()).getAllByRole('article');
		expect(within(row).getByText('Past deadline')).toBeInTheDocument();
		expect(within(row).getByText(/^Deadline passed /)).toBeInTheDocument();
		expect(screen.getByRole('switch', { name: 'Hide past deadline' })).toHaveAttribute('aria-checked', 'false');
	});

	it('hides "Contact after sign-in" from members', async () => {
		renderCatalog([listMock(at('/briefs'), briefsOf(1))], { auth: { status: 'member', me: { ...creator, memberType: 'USER' } } });

		await feed();
		expect(screen.queryByText('Contact after sign-in')).not.toBeInTheDocument();
	});

	it('shows the live counts; an option with 0 results is disabled', async () => {
		renderCatalog([listMock(at('/briefs'), briefsOf(2))]);
		await feed();

		const categories = screen.getByRole('group', { name: 'Categories' });
		await waitFor(() => expect(within(categories).getByRole('button', { name: 'All 4' })).toHaveAttribute('aria-pressed', 'true'));
		expect(within(categories).getByRole('button', { name: 'Sales 3' })).toBeEnabled();
		expect(within(categories).getByRole('button', { name: 'Marketing 0' })).toBeDisabled();
		const status = screen.getByRole('group', { name: 'Brief status' });
		expect(within(status).getByRole('button', { name: 'Open 4' })).toHaveAttribute('aria-pressed', 'true');
		expect(within(status).getByRole('button', { name: 'Closed 2' })).toHaveAttribute('aria-pressed', 'false');
		const budget = screen.getByRole('group', { name: 'Budget' });
		expect(within(budget).getByRole('button', { name: 'Open to offers 1' })).toBeEnabled();
	});

	it('writes categories, budget types and the tab to the URL and resets the page', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs?page=2'), briefsOf(3), 23)]);
		await feed();

		await user.click(await screen.findByRole('button', { name: 'Sales 3' }));
		expect(mockRouter.asPath).toBe('/briefs?category=sales');
		await user.click(screen.getByRole('button', { name: 'Fixed budget 3' }));
		expect(mockRouter.asPath).toBe('/briefs?category=sales&budget=fixed');
		await user.click(screen.getByRole('button', { name: 'Closed 2' }));
		expect(mockRouter.asPath).toBe('/briefs?status=closed&category=sales&budget=fixed');
		// Only the open tab has deadlines to hide.
		expect(screen.getByRole('switch', { name: 'Hide past deadline' })).toBeDisabled();
	});

	it('says how many briefs the switch hides and shows them on click', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs'), briefsOf(2))], {
			facets: facetsMock({ statuses: { OPEN: 2 } }, { statuses: { OPEN: 5 } }),
		});
		await feed();

		await user.click(await screen.findByRole('button', { name: '3 briefs are past deadline. Show them' }));
		expect(mockRouter.asPath).toBe('/briefs?past=show');
	});

	it('changes the sort through the URL; the design menu, newest first', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs'), briefsOf(2))]);
		await feed();

		await user.click(screen.getByRole('combobox', { name: /^Sort/ }));
		const menu = await screen.findByRole('listbox');
		expect(within(menu).getAllByRole('option').map((option) => option.textContent)).toEqual([
			'Newest',
			'Highest budget',
			'Deadline soonest',
			'Most discussed',
		]);
		await user.click(within(menu).getByRole('option', { name: 'Most discussed' }));
		expect(mockRouter.asPath).toBe('/briefs?sort=discussed');
	});

	it('debounces the search box into the URL, and a suggestion applies a search or the budget filter', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs'), briefsOf(2))]);
		await feed();

		await user.type(screen.getByRole('searchbox', { name: 'Search briefs' }), 'crm');
		expect(mockRouter.asPath).toBe('/briefs');
		await waitFor(() => expect(mockRouter.asPath).toBe('/briefs?q=crm'), { timeout: SEARCH_DEBOUNCE_MS * 4 });

		await user.click(screen.getByRole('button', { name: 'Open to offers' }));
		expect(mockRouter.asPath).toBe('/briefs?budget=offers&q=crm');
	});

	it('removes one filter from its chip', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs?category=sales&budget=offers'), briefsOf(1))]);
		await feed();

		await user.click(screen.getByRole('button', { name: 'Remove filter: Open to offers' }));
		expect(mockRouter.asPath).toBe('/briefs?category=sales');
	});

	it('shows the no-match state with a brief for the search text; "Clear all filters" keeps the tab and sort', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/briefs?category=sales&q=zzz&sort=budget'), [])]);

		expect(await screen.findByRole('heading', { name: 'No brief matches this' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Post a brief for “zzz”' })).toHaveAttribute('href', '/dashboard/briefs/new?title=zzz');
		await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
		expect(mockRouter.asPath).toBe('/briefs?sort=budget');
	});

	it('shows "No closed briefs yet" on an empty closed tab, without a brief button', async () => {
		renderCatalog([listMock(at('/briefs?status=closed'), [])]);

		expect(await screen.findByRole('heading', { name: 'No closed briefs yet' })).toBeInTheDocument();
		// Only the hero's "+ Post a brief" pill: the empty state itself offers nothing on this tab.
		expect(screen.getAllByRole('link', { name: /Post a brief/ })).toHaveLength(1);
	});

	it('offers the first page when the page number is past the results', async () => {
		renderCatalog([listMock(at('/briefs?page=9'), [], 5)]);
		expect(await screen.findByRole('link', { name: 'Go to page 1' })).toHaveAttribute('href', '/briefs');
	});

	it('shows the error state with a working retry', async () => {
		const user = userEvent.setup();
		const filters = at('/briefs');
		renderCatalog([
			{ request: { query: BriefsListQuery, variables: briefsListVariables(filters) }, error: new TypeError('Failed to fetch') },
			listMock(filters, briefsOf(1)),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("Couldn't load the briefs");
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await feed()).toBeInTheDocument();
	});

	it('shows skeletons during a non-shallow navigation (pagination)', async () => {
		renderCatalog([listMock(at('/briefs'), briefsOf(2))]);
		await feed();

		act(() => {
			mockRouter.events.emit('routeChangeStart', '/briefs?page=2', { shallow: false });
		});
		expect(screen.getByRole('status', { name: 'Loading briefs…' })).toBeInTheDocument();
	});

	it('shows the "Post a brief" calls to guests and users, not to creators (ER rule 2)', async () => {
		const first = renderCatalog([listMock(at('/briefs'), briefsOf(1))]);
		await feed();
		expect(screen.getAllByRole('link', { name: /Post a brief/ }).map((link) => link.getAttribute('href'))).toEqual([
			'/dashboard/briefs/new',
			'/dashboard/briefs/new',
		]);
		first.unmount();

		renderCatalog([listMock(at('/briefs'), briefsOf(1))], { auth: { status: 'member', me: creator } });
		await feed();
		expect(screen.queryByRole('link', { name: /Post a brief/ })).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Need an agent built?' })).not.toBeInTheDocument();
	});
});

it('DEFAULT_BRIEF_FILTERS is what /briefs means', () => {
	expect(parseBriefFilters({})).toEqual(DEFAULT_BRIEF_FILTERS);
});
