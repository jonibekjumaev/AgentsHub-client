import { Box, ButtonBase } from '@mui/material';
import { useFormat } from '@/shared/lib/format';
import { catalog, colors, home } from '@/theme/tokens';
import { isDeadOption } from './CategoryRail';
import { focusVisibleSx } from './motion';

type ToggleChipProps = {
	label: string;
	count: number | undefined;
	selected: boolean;
	onClick: () => void;
	/** filled: indigo when selected (filter chips). dark: near-black when selected (segmented tabs). */
	tone?: 'filled' | 'dark';
};

/** A filter chip with its live count, multi-select (`aria-pressed`). 0 results disables it unless selected. */
export const ToggleChip = ({ label, count, selected, onClick, tone = 'filled' }: ToggleChipProps) => {
	const format = useFormat();
	const on = tone === 'dark' ? home.footer : 'primary.main';
	return (
		<ButtonBase
			aria-pressed={selected}
			disabled={isDeadOption(count, selected)}
			onClick={onClick}
			sx={{
				minHeight: 38,
				px: 3,
				gap: 1,
				borderRadius: '10px',
				border: 1,
				borderColor: selected ? on : 'border',
				bgcolor: selected ? on : 'surface',
				color: selected ? colors.white : 'body',
				fontSize: 14,
				fontWeight: 600,
				transition: 'background-color 200ms, color 200ms',
				'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'body' },
				...focusVisibleSx,
			}}
		>
			{label}
			{count !== undefined && ' '}
			{count !== undefined && (
				<Box component="span" sx={{ fontWeight: 500, opacity: 0.75 }}>
					{format.number(count)}
				</Box>
			)}
		</ButtonBase>
	);
};
