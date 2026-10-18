import { Box, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { ProductPricing } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { visuallyHidden } from './visuallyHidden';

type PriceTagProps = {
	pricing: ProductPricing;
	/** null for FREE / CUSTOM (D-03). */
	price: number | null | undefined;
	size?: 'inline' | 'large';
};

/**
 * DESIGN §3 PriceTag: FREE → "Free" (success 800) · ONE_TIME → $190 mono ·
 * SUBSCRIPTION → $29 mono + "/ mo" · CUSTOM → "Custom" (body 800).
 */
export const PriceTag = ({ pricing, price, size = 'inline' }: PriceTagProps) => {
	const { t } = useTranslation('common');
	const format = useFormat();
	const fontSize = size === 'large' ? 24 : 15;

	if (pricing === 'FREE') {
		return (
			<Typography component="span" sx={{ color: 'success.main', fontWeight: 800, fontSize }}>
				{t('common:price.free')}
			</Typography>
		);
	}

	if (pricing === 'CUSTOM' || price == null) {
		return (
			<Typography component="span" sx={{ color: 'body', fontWeight: 800, fontSize }}>
				{pricing === 'CUSTOM' ? t('common:price.custom') : t('common:price.none')}
			</Typography>
		);
	}

	return (
		<Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 1, whiteSpace: 'nowrap' }}>
			<Typography component="span" variant="mono" sx={{ fontSize, color: 'ink' }}>
				{format.price(price)}
			</Typography>
			{pricing === 'SUBSCRIPTION' && (
				<>
					<Typography component="span" variant="caption" aria-hidden="true">
						{t('common:price.perMonth')}
					</Typography>
					<Box component="span" sx={visuallyHidden}>
						{t('common:price.perMonthSpoken')}
					</Box>
				</>
			)}
		</Box>
	);
};
