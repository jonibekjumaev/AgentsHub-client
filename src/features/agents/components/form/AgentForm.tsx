import { useCallback, useId, useState } from 'react';
import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, type ApolloCache } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, FormHelperText, FormLabel, InputAdornment, NativeSelect, OutlinedInput, Radio, Stack, Typography } from '@mui/material';
import { Controller, useForm, useWatch, type Control, type FieldPath, type Resolver } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ErrorCode, ErrorMessage, getErrorCode, getErrorMessages, getValidationErrors } from '@/shared/lib/errors';
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { CreateAgentMutation, UpdateAgentMutation } from '../../graphql/agentForm';
import { useImageUploads } from '../../hooks/useImageUploads';
import {
	DEMO_URL_MAX,
	DESC_MAX,
	TITLE_MAX,
	agentFormSchema,
	isPaidPricing,
	parsePrice,
	toProductInput,
	toProductUpdate,
	type AgentFormValues,
	type ValidAgentForm,
} from '../../lib/agentForm';
import { AGENT_CATEGORIES, AGENT_PRICINGS } from '../../lib/listQuery';
import { MY_AGENTS_PATH, agentPreviewHref } from '../../lib/myAgents';
import { AgentCard } from '../AgentCard';
import { ImageManager } from './ImageManager';
import { TagsField } from './TagsField';

type AgentFormProps = {
	mode: 'create' | 'edit';
	/** Edit only. */
	agentId?: string;
	initialValues: AgentFormValues;
	/** For the preview card ("by @nick"). */
	creator: { _id: string; memberNick: string };
};

const FIELDS: FieldPath<AgentFormValues>[] = [
	'productTitle',
	'productCategory',
	'productPricing',
	'productPrice',
	'productDemoUrl',
	'productTags',
	'productImages',
	'productDesc',
];

/** Lists change after a create, edit or delete: drop every cached "My agents" page (refetched on next visit). */
const forgetCreatorLists = (cache: ApolloCache<unknown>) => {
	cache.evict({ id: 'ROOT_QUERY', fieldName: 'getCreatorProducts' });
	cache.gc();
};

type LivePreviewProps = {
	control: Control<AgentFormValues>;
	agentId?: string;
	coverPath?: string;
	creator: AgentFormProps['creator'];
};

/**
 * md+: a live AgentCard of the form. It watches the fields on its own, so typing re-renders only this card,
 * not the whole form. It repeats the form, so it is inert (no tab stops, skipped by screen readers).
 */
const LivePreview = ({ control, agentId, coverPath, creator }: LivePreviewProps) => {
	const { t } = useTranslation('agents');
	const [title, category, pricing, price] = useWatch({
		control,
		name: ['productTitle', 'productCategory', 'productPricing', 'productPrice'],
	});

	return (
		<Box
			component="aside"
			aria-labelledby="agent-preview"
			sx={{ display: { xs: 'none', md: 'block' }, flex: '0 0 300px', position: 'sticky', top: 24 }}
		>
			<Typography id="agent-preview" variant="overline" component="h2" sx={{ mb: 3 }}>
				{t('agents:form.preview')}
			</Typography>
			<Box ref={(element: HTMLElement | null) => element?.setAttribute('inert', '')}>
				<AgentCard
					agent={{
						_id: agentId ?? 'preview',
						productTitle: title.trim() || t('agents:form.previewTitle'),
						productCategory: category || 'OTHER',
						productPricing: pricing || 'FREE',
						productPrice: isPaidPricing(pricing) ? parsePrice(price) : null,
						productImages: coverPath ? [coverPath] : [],
						productLikes: 0,
						productViews: 0,
						memberData: creator,
					}}
				/>
			</Box>
		</Box>
	);
};

const Section = ({ title, id, children }: { title: string; id: string; children: ReactNode }) => (
	<Box
		component="section"
		aria-labelledby={id}
		sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}
	>
		<Typography id={id} variant="h2" sx={{ fontSize: 20 }}>
			{title}
		</Typography>
		{children}
	</Box>
);

/**
 * AgentForm.html, for create and edit. Validation mirrors the API (agentFormSchema); the API stays the
 * final judge and its field errors are mapped back onto the fields. Images upload as soon as they are
 * picked; the form can't be submitted while one is still uploading or failed.
 */
