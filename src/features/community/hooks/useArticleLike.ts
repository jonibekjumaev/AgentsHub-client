import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { LikeArticleMutation as LikeArticleResult } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { LikeArticleMutation } from '../graphql/articles';

type LikeTarget = { _id: string; articleLikes: number };

/**
 * Like / unlike one article from a list (§3.9): optimistic count and meLiked, rolled back by Apollo on error
 * with a toast. Guests (and members who can't act) go to login and come back to this page.
 */
export const useArticleLike = (article: LikeTarget, liked: boolean) => {
	const { t } = useTranslation('errors');
	const router = useRouter();
	const toast = useToast();
	const { status, me } = useAuth();
	const [like, { loading }] = useMutation(LikeArticleMutation);
	const canLike = status === 'member' && me?.memberStatus === 'ACTIVE';

	const toggle = async () => {
		if (status === 'loading' || loading) return;
		if (!canLike || !me) {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		const next = !liked;
		try {
			await like({
				variables: { articleId: article._id },
				optimisticResponse: {
					likeTargetBoardArticle: {
						__typename: 'BoardArticle',
						_id: article._id,
						articleLikes: Math.max(0, article.articleLikes + (next ? 1 : -1)),
					} as LikeArticleResult['likeTargetBoardArticle'],
				},
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'BoardArticle', _id: article._id }),
						fields: {
							meLiked: () => (next ? [{ __typename: 'MeLiked', memberId: me._id, likeRefId: article._id, myFavorite: true }] : []),
						},
					});
				},
			});
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	return { toggle, pending: loading || status === 'loading' };
};
