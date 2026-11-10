import NextLink from 'next/link';
import Image from 'next/image';
import { Box, ButtonBase, Typography } from '@mui/material';
import {
	ChatBubbleOutline as ChatBubbleOutlineIcon,
	Favorite as FavoriteIcon,
	FavoriteBorder as FavoriteBorderIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { CommunityArticleFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { Avatar } from '@/shared/ui/Avatar';
import { enterSx, focusVisibleSx } from '@/shared/ui/catalog';
import { communityFeed, fonts, radiusPx } from '@/theme/tokens';
import { useArticleLike } from '../../hooks/useArticleLike';
import { articleHref, excerptOf, readMinutes } from '../../lib/articles';
import { TopicIcon, TopicPill, topicTint } from './TopicPill';

const pillSx = {
	minHeight: 34,
	display: 'inline-flex',
	alignItems: 'center',
	gap: 1.25,
	px: 3,
	borderRadius: radiusPx.pill,
	border: 1,
	borderColor: 'border',
	bgcolor: 'surface',
	color: 'body',
	fontSize: 13,
	fontWeight: 700,
	textDecoration: 'none',
	transition: 'background-color 200ms, border-color 200ms, color 200ms',
	'&:hover': { bgcolor: 'ground' },
	...focusVisibleSx,
} as const;

/** The article image, or the topic tint with its icon on a dot pattern when there is none. */
const Thumb = ({ article }: { article: CommunityArticleFragment }) => {
	const src = mediaUrl(article.articleImage);
	const [tint, ink] = topicTint(article.articleCategory);
	return (
		<Box
			aria-hidden="true"
			sx={{
				position: 'relative',
				flex: 'none',
				width: { xs: 88, sm: 148 },
				aspectRatio: '4 / 3',
				borderRadius: '14px',
				overflow: 'hidden',
				display: 'grid',
				placeItems: 'center',
				bgcolor: tint,
				backgroundImage: src ? undefined : communityFeed.thumbDots,
				backgroundSize: '14px 14px',
				color: ink,
			}}
		>
			{src ? <Image src={src} alt="" fill sizes="(max-width: 600px) 88px, 148px" style={{ objectFit: 'cover' }} /> : <TopicIcon topic={article.articleCategory} size={34} />}
		</Box>
	);
};

/** "♡ 12": a toggle (aria-pressed), optimistic; guests go to login. */
const LikePill = ({ article }: { article: CommunityArticleFragment }) => {
	const { t } = useTranslation('community');
	const format = useFormat();
	const liked = Boolean(article.meLiked?.some((item) => item.myFavorite));
	const { toggle, pending } = useArticleLike(article, liked);
	return (
		<ButtonBase
			aria-pressed={liked}
			aria-label={t('community:feed.like', { title: article.articleTitle, count: article.articleLikes })}
			onClick={() => void toggle()}
			sx={{
				...pillSx,
				...(liked && { bgcolor: communityFeed.liked.bg, borderColor: communityFeed.liked.border, color: communityFeed.liked.text, '&:hover': { bgcolor: communityFeed.liked.bg } }),
				...(pending && { opacity: 0.7 }),
			}}
		>
			{liked ? <FavoriteIcon aria-hidden="true" sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon aria-hidden="true" sx={{ fontSize: 16 }} />}
			{format.compact(article.articleLikes)}
		</ButtonBase>
	);
};

type ArticleFeedRowProps = { article: CommunityArticleFragment; index: number };

/**
 * One article of the /community feed (agentshub-community design): thumbnail, topic pill, time and read time,
 * the title (the link), a short excerpt, the author, then the like pill, the comments pill and the views.
 */
export const ArticleFeedRow = ({ article, index }: ArticleFeedRowProps) => {
	const { t } = useTranslation(['community', 'common']);
	const format = useFormat();
	const href = articleHref(article._id);
	const author = article.memberData;
	const authorName = author ? author.memberFullName || author.memberNick : t('common:deletedMember');

	return (
		<Box
			component="article"
			aria-labelledby={`article-${article._id}`}
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				gap: { xs: 4, sm: 6 },
				px: { xs: 5, sm: 7 },
				py: 6,
				transition: 'background-color 200ms',
				'&:hover': { bgcolor: 'surfaceMuted' },
				...enterSx(index),
			}}
		>
			<Thumb article={article} />
			<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 1.5 }}>
					<TopicPill topic={article.articleCategory} />
					<Typography component="span" sx={{ fontSize: 13, color: 'muted' }}>
						<time dateTime={article.createdAt} suppressHydrationWarning>
							{format.relative(article.createdAt)}
						</time>
						{' · '}
						{t('community:feed.readTime', { count: readMinutes(article.articleContent) })}
					</Typography>
				</Box>
				<Typography
					id={`article-${article._id}`}
					variant="h2"
					sx={{ fontFamily: fonts.display, fontSize: { xs: 19, sm: 22 }, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}
				>
					<Box
						component={NextLink}
						href={href}
						sx={{ color: 'ink', textDecoration: 'none', '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' }, ...focusVisibleSx }}
					>
						{article.articleTitle}
					</Box>
				</Typography>
				{/* Plain text (CLAUDE.md rule 7); whitespace is collapsed for the excerpt. */}
				<Typography
					sx={{ fontSize: 15, lineHeight: 1.55, color: 'bodySoft', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}
				>
					{excerptOf(article.articleContent)}
				</Typography>
				<Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', columnGap: 4, rowGap: 3 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0 }}>
						<Avatar memberId={author?._id ?? 'deleted'} name={authorName} image={author?.memberImage} size={28} />
						{author ? (
							<Box
								component={NextLink}
								href={`/members/${author._id}`}
								sx={{ fontSize: 14, fontWeight: 600, color: 'ink', textDecoration: 'none', overflowWrap: 'anywhere', '&:hover': { textDecoration: 'underline' }, ...focusVisibleSx }}
							>
								{authorName}
							</Box>
						) : (
							<Typography component="span" sx={{ fontSize: 14, color: 'muted' }}>
								{authorName}
							</Typography>
						)}
					</Box>
					<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
						<LikePill article={article} />
						<ButtonBase
							component={NextLink}
							href={href}
							aria-label={t('community:feed.commentsLink', { title: article.articleTitle, count: article.articleComments })}
							sx={pillSx}
						>
							<ChatBubbleOutlineIcon aria-hidden="true" sx={{ fontSize: 16 }} />
							{format.number(article.articleComments)}
						</ButtonBase>
						<Typography component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1, fontSize: 13, color: 'muted' }}>
							<VisibilityOutlinedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
							{t('community:views', { count: article.articleViews, formatted: format.compact(article.articleViews) })}
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};
