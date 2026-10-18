import NextLink from 'next/link';
import { Box, Link } from '@mui/material';
import { useTranslation } from 'next-i18next';

type LogoProps = {
	/** Font size in px: 20 in headers, 16 in the footer. */
	size?: number;
	onClick?: () => void;
};

/** DESIGN §3 Navigation: "Agents" + "Hub" in accent, links home. */
export const Logo = ({ size = 20, onClick }: LogoProps) => {
	const { t } = useTranslation('common');

	return (
		<Link
			component={NextLink}
			href="/"
			underline="none"
			onClick={onClick}
			sx={{
				flexShrink: 0,
				fontSize: size,
				fontWeight: 800,
				letterSpacing: '-0.02em',
				color: 'ink',
				'&:hover': { color: 'ink' },
			}}
		>
			{t('common:brand.start')}
			<Box component="span" sx={{ color: 'primary.main' }}>
				{t('common:brand.end')}
			</Box>
		</Link>
	);
};