export const AgentForm = ({ mode, agentId, initialValues, creator }: AgentFormProps) => {
	const { t } = useTranslation(['agents', 'common', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const ids = { basics: useId(), pricing: useId(), images: useId(), details: useId() };
	const [formError, setFormError] = useState<unknown>(null);
	const [imagesError, setImagesError] = useState<string | null>(null);

	const { control, handleSubmit, setValue, setError, setFocus, formState } = useForm<AgentFormValues, unknown, ValidAgentForm>({
		// The form holds '' for an unpicked category / pricing, which the schema rejects with its own message;
		// the schema's input type has no '', hence the cast.
		resolver: zodResolver(agentFormSchema) as Resolver<AgentFormValues, unknown, ValidAgentForm>,
		defaultValues: initialValues,
		mode: 'onTouched',
	});
	// Only the pricing re-renders the whole form (it shows / hides the price); the preview watches the rest itself.
	const pricing = useWatch({ control, name: 'productPricing' });

	const onPathsChange = useCallback(
		(paths: string[]) => setValue('productImages', paths, { shouldDirty: true, shouldValidate: formState.isSubmitted }),
		[setValue, formState.isSubmitted],
	);
	const uploads = useImageUploads(initialValues.productImages, onPathsChange);

	const [createAgent, createState] = useMutation(CreateAgentMutation, { update: forgetCreatorLists });
	const [updateAgent, updateState] = useMutation(UpdateAgentMutation, { update: forgetCreatorLists });
	const saving = createState.loading || updateState.loading;

	const dirty = formState.isDirty || uploads.uploading;
	const { allowNavigation } = useUnsavedChangesGuard(dirty && !saving, t('agents:form.leave'));

	/** API errors back onto the fields; anything else in the alert above the buttons. */
	const showServerError = (error: unknown) => {
		const code = getErrorCode(error);
		const messages = getErrorMessages(error);
		if (code === ErrorCode.Conflict) {
			setError('productTitle', { message: 'agents:form.errors.titleTaken' }, { shouldFocus: true });
			return;
		}
		if (messages.includes(ErrorMessage.PriceRequired) || messages.includes(ErrorMessage.PriceNotAllowed)) {
			setError('productPrice', { message: 'agents:form.errors.priceServer' }, { shouldFocus: true });
			return;
		}
		const fieldErrors = getValidationErrors(error).filter(({ field }) => FIELDS.includes(field as FieldPath<AgentFormValues>));
		if (fieldErrors.length > 0) {
			fieldErrors.forEach(({ field }) => setError(field as FieldPath<AgentFormValues>, { message: 'agents:form.errors.server' }));
			setFocus(fieldErrors[0].field as FieldPath<AgentFormValues>);
			return;
		}
		setFormError(error);
	};

	const onSubmit = handleSubmit(async (form) => {
		setFormError(null);
		if (uploads.uploading || uploads.hasErrors) {
			setImagesError(t(uploads.uploading ? 'agents:form.errors.imagesUploading' : 'agents:form.errors.imagesFailed'));
			return;
		}
		setImagesError(null);
		try {
			let savedId = agentId ?? '';
			if (mode === 'create') {
				const result = await createAgent({ variables: { input: toProductInput(form) } });
				savedId = result.data?.createProduct._id ?? '';
				toast.success(t('agents:form.created', { title: form.productTitle }));
			} else {
				const input = toProductUpdate(agentId as string, initialValues, form);
				if (input) await updateAgent({ variables: { input } });
				toast.success(t('agents:form.saved', { title: form.productTitle }));
			}
			allowNavigation();
			// The owner's preview of what was just saved (S3c); My agents if the id is somehow missing.
			await router.push(savedId ? agentPreviewHref(savedId) : MY_AGENTS_PATH);
		} catch (error) {
			showServerError(error);
		}
	});

	const paid = isPaidPricing(pricing);
	const firstImage = uploads.items.find((item) => item.status === 'done' && item.path)?.path;
	const errorText = (name: keyof AgentFormValues) => {
		const message = formState.errors[name]?.message;
		return message ? t(message) : undefined;
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
			<Box component="form" noValidate onSubmit={onSubmit} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
				<Section title={t('agents:form.sections.basics')} id={ids.basics}>
					<RHFTextField control={control} name="productTitle" label={t('agents:form.title.label')} maxLength={TITLE_MAX} required />
					<Controller
						control={control}
						name="productCategory"
						render={({ field, fieldState }) => (
							<Box>
								<FormLabel htmlFor="productCategory" required>
									{t('agents:form.category.label')}
								</FormLabel>
								<NativeSelect
									{...field}
									inputRef={field.ref}
									id="productCategory"
									fullWidth
									input={<OutlinedInput error={Boolean(fieldState.error)} />}
									inputProps={{
										'aria-invalid': fieldState.error ? true : undefined,
										'aria-describedby': fieldState.error ? 'productCategory-error' : undefined,
										'aria-required': true,
									}}
								>
									<option value="" disabled>
										{t('agents:form.category.placeholder')}
									</option>
									{AGENT_CATEGORIES.map((category) => (
										<option key={category} value={category}>
											{t(`common:enums.AgentCategory.${category}`)}
										</option>
									))}
								</NativeSelect>
								{fieldState.error?.message && (
									<FormHelperText id="productCategory-error" error role="alert">
										{t(fieldState.error.message)}
									</FormHelperText>
								)}
							</Box>
						)}
					/>
					<RHFTextField
						control={control}
						name="productDemoUrl"
						type="url"
						label={t('agents:form.demoUrl.label')}
						hint={t('agents:form.demoUrl.hint')}
						placeholder="https://"
						maxLength={DEMO_URL_MAX}
					/>
				</Section>

				<Section title={t('agents:form.sections.pricing')} id={ids.pricing}>
					<Controller
						control={control}
						name="productPricing"
						render={({ field, fieldState }) => (
							<Box
								component="fieldset"
								aria-describedby={fieldState.error ? 'productPricing-error' : undefined}
								sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
							>
								<FormLabel component="legend" required sx={{ mb: 2 }}>
									{t('agents:form.pricing.label')}
								</FormLabel>
								<Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
									{AGENT_PRICINGS.map((option) => {
										const checked = field.value === option;
										return (
											<Box
												key={option}
												component="label"
												sx={{
													display: 'flex',
													gap: 1,
													alignItems: 'flex-start',
													p: 3,
													cursor: 'pointer',
													borderRadius: radiusPx.md,
													border: checked ? 2 : 1,
													borderColor: checked ? 'primary.main' : fieldState.error ? 'dangerBorder' : 'border',
													bgcolor: checked ? 'accentSoft' : 'surface',
												}}
											>
												<Radio
													size="small"
													name={field.name}
													value={option}
													checked={checked}
													onChange={() => field.onChange(option)}
													onBlur={field.onBlur}
													inputRef={option === AGENT_PRICINGS[0] ? field.ref : undefined}
													sx={{ p: 0.5 }}
												/>
												<Box>
													<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t(`common:enums.ProductPricing.${option}`)}</Typography>
													<Typography variant="caption" component="span">
														{t(`agents:form.pricing.hints.${option}`)}
													</Typography>
												</Box>
											</Box>
										);
									})}
								</Box>
								{fieldState.error?.message && (
									<FormHelperText id="productPricing-error" error role="alert">
										{t(fieldState.error.message)}
									</FormHelperText>
								)}
							</Box>
						)}
					/>
					{/* D-03: a price only for one-time and subscription; it's never sent for the others. */}
					{paid && (
						<Box sx={{ maxWidth: 260 }}>
							<RHFTextField
								control={control}
								name="productPrice"
								type="number"
								label={t(pricing === 'SUBSCRIPTION' ? 'agents:form.price.monthly' : 'agents:form.price.oneTime')}
								required
								inputProps={{ min: 0.01, step: 'any', inputMode: 'decimal' }}
								startAdornment={<InputAdornment position="start">$</InputAdornment>}
								endAdornment={
									pricing === 'SUBSCRIPTION' ? <InputAdornment position="end">{t('agents:form.price.perMonth')}</InputAdornment> : undefined
								}
							/>
						</Box>
					)}
				</Section>

				<Section title={t('agents:form.sections.images')} id={ids.images}>
					<ImageManager uploads={uploads} headingId={ids.images} error={imagesError ?? errorText('productImages')} />
				</Section>

				<Section title={t('agents:form.sections.details')} id={ids.details}>
					<Controller
						control={control}
						name="productTags"
						render={({ field, fieldState }) => (
							<TagsField
								id="productTags"
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
							/>
						)}
					/>
					<RHFTextField
						control={control}
						name="productDesc"
						label={t('agents:form.description.label')}
						hint={t('agents:form.description.hint')}
						maxLength={DESC_MAX}
						multiline
						minRows={8}
						required
					/>
				</Section>

				{formError !== null && (
					<ErrorState
						error={formError}
						title={t(getErrorCode(formError) === ErrorCode.NotFound ? 'agents:form.errors.gone' : 'agents:form.errors.saveFailed')}
					/>
				)}

				<Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
					<SubmitButton loading={saving} disabled={mode === 'edit' && !formState.isDirty} sx={{ height: 46, px: 6 }}>
						{t(mode === 'create' ? 'agents:form.submitCreate' : 'agents:form.submitEdit')}
					</SubmitButton>
					<Button component={NextLink} href={MY_AGENTS_PATH} variant="outlined" sx={{ height: 46 }}>
						{t('common:actions.cancel')}
					</Button>
				</Stack>
				{mode === 'create' && (
					<Typography variant="caption" component="p">
						{t('agents:form.publishNote')}
					</Typography>
				)}
			</Box>

			<LivePreview control={control} agentId={agentId} coverPath={firstImage ?? undefined} creator={creator} />
		</Box>
	);
};
