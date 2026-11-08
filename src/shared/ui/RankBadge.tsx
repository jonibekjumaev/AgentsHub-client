import { Box } from '@mui/material';
import { EmojiEventsOutlined as EmojiEventsOutlinedIcon } from '@mui/icons-material';
import { colors, radiusPx, rankMedals } from '@/theme/tokens';

/**
 * "#1" with a trophy for the top 3 in medal colors (gold, silver, bronze), "#7" in white for the rest. The place
 * comes from the nightly ranking (memberRankPosition), so it is the same whatever the list's sort. Nothing when
 * the creator is not ranked yet.
 */
export const RankBadge = ({ rank }: { rank: number | null | undefined }) => {
	if (!rank || rank < 1) return null;
	const medal = rank <= 3 ? rankMedals[rank as 1 | 2 | 3] : null;
	return (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 1.5,
				px: 2.75,
				py: 1.25,
				borderRadius: radiusPx.pill,
				bgcolor: medal ? medal.bg : colors.white,
				color: medal ? medal.text : 'bodySoft',
				fontSize: 13,
				fontWeight: 800,
				lineHeight: 1,
				whiteSpace: 'nowrap',
			}}
		>
			{medal && <EmojiEventsOutlinedIcon aria-hidden="true" sx={{ fontSize: 14 }} />}#{rank}
		</Box>
	);
};
