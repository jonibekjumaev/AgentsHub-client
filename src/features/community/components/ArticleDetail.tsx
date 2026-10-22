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
import { radiusPx } from '@/theme/tokens';
import { ArticleDetailQuery, ArticleViewerQuery, LikeArticleMutation } from '../graphql/articles';
import { COMMUNITY_PATH, articleEditHref } from '../lib/articles';
import { ArticleCategoryChip } from './ArticleCard';

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

/** /community/[id]: one article, its like button and its comments (CommentGroup ARTICLE). */
export const ArticleDetail = ({ articleId }: { articleId: string }) => {
	const { t } = useTranslation(['community', 'common']);
	const format = useFormat();
	const { me } = useAuth();
	const { data, loading, error, refetch } = useQuery(ArticleDetailQuery, { variables: { articleId } });
	const article = data?.getBoardArticle;

	const body = () => {
		if (loading && !article) return <Skeleton variant="rounded" height={360} aria-label={t('common:status.loading')} />;
		if (!article) return <ErrorState error={error} title={t('community:detail.errorTitle')} onRetry={() => void refetch()} />;
		const author = article.memberData;
		const src = mediaUrl(article.articleImage);
		const isOwner = Boolean(me && me._id === article.memberId);

		return (
			<>
				<Box component="nav" aria-label={t('community:detail.breadcrumb')}>
					<Box component="ol" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none', fontSize: 13, color: 'muted' }}>
						<li>
							<Link component={NextLink} href={COMMUNITY_PATH} sx={{ color: 'muted', fontWeight: 500 }}>
								{t('common:nav.community')}
							</Link>
						</li>
						<li aria-hidden="true">/</li>
						<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}>
							{article.articleTitle}
						</Box>
					</Box>
				</Box>
				<Box component="article" aria-labelledby="article-title" sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
					<div>
						<ArticleCategoryChip category={article.articleCategory} />
					</div>
					<Typography id="article-title" variant="h1" sx={{ fontSize: { xs: 26, md: 32 }, overflowWrap: 'anywhere' }}>
						{article.articleTitle}
					</Typography>
					{/* author is null when the member was deleted (D-38): name without a link */}
					<Stack direction="row" spacing={2.5} alignItems="center">
						<Avatar
							memberId={article.memberId}
							name={author ? author.memberFullName || author.memberNick : t('common:deletedMember')}
							image={author?.memberImage}
							size={36}
						/>
						<Typography variant="meta">
							{author ? (
								<Link component={NextLink} href={`/members/${author._id}`} sx={{ color: 'ink', fontWeight: 700 }}>
									@{author.memberNick}
								</Link>
							) : (
								<Box component="span" sx={{ fontWeight: 700 }}>
									{t('common:deletedMember')}
								</Box>
							)}{' '}
							·{' '}
							<time dateTime={article.createdAt} suppressHydrationWarning>
								{format.date(article.createdAt)}
							</time>{' '}
							· {t('community:views', { count: article.articleViews, formatted: format.compact(article.articleViews) })}
						</Typography>
					</Stack>
					{src && (
						<Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: radiusPx.md, overflow: 'hidden', bgcolor: 'ground' }}>
							<Image src={src} alt="" fill sizes="(max-width: 900px) 100vw, 760px" style={{ objectFit: 'cover' }} />
						</Box>
					)}
					{/* Plain text (§3.10). */}
					<Typography sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'body', lineHeight: 1.7 }}>{article.articleContent}</Typography>
					<Stack direction="row" spacing={2}>
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
			</>
		);
	};

	return <Box sx={{ maxWidth: 820, mx: 'auto', px: { xs: 4, sm: 6 }, pt: 6, pb: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>{body()}</Box>;
};
