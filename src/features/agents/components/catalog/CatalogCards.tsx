import NextLink from 'next/link';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { CatalogAgentFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { enterSx, focusRingSx } from '@/shared/ui/catalog';
import { colors, fonts, home, radiusPx } from '@/theme/tokens';
import { agentHref } from '../AgentCard';
import { CardLikeButton } from './CardLikeButton';

/** Re-exported for the agent cards' callers; the animation lives with the shared catalog parts. */
export { enterSx };

/** The title link covers the whole card (one link per card); the like button sits above it. */
const stretchedLinkSx = {
	color: 'inherit',
	textDecoration: 'none',
	'&::after': { content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit' },
	'&:focus-visible': { outline: 'none' },
	'&:focus-visible::after': focusRingSx,
} as const;

/** "$49 / mo", "$1,000", "Custom" or "Free" (green). */
const Price = ({ agent }: { agent: CatalogAgentFragment }) => {
	const { t } = useTranslation('common');
	const format = useFormat();
	const { productPricing: pricing, productPrice: price } = agent;
	if (pricing === 'FREE') {
		return (
			<Box component="span" sx={{ fontSize: 18, fontWeight: 800, color: 'success.main' }}>
				{t('common:price.free')}
			</Box>
		);
	}
	if (pricing === 'CUSTOM' || price == null) {
		return (
			<Box component="span" sx={{ fontSize: 18, fontWeight: 800, color: 'ink' }}>
				{t('common:price.custom')}
			</Box>
		);
	}
	return (
		<Box component="span" sx={{ fontSize: 18, fontWeight: 800, color: 'ink', whiteSpace: 'nowrap' }}>
			{format.price(price)}
			{pricing === 'SUBSCRIPTION' && (
				<Box component="span" sx={{ fontSize: 13, fontWeight: 500, color: 'muted' }}>
					{' '}
					{t('common:price.perMonth')}
				</Box>
			)}
		</Box>
	);
};

const CategoryPill = ({ agent }: { agent: CatalogAgentFragment }) => {
	const { t } = useTranslation('common');
	return (
		<Box
			component="span"
			sx={{ px: 2.5, py: 1, borderRadius: radiusPx.pill, bgcolor: 'neutralSoft', fontSize: 12, fontWeight: 600, color: 'body', whiteSpace: 'nowrap' }}
		>
			{t(`common:enums.AgentCategory.${agent.productCategory}`)}
		</Box>
	);
};

/** "by @nova · 3 views" */
const Byline = ({ agent }: { agent: CatalogAgentFragment }) => {
	const { t } = useTranslation('agents');
	const format = useFormat();
	const views = t('agents:card.views', { count: agent.productViews, formatted: format.compact(agent.productViews) });
	return (
		<Box component="span" sx={{ fontSize: 13, color: 'muted' }}>
			{agent.memberData ? `${t('agents:card.by', { nick: agent.memberData.memberNick })} · ${views}` : views}
		</Box>
	);
};

/** Looks like a button; the whole card is the link, so this is only a visual cue. */
const OpenCue = () => {
	const { t } = useTranslation('agents');
	return (
		<Box
			component="span"
			aria-hidden="true"
			sx={{
				flex: 'none',
				minHeight: 40,
				display: 'inline-flex',
				alignItems: 'center',
				px: 3.5,
				borderRadius: '10px',
				bgcolor: home.footer,
				color: colors.white,
				fontSize: 14,
				fontWeight: 700,
			}}
		>
			{t('agents:catalog.open')}
		</Box>
	);
};

const descriptionSx = (lines: number) =>
	({
		fontSize: 14,
		lineHeight: 1.5,
		color: 'bodySoft',
		display: '-webkit-box',
		WebkitLineClamp: lines,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	}) as const;

type CardProps = { agent: CatalogAgentFragment; index: number; likesReady: boolean };

/** Grid card: a 176px cover (the agent's screenshot, or its category tint), then category, name, price. */
export const CatalogCard = ({ agent, index, likesReady }: CardProps) => {
	const { t } = useTranslation('agents');
	const [tint, ink] = categoryTint(agent.productCategory);
	const src = mediaUrl(agent.productImages[0]);

	return (
		<Box
			component="article"
			sx={{
				position: 'relative',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: home.radius.card,
				overflow: 'hidden',
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				transition: 'box-shadow 200ms, border-color 200ms',
				'&:hover': { borderColor: 'accentBorder', boxShadow: home.topShadow },
				...enterSx(index),
			}}
		>
			<Box sx={{ position: 'relative', height: 176, bgcolor: tint, color: ink, display: 'grid', placeItems: 'center' }}>
				{src ? (
					<Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" style={{ objectFit: 'cover' }} />
				) : (
					<Box aria-hidden="true" sx={{ display: 'flex', opacity: 0.35 }}>
						<CategoryIcon category={agent.productCategory} size={64} />
					</Box>
				)}
				<Box
					aria-hidden="true"
					sx={{ position: 'absolute', top: 16, left: 16, width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: '12px', bgcolor: 'surface', color: ink }}
				>
					<CategoryIcon category={agent.productCategory} size={21} />
				</Box>
				<Box sx={{ position: 'absolute', top: 14, right: 14 }}>
					<CardLikeButton agent={agent} ready={likesReady} />
				</Box>
			</Box>
			<Box sx={{ flex: '1 1 auto', pt: 4.5, px: 5, pb: 5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<CategoryPill agent={agent} />
					<Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'muted' }}>
						{t(`agents:toolbar.pricing.${agent.productPricing}`)}
					</Box>
				</Box>
				<Typography
					variant="h2"
					sx={{ fontSize: 22, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}
				>
					<Box component={NextLink} href={agentHref(agent._id)} sx={stretchedLinkSx}>
						{agent.productTitle}
					</Box>
				</Typography>
				<Typography sx={descriptionSx(2)}>{agent.productDesc}</Typography>
				<Box
					sx={{
						mt: 'auto',
						pt: 3,
						borderTop: 1,
						borderColor: 'borderSoft',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
						<Price agent={agent} />
						<Byline agent={agent} />
					</Box>
					<OpenCue />
				</Box>
			</Box>
		</Box>
	);
};

/** List row: icon tile, name + category, description, byline, like, price, open. Wraps on phones. */
export const CatalogRow = ({ agent, index, likesReady }: CardProps) => {
	const { t } = useTranslation('agents');
	const [tint, ink] = categoryTint(agent.productCategory);

	return (
		<Box
			component="article"
			sx={{
				position: 'relative',
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				columnGap: 5,
				rowGap: 4,
				px: 5,
				py: 4.5,
				borderRadius: '18px',
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				transition: 'border-color 200ms',
				'&:hover': { borderColor: 'accentBorder' },
				...enterSx(index),
			}}
		>
			<Box
				aria-hidden="true"
				sx={{ flex: 'none', width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: '15px', bgcolor: tint, color: ink }}
			>
				<CategoryIcon category={agent.productCategory} size={24} />
			</Box>
			<Box sx={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
					<Typography
						variant="h2"
						sx={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', overflowWrap: 'anywhere' }}
					>
						<Box component={NextLink} href={agentHref(agent._id)} sx={stretchedLinkSx}>
							{agent.productTitle}
						</Box>
					</Typography>
					<CategoryPill agent={agent} />
				</Box>
				<Typography sx={descriptionSx(1)}>{agent.productDesc}</Typography>
				<Byline agent={agent} />
			</Box>
			<CardLikeButton agent={agent} ready={likesReady} variant="outlined" />
			<Box sx={{ flex: '0 0 120px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
				<Price agent={agent} />
				<Box component="span" sx={{ fontSize: 12, color: 'muted' }}>
					{t(`agents:toolbar.pricing.${agent.productPricing}`)}
				</Box>
			</Box>
			<OpenCue />
		</Box>
	);
};
