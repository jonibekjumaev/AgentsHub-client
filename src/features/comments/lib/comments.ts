import { CommentGroup, Direction } from '@/gql/enums';

/** commentContent is 1–100 characters (§3.8). */
export const COMMENT_MAX = 100;
/** Comments shown at first, and added by every "Show more". */
export const COMMENTS_PAGE_SIZE = 20;

export type CommentTarget = {
	group: CommentGroup;
	refId: string;
	/**
	 * The cached object whose counter follows the comments (B19): briefComments on a Brief,
	 * productComments on a Product. Kept in step after create / delete without a refetch.
	 */
	counter: { typename: 'Brief' | 'Product' | 'BoardArticle'; field: 'briefComments' | 'productComments' | 'articleComments' };
};

/** Oldest first: questions and their answers read top to bottom (BriefDetail.html). */
export const commentsVariables = (target: Pick<CommentTarget, 'group' | 'refId'>, limit = COMMENTS_PAGE_SIZE) => ({
	input: {
		page: 1,
		limit,
		sort: 'createdAt',
		direction: Direction.Asc,
		search: { commentRefId: target.refId, commentGroup: target.group },
	},
});

/** The text the API will store: trimmed. Empty or too long is not sent. */
export const normalizeComment = (value: string): string => value.trim();

export const isValidComment = (value: string): boolean => {
	const text = normalizeComment(value);
	return text.length >= 1 && text.length <= COMMENT_MAX;
};

/** The comments a counter-target exists under, e.g. BRIEF → Brief.briefComments. */
export const briefCommentTarget = (briefId: string): CommentTarget => ({
	group: CommentGroup.Brief,
	refId: briefId,
	counter: { typename: 'Brief', field: 'briefComments' },
});

export const productCommentTarget = (productId: string): CommentTarget => ({
	group: CommentGroup.Product,
	refId: productId,
	counter: { typename: 'Product', field: 'productComments' },
});

export const articleCommentTarget = (articleId: string): CommentTarget => ({
	group: CommentGroup.Article,
	refId: articleId,
	counter: { typename: 'BoardArticle', field: 'articleComments' },
});
