import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';
import { Box, Skeleton, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import type { MemberType } from '@/gql/graphql';
import { useAuth } from './AuthProvider';

type RequireRoleProps = {
	roles: MemberType[];
	children: ReactNode;
};

/**
 * UX only: hides pages the member can't use. The backend enforces access on every operation
 * (AuthGuard / RolesGuard), so never rely on this for security.
 *
 * loading → skeleton · guest → /login?next=<path> · wrong role → 404.
 */
export const RequireRole = ({ roles, children }: RequireRoleProps) => {
	const { status, me } = useAuth();
	const router = useRouter();
	const { t } = useTranslation('common');

	// Once only: replace() changes the route, which gives a new `router` and re-runs this effect —
	// without the guard a still-mounted guard (e.g. in a layout) would redirect forever.
	const redirected = useRef(false);
	useEffect(() => {
		if (status !== 'guest' || redirected.current) return;
		redirected.current = true;
		void router.replace({ pathname: '/login', query: { next: router.asPath } });
	}, [status, router]);

	if (status === 'member' && me) {
		return roles.includes(me.memberType) ? <>{children}</> : <ErrorPage statusCode={404} />;
	}

	// Loading, or a guest on the way to /login.
	return (
		<Box aria-busy="true" aria-label={t('common:status.loading')}>
			<Stack spacing={3}>
				<Skeleton variant="rounded" height={40} width="40%" />
				<Skeleton variant="rounded" height={120} />
				<Skeleton variant="rounded" height={120} />
			</Stack>
		</Box>
	);
};
