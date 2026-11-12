import { useId, useState } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { Box, IconButton, Link, ListItemIcon, Menu, MenuItem, Skeleton, Stack, Typography } from '@mui/material';
import {
	EditOutlined as EditOutlinedIcon,
	FavoriteBorder as FavoriteBorderIcon,
	MoreVert as MoreVertIcon,
	OpenInNew as OpenInNewIcon,
	PauseCircleOutline as PauseCircleOutlineIcon,
	PlayCircleOutline as PlayCircleOutlineIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { CreatorAgentRowFragment } from '@/gql/graphql';
import { ProductStatus } from '@/gql/enums';
import { useFormat } from '@/shared/lib/format';
import { mediaUrl } from '@/shared/lib/media';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ErrorState } from '@/shared/ui/ErrorState';
import { StatusChip } from '@/shared/ui/StatusChip';
import { home, radiusPx } from '@/theme/tokens';
import { CreatorAgentsQuery } from '../../graphql/creatorAgents';
import { useAgentStatusAction } from '../../hooks/useAgentStatusAction';
import { MY_AGENTS_PATH, agentEditHref, agentPreviewHref, myAgentsVariables, needsConfirm, type StatusAction } from '../../lib/myAgents';
import { agentHref } from '../AgentCard';

/** Rows on the overview; the rest is one click away on My agents. */
export const RECENT_AGENTS_SHOWN = 5;

/** The overview menu toggles visibility only; deleting stays on My agents, next to its warning. */
const menuAction = (status: ProductStatus): Extract<StatusAction, 'pause' | 'resume'> | null => {
	if (status === ProductStatus.Active) return 'pause';
	if (status === ProductStatus.Paused) return 'resume';
	return null;
};

type RowProps = {
	agent: CreatorAgentRowFragment;
	busy: boolean;
	onAction: (agent: CreatorAgentRowFragment, action: StatusAction) => void;
};

const AgentRow = ({ agent, busy, onAction }: RowProps) => {
	const { t } = useTranslation(['dashboard', 'common']);
	const format = useFormat();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const menuId = useId();
	const title = agent.productTitle;
	const src = mediaUrl(agent.productImages[0]);
	const action = menuAction(agent.productStatus);
	const live = agent.productStatus === ProductStatus.Active;
	const close = () => setAnchor(null);

	return (
		<Box
			component="li"
			aria-busy={busy || undefined}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 3,
				px: { xs: 4, sm: 5 },
				py: 3,
				borderTop: 1,
				borderColor: 'borderSoft',
				bgcolor: live ? 'surface' : 'surfaceMuted',
			}}
		>
			<Box
				sx={{
					position: 'relative',
					flex: 'none',
					width: 40,
					height: 40,
					borderRadius: radiusPx.sm,
					overflow: 'hidden',
					bgcolor: 'accentSoft',
				}}
			>
				{src && <Image src={src} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} />}
			</Box>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Link
					component={NextLink}
					href={agentPreviewHref(agent._id)}
					sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}
				>
					{title}
				</Link>
				<Typography variant="caption" component="div" sx={{ color: 'muted' }}>
					{t(`common:enums.AgentCategory.${agent.productCategory}`)} ·{' '}
					<time dateTime={agent.updatedAt}>{t('dashboard:overview.agents.updated', { when: format.relative(agent.updatedAt) })}</time>
				</Typography>
			</Box>
			<Stack
				direction="row"
				spacing={4}
				sx={{ display: { xs: 'none', sm: 'flex' }, color: 'muted', fontSize: 13, typography: 'mono' }}
			>
				<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
					<VisibilityOutlinedIcon aria-hidden="true" sx={{ fontSize: 16 }} />
					<span>{t('dashboard:overview.agents.views', { count: agent.productViews, formatted: format.compact(agent.productViews) })}</span>
				</Box>
				<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
					<FavoriteBorderIcon aria-hidden="true" sx={{ fontSize: 16 }} />
					<span>{t('dashboard:overview.agents.likes', { count: agent.productLikes, formatted: format.compact(agent.productLikes) })}</span>
				</Box>
			</Stack>
			<StatusChip kind="product" status={agent.productStatus} />
			<IconButton
				size="small"
				aria-label={t('dashboard:overview.agents.menuLabel', { title })}
				aria-haspopup="menu"
				aria-controls={anchor ? menuId : undefined}
				aria-expanded={anchor ? true : undefined}
				disabled={busy}
				onClick={(event) => setAnchor(event.currentTarget)}
			>
				<MoreVertIcon fontSize="small" />
			</IconButton>
			<Menu
				id={menuId}
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { minWidth: 200, borderRadius: radiusPx.md } } }}
			>
				<MenuItem component={NextLink} href={agentEditHref(agent._id)} onClick={close}>
					<ListItemIcon>
						<EditOutlinedIcon fontSize="small" />
					</ListItemIcon>
					{t('dashboard:myAgents.actions.edit')}
				</MenuItem>
				{action && (
					<MenuItem
						onClick={() => {
							close();
							onAction(agent, action);
						}}
					>
						<ListItemIcon>
							{action === 'pause' ? <PauseCircleOutlineIcon fontSize="small" /> : <PlayCircleOutlineIcon fontSize="small" />}
						</ListItemIcon>
						{t(`dashboard:myAgents.actions.${action}`)}
					</MenuItem>
				)}
				{/* A paused agent has no public page (404 for others): the owner preview stands in. */}
				{live ? (
					<MenuItem component={NextLink} href={agentHref(agent._id)} onClick={close}>
						<ListItemIcon>
							<OpenInNewIcon fontSize="small" />
						</ListItemIcon>
						{t('dashboard:overview.agents.viewPublic')}
					</MenuItem>
				) : (
					<MenuItem component={NextLink} href={agentPreviewHref(agent._id)} onClick={close}>
						<ListItemIcon>
							<VisibilityOutlinedIcon fontSize="small" />
						</ListItemIcon>
						{t('dashboard:myAgents.actions.preview')}
					</MenuItem>
				)}
			</Menu>
		</Box>
	);
};

