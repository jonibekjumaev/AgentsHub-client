import { type ReactNode, useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	ArrowForward as ArrowForwardIcon,
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { MY_AGENTS_PATH } from '@/features/agents';
import { CommentsSection, briefCommentTarget } from '@/features/comments';
import { BriefStatus } from '@/gql/enums';
import type { BriefDetailQuery as BriefDetailData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { focusVisibleSx } from '@/shared/ui/catalog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { briefFeed, catalog, colors, fonts, home, radiusPx } from '@/theme/tokens';
import { BriefDetailQuery } from '../graphql/briefs';
import { useBriefViewer } from '../hooks/useBriefViewer';
import { deadlineState } from '../lib/deadline';
import { isDeadlinePassed } from '../lib/detail';
import { DEFAULT_BRIEF_FILTERS, briefsHref } from '../lib/listQuery';
import { BriefContacts } from './BriefContacts';
import { BriefStatusPill, CategoryPill, DeadlineText, Fact, factIconSx } from './feed/briefParts';
import { SaveBriefButton } from './SaveBriefButton';

type Brief = BriefDetailData['getBrief'];
type Author = NonNullable<Brief['memberData']>;

/** A white card of the briefs design (the feed's container: 22px corners, thin border). */
const cardSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	p: { xs: 5, sm: 6 },
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	borderRadius: home.radius.card,
} as const;

const memberHref = (memberId: string) => `/members/${memberId}`;

const Breadcrumbs = ({ brief }: { brief: Brief }) => {
	const { t } = useTranslation(['briefs', 'common']);
	return (
		<Box component="nav" aria-label={t('briefs:detail.breadcrumb')}>
			<Box
				component="ol"
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none', fontSize: 13, color: home.nightText }}
			>
				<li>
					<Link
						component={NextLink}
						href={briefsHref({ ...DEFAULT_BRIEF_FILTERS, tab: brief.briefStatus === BriefStatus.Closed ? 'closed' : 'open' })}
						sx={{ color: home.nightText, fontWeight: 500, '&:hover': { color: colors.white }, ...focusVisibleSx }}
					>
						{t('common:nav.briefs')}
					</Link>
				</li>
				<li aria-hidden="true">/</li>
				<Box component="li" aria-current="page" sx={{ color: colors.white, fontWeight: 600, overflowWrap: 'anywhere' }}>
					{brief.briefTitle}
				</Box>
			</Box>
		</Box>
	);
};

/**
 * The top of the page, on the night ground of the /briefs band (agentshub-briefs design): breadcrumb, the status
 * and category pills, the title, and when it was posted, how often viewed, when closed.
 */
const DetailBand = ({ brief, past }: { brief: Brief; past: boolean }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const closed = brief.briefStatus === BriefStatus.Closed;

	return (
		<Box component="header" sx={{ position: 'relative', overflow: 'hidden', bgcolor: home.night, color: colors.white }}>
			<Box
				aria-hidden="true"
				sx={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					backgroundImage: catalog.heroDots,
					backgroundSize: '24px 24px',
					WebkitMaskImage: catalog.heroDotsMask,
					maskImage: catalog.heroDotsMask,
				}}
			/>
			<Box
				sx={{
					position: 'relative',
					maxWidth: 1200,
					mx: 'auto',
					px: { xs: 4, sm: 6 },
					pt: { xs: 8, md: 10 },
					pb: { xs: 9, md: 11 },
					display: 'flex',
					flexDirection: 'column',
					gap: 4.5,
				}}
			>
				<Breadcrumbs brief={brief} />
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 2 }}>
					<BriefStatusPill closed={closed} past={past} />
					<CategoryPill category={brief.briefCategory} />
				</Box>
				<Typography
					id="brief-title"
					variant="h1"
					sx={{
						maxWidth: 900,
						fontFamily: fonts.display,
						fontSize: 'clamp(28px, 4vw, 44px)',
						lineHeight: 1.08,
						fontWeight: 700,
						letterSpacing: '-0.03em',
						color: colors.white,
						overflowWrap: 'anywhere',
					}}
				>
					{brief.briefTitle}
				</Typography>
				<Typography sx={{ fontSize: 14, color: home.nightText }}>
					{/* Server and browser may sit in different time zones: the browser's date wins. */}
					<time dateTime={brief.createdAt} suppressHydrationWarning>
						{t('briefs:detail.posted', { date: format.date(brief.createdAt) })}
					</time>{' '}
					· {t('briefs:card.views', { count: brief.briefViews, formatted: format.compact(brief.briefViews) })}
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
		</Box>
	);
};

