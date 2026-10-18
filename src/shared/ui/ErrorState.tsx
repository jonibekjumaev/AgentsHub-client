import { Box, Button, Typography } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { toErrorKey } from '@/shared/lib/errors';
import { radiusPx } from '@/theme/tokens';

type ErrorStateProps = {
	/** Any error; shown through the error mapping, never as backend text (CLAUDE.md rule 9). */
	error: unknown;
	onRetry?: () => void;
	title?: string;
};

/** DESIGN §3 Feedback error alert: dangerSoft bg, dangerSoftBorder, dangerInk text, icon, role="alert". */
export const ErrorState = ({ error, onRetry, title }: ErrorStateProps) => {
	const { t } = useTranslation(['common', 'errors']);

	return (
		<Box
			role="alert"
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'flex-start',
				gap: 3,
				p: 4,
				bgcolor: 'dangerSoft',
				border: 1,
				borderColor: 'dangerSoftBorder',
				borderRadius: radiusPx.lg,
				color: 'dangerInk',
			}}
		>
			<ErrorOutlineIcon aria-hidden="true" sx={{ mt: 0.25 }} />
			<Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
				<Typography sx={{ fontWeight: 800, color: 'inherit' }}>{title ?? t('common:states.errorTitle')}</Typography>
				<Typography variant="body2" sx={{ color: 'inherit', mt: 0.5 }}>
					{t(toErrorKey(error))}
				</Typography>
			</Box>
			{onRetry && (
				<Button variant="outlined" size="small" onClick={onRetry}>
					{t('common:actions.tryAgain')}
				</Button>
			)}
		</Box>
	);
};
