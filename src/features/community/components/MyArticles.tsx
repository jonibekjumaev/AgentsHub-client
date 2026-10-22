import { useState } from 'react';
import NextLink from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { Add as AddIcon, EditOutlined as EditOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import type { ArticleCardFragment } from '@/gql/graphql';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { useToast } from '@/shared/ui/toast';
import { ArticlesListQuery, UpdateArticleMutation } from '../graphql/articles';
import { ARTICLES_PAGE_SIZE, NEW_ARTICLE_PATH, articleEditHref, memberArticlesVariables } from '../lib/articles';
import { ArticleCard } from './ArticleCard';

/** /dashboard/articles: the member's own articles, with Edit and Delete (articleStatus DELETE). */
export const MyArticles = () => {
	const { t } = useTranslation(['community', 'errors']);
	const toast = useToast();
	const { me } = useAuth();
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery(ArticlesListQuery, {
		variables: memberArticlesVariables(me?._id ?? '', page),
		skip: !me,
		fetchPolicy: 'cache-and-network',
	});
	const [remove, { loading: removing }] = useMutation(UpdateArticleMutation, { refetchQueries: [ArticlesListQuery], awaitRefetchQueries: true });
	const [pending, setPending] = useState<ArticleCardFragment | null>(null);
	const [open, setOpen] = useState(false);

	const articles = data?.getBoardArticles.list ?? [];
	const total = data?.getBoardArticles.metaCounter?.[0]?.total ?? 0;

	const confirmDelete = async () => {
		if (!pending) return;
		try {
			await remove({ variables: { input: { _id: pending._id, articleStatus: 'DELETE' } } });
			toast.success(t('community:mine.deleted', { title: pending.articleTitle }));
		} catch (caught) {
			toast.error(t(getErrorCode(caught) === ErrorCode.NotFound ? 'community:mine.changed' : toErrorKey(caught)));
		}
		setOpen(false);
	};

	const body = () => {
		if (loading && !data) return <Skeleton variant="rounded" height={240} aria-label={t('community:list.loading')} />;
		if (error && !data) return <ErrorState error={error} title={t('community:list.errorTitle')} onRetry={() => void refetch()} />;
		if (articles.length === 0) {
			return <EmptyState title={t('community:mine.emptyTitle')} text={t('community:mine.emptyText')} action={{ label: t('community:list.write'), href: NEW_ARTICLE_PATH }} />;
		}
		return (
			<>
				<Stack component="ul" aria-label={t('community:mine.title')} spacing={3} sx={{ m: 0, p: 0, listStyle: 'none' }}>
					{articles.map((article) => (
						<Box component="li" key={article._id} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<ArticleCard article={article} />
							<Stack direction="row" spacing={2} justifyContent="flex-end">
								<Button
									component={NextLink}
									href={articleEditHref(article._id)}
									size="small"
									variant="outlined"
									startIcon={<EditOutlinedIcon />}
									aria-label={t('community:mine.editLabel', { title: article.articleTitle })}
								>
									{t('community:mine.edit')}
								</Button>
								<Button
									size="small"
									variant="outlined"
									color="error"
									disabled={removing}
									onClick={() => {
										setPending(article);
										setOpen(true);
									}}
									aria-label={t('community:mine.deleteLabel', { title: article.articleTitle })}
								>
									{t('community:mine.delete')}
								</Button>
							</Stack>
						</Box>
					))}
				</Stack>
				<Pagination page={page} count={Math.ceil(total / ARTICLES_PAGE_SIZE)} onChange={setPage} />
			</>
		);
	};

	return (
		<Stack spacing={6}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 4 }}>
				<div>
					<Typography variant="h1">{t('community:mine.title')}</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('community:mine.subtitle')}</Typography>
				</div>
				<Button component={NextLink} href={NEW_ARTICLE_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
					{t('community:list.write')}
				</Button>
			</Box>
			{body()}
			<ConfirmDialog
				open={open}
				title={t('community:mine.confirm.title', { title: pending?.articleTitle ?? '' })}
				text={t('community:mine.confirm.text')}
				confirmLabel={t('community:mine.confirm.confirm')}
				destructive
				loading={removing}
				onConfirm={() => void confirmDelete()}
				onCancel={() => setOpen(false)}
			/>
		</Stack>
	);
};
