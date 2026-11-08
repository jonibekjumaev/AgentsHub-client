import NextLink from 'next/link';
import { Box, LinearProgress, Link, Typography } from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	ChevronRight as ChevronRightIcon,
	RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { radiusPx } from '@/theme/tokens';
import type { ChecklistItem } from '../lib/overview';

/**
 * Overview "Next steps": what is still missing on the creator's profile, each linking to where it is
 * fixed. Done steps stay visible (struck through) so the progress makes sense; hidden at 100%.
 */
export const NextSteps = ({ items }: { items: ChecklistItem[] }) => {
	const { t } = useTranslation('dashboard');
	const done = items.filter((item) => item.done).length;
	if (done === items.length) return null;

	return (
		<Box
			component="section"
			aria-labelledby="next-steps"
			sx={{ p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.xl }}
		>
			<Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
				<Typography id="next-steps" variant="h2" sx={{ fontSize: 18 }}>
					{t('dashboard:overview.steps.title')}
				</Typography>
				<Typography variant="caption" sx={{ color: 'muted', fontWeight: 700 }}>
					{t('dashboard:overview.steps.progress', { done, total: items.length })}
				</Typography>
			</Box>
			<LinearProgress
				variant="determinate"
				value={(done / items.length) * 100}
				aria-label={t('dashboard:overview.steps.progressLabel')}
				sx={{ mt: 3, mb: 3, height: 6, borderRadius: radiusPx.pill, bgcolor: 'ground' }}
			/>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 0.5 }}>
				{items.map((item) => (
					<li key={item.key}>
						{item.done ? (
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, py: 2, px: 1, color: 'muted', fontSize: 14 }}>
								<CheckCircleIcon aria-hidden="true" sx={{ fontSize: 20, color: 'success.main' }} />
								<Box component="span" sx={{ textDecoration: 'line-through' }}>
									{t(`dashboard:overview.steps.items.${item.key}`)}
								</Box>
								<Box component="span" sx={visuallyHidden}>
									{t('dashboard:overview.steps.done')}
								</Box>
							</Box>
						) : (
							<Link
								component={NextLink}
								href={item.href}
								underline="none"
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 2.5,
									py: 2,
									px: 1,
									borderRadius: radiusPx.sm,
									color: 'ink',
									fontSize: 14,
									fontWeight: 700,
									'&:hover': { bgcolor: 'ground' },
								}}
							>
								<RadioButtonUncheckedIcon aria-hidden="true" sx={{ fontSize: 20, color: 'inputBorder' }} />
								<Box component="span" sx={{ flex: 1 }}>
									{t(`dashboard:overview.steps.items.${item.key}`)}
								</Box>
								<ChevronRightIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
							</Link>
						)}
					</li>
				))}
			</Box>
		</Box>
	);
};
