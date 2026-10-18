import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { AgentsListQuery } from '../graphql/agents';
import { AgentDetailQuery } from '../graphql/agentDetail';
import { isObjectId, moreFromVariables } from './detail';

export type AgentDetailPrefetch = { found: true; agentId: string } | { found: false };

/**
 * getServerSideProps data for /agents/[id], on the per-request client (no token).
 * Anything that is not a public agent is { found: false } → the page returns notFound (a real 404):
 * a malformed id (never sent), NOT_FOUND (missing, deleted, PAUSED — D-16), BAD_REQUEST (bad id, §1.3),
 * or a status other than ACTIVE. Any other failure is thrown, so Next answers 500 instead of a fake 404.
 * "More from the creator" is optional: its failure only leaves the section out.
 */
export const prefetchAgentDetail = async (
	client: Pick<ApolloClient<NormalizedCacheObject>, 'query'>,
	agentId: unknown,
): Promise<AgentDetailPrefetch> => {
	if (!isObjectId(agentId)) return { found: false };

	let agent;
	try {
		({ data: { getProduct: agent } } = await client.query({ query: AgentDetailQuery, variables: { productId: agentId } }));
	} catch (error) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return { found: false };
		throw error;
	}
	if (agent.productStatus !== 'ACTIVE') return { found: false };

	const creatorId = agent.memberData?._id;
	if (creatorId) {
		await client.query({ query: AgentsListQuery, variables: moreFromVariables(creatorId) }).catch(() => undefined);
	}
	return { found: true, agentId };
};
