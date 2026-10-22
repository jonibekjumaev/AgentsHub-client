import { useEffect, useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, OutlinedInput, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { FormField } from '@/shared/ui/FormField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { radiusPx } from '@/theme/tokens';
import { deadlineToIso, isFutureDeadline, minDeadlineInput } from '../../lib/briefForm';

type ReopenDialogProps = {
	open: boolean;
	title: string;
	loading: boolean;
	/** The new deadline as ISO, or null to reopen without one (D-31). */
	onConfirm: (briefDeadline: string | null) => void;
	onCancel: () => void;
};

/**
 * D-31: a brief whose deadline has passed reopens only with a new deadline or none, sent in the same
 * call as the status change. MyBriefs.html: "The deadline has passed. Choose a new deadline or remove it."
 */
export const ReopenDialog = ({ open, title, loading, onConfirm, onCancel }: ReopenDialogProps) => {
	const { t } = useTranslation(['briefs', 'common']);
	const id = useId();
	const titleId = `${id}-title`;
	const [date, setDate] = useState('');
	const [touched, setTouched] = useState(false);

	useEffect(() => {
		if (open) {
			setDate('');
			setTouched(false);
		}
	}, [open]);

	const valid = isFutureDeadline(date);
	const error = touched && !valid ? t('briefs:form.errors.deadlineFuture') : undefined;

	const onSubmit = (event: FormEvent) => {
		event.preventDefault();
		setTouched(true);
		if (valid) onConfirm(deadlineToIso(date));
	};

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onCancel}
			aria-labelledby={titleId}
			fullWidth
			maxWidth="xs"
			PaperProps={{ sx: { borderRadius: radiusPx.xl } }}
		>
			<form noValidate onSubmit={onSubmit}>
			<DialogTitle id={titleId} variant="h3" component="h2" sx={{ pt: 6, px: 6 }}>
				{t('briefs:mine.reopen.title', { title })}
			</DialogTitle>
			<DialogContent sx={{ px: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
				<Typography variant="body2" sx={{ color: 'bodySoft' }}>
					{t('briefs:mine.reopen.text')}
				</Typography>
				<FormField id={`${id}-date`} label={t('briefs:mine.reopen.dateLabel')} error={error}>
					{(control) => (
						<OutlinedInput
							type="date"
							fullWidth
							value={date}
							onChange={(event) => setDate(event.target.value)}
							onBlur={() => setTouched(true)}
							error={Boolean(error)}
							id={control.id}
							inputProps={{
								min: minDeadlineInput(),
								'aria-describedby': control['aria-describedby'],
								'aria-invalid': control['aria-invalid'],
							}}
						/>
					)}
				</FormField>
			</DialogContent>
			<DialogActions sx={{ px: 6, pb: 6, gap: 2, flexWrap: 'wrap' }}>
				<Button variant="outlined" onClick={onCancel} disabled={loading}>
					{t('common:actions.cancel')}
				</Button>
				<Button variant="outlined" onClick={() => onConfirm(null)} disabled={loading}>
					{t('briefs:mine.reopen.withoutDeadline')}
				</Button>
				<SubmitButton loading={loading}>{t('briefs:mine.reopen.confirm')}</SubmitButton>
			</DialogActions>
			</form>
		</Dialog>
	);
};
