import { graphql } from '@/gql';

/** One card of /creators (Creators.html). Public fields only. */
export const CreatorCardFragment = graphql(`
	fragment CreatorCard on Member {
		_id
		memberNick
		memberFullName
		memberImage
		memberDesc
		memberRank
		memberProducts
		memberFollowers
		memberLikes
	}
`);

/** /creators. Public, only ACTIVE creators (§3.2); `search` has `text` only (B16). */
export const CreatorsListQuery = graphql(`
	query CreatorsList($input: CreatorsInquiry!) {
		getCreators(input: $input) {
			list {
				...CreatorCard
			}
			metaCounter {
				total
			}
		}
	}
`);

/** One profile card of /creators (agentshub-creators design, D-45). Public fields, plus my follow when signed in. */
export const CatalogCreatorFragment = graphql(`
	fragment CatalogCreator on Member {
		_id
		memberNick
		memberFullName
		memberImage
		memberDesc
		memberRankPosition
		memberActiveProducts
		memberFollowers
		memberLikes
		memberCategories
		memberTopProducts {
			_id
			productTitle
			productCategory
			productPricing
			productPrice
		}
		meFollowed {
			followerId
			followingId
			myFollowing
		}
	}
`);

/**
 * /creators (D-45). SSR runs it without a token (meFollowed empty); a signed-in browser runs it again with the
 * token, so each Follow button starts right.
 */
export const CreatorsCatalogQuery = graphql(`
	query CreatorsCatalog($input: CreatorsInquiry!) {
		getCreators(input: $input) {
			list {
				...CatalogCreator
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Live counts next to the /creators filters (D-45). `following` needs the token. */
export const CreatorFacetsQuery = graphql(`
	query CreatorFacets($input: CRISearch!) {
		getCreatorFacets(input: $input) {
			categories {
				value
				count
			}
			all
			withoutAgents
			following
		}
	}
`);

/** The /creators hero line: "N creators, M agents listed" and 5 faces (D-45). Public, site-wide. */
export const CreatorsHeroStatsQuery = graphql(`
	query CreatorsHeroStats {
		getCreatorStats {
			creators
			agents
			faces {
				_id
				memberNick
				memberFullName
				memberImage
				memberCategories
			}
		}
	}
`);

/**
 * /members/[id] public data. SSR runs it without a token: no contacts, no view recorded.
 * ACTIVE and BLOCK members are readable; a deleted one is NOT_FOUND (§3.1).
 */
export const MemberProfileQuery = graphql(`
	query MemberProfile($memberId: String!) {
		getMember(memberId: $memberId) {
			_id
			memberType
			memberStatus
			memberNick
			memberFullName
			memberImage
			memberDesc
			memberRank
			memberProducts
			memberBriefs
			memberArticles
			memberFollowers
			memberFollowings
			memberLikes
			memberViews
			createdAt
		}
	}
`);

/**
 * Signed-in ACTIVE members only, in the browser: contacts (D-07/D-23), whether I follow this member,
 * and the recorded view (never my own, §3.9).
 */
export const MemberViewerQuery = graphql(`
	query MemberViewer($memberId: String!) {
		getMember(memberId: $memberId) {
			_id
			memberViews
			memberEmail
			memberWhatsapp
			meFollowed {
				followingId
				followerId
				myFollowing
			}
		}
	}
`);
