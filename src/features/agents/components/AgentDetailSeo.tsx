import { useQuery } from '@apollo/client';
import { Seo } from '@/shared/layout/Seo';
import { mediaUrl } from '@/shared/lib/media';
import { AgentDetailQuery } from '../graphql/agentDetail';
import { summarize } from '../lib/detail';

/**
 * Title = agent title; description = the agent's description as one trimmed line; og:image = the
 * first screenshot (absolute API URL); canonical = /agents/<id> without any query (Seo default).
 */
export const AgentDetailSeo = ({ agentId }: { agentId: string }) => {
	const { data } = useQuery(AgentDetailQuery, { variables: { productId: agentId }, fetchPolicy: 'cache-only' });
	const agent = data?.getProduct;
	if (!agent) return null;

	return (
		<Seo
			title={agent.productTitle}
			description={summarize(agent.productDesc)}
			image={mediaUrl(agent.productImages[0]) ?? undefined}
		/>
	);
};
