import { useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { colors, home } from '@/theme/tokens';
import { SectionTitle, displaySx, focusRingSx, frameSx } from './kit';

export const HOW_SIDES = ['business', 'creator'] as const;
export type HowSide = (typeof HOW_SIDES)[number];
const STEPS = [1, 2, 3] as const;

type PanelRow = { k: string; v: string };

/**
 * "How AgentsHub works for you" (dark): pick a side, pick a step, and the example app window on the
 * right shows that step. The window is announced politely when it changes.
 */
export const HowItWorks = () => {
	const { t } = useTranslation('home');
	const [side, setSide] = useState<HowSide>('business');
	const [step, setStep] = useState<(typeof STEPS)[number]>(1);
	const base = `home:how.${side}.step${step}`;
	const rows = t(`${base}.panel.rows`, { returnObjects: true }) as PanelRow[];

	return (
		<Box component="section" aria-labelledby="home-how" sx={{ position: 'relative', overflow: 'hidden', bgcolor: home.night, color: colors.white }}>
			<Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: home.nightDots, backgroundSize: '26px 26px' }} />
			<Box sx={{ ...frameSx, position: 'relative', py: { xs: 16, md: 24 }, display: 'flex', flexDirection: 'column', gap: 11 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
					<SectionTitle id="home-how" tone="dark" sx={{ maxWidth: 600, fontSize: 'clamp(34px, 4vw, 54px)', lineHeight: 1 }}>
						{t('home:how.title')}
					</SectionTitle>
					<Box
						role="tablist"
						aria-label={t('home:how.sidesLabel')}
						sx={{ display: 'flex', gap: 1, p: 1.25, borderRadius: '999px', bgcolor: home.nightFill, border: 1, borderColor: home.nightLine }}
					>
						{HOW_SIDES.map((item) => {
							const selected = item === side;
							return (
								<ButtonBase
									key={item}
									role="tab"
									aria-selected={selected}
									onClick={() => {
										setSide(item);
										setStep(1);
									}}
									sx={{
										minHeight: 44,
										px: 5.5,
										borderRadius: '999px',
										bgcolor: selected ? colors.white : 'transparent',
										color: selected ? home.night : home.nightTextSoft,
										fontSize: 15,
										fontWeight: 700,
										transition: 'background-color 250ms, color 250ms',
										...focusRingSx,
									}}
								>
									{t(`home:how.${item}.title`)}
								</ButtonBase>
							);
						})}
					</Box>
				</Box>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'stretch' }}>
					<Box component="ol" sx={{ flex: '1 1 380px', m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
						{STEPS.map((item) => {
							const active = item === step;
							return (
								<li key={item}>
									<ButtonBase
										aria-pressed={active}
										onClick={() => setStep(item)}
										sx={{
											width: '100%',
											display: 'flex',
											alignItems: 'flex-start',
											justifyContent: 'flex-start',
											gap: 4.5,
											p: 5.5,
											borderRadius: home.radius.step,
											border: 1,
											borderColor: active ? home.nightLineStrong : home.nightLine,
											bgcolor: active ? home.nightFillStrong : 'transparent',
											textAlign: 'left',
											color: colors.white,
											transition: 'background-color 250ms, border-color 250ms',
											...focusRingSx,
										}}
									>
										<Box
											component="span"
											aria-hidden="true"
											sx={{
												flex: 'none',
												width: 44,
												height: 44,
												display: 'grid',
												placeItems: 'center',
												borderRadius: '50%',
												bgcolor: active ? colors.white : home.nightFillStrong,
												color: active ? home.night : colors.white,
												...displaySx,
												fontSize: 18,
												fontWeight: 800,
											}}
										>
											{item}
										</Box>
										<Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
											<Box component="span" sx={{ fontSize: 19, fontWeight: 700 }}>
												{t(`home:how.${side}.step${item}.title`)}
											</Box>
											<Box component="span" sx={{ fontSize: 15, lineHeight: 1.5, color: home.nightText }}>
												{t(`home:how.${side}.step${item}.text`)}
											</Box>
										</Box>
									</ButtonBase>
								</li>
							);
						})}
					</Box>

					<Box
						aria-live="polite"
						sx={{
							flex: '1.2 1 420px',
							minWidth: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							p: { xs: 4, sm: 7 },
							borderRadius: home.radius.panel,
							bgcolor: home.nightFill,
							border: 1,
							borderColor: home.nightLine,
						}}
					>
						<Box
							sx={{
								width: '100%',
								maxWidth: 460,
								display: 'flex',
								flexDirection: 'column',
								gap: 3.5,
								p: 6,
								borderRadius: home.radius.step,
								bgcolor: 'surface',
								color: 'ink',
								boxShadow: home.nightShadow,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2.5 }}>
								<Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'muted' }}>
									{t(`${base}.panel.kicker`)} · {t('home:how.example')}
								</Typography>
								<Box component="span" aria-hidden="true" sx={{ display: 'flex', gap: 1.25 }}>
									{[0, 1, 2].map((dot) => (
										<Box key={dot} component="span" sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'border' }} />
									))}
								</Box>
							</Box>
							<Typography variant="h3" sx={{ fontSize: 24, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em' }}>
								{t(`${base}.panel.title`)}
							</Typography>
							<Box component="dl" sx={{ m: 0, border: 1, borderColor: 'borderSoft', borderRadius: '14px', overflow: 'hidden' }}>
								{rows.map((row, index) => (
									<Box
										key={row.k}
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											gap: 3,
											px: 4,
											py: 3.25,
											borderTop: index ? 1 : 0,
											borderColor: 'borderSoft',
										}}
									>
										<Box component="dt" sx={{ fontSize: 14, color: 'bodySoft' }}>
											{row.k}
										</Box>
										<Box component="dd" sx={{ m: 0, fontSize: 15, fontWeight: 700, textAlign: 'right', color: 'ink' }}>
											{row.v}
										</Box>
									</Box>
								))}
							</Box>
							{/* Part of the picture, not a control. */}
							<Box
								component="span"
								aria-hidden="true"
								sx={{
									alignSelf: 'flex-start',
									minHeight: 44,
									display: 'flex',
									alignItems: 'center',
									px: 4.5,
									borderRadius: '11px',
									bgcolor: 'primary.main',
									color: colors.white,
									fontSize: 15,
									fontWeight: 700,
								}}
							>
								{t(`${base}.panel.button`)}
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
