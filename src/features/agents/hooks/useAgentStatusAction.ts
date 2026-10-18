import { useApolloClient, useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { ErrorCode, getErrorCode, toErrorKey } from '@/shared/lib/errors';
import { useToast } from '@/shared/ui/toast';
import { CreatorAgentsQuery, UpdateAgentStatusMutation } from '../graphql/creatorAgents';
import { ACTION_TARGET, type StatusAction } from '../lib/myAgents';

type AgentRef = { _id: string; productTitle: string };

/**
 * Pause / resume / delete, confirmed by the server before the UI changes (not optimistic):
 * the tab counts, the page contents and the creator's agent count all depend on the result, a delete
 * can't be undone, and the server may refuse (changed in another tab or by an admin → NOT_FOUND).
 * After success the list query re-runs (awaited), so the row moves or disappears with correct counts.
 */
export const useAgentStatusAction = () => {
	const { t } = useTranslation(['dashboard', 'errors']);
	const toast = useToast();
	const client = useApolloClient();
	const [mutate, { loading }] = useMutation(UpdateAgentStatusMutation, {
		refetchQueries: [CreatorAgentsQuery],
		awaitRefetchQueries: true,
	});

	/** Resolves true on success. Errors become a toast; the list reloads so it shows the server's truth. */
	const run = async (agent: AgentRef, action: StatusAction): Promise<boolean> => {
		try {
			await mutate({ variables: { input: { _id: agent._id, productStatus: ACTION_TARGET[action] } } });
			toast.success(t(`dashboard:myAgents.done.${action}`, { title: agent.productTitle }));
			return true;
		} catch (error) {
			const key = getErrorCode(error) === ErrorCode.NotFound ? 'dashboard:myAgents.errors.changed' : toErrorKey(error);
			toast.error(t(key));
			void client.refetchQueries({ include: [CreatorAgentsQuery] });
			return false;
		}
	};

	return { run, loading };
};
