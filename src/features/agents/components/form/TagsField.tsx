import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Box, FormHelperText, FormLabel, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { radiusPx } from '@/theme/tokens';
import { TAGS_MAX, TAG_MAX_LENGTH, normalizeTag } from '../../lib/listQuery';

type TagsFieldProps = {
	id: string;
	value: string[];
	onChange: (tags: string[]) => void;
	onBlur: () => void;
	/** Translated schema error. */
	error?: string;
};

/**
 * AgentForm.html tag input: chips inside a bordered box. Enter or comma adds a tag, normalized the way
 * the API stores it (trimmed, lowercased, no duplicates); each chip has its own remove button.
 */
export const TagsField = ({ id, value, onChange, onBlur, error }: TagsFieldProps) => {
	const { t } = useTranslation('agents');
	const [draft, setDraft] = useState('');
	const [draftError, setDraftError] = useState<string | null>(null);
	const full = value.length >= TAGS_MAX;
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const shownError = draftError ?? error;

	const commit = () => {
		if (draft.trim() === '') return;
		const tag = normalizeTag(draft);
		if (!tag) {
			setDraftError(t('agents:form.errors.tagLength', { max: TAG_MAX_LENGTH }));
			return;
		}
		if (!value.includes(tag)) onChange([...value, tag]);
		setDraft('');
		setDraftError(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			commit();
		}
	};

	return (
		<Box>
			<FormLabel htmlFor={id}>{t('agents:form.tags.label')}</FormLabel>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					gap: 1.5,
					minHeight: 46,
					px: 2,
					py: 1.5,
					border: 1,
					borderColor: shownError ? 'dangerBorder' : 'inputBorder',
					borderRadius: radiusPx.md,
					bgcolor: 'surface',
					'&:focus-within': { borderColor: 'primary.main', boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.primary.main}` },
				}}
			>
				{value.map((tag) => (
					<Box
						key={tag}
						component="span"
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 0.5,
							pl: 2.5,
							borderRadius: radiusPx.pill,
							bgcolor: 'accentSoft',
							color: 'primary.main',
							fontSize: 13,
							fontWeight: 700,
						}}
					>
						{tag}
						<IconButton
							size="small"
							aria-label={t('agents:form.tags.remove', { tag })}
							onClick={() => onChange(value.filter((item) => item !== tag))}
							sx={{ color: 'inherit', p: 0.75 }}
						>
							<CloseIcon sx={{ fontSize: 14 }} />
						</IconButton>
					</Box>
				))}
				<Box
					component="input"
					id={id}
					value={draft}
					disabled={full}
					maxLength={TAG_MAX_LENGTH + 10}
					placeholder={full ? '' : t('agents:form.tags.placeholder')}
					aria-describedby={shownError ? `${errorId} ${hintId}` : hintId}
					aria-invalid={shownError ? true : undefined}
					onChange={(event) => {
						setDraft(event.target.value);
						setDraftError(null);
					}}
					onKeyDown={onKeyDown}
					onBlur={() => {
						commit();
						onBlur();
					}}
					sx={{ flex: '1 1 140px', minWidth: 0, border: 0, outline: 'none', font: 'inherit', fontSize: 15, py: 1, bgcolor: 'transparent' }}
				/>
			</Box>
			<FormHelperText id={hintId} sx={{ mt: 1.5 }}>
				{full ? t('agents:form.tags.full', { max: TAGS_MAX }) : t('agents:form.tags.hint', { max: TAGS_MAX, length: TAG_MAX_LENGTH })}
			</FormHelperText>
			{shownError && (
				<FormHelperText id={errorId} error role="alert" sx={{ mt: 0.5 }}>
					{shownError}
				</FormHelperText>
			)}
		</Box>
	);
};
