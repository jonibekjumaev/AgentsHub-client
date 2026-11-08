import type { MockedResponse } from '@apollo/client/testing';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Me } from '@/auth';
import { SEARCH_DEBOUNCE_MS } from '@/shared/ui/catalog';
import { renderWithProviders } from '@/test/renderWithProviders';
import { CreatorFacetsQuery, CreatorsCatalogQuery, CreatorsHeroStatsQuery } from '../graphql/creators';
import { creatorsListVariables, parseCreatorFilters, type CreatorFilters } from '../lib/creatorsQuery';
import { makeCatalogCreator } from '../test/fixtures';
import { CreatorsCatalog } from './CreatorsCatalog';

const creatorsOf = (count: number, start = 0) =>
	Array.from({ length: count }, (_, index) => makeCatalogCreator({}, start + index));

const listMock = (
	filters: CreatorFilters,
	creators: ReturnType<typeof makeCatalogCreator>[],
	total = creators.length,
	extra: Partial<MockedResponse> = {},
): MockedResponse => ({
	request: { query: CreatorsCatalogQuery, variables: creatorsListVariables(filters) },
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: {
		data: {
			getCreators: {
				__typename: 'Members',
				list: creators,
				metaCounter: total ? [{ __typename: 'TotalCounter', total }] : [],
			},
		},
	},
	...extra,
});

const CATEGORIES = [
	'AUTOMATION',
	'CONTENT',
	'CUSTOMER_SUPPORT',
	'DATA_ANALYSIS',
	'EDUCATION',
	'MARKETING',
	'OTHER',
	'SALES',
];
const facetsMock = (
	categories: Record<string, number> = { CUSTOMER_SUPPORT: 2, SALES: 1 },
	withoutAgents = 0,
	following = 0,
	/** The API's "All": 2 creators, though the category counts add up to 3 (one builds in two). */
	all = 2,
): MockedResponse => ({
	request: { query: CreatorFacetsQuery },
	variableMatcher: () => true,
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: {
		data: {
			getCreatorFacets: {
				__typename: 'CreatorFacets',
				categories: CATEGORIES.map((value) => ({ __typename: 'CategoryFacet', value, count: categories[value] ?? 0 })),
				all,
				withoutAgents,
				following,
			},
		},
	},
});

const statsMock: MockedResponse = {
	request: { query: CreatorsHeroStatsQuery },
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: {
		data: {
			getCreatorStats: {
				__typename: 'CreatorStats',
				creators: 8,
				agents: 13,
				faces: [
					{
						__typename: 'Member',
						_id: '6ac7992dd87bde19b9216c99',
						memberNick: 'nova_labs',
						memberFullName: 'Nova Labs',
						memberImage: '',
						memberCategories: ['CUSTOMER_SUPPORT'],
					},
				],
			},
		},
	},
};

const at = (url: string) => {
	mockRouter.setCurrentUrl(url);
	return parseCreatorFilters(mockRouter.query);
};

const user: Me = {
	_id: '6ac7992dd87bde19b9216c11',
	memberType: 'USER',
	memberStatus: 'ACTIVE',
	memberNick: 'dilnoza',
} as Me;
const creatorMe: Me = { ...user, memberType: 'CREATOR' } as Me;

const renderCatalog = (
	mocks: MockedResponse[],
	options: { auth?: Record<string, unknown>; facets?: MockedResponse } = {},
) =>
	renderWithProviders(<CreatorsCatalog />, {
		mocks: [...mocks, options.facets ?? facetsMock(), statsMock],
		auth: (options.auth ?? { status: 'guest' }) as never,
	});

const grid = () => screen.findByRole('list', { name: 'Creators' });
const summary = () => screen.getAllByRole('status').find((element) => element.getAttribute('aria-live') === 'polite');

