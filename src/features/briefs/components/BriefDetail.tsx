import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { MY_AGENTS_PATH } from '@/features/agents';
import { CommentsSection, briefCommentTarget } from '@/features/comments';
import { BriefStatus } from '@/gql/enums';
import type { BriefDetailQuery as BriefDetailData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { CategoryChip } from '@/shared/ui/CategoryChip';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusChip } from '@/shared/ui/StatusChip';
import { fonts, radiusPx } from '@/theme/tokens';
import { BriefDetailQuery } from '../graphql/briefs';
import { isDeadlinePassed } from '../lib/detail';
import { DEFAULT_BRIEF_FILTERS, briefsHref } from '../lib/listQuery';
import { BriefBudget } from './BriefRow';
import { BriefContacts } from './BriefContacts';

type Brief = BriefDetailData['getBrief'];
type Author = NonNullable<Brief['memberData']>;

const cardSx = {
	display: 'flex',
	flexDirection: 'column',
	gap: 4,
	p: 6,
	bgcolor: 'surface',
	border: 1,
	borderColor: 'border',
	borderRadius: radiusPx.lg,
} as const;

const tileSx = {
	flex: '1 1 140px',
	minWidth: 0,
	p: 4,
	borderRadius: radiusPx.md,
	bgcolor: 'ground',
	display: 'flex',
	flexDirection: 'column',
	gap: 1,
} as const;

const memberHref = (memberId: string) => `/members/${memberId}`;

const Breadcrumbs = ({ brief }: { brief: Brief }) => {
	const { t } = useTranslation(['briefs', 'common']);
	return (
		<Box component="nav" aria-label={t('briefs:detail.breadcrumb')}>
			<Box
				component="ol"
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none', fontSize: 13, color: 'muted' }}
			>
				<li>
					<Link
						component={NextLink}
						href={briefsHref({ ...DEFAULT_BRIEF_FILTERS, tab: brief.briefStatus === BriefStatus.Closed ? 'closed' : 'open' })}
						sx={{ color: 'muted', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
					>
						{t('common:nav.briefs')}
					</Link>
				</li>
				<li aria-hidden="true">/</li>
				<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}>
					{brief.briefTitle}
				</Box>
			</Box>
		</Box>
	);
};

/** Budget / Deadline / Currency tiles (BriefDetail.html). */
const Facts = ({ brief }: { brief: Brief }) => {
	const { t } = useTranslation('briefs');
	const format = useFormat();
	const passed = brief.briefStatus === BriefStatus.Open && isDeadlinePassed(brief.briefDeadline);

	return (
		<Box component="dl" sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, m: 0 }}>
			<Box sx={tileSx}>
				<Typography component="dt" variant="caption">
					{t('briefs:detail.budget')}
				</Typography>
				<Box component="dd" sx={{ m: 0 }}>
					<BriefBudget budget={brief.briefBudget} size={20} />
				</Box>
			</Box>
			<Box sx={tileSx}>
				<Typography component="dt" variant="caption">
					{t('briefs:detail.deadline')}
				</Typography>
				<Box component="dd" sx={{ m: 0 }}>
					{brief.briefDeadline ? (
						<>
							<Typography sx={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 18, color: passed ? 'warning.main' : 'ink' }}>
								<time dateTime={brief.briefDeadline} suppressHydrationWarning>
									{format.date(brief.briefDeadline)}
								</time>
							</Typography>
							{passed && (
								<Typography variant="caption" component="p" sx={{ color: 'warning.main', fontWeight: 700 }}>
									{t('briefs:detail.deadlinePassed')}
								</Typography>
							)}
						</>
					) : (
						<Typography sx={{ fontWeight: 800, color: 'body', fontSize: 16 }}>{t('briefs:deadline.none')}</Typography>
					)}
				</Box>
			</Box>
			<Box sx={tileSx}>
				<Typography component="dt" variant="caption">
					{t('briefs:detail.currency')}
				</Typography>
				<Typography component="dd" sx={{ m: 0, fontFamily: fonts.mono, fontWeight: 500, fontSize: 18, color: 'ink' }}>
					USD
				</Typography>
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

/** For creators: the brief is a lead — point them to their listings (BriefDetail.html aside). */
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
 * /briefs/[id] (BriefDetail.html). Public data comes from the SSR cache; contacts and the view load
 * after auth; comments load in the browser. A CLOSED brief keeps its page and comments, without the
 * comment box (D-30, §3.8).
 */
export const BriefDetail = ({ briefId }: { briefId: string }) => {
	const { t } = useTranslation(['briefs', 'common']);
	const format = useFormat();
	const { data, loading, error, refetch } = useQuery(BriefDetailQuery, { variables: { briefId } });
	const brief = data?.getBrief;

	const body = () => {
		if (loading && !brief) return <DetailSkeleton />;
		if (!brief) return <ErrorState error={error} title={t('briefs:detail.errorTitle')} onRetry={() => void refetch()} />;
		const author = brief.memberData;
		const closed = brief.briefStatus === BriefStatus.Closed;

		return (
			<>
				<Breadcrumbs brief={brief} />
				{/* DOM order = the mobile order: brief, author + contacts, questions. From md the aside moves right. */}
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
					<Box component="article" aria-labelledby="brief-title" sx={cardSx}>
						<Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
							<StatusChip kind="brief" status={brief.briefStatus} size="medium" />
							<CategoryChip category={brief.briefCategory} size="medium" />
							<Typography variant="meta" component="span">
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
						</Stack>
						<Typography id="brief-title" variant="h1" sx={{ fontSize: { xs: 28, md: 34 }, overflowWrap: 'anywhere' }}>
							{brief.briefTitle}
						</Typography>
						<Facts brief={brief} />
						{/* Plain text from the author (CLAUDE.md rule 7). */}
						<Typography sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.7 }}>
							{brief.briefContent}
						</Typography>
					</Box>

					<Box
						component="aside"
						sx={{ gridColumn: { md: 2 }, gridRow: { md: '1 / -1' }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
					>
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
				</Box>
			</>
		);
	};

	return (
		<Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
			{body()}
		</Box>
	);
};
