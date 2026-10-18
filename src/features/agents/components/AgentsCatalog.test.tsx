import type { MockedResponse } from '@apollo/client/testing';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AgentsListQuery } from '../graphql/agents';
import { DEFAULT_FILTERS, agentsListVariables, parseAgentFilters, type AgentFilters } from '../lib/listQuery';
import { makeAgent } from '../test/fixtures';
import { AgentsCatalog } from './AgentsCatalog';
import { SEARCH_DEBOUNCE_MS } from './AgentsToolbar';

const listMock = (
	filters: AgentFilters,
	agents: ReturnType<typeof makeAgent>[],
	total = agents.length,
	extra: Partial<MockedResponse> = {},
): MockedResponse => ({
	request: { query: AgentsListQuery, variables: agentsListVariables(filters) },
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

const at = (url: string) => {
	mockRouter.setCurrentUrl(url);
	return parseAgentFilters(mockRouter.query);
};

const twoAgents = [makeAgent({}, 1), makeAgent({ productTitle: 'LeadCatcher', productPricing: 'FREE', productPrice: null }, 2)];

const renderCatalog = (mocks: MockedResponse[], auth: Parameters<typeof renderWithProviders>[1] = {}) =>
	renderWithProviders(<AgentsCatalog />, { mocks, auth: { status: 'guest' }, ...auth });

describe('AgentsCatalog', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/agents');
	});

	it('shows card skeletons while loading, then the agents with their count', async () => {
		const filters = at('/agents');
		renderCatalog([listMock(filters, twoAgents, 26, { delay: 30 })]);

		expect(screen.getByRole('status', { name: 'Loading agents…' })).toHaveAttribute('aria-busy', 'true');

		const list = await screen.findByRole('list', { name: 'Agents' });
		expect(within(list).getAllByRole('article')).toHaveLength(2);
		expect(screen.getByText('26 agents')).toBeInTheDocument();
		expect(screen.queryByRole('status', { name: 'Loading agents…' })).not.toBeInTheDocument();
	});

	it('links pagination pages with the current filters', async () => {
		const filters = at('/agents?category=sales&sort=rank');
		renderCatalog([listMock(filters, twoAgents, 30)]);

		const pagination = await screen.findByRole('navigation', { name: 'Pagination' });
		expect(within(pagination).getByRole('link', { name: 'Page 2' })).toHaveAttribute(
			'href',
			'/agents?category=sales&sort=rank&page=2',
		);
		expect(within(pagination).getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('status')).toHaveTextContent('30 agents match your filters');
	});

	it('shows the empty state with "Clear filters", which keeps the sort', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?category=sales&sort=rank&page=2');
		renderCatalog([listMock(filters, []), listMock({ ...DEFAULT_FILTERS, sort: 'rank' }, twoAgents)]);

		expect(await screen.findByRole('heading', { name: 'No agents match your filters' })).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Clear filters' }));

		expect(mockRouter.asPath).toBe('/agents?sort=rank');
		expect(await screen.findByRole('list', { name: 'Agents' })).toBeInTheDocument();
	});

	it('shows "No agents yet" without filters', async () => {
		renderCatalog([listMock(at('/agents'), [])]);
		expect(await screen.findByRole('heading', { name: 'No agents yet' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
	});

	it('offers the first page when the page number is past the results', async () => {
		renderCatalog([listMock(at('/agents?page=9'), [], 5)]);
		expect(await screen.findByRole('link', { name: 'Go to the first page' })).toHaveAttribute('href', '/agents');
	});

	it('shows the error state with a working retry', async () => {
		const user = userEvent.setup();
		const filters = at('/agents');
		renderCatalog([
			{ request: { query: AgentsListQuery, variables: agentsListVariables(filters) }, error: new TypeError('Failed to fetch') },
			listMock(filters, twoAgents),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("We couldn't load the agents");
		expect(alert).toHaveTextContent("Can't reach the server.");

		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await screen.findByRole('list', { name: 'Agents' })).toBeInTheDocument();
	});

	it('writes a filter change to the URL and resets the page', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?page=3');
		renderCatalog([listMock(filters, twoAgents, 40), listMock({ ...DEFAULT_FILTERS, categories: ['SALES'] }, twoAgents)]);
		await screen.findByRole('list', { name: 'Agents' });

		await user.click(screen.getByRole('checkbox', { name: 'Sales' }));

		expect(mockRouter.asPath).toBe('/agents?category=sales');
		expect(await screen.findByRole('button', { name: 'Remove filter: Sales' })).toBeInTheDocument();
	});

	it('opens the filters in a drawer below md (results stay first) and applies changes at once', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?tag=crm');
		renderCatalog([listMock(filters, twoAgents), listMock({ ...filters, categories: ['SALES'] }, twoAgents)]);
		await screen.findByRole('list', { name: 'Agents' });

		// CSS shows this button below md only; jsdom's 1024px window is md, so query hidden elements too.
		await user.click(screen.getByRole('button', { name: 'Filters (1)', hidden: true }));
		const drawer = await screen.findByRole('dialog', { name: 'Filters' });

		await user.click(within(drawer).getByRole('checkbox', { name: 'Sales' }));
		expect(mockRouter.asPath).toBe('/agents?category=sales&tag=crm');

		await user.click(within(drawer).getByRole('button', { name: 'Show results' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	});

	it('removes one filter from its chip', async () => {
		const user = userEvent.setup();
		const filters = at('/agents?category=sales&tag=crm');
		renderCatalog([listMock(filters, twoAgents), listMock({ ...DEFAULT_FILTERS, categories: ['SALES'] }, twoAgents)]);
		await screen.findByRole('list', { name: 'Agents' });

		await user.click(screen.getByRole('button', { name: 'Remove filter: #crm' }));
		expect(mockRouter.asPath).toBe('/agents?category=sales');
	});

	it('changes the sort through the URL', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents'), twoAgents), listMock({ ...DEFAULT_FILTERS, sort: 'price-asc' }, twoAgents)]);
		await screen.findByRole('list', { name: 'Agents' });

		await user.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'Price: low to high');
		expect(mockRouter.asPath).toBe('/agents?sort=price-asc');
	});

	it('debounces the search box into the URL', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/agents'), twoAgents), listMock({ ...DEFAULT_FILTERS, text: 'bot' }, twoAgents)]);
		await screen.findByRole('list', { name: 'Agents' });

		await user.type(screen.getByRole('searchbox', { name: 'Search agents by title' }), 'bot');
		expect(mockRouter.asPath).toBe('/agents');
		await waitFor(() => expect(mockRouter.asPath).toBe('/agents?q=bot'), { timeout: SEARCH_DEBOUNCE_MS * 4 });
	});

	it('shows skeletons during a non-shallow navigation (pagination)', async () => {
		renderCatalog([listMock(at('/agents'), twoAgents, 30)]);
		await screen.findByRole('list', { name: 'Agents' });

		act(() => {
			mockRouter.events.emit('routeChangeStart', '/agents?page=2', { shallow: false });
		});
		expect(screen.getByRole('status', { name: 'Loading agents…' })).toBeInTheDocument();
	});

	it('shows the "Post a brief" call to action to guests and users, not to creators', async () => {
		const { unmount } = renderCatalog([listMock(at('/agents'), twoAgents)]);
		expect(await screen.findByRole('link', { name: 'Post a brief' })).toHaveAttribute('href', '/dashboard/briefs/new');
		unmount();

		renderCatalog([listMock(at('/agents'), twoAgents)], {
			auth: { status: 'member', me: { memberType: 'CREATOR' } as never },
		});
		await screen.findByRole('list', { name: 'Agents' });
		expect(screen.queryByRole('link', { name: 'Post a brief' })).not.toBeInTheDocument();
	});
});
