import { Chip } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { BriefStatus, ProductStatus } from '@/gql/enums';

type Tone = 'success' | 'warning' | 'neutral' | 'danger';

export type StatusChipProps =
	| { kind: 'product'; status: ProductStatus; size?: 'small' | 'medium' }
	| { kind: 'brief'; status: BriefStatus; size?: 'small' | 'medium' };

/** DESIGN §3 Chips: OPEN/ACTIVE success, CLOSED neutral, PAUSED warning. */
const toneByStatus: Record<ProductStatus | BriefStatus, Tone> = {
	ACTIVE: 'success',
	OPEN: 'success',
	PAUSED: 'warning',
	CLOSED: 'neutral',
	DELETE: 'danger',
};

const toneSx: Record<Tone, { bgcolor: string; color: string }> = {
	success: { bgcolor: 'successSoft', color: 'success.main' },
	warning: { bgcolor: 'warningSoft', color: 'warning.main' },
	neutral: { bgcolor: 'neutralSoft', color: 'bodySoft' },
	danger: { bgcolor: 'dangerSoft', color: 'dangerInk' },
};

/** A label, not a control: renders a <span>, never a button. */
export const StatusChip = ({ kind, status, size = 'small' }: StatusChipProps) => {
	const { t } = useTranslation('common');
	const label = kind === 'product' ? t(`common:enums.ProductStatus.${status}`) : t(`common:enums.BriefStatus.${status}`);

	return (
		<Chip
			component="span"
			size={size}
			label={label}
			data-tone={toneByStatus[status]}
			sx={{
				...toneSx[toneByStatus[status]],
				fontSize: size === 'small' ? 11 : 12,
				fontWeight: 800,
				textTransform: 'uppercase',
				letterSpacing: '0.06em',
			}}
		/>
	);
};
