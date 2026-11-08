import { useId, useState } from 'react';
import NextLink from 'next/link';
import { Box, Button, ButtonBase, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { colors } from '@/theme/tokens';
import { SectionTitle, focusRingSx, frameSx, outlineButtonSx } from './kit';

export const FAQ_KEYS = ['pricing', 'contacts', 'ranking', 'brief', 'sell'] as const;

const FaqItem = ({ id, open, onToggle }: { id: (typeof FAQ_KEYS)[number]; open: boolean; onToggle: () => void }) => {
	const { t } = useTranslation('home');
	const uid = useId();
	return (
		<Box sx={{ borderBottom: 1, borderColor: 'border' }}>
			<Typography variant="h3" sx={{ m: 0, fontSize: 'inherit', fontFamily: 'inherit' }}>
				<ButtonBase
					id={`${uid}-q`}
					aria-expanded={open}
					aria-controls={`${uid}-a`}
					onClick={onToggle}
					sx={{
						width: '100%',
						minHeight: 72,
						py: 5,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 4,
						textAlign: 'left',
						fontSize: 19,
						fontWeight: 600,
						color: 'ink',
						...focusRingSx,
					}}
				>
					{t(`home:faq.items.${id}.q`)}
					<Box
						component="span"
						aria-hidden="true"
						sx={{
							flex: 'none',
							width: 34,
							height: 34,
							display: 'grid',
							placeItems: 'center',
							borderRadius: '50%',
							bgcolor: open ? 'primary.main' : 'neutralSoft',
							color: open ? colors.white : 'body',
							transform: open ? 'rotate(45deg)' : 'none',
							transition: 'transform 300ms, background-color 300ms',
						}}
					>
						<AddIcon sx={{ fontSize: 18 }} />
					</Box>
				</ButtonBase>
			</Typography>
			{/* 0fr → 1fr animates to the answer's real height (no fixed max-height). */}
			<Box
				id={`${uid}-a`}
				role="region"
				aria-labelledby={`${uid}-q`}
				sx={{
					display: 'grid',
					gridTemplateRows: open ? '1fr' : '0fr',
					// visibility hides a closed answer from screen readers and Tab, after the close animation.
					transition: 'grid-template-rows 350ms ease, visibility 350ms',
					visibility: open ? 'visible' : 'hidden',
					'@media (prefers-reduced-motion: reduce)': { transition: 'none' },
				}}
			>
				<Box sx={{ overflow: 'hidden' }}>
					<Typography sx={{ pr: { xs: 0, sm: 14 }, pb: 6, fontSize: 17, lineHeight: 1.6, color: 'bodySoft' }}>{t(`home:faq.items.${id}.a`)}</Typography>
				</Box>
			</Box>
		</Box>
	);
};

/** "Good questions": a short intro on the left, an accordion on the right (first answer open). */
export const Faq = () => {
	const { t } = useTranslation('home');
	const [open, setOpen] = useState<number>(0);
	return (
		<Box component="section" aria-labelledby="home-faq" sx={{ bgcolor: 'surface', borderTop: 1, borderColor: 'borderSoft' }}>
			<Box sx={{ ...frameSx, py: { xs: 16, md: 24 }, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
				<Box sx={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
					<SectionTitle id="home-faq">{t('home:faq.title')}</SectionTitle>
					<Typography sx={{ maxWidth: 340, fontSize: 17, lineHeight: 1.55, color: 'bodySoft' }}>{t('home:faq.text')}</Typography>
					<Button component={NextLink} href="/community" variant="outlined" sx={{ ...outlineButtonSx, alignSelf: 'flex-start', mt: 1.5, ...focusRingSx }}>
						{t('home:faq.community')}
					</Button>
				</Box>
				<Box sx={{ flex: '999 1 560px', minWidth: 0, borderTop: 1, borderColor: 'border' }}>
					{FAQ_KEYS.map((id, index) => (
						<FaqItem key={id} id={id} open={open === index} onToggle={() => setOpen(open === index ? -1 : index)} />
					))}
				</Box>
			</Box>
		</Box>
	);
};
