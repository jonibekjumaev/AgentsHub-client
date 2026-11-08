import { graphql } from '@/gql';

/**
 * The creator's own counters and profile fields, straight from the API (no derived numbers):
 * memberProducts = ACTIVE + PAUSED agents (D-16); memberViews / memberLikes = views and likes of the
 * creator's *profile*, not of their agents; memberFollowers / memberFollowings = follows.
 * The profile fields feed the "Next steps" checklist (getMe returns the own contacts, D-33).
 */
export const CreatorStatsQuery = graphql(`
	query CreatorStats {
		getMe {
			_id
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberWhatsapp
			memberEmail
			memberProducts
			memberArticles
			memberViews
			memberLikes
			memberFollowers
			memberFollowings
			createdAt
		}
	}
`);
