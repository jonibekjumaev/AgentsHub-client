import { useQuery } from '@apollo/client';
import { Seo } from '@/shared/layout/Seo';
import { BriefDetailQuery } from '../graphql/briefs';
import { summarize } from '../lib/detail';

/** Title = brief title; description = its text as one trimmed line; canonical = /briefs/<id> (Seo default). */
export const BriefDetailSeo = ({ briefId }: { briefId: string }) => {
	const { data } = useQuery(BriefDetailQuery, { variables: { briefId }, fetchPolicy: 'cache-only' });
	const brief = data?.getBrief;
	if (!brief) return null;

	return <Seo title={brief.briefTitle} description={summarize(brief.briefContent)} />;
};
