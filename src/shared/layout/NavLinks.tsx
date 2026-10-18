import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';
import { MAIN_NAV, isActive } from './navigation';

/** Main nav links; a row in the header, a column in the mobile drawer. */
export const NavLinks = ({ column = false, onNavigate }: { column?: boolean; onNavigate?: () => void }) => {
	const { t } = useTranslation('common');
	const { pathname } = useRouter();

	return (
		<Box
			component="nav"
			aria-label={t('common:nav.label')}
			sx={{ display: 'flex', flexDirection: column ? 'column' : 'row', gap: column ? 1 : 6 }}
		>
			{MAIN_NAV.map((item) => {
				const active = isActive(pathname, item);
				return (
					<Link
						key={item.href}
						component={NextLink}
						href={item.href}
						underline="none"
						aria-current={active ? 'page' : undefined}
						onClick={onNavigate}
						sx={{
							fontSize: column ? 15 : 14,
							fontWeight: active ? 700 : 600,
							color: active ? 'primary.main' : 'body',
							'&:hover': { color: 'primary.main' },
							...(column && { py: 2.5, px: 3, borderRadius: radiusPx.sm, bgcolor: active ? 'accentSoft' : 'transparent' }),
						}}
					>
						{t(item.labelKey)}
					</Link>
				);
			})}
		</Box>
	);
};
