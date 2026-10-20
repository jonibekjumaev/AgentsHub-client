import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { BriefDetailQuery } from '../graphql/briefs';
import { isObjectId } from './detail';

export type BriefDetailPrefetch = { found: true; briefId: string } | { found: false };

/**
 * getServerSideProps data for /briefs/[id], on the per-request client (no token).
 * OPEN and CLOSED briefs are public (D-30). Anything else is { found: false } → a real 404:
 * a malformed id (never sent), NOT_FOUND (missing or DELETE), BAD_REQUEST (bad id, §1.3), or a DELETE
 * status. Any other failure is thrown, so Next answers 500 instead of a fake 404.
 * Comments are not prefetched: they load in the browser below the fold.
 */
export const prefetchBriefDetail = async (
	client: Pick<ApolloClient<NormalizedCacheObject>, 'query'>,
	briefId: unknown,
): Promise<BriefDetailPrefetch> => {
	if (!isObjectId(briefId)) return { found: false };

	let brief;
	try {
		({ data: { getBrief: brief } } = await client.query({ query: BriefDetailQuery, variables: { briefId } }));
	} catch (error) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return { found: false };
		throw error;
	}
	if (brief.briefStatus !== 'OPEN' && brief.briefStatus !== 'CLOSED') return { found: false };
	return { found: true, briefId };
};
