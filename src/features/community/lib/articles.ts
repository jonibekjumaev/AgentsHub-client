import type { ParsedUrlQuery } from 'querystring';
import * as z from 'zod/mini';
import { BoardArticleCategory, Direction } from '@/gql/enums';
import type { BaiSearch, BoardArticleInput, BoardArticleUpdate, BoardArticlesInquiry, OwnerArticleQuery } from '@/gql/graphql';

export const COMMUNITY_PATH = '/community';
export const MY_ARTICLES_PATH = '/dashboard/articles';
export const NEW_ARTICLE_PATH = '/dashboard/articles/new';
export const articleHref = (articleId: string) => `${COMMUNITY_PATH}/${articleId}`;
export const articleEditHref = (articleId: string) => `${MY_ARTICLES_PATH}/${articleId}/edit`;

/** The owner's dashboard list (MyArticles). */
export const ARTICLES_PAGE_SIZE = 10;
/** One page of the /community feed; the first COMMUNITY_FIRST_SHOWN show at once, "Show more" opens the rest (as /briefs). */
export const COMMUNITY_PAGE_SIZE = 20;
export const COMMUNITY_FIRST_SHOWN = 9;
export const ARTICLE_SEARCH_MAX = 100;
/** §3.10; content 3–3000 since D-35 */
export const ARTICLE_TITLE_MIN = 3;
export const ARTICLE_TITLE_MAX = 50;
export const ARTICLE_CONTENT_MIN = 3;
export const ARTICLE_CONTENT_MAX = 3000;

export const ARTICLE_CATEGORIES: readonly BoardArticleCategory[] = [
	BoardArticleCategory.Free,
	BoardArticleCategory.Recommend,
	BoardArticleCategory.News,
	BoardArticleCategory.Humor,
];

/** Every id is a 24-character hex ObjectId (§1.3). */
export const isObjectId = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

/** The community design's sort menu, default first. */
export const ARTICLE_SORTS = ['newest', 'liked', 'discussed', 'viewed'] as const;
export type ArticleSort = (typeof ARTICLE_SORTS)[number];
export const DEFAULT_ARTICLE_SORT: ArticleSort = 'newest';

/** FRONTEND_MIGRATION §2.5; "discussed" = articleComments (D-46). Ties go to the newest article on the server. */
const SORT_TO_API: Record<ArticleSort, string> = {
	newest: 'createdAt',
	liked: 'articleLikes',
	discussed: 'articleComments',
	viewed: 'articleViews',
};

export type ArticleFilters = { category: BoardArticleCategory | null; text: string; sort: ArticleSort; page: number };
export const DEFAULT_ARTICLE_FILTERS: ArticleFilters = { category: null, text: '', sort: DEFAULT_ARTICLE_SORT, page: 1 };

const first = (value: string | string[] | undefined): string | undefined => {
	const item = Array.isArray(value) ? value[0] : value;
	return item === undefined || item.trim() === '' ? undefined : item;
};
const categorySchema = z.catch(z.nullable(z.enum(ARTICLE_CATEGORIES as [BoardArticleCategory, ...BoardArticleCategory[]])), null);
const sortSchema = z.catch(z.enum(ARTICLE_SORTS), DEFAULT_ARTICLE_SORT);
const pageSchema = z.catch(z.coerce.number().check(z.int(), z.minimum(1)), 1);

/** ?category=news&q=telegram&sort=discussed&page=2; any invalid value falls back to its default on its own. */
export const parseArticleFilters = (query: ParsedUrlQuery): ArticleFilters => {
	const category = first(query.category);
	return {
		category: categorySchema.parse(category === undefined ? null : category.toUpperCase()),
		text: (first(query.q) ?? '').trim().slice(0, ARTICLE_SEARCH_MAX),
		sort: sortSchema.parse(first(query.sort)),
		page: pageSchema.parse(first(query.page)),
	};
};

type ArticlesUrlQuery = Partial<Record<'category' | 'q' | 'sort' | 'page', string>>;

/** Only non-default values, in a fixed key order. */
export const toArticlesUrlQuery = (filters: ArticleFilters): ArticlesUrlQuery => {
	const query: ArticlesUrlQuery = {};
	if (filters.category) query.category = filters.category.toLowerCase();
	if (filters.text) query.q = filters.text;
	if (filters.sort !== DEFAULT_ARTICLE_SORT) query.sort = filters.sort;
	if (filters.page > 1) query.page = String(filters.page);
	return query;
};

export const articlesHref = (filters: ArticleFilters): string => {
	const search = new URLSearchParams(toArticlesUrlQuery(filters)).toString();
	return search ? `${COMMUNITY_PATH}?${search}` : COMMUNITY_PATH;
};

/** BAISearch for the list and the topic counts. Keys only when set, so equal filters give an equal cache key. */
export const toArticleSearch = (filters: ArticleFilters): BaiSearch => ({
	...(filters.category && { articleCategory: filters.category }),
	...(filters.text && { text: filters.text }),
});

export const toArticlesInquiry = (filters: ArticleFilters): BoardArticlesInquiry => ({
	page: filters.page,
	limit: COMMUNITY_PAGE_SIZE,
	sort: SORT_TO_API[filters.sort],
	direction: Direction.Desc,
	search: toArticleSearch(filters),
});

export const articlesListVariables = (filters: ArticleFilters) => ({ input: toArticlesInquiry(filters) });

/** getArticleFacets (D-46): the same search as the list; the server ignores the topic for the topic counts. */
export const articleFacetsVariables = (filters: ArticleFilters) => ({ input: toArticleSearch(filters) });

/** Anything that narrows the list (the sort does not). */
export const hasActiveArticleFilters = (filters: ArticleFilters): boolean => Boolean(filters.category || filters.text);

/** Reading speed for "N min read": about 200 words a minute, at least 1 minute. */
const WORDS_PER_MINUTE = 200;
export const readMinutes = (content: string): number => {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/** One paragraph for a list: whitespace collapsed, cut at a word before `max` characters, with "…". */
export const excerptOf = (content: string, max = 220): string => {
	const flat = content.replace(/\s+/g, ' ').trim();
	if (flat.length <= max) return flat;
	const cut = flat.slice(0, max);
	const space = cut.lastIndexOf(' ');
	return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
};

/** One member's articles, page by page (their dashboard list). The public profile uses profileArticlesVariables. */
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
