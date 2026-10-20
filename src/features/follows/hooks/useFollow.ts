import { useState } from 'react';
import { useMutation, useQuery, type ApolloCache } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { MyFollowingIdsQuery, SubscribeMutation, UnsubscribeMutation } from '../graphql/follows';
import { myFollowingIdsVariables } from '../lib/follows';

/** The target's follower count and the viewer's following count move by one, wherever they are cached. */
const shiftCounts = (cache: ApolloCache<unknown>, targetId: string, viewerId: string, delta: 1 | -1) => {
	const bump = (value: number) => Math.max(0, (value ?? 0) + delta);
	cache.modify({ id: cache.identify({ __typename: 'Member', _id: targetId }), fields: { memberFollowers: bump } });
	cache.modify({ id: cache.identify({ __typename: 'Member', _id: viewerId }), fields: { memberFollowings: bump } });
};

/**
 * Follow state and toggle for one member. `known` overrides the id list when the page has a better
 * answer (a profile's meFollowed). Guests are sent to login and back.
 * The server confirms first (no optimistic flip): the follow can be refused (self, blocked, gone).
 */
export const useFollow = (targetId: string, known?: boolean | null) => {
	const { t } = useTranslation(['follows', 'errors']);
	const { status, me } = useAuth();
	const router = useRouter();
	const toast = useToast();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const ids = useQuery(MyFollowingIdsQuery, {
		variables: myFollowingIdsVariables(me?._id ?? ''),
		skip: !isMember || !me,
	});
	const refetchQueries = [MyFollowingIdsQuery];
	const [subscribe, subscribeState] = useMutation(SubscribeMutation, { refetchQueries, awaitRefetchQueries: true });
	const [unsubscribe, unsubscribeState] = useMutation(UnsubscribeMutation, { refetchQueries, awaitRefetchQueries: true });

	/** The answer of this button's own last toggle; wins over `known`, which the page may not refetch. */
	const [local, setLocal] = useState<boolean | null>(null);
	const fromList = ids.data?.getMemberFollowings.list.some((item) => item.followingId === targetId) ?? false;
	const following = local ?? known ?? fromList;
	const isSelf = Boolean(me && me._id === targetId);
	const pending = status === 'loading' || (isMember && !ids.data && known == null);
	const loading = subscribeState.loading || unsubscribeState.loading;

	const toggle = async (nick: string) => {
		if (status !== 'member' || !me) {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		if (isSelf || loading) return;
		try {
			if (following) {
				await unsubscribe({ variables: { memberId: targetId }, update: (cache) => shiftCounts(cache, targetId, me._id, -1) });
				setLocal(false);
				toast.success(t('follows:unfollowed', { nick }));
			} else {
				await subscribe({ variables: { memberId: targetId }, update: (cache) => shiftCounts(cache, targetId, me._id, 1) });
				setLocal(true);
				toast.success(t('follows:followed', { nick }));
			}
		} catch (error) {
			// NOT_FOUND on unfollow: already not following (another tab) — the refetched list shows the truth.
			const key = getErrorCode(error) === ErrorCode.NotFound ? 'follows:errors.changed' : toErrorKey(error);
			toast.error(t(key));
			setLocal(null);
			void ids.refetch();
		}
	};

	return { following, isSelf, pending, loading, toggle, isGuest: status === 'guest' };
};
