import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Box, ButtonBase, Typography } from '@mui/material';
import {
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	LockOutlined as LockOutlinedIcon,
	PaymentsOutlined as PaymentsOutlinedIcon,
	Schedule as ScheduleIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { BriefStatus } from '@/gql/enums';
import type { BriefCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { initialsOf } from '@/shared/ui/Avatar';
import { CategoryIcon, categoryTint } from '@/shared/ui/CategoryIcon';
import { enterSx, focusVisibleSx } from '@/shared/ui/catalog';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { briefFeed, colors, fonts, home, radiusPx } from '@/theme/tokens';
import { deadlineState, type DeadlineState } from '../../lib/deadline';
import { briefHref } from '../../lib/detail';

/** A small pill with a colored dot: "● Open", "● Past deadline", "● Closed". */
const StatusPill = ({ label, colors: pill }: { label: string; colors: { bg: string; text: string; dot: string } }) => (
	<Box
		component="span"
		sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 0.75, borderRadius: radiusPx.pill, bgcolor: pill.bg, fontSize: 12, fontWeight: 700, color: pill.text }}
	>
		<Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: pill.dot }} />
		{label}
	</Box>
);

const closedPill = { bg: 'neutralSoft', text: 'body', dot: briefFeed.deadline.none.dot } as const;

/** Category tint, a small white circle with the category icon, then the name. */
const CategoryPill = ({ category }: { category: BriefCardFragment['briefCategory'] }) => {
	const { t } = useTranslation('common');
	const [tint, ink] = categoryTint(category);
	return (
		<Box
			component="span"
			sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, py: 0.75, pl: 1, pr: 2.5, borderRadius: radiusPx.pill, bgcolor: tint, fontSize: 12, fontWeight: 700, color: 'ink' }}
		>
			<Box component="span" aria-hidden="true" sx={{ width: 20, height: 20, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: colors.white, color: ink }}>
				<CategoryIcon category={category} size={11} />
			</Box>
			{t(`common:enums.AgentCategory.${category}`)}
		</Box>
	);
};

