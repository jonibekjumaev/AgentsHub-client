import { describe, expect, it } from 'vitest';
import {
	DEFAULT_ARTICLE_FILTERS,
	articleFacetsVariables,
	articleFormSchema,
	articlesHref,
	excerptOf,
	hasActiveArticleFilters,
	parseArticleFilters,
	readMinutes,
	toArticleUpdate,
	toArticlesInquiry,
	toArticlesUrlQuery,
	type ArticleFormValues,
} from './articles';

describe('community URL filters', () => {
	it('parses with fallbacks and round-trips', () => {
		expect(parseArticleFilters({ category: 'cooking', sort: 'oldest', page: '-1' })).toEqual(DEFAULT_ARTICLE_FILTERS);
		const filters = { category: 'NEWS' as const, text: 'telegram', sort: 'discussed' as const, page: 2 };
		expect(articlesHref(filters)).toBe('/community?category=news&q=telegram&sort=discussed&page=2');
		expect(parseArticleFilters(toArticlesUrlQuery(filters))).toEqual(filters);
		// the default sort stays out of the URL
		expect(articlesHref({ ...DEFAULT_ARTICLE_FILTERS, sort: 'newest' })).toBe('/community');
	});

	it('maps to getBoardArticles with keys only when set: 20 per page (the feed)', () => {
		expect(toArticlesInquiry(DEFAULT_ARTICLE_FILTERS)).toEqual({ page: 1, limit: 20, sort: 'createdAt', direction: 'DESC', search: {} });
		expect(toArticlesInquiry({ category: 'HUMOR', text: 'x', sort: 'newest', page: 1 }).search).toEqual({ articleCategory: 'HUMOR', text: 'x' });
	});

	it.each([
		['newest', 'createdAt'],
		['liked', 'articleLikes'],
		['discussed', 'articleComments'],
		['viewed', 'articleViews'],
	] as const)('sort %s → %s, newest first (D-46)', (sort, field) => {
		expect(toArticlesInquiry({ ...DEFAULT_ARTICLE_FILTERS, sort })).toMatchObject({ sort: field, direction: 'DESC' });
	});

	it('the topic counts take the same search, without page and sort', () => {
		expect(articleFacetsVariables({ category: 'NEWS', text: 'bot', sort: 'liked', page: 3 })).toEqual({
			input: { articleCategory: 'NEWS', text: 'bot' },
		});
		expect(hasActiveArticleFilters({ ...DEFAULT_ARTICLE_FILTERS, sort: 'liked' })).toBe(false);
		expect(hasActiveArticleFilters({ ...DEFAULT_ARTICLE_FILTERS, category: 'FREE' })).toBe(true);
	});
});

describe('read time and excerpt', () => {
	it('reads about 200 words a minute, at least 1 minute', () => {
		expect(readMinutes('')).toBe(1);
		expect(readMinutes('word '.repeat(150))).toBe(1);
		expect(readMinutes('word '.repeat(600))).toBe(3);
	});

	it('collapses whitespace and cuts at a word with an ellipsis', () => {
		expect(excerptOf('Hello\n\n  world')).toBe('Hello world');
		expect(excerptOf('one two three four', 15)).toBe('one two three…');
		expect(excerptOf('a'.repeat(30), 10)).toBe(`${'a'.repeat(10)}…`);
	});
});

describe('article form (§3.10)', () => {
	const valid: ArticleFormValues = { articleCategory: 'FREE', articleTitle: 'Hello', articleContent: 'First post', articleImage: '' };

	it('checks the 3–50 / 3–3000 limits (D-35)', () => {
		expect(articleFormSchema.safeParse(valid).success).toBe(true);
		expect(articleFormSchema.safeParse({ ...valid, articleTitle: 'x'.repeat(51) }).success).toBe(false);
		expect(articleFormSchema.safeParse({ ...valid, articleContent: 'x'.repeat(3000) }).success).toBe(true);
		expect(articleFormSchema.safeParse({ ...valid, articleContent: 'x'.repeat(3001) }).success).toBe(false);
	});

	it('clears a removed image with null (B11)', () => {
		const initial = { ...valid, articleImage: 'uploads/article/a.png' };
		expect(toArticleUpdate('id', initial, articleFormSchema.parse(valid))).toEqual({ _id: 'id', articleImage: null });
		expect(toArticleUpdate('id', valid, articleFormSchema.parse(valid))).toBeNull();
	});
});
