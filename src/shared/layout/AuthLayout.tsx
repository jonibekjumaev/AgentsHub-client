import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { catalog, home } from '@/theme/tokens';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink';

type AuthLayoutProps = {
	children: ReactNode;
	/** Right side of the header, e.g. "New here? Create an account" on /login (Login.html). */
	headerAction?: ReactNode;
};

/**
 * Login.html: a slim header (logo, one action, compact language switcher) and the form centered below.
 * Phase 1.5: the form sits over the top of a night ground with the catalog dots, so /login and /signup speak the
 * same language as the catalog bands.
 */
export const AuthLayout = ({ children, headerAction }: AuthLayoutProps) => (
	<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
		<Box component="header" sx={{ bgcolor: 'surface', borderBottom: 1, borderColor: 'border' }}>
			<SkipLink />
			<Box
				sx={{
					maxWidth: 1200,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					minHeight: 64,
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 4,
				}}
			>
				<Logo />
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
					{headerAction && <Box sx={{ fontSize: 14, color: 'muted' }}>{headerAction}</Box>}
					<LanguageSwitcher />
				</Box>
			</Box>
		</Box>
		<Box
			component="main"
			id={MAIN_CONTENT_ID}
			tabIndex={-1}
			sx={{
				position: 'relative',
				flex: 1,
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'center',
				px: { xs: 4, sm: 6 },
				py: { xs: 10, sm: 18 },
				outline: 'none',
			}}
		>
			<Box
				aria-hidden="true"
				sx={{
					position: 'absolute',
					insetInline: 0,
					top: 0,
					height: { xs: 200, sm: 300 },
					bgcolor: home.night,
					backgroundImage: catalog.heroDots,
					backgroundSize: '24px 24px',
					pointerEvents: 'none',
				}}
			/>
			<Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>{children}</Box>
		</Box>
	</Box>
);
