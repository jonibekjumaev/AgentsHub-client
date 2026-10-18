import { forwardRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import { MaterialDesignContent, SnackbarProvider, useSnackbar, type CustomContentProps } from 'notistack';
import { styled } from '@mui/material/styles';

/** notistack's default colors replaced with theme values (no hex in components). */
const ThemedContent = styled(MaterialDesignContent)(({ theme }) => ({
	fontFamily: theme.typography.fontFamily,
	fontWeight: 600,
	fontSize: 14,
	borderRadius: theme.shape.borderRadius,
	'&.notistack-MuiContent-default': { backgroundColor: theme.palette.ink, color: theme.palette.common.white },
	'&.notistack-MuiContent-success': { backgroundColor: theme.palette.success.main },
	'&.notistack-MuiContent-error': { backgroundColor: theme.palette.error.main },
	'&.notistack-MuiContent-info': { backgroundColor: theme.palette.primary.main },
	'&.notistack-MuiContent-warning': { backgroundColor: theme.palette.warning.main },
}));

const Content = forwardRef<HTMLDivElement, CustomContentProps>((props, ref) => <ThemedContent ref={ref} {...props} />);
Content.displayName = 'ToastContent';

const components = { default: Content, success: Content, error: Content, info: Content, warning: Content };

/** Success feedback after mutations (DESIGN §3 Feedback). Mounted once in _app. */
export const ToastProvider = ({ children }: { children: ReactNode }) => (
	<SnackbarProvider maxSnack={3} autoHideDuration={4000} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} Components={components}>
		{children}
	</SnackbarProvider>
);

/** Messages must already be translated: toast.success(t('agents:saved')). */
export const useToast = () => {
	const { enqueueSnackbar } = useSnackbar();
	return useMemo(
		() => ({
			success: (message: string) => enqueueSnackbar(message, { variant: 'success' }),
			error: (message: string) => enqueueSnackbar(message, { variant: 'error' }),
			info: (message: string) => enqueueSnackbar(message, { variant: 'info' }),
		}),
		[enqueueSnackbar],
	);
};
