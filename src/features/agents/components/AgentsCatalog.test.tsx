import type { MockedResponse } from '@apollo/client/testing';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentsCatalogQuery, ProductFacetsQuery } from '../graphql/agents';
import { DEFAULT_FILTERS, agentsListVariables, parseAgentFilters, type AgentFilters } from '../lib/listQuery';
import { makeCatalogAgent, makeFacets } from '../test/fixtures';
import { AgentsCatalog } from './AgentsCatalog';
import { SEARCH_DEBOUNCE_MS } from './catalog/SearchHero';

const agentsOf = (count: number, start = 0) => Array.from({ length: count }, (_, index) => makeCatalogAgent({}, start + index));

const listMock = (
	filters: AgentFilters,
	agents: ReturnType<typeof makeCatalogAgent>[],
	total = agents.length,
	extra: Partial<MockedResponse> = {},
): MockedResponse => ({
	request: { query: AgentsCatalogQuery, variables: agentsListVariables(filters) },
	result: {
		data: {
			getProducts: {
				__typename: 'Products',
				list: agents,
				// The API sends [] when nothing matches (FRONTEND_MIGRATION §1.5).
				metaCounter: total ? [{ __typename: 'TotalCounter', total }] : [],
			},
		},
	},
	...extra,
});

/** The same counts for every search (the filtered and the "everything" query). */
const facetsMock = (facets = makeFacets({ CUSTOMER_SUPPORT: 2, CONTENT: 1 }, { FREE: 1, SUBSCRIPTION: 2 })): MockedResponse => ({
	request: { query: ProductFacetsQuery },
	variableMatcher: () => true,
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: { data: { getProductFacets: facets } },
});

const at = (url: string) => {
	mockRouter.setCurrentUrl(url);
	return parseAgentFilters(mockRouter.query);
};

const renderCatalog = (mocks: MockedResponse[], auth: Parameters<typeof renderWithProviders>[1] = {}) =>
	renderWithProviders(<AgentsCatalog />, { mocks: [...mocks, facetsMock()], auth: { status: 'guest' }, ...auth });

/** The polite live region above the results. */
const summary = () => screen.getAllByRole('status').find((element) => element.getAttribute('aria-live') === 'polite');

const results = () => screen.findByRole('list', { name: 'Agents' });

