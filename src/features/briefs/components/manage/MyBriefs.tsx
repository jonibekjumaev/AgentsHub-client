import { useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { Box, Button, Link, Skeleton, Stack, Typography } from '@mui/material';
import {
	Add as AddIcon,
	DescriptionOutlined as DescriptionOutlinedIcon,
	EditOutlined as EditOutlinedIcon,
	InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { BriefStatus } from '@/gql/enums';
import type { MyBriefRowFragment } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { CategoryChip } from '@/shared/ui/CategoryChip';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { StatusChip } from '@/shared/ui/StatusChip';
import { radiusPx } from '@/theme/tokens';
import { MyBriefsQuery } from '../../graphql/myBriefs';
import { useBriefStatusAction } from '../../hooks/useBriefStatusAction';
import { briefHref, isDeadlinePassed } from '../../lib/detail';
import {
	MY_BRIEFS_PAGE_SIZE,
	MY_BRIEF_TABS,
	NEW_BRIEF_PATH,
	briefActions,
	briefEditHref,
	briefNeedsConfirm,
	myBriefsHref,
	myBriefsVariables,
	parseMyBriefsView,
	type BriefAction,
	type MyBriefTab,
} from '../../lib/myBriefs';
import { BriefBudget } from '../BriefRow';
import { ReopenDialog } from './ReopenDialog';

type Pending = { brief: MyBriefRowFragment; action: BriefAction };

const ListSkeleton = () => {
	const { t } = useTranslation('briefs');
	return (
		<Stack spacing={3} role="status" aria-busy="true" aria-label={t('briefs:mine.loading')}>
			{[0, 1, 2].map((index) => (
				<Skeleton key={index} variant="rounded" height={112} aria-hidden="true" />
			))}
		</Stack>
	);
};

type RowProps = {
	brief: MyBriefRowFragment;
	busy: boolean;
	onAction: (brief: MyBriefRowFragment, action: BriefAction) => void;
};

/** One brief (MyBriefs.html): chips, title → public page, budget / deadline / counters, actions on the right. */
const MyBriefRow = ({ brief, busy, onAction }: RowProps) => {
	const { t } = useTranslation(['briefs', 'common']);
	const format = useFormat();
	const closed = brief.briefStatus === BriefStatus.Closed;
	const passed = isDeadlinePassed(brief.briefDeadline);
	const title = brief.briefTitle;

	const deadline = () => {
		if (!brief.briefDeadline) return t('briefs:deadline.none');
		const date = format.date(brief.briefDeadline);
		if (closed && passed) return t('briefs:mine.deadlineWas', { date });
		if (passed) return t('briefs:deadline.passed', { date });
		return t('briefs:deadline.on', { date });
	};

	return (
		<Box
			component="article"
			aria-labelledby={`my-brief-${brief._id}`}
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: 4,
				justifyContent: 'space-between',
				alignItems: 'center',
				p: 5,
				bgcolor: closed ? 'surfaceMuted' : 'surface',
				border: 1,
				borderColor: 'border',
				borderRadius: radiusPx.lg,
			}}
		>
			<Box sx={{ flex: '999 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
					<StatusChip kind="brief" status={brief.briefStatus} />
					<CategoryChip category={brief.briefCategory} />
				</Stack>
				<Link
					id={`my-brief-${brief._id}`}
					component={NextLink}
					href={briefHref(brief._id)}
					sx={{ color: 'ink', fontWeight: 800, fontSize: 16, overflowWrap: 'anywhere' }}
				>
					{title}
				</Link>
				<Stack direction="row" spacing={4} useFlexGap flexWrap="wrap" sx={{ fontSize: 13, color: 'muted' }}>
					<Box component="span" sx={{ display: 'inline-flex', gap: 1, alignItems: 'baseline' }}>
						{t('briefs:budget.label')} <BriefBudget budget={brief.briefBudget} size={14} />
					</Box>
					<Box component="span" sx={passed && !closed ? { color: 'warning.main', fontWeight: 700 } : undefined}>
						{deadline()}
					</Box>
					{closed && brief.closedAt ? (
						<span>{t('briefs:closedOn', { date: format.date(brief.closedAt) })}</span>
					) : (
						<span>
							{t('briefs:card.views', { count: brief.briefViews, formatted: format.compact(brief.briefViews) })} ·{' '}
							{t('briefs:card.comments', { count: brief.briefComments, formatted: format.number(brief.briefComments) })}
						</span>
					)}
				</Stack>
				{closed && passed && (
					<Typography variant="caption" component="p" sx={{ color: 'warning.main', fontWeight: 700 }}>
						{t('briefs:mine.reopenHint')}
					</Typography>
				)}
			</Box>
			<Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ flex: '1 1 auto', justifyContent: { sm: 'flex-end' } }}>
				<Button
					component={NextLink}
					href={briefEditHref(brief._id)}
					variant="outlined"
					size="small"
					startIcon={<EditOutlinedIcon />}
					aria-label={t('briefs:mine.actions.editLabel', { title })}
				>
					{t('briefs:mine.actions.edit')}
				</Button>
				{briefActions(brief.briefStatus).map((action) => (
					<Button
						key={action}
						variant="outlined"
						size="small"
						color={action === 'delete' ? 'error' : 'primary'}
						disabled={busy}
						onClick={() => onAction(brief, action)}
						aria-label={t(`briefs:mine.actions.${action}Label`, { title })}
					>
						{t(`briefs:mine.actions.${action}`)}
					</Button>
				))}
			</Stack>
		</Box>
	);
};

