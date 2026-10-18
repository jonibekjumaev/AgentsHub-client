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
