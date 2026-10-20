import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, FormHelperText, Stack, Typography } from '@mui/material';
import { useForm, useWatch, type FieldPath, type Resolver } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, getErrorMessages, toErrorKey } from '@/shared/lib/errors';
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard';
import { Avatar } from '@/shared/ui/Avatar';
import { ErrorState } from '@/shared/ui/ErrorState';
import { RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { UpdateAccountMutation, UploadAvatarMutation } from '../graphql/account';
import {
	AccountErrorMessage,
	DESC_MAX,
	EMAIL_INVALID_PREFIX,
	EMAIL_MAX,
	FULL_NAME_MAX,
	PHONE_FORMAT_PREFIX,
	WHATSAPP_FORMAT_PREFIX,
	accountFormSchema,
	toMemberUpdate,
	type AccountFormValues,
	type ValidAccountForm,
} from '../lib/accountForm';

/** Same limits as the API and the agent images (png / jpeg, ≤ 15 MB). */
const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const AVATAR_MAX_BYTES = 15_000_000;

type ProfileFormProps = { memberId: string; initialValues: AccountFormValues };

/** Profile settings: picture, nick, name, phone, contacts, description (§3.1). */
export const ProfileForm = ({ memberId, initialValues }: ProfileFormProps) => {
	const { t } = useTranslation(['account', 'auth', 'common', 'errors']);
	const toast = useToast();
	const fileInput = useRef<HTMLInputElement>(null);
	const [formError, setFormError] = useState<unknown>(null);
	const [avatarError, setAvatarError] = useState<string | null>(null);
	const [saved, setSaved] = useState(initialValues);

	const { control, handleSubmit, setError, setValue, reset, formState } = useForm<AccountFormValues, unknown, ValidAccountForm>({
		resolver: zodResolver(accountFormSchema) as Resolver<AccountFormValues, unknown, ValidAccountForm>,
		defaultValues: initialValues,
		mode: 'onTouched',
	});
	const [image, nick, fullName] = useWatch({ control, name: ['memberImage', 'memberNick', 'memberFullName'] });
	const [upload, uploadState] = useMutation(UploadAvatarMutation);
	const [update, updateState] = useMutation(UpdateAccountMutation);
	const { allowNavigation } = useUnsavedChangesGuard(formState.isDirty && !updateState.loading, t('account:leave'));

	const onPick = async (file: File | undefined) => {
		if (!file) return;
		setAvatarError(null);
		if (!AVATAR_TYPES.includes(file.type)) return setAvatarError(t('account:avatar.type'));
		if (file.size > AVATAR_MAX_BYTES) return setAvatarError(t('account:avatar.size'));
		try {
			const { data } = await upload({ variables: { file } });
			if (data) setValue('memberImage', data.imageUploader, { shouldDirty: true });
		} catch (error) {
			setAvatarError(t(toErrorKey(error)));
		}
	};

	const showServerError = (error: unknown) => {
		const messages = getErrorMessages(error);
		const field = (name: FieldPath<AccountFormValues>, message: string) => setError(name, { message }, { shouldFocus: true });
		if (getErrorCode(error) === ErrorCode.Conflict || messages.includes(AccountErrorMessage.Taken)) {
			field('memberNick', 'account:errors.taken');
			setError('memberPhone', { message: 'account:errors.taken' });
			return;
		}
		if (messages.some((message) => message.startsWith(PHONE_FORMAT_PREFIX))) return field('memberPhone', 'auth:validation.phoneFormat');
		if (messages.some((message) => message.startsWith(WHATSAPP_FORMAT_PREFIX))) return field('memberWhatsapp', 'account:errors.whatsappFormat');
		if (messages.some((message) => message.startsWith(EMAIL_INVALID_PREFIX))) return field('memberEmail', 'account:errors.email');
		setFormError(error);
	};

	const onSubmit = handleSubmit(async (form) => {
		setFormError(null);
		const input = toMemberUpdate(memberId, saved, form);
		if (!input) return;
		try {
			await update({ variables: { input } });
			// The stored values become the new baseline: the form is clean again, the guard is off.
			const next: AccountFormValues = { ...form };
			setSaved(next);
			reset(next);
			allowNavigation();
			toast.success(t('account:profile.saved'));
		} catch (error) {
			showServerError(error);
		}
	});

	const name = fullName.trim() || nick;

	return (
		<Box
			component="form"
			noValidate
			onSubmit={onSubmit}
			aria-labelledby="profile-settings"
			sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}
		>
			<Typography id="profile-settings" variant="h2" sx={{ fontSize: 20 }}>
				{t('account:profile.title')}
			</Typography>

			<Stack direction="row" spacing={4} alignItems="center" useFlexGap flexWrap="wrap">
				<Avatar memberId={memberId} name={name || '?'} image={image} size={96} radius={24} />
				<Stack spacing={2}>
					<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
						<Button
							variant="outlined"
							onClick={() => fileInput.current?.click()}
							disabled={uploadState.loading}
							startIcon={uploadState.loading ? <CircularProgress size={16} color="inherit" /> : undefined}
						>
							{t(image ? 'account:avatar.change' : 'account:avatar.add')}
						</Button>
						{image && (
							<Button variant="outlined" color="error" onClick={() => setValue('memberImage', '', { shouldDirty: true })} disabled={uploadState.loading}>
								{t('account:avatar.remove')}
							</Button>
						)}
					</Stack>
					<Typography variant="caption">{t('account:avatar.hint')}</Typography>
					{avatarError && (
						<FormHelperText error role="alert" sx={{ m: 0 }}>
							{avatarError}
						</FormHelperText>
					)}
				</Stack>
				<input
					ref={fileInput}
					type="file"
					accept="image/png,image/jpeg"
					hidden
					aria-label={t('account:avatar.add')}
					onChange={(event) => {
						void onPick(event.target.files?.[0]);
						event.target.value = '';
					}}
				/>
			</Stack>

			<Box sx={{ display: 'grid', gap: 5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
				<RHFTextField control={control} name="memberNick" label={t('auth:fields.nick')} hint={t('account:profile.nickHint')} required />
				<RHFTextField control={control} name="memberFullName" label={t('account:profile.fullName')} maxLength={FULL_NAME_MAX} />
				<RHFTextField
					control={control}
					name="memberPhone"
					label={t('auth:fields.phone')}
					hint={t('auth:signup.phoneHint')}
					type="tel"
					inputProps={{ inputMode: 'tel', autoComplete: 'tel' }}
					required
				/>
				<RHFTextField
					control={control}
					name="memberEmail"
					label={t('account:profile.email')}
					type="email"
					inputProps={{ autoComplete: 'email', maxLength: EMAIL_MAX }}
				/>
				<RHFTextField
					control={control}
					name="memberWhatsapp"
					label={t('account:profile.whatsapp')}
					hint={t('auth:signup.phoneHint')}
					type="tel"
					inputProps={{ inputMode: 'tel' }}
				/>
			</Box>
			<RHFTextField
				control={control}
				name="memberDesc"
				label={t('account:profile.desc')}
				hint={t('account:profile.descHint')}
				maxLength={DESC_MAX}
				multiline
				minRows={4}
			/>
			<Typography variant="caption" component="p">
				{t('auth:signup.privacy')}
			</Typography>

			{formError !== null && <ErrorState error={formError} title={t('account:profile.saveFailed')} />}

			<Stack direction="row" spacing={3}>
				<SubmitButton loading={updateState.loading} disabled={!formState.isDirty || uploadState.loading} sx={{ height: 46, px: 6 }}>
					{t('account:profile.submit')}
				</SubmitButton>
				<Button variant="outlined" onClick={() => reset(saved)} disabled={!formState.isDirty} sx={{ height: 46 }}>
					{t('common:actions.cancel')}
				</Button>
			</Stack>
		</Box>
	);
};
