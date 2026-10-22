import { useEffect, useId, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Box, Button, ButtonBase, FormHelperText, IconButton, LinearProgress, Typography } from '@mui/material';
import {
	AddPhotoAlternateOutlined as AddPhotoIcon,
	ArrowBack as ArrowBackIcon,
	ArrowForward as ArrowForwardIcon,
	Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { radiusPx } from '@/theme/tokens';
import type { useImageUploads } from '../../hooks/useImageUploads';
import { IMAGES_MAX } from '../../lib/agentForm';
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES } from '../../lib/imageFiles';

type ImageManagerProps = {
	uploads: ReturnType<typeof useImageUploads>;
	/** Translated field error (e.g. "Add at least one image"). */
	error?: string;
	headingId: string;
};

const tileSx = {
	position: 'relative',
	aspectRatio: '4 / 3',
	overflow: 'hidden',
	borderRadius: radiusPx.md,
	border: 1,
	borderColor: 'border',
	bgcolor: 'accentSoft',
} as const;

const iconButtonSx = {
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	width: 32,
	height: 32,
	'&:hover': { bgcolor: 'surface', borderColor: 'inputBorder' },
	'&.Mui-disabled': { bgcolor: 'surface', opacity: 0.5 },
} as const;

/**
 * AgentForm.html images: 4:3 tiles, the first is the cover, then a dashed "Add images" tile.
 * Reordering uses real buttons (earlier / later), so it works with keyboard and screen readers;
 * each move is announced. Files can also be dropped on the add tile.
 */
