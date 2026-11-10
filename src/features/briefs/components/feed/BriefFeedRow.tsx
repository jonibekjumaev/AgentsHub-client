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
import { enterSx, focusVisibleSx } from '@/shared/ui/catalog';
import { briefFeed, colors, fonts, home } from '@/theme/tokens';
import { deadlineState } from '../../lib/deadline';
import { briefHref } from '../../lib/detail';
import { SaveBriefButton } from '../SaveBriefButton';
import { BriefStatusPill, CategoryPill, DeadlineText, Fact, factIconSx } from './briefParts';

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
 * left; the budget, Save (D-47) and "View brief" on the right. Wraps into one column on narrow screens.
 * Also the row of the saved-briefs list.
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
					<BriefStatusPill closed={closed} past={past} />
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
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<SaveBriefButton brief={brief} />
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
		</Box>
	);
};
