import type { MockedResponse } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommentsQuery, articleCommentTarget, commentsVariables } from '@/features/comments';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ArticleDetailQuery } from '../graphql/articles';
import { WRITER_ID, makeArticle } from '../test/fixtures';
import { ArticleDetail } from './ArticleDetail';

const article = { ...makeArticle({ articleCategory: 'NEWS' }, 0), memberId: WRITER_ID, updatedAt: '2026-11-01T10:00:00.000Z' };
const { meLiked: _meLiked, ...detail } = article;

const mocks: MockedResponse[] = [
	{ request: { query: ArticleDetailQuery, variables: { articleId: article._id } }, result: { data: { getBoardArticle: detail } } },
	{
		request: { query: CommentsQuery, variables: commentsVariables(articleCommentTarget(article._id)) },
		result: { data: { getComments: { __typename: 'Comments', list: [], metaCounter: [{ __typename: 'TotalCounter', total: 0 }] } } },
	},
];

describe('ArticleDetail', () => {
	it('puts the title, topic pill, author and breadcrumb in the night band, the text in the article card', async () => {
		renderWithProviders(<ArticleDetail articleId={article._id} />, { mocks, auth: { status: 'guest' } });

		const title = await screen.findByRole('heading', { level: 1, name: article.articleTitle });
		const band = title.closest('header') as HTMLElement;
		expect(within(band).getByText('News')).toBeInTheDocument();
		expect(within(band).getByRole('link', { name: '@nova' })).toHaveAttribute('href', `/members/${WRITER_ID}`);
		const crumbs = within(band).getByRole('navigation', { name: 'Breadcrumb' });
		expect(within(crumbs).getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community');

		const card = screen.getByRole('article', { name: article.articleTitle });
		expect(within(card).getByText(/Short prompts work better/)).toBeInTheDocument();
		expect(within(card).getByRole('button', { name: /Like/ })).toBeInTheDocument();
	});
});
