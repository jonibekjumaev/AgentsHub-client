import { useQuery } from '@apollo/client';
import { useAuth } from '@/auth';
import { BriefViewerQuery } from '../graphql/briefs';

/**
 * The signed-in member's view of a brief: the author's contacts (and the recorded view, §3.6).
 * Runs for ACTIVE members only, in the browser. `viewer` is 'pending' while the session or the
 * query is still unknown.
 */
export const useBriefViewer = (briefId: string) => {
	const { status, me } = useAuth();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const query = useQuery(BriefViewerQuery, { variables: { briefId }, skip: !isMember });

	let viewer: 'pending' | 'guest' | 'member';
	if (status === 'loading') viewer = 'pending';
	else if (!isMember) viewer = 'guest';
	else viewer = query.data ? 'member' : 'pending';

	return { ...query, me: isMember ? me : null, viewer };
};