/**
 * The aside's first card, the decision a creator makes first: the budget (USD, D-06; "Open to offers" without one,
 * D-04), a passed deadline (D-05), and Save (D-47). meSaved comes from the signed-in viewer query (the server render
 * has no token), the same request that brings the contacts; until it arrives the button is inactive.
 */
const BudgetCard = ({ brief, past }: { brief: Brief; past: boolean }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const { data } = useBriefViewer(brief._id);
	const fixed = brief.briefBudget !== null && brief.briefBudget !== undefined;

	return (
		<Box sx={{ ...cardSx, gap: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
				<Typography component="h2" sx={{ fontSize: 13, color: 'muted' }}>
					{t('briefs:detail.budget')}
				</Typography>
				<Box component="span" sx={{ px: 2, py: 0.5, borderRadius: radiusPx.pill, bgcolor: 'neutralSoft', fontFamily: fonts.mono, fontSize: 12, color: 'body' }}>
					USD
				</Box>
			</Box>
			<Typography
				sx={{
					fontFamily: fonts.display,
					fontSize: fixed ? 38 : 28,
					lineHeight: 1,
					fontWeight: 800,
					letterSpacing: '-0.03em',
					color: fixed ? 'ink' : 'primary.main',
				}}
			>
				{fixed ? format.price(brief.briefBudget as number) : t('briefs:budget.open')}
			</Typography>
			<Typography sx={{ fontSize: 14, fontWeight: 600, color: 'body' }}>
				{t(`briefs:feed.budgetType.${fixed ? 'FIXED' : 'OPEN_TO_OFFERS'}`)}
			</Typography>
			{past && (
				<Typography sx={{ fontSize: 13, fontWeight: 700, color: briefFeed.deadline.passed.text }}>
					{t('briefs:detail.deadlinePassed')}
				</Typography>
			)}
			<Box sx={{ mt: 1 }}>
				<SaveBriefButton
					variant="labeled"
					fullWidth
					brief={{ _id: brief._id, briefTitle: brief.briefTitle, memberData: brief.memberData, meSaved: data?.getBrief.meSaved }}
				/>
			</Box>
		</Box>
	);
};

/** The brief itself: the author's text, then the facts row of the feed (deadline, questions). */
const BriefBody = ({ brief, now }: { brief: Brief; now: Date }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const closed = brief.briefStatus === BriefStatus.Closed;
	const deadline = deadlineState(brief.briefDeadline, now);

	return (
		<Box component="article" aria-labelledby="brief-title" sx={{ ...cardSx, gap: 5 }}>
			{/* Plain text from the author (CLAUDE.md rule 7). */}
			<Typography sx={{ fontSize: 16, lineHeight: 1.7, color: 'body', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
				{brief.briefContent}
			</Typography>
			<Box
				component="dl"
				sx={{ m: 0, pt: 4, borderTop: `1px solid ${briefFeed.rowDivider}`, display: 'flex', flexWrap: 'wrap', columnGap: 5.5, rowGap: 2, fontSize: 14 }}
			>
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
			</Box>
		</Box>
	);
};

const PostedBy = ({ brief, author }: { brief: Brief; author: Author }) => {
	const { t } = useTranslation('briefs');
	const name = author.memberFullName || author.memberNick;

	return (
		<Box sx={cardSx}>
			<Typography variant="overline" component="h2">
				{t('briefs:detail.postedBy')}
			</Typography>
			<Stack direction="row" spacing={3} alignItems="center" sx={{ minWidth: 0 }}>
				<Avatar memberId={author._id} name={name} image={author.memberImage} size={48} />
				<Box sx={{ minWidth: 0 }}>
					<Link
						component={NextLink}
						href={memberHref(author._id)}
						aria-label={t('briefs:detail.profile', { nick: author.memberNick })}
						sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}
					>
						@{author.memberNick}
					</Link>
					<Typography variant="meta">{t('briefs:detail.authorBriefs', { count: author.memberBriefs })}</Typography>
				</Box>
			</Stack>
			<BriefContacts briefId={brief._id} authorId={author._id} />
		</Box>
	);
};

/** The author was deleted (D-38): the API sends memberData null. No profile link, follow or contacts. */
const DeletedAuthorBox = () => {
	const { t } = useTranslation(['briefs', 'common']);
	return (
		<Box sx={cardSx}>
			<Typography variant="overline" component="h2">
				{t('briefs:detail.postedBy')}
			</Typography>
			<Stack direction="row" spacing={3} alignItems="center">
				<Avatar memberId="deleted" name={t('common:deletedMember')} size={48} />
				<Typography sx={{ color: 'muted', fontWeight: 800 }}>{t('common:deletedMember')}</Typography>
			</Stack>
		</Box>
	);
};

/** For creators: the brief is a lead — point them to their listings. */
const CreatorHint = () => {
	const { t } = useTranslation('briefs');
	const { status, me } = useAuth();
	if (status !== 'member' || me?.memberType !== 'CREATOR') return null;

	return (
		<Box sx={{ ...cardSx, gap: 2.5, bgcolor: 'accentSoft', borderColor: 'accentBorder' }}>
			<Typography component="h2" sx={{ fontWeight: 800, color: 'ink' }}>
				{t('briefs:detail.creatorHint.title')}
			</Typography>
			<Typography variant="body2" sx={{ color: 'bodySoft' }}>
				{t('briefs:detail.creatorHint.text')}
			</Typography>
			<Link
				component={NextLink}
				href={MY_AGENTS_PATH}
				sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 700, fontSize: 14 }}
			>
				{t('briefs:detail.creatorHint.action')}
				<ArrowForwardIcon aria-hidden="true" sx={{ fontSize: 16 }} />
			</Link>
		</Box>
	);
};

const DetailSkeleton = () => {
	const { t } = useTranslation('common');
	return (
		<Box role="status" aria-busy="true" aria-label={t('common:status.loading')} sx={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
			<Box sx={{ flex: '999 1 560px', minWidth: 0 }}>
				<Skeleton variant="text" width="70%" sx={{ fontSize: 36 }} aria-hidden="true" />
				<Skeleton variant="rounded" height={84} sx={{ mt: 4 }} aria-hidden="true" />
				<Skeleton variant="rounded" height={180} sx={{ mt: 4 }} aria-hidden="true" />
			</Box>
			<Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
				<Skeleton variant="rounded" height={200} aria-hidden="true" />
			</Box>
		</Box>
	);
};

/**
 * /briefs/[id], in the language of the /briefs feed (agentshub-briefs design): the night band with the pills and
 * the title, the brief and its facts, and an aside with the budget + Save (D-47), the author + contacts and the
 * creator hint. Public data comes from the SSR cache; contacts, meSaved and the view load
 * after auth; comments load in the browser. A CLOSED brief keeps its page and comments, without the
 * comment box (D-30, §3.8).
 */
export const BriefDetail = ({ briefId }: { briefId: string }) => {
	const { t } = useTranslation(['briefs', 'common']);
	const { data, loading, error, refetch } = useQuery(BriefDetailQuery, { variables: { briefId } });
	const brief = data?.getBrief;

	// One clock for the page: the deadline label and the "passed" state agree.
	const [now] = useState(() => new Date());

	const container = (children: ReactNode) => (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			{children}
		</Box>
	);

	if (loading && !brief) return container(<DetailSkeleton />);
	if (!brief) return container(<ErrorState error={error} title={t('briefs:detail.errorTitle')} onRetry={() => void refetch()} />);

	const author = brief.memberData;
	const closed = brief.briefStatus === BriefStatus.Closed;
	// An OPEN brief stays open after its deadline (D-05): shown as "Past deadline", never closed for it.
	const past = !closed && isDeadlinePassed(brief.briefDeadline);

	return (
		<>
			<DetailBand brief={brief} past={past} />
			{container(
				// DOM order = the mobile order: brief, budget + save, author + contacts, questions. From md the aside moves right.
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' },
						gridTemplateRows: { md: 'auto 1fr' },
						columnGap: 8,
						rowGap: 6,
						alignItems: 'start',
					}}
				>
					<BriefBody brief={brief} now={now} />
					<Box
						component="aside"
						sx={{ gridColumn: { md: 2 }, gridRow: { md: '1 / -1' }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
					>
						<BudgetCard brief={brief} past={past} />
						{author ? <PostedBy brief={brief} author={author} /> : <DeletedAuthorBox />}
						<CreatorHint />
					</Box>
					<CommentsSection
						target={briefCommentTarget(brief._id)}
						authorId={author?._id}
						canPost={!closed}
						lockedNote={t('briefs:detail.closedComments')}
						placeholder={t('briefs:detail.commentPlaceholder')}
					/>
				</Box>,
			)}
		</>
	);
};