type Pending = { agent: CreatorAgentRowFragment; action: StatusAction };

/**
 * Overview "Your agents": the most recently changed agents with a row menu (edit, pause / activate,
 * public page or preview). Same query and variables as the first page of My agents, so both pages
 * share one cache entry. Renders nothing when there are no agents — the overview shows its own empty state.
 */
export const RecentAgents = () => {
	const { t } = useTranslation(['dashboard', 'common']);
	const { data, loading, error, refetch } = useQuery(CreatorAgentsQuery, {
		variables: myAgentsVariables({ tab: 'all', page: 1 }),
		fetchPolicy: 'cache-and-network',
	});
	const { run, loading: acting } = useAgentStatusAction();
	const [pending, setPending] = useState<Pending | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const agents = (data?.list.list ?? []).slice(0, RECENT_AGENTS_SHOWN);
	const total = data?.list.metaCounter?.[0]?.total ?? 0;

	const perform = async ({ agent, action }: Pending) => {
		setBusyId(agent._id);
		await run(agent, action);
		setBusyId(null);
		setDialogOpen(false);
	};

	const onAction = (agent: CreatorAgentRowFragment, action: StatusAction) => {
		if (needsConfirm(action)) {
			setPending({ agent, action });
			setDialogOpen(true);
		} else void perform({ agent, action });
	};

	if (loading && !data) return <Skeleton variant="rounded" height={320} aria-label={t('dashboard:myAgents.loading')} />;
	if (error && !data) return <ErrorState error={error} title={t('dashboard:myAgents.errorTitle')} onRetry={() => void refetch()} />;
	if (agents.length === 0) return null;

	return (
		<Box
			component="section"
			aria-labelledby="recent-agents"
			sx={{ bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: home.radius.card, overflow: 'hidden' }}
		>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="baseline"
				flexWrap="wrap"
				gap={2}
				sx={{ px: { xs: 4, sm: 5 }, pt: 5, pb: 4 }}
			>
				<Box>
					<Typography id="recent-agents" variant="h2" sx={{ fontSize: 18 }}>
						{t('dashboard:overview.recent')}
					</Typography>
					<Typography variant="caption" component="p" sx={{ color: 'muted' }}>
						{t('dashboard:overview.agents.subtitle', { shown: agents.length, total })}
					</Typography>
				</Box>
				<Link component={NextLink} href={MY_AGENTS_PATH} sx={{ fontSize: 14, fontWeight: 700 }}>
					{t('dashboard:overview.manage')}
				</Link>
			</Stack>
			<Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
				{agents.map((agent) => (
					<AgentRow key={agent._id} agent={agent} busy={busyId === agent._id} onAction={onAction} />
				))}
			</Box>
			<ConfirmDialog
				open={dialogOpen}
				title={pending ? t(`dashboard:myAgents.confirm.${pending.action}.title`, { title: pending.agent.productTitle }) : ''}
				text={pending ? t(`dashboard:myAgents.confirm.${pending.action}.text`) : undefined}
				confirmLabel={pending ? t(`dashboard:myAgents.confirm.${pending.action}.confirm`) : undefined}
				destructive={false}
				loading={acting}
				onConfirm={() => pending && void perform(pending)}
				onCancel={() => setDialogOpen(false)}
			/>
		</Box>
	);
};
