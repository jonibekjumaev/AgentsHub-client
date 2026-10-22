import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { BoardArticleCategory, Direction } from '@/gql/enums';
import type { BoardArticleInput, BoardArticleUpdate, BoardArticlesInquiry, OwnerArticleQuery } from '@/gql/graphql';

export const COMMUNITY_PATH = '/community';
export const MY_ARTICLES_PATH = '/dashboard/articles';
export const NEW_ARTICLE_PATH = '/dashboard/articles/new';
export const articleHref = (articleId: string) => `${COMMUNITY_PATH}/${articleId}`;
export const articleEditHref = (articleId: string) => `${MY_ARTICLES_PATH}/${articleId}/edit`;

export const ARTICLES_PAGE_SIZE = 10;
export const ARTICLE_SEARCH_MAX = 100;
/** §3.10 */
export const ARTICLE_TITLE_MIN = 3;
export const ARTICLE_TITLE_MAX = 50;
export const ARTICLE_CONTENT_MIN = 3;
export const ARTICLE_CONTENT_MAX = 250;

export const ARTICLE_CATEGORIES: readonly BoardArticleCategory[] = [
	BoardArticleCategory.Free,
	BoardArticleCategory.Recommend,
	BoardArticleCategory.News,
	BoardArticleCategory.Humor,
];

/** Every id is a 24-character hex ObjectId (§1.3). */
export const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

export type ArticleFilters = { category: BoardArticleCategory | null; text: string; page: number };
export const DEFAULT_ARTICLE_FILTERS: ArticleFilters = { category: null, text: '', page: 1 };

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};
const categorySchema = z.catch(z.nullable(z.enum(ARTICLE_CATEGORIES as [BoardArticleCategory, ...BoardArticleCategory[]])), null);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

/** ?category=news&q=telegram&page=2 */
export const parseArticleFilters = (query: ParsedUrlQuery): ArticleFilters => {
	const category = first(query.category);
	return {
		category: categorySchema.parse(category === undefined ? null : category.toUpperCase()),
		text: (first(query.q) ?? '').trim().slice(0, ARTICLE_SEARCH_MAX),
		page: pageSchema.parse(first(query.page)),
	};
};

export const toArticlesUrlQuery = (filters: ArticleFilters): Partial<Record<'category' | 'q' | 'page', string>> => {
	const query: Partial<Record<'category' | 'q' | 'page', string>> = {};
	if (filters.category) query.category = filters.category.toLowerCase();
	if (filters.text) query.q = filters.text;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const articlesHref = (filters: ArticleFilters): string => {
	const search = new URLSearchParams(toArticlesUrlQuery(filters)).toString();
	return search ? `${COMMUNITY_PATH}?${search}` : COMMUNITY_PATH;
};

export const toArticlesInquiry = (filters: ArticleFilters): BoardArticlesInquiry => ({
	page: filters.page,
	limit: ARTICLES_PAGE_SIZE,
	sort: 'createdAt',
	direction: Direction.Desc,
	search: {
		...(filters.category && { articleCategory: filters.category }),
		...(filters.text && { text: filters.text }),
	},
});

export const articlesListVariables = (filters: ArticleFilters) => ({ input: toArticlesInquiry(filters) });

/** One member's articles (their dashboard list and profile). */
export const memberArticlesVariables = (memberId: string, page = 1) => ({
	input: { page, limit: ARTICLES_PAGE_SIZE, sort: 'createdAt', direction: Direction.Desc, search: { memberId } },
});

// ---------- form ----------

export type ArticleFormValues = {
	articleCategory: BoardArticleCategory | '';
	articleTitle: string;
	articleContent: string;
	/** Stored path, '' = none. */
	articleImage: string;
};

export const EMPTY_ARTICLE_FORM: ArticleFormValues = { articleCategory: '', articleTitle: '', articleContent: '', articleImage: '' };

const key = (name: string) => `community:form.errors.${name}`;

export const articleFormSchema = z.object({
	articleCategory: z.enum(ARTICLE_CATEGORIES as [BoardArticleCategory, ...BoardArticleCategory[]], { error: key('categoryRequired') }),
	articleTitle: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, key('titleRequired')),
			z.minLength(ARTICLE_TITLE_MIN, key('titleLength')),
			z.maxLength(ARTICLE_TITLE_MAX, key('titleLength')),
		),
	articleContent: z
		.string()
		.check(
			z.trim(),
			z.minLength(1, key('contentRequired')),
			z.minLength(ARTICLE_CONTENT_MIN, key('contentLength')),
			z.maxLength(ARTICLE_CONTENT_MAX, key('contentLength')),
		),
	articleImage: z.string(),
});

export type ValidArticleForm = z.output<typeof articleFormSchema>;

export const toArticleInput = (form: ValidArticleForm): BoardArticleInput => ({
	articleCategory: form.articleCategory,
	articleTitle: form.articleTitle,
	articleContent: form.articleContent,
	...(form.articleImage !== '' && { articleImage: form.articleImage }),
});

/** Only changes; a removed image is null (B11). Null when nothing changed. The category is fixed once posted (not in BoardArticleUpdate). */
export const toArticleUpdate = (articleId: string, initial: ArticleFormValues, form: ValidArticleForm): BoardArticleUpdate | null => {
	const update: BoardArticleUpdate = { _id: articleId };
	if (form.articleTitle !== initial.articleTitle) update.articleTitle = form.articleTitle;
	if (form.articleContent !== initial.articleContent) update.articleContent = form.articleContent;
	if (form.articleImage !== initial.articleImage) update.articleImage = form.articleImage === '' ? null : form.articleImage;
	return Object.keys(update).length > 1 ? update : null;
};

export const fromArticle = (article: OwnerArticleQuery['getBoardArticle']): ArticleFormValues => ({
	articleCategory: article.articleCategory,
	articleTitle: article.articleTitle,
	articleContent: article.articleContent,
	articleImage: article.articleImage ?? '',
});
