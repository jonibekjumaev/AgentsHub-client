import { graphql } from '@/gql';

/** A member in a followers / following list. Public fields only. */
export const FollowMemberFragment = graphql(`
	fragment FollowMember on Member {
		_id
		memberType
		memberNick
		memberFullName
		memberImage
		memberFollowers
	}
`);

/** Follow (FRONTEND_MIGRATION §3.9). Following yourself → BAD_REQUEST "Self subscription is denied!". */
export const SubscribeMutation = graphql(`
	mutation Subscribe($memberId: String!) {
		subscribe(input: $memberId) {
			_id
			followingId
			followerId
		}
	}
`);

/** Unfollow. Not following → NOT_FOUND. */
export const UnsubscribeMutation = graphql(`
	mutation Unsubscribe($memberId: String!) {
		unsubscribe(input: $memberId) {
			_id
			followingId
			followerId
		}
	}
`);

/**
 * Who the signed-in member follows: only the ids, to light up every Follow button on a page with one
 * request (creator cards, follow lists). Asked for in the browser with the token.
 */
export const MyFollowingIdsQuery = graphql(`
	query MyFollowingIds($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Who follows `followingId` (a profile's Followers tab). */
export const FollowersQuery = graphql(`
	query Followers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followerId
				followerData {
					...FollowMember
				}
			}
			metaCounter {
				total
			}
		}
	}
`);

/** Who `followerId` follows (a profile's Following tab). */
export const FollowingsQuery = graphql(`
	query Followings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followingData {
					...FollowMember
				}
			}
			metaCounter {
				total
			}
		}
	}
`);
