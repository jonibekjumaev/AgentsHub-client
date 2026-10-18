import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Box, Button } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { LikeAgentMutation as LikeAgentResult } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { useFormat } from '@/shared/lib/format';
import { useToast } from '@/shared/ui/toast';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { radiusPx } from '@/theme/tokens';
import { LikeAgentMutation } from '../graphql/agentDetail';
import { isLiked, useAgentViewer } from '../hooks/useAgentViewer';

type TooltipComponent = typeof import('@mui/material/Tooltip').default;

/**
 * Tooltip brings Popper (~17 kB); only an owner ever sees it, and ownership is known only in the browser.
 * Loaded then, in its own chunk; until it arrives the same button renders without it (no flash).
 */
const useOwnerTooltip = (isOwner: boolean): TooltipComponent | null => {
	const [Tooltip, setTooltip] = useState<TooltipComponent | null>(null);
	useEffect(() => {
		if (!isOwner || Tooltip) return;
		let active = true;
		void import('@mui/material/Tooltip').then((mod) => {
			if (active) setTooltip(() => mod.default);
		});
		return () => {
			active = false;
		};
	}, [isOwner, Tooltip]);
	return isOwner ? Tooltip : null;
};

type LikeButtonProps = {
	agentId: string;
	creatorId: string | undefined;
	/** productLikes from the Product cache entity, the same one AgentCard reads. */
	likes: number;
};

/**
 * Like / unlike (FRONTEND_MIGRATION §3.9), a toggle button with aria-pressed.
 * - Guest: goes to login and comes back here; no mutation.
 * - Session or meLiked still unknown (SSR has no token): neutral and inactive, so it never flashes.
 * - Owner: the API rejects liking your own agent (D-22) — inactive, with a tooltip saying why.
 * - Member: optimistic toggle of meLiked + productLikes; Apollo rolls back on error, then a toast.
 *   Inactive while the request runs, so a double click can't send two toggles.
 * Inactive = aria-disabled (not `disabled`), so it keeps focus and the owner tooltip still opens.
 */
export const LikeButton = ({ agentId, creatorId, likes }: LikeButtonProps) => {
	const { t } = useTranslation(['agents', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const format = useFormat();
	const { viewer, data, me } = useAgentViewer(agentId);
	const [like, { loading: pending }] = useMutation(LikeAgentMutation);

	const isOwner = Boolean(me && creatorId && me._id === creatorId);
	const liked = viewer === 'member' && isLiked(data?.getProduct.meLiked);
	const inactive = viewer === 'pending' || pending || isOwner;
	const OwnerTooltip = useOwnerTooltip(isOwner);

	const onClick = async () => {
		if (viewer === 'guest') {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		if (inactive || !me) return;

		const next = !liked;
		try {
			await like({
				variables: { productId: agentId },
				optimisticResponse: {
					// Codegen types leave __typename out; the cache needs it to find Product:<id>.
					likeTargetProduct: {
						__typename: 'Product',
						_id: agentId,
						productLikes: Math.max(0, likes + (next ? 1 : -1)),
					} as LikeAgentResult['likeTargetProduct'],
				},
				// The response has no meLiked (see LikeAgentMutation): write the new state ourselves.
				// Runs for the optimistic layer and again for the real result; an error skips it, so it rolls back.
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'Product', _id: agentId }),
						fields: {
							meLiked: () => (next ? [{ __typename: 'MeLiked', memberId: me._id, likeRefId: agentId, myFavorite: true }] : []),
						},
					});
				},
			});
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	const button = (
		<Button
			variant="outlined"
			aria-pressed={liked}
			aria-disabled={inactive || undefined}
			aria-busy={pending || undefined}
			onClick={() => void onClick()}
			startIcon={liked ? <FavoriteIcon sx={{ color: 'primary.main' }} /> : <FavoriteBorderIcon />}
			sx={{
				flex: 1,
				height: 42,
				borderRadius: radiusPx.md,
				...(liked && { bgcolor: 'accentSoft', borderColor: 'accentBorder', color: 'primary.main' }),
				...(inactive && { opacity: 0.6, cursor: 'not-allowed' }),
			}}
		>
			{t('agents:detail.like.label')}
			<Box component="span" aria-hidden="true" sx={{ ml: 1.5, fontWeight: 600 }}>
				· {format.compact(likes)}
			</Box>
			<Box component="span" sx={visuallyHidden}>
				{`, ${t('agents:detail.likes', { count: likes, formatted: format.number(likes) })}`}
			</Box>
		</Button>
	);

	return OwnerTooltip ? (
		<OwnerTooltip title={t('agents:detail.like.own')} describeChild>
			{button}
		</OwnerTooltip>
	) : (
		button
	);
};
