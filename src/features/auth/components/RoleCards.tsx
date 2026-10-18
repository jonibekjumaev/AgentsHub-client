import { Box, FormHelperText, Radio, Typography } from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { MemberType } from '@/gql/enums';
import { radiusPx } from '@/theme/tokens';
import type { SignupValues } from '../schemas';

const ROLES = [MemberType.User, MemberType.Creator] as const;

/** Signup.html "I want to": two radio cards; selected = 2px accent border + accentSoft (DESIGN §3). */
export const RoleCards = ({ control }: { control: Control<SignupValues> }) => {
	const { t } = useTranslation('auth');
	const { field, fieldState } = useController({ name: 'memberType', control });
	const error = fieldState.error?.message;
	const describedBy = error ? 'signup-role-note signup-role-error' : 'signup-role-note';

	return (
		<Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
			<Typography component="legend" sx={{ fontSize: 14, fontWeight: 700, color: 'ink', mb: 2.5, p: 0 }}>
				{t('auth:signup.roleLegend')}
			</Typography>
			<Box
				role="radiogroup"
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}
			>
				{ROLES.map((role, index) => {
					const selected = field.value === role;
					return (
						<Box
							key={role}
							component="label"
							sx={{
								display: 'flex',
								gap: 3,
								alignItems: 'flex-start',
								p: selected ? 4 : '17px',
								border: selected ? 2 : 1,
								borderColor: selected ? 'primary.main' : error ? 'dangerBorder' : 'border',
								borderRadius: radiusPx.lg,
								bgcolor: selected ? 'accentSoft' : 'surface',
								cursor: 'pointer',
								'&:focus-within': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
							}}
						>
							<Radio
								name={field.name}
								value={role}
								checked={selected}
								onChange={() => field.onChange(role)}
								onBlur={field.onBlur}
								// RHF focuses the first radio when the role is missing on submit.
								inputRef={index === 0 ? field.ref : undefined}
								size="small"
								sx={{ p: 0, mt: '2px' }}
							/>
							<Box component="span">
								<Box component="span" sx={{ display: 'block', fontWeight: 800, color: 'ink' }}>
									{t(`auth:signup.roles.${role}.title`)}
								</Box>
								<Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: 13, lineHeight: 1.5, color: 'bodySoft' }}>
									{t(`auth:signup.roles.${role}.text`)}
								</Box>
							</Box>
						</Box>
					);
				})}
			</Box>
			<FormHelperText id="signup-role-note" sx={{ mt: 2.5 }}>
				{t('auth:signup.roleNote')}
			</FormHelperText>
			{error && (
				<FormHelperText id="signup-role-error" error role="alert" sx={{ mt: 1 }}>
					{t(error)}
				</FormHelperText>
			)}
		</Box>
	);
};
