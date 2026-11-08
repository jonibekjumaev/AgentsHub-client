import { useId } from 'react';
import { Box, NativeSelect } from '@mui/material';
import { focusRingSx } from './motion';

type SortSelectProps<T extends string> = {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
};

/** "Sort [Most liked ▾]": a native select (keyboard and screen-reader friendly on every platform). */
export const SortSelect = <T extends string>({ label, value, options, onChange }: SortSelectProps<T>) => {
	const id = useId();
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
			<Box component="label" htmlFor={id} sx={{ fontSize: 14, color: 'bodySoft' }}>
				{label}
			</Box>
			<NativeSelect
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value as T)}
				disableUnderline
				sx={{
					minHeight: 38,
					px: 3,
					border: 1,
					borderColor: 'border',
					borderRadius: '10px',
					bgcolor: 'surface',
					fontSize: 14,
					fontWeight: 600,
					color: 'ink',
					'&:focus-within': focusRingSx,
					'& select:focus': { bgcolor: 'transparent' },
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</NativeSelect>
		</Box>
	);
};
