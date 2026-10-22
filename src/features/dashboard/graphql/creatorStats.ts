import { graphql } from '@/gql';

/**
 * The creator's own counters, straight from the API (no derived numbers):
 * memberProducts = ACTIVE + PAUSED agents (D-16); memberViews / memberLikes = views and likes of the
 * creator's *profile*, not of their agents; memberFollowers = followers.
 */
export const CreatorStatsQuery = graphql(`
	query CreatorStats {
		getMe {
			_id
			memberProducts
			memberViews
			memberLikes
			memberFollowers
		}
	}
`);
