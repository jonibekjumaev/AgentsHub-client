import { useId } from 'react';
import { Box, InputBase, MenuItem, Select } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';
import { catalog, home } from '@/theme/tokens';
import { focusRingSx } from './motion';

type SortSelectProps<T extends string> = {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
};

/**
 * "Sort [Most liked ▾]". A MUI Select, not a native one: the native list is drawn by the operating system
 * (plain, its own font and size, no way to style it), and looked out of place on the catalog pages. MUI's is a
 * real combobox + listbox, so the keyboard (arrows, Enter, Escape, type-ahead) and screen readers keep working.
 */
export const SortSelect = <T extends string>({ label, value, options, onChange }: SortSelectProps<T>) => {
	const labelId = useId();
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
			<Box component="span" id={labelId} sx={{ fontSize: 14, color: 'bodySoft' }}>
				{label}
			</Box>
			<Select
				labelId={labelId}
				value={value}
				onChange={(event) => onChange(event.target.value as T)}
				input={<InputBase />}
				IconComponent={KeyboardArrowDownIcon}
				MenuProps={{
					// keep the page scrollable and the sticky bar in place while the list is open
					disableScrollLock: true,
					anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
					transformOrigin: { vertical: 'top', horizontal: 'right' },
					slotProps: {
						paper: {
							sx: {
								mt: 1.5,
								minWidth: 200,
								borderRadius: '12px',
								border: 1,
								borderColor: 'border',
								boxShadow: home.topShadow,
								'& .MuiMenu-list': { p: 1.5 },
							},
						},
					},
				}}
				sx={{
					minHeight: 38,
					minWidth: 168,
					border: 1,
					borderColor: 'border',
					borderRadius: '10px',
					bgcolor: 'surface',
					fontSize: 14,
					fontWeight: 600,
					color: 'ink',
					'& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 'unset', py: 2, pl: 3, pr: '36px !important' },
					'& .MuiSelect-icon': { right: 8, fontSize: 20, color: 'bodySoft' },
					'&:hover': { borderColor: catalog.divider },
					'&.Mui-focused': focusRingSx,
				}}
			>
				{options.map((option) => (
					<MenuItem
						key={option.value}
						value={option.value}
						sx={{
							minHeight: 40,
							px: 3,
							borderRadius: '8px',
							fontSize: 14,
							fontWeight: 600,
							color: 'body',
							'&:hover': { bgcolor: 'neutralSoft' },
							'&.Mui-selected, &.Mui-selected:hover': { bgcolor: 'accentSoft', color: 'primary.main' },
							'&.Mui-focusVisible': { bgcolor: 'neutralSoft', outline: `2px solid ${home.focusRing}`, outlineOffset: '-2px' },
							'& + &': { mt: 0.5 },
						}}
					>
						{option.label}
					</MenuItem>
				))}
			</Select>
		</Box>
	);
};
