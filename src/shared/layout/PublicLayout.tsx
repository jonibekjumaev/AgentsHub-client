import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Footer } from './Footer';
import { Header } from './Header';
import { MAIN_CONTENT_ID } from './SkipLink';

/** Header + main + footer. Pages own their container width and padding. */
export const PublicLayout = ({ children }: { children: ReactNode }) => (
	<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
		<Header />
		<Box component="main" id={MAIN_CONTENT_ID} tabIndex={-1} sx={{ flex: 1, outline: 'none' }}>
			{children}
		</Box>
		<Footer />
	</Box>
);
