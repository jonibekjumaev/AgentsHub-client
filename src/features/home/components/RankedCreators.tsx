import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { CreatorsListQuery } from '@/features/creators';
import { FollowButton } from '@/features/follows';
import type { CreatorCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { home } from '@/theme/tokens';
import { useInView } from '../hooks/useInView';
import { topCreatorsVariables } from '../lib/home';
import { SectionTitle, displaySx, focusRingSx, grid3Sx, outlineButtonSx, revealSx } from './kit';

/** Rank badge colors: #1 indigo, #2 grey, #3 amber, the rest light grey. */
export const medalColors = (position: number) => home.medals[position - 1] ?? home.medalOther;

const Stat = ({ value, label }: { value: string; label: string }) => (
	<span>
		<Box component="b" sx={{ color: 'ink', fontWeight: 700 }}>
			{value}
		</Box>{' '}
		{label}
	</span>
);

const RankedCreatorCard = ({ creator, position, inView }: { creator: CreatorCardFragment; position: number; inView: boolean }) => {
	const { t } = useTranslation('home');
	const format = useFormat();
	const name = creator.memberFullName || creator.memberNick;
	const [medalBg, medalFg] = medalColors(position);
	const first = position === 1;

	return (
		<Box
			component="li"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				p: 6,
				borderRadius: home.radius.card,
				bgcolor: first ? home.topCreatorBg : 'surface',
				border: 1,
				borderColor: first ? home.topBorder : 'border',
				...revealSx(inView, position - 1),
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 3.5 }}>
				<Box sx={{ position: 'relative', flex: 'none' }}>
					<Avatar memberId={creator._id} name={name} image={creator.memberImage} size={56} radius={16} />
					<Box
						component="span"
						aria-label={t('home:creators.position', { position })}
						sx={{
							position: 'absolute',
							right: -6,
							bottom: -6,
							minWidth: 24,
							height: 24,
							px: 1.25,
							boxSizing: 'border-box',
							display: 'grid',
							placeItems: 'center',
							borderRadius: '999px',
							bgcolor: medalBg,
							color: medalFg,
							border: '2px solid',
							borderColor: 'surface',
							fontSize: 12,
							fontWeight: 800,
						}}
					>
						{position}
					</Box>
				</Box>
				<Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
					<Typography variant="h3" sx={{ fontSize: 21, lineHeight: 1.1, ...displaySx, letterSpacing: '-0.015em', overflowWrap: 'anywhere' }}>
						<Box component={NextLink} href={`/members/${creator._id}`} sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' }, ...focusRingSx }}>
							{name}
						</Box>
					</Typography>
					<Typography component="span" sx={{ fontSize: 14, color: 'muted' }}>
						@{creator.memberNick}
					</Typography>
				</Box>
			</Box>
			{creator.memberDesc && (
				<Typography
					sx={{
						fontSize: 15,
						lineHeight: 1.5,
						color: 'bodySoft',
						whiteSpace: 'pre-line',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}
				>
					{creator.memberDesc}
				</Typography>
			)}
			<Box
				sx={{
					mt: 'auto',
					pt: 3.5,
					borderTop: 1,
					borderColor: 'borderSoft',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 3,
				}}
			>
				<Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 4, rowGap: 1, fontSize: 14, color: 'bodySoft' }}>
					<Stat value={format.compact(creator.memberProducts)} label={t('home:creators.agents', { count: creator.memberProducts })} />
					<Stat value={format.compact(creator.memberFollowers)} label={t('home:creators.followers', { count: creator.memberFollowers })} />
					<Stat value={format.compact(creator.memberLikes)} label={t('home:creators.likes', { count: creator.memberLikes })} />
				</Box>
				<FollowButton memberId={creator._id} nick={creator.memberNick} size="small" />
			</Box>
		</Box>
	);
};

/** "Top Creators": the six top-ranked creators. Nothing to show → the block is left out. */
export const RankedCreators = () => {
	const { t } = useTranslation('home');
	const { data } = useQuery(CreatorsListQuery, { variables: topCreatorsVariables() });
	const { ref, inView } = useInView<HTMLOListElement>();
	const creators = data?.getCreators.list ?? [];
	if (creators.length === 0) return null;

	return (
		<Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5 }}>
				<Box sx={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 3 }}>
					<SectionTitle id="home-creators" sx={{ fontSize: 'clamp(28px, 3.2vw, 42px)' }}>
						{t('home:creators.title')}
					</SectionTitle>
					<Typography sx={{ fontSize: 17, lineHeight: 1.55, color: 'bodySoft' }}>{t('home:creators.text')}</Typography>
				</Box>
				<Button component={NextLink} href="/creators" variant="outlined" sx={{ ...outlineButtonSx, ...focusRingSx }}>
					{t('home:creators.all')}
				</Button>
			</Box>
			<Box ref={ref} component="ol" aria-labelledby="home-creators" sx={grid3Sx}>
				{creators.map((creator, index) => (
					<RankedCreatorCard key={creator._id} creator={creator} position={index + 1} inView={inView} />
				))}
			</Box>
		</Box>
	);
};
