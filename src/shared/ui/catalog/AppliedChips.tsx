import { Box, ButtonBase, Link } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { radiusPx } from '@/theme/tokens';
import { focusVisibleSx } from './motion';

export type AppliedChip = { key: string; label: string; onRemove: () => void };

type AppliedChipsProps = {
	chips: AppliedChip[];
	onClear: () => void;
	labels: { remove: (label: string) => string; clearAll: string };
};

/** The applied filters: one removable chip per value, then "Clear all". Nothing when no filter is applied. */
export const AppliedChips = ({ chips, onClear, labels }: AppliedChipsProps) => {
	if (chips.length === 0) return null;
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
			<Box component="ul" sx={{ display: 'contents', listStyle: 'none' }}>
				{chips.map((chip) => (
					<li key={chip.key}>
						<ButtonBase
							onClick={chip.onRemove}
							aria-label={labels.remove(chip.label)}
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 1.5,
								minHeight: 34,
								pl: 3,
								pr: 2,
								borderRadius: radiusPx.pill,
								bgcolor: 'accentSoft',
								color: 'primary.main',
								fontSize: 13,
								fontWeight: 600,
								maxWidth: '100%',
								'&:hover': { bgcolor: 'accentBorder' },
								...focusVisibleSx,
							}}
						>
							<Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{chip.label}
							</Box>
							<CloseIcon aria-hidden="true" sx={{ fontSize: 15 }} />
						</ButtonBase>
					</li>
				))}
			</Box>
			<Link
				component="button"
				type="button"
				onClick={onClear}
				underline="always"
				sx={{ minHeight: 34, px: 2.5, fontSize: 13, fontWeight: 700, color: 'bodySoft', ...focusVisibleSx }}
			>
				{labels.clearAll}
			</Link>
		</Box>
	);
};
