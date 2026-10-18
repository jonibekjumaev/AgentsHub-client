import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { PauseCircleOutline as PauseIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { Seo } from '@/shared/layout/Seo';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusPage } from '@/shared/ui/StatusPage';
import { radiusPx } from '@/theme/tokens';
import { OwnerAgentQuery } from '../../graphql/agentForm';
import { EMPTY_AGENT_FORM, fromAgent } from '../../lib/agentForm';
import { isObjectId } from '../../lib/detail';
import { MY_AGENTS_PATH } from '../../lib/myAgents';
import { AgentForm } from './AgentForm';

const PageHeader = ({ current, title, subtitle }: { current: string; title: string; subtitle: string }) => {
	const { t } = useTranslation('agents');
	return (
		<Box sx={{ mb: 6 }}>
			<Box component="nav" aria-label={t('agents:detail.breadcrumb')} sx={{ fontSize: 13, color: 'muted', mb: 3 }}>
				<Box component="ol" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none' }}>
					<li>
						<Link component={NextLink} href={MY_AGENTS_PATH} sx={{ color: 'muted', fontWeight: 500 }}>
							{t('agents:form.breadcrumb')}
						</Link>
					</li>
					<li aria-hidden="true">/</li>
					<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}>
						{current}
					</Box>
				</Box>
			</Box>
			<Typography variant="h1">{title}</Typography>
			<Typography sx={{ mt: 1.5, color: 'muted' }}>{subtitle}</Typography>
		</Box>
	);
};

/** The same 404 page as a wrong role gets (RequireRole): missing, deleted, malformed id or not yours. */
const AgentNotFound = () => {
	const { t } = useTranslation('common');
	return (
		<>
			<Seo title={t('common:errorPages.notFound.title')} noindex />
			<StatusPage
				code="404"
				icon={<SearchOffIcon />}
				title={t('common:errorPages.notFound.title')}
				text={t('common:errorPages.notFound.text')}
				action={{ label: t('agents:form.backToList'), href: MY_AGENTS_PATH }}
			/>
		</>
	);
};

const Frame = ({ children }: { children: ReactNode }) => <Box sx={{ maxWidth: 1100 }}>{children}</Box>;

/** /dashboard/agents/new */
export const NewAgent = () => {
	const { t } = useTranslation('agents');
	const { me } = useAuth();
	if (!me) return null; // DashboardLayout's RequireRole renders this page for a signed-in CREATOR only

	return (
		<Frame>
			<Seo title={t('agents:form.newTitle')} noindex />
			<PageHeader current={t('agents:form.newCrumb')} title={t('agents:form.newTitle')} subtitle={t('agents:form.newSubtitle')} />
			<AgentForm mode="create" initialValues={EMPTY_AGENT_FORM} creator={{ _id: me._id, memberNick: me.memberNick }} />
		</Frame>
	);
};

/**
 * /dashboard/agents/[id]/edit. The owner query uses the token, so a PAUSED agent loads too (D-16).
 * The API also returns other creators' ACTIVE agents, so ownership is checked here: not yours → 404.
 */
export const EditAgent = ({ agentId }: { agentId: string }) => {
	const { t } = useTranslation('agents');
	const { me } = useAuth();
	const validId = isObjectId(agentId);
	const { data, loading, error, refetch } = useQuery(OwnerAgentQuery, {
		variables: { productId: agentId },
		skip: !validId,
		// Always the stored values: an edit must not start from a stale cache.
		fetchPolicy: 'network-only',
	});

	if (!validId) return <AgentNotFound />;
	if (loading && !data) {
		return (
			<Frame>
				<Stack spacing={4} role="status" aria-busy="true" aria-label={t('agents:form.loading')}>
					<Skeleton variant="text" width="40%" sx={{ fontSize: 32 }} aria-hidden="true" />
					<Skeleton variant="rounded" height={260} aria-hidden="true" />
					<Skeleton variant="rounded" height={200} aria-hidden="true" />
				</Stack>
			</Frame>
		);
	}
	if (error && !data) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return <AgentNotFound />;
		return <ErrorState error={error} title={t('agents:form.errors.loadFailed')} onRetry={() => void refetch()} />;
	}

	const agent = data?.getProduct;
	if (!agent || !me || agent.memberId !== me._id) return <AgentNotFound />;

	return (
		<Frame>
			<Seo title={t('agents:form.editTitle', { title: agent.productTitle })} noindex />
			<PageHeader
				current={agent.productTitle}
				title={t('agents:form.editTitle', { title: agent.productTitle })}
				subtitle={t('agents:form.editSubtitle')}
			/>
			{agent.productStatus === 'PAUSED' && (
				<Stack
					direction="row"
					spacing={3}
					sx={{ mb: 6, p: 4, borderRadius: radiusPx.md, bgcolor: 'warningSoft', color: 'warning.main', alignItems: 'flex-start' }}
				>
					<PauseIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
					<Typography variant="body2" sx={{ color: 'inherit' }}>
						{t('agents:form.pausedNote')}
					</Typography>
				</Stack>
			)}
			{/* key: a different agent (or a fresh load) starts a fresh form. */}
			<AgentForm
				key={`${agent._id}-${agent.updatedAt}`}
				mode="edit"
				agentId={agent._id}
				initialValues={fromAgent(agent)}
				creator={{ _id: me._id, memberNick: me.memberNick }}
			/>
		</Frame>
	);
};
