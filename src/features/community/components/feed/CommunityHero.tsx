import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { CommunityStatsQuery } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { CatalogBand, focusVisibleSx } from '@/shared/ui/catalog';
import { briefFeed, radiusPx } from '@/theme/tokens';
import type { CommunityChatState } from '../../hooks/useCommunityChat';
import { CHAT_SECTION_ID } from '../chat/CommunityChat';

/**
 * "● 12 online in the live chat", a link down to the chat (the /briefs live badge style). Shown only while the
 * socket is open; the count is every connection, guests too (D-46), so it says "online", not "members".
 */
const ChatBadge = ({ chat }: { chat: CommunityChatState }) => {
	const { t } = useTranslation('community');
	const format = useFormat();
	if (chat.status !== 'open' || chat.online === null) return null;
	return (
		<Box
			component="a"
			href={`#${CHAT_SECTION_ID}`}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				px: 3.5,
				py: 1.5,
				borderRadius: radiusPx.pill,
				bgcolor: briefFeed.liveBadge.bg,
				border: `1px solid ${briefFeed.liveBadge.border}`,
				fontSize: 14,
				fontWeight: 600,
				color: briefFeed.liveBadge.text,
				textDecoration: 'none',
				'&:hover': { textDecoration: 'underline' },
				...focusVisibleSx,
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					flex: 'none',
					width: 8,
					height: 8,
					borderRadius: '50%',
					bgcolor: briefFeed.liveBadge.dot,
					'@keyframes communityLive': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.35 } },
					animation: 'communityLive 1.6s ease-in-out infinite',
					'@media (prefers-reduced-motion: reduce)': { animation: 'none' },
				}}
			/>
			{t('community:hero.online', { count: chat.online, formatted: format.number(chat.online) })}
		</Box>
	);
};

type Stats = CommunityStatsQuery['getCommunityStats'];

/**
 * The /community band: the same dark band as /agents, /briefs and /creators, without the search. The live chat
 * badge, the headline and "{N} articles by {M} writers" (D-46). Writing starts from the sidebar card.
 */
export const CommunityHero = ({ stats, chat }: { stats: Stats | undefined; chat: CommunityChatState }) => {
	const { t } = useTranslation('community');
	const format = useFormat();
	const text =
		stats && stats.articles > 0
			? t('community:hero.textWithStats', {
					count: stats.articles,
					articles: format.number(stats.articles),
					writers: t('community:hero.writers', { count: stats.writers, formatted: format.number(stats.writers) }),
			  })
			: t('community:hero.text');

	return (
		<CatalogBand
			titleId="community-title"
			badge={<ChatBadge chat={chat} />}
			title={t('community:hero.title')}
			text={text}
		/>
	);
};
