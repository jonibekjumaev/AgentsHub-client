import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Logo } from './Logo';
import { FOOTER_NAV } from './navigation';

export const Footer = () => {
	const { t } = useTranslation('common');

	return (
		<Box component="footer" sx={{ bgcolor: 'surface', borderTop: 1, borderColor: 'border' }}>
			<Box
				sx={{
					maxWidth: 1200,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					py: 8,
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 6,
				}}
			>
				<Logo size={16} />
				<Box component="nav" aria-label={t('common:footer.label')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
					{FOOTER_NAV.map((item) => (
						<Link
							key={item.href}
							component={NextLink}
							href={item.href}
							underline="none"
							sx={{ fontSize: 14, fontWeight: 500, color: 'muted', '&:hover': { color: 'primary.main' } }}
						>
							{t(item.labelKey)}
						</Link>
					))}
				</Box>
				<Typography variant="body2" sx={{ color: 'muted' }}>
					{t('common:footer.copyright', { year: new Date().getFullYear() })} · {t('common:footer.prices')}
				</Typography>
			</Box>
		</Box>
	);
};
