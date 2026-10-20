import { useApolloClient, useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, getErrorMessages, toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { MyBriefsQuery, UpdateBriefStatusMutation } from '../graphql/myBriefs';
import { BriefErrorMessage } from '../lib/briefForm';
import { BRIEF_ACTION_TARGET, type BriefAction } from '../lib/myBriefs';

type BriefRef = { _id: string; briefTitle: string };

/** 'deadline': the API refused to reopen because the deadline has passed (D-31) — ask for a new one. */
export type BriefActionResult = 'done' | 'deadline' | 'failed';

/**
 * Close / reopen / delete, confirmed by the server before the UI changes (not optimistic): the tab
 * counts and the page depend on the result. After success the list query re-runs (awaited).
 * `briefDeadline` goes with a reopen only: a new date, or null to remove it (D-31).
 */
export const useBriefStatusAction = () => {
	const { t } = useTranslation(['briefs', 'errors']);
	const toast = useToast();
	const client = useApolloClient();
	const [mutate, { loading }] = useMutation(UpdateBriefStatusMutation, {
		refetchQueries: [MyBriefsQuery],
		awaitRefetchQueries: true,
		// The public list and detail change too (a closed brief moves tabs): drop the cached lists.
		update: (cache) => {
			cache.evict({ id: 'ROOT_QUERY', fieldName: 'getBriefs' });
			cache.gc();
		},
	});

	const run = async (brief: BriefRef, action: BriefAction, briefDeadline?: string | null): Promise<BriefActionResult> => {
		try {
			await mutate({
				variables: {
					input: {
						_id: brief._id,
						briefStatus: BRIEF_ACTION_TARGET[action],
						...(action === 'reopen' && briefDeadline !== undefined && { briefDeadline }),
					},
				},
			});
			toast.success(t(`briefs:mine.done.${action}`, { title: brief.briefTitle }));
			return 'done';
		} catch (error) {
			if (action === 'reopen' && getErrorMessages(error).includes(BriefErrorMessage.DeadlineFuture)) return 'deadline';
			const key = getErrorCode(error) === ErrorCode.NotFound ? 'briefs:mine.errors.changed' : toErrorKey(error);
			toast.error(t(key));
			void client.refetchQueries({ include: [MyBriefsQuery] });
			return 'failed';
		}
	};

	return { run, loading };
};
