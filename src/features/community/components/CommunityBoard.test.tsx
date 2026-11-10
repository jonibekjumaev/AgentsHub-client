import type { MockedResponse } from '@apollo/client/testing';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import {
	ArticleFacetsQuery,
	CommunityArticlesQuery,
	CommunityStatsQuery,
	LikeArticleMutation,
} from '../graphql/articles';
import { articlesListVariables, parseArticleFilters, type ArticleFilters } from '../lib/articles';
import { WRITER_ID, makeArticle, member } from '../test/fixtures';
import { CommunityBoard } from './CommunityBoard';

type Article = ReturnType<typeof makeArticle>;
const articlesOf = (count: number, start = 0) =>
	Array.from({ length: count }, (_, index) => makeArticle({}, start + index));

const listResult = (articles: Article[], total = articles.length) => ({
	data: {
		getBoardArticles: {
			__typename: 'BoardArticles',
			list: articles,
			metaCounter: total ? [{ __typename: 'TotalCounter', total }] : [],
		},
	},
});

const listMock = (
	filters: ArticleFilters,
	articles: Article[],
	total = articles.length,
	extra: Partial<MockedResponse> = {},
): MockedResponse => ({
	request: { query: CommunityArticlesQuery, variables: articlesListVariables(filters) },
	result: listResult(articles, total),
	...extra,
});

const facetsMock: MockedResponse = {
	request: { query: ArticleFacetsQuery },
	variableMatcher: () => true,
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: {
		data: {
			getArticleFacets: {
				__typename: 'ArticleFacets',
				categories: [
					{ __typename: 'ArticleCategoryFacet', value: 'FREE', count: 9 },
					{ __typename: 'ArticleCategoryFacet', value: 'RECOMMEND', count: 0 },
					{ __typename: 'ArticleCategoryFacet', value: 'NEWS', count: 3 },
					{ __typename: 'ArticleCategoryFacet', value: 'HUMOR', count: 2 },
				],
				all: 14,
			},
		},
	},
};

const statsMock: MockedResponse = {
	request: { query: CommunityStatsQuery },
	maxUsageCount: Number.POSITIVE_INFINITY,
	result: {
		data: {
			getCommunityStats: {
				__typename: 'CommunityStats',
				articles: 14,
				writers: 3,
				topWriters: [
					{
						__typename: 'ArticleWriter',
						articles: 6,
						likes: 31,
						memberData: {
							__typename: 'Member',
							_id: WRITER_ID,
							memberNick: 'nova',
							memberFullName: 'Nova Labs',
							memberImage: '',
							memberType: 'CREATOR',
						},
					},
				],
			},
		},
	},
};

const at = (url: string) => {
	mockRouter.setCurrentUrl(url);
	return parseArticleFilters(mockRouter.query);
};

const renderBoard = (
	mocks: MockedResponse[],
	auth: NonNullable<Parameters<typeof renderWithProviders>[1]>['auth'] = { status: 'guest' },
) => renderWithProviders(<CommunityBoard />, { mocks: [...mocks, facetsMock, statsMock], auth });

const results = () => screen.findByRole('list', { name: 'Articles' });

/** The chat socket never opens in tests. */
class SilentSocket {
	static readonly OPEN = 1;
	readyState = 0;
	onopen = null;
	onmessage = null;
	onclose = null;
	send = vi.fn();
	close = vi.fn();
}

