import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink';

type AuthLayoutProps = {
	children: ReactNode;
	/** Right side of the header, e.g. "New here? Create an account" on /login (Login.html). */
	headerAction?: ReactNode;
};

/** Login.html: a slim header (logo, one action, compact language switcher) and the form centered below. */
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
				flex: 1,
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'center',
				px: { xs: 4, sm: 6 },
				py: { xs: 10, sm: 18 },
				outline: 'none',
			}}
		>
			{children}
		</Box>
	</Box>
);
