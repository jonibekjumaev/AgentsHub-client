import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, type ApolloCache } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Checkbox, FormControlLabel, FormHelperText, FormLabel, InputAdornment, NativeSelect, OutlinedInput, Stack, Typography } from '@mui/material';
import { Controller, useForm, useWatch, type FieldPath, type Resolver } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, getErrorMessages, getValidationErrors } from '@/shared/lib/errors';
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { CreateBriefMutation, UpdateBriefMutation } from '../../graphql/myBriefs';
import {
	BRIEF_CONTENT_MAX,
	BRIEF_TITLE_MAX,
	BriefErrorMessage,
	makeBriefFormSchema,
	minDeadlineInput,
	toBriefInput,
	toBriefUpdate,
	type BriefFormValues,
	type ValidBriefForm,
} from '../../lib/briefForm';
import { briefHref } from '../../lib/detail';
import { BRIEF_CATEGORIES } from '../../lib/listQuery';
import { MY_BRIEFS_PATH } from '../../lib/myBriefs';

type BriefFormProps = {
	mode: 'create' | 'edit';
	/** Edit only. */
	briefId?: string;
	initialValues: BriefFormValues;
};

const FIELDS: FieldPath<BriefFormValues>[] = ['briefTitle', 'briefCategory', 'briefContent', 'briefBudget', 'briefDeadline'];

/** Lists change after a create or edit: drop every cached brief list (refetched on the next visit). */
const forgetBriefLists = (cache: ApolloCache<unknown>) => {
	cache.evict({ id: 'ROOT_QUERY', fieldName: 'getMyBriefs' });
	cache.evict({ id: 'ROOT_QUERY', fieldName: 'getBriefs' });
	cache.gc();
};

