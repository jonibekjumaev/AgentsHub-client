import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	CheckCircleOutline as CheckCircleOutlineIcon,
	EditOutlined as EditOutlinedIcon,
	PauseCircleOutline as PauseCircleOutlineIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/auth';
import { ProductStatus } from '@/gql/enums';
import { Seo } from '@/shared/layout/Seo';
import { ErrorCode, getErrorCode } from '@/shared/lib/errors';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { radiusPx } from '@/theme/tokens';
import { OwnerAgentQuery } from '../../graphql/agentForm';
import { useAgentStatusAction } from '../../hooks/useAgentStatusAction';
import { isObjectId } from '../../lib/detail';
import { MY_AGENTS_PATH, agentEditHref, needsConfirm, statusActions, type StatusAction } from '../../lib/myAgents';
import { AgentDetail } from '../AgentDetail';
import { agentHref } from '../AgentCard';
import { AgentNotFound } from '../form/AgentFormPages';

const PreviewSkeleton = () => {
	const { t } = useTranslation('agents');
	return (
		<Stack spacing={4} role="status" aria-busy="true" aria-label={t('agents:form.loading')}>
			<Skeleton variant="text" width="40%" sx={{ fontSize: 32 }} aria-hidden="true" />
			<Skeleton variant="rounded" height={72} aria-hidden="true" />
			<Skeleton variant="rounded" height={320} aria-hidden="true" />
		</Stack>
	);
};

/**
 * /dashboard/agents/[id] — the owner's preview (S3c, D-16/D-29). The owner query uses the token, so a
 * PAUSED agent loads too; the API also returns other creators' ACTIVE agents, so ownership is checked
 * here (not yours → 404, like edit). The view itself is the public AgentDetail in its 'owner' variant.
 */
