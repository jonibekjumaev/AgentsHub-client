import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Box, Stack } from '@mui/material';
import { BookmarkBorder as BookmarkBorderIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { SavedBriefsQuery } from '../../graphql/saved';
import { BRIEFS_PATH } from '../../lib/listQuery';
import { BriefFeedRow } from '../feed/BriefFeedRow';
import { FeedSkeleton, feedSx } from '../feed/FeedList';
import { DashboardHeader } from '@/shared/ui/page';

export const SAVED_BRIEFS_PAGE_SIZE = 10;

/**
 * /dashboard/saved-briefs (D-47): the member's saved briefs, latest saved first, as rows of the /briefs feed with
 * their Save button. OPEN and CLOSED briefs come back (a closed one keeps its "Closed" pill); deleted ones drop out
 * on the server and metaCounter matches.
 *
 * Unsaving here keeps the row in place with the button switched off, so a slip of the finger is one click to undo;
 * the list is asked for again (cache-and-network) the next time the page opens.
 */
export const SavedBriefs = () => {
	const { t } = useTranslation(['saved', 'briefs']);
	const [page, setPage] = useState(1);
	// One clock for every row of a render: the deadline labels agree with each other.
	const [now] = useState(() => new Date());
	const query = useQuery(SavedBriefsQuery, {
		variables: { input: { page, limit: SAVED_BRIEFS_PAGE_SIZE } },
		// Saving elsewhere changes this list: always ask the server when the page opens.
		fetchPolicy: 'cache-and-network',
	});
	const result = query.data?.getSavedBriefs;
	const briefs = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;

	const body = () => {
		if (query.loading && !result) return <FeedSkeleton rows={3} />;
		if (query.error && !result) {
			return <ErrorState error={query.error} title={t('saved:errorTitle')} onRetry={() => void query.refetch()} />;
		}
		if (briefs.length === 0) {
			return (
				<EmptyState
					icon={<BookmarkBorderIcon />}
					title={t('saved:briefs.emptyTitle')}
					text={t('saved:briefs.emptyText')}
					action={{ label: t('saved:briefs.browse'), href: BRIEFS_PATH }}
				/>
			);
		}
		return (
			<>
				<Box component="ol" aria-label={t('saved:briefs.title')} sx={feedSx}>
					{briefs.map((brief, index) => (
						<li key={brief._id}>
							<BriefFeedRow brief={brief} index={index} guest={false} now={now} />
						</li>
					))}
				</Box>
				<Pagination page={page} count={Math.ceil(total / SAVED_BRIEFS_PAGE_SIZE)} onChange={setPage} />
			</>
		);
	};

	return (
		<Stack spacing={6}>
			<DashboardHeader title={t('saved:briefs.title')} subtitle={t('saved:briefs.subtitle')} />
			{body()}
		</Stack>
	);
};
