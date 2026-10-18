import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, ButtonBase } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { radiusPx } from '@/theme/tokens';

type PaginationProps = {
	/** 1-based current page. */
	page: number;
	/** Total number of pages. */
	count: number;
	/** Link mode (preferred for list pages: crawlable, works without JS). */
	getHref?: (page: number) => string;
	/** Button mode, when the page is not in the URL. */
	onChange?: (page: number) => void;
};

type Item = number | 'gap-start' | 'gap-end';

/** First, last, current ± 1, with gaps: 1 … 4 5 6 … 12. */
export const paginationItems = (page: number, count: number): Item[] => {
	const pages = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count));
	const sorted = Array.from(pages).sort((a, b) => a - b);
	const items: Item[] = [];
	sorted.forEach((p, index) => {
		const skipped = index > 0 ? p - sorted[index - 1] - 1 : 0;
		// One hidden page is shown as itself; more become a gap (the first gap can only follow page 1).
		if (skipped === 1) items.push(p - 1);
		else if (skipped > 1) items.push(index === 1 ? 'gap-start' : 'gap-end');
		items.push(p);
	});
	return items;
};

const squareSx: SxProps<Theme> = {
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 40,
	height: 40,
	borderRadius: radiusPx.sm,
	border: 1,
	borderColor: 'border',
	bgcolor: 'surface',
	color: 'body',
	fontWeight: 700,
	fontSize: 14,
	textDecoration: 'none',
	'&:hover': { borderColor: 'inputBorder' },
	'&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
};

const currentSx: SxProps<Theme> = {
	...squareSx,
	bgcolor: 'primary.main',
	borderColor: 'primary.main',
	color: 'primary.contrastText',
	'&:hover': { bgcolor: 'accentHover' },
};

const disabledSx: SxProps<Theme> = { ...squareSx, color: 'inputBorder', cursor: 'default', '&:hover': {} };

/** DESIGN §3: 40×40 squares, radius 8, current = accent filled. <nav> + aria-current="page". */
export const Pagination = ({ page, count, getHref, onChange }: PaginationProps) => {
	const { t } = useTranslation('common');
	const format = useFormat();
	if (count <= 1) return null;

	const control = (target: number, content: ReactNode, label: string, disabled = false, current = false) => {
		if (disabled) {
			return (
				<Box component="span" aria-label={label} aria-disabled="true" sx={disabledSx}>
					{content}
				</Box>
			);
		}
		const common = { 'aria-label': label, 'aria-current': current ? ('page' as const) : undefined };
		if (getHref) {
			return (
				<Box component={NextLink} href={getHref(target)} {...common} sx={current ? currentSx : squareSx}>
					{content}
				</Box>
			);
		}
		return (
			<ButtonBase {...common} onClick={() => onChange?.(target)} sx={current ? currentSx : squareSx}>
				{content}
			</ButtonBase>
		);
	};

	return (
		<Box component="nav" aria-label={t('common:pagination.label')}>
			<Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}>
				<li>{control(page - 1, <span aria-hidden="true">‹</span>, t('common:pagination.previous'), page <= 1)}</li>
				{paginationItems(page, count).map((item) =>
					typeof item === 'number' ? (
						<li key={item}>
							{control(item, format.number(item), t('common:pagination.page', { page: item }), false, item === page)}
						</li>
					) : (
						<Box component="li" key={item} aria-hidden="true" sx={{ ...squareSx, border: 0, bgcolor: 'transparent' }}>
							…
						</Box>
					),
				)}
				<li>{control(page + 1, <span aria-hidden="true">›</span>, t('common:pagination.next'), page >= count)}</li>
			</Box>
		</Box>
	);
};
