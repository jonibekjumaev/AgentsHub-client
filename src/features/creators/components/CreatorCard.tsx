import NextLink from 'next/link';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { FollowButton } from '@/features/follows';
import type { CreatorCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { radiusPx } from '@/theme/tokens';
import { memberHref } from '../lib/creatorsQuery';

/**
 * Position in the "Top ranked" list: #1–3 in warning colors, the rest neutral (DESIGN §3).
 * memberRank itself is a score, so the position comes from the list order (see CreatorsCatalog).
 */
export const RankBadge = ({ rank }: { rank: number | null | undefined }) => {
	const { t } = useTranslation('creators');
	if (!rank || rank < 1) return null;
	const top = rank <= 3;
	return (
		<Box
			component="span"
			sx={{
				px: 2,
				py: 0.25,
				borderRadius: radiusPx.pill,
				fontSize: 11,
				fontWeight: 800,
				bgcolor: top ? 'warningSoft' : 'neutralSoft',
				color: top ? 'warning.main' : 'bodySoft',
				whiteSpace: 'nowrap',
			}}
		>
			{t('creators:rank', { rank })}
		</Box>
	);
};

/** Creators.html card: avatar, name + position (top-ranked sort only), @nick, 2-line description, stats, Follow. */
export const CreatorCard = ({ creator, position }: { creator: CreatorCardFragment; position?: number }) => {
	const { t } = useTranslation('creators');
	const format = useFormat();
	const name = creator.memberFullName || creator.memberNick;

	return (
		<Box
			component="article"
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				gap: 3.5,
				p: 5,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
			}}
		>
			<Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0 }}>
				<Avatar memberId={creator._id} name={name} image={creator.memberImage} size={52} radius={14} />
				<Box sx={{ minWidth: 0 }}>
					<Stack direction="row" spacing={1.5} alignItems="center" useFlexGap flexWrap="wrap">
						<Typography component="h2" sx={{ fontSize: 16, fontWeight: 800, overflowWrap: 'anywhere' }}>
							<Link component={NextLink} href={memberHref(creator._id)} sx={{ color: 'ink' }}>
								{name}
							</Link>
						</Typography>
						<RankBadge rank={position} />
					</Stack>
					<Typography variant="meta">@{creator.memberNick}</Typography>
				</Box>
			</Stack>
			{creator.memberDesc && (
				<Typography
					variant="body2"
					sx={{
						color: 'bodySoft',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						overflowWrap: 'anywhere',
					}}
				>
					{creator.memberDesc}
				</Typography>
			)}
			<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
				<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" sx={{ fontSize: 13, color: 'muted', '& strong': { color: 'ink', fontWeight: 700 } }}>
					<span>
						<strong>{format.number(creator.memberProducts)}</strong> {t('creators:stats.agents', { count: creator.memberProducts })}
					</span>
					<span>
						<strong>{format.number(creator.memberFollowers)}</strong> {t('creators:stats.followers', { count: creator.memberFollowers })}
					</span>
					<span>
						<strong>{format.number(creator.memberLikes)}</strong> {t('creators:stats.likes', { count: creator.memberLikes })}
					</span>
				</Stack>
				<FollowButton memberId={creator._id} nick={creator.memberNick} size="small" />
			</Stack>
		</Box>
	);
};
