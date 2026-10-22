import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusChip } from '@/shared/ui/StatusChip';
import { radiusPx } from '@/theme/tokens';
import { CreatorAgentsQuery } from '../../graphql/creatorAgents';
import { MY_AGENTS_PATH, myAgentsVariables } from '../../lib/myAgents';
import { previewAgentHref } from './MyAgentsTable';

const SHOWN = 3;

/**
 * Overview card: the creator's most recently changed agents. Same query and variables as the first
 * page of My agents, so the two pages share one cache entry (opening My agents next is instant).
 * Renders nothing when there are no agents — the overview shows its own empty state then.
 */
export const RecentAgents = () => {
	const { t } = useTranslation(['dashboard', 'common']);
	const { data, loading, error, refetch } = useQuery(CreatorAgentsQuery, {
		variables: myAgentsVariables({ tab: 'all', page: 1 }),
		fetchPolicy: 'cache-and-network',
	});
	const agents = (data?.list.list ?? []).slice(0, SHOWN);

	if (loading && !data) return <Skeleton variant="rounded" height={180} aria-label={t('dashboard:myAgents.loading')} />;
	if (error && !data) return <ErrorState error={error} title={t('dashboard:myAgents.errorTitle')} onRetry={() => void refetch()} />;
	if (agents.length === 0) return null;

	return (
		<Box
			component="section"
			aria-labelledby="recent-agents"
			sx={{ p: 6, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}
		>
			<Stack direction="row" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
				<Typography id="recent-agents" variant="h2" sx={{ fontSize: 20 }}>
					{t('dashboard:overview.recent')}
				</Typography>
				<Link component={NextLink} href={MY_AGENTS_PATH} sx={{ fontSize: 14 }}>
					{t('dashboard:overview.manage')}
				</Link>
			</Stack>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
				{agents.map((agent) => (
					<Box
						component="li"
						key={agent._id}
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 3,
							py: 3,
							borderTop: 1,
							borderColor: 'borderSoft',
						}}
					>
						<Box sx={{ minWidth: 0 }}>
							<Link component={NextLink} href={previewAgentHref(agent._id)} sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}>
								{agent.productTitle}
							</Link>
							<Typography variant="caption" component="div">
								{t(`common:enums.AgentCategory.${agent.productCategory}`)}
							</Typography>
						</Box>
						<StatusChip kind="product" status={agent.productStatus} />
					</Box>
				))}
			</Box>
		</Box>
	);
};
