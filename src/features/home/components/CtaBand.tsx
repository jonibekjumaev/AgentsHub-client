import NextLink from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { POST_BRIEF_HREF } from '@/features/briefs';
import { colors, home } from '@/theme/tokens';
import { SectionTitle, focusRingSx, frameSx, noMotionSx } from './kit';

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

/** Big indigo band: one headline, two paths (post a brief / sell an agent), a slowly turning orbit. */
export const CtaBand = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="section" aria-labelledby="home-cta" sx={{ ...frameSx, pb: { xs: 16, md: 24 } }}>
			<Box
				sx={{
					position: 'relative',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					p: 'clamp(36px, 6vw, 72px)',
					borderRadius: home.radius.band,
					bgcolor: 'primary.main',
					color: colors.white,
				}}
			>
				<Box
					aria-hidden="true"
					sx={{
						position: 'absolute',
						right: -160,
						top: '50%',
						width: 520,
						height: 520,
						mt: '-260px',
						borderRadius: '50%',
						border: `1.5px dashed ${home.ctaOrbit}`,
						animation: `${spin} 26s linear infinite`,
						...noMotionSx,
					}}
				>
					<Box
						component="span"
						sx={{ position: 'absolute', left: '50%', top: '-7px', width: 14, height: 14, ml: '-7px', borderRadius: '50%', bgcolor: colors.white, boxShadow: home.ctaGlow }}
					/>
				</Box>
				<Box
					aria-hidden="true"
					sx={{ position: 'absolute', right: -60, top: '50%', width: 320, height: 320, mt: '-160px', borderRadius: '50%', border: 1, borderColor: home.ctaRing }}
				/>
				<SectionTitle
					id="home-cta"
					tone="dark"
					sx={{ position: 'relative', maxWidth: 760, fontSize: 'clamp(38px, 5.4vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.04em' }}
				>
					{t('home:cta.title')}
				</SectionTitle>
				<Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 3.5 }}>
					<Typography sx={{ maxWidth: 460, fontSize: 18, lineHeight: 1.55, color: home.ctaText }}>{t('home:cta.text')}</Typography>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
						<Button
							component={NextLink}
							href={POST_BRIEF_HREF}
							sx={{ minHeight: 54, px: 7, borderRadius: '14px', bgcolor: colors.white, color: 'primary.main', fontSize: 17, '&:hover': { bgcolor: home.nightTextSoft }, ...focusRingSx }}
						>
							{t('home:cta.action')}
						</Button>
						<Button
							component={NextLink}
							href="/signup"
							variant="outlined"
							sx={{
								minHeight: 54,
								px: 7,
								borderRadius: '14px',
								border: `1.5px solid ${home.ctaOutline}`,
								bgcolor: 'transparent',
								color: colors.white,
								fontSize: 17,
								'&:hover': { border: `1.5px solid ${colors.white}`, bgcolor: home.nightFillStrong },
								...focusRingSx,
							}}
						>
							{t('home:sellAgent')}
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
