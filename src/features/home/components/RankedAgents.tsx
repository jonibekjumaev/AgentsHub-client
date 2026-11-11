import { useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { Box, Button, ButtonBase, Skeleton, Typography } from '@mui/material';
import { FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { AgentsListQuery, agentHref, agentsHref, parseAgentFilters } from '@/features/agents';
import type { AgentCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { ErrorState } from '@/shared/ui/ErrorState';
import { PriceTag } from '@/shared/ui/PriceTag';
import { colors, home } from '@/theme/tokens';
import { useInView } from '../hooks/useInView';
import { HOME_AGENT_TABS, homeAgentsVariables, type HomeAgentTab } from '../lib/home';
import { CategoryIcon, SectionTitle, categoryTint, displaySx, focusRingSx, frameSx, grid3Sx, outlineButtonSx, revealSx } from './kit';

type CardProps = { agent: AgentCardFragment; position: number; inView: boolean };

/**
 * One agent: its cover image, price, name, creator, likes, views. Without an image the cover is plain white, like
 * the rest of the card: no category tint, icon or color (only the neutral position chip).
 */
const RankedAgentCard = ({ agent, position, inView }: CardProps) => {
	const { t } = useTranslation(['home', 'common']);
	const format = useFormat();
	const [tint, ink] = categoryTint(agent.productCategory);
	const src = mediaUrl(agent.productImages[0]);
	const first = position === 1;

	return (
		<Box
			component="li"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				borderRadius: home.radius.card,
				overflow: 'hidden',
				bgcolor: 'surface',
				border: 1,
				borderColor: first ? home.topBorder : 'border',
				boxShadow: first ? home.topShadow : home.cardShadow,
				...revealSx(inView, position - 1),
			}}
		>
			<Box
				sx={{
					position: 'relative',
					height: 196,
					bgcolor: src ? tint : 'surface',
					...(!src && { borderBottom: 1, borderColor: 'border' }),
				}}
			>
				{src && (
					<>
						<Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" style={{ objectFit: 'cover' }} />
						<Box
							aria-hidden="true"
							sx={{
								position: 'absolute',
								top: 18,
								left: 18,
								width: 44,
								height: 44,
								display: 'grid',
								placeItems: 'center',
								borderRadius: '13px',
								bgcolor: 'surface',
								color: ink,
								boxShadow: home.cardShadow,
							}}
						>
							<CategoryIcon category={agent.productCategory} size={22} />
						</Box>
					</>
				)}
				{/* The position in this list, not the nightly score. */}
				<Box
					component="span"
					aria-label={t('home:agents.position', { position })}
					sx={{
						position: 'absolute',
						top: 14,
						right: 16,
						px: 2.5,
						py: 0.5,
						borderRadius: '999px',
						bgcolor: src ? home.rankChip : 'neutralSoft',
						...displaySx,
						fontWeight: 800,
						fontSize: 20,
						lineHeight: 1.1,
						letterSpacing: '-0.05em',
						color: src ? ink : 'body',
					}}
				>
					#{position}
				</Box>
			</Box>
			<Box sx={{ flex: '1 1 auto', p: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<Box component="span" sx={{ px: 2.5, py: 1, borderRadius: '999px', bgcolor: 'neutralSoft', fontSize: 13, fontWeight: 600, color: 'body' }}>
						{t(`common:enums.AgentCategory.${agent.productCategory}`)}
					</Box>
					<PriceTag pricing={agent.productPricing} price={agent.productPrice} />
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
					<Typography variant="h3" sx={{ fontSize: 23, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}>
						{agent.productTitle}
					</Typography>
					{agent.memberData && (
						<Typography component="span" sx={{ fontSize: 14, color: 'bodySoft' }}>
							{t('home:agents.by', { nick: agent.memberData.memberNick })}
						</Typography>
					)}
				</Box>
				<Box
					sx={{
						mt: 'auto',
						pt: 3.5,
						borderTop: 1,
						borderColor: 'borderSoft',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 2,
					}}
				>
					<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 3.5, fontSize: 14, color: 'bodySoft' }}>
						<Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
							<FavoriteBorderIcon aria-hidden="true" sx={{ fontSize: 16, color: home.heart }} />
							{t('home:agents.likes', { count: agent.productLikes, formatted: format.compact(agent.productLikes) })}
						</Box>
						<span>{t('home:agents.views', { count: agent.productViews, formatted: format.compact(agent.productViews) })}</span>
					</Box>
					<Button
						component={NextLink}
						href={agentHref(agent._id)}
						aria-label={t('home:agents.viewLabel', { title: agent.productTitle })}
						sx={{
							minHeight: 40,
							px: 3.5,
							bgcolor: home.topCreatorBg,
							border: 1,
							borderColor: 'accentBorder',
							color: 'primary.main',
							fontSize: 14,
							'&:hover': { bgcolor: 'accentSoft' },
							...focusRingSx,
						}}
					>
						{t('home:agents.view')}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

/** "Top Agents": three lists (top, newest, free), six cards each. */
export const RankedAgents = () => {
	const { t } = useTranslation('home');
	const [tab, setTab] = useState<HomeAgentTab>('top');
	// All three lists are in the build-time cache; switching only reads it.
	const { data, loading, error, refetch } = useQuery(AgentsListQuery, { variables: homeAgentsVariables(tab) });
	const { ref, inView } = useInView<HTMLDivElement>();
	const agents = data?.getProducts.list ?? [];

	const body = () => {
		if (loading && !data) {
			return (
				<Box role="status" aria-busy="true" aria-label={t('home:agents.loading')} sx={grid3Sx}>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} variant="rounded" height={400} aria-hidden="true" />
					))}
				</Box>
			);
		}
		if (error && !data) return <ErrorState error={error} title={t('home:agents.errorTitle')} onRetry={() => void refetch()} />;
		if (agents.length === 0) {
			return (
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 3,
						px: 6,
						py: 16,
						textAlign: 'center',
						bgcolor: 'surface',
						border: `1.5px dashed ${home.dashedBorder}`,
						borderRadius: home.radius.panel,
					}}
				>
					<Typography variant="h3" sx={{ fontSize: 28, fontWeight: 700 }}>
						{t('home:agents.emptyTitle')}
					</Typography>
					<Typography sx={{ maxWidth: 440, fontSize: 16, color: 'bodySoft' }}>{t('home:agents.emptyText')}</Typography>
					<Button component={NextLink} href="/signup" sx={{ mt: 2, minHeight: 46, px: 5.5, ...focusRingSx }}>
						{t('home:sellAgent')}
					</Button>
				</Box>
			);
		}
		// A new key per tab replays the entrance for the new list.
		return (
			<Box key={tab} component="ol" aria-label={t(`home:agents.tabs.${tab}`)} sx={grid3Sx}>
				{agents.map((agent, index) => (
					<RankedAgentCard key={agent._id} agent={agent} position={index + 1} inView={inView} />
				))}
			</Box>
		);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5 }}>
				<Box sx={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 3 }}>
					<SectionTitle id="home-agents">{t('home:agents.title')}</SectionTitle>
					<Typography sx={{ fontSize: 17, lineHeight: 1.55, color: 'bodySoft' }}>{t('home:agents.text')}</Typography>
				</Box>
				<Box
					role="tablist"
					aria-label={t('home:agents.tabsLabel')}
					sx={{ display: 'flex', gap: 1, p: 1, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: '14px' }}
				>
					{HOME_AGENT_TABS.map((item) => {
						const selected = item === tab;
						return (
							<ButtonBase
								key={item}
								role="tab"
								id={`home-agents-tab-${item}`}
								aria-selected={selected}
								aria-controls="home-agents-panel"
								onClick={() => setTab(item)}
								sx={{
									minHeight: 42,
									px: 4.5,
									borderRadius: '10px',
									bgcolor: selected ? home.footer : 'transparent',
									color: selected ? colors.white : 'body',
									fontSize: 15,
									fontWeight: 600,
									transition: 'background-color 200ms, color 200ms',
									...focusRingSx,
								}}
							>
								{t(`home:agents.tabs.${item}`)}
							</ButtonBase>
						);
					})}
				</Box>
			</Box>
			<Box ref={ref} role="tabpanel" id="home-agents-panel" aria-labelledby={`home-agents-tab-${tab}`}>
				{body()}
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<Button
					component={NextLink}
					href={agentsHref({ ...parseAgentFilters({}), sort: 'rank' })}
					variant="outlined"
					sx={{ ...outlineButtonSx, minHeight: 48, px: 6, fontSize: 16, ...focusRingSx }}
				>
					{t('home:agents.all')}
				</Button>
			</Box>
		</Box>
	);
};
