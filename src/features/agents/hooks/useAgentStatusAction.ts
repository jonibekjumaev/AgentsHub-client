import { useApolloClient, useMutation, type ApolloCache } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { CreatorAgentsQuery, UpdateAgentStatusMutation } from '../graphql/creatorAgents';
import { ACTION_TARGET, type StatusAction } from '../lib/myAgents';

type AgentRef = { _id: string; productTitle: string };

type Options = {
	/**
	 * true (default): the My agents list is on screen, so it is re-run after each action.
	 * false: no list on screen (the owner preview, S3c). Re-running an inactive query only logs an
	 * Apollo warning, so the cached creator lists are dropped instead and load fresh next time.
	 */
	refetchList?: boolean;
};

const forgetCreatorLists = (cache: ApolloCache<unknown>) => {
	cache.evict({ id: 'ROOT_QUERY', fieldName: 'getCreatorProducts' });
	cache.gc();
};

/**
 * Pause / resume / delete, confirmed by the server before the UI changes (not optimistic):
 * the tab counts, the page contents and the creator's agent count all depend on the result, a delete
 * can't be undone, and the server may refuse (changed in another tab or by an admin → NOT_FOUND).
 * After success the list query re-runs (awaited), so the row moves or disappears with correct counts.
 */
export const useAgentStatusAction = ({ refetchList = true }: Options = {}) => {
	const { t } = useTranslation(['dashboard', 'errors']);
	const toast = useToast();
	const client = useApolloClient();
	const [mutate, { loading }] = useMutation(
		UpdateAgentStatusMutation,
		refetchList ? { refetchQueries: [CreatorAgentsQuery], awaitRefetchQueries: true } : { update: forgetCreatorLists },
	);

	/** Resolves true on success. Errors become a toast; the list reloads so it shows the server's truth. */
	const run = async (agent: AgentRef, action: StatusAction): Promise<boolean> => {
		try {
			await mutate({ variables: { input: { _id: agent._id, productStatus: ACTION_TARGET[action] } } });
			toast.success(t(`dashboard:myAgents.done.${action}`, { title: agent.productTitle }));
			return true;
		} catch (error) {
			const key = getErrorCode(error) === ErrorCode.NotFound ? 'dashboard:myAgents.errors.changed' : toErrorKey(error);
			toast.error(t(key));
			if (refetchList) void client.refetchQueries({ include: [CreatorAgentsQuery] });
			return false;
		}
	};

	return { run, loading };
};
