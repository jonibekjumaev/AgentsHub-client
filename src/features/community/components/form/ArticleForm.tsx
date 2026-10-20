import { useRef, useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMutation, type ApolloCache } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, FormHelperText, FormLabel, NativeSelect, OutlinedInput, Stack, Typography } from '@mui/material';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { mediaUrl } from '@/shared/lib/media';
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard';
import { ErrorState } from '@/shared/ui/ErrorState';
import { RHFTextField } from '@/shared/ui/RHFTextField';
import { SubmitButton } from '@/shared/ui/SubmitButton';
import { useToast } from '@/shared/ui/toast';
import { radiusPx } from '@/theme/tokens';
import { CreateArticleMutation, UpdateArticleMutation, UploadArticleImageMutation } from '../../graphql/articles';
import {
	ARTICLE_CATEGORIES,
	ARTICLE_CONTENT_MAX,
	ARTICLE_TITLE_MAX,
	MY_ARTICLES_PATH,
	articleFormSchema,
	articleHref,
	toArticleInput,
	toArticleUpdate,
	type ArticleFormValues,
	type ValidArticleForm,
} from '../../lib/articles';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const IMAGE_MAX_BYTES = 15_000_000;

const forgetArticleLists = (cache: ApolloCache<unknown>) => {
	cache.evict({ id: 'ROOT_QUERY', fieldName: 'getBoardArticles' });
	cache.gc();
};

type ArticleFormProps = { mode: 'create' | 'edit'; articleId?: string; initialValues: ArticleFormValues };

