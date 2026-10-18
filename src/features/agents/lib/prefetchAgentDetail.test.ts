import { ApolloError } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { AgentsListQuery } from '../graphql/agents';
import { AgentDetailQuery } from '../graphql/agentDetail';
import { AGENT_ID, CREATOR_ID, makeAgentDetail } from '../test/fixtures';
import { moreFromVariables } from './detail';
import { prefetchAgentDetail } from './prefetchAgentDetail';

const gqlError = (code: string) => new ApolloError({ graphQLErrors: [{ message: 'backend text', extensions: { code } }] });

/** A stand-in for the per-request Apollo client: only `query` is used. */
const clientWith = (detail: () => Promise<unknown>, more: () => Promise<unknown> = async () => ({ data: {} })) => {
	const query = vi.fn(({ query: document }) => (document === AgentDetailQuery ? detail() : more()));
	return { client: { query } as never, query };
};

describe('prefetchAgentDetail (getServerSideProps data)', () => {
	it('finds an ACTIVE agent and prefetches "more from the creator"', async () => {
		const { client, query } = clientWith(async () => ({ data: { getProduct: makeAgentDetail() } }));

		await expect(prefetchAgentDetail(client, AGENT_ID)).resolves.toEqual({ found: true, agentId: AGENT_ID });
		expect(query).toHaveBeenCalledWith({ query: AgentDetailQuery, variables: { productId: AGENT_ID } });
		expect(query).toHaveBeenCalledWith({ query: AgentsListQuery, variables: moreFromVariables(CREATOR_ID) });
	});

	it.each([['abc'], [undefined], [['6ac7992dd87bde19b9216c8b']]])('is not found for a malformed id %j, without asking the API', async (id) => {
		const { client, query } = clientWith(async () => ({ data: { getProduct: makeAgentDetail() } }));
		await expect(prefetchAgentDetail(client, id)).resolves.toEqual({ found: false });
		expect(query).not.toHaveBeenCalled();
	});

	it.each([['NOT_FOUND'], ['BAD_REQUEST']])('is not found when the API answers %s (missing, deleted, paused, bad id)', async (code) => {
		const { client } = clientWith(async () => {
			throw gqlError(code);
		});
		await expect(prefetchAgentDetail(client, AGENT_ID)).resolves.toEqual({ found: false });
	});

	it.each([['PAUSED'], ['DELETE']])('is not found for a %s agent, should the API ever return one', async (productStatus) => {
		const { client } = clientWith(async () => ({ data: { getProduct: makeAgentDetail({ productStatus }) } }));
		await expect(prefetchAgentDetail(client, AGENT_ID)).resolves.toEqual({ found: false });
	});

	it('throws on other failures, so Next answers 500 instead of a false 404', async () => {
		const failure = new ApolloError({ networkError: new TypeError('fetch failed') });
		const { client } = clientWith(async () => {
			throw failure;
		});
		await expect(prefetchAgentDetail(client, AGENT_ID)).rejects.toBe(failure);
	});

	it('still finds the agent when "more from the creator" fails', async () => {
		const { client } = clientWith(
			async () => ({ data: { getProduct: makeAgentDetail() } }),
			async () => {
				throw gqlError('INTERNAL_SERVER_ERROR');
			},
		);
		await expect(prefetchAgentDetail(client, AGENT_ID)).resolves.toEqual({ found: true, agentId: AGENT_ID });
	});
});
