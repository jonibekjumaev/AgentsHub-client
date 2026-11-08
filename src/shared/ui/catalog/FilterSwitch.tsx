import { Box, ButtonBase } from '@mui/material';
import { catalog, colors } from '@/theme/tokens';
import { focusVisibleSx } from './motion';

type FilterSwitchProps = { label: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void };

/**
 * An on/off filter in the catalog filter bar ("Hide past deadline", "Only creators with agents"): a real switch
 * (`role="switch"`, `aria-checked`), named by its visible label.
 */
export const FilterSwitch = ({ label, checked, disabled = false, onChange }: FilterSwitchProps) => (
	<ButtonBase
		role="switch"
		aria-checked={checked}
		disabled={disabled}
		onClick={() => onChange(!checked)}
		sx={{
			minHeight: 38,
			gap: 2.5,
			px: 3,
			border: 1,
			borderColor: 'border',
			borderRadius: '10px',
			bgcolor: 'surface',
			color: 'body',
			fontSize: 14,
			fontWeight: 600,
			'&.Mui-disabled': { opacity: catalog.disabledOpacity, color: 'body' },
			...focusVisibleSx,
		}}
	>
		<Box
			component="span"
			aria-hidden="true"
			sx={{
				position: 'relative',
				width: 34,
				height: 20,
				borderRadius: '999px',
				bgcolor: checked ? 'primary.main' : catalog.divider,
				transition: 'background-color 200ms',
			}}
		>
			<Box
				component="span"
				sx={{
					position: 'absolute',
					top: 2,
					left: checked ? 16 : 2,
					width: 16,
					height: 16,
					borderRadius: '50%',
					bgcolor: colors.white,
					transition: 'left 200ms',
					'@media (prefers-reduced-motion: reduce)': { transition: 'none' },
				}}
			/>
		</Box>
		{label}
	</ButtonBase>
);
