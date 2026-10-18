import { Box, Typography } from '@mui/material';
import {
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	LocalOfferOutlined as LocalOfferOutlinedIcon,
	LockOutlined as LockOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';

const POINTS = [
	{ key: 'contacts', Icon: LockOutlinedIcon },
	{ key: 'prices', Icon: LocalOfferOutlinedIcon },
	{ key: 'talk', Icon: ChatBubbleOutlineIcon },
] as const;

/** Signup.html side panel. Hidden below md, where the form takes the whole width. */
export const WhyAgentsHub = () => {
	const { t } = useTranslation('auth');

	return (
		<Box
			component="aside"
			aria-labelledby="why-agentshub"
			sx={{ flex: '1 1 340px', minWidth: 0, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 5, py: 2, px: 1 }}
		>
			<Typography id="why-agentshub" variant="h2">
				{t('auth:signup.why.title')}
			</Typography>
			{POINTS.map(({ key, Icon }) => (
				<Box key={key} sx={{ display: 'flex', gap: 3.5 }}>
					<Box
						aria-hidden="true"
						sx={{
							flex: 'none',
							display: 'grid',
							placeItems: 'center',
							width: 40,
							height: 40,
							borderRadius: radiusPx.md,
							bgcolor: 'accentSoft',
							color: 'primary.main',
						}}
					>
						<Icon sx={{ fontSize: 20 }} />
					</Box>
					<Box>
						<Typography component="h3" sx={{ fontWeight: 800, color: 'ink' }}>
							{t(`auth:signup.why.${key}.title`)}
						</Typography>
						<Typography variant="body2" sx={{ color: 'muted' }}>
							{t(`auth:signup.why.${key}.text`)}
						</Typography>
					</Box>
				</Box>
			))}
		</Box>
	);
};
