import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { EditOutlined as EditOutlinedIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { CommentsSection, articleCommentTarget } from '@/features/comments';
import type { ArticleDetailQuery as ArticleDetailData, LikeArticleMutation as LikeArticleResult } from '@/gql/graphql';
import { toErrorKey } from '@/shared/lib/errors';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { Avatar } from '@/shared/ui/Avatar';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useToast } from '@/shared/ui/toast';
import { NightBand, NightBreadcrumbs, pageCardSx, pageFrameSx } from '@/shared/ui/page';
import { colors, home, radiusPx } from '@/theme/tokens';
import { ArticleDetailQuery, ArticleViewerQuery, LikeArticleMutation } from '../graphql/articles';
import { COMMUNITY_PATH, articleEditHref } from '../lib/articles';
import { TopicPill } from './feed/TopicPill';

type Article = ArticleDetailData['getBoardArticle'];

/** Like / unlike an article (§3.9): optimistic, rolled back on error; guests go to login. */
const ArticleLikeButton = ({ article }: { article: Article }) => {
	const { t } = useTranslation(['community', 'errors']);
	const router = useRouter();
	const toast = useToast();
	const format = useFormat();
	const { status, me } = useAuth();
	const isMember = status === 'member' && me?.memberStatus === 'ACTIVE';
	const viewer = useQuery(ArticleViewerQuery, { variables: { articleId: article._id }, skip: !isMember });
	const [like, { loading }] = useMutation(LikeArticleMutation);
	const liked = Boolean(viewer.data?.getBoardArticle.meLiked?.some((item) => item.myFavorite));
	const inactive = status === 'loading' || (isMember && !viewer.data) || loading;

	const onClick = async () => {
		if (!isMember || !me) {
			void router.push(`/login?${new URLSearchParams({ next: router.asPath })}`);
			return;
		}
		if (inactive) return;
		const next = !liked;
		try {
			await like({
				variables: { articleId: article._id },
				optimisticResponse: {
					likeTargetBoardArticle: {
						__typename: 'BoardArticle',
						_id: article._id,
						articleLikes: Math.max(0, article.articleLikes + (next ? 1 : -1)),
					} as LikeArticleResult['likeTargetBoardArticle'],
				},
				update: (cache) => {
					cache.modify({
						id: cache.identify({ __typename: 'BoardArticle', _id: article._id }),
						fields: { meLiked: () => (next ? [{ __typename: 'MeLiked', memberId: me._id, likeRefId: article._id, myFavorite: true }] : []) },
					});
				},
			});
		} catch (error) {
			toast.error(t(toErrorKey(error)));
		}
	};

	return (
		<Button
			variant="outlined"
			aria-pressed={liked}
			aria-disabled={inactive || undefined}
			onClick={() => void onClick()}
			startIcon={liked ? <FavoriteIcon sx={{ color: 'primary.main' }} /> : <FavoriteBorderIcon />}
			sx={{ ...(liked && { bgcolor: 'accentSoft', borderColor: 'accentBorder', color: 'primary.main' }), ...(inactive && { opacity: 0.6 }) }}
		>
			{t('community:detail.like')} · {format.compact(article.articleLikes)}
		</Button>
	);
};

const READING_WIDTH = 820;

/**
 * /community/[id], in the catalog language: the night band (breadcrumb, topic pill, title, author, date, views),
 * then the article card (cover, text, like / edit) and its comments (CommentGroup ARTICLE). The column stays a
 * reading width.
 */
export const ArticleDetail = ({ articleId }: { articleId: string }) => {
	const { t } = useTranslation(['community', 'common']);
	const format = useFormat();
	const { me } = useAuth();
	const { data, loading, error, refetch } = useQuery(ArticleDetailQuery, { variables: { articleId } });
	const article = data?.getBoardArticle;
	const frameSx = { ...pageFrameSx, maxWidth: READING_WIDTH };

	if (loading && !article) {
		return (
			<Box sx={frameSx}>
				<Skeleton variant="rounded" height={360} aria-label={t('common:status.loading')} />
			</Box>
		);
	}
	if (!article) {
		return (
			<Box sx={frameSx}>
				<ErrorState error={error} title={t('community:detail.errorTitle')} onRetry={() => void refetch()} />
			</Box>
		);
	}
	const author = article.memberData;
	const src = mediaUrl(article.articleImage);
	const isOwner = Boolean(me && me._id === article.memberId);

	return (
		<>
			<NightBand
				maxWidth={READING_WIDTH}
				titleId="article-title"
				title={article.articleTitle}
				top={
					<NightBreadcrumbs
						label={t('community:detail.breadcrumb')}
						items={[{ label: t('common:nav.community'), href: COMMUNITY_PATH }, { label: article.articleTitle }]}
					/>
				}
				pills={<TopicPill topic={article.articleCategory} />}
				meta={
					// author is null when the member was deleted (D-38): name without a link
					<Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
						<Avatar
							memberId={article.memberId}
							name={author ? author.memberFullName || author.memberNick : t('common:deletedMember')}
							image={author?.memberImage}
							size={28}
						/>
						<span>
							{author ? (
								<Link
									component={NextLink}
									href={`/members/${author._id}`}
									sx={{ color: colors.white, fontWeight: 700, '&:hover': { color: home.nightTextSoft } }}
								>
									@{author.memberNick}
								</Link>
							) : (
								<Box component="span" sx={{ fontWeight: 700, color: colors.white }}>
									{t('common:deletedMember')}
								</Box>
							)}{' '}
							·{' '}
							<time dateTime={article.createdAt} suppressHydrationWarning>
								{format.date(article.createdAt)}
							</time>{' '}
							· {t('community:views', { count: article.articleViews, formatted: format.compact(article.articleViews) })}
						</span>
					</Box>
				}
			/>
			<Box sx={frameSx}>
				<Box component="article" aria-labelledby="article-title" sx={{ ...pageCardSx, gap: 5 }}>
					{src && (
						<Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: radiusPx.lg, overflow: 'hidden', bgcolor: 'ground' }}>
							<Image src={src} alt="" fill sizes="(max-width: 900px) 100vw, 760px" style={{ objectFit: 'cover' }} />
						</Box>
					)}
					{/* Plain text (§3.10). */}
					<Typography sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', fontSize: 17, lineHeight: 1.75 }}>
						{article.articleContent}
					</Typography>
					<Stack direction="row" spacing={2} sx={{ pt: 4, borderTop: 1, borderColor: 'border' }}>
						<ArticleLikeButton article={article} />
						{isOwner && (
							<Button component={NextLink} href={articleEditHref(article._id)} variant="outlined" startIcon={<EditOutlinedIcon />}>
								{t('community:detail.edit')}
							</Button>
						)}
					</Stack>
				</Box>
				<CommentsSection
					target={articleCommentTarget(article._id)}
					authorId={article.memberId}
					canPost
					placeholder={t('community:detail.commentPlaceholder')}
					labels={{ title: t('community:detail.commentsTitle'), field: t('community:detail.commentLabel'), submit: t('community:detail.commentSubmit') }}
				/>
			</Box>
		</>
	);
};