export const ImageManager = ({ uploads, error, headingId }: ImageManagerProps) => {
	const { t } = useTranslation('agents');
	const inputRef = useRef<HTMLInputElement>(null);
	const hintId = useId();
	const errorId = useId();
	const [announcement, setAnnouncement] = useState('');
	const [dragging, setDragging] = useState(false);
	const { items, rejected } = uploads;
	const full = items.length >= IMAGES_MAX;
	const count = items.length;

	/** Buttons by "<key>:earlier|later", to keep focus on the moved image (moving a DOM node can drop focus). */
	const moveButtons = useRef(new Map<string, HTMLButtonElement | null>());
	const [refocus, setRefocus] = useState<{ key: string; direction: 'earlier' | 'later' } | null>(null);

	useEffect(() => {
		if (!refocus) return;
		const { key, direction } = refocus;
		const other = direction === 'earlier' ? 'later' : 'earlier';
		// At either end the pressed button is now disabled: use the other one.
		const target = [moveButtons.current.get(`${key}:${direction}`), moveButtons.current.get(`${key}:${other}`)].find(
			(button) => button && !button.disabled,
		);
		target?.focus();
		setRefocus(null);
	}, [refocus, items]);

	const move = (key: string, from: number, to: number) => {
		uploads.move(from, to);
		setRefocus({ key, direction: to < from ? 'earlier' : 'later' });
		setAnnouncement(t('agents:form.images.moved', { from: from + 1, to: to + 1 }));
	};

	const remove = (key: string, index: number) => {
		uploads.remove(key);
		setAnnouncement(t('agents:form.images.removed', { index: index + 1 }));
	};

	const onDrop = (event: DragEvent) => {
		event.preventDefault();
		setDragging(false);
		uploads.addFiles(Array.from(event.dataTransfer.files));
	};

	return (
		<Box>
			<Box
				component="ul"
				aria-labelledby={headingId}
				sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 3, gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
			>
				{items.map((item, index) => {
					const label = t('agents:form.images.label', { index: index + 1, count });
					return (
						<Box component="li" key={item.key} aria-label={label} sx={tileSx}>
							{item.preview && (
								// Local previews are blob: URLs, which next/image can't optimize.
								<Box
									component="img"
									src={item.preview}
									alt=""
									sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: item.status === 'done' ? 1 : 0.6 }}
								/>
							)}
							{index === 0 && (
								<Box
									component="span"
									sx={{
										position: 'absolute',
										top: 8,
										left: 8,
										px: 2,
										py: 0.5,
										borderRadius: radiusPx.pill,
										bgcolor: 'primary.main',
										color: 'primary.contrastText',
										fontSize: 11,
										fontWeight: 800,
									}}
								>
									{t('agents:form.images.cover')}
								</Box>
							)}
							<IconButton
								size="small"
								aria-label={t('agents:form.images.remove', { index: index + 1 })}
								onClick={() => remove(item.key, index)}
								sx={{ ...iconButtonSx, position: 'absolute', top: 6, right: 6 }}
							>
								<CloseIcon fontSize="small" />
							</IconButton>

							{item.status === 'uploading' && (
								<Box sx={{ position: 'absolute', left: 8, right: 8, bottom: 8 }}>
									<LinearProgress
										variant="determinate"
										value={item.progress}
										aria-label={t('agents:form.images.uploading', { index: index + 1 })}
										sx={{ height: 6, borderRadius: radiusPx.pill }}
									/>
								</Box>
							)}
							{item.status === 'error' && (
								<Box
									role="alert"
									sx={{
										position: 'absolute',
										inset: 0,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 2,
										p: 2,
										bgcolor: 'dangerSoft',
										color: 'dangerInk',
										textAlign: 'center',
										fontSize: 12,
										fontWeight: 600,
									}}
								>
									{t('agents:form.images.failed', { index: index + 1 })}
									<Button size="small" variant="outlined" onClick={() => uploads.retry(item.key)} sx={{ height: 30 }}>
										{t('agents:form.images.retry')}
									</Button>
								</Box>
							)}
							{item.status === 'done' && count > 1 && (
								<Box sx={{ position: 'absolute', right: 6, bottom: 6, display: 'flex', gap: 1 }}>
									<IconButton
										size="small"
										disabled={index === 0}
										aria-label={t('agents:form.images.earlier', { index: index + 1 })}
										ref={(button: HTMLButtonElement | null) => {
											moveButtons.current.set(`${item.key}:earlier`, button);
										}}
										onClick={() => move(item.key, index, index - 1)}
										sx={iconButtonSx}
									>
										<ArrowBackIcon fontSize="small" />
									</IconButton>
									<IconButton
										size="small"
										disabled={index === count - 1}
										aria-label={t('agents:form.images.later', { index: index + 1 })}
										ref={(button: HTMLButtonElement | null) => {
											moveButtons.current.set(`${item.key}:later`, button);
										}}
										onClick={() => move(item.key, index, index + 1)}
										sx={iconButtonSx}
									>
										<ArrowForwardIcon fontSize="small" />
									</IconButton>
								</Box>
							)}
						</Box>
					);
				})}
				{!full && (
					<li>
						<ButtonBase
							onClick={() => inputRef.current?.click()}
							onDragOver={(event) => {
								event.preventDefault();
								setDragging(true);
							}}
							onDragLeave={() => setDragging(false)}
							onDrop={onDrop}
							aria-describedby={error ? `${errorId} ${hintId}` : hintId}
							sx={{
								...tileSx,
								width: '100%',
								display: 'flex',
								flexDirection: 'column',
								gap: 1.5,
								bgcolor: dragging ? 'accentSoft' : 'surfaceMuted',
								border: '1px dashed',
								borderColor: error ? 'dangerBorder' : dragging ? 'primary.main' : 'inputBorder',
								color: 'primary.main',
								fontSize: 14,
								fontWeight: 700,
								'&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
							}}
						>
							<AddPhotoIcon aria-hidden="true" />
							{t('agents:form.images.add')}
						</ButtonBase>
					</li>
				)}
			</Box>
			<input
				ref={inputRef}
				type="file"
				accept={IMAGE_ACCEPT}
				multiple
				hidden
				data-testid="image-input"
				onChange={(event) => {
					uploads.addFiles(Array.from(event.target.files ?? []));
					event.target.value = ''; // picking the same file again still fires change
				}}
			/>
			<Typography id={hintId} variant="caption" component="p" sx={{ mt: 2 }}>
				{t('agents:form.images.hint', { max: IMAGES_MAX, mb: IMAGE_MAX_BYTES / 1_000_000 })}
			</Typography>
			{error && (
				<FormHelperText id={errorId} error role="alert" sx={{ mt: 1 }}>
					{error}
				</FormHelperText>
			)}
			{rejected.length > 0 && (
				<Box role="alert" sx={{ mt: 2, p: 3, borderRadius: radiusPx.md, bgcolor: 'dangerSoft', color: 'dangerInk', fontSize: 13 }}>
					<Typography sx={{ fontSize: 13, fontWeight: 700, color: 'inherit' }}>{t('agents:form.images.rejectedTitle')}</Typography>
					<Box component="ul" sx={{ m: 0, mt: 1, pl: 5 }}>
						{rejected.map((file, index) => (
							<li key={`${file.name}-${index}`}>
								{t(`agents:form.images.rejected.${file.reason}`, { name: file.name, max: IMAGES_MAX, mb: IMAGE_MAX_BYTES / 1_000_000 })}
							</li>
						))}
					</Box>
				</Box>
			)}
			<Box role="status" sx={visuallyHidden}>
				{announcement}
			</Box>
		</Box>
	);
};
