import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, PaidOutlined as PaidOutlinedIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { frameSx } from './kit';

const ITEMS: [string, ReactNode][] = [
	['contacts', <LockOutlinedIcon key="contacts" aria-hidden="true" sx={{ fontSize: 20 }} />],
	['pricing', <PaidOutlinedIcon key="pricing" aria-hidden="true" sx={{ fontSize: 20 }} />],
	['ranking', <TrendingUpIcon key="ranking" aria-hidden="true" sx={{ fontSize: 20 }} />],
];

/** Slim strip under the hero: three promises, each an icon, a bold title and one sentence. */
export const TrustLine = () => {
	const { t } = useTranslation('home');
	return (
		<Box component="section" aria-label={t('home:values.label')} sx={{ ...frameSx, pt: 2, pb: 10 }}>
			<Box
				component="ul"
				sx={{
					m: 0,
					py: 4.5,
					px: 0,
					listStyle: 'none',
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					columnGap: 10,
					rowGap: 3,
					borderTop: 1,
					borderBottom: 1,
					borderColor: 'border',
				}}
			>
				{ITEMS.map(([key, icon]) => (
					<Box component="li" key={key} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, fontSize: 15, color: 'body' }}>
						<Box component="span" sx={{ display: 'flex', color: 'primary.main' }}>
							{icon}
						</Box>
						<span>
							<Box component="b" sx={{ color: 'ink', fontWeight: 700 }}>
								{t(`home:values.${key}.title`)}
							</Box>{' '}
							{t(`home:values.${key}.short`)}
						</span>
					</Box>
				))}
			</Box>
		</Box>
	);
};