describe('CreatorsCatalog (agentshub-creators design, D-45)', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/creators');
	});

	it('shows the hero line from getCreatorStats', async () => {
		renderCatalog([listMock(at('/creators'), creatorsOf(1))]);
		expect(await screen.findByText('8 creators, 13 agents listed')).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 1, name: 'Meet the people building agents' })).toBeInTheDocument();
	});

	it('shows skeleton cards, then the first 9 of a page, "Show 11 more", then the pagination and the creator tile', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators'), creatorsOf(20), 26, { delay: 30 })]);

		expect(screen.getByRole('status', { name: 'Loading creators…' })).toHaveAttribute('aria-busy', 'true');
		expect(within(await grid()).getAllByRole('article')).toHaveLength(9);
		expect(summary()).toHaveTextContent('26 creators');
		expect(screen.queryByRole('heading', { name: 'Build AI agents?' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Show 11 more' }));
		expect(within(await grid()).getAllByRole('article')).toHaveLength(20);
		expect(
			within(screen.getByRole('navigation', { name: 'Pagination' })).getByRole('link', { name: 'Page 2' }),
		).toHaveAttribute('href', '/creators?page=2');
		expect(screen.getByRole('heading', { name: 'Build AI agents?' })).toBeInTheDocument();
	});

	it('renders a card as the design: rank, name link, handle, bio, stats, 2 agents, "See all", specialty tags', async () => {
		const creators = [
			makeCatalogCreator({ memberActiveProducts: 3 }, 0),
			makeCatalogCreator(
				{
					memberDesc: '',
					memberActiveProducts: 0,
					memberTopProducts: [],
					memberCategories: [],
					memberFollowers: 1,
					memberLikes: 0,
					memberRankPosition: 7,
				},
				1,
			),
			makeCatalogCreator({ memberActiveProducts: 2 }, 2),
		];
		renderCatalog([listMock(at('/creators'), creators)]);

		const [first, second, third] = within(await grid()).getAllByRole('article');
		expect(within(first).getByText('#1')).toBeInTheDocument();
		expect(within(first).getByRole('link', { name: 'Nova Labs' })).toHaveAttribute(
			'href',
			'/members/6ac7992dd87bde19b9216c99',
		);
		expect(within(first).getByText('@nova_labs')).toBeInTheDocument();
		expect(within(first).getByText('agents')).toBeInTheDocument();
		expect(within(first).getByText('followers')).toBeInTheDocument();
		expect(within(first).getByText('like')).toBeInTheDocument();
		expect(within(first).getByRole('heading', { name: 'Agents by Nova Labs' })).toBeInTheDocument();
		expect(within(first).getByRole('link', { name: /HelpDesk Copilot/ })).toHaveTextContent('$49 / mo');
		expect(within(first).getByRole('link', { name: /FAQ Bot Starter/ })).toHaveTextContent('Free');
		expect(within(first).getByRole('link', { name: 'See all 3 agents' })).toBeInTheDocument();
		const tags = within(first).getByRole('list', { name: 'Builds agents for' });
		expect(
			within(tags)
				.getAllByRole('listitem')
				.map((item) => item.textContent),
		).toEqual(['Customer support', 'Sales']);

		expect(within(second).getByText('#7')).toBeInTheDocument();
		expect(within(second).getByText('This creator has not added a bio yet.')).toBeInTheDocument();
		expect(within(second).getByText('No agents listed yet.')).toBeInTheDocument();
		expect(within(second).getByText('follower')).toBeInTheDocument();
		expect(within(second).queryByRole('link', { name: /See all/ })).not.toBeInTheDocument();
		// Both agents already shown: no "See all".
		expect(within(third).getAllByRole('link', { name: /HelpDesk Copilot|FAQ Bot Starter/ })).toHaveLength(2);
		expect(within(third).queryByRole('link', { name: /^See / })).not.toBeInTheDocument();
	});

	it('sends a guest who clicks Follow to login and back', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators'), creatorsOf(1))]);

		await user.click(within(await grid()).getByRole('button', { name: 'Follow @nova_labs' }));
		expect(mockRouter.asPath).toBe(`/login?next=${encodeURIComponent('/creators')}`);
	});

	it('starts Follow from meFollowed for a member', async () => {
		const followed = makeCatalogCreator({
			meFollowed: [
				{ __typename: 'MeFollowed', followerId: user._id, followingId: '6ac7992dd87bde19b9216c99', myFollowing: true },
			],
		});
		renderCatalog([listMock(at('/creators'), [followed])], { auth: { status: 'member', me: user } });

		const button = await within(await grid()).findByRole('button', { name: 'Following @nova_labs, click to unfollow' });
		expect(button).toHaveAttribute('aria-pressed', 'true');
	});

	it('shows the live counts; an empty category is disabled; the switch is on by default', async () => {
		renderCatalog([listMock(at('/creators'), creatorsOf(2))]);
		await grid();

		const rail = screen.getByRole('group', { name: 'Builds agents for' });
		await waitFor(() => expect(within(rail).getByRole('button', { name: 'Customer support 2' })).toBeEnabled());
		// "All" is the API's count, not the sum of the categories (2 + 1): one creator builds in both.
		expect(within(rail).getByRole('button', { name: 'All 2' })).toHaveAttribute('aria-pressed', 'true');
		expect(within(rail).getByRole('button', { name: 'Marketing 0' })).toBeDisabled();
		expect(screen.getByRole('switch', { name: 'Only creators with agents' })).toHaveAttribute('aria-checked', 'true');
		// "Following" needs a member.
		expect(screen.queryByRole('button', { name: /^Following/ })).not.toBeInTheDocument();
	});

	it('writes categories, the switch and the sort to the URL', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators?page=2'), creatorsOf(3), 23)]);
		await grid();

		await user.click(await screen.findByRole('button', { name: 'Sales 1' }));
		expect(mockRouter.asPath).toBe('/creators?category=sales');
		await user.click(screen.getByRole('switch', { name: 'Only creators with agents' }));
		expect(mockRouter.asPath).toBe('/creators?category=sales&agents=any');
		await user.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'Name A–Z');
		expect(mockRouter.asPath).toBe('/creators?category=sales&agents=any&sort=name');
	});

	it('says how many creators the switch hides and shows them on click', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators'), creatorsOf(2))], { facets: facetsMock(undefined, 3) });
		await grid();

		await user.click(await screen.findByRole('button', { name: '3 creators have no agents yet. Show them' }));
		expect(mockRouter.asPath).toBe('/creators?agents=any');
	});

	it('a member filters by "Following" with its count', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators'), creatorsOf(2))], {
			auth: { status: 'member', me: user },
			facets: facetsMock(undefined, 0, 4),
		});
		await grid();

		const chip = await screen.findByRole('button', { name: 'Following 4' });
		expect(chip).toHaveAttribute('aria-pressed', 'false');
		await user.click(chip);
		expect(mockRouter.asPath).toBe('/creators?following=1');
	});

	it('"Try:" pills set the category; the search is debounced into the URL', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators'), creatorsOf(2))]);
		await grid();

		await user.click(screen.getByRole('button', { name: 'Education' }));
		expect(mockRouter.asPath).toBe('/creators?category=education');
		await user.type(screen.getByRole('searchbox', { name: 'Search creators' }), 'nova');
		await waitFor(() => expect(mockRouter.asPath).toBe('/creators?q=nova&category=education'), {
			timeout: SEARCH_DEBOUNCE_MS * 4,
		});
	});

	it('removes a filter from its chip', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators?category=sales,education'), creatorsOf(1))]);
		await grid();

		await user.click(screen.getByRole('button', { name: 'Remove filter: Education' }));
		expect(mockRouter.asPath).toBe('/creators?category=sales');
	});

	it('no match: "Post a brief instead" and "Clear all filters", which keeps the sort and the switch', async () => {
		const user = userEvent.setup();
		renderCatalog([listMock(at('/creators?q=zzz&sort=followers'), [])]);

		expect(await screen.findByRole('heading', { name: 'No creator matches this' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Post a brief instead' })).toHaveAttribute('href', '/dashboard/briefs/new');
		await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
		expect(mockRouter.asPath).toBe('/creators?sort=followers');
	});

	it('"Following" when I follow nobody: its own empty state', async () => {
		renderCatalog([listMock(at('/creators?following=1'), [])], {
			auth: { status: 'member', me: user },
			facets: facetsMock(undefined, 0, 0),
		});

		expect(await screen.findByRole('heading', { name: 'You are not following anyone yet' })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Post a brief instead' })).not.toBeInTheDocument();
	});

	it('hides "Become a creator" from creators', async () => {
		renderCatalog([listMock(at('/creators'), creatorsOf(1))], { auth: { status: 'member', me: creatorMe } });
		await grid();

		expect(screen.queryByRole('link', { name: /Become a creator/ })).not.toBeInTheDocument();
	});

	it('shows the error state with a working retry', async () => {
		const user = userEvent.setup();
		const filters = at('/creators');
		renderCatalog([
			{
				request: { query: CreatorsCatalogQuery, variables: creatorsListVariables(filters) },
				error: new TypeError('Failed to fetch'),
			},
			listMock(filters, creatorsOf(1)),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("We couldn't load the creators");
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await grid()).toBeInTheDocument();
	});

	it('shows skeletons during a non-shallow navigation (pagination)', async () => {
		renderCatalog([listMock(at('/creators'), creatorsOf(2))]);
		await grid();

		act(() => {
			mockRouter.events.emit('routeChangeStart', '/creators?page=2', { shallow: false });
		});
		expect(screen.getByRole('status', { name: 'Loading creators…' })).toBeInTheDocument();
	});
});
