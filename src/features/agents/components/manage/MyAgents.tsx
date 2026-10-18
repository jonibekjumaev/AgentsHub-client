import { useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import { Add as AddIcon, InfoOutlined as InfoOutlinedIcon, SmartToyOutlined as SmartToyOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { CreatorAgentRowFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { radiusPx } from '@/theme/tokens';
import { CreatorAgentsQuery } from '../../graphql/creatorAgents';
import { useAgentStatusAction } from '../../hooks/useAgentStatusAction';
import {
	MY_AGENTS_PAGE_SIZE,
	NEW_AGENT_PATH,
	STATUS_TABS,
	myAgentsHref,
	myAgentsVariables,
	needsConfirm,
	parseMyAgentsView,
	type StatusAction,
	type StatusTab,
} from '../../lib/myAgents';
import { MyAgentsTable } from './MyAgentsTable';

type Pending = { agent: CreatorAgentRowFragment; action: StatusAction };

const TableSkeleton = () => {
	const { t } = useTranslation('dashboard');
	return (
		<Box role="status" aria-busy="true" aria-label={t('dashboard:myAgents.loading')}>
			<Stack spacing={2}>
				{[0, 1, 2, 3].map((index) => (
					<Skeleton key={index} variant="rounded" height={64} aria-hidden="true" />
				))}
			</Stack>
		</Box>
	);
};

/** /dashboard/agents (Dashboard.html): status tabs, the creator's agents, pause / resume / delete. */
export const MyAgents = () => {
	const { t } = useTranslation(['dashboard', 'common']);
	const format = useFormat();
	const router = useRouter();
	const view = useMemo(() => parseMyAgentsView(router.query), [router.query]);
	// A statically optimized page gets its query only once the router is ready.
	const { data, loading, error, refetch } = useQuery(CreatorAgentsQuery, {
		variables: myAgentsVariables(view),
		skip: !router.isReady,
	});
	const { run, loading: acting } = useAgentStatusAction();
	// Kept after closing, so the dialog keeps its text during the close transition.
	const [pending, setPending] = useState<Pending | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	/** Set when a delete succeeded: the row and its button are gone, so focus moves to the heading. */
	const focusHeading = useRef(false);

	const agents = data?.list.list ?? [];
	const total = data?.list.metaCounter?.[0]?.total ?? 0;
	const counts: Record<StatusTab, number> | null = data
		? (() => {
				const active = data.active.metaCounter?.[0]?.total ?? 0;
				const paused = data.paused.metaCounter?.[0]?.total ?? 0;
				return { all: active + paused, active, paused };
			})()
		: null;

	const perform = async ({ agent, action }: Pending) => {
		setBusyId(agent._id);
		const done = await run(agent, action);
		setBusyId(null);
		focusHeading.current = done && action === 'delete';
		setDialogOpen(false);
	};

	const onAction = (agent: CreatorAgentRowFragment, action: StatusAction) => {
		if (needsConfirm(action)) {
			setPending({ agent, action });
			setDialogOpen(true);
		} else void perform({ agent, action });
	};

	const renderBody = () => {
		if (!router.isReady || (loading && !data)) return <TableSkeleton />;
		if (error && !data) return <ErrorState error={error} title={t('dashboard:myAgents.errorTitle')} onRetry={() => void refetch()} />;
		if (counts?.all === 0) {
			return (
				<EmptyState
					icon={<SmartToyOutlinedIcon />}
					title={t('dashboard:myAgents.empty.title')}
					text={t('dashboard:myAgents.empty.text')}
					action={{ label: t('dashboard:myAgents.empty.action'), href: NEW_AGENT_PATH }}
				/>
			);
		}
		if (agents.length === 0) {
			return total > 0 ? (
				<EmptyState
					title={t('dashboard:myAgents.emptyPage.title')}
					action={{ label: t('dashboard:myAgents.emptyPage.action'), href: myAgentsHref({ tab: view.tab, page: 1 }) }}
				/>
			) : (
				<EmptyState
					title={t(`dashboard:myAgents.emptyTab.${view.tab}`)}
					action={{ label: t('dashboard:myAgents.emptyTab.action'), href: myAgentsHref({ tab: 'all', page: 1 }) }}
				/>
			);
		}
		return (
			<>
				<MyAgentsTable agents={agents} busyId={busyId} onAction={onAction} />
				<Pagination
					page={view.page}
					count={Math.ceil(total / MY_AGENTS_PAGE_SIZE)}
					getHref={(page) => myAgentsHref({ tab: view.tab, page })}
				/>
			</>
		);
	};

	return (
		<Stack spacing={6}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
				<Box>
					<Typography ref={headingRef} tabIndex={-1} variant="h1" sx={{ outline: 'none' }}>
						{t('dashboard:myAgents.title')}
					</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('dashboard:myAgents.subtitle')}</Typography>
				</Box>
				<Button component={NextLink} href={NEW_AGENT_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
					{t('dashboard:myAgents.new')}
				</Button>
			</Box>

			<Box
				component="nav"
				aria-label={t('dashboard:myAgents.tabs.label')}
				sx={{ display: 'flex', gap: 6, borderBottom: 1, borderColor: 'border', overflowX: 'auto' }}
			>
				{STATUS_TABS.map((tab) => {
					const current = tab === view.tab;
					return (
						<Link
							key={tab}
							component={NextLink}
							href={myAgentsHref({ tab, page: 1 })}
							underline="none"
							aria-current={current ? 'page' : undefined}
							sx={{
								py: 3,
								mb: '-1px',
								whiteSpace: 'nowrap',
								fontSize: 14,
								fontWeight: current ? 800 : 600,
								color: current ? 'ink' : 'body',
								borderBottom: 2,
								borderColor: current ? 'primary.main' : 'transparent',
							}}
						>
							{t(`dashboard:myAgents.tabs.${tab}`)}
							{counts && (
								<>
									{' '}
									<Box component="span" sx={{ color: 'muted', fontWeight: 600 }}>
										{`· ${format.number(counts[tab])}`}
									</Box>
								</>
							)}
						</Link>
					);
				})}
			</Box>

			{renderBody()}

			<Stack
				direction="row"
				spacing={3}
				sx={{ p: 4, borderRadius: radiusPx.md, bgcolor: 'warningSoft', color: 'warning.main', alignItems: 'flex-start' }}
			>
				<InfoOutlinedIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
				<Typography variant="body2" sx={{ color: 'inherit' }}>
					<strong>{t('dashboard:myAgents.deleteNote.strong')}</strong> {t('dashboard:myAgents.deleteNote.text')}
				</Typography>
			</Stack>

			<ConfirmDialog
				open={dialogOpen}
				title={pending ? t(`dashboard:myAgents.confirm.${pending.action}.title`, { title: pending.agent.productTitle }) : ''}
				text={pending ? t(`dashboard:myAgents.confirm.${pending.action}.text`) : undefined}
				confirmLabel={pending ? t(`dashboard:myAgents.confirm.${pending.action}.confirm`) : undefined}
				destructive={pending?.action === 'delete'}
				loading={acting}
				onConfirm={() => pending && void perform(pending)}
				onCancel={() => setDialogOpen(false)}
				onExited={() => {
					// The deleted row (and the button that opened the dialog) is gone: give focus a stable place.
					if (focusHeading.current) headingRef.current?.focus();
					focusHeading.current = false;
				}}
			/>
		</Stack>
	);
};
