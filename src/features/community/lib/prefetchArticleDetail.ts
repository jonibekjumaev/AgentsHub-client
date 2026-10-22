import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { ArticleDetailQuery } from '../graphql/articles';
import { isObjectId } from './articles';

export type ArticleDetailPrefetch = { found: true; articleId: string } | { found: false };

/** /community/[id] SSR (no token). Missing, deleted or malformed → 404; other failures throw (500). */
export const prefetchArticleDetail = async (
	client: Pick<ApolloClient<NormalizedCacheObject>, 'query'>,
	articleId: unknown,
): Promise<ArticleDetailPrefetch> => {
	if (!isObjectId(articleId)) return { found: false };
	let article;
	try {
		({ data: { getBoardArticle: article } } = await client.query({ query: ArticleDetailQuery, variables: { articleId } }));
	} catch (error) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return { found: false };
		throw error;
	}
	if (article.articleStatus !== 'ACTIVE') return { found: false };
	return { found: true, articleId };
};