export const AgentPreview = ({ agentId }: { agentId: string }) => {
	const { t } = useTranslation(['dashboard', 'agents', 'common']);
	const { me } = useAuth();
	const router = useRouter();
	const validId = isObjectId(agentId);
	const { data, loading, error, refetch } = useQuery(OwnerAgentQuery, {
		variables: { productId: agentId },
		skip: !validId,
		fetchPolicy: 'network-only',
	});
	// No My agents list on this page: drop the cached lists instead of re-running them.
	const { run, loading: acting } = useAgentStatusAction({ refetchList: false });
	// Kept after closing, so the dialog keeps its text during the close transition.
	const [pending, setPending] = useState<StatusAction | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	/** A delete succeeded and we are leaving: the agent is DELETE in the cache, but this is not a 404. */
	const [leaving, setLeaving] = useState(false);

	if (!validId) return <AgentNotFound />;
	if (leaving || (loading && !data)) return <PreviewSkeleton />;
	if (error && !data) {
		const code = getErrorCode(error);
		if (code === ErrorCode.NotFound || code === ErrorCode.BadRequest) return <AgentNotFound />;
		return <ErrorState error={error} title={t('agents:form.errors.loadFailed')} onRetry={() => void refetch()} />;
	}

	const agent = data?.getProduct;
	if (!agent || !me || agent.memberId !== me._id || agent.productStatus === ProductStatus.Delete) return <AgentNotFound />;

	const title = agent.productTitle;
	const paused = agent.productStatus === ProductStatus.Paused;
	const actions = statusActions(agent.productStatus);

	const perform = async (action: StatusAction) => {
		if (action === 'delete') setLeaving(true);
		const done = await run(agent, action);
		setDialogOpen(false);
		if (action === 'delete') {
			if (done) await router.push(MY_AGENTS_PATH);
			else setLeaving(false);
		}
		// Pause / resume: the mutation returns the new status, so the banner updates from the cache.
	};

	const onAction = (action: StatusAction) => {
		if (needsConfirm(action)) {
			setPending(action);
			setDialogOpen(true);
		} else void perform(action);
	};

	return (
		<Stack spacing={6}>
			<Seo title={t('dashboard:preview.metaTitle', { title })} noindex />

			<Box>
				<Box component="nav" aria-label={t('agents:detail.breadcrumb')} sx={{ fontSize: 13, color: 'muted', mb: 3 }}>
					<Box component="ol" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, m: 0, p: 0, listStyle: 'none' }}>
						<li>
							<Link component={NextLink} href={MY_AGENTS_PATH} sx={{ color: 'muted', fontWeight: 500 }}>
								{t('agents:form.breadcrumb')}
							</Link>
						</li>
						<li aria-hidden="true">/</li>
						<Box component="li" aria-current="page" sx={{ color: 'ink', fontWeight: 600, overflowWrap: 'anywhere' }}>
							{t('dashboard:preview.crumb')}
						</Box>
					</Box>
				</Box>

				{/* Status banner (D-16/D-29) */}
				{paused ? (
					<Stack
						role="status"
						direction={{ xs: 'column', sm: 'row' }}
						spacing={3}
						sx={{ p: 4, borderRadius: radiusPx.md, bgcolor: 'warningSoft', color: 'warning.main', alignItems: { sm: 'center' } }}
					>
						<Stack direction="row" spacing={3} sx={{ flex: 1, alignItems: 'flex-start' }}>
							<PauseCircleOutlineIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
							<Typography variant="body2" sx={{ color: 'inherit' }}>
								{t('dashboard:preview.paused')}
							</Typography>
						</Stack>
						<Button
							onClick={() => onAction('resume')}
							disabled={acting}
							aria-label={t('dashboard:myAgents.actions.resumeLabel', { title })}
							sx={{ height: 38, flex: 'none' }}
						>
							{t('dashboard:myAgents.actions.resume')}
						</Button>
					</Stack>
				) : (
					<Stack
						role="status"
						direction="row"
						spacing={3}
						sx={{ p: 4, borderRadius: radiusPx.md, bgcolor: 'accentSoft', color: 'primary.main', alignItems: 'flex-start' }}
					>
						<CheckCircleOutlineIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
						<Typography variant="body2" sx={{ color: 'inherit' }}>
							{t('dashboard:preview.live')}{' '}
							<Link component={NextLink} href={agentHref(agent._id)} sx={{ fontWeight: 700 }}>
								{t('dashboard:preview.publicLink')}
							</Link>
						</Typography>
					</Stack>
				)}
			</Box>

			{/* Actions: the same D-29 rules and dialogs as My agents */}
			<Stack
				component="nav"
				aria-label={t('dashboard:preview.actionsLabel')}
				direction="row"
				spacing={2}
				useFlexGap
				flexWrap="wrap"
			>
				<Button
					component={NextLink}
					href={agentEditHref(agent._id)}
					variant="outlined"
					startIcon={<EditOutlinedIcon />}
					aria-label={t('dashboard:myAgents.actions.editLabel', { title })}
					sx={{ height: 40 }}
				>
					{t('dashboard:myAgents.actions.edit')}
				</Button>
				{actions
					// Activate already sits in the paused banner.
					.filter((action) => action !== 'resume')
					.map((action) => (
						<Button
							key={action}
							variant="outlined"
							color={action === 'delete' ? 'error' : 'primary'}
							onClick={() => onAction(action)}
							disabled={acting}
							aria-label={t(`dashboard:myAgents.actions.${action}Label`, { title })}
							sx={{ height: 40 }}
						>
							{t(`dashboard:myAgents.actions.${action}`)}
						</Button>
					))}
			</Stack>

			<AgentDetail agentId={agent._id} variant="owner" />

			<ConfirmDialog
				open={dialogOpen}
				title={pending ? t(`dashboard:myAgents.confirm.${pending}.title`, { title }) : ''}
				text={pending ? t(`dashboard:myAgents.confirm.${pending}.text`) : undefined}
				confirmLabel={pending ? t(`dashboard:myAgents.confirm.${pending}.confirm`) : undefined}
				destructive={pending === 'delete'}
				loading={acting}
				onConfirm={() => pending && void perform(pending)}
				onCancel={() => setDialogOpen(false)}
			/>
		</Stack>
	);
};
