import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { RHFPasswordField, RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useGuestOnly } from '../hooks/useGuestOnly';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginData, type LoginValues } from '../schemas';
import { AuthCard, AuthCardSkeleton } from './AuthCard';
import { AuthSwitchLink } from './AuthSwitchLink';
import { FormAlert } from './FormAlert';

/** Login.html. Every failed login shows one message (D-27); blocked and network get their own. */
export const LoginForm = () => {
	const { t } = useTranslation(['auth', 'errors']);
	const { query } = useRouter();
	const showForm = useGuestOnly();
	const { login, errorKey } = useLogin();
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<LoginValues, unknown, LoginData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { memberNick: '', memberPassword: '' },
	});

	if (!showForm) return <Box sx={{ width: '100%', maxWidth: 440 }}><AuthCardSkeleton /></Box>;

	// errorLink sent a blocked member here (?reason=blocked); a new error replaces the notice.
	const blockedNotice = query.reason === 'blocked' && !errorKey;

	return (
		<Box sx={{ width: '100%', maxWidth: 440 }}>
			<AuthCard
				title={t('auth:login.title')}
				subtitle={t('auth:login.subtitle')}
				onSubmit={handleSubmit(async (data) => {
					await login(data);
				})}
			>
				{errorKey && <FormAlert severity="error">{t(errorKey)}</FormAlert>}
				{blockedNotice && <FormAlert severity="info">{t('auth:login.blockedNotice')}</FormAlert>}

				<RHFTextField
					control={control}
					name="memberNick"
					id="login-nick"
					label={t('auth:fields.nick')}
					autoComplete="username"
					inputProps={{ autoCapitalize: 'none', spellCheck: false }}
				/>
				<RHFPasswordField
					control={control}
					name="memberPassword"
					id="login-password"
					label={t('auth:fields.password')}
					autoComplete="current-password"
				/>
				<SubmitButton size="large" loading={isSubmitting}>
					{t('auth:login.submit')}
				</SubmitButton>

				<Divider />
				<Typography variant="body2" sx={{ color: 'muted', textAlign: 'center' }}>
					<AuthSwitchLink to="signup" promptKey="auth:login.noAccount" linkKey="auth:login.signupLink" />
				</Typography>
			</AuthCard>
		</Box>
	);
};