/** Create / edit an article (§3.10): category, title 3–50, text 3–250, one optional image. */
export const ArticleForm = ({ mode, articleId, initialValues }: ArticleFormProps) => {
	const { t } = useTranslation(['community', 'common', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const fileInput = useRef<HTMLInputElement>(null);
	const [formError, setFormError] = useState<unknown>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const { control, handleSubmit, setValue, formState } = useForm<ArticleFormValues, unknown, ValidArticleForm>({
		resolver: zodResolver(articleFormSchema) as Resolver<ArticleFormValues, unknown, ValidArticleForm>,
		defaultValues: initialValues,
		mode: 'onTouched',
	});
	const image = useWatch({ control, name: 'articleImage' });
	const [upload, uploadState] = useMutation(UploadArticleImageMutation);
	const [create, createState] = useMutation(CreateArticleMutation, { update: forgetArticleLists });
	const [save, saveState] = useMutation(UpdateArticleMutation, { update: forgetArticleLists });
	const saving = createState.loading || saveState.loading;
	const { allowNavigation } = useUnsavedChangesGuard(formState.isDirty && !saving, t('community:form.leave'));

	const onPick = async (file: File | undefined) => {
		if (!file) return;
		setImageError(null);
		if (!IMAGE_TYPES.includes(file.type)) return setImageError(t('community:form.image.type'));
		if (file.size > IMAGE_MAX_BYTES) return setImageError(t('community:form.image.size'));
		try {
			const { data } = await upload({ variables: { file } });
			if (data) setValue('articleImage', data.imageUploader, { shouldDirty: true });
		} catch (error) {
			setImageError(t(toErrorKey(error)));
		}
	};

	const onSubmit = handleSubmit(async (form) => {
		setFormError(null);
		try {
			let savedId = articleId ?? '';
			if (mode === 'create') {
				const result = await create({ variables: { input: toArticleInput(form) } });
				savedId = result.data?.createBoardArticle._id ?? '';
				toast.success(t('community:form.created'));
			} else {
				const input = toArticleUpdate(articleId as string, initialValues, form);
				if (input) await save({ variables: { input } });
				toast.success(t('community:form.saved'));
			}
			allowNavigation();
			await router.push(savedId ? articleHref(savedId) : MY_ARTICLES_PATH);
		} catch (error) {
			setFormError(error);
		}
	});

	const src = mediaUrl(image);

	return (
		<Box
			component="form"
			noValidate
			onSubmit={onSubmit}
			sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg, maxWidth: 760 }}
		>
			<Controller
				control={control}
				name="articleCategory"
				render={({ field, fieldState }) => (
					<Box>
						<FormLabel htmlFor="articleCategory" required>
							{t('community:form.category')}
						</FormLabel>
						<NativeSelect
							{...field}
							inputRef={field.ref}
							id="articleCategory"
							fullWidth
							disabled={mode === 'edit'}
							input={<OutlinedInput error={Boolean(fieldState.error)} />}
							inputProps={{ 'aria-invalid': fieldState.error ? true : undefined, 'aria-describedby': fieldState.error ? 'articleCategory-error' : mode === 'edit' ? 'articleCategory-hint' : undefined }}
						>
							<option value="" disabled>
								{t('community:form.categoryPlaceholder')}
							</option>
							{ARTICLE_CATEGORIES.map((category) => (
								<option key={category} value={category}>
									{t(`community:categories.${category}`)}
								</option>
							))}
						</NativeSelect>
						{mode === 'edit' && <FormHelperText id="articleCategory-hint">{t('community:form.categoryLocked')}</FormHelperText>}
						{fieldState.error?.message && (
							<FormHelperText id="articleCategory-error" error role="alert">
								{t(fieldState.error.message)}
							</FormHelperText>
						)}
					</Box>
				)}
			/>
			<RHFTextField control={control} name="articleTitle" label={t('community:form.title')} maxLength={ARTICLE_TITLE_MAX} required />
			<RHFTextField control={control} name="articleContent" label={t('community:form.content')} hint={t('community:form.contentHint')} maxLength={ARTICLE_CONTENT_MAX} multiline minRows={6} required />

			<Stack spacing={2}>
				<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
					{t('community:form.image.label')}{' '}
					<Box component="span" sx={{ color: 'muted', fontWeight: 500 }}>
						{t('community:form.optional')}
					</Box>
				</Typography>
				{src && (
					<Box sx={{ position: 'relative', width: 240, maxWidth: '100%', aspectRatio: '16 / 9', borderRadius: radiusPx.md, overflow: 'hidden', bgcolor: 'ground' }}>
						<Image src={src} alt="" fill sizes="240px" style={{ objectFit: 'cover' }} />
					</Box>
				)}
				<Stack direction="row" spacing={2}>
					<Button
						variant="outlined"
						onClick={() => fileInput.current?.click()}
						disabled={uploadState.loading}
						startIcon={uploadState.loading ? <CircularProgress size={16} color="inherit" /> : undefined}
					>
						{t(image ? 'community:form.image.change' : 'community:form.image.add')}
					</Button>
					{image && (
						<Button variant="outlined" color="error" onClick={() => setValue('articleImage', '', { shouldDirty: true })}>
							{t('community:form.image.remove')}
						</Button>
					)}
				</Stack>
				{imageError && (
					<FormHelperText error role="alert" sx={{ m: 0 }}>
						{imageError}
					</FormHelperText>
				)}
				<input
					ref={fileInput}
					type="file"
					accept="image/png,image/jpeg"
					hidden
					aria-label={t('community:form.image.add')}
					onChange={(event) => {
						void onPick(event.target.files?.[0]);
						event.target.value = '';
					}}
				/>
			</Stack>

			{formError !== null && (
				<ErrorState
					error={formError}
					title={t(getErrorCode(formError) === ErrorCode.NotFound ? 'community:form.errors.gone' : 'community:form.errors.saveFailed')}
				/>
			)}
			<Stack direction="row" spacing={3}>
				<SubmitButton loading={saving} disabled={uploadState.loading || (mode === 'edit' && !formState.isDirty)} sx={{ height: 46, px: 6 }}>
					{t(mode === 'create' ? 'community:form.submitCreate' : 'community:form.submitEdit')}
				</SubmitButton>
				<Button component={NextLink} href={MY_ARTICLES_PATH} variant="outlined" sx={{ height: 46 }}>
					{t('common:actions.cancel')}
				</Button>
			</Stack>
		</Box>
	);
};
