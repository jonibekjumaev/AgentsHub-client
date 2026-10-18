import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

type FormAlertProps = {
	/** error: DESIGN §3 error alert (role="alert"). info: accent notice (role="status"). */
	severity: 'error' | 'info';
	children: ReactNode;
};

/** Form-level message at the top of an auth form (Login.html). */
export const FormAlert = ({ severity, children }: FormAlertProps) => {
	const isError = severity === 'error';
	const Icon = isError ? ErrorOutlineIcon : InfoOutlinedIcon;

	return (
		<Box
			role={isError ? 'alert' : 'status'}
			sx={{
				display: 'flex',
				gap: 2.5,
				alignItems: 'flex-start',
				px: 3.5,
				py: 3,
				borderRadius: 2.5,
				border: 1,
				borderColor: isError ? 'dangerSoftBorder' : 'accentBorder',
				bgcolor: isError ? 'dangerSoft' : 'accentSoft',
				color: isError ? 'dangerInk' : 'accentHover',
				fontSize: 14,
				lineHeight: 1.5,
			}}
		>
			<Icon aria-hidden="true" sx={{ fontSize: 18, mt: '1px', flex: 'none', color: isError ? 'error.main' : 'primary.main' }} />
			<span>{children}</span>
		</Box>
	);
};