describe('CommunityBoard', () => {
	beforeEach(() => {
		mockRouter.setCurrentUrl('/community');
		vi.stubGlobal('WebSocket', SilentSocket);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('shows skeletons, then the first 9 articles; "Show more" opens the rest of the page', async () => {
		const user = userEvent.setup();
		renderBoard([listMock(at('/community'), articlesOf(14), 14, { delay: 30 })]);

		expect(screen.getByRole('status', { name: 'Loading articles…' })).toHaveAttribute('aria-busy', 'true');
		expect(within(await results()).getAllByRole('article')).toHaveLength(9);
		expect(screen.getByText('Showing 9 of 14')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Show 5 more' }));
		expect(within(await results()).getAllByRole('article')).toHaveLength(14);
	});

	it('shows the hero numbers and the active writers (D-46)', async () => {
		renderBoard([listMock(at('/community'), articlesOf(2))]);
		await results();

		expect(
			screen.getByRole('heading', { level: 1, name: 'AgentsHub Community' }),
		).toBeInTheDocument();
		expect(await screen.findByText(/14 articles by 3 writers\./)).toBeInTheDocument();
		const writers = screen.getByRole('region', { name: 'Active writers' });
		expect(within(writers).getByRole('link', { name: 'Nova Labs' })).toHaveAttribute('href', `/members/${WRITER_ID}`);
		expect(within(writers).getByText('6 articles · 31 likes')).toBeInTheDocument();
	});

	it('shows the topic counts, disables an empty topic, and writes the topic to the URL', async () => {
		const user = userEvent.setup();
		renderBoard([
			listMock(at('/community?sort=liked'), articlesOf(3)),
			listMock({ ...at('/community?sort=liked'), category: 'HUMOR' }, articlesOf(2)),
		]);
		mockRouter.setCurrentUrl('/community?sort=liked');
		await results();

		const topics = screen.getByRole('group', { name: 'Categories' });
		await waitFor(() =>
			expect(within(topics).getByRole('button', { name: 'All 14' })).toHaveAttribute('aria-pressed', 'true'),
		);
		expect(within(topics).getByRole('button', { name: 'Recommendations 0' })).toBeDisabled();

		await user.click(within(topics).getByRole('button', { name: 'Humor 2' }));
		expect(mockRouter.asPath).toBe('/community?category=humor&sort=liked');
		// a second click on the chosen topic goes back to all
		await user.click(await within(topics).findByRole('button', { name: 'Humor 2', pressed: true }));
		expect(mockRouter.asPath).toBe('/community?sort=liked');
	});

	it('changes the sort through the URL ("Most discussed", D-46)', async () => {
		const user = userEvent.setup();
		renderBoard([listMock(at('/community'), articlesOf(2))]);
		await results();

		await user.click(screen.getByRole('combobox', { name: /^Sort/ }));
		const menu = await screen.findByRole('listbox');
		expect(
			within(menu)
				.getAllByRole('option')
				.map((option) => option.textContent),
		).toEqual(['Newest', 'Most liked', 'Most discussed', 'Most viewed']);
		await user.click(within(menu).getByRole('option', { name: 'Most discussed' }));
		expect(mockRouter.asPath).toBe('/community?sort=discussed');
	});

	it('shows the empty search state; "Clear all" keeps the sort', async () => {
		const user = userEvent.setup();
		renderBoard([listMock(at('/community?q=zzz&sort=viewed'), [])]);

		expect(await screen.findByRole('heading', { name: 'No articles match' })).toBeInTheDocument();
		expect(screen.getByText('Nothing matches “zzz”. Try another topic or fewer words.')).toBeInTheDocument();
		await user.click(screen.getAllByRole('button', { name: 'Clear all' })[0]);
		expect(mockRouter.asPath).toBe('/community?sort=viewed');
	});

	it('shows the error state with a working retry', async () => {
		const user = userEvent.setup();
		const filters = at('/community');
		renderBoard([
			{
				request: { query: CommunityArticlesQuery, variables: articlesListVariables(filters) },
				error: new TypeError('Failed to fetch'),
			},
			listMock(filters, articlesOf(2)),
		]);

		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent("We couldn't load the articles");
		await user.click(within(alert).getByRole('button', { name: 'Try again' }));
		expect(await results()).toBeInTheDocument();
	});

	it('sends a guest who likes to login and back', async () => {
		const user = userEvent.setup();
		renderBoard([listMock(at('/community?category=free'), articlesOf(1))]);
		await results();

		await user.click(screen.getByRole('button', { name: 'Like “Prompt tips 1”, 3 likes' }));
		expect(mockRouter.asPath).toBe(`/login?next=${encodeURIComponent('/community?category=free')}`);
	});

	it('asks a member once more for meLiked, then likes at once (optimistic)', async () => {
		const user = userEvent.setup();
		const filters = at('/community');
		const [article] = articlesOf(1);
		renderBoard(
			[
				listMock(filters, [article]),
				// the member's own request, with the token
				listMock(filters, [{ ...article, meLiked: [] }]),
				{
					request: { query: LikeArticleMutation, variables: { articleId: article._id } },
					delay: 50,
					result: {
						data: { likeTargetBoardArticle: { __typename: 'BoardArticle', _id: article._id, articleLikes: 4 } },
					},
				},
			],
			{ status: 'member', me: member },
		);
		await results();

		const like = await screen.findByRole('button', { name: 'Like “Prompt tips 1”, 3 likes' });
		await user.click(like);
		const liked = await screen.findByRole('button', { name: 'Like “Prompt tips 1”, 4 likes' });
		expect(liked).toHaveAttribute('aria-pressed', 'true');
	});
});
