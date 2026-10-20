import NextLink from 'next/link';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { BriefStatus } from '@/gql/enums';
import type { BriefCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { CategoryChip } from '@/shared/ui/CategoryChip';
import { StatusChip } from '@/shared/ui/StatusChip';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { fonts, radiusPx } from '@/theme/tokens';
import { briefHref, isDeadlinePassed } from '../lib/detail';

const monoSx = { fontFamily: fonts.mono, fontWeight: 500 } as const;

/** "$500" or "Open to offers" (D-04). */
export const BriefBudget = ({ budget, size = 16 }: { budget: number | null | undefined; size?: number }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	if (budget === null || budget === undefined) {
		return (
			<Typography component="span" sx={{ fontWeight: 800, color: 'body', fontSize: size - 2 }}>
				{t('briefs:budget.open')}
			</Typography>
		);
	}
	return (
		<Typography component="span" sx={{ ...monoSx, color: 'ink', fontSize: size }}>
			{format.price(budget)}
		</Typography>
	);
};

/** "Deadline Nov 30, 2026", "No deadline", or the passed hint on an OPEN brief (D-05). */
export const BriefDeadline = ({ brief }: { brief: Pick<BriefCardFragment, 'briefDeadline' | 'briefStatus'> }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	if (!brief.briefDeadline) {
		return (
			<Typography variant="meta" component="span">
				{t('briefs:deadline.none')}
			</Typography>
		);
	}
	const passed = brief.briefStatus === BriefStatus.Open && isDeadlinePassed(brief.briefDeadline);
	return (
		<Typography variant="meta" component="span" sx={passed ? { color: 'warning.main', fontWeight: 700 } : undefined}>
			<time dateTime={brief.briefDeadline} suppressHydrationWarning>
				{passed
					? t('briefs:deadline.passed', { date: format.date(brief.briefDeadline) })
					: t('briefs:deadline.on', { date: format.date(brief.briefDeadline) })}
			</time>
		</Typography>
	);
};

/**
 * One row of /briefs (Briefs.html): chips, title (the link), a two-line excerpt, "@nick · time ·
 * comments · views" on the left; budget and deadline on the right, below on narrow screens.
 * Closed rows use surfaceMuted (DESIGN §2.1).
 */
export const BriefRow = ({ brief }: { brief: BriefCardFragment }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const closed = brief.briefStatus === BriefStatus.Closed;
	const nick = brief.memberData?.memberNick;

	return (
		<Box
			component="article"
			sx={{
				position: 'relative',
				display: 'flex',
				flexWrap: 'wrap',
				gap: 4,
				justifyContent: 'space-between',
				p: 5,
				bgcolor: closed ? 'surfaceMuted' : 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
				'&:hover': { borderColor: 'inputBorder' },
				'&:focus-within': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
			}}
		>
			<Box sx={{ flex: '999 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
					<StatusChip kind="brief" status={brief.briefStatus} />
					<CategoryChip category={brief.briefCategory} />
				</Stack>
				<Typography component="h3" sx={{ fontSize: 17, fontWeight: 800, overflowWrap: 'anywhere' }}>
					{/* The whole card is clickable through this link's ::after; the link is the only control. */}
					<Link
						component={NextLink}
						href={briefHref(brief._id)}
						underline="none"
						sx={{ color: 'ink', '&::after': { content: '""', position: 'absolute', inset: 0 }, '&:focus-visible': { outline: 0 } }}
					>
						{brief.briefTitle}
					</Link>
				</Typography>
				<Typography
					variant="body2"
					sx={{
						color: 'bodySoft',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						overflowWrap: 'anywhere',
					}}
				>
					{brief.briefContent}
				</Typography>
				<Typography variant="meta">
					{nick && <>@{nick} · </>}
					<time dateTime={brief.createdAt} suppressHydrationWarning>
						{format.relative(brief.createdAt)}
					</time>{' '}
					· {t('briefs:card.comments', { count: brief.briefComments, formatted: format.number(brief.briefComments) })} ·{' '}
					{t('briefs:card.views', { count: brief.briefViews, formatted: format.compact(brief.briefViews) })}
					{closed && brief.closedAt && (
						<>
							{' '}
							·{' '}
							<time dateTime={brief.closedAt} suppressHydrationWarning>
								{t('briefs:closedOn', { date: format.date(brief.closedAt) })}
							</time>
						</>
					)}
				</Typography>
			</Box>
			<Box
				sx={{
					flex: '1 1 140px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: { xs: 'flex-start', sm: 'flex-end' },
					justifyContent: 'center',
					gap: 1,
					textAlign: { sm: 'right' },
				}}
			>
				<Typography variant="caption" component="span" sx={visuallyHidden}>
					{t('briefs:budget.label')}
				</Typography>
				<BriefBudget budget={brief.briefBudget} />
				<BriefDeadline brief={brief} />
			</Box>
		</Box>
	);
};
