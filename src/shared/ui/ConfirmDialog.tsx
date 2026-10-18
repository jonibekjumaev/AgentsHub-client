import { useId } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	text?: string;
	/** Defaults to "Delete". */
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	/** Mutation in flight: confirm shows a spinner, both buttons are disabled, the dialog stays open. */
	loading?: boolean;
	/** Danger styling for destructive actions (default). */
	destructive?: boolean;
};

/**
 * DESIGN §3 Feedback: every destructive action confirms here. MUI Dialog traps focus while open and
 * returns it to the trigger on close. Focus starts on Cancel, so Enter never deletes by accident.
 */
export const ConfirmDialog = ({
	open,
	title,
	text,
	confirmLabel,
	onConfirm,
	onCancel,
	loading = false,
	destructive = true,
}: ConfirmDialogProps) => {
	const { t } = useTranslation('common');
	const titleId = useId();
	const textId = useId();

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onCancel}
			aria-labelledby={titleId}
			aria-describedby={text ? textId : undefined}
			maxWidth="xs"
			fullWidth
			PaperProps={{ sx: { borderRadius: 4 } }}
		>
			<DialogTitle id={titleId} variant="h3" component="h2" sx={{ pt: 6, px: 6 }}>
				{title}
			</DialogTitle>
			{text && (
				<DialogContent sx={{ px: 6 }}>
					<Typography id={textId} variant="body2" sx={{ color: 'bodySoft' }}>
						{text}
					</Typography>
				</DialogContent>
			)}
			<DialogActions sx={{ px: 6, pb: 6, gap: 2, flexWrap: 'wrap' }}>
				<Button variant="outlined" onClick={onCancel} disabled={loading} autoFocus>
					{t('common:actions.cancel')}
				</Button>
				<Button
					color={destructive ? 'error' : 'primary'}
					onClick={onConfirm}
					disabled={loading}
					aria-busy={loading || undefined}
					sx={{ position: 'relative' }}
				>
					{/* The label keeps its width and its accessible name while the spinner shows (DESIGN §3 Buttons). */}
					<Box component="span" sx={{ opacity: loading ? 0 : 1 }}>
						{confirmLabel ?? t('common:actions.delete')}
					</Box>
					{loading && <CircularProgress size={18} color="inherit" sx={{ position: 'absolute' }} />}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
