import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { ApolloError } from '@apollo/client';
import {
	Box,
	Button,
	InputAdornment,
	NativeSelect,
	OutlinedInput,
	Skeleton,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { visuallyHidden } from '@/shared/ui/visuallyHidden';
import { radiusPx } from '@/theme/tokens';
import { ADMIN_PAGE_SIZE, adminNeedsConfirm, type AdminAction, type AdminListState } from '../lib/admin';

export type AdminRow = { id: string; title: string; cells: ReactNode[]; actions: AdminAction[] };

type AdminListProps = {
	title: string;
	subtitle: string;
	/** Enum values for the status filter; labels come from `statusLabel`. */
	statuses: string[];
	statusLabel: (status: string) => string;
	withSearch?: boolean;
	state: AdminListState;
	onStateChange: (state: AdminListState) => void;
	columns: string[];
	rows: AdminRow[];
	total: number;
	loading: boolean;
	error?: ApolloError;
	onRetry: () => void;
	/** Runs the action against the API; resolves true on success. */
	perform: (row: AdminRow, action: AdminAction) => Promise<boolean>;
};

const SearchBox = ({ value, onApply }: { value: string; onApply: (text: string) => void }) => {
	const { t } = useTranslation('admin');
	const [text, setText] = useState(value);
	const timer = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => setText(value), [value]);
	useEffect(() => () => clearTimeout(timer.current), []);
	return (
		<Box
			component="form"
			role="search"
			onSubmit={(event: FormEvent) => {
				event.preventDefault();
				clearTimeout(timer.current);
				onApply(text.trim());
			}}
			sx={{ width: { xs: '100%', sm: 260 } }}
		>
			<OutlinedInput
				type="search"
				value={text}
				onChange={(event) => {
					const next = event.target.value;
					setText(next);
					clearTimeout(timer.current);
					timer.current = setTimeout(() => onApply(next.trim()), 400);
				}}
				placeholder={t('admin:search')}
				fullWidth
				inputProps={{ 'aria-label': t('admin:search'), maxLength: 100 }}
				startAdornment={
					<InputAdornment position="start">
						<SearchIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
					</InputAdornment>
				}
				sx={{ height: 40, bgcolor: 'surface' }}
			/>
		</Box>
	);
};

/**
 * One admin table (§3.12): status filter, optional search, rows with only the allowed actions,
 * a confirm dialog for delete / remove / block, pagination. The server confirms every change; the
 * page's query refetches afterwards.
 */
export const AdminList = ({
	title,
	subtitle,
	statuses,
	statusLabel,
	withSearch = true,
	state,
	onStateChange,
	columns,
	rows,
	total,
	loading,
	error,
	onRetry,
	perform,
}: AdminListProps) => {
	const { t } = useTranslation('admin');
	const statusId = useId();
	const [pending, setPending] = useState<{ row: AdminRow; action: AdminAction } | null>(null);
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState<string | null>(null);

	const run = async (row: AdminRow, action: AdminAction) => {
		setBusy(row.id);
		await perform(row, action);
		setBusy(null);
		setOpen(false);
	};

	const onAction = (row: AdminRow, action: AdminAction) => {
		if (adminNeedsConfirm(action)) {
			setPending({ row, action });
			setOpen(true);
		} else void run(row, action);
	};

	const body = () => {
		if (loading && rows.length === 0) {
			return (
				<Stack spacing={1.5} role="status" aria-busy="true" aria-label={t('admin:loading')}>
					{[0, 1, 2, 3].map((index) => (
						<Skeleton key={index} variant="rounded" height={52} aria-hidden="true" />
					))}
				</Stack>
			);
		}
		if (error && rows.length === 0) return <ErrorState error={error} title={t('admin:errorTitle')} onRetry={onRetry} />;
		if (rows.length === 0) return <EmptyState title={t('admin:empty')} headingLevel="h2" />;
		return (
			<>
				<TableContainer sx={{ bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg }}>
					<Table size="small">
						<Box component="caption" sx={visuallyHidden}>
							{title}
						</Box>
						<TableHead>
							<TableRow>
								{columns.map((column) => (
									<TableCell key={column} sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
										{column}
									</TableCell>
								))}
								<TableCell sx={{ fontWeight: 800 }}>{t('admin:actions.label')}</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.id}>
									{row.cells.map((cell, index) => (
										<TableCell key={index} sx={{ overflowWrap: 'anywhere' }}>
											{cell}
										</TableCell>
									))}
									<TableCell>
										<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
											{row.actions.map((action) => (
												<Button
													key={action}
													size="small"
													variant="outlined"
													color={action === 'delete' || action === 'remove' || action === 'block' ? 'error' : 'primary'}
													disabled={busy === row.id}
													onClick={() => onAction(row, action)}
													aria-label={t('admin:actions.aria', { action: t(`admin:actions.${action}`), title: row.title })}
												>
													{t(`admin:actions.${action}`)}
												</Button>
											))}
										</Stack>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<Pagination page={state.page} count={Math.ceil(total / ADMIN_PAGE_SIZE)} onChange={(page) => onStateChange({ ...state, page })} />
			</>
		);
	};

	return (
		<Stack spacing={5}>
			<div>
				<Typography variant="h1">{title}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>{subtitle}</Typography>
			</div>
			<Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" alignItems="center">
				<Stack direction="row" spacing={2} alignItems="center">
					<Typography component="label" htmlFor={statusId} variant="body2" sx={{ color: 'muted' }}>
						{t('admin:status')}
					</Typography>
					<NativeSelect
						id={statusId}
						value={state.status}
						onChange={(event) => onStateChange({ ...state, status: event.target.value, page: 1 })}
						input={<OutlinedInput sx={{ height: 40, bgcolor: 'surface' }} />}
					>
						<option value="all">{t('admin:allStatuses')}</option>
						{statuses.map((status) => (
							<option key={status} value={status}>
								{statusLabel(status)}
							</option>
						))}
					</NativeSelect>
				</Stack>
				{withSearch && <SearchBox value={state.text} onApply={(text) => text !== state.text && onStateChange({ ...state, text, page: 1 })} />}
				<Typography variant="meta" role="status">
					{!loading && t('admin:total', { count: total })}
				</Typography>
			</Stack>
			{body()}
			<ConfirmDialog
				open={open}
				title={pending ? t(`admin:confirm.${pending.action}.title`, { title: pending.row.title }) : ''}
				text={pending ? t(`admin:confirm.${pending.action}.text`) : undefined}
				confirmLabel={pending ? t(`admin:actions.${pending.action}`) : undefined}
				destructive
				loading={busy !== null}
				onConfirm={() => pending && void run(pending.row, pending.action)}
				onCancel={() => setOpen(false)}
			/>
		</Stack>
	);
};
