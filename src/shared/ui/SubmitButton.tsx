import { Box, Button, CircularProgress, type ButtonProps } from '@mui/material';

type SubmitButtonProps = Omit<ButtonProps, 'type'> & {
	loading?: boolean;
};

/**
 * DESIGN §3 Buttons loading state: a spinner replaces the label, the width stays the same
 * (the label keeps its space, invisibly), and the button is disabled.
 */
export const SubmitButton = ({ loading = false, disabled, children, sx, ...props }: SubmitButtonProps) => (
	<Button
		{...props}
		type="submit"
		disabled={disabled || loading}
		aria-busy={loading || undefined}
		sx={{ position: 'relative', ...sx }}
	>
		<Box component="span" sx={{ visibility: loading ? 'hidden' : 'visible' }}>
			{children}
		</Box>
		{loading && (
			<CircularProgress size={20} color="inherit" aria-hidden="true" sx={{ position: 'absolute', inset: 0, m: 'auto' }} />
		)}
	</Button>
);
