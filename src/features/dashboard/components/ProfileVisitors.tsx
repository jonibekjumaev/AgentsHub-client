import { useState } from 'react';
import NextLink from 'next/link';
import { useQuery } from '@apollo/client';
import { Box, Link, Skeleton, Stack, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon, VisibilityOutlined as VisibilityOutlinedIcon } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import type { ProfileVisitorsQuery as ProfileVisitorsData } from '@/gql/graphql';
import { useFormat } from '@/shared/lib/format';
import { Avatar } from '@/shared/ui/Avatar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { radiusPx } from '@/theme/tokens';
import { ProfileVisitorsQuery } from '../graphql/visitors';
import { SETTINGS_PATH, VISITORS_PAGE_SIZE, VISITORS_WINDOW_DAYS, profileVisitorsVariables } from '../lib/overview';

type Visit = ProfileVisitorsData['getProfileVisitors']['list'][number];

const VisitRow = ({ visit }: { visit: Visit }) => {
	const { t } = useTranslation(['dashboard', 'common', 'follows']);
	const format = useFormat();
	const { visitor } = visit;
	const name = visitor.memberFullName || visitor.memberNick;

	return (
		<Stack
			component="li"
			direction="row"
			spacing={3}
			alignItems="center"
			sx={{ p: 4, bgcolor: 'surface', border: 1, borderColor: 'border', borderRadius: radiusPx.lg, minWidth: 0 }}
		>
			<Avatar memberId={visitor._id} name={name} image={visitor.memberImage} size={44} />
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Link component={NextLink} href={`/members/${visitor._id}`} sx={{ color: 'ink', fontWeight: 800, overflowWrap: 'anywhere' }}>
					{name}
				</Link>
				<Typography variant="meta">
					@{visitor.memberNick} · {t(`common:enums.MemberType.${visitor.memberType}`)} ·{' '}
					{t('follows:followers', { count: visitor.memberFollowers, formatted: format.compact(visitor.memberFollowers) })}
				</Typography>
			</Box>
			<Typography variant="caption" component="time" dateTime={visit.visitedAt} title={format.date(visit.visitedAt)} sx={{ flex: 'none' }}>
				{format.relative(visit.visitedAt)}
			</Typography>
		</Stack>
	);
};

/**
 * /dashboard/visitors (D-42): members who opened your profile in the last 90 days, newest first, one
 * row per member. Private visitors are only counted — the API never returns who they are.
 */
export const ProfileVisitors = () => {
	const { t } = useTranslation('dashboard');
	const [page, setPage] = useState(1);
	// A new visit can happen any time: ask the server whenever the page opens.
	const { data, loading, error, refetch } = useQuery(ProfileVisitorsQuery, {
		variables: profileVisitorsVariables(page),
		fetchPolicy: 'cache-and-network',
	});
	const result = data?.getProfileVisitors;
	const visits = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const privateCount = result?.privateCount ?? 0;

	const body = () => {
		if (loading && !result) {
			return (
				<Stack spacing={2} role="status" aria-busy="true" aria-label={t('dashboard:visitors.loading')}>
					{[0, 1, 2].map((index) => (
						<Skeleton key={index} variant="rounded" height={76} aria-hidden="true" />
					))}
				</Stack>
			);
		}
		if (error && !result) {
			return <ErrorState error={error} title={t('dashboard:visitors.errorTitle')} onRetry={() => void refetch()} />;
		}
		if (visits.length === 0 && privateCount === 0) {
			return (
				<EmptyState
					icon={<VisibilityOutlinedIcon />}
					title={t('dashboard:visitors.emptyTitle')}
					text={t('dashboard:visitors.emptyText', { days: VISITORS_WINDOW_DAYS })}
				/>
			);
		}
		return (
			<Stack spacing={4}>
				{privateCount > 0 && (
					<Box
						role="note"
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 2.5,
							px: 4,
							py: 3,
							bgcolor: 'surfaceMuted',
							border: 1,
							borderColor: 'border',
							borderRadius: radiusPx.lg,
							color: 'bodySoft',
							fontSize: 14,
						}}
					>
						<LockOutlinedIcon aria-hidden="true" sx={{ fontSize: 18, color: 'muted' }} />
						{t('dashboard:visitors.private', { count: privateCount })}
					</Box>
				)}
				{visits.length > 0 && (
					<Box
						component="ul"
						aria-label={t('dashboard:visitors.listLabel')}
						sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 3 }}
					>
						{visits.map((visit) => (
							<VisitRow key={visit._id} visit={visit} />
						))}
					</Box>
				)}
				<Pagination page={page} count={Math.ceil(total / VISITORS_PAGE_SIZE)} onChange={setPage} />
			</Stack>
		);
	};

	return (
		<Stack spacing={6}>
			<div>
				<Typography variant="h1">{t('dashboard:visitors.title')}</Typography>
				<Typography sx={{ mt: 1.5, color: 'muted' }}>
					{t('dashboard:visitors.subtitle', { days: VISITORS_WINDOW_DAYS })}{' '}
					<Link component={NextLink} href={SETTINGS_PATH}>
						{t('dashboard:visitors.privacyLink')}
					</Link>
				</Typography>
			</div>
			{body()}
		</Stack>
	);
};
