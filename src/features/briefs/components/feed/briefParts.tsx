import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useFormat } from '@/shared/lib/format';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { briefFeed } from '@/theme/tokens';
import { StatusPill } from '@/shared/ui/page';
import type { DeadlineState } from '../../lib/deadline';

export { CategoryPill, StatusPill } from '@/shared/ui/page';

/*
 * The small pieces of the briefs design (agentshub-briefs), shared by the feed row and the detail page, so a
 * brief looks the same wherever it is shown.
 */

const closedPill = { bg: 'neutralSoft', text: 'body', dot: briefFeed.deadline.none.dot } as const;

/** One fact of the row: a small icon, a visually hidden <dt> for screen readers, the value as <dd>. */
export const Fact = ({
	icon,
	term,
	color = 'body',
	children,
}: {
	icon: ReactNode;
	term: string;
	color?: string;
	children: ReactNode;
}) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
		<Box component="dt" sx={{ display: 'flex', color: color === 'body' ? 'muted' : color }}>
			{icon}
			<Box component="span" sx={visuallyHidden}>
				{term}
			</Box>
		</Box>
		<Box component="dd" sx={{ m: 0, fontWeight: 600, color }}>
			{children}
		</Box>
	</Box>
);

export const factIconSx = { fontSize: 16 } as const;

/**
 * "Due Jan 31, 2027, 84 days left" / "Deadline passed Oct 29, 2026" / "No deadline". One text node, so the
 * server and browser clocks may differ by a day count without a hydration error.
 */
export const DeadlineText = ({ state }: { state: DeadlineState }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	if (state.kind === 'none') return <>{t('briefs:deadline.none')}</>;
	const date = format.date(state.date);
	return (
		<time dateTime={state.date.toISOString()} suppressHydrationWarning>
			{state.kind === 'passed'
				? t('briefs:feed.deadline.passed', { date })
				: t('briefs:feed.deadline.due', { date, count: state.daysLeft })}
		</time>
	);
};

/** Closed, past its deadline (still OPEN, D-05) or open: the one status pill a brief shows. */
export const BriefStatusPill = ({ closed, past }: { closed: boolean; past: boolean }) => {
	const { t } = useTranslation('briefs');
	if (closed) return <StatusPill label={t('briefs:list.tabs.closed')} colors={closedPill} />;
	if (past) return <StatusPill label={t('briefs:feed.status.past')} colors={briefFeed.pastPill} />;
	return <StatusPill label={t('briefs:list.tabs.open')} colors={briefFeed.openPill} />;
};
