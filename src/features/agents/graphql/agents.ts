import { graphql } from '@/gql';

/** What an AgentCard shows (DESIGN §3). Public fields only: no contacts. */
export const AgentCardFragment = graphql(`
	fragment AgentCard on Product {
		_id
		productTitle
		productCategory
		productPricing
		productPrice
		productImages
		productLikes
		productViews
		memberData {
			_id
			memberNick
		}
	}
`);

/** /agents list. Public: SSR runs it without a token (CLAUDE.md rules 11–12). */
export const AgentsListQuery = graphql(`
	query AgentsList($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				...AgentCard
			}
			metaCounter {
				total
			}
		}
	}
`);

/** One result of the /agents catalog: the card fields plus a description line and the caller's like. */
export const CatalogAgentFragment = graphql(`
	fragment CatalogAgent on Product {
		_id
		productTitle
		productCategory
		productPricing
		productPrice
		productDesc
		productImages
		productLikes
		productViews
		meLiked {
			memberId
			likeRefId
			myFavorite
		}
		memberData {
			_id
			memberNick
		}
	}
`);

/**
 * /agents results. SSR runs it without a token (no meLiked); a signed-in browser runs it again with the
 * token, so each card knows whether this member liked it.
 */
export const AgentsCatalogQuery = graphql(`
	query AgentsCatalog($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				...CatalogAgent
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Live counts next to the category and pricing options (D-43). Public, no page or sort. */
export const ProductFacetsQuery = graphql(`
	query ProductFacets($input: PIsearch!) {
		getProductFacets(input: $input) {
			categories {
				value
				count
			}
			pricing {
				value
				count
			}
		}
	}
`);
