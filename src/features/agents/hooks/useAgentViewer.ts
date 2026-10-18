import { useQuery } from '@apollo/client';
import { useAuth } from '@/auth';
import { AgentViewerQuery } from '../graphql/agentDetail';

/**
 * The signed-in member's view of an agent: contacts, meLiked (and the recorded view).
 * Runs for ACTIVE members only; CreatorContacts and LikeButton share it, so it is one request.
 * `viewer` is 'pending' while the session or the query is still unknown.
 */
export const useAgentViewer = (agentId: string) => {
	const { status, me } = useAuth();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const query = useQuery(AgentViewerQuery, { variables: { productId: agentId }, skip: !isMember });

	let viewer: 'pending' | 'guest' | 'member';
	if (status === 'loading') viewer = 'pending';
	else if (!isMember) viewer = 'guest';
	else viewer = query.data ? 'member' : 'pending';

	return { ...query, me: isMember ? me : null, viewer };
};

/** meLiked is a list: one entry with myFavorite when this member liked the agent, [] otherwise. */
export const isLiked = (meLiked: readonly { myFavorite: boolean }[] | null | undefined): boolean =>
	Boolean(meLiked?.some((like) => like.myFavorite));
