import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import {
	EmojiEmotionsOutlined as EmojiEmotionsOutlinedIcon,
	ForumOutlined as ForumOutlinedIcon,
	NewspaperOutlined as NewspaperOutlinedIcon,
	RecommendOutlined as RecommendOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { BoardArticleCategory } from '@/gql/enums';
import { colors, communityFeed, radiusPx } from '@/theme/tokens';

/** [tint, ink] of one topic. */
export const topicTint = (topic: BoardArticleCategory): readonly [string, string] => communityFeed.topics[topic];

const ICONS: Record<BoardArticleCategory, (size: number) => ReactNode> = {
	FREE: (size) => <ForumOutlinedIcon sx={{ fontSize: size }} />,
	RECOMMEND: (size) => <RecommendOutlinedIcon sx={{ fontSize: size }} />,
	NEWS: (size) => <NewspaperOutlinedIcon sx={{ fontSize: size }} />,
	HUMOR: (size) => <EmojiEmotionsOutlinedIcon sx={{ fontSize: size }} />,
};

/** The topic's icon, decorative (the topic name is always next to it or in the alt text). */
export const TopicIcon = ({ topic, size = 16 }: { topic: BoardArticleCategory; size?: number }) => (
	<Box component="span" aria-hidden="true" sx={{ display: 'inline-flex' }}>
		{ICONS[topic](size)}
	</Box>
);

/** Topic tint, a small white circle with the topic icon, then the name (as the /briefs category pill). */
export const TopicPill = ({ topic }: { topic: BoardArticleCategory }) => {
	const { t } = useTranslation('community');
	const [tint, ink] = topicTint(topic);
	return (
		<Box
			component="span"
			sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, py: 0.75, pl: 1, pr: 2.5, borderRadius: radiusPx.pill, bgcolor: tint, fontSize: 12, fontWeight: 700, color: 'ink' }}
		>
			<Box component="span" sx={{ width: 20, height: 20, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: colors.white, color: ink }}>
				<TopicIcon topic={topic} size={12} />
			</Box>
			{t(`community:categories.${topic}`)}
		</Box>
	);
};
