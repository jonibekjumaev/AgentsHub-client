import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { AgentCategory } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { briefFeed, colors, radiusPx } from '@/theme/tokens';
import type { DeadlineState } from '../../lib/deadline';

/*
 * The small pieces of the briefs design (agentshub-briefs), shared by the feed row and the detail page, so a
 * brief looks the same wherever it is shown.
 */

/** A small pill with a colored dot: "● Open", "● Past deadline", "● Closed". */
export const StatusPill = ({
	label,
	colors: pill,
}: {
	label: string;
	colors: { bg: string; text: string; dot: string };
}) => (
	<Box
		component="span"
		sx={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 1.5,
			px: 2.5,
			py: 0.75,
			borderRadius: radiusPx.pill,
			bgcolor: pill.bg,
			fontSize: 12,
			fontWeight: 700,
			color: pill.text,
		}}
	>
		<Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: pill.dot }} />
		{label}
	</Box>
);

const closedPill = { bg: 'neutralSoft', text: 'body', dot: briefFeed.deadline.none.dot } as const;

/** Category tint, a small white circle with the category icon, then the name. */
export const CategoryPill = ({ category }: { category: AgentCategory }) => {
	const { t } = useTranslation('common');
	const [tint, ink] = categoryTint(category);
	return (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 1.5,
				py: 0.75,
				pl: 1,
				pr: 2.5,
				borderRadius: radiusPx.pill,
				bgcolor: tint,
				fontSize: 12,
				fontWeight: 700,
				color: 'ink',
			}}
		>
			<Box
				component="span"
				aria-hidden="true"
				sx={{
					width: 20,
					height: 20,
					display: 'grid',
					placeItems: 'center',
					borderRadius: '50%',
					bgcolor: colors.white,
					color: ink,
				}}
			>
				<CategoryIcon category={category} size={11} />
			</Box>
			{t(`common:enums.AgentCategory.${category}`)}
		</Box>
	);
};

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
