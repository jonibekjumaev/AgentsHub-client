import type { ReactNode } from 'react';
import { Box, FormHelperText, FormLabel, OutlinedInput, type OutlinedInputProps } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { visuallyHidden } from './visuallyHidden';

/** Props a control needs to be wired to its label, hint, counter and error. */
export type FieldControlProps = {
	id: string;
	'aria-describedby'?: string;
	'aria-invalid'?: true;
	'aria-required'?: true;
};

type FormFieldProps = {
	id: string;
	label: string;
	hint?: string;
	/** Already translated error text; shown instead of the hint. */
	error?: string;
	required?: boolean;
	/** Character counter, e.g. 30 / 100. */
	counter?: { count: number; max: number };
	children: (control: FieldControlProps) => ReactNode;
};

/**
 * DESIGN §3 Form controls: label above (14/700), hint 12/500 muted, counter right-aligned in the
 * same row, error 12/600 danger. The error is linked through aria-describedby and announced (role="alert").
 */
export const FormField = ({ id, label, hint, error, required, counter, children }: FormFieldProps) => {
	const { t } = useTranslation('common');
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const counterId = `${id}-counter`;

	const describedBy =
		[error ? errorId : hint ? hintId : null, counter ? counterId : null].filter(Boolean).join(' ') || undefined;

	return (
		<Box>
			<FormLabel htmlFor={id} required={required}>
				{label}
			</FormLabel>
			{children({
				id,
				'aria-describedby': describedBy,
				...(error ? { 'aria-invalid': true as const } : {}),
				...(required ? { 'aria-required': true as const } : {}),
			})}
			{(error || hint || counter) && (
				<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mt: 1.5 }}>
					{error ? (
						<FormHelperText id={errorId} error role="alert" sx={{ mt: 0 }}>
							{error}
						</FormHelperText>
					) : hint ? (
						<FormHelperText id={hintId} sx={{ mt: 0 }}>
							{hint}
						</FormHelperText>
					) : (
						<span />
					)}
					{counter && (
						<FormHelperText
							id={counterId}
							error={counter.count > counter.max}
							sx={{ mt: 0, ml: 'auto', flexShrink: 0, fontFamily: 'fontFamilyMono' }}
						>
							<span aria-hidden="true">{t('common:field.counter', counter)}</span>
							<Box component="span" sx={visuallyHidden}>
								{t('common:field.counterSpoken', counter)}
							</Box>
						</FormHelperText>
					)}
				</Box>
			)}
		</Box>
	);
};

type FormTextFieldProps = Omit<FormFieldProps, 'children' | 'counter'> &
	Omit<OutlinedInputProps, 'id' | 'error'> & {
		value: string;
		/** Shows the counter and limits input length. */
		maxLength?: number;
	};

/** FormField + OutlinedInput, with the counter derived from `value` and `maxLength`. */
export const FormTextField = ({ id, label, hint, error, required, maxLength, value, inputProps, ...input }: FormTextFieldProps) => (
	<FormField
		id={id}
		label={label}
		hint={hint}
		error={error}
		required={required}
		counter={maxLength ? { count: value.length, max: maxLength } : undefined}
	>
		{(control) => (
			<OutlinedInput
				{...input}
				fullWidth
				value={value}
				error={Boolean(error)}
				id={control.id}
				inputProps={{
					...inputProps,
					maxLength,
					'aria-describedby': control['aria-describedby'],
					'aria-invalid': control['aria-invalid'],
					'aria-required': control['aria-required'],
				}}
			/>
		)}
	</FormField>
);
