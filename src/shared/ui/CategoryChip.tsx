import { Chip } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory } from '@/gql/enums';

type CategoryChipProps = {
	category: AgentCategory;
	size?: 'small' | 'medium';
	/** Only when the chip filters something; then it becomes a real button. */
	onClick?: () => void;
	selected?: boolean;
};

/** DESIGN §3: accentSoft pill, accent text 700. A plain label unless `onClick` is given. */
export const CategoryChip = ({ category, size = 'small', onClick, selected }: CategoryChipProps) => {
	const { t } = useTranslation('common');

	return (
		<Chip
			component={onClick ? 'button' : 'span'}
			size={size}
			label={t(`common:enums.AgentCategory.${category}`)}
			onClick={onClick}
			aria-pressed={onClick ? Boolean(selected) : undefined}
			sx={{
				bgcolor: selected ? 'primary.main' : 'accentSoft',
				color: selected ? 'primary.contrastText' : 'primary.main',
				fontSize: size === 'small' ? 11 : 12,
				fontWeight: 700,
				border: 0,
				...(onClick && { '&:hover': { bgcolor: selected ? 'accentHover' : 'accentBorder' } }),
			}}
		/>
	);
};
