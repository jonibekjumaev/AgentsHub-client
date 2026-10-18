import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import Image from 'next/image';
import { Box, ButtonBase, Typography } from '@mui/material';
import { SmartToyOutlined as SmartToyOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { mediaUrl } from '@/shared/lib/media';
import { radiusPx } from '@/theme/tokens';

type AgentGalleryProps = {
	title: string;
	images: readonly string[];
};

const frameSx = {
	position: 'relative',
	aspectRatio: '16 / 10',
	overflow: 'hidden',
	borderRadius: radiusPx.lg,
	border: 1,
	borderColor: 'border',
	bgcolor: 'accentSoft',
} as const;

/**
 * AgentDetail.html gallery: the selected screenshot, then one thumbnail button per image.
 * Thumbnails are real buttons (Tab, Enter, Space) with aria-pressed; ← → Home End move between them.
 */
export const AgentGallery = ({ title, images }: AgentGalleryProps) => {
	const { t } = useTranslation('agents');
	const [selected, setSelected] = useState(0);
	const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
	const sources = images.map((image) => mediaUrl(image)).filter((src): src is string => Boolean(src));
	const count = sources.length;

	if (count === 0) {
		return (
			<Box sx={{ ...frameSx, display: 'grid', placeItems: 'center', color: 'primary.main' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
					<SmartToyOutlinedIcon aria-hidden="true" sx={{ fontSize: 48 }} />
					<Typography variant="meta">{t('agents:detail.gallery.noImage')}</Typography>
				</Box>
			</Box>
		);
	}

	const current = Math.min(selected, count - 1);

	const select = (index: number) => {
		const next = (index + count) % count;
		setSelected(next);
		thumbs.current[next]?.focus();
	};

	const onKeyDown = (event: KeyboardEvent) => {
		const moves: Record<string, number> = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: count - 1 };
		if (!(event.key in moves)) return;
		event.preventDefault();
		select(moves[event.key]);
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			<Box sx={frameSx}>
				<Image
					src={sources[current]}
					alt={t('agents:detail.gallery.alt', { title, index: current + 1, count })}
					fill
					// Above the fold on the detail page: load it first (LCP).
					priority={current === 0}
					sizes="(max-width: 900px) 100vw, 760px"
					style={{ objectFit: 'cover' }}
				/>
			</Box>
			{count > 1 && (
				<Box
					role="group"
					aria-label={t('agents:detail.gallery.label')}
					onKeyDown={onKeyDown}
					sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)`, gap: 2.5 }}
				>
					{sources.map((src, index) => {
						const active = index === current;
						return (
							<ButtonBase
								// The same upload may appear twice; the list never reorders.
								key={index}
								ref={(element: HTMLButtonElement | null) => {
									thumbs.current[index] = element;
								}}
								aria-label={t('agents:detail.gallery.show', { index: index + 1, count })}
								aria-pressed={active}
								// One tab stop for the group; arrows move inside it.
								tabIndex={active ? 0 : -1}
								onClick={() => setSelected(index)}
								sx={{
									position: 'relative',
									height: 72,
									overflow: 'hidden',
									borderRadius: radiusPx.md,
									border: active ? 2 : 1,
									borderColor: active ? 'primary.main' : 'border',
									bgcolor: 'surface',
									'&:focus-visible': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
								}}
							>
								<Image src={src} alt="" fill sizes="160px" style={{ objectFit: 'cover' }} />
							</ButtonBase>
						);
					})}
				</Box>
			)}
		</Box>
	);
};
