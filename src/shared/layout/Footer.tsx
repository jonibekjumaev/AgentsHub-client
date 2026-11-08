import NextLink from 'next/link';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { colors, fonts, home } from '@/theme/tokens';
import { LanguageSwitcher } from './LanguageSwitcher';

type FooterLink = { href: string; labelKey: string };

/** Only pages that exist. "Categories" is the slider on the home page. */
export const FOOTER_COLUMNS: { key: string; titleKey: string; links: FooterLink[] }[] = [
	{
		key: 'marketplace',
		titleKey: 'common:footer.columns.marketplace',
		links: [
			{ href: '/agents', labelKey: 'common:nav.agents' },
			{ href: '/briefs', labelKey: 'common:nav.briefs' },
			{ href: '/creators', labelKey: 'common:nav.creators' },
			{ href: '/#home-categories', labelKey: 'common:footer.categories' },
		],
	},
	{
		key: 'creators',
		titleKey: 'common:footer.columns.creators',
		links: [
			{ href: '/signup', labelKey: 'common:footer.sell' },
			{ href: '/briefs', labelKey: 'common:footer.answerBriefs' },
			{ href: '/faq', labelKey: 'common:footer.ranking' },
			{ href: '/community', labelKey: 'common:nav.community' },
		],
	},
	{
		key: 'company',
		titleKey: 'common:footer.columns.company',
		links: [
			{ href: '/about', labelKey: 'common:footer.about' },
			{ href: '/faq', labelKey: 'common:footer.faq' },
		],
	},
];

const linkSx = {
	fontSize: 15,
	color: home.footerText,
	'&:hover': { color: colors.white },
	'&:focus-visible': { outline: `3px solid ${home.focusRing}`, outlineOffset: '3px' },
} as const;

/** Dark site footer: brand, three link columns, copyright and the language switcher. */
export const Footer = () => {
	const { t } = useTranslation('common');

	return (
		<Box component="footer" sx={{ bgcolor: home.footer, color: home.footerText }}>
			<Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 18, pb: 8, display: 'flex', flexDirection: 'column', gap: 14 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
					<Box sx={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', gap: 4 }}>
						<Box
							component={NextLink}
							href="/"
							sx={{ fontFamily: fonts.display, fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: colors.white, textDecoration: 'none', alignSelf: 'flex-start' }}
						>
							{t('common:app.name')}
						</Box>
						<Typography sx={{ maxWidth: 320, fontSize: 15, lineHeight: 1.6, color: home.footerText }}>{t('common:footer.tagline')}</Typography>
					</Box>
					{FOOTER_COLUMNS.map((column) => (
						<Box
							key={column.key}
							component="nav"
							aria-labelledby={`footer-${column.key}`}
							sx={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', gap: 3 }}
						>
							<Typography id={`footer-${column.key}`} component="p" sx={{ fontSize: 15, fontWeight: 700, color: colors.white }}>
								{t(column.titleKey)}
							</Typography>
							{column.links.map((link) => (
								<Link key={link.labelKey} component={NextLink} href={link.href} underline="none" sx={linkSx}>
									{t(link.labelKey)}
								</Link>
							))}
						</Box>
					))}
				</Box>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 4,
						pt: 6,
						borderTop: 1,
						borderColor: home.footerLine,
						fontSize: 14,
						color: home.footerMuted,
					}}
				>
					<span>
						{t('common:footer.copyright', { year: new Date().getFullYear() })}. {t('common:footer.prices')}
					</span>
					<LanguageSwitcher tone="dark" />
				</Box>
			</Box>
		</Box>
	);
};
