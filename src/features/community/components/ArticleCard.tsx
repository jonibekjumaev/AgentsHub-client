import NextLink from 'next/link';
import Image from 'next/image';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { ArticleCardFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { radiusPx } from '@/theme/tokens';
import { articleHref } from '../lib/articles';

/** Category pill for articles (neutral: categories here are topics, not agent categories). */
export const ArticleCategoryChip = ({ category }: { category: string }) => {
	const { t } = useTranslation('community');
	return (
		<Box component="span" sx={{ px: 2, py: 0.25, borderRadius: radiusPx.pill, bgcolor: 'neutralSoft', color: 'bodySoft', fontSize: 11, fontWeight: 800 }}>
			{t(`community:categories.${category}`)}
		</Box>
	);
};

/** One article row: category, title (the link), two lines of text, author · time · likes · comments; image on the right. */
export const ArticleCard = ({ article, headingLevel = 'h2' }: { article: ArticleCardFragment; headingLevel?: 'h2' | 'h3' }) => {
	const { t } = useTranslation(['community', 'common']);
	const format = useFormat();
	const src = mediaUrl(article.articleImage);

	return (
		<Box
			component="article"
			sx={{
				position: 'relative',
				display: 'flex',
				gap: 4,
				p: 5,
				bgcolor: 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
				'&:hover': { borderColor: 'inputBorder' },
				'&:focus-within': { outline: 2, outlineStyle: 'solid', outlineColor: 'primary.main', outlineOffset: 2 },
			}}
		>
			<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
				<div>
					<ArticleCategoryChip category={article.articleCategory} />
				</div>
				<Typography component={headingLevel} sx={{ fontSize: 17, fontWeight: 800, overflowWrap: 'anywhere' }}>
					<Link
						component={NextLink}
						href={articleHref(article._id)}
						underline="none"
						sx={{ color: 'ink', '&::after': { content: '""', position: 'absolute', inset: 0 }, '&:focus-visible': { outline: 0 } }}
					>
						{article.articleTitle}
					</Link>
				</Typography>
				<Typography
					variant="body2"
					sx={{ color: 'bodySoft', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}
				>
					{article.articleContent}
				</Typography>
				<Typography variant="meta">
					{article.memberData ? <>@{article.memberData.memberNick} · </> : <>{t('common:deletedMember')} · </>}
					<time dateTime={article.createdAt} suppressHydrationWarning>
						{format.relative(article.createdAt)}
					</time>{' '}
					· {t('community:likes', { count: article.articleLikes, formatted: format.compact(article.articleLikes) })} ·{' '}
					{t('community:comments', { count: article.articleComments, formatted: format.number(article.articleComments) })}
				</Typography>
			</Box>
			{src && (
				<Box sx={{ position: 'relative', flex: 'none', width: { xs: 72, sm: 120 }, aspectRatio: '4 / 3', borderRadius: radiusPx.md, overflow: 'hidden', bgcolor: 'ground' }}>
					<Image src={src} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} />
				</Box>
			)}
		</Box>
	);
};

export const ArticleList = ({ articles, label }: { articles: ArticleCardFragment[]; label: string }) => (
	<Stack component="ul" aria-label={label} spacing={3} sx={{ m: 0, p: 0, listStyle: 'none' }}>
		{articles.map((article) => (
			<li key={article._id}>
				<ArticleCard article={article} />
			</li>
		))}
	</Stack>
);
