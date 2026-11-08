import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { ButtonBase } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { CatalogAgentFragment, LikeAgentMutation as LikeAgentResult } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { useFormat } from '@/shared/lib/format';
import { useToast } from '@/shared/ui/toast';
import { catalog, home, radiusPx } from '@/theme/tokens';
import { LikeAgentMutation } from '../../graphql/agentDetail';
import { isLiked } from '../../hooks/useAgentViewer';

type CardLikeButtonProps = {
	agent: CatalogAgentFragment;
	/** false while the signed-in list is still loading: meLiked from the server render is not this member's. */
	ready: boolean;
	/** pill: on the cover (white, no border). outlined: in a list row. */
	variant?: 'pill' | 'outlined';
};

/**
 * The like toggle on a catalog card, separate from the card link. Same rules as the detail page:
 * a guest goes to login and comes back; the owner can't like their own agent (D-22); a member gets an
 * optimistic update that Apollo rolls back on error (then a toast).
 */
export const CardLikeButton = ({ agent, ready, variant = 'pill' }: CardLikeButtonProps) => {
	const { t } = useTranslation(['agents', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const format = useFormat();
	const { status, me } = useAuth();
	const [like, { loading: pending }] = useMutation(LikeAgentMutation);

	const member = status === 'member' && me?.memberStatus === 'ACTIVE' ? me : null;
	const isOwner = Boolean(member && agent.memberData?._id === member._id);
	const liked = Boolean(member) && isLiked(agent.meLiked);
	const inactive = status === 'loading' || (member !== null && !ready) || pending || isOwner;
	const likes = agent.productLikes;

	const onClick = async () => {
		if (status === 'guest' || (status === 'member' && !member)) {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		if (inactive || !member) return;

		const next = !liked;
		try {
			await like({
				variables: { productId: agent._id },
				optimisticResponse: {
					likeTargetProduct: {
						__typename: 'Product',
						_id: agent._id,
						productLikes: Math.max(0, likes + (next ? 1 : -1)),
					} as LikeAgentResult['likeTargetProduct'],
				},
				// The response has no meLiked: write it ourselves. Skipped on error, so it rolls back.
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'Product', _id: agent._id }),
						fields: {
							meLiked: () =>
								next ? [{ __typename: 'MeLiked', memberId: member._id, likeRefId: agent._id, myFavorite: true }] : [],
						},
					});
				},
			});
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	return (
		<ButtonBase
			aria-pressed={liked}
			aria-disabled={inactive || undefined}
			aria-label={t(liked ? 'agents:catalog.unlike' : 'agents:catalog.like', {
				title: agent.productTitle,
				count: likes,
			})}
			title={isOwner ? t('agents:detail.like.own') : undefined}
			onClick={() => void onClick()}
			sx={{
				position: 'relative',
				zIndex: 1,
				minHeight: variant === 'pill' ? 36 : 40,
				display: 'inline-flex',
				alignItems: 'center',
				gap: 1.5,
				px: 3,
				borderRadius: radiusPx.pill,
				bgcolor: 'surface',
				border: variant === 'outlined' ? 1 : 0,
				borderColor: 'border',
				color: liked ? catalog.heart : 'body',
				fontSize: 13,
				fontWeight: 700,
				...(inactive && { cursor: 'not-allowed', opacity: isOwner ? 0.7 : 1 }),
				'&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
			}}
		>
			{liked ? <FavoriteIcon aria-hidden="true" sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon aria-hidden="true" sx={{ fontSize: 16 }} />}
			{format.compact(likes)}
		</ButtonBase>
	);
};