/** BriefForm.html aside: what makes a good brief. */
const Tips = () => {
	const { t } = useTranslation('briefs');
	return (
		<Box component="aside" aria-labelledby="brief-tips" sx={{ flex: '1 1 260px', minWidth: 0, maxWidth: { md: 320 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
			<Box sx={{ p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
				<Typography id="brief-tips" variant="overline" component="h2">
					{t('briefs:form.tips.title')}
				</Typography>
				<Box component="ol" sx={{ m: 0, mt: 3, pl: 5, display: 'flex', flexDirection: 'column', gap: 2.5, color: 'bodySoft', fontSize: 14 }}>
					{(['task', 'tools', 'numbers'] as const).map((tip) => (
						<li key={tip}>{t(`briefs:form.tips.${tip}`)}</li>
					))}
				</Box>
			</Box>
			<Typography variant="caption" component="p">
				{t('briefs:form.tips.lifecycle')}
			</Typography>
		</Box>
	);
};

/**
 * BriefForm.html, for create and edit (USER only). Validation mirrors the API (briefFormSchema); the API
 * stays the final judge and its budget / deadline messages are mapped back onto those fields.
 */
export const BriefForm = ({ mode, briefId, initialValues }: BriefFormProps) => {
	const { t } = useTranslation(['briefs', 'common', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const [formError, setFormError] = useState<unknown>(null);
	const [schema] = useState(() => makeBriefFormSchema(initialValues.briefDeadline));

	const { control, handleSubmit, setError, setFocus, setValue, formState } = useForm<BriefFormValues, unknown, ValidBriefForm>({
		// '' for an unpicked category is rejected by the schema with its own message; hence the cast.
		resolver: zodResolver(schema) as Resolver<BriefFormValues, unknown, ValidBriefForm>,
		defaultValues: initialValues,
		mode: 'onTouched',
	});
	const openToOffers = useWatch({ control, name: 'openToOffers' });

	const [createBrief, createState] = useMutation(CreateBriefMutation, { update: forgetBriefLists });
	const [updateBrief, updateState] = useMutation(UpdateBriefMutation, { update: forgetBriefLists });
	const saving = createState.loading || updateState.loading;
	const { allowNavigation } = useUnsavedChangesGuard(formState.isDirty && !saving, t('briefs:form.leave'));

	const showServerError = (error: unknown) => {
		const messages = getErrorMessages(error);
		if (messages.includes(BriefErrorMessage.BudgetPositive)) {
			setError('briefBudget', { message: 'briefs:form.errors.budgetPositive' }, { shouldFocus: true });
			return;
		}
		if (messages.includes(BriefErrorMessage.DeadlineFuture)) {
			setError('briefDeadline', { message: 'briefs:form.errors.deadlineFuture' }, { shouldFocus: true });
			return;
		}
		const fieldErrors = getValidationErrors(error).filter(({ field }) => FIELDS.includes(field as FieldPath<BriefFormValues>));
		if (fieldErrors.length > 0) {
			fieldErrors.forEach(({ field }) => setError(field as FieldPath<BriefFormValues>, { message: 'briefs:form.errors.server' }));
			setFocus(fieldErrors[0].field as FieldPath<BriefFormValues>);
			return;
		}
		setFormError(error);
	};

	const onSubmit = handleSubmit(async (form) => {
		setFormError(null);
		try {
			let savedId = briefId ?? '';
			if (mode === 'create') {
				const result = await createBrief({ variables: { input: toBriefInput(form) } });
				savedId = result.data?.createBrief._id ?? '';
				toast.success(t('briefs:form.created', { title: form.briefTitle }));
			} else {
				const input = toBriefUpdate(briefId as string, initialValues, form);
				if (input) await updateBrief({ variables: { input } });
				toast.success(t('briefs:form.saved', { title: form.briefTitle }));
			}
			allowNavigation();
			// The public page of what was just saved: that is what creators will see.
			await router.push(savedId ? briefHref(savedId) : MY_BRIEFS_PATH);
		} catch (error) {
			showServerError(error);
		}
	});

	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }}>
			<Box
				component="form"
				noValidate
				onSubmit={onSubmit}
				sx={{
					flex: '999 1 520px',
					minWidth: 0,
					display: 'flex',
					flexDirection: 'column',
					gap: 5,
					p: 6,
					bgcolor: 'surface',
					border: 1,
					borderColor: 'border',
					borderRadius: radiusPx.lg,
				}}
			>
				<RHFTextField
					control={control}
					name="briefTitle"
					label={t('briefs:form.title.label')}
					hint={t('briefs:form.title.hint')}
					maxLength={BRIEF_TITLE_MAX}
					required
				/>
				<Controller
					control={control}
					name="briefCategory"
					render={({ field, fieldState }) => (
						<Box>
							<FormLabel htmlFor="briefCategory" required>
								{t('briefs:form.category.label')}
							</FormLabel>
							<NativeSelect
								{...field}
								inputRef={field.ref}
								id="briefCategory"
								fullWidth
								input={<OutlinedInput error={Boolean(fieldState.error)} />}
								inputProps={{
									'aria-invalid': fieldState.error ? true : undefined,
									'aria-describedby': fieldState.error ? 'briefCategory-error' : undefined,
									'aria-required': true,
								}}
							>
								<option value="" disabled>
									{t('briefs:form.category.placeholder')}
								</option>
								{BRIEF_CATEGORIES.map((category) => (
									<option key={category} value={category}>
										{t(`common:enums.AgentCategory.${category}`)}
									</option>
								))}
							</NativeSelect>
							{fieldState.error?.message && (
								<FormHelperText id="briefCategory-error" error role="alert">
									{t(fieldState.error.message)}
								</FormHelperText>
							)}
						</Box>
					)}
				/>
				<RHFTextField
					control={control}
					name="briefContent"
					label={t('briefs:form.content.label')}
					hint={t('briefs:form.content.hint')}
					maxLength={BRIEF_CONTENT_MAX}
					multiline
					minRows={9}
					required
				/>

				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
					{/* D-04: a budget above 0, or none ("Open to offers"). */}
					<Box component="fieldset" sx={{ flex: '1 1 240px', m: 0, p: 0, border: 0, minWidth: 0 }}>
						<Box component="legend" sx={{ p: 0, mb: 1.5, fontSize: 14, fontWeight: 700, color: 'ink' }}>
							{t('briefs:form.budget.label')}{' '}
							<Box component="span" sx={{ color: 'muted', fontWeight: 500 }}>
								{t('briefs:form.optional')}
							</Box>
						</Box>
						<RHFTextField
							control={control}
							name="briefBudget"
							label={t('briefs:form.budget.inputLabel')}
							type="number"
							disabled={openToOffers}
							inputProps={{ min: 1, step: 'any', inputMode: 'decimal' }}
							startAdornment={<InputAdornment position="start">$</InputAdornment>}
							endAdornment={<InputAdornment position="end">USD</InputAdornment>}
						/>
						<Controller
							control={control}
							name="openToOffers"
							render={({ field }) => (
								<FormControlLabel
									sx={{ mt: 1 }}
									control={
										<Checkbox
											checked={field.value}
											onChange={(event) => {
												field.onChange(event.target.checked);
												if (event.target.checked) setValue('briefBudget', '', { shouldValidate: formState.isSubmitted });
											}}
											onBlur={field.onBlur}
											inputRef={field.ref}
										/>
									}
									label={<Typography variant="body2">{t('briefs:form.budget.openToOffers')}</Typography>}
								/>
							)}
						/>
					</Box>
					<Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
						<RHFTextField
							control={control}
							name="briefDeadline"
							type="date"
							label={t('briefs:form.deadline.label')}
							hint={t('briefs:form.deadline.hint')}
							inputProps={{ min: minDeadlineInput() }}
						/>
					</Box>
				</Box>

				{formError !== null && (
					<ErrorState
						error={formError}
						title={t(getErrorCode(formError) === ErrorCode.NotFound ? 'briefs:form.errors.gone' : 'briefs:form.errors.saveFailed')}
					/>
				)}

				<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center" justifyContent="space-between">
					<Typography variant="caption" component="p" sx={{ flex: '1 1 220px' }}>
						{t('briefs:form.publicNote')}
					</Typography>
					<Stack direction="row" spacing={3}>
						<Button component={NextLink} href={MY_BRIEFS_PATH} variant="outlined" sx={{ height: 46 }}>
							{t('common:actions.cancel')}
						</Button>
						<SubmitButton loading={saving} disabled={mode === 'edit' && !formState.isDirty} sx={{ height: 46, px: 6 }}>
							{t(mode === 'create' ? 'briefs:form.submitCreate' : 'briefs:form.submitEdit')}
						</SubmitButton>
					</Stack>
				</Stack>
			</Box>
			<Tips />
		</Box>
	);
};
