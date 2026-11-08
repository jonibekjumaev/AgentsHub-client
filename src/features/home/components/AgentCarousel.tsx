import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { keyframes, useTheme } from '@mui/material/styles';
import { PauseRounded as PauseRoundedIcon, PlayArrowRounded as PlayArrowRoundedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { hero, type HeroSignal } from '@/theme/tokens';
import { useArcRotation } from '../hooks/useArcRotation';
import { ARC_COMPACT, ARC_WIDE, OUTER_RING_TOP, arcCenterY, arcTransform, cardAngle, outerRingRadius, type ArcGeometry } from '../lib/arc';
import { HERO_AGENTS } from '../lib/heroAgents';
import { HeroAgentCard } from './HeroAgentCard';

/** A signal dot runs along the outer ring from −24° to 24°, fading in and out at the ends. */
const travel = keyframes`
	0% { transform: rotate(-24deg); opacity: 0; }
	12% { opacity: 1; }
	88% { opacity: 1; }
	100% { transform: rotate(24deg); opacity: 0; }
`;

const SIGNALS: { color: HeroSignal; duration: number; delay: number }[] = [
	{ color: 'indigo', duration: 9, delay: -2 },
	{ color: 'green', duration: 12, delay: -7 },
	{ color: 'amber', duration: 15, delay: -11 },
];

/** A circle of `radius`, centred on the track's middle, its top edge at `top`. */
const ringSx = (radius: number, top: number) =>
	({
		position: 'absolute',
		left: '50%',
		top,
		width: radius * 2,
		height: radius * 2,
		ml: `${-radius}px`,
		borderRadius: '50%',
		pointerEvents: 'none',
	}) as const;

const Orbit = ({ geometry }: { geometry: ArcGeometry }) => {
	const outer = outerRingRadius(geometry);
	return (
		<>
			{/* Dashed ring through the card centres. */}
			<Box aria-hidden="true" sx={{ ...ringSx(geometry.radius, arcCenterY(geometry)), border: '1.5px dashed', borderColor: hero.ringDashed }} />
			{/* Solid ring just above the cards, with the travelling signals. */}
			<Box aria-hidden="true" sx={{ ...ringSx(outer, OUTER_RING_TOP), border: 1, borderColor: hero.ringSolid }} />
			{SIGNALS.map(({ color, duration, delay }) => {
				const [dot, glow, trail, trailEnd] = hero.signals[color];
				return (
					<Box
						key={color}
						aria-hidden="true"
						sx={{
							...ringSx(outer, OUTER_RING_TOP),
							animation: `${travel} ${duration}s linear ${delay}s infinite`,
							'@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
						}}
					>
						<Box
							component="span"
							sx={{
								position: 'absolute',
								left: '50%',
								top: '-3px',
								width: 60,
								height: 6,
								ml: '-54px',
								borderRadius: '3px',
								background: `linear-gradient(90deg, ${trailEnd}, ${trail})`,
							}}
						/>
						<Box
							component="span"
							sx={{
								position: 'absolute',
								left: '50%',
								top: '-4px',
								width: 8,
								height: 8,
								ml: '-4px',
								borderRadius: '50%',
								bgcolor: dot,
								boxShadow: `0 0 10px 3px ${glow}`,
							}}
						/>
					</Box>
				);
			})}
		</>
	);
};

/**
 * Hero "agents at work": ten example cards on the top of a big circle, turning slowly left to right
 * (agentshub-hero design). Phones get a smaller circle and smaller cards (ARC_COMPACT).
 * A Pause button stops every movement in the hero (WCAG 2.2.2); hovering holds the cards for reading.
 */
export const AgentCarousel = ({ paused, onTogglePaused }: { paused: boolean; onTogglePaused: () => void }) => {
	const { t } = useTranslation('home');
	const theme = useTheme();
	const compact = useMediaQuery(theme.breakpoints.down('sm'));
	const geometry = compact ? ARC_COMPACT : ARC_WIDE;
	const { cardRef, holdProps, reducedMotion } = useArcRotation(HERO_AGENTS.length, geometry, paused);

	return (
		<>
			<Box
				role="region"
				aria-label={t('home:hero.carouselLabel')}
				{...holdProps}
				sx={{
					position: 'relative',
					height: geometry.height,
					overflow: 'hidden',
					WebkitMaskImage: hero.edgeMask,
					maskImage: hero.edgeMask,
				}}
			>
				<Orbit geometry={geometry} />
				{HERO_AGENTS.map((agent, index) => (
					<HeroAgentCard
						key={agent.key}
						ref={cardRef(index)}
						agent={agent}
						geometry={geometry}
						initialTransform={arcTransform(cardAngle(index, HERO_AGENTS.length, 0, geometry.step), geometry.radius)}
					/>
				))}
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, px: 6, pb: 14 }}>
				<Typography sx={{ fontSize: 14, color: 'bodySoft', textAlign: 'center' }}>{t('home:hero.caption')}</Typography>
				{!reducedMotion && (
					<IconButton
						size="small"
						aria-label={t('home:hero.pause')}
						aria-pressed={paused}
						onClick={onTogglePaused}
						sx={{ border: 1, borderColor: 'border', bgcolor: 'surface', '&:hover': { bgcolor: 'ground' } }}
					>
						{paused ? <PlayArrowRoundedIcon fontSize="small" /> : <PauseRoundedIcon fontSize="small" />}
					</IconButton>
				)}
			</Box>
		</>
	);
};
