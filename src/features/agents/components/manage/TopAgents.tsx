import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { ProductStatus } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { radiusPx } from '@/theme/tokens';
import { TopCreatorAgentsQuery } from '../../graphql/creatorAgents';
import { agentPreviewHref, topAgentsVariables, viewsShare } from '../../lib/myAgents';

/**
 * Overview "Top agents by views": up to five agents, each with a bar relative to #1. Views are the
 * agent's own counter (productViews); nothing is summed or estimated. Renders nothing without agents.
 */
export const TopAgents = () => {
	const { t } = useTranslation('dashboard');
	const format = useFormat();
	const { data, loading, error } = useQuery(TopCreatorAgentsQuery, {
		variables: topAgentsVariables(),
		fetchPolicy: 'cache-and-network',
	});
	const agents = data?.getCreatorProducts.list ?? [];
	const top = agents[0]?.productViews ?? 0;

	if (loading && !data) return <Skeleton variant="rounded" height={240} aria-label={t('dashboard:overview.top.loading')} />;
	// The agents panel next to it shows the error and a retry; this card just steps aside.
	if ((error && !data) || agents.length === 0) return null;

	return (
		<Box
			component="section"
			aria-labelledby="top-agents"
			sx={{ p: 5, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.xl }}
		>
			<Typography id="top-agents" variant="h2" sx={{ fontSize: 18 }}>
				{t('dashboard:overview.top.title')}
			</Typography>
			<Typography variant="caption" component="p" sx={{ color: 'muted', mb: 4 }}>
				{t('dashboard:overview.top.subtitle')}
			</Typography>
			<Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 3.5 }}>
				{agents.map((agent, index) => {
					const share = viewsShare(agent.productViews, top);
					return (
						<Box component="li" key={agent._id}>
							<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
								<Typography component="span" variant="caption" sx={{ width: 18, color: 'muted', fontWeight: 800 }}>
									{index + 1}
								</Typography>
								<Link
									component={NextLink}
									href={agentPreviewHref(agent._id)}
									sx={{
										flex: 1,
										minWidth: 0,
										color: 'ink',
										fontSize: 14,
										fontWeight: 700,
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
									}}
								>
									{agent.productTitle}
								</Link>
								{agent.productStatus === ProductStatus.Paused && (
									<Typography component="span" variant="caption" sx={{ color: 'muted' }}>
										{t('dashboard:overview.top.paused')}
									</Typography>
								)}
								<Typography component="span" sx={{ typography: 'mono', fontSize: 13, color: 'body' }}>
									{t('dashboard:overview.agents.views', {
										count: agent.productViews,
										formatted: format.compact(agent.productViews),
									})}
								</Typography>
							</Box>
							<Box aria-hidden="true" sx={{ ml: '26px', mt: 1.5, height: 6, borderRadius: radiusPx.pill, bgcolor: 'ground' }}>
								<Box
									sx={{
										width: `${share}%`,
										height: '100%',
										borderRadius: radiusPx.pill,
										bgcolor: index === 0 ? 'primary.main' : 'accentBorder',
									}}
								/>
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};
