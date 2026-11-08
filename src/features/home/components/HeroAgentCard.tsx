import { forwardRef, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import {
	BarChartOutlined as BarChartOutlinedIcon,
	CampaignOutlined as CampaignOutlinedIcon,
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	DescriptionOutlined as DescriptionOutlinedIcon,
	EventAvailableOutlined as EventAvailableOutlinedIcon,
	MailOutline as MailOutlineIcon,
	PeopleOutline as PeopleOutlineIcon,
	SendOutlined as SendOutlinedIcon,
	ShoppingCartOutlined as ShoppingCartOutlinedIcon,
	TrackChangesOutlined as TrackChangesOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { hero, radiusPx } from '@/theme/tokens';
import type { ArcGeometry } from '../lib/arc';
import type { HeroAgent, HeroAgentIcon } from '../lib/heroAgents';

const iconSx = { fontSize: 22 } as const;

const ICONS: Record<HeroAgentIcon, ReactNode> = {
	chat: <ChatBubbleOutlineIcon sx={iconSx} />,
	megaphone: <CampaignOutlinedIcon sx={iconSx} />,
	invoice: <DescriptionOutlinedIcon sx={iconSx} />,
	target: <TrackChangesOutlinedIcon sx={iconSx} />,
	mail: <MailOutlineIcon sx={iconSx} />,
	cart: <ShoppingCartOutlinedIcon sx={iconSx} />,
	calendar: <EventAvailableOutlinedIcon sx={iconSx} />,
	people: <PeopleOutlineIcon sx={iconSx} />,
	send: <SendOutlinedIcon sx={iconSx} />,
	chart: <BarChartOutlinedIcon sx={iconSx} />,
};

/** "Running" dot: a ring that grows and fades every 1.8s. */
const pulse = keyframes`
	0% { box-shadow: 0 0 0 0 ${hero.livePulse}; }
	70% { box-shadow: 0 0 0 7px ${hero.livePulseEnd}; }
	100% { box-shadow: 0 0 0 0 ${hero.livePulseEnd}; }
`;

type HeroAgentCardProps = {
	agent: HeroAgent;
	geometry: ArcGeometry;
	/** First transform (offset 0), so the server HTML already shows the arc; useArcRotation takes over. */
	initialTransform: string;
};

/** One example card on the hero arc. Presentational: position and turning come from AgentCarousel. */
export const HeroAgentCard = forwardRef<HTMLElement, HeroAgentCardProps>(({ agent, geometry, initialTransform }, ref) => {
	const { t } = useTranslation('home');
	const [tintBg, tintInk] = hero.tints[agent.tint];
	const text = (field: string) => t(`home:hero.cards.${agent.key}.${field}`);
	const compact = geometry.card.width < 240;

	return (
		<Box
			ref={ref}
			component="article"
			aria-label={text('name')}
			style={{ transform: initialTransform }}
			sx={{
				position: 'absolute',
				left: '50%',
				top: geometry.top,
				width: geometry.card.width,
				height: geometry.card.height,
				ml: `${-geometry.card.width / 2}px`,
				transformOrigin: '50% 50%',
				willChange: 'transform',
				boxSizing: 'border-box',
				p: compact ? 4 : 5,
				display: 'flex',
				flexDirection: 'column',
				gap: compact ? 3 : 3.5,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: hero.cardRadius,
				boxShadow: hero.cardShadow,
				textAlign: 'left',
			}}
		>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
				<Box
					aria-hidden="true"
					sx={{
						display: 'grid',
						placeItems: 'center',
						width: 44,
						height: 44,
						flex: 'none',
						borderRadius: radiusPx.lg,
						bgcolor: tintBg,
						color: tintInk,
					}}
				>
					{ICONS[agent.icon]}
				</Box>
				<Box
					component="span"
					sx={{
						px: 2.5,
						py: 1.25,
						borderRadius: radiusPx.pill,
						bgcolor: 'neutralSoft',
						fontSize: 12,
						fontWeight: 600,
						color: 'body',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{text('category')}
				</Box>
			</Box>
			<Box>
				<Typography component="h3" sx={{ fontSize: compact ? 16 : 18, fontWeight: 700, letterSpacing: '-0.01em', color: 'ink' }}>
					{text('name')}
				</Typography>
				<Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.75, fontSize: 13 }}>
					<Box
						component="span"
						aria-hidden="true"
						sx={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							bgcolor: hero.liveDot,
							animation: `${pulse} 1.8s ease-out infinite`,
							'@media (prefers-reduced-motion: reduce)': { animation: 'none' },
						}}
					/>
					<Box component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
						{t('home:hero.running')}
					</Box>
					<Box component="span" sx={{ color: 'muted' }}>
						· {t('home:hero.example')}
					</Box>
				</Box>
			</Box>
			<Typography
				sx={{
					flex: '1 1 auto',
					p: 3,
					borderRadius: radiusPx.lg,
					bgcolor: hero.cardOutput,
					border: 1,
					borderColor: hero.cardOutputBorder,
					fontSize: compact ? 13 : 14,
					lineHeight: 1.45,
					color: 'ink',
				}}
			>
				{text('output')}
			</Typography>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'baseline',
					justifyContent: 'space-between',
					gap: 2,
					pt: 3,
					borderTop: 1,
					borderColor: 'borderSoft',
				}}
			>
				<Box component="span" sx={{ fontSize: 13, color: 'bodySoft' }}>
					{text('metricLabel')}
				</Box>
				<Box component="span" sx={{ fontSize: 15, fontWeight: 800, color: 'primary.main', textAlign: 'right' }}>
					{text('metricValue')}
				</Box>
			</Box>
		</Box>
	);
});

HeroAgentCard.displayName = 'HeroAgentCard';
