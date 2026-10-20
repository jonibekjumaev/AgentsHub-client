import { ApolloError } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { BriefDetailQuery } from '../graphql/briefs';
import { BRIEF_ID, makeBriefDetail } from '../test/fixtures';
import { prefetchBriefDetail } from './prefetchBriefDetail';

const gqlError = (code: string) => new ApolloError({ graphQLErrors: [{ message: 'backend text', extensions: { code } }] });

const clientWith = (result: () => Promise<unknown>) => {
	const query = vi.fn(result);
	return { client: { query } as never, query };
};

describe('prefetchBriefDetail (getServerSideProps data)', () => {
	it.each(['OPEN', 'CLOSED'])('finds a %s brief (both are public, D-30)', async (briefStatus) => {
		const { client, query } = clientWith(async () => ({ data: { getBrief: makeBriefDetail({ briefStatus }) } }));
		await expect(prefetchBriefDetail(client, BRIEF_ID)).resolves.toEqual({ found: true, briefId: BRIEF_ID });
		expect(query).toHaveBeenCalledWith({ query: BriefDetailQuery, variables: { briefId: BRIEF_ID } });
	});

	it.each([['abc'], [undefined], [[BRIEF_ID]]])('is not found for a malformed id %j, without asking the API', async (id) => {
		const { client, query } = clientWith(async () => ({ data: { getBrief: makeBriefDetail() } }));
		await expect(prefetchBriefDetail(client, id)).resolves.toEqual({ found: false });
		expect(query).not.toHaveBeenCalled();
	});

	it.each(['NOT_FOUND', 'BAD_REQUEST'])('is not found when the API answers %s', async (code) => {
		const { client } = clientWith(async () => Promise.reject(gqlError(code)));
		await expect(prefetchBriefDetail(client, BRIEF_ID)).resolves.toEqual({ found: false });
	});

	it('is not found for a DELETE brief, should the API ever return one', async () => {
		const { client } = clientWith(async () => ({ data: { getBrief: makeBriefDetail({ briefStatus: 'DELETE' }) } }));
		await expect(prefetchBriefDetail(client, BRIEF_ID)).resolves.toEqual({ found: false });
	});

	it('throws any other failure, so the page is a 500 and not a fake 404', async () => {
		const error = gqlError('INTERNAL_SERVER_ERROR');
		const { client } = clientWith(async () => Promise.reject(error));
		await expect(prefetchBriefDetail(client, BRIEF_ID)).rejects.toBe(error);
	});
});
