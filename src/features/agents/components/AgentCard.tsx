import Image from 'next/image';
import NextLink from 'next/link';
import { Box, Card, CardContent, Divider, Link, Stack, Typography } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon, SmartToyOutlined as SmartToyOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { AgentCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { CategoryChip } from '@/shared/ui/CategoryChip';
import { PriceTag } from '@/shared/ui/PriceTag';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';

export const agentHref = (agentId: string) => `/agents/${agentId}`;

type AgentCardProps = {
	agent: AgentCardFragment;
	/** Heading level of the title, to fit the page outline. */
	headingLevel?: 'h2' | 'h3';
};

/** 16:10 cover: the first uploaded image, or a placeholder icon on accentSoft. */
const Cover = ({ image }: { image: string | undefined }) => {
	const src = mediaUrl(image);
	return (
		<Box
			sx={{
				position: 'relative',
				aspectRatio: '16 / 10',
				bgcolor: 'accentSoft',
				color: 'primary.main',
				display: 'grid',
				placeItems: 'center',
				overflow: 'hidden',
			}}
		>
			{src ? (
				// Decorative: the title right below names the agent. Lazy by default; resized by next/image.
				<Image src={src} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 300px" style={{ objectFit: 'cover' }} />
			) : (
				<SmartToyOutlinedIcon aria-hidden="true" sx={{ fontSize: 40 }} />
			)}
		</Box>
	);
};

/**
 * DESIGN §3 AgentCard: cover, category chip, title (link), "by @nick", divider, PriceTag + likes/views.
 * The title link is stretched over the whole card, so the card is one tab stop and one click target.
 */
export const AgentCard = ({ agent, headingLevel = 'h2' }: AgentCardProps) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const nick = agent.memberData?.memberNick;

	return (
		<Card
			component="article"
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				transition: 'border-color 120ms',
				'&:hover': { borderColor: 'inputBorder' },
				'&:focus-within': { outline: 2, outlineColor: 'primary.main', outlineStyle: 'solid', outlineOffset: 2 },
			}}
		>
			<Cover image={agent.productImages[0]} />
			<CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, flex: 1, '&:last-child': { pb: 4 } }}>
				<Box>
					<CategoryChip category={agent.productCategory} />
				</Box>
				<Typography variant="h3" component={headingLevel} sx={{ overflowWrap: 'anywhere' }}>
					<Link
						component={NextLink}
						href={agentHref(agent._id)}
						underline="none"
						sx={{
							color: 'ink',
							fontWeight: 800,
							'&:hover': { color: 'primary.main' },
							'&:focus-visible': { outline: 'none' },
							// Stretched link: the whole card is clickable; the card draws the focus ring.
							'&::after': { content: '""', position: 'absolute', inset: 0 },
						}}
					>
						{agent.productTitle}
					</Link>
				</Typography>
				{nick && <Typography variant="meta">{t('agents:card.by', { nick })}</Typography>}
				<Divider sx={{ mt: 'auto' }} />
				<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
					<PriceTag pricing={agent.productPricing} price={agent.productPrice} />
					<Typography variant="caption" component="p" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
						<FavoriteBorderIcon aria-hidden="true" sx={{ fontSize: 14 }} />
						<span aria-hidden="true">{format.compact(agent.productLikes)}</span>
						<Box component="span" sx={visuallyHidden}>
							{t('agents:card.likes', { count: agent.productLikes })}
						</Box>
						<span aria-hidden="true">·</span>
						{t('agents:card.views', { count: agent.productViews, formatted: format.compact(agent.productViews) })}
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
};
