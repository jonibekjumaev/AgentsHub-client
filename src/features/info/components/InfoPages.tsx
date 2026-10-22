import NextLink from 'next/link';
import { Accordion, AccordionDetails, AccordionSummary, Box, Link, Stack, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';

const frameSx = { maxWidth: 820, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16 } as const;

/** Question keys in info.json (faq.items.<key>.q / .a), in display order. */
export const FAQ_ITEMS = ['what', 'contact', 'contacts', 'pricing', 'brief', 'deadline', 'rank', 'pause', 'password', 'blocked'] as const;

/** /faq: native-feeling accordions; each answer is plain text from the locale files. */
export const FaqPage = () => {
	const { t } = useTranslation('info');
	return (
		<Box sx={frameSx}>
			<Typography variant="h1">{t('info:faq.title')}</Typography>
			<Typography sx={{ mt: 1.5, mb: 6, color: 'muted' }}>{t('info:faq.subtitle')}</Typography>
			<Stack spacing={2}>
				{FAQ_ITEMS.map((key) => (
					<Accordion
						key={key}
						disableGutters
						elevation={0}
						sx={{ border: 1, borderColor: 'border', borderRadius: `${radiusPx.lg} !important`, '&::before': { display: 'none' } }}
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon />} id={`faq-${key}`} aria-controls={`faq-${key}-answer`}>
							<Typography component="h2" sx={{ fontWeight: 700, fontSize: 16 }}>
								{t(`info:faq.items.${key}.q`)}
							</Typography>
						</AccordionSummary>
						<AccordionDetails id={`faq-${key}-answer`}>
							<Typography sx={{ color: 'bodySoft', whiteSpace: 'pre-line' }}>{t(`info:faq.items.${key}.a`)}</Typography>
						</AccordionDetails>
					</Accordion>
				))}
			</Stack>
			<Typography sx={{ mt: 8, color: 'muted' }}>
				{t('info:faq.more')}{' '}
				<Link component={NextLink} href="/community" sx={{ fontWeight: 700 }}>
					{t('info:faq.community')}
				</Link>
			</Typography>
		</Box>
	);
};

/** /about */
export const AboutPage = () => {
	const { t } = useTranslation('info');
	return (
		<Box sx={frameSx}>
			<Typography variant="h1">{t('info:about.title')}</Typography>
			<Typography sx={{ mt: 4, fontSize: 17, color: 'body', lineHeight: 1.7 }}>{t('info:about.lead')}</Typography>
			{(['why', 'how', 'principles'] as const).map((section) => (
				<Box key={section} component="section" aria-labelledby={`about-${section}`} sx={{ mt: 8 }}>
					<Typography id={`about-${section}`} variant="h2">
						{t(`info:about.${section}.title`)}
					</Typography>
					<Typography sx={{ mt: 2, color: 'bodySoft', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{t(`info:about.${section}.text`)}</Typography>
				</Box>
			))}
		</Box>
	);
};
