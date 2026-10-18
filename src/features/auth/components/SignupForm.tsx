import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { RHFPasswordField, RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useGuestOnly } from '../hooks/useGuestOnly';
import { useSignup } from '../hooks/useSignup';
import { meetsPasswordRule, signupSchema, type SignupData, type SignupValues } from '../schemas';
import { AuthCard, AuthCardSkeleton } from './AuthCard';
import { FormAlert } from './FormAlert';
import { RoleCards } from './RoleCards';
import { WhyAgentsHub } from './WhyAgentsHub';

/** Signup.html: role cards (D-14), nick, E.164 phone (D-25), password (D-26), "Why AgentsHub" panel. */
export const SignupForm = () => {
	const { t } = useTranslation(['auth', 'errors']);
	const showForm = useGuestOnly();
	const { signup, errorKey } = useSignup();
	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<SignupValues, unknown, SignupData>({
		resolver: zodResolver(signupSchema),
		// memberType starts unselected: the choice must be explicit (FRONTEND_MIGRATION §1.1).
		defaultValues: { memberNick: '', memberPhone: '', memberPassword: '' },
	});
	const password = useWatch({ control, name: 'memberPassword' }) ?? '';

	return (
		<Box sx={{ width: '100%', maxWidth: 1100, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
			<Box sx={{ flex: '999 1 460px', minWidth: 0 }}>
				{showForm ? (
					<AuthCard
						title={t('auth:signup.title')}
						subtitle={t('auth:signup.subtitle')}
						onSubmit={handleSubmit(async (data) => {
							await signup(data);
						})}
					>
						{errorKey && <FormAlert severity="error">{t(errorKey)}</FormAlert>}

						<RoleCards control={control} />
						<RHFTextField
							control={control}
							name="memberNick"
							id="signup-nick"
							label={t('auth:fields.nick')}
							hint={t('auth:signup.nickHint')}
							autoComplete="username"
							inputProps={{ autoCapitalize: 'none', spellCheck: false }}
						/>
						<RHFTextField
							control={control}
							name="memberPhone"
							id="signup-phone"
							label={t('auth:fields.phone')}
							hint={t('auth:signup.phoneHint')}
							type="tel"
							autoComplete="tel"
							inputProps={{ inputMode: 'tel' }}
						/>
						<RHFPasswordField
							control={control}
							name="memberPassword"
							id="signup-password"
							label={t('auth:fields.password')}
							hint={t('auth:signup.passwordRule')}
							hintState={meetsPasswordRule(password) ? 'valid' : undefined}
							autoComplete="new-password"
						/>
						<SubmitButton size="large" loading={isSubmitting}>
							{t('auth:signup.submit')}
						</SubmitButton>
						<Typography variant="caption" component="p" sx={{ lineHeight: 1.6 }}>
							{t('auth:signup.privacy')}
						</Typography>
					</AuthCard>
				) : (
					<AuthCardSkeleton fields={4} />
				)}
			</Box>
			<WhyAgentsHub />
		</Box>
	);
};