/** One fact of the row: a small icon, a visually hidden <dt> for screen readers, the value as <dd>. */
const Fact = ({ icon, term, color = 'body', children }: { icon: ReactNode; term: string; color?: string; children: ReactNode }) => (
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

const factIconSx = { fontSize: 16 } as const;

/**
 * "Due Jan 31, 2027, 84 days left" / "Deadline passed Oct 29, 2026" / "No deadline". One text node, so the
 * server and browser clocks may differ by a day count without a hydration error.
 */
const DeadlineText = ({ state }: { state: DeadlineState }) => {
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

type BriefFeedRowProps = {
	brief: BriefCardFragment;
	index: number;
	/** A guest sees "Contact after sign-in" (D-07): contacts are for signed-in members only. */
	guest: boolean;
	now: Date;
};

/**
 * One brief of the /briefs feed (Upwork-style, agentshub-briefs design): status and category pills, the title
 * (the link), the full description, the facts (budget type, deadline, questions, views) and the author on the
 * left; the budget and "View brief" on the right. Wraps into one column on narrow screens.
 */
export const BriefFeedRow = ({ brief, index, guest, now }: BriefFeedRowProps) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const href = briefHref(brief._id);
	const closed = brief.briefStatus === BriefStatus.Closed;
	const deadline = deadlineState(brief.briefDeadline, now);
	const past = !closed && deadline.kind === 'passed';
	const nick = brief.memberData?.memberNick;
	const fixed = brief.briefBudget !== null && brief.briefBudget !== undefined;

	return (
		<Box
			component="article"
			aria-labelledby={`brief-${brief._id}`}
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				columnGap: 10,
				rowGap: 5,
				px: { xs: 5, sm: 7 },
				py: 6.5,
				opacity: past ? briefFeed.pastOpacity : 1,
				transition: 'background-color 200ms',
				'&:hover': { bgcolor: briefFeed.rowHover },
				...enterSx(index),
			}}
		>
			<Box sx={{ flex: '999 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 2 }}>
					{closed ? (
						<StatusPill label={t('briefs:list.tabs.closed')} colors={closedPill} />
					) : past ? (
						<StatusPill label={t('briefs:feed.status.past')} colors={briefFeed.pastPill} />
					) : (
						<StatusPill label={t('briefs:list.tabs.open')} colors={briefFeed.openPill} />
					)}
					<CategoryPill category={brief.briefCategory} />
					<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
						<time dateTime={brief.createdAt} suppressHydrationWarning>
							{t('briefs:feed.posted', { when: format.relative(brief.createdAt) })}
						</time>
					</Typography>
				</Box>
				<Typography
					id={`brief-${brief._id}`}
					variant="h2"
					sx={{ fontFamily: fonts.display, fontSize: 23, lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}
				>
					<Box
						component={NextLink}
						href={href}
						sx={{ color: 'ink', textDecoration: 'none', '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' }, ...focusVisibleSx }}
					>
						{brief.briefTitle}
					</Box>
				</Typography>
				{/* User content is plain text (CLAUDE.md rule 7). */}
				<Typography sx={{ maxWidth: 760, fontSize: 16, lineHeight: 1.55, color: 'body', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
					{brief.briefContent}
				</Typography>
				<Box component="dl" sx={{ m: 0, mt: 1, display: 'flex', flexWrap: 'wrap', columnGap: 5.5, rowGap: 2, fontSize: 14 }}>
					<Fact icon={<PaymentsOutlinedIcon sx={factIconSx} />} term={t('briefs:feed.facts.budgetType')}>
						{t(`briefs:feed.budgetType.${fixed ? 'FIXED' : 'OPEN_TO_OFFERS'}`)}
					</Fact>
					<Fact
						icon={<ScheduleIcon sx={factIconSx} />}
						term={t('briefs:feed.facts.deadline')}
						color={closed ? 'body' : briefFeed.deadline[deadline.kind].text}
					>
						<DeadlineText state={deadline} />
					</Fact>
					<Fact icon={<ChatBubbleOutlineIcon sx={factIconSx} />} term={t('briefs:feed.facts.questions')}>
						{brief.briefComments === 0
							? t('briefs:feed.questions.none')
							: t('briefs:feed.questions.count', { count: brief.briefComments, formatted: format.number(brief.briefComments) })}
					</Fact>
					<Fact icon={<VisibilityOutlinedIcon sx={factIconSx} />} term={t('briefs:feed.facts.views')}>
						{t('briefs:card.views', { count: brief.briefViews, formatted: format.number(brief.briefViews) })}
					</Fact>
				</Box>
				{nick && (
					<Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5 }}>
						<Box
							component="span"
							aria-hidden="true"
							sx={{ flex: 'none', width: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: '50%', bgcolor: 'accentSoft', fontSize: 11, fontWeight: 800, color: 'primary.main' }}
						>
							{initialsOf(nick.replace(/^seed_/, ''))}
						</Box>
						<Typography component="span" sx={{ fontSize: 14, fontWeight: 600, color: 'ink' }}>
							@{nick}
						</Typography>
						{guest && (
							<Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, fontSize: 13, color: 'muted' }}>
								<LockOutlinedIcon aria-hidden="true" sx={{ fontSize: 13 }} />
								{t('briefs:feed.contactAfterSignIn')}
							</Typography>
						)}
					</Box>
				)}
			</Box>
			<Box
				sx={{
					flex: '1 0 200px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-end',
					justifyContent: 'space-between',
					gap: 4.5,
					textAlign: 'right',
				}}
			>
				<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
					<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
						{t('briefs:budget.label')}
					</Typography>
					<Typography
						component="span"
						sx={{
							fontFamily: fonts.display,
							fontSize: fixed ? 30 : 24,
							lineHeight: 1,
							fontWeight: 800,
							letterSpacing: '-0.03em',
							color: fixed ? 'ink' : 'primary.main',
						}}
					>
						{fixed ? format.price(brief.briefBudget as number) : t('briefs:budget.open')}
					</Typography>
				</Box>
				{/* The title is the link for keyboard and screen readers; this one is a bigger target for the mouse. */}
				<ButtonBase
					component={NextLink}
					href={href}
					tabIndex={-1}
					aria-hidden="true"
					sx={{
						minHeight: 44,
						px: 4.5,
						borderRadius: home.radius.button,
						bgcolor: home.footer,
						color: colors.white,
						fontSize: 15,
						fontWeight: 700,
						'&:hover': { bgcolor: 'ink' },
					}}
				>
					{t('briefs:feed.view')}
				</ButtonBase>
			</Box>
		</Box>
	);
};
