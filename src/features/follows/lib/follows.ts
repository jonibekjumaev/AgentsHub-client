/**
 * One page of "who I follow" is enough to light the Follow buttons: the API has no "is following"
 * batch query. Members following more than this see "Follow" on the rest until they open a profile,
 * where meFollowed decides (see the creators feature).
 */
export const MY_FOLLOWINGS_LIMIT = 100;
export const FOLLOW_PAGE_SIZE = 12;

export const myFollowingIdsVariables = (memberId: string) => ({
	input: { page: 1, limit: MY_FOLLOWINGS_LIMIT, search: { followerId: memberId } },
});

export const followersVariables = (memberId: string, page = 1) => ({
	input: { page, limit: FOLLOW_PAGE_SIZE, search: { followingId: memberId } },
});

export const followingsVariables = (memberId: string, page = 1) => ({
	input: { page, limit: FOLLOW_PAGE_SIZE, search: { followerId: memberId } },
});

/** BAD_REQUEST message for following yourself (matched, never shown). */
export const SELF_SUBSCRIPTION_MESSAGE = 'Self subscription is denied!';
