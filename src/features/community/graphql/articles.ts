import { graphql } from '@/gql';

/** One article in a list. Public fields only. */
export const ArticleCardFragment = graphql(`
	fragment ArticleCard on BoardArticle {
		_id
		articleCategory
		articleStatus
		articleTitle
		articleContent
		articleImage
		articleLikes
		articleViews
		articleComments
		createdAt
		memberData {
			_id
			memberNick
			memberFullName
			memberImage
		}
	}
`);

/** /community and profile lists. Public; ACTIVE articles only. */
export const ArticlesListQuery = graphql(`
	query ArticlesList($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				...ArticleCard
			}
			metaCounter {
				total
			}
		}
	}
`);

/** /community/[id] public data (SSR, no token: no view, no meLiked). Deleted or missing → NOT_FOUND. */
export const ArticleDetailQuery = graphql(`
	query ArticleDetail($articleId: String!) {
		getBoardArticle(articleId: $articleId) {
			...ArticleCard
			memberId
			updatedAt
		}
	}
`);

/** Signed-in ACTIVE members: whether I liked it, and the recorded view. */
export const ArticleViewerQuery = graphql(`
	query ArticleViewer($articleId: String!) {
		getBoardArticle(articleId: $articleId) {
			_id
			articleViews
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`);

/** Toggles the like (§3.9). Like LikeAgentMutation, meLiked is written to the cache by the caller. */
export const LikeArticleMutation = graphql(`
	mutation LikeArticle($articleId: String!) {
		likeTargetBoardArticle(articleId: $articleId) {
			_id
			articleLikes
		}
	}
`);

/** The article to edit, with the token; ownership is checked on memberId. */
export const OwnerArticleQuery = graphql(`
	query OwnerArticle($articleId: String!) {
		getBoardArticle(articleId: $articleId) {
			_id
			memberId
			articleStatus
			articleCategory
			articleTitle
			articleContent
			articleImage
			updatedAt
		}
	}
`);

export const CreateArticleMutation = graphql(`
	mutation CreateArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleTitle
		}
	}
`);

/** Also deletes: articleStatus DELETE (own articles). */
export const UpdateArticleMutation = graphql(`
	mutation UpdateArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleStatus
			articleCategory
			articleTitle
			articleContent
			articleImage
			updatedAt
		}
	}
`);

export const UploadArticleImageMutation = graphql(`
	mutation UploadArticleImage($file: Upload!) {
		imageUploader(file: $file, target: "article")
	}
`);
