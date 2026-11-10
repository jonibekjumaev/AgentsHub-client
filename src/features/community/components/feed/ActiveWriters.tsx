import NextLink from 'next/link';
import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { CommunityStatsQuery } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { focusVisibleSx } from '@/shared/ui/catalog';
import { home, rankMedals } from '@/theme/tokens';

type Writer = CommunityStatsQuery['getCommunityStats']['topWriters'][number];

const RANK_SIZE = 24;

/** 1–3 get the medal colors of /creators, the rest a plain number. */
const Rank = ({ rank }: { rank: number }) => {
	const medal = rank <= 3 ? rankMedals[rank as 1 | 2 | 3] : null;
	return (
		<Box
			component="span"
			aria-hidden="true"
			sx={{
				flex: 'none',
				width: RANK_SIZE,
				height: RANK_SIZE,
				display: 'grid',
				placeItems: 'center',
				borderRadius: '50%',
				bgcolor: medal?.bg ?? 'neutralSoft',
				color: medal?.text ?? 'bodySoft',
				fontSize: 12,
				fontWeight: 800,
			}}
		>
			{rank}
		</Box>
	);
};

/**
 * "Active writers" (D-46): the 5 most liked ACTIVE writers, best first, each linking to their profile with
 * their article and like counts. Skeleton while loading; hidden when nobody has written yet or on error.
 */
export const ActiveWriters = ({ writers, loading }: { writers: Writer[] | undefined; loading: boolean }) => {
	const { t } = useTranslation('community');
	const format = useFormat();
	if (!writers && !loading) return null;
	if (writers && writers.length === 0) return null;

	return (
		<Box
			component="section"
			aria-labelledby="active-writers"
			sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: home.radius.card }}
		>
			<Typography id="active-writers" variant="h2" sx={{ fontSize: 17 }}>
				{t('community:writers.title')}
			</Typography>
			{!writers ? (
				<Box role="status" aria-busy="true" aria-label={t('community:writers.loading')} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} variant="rounded" height={36} />
					))}
				</Box>
			) : (
				<Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
					{writers.map((writer, index) => {
						const member = writer.memberData;
						const name = member.memberFullName || member.memberNick;
						return (
							<Box component="li" key={member._id} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
								<Rank rank={index + 1} />
								<Avatar memberId={member._id} name={name} image={member.memberImage} size={36} />
								<Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
									<Box
										component={NextLink}
										href={`/members/${member._id}`}
										sx={{ fontSize: 14, fontWeight: 700, color: 'ink', textDecoration: 'none', overflowWrap: 'anywhere', '&:hover': { textDecoration: 'underline' }, ...focusVisibleSx }}
									>
										{name}
									</Box>
									<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
										{t('community:writers.articles', { count: writer.articles, formatted: format.number(writer.articles) })}
										{' · '}
										{t('community:likes', { count: writer.likes, formatted: format.compact(writer.likes) })}
									</Typography>
								</Box>
							</Box>
						);
					})}
				</Box>
			)}
		</Box>
	);
};
