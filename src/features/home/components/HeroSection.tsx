import { useState, type FormEvent } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Button, Link, OutlinedInput, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { Trans, useTranslation } from 'next-i18next';
import { agentsHref, parseAgentFilters } from '@/features/agents';
import { POST_BRIEF_HREF } from '@/features/briefs';
import { colors, hero, radiusPx } from '@/theme/tokens';
import { AgentCarousel } from './AgentCarousel';

/** Slow drift of the two blurred "aurora" blobs behind the text. */
const driftA = keyframes`
	0% { transform: translate(0, 0) scale(1); }
	100% { transform: translate(90px, 40px) scale(1.12); }
`;
const driftB = keyframes`
	0% { transform: translate(0, 0) scale(1.05); }
	100% { transform: translate(-80px, 30px) scale(0.95); }
`;

const layerSx = { position: 'absolute', zIndex: -1, pointerEvents: 'none' } as const;
const noMotion = { '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const;

/** Search text sent to /agents (the catalog's own limit). */
const SEARCH_MAX = 100;

/**
 * Home hero (agentshub-hero design): badge, headline, search, the two side links and the turning
 * example-agents carousel, over a glow, a faded dot grid and two drifting aurora blobs.
 * `paused` (the carousel's Pause button) also freezes every CSS animation inside the section.
 */
export const HeroSection = () => {
	const { t } = useTranslation('home');
	const router = useRouter();
	const [text, setText] = useState('');
	const [paused, setPaused] = useState(false);

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		void router.push(agentsHref({ ...parseAgentFilters({}), text: text.trim().slice(0, SEARCH_MAX) }));
	};

	return (
		<Box
			component="section"
			aria-labelledby="home-title"
			data-paused={paused || undefined}
			sx={{
				position: 'relative',
				overflow: 'hidden',
				isolation: 'isolate',
				background: `${hero.glow}, ${colors.ground}`,
				'&[data-paused] *': { animationPlayState: 'paused' },
			}}
		>
			{/* Decorative layers: dot grid, then two aurora blobs. */}
			<Box
				aria-hidden="true"
				sx={{
					...layerSx,
					inset: 0,
					backgroundImage: hero.dots,
					backgroundSize: '24px 24px',
					WebkitMaskImage: hero.dotsMask,
					maskImage: hero.dotsMask,
				}}
			/>
			<Box
				aria-hidden="true"
				sx={{
					...layerSx,
					...noMotion,
					left: '12%',
					top: 40,
					width: 560,
					height: 420,
					borderRadius: '50%',
					bgcolor: hero.auroraIndigo,
					filter: 'blur(90px)',
					animation: `${driftA} 16s ease-in-out infinite alternate`,
				}}
			/>
			<Box
				aria-hidden="true"
				sx={{
					...layerSx,
					...noMotion,
					right: '10%',
					top: 120,
					width: 520,
					height: 380,
					borderRadius: '50%',
					bgcolor: hero.auroraSky,
					filter: 'blur(90px)',
					animation: `${driftB} 19s ease-in-out infinite alternate`,
				}}
			/>

			<Box
				sx={{
					maxWidth: 900,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					pt: { xs: 12, md: 18 },
					pb: 2,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					textAlign: 'center',
					gap: 5.5,
				}}
			>
				<Box
					component="p"
					sx={{
						m: 0,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 2,
						px: 3.5,
						py: 1.5,
						border: 1,
						borderColor: hero.badgeBorder,
						bgcolor: 'surface',
						borderRadius: radiusPx.pill,
						fontSize: 14,
						fontWeight: 700,
						color: 'primary.main',
					}}
				>
					<Box component="span" aria-hidden="true" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: hero.liveDot }} />
					{t('home:hero.eyebrow')}
				</Box>
				<Typography
					id="home-title"
					variant="h1"
					sx={{ fontSize: 'clamp(36px, 5.2vw, 72px)', lineHeight: 1.04, fontWeight: 800, letterSpacing: '-0.035em', color: 'ink' }}
				>
					<Trans
						i18nKey="home:hero.title"
						components={{ accent: <Box component="span" sx={{ color: 'primary.main' }} /> }}
					/>
				</Typography>
				<Typography sx={{ maxWidth: 680, fontSize: { xs: 17, sm: 20 }, lineHeight: 1.55, color: 'bodySoft' }}>
					{t('home:hero.text')}
				</Typography>
				<Box
					component="form"
					role="search"
					onSubmit={onSubmit}
					sx={{ width: '100%', maxWidth: 720, mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 2.5 }}
				>
					<OutlinedInput
						type="search"
						value={text}
						onChange={(event) => setText(event.target.value)}
						placeholder={t('home:hero.searchPlaceholder')}
						inputProps={{ 'aria-label': t('home:hero.searchLabel'), maxLength: SEARCH_MAX, enterKeyHint: 'search' }}
						sx={{ flex: '1 1 320px', minWidth: 0, height: 58, fontSize: 17, bgcolor: 'surface', borderRadius: radiusPx.lg }}
					/>
					<Button type="submit" sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, height: 58, px: 7, fontSize: 17, borderRadius: radiusPx.lg }}>
						{t('home:hero.search')}
					</Button>
				</Box>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 7, rowGap: 2 }}>
					<Link component={NextLink} href={POST_BRIEF_HREF} sx={{ fontSize: 17, fontWeight: 600 }}>
						{t('home:hero.postBrief')}
					</Link>
					<Link component={NextLink} href="/signup" sx={{ fontSize: 17, fontWeight: 600 }}>
						{t('home:hero.sell')}
					</Link>
				</Box>
			</Box>

			<AgentCarousel paused={paused} onTogglePaused={() => setPaused((value) => !value)} />
		</Box>
	);
};
