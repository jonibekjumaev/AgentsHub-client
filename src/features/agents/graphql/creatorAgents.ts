import { graphql } from '@/gql';

/** One row of "My agents" (Dashboard.html). */
export const CreatorAgentRowFragment = graphql(`
	fragment CreatorAgentRow on Product {
		_id
		productTitle
		productCategory
		productStatus
		productPricing
		productPrice
		productImages
		productViews
		productLikes
		productComments
		updatedAt
	}
`);

/**
 * The signed-in creator's ACTIVE + PAUSED agents (FRONTEND_MIGRATION §3.5), plus the tab counts:
 * `active` and `paused` ask for one row only, to read metaCounter. One request for the whole page.
 */
export const CreatorAgentsQuery = graphql(`
	query CreatorAgents($input: CreatorProductsInquiry!) {
		list: getCreatorProducts(input: $input) {
			list {
				...CreatorAgentRow
			}
			metaCounter {
				total
			}
		}
		active: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: ACTIVE } }) {
			metaCounter {
				total
			}
		}
		paused: getCreatorProducts(input: { page: 1, limit: 1, search: { productStatus: PAUSED } }) {
			metaCounter {
				total
			}
		}
	}
`);

/** Pause, resume or delete (D-16/D-29): updateProduct with `_id` and `productStatus` only. */
export const UpdateAgentStatusMutation = graphql(`
	mutation UpdateAgentStatus($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productStatus
			updatedAt
		}
	}
`);
