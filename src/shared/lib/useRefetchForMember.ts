import { useEffect, useRef } from 'react';

/**
 * A server-rendered list is fetched without a token, so its member-only fields (meLiked, meFollowed, the
 * "Following" count) are empty. When the visitor turns out to be a signed-in member, ask once more with the
 * token. Later filters miss the cache and are fetched in the browser, with the token.
 *
 * Use it with the default cache-first policy, not cache-and-network: on the catalog pages cache-and-network
 * re-requested the old and the new filters in turn, without end, after a shallow route change.
 */
export const useRefetchForMember = (member: boolean, refetch: () => Promise<unknown>) => {
	const done = useRef(false);
	useEffect(() => {
		if (!member || done.current) return;
		done.current = true;
		void refetch();
	}, [member, refetch]);
};
