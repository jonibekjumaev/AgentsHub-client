import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { getErrorMessages } from '@/shared/lib/errors';
import { ErrorState } from '@/shared/ui/ErrorState';
import { RHFPasswordField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { ChangePasswordMutation } from '../graphql/account';
import { AccountErrorMessage, EMPTY_PASSWORD_FORM, passwordFormSchema, type PasswordFormValues } from '../lib/accountForm';

/** A separate form (§3.1 UI hints): current + new + confirm. Other sessions stay signed in (D-24). */
export const PasswordForm = () => {
	const { t } = useTranslation(['account', 'auth']);
	const toast = useToast();
	const [formError, setFormError] = useState<unknown>(null);
	const [change, { loading }] = useMutation(ChangePasswordMutation);
	const { control, handleSubmit, setError, reset } = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: EMPTY_PASSWORD_FORM,
		mode: 'onTouched',
	});

	const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
		setFormError(null);
		try {
			await change({ variables: { input: { currentPassword, newPassword } } });
			reset(EMPTY_PASSWORD_FORM);
			toast.success(t('account:password.changed'));
		} catch (error) {
			const messages = getErrorMessages(error);
			if (messages.includes(AccountErrorMessage.WrongPassword)) {
				setError('currentPassword', { message: 'account:errors.wrongPassword' }, { shouldFocus: true });
			} else if (messages.includes(AccountErrorMessage.SamePassword)) {
				setError('newPassword', { message: 'account:errors.samePassword' }, { shouldFocus: true });
			} else setFormError(error);
		}
	});

	return (
		<Box
			component="form"
			noValidate
			onSubmit={onSubmit}
			aria-labelledby="password-settings"
			sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}
		>
			<Box>
				<Typography id="password-settings" variant="h2" sx={{ fontSize: 20 }}>
					{t('account:password.title')}
				</Typography>
				<Typography variant="body2" sx={{ mt: 1, color: 'muted' }}>
					{t('account:password.text')}
				</Typography>
			</Box>
			<Box sx={{ display: 'grid', gap: 5, maxWidth: 420 }}>
				<RHFPasswordField control={control} name="currentPassword" label={t('account:password.current')} autoComplete="current-password" required />
				<RHFPasswordField
					control={control}
					name="newPassword"
					label={t('account:password.new')}
					hint={t('auth:signup.passwordRule')}
					autoComplete="new-password"
					required
				/>
				<RHFPasswordField control={control} name="confirmPassword" label={t('account:password.confirm')} autoComplete="new-password" required />
			</Box>
			{formError !== null && <ErrorState error={formError} title={t('account:password.failed')} />}
			<Box>
				<SubmitButton loading={loading} sx={{ height: 46, px: 6 }}>
					{t('account:password.submit')}
				</SubmitButton>
			</Box>
		</Box>
	);
};
