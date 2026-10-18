import { graphql } from '@/gql';

/**
 * /agents/[id] public data. SSR runs it without a token, so the API answers as for a guest:
 * only ACTIVE products, no view recorded, no contacts asked for (CLAUDE.md rule 11).
 */
export const AgentDetailQuery = graphql(`
	query AgentDetail($productId: String!) {
		getProduct(productId: $productId) {
			_id
			productTitle
			productDesc
			productStatus
			productCategory
			productPricing
			productPrice
			productDemoUrl
			productTags
			productImages
			productLikes
			productViews
			productComments
			updatedAt
			memberData {
				_id
				memberNick
				memberFullName
				memberImage
				memberProducts
				memberFollowers
			}
		}
	}
`);

/**
 * Signed-in ACTIVE members only, in the browser after auth. The token makes the API:
 * - return the creator's contacts (null for guests, D-07/D-23),
 * - say whether this member liked it (meLiked: [] or one entry; SSR has no token, so it is only known here), and
 * - record this member's view once (never the owner's, FRONTEND_MIGRATION §3.9); productViews comes back updated.
 */
export const AgentViewerQuery = graphql(`
	query AgentViewer($productId: String!) {
		getProduct(productId: $productId) {
			_id
			productViews
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			memberData {
				_id
				memberEmail
				memberWhatsapp
			}
		}
	}
`);

/**
 * Toggles the like (FRONTEND_MIGRATION §3.9). The API returns the updated product but does not fill
 * meLiked in this response, so only productLikes is read back; meLiked is written to the cache by the caller.
 */
export const LikeAgentMutation = graphql(`
	mutation LikeAgent($productId: String!) {
		likeTargetProduct(productId: $productId) {
			_id
			productLikes
		}
	}
`);
