import { Box, ButtonBase, Typography } from '@mui/material';
import { Pagination } from '@/shared/ui/Pagination';
import { home } from '@/theme/tokens';
import { focusVisibleSx } from './motion';

/** The outlined secondary button of the catalog pages ("Show more", "Clear all filters"). */
export const outlineButtonSx = {
	minHeight: 48,
	px: 6.5,
	border: 1,
	borderColor: 'inputBorder',
	borderRadius: home.radius.button,
	bgcolor: 'surface',
	color: 'ink',
	fontSize: 15,
	fontWeight: 700,
	'&:hover': { bgcolor: 'ground' },
	...focusVisibleSx,
} as const;

type LoadMoreProps = {
	/** "Showing 9 of 45" */
	showingLabel: string;
	shown: number;
	total: number;
	/** Results of this page still hidden; 0 shows the pagination instead of the button. */
	hidden: number;
	showMoreLabel: string;
	onShowMore: () => void;
	page: number;
	pageCount: number;
	getHref: (page: number) => string;
};

/** Below the results: "Showing X of Y", a thin progress bar, then "Show N more" or the page links. */
export const LoadMore = ({ showingLabel, shown, total, hidden, showMoreLabel, onShowMore, page, pageCount, getHref }: LoadMoreProps) => (
	<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.5, pt: 3 }}>
		<Typography sx={{ fontSize: 14, color: 'bodySoft' }}>{showingLabel}</Typography>
		<Box aria-hidden="true" sx={{ width: 220, height: 4, borderRadius: '999px', bgcolor: 'border', overflow: 'hidden' }}>
			<Box
				sx={{
					width: `${total ? Math.min(100, Math.round((shown / total) * 100)) : 0}%`,
					height: '100%',
					borderRadius: '999px',
					bgcolor: 'primary.main',
					transition: 'width 400ms ease',
				}}
			/>
		</Box>
		{hidden > 0 ? (
			<ButtonBase onClick={onShowMore} sx={outlineButtonSx}>
				{showMoreLabel}
			</ButtonBase>
		) : (
			<Pagination page={page} count={pageCount} getHref={getHref} />
		)}
	</Box>
);
