import { describe, expect, it } from 'vitest';
import {
	DEFAULT_ARTICLE_FILTERS,
	articleFormSchema,
	articlesHref,
	parseArticleFilters,
	toArticleUpdate,
	toArticlesInquiry,
	toArticlesUrlQuery,
	type ArticleFormValues,
} from './articles';

describe('community URL filters', () => {
	it('parses with fallbacks and round-trips', () => {
		expect(parseArticleFilters({ category: 'cooking', page: '-1' })).toEqual(DEFAULT_ARTICLE_FILTERS);
		const filters = { category: 'NEWS' as const, text: 'telegram', page: 2 };
		expect(articlesHref(filters)).toBe('/community?category=news&q=telegram&page=2');
		expect(parseArticleFilters(toArticlesUrlQuery(filters))).toEqual(filters);
	});

	it('maps to getBoardArticles with keys only when set', () => {
		expect(toArticlesInquiry(DEFAULT_ARTICLE_FILTERS)).toEqual({ page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} });
		expect(toArticlesInquiry({ category: 'HUMOR', text: 'x', page: 1 }).search).toEqual({ articleCategory: 'HUMOR', text: 'x' });
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
