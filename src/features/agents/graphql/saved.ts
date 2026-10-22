import { graphql } from '@/gql';

/** Liked agents of the signed-in member; only ACTIVE ones come back (D-16). Name keeps the API's spelling. */
export const FavoriteAgentsQuery = graphql(`
	query FavoriteAgents($input: OrdinaryInquiry!) {
		getFavorities(input: $input) {
			list {
				...AgentCard
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Agents the signed-in member opened recently; only ACTIVE ones (D-16). */
export const VisitedAgentsQuery = graphql(`
	query VisitedAgents($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				...AgentCard
			}
			metaCounter {
				total
			}
		}
	}
`);
