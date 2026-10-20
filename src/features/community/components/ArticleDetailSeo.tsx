import { useQuery } from '@apollo/client';
import { Seo } from '@/shared/layout/Seo';
import { mediaUrl } from '@/shared/lib/media';
import { ArticleDetailQuery } from '../graphql/articles';

export const ArticleDetailSeo = ({ articleId }: { articleId: string }) => {
	const { data } = useQuery(ArticleDetailQuery, { variables: { articleId }, fetchPolicy: 'cache-only' });
	const article = data?.getBoardArticle;
	if (!article) return null;
	return (
		<Seo
			title={article.articleTitle}
			description={article.articleContent.replace(/\s+/g, ' ').trim().slice(0, 160)}
			image={mediaUrl(article.articleImage) ?? undefined}
		/>
	);
};
