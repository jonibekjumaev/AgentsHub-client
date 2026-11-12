import NextLink from 'next/link';
import { Accordion, AccordionDetails, AccordionSummary, Box, Link, Stack, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { NightBand, pageCardSx, pageFrameSx } from '@/shared/ui/page';
import { fonts, home } from '@/theme/tokens';

const READING_WIDTH = 820;
const frameSx = { ...pageFrameSx, maxWidth: READING_WIDTH } as const;

/** Question keys in info.json (faq.items.<key>.q / .a), in display order. */
export const FAQ_ITEMS = [
	'what',
	'contact',
	'contacts',
	'pricing',
	'brief',
	'deadline',
	'rank',
	'pause',
	'password',
	'blocked',
] as const;

/** /faq: native-feeling accordions; each answer is plain text from the locale files. */
export const FaqPage = () => {
	const { t } = useTranslation('info');
	return (
		<>
			<NightBand maxWidth={READING_WIDTH} title={t('info:faq.title')} meta={t('info:faq.subtitle')} />
			<Box sx={frameSx}>
				<Stack spacing={2}>
					{FAQ_ITEMS.map((key) => (
						<Accordion
							key={key}
							disableGutters
							elevation={0}
							sx={{
								border: 1,
								borderColor: 'border',
								borderRadius: `${home.radius.tile} !important`,
								'&::before': { display: 'none' },
								'&.Mui-expanded': { borderColor: 'primary.main' },
							}}
						>
							<AccordionSummary expandIcon={<ExpandMoreIcon />} id={`faq-${key}`} aria-controls={`faq-${key}-answer`}>
								<Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
									{t(`info:faq.items.${key}.q`)}
								</Typography>
							</AccordionSummary>
							<AccordionDetails id={`faq-${key}-answer`}>
								<Typography sx={{ color: 'bodySoft', whiteSpace: 'pre-line' }}>
									{t(`info:faq.items.${key}.a`)}
								</Typography>
							</AccordionDetails>
						</Accordion>
					))}
				</Stack>
				<Typography sx={{ ...pageCardSx, display: 'block', color: 'muted' }}>
					{t('info:faq.more')}{' '}
					<Link component={NextLink} href="/community" sx={{ fontWeight: 700 }}>
						{t('info:faq.community')}
					</Link>
				</Typography>
			</Box>
		</>
	);
};

/** /about */
export const AboutPage = () => {
	const { t } = useTranslation('info');
	return (
		<>
			<NightBand maxWidth={READING_WIDTH} title={t('info:about.title')}>
				<Typography sx={{ fontSize: 17, lineHeight: 1.7, color: home.nightTextSoft, maxWidth: 680 }}>
					{t('info:about.lead')}
				</Typography>
			</NightBand>
			<Box sx={frameSx}>
				{(['why', 'how', 'principles'] as const).map((section) => (
					<Box key={section} component="section" aria-labelledby={`about-${section}`} sx={{ ...pageCardSx, gap: 2 }}>
						<Typography
							id={`about-${section}`}
							variant="h2"
							sx={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}
						>
							{t(`info:about.${section}.title`)}
						</Typography>
						<Typography sx={{ color: 'bodySoft', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
							{t(`info:about.${section}.text`)}
						</Typography>
					</Box>
				))}
			</Box>
		</>
	);
};
