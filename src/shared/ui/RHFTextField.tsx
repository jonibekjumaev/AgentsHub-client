import { useState } from 'react';
import type { ReactNode } from 'react';
import { IconButton, InputAdornment, type OutlinedInputProps } from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { FormTextField } from './FormField';

type RHFTextFieldProps<T extends FieldValues> = Omit<
	OutlinedInputProps,
	'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'inputRef'
> & {
	name: FieldPath<T>;
	control: Control<T>;
	label: string;
	/** Defaults to the field name. */
	id?: string;
	hint?: ReactNode;
	hintState?: 'valid';
	required?: boolean;
	maxLength?: number;
};

/**
 * FormTextField wired to react-hook-form. The schema's error message is an i18n key
 * (e.g. 'auth:validation.nickLength'); it is translated here.
 */
export const RHFTextField = <T extends FieldValues>({ name, control, id, ...props }: RHFTextFieldProps<T>) => {
	const { t } = useTranslation();
	const { field, fieldState } = useController({ name, control });

	return (
		<FormTextField
			{...props}
			id={id ?? name}
			name={field.name}
			value={(field.value as string | undefined) ?? ''}
			onChange={field.onChange}
			onBlur={field.onBlur}
			inputRef={field.ref}
			error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
		/>
	);
};

/** RHFTextField for passwords, with a show/hide toggle (Login.html). */
export const RHFPasswordField = <T extends FieldValues>(props: Omit<RHFTextFieldProps<T>, 'type' | 'endAdornment'>) => {
	const { t } = useTranslation('common');
	const [visible, setVisible] = useState(false);

	return (
		<RHFTextField
			{...props}
			type={visible ? 'text' : 'password'}
			endAdornment={
				<InputAdornment position="end">
					<IconButton
						edge="end"
						size="small"
						aria-label={t(visible ? 'common:field.hidePassword' : 'common:field.showPassword')}
						onClick={() => setVisible((value) => !value)}
						sx={{ color: 'muted', mr: 0.5 }}
					>
						{visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
					</IconButton>
				</InputAdornment>
			}
		/>
	);
};
