import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Link, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { RequireRole, useAuth } from '@/auth';
import type { MemberType } from '@/gql/graphql';
import { Header } from './Header';
import { MAIN_CONTENT_ID } from './SkipLink';
import { DASHBOARD_NAV, isActive } from './navigation';

/**
 * Sidebar items for the signed-in member's role (rendered inside RequireRole, so `me` is set).
 * md+: a vertical card list (Dashboard.html). < md: one row of underline tabs that scrolls sideways.
 */
export const DashboardNav = () => {
	const { t } = useTranslation('common');
	const { pathname } = useRouter();
	const { me } = useAuth();
	if (!me) return null;

	const section = DASHBOARD_NAV[me.memberType];

	return (
		<Box
			component="nav"
			aria-label={t('common:dashboardNav.label')}
			sx={{
				flex: { md: '0 0 220px' },
				display: 'flex',
				flexDirection: { xs: 'row', md: 'column' },
				gap: { xs: 4, md: 1 },
				overflowX: { xs: 'auto', md: 'visible' },
				borderBottom: { xs: 1, md: 0 },
				borderColor: 'border',
				position: { md: 'sticky' },
				top: { md: 24 },
			}}
		>
			<Typography variant="overline" component="div" sx={{ display: { xs: 'none', md: 'block' }, px: 3, pb: 2 }}>
				{t(section.titleKey)}
			</Typography>
			{section.items.map((item) => {
				const active = isActive(pathname, item);
				return (
					<Link
						key={item.href}
						component={NextLink}
						href={item.href}
						underline="none"
						aria-current={active ? 'page' : undefined}
						sx={{
							flexShrink: 0,
							whiteSpace: 'nowrap',
							fontSize: 14,
							fontWeight: active ? 700 : 600,
							color: active ? 'primary.main' : 'body',
							'&:hover': { color: 'primary.main' },
							// < md: underline tab. md+: soft-filled item.
							py: { xs: 3, md: 2.5 },
							px: { xs: 0.5, md: 3 },
							borderBottom: { xs: 2, md: 0 },
							borderColor: active ? 'primary.main' : 'transparent',
							borderRadius: { md: 2 },
							bgcolor: { md: active ? 'accentSoft' : 'transparent' },
						}}
					>
						{t(item.labelKey)}
					</Link>
				);
			})}
		</Box>
	);
};

type DashboardLayoutProps = {
	/** Who may open the page; others get /login (guest) or 404 (wrong role). */
	roles: MemberType[];
	children: ReactNode;
};

export const DashboardLayout = ({ roles, children }: DashboardLayoutProps) => (
	<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
		<Header />
		<Box sx={{ flex: 1, width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 8, pb: 16 }}>
			<RequireRole roles={roles}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						alignItems: { md: 'flex-start' },
						gap: { xs: 6, md: 8 },
					}}
				>
					<DashboardNav />
					<Box component="main" id={MAIN_CONTENT_ID} tabIndex={-1} sx={{ flex: 1, minWidth: 0, outline: 'none' }}>
						{children}
					</Box>
				</Box>
			</RequireRole>
		</Box>
	</Box>
);