/** /dashboard/briefs (MyBriefs.html): status tabs, the user's briefs, close / reopen / delete (D-30, D-31). */
export const MyBriefs = () => {
	const { t } = useTranslation(['briefs', 'common']);
	const format = useFormat();
	const router = useRouter();
	const view = useMemo(() => parseMyBriefsView(router.query), [router.query]);
	// A statically optimized page gets its query only once the router is ready.
	const { data, loading, error, refetch } = useQuery(MyBriefsQuery, { variables: myBriefsVariables(view), skip: !router.isReady });
	const { run, loading: acting } = useBriefStatusAction();
	// Kept after closing, so a dialog keeps its text during the close transition.
	const [pending, setPending] = useState<Pending | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [reopenOpen, setReopenOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const focusHeading = useRef(false);

	const briefs = data?.list.list ?? [];
	const total = data?.list.metaCounter?.[0]?.total ?? 0;
	const counts: Record<MyBriefTab, number> | null = data
		? (() => {
				const open = data.open.metaCounter?.[0]?.total ?? 0;
				const closed = data.closed.metaCounter?.[0]?.total ?? 0;
				return { all: open + closed, open, closed };
			})()
		: null;

	const perform = async ({ brief, action }: Pending, briefDeadline?: string | null) => {
		setBusyId(brief._id);
		const result = await run(brief, action, briefDeadline);
		setBusyId(null);
		setConfirmOpen(false);
		if (result === 'deadline') {
			// The stored deadline has passed (or passed on the server's clock): ask for a new one (D-31).
			setPending({ brief, action });
			setReopenOpen(true);
			return;
		}
		setReopenOpen(false);
		focusHeading.current = result === 'done' && action === 'delete';
		if (focusHeading.current) headingRef.current?.focus();
	};

	const onAction = (brief: MyBriefRowFragment, action: BriefAction) => {
		setPending({ brief, action });
		if (briefNeedsConfirm(action)) setConfirmOpen(true);
		else if (action === 'reopen' && isDeadlinePassed(brief.briefDeadline)) setReopenOpen(true);
		else void perform({ brief, action });
	};

	const renderBody = () => {
		if (!router.isReady || (loading && !data)) return <ListSkeleton />;
		if (error && !data) return <ErrorState error={error} title={t('briefs:mine.errorTitle')} onRetry={() => void refetch()} />;
		if (counts?.all === 0) {
			return (
				<EmptyState
					icon={<DescriptionOutlinedIcon />}
					title={t('briefs:mine.empty.title')}
					text={t('briefs:mine.empty.text')}
					action={{ label: t('briefs:mine.empty.action'), href: NEW_BRIEF_PATH }}
				/>
			);
		}
		if (briefs.length === 0) {
			return total > 0 ? (
				<EmptyState
					title={t('briefs:empty.pageTitle')}
					action={{ label: t('briefs:empty.firstPage'), href: myBriefsHref({ tab: view.tab, page: 1 }) }}
				/>
			) : (
				<EmptyState
					title={t(`briefs:mine.emptyTab.${view.tab}`)}
					action={{ label: t('briefs:mine.emptyTab.action'), href: myBriefsHref({ tab: 'all', page: 1 }) }}
				/>
			);
		}
		return (
			<>
				<Box
					component="ul"
					aria-label={t('briefs:mine.listLabel')}
					sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}
				>
					{briefs.map((brief) => (
						<li key={brief._id}>
							<MyBriefRow brief={brief} busy={busyId === brief._id || acting} onAction={onAction} />
						</li>
					))}
				</Box>
				<Pagination
					page={view.page}
					count={Math.ceil(total / MY_BRIEFS_PAGE_SIZE)}
					getHref={(page) => myBriefsHref({ tab: view.tab, page })}
				/>
			</>
		);
	};

	const pendingTitle = pending?.brief.briefTitle ?? '';

	return (
		<Stack spacing={6}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
				<Box>
					<Typography ref={headingRef} tabIndex={-1} variant="h1" sx={{ outline: 'none' }}>
						{t('briefs:mine.title')}
					</Typography>
					<Typography sx={{ mt: 1.5, color: 'muted' }}>{t('briefs:mine.subtitle')}</Typography>
				</Box>
				<Button component={NextLink} href={NEW_BRIEF_PATH} startIcon={<AddIcon />} sx={{ height: 42 }}>
					{t('briefs:list.post')}
				</Button>
			</Box>

			<Box
				component="nav"
				aria-label={t('briefs:mine.tabsLabel')}
				sx={{ display: 'flex', gap: 6, borderBottom: 1, borderColor: 'border', overflowX: 'auto' }}
			>
				{MY_BRIEF_TABS.map((tab) => {
					const current = tab === view.tab;
					return (
						<Link
							key={tab}
							component={NextLink}
							href={myBriefsHref({ tab, page: 1 })}
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
							{t(`briefs:mine.tabs.${tab}`)}
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
				sx={{ p: 4, borderRadius: radiusPx.md, bgcolor: 'ground', color: 'bodySoft', alignItems: 'flex-start' }}
			>
				<InfoOutlinedIcon aria-hidden="true" fontSize="small" sx={{ mt: 0.25 }} />
				<Typography variant="body2" sx={{ color: 'inherit' }}>
					{t('briefs:mine.note')}
				</Typography>
			</Stack>

			<ConfirmDialog
				open={confirmOpen}
				title={t('briefs:mine.confirmDelete.title', { title: pendingTitle })}
				text={t('briefs:mine.confirmDelete.text')}
				confirmLabel={t('briefs:mine.confirmDelete.confirm')}
				destructive
				loading={acting}
				onConfirm={() => pending && void perform(pending)}
				onCancel={() => setConfirmOpen(false)}
			/>
			<ReopenDialog
				open={reopenOpen}
				title={pendingTitle}
				loading={acting}
				onConfirm={(briefDeadline) => pending && void perform({ brief: pending.brief, action: 'reopen' }, briefDeadline)}
				onCancel={() => setReopenOpen(false)}
			/>
		</Stack>
	);
};