describe('AgentsCatalog', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/agents');
	});

	it('shows skeletons while loading, then the first 9 agents with the total', async () => {
		renderCatalog([listMock(at('/agents'), agentsOf(14), 14, { delay: 30 })]);

		expect(screen.getByRole('status', { name: 'Loading agents…' })).toHaveAttribute('aria-busy', 'true');

		const list = await results();
		expect(within(list).getAllByRole('article')).toHaveLength(9);
		expect(screen.getByText('Showing 9 of 14')).toBeInTheDocument();
		expect(summary()).toHaveTextContent('14 agents');
		// The brief tile waits until the whole page is shown.
		expect(screen.queryByRole('link', { name: 'Post a brief' })).not.toBeInTheDocument();
	});

	it('"Show more" opens the rest of the page without a new request, then the brief tile', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents'), agentsOf(14))]);
		await results();

		await user.click(screen.getByRole('button', { name: 'Show 5 more' }));

		expect(within(await results()).getAllByRole('article')).toHaveLength(14);
		expect(screen.getByText('Showing 14 of 14')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Post a brief' })).toHaveAttribute('href', '/dashboard/briefs/new');
		// One page only: no pagination.
		expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
	});

	it('shows the pagination after "Show more", with the filters and the list layout in the links', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?category=sales&sort=rank&view=list');
		renderCatalog([listMock(filters, agentsOf(20), 45)]);
		await results();
		expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Show 11 more' }));

		const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
		expect(within(pagination).getByRole('link', { name: 'Page 2' })).toHaveAttribute(
			'href',
			'/agents?category=sales&sort=rank&page=2&view=list',
		);
		expect(within(pagination).getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByText('Showing 20 of 45')).toBeInTheDocument();
	});

	it('counts the shown agents from the start of the page on page 2', async () => {
		renderCatalog([listMock(at('/agents?page=2'), agentsOf(20, 20), 45)]);
		await results();
		expect(screen.getByText('Showing 29 of 45')).toBeInTheDocument();
	});

	it('shows the live counts and disables an option with no results (D-43)', async () => {
		renderCatalog([listMock(at('/agents'), agentsOf(3))]);
		await results();

		const categories = screen.getByRole('group', { name: 'Category' });
		await waitFor(() => expect(within(categories).getByRole('button', { name: 'Customer support 2' })).toBeEnabled());
		expect(within(categories).getByRole('button', { name: 'All 3' })).toHaveAttribute('aria-pressed', 'true');
		expect(within(categories).getByRole('button', { name: 'Sales 0' })).toBeDisabled();

		const pricing = screen.getByRole('group', { name: 'Pricing' });
		expect(within(pricing).getByRole('button', { name: 'Free 1' })).toBeEnabled();
		expect(within(pricing).getByRole('button', { name: 'Custom 0' })).toBeDisabled();
		// The hero counts every agent.
		expect(screen.getByText(/descriptions from 3 agents\./)).toBeInTheDocument();
	});

	it('writes a category to the URL and resets the page', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?page=2');
		renderCatalog([listMock(filters, agentsOf(3), 23), listMock({ ...DEFAULT_FILTERS, categories: ['CONTENT'] }, agentsOf(1))]);
		await results();

		await user.click(screen.getByRole('button', { name: 'Content 1' }));

		expect(mockRouter.asPath).toBe('/agents?category=content');
		expect(await screen.findByRole('button', { name: 'Remove filter: Content' })).toBeInTheDocument();
	});

	it('"All" drops the category filter', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents?category=content&pricing=free'), agentsOf(1))]);
		await results();

		await user.click(screen.getByRole('button', { name: /^All/ }));
		expect(mockRouter.asPath).toBe('/agents?pricing=free');
	});

	it('shows the empty state with a brief for the search text, and "Clear all" keeps the sort', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?q=zzz&sort=rank');
		renderCatalog([listMock(filters, []), listMock({ ...DEFAULT_FILTERS, sort: 'rank' }, agentsOf(2))]);

		expect(await screen.findByRole('heading', { name: 'No agent does this yet' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Post a brief for “zzz”' })).toHaveAttribute('href', '/dashboard/briefs/new?title=zzz');

		await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
		expect(mockRouter.asPath).toBe('/agents?sort=rank');
		expect(await results()).toBeInTheDocument();
	});

	it('offers the first page when the page number is past the results', async () => {
		renderCatalog([listMock(at('/agents?page=9'), [], 5)]);
		expect(await screen.findByRole('link', { name: 'Go to the first page' })).toHaveAttribute('href', '/agents');
	});

	it('shows the error state with a working retry', async () => {
		const user = userEvent.setup();
		const filters = at('/agents');
		renderCatalog([
			{ request: { query: AgentsCatalogQuery, variables: agentsListVariables(filters) }, error: new TypeError('Failed to fetch') },
			listMock(filters, agentsOf(2)),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("We couldn't load the agents");
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await results()).toBeInTheDocument();
	});

	it('removes one filter from its chip', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents?category=sales&tag=crm'), agentsOf(2))]);
		await results();

		await user.click(screen.getByRole('button', { name: 'Remove filter: #crm' }));
		expect(mockRouter.asPath).toBe('/agents?category=sales');
	});

	it('changes the sort through the URL; the default (most liked) stays out of it', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents?sort=newest'), agentsOf(2))]);
		await results();

		const sort = screen.getByRole('combobox', { name: /^Sort/ });
		expect(sort).toHaveTextContent('Newest');
		await user.click(sort);
		const menu = await screen.findByRole('listbox');
		expect(within(menu).getAllByRole('option').map((option) => option.textContent)).toEqual([
			'Most liked',
			'Newest',
			'Most viewed',
			'Top ranked',
			'Price: low to high',
			'Price: high to low',
		]);
		expect(within(menu).getByRole('option', { name: 'Newest' })).toHaveAttribute('aria-selected', 'true');
		await user.click(within(menu).getByRole('option', { name: 'Most liked' }));
		expect(mockRouter.asPath).toBe('/agents');
	});

	it('switches to the list layout through the URL and keeps the filters', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents?pricing=free'), agentsOf(2))]);
		await results();

		await user.click(screen.getByRole('button', { name: 'List view' }));
		expect(mockRouter.asPath).toBe('/agents?pricing=free&view=list');
		expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');

		await user.click(screen.getByRole('button', { name: 'Grid view' }));
		expect(mockRouter.asPath).toBe('/agents?pricing=free');
	});

	it('debounces the search box into the URL', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents'), agentsOf(2))]);
		await results();

		await user.type(screen.getByRole('searchbox', { name: 'Search agents by title' }), 'bot');
		expect(mockRouter.asPath).toBe('/agents');
		await waitFor(() => expect(mockRouter.asPath).toBe('/agents?q=bot'), { timeout: SEARCH_DEBOUNCE_MS * 4 });
	});

	it('shows skeletons during a non-shallow navigation (pagination)', async () => {
		renderCatalog([listMock(at('/agents'), agentsOf(20), 30)]);
		await results();

		act(() => {
			mockRouter.events.emit('routeChangeStart', '/agents?page=2', { shallow: false });
		});
		expect(screen.getByRole('status', { name: 'Loading agents…' })).toBeInTheDocument();
	});
});
